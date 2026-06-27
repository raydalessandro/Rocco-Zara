# il giovane Disputante — scheda canone (comprimario · Arco 4, la Piana dei Savi · linea propria)

> Nome proprio: **dal lessico**. Comprimario **ricorrente** (Arco 4, **linea propria**) → Tier 2 compilato.
> È il *"secondo che genera trama"* del midpoint: il retore giovane che **vince chi convince**. È il
> **contraltare** del Dotto — dove ① **smonta** il senso, lui potrebbe **rimontarne la causa**: convinto ad
> arringare **a favore** del Cordone, la sua eloquenza può ribaltare il fondo di Zara.
>
> *Nota lessico:* «i Disputanti» è ora **classe ufficiale** in `_voci.json` (`pianura_bassa`) — la faccia
> agonistica dei **Dotti** (*"vince chi convince"*). Tier 1 = «i Disputanti»; la firma sta nel Tier 2.

- **specie**: assiolo (giovane — dei Dotti, la disputa: piccolo, insonne, dal richiamo insistente)
- **tipo**: comprimario
- **attribute_ear (dominante)**: cambiare
- **età / mondo**: giovane / la Piana dei Savi, le **dispute** sotto i portici

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: **piccolo e irrequieto**, la testa che gira a cogliere ogni angolo dell'argomento; gli occhi
  troppo svegli; il **richiamo insistente** (il "chiù" dell'assiolo) che è la sua insistenza retorica fatta verso.
  Sempre proteso **in avanti**, pronto alla replica.

### Natura
- **ama la disputa per sé stessa**: brillante, agile, argomenta **qualunque tesi** — perché il *gioco* è ciò
  che ama, non la verità. **Disancorato**: non ha una posizione fissa.
- **ambizioso**: vuole **vincere**, farsi un nome. Chi gli dà il caso migliore, quello difende.

### Paura (arco lungo, se ne ha)
- prima emersione: **perdere** una disputa → tocco: il sospetto, più sordo, di **non aver mai creduto a nulla**
  → fioritura: argomentando *bene* una causa, rischia di **cominciare a crederci** (la retorica che diventa
  convinzione: il suo arco).

### Il dono / la forza
- **convince**: «vince chi convince». Volto nel verso giusto, può **disfare** la dimostrazione del Dotto e
  **rifare la causa del senso**. È la **contro-arma** del midpoint — e forse il filo da cui passa la **risalita
  di Zara**: ritrovare una ragione **argomentandola**.

### Arco di crescita (per soglie)
- **linea propria**: il sofista che potrebbe **parlarsi dentro una fede**. Da *arringa il Cordone perché mi
  conviene* a *l'ho difeso così bene che ora ci credo*. Scatto a soglie, oltre l'arco.

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **regno + classe**: Piana dei Savi / «i Disputanti» → registro *"agonistico, brillante, ribalta la tesi:
  «vince chi convince»"* (`_voci.json`) — la **faccia agonistica** dei Dotti: il **rovescio** del Dotto, stessa scuola.
- **forestiero?** no.

**Tier 2 — firma individuale.**
- **superficie**: **botta e risposta** serrato, ribalta la tesi, gode del duello («ma se invece dicessimo
  che…»). **sotto**: la fame di vincere — e il vuoto di chi non ha mai *creduto*.
- **non direbbe MAI**: ammettere di **credere davvero** a ciò che argomenta (finché, un giorno, non gli capita).

> **Test (CARTA_VOCE §1.4):** «Concedimi solo questo — e allora ne segue il contrario di quanto hai detto. Chi convince, vince: e io ti ho appena convinto.» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: pianura_bassa
  gruppo: i Disputanti
  registro_ref: pianura_bassa/i Disputanti

voce_personaggio:
  name: <dal lessico>
  role: comprimario
  archetype: il giovane Disputante — retore agile che argomenta ogni tesi per il gusto di vincere
  underStress: rilancia, ribalta la tesi, accelera i distinguo
  ritmo: botta e risposta serrato, brillante
  words: ma se invece / concedimi che / e allora ne segue / chi convince vince
  never: ammette di credere davvero a ciò che argomenta
```

### EAR
- **⟳** *(dominante)* **ribalta** le posizioni (e la folla) — e può **essere ribaltato**, cioè convinto:
  la sua mobilità è insieme l'arma e la porta.
- **Δ** —
- **⇄** —

### Mondo affettivo / relazioni
- **il Dotto che smonta** (①): maestro-rivale; il **duello generazionale** dei Dotti (smontare vs rimontare).
- **Zara** (al fondo): se è lei — o Rocco — a dargli **il caso migliore**, la sua arringa può essere la **leva**
  della risalita. La sua linea e quella di Zara possono **intrecciarsi** proprio al nadir.

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Piana dei Savi — «i Disputanti» (la faccia agonistica dei Dotti: la disputa).
- **bioma d'origine**: i **portici** delle dispute, presso il **Gran Fiume**.
- **perché entra**: è il **motore di trama** che ribalta il midpoint — la retorica che può **rifare il senso**
  dopo che il Dotto l'ha disfatto.
- **aggancio al Cordone / alla Serpe**: incarna «vince chi convince» (civica: come la **repubblica della legge**
  decide); convinto a difendere il Cordone, **rimonta** ciò che il Dotto ha smontato — e si avvia a crederci.
