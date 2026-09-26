#!/usr/bin/env python3
"""cartoni/render/piper_narra.py — la narratrice legge, con Piper (lo chiama narra.ts).

    python3 cartoni/render/piper_narra.py lavoro.json

lavoro.json:
    {"modello": "it_IT-serena-high", "modelli": "<cartella dei modelli>",
     "lentezza": 1.15, "variazione": 0.55, "cadenza": 0.5, "tono": 0,
     "pezzi": [{"testo": "...", "file": "/percorso/uscita.wav", "lentezza": 1.2}]}

Per ogni pezzo scrive un WAV mono (16 bit) col parlato rifilato (30 ms di
margine) e stampa una riga JSON: {"file": ..., "durata": ..., "sr": ...}.

`tono` (semitoni) rende la voce più acuta E più piccola, come una bambina:
si fa leggere più lenta di k = 2^(tono/12) e si rilegge k volte più veloce
(il WAV esce con la frequenza di campionamento moltiplicata per k). Così
salgono insieme l'altezza e le formanti (il tratto vocale "si accorcia"),
e il passo resta quello chiesto da `lentezza`, senza stirare il suono.
(Piper non allunga del tutto in proporzione: col tono la lentezza rende un
po' meno, e si regola a orecchio — vedi docs/ANIMATORE.md §5.)
Se il modello non c'è nella cartella lo scarica (HuggingFace, rhasspy/piper-voices).

Serve: pip install piper-tts. Nota: la stessa frase non esce mai due volte
identica (il modello pesca un po' di caso): per questo le riprese si tengono.
"""

import json
import sys
import wave
from pathlib import Path

import numpy as np
from piper import PiperVoice, SynthesisConfig


def carica(modello: str, cartella: Path) -> PiperVoice:
    onnx = cartella / f"{modello}.onnx"
    if not onnx.exists() or not (cartella / f"{modello}.onnx.json").exists():
        from piper.download_voices import download_voice

        cartella.mkdir(parents=True, exist_ok=True)
        print(f"scarico {modello} in {cartella}…", file=sys.stderr)
        download_voice(modello, cartella)
    return PiperVoice.load(str(onnx))


def rifila(a: np.ndarray, sr: int, soglia: float = 0.012, margine: float = 0.03) -> np.ndarray:
    x = np.abs(a.astype(np.float32) / 32768.0)
    idx = np.where(x > soglia)[0]
    if len(idx) == 0:
        return a[:0]
    m = int(margine * sr)
    return a[max(0, idx[0] - m) : min(len(a), idx[-1] + m)]


def main() -> None:
    lavoro = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    voce = carica(lavoro["modello"], Path(lavoro["modelli"]))
    sr = voce.config.sample_rate
    k = 2 ** (float(lavoro.get("tono", 0)) / 12)
    sr_out = int(round(sr * k))
    for p in lavoro["pezzi"]:
        cfg = SynthesisConfig(
            length_scale=p.get("lentezza", lavoro["lentezza"]) * k,
            noise_scale=lavoro["variazione"],
            noise_w_scale=lavoro["cadenza"],
        )
        pezzi = [c.audio_int16_array for c in voce.synthesize(p["testo"], syn_config=cfg)]
        a = np.concatenate(pezzi) if pezzi else np.zeros(0, dtype=np.int16)
        a = rifila(a, sr)
        with wave.open(p["file"], "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(sr_out)
            w.writeframes(a.astype("<i2").tobytes())
        print(json.dumps({"file": p["file"], "durata": round(len(a) / sr_out, 3), "sr": sr_out}), flush=True)


if __name__ == "__main__":
    main()
