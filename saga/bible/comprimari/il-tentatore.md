# il tentatore — scheda canone (comprimario · Arco 5, la Selva di Mezzo · il bivio)

> Nome proprio: **dal lessico**. Comprimario ricorrente (Arco 5) → Tier 2 compilato.
> È il **bivio fatto persona** (pattern **Lucignolo**): affascinante, tenta Rocco o **Zara** a **mollare il
> Cordone** e **restare** liberi nel bosco. È pericoloso perché è **in parte nel giusto**: la libertà del bosco
> è vera, il Cordone **pesa** davvero. Parla la voce della **forestiera** — e mira dritto alla ferita di Zara.

- **specie**: cervo (lo **stemma** della Selva — la libertà selvatica fatta magnificenza)
- **tipo**: comprimario
- **attribute_ear (dominante)**: cambiare
- **età / mondo**: adulto / la Selva di Mezzo, ovunque nel **Bosco** libero

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: **magnifico e senza peso** — si muove nel bosco come chi non possiede niente e tutto; il
  **palco alto**, mai chinato. È la **cosa più bella** dell'arco: la libertà che si vede. (E in quella bellezza, il rischio.)

### Natura
- **carismatico, persuasivo, felice** (o così pare): rende **visibile** il peso del Cordone e chiede, dolce,
  *«perché lo porti?»*. Offre il **presente verde, infinito**, senza domani e senza nodi.
- non è cattivo: **ci crede** — ed è questo a renderlo la tentazione più forte.

### Paura (arco lungo, se ne ha)
- prima emersione (nascosta): che la sua libertà sia anche una **fuga**, e che da solo non basti → tocco: chi
  rifiuta il suo invito → fioritura (mai mostrata): tenta gli altri perché gli serve **compagnia nella sua scelta**.

### Il dono / la forza
- il suo **fascino è reale**: la libertà del bosco è davvero bella, il Cordone davvero **greve**. È la
  tentazione più potente proprio perché è **in parte vera**.

### Arco di crescita (per soglie)
- **il bivio**: la prova non è sconfiggerlo, è **rifiutarlo** — e capire **perché**. Lo scatto è di **Rocco e
  Zara**: scoprire che il Cordone è **appartenenza**, non catena, e che il loro **legame** è la risposta.

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **non un regno**: la sua è la **voce forestiera** — chi non appartiene a nessun luogo → chiave trasversale
  `trasversali/forestiera` (`_voci.json`). È il punto: **vende** il non-appartenere come libertà.
- **forestiero?** **sì, per scelta e per vanto** (è la sua intera tesi).

**Tier 2 — firma individuale.**
- **superficie**: fascino senza sforzo, dipinge la vita libera come gloria, fa suonare il Cordone come una
  **fune al collo** («perché lo porti?»). **sotto**: il vuoto di chi ha bisogno che altri **scelgano come lui**.
- **non direbbe MAI**: ammettere che la sua libertà è anche una **fuga** (o che è **solo**).

> **Test (CARTA_VOCE §1.4):** «Tu sei già forestiera — come me. Posa quel nodo. Resta. Qui nessuno ti chiede di essere di nessuno.» → si capisce chi parla (e a chi mira).

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: trasversale
  gruppo: forestiera
  registro_ref: trasversali/forestiera

voce_personaggio:
  name: <dal lessico>
  role: comprimario
  archetype: il tentatore — il cervo libero, affascinante, il bivio fatto persona (Lucignolo)
  underStress: intensifica il fascino, fa pesare di più il Cordone
  ritmo: suadente, aperto, senza fretta
  words: perché lo porti? / sei già libera / resta / nessun nodo
  never: ammette che la sua libertà è anche una fuga (o che è solo)
```

### EAR
- **⟳** *(dominante)* è il **bivio**: vuole **deviare** R&Z dalla via, far **cambiare** loro strada.
- **⇄** offre una **falsa appartenenza** — al nulla, alla libertà-senza-legami (l'anti-Cordone).
- **Δ** —

### Mondo affettivo / relazioni
- **Zara**: il bersaglio d'elezione — è **forestiera** come lui, e lui le offre di **smettere di cercare un
  posto** facendone una virtù. Mira **esattamente** alla sua ferita («troppo piccola / senza riflesso»).
- **l'Esule libero** (①): ne è la **versione onesta** — il tentatore vende la libertà, l'Esule ne paga il prezzo.

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Selva di Mezzo — **voce forestiera** (appartiene a nessun luogo, per tesi).
- **bioma d'origine**: il **Bosco** libero (l'anarchia fatta seduzione).
- **perché entra**: è il **bivio** dell'arco — il pattern Lucignolo, la prova-cardine prima del finale.
- **aggancio al Cordone / alla Serpe**: il **rifiuto** del tentatore è il punto in cui R&Z **capiscono** il
  Cordone (appartenenza scelta, non catena). Non è della Serpe — ma fa il suo gioco: *mollare il Cordone*. La
  Serpe **taglia** i legami; lui invita a **non farne** — due vie allo stesso vuoto.
