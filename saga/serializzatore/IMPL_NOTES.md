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

## Strato PCG — condizionamento dallo STATO (src/pcg.ts)

`buildSeed` era un mappatore di campi (passava gli override DICHIARATI; nonce = id@graph_version;
lo snapshot non condizionava nulla). `src/pcg.ts` aggiunge il condizionamento provato nel PoC,
**deterministico, zero LLM**, consumando lo snapshot che `sagaContext` produce già. Si innesta con
**una riga** in `buildSeed` (`return applyPcg(seed, ep, ctx, graph, canon)`).

Tre cose:

1. **Nonce dallo stato** (`deriveNonceFromState`, SPEC §8 forma piena) — la firma di stato (bande +
   relazione + cordone + quarto-di-viaggio + semi aperti) entra nel nonce. Stessa puntata a stati
   diversi → seed diverso; stesso stato → byte-identico. Sovrascrive `deriveNonce`.
2. **Bande → indirizzo focal** (`bandOf` + `focalDirections`) — la banda (prima/attraversa/dopo) si
   legge dagli attraversamenti accumulati nello snapshot; il verbo-guida viene dal **repertorio**.
3. **Convergenza** (`convergence`) — più fili aperti (seme che fiorisce + attraversamento di crescita
   + nodo del Cordone) che ATTERRANO sullo STESSO beat di soglia, consegnati al brief come un'unica
   immagine. È la fase NODO (◇) della risonanza ∿ del kernel AILA resa operativa. Seme **semantico**
   (porta il contenuto), non posizionale.

### Dove vive il repertorio (decisione)
Il repertorio banda→verbi è **qualitativo** → vive nella **bible**, come blocco-macchina
`repertorio_crescita` (fratello di `voce_personaggio`), letto da `canon.ts` (`sheetFromBlock`) e
tipizzato in `CharacterSheet.repertorio_crescita`. **Fuori dal codice**, coerente con la regola
"un dato qualitativo vive nella bible". `pcg.ts` lo legge soltanto; asse senza repertorio → si salta.

### ⚠ SEGNALAZIONI (da decidere con l'autore — non risolte in autonomia)
- **Incoerenza axis-id.** Lo stesso asse ha tre nomi: `saga_config.long_arcs.growth`
  (`vergogna_corno`, `troppo_piccola`), la fixture `saga_graph.demo.json`
  (`vergogna_del_corno`, `guardare_invece_di_fuggire`), la scheda Vol.1 (`la-mole ingombro→riparo`,
  `appartenenza fuori→annodata`, `sguardo fugge→guarda`). Il repertorio è keyed sugli id della
  **fixture** (ciò che lo snapshot produce oggi). Va **canonicalizzato** un solo set di axis-id; poi
  le chiavi del repertorio e gli `axis` nel saga_graph reale combaceranno.
- **Repertorio = bootstrap dal Vol.1.** I verbi nelle schede sono condensati dalla prosa del Vol.1
  (materiale dell'autore), non da `brief_pcg.py` (non pushato). Da riconciliare quando arriva.

### Test
`test/serializzatore.pcg.test.ts` (vitest): nonce deterministico, sensibilità allo stato,
convergenza (fase node su cardine), bande. Hermetic (fixture via fs, canone minimo).

---

## Risoluzione (branch `claude/pcg-fix-e-test`, in review)

La review ha verificato la branch sulla suite piena (cosa che il PoC non aveva fatto) e ha trovato/risolto:

1. **2 test rossi** (`serializzatore.seed.test.ts`): `applyPcg` cambia legittimamente l'output di
   `serializeEpisode` — il **nonce** (ora dallo stato) e il `narratorBrief` (nota di convergenza). Quindi:
   - la **golden** `ep_demo.seedext.json` è stata **rigenerata** dalla fonte canonica;
   - il test del **nonce §8** è stato aggiornato dal vecchio contratto `fnv1a32(id@graph_version)` a quello
     nuovo (forma piena: derivato dallo stato, deterministico, esplicito `seed_nonce` vince).

2. **Incoerenza axis-id risolta** verso `saga_config` (fonte di verità per gli enum): `repertorio_crescita`
   (bible) e `effects.growth` (fixture) ora usano `vergogna_corno` / `troppo_piccola`. Effetto: l'**indirizzo
   focal si accende** (prima saltava in silenzio) e la convergenza di `ep_demo` sale a 3 fili (seme +
   attraversamento di Zara, ora combaciante, + nodo del Cordone).
   - ⚠ **Da ratificare (autoriale):** per Zara l'autore aveva usato `guardare_invece_di_fuggire` (l'azione-EAR);
     allineato a `troppo_piccola` (la ferita, in `saga_config`). I verbi reggono come manifestazione (fuggire =
     troppo piccola; restare = giusta misura). Se preferisci il framing-azione, rinomina **l'asse in
     `saga_config`** (un solo punto) e basta — la chiave resta una sola.

3. **Guardie nuove** (`serializzatore.pcg.consistency.test.ts`): coerenza axis-id config↔bible↔fixture
   (avrebbe preso il baco), e2e che il focal si accende, convergenza nulla sotto i 2 fili. Suite: 221 verde; tsc puliti.

Resta aperta l'altra segnalazione del PoC (repertorio: bootstrap dal Vol.1 / riconciliare con `brief_pcg.py`).
