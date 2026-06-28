# SPEC — il serializzatore `saga → Seed` (precisa, implementabile)

> Stato: **specifica per implementazione** (M2). Scritta per un agente che vede la repo.
> Compagna breve: `README.md` (panoramica). Questo file è il **contratto preciso**.
>
> **Cos'è.** Il serializzatore è l'**unico pezzo tecnico mancante** e l'unica vera *deriva*
> da Scrivia: il ponte che legge il **livello-saga** (`saga/`) e produce un **`Seed`** che il
> **motore Scrivia** (`lib/`) già sa rendere. Scrivia nasce per *una* storia (un seme → un libro);
> noi abbiamo aggiunto un layer-saga (mondo, cast, spina, voci, grafo episodi) che Scrivia non aveva.
> Il serializzatore traduce quel layer nel contratto del motore — e porta lo **stato fra episodi**
> (ciò che una storia singola non aveva).

---

## 0. Regola d'oro e confine

1. **Non si riscrive il motore.** Il serializzatore **consuma** Scrivia via i suoi contratti
   (`lib/types.ts`, `lib/engineTypes.ts`, `lib/engine.ts → buildNode`). Vive in un **modulo nuovo**
   (proposta: `saga/serializzatore/src/`), non dentro `lib/`.
2. **Una sola estensione-motore è prevista e sanzionata** (lo dice già il `README.md`): far sì che
   `buildNode` **legga i contenuti-saga dei semi** (`seed_contents`, `debt_content`, `recurring_motif`)
   invece di lasciarli segnaposto. È additiva e retro-compatibile (vedi §6). Nient'altro in `lib/`.
3. **Il determinismo è sacro.** `seed_nonce` è l'invariante: stesso episodio + stesso canone →
   stesso `Seed` → stessa resa. La serialità non rompe il motore (vedi §8).

---

## 1. Il flusso, in una riga

```
saga_graph (episodio N) + canone fisso (bible/cartografia/voce) + stato a N (fold dei delta)
        │
        ▼   [ IL SERIALIZZATORE ]
   SeedExt (lib/types.ts + engineTypes.ts)         ← un JSON, fully-populated
        │
        ▼   [ MOTORE SCRIVIA, invariato ]
   buildNode → extractHooks → buildBrief → (prosa) → (audit) → book
```

Il serializzatore fa **tutto il ragionamento-saga** e emette un **`SeedExt` standard**. Il motore
non sa nulla della saga: riceve un seme completo. (Pipeline reale: `lib/stages.ts`,
`lib/commands.ts` — il `Seed` diventa `story.seed` e il comando `node` fa
`buildNode → buildPagePlan → buildBrief`.)

---

## 2. Contratti di INPUT (lato `saga/`)

Tutti `read-only` per il serializzatore. Percorsi reali nella repo:

| Cosa | File | Uso |
|---|---|---|
| **Grafo episodi** | `saga/trama/saga_graph.json` | i nodi-episodio (schema: `saga/trama/schema_episodio.md`), i registri `seeds`/`callbacks`/`debts`/`creatures`/`world_state_baselines`, gli `arcs`. *(oggi stub: si popola in M1)* |
| **Canone normativo** | `saga/saga_config.yaml` | enum/vincoli/quote/protagonisti/missione/cartografia/continuity. **Unica fonte di verità per gli enum**: importare, mai duplicare. |
| **Canone fisso — personaggi** | `saga/bible/{rocco,zara,toraki}.md` + `saga/bible/comprimari/*.md` | aspetto bloccato + il blocco-macchina ```yaml voce_personaggio``` (= `CharacterVoice`) e `registro_gruppo` (Tier 1). |
| **Voci di gruppo** | `saga/cartografia/regni/_voci.json` | `regni[n].voci[<Gruppo>]` + `trasversali[...]`; il Tier 1 per chi non ha Tier 2. |
| **Voce narratore** | `saga/voce/CARTA_VOCE.md` (blocco YAML §4) | per `seed.voice` (assi) e `seed.narratorBrief`. |
| **Mondo** | `saga/cartografia/...` (`CANONE_GEOGRAFICO.md`, `regni/`, `_faunario`, `luoghi_antichi`) | `world_flavor`, `setting`, creature d'episodio, Luoghi Antichi. |
| **EAR** | `saga/ontologia/COME_SI_APPLICA.md` | `attribute_dominant` / `deployment_level` (i tre verbi: distinguere/connettere/cambiare). |
| **Nomi** | `saga/lessico/MAPPATURA.md` | risolve i `<dal lessico>` delle schede in nomi propri *(passata finale; fino ad allora i segnaposto sono ammessi)*. |

