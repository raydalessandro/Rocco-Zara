# Schema-luogo — il formato target della cartografia

Destinazione del lavoro geografico: ogni feature reale, una volta clippata e
reinterpretata, prende **proprietà geojson** nostre + (per i luoghi che contano) una
**scheda-luogo** in markdown. Così la geografia è machine-readable *e* leggibile.

## A. Proprietà geojson (in `geo/<stato>.geojson`)

Ogni `feature.properties`:

```json
{
  "id": "foresta_della_voce",          // id nostro, snake_case, stabile (canone duro)
  "name": "La Foresta della Voce",     // nome di finzione, leggibile
  "real_ref": "osm:way/123456",        // tracciabilità: da dove viene la geometria reale
  "kind": "zona",                       // zona | sentiero | centro | acqua | rilievo | confine
  "bioma": "foresta",                   // foresta | savana | valico | acqua | roccia | ... (enum nostro)
  "quadrante": "ovest",                 // settore del territorio (per orientarsi nel viaggio)
  "is_centro_gravitazionale": false,    // true se è una stazione d'arco (vedi template centro)
  "status": "canonico"                  // bozza | canonico
}
```

- **Poligoni** → zone, biomi, confine dello stato.
- **LineString** → sentieri/rotte (la spina del viaggio), corsi d'acqua.
- **Point** → luoghi puntuali, centri gravitazionali, vette.

`id` è **canone duro**: una volta usato in una storia, non si rinomina (le rinomine si
loggano, come fa isola).

## B. Scheda-luogo (in `cartografia/luoghi/<id>.md` o `bible/luoghi/<id>.md`)

Solo per i luoghi che entrano nelle storie. Campi:

| Campo | Cosa |
|---|---|
| `id`, `name` | combaciano con il geojson |
| `bioma`, `quadrante` | dal geojson |
| **senso dominante** | da cosa si riconosce: un suono, un odore, una luce, una consistenza (vedi voce-luogo del canone seme) |
| **qualità della luce** | come ci sta la luce (bassa/mobile/piena/obliqua) |
| **stagionalità** | come cambia tra le stagioni (importa per il viaggio lungo) |
| **transizioni** | con quali zone confina e *come* ci si passa (è ciò che rende il mondo percorribile) |
| **funzione narrativa** | che tipo di avventure ospita; perché è una calamita |
| **EAR** | il Δ/⇄/⟳ del luogo (cfr. `ontologia/COME_SI_APPLICA.md`) |
| **vincoli visivi** | ancore per la coerenza delle illustrazioni (palette, elementi fissi) |

## C. Enum dei biomi (da fissare nella chat geografia, qui un seme)

Reinterpretazione dei biomi reali nei nostri. Punto di partenza dalla storia origine:
`savana` (aperto, caldo, poca ombra) · `foresta` (densa, fresca, muschio, buio) ·
`valico`/`collina` (transizione, i baobab) · `acqua` (ruscelli, fiume in piena).
La chat geografia li **estende** in base al luogo reale scelto (altopiano, costa,
palude, ecc.) e li scrive nel `saga_config.yaml`.

> Le convenzioni di **coordinate, scala e proporzioni** seguono il modello di isola
> (`cartografia/convenzioni/` nell'altra repo). Con un luogo reale, il sistema di
> coordinate è **quello geografico vero** (lat/lon, WGS84): un vantaggio rispetto a
> isola, che doveva inventarsi una griglia.
