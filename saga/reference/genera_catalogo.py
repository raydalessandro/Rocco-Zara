#!/usr/bin/env python3
"""Genera il CATALOGO VISIVO: kit di generazione delle reference di catalogo (1c) per Manus.
Fonti: entities.json (registro) + bible/*.md (sezione «Aspetto canonico») + STILE_VISIVO (regole).
Output: saga/reference/CATALOGO_VISIVO.md — deterministico, zero-LLM.
Uso:  python3 saga/reference/genera_catalogo.py
      python3 saga/reference/genera_catalogo.py --check    (cancello: 0 se allineato, 1 se drift)"""
import json, os, re, sys
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENT=os.path.join(ROOT,"saga/serializzatore/state/entities.json")
OUT=os.path.join(ROOT,"saga/reference/CATALOGO_VISIVO.md")
STOP={"il","la","le","lo","l","i","gli","un","una","del","della","delle","dei","degli","di","da","che","e"}
MAPPA=json.load(open(os.path.join(ROOT,"saga/lessico/mappa.json")))
_map={**MAPPA.get("frasi",{}),**MAPPA.get("nomi",{})}
_pat=re.compile("(?<![A-Za-zÀ-ÿ])("+"|".join(re.escape(k) for k in sorted(_map,key=len,reverse=True))+")(?![A-Za-zÀ-ÿ])")
def lessico(t):
    """Sostituzione reale→canone: stessa regex boundary-safe di applica_lessico.py / canon.lint."""
    return _pat.sub(lambda m:_map[m.group(1)],t)
def toks(s):
    return frozenset(t for t in re.split(r"[-_]+",s.lower()) if t and t not in STOP)
def tokmatch(a,b):  # uguali, o radice comune ≥5 (antichi/antico)
    if a==b: return True
    return len(a)>=5 and len(b)>=5 and a[:5]==b[:5]
def setmatch(A,B):
    return len(A)==len(B) and all(any(tokmatch(a,b) for b in B) for a in A)
def subset(A,B):
    return all(any(tokmatch(a,b) for b in B) for a in A)
# --- indice schede ---
schede={}
for d in ("saga/bible","saga/bible/comprimari"):
    for f in sorted(os.listdir(os.path.join(ROOT,d))):
        if f.endswith(".md") and not f.startswith("_") and f not in ("COSMOLOGIA.md","STILE_VISIVO.md","ritornelli.md","MAPPA_CAST.md","README.md"):
            schede[os.path.join(d,f)]=toks(f[:-3])
def trova_scheda(eid):
    T=toks(eid.replace("char_",""))
    esatte=[p for p,S in schede.items() if setmatch(T,S)]
    if len(esatte)==1: return esatte[0]
    sub=[p for p,S in schede.items() if subset(T,S)]
    return sub[0] if len(sub)==1 else None
def aspetto(path):
    txt=open(os.path.join(ROOT,path)).read()
    m=re.split(r"^###\s+Aspetto[^\n]*\n",txt,maxsplit=1,flags=re.M)
    if len(m)<2: return [],None
    sez=re.split(r"^###\s",m[1],maxsplit=1,flags=re.M)[0]
    items=[];cur=None
    for ln in sez.splitlines():
        if ln.lstrip().startswith("- "): 
            if cur: items.append(cur)
            cur=ln.lstrip()[2:].strip()
        elif cur and ln.strip() and not ln.startswith(">"): cur+=" "+ln.strip()
    if cur: items.append(cur)
    nota=None
    q=[l[1:].strip() for l in sez.splitlines() if l.startswith(">")]
    if q: nota=" ".join(q)
    def pul(t):
        t=re.sub(r"\*\((?:[^()]|\([^()]*\))*\)\*","",t)  # note d'autore (piano-Orwell): fuori dalla produzione
        return lessico(re.sub(r"\s{2,}"," ",re.sub(r"\*+","",t)).strip())
    return [pul(i) for i in items],(pul(nota) if nota else None)
ents=json.load(open(ENT)); ents=ents.get("entities",ents)
chars={k:v for k,v in ents.items() if v.get("kind")=="character"}
locs={k:v for k,v in ents.items() if v.get("kind")=="location"}
PROT=["rocco","zara","toraki"]
def prio(k):
    for i,p in enumerate(PROT):
        if p in k: return (0,i)
    return (1,chars[k].get("name",""))
