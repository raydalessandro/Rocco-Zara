# TODO — Rocco & Zara (si risolve UNO ALLA VOLTA)

> Punch-list maestra. Il canone attuale è **stabile e coerente** (validato). Da qui si
> procede a piccoli passi, un item alla volta. Ogni item chiuso → idealmente un
> **branch + PR** (regola di `CLAUDE.md`).

## ✅ Fatto / deciso (per non perderlo)
- Geografia **DEFINITIVA**: corridoio Muro del Nord→Terre del Leone di Pietra, 6 regni-comuni, faunario/società/voci, città-rovina.
- `regno/regni.json` allineato al canone narrativo (Rivalba/Forterocca/Leonalba/Selva di Mezzo/Terre del Leone di Pietra).
- **GeoJSON committato** come fonte deterministica; cache gitignorata.
- **Spine narrativo** integrato: Cordone, Luoghi Antichi, Toraki (tigre bianca), la Serpe (antagonista concreto).
- Missione in `saga_config.yaml` + campi nello `schema_episodio`; Toraki nel faunario; bible Rocco deduplicata.
- **Luogo Antico Terre del Leone di Pietra = le Pietre del Leone** (dentro il regno, no tocchi alla geometria).
- Subtesto "i primi" → tenere **vago** (mai esplicitamente umano).
- **Motore anti-cliché** fissato: rotture (Cècca+Sòrcio "Mister Bean", Dotti, Mastino,
  specchio, ribaltamento forte/debole) + spirale (3 assi + "apri un filo, chiudine uno") +
  macchina di variazione → `trama/rotture_e_spirale.md`.
- **5 Ritornelli** fissati (confermati per ora): Cordone (memoria tattile), pietra tiepida +
  segni, ombra di Rocco, tracce di Toraki, la pietra che si lascia tiepida (la consegna /
  finale) → `bible/ritornelli.md`.
- **A1 — stile di saga come canone** + principi di **camera/movimento** → `bible/STILE_VISIVO.md`.
- **Pipeline generativa LIVE** (da "mondo documentato" a "catena eseguibile"):
  - **Serializzatore** `saga→Seed` (motore §6 additivo, parità intatta) + **PCG** condizionata
    dallo stato accumulato, con golden/consistency test → `saga/serializzatore/`. *(chiude B3)*
  - **Cast completo** dei 6 archi (27+ schede comprimari + template + MAPPA_CAST) → `bible/comprimari/`. *(chiude C3)*
  - **Lessico "Terre Annodate"** applicato (mondo tutto nostro; reale solo come sottotesto) → `lessico/MAPPATURA.md`.
  - **Metafore native** (figure solo dal mondo animale) in `voce/METAFORE.md` + `PROSA_SYSTEM`.
  - **Agenti autoriali** scenografo + illustratore (pipeline immagini) → `.claude/agents/`.
  - **Sito `web/`** (sala di regia) deployato su Vercel (statico; `saga/…` via GitHub raw).

---

## Da fare — ordine consigliato

### Fase A — Visivo dei protagonisti  → *sblocca le immagini di reference*
- [x] **A1. Stile di saga come canone.** ✅ fatto → `bible/STILE_VISIVO.md` (stile
      `animali_del_bosco` + palette stagionale + **camera/movimento** vincolanti).
- [ ] **A2. Sistema di segni distintivi** per i personaggi **ricorrenti** (NON per gli
      abitanti generici): un segno **naturale** — cicatrice, orecchio intagliato, macchia
      nel manto, occhio di colore diverso — di rado un piccolo **pegno portato**, **mai
      vestiti**. (I protagonisti sono già unici: Forestieri.) È l'ancora anti-drift visiva.
- [ ] **A3. Palette esatta** di Rocco (e conferma colori Zara/Toraki).
- → *esito: descrittori "Passo 0" pronti per i due protagonisti → si generano le reference.*

### Fase B — Primo nodo giocabile  → *si fa girare il motore*
- [x] **B1. Ep01 nel `saga_graph.json`** — ✅ superato in grande: il grafo è alla versione
      `0.2.0-stagione` con **tutta la stagione** (ep01–ep24, 6 archi), semi/debiti/soglie/
      facce della Serpe/tracce di Toraki cablati. Audit ep01 PASS.
- [x] **B2. (motore) `KIND_SCALE`** — ✅ fatto: `lib/stylesheet.ts` ha la fauna delle Terre
      Annodate (rinoceronte 1.7 ↔ tigre 0.95 in testa), chiavi = specie canoniche di
      `entities.json`/`_faunario.json`. La doppia scala Rocco↔Zara è resa in scena.
