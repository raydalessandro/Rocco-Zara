# la Pantera — scheda canone (comprimario · Arco 6, le Terre del Leone · FINALE)

> Nome proprio: **dal lessico**. Comprimario ricorrente (Arco 6) → Tier 2 compilato.
> È **Lucca** (**la Pantera libera**): riservata, fiera, sobria, *«di seta»*. La **wildcard** del finale —
> ambigua **per disciplina**, non per inganno. È leale a **una cosa sola: la sopravvivenza della sua città**.
> De-stereotipata: non "la traditrice viscida", ma la **piccola potenza che si salva non scoprendosi mai**.
> *In questo slot* maturano anche il **redde rationem del Cacciatore** (`cacciatore.md`) e **l'ultima mano della
> Serpe** (`artiglio.md`/`bissa.md`) — esistenti: qui la Pantera è la pedina che tutti vorrebbero, e nessuno legge.

- **specie**: pantera (lo **stemma** di Lucca — la città di seta)
- **tipo**: comprimario
- **attribute_ear (dominante)**: distinguere
- **età / mondo**: adulta / le Terre del Leone, **Lucca** (la repubblica mercantile discreta)

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: **liscia, immacolata, composta**; il muso **non rivela nulla**; si muove **senza rumore**, «di
  seta». L'inclinazione misurata del capo che **non concede** una sola lettura.

### Natura
- **riservata, fiera, sobria**: tiene il proprio consiglio; legge **tutti**, mostra **niente**. La sua
  ambiguità è **calcolo di sopravvivenza**, non doppiezza: è *di seta* — liscia, **non falsa**.
- leale solo a **Lucca**: aiuta o ostacola secondo ciò che serve alla città — e lo fa così piano che non lo vedi.

### Paura (arco lungo, se ne ha)
- prima emersione (nascosta): che la sua **piccola città** venga inghiottita dai grandi → tocco: ogni potenza
  che si allarga (la Serpe, le gare che degenerano) → fioritura: si fa **ancora più impenetrabile**, e non si scopre.

### Il dono / la forza
- è una **giocatrice silenziosa potentissima**: controlla un passaggio / una risorsa-chiave (le vie di seta, la
  discrezione di Lucca). Se **convinta** che aiutare R&Z **serve Lucca**, è un'alleata formidabile e sottile;
  altrimenti, **chiude la via senza un rumore**.

### Arco di crescita (per soglie)
- **wildcard**: non cambia carattere, cambia **calcolo**. Lo scatto è quando R&Z le mostrano che la **loro**
  causa coincide con la **sopravvivenza** di Lucca — e allora, di seta, **apre l'ultimo tratto**.

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **regno + classe**: Terre del Leone / «la Pantera libera» → registro *"riservato, fiero, sobrio, 'di seta'"*
  (`_voci.json`).
- **forestiero?** no (è Lucca: discreta, ma del tutto del regno).

**Tier 2 — firma individuale.**
- **superficie**: sobria, minima, cortese, **non scopre nulla** («Lucca osserva»). **sotto**: la devozione
  fredda alla sopravvivenza della sua città.
- **non direbbe MAI**: **scoprire la propria mano** — né impegnarsi **prima del necessario** (e mai una parola alta o calda).

> **Test (CARTA_VOCE §1.4):** «Lucca osserva. A suo tempo si vedrà da che parte conviene stare. Non prima.» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: toscana
  gruppo: la Pantera libera
  registro_ref: toscana/la Pantera libera

voce_personaggio:
  name: <dal lessico>
  role: comprimario
  archetype: la Pantera di Lucca — riservata, fiera, sobria, «di seta»; ambigua per disciplina
  underStress: si fa ancora più liscia e impenetrabile, non si scopre
  ritmo: sobrio, misurato, levigato, mai una parola di troppo
  words: Lucca osserva / a suo tempo / si vedrà / di seta
  never: scopre la propria mano (o si impegna prima del necessario)
```

### EAR
- **Δ** *(dominante)* **legge tutti e non si scopre** — la calcolatrice *di seta* (distingue gli interessi con
  precisione fredda, rivela niente).
- **⇄** —
- **⟳** può **aprire o chiudere** la via — ma **per Lucca**, non per loro.

### Mondo affettivo / relazioni
- **la sua città, Lucca**: l'unica lealtà.
- **il Cacciatore** (`cacciatore.md`) e **la Serpe** (`artiglio.md`/`bissa.md`): qui maturano il **redde
  rationem** del Cacciatore e l'**ultima mano** della Serpe — entrambi vorrebbero **usare** la Pantera; la sua
  **illeggibilità** è la posta in gioco (chi la convince, sblocca il finale).
- **Rocco e Zara**: la devono **convincere** col solo argomento che la muove — *l'interesse di Lucca*.

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Terre del Leone — «la Pantera libera» (Lucca, repubblica mercantile discreta).
- **bioma d'origine**: il **Cuore** di Lucca (le vie di seta).
- **perché entra**: è il **wildcard politico** del finale, dentro «la rivalità che degenera» (le gare che si
  fanno fazione) — e la **lezione civica**: la sopravvivenza del **piccolo fra i grandi**.
- **aggancio al Cordone / alla Serpe**: né con l'uno né con l'altra **per principio** — solo per Lucca; il suo
  eventuale aiuto **sblocca l'ultimo tratto** verso le Pietre.
