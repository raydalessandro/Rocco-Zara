# l'aiutante Arlecchino — scheda canone (comprimario · Arco 2, la Conca Ruggente)

> Nome proprio: **dal lessico**. Comprimario **ricorrente** (Arco 2) → Tier 2 compilato.
> È l'**aiuto + il seme** del secondo arco, nella maniera **Arlecchino/Brighella** (Bergamo): vuole aiutare,
> combina pasticci, e **per sbaglio risolve**. Il suo caos accidentale **apre una porta** — e ne semina un'altra.

- **specie**: scoiattolo *(regolabile)* — svelto, indaffarato, terragno
- **tipo**: comprimario
- **attribute_ear (dominante)**: cambiare
- **età / mondo**: adulto / le **conche** e i mercati della Conca Ruggente

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: **le guance sempre piene** (porta sempre più di quanto può tenere) e un **ciuffo** che non
  sta giù. È l'Arlecchino che giocoliera con troppe cose: ne perde una, ne acchiappa due.

### Natura
- **terragno, svelto, comico, furbo-bonario**: chiacchiera a raffica, si offre sempre, **sa tutto di tutti**.
- buono di cuore; la sua furbizia è da bottega, non da inganno — vuole **essere utile** più di ogni cosa.

### Paura (arco lungo, se ne ha)
- non in primo piano. Il suo motore è il **bisogno di servire a qualcosa**: il pasticcio nasce da lì.

### Il dono / la forza
- **conosce ogni scorciatoia e ogni pettegolezzo** della Conca: passaggi, mercati, chi deve un favore a chi.
  Il suo **disordine** scopre ciò che l'ordine teneva nascosto.

### Arco di crescita (per soglie)
- minimo (è il sollievo comico e il motore degli equivoci). Lo scatto, se c'è: una volta il suo pasticcio
  **salva** davvero — e per un istante lui **lo sa**, prima di rovinare di nuovo tutto con la modestia.

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **regno + classe**: Conca Ruggente / «Gente delle Conche» → registro *"terragno, svelto, comico, furbo-bonario"*
  (`_voci.json`) — la maschera Arlecchino/Brighella.
- **forestiero?** no (popolano della Conca fino al midollo).

**Tier 2 — firma individuale.**
- **superficie**: chiacchiera svelta, comica, si propone per ogni cosa ("ci penso io!"). **sotto**: un cuore
  che ha solo paura di non servire a niente.
- **non direbbe MAI**: ammettere di aver **combinato un pasticcio** — lo gira sempre in *"era il piano"*.

> **Test (CARTA_VOCE §1.4):** «Tranquilli, ci penso io — due passi e siamo… ecco, *quasi* arrivati. Era il piano.» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: laghi_oriente
  gruppo: Gente delle Conche
  registro_ref: laghi_oriente/Gente delle Conche

voce_personaggio:
  name: <dal lessico>
  role: comprimario
  archetype: l'aiutante-Arlecchino — svelto, comico, furbo-bonario
  underStress: parla più in fretta, improvvisa, combina pasticci che a volte risolvono
  ritmo: chiacchiera svelta, comica, a raffica
  words: ci penso io / era il piano / due passi e siamo
  never: ammette di aver combinato un pasticcio
```

### EAR
- **⟳** *(dominante)* i suoi pasticci **cambiano le carte**: il caso che fa quel che il piano non riusciva.
- **⇄** **connette**: conosce tutti, incrocia i fili (è lui che, senza volere, mette in contatto chi serve).
- **Δ** —

### Mondo affettivo / relazioni
- **la Conca**: la sua piazza, il suo pubblico.
- **Rocco**: lo adotta come spalla (il piccolo svelto e il grande lento — coppia comica fisica).

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Conca Ruggente — «Gente delle Conche» (popolani, mercati e conche).
- **bioma d'origine**: le **Vie** e i mercati della Conca.
- **perché entra**: porta l'**aiuto** — e il **seme**: un suo equivoco rotola e innesca qualcosa di più grande.
- **aggancio al Cordone / alla Serpe**: il suo pasticcio fa **inciampare** la trama del quinto colonna
  (il caso che scopre il traditore), e apre per sbaglio la via alla salita del Montanaro.
