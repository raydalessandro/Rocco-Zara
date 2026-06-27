# il Custode anziano — scheda canone (comprimario · Arco 1, i Laghi del Vespro)

> Nome proprio: **dal lessico**. Comprimario **ricorrente** (Arco 1) → Tier 2 compilato.
> È la **porta verso il primo nodo**: sa le cose antiche, ma **non sa cosa significano**.

- **specie**: testuggine di lago (longeva — *la memoria fatta animale*) — *adattabile al roster*
- **tipo**: comprimario
- **attribute_ear (dominante)**: connettere
- **età / mondo**: vecchio / i Laghi del Vespro

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: **il guscio liscio** dove ha riposato per anni contro le pietre antiche — la pietra
  ha levigato il carapace. Porta addosso, senza saperlo, il segno del luogo che custodisce.

### Natura
- **osservativo, paziente, enciclopedico**: cataloga tutto, trae sentenze dalla natura.
- **sa senza capire**: ha annotato la pietra tiepida per una vita, ma non ne conosce il perché.

### Paura (arco lungo, se ne ha)
- prima emersione: davanti alla pietra tiepida coi due → tocco: il timore di **morire senza aver
  capito** ciò che ha osservato per una vita → fioritura: l'**affidamento** ai due di ciò che lui
  ha solo annotato.

### Il dono / la forza
- **sa le cose antiche**: è lui che **indirizza Rocco e Zara verso le Coppelle** (il primo nodo);
  conosce le **vecchie osservazioni** sulla pietra che "tiene il sole più del giusto".

### Arco di crescita (per soglie)
- minimo (guida): il suo scatto è **consegnare** ai due la cosa che ha solo osservato — passare
  dall'annotare al **far accadere**.

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **regno + classe**: Laghi del Vespro / «i Custodi» → registro *"osservativo, enciclopedico,
  pacato, un filo latineggiante"* (`_voci.json`).
- **forestiero?** no.

**Tier 2 — firma individuale.**
- **superficie**: cataloga, "ho osservato che…", trae sentenze dalla natura. **sotto**: la
  frustrazione del **sapere senza capire**.
- **non direbbe MAI**: «non lo so» **senza prima averlo osservato e annotato**.

> **Test (CARTA_VOCE §1.4):** «Ho osservato che certe pietre tengono il sole più del giusto. Non ho spiegazione. La annoto.» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: laghi_occidente
  gruppo: i Custodi
  registro_ref: laghi_occidente/i Custodi

voce_personaggio:
  name: <dal lessico>
  role: comprimario
  archetype: il naturalista anziano — osservativo, enciclopedico, pacato
  underStress: si rifugia nell'osservazione, annota invece di agire
  ritmo: periodo disteso, sentenzioso, un filo latino
  words: ho osservato che / annoto / la natura insegna
  never: dice "non so" senza aver prima osservato e annotato
```

### EAR
- **⇄** *(dominante)* **connette** il presente alla **memoria antica** — il ponte verso le Coppelle.
- **Δ** osserva e **cataloga** le differenze del mondo (anche la pietra strana).
- **⟳** quando affida ai due ciò che sa, **cambia** il proprio ruolo: da custode a chi consegna.

### Mondo affettivo / relazioni
- **il lago e la sua memoria**: la sua lealtà.
- **Rocco e Zara**: li **indirizza** — senza capire perché conti.

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Laghi del Vespro — «i Custodi» (i guardiani della memoria del lago).
- **bioma d'origine**: **acqua / rive**.
- **perché entra**: è la **porta verso il primo nodo** (le Coppelle).
- **aggancio al Cordone**: conosce la **pietra tiepida** e le vecchie osservazioni, ma **non il loro
  significato** — *"la porta che si apre senza mostrare chi la attraversa"* incarnata in un personaggio.
