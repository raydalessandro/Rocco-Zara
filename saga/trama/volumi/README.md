# I volumi della stagione — indice

> **Formato volume (canone):** ~100 pagine · **60–80 illustrazioni** di storia + atlante e
> appendici (come l'Isola) · **4 capitoli** per volume (fondibili a 3, per ritmo).
> **Metodo:** narrazione fattuale (questi file) → grafo (`../saga_graph.json`) → reference
> (Manus) → prosa + tavole. I capitoli qui sono **fattuali, senza voce autoriale**; ⚠ = scelta
> proposta, da ratificare.

| Vol | Titolo | Regno (slug) | Nodo del Cordone | Episodi | Prova |
|---|---|---|---|---|---|
| 1 | [i Laghi del Vespro](VOLUME_1.md) | `laghi_occidente` | le Coppelle | ep01–ep04 | **Zara** (appartenere) |
| 2 | [la Conca Ruggente](VOLUME_2.md) | `laghi_oriente` | le Pietre Incise | ep05–ep08 | **Rocco** (la forza che serve) |
| 3 | [il Gran Ducato](VOLUME_3.md) | `pianura_alta` | — **(Luogo sepolto)** | ep09–ep12 | **Rocco** (casa, la colpa) |
| 4 | [la Piana dei Savi](VOLUME_4.md) | `pianura_bassa` | le Rovine Ordinate | ep13–ep16 | **Zara** (il fondo — MIDPOINT) |
| 5 | [la Selva di Mezzo](VOLUME_5.md) | `selva_di_mezzo` | l'Altare di Roccia | ep17–ep20 | entrambi (il bivio) |
| 6 | [le Terre del Leone di Pietra](VOLUME_6.md) | `toscana` | le Pietre del Leone | ep21–ep24 | finale (**la consegna**) |

**Cinque nodi su sei regni**: il Luogo del Gran Ducato è sepolto sotto Anguicorte — il filo
che manca (⚠ il finale decide se il disegno lo include).

> ⚠ **Incoerenza aperta:** `SCHELETRO_STAGIONE.md` (§ i sei movimenti) non elenca il Gran
> Ducato; la `MAPPA_CAST.md` sì (Arco 3, con 5 schede scritte). Fa fede la MAPPA (geografia +
> `nodi_totali = 5`): **lo SCHELETRO va allineato al merge.**

**Brief a basso costo dal grafo:**
`npm run ep -- build <epNN> --graph saga/trama/saga_graph.json`
(l'audit segnala i campi-spina ancora da dettagliare negli stub: è la checklist della
passata per-episodio).
