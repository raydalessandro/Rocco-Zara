# `comprimari/` — il cast ricorrente (oltre i protagonisti)

Schede **leggere** dei personaggi secondari che **ricorrono** (viaggiano con o contro Rocco e
Zara). Il cast legato a un solo regno sta nei doc del regno (es. la Serpe in
`../../cartografia/regni/pianura_alta/la_serpe.md`); qui stanno quelli che **tornano**.

> ⚠️ **Sottotesto d'autore — mai nella prosa.** I "modello" di registro (figure storiche) e i
> nomi reali nelle schede e in `MAPPA_CAST.md` servono solo a *costruire*: non compaiono mai
> nel testo. I nomi di canone sono in `../../lessico/MAPPATURA.md`.

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
- `specchio-di-zara.md` · `custode-anziano.md` · `traghettatrice-delle-rive.md` — il **tessuto locale dell'Arco 1** (i Laghi del Vespro): la rottura interiore, la porta al primo nodo, il passaggio + il seme del furto.
- `la-leonessa-civica.md` · `il-montanaro-delle-incisioni.md` · `l-aiutante-arlecchino.md` · `il-quinto-colonna.md` · `il-giurato.md` — il **tessuto locale dell'Arco 2** (la Conca Ruggente, il libero comune): lo specchio interiore di **Rocco** (la forza che *serve*), la porta al nodo (le Pietre Incise), l'aiuto-Arlecchino + il seme, il quinto colonna (il libero comune tradito da dentro), il Giurato vincolato (sottotrama d'onore). L'arco prova **Rocco**.
- `quello-che-e-rimasto.md` · `la-memoria-sepolta.md` · `il-mercante-delle-vie.md` · `artiglio.md` · `bissa.md` — il **tessuto locale dell'Arco 3** (il Gran Ducato, **casa di Rocco**): lo specchio della colpa (restare vs partire), la **memoria sepolta** (la porta murata → il **Luogo senza nodo**), il Mercante ambiguo (+ payoff dell'Esattore pentito), e i due **ricorrenti della Serpe** promossi a scheda-voce — **Artiglio** (l'esattore) e **Bissa** (l'erede, linea di successione). L'arco prova **Rocco** a casa. *(Serpe: costellazione in `../../cartografia/regni/pianura_alta/la_serpe.md`.)*
- `voce-che-torna.md` — **trasversale, di tutta la saga**: la *coscienza che torna* (sul Grillo di Collodi). Personaggio-cardine del tema, col tabù più stretto (la cosmologia non si nomina **mai**).

## La mappa
- **`MAPPA_CAST.md`** — il blueprint di **tutto** il cast secondario, arco per arco: ogni casella è un *abitante* di un comune reale (con la sua voce-classe), da sviluppare in scheda un arco alla volta.