- [x] **B3. (motore) Serializzatore M2** — ✅ fatto → `saga/serializzatore/` (ponte `saga→Seed`,
      audit di continuità, PCG condizionata dallo stato, golden/consistency test).
- → *esito: Passo 0 + prime pagine reali sull'Ep01.*

### Fase C — Profondità narrativa
- [ ] **C1. Lessico completo** — tutti i nomi: Cordone, Luoghi Antichi, città-rovina,
      Toraki, cast Serpe (Viscardo/Bissa/Aspide/Mastino/Artiglio/Cècca/Sòrcio), 7 zone,
      principi dei regni. Regola: **concreto/sensoriale**, mai astratto.
- [x] **C2. Terminus** — ✅ deciso: Toraki aspetta alle **Pietre del Leone** (Terre del
      Leone di Pietra); fissato nello `SCHELETRO_STAGIONE.md`.
- [x] **C3. Cast dei regni** — ✅ fatto → `bible/comprimari/` (27+ schede + `MAPPA_CAST.md`).
- [x] **C4. Arco Laghi del Vespro** — ✅ superato dai volumi: la trama fattuale copre
      **tutti** i 6 archi (`trama/volumi/VOLUME_1..6.md`, 4 puntate ad arco).

### Fase D — Mondo / cartografia
- [ ] **D1. Luoghi Antichi → feature geojson** in `zones/` (`kind: luogo_antico`, coord
      reali, `real_ref`) — lavoro del cartografo.
