# Rocco & Zara — *le Terre Annodate*

Una **saga illustrata** per bambini (che l'adulto legge sotto): Rocco e Zara annodano
il **Cordone** di regno in regno, verso le Pietre del Leone. Il progetto è insieme il
**worldbuilding** (canone in `saga/`), il **motore generativo** che lo trasforma in
episodi (`saga/serializzatore/` + `lib/`), la **sala di regia** web (`web/`) e un
**sistema di agenti** che ci lavorano.

> Poggia sui principi del **seme** (`seme/`): *"la verità è nel grafo"* · determinismo
> (stesso `nonce` → stessa storia) · complessità dalla combinatoria, non dall'inferenza ·
> **EAR invisibile** (mai nominato) · **due cancelli umani** (prosa, immagini) ·
> il mondo è **tutto nostro** (il reale resta solo come *sottotesto*, mai in pagina).

---

## Dove siamo (per ripartire dallo stesso punto)

Il canone è **stabile e coerente**, la **stagione è tutta scritta** (trama fattuale), la
pipeline è **eseguibile e blindata**. In `main`, verde (`npm run check`: 29 file di test,
**245 test** + 49 pytest di parità in CI).

**Fatto:**
- 🌍 **Mondo completo** — lessico *Terre Annodate* (`saga/lessico/MAPPATURA.md` +
  `mappa.json` machine-readable), 6 regni, cartografia/faunario/società/voci,
  **cosmologia** (solo-autore), **5 ritornelli**, motore anti-cliché, **stile visivo**
  naturalistico (niente vestiti) + **metafore native**.
- 📖 **Stagione completa (trama fattuale)** — `saga/trama/volumi/VOLUME_1..6.md`
  (6 archi × 4 puntate = ep01–ep24), `SCHELETRO_STAGIONE.md` allineato alla MAPPA_CAST,
  grafo `saga_graph.json` **v0.2.0-stagione** con semi/debiti/soglie/facce della
  Serpe/tracce di Toraki. Decisioni autoriali aperte in `trama/DECISIONI_PROPOSTE.md` (⚠).
- 🎭 **Cast completo** dei 6 archi — `saga/bible/comprimari/` (27+ schede + template + MAPPA_CAST).
- ⚙️ **Motore generativo** — `saga/serializzatore/` (ponte `saga → Seed`, audit di continuità,
  **PCG** condizionata dallo stato, golden/consistency test). Aggancio additivo in `lib/engine.ts` (§6).
  `KIND_SCALE` con la fauna nostra (la doppia scala Rocco↔Zara in scena).
- 🕹️ **Pipeline impugnabile** — `npm run ep -- build|close|audit <episodio>`: dal grafo al
  **writing brief + audit** in un comando, determinismo testato end-to-end (la prosa resta
  cancello umano).
- 🛡️ **Cancelli anti-drift** — linter del canone a 3 passate (`mappa.json` = unica fonte
  nomi+substrato), **quattro gemelli** cast/digest/reference/**geo**-sync, catalog-sync
  del ritrattista, parità Python (`pytest seme/`) in CI.
- 🎬 **Agenti autoriali** — `scenografo`, `illustratore`, `ritrattista`, e da questo giro
  **`prosatore`**, **`cartografo`**, **`manutentore`** in `.claude/agents/`.
- 🖥️ **Sala di regia `web/`** — sito statico, **deployato su Vercel** (legge `saga/…` da GitHub raw).

**Prossimo (vedi `saga/TODO.md`):**
- **Decisioni autoriali** su `trama/DECISIONI_PROPOSTE.md` (Ray) → poi la **prosa del
  Volume 1** col prosatore (`npm run ep -- build ep01` → sessione pagina-per-pagina).
- **Fase A** (segni distintivi + palette) → sblocca le reference visive.
- Pendenti puntuali: nomi `<dal lessico>` delle schede; rifiniture CLI; viewer geo da ricablare.

---

## Mappa della repo

```
saga/                 IL CANONE (worldbuilding, fonte di verità narrativa)
  bible/              protagonisti, comprimari, ritornelli, stile visivo, cosmologia
  cartografia/        i 6 regni, atlante, faunario, società, voci, pipeline (python)
  trama/              spine, scheletro stagione, archi, rotture & spirale
  voce/               CARTA_VOCE (§4 machine-block) + METAFORE
  lessico/            MAPPATURA (reale → nostro, boundary-safe)
  serializzatore/     MOTORE: saga → Seed + PCG + audit (TS, testato)
web/                  sala di regia statica (index.html + app.js + data/) → deploy Vercel
lib/                  harness Scrivia (engine deterministico, comandi, ai/, images/, tipi)
.claude/agents/       gli agenti: orchestratrice + 5 corsie tecniche + 2 autoriali
docs/                 doc-compagni degli agenti (BACKEND, AI_LAYER, SCENOGRAFO, …)
test/                 suite Vitest (parità motore, serializzatore, PCG, layer AI, …)
seme/                 il motore di riferimento (Python) + canone + esempio
app/ components/      l'app Next "scrivia" (harness UI) — ⚠️ deprecata, vedi Deploy
```

## Il sistema agenti

La sessione principale fa da **orchestratrice**: legge il *router* in **`CLAUDE.md`** e
**delega** alla corsia giusta in base all'area toccata. Definizioni in `.claude/agents/`:
- **tecniche** — `frontend` · `backend` · `ai` · `supabase` · `testing`
- **autoriali** — `scenografo` · `illustratore`
- **orchestratrice** — instrada, ratifica, tiene magro il contesto (non si spawna).

Confine d'oro: `lib/` è la *single source of truth* (non si tocca per l'estetica);
al confine le corsie **dialogano**. Dettaglio: `.claude/agents/README.md`.

## Workflow (regola madre)

**Ogni cambiamento** passa da **feature branch → Pull Request → (check verde) → merge**.
Mai un merge diretto su `main`. La **CI** gira sulla PR; si mergia solo a verde.

```bash
npm install
npm run check    # il gate JS della CI: vitest (incl. linter canone + cast sync) + typecheck + build
npm run ep -- build ep_demo --graph saga/serializzatore/fixtures/saga_graph.demo.json
                 # la pipeline in un comando: seed.json · node.json · brief.md · audit.json
python3 -m pytest seme/tests -q   # parità Python (il secondo job della CI)
npm test         # solo la suite Vitest
node web/tools/build_cast.mjs   # rigenera l'indice del cast per la sala di regia
```

## Deploy

- **Sala di regia `web/`** → progetto **Vercel** statico. `vercel.json` del root è
  ripuntato su `web/` (`framework: null`, `outputDirectory: web`, no build). I dati
  `saga/…` arrivano da **GitHub raw `main`** (fallback automatico dell'app).
- **App Next `scrivia`** (`app/`, `lib/…` UI) — **deprecata** come deploy: la CI la builda
  ancora, ma non è più pubblicata. Se e come consolidarla/rimuoverla → `saga/TODO.md` (F3).

### Variabili d'ambiente (solo quando si collegano le IA)
Vedi `.env.example`. Le chiavi vivono nelle env, mai nel repo, lette **a runtime** sul server.
```
ANTHROPIC_API_KEY=   # layer AI (prosa, seeding, critic)
DEEPSEEK_API_KEY=    # layer AI (alternativo)
OPENAI_API_KEY=      # immagini
```

## In dubbio

Le regole per sviluppare/manutenere stanno in **`CLAUDE.md`** (router + principi + workflow).
Il piano operativo, item per item, in **`saga/TODO.md`**. Un passo alla volta.
