# lo Specchio di Zara — scheda canone (comprimario · Arco 1, i Laghi del Vespro)

> Nome proprio: **dal lessico**. Comprimario **ricorrente** (Arco 1) → Tier 2 compilato.
> È la **rottura interiore** del primo arco: lo specchio che costringe Zara a guardarsi.

- **specie**: lince (lo **stemma** del regno — lei ne è il vanto)
- **tipo**: comprimario
- **attribute_ear (dominante)**: distinguere
- **età / mondo**: giovane / i Laghi del Vespro, il **Bosco**

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: **il portamento** — sta dritta, a suo agio, *senza gonfiarsi* (l'opposto di Zara,
  che si gonfia per sembrare grande). I **ciuffi sulle orecchie** della lince, perfetti. La grazia
  di chi non ha mai dovuto dimostrare di appartenere.

### Natura
- **sicura, asciutta, un filo altera senza saperlo**: non è cattiva — è solo **a casa**, e questo,
  per Zara, è la ferita.
- giudica per istinto chi è "del posto" e chi no.

### Paura (arco lungo, se ne ha)
- prima emersione: quando vede Zara **partire davvero** → tocco: il sospetto che la forestiera
  abbia qualcosa che a lei manca (il coraggio di andarsene) → fioritura: il seme dell'alleanza.

### Il dono / la forza
- **appartiene**: conosce ogni posto, ogni regola, senza sforzo. La sicurezza dell'erede.

### Arco di crescita (per soglie)
- da **rivale** (giudice di Zara) a (forse) **alleata** — lo scatto è quando capisce che Zara **fa**
  ciò che lei non ha mai osato.

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **regno + classe**: Laghi del Vespro / «il Popolo del Bosco» → registro *"asciutto, terragno,
  pratico"* (`_voci.json`).
- **forestiero?** no (è il cuore del regno).

**Tier 2 — firma individuale.**
- **superficie**: calma, certa, sentenzia con naturalezza ("le cose hanno il loro posto").
  **sotto**: una curiosità per la forestiera che non ammetterà mai.
- **non direbbe MAI**: una **domanda insicura** ("non so se ci riesco"). È l'esatto rovescio di Zara.

> **Test (CARTA_VOCE §1.4):** «Qui le cose hanno il loro posto. Tu, ancora no.» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: laghi_occidente
  gruppo: il Popolo del Bosco
  registro_ref: laghi_occidente/il Popolo del Bosco

voce_personaggio:
  name: <dal lessico>
  role: comprimario
  archetype: la sicurezza di chi appartiene — asciutta, certa, di casa
  underStress: si fa più tagliente, marca i confini del "qui"
  ritmo: frase piana e ferma, sentenziosa
  words: il suo posto / qui / si fa così
  never: una domanda insicura
```

### EAR
- **Δ** *(dominante)* distingue **chi appartiene da chi no** — lo **specchio** di Zara: stessa
  facoltà, terreno opposto (Zara si sente distinta come *estranea*; lei distingue da *padrona di casa*).
- **⇄** è già **connessa** al regno: ciò che a Zara manca.
- **⟳** può **cambiare** idea su Zara — lo scatto verso l'alleanza.

### Mondo affettivo / relazioni
- **il regno**: vi appartiene del tutto (è il suo orgoglio e il suo limite).
- **Zara**: rivale-specchio → forse alleata. La loro tensione **è** la prova sociale del primo arco.

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Laghi del Vespro — «il Popolo del Bosco» (alta, il vanto del regno).
- **bioma d'origine**: il **bosco** (di montagna).
- **perché entra**: è l'**ostacolo sociale** al "Zara accettata nella rete" — il tentpole del primo nodo.
- **aggancio al Cordone**: la sua **accettazione (o il suo disprezzo) È la posta** del primo annodamento.
