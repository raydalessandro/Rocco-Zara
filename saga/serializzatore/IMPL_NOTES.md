# Serializzatore saga → Seed — note di implementazione

Ponte `saga/` → `SeedExt` (lib/engineTypes.ts) che il motore Scrivia, **invariato**, rende
con `buildNode`. Regola d'oro rispettata: `lib/` non riscritto; unica modifica = estensione
**additiva §6** in `lib/engine.ts` (RNG immutato, parità coi test esistenti, `npm run check`
verde).

## Come si usa

```ts
import { serializeEpisode, serializeEpisodeFull } from "./saga/serializzatore/src";

// SeedExt pronto per buildNode():
const seed = serializeEpisode("ep_demo", {
  graphPath: "saga/serializzatore/fixtures/saga_graph.demo.json", // o saga/trama/saga_graph.json
});

// variante completa: { seed, entities (story.entities pre-popolate), audit }
const { seed: s, entities, audit } = serializeEpisodeFull("ep_demo", { /* …opts… */ });
```

Senza `opts` carica canone+grafo dai path reali (`saga/…`) relativi a `process.cwd()`.

## I 4 componenti (§9) e le firme (NON cambiate)

- `buildSagaContext(graph, n) → SagaContext` — fold §7 (stato a N).
- `buildSeed(episodeId, graph, ctx, canon) → SeedExt` — mappatura §3 (il cuore).
- `auditContinuity(episodeId, graph, ctx) → SagaVerdict` — §10 (continuità + quote).
- `applyEffects(graph, episodeId) → graph` / `recapArc(graph, arcId) → {recap, graph}` — §7.

Contratto di output condiviso = `SeedExt` (+ `id`, già letto dal motore come `node.id`).

## Decisioni §14 adottate (= autoriali, confermate)

1. **POV** — campo `pov: rocco|zara`, default **morbido** d'arco (`POV_BY_REGNO` / `arc.pov_default`),
   sovrascrivibile sul singolo episodio. È guida per il **brief di scrittura**, non un vincolo
   sull'illustrazione.
2. **theme/pugno/personal_detail** — campi autoriali con **fallback derivato** (mai inventati:
   arriveranno da una chat-trama). Le fixture usano valori-placeholder dichiarati (qui derivati
   da `palette_emotiva` / `voice_notes_essential` / attributo).
3. **nonce** — auto da `fnv1a32(id@graph_version)`; override manuale opzionale `seed_nonce` sul
   nodo per **congelare** una resa.
4. **semi** — il motore tiene **conteggio e ritmo**; i **contenuti** arrivano da fuori e si
   agganciano via `seed_contents` (§6). Nessuna rigenerazione di conteggio/kind dall'episodio.
5. **cast** — lista esplicita `cast: [...]` (handle) nel nodo = fonte dei personaggi presenti
   (+ l'altro protagonista e `serpe_face`).
6. **registro entità** — store unico tutto-saga: `saga/serializzatore/state/entities.json`.
7. **terminus** — **parametrico** (`config.missione.terminus`): non ci si costruisce sopra né
   il finale né il binding di Toraki.

## Estensione §6 (l'unica modifica a lib/)

In `lib/engine.ts`, dopo la generazione di semi/debito/ricorrenza e **prima** del nodo, blocco
puramente additivo: se `seed.seed_contents` / `seed.debt_content` / `seed.recurring_motif` sono
presenti, sovrascrivono i **soli** segnaposto (`[oggetto]`, `[promessa]`, `[motivo]`). Nessuna
chiamata RNG → determinismo e parità intatti. Test: `test/serializzatore.engine6.test.ts`.

## Incoerenze segnalate (gestite)

- **CARTA_VOCE vs §3** — gli assi-voce del MOTORE (canon.json) sono
  `temperamento/ritmo/distanza/lente_sensoriale/umorismo`; `CARTA_VOCE.md` usa gli assi NATIVI
  R&Z `respiro/luce/narratore/verso`. Soluzione non distruttiva: CARTA_VOCE → `narratorBrief`
  (prosa d'autore, consumata da `lib/brief.ts`); `seed.voice` (VoiceOverrides) resta `{}` e il
  motore campiona deterministico dal nonce, salvo override d'asse-motore espliciti via
  `episode.voice_overrides`. La **luce** è mappata dal bioma dentro il narratorBrief.
- **DATA GAP voci protagonisti** — `bible/{rocco,zara,toraki}.md` non hanno il blocco
  ```yaml voce_personaggio```. Fallback canone sintetizzato in `canon.ts` (`PROTAGONIST_FALLBACK`)
  dai loro campi "Voce"/"non direbbe mai". Se un domani la bible avrà il blocco, quello vince.
- **boundary-safety** — il check anti-New-Age è ancorato a `\b` (così "aura" non scatta dentro
  "paura", né "anima" dentro "animale"). Stessa lezione del bug "il Po" → "Popolo".

## Aperto / prossimi passi

- **M1**: popolare il vero `saga/trama/saga_graph.json` (oggi stub). Il serializzatore lavora già
  contro lo **schema** via la fixture `fixtures/saga_graph.demo.json`.
- **theme/pugno/personal_detail** reali dalla chat-trama (oggi: fallback).
- **`<dal lessico>`**: i nomi-segnaposto dei comprimari (es. `custode-anziano`) diventano nomi veri
  via `lessico/MAPPATURA.md`; `displayNameOf` userà il lessico quando disponibile.
- **deployment_level / season**: oggi lasciati al campionamento deterministico del motore (salvo
  override su nodo); `season` accetta già un pin per-episodio.
