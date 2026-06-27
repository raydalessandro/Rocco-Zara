# il marinaio del Mare — scheda canone (comprimario · Arco 6, le Terre del Leone · FINALE · linea propria)

> Nome proprio: **dal lessico**. Comprimario ricorrente (Arco 6, **linea propria**) → Tier 2 compilato.
> È **Pisa** (**Gente del Mare**): salato, pratico, preciso — *«misura due volte, taglia una»* (Galileo). Ha
> una **sua rotta**: può offrire un'**uscita** o **portar via qualcuno**. Al finale è il **barcaiolo della
> soglia** — e (guardrail) la saga mostra **la barca che parte, non chi è a bordo**.

- **specie**: cormorano (marinaio-navigatore, pescatore preciso del mare di Pisa)
- **tipo**: comprimario
- **attribute_ear (dominante)**: cambiare
- **età / mondo**: adulto / le Terre del Leone, **Pisa** e il mare aperto (l'**Orlo** marino del regno)

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: **incrostato di sale**, l'occhio che **strizza all'orizzonte** misurando le distanze; gesti
  **deliberati, mai affrettati**; **controlla due volte** prima di muovere (la cima, la marea, la rotta).

### Natura
- **salato, pratico, preciso**: dice solo ciò che ha **misurato**; promette solo il **certo**. Onesto, senza
  trucchi (l'opposto del tentatore: non seduce, **calcola**).
- ha una **rotta sua**: sta **partendo**, con o senza passeggeri — e questo lo rende l'**uscita** del finale.

### Paura (arco lungo, se ne ha)
- non in primo piano: l'uomo che misura ha **poca paura** (ha già calcolato il rischio). Semmai, il rispetto
  esatto per il mare.

### Il dono / la forza
- offre un **passaggio vero**: una via **fuori** dalla scena — verso casa per chi resta, o **oltre** per chi
  parte. Preciso, dato, **affidabile**. È il **mezzo delle partenze** del finale.

### Arco di crescita (per soglie)
- **linea propria**: la sua rotta. Lo scatto è **chi sale a bordo** — e la saga **non indugia** su questo
  (mostra la barca che molla gli ormeggi, non l'oltre).

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **regno + classe**: Terre del Leone / «Gente del Mare» → registro *"salato, pratico, preciso"* (`_voci.json`).
- **forestiero?** no (è Pisa e il suo mare).

**Tier 2 — firma individuale.**
- **superficie**: misurato, salato, esatto («misura due volte»); s'impegna **solo sul certo**. **sotto**: una
  gentilezza silenziosa detta in **affidabilità** (non dice cose calde — **c'è**, preciso).
- **non direbbe MAI**: **promettere ciò che non ha misurato** — né **fiorire** le parole.

> **Test (CARTA_VOCE §1.4):** «Con questa marea, sì. Domani, no. Misura due volte: la rotta è quella. Parola data.» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: toscana
  gruppo: Gente del Mare
  registro_ref: toscana/Gente del Mare

voce_personaggio:
  name: <dal lessico>
  role: comprimario
  archetype: il marinaio di Pisa — salato, pratico, preciso; «misura due volte»
  underStress: si fa più asciutto, riduce tutto a numeri e maree
  ritmo: asciutto, preciso, salato
  words: misura due volte / con questa marea / la rotta è quella / parola data
  never: promette ciò che non ha misurato (né fiorisce le parole)
```

### EAR
- **⟳** *(dominante)* è la **soglia/partenza**: offre l'uscita, **porta via** qualcuno — il **passaggio** del finale.
- **Δ** **misura due volte** — la precisione galileiana è il suo modo (distingue il certo dall'incerto).
- **⇄** —

### Mondo affettivo / relazioni
- **Toraki** (`../toraki.md`): possibile **traghettatore dell'oltre** — chi porta il precorritore **avanti**
  dopo il ricongiungimento (la partenza che non si mostra del tutto).
- **la consegna** (il custode, ②): **dopo** aver posato il Cordone, vengono le **partenze**: lui ne è il mezzo.
- **Rocco e Zara**: a loro può offrire la **rotta di casa** (o restare con loro — la saga sceglie cosa mostrare).

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Terre del Leone — «Gente del Mare» (Pisa, la repubblica marinara).
- **bioma d'origine**: l'**Orlo** marino, il mare aperto.
- **perché entra**: è la **linea propria** del finale — il **mezzo delle partenze**, il barcaiolo della soglia.
- **aggancio al Cordone / al finale**: incarna il **guardrail** — *mostra la porta (la barca che parte), non
  chi la attraversa*. Le partenze del finale passano da lui, con la **precisione** che tiene il dolce-amaro
  lontano dal patetico.
