# `comprimari/` — il cast ricorrente (oltre i protagonisti)

Schede **leggere** dei personaggi secondari che **ricorrono** (viaggiano con o contro Rocco e
Zara). Il cast legato a un solo regno sta nei doc del regno (es. la Serpe in
`../../cartografia/regni/pianura_alta/la_serpe.md`); qui stanno quelli che **tornano**.

## Regola di progettazione: il personaggio è un seme di trama
Non si crea un comprimario "a canone e basta". Ogni scheda ha due campi che **portano il peso**:
- **il gancio** — il seme di trama incorporato (un debito, una diserzione, una leva, un
  segreto) che la storia può far crescere da sola.
- **le connessioni** — i fili verso il cast esistente (chi lo conosce, chi lo odia, chi può
  usarlo): è da qui che le **trame secondarie si intrecciano da sole**.

Il vincolo (chi è · da dove viene · cosa deve) **genera** la storia: più i ganci sono
concreti, più la trama si alimenta da sé. Restano i tabù del canone (animali naturalistici,
la stranezza è fisica, il sottotesto non si nomina).

## Le categorie che stiamo sviluppando
- **buoni** (con Rocco e Zara) — incl. chi viene *da fuori*: un **ex-Serpe** è un filo che può
  tornare.
- **cattivi fuori-Serpe** — lavorano con la Serpe per **interesse, non fedeltà** → alleanza
  **mobile** (si può comprare, può voltare: si lega al motore Turchini/Vermigli).
- **neutri** — aiutano o ostacolano per un **proprio codice** → la loro scelta **pesa nei nodi**.

## Formato e schede attuali
- **`_TEMPLATE.md`** — formato ufficiale (macchina-estraibile: blocco YAML `registro_gruppo` Tier 1 + `voce_personaggio` Tier 2 = `lib/types.ts → CharacterVoice`).
- `esattore-pentito.md` · `cacciatore.md` · `guardiano-del-guado.md` — la prima costellazione (buono ex-Serpe · cattivo mobile · neutro), agganciata tra sé e al cast.
