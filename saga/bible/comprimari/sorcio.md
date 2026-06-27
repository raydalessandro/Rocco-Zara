# Sòrcio — scheda canone (comprimario · la Serpe, braccio comico ricorrente)

> **Promozione a scheda-voce.** Sòrcio è già canone in `../../cartografia/regni/pianura_alta/la_serpe.md`
> (il **ratto**: contrabbando e voci, **ambiguo** — a volte si fa corrompere e diventa, per interesse, un
> aiuto temporaneo). È, con **Cècca**, il **braccio comico ricorrente** della Serpe. Qui si rifinisce la
> **voce** e si **toglie lo stereotipo**: non "il ratto vile e furbo", ma **il disastro che si crede un
> fuoriclasse**. Non *un* Mister Bean: **il nostro** — la gag nasce dallo **scarto** fra come si vede e com'è.

- **specie**: ratto (contrabbando e voci, per la Serpe)
- **tipo**: comprimario (antagonista comico ricorrente · **alleanza mobile** · trasversale)
- **attribute_ear (dominante)**: cambiare
- **età / mondo**: adulto / i bassifondi delle **Vie**, ovunque ci sia un buco e un affare

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: **stracarico di refurtiva che gli scivola** di continuo (raccoglie, perde, raccoglie); si
  **nasconde nel posto più sbagliato** con aria soddisfatta; la **posa da gran professionista** smentita da
  una coda che trema. Lo scarto **postura/realtà** è il personaggio.

### Natura
- **si crede un fuoriclasse** del contrabbando — e tutto gli **crolla fra le zampe**. Improvvisa, pasticcia,
  e se la cava per puro caso (o scappando).
- **fedele a uno solo: il proprio quieto vivere**. Un angolo caldo, un boccone, non finire schiacciato:
  per quello vende chiunque — la Serpe come R&Z. La sua ambiguità è **vera**, ed è la sua **utilità**.

### Paura (arco lungo, se ne ha)
- prima emersione: **finire schiacciato / preso** → tocco: ogni volta che un piano gli esplode in faccia →
  fioritura: sotto la spavalderia non c'è un furbo, c'è **un piccolo spaventato** che vuole solo campare. È
  questo a renderlo simpatico invece che odioso.

### Il dono / la forza
- **conosce ogni buco, ogni rotta di contrabbando, ogni voce** del sottobosco: utilissimo **a chi paga**. È
  la **leva**: R&Z possono **corromperlo** e farne un aiuto a tempo (il seme che torna in più archi).

### Arco di crescita (per soglie)
- ricorrente-comico, **alleanza mobile**: non cresce, **cambia lato** secondo la convenienza. Lo scatto
  possibile: una volta resta ad aiutare **un attimo più del dovuto** — e nemmeno lui sa perché — prima di
  sparire col bottino.

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **non è una classe del regno**: è **manovalanza della Serpe** (contrabbando/voci, *cfr.* `la_serpe.md`).
  Ne eredita la **parlata di strada** del Ducato → registro «Mercanti delle Vie» *"rapido, transattivo,
  pettegolo"* (`_voci.json`): patteggia su tutto. La sua vera firma sta nel **Tier 2**.
- **forestiero?** no (creatura dei bassifondi del Ducato).

**Tier 2 — firma individuale.**
- **superficie**: si **annuncia come un professionista** ("un professionista come me…") mentre **patteggia**
  e si **interrompe da solo** per rattoppare il pasticcio in corso. **sotto**: paura pura e fame.
- **non direbbe MAI**: **schierarsi per davvero** (né restare quando c'è da scappare) — l'ambiguità è il suo
  unico principio.

> **Test (CARTA_VOCE §1.4):** «Un professionista come me non si fa vedere… ehm. Facciamo così: io non ho visto niente, tu non hai visto me, e quel sacco lì—no, quello è mio.» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: pianura_alta
  gruppo: Mercanti delle Vie
  registro_ref: pianura_alta/Mercanti delle Vie

voce_personaggio:
  name: Sòrcio
  role: comprimario
  archetype: il contrabbandiere che si crede un fuoriclasse mentre tutto gli crolla intorno — fedele solo al proprio quieto vivere
  underStress: si racconta come un professionista e inciampa, improvvisa, cambia lato per scampare
  ritmo: mezze frasi e patteggiamenti, si interrompe da solo
  words: un professionista come me / io non ho visto niente / facciamo un patto / un topo deve campare
  never: si schiera per davvero (e mai resta quando c'è da scappare)
```

### EAR
- **⟳** *(dominante)* **cambia lato** secondo la convenienza — l'alleanza mobile fatta personaggio.
- **⇄** **connette** i bassifondi (rotte, buchi, voci): la rete di contrabbando passa da lui.
- **Δ** —

### Mondo affettivo / relazioni
- **Cècca**: la sua **spalla** — lei **vede** il colpo, lui lo **manda all'aria**; si accusano a vicenda
  (lega a `cecca.md`). Il loro battibecco è la **commedia** che alleggerisce la caccia.
- **la Serpe**: lo usa e lo paga poco — per questo si lascia comprare **anche** da R&Z.
- **il Mercante delle Vie / l'Esattore pentito**: stesso sottobosco — possibili incroci di affari e voci.

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Gran Ducato — **manovalanza della Serpe** (parlata «Mercanti delle Vie»).
- **bioma d'origine**: i **bassifondi** delle Vie (pedaggi, magazzini, fogne dei mercati).
- **perché entra**: è il **secondo filo comico ricorrente** (con Cècca) — *gioia e varietà* — e una **leva
  corruttibile** che la trama può girare a favore o contro R&Z.
- **aggancio al Cordone / alla Serpe**: tratta il Cordone come **merce** (qualcosa da rubare e rivendere, mai
  da capire) — un altro fraintendimento *materiale*. Vendibile a chiunque: per questo **torna**. Costellazione: `la_serpe.md`.
