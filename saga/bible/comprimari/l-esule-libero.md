# l'Esule libero — scheda canone (comprimario · Arco 5, la Selva di Mezzo)

> Nome proprio: **dal lessico**. Comprimario **ricorrente** (Arco 5) → Tier 2 compilato.
> È lo **specchio di ciò che l'Esattore potrebbe diventare** — e il volto del **costo** dell'anarchia: la
> libertà-senza-appartenenza. Fuggito dalla Serpe, vive libero nel bosco anarchico; non deve niente a nessuno
> — e non ha **nessuno**. Tesi e antitesi dell'anarchia li porta lui e il **tentatore** (⑤): l'uno vende la
> libertà, l'altro ne mostra il prezzo.

- **specie**: cavallo (di pianura, fuggito nel bosco — un fuori-posto vivente)
- **tipo**: comprimario
- **attribute_ear (dominante)**: cambiare
- **età / mondo**: adulto / la Selva di Mezzo (ma **origine** Gran Ducato: la **Pianura Alta** da cui è fuggito)

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: la **criniera selvatica e incolta** (nessuno lo tiene più) e i **segni sbiaditi di un vecchio
  finimento** — libero, ma **scavato** da ciò che la libertà gli è costata. Non sta mai del tutto fermo: non
  appartiene a nessun luogo, e in nessuno si posa.

### Natura
- **libero, autosufficiente, e un po' vuoto**: parla con orgoglio della libertà, ma sotto c'è una solitudine
  che non nomina.
- è un **cavallo di pianura in un bosco**: il suo stesso esserci storto dice il costo dell'esilio.

### Paura (arco lungo, se ne ha)
- prima emersione: la **solitudine del non appartenere** → tocco: vedere Rocco e Zara che **si tengono** (il
  Cordone, il loro legame) → fioritura (negata): più sente la mancanza, più la chiama «libertà».

### Il dono / la forza
- **conosce il bosco anarchico e sopravvive solo**: può aiutare R&Z **senza dovere a nessuno** — e proprio
  questo lo rende, agli occhi dei due, un monito vivente.

### Arco di crescita (per soglie)
- **specchio**: il costo della libertà reso visibile. Non è il tentatore — è ciò che il tentatore **non dice**.
  Lo scatto possibile: una crepa, una volta, in cui ammette — a sé, non a loro — cosa ha perso.

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **regno + classe**: Selva di Mezzo / «gli Esuli» — la cui regola è *"ognuno conserva la parlata di dove è
  fuggito"*: la sua è quella del **Gran Ducato / «Popolo dell'Aperto»** *(piano, paziente, brontolone)* → per
  il serializzatore il ref concreto è l'**origine**.
- **forestiero?** sì, di fatto: vive fuori dal regno d'origine.

**Tier 2 — firma individuale.**
- **superficie**: parla della libertà, parlata piana di pianura, basta-a-sé. **sotto**: il dolore di non
  appartenere a niente.
- **non direbbe MAI**: ammettere che la libertà gli è **costata l'appartenenza** (insiste di star meglio così).

> **Test (CARTA_VOCE §1.4):** «Non devo niente a nessuno. Vado dove voglio. Sto bene così — sto bene così, davvero.» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: pianura_alta            # Esule: conserva la parlata d'origine (Gran Ducato)
  gruppo: Popolo dell'Aperto
  registro_ref: pianura_alta/Popolo dell'Aperto

voce_personaggio:
  name: <dal lessico>
  role: comprimario
  archetype: l'Esule libero — libero e solo, parla la pianura da cui è fuggito
  underStress: si chiude nell'orgoglio della libertà, nega la mancanza
  ritmo: piana, asciutta, da pianura
  words: non devo niente a nessuno / sto bene così / libero
  never: ammette che la libertà gli è costata l'appartenenza
```

### EAR
- **⟳** *(dominante)* ha **spezzato ogni legame** — la fuga, il cambiamento radicale di vita.
- **⇄** è il ⇄ a cui ha **rinunciato**: l'appartenenza è la sua mancanza, non la sua facoltà (il **costo**).
- **Δ** —

### Mondo affettivo / relazioni
- **l'Esattore pentito** (trasversale): **due strade dalla stessa origine** — l'uno si redime *tornando a
  legarsi*, l'altro resta libero e solo (lega a `esattore-pentito.md`).
- **Rocco e Zara**: imparano da lui, per contrasto, che il Cordone è **appartenenza** — il suo opposto.
- **il tentatore** (⑤): ne è la versione **onesta** (mostra il prezzo che il tentatore tace).

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Selva di Mezzo — «gli Esuli» (origine Gran Ducato, «Popolo dell'Aperto»).
- **bioma d'origine**: la pianura (Gran Ducato); ora vaga nel **Bosco**/**Orlo** anarchico.
- **perché entra**: è la **lezione civica** dell'anarchia vista da vicino — la libertà *senza governo e senza
  legami*, col suo costo.
- **aggancio al Cordone / alla Serpe**: ex-soggetto della Serpe, fuggito; il suo essere libero-e-solo è la
  **prova provata** che la libertà che il tentatore promette ha un prezzo — e prepara il rifiuto del bivio.
