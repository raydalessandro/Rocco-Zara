# `trama/` — la macchina della trama di fondo

Qui vive ciò che rende Rocco & Zara una **serie** e non episodi sciolti: il **grafo
degli episodi**, gli **archi/nodi** del viaggio lungo, e l'**anti-drift**.

| File | Cosa | Stato |
|---|---|---|
| `archi_e_nodi.md` | struttura del viaggio (frattale EAR, spina geografica, tipi-episodio, orizzonti) | ✅ design |
| `continuita_e_anti_drift.md` | accumulo coerente nel tempo (delta/fold, recap, audit, quote) | ✅ design |
| `schema_episodio.md` | il formato di un nodo-episodio (spina autoconclusiva + continuità + effects) | ✅ schema |
| `saga_graph.json` | il grafo di tutti gli episodi | 🟡 stub (Ep01 si modella in M1, dopo la geografia) |

Dipende da: `../ontologia/` (la lente), `../cartografia/` (i centri = stazioni, le
rotte = spina del viaggio), `../bible/` (le voci bloccate). È **input del
serializzatore** (`../serializzatore/`).
