# la Casa dell'Aquila — scheda canone (comprimario · Arco 4, la Piana dei Savi)

> Nome proprio: **dal lessico**. Comprimario **ricorrente** (Arco 4) → Tier 2 compilato.
> È il **blocco** dell'arco — *legge contro sangue*: il nobile estense che disprezza la missione «di plebe».
> De-stereotipato: non "il nobile arrogante", ma **chi ha tanta grandezza epica da non vedere l'epica vera**
> quando la porta un rinoceronte popolano e una tigre forestiera. Cerca una *chanson de geste* e si perde
> quella che ha davanti, perché non ha la forma — né il sangue — giusti.

- **specie**: aquila (la Casa dell'Aquila — il sangue estense)
- **tipo**: comprimario
- **attribute_ear (dominante)**: connettere
- **età / mondo**: adulto / la Piana dei Savi, la **corte di sangue** (Ferrara estense)

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: si porta **come uno stemma vivo** — ogni posa è un blasone, ogni gesto un'impresa araldica.
  Guarda **dall'alto** (di posatoio e di spirito); l'inclinazione sprezzante del capo che **misura i tuoi avi**.

### Natura
- **epico, cavalleresco, parla in ottava rima**: tutto, per lui, è canto e gloria. Conta solo **il sangue,
  la stirpe, l'onore delle armi**.
- il Cordone è «plebe»: sotto la sua spada, sotto il suo verso, **invisibile** come grandezza.

### Paura (arco lungo, se ne ha)
- prima emersione: l'esistenza di un **valore che non venga dal sangue** → tocco: vedere due popolani fare
  ciò che nessun principe osa → fioritura (rimossa): più la verità preme, più s'innalza nel verso per **non
  vederla**. Riconoscerla disferebbe tutto il suo ordine.

### Il dono / la forza
- **vera potenza** marziale e nobile: **potrebbe** essere un alleato formidabile (è forte, è coraggioso) — e
  invece la sua **cecità di sangue** lo fa muro. È il seme: se imparasse a **vedere** l'epica di R&Z, cambierebbe
  la guerra (payoff possibile in un arco futuro).

### Arco di crescita (per soglie)
- **blocco**: il muro dell'orgoglio di sangue. Lo scatto — se mai — è il giorno in cui riconosce **un'impresa
  grande in chi non ha stirpe**: ma qui, all'Arco 4, **blocca**.

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **regno + classe**: Piana dei Savi / «la Casa dell'Aquila» → registro *"epico-cavalleresco, alto, in rima"* (`_voci.json`).
- **forestiero?** no (è il sangue del regno).

**Tier 2 — firma individuale.**
- **superficie**: **ottava rima** cavalleresca, alta, sonora — parla come si recita una gesta. **sotto**: può
  percepire il valore **solo** come sangue e gloria — la forma stessa è la sua cecità.
- **non direbbe MAI**: riconoscere grandezza in chi **non ha sangue** — né **scendere alla prosa plebea** (non
  abbassa il verso).

> **Test (CARTA_VOCE §1.4):** «Non cinge spada chi non cinge stemma: / di plebe è il fil che annodi, e plebe il canto.» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: pianura_bassa
  gruppo: la Casa dell'Aquila
  registro_ref: pianura_bassa/la Casa dell'Aquila

voce_personaggio:
  name: <dal lessico>
  role: comprimario
  archetype: la Casa dell'Aquila — nobile di sangue, epico in ottava rima, cieco a ogni grandezza non nobile
  underStress: s'innalza ancora di più nel verso, sprezza il «plebeo» per non vedere la verità
  ritmo: ottava rima cavalleresca, alta, sonora
  words: il sangue / l'onore / stirpe e gloria / plebe
  never: riconosce grandezza in chi non ha sangue (né scende alla prosa plebea)
```

### EAR
- **⇄** *(dominante)* è **connesso alla stirpe** — la catena degli avi è il suo tutto; ed è **questa**
  connessione totale a renderlo cieco a ciò che non vi è legato.
- **Δ** distingue per **sangue** (degno / plebeo) — il filtro che gli nasconde l'epica vera.
- **⟳** —

### Mondo affettivo / relazioni
- **la stirpe, gli avi**: la sua misura unica.
- **i Dotti** (la legge): il suo **opposto** nel regno conteso — *sangue contro legge*, le due anime della Piana.
- **R&Z**: li blocca perché non li **vede** degni — il muro più frustrante (forte, e dalla parte sbagliata per cecità).

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Piana dei Savi — «la Casa dell'Aquila» (aristocrazia di sangue, Ferrara estense).
- **bioma d'origine**: il **Cuore** di corte (la rocca del sangue).
- **perché entra**: è il **blocco** dell'arco e la **lezione civica**: due forme di potere a confronto —
  *repubblica della legge* (Dotti) vs *aristocrazia di sangue* (Aquila), per il lettore.
- **aggancio al Cordone / alla Serpe**: ostacola la missione perché «di plebe»; ma è **seme** — un alleato
  potenziale, se imparasse a riconoscere l'impresa fuori dal sangue. (Non è della Serpe: blocca per orgoglio, non per disegno.)
