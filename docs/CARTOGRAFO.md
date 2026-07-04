# CARTOGRAFO — il dettaglio normativo

> Compagno di `.claude/agents/cartografo.md`. Qui: come gira la pipeline, gli
> invarianti che i gemelli impongono, e i lavori aperti della corsia.

## 1. L'impianto (chi produce cosa)

```
pipeline/geo_confini.py  ──(rete: DEM+Overpass)──▶  geo/*.geojson + manifest_taglio.json
                                                    geo/INDICE_LUOGHI.json (fonte unica)
pipeline/geo_digest.py   ──(glob zones/*.geojson)─▶  zones/_digest.json (morfologia)
                                                          │
serializzatore (mondo.ts) ◀───── legge INDICE + digest ───┘  → riga MORFOLOGIA nel brief
```

- **Rigenerazione** = eseguire lo script. **Verifica** = `--check` (offline, stdlib
  puro, nessuna rete): è ciò che gira in CI via i test-gemelli
  (`test/geo.sync.test.ts`, `test/digest.sync.test.ts`).
- Il pack v2 comprende: `regni_confini`, `gran_piana`, `fiumi`, `laghi`, `centri`,
  `riferimenti_trama` (+ manifest + INDICE). `mappa_riferimento.png` è l'atlante umano.

## 2. Gli invarianti (ciò che i `--check` impongono)

| Invariante | Perché |
|---|---|
| manifest.file ↔ file del pack, senza fantasma né orfani | il manifest è il contratto del pack |
| `regni_confini` ha i 6 regni con gli id dell'atlante politico | il grafo e le schede citano quegli id |
| ogni luogo dell'INDICE: dentro bbox, **dentro il poligono del suo regno**, `margine_km > 0` | lo snap anti-confine non deve mai regredire |
| cella di griglia ricalcolata = cella scritta (passo 0.25°, A.. da W, 1.. da N) | la cella è derivata, non opinione |
| `centri` e `riferimenti_trama`: **stesse coordinate dell'INDICE** (join sul nome) | fonte unica: un solo posto dove correggere |
| digest: una voce per regno con zone/quote/acque dai geojson presenti, fallback anonimo per gli assenti | la riga MORFOLOGIA del brief dev'essere stabile e onesta |

Se un check è rosso: **prima** capire se è drift (qualcuno ha toccato a mano) o
evoluzione legittima (allora si rigenera e si committano insieme script+output).

## 3. Status e promozione (da isola, invariato)

- Ogni luogo/zona ha uno status implicito: **canonico** (nell'INDICE, con fonte),
  **provvisorio** (deciso ma senza geometria), **stub** (solo nominato nella trama).
- La promozione richiede una **fonte**: il geojson tagliato dal reale, o una decisione
  autoriale scritta (in `saga/TODO.md` o nel doc di regno). Mai promozione silenziosa.
- Le **evoluzioni** del pack si fanno vedere: bump/nota nel manifest (`versione`,
  data) e riga nel commit. La carta cambia raramente e **rumorosamente**.

## 4. Lavori aperti della corsia (fotografia)

| Lavoro | Stato |
|---|---|
| GeoJSON dei 4 regni mancanti in `zones/` | in attesa dei file (formato atteso: `zones/README.md`); all'arrivo: `geo_digest.py` e via |
| **D1** — Luoghi Antichi come feature (`kind: luogo_antico`, coord reali, `real_ref`) | da fare, dopo l'arrivo delle zone |
| **D2** — `prompt_immagine_base`: allineare `regni/INDICE.md` ↔ `regno.json` | da fare (piccolo) |
| **Viewer** (`geo/viewer/index.html`) | morto: fetcha `../island.geojson` (residuo isola). Ricablare sul pack (`geo/*.geojson`) o rimuovere |
| Incoerenza storica in `regno/atlante_politico.md` ("Italia dei Comuni") | coperta dall'avviso substrato; si sana solo se si rifà l'atlante |

## 5. Il substrato (regola di igiene)

I nomi reali servono alla pipeline (query Overpass, ritagli DEM) e **muoiono lì**.
Tutto ciò che può finire in un brief (INDICE, digest, campi dei regni) parla **solo**
il lessico delle Terre Annodate (`saga/lessico/mappa.json`). Il linter del canone
(`test/canon.lint.test.ts`) fa da rete anche per questa corsia: se si accende su un
file della cartografia, il leak è qui.
