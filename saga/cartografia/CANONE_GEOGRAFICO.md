# Canone geografico — Rocco & Zara   (DEFINITIVO v1 — non modificare)

Base reale: **corridoio Prealpi → Toscana**. Sopra questa geografia si costruisce solo la trama.
Riquadro: `W 8.80, S 43.10, E 11.70, N 46.25` (WGS84). Rilievo: DEM Terrarium 30 m.

## Terre (quadranti)
Griglia **5×5**, colonne A–E (ovest→est), righe 1–5 (nord→sud). Dettaglio in `regno/atlante.json` / `.md`.
La **fascia abitata** è la diagonale NW→SE; l'origine (incontro Rocco & Zara) è in **B1** (monti del lago).

## Confini naturali
- **Muro delle Alpi** (nord) — il rilievo oltre N 46.25.
- **Mare** (sud-ovest) — quota 0.
- **Terre Liguri** (ovest/sud) — fuori dal regno.
- **Marche dell'Est** (oltre il Garda) — Veneto/Trentino.

## Acque
Laghi: Maggiore, Lugano, Como, Iseo, Idro, Garda. Spina: **il Po** + Adda, Ticino, Oglio, Mincio, Adige, Secchia, Panaro, Reno.

## Rete urbana — le Vie Antiche
**32 città-rovina, 58 vie, 2721 km.** I **valichi** (13) sono le uniche vie di montagna: i passaggi controllabili tra pianura e foresta. Dettaglio in `regno/rete_urbana.json`.

## Pipeline (riproducibile — il dato si rigenera, non si inventa)
- `pipeline/zonegen.py` — mappa + geojson di qualsiasi terra, piena precisione, quota inclusa.
- `pipeline/kingdom.py` — griglia + atlante delle terre.
- `pipeline/rete.py` — rete urbana (Vie Antiche).

**STATO: DEFINITIVO.** La geografia è chiusa. Si tocca solo la trama.
