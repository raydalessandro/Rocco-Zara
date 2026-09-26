#!/usr/bin/env python3
"""cartoni/render/piper_narra.py — la narratrice legge, con Piper (lo chiama narra.ts).

    python3 cartoni/render/piper_narra.py lavoro.json

lavoro.json:
    {"modello": "it_IT-serena-high", "modelli": "<cartella dei modelli>",
     "lentezza": 1.15, "variazione": 0.55, "cadenza": 0.5,
     "pezzi": [{"testo": "...", "file": "/percorso/uscita.wav", "lentezza": 1.2}]}

Per ogni pezzo scrive un WAV mono (22050 Hz, 16 bit) col parlato rifilato
(30 ms di margine) e stampa una riga JSON: {"file": ..., "durata": ...}.
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
    for p in lavoro["pezzi"]:
        cfg = SynthesisConfig(
            length_scale=p.get("lentezza", lavoro["lentezza"]),
            noise_scale=lavoro["variazione"],
            noise_w_scale=lavoro["cadenza"],
        )
        pezzi = [c.audio_int16_array for c in voce.synthesize(p["testo"], syn_config=cfg)]
        a = np.concatenate(pezzi) if pezzi else np.zeros(0, dtype=np.int16)
        a = rifila(a, sr)
        with wave.open(p["file"], "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(sr)
            w.writeframes(a.astype("<i2").tobytes())
        print(json.dumps({"file": p["file"], "durata": round(len(a) / sr, 3)}), flush=True)


if __name__ == "__main__":
    main()
