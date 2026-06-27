# uno degli Antichi — scheda canone (comprimario · Arco 5, la Selva di Mezzo)

> Nome proprio: **dal lessico** (o **senza nome** — gli Antichi quasi non ne hanno). Comprimario ricorrente
> (Arco 5) → Tier 2 compilato. È la **porta al nodo** della Selva (l'**Altare di Roccia**) e **il più vicino
> alla cicala**. Parla **solo per indovinelli**: **sfiora la cosmologia senza dirla** — è il suo carattere
> *e* la garanzia del tabù. La stranezza resta **fisica** (la pietra tiepida, i segni); il senso, mai pronunciato.

- **specie**: rospo (creatura di pietra, antichissima, immobile sull'Altare)
- **tipo**: comprimario
- **attribute_ear (dominante)**: connettere
- **età / mondo**: antichissimo / la Selva di Mezzo, presso l'**Altare di Roccia** (la **Rovina** del bosco)

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: **immobilità di pietra** — la pelle vecchia come il masso su cui sta, quasi ne fa parte. Gli
  occhi **guardano attraverso** di te, a qualcosa **dietro**. Sembra ascoltare la roccia più che chi gli parla.

### Natura
- **lento, gnomico, a indovinello**: non risponde mai dritto. Sa qualcosa di **vasto** — e o non vuole, o
  **non può** dirlo piano.
- vive alla soglia dell'Altare: il punto dove la pietra è **tiepida** anche di notte.

### Paura (arco lungo, se ne ha)
- non in primo piano (è oltre). Semmai una **cura**: che il senso non venga **detto** (perché detto, si guasta)
  — di qui gli enigmi.

### Il dono / la forza
- **conosce la via all'Altare e cosa farvi** — ma lo dà solo **in enigma**: R&Z devono **interpretare**. È la
  porta al nodo, **chiusa a chiave d'indovinello**.

### Arco di crescita (per soglie)
- minimo (è un oracolo). Lo scatto: l'enigma **giusto** al momento giusto, che apre il gesto del nodo senza
  mai spiegarlo.

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **regno + classe**: Selva di Mezzo / «gli Antichi» → registro *"lento, gnomico, a indovinello"* (`_voci.json`).
- **forestiero?** no (è la cosa più radicata che esista — più del regno stesso).

**Tier 2 — firma individuale.**
- **superficie**: enigmi, lentissimi, mai una risposta dritta. **sotto**: sa l'indicibile — e lo **circonda**,
  non lo tocca.
- **non direbbe MAI**: una **risposta diretta**, né **nominare la cosa** (il tabù è la sua natura: può solo
  girarle intorno).

> **Test (CARTA_VOCE §1.4):** «Chi lascia, trova. Chi tiene, perde. La pietra sa il tuo nome — non chiedere il suo.» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: selva_di_mezzo
  gruppo: gli Antichi
  registro_ref: selva_di_mezzo/gli Antichi

voce_personaggio:
  name: <dal lessico / senza nome>
  role: comprimario
  archetype: uno degli Antichi — lento, gnomico, parla solo per indovinelli
  underStress: rallenta ancora, risponde con un altro enigma
  ritmo: lentissimo, gnomico, a indovinello
  words: chi lascia trova / la pietra sa / non chiedere il nome
  never: dà una risposta diretta o nomina la cosa
```

### EAR
- **⇄** *(dominante)* è il **ponte obliquo** verso l'antico — il più vicino alla **cicala**: connette il
  presente a ciò che c'era **prima**, ma solo per enigma.
- **Δ** —
- **⟳** —

### Mondo affettivo / relazioni
- **la cicala** (`voce-che-torna.md`): **affini** — le due presenze "antiche" della saga; qui, nella Selva,
  sono entrambe più di casa. Si "riconoscono" (mai spiegato).
- **l'Altare di Roccia**: ne è il guardiano-soglia; lì Zara annoda il tratto della Selva.

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Selva di Mezzo — «gli Antichi» (gli oracolari del bosco anarchico).
- **bioma d'origine**: la **Rovina** del bosco, l'**Altare di Roccia** (pietra tiepida fuori stagione).
- **perché entra**: è la **porta al nodo** della Selva, gated da enigma.
- **aggancio al Cordone / alla Serpe**: i suoi indovinelli **circondano** il senso del Cordone **senza
  pronunciarlo** — i segni «non fatti da zampe», la pietra calda: tutto **fisico**, mai nominato. È il custode
  del tabù fatto personaggio.
