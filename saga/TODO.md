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
- [ ] **B1. Ep01 nel `saga_graph.json`** — l'origine ricontestualizzata (Zara fugge il
      compito di Toraki → incontro a Spondalta/B1 → tempesta → partenza; Rocco dal Popolo
      dell'Aperto). Ancorato a regno/zona/bioma + i campi missione.
- [ ] **B2. (motore) `KIND_SCALE`** in `lib/stylesheet.ts`: aggiungere la fauna nostra
      (rinoceronte, tigre, lince, lontra, cervo, leone, gufo, aquila, lupo, orso, camoscio…)
      per la scala relativa in scena — è tutto il punto visivo (Rocco enorme ↔ Zara piccola).
- [x] **B3. (motore) Serializzatore M2** — ✅ fatto → `saga/serializzatore/` (ponte `saga→Seed`,
      audit di continuità, PCG condizionata dallo stato, golden/consistency test).
- → *esito: Passo 0 + prime pagine reali sull'Ep01.*

### Fase C — Profondità narrativa
- [ ] **C1. Lessico completo** — tutti i nomi: Cordone, Luoghi Antichi, città-rovina,
      Toraki, cast Serpe (Viscardo/Bissa/Aspide/Mastino/Artiglio/Cècca/Sòrcio), 7 zone,
      principi dei regni. Regola: **concreto/sensoriale**, mai astratto.
- [ ] **C2. Terminus** — dove aspetta Toraki (Terre del Leone di Pietra/le Pietre del Leone vs anello a Spondalta). *Si
      decide definendo le storie.*
- [ ] **C3. Cast dei regni** — estrarre i personaggi (regno→classe→corporazione→individuo).
- [ ] **C4. Arco Laghi del Vespro** — abbozzo dei ~6 episodi del primo arco.

### Fase D — Mondo / cartografia
- [ ] **D1. Luoghi Antichi → feature geojson** in `zones/` (`kind: luogo_antico`, coord
      reali, `real_ref`) — lavoro del cartografo.
- [ ] **D2. `prompt_immagine_base`** — allineare `regni/INDICE.md` ↔ `regno.json`
      (l'INDICE lo cita, il json ha solo `estetica` + `prompt_scrittura_base`).
- [ ] **D3. `saga_quotas`** — tarare l'anti-ripetizione col procedere delle storie.

### Fase E — GitHub
- [x] **E1. Primo commit** — ✅ fatto; da allora si procede **sempre** branch → PR → (check) → merge.
- [ ] **E2. (opz.) Git LFS** — se le zone si moltiplicano, png/geojson pesanti → LFS.

### Fase F — Consolidamento tecnico (debito noto, dopo l'ondata #16–#19)
> Non nuove feature: mettere ordine ora che il sistema ha cambiato volto (pipeline eseguibile).
- [ ] **F1. Casa del serializzatore.** Oggi vive in `saga/serializzatore/` ma è codice
      motore-adiacente (qualità backend). Decidere: **portarlo in `lib/`** (harness ufficiale,
      corsia backend) o tenerlo come tool lato-saga. Incide su *quale agente lo possiede*.
- [ ] **F2. Pipeline `saga/**/*.py` sotto un check minimo.** I generatori (`voci_build.py`,
      `faunario.py`, `cartografia/pipeline/*`, `web/tools/build_cast.mjs`) portano i nomi reali
      e si appoggiano ad `applica_lessico.py` per de-nominare: rischio "rigenero e regredisco".
      Un test/gate leggero (o un `make check` che rigenera e confronta) evita il drift generatore↔output.
- [ ] **F3. Destino di `scrivia` (Next).** L'app Next del root è **deprecata** (Vercel ripuntato
      su `web/` via `vercel.json`) ma la CI la builda ancora. Decidere: **consolidarla** (ha
      `app/api/ai`, `app/api/images`, il motore UI) **o rimuoverla**; pulire la dashboard Vercel `scrivia`.
- [ ] **F4. Disciplina di corsia sui bundle.** Gli ultimi PR-codice arrivano come bundle
      **monolitici cross-corsia** (lib/engine + lib/ai + test + saga). Preferire, dove possibile,
      bundle **più piccoli e lane-scoped**; basare sempre il bundle sull'**ultimo `main`**.

### Pendenti puntuali (dai lavori recenti)
- [ ] **Nomi `<dal lessico>`** — assegnare i nomi propri ai segnaposto nelle ~28 schede
      comprimari, in **un'unica passata**, dopo che la trama/`saga_graph` è definita (coerenza).
- [ ] **Incoerenze storiche residue** (basso impatto): `atlante_politico.md` ha ancora
      "(Italia dei Comuni)"/"papali/imperiali" — coperte dall'avviso "substrato", ok così finché
      non si vuole un atlante 100% nostro.

---

*Regola d'ingaggio: un item alla volta, si chiude e si passa al successivo. La geografia
non si tocca; il motore `lib/` si estende solo dove serve (KIND_SCALE, serializzatore).*
