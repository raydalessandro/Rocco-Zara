#!/usr/bin/env python3
"""cartoni/render/ascolta.py — si capisce? Un riconoscitore vocale ascolta le riprese.

    python3 cartoni/render/ascolta.py --episodio ep01 [--chi rocco,zara,narratrice] [--modello small]

Per ogni ripresa di un episodio — le battute dei personaggi (voce/battute.json) e i
pezzi della narratrice (voce/narrazione.json) — Whisper (faster-whisper) scrive
quello che sente, e lo si confronta parola per parola con quello che la voce doveva
dire: la parte di parole sbagliate, mancanti o in più (WER, 0 = tutto giusto).
Stampa le riprese dove qualcosa non torna, dalla peggiore, e il conto per voce.

È il controllo con cui si scelgono e si tengono le voci (docs/ANIMATORE.md §5): una
voce si propone solo se si capisce. Le parole che una voce sbaglia si correggono nel
dizionario `pronuncia` di cartoni/voce/voce.json, e si registra di nuovo
(narra.ts --episodio epNN --solo sNN). Il confronto non guarda accenti, apostrofi e
punteggiatura (conta se si capisce, non come si scrive).

Il riconoscitore non è l'orecchio di un bambino: sbaglia anche lui (parole che
suonano uguali, i nomi del mondo). Il verdetto resta di chi ascolta; questo dice
dove ascoltare.

Serve: pip install faster-whisper (il modello si scarica la prima volta, ~500 MB per
"small"; la cartella è --modelli, o WHISPER_MODELLI, o ~/.cache/rocco-zara/whisper).
"""

import argparse
import json
import os
import re
import unicodedata
from pathlib import Path

RADICE = Path(__file__).resolve().parents[2]


def parole(testo: str) -> list[str]:
    """Il testo come si sente: minuscolo, senza accenti, apostrofi, trattini e punteggiatura."""
    t = unicodedata.normalize("NFD", testo.lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    t = re.sub(r"[^a-z0-9]+", " ", t)
    return t.split()


def wer(atteso: list[str], sentito: list[str]) -> float:
    """Distanza di edit tra le parole (sostituite + mancanti + in più) / parole attese."""
    n, m = len(atteso), len(sentito)
    d = list(range(m + 1))
    for i in range(1, n + 1):
        prec, d[0] = d[0], i
        for j in range(1, m + 1):
            cur = min(d[j] + 1, d[j - 1] + 1, prec + (atteso[i - 1] != sentito[j - 1]))
            prec, d[j] = d[j], cur
    return d[m] / max(1, n)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--episodio", required=True)
    ap.add_argument("--chi", help="solo queste voci (es. rocco,zara,narratrice)")
    ap.add_argument("--modello", default="small", help="il modello Whisper (tiny, base, small, medium…)")
    ap.add_argument("--modelli", default=os.environ.get("WHISPER_MODELLI", str(Path.home() / ".cache/rocco-zara/whisper")))
    a = ap.parse_args()

    from faster_whisper import WhisperModel

    cartella = RADICE / "cartoni/episodi" / a.episodio / "voce"
    riprese = []
    for nome, chi_di in (("battute.json", None), ("narrazione.json", "narratrice")):
        f = cartella / nome
        if f.exists():
            for chiave, c in json.loads(f.read_text(encoding="utf-8"))["clip"].items():
                riprese.append((chiave, chi_di or c.get("chi", "?"), c["testo"], cartella / c["file"]))
    if a.chi:
        voci = set(a.chi.split(","))
        riprese = [r for r in riprese if r[1] in voci]
    if not riprese:
        raise SystemExit(f"nessuna ripresa da ascoltare in {cartella}")

    modello = WhisperModel(a.modello, device="cpu", compute_type="int8", download_root=a.modelli)
    esiti = []
    for chiave, chi, testo, file in riprese:
        pezzi, _ = modello.transcribe(str(file), language="it", beam_size=5)
        sentito = " ".join(p.text.strip() for p in pezzi)
        esiti.append((wer(parole(testo), parole(sentito)), chiave, chi, testo, sentito))

    storti = sorted((e for e in esiti if e[0] > 0), key=lambda e: -e[0])
    for w, chiave, chi, testo, sentito in storti:
        print(f"{w:4.0%}  {chiave}  {chi}\n      doveva dire: {testo}\n      si sente:    {sentito}")
    print()
    # il conto per voce: le parole sbagliate su tutte le parole (le riprese corte,
    # «disse Zara.», pesano per quel che sono: il riconoscitore ci sbaglia di più)
    for chi in sorted({e[2] for e in esiti}):
        mie = [e for e in esiti if e[2] == chi]
        giuste = sum(1 for e in mie if e[0] == 0)
        n = sum(len(parole(e[3])) for e in mie)
        storte = sum(e[0] * len(parole(e[3])) for e in mie)
        print(f"{chi:12s} parole capite {1 - storte / max(1, n):.0%} ({n} parole) · {giuste}/{len(mie)} riprese giuste parola per parola")


if __name__ == "__main__":
    main()
