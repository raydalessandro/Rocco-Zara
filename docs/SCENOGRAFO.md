# docs/SCENOGRAFO.md — lo spec dello scenografo (compagno di `.claude/agents/scenografo.md`)

Come si compone il prompt-immagine di una **tavola** di Rocco & Zara, da dove viene ogni
blocco, e i due delta su isola (varietà focale + staging). Eredita `scenografo` v1.2 di isola
(metodo validato su s01 e due volumi), ri-puntato sulla nostra pipeline TS.

## 0. Il principio

Il prompt **non si scrive a mano da zero**: lo **assembla il motore**
(`lib/images/composePrompt.ts`, portato da `to_manus_prompts.py` di isola) a partire dal
**nodo + hook + entità** che il **serializzatore** produce. Lo scenografo fornisce la **regia
per-tavola** (cosa succede, da dove si guarda, chi entra/esce) e verifica che i blocchi siano
pieni e nell'ordine giusto. Il generatore (Manus) **non ha memoria**: ogni prompt è
autosufficiente e ri-allega le reference; l'**agente** che compone, invece, carica l'invariante
**una volta** in testa (sessione = una storia, fresca per batch).

## 1. Ordine dei blocchi (conta) e fonte di ciascuno

```
STILE  →  POV  →  SCALA  →  CAST(+staging)  →  LUOGO  →  MOOD  →  DIVIETI
          + STORY MOMENT  +  CHARACTER CONSISTENCY  →  FORMAT
```

| # | Blocco | Fonte (nostra repo) | Note |
|---|---|---|---|
| 1 | **STILE** | `buildStylesheet` (`lib/stylesheet.ts`) + `saga/bible/STILE_VISIVO.md` | art-style integrale + NEGATIVE globale. Incollato **identico**, in apertura, mai sintetizzato. |
| 2 | **POV** | `TYPE_POV[h.type]` del motore; override `tavole[].pov` | **obbligatorio, esplicito.** Vedi §3 (varietà focale). |
| 3 | **SCALA** | `KIND_SCALE` (`lib/stylesheet.ts`) | la **doppia scala** Rocco/Zara: in ogni quadro condiviso, il contrasto di mole è il soggetto. |
| 4 | **CAST + STAGING** | `characters_present` + `tavole[].staging` + descrittori dal catalogo entità | il **delta** di Rocco & Zara: vedi §4. |
| 5 | **LUOGO** | luogo canonico dal nodo (regno/zona/bioma) + record-luogo | mai sospeso nel nulla, mai sfondi inventati. |
| 6 | **MOOD** | `palette_emotiva` del nodo | stagione + registro. |
| 7 | **DIVIETI** | `prohibitions` per-entità + NEGATIVE dello stylesheet | fisso, ripetuto ogni volta. |
| — | **STORY MOMENT** | `tavole[].note` (o `storyMomentOf(hook)`) | 1-2 frasi EN: la regia ricca, equivalente delle `[ TAV. N ]` dell'esperimento. |
| — | **CHARACTER CONSISTENCY** | `CONSISTENCY_BLOCK` (`lib/pagePrompts.ts`) | fisso, chiude: «the attached reference images are BINDING, not inspiration». |
| 8 | **FORMAT** | fisso | verticale 2:3, una immagine/pagina, **nessun testo**. |

## 2. Lo schema `tavole` (il contratto d'ingresso) — dove vive la regia per-pagina

Parallelo agli `_annotations/sNN.yaml` di isola. **Proposta**: un array `tavole` sul
nodo-episodio in `saga/trama/saga_graph.json` (da formalizzare in `schema_episodio.md`; il
serializzatore lo legge e lo passa a `composePrompt`). In assenza, fallback ai hook del motore.

```jsonc
"tavole": [
  {
    "page": 1,
    "pov": "wide establishing, from a distance",   // opz.: override del taglio-motore (§3)
    "staging": [                                     // il DELTA: chi/dove/come si muove (§4)
      { "who": "zara",   "motion": "central",     "where": "ciglio del bosco, minuscola" },
      { "who": "cordone","motion": "present",     "where": "in bocca a Zara, un solo nodo" }
    ],
    "note": "Late summer. A tiny tiger at the hard edge where dark woods stop and the open gold begins.", // STORY MOMENT
    "composition": "sky_space"                       // opz.: override zona quieta (testo)
  }
]
```