### 2.1 Lo schema del nodo-episodio (riassunto operativo)
Da `saga/trama/schema_episodio.md`. Campi che il serializzatore **legge** per ogni episodio:
`id, title, arc, type, order_in_journey · regno, zona, bioma, center, route_from, location_primary,
locations_secondary · attribute_dominant, premise, problem, threshold_moment, resolution_mode,
closure_type, entry_point_type, register, estimated_length · episode_creature · seeds_planted,
seeds_bloomed, callbacks, debts_opened, debts_closed · luogo_antico, nodo_cordone, toraki_trace,
serpe_face · effects{growth,fear,relation,world,seeds_*,debts_*,creature_status} · palette_emotiva,
voice_notes_essential, active_constraints_touched`.

---

## 3. Contratto di OUTPUT (lato motore): `SeedExt`

Il serializzatore emette un **`SeedExt`** (`lib/engineTypes.ts`), cioè il `Seed` di `lib/types.ts`
più i campi additivi che il motore legge. `buildNode(seed)` lo espande deterministicamente.

### 3.1 Mappatura campo-per-campo (episodio + canone + stato → `SeedExt`)

| `SeedExt` | Da dove | Note |
|---|---|---|
| `language` | `saga_config.saga.language` | "it". |
| `title` | `episode.title` | |
| `protagonist {name, age, kind, entityId}` | il **POV** dell'episodio (vedi §3.2) | `name`/`kind`(specie) da `bible`; `age` nominale da `bible` (il register è comunque sovrascritto); `entityId` dal **registro entità** (§5). |
| `companions[] {name, kind, entityId}` | l'**altro** protagonista + il cast presente (`serpe_face`, comprimari, eventuale `episode_creature` se parla) | `kind` da `bible`/`cartografia`; `entityId` dal registro entità. |
| `world_flavor` | `regno` + `zona` + `bioma` (cartografia) | stringa breve di sapore (deterministica dal regno/zona). |
| `setting {primary, notes, entityId}` | `primary` = `location_primary` risolto; `notes` = contesto `zona`/`bioma`; `entityId` = `center`/luogo | |
| `theme` | `episode.theme` *(da aggiungere)* o derivato da `arc`+EAR | guida `theme_to_attribute` del motore se `overrides.attribute_dominant` assente. |
| `pugno` | `episode.pugno` *(da aggiungere)* o da `palette_emotiva` | il "pugno" emotivo. |
| `personal_detail` | `episode.personal_detail` *(da aggiungere)* | il *singolo* dettaglio (CARTA_VOCE: «concreto a tratti singoli»). |
| `length_pages` | `saga_config.episode_spine.pages_default` (12) o `estimated_length/≈words_per_page` | il motore clampa a [pages_min,pages_max]. |
| `packs` | `[]` (o pacchi a livello-saga, se mai) | |
| `spine {premise, problem, threshold_moment, resolution_mode, closure}` | omonimi da `episode`; `closure` = stringa descrittiva della chiusura | il **numero** `closure_type` va in `overrides` (sotto), non qui. |
| `voice` (`VoiceOverrides`) | `CARTA_VOCE` (assi: temperamento/ritmo/distanza/lente_sensoriale/umorismo) + `voice_notes_essential` | baseline R&Z + indirizzo per-episodio. |
| `nonce` | **deterministico** dall'episodio (§8) | mai `null` in produzione-saga. |
| `characterVoices[]` (`CharacterVoice`) | risoluzione voci di ogni personaggio presente (§4) | alimenta `lib/brief.ts` (già lo consuma: archetype/underStress/ritmo/words/never). |
| `narratorBrief` | `CARTA_VOCE` reso per l'episodio + note voce | `lib/brief.ts` lo consuma. |
| `overrides {attribute_dominant, deployment_level, entry_point_type, closure_type, register, time_span_arc}` | `attribute_dominant`=`episode.attribute_dominant`; `entry_point_type`=`episode.entry_point_type`; `closure_type`=`episode.closure_type`; `register`=`episode.register`; `time_span_arc`=mappa da `episode.type`/arco; `deployment_level`=da `ontologia` | sono i **knob** che pilotano `buildNode` (altrimenti campiona). |
| `season` | dallo **stato del mondo** (la stagione avanza lungo il viaggio) | il motore usa `seed.season \|\| random`: fornirla rende deterministica la palette. |
| `has_sage_figure` | `true` se un comprimario "saggio" è presente (custode/antico) | abilita `closure_type` 1 nel motore. |
| `seed_contents[]` | i **semi piantati qui** (`episode.seeds_planted` → `saga_graph.seeds[id].what`) | **richiede l'estensione §6** per finire in `seeds[i].what`. |
| `recurring_motif` | il ritornello/motivo dell'arco attivo qui (`bible/ritornelli.md`) | **§6**. |
| `debt_content` | un debito aperto **portato** qui (dallo stato, §7) | **§6**. |
| `protagonist/companions/setting .entityId` | **registro entità** (§5) | la coerenza visiva "da serie". |

