# la Leonessa civica — scheda canone (comprimario · Arco 2, la Conca Ruggente)

> Nome proprio: **dal lessico**. Comprimario **ricorrente** (Arco 2) → Tier 2 compilato.
> È lo **specchio interiore di Rocco** nel secondo arco: lei lo costringe a chiedersi *a che serve*
> la sua forza. La Conca è il libero comune (Brescia «la Leonessa»): qui **si vale per ciò che si dà**.

- **specie**: leonessa (lo **stemma** del regno — lei ne è il cuore vivo)
- **tipo**: comprimario
- **attribute_ear (dominante)**: connettere
- **età / mondo**: giovane / la Conca Ruggente, il **Cuore** civico (Forterocca)

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: **i segni del servizio**, non dell'ornamento — una **cicatrice presa sulle mura**, le
  zampe consumate dal lavoro fatto *per il comune*. Sta dritta come chi ha **già dato** e lo rifarebbe.
  Niente grazia da erede (è il rovescio dello Specchio di Zara): la sua fierezza è **guadagnata**.

### Natura
- **solenne, fiera, collettiva**: pensa e parla in **«noi»**. Il comune libero è la sua casa e la sua misura.
- non capisce chi **non contribuisce**: per lei chi non dà, semplicemente **non c'è**.

### Paura (arco lungo, se ne ha)
- prima emersione: quando la Conca è minacciata **da dentro** → tocco: il sospetto, mai detto, che lei
  **valga solo per ciò che dà** — se smettesse di servire, sarebbe nulla → fioritura: vedere Rocco capovolge
  la domanda (lui crede di valere meno perché **rompe**; lei, di valere solo perché **dà**: stessa ferita, rovescio).

### Il dono / la forza
- **la dedizione civica**: organizza, difende, tiene insieme. Dove lei mette mano, il comune **regge**.

### Arco di crescita (per soglie)
- da **giudice di Rocco** («grande e basta») a **alleata** — lo scatto è quando vede la forza di Rocco
  **servire** invece di spaccare: la prova che cercava, e insieme la crepa nella sua stessa ferita.

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **regno + classe**: Conca Ruggente / «i Protettori» → registro *"solenne, fermo, collettivo («noi»)"* (`_voci.json`).
- **forestiero?** no (è il cuore del regno).

**Tier 2 — firma individuale.**
- **superficie**: parla in **«noi»**, solenne, sprona, chiama al dovere. **sotto**: il timore — mai ammesso —
  di non essere niente fuori da ciò che dà al comune.
- **non direbbe MAI**: un **«io»** dove direbbe **«noi»**, né ammettere un **bisogno suo**. La crepa personale
  resta sotto il plurale.

> **Test (CARTA_VOCE §1.4):** «Da noi non si chiede *chi sei*. Si chiede *cosa porti*.» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: laghi_oriente
  gruppo: i Protettori
  registro_ref: laghi_oriente/i Protettori

voce_personaggio:
  name: <dal lessico>
  role: comprimario
  archetype: la fierezza civica del libero comune — solenne, collettiva, di servizio
  underStress: si rifugia nel «noi», irrigidisce il dovere, alza la guardia del comune
  ritmo: frase solenne e ferma, al plurale
  words: noi della Conca / il comune tiene / chi dà, vale
  never: dice «io» dove direbbe «noi», o ammette un bisogno suo
```

### EAR
- **⇄** *(dominante)* è **connessa** al comune fino a confondersi con esso — il «noi» è la sua pelle.
- **Δ** distingue **chi contribuisce da chi no** (e con ciò ferisce Rocco, che crede di non dare nulla).
- **⟳** può **cambiare** la sua misura del valore — lo scatto, vedendo la forza di Rocco *servire*.

### Mondo affettivo / relazioni
- **la Conca**: tutto. Il comune libero è famiglia, misura, identità.
- **Rocco**: lo giudica «grande e basta» → poi lo riconosce. La loro tensione **è** la prova del secondo arco.

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Conca Ruggente — «i Protettori» (la classe civica del comune libero).
- **bioma d'origine**: il **Cuore** civico, le mura di Forterocca.
- **perché entra**: è lo **specchio sociale di Rocco** — mette alla prova la sua forza chiedendole *di servire*.
- **aggancio al Cordone / alla Serpe**: la sua sfida a Rocco è il **cuore emotivo dell'Arco 2**; ed è lei a
  fiutare per prima che la minaccia alla Conca viene **da dentro** (apre la pista del quinto colonna).
