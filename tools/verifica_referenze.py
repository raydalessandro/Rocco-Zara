#!/usr/bin/env python3
"""verifica_referenze — chi chiama cosa, nella repo delle Terre Annodate.

Lo strumento del manutentore: mappa i file "canone/doc/dato" (target) contro i
file che li citano (sorgenti), e stana tre malanni:

  1. PATH ROTTI  — stringhe che sembrano path di repo, citate in un sorgente,
                   ma che non esistono su disco (il malanno più grave: un doc o
                   uno script promette un file che non c'è).
  2. ORFANI      — target dentro le zone di canone (saga/, docs/, seme/canone/…)
                   che NESSUN file cita. Non è per forza un errore (appunti solo
                   umani esistono), ma va saputo.
  3. DUPLICATI   — file byte-identici (hash uguale): quasi sempre una copia
                   dimenticata.

Due modalità:

  --check    per la CI e per `npm run refs`: guarda SOLO i path rotti citati nei
             sorgenti di CODICE (ts/tsx/py/mjs/js) — un codice che cita un file
             inesistente è un fatto oggettivo, non un'opinione. Exit 1 se ne
             trova. Gli orfani e i doc NON fanno fallire il check.
  --report   il quadro completo (path rotti ovunque, orfani, duplicati), per il
             giro di manutenzione umano. Exit sempre 0.

Whitelist (solo annotata nel report, mai fatale): file che per mestiere citano
path FUTURI — roadmap, TODO, i README che descrivono cosa arriverà.

Lezione incisa nel codice: le alternation di estensioni vanno in ordine
longest-first e con lookahead, sennò `pagina.tsx` matcha come `pagina.ts` e
inventa un path rotto che non esiste (successo davvero, nel primo audit).
"""
from __future__ import annotations

import collections
import hashlib
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {".git", "node_modules", ".next", "cache", "__pycache__", ".vercel"}

# target: i file che ci aspettiamo vengano "chiamati" da qualcuno
TARGET_EXT = {
    ".md", ".json", ".jsonl", ".yaml", ".yml", ".geojson",
    ".png", ".html", ".css", ".sql", ".woff2",
}
# sorgenti: chi chiama (il codice E i documenti)
SRC_EXT = {".ts", ".tsx", ".py", ".mjs", ".js", ".md", ".yml", ".yaml", ".json", ".html"}
# sorgenti di CODICE: quelli che fanno fallire --check
CODE_EXT = {".ts", ".tsx", ".py", ".mjs", ".js"}

# zone in cui un file mai citato è degno di nota
ZONE_ORFANI = ("saga/", "docs/", "web/data/", "seme/canone/", "seme/skill/")

# sorgenti che per mestiere citano path futuri/di roadmap: annotati, mai fatali
WHITELIST_SORGENTI = (
    "docs/ROADMAP_INTEGRAZIONE.md",
    "saga/TODO.md",
    "saga/cartografia/zones/README.md",   # descrive i geojson dei regni che arriveranno
)
# prefissi di sorgenti che non si giudicano proprio (fotografie storiche + lock npm)
PREFISSI_IGNORATI = ("docs/_archivio/",)
SORGENTI_IGNORATI = {"package-lock.json"}

# zone caricate DINAMICAMENTE (path costruiti a runtime: mondo.ts legge
# regni/<slug>/*.json per id; geo_digest.py fa glob su zones/*.geojson):
# nel report gli "orfani" qui dentro si raggruppano, non si elencano.
PREFISSI_DINAMICI = ("saga/cartografia/regni/", "saga/cartografia/zones/")

# estensioni nell'ordine GIUSTO: longest-first + lookahead anti-troncamento
_EXTS = "geojson|jsonl|json|tsx|ts|mjs|js|md|yaml|yml|png|py|sql|html|css"
PATH_RE = re.compile(
    r"(?:saga|docs|seme|web|lib|test|app|components|supabase|tools|\.claude)/"
    r"[A-Za-z0-9_\-./]+\.(?:" + _EXTS + r")(?![A-Za-z0-9])"
)


def _cammina():
    for dp, dn, fn in os.walk(ROOT):
        dn[:] = [d for d in dn if d not in SKIP_DIRS]
        for f in fn:
            yield os.path.relpath(os.path.join(dp, f), ROOT).replace(os.sep, "/")


