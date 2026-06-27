# Artiglio — scheda canone (comprimario · la Serpe, antagonista ricorrente)

> **Promozione a scheda-voce.** Artiglio è già canone in `../../cartografia/regni/pianura_alta/la_serpe.md`
> (il **braccio** della Serpe, l'antagonista ricorrente più diretto). Qui non si reinventa: si **rifinisce
> la voce** (Tier 2) perché il serializzatore ne ha bisogno. La costellazione resta `la_serpe.md`.
> Il suo arco di **casa** è l'Arco 3 (opprime il villaggio di Rocco col pretesto del tributo).

- **specie**: falco (l'esattore della Serpe)
- **tipo**: comprimario (antagonista ricorrente)
- **attribute_ear (dominante)**: distinguere
- **età / mondo**: adulto / il Gran Ducato e ovunque inseguendo R&Z (al servizio del vertice)

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: **gira alto in cerchio** prima di calare — il predatore che "fa i conti" dall'alto e poi
  piomba. Gli **artigli che stringe e flette** quando "cita il dovuto". Lo sguardo che **prezza** chi ha sotto.

### Natura
- **predatore in livrea d'ufficio**: usa il **pretesto** (tributo, "contrabbando") come arma. Freddo,
  famelico, instancabile.
- sotto il rapace, un **subalterno**: risponde al vertice (Viscardo/Aspide) e li **teme**.

### Paura (arco lungo, se ne ha)
- prima emersione: **fallire** la caccia al Cordone → tocco: il vertice che si spazientisce → fioritura (nera):
  si fa più formale, più crudele col debole, per non mostrare la propria paura verso l'alto.

### Il dono / la forza
- **l'inseguimento e il mandato**: legge un pretesto in qualunque cosa, ha l'autorità della Serpe e **la paura
  del villaggio**. Quando compare, la puntata stringe.

### Arco di crescita (per soglie)
- antagonista **ricorrente**: non cresce, **incalza**. Nell'Arco 3, a casa sua, è al massimo della presa — e
  la posta è se Rocco riesce a **tenergli testa** sul proprio terreno.

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **regno + classe**: Gran Ducato / «il Signore e la Corte» → registro *"liscio, freddo, aforistico, mai una
  parola di troppo"* (`_voci.json`). Artiglio **indossa** l'ufficialità del vertice come una livrea: ne è il
  braccio, non il sangue.
- **forestiero?** no — è la Serpe **a casa** (il Gran Ducato è il suo regno).

**Tier 2 — firma individuale.**
- **superficie**: ufficiale, conta, "a norma", "il dovuto"; freddo come un registro. **sotto**: la fame del
  rapace e la paura di chi sta più in alto di lui.
- **non direbbe MAI**: ammettere che il "tributo" è **rapina** — per lui è sempre *dovuto, registrato, per ordine*.

> **Test (CARTA_VOCE §1.4):** «Non è furto. È il dovuto. A norma. Per ordine. Firmate, o pagano gli altri.» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: pianura_alta
  gruppo: il Signore e la Corte
  registro_ref: pianura_alta/il Signore e la Corte

voce_personaggio:
  name: Artiglio
  role: comprimario
  archetype: il Falco esattore — predatore in livrea d'ufficio, freddo, famelico
  underStress: si fa più formale, cita il «dovuto», stringe gli artigli
  ritmo: frase secca, ufficiale, a conto
  words: il dovuto / a norma / registrato / per ordine
  never: ammette che il tributo è rapina
```

### EAR
- **Δ** *(dominante)* l'**occhio del rapace** che sceglie il bersaglio — e fiuta il Cordone come «contrabbando».
- **⟳** è la **pressione** che costringe R&Z a non fermarsi mai.
- **⇄** —

### Mondo affettivo / relazioni
- **il villaggio di Rocco**: la sua preda fissa (lega a `quello-che-e-rimasto.md` e a Rocco).
- **il vertice** (Viscardo/Aspide, e **Bissa**): i padroni che teme e serve (lega a `bissa.md`).
- **l'Esattore pentito**: un suo **ex-uomo** che ha disertato (lega a `esattore-pentito.md` — la ferita della diserzione).
- **il Mercante delle Vie**: possibile fornitore della merce peggiore (la posizione di R&Z).

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Gran Ducato — agente del «Signore e la Corte» (il **braccio** della Serpe).
- **bioma d'origine**: le **Vie** e i villaggi soggetti (dove si riscuote).
- **perché entra**: è l'**antagonista ricorrente più diretto** — la caccia che dà ritmo alle puntate.
- **aggancio al Cordone / alla Serpe**: insegue il Cordone come "contrabbando" per ordine del vertice; nell'arco
  di casa è la prova che Rocco deve affrontare sul proprio terreno. Costellazione: `la_serpe.md`.
