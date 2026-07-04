# TRACCIA — primo commit su GitHub (repo Rocco & Zara)

Questa repo è **Scrivia** (il motore per-episodio, intatto in `lib/`/`app/`) **+ il
livello `saga/`** che la fa diventare il **serializzatore di Rocco & Zara**: puntate
autoconclusive su una trama di fondo, lette come un **viaggio** in un mondo reale.
Dentro `saga/` confluiscono: il lavoro di impostazione (scaffold + ontologia + trama)
**e** il canone del cartografo (corridoio reale → 6 regni-comuni → faunario/società/voci).

## Cosa c'è (mappa rapida)
```
lib/ app/ components/ …   Scrivia: motore deterministico per-episodio (INTATTO)
saga/
  ontologia/              kernel EAR + COME_SI_APPLICA (la lente che genera tutto)
  bible/                  Rocco & Zara (canone duro) — ora col layer-regno
  cartografia/            IL MONDO (canone del cartografo, fa fede)
    CANONE_GEOGRAFICO.md  corridoio Muro del Nord→Terre del Leone di Pietra (DEM+OSM), griglia 5x5
    ORIGINE.md            l'incontro pinnato: Spondalta / B1 (ancora dell'Ep01)
    regni/                6 regni-comuni: regno+società+faunario+voci+schemi
    regno/               atlante, atlante_politico, rete urbana (Vie Antiche)
    zones/               geojson reali per-zona (CANONE) + render png
    pipeline/             generatori riproducibili (zonegen/kingdom/rete/…)
  trama/                  grafo episodi (stub) + archi/nodi + anti-drift + schema
  serializzatore/         spec del ponte saga→Seed (M2)
  saga_config.yaml        canone machine-readable — allineato al cartografo
```

## Allineamenti fatti in questo giro (il canone del cartografo fa fede)
1. **Incoerenza risolta** — l'unico file fuori sincrono era il master geografico
   auto-generato `cartografia/regno/regni.json`. Allineato al canone narrativo:
   - nomi: R5 `Gobbe del Sud Emiliano`→**Selva di Mezzo**, R6 `Gobbe del Sud Toscano`→**Terre del Leone di Pietra**;
   - capitali: R1 Vespraviva→**Rivalba**, R2 Cimalbe→**Forterocca** (la *Leonessa* — scelta voluta),
     R5→**Città-rovina della Selva**, R6 Pietralta→**Leonalba**;
   - **Forterocca** spostata da Gran Ducato a Conca Ruggente nei centri (coerenza).
   - *Nota geo da ratificare:* Forterocca cade ~1 km a sud del bbox auto di R2 (sta sulla
     **soglia** verso la Serpe — narrativamente perfetto: il libero comune di confine).
     Il bbox NON è stato ritoccato (geometria DEFINITIVA). Se vuoi, si rigenera col pipeline.
   - Tutto il resto del canone (atlante politico, indice, faunario, società, voci) era
     **già coerente**: nessun'altra incoerenza trovata.
2. **GeoJSON committato** — `zones/*.geojson` ora **è canone e si committa**: è la
   **fonte deterministica** da cui mappe e immagini si rigenerano in modo riproducibile
   (l'OSM cambia nel tempo; il geojson congelato no). `.gitignore` aggiornato: si esclude
   solo la **cache** (`cache_zones/`, `geo/cache/`), non il geojson.
3. **Scaffold ↔ canone** (solo rinomine d'allineamento):
   - `saga_config.yaml` ora parla il vocabolario del cartografo (regni, 7-zone, faunario,
     classi/corporazioni/voci) e usa il **bioma reale** (foresta/savana/acqua/roccia/rovina/umido).
   - `bible/rocco.md` e `zara.md`: aggiunto il **layer-regno** (Rocco← Gran Ducato/Serpe,
     Zara← Laghi del Vespro/Popolo del Bosco; entrambi **Forestieri**, voce forestiera).
   - `trama/schema_episodio.md`: l'episodio si ancora a **regno + zona (7-zone) + bioma**;
     la creatura dell'episodio pesca dal **faunario** del regno.
   - `ORIGINE.md`: l'origine pinnata (B1/Spondalta) riconcilia "monti del lago" e "soglia
     verso la Serpe" — è la stessa altura.
   - README aggiornati: la geografia è **fatta**, niente più "DOPO-GEO"/"pronto per la chat".

## Politica dei binari (coerente)
- **Canone, si committa**: `zones/*.geojson` (la geometria reale, deterministica).
- **Reference, si committa**: i `*.png` (base per costruirci le immagini; rigenerabili dal geojson).
- **Cache, si ignora**: `cache_zones/`, `geo/cache/` (query OSM/DEM, pesanti e rigenerabili).
- `saga/` pesa ~47 MB (≈18 MB geojson + ≈29 MB png). Sotto i limiti GitHub (file max 13 MB).
  **Consiglio**: se le zone si moltiplicano (viaggio lungo), passare i png a **Git LFS**
  per tenere i clone leggeri; il geojson può restare versionato o anch'esso in LFS.

## Primo commit + workflow
Non c'è ancora storico su GitHub. Due opzioni (lo zip allegato è il working tree pulito,
senza `.git`):
- **Start pulito** (consigliato, come da tua intenzione): estrai lo zip → `git init` →
  primo commit con tutto. Da lì in poi **feature branch + PR** (regola di `CLAUDE.md`),
  mai merge diretto su `main`; `npm run check` verde prima della PR.
- **Con storico**: se vuoi la provenienza del build Scrivia, posso darti un **bundle git**
  che preserva tutta la history con questo allineamento già committato.

Il branch tocca **solo `saga/`** (nessun file TS/`lib`/`app`/config): il build di Scrivia
e la CI restano verdi.

## Prossimi passi (lavoro con gli agenti, per parte)
| Parte | Agente | Cosa |
|---|---|---|
| Personaggi + reference visiva | bible + Passo 0 di Scrivia | estrarre i personaggi (regno→classe→corporazione→individuo) e **bloccare le reference** di Rocco & Zara (consistenza "da serie") |
| `saga_graph.json` + 1° arco | trama + backend | modellare **Ep01** (l'origine, ancorata a B1/Spondalta) e abbozzare l'arco dei Laghi del Vespro |
| Quote di saga | backend | tarare `saga_quotas` (anti-ripetizione) col procedere delle storie |
| Serializzatore | ai/backend | implementare il ponte `saga→Seed` + audit di continuità (M2) |

## Aperto (di proposito)
- Dettagli per-storia (si aggiungono strada facendo, anche per singola puntata).
- `saga_graph.json` è uno **stub**: Ep01 e il primo arco sono il primo lavoro narrativo.
- `saga_quotas` da tarare sul campo.
