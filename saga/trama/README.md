# `trama/` — la macchina della trama di fondo

Qui vive ciò che rende Rocco & Zara una **serie** e non episodi sciolti: il **grafo
degli episodi**, gli **archi/nodi** del viaggio lungo, e l'**anti-drift**.

| File | Cosa | Stato |
|---|---|---|
| `archi_e_nodi.md` | struttura del viaggio (frattale EAR, spina geografica, tipi-episodio, orizzonti) | ✅ design |
| `continuita_e_anti_drift.md` | accumulo coerente nel tempo (delta/fold, recap, audit, quote) | ✅ design |
| `schema_episodio.md` | il formato di un nodo-episodio (spina autoconclusiva + continuità + effects) | ✅ schema |
| `SCHELETRO_STAGIONE.md` | l'innesco e i sei movimenti della stagione, la scalata della Serpe, i ritornelli | ✅ allineato alla MAPPA_CAST (6 archi) |
| `SPINE_NARRATIVO.md` | la spina episodio-per-episodio: 24 puntate, seed/pagamenti, soglie di crescita | ✅ stagione |
| `rotture_e_spirale.md` | le rotture di formula e la spirale del pericolo lungo la stagione | ✅ design |
| `saga_graph.json` | il grafo di tutti gli episodi | ✅ `0.2.0-stagione` — ep01–ep24, semi/debiti/soglie/facce della Serpe/tracce di Toraki |
| `volumi/` | la trama fattuale completa, un volume per arco (`VOLUME_1..6.md`) | ✅ 6/6 scritti |
| `DECISIONI_PROPOSTE.md` | ⚠ le decisioni autoriali aperte (resa della sconfitta del Mastino, uscita del Cacciatore, meccanica di Viscardo, Luogo Antico sepolto nel disegno finale, …) | 🟡 in attesa di Ray |

Dipende da: `../ontologia/` (la lente), `../cartografia/` (i centri = stazioni, le
rotte = spina del viaggio), `../bible/` (le voci bloccate). È **input del
serializzatore** (`../serializzatore/`).

Regola di precedenza: per le questioni di struttura (numero e ordine degli archi)
fa fede `../bible/MAPPA_CAST.md`; lo SCHELETRO la segue.
