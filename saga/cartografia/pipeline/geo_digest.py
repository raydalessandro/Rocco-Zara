#!/usr/bin/env python3
"""geo_digest.py — genera zones/_digest.json dai GeoJSON di zona.

Uso:   python3 saga/cartografia/pipeline/geo_digest.py
Legge  saga/cartografia/zones/*.geojson
Scrive saga/cartografia/zones/_digest.json  (morfologia compatta per il modulo
`mondo` del serializzatore: quote, biomi, corsi d'acqua, rilievi principali).

I nomi qui restano REALI (substrato, vedi saga/lessico/mappa.json → substrato):
la traduzione al canone avviene a valle, nel serializzatore, via lessico —
i nomi non mappati vengono anonimizzati («una cima del Muro del Nord…»).
Quando arrivano i GeoJSON degli altri regni, basta rilanciare questo script.
"""
import json, glob, os, collections

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


def main():
    out = {}
    for p in sorted(glob.glob(os.path.join(ZDIR, "*.geojson"))):
        key = os.path.splitext(os.path.basename(p))[0]
        out[key] = digest_one(p)
        print(f"{key}: ok ({out[key]['quota_min']}–{out[key]['quota_max']} m)")
    dst = os.path.join(ZDIR, "_digest.json")
    with open(dst, "w") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"→ {dst}")


if __name__ == "__main__":
    main()
