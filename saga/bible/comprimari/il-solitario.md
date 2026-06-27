# il Solitario — scheda canone (comprimario · Arco 5, la Selva di Mezzo)

> Nome proprio: **dal lessico**. Comprimario ricorrente (Arco 5) → Tier 2 compilato.
> Non vuole compagnia — e dà l'**aiuto decisivo a malincuore**. Nell'anarchia (nessun governo) l'aiuto non
> viene da un dovere civico ma dalla **decenza di un singolo**: lui è quella decenza, scontrosa e involontaria.

- **specie**: gatto selvatico (solitario, guardingo)
- **tipo**: comprimario
- **attribute_ear (dominante)**: distinguere
- **età / mondo**: adulto / la Selva di Mezzo, i margini fitti del **Bosco**

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: **sempre angolato per andarsene** — il corpo già rivolto all'uscita mentre ti parla. Tiene
  la **distanza**, sobbalza al contatto; ma gli **occhi seguono tutto** (la guardia che non smette mai).

### Natura
- **monosillabico, guardingo**: non vuole nessuno intorno. Sbrigativo, diffidente.
- e tuttavia una **decenza sepolta** — che lui stesso mal sopporta — gli fa dare, una volta, l'aiuto che conta.

### Paura (arco lungo, se ne ha)
- prima emersione: **avere bisogno / essere avuto bisogno** → tocco: vedere R&Z in pericolo vero → fioritura:
  aiuta **una volta**, deciso, poi si **ritira** prima che lo si possa ringraziare.

### Il dono / la forza
- **sa l'unica cosa che li salva** al momento giusto (un passaggio, un riparo, un avviso) — e la dà **a
  strappi**, monosillabica, sparendo subito dopo.

### Arco di crescita (per soglie)
- minimo. Lo scatto è quell'**unico gesto** contro la propria natura — non si converte alla compagnia, torna
  solo; ma quel gesto pesa.

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **regno + classe**: Selva di Mezzo / «i Solitari» → registro *"monosillabico, guardingo"* (`_voci.json`).
- **forestiero?** no.

**Tier 2 — firma individuale.**
- **superficie**: parole singole, schivo, devìa. **sotto**: una decenza che si rinfaccia.
- **non direbbe MAI**: un **discorso caldo o lungo** — né ammettere che gli **importa**.

> **Test (CARTA_VOCE §1.4):** «No. …Via di lì. …Quella pietra, non l'altra. Adesso andate. Una volta sola.» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: selva_di_mezzo
  gruppo: i Solitari
  registro_ref: selva_di_mezzo/i Solitari

voce_personaggio:
  name: <dal lessico>
  role: comprimario
  archetype: il Solitario — monosillabico, guardingo, aiuta a malincuore
  underStress: si chiude in monosillabi, si tira indietro
  ritmo: monosillabico, scabro, a strappi
  words: no / via / fate piano / una volta sola
  never: un discorso caldo o lungo (né ammette che gli importa)
```

### EAR
- **Δ** *(dominante)* **guardingo**: distingue di continuo chi è minaccia e tiene la distanza.
- **⇄** l'aiuto decisivo dato **una volta**, contro la propria natura — un ⇄ strappato a sé stesso.
- **⟳** —

### Mondo affettivo / relazioni
- **l'Esule libero** (①): entrambi soli, **all'opposto** — l'Esule *cerca* la libertà, il Solitario *fugge il
  contatto*; affiancati, mostrano due solitudini diverse dell'anarchia.
- **Rocco e Zara**: gli strappano l'unico gesto — e gli restano, per un attimo, addosso.

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Selva di Mezzo — «i Solitari».
- **bioma d'origine**: il **Bosco** fitto, i margini.
- **perché entra**: è l'**aiuto pratico** dell'arco — e, per contrasto, la civica dell'anarchia: senza governo,
  conta solo la **scelta del singolo**.
- **aggancio al Cordone / alla Serpe**: la sua decenza involontaria è un piccolo **nodo umano** in un luogo
  senza legami — un'eco minima di ciò che il Cordone fa in grande.
