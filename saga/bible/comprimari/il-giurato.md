# il Giurato della parola data — scheda canone (comprimario · Arco 2, la Conca Ruggente)

> Nome proprio: **dal lessico**. Comprimario **ricorrente** (Arco 2, **può tornare**) → Tier 2 compilato.
> È il **secondo che genera trama**: ha una **linea propria**. Un soldato-contadino di confine legato da un
> **giuramento** che cozza con la missione — l'agonia di **due lealtà** (la maniera d'onore alla Salgari).

- **specie**: orso bruno (di confine — ruvido, enorme, lento a parlare)
- **tipo**: comprimario
- **attribute_ear (dominante)**: connettere
- **età / mondo**: adulto / l'**Orlo** della Conca, i confini verso la Serpe e l'Aquila

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: le **cicatrici sugli avambracci** — una per ogni parola tenuta a costo del sangue. Sta fermo
  come un masso; quando dà la mano (la zampa), la stretta è un **patto**.

### Natura
- **ruvido, breve, di parola data**: *"detto è detto"*. Rigido sull'onore fino al dolore.
- non mente, non gira: la parola, per lui, è l'unica cosa che un essere **possiede davvero**.

### Paura (arco lungo, se ne ha)
- prima emersione: trovarsi a dover **scegliere fra due parole date** → tocco: capire che mantenerne una
  significa tradirne un'altra → fioritura: l'unico terrore che lo spezza è **mancare a un giuramento** —
  e l'arco lo mette esattamente lì.

### Il dono / la forza
- **la sua parola vale assoluto**: al confine, è legge. Più la forza dell'orso. Quando è dalla tua parte,
  è una **roccia**; quando è vincolato contro, è un muro.

### Arco di crescita (per soglie)
- **linea propria**: comincia **vincolato** (un giuramento lo obbliga a ostacolare, o a non aiutare) → lo scatto
  è quando trova il modo di **tenere l'onore senza tradire il giusto** (scioglie il nodo morale, non lo rompe).
  Da qui il suo possibile **ritorno** più avanti, come alleato che *deve* un patto a R&Z.

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **regno + classe**: Conca Ruggente / «i Giurati» → registro *"ruvido, breve, di parola data"* (`_voci.json`).
- **forestiero?** no (è il confine fatto persona).

**Tier 2 — firma individuale.**
- **superficie**: corta, ruvida, perentoria — *"detto è detto"*. **sotto**: un onore che lo **imprigiona**
  quanto lo regge.
- **non direbbe MAI**: **rompere una parola data** — nemmeno quella sbagliata. (È il vincolo che genera la trama.)

> **Test (CARTA_VOCE §1.4):** «Ho giurato. Detto è detto. Anche se mi pesa come il monte.» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: laghi_oriente
  gruppo: i Giurati
  registro_ref: laghi_oriente/i Giurati

voce_personaggio:
  name: <dal lessico>
  role: comprimario
  archetype: il Giurato della parola data — ruvido, breve, d'onore
  underStress: si irrigidisce sul giuramento, ripete «detto è detto»
  ritmo: frase corta, ruvida, perentoria
  words: detto è detto / la mia parola / il confine tiene
  never: rompe una parola data, anche quella sbagliata
```

### EAR
- **⇄** *(dominante)* la **parola che lega**: un giuramento è un **nodo** morale (rima scommovente e involontaria
  col Cordone — lui annoda *promesse*, non pietre).
- **Δ** —
- **⟳** se il nodo morale si **scioglie**, lui cambia schieramento — ed è lo scatto del suo arco.

### Mondo affettivo / relazioni
- **il confine, il comune**: ciò che ha giurato di tenere.
- **R&Z**: vincolato verso di loro in modo **ambiguo** (la sua parola li ostacola prima di poterli aiutare).

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Conca Ruggente — «i Giurati» (soldati-contadini di confine).
- **bioma d'origine**: l'**Orlo** / le marche verso Serpe e Aquila.
- **perché entra**: è il **motore di sottotrama** dell'arco — un'**agonia d'onore** che incrocia la missione
  e la trattiene.
- **aggancio al Cordone / alla Serpe**: il suo giuramento può essere stato **estorto** o **sfruttato** dalla
  Serpe ai confini; scioglierlo apre un varco — e lo rende, dopo, un alleato che a R&Z **deve un patto**.