- [ ] **D2. `prompt_immagine_base`** — allineare `regni/INDICE.md` ↔ `regno.json`
      (l'INDICE lo cita, il json ha solo `estetica` + `prompt_scrittura_base`).
- [ ] **D3. `saga_quotas`** — tarare l'anti-ripetizione col procedere delle storie.

### Fase E — GitHub
- [x] **E1. Primo commit** — ✅ fatto; da allora si procede **sempre** branch → PR → (check) → merge.
- [ ] **E2. (opz.) Git LFS** — se le zone si moltiplicano, png/geojson pesanti → LFS.

### Fase F — Consolidamento tecnico ✅ CHIUSA (PR #21 cancelli · #22 CLI · #23 costituzione)
- [x] **F1. Casa del serializzatore.** DECISO: resta in `saga/serializzatore/`, **titolare
      la corsia backend** (src + cli + test), stessa qualità/invarianti di `lib/`. Router aggiornato.
- [x] **F2. Cancelli anti-drift.** ✅ `saga/lessico/mappa.json` = single source (104 nomi +
      17 frasi + `substrato` condiviso script↔linter); `test/canon.lint.test.ts` (3 passate,
      incl. blocchi-macchina nel substrato); `build_cast.mjs --check` + `test/cast.sync.test.ts`;
      job CI `parity-python` (49 pytest di `seme/`). Due bug reali trovati e chiusi nel giro:
      lo script corrompeva il substrato se rieseguito; 5 leak di nomi reali nei campi
      `voce_personaggio` che finivano nel prompt della prosa.
- [x] **F3. Destino di `scrivia`.** DECISO: resta come **harness di sviluppo** (host di
      `/api/ai`+`/api/images`, futura workspace R&Z), non deployata; si rivaluta dopo Ep01
      end-to-end. La dashboard Vercel `scrivia` si può archiviare a mano quando capita.
- [x] **F4. Disciplina bundle.** Regola scritta in `CLAUDE.md` (workflow): bundle basati
      sull'ultimo `main`, piccoli e di corsia.
- [x] **(upgrade) Pipeline impugnabile.** ✅ `npm run ep -- build|close|audit <id>`:
      catena deterministica canone→seed→nodo→brief+audit con 8 test e2e (determinismo
      sha-identico, golden, close sicuro). La prosa resta cancello umano.

### Pendenti puntuali (dai lavori recenti)
- [x] **Continuità semi ep01 (audit)** — ✅ `bloom_target` cablato per tutti gli 8 semi
      (cordone/pietra/segni/luogo_sepolto→ep24, cecca/esattore→ep11, pegno→ep06, quinto→ep22).
      `npm run ep -- build ep01` → **audit PASS 10/10**.
- [x] **Morfologia (geo) nel brief** — ✅ `zones/_digest.json` committato (riproducibile dal
      generatore) → la riga MORFOLOGIA è stabile nel brief; **cancello anti-drift**:
      `geo_digest.py --check` + `test/digest.sync.test.ts` (gemello del cast-sync).
- [x] **Reference batch (fascicolo illustratore)** — ✅ `saga/reference/REFERENCE_BATCH.md`
      committato (riproducibile dal generatore) → **cancello anti-drift**: `genera_batch.py --check`
      + `test/reference.sync.test.ts` (terzo gemello, con cast-sync e digest-sync).
- [x] **Cancello di sync per i geojson di `geo/`** — ✅ fatto: `geo_confini.py --check`
      (invarianti a stdlib puro: manifest↔pack, INDICE dentro bbox+poligono del regno,
      celle ricalcolate, join `riferimenti_trama`/`centri`↔INDICE) + `test/geo.sync.test.ts`
      (**quarto gemello**). Il check ha subito trovato e chiuso un micro-drift: 5 capitali
      in `centri.geojson` arrotondate a 5 decimali vs INDICE → riallineate al byte.
- [ ] **Viewer geo morto** (corsia cartografo): `saga/cartografia/viewer/` fetcha
      `../island.geojson` che non esiste (residuo isola). Da ricablare sul geo pack
      (`geo/*.geojson`) o rimuovere.
- [ ] **Prosa — debiti tracciati (dalla verifica dei 20 capitoli, corsia prosatore):**
  - [x] **METAFORE §2 — «molo» della Conca** ✅ CHIUSO (decisione d'autore: *si tiene molo*).
    Formalizzata l'eccezione in `METAFORE.md` (§3 «molo *tranne la Conca*» + §4 «il molo delle
    conche di Forterocca»): doc-only, nessun controllo di codice la impone ("molo" non è nome reale).
  - [x] **METAFORE §2 — scrittura di Savenza (ep14–16)** — *proposta formalizzata in §4* (tre culture della memoria: nodo/libro/sigillo), ⚠ in attesa di ratifica. Era: la *scrittura fuori dalla
    Serpe* (inchiostro/registri/scrivano in un regno libero) è in tensione con §4 («scrittura mai
    nei regni liberi»). Da decidere nella passata finale: eccezione ratificata (la Dotta è un
    regno di scrivani) oppure reindirizzo.
  - **ep08 Pagina 10 — legge piccola in chiusura (§1.9)**: «Certe domande si lasciano intere,
    come i nodi degli altri.» — tenuta *per scelta d'autore* (piace l'originale); rivedere alla fine.
  - [x] **Passata di leggibilità 6–8 anni** ✅ CHIUSA (giro dedicato, in blocco): 11 sostituzioni
    chirurgiche (incl. «uccello di conto» → «della Serpe», «tatto dell'occhio», epigrafi, bivacco,
    crinale ×8 dosato in ep01) + **criterio e registro** in `saga/redazione/LESSICO_6-8.md`
    (voce / il-mondo-insegna / strato-specie: cosa non si tocca e perché).
- [x] **Nomi `<dal lessico>`** ✅ CHIUSO — passata unica: 18 nomi + 7 senza-nome di progetto
      (canone in `saga/bible/nomi.md`); 25 schede riempite; 21 innesti in prosa (il nome entra
      una volta, poi l'epiteto resta primario, da fiaba).
- [ ] **Incoerenze storiche residue** (basso impatto): `atlante_politico.md` ha ancora
      "(Italia dei Comuni)"/"papali/imperiali" — coperte dall'avviso "substrato", ok così finché
      non si vuole un atlante 100% nostro.
- [ ] **CLI `ep` — tre rifiniture** (corsia backend, non bloccanti): guardia entrypoint via
      `import.meta.url` invece del match sul nome file; `close --dry-run`; default del grafo
      indipendente dalla cwd.
- [x] **`docs/TEST_SPEC.md`** — ✅ aggiornato: §8 mappa i test del serializzatore, della
      CLI `ep` e dei quattro cancelli-gemelli (cast/digest/reference/geo) + canon.lint.
- [ ] **`pytest seme/tests` ha un side-effect**: appende a `seme/generations.jsonl`
      (file committato) — innocuo in CI, sporca il working tree in locale (corsia seme/backend).

---

*Regola d'ingaggio: un item alla volta, si chiude e si passa al successivo. La geografia
non si tocca; il motore `lib/` si estende solo dove serve (KIND_SCALE, serializzatore).*
