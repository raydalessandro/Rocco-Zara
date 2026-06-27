# Cècca — scheda canone (comprimario · la Serpe, braccio comico ricorrente)

> **Promozione a scheda-voce.** Cècca è già canone in `../../cartografia/regni/pianura_alta/la_serpe.md`
> (la **gazza**, la spia: la *prima* a notare i Forestieri e il Cordone). È, col **Sòrcio**, il **braccio comico
> ricorrente** della Serpe — i due che i protagonisti incontrano **più spesso del vertice**. Qui si rifinisce
> la **voce** e, soprattutto, si **toglie lo stereotipo**: non "l'uccello avido e scemo", ma **la miglior spia
> tradita dal proprio occhio**. Non *una* gazza ladra: **la nostra**.

- **specie**: gazza (la spia della Serpe)
- **tipo**: comprimario (antagonista comico ricorrente · trasversale a tutti gli archi)
- **attribute_ear (dominante)**: distinguere
- **età / mondo**: adulta / ovunque, davanti alla Serpe (gli **occhi** che precedono la caccia)

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: **lo scatto della testa** verso ogni riflesso — l'occhio è già **altrove**, su qualcosa che
  brilla, anche mentre ti parla. Rigira fra le penne **frammenti lucenti** che non riesce a lasciare. La gazza
  non è goffa: è **precisa** — finché qualcosa non luccica.

### Natura
- **l'occhio più acuto della Serpe**: vede per prima, coglie il dettaglio che a tutti sfugge. Davvero brava.
- e **davvero condannata**: la stessa facoltà che la rende la migliore — l'occhio che cattura tutto — cattura
  anche **ogni luccichio**, e a metà colpo la tradisce.

### Paura (arco lungo, se ne ha)
- prima emersione: **non essere presa sul serio** → tocco: vedere Artiglio prendersi il merito di ciò che lei
  ha **scoperto** → fioritura (amara-comica): più ci tiene a fare bella figura, più un riflesso la frega sul
  più bello. La sua tragedia è una commedia: sa di valere, e il luccichio non la lascia dimostrarlo.

### Il dono / la forza
- **trova R&Z per prima, ogni volta**: è la **minaccia vera** che pulsa **fra** i fallimenti comici. Quando
  riferisce davvero, la caccia parte. È il motivo per cui la Serpe sa qualcosa — e il motivo per cui, spesso,
  lo sa **a metà**.

### Arco di crescita (per soglie)
- ricorrente-comica: non "cresce", **rincorre il rispetto**. Lo scatto possibile: una volta porta il rapporto
  **fino in fondo** — e per un attimo è temibile sul serio — prima che il prossimo bagliore la riprenda.

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **non è una classe del regno**: è **manovalanza della Serpe** (bassi informatori, *cfr.* `la_serpe.md`).
  Ne eredita la **parlata di strada** del Ducato → registro «Mercanti delle Vie» *"rapido, transattivo,
  pettegolo"* (`_voci.json`): la chiacchiera svelta del sottobosco delle Vie. La sua vera firma sta nel **Tier 2**.
- **forestiera?** no (creatura del Ducato, al servizio della Serpe).

**Tier 2 — firma individuale.**
- **superficie**: elenco **rapido e preciso** di ciò che ha visto (dettagli che nessun altro ha colto) —
  poi **si spezza di colpo** quando qualcosa brilla. **sotto**: la fame di essere creduta brava.
- **non direbbe MAI**: **finire un rapporto** se qualcosa luccica (è il discriminante: la frase resta a metà,
  sempre).

> **Test (CARTA_VOCE §1.4):** «L'ho vista io per prima: la tigre, il cordone, il rinoceronte che zoppica del—aspetta, cos'è quel—» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: pianura_alta
  gruppo: Mercanti delle Vie
  registro_ref: pianura_alta/Mercanti delle Vie

voce_personaggio:
  name: Cècca
  role: comprimario
  archetype: la miglior spia della Serpe tradita dal proprio occhio — vede tutto per prima, si perde dietro ogni luccichio
  underStress: nota ancora di più, ma ogni riflesso la strappa via e il rapporto si sbriciola
  ritmo: elenco rapido e preciso di dettagli, spezzato di colpo a metà
  words: l'ho vista io per prima / piccolo particolare / aspetta, cos'è quel—
  never: finisce un rapporto se qualcosa luccica
```

### EAR
- **Δ** *(dominante)* **distingue** per prima — l'occhio migliore della Serpe. La beffa: lo stesso Δ che
  coglie il Cordone coglie ogni bagliore, e lì si perde.
- **⇄** —
- **⟳** —

### Mondo affettivo / relazioni
- **Sòrcio**: la sua **spalla** nel duo comico — lei **vede** l'occasione, lui la **inciampa**. Si rinfacciano
  i fallimenti a vicenda (lega a `sorcio.md`): il loro battibecco è il **respiro leggero** della saga.
- **Artiglio**: il "serio" che incassa il merito di ciò che lei scopre — il suo cruccio.
- **la Serpe**: la usa come occhi, senza fidarsene per altro.

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Gran Ducato — **manovalanza della Serpe** (parlata «Mercanti delle Vie»).
- **bioma d'origine**: le **Vie** e i tetti delle città del Ducato (da cui spia).
- **perché entra**: è il **filo comico ricorrente** che dà *gioia e varietà* alla caccia (contrappeso alla
  minaccia seria di Artiglio) — e la ragione per cui la Serpe trova sempre la pista… **a metà**.
- **aggancio al Cordone / alla Serpe**: è la **prima** a vedere il Cordone (lo prende per "refurtiva
  luccicante" — un fraintendimento *fisico*, mai la verità). Costellazione: `la_serpe.md`.
