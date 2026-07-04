#!/usr/bin/env python3
"""geo_digest.py — genera zones/_digest.json dai GeoJSON di zona.

Uso:   python3 saga/cartografia/pipeline/geo_digest.py
       python3 saga/cartografia/pipeline/geo_digest.py --check
Legge  saga/cartografia/zones/*.geojson
Scrive saga/cartografia/zones/_digest.json  (morfologia compatta per il modulo
`mondo` del serializzatore: quote, biomi, corsi d'acqua, rilievi principali).

I nomi qui restano REALI (substrato, vedi saga/lessico/mappa.json → substrato):
la traduzione al canone avviene a valle, nel serializzatore, via lessico —
i nomi non mappati vengono anonimizzati («una cima del Muro del Nord…»).
Quando arrivano i GeoJSON degli altri regni, basta rilanciare questo script.

Con `--check` (in qualunque posizione tra gli argomenti): ricalcola il digest in
memoria e lo confronta col committato senza scrivere — exit 0 se allineato, exit 1
(elencando le zone aggiunte/rimosse/cambiate) se divergente. È il cancello anti-drift
del digest, che ora è sorgente committata del blocco MORFOLOGIA nel brief.
"""
import json, glob, os, sys, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # saga/cartografia
ZDIR = os.path.join(ROOT, "zones")


def digest_one(path):
    d = json.load(open(path))
    feats = d.get("features", [])
    props = [f.get("properties") or {} for f in feats]
    quote = [p.get("quota_m") for p in props if isinstance(p.get("quota_m"), (int, float))]
    biomi = collections.Counter(p.get("bioma") for p in props if p.get("bioma"))
    corsi = sum(1 for p in props if p.get("waterway"))
    ril = [p for p in props if p.get("kind") == "rilievo" and p.get("name")]
    ril = sorted(ril, key=lambda p: -(p.get("quota_m") or 0))[:6]
    return {
        "quota_min": int(min(quote)) if quote else None,
        "quota_max": int(max(quote)) if quote else None,
        "biomi": dict(biomi),
        "corsi_acqua": corsi,
        "rilievi": [{"name": p["name"], "quota": int(p.get("quota_m") or 0)} for p in ril],
    }


def build_digest(verbose=True):
    out = {}
    for p in sorted(glob.glob(os.path.join(ZDIR, "*.geojson"))):
        key = os.path.splitext(os.path.basename(p))[0]
        out[key] = digest_one(p)
        if verbose:
            print(f"{key}: ok ({out[key]['quota_min']}–{out[key]['quota_max']} m)")
    return out


# UNICO serializzatore (scrittura e check): identico byte per byte.
def serialize(out):
    return json.dumps(out, ensure_ascii=False, indent=2) + "\n"


def check():
    out = build_digest(verbose=False)
    atteso = serialize(out)
    dst = os.path.join(ZDIR, "_digest.json")
    try:
        attuale = open(dst, encoding="utf-8").read()
    except FileNotFoundError:
        attuale = None
    if attuale == atteso:
        print(f"_digest.json OK: allineato ai geojson ({len(out)} zone)")
        return 0
    # divergente: sintesi delle zone aggiunte/rimosse/cambiate
    print(f"_digest.json DIVERGENTE dai geojson ({dst}):")
    try:
        vecchio = json.loads(attuale) if attuale is not None else {}
        if not isinstance(vecchio, dict):
            vecchio = {}
    except (json.JSONDecodeError, TypeError):
        vecchio = {}
    if attuale is None:
        print("  file assente")
    for key in out:
        if key not in vecchio:
            print(f"  + aggiunta: {key}")
    for key in vecchio:
        if key not in out:
            print(f"  - rimossa: {key}")
    for key in out:
        if key in vecchio and out[key] != vecchio[key]:
            print(f"  ~ cambiata: {key}")
    print("rigenera con: python3 saga/cartografia/pipeline/geo_digest.py")
    return 1


def main():
    out = build_digest(verbose=True)
    dst = os.path.join(ZDIR, "_digest.json")
    with open(dst, "w") as f:
        f.write(serialize(out))
    print(f"→ {dst}")


if __name__ == "__main__":
    if "--check" in sys.argv[1:]:
        sys.exit(check())
    main()
