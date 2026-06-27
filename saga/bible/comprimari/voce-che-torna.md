# la Voce che torna — scheda canone (comprimario · trasversale, di tutta la saga)

> Nome proprio: **dal lessico**. Comprimario **ricorrente e trasversale** (non di un arco): la
> **coscienza che torna**, ricalcata sul **Grillo Parlante** di Collodi. Tier 2 compilato.
>
> ⚠️ **TABÙ — il più importante di tutta la saga.** Questo personaggio **è** (mai detto) la
> coscienza dei *primi* e di chi verrà — la cosa che il Cordone ricuce (`../COSMOLOGIA.md`).
> **Non lo dice MAI. Nessuno lo dice mai.** La sua stranezza resta **fisica**: il canto antico,
> la pietra tiepida. Niente "anima", "memoria dell'umanità", "coscienza". Solo una piccola
> creatura che canta dove non dovrebbe, su una pietra calda senza ragione.

- **specie**: **cicala** — *omaggio al Grillo; ancora autoriale: le cicale del* Fedro *di Platone (i cantori che attraversano il tempo). Mai in-storia.* — *alternativa: grillo (omaggio diretto).*
- **tipo**: comprimario — **ricorrente, trasversale** (di tutti i regni e di nessuno)
- **attribute_ear (dominante)**: connettere
- **età / mondo**: indefinita ("molte estati") / **trasversale** — ovunque ci sia un Luogo Antico

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: piccola; **la si sente prima di vederla**. Ali come **vetro vecchio, un filo
  incrinato**. La si trova **sempre sulle pietre tiepide**, e **canta quando una cicala non
  dovrebbe** (al freddo, di notte). Riconoscibile dal **canto** — una cadenza sua — più che
  dall'aspetto: e sembra **sempre la stessa**, in ogni regno.

### Natura
- parla **poco**; ciò che dice è **più vecchio** di una creatura così piccola.
- **non è il grillo-rimprovero** (non predica, non viene ignorata): è **gentile, un filo
  malinconica, paziente**. **Torna quando serve.**

### Paura (arco lungo, se ne ha)
- non per sé. Sotto — e **mai detto** — il timore che **il canto si perda**: che nessuno raccolga
  ciò che lei tiene. *(è la cosmologia, e resta sotto: non affiora mai in parola.)*

### Il dono / la forza
- **torna**: è **già lì**, su ogni pietra antica, **prima** dei due.
- **sa cose** e **non le spiega**: le mette in una piccola domanda, o le **canta**. Spinge Rocco e
  Zara verso il giusto **senza dire perché**.

### Arco di crescita (per soglie)
- **nessuno** — è una **costante**. Il suo "movimento" è la **ricorrenza**, e l'ironia che i due
  **quasi la riconoscono** ("...non eri tu, al lago?") senza capire come possa essere la stessa.

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **trasversale** (di nessun regno) → registro «antica»: *"lenta, semplice, gnomica; dice poco, e
  ciò che dice è più vecchio di chi lo dice"* (`_voci.json → trasversali`).
- **forestiero?** no — è di **tutti** i regni e di nessuno.

**Tier 2 — firma individuale.**
- **superficie**: piccole **sentenze e domande**, mai una spiegazione; spesso il **canto** al posto
  della risposta. **sotto**: una memoria che non si dice.
- **non direbbe MAI**: spiegare **cosa** ricorda o **perché** torna — *è il tabù della cosmologia
  fatto reticenza del personaggio.*

> **Test (CARTA_VOCE §1.4):** «Tante estati ho cantato su questa pietra. Tu siediti: è tiepida.» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: trasversale
  gruppo: antica
  registro_ref: trasversali/antica

voce_personaggio:
  name: <dal lessico>
  role: comprimario
  archetype: la coscienza che torna — gnomica, gentile, antica
  underStress: canta invece di rispondere; si fa più breve e più vecchia
  ritmo: piccola sentenza o domanda, poi il canto
  words: molte estati / la pietra è tiepida / chi verrà
  never: spiega cosa ricorda o perché torna
```

### EAR
- **⇄** *(dominante)* è il **filo** che lega: torna in ogni regno, lega i momenti — e (non detto) le età.
- **Δ** la si distingue dal **canto** — lo stesso ovunque, fuori stagione.
- **⟳** la creatura più **piccola** porta la cosa più **grande**: l'inversione di scala è tutto il personaggio.

### Mondo affettivo / relazioni
- **Rocco e Zara**: li **accompagna di soppiatto**, regno dopo regno — la presenza che non chiede nulla.
- **le pietre tiepide**: dove la si trova **sempre** (il suo canto e il calore sono **una cosa sola**).

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: **trasversale** — di tutti i Luoghi Antichi, di nessun regno.
- **bioma**: ovunque ci sia un **Luogo Antico** (le pietre).
- **perché entra**: è la **coscienza che torna** — accompagna i due al giusto, regno dopo regno.
- **aggancio al Cordone**: la si trova **sempre sulla pietra tiepida** di ogni Luogo Antico; il suo
  **canto** (fuori stagione) e il **calore** della pietra sono i due **segni fisici** — mai
  spiegati — che rimano col Cordone e con la cosa che il Cordone ricuce.
