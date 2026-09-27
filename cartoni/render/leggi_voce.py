#!/usr/bin/env python3
"""cartoni/render/leggi_voce.py — una voce legge dei pezzi (lo chiama narra.ts).

    python3 cartoni/render/leggi_voce.py lavoro.json

lavoro.json:
    {"motore": "piper" | "kokoro", "modello": "it_IT-paola-medium" | "if_sara",
     "modelli": "<cartella dei modelli>",
     "lentezza": 1.15, "variazione": 0.55, "cadenza": 0.5, "tono": 0,
     "pezzi": [{"testo": "...", "file": "/percorso/uscita.wav", "lentezza": 1.2}]}

Per ogni pezzo scrive un WAV mono (16 bit) col parlato rifilato (30 ms di
margine) e stampa una riga JSON: {"file", "durata", "sr", "bocca"}. `bocca` è
l'apertura della bocca per il pupazzo: una cifra 0-9 ogni 40 ms (25 al
secondo), dal volume del parlato.

I motori:
- piper (voci Piper, VITS): `lentezza` = length_scale, `variazione` = noise_scale,
  `cadenza` = noise_w. La stessa frase non esce mai due volte identica.
- kokoro (Kokoro-82M, onnx): `lentezza` = 1/velocità; `variazione` e `cadenza`
  non servono. Esce sempre identica (a parità di modello e di macchina). Il
  `modello` può essere un miscuglio di voci: «if_sara*0.3+ef_dora*0.7» (così il
  cast cresce: l'italiano lo legge comunque, la voce cambia).

`tono` (semitoni) rende la voce più acuta E più piccola (una bambina, un
cucciolo) o più grave e più grande (tono negativo): si fa leggere più lenta
(o più svelta) di k = 2^(tono/12) e si rilegge k volte più veloce: il WAV esce
con la frequenza di campionamento moltiplicata per k. Salgono (o scendono)
insieme altezza e formanti, e il passo resta quello di `lentezza`, senza
stirare il suono. (Piper non allunga del tutto in proporzione: col tono la
lentezza rende un po' meno, e si regola a orecchio — docs/ANIMATORE.md §5.)

`coro` (solo kokoro): una voce fatta di più voci che dicono le stesse parole insieme,
un poco sfasate — la Gente delle Rive (ep04: «non era una voce sola»). È una lista di
voci in più, ognuna col suo `modello` (anche un miscuglio), il suo `tono`, la sua
`lentezza` (se no quella della voce), un `ritardo` (s) e un `vol`: si leggono tutte, si
riportano alla stessa frequenza, si sommano alla voce principale e si normalizzano.
Kokoro legge ogni voce col suo passo: il coro non è mai perfettamente all'unisono,
come una folla.

Se i modelli non ci sono nella cartella li scarica: Piper da HuggingFace
(rhasspy/piper-voices), Kokoro dalle release di kokoro-onnx su GitHub.
Serve: pip install piper-tts (per piper), pip install kokoro-onnx (per kokoro).
"""

import json
import sys
import urllib.request
import wave
from pathlib import Path

import numpy as np

KOKORO_FILE = {
    "kokoro-v1.0.onnx": "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx",
    "voices-v1.0.bin": "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin",
}


def rifila(a: np.ndarray, sr: int, soglia: float = 0.012, margine: float = 0.03) -> np.ndarray:
    x = np.abs(a)
    idx = np.where(x > soglia)[0]
    if len(idx) == 0:
        return a[:0]
    m = int(margine * sr)
    return a[max(0, idx[0] - m) : min(len(a), idx[-1] + m)]


def bocca(a: np.ndarray, sr: int) -> str:
    """Apertura della bocca: una cifra 0-9 ogni 40 ms, dal volume del parlato.

    Il volume si misura rispetto alla ripresa stessa (i suoi momenti più forti
    aprono la bocca quasi del tutto, 26 dB più sotto è chiusa): così una voce
    forte e una piano muovono la bocca allo stesso modo, e tra una parola e
    l'altra la bocca si richiude.
    """
    passo = sr / 25
    n = int(np.ceil(len(a) / passo))
    dbs = []
    for i in range(n):
        s = a[int(i * passo) : int((i + 1) * passo)]
        rms = float(np.sqrt(np.mean(s * s))) if len(s) else 0.0
        dbs.append(20 * np.log10(rms + 1e-9))
    dbs = np.array(dbs)
    vivi = dbs[dbs > -60]
    rif = float(np.percentile(vivi, 95)) if len(vivi) else -20.0
    v = np.clip((dbs - (rif - 26)) / 26, 0, 1) * 0.92
    return "".join(str(int(round(x * 9))) for x in v)


