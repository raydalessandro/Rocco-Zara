# cartografia / pipeline — zonegen

Generatore (quasi)automatico di mappe + geojson per zone del mondo di Rocco & Zara.
Base reale: corridoio **Prealpi → Toscana** (Como/Maggiore → Garda → Appennino tosco-emiliano).

## Uso
    python3 pipeline/zonegen.py NOME  W S E N
    es:  python3 pipeline/zonegen.py origine_lecco 9.28 45.72 9.55 45.98

Produce:
    zones/NOME.png       rilievo DEM + biomi reinterpretati + acqua + centri
    zones/NOME.geojson   TUTTE le feature reali: kind / bioma / quota_m / real_ref

## Come recuperiamo i dati
- **Rilievo**: DEM Terrarium 30 m (senza chiave); lo zoom si sceglie da solo in base alla zona.
- **Vettori**: OSM via Overpass, **una query per zona**, salvata in cache (`cache_zones/`).
- "Recuperare tutto" = **per-zona, a piena precisione, su richiesta** — non un dump monolitico
  dell'intero corridoio (74.000 km² = ingestibile). Ogni zona: ~7.000–10.000 feature reali.

## Reinterpretazione (reskin OSM → mondo della saga)
    bosco (wood/forest)                  → foresta
    aperto/coltivo (grass/farmland/…)    → savana
    acqua (water/waterway/wetland)       → acqua
    insediamento (residential/place)     → rovina   (la civiltà che se n'è andata)
    vetta (peak)                         → roccia
La mappa mostra solo le etichette principali (monti + centri); il **geojson conserva tutto**.

## Parametri (in testa a zonegen.py)
    N_PEAKS / N_PEAK_LABELS / N_PLACES   densità etichette nel render
    PALETTE / IPSO                       colori biomi / ipsometria
