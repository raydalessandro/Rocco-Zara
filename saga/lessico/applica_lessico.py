#!/usr/bin/env python3
"""Applica il lessico delle Terre Annodate al canone (boundary-safe, idempotente).
NON tocca i path in "substrato" (mappa.json): il substrato reale a nomi voluti —
zones/geojson, l'atlante del cartografo (cartografia/regno), il sottotesto d'autore
(MAPPATURA.md, MAPPA_CAST.md, README comprimari) e la mappa stessa (le sue chiavi
SONO i nomi vecchi). Gli id-slug interni (laghi_occidente, toscana...) restano
chiavi stabili. Rieseguibile: cambia mappa.json e rilancia.
La mappa vive in mappa.json (single source of truth, letta anche dal linter):
"nomi" = sostituzioni boundary-safe (ordine longest-first), "frasi" = replace
diretto, "substrato" = prefissi/path esclusi (condivisi con il linter)."""
import re, glob, json, os

_MAPPA = json.load(open(os.path.join(os.path.dirname(__file__), "mappa.json"), encoding="utf-8"))
M = _MAPPA["nomi"]        # nomi (boundary-safe)
V = _MAPPA["frasi"]       # voci/frasi lunghe (replace diretto, no collisioni)
SUB = _MAPPA["substrato"] # path a nomi reali voluti: mai riscritti

def boundary(text, old, new):
    return re.sub(r"(?<![A-Za-zÀ-ÿ])"+re.escape(old)+r"(?![A-Za-zÀ-ÿ])", new, text)

files=[f for f in glob.glob('saga/**/*.md',recursive=True)]
files+=[f for f in glob.glob('saga/**/*.json',recursive=True)]
files+=[f for f in glob.glob('saga/**/*.yaml',recursive=True)]
files=[f for f in files if not any(f.replace(os.sep,'/').startswith(p) for p in SUB)]

pairs=sorted(M.items(), key=lambda kv:-len(kv[0]))
n=0
for f in files:
    s=open(f,encoding='utf-8').read(); o=s
    for a,b in pairs: s=boundary(s,a,b)           # nomi (boundary-safe) — PRIMA
    for a,b in V.items(): s=s.replace(a,b)        # voci (chiavi coi nomi nuovi) — DOPO
    s=re.sub(r"([A-Za-zÀ-ÿ]+)-reskin", r"\1", s)  # artefatti -reskin
    if s!=o: open(f,'w',encoding='utf-8').write(s); n+=1
print(f"Lessico applicato a {n} file (boundary-safe).")
for f in glob.glob('saga/**/*.json',recursive=True):
    if 'zones/' not in f: json.load(open(f))
import yaml; yaml.safe_load(open('saga/saga_config.yaml'))
print("json + yaml validi.")