`motion` ∈ `entering · central · exiting · approaching · leaving · present`.
`where` = posizione/scala nel quadro in linguaggio naturale.

## 3. DELTA 1 — varietà focale (il motore ce l'ha già)

Il motore assegna a ogni pagina un `type` di hook → `TYPE_POV` con **distanze diverse**:
`panorama` (wide, from a distance) · `azione` (medium, eye level) · `introspettivo` (close,
face & hands) · `atmosferico` (wide atmospheric) · `transizione` (medium **tracking**, follows
the movement) · `interno` (medium inside) · `dettaglio` (**macro** close-up). La scelta passa da
`pickType(... maxConsec)` che **vieta la ripetizione** dello stesso taglio di fila.

**Regola operativa:** lo scenografo **usa** il taglio della pagina e **non appiattisce** tutto a
medio-a-livello-occhi (l'errore di isola: fotografo fermo, soggetti sempre alla stessa distanza).
Override consapevole solo via `tavole[].pov`, mai per pigrizia.

## 4. DELTA 2 — staging (la cosa nuova, per l'azione)

Il motore dà il **chi** (`characters_present`) ma **non** il movimento. Lo staging arriva da
`tavole[].staging` e va **reso nel blocco CAST**: chi **entra**, chi è **centrale**, chi **esce**,
chi **arriva in lontananza**, chi **si allontana** dal quadro, e **dove**. Se il testo ha un
arrivo o una partenza (Rocco & Zara ne ha: è una saga d'azione), l'immagine **deve** mostrarlo —
non tutti centrali (l'errore di isola, dove con poca azione non si notava).

Resa (esempi):
- `{who: rocco, motion: approaching, where: "in lontananza, sale il pendio"}` → *"Rocco, the
  rhino, small in the distance, climbing the slope toward us"*.
- `{who: toraki, motion: leaving, where: "tra i tronchi, di spalle"}` → *"Toraki, pale, seen from
  behind, walking away between the dark trunks, almost gone"*.

## 5. Disciplina di sessione / cache

- **Invariante in testa, una volta:** questa skill + `docs/SCENOGRAFO.md` + lo STILE + le
  reference `_hd` dei personaggi della storia. **Sessione = una storia intera.**
- **Per tavola:** aggiungi solo la sua variante (`tavole[]` della pagina + eventuali schede).
- **Fresca per batch:** mai proseguire in una sessione satura — il generatore **deriva verso le
  proprie ultime uscite**. Una chat per batch.
- **Reference in OGNI prompt:** il generatore non ricorda; ri-allega sempre le canoniche.

## 6. Reference & catalogo

Le reference sono le immagini canoniche dal **registro entità**
(`saga/serializzatore/state/entities.json` → l'`imageUrl`/`_hd` per ogni entità). Il
serializzatore le pre-popola in `story.entities` (`EntityRefRecord[]`) e `buildPagePrompts` le
allega come **binding**. Entità senza reference confermata → la pagina è in `missing[]`: **fermati
e segnala**, va confermata prima (il cancello del Passo 0).

## 7. Output & consegna

Verticale **2:3**, low-res 832×1248 di lavoro + **HD ≥1824×2736** JPG q95 sRGB (DPI 300), naming
deterministico per pagina. La **consegna** (dove va l'HD: scena/volume/catalogo, naming, branch,
PR) è dell'**`illustratore`** — non dello scenografo.

## 8. Task accoppiati (lato motore — agente `ai`/`backend`, non scenografo)

Due ritocchi `lib/` che rendono questo agente *identico* alla v1.2 di isola e completo per la
nostra fauna:

1. **`KIND_SCALE` (`lib/stylesheet.ts`)** — aggiungere la **nostra fauna** per la doppia scala:
   `rinoceronte` (il più grande, Rocco enorme) e `tigre` (predatrice ma piccola, Zara), più le
   specie-stemma dei regni man mano. Oggi ci sono solo le specie di bosco di isola.
2. **`composePrompt.ts` — allineamento v1.2** — estrarre **POV** e **SCALA** come blocchi propri
   **subito dopo lo STILE** (oggi POV sta più in basso e SCALA è dentro SUBJECT), come la versione
   che a isola ha reso quasi-perfetto al primo colpo.

> Questi due NON sono lavoro dello scenografo (toccano `lib/`): vanno alla corsia `ai`/`backend`.
> Lo scenografo li **assume** come dati.
