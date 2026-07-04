# docs/LAVORI_AL_MERGE.md — brief dei lavori in repo (al merge degli agenti immagine)

> Gli agenti **scenografo** e **illustratore** sono definiti e pronti. Le loro definizioni
> *referenziano* alcuni pezzi di repo che vanno completati perché il flusso giri end-to-end.
> Questo è il brief preciso e **dispatchabile**: ogni voce dice **cosa**, **quale file**, **quale
> corsia** (agente), **perché** (chi dipende), e l'**accettazione**. L'orchestratrice instrada;
> Ray ratifica al merge.
>
> Convenzione: i lavori `lib/` e dati NON sono dei due agenti immagine (loro li **assumono**).

---

## A. Per lo SCENOGRAFO (le 3 cose, in ordine di priorità)

### A1 — `tavole` con `staging` sul nodo-episodio  *(il delta vero: chi entra/esce)*
- **File:** `saga/trama/schema_episodio.md` (schema) + una fixture in `saga/serializzatore/fixtures/saga_graph.demo.json`.
- **Corsia:** **trama** (autoriale: definisce/scrive lo schema e la regia) — è il ruolo nuovo già discusso.
- **Cosa:** aggiungere al nodo l'array `tavole` (vedi `docs/SCENOGRAFO.md §2`): per pagina
  `{ page, pov?, staging:[{who, motion, where}], note, composition? }`, con
  `motion ∈ entering|central|exiting|approaching|leaving|present`.
- **Perché:** è il **contratto d'ingresso** dello scenografo; senza, lo staging (DELTA 2) non ha casa
  e ricade sui hook generici del motore.
- **Accettazione:** `schema_episodio.md` documenta `tavole`; `ep_demo` nella fixture ha ≥1 pagina con `staging`.

### A2 — il serializzatore LEGGE `tavole` e le passa alle immagini
- **File:** `saga/serializzatore/src/` (buildSeed/sagaContext) → verso `lib/images`/`pagePrompts`.
- **Corsia:** **backend/ai** (chi possiede il serializzatore).
- **Cosa:** instradare `tavole[].note → STORY MOMENT`, `tavole[].pov → POV`, `tavole[].staging → CAST`,
  `tavole[].composition → zona`. È il **gemello della §6** lato immagini (lo scaffold lo fa il motore,
  i contenuti d'autore arrivano dalle `tavole`).
- **Perché:** porta la regia ricca per-tavola fin dentro il prompt che Manus consuma.
- **Accettazione:** un test mostra una pagina con `staging` reso nel prompt-pagina; `npm run check` verde.

### A3 — `KIND_SCALE` con la fauna di Rocco & Zara
- **File:** `lib/stylesheet.ts` (`KIND_SCALE`).
- **Corsia:** **ai/backend**.
- **Cosa:** aggiungere `rinoceronte` (il più grande — Rocco enorme) e `tigre` (predatrice ma piccola —
  Zara), con il **rapporto di doppia scala** (Rocco ~3× Zara); poi le specie-stemma dei regni man mano
  (lince, leonessa, serpe, gufo, aquila, cervo, leone). Oggi `KIND_SCALE` ha solo la fauna di bosco di isola.
- **Perché:** è il blocco **SCALA** — il motore visivo di R&Z.
- **Accettazione:** `KIND_SCALE.rinoceronte`/`.tigre` presenti col rapporto giusto; test verdi.

### A4 — allineamento `composePrompt` alla v1.2 di isola
- **File:** `lib/images/composePrompt.ts`.
- **Corsia:** **ai**.
- **Cosa:** estrarre **POV** e **SCALA** come **blocchi propri subito dopo lo STILE** (oggi POV è più
  in basso e SCALA è dentro SUBJECT) — l'ordine della v1.2 che a isola ha reso quasi-perfetto al primo colpo.
- **Perché:** rende lo scenografo *identico* al pattern validato su 2 volumi.
- **Accettazione:** il prompt composto ha POV e SCALA come blocchi propri dopo STYLESHEET; `imageGen`/`reference` test verdi.

---

## B. Per l'ILLUSTRATORE (cartelle + registro)

### B1 — scheletro cartelle dei 3 contesti
- **File:** `public/libro/` e `public/reference/` (+ un breve `README.md` in ciascuna).
- **Corsia:** **illustratore** (o **frontend**), alla prima consegna.
- **Cosa:** creare la struttura dei 3 contesti (`docs/ILLUSTRATORE.md §1`) con un README che fissa la
  convenzione (path, naming, formati).
- **Accettazione:** `public/libro/` e `public/reference/` esistono col README della convenzione.

### B2 — convenzione `imageUrl` nel registro
- **File:** `saga/serializzatore/state/entities.json` + (verifica) `lib/images`/`next/image`.
- **Corsia:** **illustratore** + chi possiede il registro.
- **Cosa:** confermare che `imageUrl` = path relativo sotto `public/reference/<entityId>/_hd/…`
  risolvibile da `next/image`, e che l'illustratore lo aggiorni (`imageUrl` + `status: confermata`) a
  ogni reference di catalogo (1c). *(Già documentato in `docs/ILLUSTRATORE.md §2`.)*
- **Accettazione:** una reference di prova (es. `char_rocco_fronte`) depositata + `entities.json`
  aggiornato → il serializzatore la marca `confermata` e la pagina non è più in `missing[]`.

---

## Ordine consigliato

`A3` + `A4` (ritocchi `lib/` rapidi, sbloccano lo scenografo "v1.2 + fauna") → `A1` (schema `tavole`,
con la chat-**trama**) → `A2` (il serializzatore le legge) → `B1`/`B2` (alla prima consegna immagini).
Niente di tutto questo tocca la prosa né i due cancelli umani.
