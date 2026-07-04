# zones/ — i GeoJSON di zona e il digest morfologico

Qui vivono i **GeoJSON per-regno** prodotti nella *chat geografia* (morfologia vera del
luogo reale: quote, biomi, corsi d'acqua, rilievi) e il loro **digest committato**,
`_digest.json` — la sorgente della riga **MORFOLOGIA** nei brief (via il modulo `mondo`
del serializzatore).

**Presenti:** `origine_lecco` (la Soglia/B1) · `foresta_appennino` (la Selva).
**Attesi:** i GeoJSON dei **quattro regni rimanenti** (Laghi, Conca, Ducato, Terre del
Leone) — stesso formato: FeatureCollection WGS84 (lon/lat), proprietà secondo
`../convenzioni/schema_luogo.md` (`quota_m`, `bioma`, `waterway`, `kind`/`name` per i
rilievi). I **nomi reali** qui sono voluti (substrato — `saga/lessico/mappa.json` →
`substrato`): la traduzione al canone avviene a valle, nel serializzatore.

## Quando arriva un GeoJSON nuovo

```bash
# 1. deposita qui:            saga/cartografia/zones/<slug_zona>.geojson
# 2. rigenera il digest:      python3 saga/cartografia/pipeline/geo_digest.py
# 3. il cancello resta verde: python3 saga/cartografia/pipeline/geo_digest.py --check
```

Un comando, e la MORFOLOGIA del regno entra nei brief. Il `--check` è il cancello
anti-drift (`test/digest.sync.test.ts`): il digest committato deve sempre combaciare
con i geojson. I `.png` accanto ai geojson sono le viste di controllo umano
(facoltative, generate nella stessa chat).