ANTICHI=("coppelle","incise","rovine","altare","pietre_leone","luogo")
O=["# Catalogo visivo — kit di generazione reference (per Manus)","",
"> **Cosa è**: il fascicolo da cui generare le **reference di catalogo (contesto 1c)** — i ritratti",
"> riusabili e vincolanti di ogni entità. Generato da `genera_catalogo.py`; le fonti vincolanti",
"> sono il registro (`entities.json`) e le schede canone (`bible/`).","",
"> **Per Manus**: incarna l'agente **`ritrattista`** (`.claude/agents/ritrattista.md`) — questo",
"> file è il suo **foglio di lavoro**. Flusso: proposta `ritratto` → validazione umana (le",
"> modifiche si scrivono PRIMA in morfologia) → conferma → set HD `fronte`·`tre_quarti`·",
"> `profilo`·`segno` → consegna in branch (path 1c + registro + patch scheda ⚠ se serve).","",
"> **Regole di tavola (sempre, ogni vista)**: animali **naturalistici**, gentilmente stilizzati;",
"> **mai vestiti/costumi, mai cartoon-flat, mai pose umane, mai aloni o effetti**; scala reale fra",
"> specie; il **segno naturale** distintivo visibile e fedele; fondo = bioma del regno, neutro e",
"> secondario (il soggetto è la reference).","",
"> **Viste standard ⚠ (proposta da ratificare)** — personaggi: proposta = `ritratto`; dopo la",
"> conferma umana, set HD: `fronte` · `tre_quarti` · `profilo` · `segno`. Luoghi: `campo` ·",
"> `materia`. Naming: `public/reference/<entityId>/<entityId>_<vista>.jpg` (+ `_hd/`).",""]
mancanti=[]
def blocco_char(k):
    v=chars[k]; sp=trova_scheda(k)
    specie=v.get("species")
    if sp:
        m=re.search(r"-\s*\*\*specie\*\*:\s*(.+)",open(os.path.join(ROOT,sp)).read())
        if m: specie=lessico(re.sub(r"\*+","",m.group(1)).strip())
    L=[f"### {v.get('name','?')} — `{k}`"]
    L.append(f"- **soggetto**: {specie or '?'}")
    if sp:
        L.append(f"- **scheda (fonte vincolante)**: `{sp}`")
        items,nota=aspetto(sp)
        if items:
            L.append("- **aspetto canonico**:")
            for i in items: L.append(f"  - {i}")
        if nota: L.append(f"- **nota di firma**: {nota}")
    else:
        mancanti.append(k)
    L.append(f"- **reference (registro)**: {lessico(v.get('descriptor','—'))}")
    L.append(f"- **viste**: proposta `{k}_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/{k}/`")
    st=v.get("status","?"); iu=v.get("imageUrl")
    L.append(f"- **status**: {st}"+(f" · **già in catalogo**: {iu} (rigenerare solo su richiesta)" if iu else ""))
    return "\n".join(L)+"\n"
def blocco_loc(k):
    v=locs[k]
    L=[f"### {v.get('name','?')} — `{k}`",
       f"- **key-art (registro)**: {lessico(v.get('descriptor','—'))}",
       f"- **viste da generare**: `{k}_campo` · `{k}_materia` → `public/reference/{k}/`",
       f"- **status**: {v.get('status','?')}"]
    return "\n".join(L)+"\n"
O+=["## 1 · Personaggi",""]
for k in sorted(chars,key=prio): O.append(blocco_char(k))
ant=sorted([k for k in locs if any(a in k for a in ANTICHI)],key=lambda k:locs[k].get("name",""))
cap=sorted([k for k in locs if k not in ant],key=lambda k:locs[k].get("name",""))
O+=["## 2 · Luoghi Antichi",""]+[blocco_loc(k) for k in ant]
O+=["## 3 · Capitali e scene madri",""]+[blocco_loc(k) for k in cap]
if mancanti: O.append(f"\n> ⚠ senza scheda abbinata (verificare mapping): {', '.join(mancanti)}\n")
testo="\n".join(O)
if "--check" in sys.argv:
    if not os.path.exists(OUT) or open(OUT).read()!=testo:
        print("DRIFT: CATALOGO_VISIVO.md non allineato al generatore/fonti — rigenerare."); sys.exit(1)
    print("catalogo-sync ✓"); sys.exit(0)
open(OUT,"w").write(testo)
print(f"CATALOGO_VISIVO.md ✓ — {len(chars)} personaggi ({len(chars)-len(mancanti)} con scheda), {len(locs)} luoghi")
if mancanti: print("⚠ senza scheda:",", ".join(mancanti))
