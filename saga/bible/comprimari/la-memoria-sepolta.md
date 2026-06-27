# la memoria sepolta — scheda canone (comprimario · Arco 3, il Gran Ducato)

> Nome proprio: **dal lessico**. Comprimario **ricorrente** (Arco 3) → Tier 2 compilato.
> È la **porta al nodo** del Gran Ducato — ma è una porta **murata**. Lei ricorda che **c'era** un Luogo
> Antico, ora **pavimentato** sotto Anguicorte. È la **svolta amara** dell'arco: il Gran Ducato è l'unico
> regno **senza nodo** (`saga_config.yaml` → `nodi_totali: 5`), perché la sua porta non si può più aprire.

- **specie**: elefantessa (vecchia, del Popolo dell'Aperto — i grandi della pianura)
- **tipo**: comprimario
- **attribute_ear (dominante)**: distinguere
- **età / mondo**: molto vecchia / il Gran Ducato, dentro **Anguicorte** (sul selciato della città)

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: **si ferma sul selciato** dove gli altri passano e basta, e vi **appoggia una zampa** (o la
  proboscide) come chi **ascolta** qualcosa sotto. Cammina una strada che nessun giovane capisce, fino a quel
  punto della piazza, e lì resta. La gravità lenta della matriarca.

### Natura
- **lenta, ferma, di lunga memoria**: parla del **«prima»** — il tempo in cui la pietra era scoperta e
  tiepida, prima che la Serpe ci colasse sopra la città.
- non confonde: sa **esattamente** dove la pietra giace, sotto quale lastra.

### Paura (arco lungo, se ne ha)
- prima emersione: che la memoria **muoia con lei** — che nessun giovane creda che lì sotto ci fosse qualcosa
  → tocco: trovare due forestieri che le credono → fioritura (amara): può **mostrare** dov'è la porta, ma non
  **aprirla**. Sapere non basta.

### Il dono / la forza
- **sa dov'è il Luogo sepolto**: l'unica a saperlo, perché il suo corpo lo **ricorda**. Conduce R&Z al punto
  esatto — e lì la storia incassa il colpo: la porta c'è, ma è murata sotto la città della Serpe.

### Arco di crescita (per soglie)
- minimo (è la memoria e il lutto). Lo scatto: condurli alla lastra e **dire** che c'era una porta — e poi
  reggere insieme a loro il fatto che **non si può** annodare.

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **regno + classe**: Gran Ducato / «Popolo dell'Aperto» → registro *"piano, paziente, un po' brontolone"*
  (`_voci.json`) — invecchiato nella **memoria lunga**.
- **forestiero?** no (la più radicata della gente di Rocco).

**Tier 2 — firma individuale.**
- **superficie**: lenta, ferma, torna sempre al «prima» («qui sotto, una volta…»). **sotto**: il lutto di
  essere **l'ultima** a ricordare.
- **non direbbe MAI**: fingere che la pietra **non ci sia più** — per lei è sempre lì, sotto il selciato.

> **Test (CARTA_VOCE §1.4):** «Voi vedete una piazza. Io sento la pietra. È qui sotto. C'è sempre stata.» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: pianura_alta
  gruppo: Popolo dell'Aperto
  registro_ref: pianura_alta/Popolo dell'Aperto

voce_personaggio:
  name: <dal lessico>
  role: comprimario
  archetype: la memoria sepolta — vecchia, lenta, di lunga memoria
  underStress: rallenta, torna al «prima», appoggia la zampa sulla pietra
  ritmo: frase lenta, ferma, di memoria
  words: prima / qui sotto c'era / la pietra ricorda
  never: finge che la pietra non ci sia più
```

### EAR
- **Δ** *(dominante)* **distingue** il Luogo **sotto** il selciato — lo *sente* dove gli altri vedono solo
  strada. La facoltà che individua la porta… murata.
- **⇄** —
- **⟳** —

### Mondo affettivo / relazioni
- **Anguicorte**: la città che le cammina sopra senza sapere cosa calpesta.
- **Rocco**: è la memoria della **sua** gente — il legame con le radici che Rocco aveva lasciato.

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Gran Ducato — «Popolo dell'Aperto» (vecchia matriarca).
- **bioma d'origine**: la **Rovina** sepolta sotto il **Cuore** urbano di Anguicorte.
- **perché entra**: è la **porta al nodo** che rivela la **ferita strutturale** dell'arco — la porta che non
  si può annodare.
- **aggancio al Cordone / alla Serpe**: è la **ragione narrativa** dei 5 nodi (non 6): la Serpe ha **murato la
  memoria** colando la città sul Luogo. Il segno dei primi è ancora lì, **sotto** — fisico, intoccabile, mai
  spiegato. Qui il Cordone **non** si annoda: e questa mancanza è il cuore amaro del Gran Ducato.