def _leggi(rel):
    try:
        with open(os.path.join(ROOT, rel), encoding="utf-8", errors="ignore") as fh:
            return fh.read()
    except OSError:
        return ""


def raccogli():
    """targets, sources{path:testo}, allfiles."""
    targets, sources, allfiles = [], {}, set()
    for p in _cammina():
        allfiles.add(p)
        ext = os.path.splitext(p)[1]
        if ext in TARGET_EXT:
            targets.append(p)
        if ext in SRC_EXT:
            sources[p] = _leggi(p)
    return targets, sources, allfiles


def path_rotti(sources, allfiles, solo_codice=False):
    """{path_inesistente: set(sorgenti)} — path citati che non esistono su disco."""
    rotti = collections.defaultdict(set)
    for sp, txt in sources.items():
        if sp.startswith(PREFISSI_IGNORATI) or sp in SORGENTI_IGNORATI:
            continue
        if solo_codice and os.path.splitext(sp)[1] not in CODE_EXT:
            continue
        for m in set(PATH_RE.findall(txt)):
            if m in allfiles or "<" in m or ".." in m or m == sp:
                continue
            # path troncato da un a-capo dentro un doc: se esiste un file che
            # FINISCE così, non è rotto, è solo andato a capo
            base = m.split("/")[-1]
            if any(f.endswith("/" + base) or f == base for f in allfiles):
                continue
            rotti[m].add(sp)
    return rotti


def orfani(targets, sources):
    """target nelle zone-canone mai citati da nessun sorgente (per basename,
    con disambiguazione sul path quando il basename è conteso)."""
    by_base = collections.defaultdict(list)
    for t in targets:
        by_base[os.path.basename(t)].append(t)
    citati = set()
    for sp, txt in sources.items():
        for t in targets:
            if t == sp or t in citati:
                continue
            base = os.path.basename(t)
            if len(base) < 6 or base not in txt:
                continue
            if len(by_base[base]) == 1 or t in txt or t.split("/", 1)[-1] in txt:
                citati.add(t)
    return [t for t in sorted(targets)
            if t.startswith(ZONE_ORFANI) and t not in citati
            and not t.startswith(PREFISSI_IGNORATI)
            and os.path.basename(t) != "README.md"]


def duplicati(targets):
    h = collections.defaultdict(list)
    for t in targets:
        try:
            with open(os.path.join(ROOT, t), "rb") as fh:
                h[hashlib.md5(fh.read()).hexdigest()].append(t)
        except OSError:
            pass
    return [sorted(v) for v in h.values() if len(v) > 1]


def main(argv):
    modo = "--check" if "--check" in argv else "--report"
    targets, sources, allfiles = raccogli()

    if modo == "--check":
        rotti = path_rotti(sources, allfiles, solo_codice=True)
        if rotti:
            print("referenze ROTTE nei sorgenti di codice:")
            for m in sorted(rotti):
                print(f"  {m}  <--  {', '.join(sorted(rotti[m])[:3])}")
            return 1
        print(f"referenze OK ({len(sources)} sorgenti, {len(targets)} target, "
              "nessun path rotto nel codice)")
        return 0

    # --report: il quadro completo
    rotti = path_rotti(sources, allfiles, solo_codice=False)
    print("=== PATH CITATI MA INESISTENTI ===")
    if not rotti:
        print("  (nessuno)")
    for m in sorted(rotti):
        chi = sorted(rotti[m])
        nota = "  [whitelist: roadmap/futuro]" if all(
            c in WHITELIST_SORGENTI for c in chi) else ""
        print(f"  {m}  <--  {', '.join(chi[:4])}{nota}")

    print("\n=== ORFANI (zone-canone, mai citati) ===")
    orf = orfani(targets, sources)
    dinamici = [o for o in orf if o.startswith(PREFISSI_DINAMICI)]
    orf = [o for o in orf if not o.startswith(PREFISSI_DINAMICI)]
    if not orf and not dinamici:
        print("  (nessuno)")
    for o in orf:
        print(f"  {o}")
    if dinamici:
        print(f"  (+ {len(dinamici)} file sotto {', '.join(PREFISSI_DINAMICI)} — "
              "caricati dinamicamente per id/glob, non sono orfani veri)")

    print("\n=== DUPLICATI (byte-identici) ===")
    dup = duplicati(targets)
    if not dup:
        print("  (nessuno)")
    for gruppo in dup:
        print(f"  {gruppo}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