### 3.2 POV per episodio (alternanza del fuoco) — **DECISIONE**
`Seed.protagonist` è **uno** solo; Rocco e Zara sono **entrambi** in scena. Regola proposta:
l'episodio porta un campo `pov: rocco|zara` (default per arco, dalla *alternanza del fuoco* in
`MAPPA_CAST.md`: arco1 Zara · arco2 Rocco · arco3 Rocco-casa · arco4 Zara · arco5 entrambi · arco6
finale). Il POV → `protagonist`; l'altro → primo `companion`. *(Confermare la regola.)*

---

## 4. Risoluzione delle VOCI (personaggio → `CharacterVoice`)

Per **ogni** personaggio presente nell'episodio, il serializzatore produce un `CharacterVoice`:

1. **Protagonisti** (`rocco`,`zara`,`toraki`): dal blocco-macchina in `saga/bible/<id>.md`.
2. **Comprimari con Tier 2** (ricorrenti): dal blocco ```yaml voce_personaggio``` della loro scheda
   in `saga/bible/comprimari/*.md` (campi 1:1 con `CharacterVoice`: `name,role,archetype,underStress,
   ritmo,words,never`). **34 schede già pronte e validate.**
3. **Comprimari di solo passaggio (solo Tier 1)**: **sintetizzare** un `CharacterVoice` dal
   `registro_gruppo.registro_ref` → `_voci.json` (`regni[n].voci[<Gruppo>]` o `trasversali[...]`):
   `archetype`/`ritmo`/`words` dal `registro`/`tratti`/`esempio_in_voce` della classe; `role:"comprimario"`.
