# `serializzatore/` — il collante `saga → Seed` (spec, M2)

Il ponte tra il **livello-saga** e il **motore Scrivia**. Non c'è codice ancora: questa
è la **specifica** di cosa farà.

## Cosa fa

1. **Traduce un nodo-episodio in un `Seed`** di Scrivia (`lib/types.ts`). I campi che
   il motore già conosce (spina, `closure_type`, `entry_point_type`, `register`,
   pagine…) mappano 1:1. Le **voci** e l'**aspetto** di Rocco/Zara e i **luoghi**
   arrivano **bloccati** da `bible/` e `cartografia/`: il motore *rende*, non reinventa.
2. **Costruisce il contesto-saga dell'episodio N**: lo **snapshot di stato a N**
   (`fold` dei delta degli episodi precedenti, vedi `trama/continuita_e_anti_drift.md`)
   + i **semi/debiti aperti** rilevanti + il **canone fisso**. Compatto: non rilegge le
   puntate precedenti.
3. **Esegue l'audit di continuità** (prima/dopo l'episodio, a chiusura d'arco):
   coerenza col canone e con lo stato, semi pagati, debiti chiusi, soglie ben formate,
   quote di saga. Verdetto in stile `critic_verdict.json`, a livello-saga.
4. **Aggiorna lo stato**: applica gli `effects` dell'episodio, e a fine arco genera il
   **recap canonico** (nuova baseline) archiviando i delta di dettaglio.

## Firme (contratto M2) — `canon` è input ESPLICITO

Tutte le funzioni ricevono il **canone fisso** (`canon`) come **ultimo argomento**: è il
sacchetto già assemblato da `lib/canon.json` + `saga_config.yaml` +
`cartografia/regni/_voci.json` + i blocchi-macchina delle bibbie +
`serializzatore/state/entities.json`. (Prima la firma del context-builder non lo prevedeva:
gap chiuso.)

```ts
buildSagaContext(graph, n, canon) -> { snapshot, openSeeds, openDebts, fixedCanon }
buildSeed(episodeId, graph, ctx, canon) -> SeedExt   // ctx = output di buildSagaContext
auditContinuity(episodeId, graph, ctx) -> SagaVerdict // { verdict:"PASS"|"FAIL"|null, checks:[{key,label,pass,note}], page_flags }
applyEffects(graph, episodeId)                        // aggiorna lo stato
recapArc(graph, arcId)                                // baseline canonica di fine arco
```

- **`nonce`**: automatico = `fnv1a32("${id}@${graph_version}")`; override manuale con
  `seed_nonce` sul nodo. La `graph_version` ri-tira l'intera resa.
- **Estensione §6 del motore**: `seed_contents` / `debt_content` / `recurring_motif`
  riempiono i contenuti (il motore tiene **conteggio e ritmo**, i contenuti arrivano dal
  grafo). Additiva: senza i campi il comportamento non cambia.

## Confine col motore (regola d'oro)

Non tocca `lib/` di Scrivia. Lo **consuma** via i suoi contratti (`Seed`, comandi,
tipi). L'unica estensione lato motore prevista: far accettare al `Seed`/engine un
**contesto-saga** (canone bloccato + semi da raccogliere + beat d'arco) — quasi tutto
come input del brief, dato che il motore è deterministico e l'LLM rende solo la prosa.

## Riproducibilità

Il `seed_nonce` resta l'invariante: stesso nodo-episodio + stesso canone → stesso
`Seed` → stessa resa. La serialità non rompe il determinismo del motore.

> Implementazione: M2. Prerequisiti: M1 (`saga_graph.json` con Ep01 + primo arco) e la
> chat geografia (luogo/centri).
