# le Creature della Rovina — scheda canone (comprimario collettivo · Arco 5, la Selva di Mezzo)

> Nome proprio: **collettivo** (un **coro**, non un singolo). Comprimario ricorrente (Arco 5) → Tier 2 come
> **firma corale**. Sono gli abitanti **uncanny** delle rovine: cantano **filastrocche notturne** in rima,
> inquietanti e infantili. È il **cuore strano** prima del finale. *In questo slot* il **Cacciatore**
> (trasversale, `cacciatore.md`) **chiude la sua caccia a Toraki**.

- **specie**: piccole creature notturne della rovina (un **coro**: pipistrelli, civette, grilli — il bosco-
  rovina che canta). *Naturalistiche, ma la rovina le rende perturbanti.*
- **tipo**: comprimario collettivo
- **attribute_ear (dominante)**: cambiare
- **età / mondo**: senza età / la Selva di Mezzo, la **Città-rovina della Selva** (di notte)

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: **occhi nel buio**, sagome che **non si mettono a fuoco**; appaiono **fra le pietre rotte**
  solo di notte; scala infantile, movimento **storto**. Reali — ma la rovina le fa **sbagliate**.

### Natura
- **cantilenanti, in rima, inquietanti e infantili**: non ostili, ma **perturbanti**. Sanno le cose **in
  filastrocca** — cantano frammenti che poi **contano**.
- la rovina **ricorda attraverso di loro**, senza che loro capiscano cosa cantano.

### Paura (arco lungo, se ne ha)
- non in primo piano (sono atmosfera che parla). Inquietano, non temono.

### Il dono / la forza
- le loro **filastrocche nascondono indizi** (la memoria della rovina in rima): R&Z devono **ascoltare** il
  canto storto per trovare la via — e per sentire che **qui Toraki è passato**.

### Arco di crescita (per soglie)
- nessuno (è un coro). La sua "soglia" è **scenica**: l'istante in cui una filastrocca, ascoltata bene,
  **apre** qualcosa.

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **regno + classe**: Selva di Mezzo / «Creature della Rovina» → registro *"cantilenante, in rima, un po'
  inquietante e infantile"* (`_voci.json`). *Per un coro, questo **è** già la voce.*
- **forestiero?** no (sono la rovina stessa).

**Tier 2 — firma corale.**
- **superficie**: **filastrocca notturna**, rima infantile **storta**, ipnotica. **sotto**: la memoria della
  rovina che canta **senza capirsi**.
- **non direbbe MAI**: parlare in **prosa piana** o **spiegare** (cantano soltanto — e mai nominano la cosa).

> **Test (CARTA_VOCE §1.4):** «Gira gira, chi resta resta — la pietra dorme, non guardar di sotto…» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: selva_di_mezzo
  gruppo: Creature della Rovina
  registro_ref: selva_di_mezzo/Creature della Rovina

voce_personaggio:
  name: le Creature della Rovina
  role: comprimario
  archetype: il coro uncanny della rovina — cantilenante, in rima, inquietante e infantile
  underStress: la filastrocca si fa più fitta e storta, ipnotica
  ritmo: filastrocca notturna, in rima, ipnotica
  words: gira gira / chi resta resta / la pietra dorme / non guardar di sotto
  never: parla in prosa piana o spiega
```

### EAR
- **⟳** *(dominante)* l'**uncanny** che destabilizza — la presenza che sposta la percezione, da sogno.
- **Δ** —
- **⇄** —

### Mondo affettivo / relazioni
- **uno degli Antichi** (②): **affini** — anche le filastrocche, come gli enigmi, **circondano** il senso
  senza dirlo (tabù-safe).
- **il Cacciatore** (`cacciatore.md`, trasversale): **qui chiude su Toraki** — la sua caccia di taglie alla
  precorrenza di Toraki **si risolve** fra queste rovine (lo raggiunge / lo perde: la convergenza che il
  serializzatore farà pagare). Il coro fa da **scenario** alla scena di Toraki.

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Selva di Mezzo — «Creature della Rovina».
- **bioma d'origine**: la **Città-rovina della Selva** (di notte).
- **perché entra**: sono il **cuore strano** dell'arco — l'atmosfera perturbante che precede il finale, e i
  cui canti **portano indizi** (anche su Toraki).
- **aggancio al Cordone / alla Serpe**: le filastrocche **circondano** il senso del Cordone — frammenti su
  «chi resta / chi lascia», sulla pietra che dorme: tutto **fisico**, mai spiegato. Tabù protetto anche nel canto.
