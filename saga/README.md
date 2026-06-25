# `saga/` — il livello-saga di Rocco & Zara

Questa cartella è **la divergenza** da Scrivia. Scrivia (la repo intorno) resta il
**motore di un episodio**: dato un `Seed`, la sua catena deterministica produce la
storia illustrata (nodo → hook → brief → prosa → reference → libro). `saga/` aggiunge
sopra ciò che a un motore mono-storia manca: **un mondo, un viaggio, una memoria**.

Rocco & Zara è una **serie** in stile *Pokémon*: tante puntate **autoconclusive** su
una **trama di fondo**, lette come un **viaggio** dentro un **territorio reale** —
ogni episodio riprende dove si era fermato il precedente.

## I sei pilastri (le sottocartelle)

| Cartella | Cos'è | Stato |
|---|---|---|
| `ontologia/` | **Il kernel EAR** — la spina dorsale che *genera* il ragionamento (non un JSON: un'ontologia applicata a tutto). | ✅ posato |
| `bible/` | Il **canone** di Rocco & Zara: i due protagonisti con i loro archi di saga, le frasi e gli oggetti ricorrenti. | 🟡 seme |
| `cartografia/` | **Il mondo**: corridoio reale Prealpi→Toscana (DEM+OSM) → **6 regni-comuni** (faunario, società, voci) + **città-rovina**. Origine pinnata a Lecco (B1). | ✅ canone (cartografo) |
| `trama/` | La **macchina della trama di fondo**: il grafo degli episodi, gli **archi/nodi** del viaggio lungo, l'**anti-drift**. | 🟡 schema + design |
| `serializzatore/` | Il **collante** `saga → Seed`: come un nodo-episodio diventa un Seed per il motore Scrivia + l'audit di continuità. | ⬜ spec (M2) |
| `saga_config.yaml` | Il **canone normativo machine-readable** della saga (enum, vincoli, quote). | 🟡 da completare con il luogo |

## Ordine di lavoro (deciso con l'autore)

1. **(qui) Impostazione** — kernel portato avanti, struttura pronta, brief scritti.
2. **Geografia** — ✅ **fatta** (sessione cartografo): corridoio reale Prealpi→Toscana,
   6 regni-comuni con faunario/società/voci, città-rovina, origine pinnata a **Lecco/B1**.
   Fonte di verità: **`cartografia/CANONE_GEOGRAFICO.md`** (+ `cartografia/regni/`,
   `cartografia/ORIGINE.md`). Il geojson per-zona è canone e si committa.
3. **M1 — Saga config + grafo**: `saga_config.yaml` completo + `trama/saga_graph.json`
   con l'**Ep01 (origine)** modellato + abbozzo del primo arco.
4. **M2…** — serializzatore, reference visiva di saga, prosa di serie, catalogo/lettore.

## Confine con Scrivia (regola d'oro, da `CLAUDE.md`)

`lib/` di Scrivia resta la *single source of truth* del motore: **non si tocca** per la
saga. `saga/` **legge** dal motore e gli **passa** Seed via gli stessi contratti
(`lib/types.ts` → `Seed`). Cambiare il mondo non deve rompere il motore; estendere il
motore non deve rompere il mondo. Tutto via **feature branch + PR** (mai merge diretto).

> **Perché un'ontologia e non solo JSON.** Le nostre storie non sono "scritte dall'IA"
> né dedotte da un JSON: sono l'**applicazione dell'ontologia EAR** a tutta
> l'infrastruttura — trama, personaggi, archi, nodi, e l'accumulo nel tempo. Il JSON è
> la *resa* di un ragionamento ontologico, non la sua origine. Vedi
> `ontologia/COME_SI_APPLICA.md`.
