# geo/ — il canone geografico congelato (v2, machine-readable)

Confini **naturali** e layer d'acqua dei sei regni come vettori committati: da qui mappe
e immagini si rigenerano **senza rete** e in modo deterministico.

| file | contenuto |
|---|---|
| `regni_confini.geojson` | poligoni **naturali** dei 6 regni (morfologia, Adda, Grande Fiume, cresta appenninica) |
| `gran_piana.geojson` | **la Gran Piana d'Occidente**: l'ex-mare a ovest — la costa sparisce, l'Italia non si riconosce |
| `fiumi.geojson` | il Grande Fiume (Po), Adda, Ticino, Oglio, Mincio, Adige, Arno, Serchio, Reno, Secchia, Panaro, Ombrone |
| `laghi.geojson` | i 5 grandi laghi |
| `centri.geojson` | capitali + centri minori |
| `riferimenti_trama.geojson` | i punti **esatti** dove passa la storia: Collina dell'Incontro, Luoghi Antichi, capitali (verificati dentro il regno giusto) |
| `manifest_taglio.json` | bbox, fonti, **regole naturali** di taglio, griglia 0,25° |
| `mappa_riferimento.png` | l'atlante di riferimento (guida per le immagini generative) |

Regole dei confini (v2, niente linee rette):
monti = morfologia DEM (le città pedemontane restano col monte) · R1|R2 = **Adda + ramo di
Lecco + Val di Mera** · R3|R4 = **il Grande Fiume** · R4|R5 = bordo pianura→Appennino ·
R5|R6 = **cresta appenninica** · bordo NE = **la valle dell'Adige**.

Rigenerazione da zero: `pipeline/geo_confini.py`. Il viewer in `viewer/` resta legato
allo schema-luogo (`island.geojson`), non a questi layer.
