# geo/ — il canone geografico congelato (machine-readable)

Confini e layer d'acqua dei sei regni come **vettori committati**: da qui mappe e
immagini si rigenerano **senza rete** e in modo deterministico (l'OSM live cambia;
questi file no).

| file | contenuto |
|---|---|
| `regni_confini.geojson` | poligoni canonici dei 6 regni (nomi lessico, capitale, governo, fazione, colore) |
| `po.geojson` | il Po — divisore R3/R4, "il grande guado" |
| `laghi.geojson` | i 5 grandi laghi (Como, Maggiore, Lugano, Iseo, Garda) |
| `centri.geojson` | capitali + centri minori (da `regno/atlante_politico.json`) |
| `manifest_taglio.json` | bbox, fonti (DEM Terrarium z9), e le **regole di taglio** esatte |

Rigenerazione da zero (se mai servisse): `pipeline/geo_confini.py`
(riscarica DEM+OSM e riproduce questi file con le stesse regole).

Il viewer in `viewer/` può puntare a `regni_confini.geojson`.