class Piper:
    def __init__(self, lavoro: dict, cartella: Path):
        from piper import PiperVoice

        modello = lavoro["modello"]
        if not (cartella / f"{modello}.onnx").exists() or not (cartella / f"{modello}.onnx.json").exists():
            from piper.download_voices import download_voice

            cartella.mkdir(parents=True, exist_ok=True)
            print(f"scarico {modello} in {cartella}…", file=sys.stderr)
            download_voice(modello, cartella)
        self.voce = PiperVoice.load(str(cartella / f"{modello}.onnx"))
        self.sr = self.voce.config.sample_rate
        self.lavoro = lavoro

    def leggi(self, testo: str, lentezza: float) -> np.ndarray:
        from piper import SynthesisConfig

        cfg = SynthesisConfig(length_scale=lentezza, noise_scale=self.lavoro["variazione"], noise_w_scale=self.lavoro["cadenza"])
        pezzi = [c.audio_int16_array for c in self.voce.synthesize(testo, syn_config=cfg)]
        a = np.concatenate(pezzi) if pezzi else np.zeros(0, dtype=np.int16)
        return a.astype(np.float32) / 32768.0


class Kokoro:
    def __init__(self, lavoro: dict, cartella: Path):
        from kokoro_onnx import Kokoro as K

        cartella.mkdir(parents=True, exist_ok=True)
        for nome, url in KOKORO_FILE.items():
            if not (cartella / nome).exists():
                print(f"scarico {nome} in {cartella}…", file=sys.stderr)
                urllib.request.urlretrieve(url, cartella / nome)
        self.k = K(str(cartella / "kokoro-v1.0.onnx"), str(cartella / "voices-v1.0.bin"))
        self.sr = 24000
        self.voce = lavoro["modello"]

    def stile(self):
        """La voce: un nome di Kokoro, o un miscuglio «if_sara*0.3+ef_dora*0.7» (i pesi sommano a 1)."""
        if "+" not in self.voce and "*" not in self.voce:
            return self.voce
        tot = None
        for parte in self.voce.split("+"):
            nome, _, peso = parte.strip().partition("*")
            v = self.k.get_voice_style(nome.strip()) * float(peso or 1)
            tot = v if tot is None else tot + v
        return tot

    def leggi(self, testo: str, lentezza: float, voce: str | None = None) -> np.ndarray:
        stile = self.stile() if voce is None else Kokoro.miscuglio(self.k, voce)
        a, sr = self.k.create(testo, voice=stile, speed=1.0 / lentezza, lang="it")
        self.sr = sr
        return np.asarray(a, dtype=np.float32)

    @staticmethod
    def miscuglio(k, voce: str):
        if "+" not in voce and "*" not in voce:
            return voce
        tot = None
        for parte in voce.split("+"):
            nome, _, peso = parte.strip().partition("*")
            v = k.get_voice_style(nome.strip()) * float(peso or 1)
            tot = v if tot is None else tot + v
        return tot


def ricampiona(a: np.ndarray, sr_da: float, sr_a: int) -> np.ndarray:
    """Porta un parlato da una frequenza di campionamento a un'altra (interpolazione lineare)."""
    if len(a) == 0 or abs(sr_da - sr_a) < 1e-6:
        return a
    n = int(round(len(a) * sr_a / sr_da))
    x = np.arange(n) * (sr_da / sr_a)
    return np.interp(x, np.arange(len(a)), a).astype(np.float32)


def coro(motore, lavoro: dict, testo: str, lentezza: float, k: float) -> tuple[np.ndarray, int]:
    """La voce principale più le voci del coro, sfasate e sommate, alla frequenza di Kokoro."""
    sr = 24000
    voci = [{"modello": None, "tono": float(lavoro.get("tono", 0)), "lentezza": lentezza / k, "ritardo": 0.0, "vol": 1.0}] + list(lavoro["coro"])
    pezzi = []
    for v in voci:
        kv = 2 ** (float(v.get("tono", 0)) / 12)
        lv = float(v.get("lentezza") or lavoro["lentezza"])
        a = motore.leggi(testo, lv * kv, v.get("modello"))
        a = ricampiona(rifila(np.clip(a, -1, 1), motore.sr), motore.sr * kv, sr)
        pad = int(round(float(v.get("ritardo", 0)) * sr))
        pezzi.append(np.concatenate([np.zeros(pad, dtype=np.float32), a * float(v.get("vol", 1))]))
    n = max(len(p) for p in pezzi)
    somma = np.zeros(n, dtype=np.float32)
    for p in pezzi:
        somma[: len(p)] += p
    picco = float(np.max(np.abs(somma))) if n else 0.0
    if picco > 0:
        somma = somma * (0.9 / picco)
    return somma, sr


def main() -> None:
    lavoro = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    cartella = Path(lavoro["modelli"])
    motore = (Kokoro if lavoro.get("motore") == "kokoro" else Piper)(lavoro, cartella)
    k = 2 ** (float(lavoro.get("tono", 0)) / 12)
    for p in lavoro["pezzi"]:
        if lavoro.get("coro"):
            a, sr_out = coro(motore, lavoro, p["testo"], p.get("lentezza", lavoro["lentezza"]) * k, k)
            a = rifila(a, sr_out)
        else:
            a = motore.leggi(p["testo"], p.get("lentezza", lavoro["lentezza"]) * k)
            a = rifila(np.clip(a, -1, 1), motore.sr)
            sr_out = int(round(motore.sr * k))
        with wave.open(p["file"], "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(sr_out)
            w.writeframes((a * 32767).astype("<i2").tobytes())
        print(json.dumps({"file": p["file"], "durata": round(len(a) / sr_out, 3), "sr": sr_out, "bocca": bocca(a, sr_out)}), flush=True)


if __name__ == "__main__":
    main()
