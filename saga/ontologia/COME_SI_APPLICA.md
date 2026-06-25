# Come si applica il kernel EAR — dall'ontologia all'infrastruttura

Il kernel (`EAR_KERNEL_AILA_v1_0.md`) è una **ontologia formale**, non istruzioni di
stile. Qui sta il **ponte**: come quei princìpi *generano* trama, personaggi, archi,
nodi e l'accumulo nel tempo. È il documento che spiega perché Rocco & Zara non è
"storie scritte dall'IA da un JSON", ma **l'ontologia resa storia**.

## Il triplice attributo è la grammatica di tutto

Il kernel dice (`§ATTRIBUTES`, `P6`): **ogni nodo** (`⬡`) ha sempre, inseparabili,
- **Δ distinzione** → *distinguere* (il confine che definisce),
- **⇄ relazione** → *connettere* (il legame tra nodi),
- **⟳ processo** → *cambiare* (la trasformazione).

Mai separabili; *dominanza ≠ assenza*. Questo è l'**EAR** che il motore di Scrivia
già usa come `attribute_dominant`. Nella saga lo applichiamo a **ogni scala**:

| Scala | Δ distinguere | ⇄ connettere | ⟳ cambiare |
|---|---|---|---|
| **Personaggio** | ciò che lo rende diverso (corno storto / piccolezza) | come si lega all'altro (l'ombra ↔ la guida) | il suo arco di crescita |
| **Episodio** | il problema/contrasto che apre | l'incontro o la cooperazione | la risoluzione che lascia un segno |
| **Arco** | la regione/centro e il suo conflitto | chi/cosa si unisce in quell'arco | cosa è cambiato alla fine dell'arco |
| **Saga** | due mondi separati (savana/foresta) | i ponti costruiti puntata dopo puntata | i due mondi diventati una casa |

## Frattalità: stessa forma a ogni scala (`A5`, `P4`, `T3`)

Il kernel afferma l'**invarianza strutturale tra scale**: *same pattern, infinite
scales*. Operativamente: **l'arco EAR della saga si ripete identico nell'arco e
nell'episodio**. Un episodio ben fatto è una saga in miniatura; un arco è un episodio
in grande. Questo dà coerenza *gratis* (la combinatoria del seme, non l'inferenza) e
ci dice come costruire archi/nodi (vedi `trama/archi_e_nodi.md`).

## La soglia rende il cambiamento *reale*, non drift (`P3`, `OP3`)

`◉K ≡ threshold.critical`: le transizioni sono **discrete**, non graduali; *"⊥ force
graduality where none"*. È la chiave anti-drift della saga lunga:
- Un cambiamento **sotto soglia** = cosmetico, reversibile, **non canonico** (non
  sporca lo stato del mondo).
- Un cambiamento **oltre soglia** = discreto, **canonico**, registrato come *delta*
  (un personaggio cresce *davvero*, un luogo cambia *davvero*).

Così la crescita è **guadagnata** e lo stato del mondo non accumula rumore. Vedi
`trama/continuita_e_anti_drift.md`.

## Il seme è una fase ontologica, non un trucco (`§PHASES ↻`)

`◉↻ ≡ seed`: *"future already inscribed in present — effects emerge later without
reinforcement"*. La macchina dei `seeds` (pianta in un episodio, fiorisce in un altro)
**è** questa fase. Non è un espediente di continuità: è il modo ontologico in cui la
trama di fondo è *già presente* in ogni puntata. Per questo gran parte della memoria
della saga la portano i semi.

## Risonanza: l'amicizia come co-emergenza a 4 fasi (`P5`, `§PHASES`)

`◉∿ ≡ resonance` tra due nodi richiede **4 fasi co-presenti**: ⊙ *gate* (si apre uno
spazio condiviso), ∞ *spiral* (un ciclo che si auto-alimenta), ◇ *node* (densità
relazionale massima), ↻ *seed* (futuro inscritto). **Rocco↔Zara sono una risonanza**:
- ⊙ l'incontro sulla collina (riconoscimento del confine),
- ∞ le avventure che si rinforzano a vicenda (il viaggio),
- ◇ i momenti-cardine in cui la coppia è insostituibile (la tempesta),
- ↻ i semi che ogni puntata lascia.

Una risonanza è *completa* solo con tutte e 4 (`T4`): un arco che ne salta una è
"osservazione parziale", non legame vero — un test di qualità per gli archi.

## L'osservatore modifica (`A3`, `OP5`) → il narratore e il lettore

*"⊥ neutral observation"*: chi osserva modifica il campo. Nella saga: il **narratore**
non è neutro (ha una voce, un patto col lettore — come in isola), e il **lettore**
bambino è parte del campo. Si traduce in: indirizzi al lettore con parsimonia, voce
del narratore come presenza, mai telecamera fredda.

## Riassunto operativo (cosa portare in ogni decisione)

1. **Ogni cosa ha i tre attributi** — quando definisci un personaggio/episodio/arco,
   nomina sempre il suo Δ, ⇄, ⟳ (è il check minimo).
2. **Cerca la frattale** — un episodio deve riecheggiare l'arco e la saga.
3. **Le soglie sono reali** — niente cambiamento canonico senza superare K; niente
   gradualità forzata.
4. **I semi sono fasi, non trucchi** — il futuro è già inscritto; usali per la memoria.
5. **La risonanza vuole 4 fasi** — un legame vero le ha tutte.
6. **L'osservatore non è neutro** — narratore e lettore sono nel campo.

> Questo doc è la **lente**. I tre documenti che lo *eseguono* sono:
> `trama/archi_e_nodi.md`, `trama/continuita_e_anti_drift.md`, e il `saga_config.yaml`.