4. **Nomi**: i `<dal lessico>` si risolvono via `saga/lessico/MAPPATURA.md`. Finché la passata-nomi
   non è fatta, è ammesso un nome-segnaposto stabile (es. l'handle della scheda).

> Mappa "personaggio dell'episodio → scheda": il serializzatore ha bisogno di un **indice**
> `cast_id → file-scheda`. Proposta: generarlo dal front-matter/percorso delle schede in
> `bible/comprimari/`, oppure da un campo `cast[]` nel nodo-episodio che elenca gli id presenti.
> *(`serpe_face` e `episode_creature` danno già due id; gli altri vanno elencati nell'episodio.)*

---

## 5. Binding ENTITÀ — il registro di reference (coerenza "da serie")

Il motore ha il **Passo 0** (`lib/reference.ts`): `deriveEntities(node)` ricava le entità, l'umano
conferma una **reference** per ognuna, e lo stato vive in `story.entities`. In Scrivia questo è
**per-storia**. Per una *saga*, la reference di Rocco va confermata **una volta** e **riusata** in
ogni episodio (Rocco è sempre Rocco).

**Estensione saga-side (nessuna modifica a `lib/`):** un **registro entità persistente**
(proposta: `saga/serializzatore/state/entities.json`) che mappa `entityId → descrittore + reference
confermata`, per: i 3 protagonisti, i comprimari ricorrenti, i 6 regni/zone-cardine, i Luoghi
Antichi, gli oggetti-canone (il Cordone). Il serializzatore:
- assegna a `protagonist/companions/setting` l'`entityId` stabile dal registro;
- **pre-popola** `story.entities` dell'episodio con le reference già confermate (così il Passo 0 non
  le richiede di nuovo); chiede conferma **solo** per entità nuove (una creatura inedita).

> `entityId` stabile = `slug(nome)` o un id esplicito; dev'essere **identico** fra episodi. È ciò che
> garantisce che il motore alleghi sempre la stessa reference.

---

## 6. L'unica estensione-motore (additiva, retro-compatibile)

**Problema.** `buildNode` (`lib/engine.ts`) genera la *struttura* dei semi/debito/motivo in modo
deterministico, ma ne lascia il **contenuto** come segnaposto:
- `seeds[i].what = "[${kind}]"` (riga ~170)
- `debt.what = "[${dk}]"` (riga ~176)
- `recurring.motif = "[motivo]"` (riga ~182)

I campi `SeedExt.seed_contents` / `debt_content` / `recurring_motif` **esistono in `engineTypes.ts`
ma non sono cablati**. Per iniettare la **continuità-saga** (un seme con un contenuto vero che torna
fra episodi) servono 3 letture additive in `buildNode`:

```ts
// dentro buildNode, dopo aver generato seeds/debt/recurring:
const contents = seed.seed_contents ?? [];
seeds.forEach((s, i) => { if (contents[i]) s.what = contents[i]; });        // semi-saga
if (debt && seed.debt_content) debt.what = seed.debt_content;               // debito-saga
if (recurring && seed.recurring_motif) recurring.motif = seed.recurring_motif; // ritornello-saga
```

**Garanzie:** puramente additivo (se i campi mancano → comportamento attuale identico, i segnaposto
restano); **non cambia l'RNG** né il numero/posizione dei semi → **determinismo intatto**, parità coi
test esistenti preservata. È *esattamente* l'estensione che il `README.md` prevedeva.

*(Opzionale, da decidere: allineare anche `nSeeds`/`kinds` ai semi che l'episodio dichiara di
piantare, invece del conteggio canonico. Più invasivo; default consigliato: **no** — il serializzatore
fornisce i contenuti nell'ordine, il motore tiene struttura/quote. Confermare.)*

### 6.1 Semi che **fioriscono** qui (piantati prima)
I semi `seeds_bloomed` (piantati in un episodio precedente) **non** sono echi intra-nodo. Si gestiscono
a livello-saga: il serializzatore li accoda al **`narratorBrief`/brief** come nota di pagamento
(«paga qui il seme `X` piantato in Ep`N`: <contenuto>») e l'**audit** (§9) ne verifica la chiusura.
Così il modello intra-episodio del motore resta intatto e la continuità lunga passa dal brief.

---

## 7. Lo STATO fra episodi (fold / snapshot / recap)

Fonte: `saga/trama/continuita_e_anti_drift.md`. Tre registri: **canone fisso** (bloccato), **stato
evolutivo** (nel grafo, cambia per soglie), **resa** (output, non verità).

- **Delta per episodio**: `episode.effects` (growth/fear/relation/world/seeds_*/debts_*/creature_status).
- **Stato a N** = `fold(effects₁ … effects_{N-1})`: riduzione **deterministica**; entrano **solo** i
  delta con `threshold_crossed: true` (il resto è "colore"). Snapshot **piccolo, ricostruibile**.
- **Orizzonte attivo**: un solo arco (6–10 episodi). Contesto = canone fisso + snapshot a inizio-arco
  + grafo dell'arco + semi/debiti aperti. Tutto il resto è **archiviato**.
- **Recap d'arco**: a chiusura arco, `fold` dei delta → **recap canonico** = nuova baseline; i delta
  di dettaglio vanno in archivio (`saga_graph.world_state_baselines`).

**Forma dello snapshot** (proposta, machine-readable):
```jsonc
{ "at_episode":"ep12","arc":"arco_conca",
  "protagonists":{ "rocco":{"vergogna_corno":"+3(soglia)"}, "zara":{"troppo_piccola":"+2"} },
  "fears":{...}, "relations":{...}, "world":{ "<place>":"<stato>" },
  "open_seeds":[{"id":"seed_pegno","planted":"ep03","bloom_target":"ep05","what":"..."}],
  "open_debts":[...], "recurring_creatures":[{"id":"...","returns":2}],
  "cordone":{ "nodi_annodati":["laghi_occidente"], "prossimo":"laghi_oriente" } }
```

---

## 8. Determinismo (`seed_nonce`)

`nonce` deterministico per episodio, p.es. `hash(episode.id + saga_graph.graph_version)`
(o campo `episode.seed_nonce` fissato). Stesso episodio + stesso canone → stesso `Seed` → stesso
nodo/brief/immagini. Cambiare il `graph_version` è il modo **esplicito** per ri-tirare i dadi su una
puntata. *(Scegliere la derivazione e fissarla — DECISIONE.)*

---

## 9. Componenti (firme TypeScript proposte)

Modulo `saga/serializzatore/src/`. Importa `lib/types.ts`, `lib/engineTypes.ts`, e per validare
`lib/engine.ts` (`buildNode`). Legge `saga/` (YAML via `yaml`, JSON, e un parser dei blocchi
```yaml``` nelle schede `.md`).

```ts
// 1) contesto-saga a N: fold dei delta + canone fisso + aperti
buildSagaContext(graph: SagaGraph, n: number): SagaContext;   // { snapshot, openSeeds, openDebts, fixedCanon }

// 2) il cuore: episodio + contesto → SeedExt completo
buildSeed(episodeId: string, graph: SagaGraph, ctx: SagaContext,
          canon: Canon /* bible+cartografia+voce+config+entities */): SeedExt;

// 3) audit di continuità (pre/post episodio, fine arco) → verdetto livello-saga
auditContinuity(episodeId: string, graph: SagaGraph, ctx: SagaContext): SagaVerdict; // ~ CriticVerdict

// 4) applica gli effects allo stato; a fine arco genera il recap/baseline
applyEffects(graph: SagaGraph, episodeId: string): SagaGraph;
recapArc(graph: SagaGraph, arcId: string): { recap: ArcRecap; graph: SagaGraph };
```

**Flusso d'uso (per episodio N):** `ctx = buildSagaContext(graph, N)` → `auditContinuity(...)` (pre)
→ `seed = buildSeed(epN, graph, ctx, canon)` → *[motore: `buildNode(seed)` → … → book]* →
`applyEffects(graph, epN)` → (a fine arco) `recapArc`. Output del passo-seed: un **`SeedExt` JSON**
che diventa `story.seed` (cfr. `lib/commands.ts`).

---

## 10. L'audit (il guardiano della linea del tempo)

`auditContinuity` (ruolo dell'`audit` di Scrivia, esteso al tempo). Controlli, da
`continuita_e_anti_drift.md` + quote da `saga_config.yaml`:
- **coerenza col canone fisso** (aspetto/voci/luoghi non derivano — anti drift di carattere);
- **coerenza con lo snapshot** (l'episodio non smentisce lo stato a N);
- **semi pagati** (ogni `seeds_planted` ha un `bloom_target`; gli scaduti = flag);
- **debiti chiusi** entro la finestra;
- **soglie ben formate** (un `threshold_crossed:true` ha un episodio che lo *guadagna*);
- **quote di saga** (`saga_quotas`: ritorni-creatura ≤4, varietà tipi-episodio in finestra, tetti
  lessicali; più i vincoli `world_rules`: niente New Age, animali naturalistici, i "primi" mai
  nominati/mostrati).
Output: `SagaVerdict` (PASS/FAIL + flag per episodio), stile `critic_verdict.json`.

---

## 11. Struttura file proposta

```
saga/serializzatore/
  README.md            # panoramica (esiste)
  SPEC.md              # questo file
  src/
    index.ts           # entry: serializeEpisode(episodeId) → SeedExt
    buildSeed.ts       # §3 la mappatura
    sagaContext.ts     # §7 fold/snapshot
    voices.ts          # §4 risoluzione voci (Tier2 / Tier1 da _voci.json)
    entities.ts        # §5 registro reference persistente
    audit.ts           # §10
    canon.ts           # caricatori: yaml/json/md-blocks (bible, cartografia, _voci, CARTA_VOCE, config)
    types.ts           # SagaGraph, EpisodeNode, SagaContext, SagaVerdict (lato-saga)
  state/
    entities.json      # §5 registro reference (entityId → descrittore + ref confermata)
  fixtures/            # §12
  test/                # §12
```
Runtime: **TypeScript/Node** (coerente con la repo; `package.json`, `vitest`). Dipendenze già presenti
(`yaml` se serve). **Niente** dentro `lib/` salvo §6.

---

## 12. Test & fixtures (golden, deterministici)

1. **Golden episode → Seed**: una fixture `ep_demo` (episodio completo) → `SeedExt` atteso
   (snapshot test). Verifica la mappatura §3 e la risoluzione voci §4.
2. **Determinismo**: stesso episodio + stesso `graph_version` → `Seed` byte-identico; cambiando
   `graph_version` cambia il `nonce` (e solo quello a monte).
3. **Fold**: 3 episodi con `effects` → snapshot atteso; solo i `threshold_crossed:true` entrano.
4. **§6 motore**: `buildNode(seedConContenuti)` mette i `what`/`motif` reali; `buildNode(seedSenza)`
   resta ai segnaposto (parità coi test motore esistenti — `npm run check` deve restare verde).
5. **Audit**: episodio che lascia un seme non pagato / supera una quota → `FAIL` con flag giusto.

---

## 13. Prerequisiti & coordinamento

- **M1 (prerequisito dati):** `saga_graph.json` popolato con **Ep01 + il primo arco** (oggi è stub).
  *La spec e il codice si possono però costruire **subito** contro lo **schema**, con le fixtures §12.*
- **KIND_SCALE** (`lib/stylesheet.ts`): la nostra fauna (Rocco enorme / Zara piccola) per la scala
  visiva — **task coordinato lato-motore** (rientra nell'eccezione §0.2, è un dato non logica). Non è
  il serializzatore: va aggiunto in parallelo perché i prompt-immagine rendano la doppia-scala.
- **Voci**: 34 schede pronte; resta la **passata-nomi** (`lessico/MAPPATURA.md`) — non blocca il
  serializzatore (segnaposto stabili ammessi).

---

## 14. DECISIONI da confermare (prima dell'implementazione)

1. **POV per episodio** (§3.2): campo `pov` + default *alternanza del fuoco*. ✔/✗?
2. **Origine di `theme`/`pugno`/`personal_detail`**: campi nuovi nel nodo-episodio o derivati? (proposta: campi nuovi, opzionali, con fallback derivato).
3. **Derivazione del `nonce`** (§8): `hash(id+graph_version)` o `seed_nonce` fissato nel nodo?
4. **§6 opzionale**: allineare anche conteggio/kind dei semi all'episodio, o solo i contenuti? (proposta: solo contenuti).
5. **Indice cast** (§4): elenco `cast[]` nel nodo-episodio, o indice generato dalle schede?
6. **Posizione del registro entità** (§5): `saga/serializzatore/state/entities.json` o riuso di `story.entities` seminato?
7. **`terminus`**: `saga_config` lo dà `toscana` *(DA CONFERMARE — alt: anello a Spondalta)*: incide su Ep-finale e binding Toraki.

> Una volta confermate, l'agente fresco implementa §9 contro §3/§4/§5/§7, aggiunge l'estensione §6
> (con test di parità), e consegna le fixtures §12. Poi **check insieme**.
