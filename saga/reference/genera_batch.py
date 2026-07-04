#!/usr/bin/env python3
"""Genera il fascicolo di reference per l'illustratore.
Legge entities.json + saga_graph.json → scrive REFERENCE_BATCH.md. Deterministico, zero-LLM.
Uso: python3 saga/reference/genera_batch.py            (rigenera il file)
     python3 saga/reference/genera_batch.py --check    (cancello: 0 se allineato, 1 se drift)"""
import json, os, sys
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ents=json.load(open(os.path.join(ROOT,"saga/serializzatore/state/entities.json")))
ents=ents.get("entities",ents)
g=json.load(open(os.path.join(ROOT,"saga/trama/saga_graph.json")))
PROT=("rocco","zara","toraki")
SERPE=["viscardo","bissa","aspide","artiglio","cecca","sorcio","quinto","cacciatore","mastino","esattore"]
ANTICHI=("coppelle","incise","rovine","altare","pietre_del_leone","luogo")
def blk(e):
    L=[f"### {e.get('name','?')} — `{e.get('entityId')}`"]
    sp=e.get("species") or e.get("kind"); L.append(f"- **specie**: {sp}")
    L.append(f"- **reference**: {e.get('descriptor','—')}")
    st=e.get("status","?"); iu=e.get("imageUrl")
    L.append(f"- **status**: {st}"+(f" · esistente: {iu}" if iu else ""))
    return "\n".join(L)+"\n"
chars={k:v for k,v in ents.items() if v.get("kind")=="character"}
locs={k:v for k,v in ents.items() if v.get("kind")=="location"}
prot=[v for k,v in chars.items() if any(p in k for p in PROT)]
serpe=sorted([v for k,v in chars.items() if any(s in k for s in SERPE) and not any(p in k for p in PROT)],
             key=lambda v:[i for i,s in enumerate(SERPE) if s in v["entityId"]][0])
altri=sorted([v for k,v in chars.items() if v not in prot and v not in serpe],key=lambda v:v.get("name",""))
antichi=sorted([v for k,v in locs.items() if any(a in k for a in ANTICHI)],key=lambda v:v.get("name",""))
capit=sorted([v for k,v in locs.items() if v not in antichi],key=lambda v:v.get("name",""))
O=["# Reference batch — fascicolo per l'illustratore","",
"> **Regole di tavola** (canone `bible/STILE_VISIVO.md`): animali **naturalistici**, gentilmente",
"> stilizzati — **mai cartoon-flat, mai vestiti o in costume**; ogni figura ha il suo **segno",
"> naturale distintivo** (è nel campo reference); scala reale fra le specie; la stranezza è",
"> sempre **fisica** (tracce, tepore, segni — mai aloni, mai effetti).","",
f"Personaggi: {len(chars)} · Luoghi: {len(locs)} · Creature d'episodio: vedi §6.",""]
O+=["## 1 · Protagonisti (reference di riferimento — coerenza assoluta)",""]+[blk(e) for e in sorted(prot,key=lambda v:PROT.index([p for p in PROT if p in v['entityId']][0]))]
O+=["## 2 · La Serpe e i suoi strumenti",""]+[blk(e) for e in serpe]
O+=["## 3 · Comprimari dei regni",""]+[blk(e) for e in altri]
O+=["## 4 · I Luoghi Antichi (i cinque nodi + il sepolto)",""]+[blk(e) for e in antichi]
O+=["## 5 · Capitali e scene madri (key-art)",""]+[blk(e) for e in capit]
O+=["## 6 · Creature d'episodio (una per capitolo — prima apparizione)",""]
eps=sorted(g["episodes"].values(),key=lambda n:n.get("order_in_journey",0))
vol=0
for n in eps:
    v=(n.get("order_in_journey",1)-1)//4+1
    if v!=vol: vol=v; O.append(f"\n**Volume {vol}**")
    c=n.get("episode_creature")
    if c: O.append(f"- {n['id']} · **{c.get('species','?')}** — *{n.get('title','')}*")
O.append("")
out="\n".join(O)
dest=os.path.join(ROOT,"saga/reference/REFERENCE_BATCH.md")
if "--check" in sys.argv:
    cur=open(dest,encoding="utf-8").read() if os.path.exists(dest) else None
    if cur==out:
        print(f"REFERENCE_BATCH.md OK ({len(chars)} personaggi, {len(locs)} luoghi)"); sys.exit(0)
    print("REFERENCE_BATCH.md NON allineato: rigenera con `python3 saga/reference/genera_batch.py`",file=sys.stderr); sys.exit(1)
open(dest,"w",encoding="utf-8").write(out)
print(f"REFERENCE_BATCH.md ✓ ({len(chars)} personaggi, {len(locs)} luoghi)")
