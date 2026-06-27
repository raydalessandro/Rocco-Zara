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
- **Serpe ricorrente (trasversale a tutti gli archi)** — `artiglio.md` (il falco, il **serio**) · `cecca.md` + `sorcio.md` (il **braccio comico**: la gazza-spia tradita dal proprio occhio + il ratto che si crede un fuoriclasse) · `bissa.md` (l'erede, linea di successione). Sono i volti della Serpe che i protagonisti incontrano **più del vertice**: caratterizzati a fondo perché **non** siano cattivetti stereotipati. Costellazione: `../../cartografia/regni/pianura_alta/la_serpe.md`.
- `il-dotto-che-smonta.md` · `la-casa-dell-aquila.md` · `il-giovane-disputante.md` — il **tessuto locale dell'Arco 4** (la Piana dei Savi, il **MIDPOINT**): il Dotto che «smonta» il senso del Cordone (lo **specchio Δ oscuro di Zara** → il suo fondo), il nobile di sangue che non vede l'epica «di plebe» (*legge vs sangue*), e il Disputante che — convinto a difendere il Cordone — può **rimontarne** la causa (la leva della risalita). *Slot ②③ = il **Guardiano del guado** (trasversale, già scritto): porta alle Rovine + la traccia più fresca di Toraki al midpoint.* L'arco prova **Zara** (il nadir).
- `l-esule-libero.md` · `uno-degli-antichi.md` · `il-solitario.md` · `le-creature-della-rovina.md` · `il-tentatore.md` — il **tessuto locale dell'Arco 5** (la Selva di Mezzo, **anarchia**, il *cuore strano*): l'Esule che mostra il **costo** della libertà-senza-appartenenza, l'Antico che sfiora la cosmologia **solo per enigmi**, il Solitario che aiuta a malincuore, il **coro uncanny** della rovina (in filastrocca) — dove il **Cacciatore** (trasversale) chiude su Toraki — e il **tentatore-Lucignolo** (voce *forestiera*, mira alla ferita di Zara: molla il Cordone, resta libero). L'arco è il **bivio** prima del finale.
- `voce-che-torna.md` — **trasversale, di tutta la saga**: la *coscienza che torna* (sul Grillo di Collodi). Personaggio-cardine del tema, col tabù più stretto (la cosmologia non si nomina **mai**).

## La mappa
- **`MAPPA_CAST.md`** — il blueprint di **tutto** il cast secondario, arco per arco: ogni casella è un *abitante* di un comune reale (con la sua voce-classe), da sviluppare in scheda un arco alla volta.

## Pendenti — giro finale (sui secondari)
- **«i Disputanti» → classe ufficiale.** Aggiungere il gruppo «i Disputanti» (*"vince chi convince"*) a `pianura_bassa` in `_voci.json` via `voci_build.py`, e ripuntare `il-giovane-disputante.md` da `i Dotti` a `i Disputanti`. *(deciso: diventa ufficiale.)*
- **Voci mancanti della Serpe**: **Aspide** (il consigliere) e il **Mastino** (il vassallo dei valichi) — schede-voce nel giro finale.
- **Nomi dal lessico**: assegnare i nomi propri ai `<dal lessico>` di tutte le schede, in coda (dopo che la trama è definita).
