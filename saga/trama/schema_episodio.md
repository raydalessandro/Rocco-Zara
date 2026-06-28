# Schema di un nodo-episodio (in `saga_graph.json`)

Erede del nodo-storia di isola, **semplificato dove isola era ridondante** e **esteso**
per il viaggio (posizione, tipo, effects/delta). Ogni episodio ha la **spina
autoconclusiva** *e* la **continuità**.

```jsonc
{
  "id": "ep01",                         // ep01..epNN
  "title": "Due mondi",
  "arc": "arco_origine",                // a quale arco appartiene
  "type": "cardine",                    // stazione | viaggio | cardine | respiro (vedi archi_e_nodi.md §3)
  "order_in_journey": 1,                // posizione lungo la spina del viaggio

  // --- ANCORA NEL MONDO (cartografia: regno + zona + bioma) ---
  "regno": "laghi_occidente",               // uno dei 6 regni-comuni (cartografia/regni/)
  "zona": "soglia",                          // grammatica 7-zone: cuore|spina|bosco|orlo|soglia|vie|rovina
  "bioma": "foresta",                        // reskin OSM: foresta|savana|acqua|roccia|rovina|umido
  "center": "<id luogo/città-rovina>",       // il punto-calamita (zona cuore/soglia o una rovina)
  "route_from": "<id episodio precedente>",  // riprende dove finiva quello
  "location_primary": "<id luogo>",
  "locations_secondary": ["<id>", "..."],

  // --- CAST & POV (decisioni autoriali §14.1 / §14.5) ---
  "cast": ["char_zara", "char_rocco", "char_custode_laghi"],  // id dal registro entità (state/entities.json): fonte dei personaggi presenti
  "pov": "zara",                        // rocco | zara — default MORBIDO dall'arco (canon.pov_default_by_arc), sovrascrivibile qui.
                                        // Guida il BRIEF DI SCRITTURA, NON l'illustrazione (una puntata "di Zara" può essere in terza con entrambi in campo).

  // --- SPINA AUTOCONCLUSIVA (EAR dell'episodio) ---
  "attribute_dominant": "connettere",   // distinguere | connettere | cambiare
  "deployment_level": "mono",           // mono | triadico (quanti attributi vengono schierati)
  "premise": "…",
  "problem": "…",
  "threshold_moment": "…",
  "resolution_mode": "…",
  "closure_type": 7,                    // 1..7 (canone seme)
  "entry_point_type": "B",              // A..F (canone seme)
  "register": "medio",
  "estimated_length": 1000,

  // --- CAMPI AUTORIALI con fallback derivato (decisione §14.2) ---
  // NON inventarli: arrivano da una chat-trama dedicata. Se assenti, il serializzatore deriva un fallback.
  "theme": "appartenenza",              // tema (→ seed.theme)
  "pugno": "…",                          // la frase-pugno / immagine-cardine (→ seed.pugno)
  "personal_detail": "…",               // il dettaglio personale concreto (→ seed.personal_detail)

  // --- RESA: congelamento opzionale (decisione §14.3) ---
  "seed_nonce": null,                   // se valorizzato (numero) "congela" la resa; default null = nonce automatico = fnv1a32(`id@graph_version`)

  // --- VOCE: override opzionale (vedi voce/CARTA_VOCE.md §4.1) ---
  "voice_overrides": null,              // se presente (assi VoiceOverrides del motore) vince verbatim; se null la voce si deriva dall'`indirizzo`

  // --- CREATURA DELL'EPISODIO (il "monster of the week", opzionale) ---
  // dal faunario del regno: specie esclusiva di quel regno (cartografia/regni/_faunario.md)
  "episode_creature": { "id": "…", "species": "…", "first_seen": true, "becomes_recurring": false },

  // --- CONTINUITÀ (la trama di fondo) ---
  "seeds_planted": ["seed_…"],
  "seeds_bloomed": ["seed_…"],
  "callbacks": ["cb_…"],
  "debts_opened": ["debt_…"],
  "debts_closed": ["debt_…"],

  // --- MISSIONE / CORDONE (trama di fondo; vedi trama/SPINE_NARRATIVO.md) ---
  "luogo_antico": "<id del Luogo Antico del regno, se l'episodio lo tocca>",
  "nodo_cordone": { "annodato_qui": false, "regno": "laghi_occidente" },  // true se la puntata salda il nodo
  "toraki_trace": false,                  // l'episodio mostra una traccia del precursore?
  "serpe_face": "<chi incarna la Serpe qui: artiglio|cecca|mastino|sorcio|...>",  // MAI "la Serpe" astratta

  // --- EFFECTS / DELTA (cosa cambia — alimenta il fold anti-drift) ---
  // REGOLA DEL FOLD: entra nello stato canonico SOLO ciò che ha "threshold_crossed": true
  // (vale per growth, fear, relation, world). I delta sotto-soglia sono "colore", non stato.
  "effects": {
    "growth":   [{ "who": "rocco", "axis": "vergogna_corno", "delta": "+1", "threshold_crossed": false }],
    "fear":     [{ "who": "zara",  "fear": "buio", "status": "implicita", "threshold_crossed": false }],
    "relation": [{ "between": ["rocco","zara"], "delta": "incontro", "threshold_crossed": true }],
    "world":    [{ "place": "collina_baobab", "change": "diventa_luogo_condiviso", "threshold_crossed": true }]
  },

  // --- VOCE & VINCOLI (per il brief/prosa; il canone fa il resto) ---
  "palette_emotiva": "…",
  "voice_notes_essential": ["…"],
  "active_constraints_touched": ["…"]
}
```

## Note di disegno (cosa teniamo / cambiamo da isola)

- **Teniamo**: spina (premise/problem/threshold/resolution), `closure_type`/
  `entry_point_type`/`register` (canone seme), semi/callback/debiti, `palette_emotiva`,
  vincoli attivi, hook visivi (vivranno come in Scrivia, generati dal motore).
- **Aggiungiamo**: `arc`, `type`, `order_in_journey`, `center`, `route_from` (il
  **viaggio**); `episode_creature` (il **monster of the week**); `effects/delta` (l'
  **anti-drift** — isola tracciava lo stato sparso nei campi `*_by_story`, noi lo
  rendiamo un blocco `effects` riducibile per `fold`).
- **Snelliamo**: i molti flag booleani di isola (`night_scene`, `pattern_a_active`,
  `when_water_trembles`…) erano specifici di quel mondo. Qui i fenomeni ricorrenti
  (stagioni, eventi del mondo) si dichiarano come **vincoli/quote nel
  `saga_config.yaml`**, non come campi fissi del nodo.
- **Decisioni autoriali §14 (recepite)**: `cast`/`pov` (chi è presente + fuoco morbido),
  `deployment_level`, i campi autoriali `theme`/`pugno`/`personal_detail` (con fallback),
  `seed_nonce` (congelamento resa) e `voice_overrides` (override di voce). La **stagione**
  NON è un campo del nodo: il serializzatore la legge da
  `world_state_baselines[arc].season`. Il `time_span_arc` del motore si deriva dal `type`
  (mappa `type → time_span_arc`); `has_sage_figure` si deriva dal `cast` (un'entità saggia).

> Il nodo è **input del serializzatore**, che lo traduce in un `Seed` di Scrivia
> (`lib/types.ts`). I campi che il motore già conosce (spina, closure, register…) ci
> mappano 1:1; i campi-saga (arc/effects/center) restano nel grafo e guidano il
> contesto-saga, non il `Seed` core.
```
