# il custode delle Pietre del Leone — scheda canone (comprimario · Arco 6, le Terre del Leone · FINALE)

> Nome proprio: **dal lessico** (o **senza nome**). Comprimario ricorrente (Arco 6) → Tier 2 compilato.
> È il **custode del terminus**: cura le **pietre più antiche** — il Luogo più grande, dove Zara annoda
> **l'ultimo nodo** e si compie la **consegna**. È il terzo (e ultimo) dei **custodi della pietra** della saga
> (dopo il Custode dei Laghi e l'Antico della Selva): la **rima di chiusura**. Qui **Toraki aspetta**.
>
> **Tabù assoluto:** la cosmologia vive nelle sue **zampe** (il curare), **mai** nella bocca. Incarna due
> guardrail del finale: *mostra la porta, non chi la attraversa* — e *compie senza capire perché sia suo*.

- **specie**: asino (vecchio — umile, paziente, fuori dal tempo)
- **tipo**: comprimario
- **attribute_ear (dominante)**: connettere
- **età / mondo**: molto vecchio / le Terre del Leone, **le Pietre del Leone** (la **Rovina** più antica, il terminus)

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: **grigio di muso, consumato come le pietre** che cura; le zampe **conoscono ogni lastra**.
  Lo si vede **rassettare, sgombrare, tenere pulito** — un gesto umile ripetuto da una vita. Occhi caldi, pazienti.

### Natura
- **umile, paziente, fuori dal tempo**: cura le pietre perché **le curavano i suoi prima di lui**. Sa che la
  pietra è **tiepida** anche di notte e che certi segni **non li hanno fatti zampe** — ma **non sa perché**, e
  **non lo chiede**.
- la sua pace è quella di chi **tiene**, senza domandare.

### Paura (arco lungo, se ne ha)
- non in primo piano. La sola inquietudine è che le pietre restino **scoperte e fredde** — e a quello rimedia
  curandole.

### Il dono / la forza
- **conosce la consegna**: mostra a Zara **dove e come posare il Cordone** — il **ritornello della pietra
  tiepida** (annodare, posare, lasciare per **chi viene dopo**). È il custode del **passaggio in avanti**.

### Arco di crescita (per soglie)
- minimo (è una soglia vivente). Lo scatto è **scenico**: il gesto con cui indica la lastra giusta — e poi **si
  fa da parte**, perché il nodo è di Zara, non suo.

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **non un regno**: parla la **voce antica** — fuori dal tempo, kin della **cicala** → chiave trasversale
  `trasversali/antica` (`_voci.json`). Ma **umile**, non oracolare: non enigmi (come l'Antico), bensì parole
  **piane e consumate** dal lungo tempo.
- **forestiero?** no — è più radicato del regno: appartiene alle **pietre**.

**Tier 2 — firma individuale.**
- **superficie**: piano, lento, caldo; parla delle pietre come di vecchie conoscenti («le tengo pulite»).
  **sotto**: la pace di **non sapere il perché** — e di tenere lo stesso.
- **non direbbe MAI**: **spiegare** cosa significano le pietre (non lo sa) — né **mostrare chi attraversa** la
  soglia (mostra la **porta**, non l'oltre).

> **Test (CARTA_VOCE §1.4):** «Le tengo pulite, ecco tutto. Sono tiepide — sempre. Il resto è di chi viene dopo. Posa qui, e va'.» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: trasversale
  gruppo: antica
  registro_ref: trasversali/antica

voce_personaggio:
  name: <dal lessico / senza nome>
  role: comprimario
  archetype: il custode delle Pietre — umile, paziente, fuori dal tempo; cura le pietre senza chiederne il perché
  underStress: torna al gesto — spazza, rassetta, tace
  ritmo: piano, lento, caldo, fuori dal tempo
  words: le tengo pulite / sono tiepide, sempre / chi viene dopo
  never: spiega cosa significano le pietre (non lo sa) o mostra chi attraversa la soglia
```

### EAR
- **⇄** *(dominante)* è il custode del **passaggio in avanti**: la **consegna** lega quest'età alla prossima —
  mai detto, solo **fatto** (posare per chi viene dopo).
- **Δ** —
- **⟳** —

### Mondo affettivo / relazioni
- **Toraki** (`../toraki.md`): **aspetta qui**. Il custode è la presenza paziente che ha **atteso accanto a
  lui** il compiersi del Cordone — la cornice del **ricongiungimento** dei due fratelli (bianco↔arancione).
- **la cicala** (`voce-che-torna.md`) · **il Custode** (Arco 1) · **l'Antico** (Arco 5): i **custodi della
  pietra** — qui la loro linea si **chiude**.

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Terre del Leone — voce **antica** (appartiene alle Pietre).
- **bioma d'origine**: **le Pietre del Leone** (il Luogo più antico, il terminus; pietra tiepida fuori stagione).
- **perché entra**: porta all'**ultimo nodo** e mostra la **consegna** (il ritornello della pietra tiepida).
- **aggancio al Cordone / alla cosmologia**: è il **finale fatto persona** — annodare, posare, **lasciare**.
  La stranezza resta tutta **fisica** (la pietra calda, i segni non di zampe); il senso, **mai** pronunciato.
  Mostra la **porta che si apre**, non chi la attraversa.
