# il Mercante delle Vie — scheda canone (comprimario · Arco 3, il Gran Ducato)

> Nome proprio: **dal lessico**. Comprimario **ricorrente** (Arco 3) → Tier 2 compilato.
> È l'**aiuto + il seme** dell'arco di casa: ti vende ciò che ti serve — **e** l'informazione di dove sei.
> Doppio taglio: rifornisce R&Z, ma la sua merce è anche **la loro posizione** (che può finire ad Artiglio).
> È inoltre il **punto di saldatura** del filo trasversale: qui l'**Esattore pentito** chiude il suo arco, a casa.

- **specie**: dromedario (mercante delle carovane sulle Vie)
- **tipo**: comprimario
- **attribute_ear (dominante)**: connettere
- **età / mondo**: adulto / il Gran Ducato, lungo le **Vie** (strade, pedaggi, mercati)

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: la **groppa sempre stracarica** (porta più di chiunque) e l'**occhio che prezza** tutto in un
  battito — merce, animale, notizia. Lento di passo, **velocissimo di parola**: il contrasto è il personaggio.

### Natura
- **rapido, transattivo, pettegolo**: sa l'ultima voce delle Vie e te la rivende. Per lui **tutto è merce**,
  anche la verità — ma **senza malizia**: è commercio, non inganno (il che lo rende ancora più pericoloso).

### Paura (arco lungo, se ne ha)
- non in primo piano. Il suo unico timore è **non chiudere l'affare**.

### Il dono / la forza
- **rifornisce e informa**: ha ciò che serve e sa dove sono tutti. È il modo più rapido per R&Z di muoversi
  nel Gran Ducato — e il modo più rapido perché la Serpe sappia dove cercarli.

### Arco di crescita (per soglie)
- minimo (è la risorsa ambigua). Lo scatto possibile: una volta **non vende** una notizia — e si stupisce lui
  per primo (forse perché l'Esattore pentito, che conosce, gli ha mostrato che si può smettere).

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **regno + classe**: Gran Ducato / «Mercanti delle Vie» → registro *"rapido, transattivo, pettegolo"* (`_voci.json`).
- **forestiero?** no (vive sulle Vie del Ducato).

**Tier 2 — firma individuale.**
- **superficie**: patter veloce, prezza tutto, "si dice in giro che…". **sotto**: nessuna cattiveria, solo il
  banco — il che è la sua **innocenza pericolosa**.
- **non direbbe MAI**: **regalare** qualcosa — anche un'informazione ha un prezzo (è il suo limite e il seme del rischio).

> **Test (CARTA_VOCE §1.4):** «Acqua, corda, e la voce che un falco vi cerca: il terzo è in omaggio… no, scherzavo, fa tre.» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: pianura_alta
  gruppo: Mercanti delle Vie
  registro_ref: pianura_alta/Mercanti delle Vie

voce_personaggio:
  name: <dal lessico>
  role: comprimario
  archetype: il Mercante delle Vie — rapido, transattivo, pettegolo
  underStress: accelera il patter, alza il prezzo, gira la voce
  ritmo: patter veloce, transattivo, a elenco
  words: buon prezzo / si dice in giro / per te faccio
  never: regala qualcosa (tutto ha un prezzo)
```

### EAR
- **⇄** *(dominante)* **connette** tutti: l'informazione del Ducato passa da lui (e con lei il rischio).
- **Δ** **prezza** — distingue a colpo d'occhio il valore di ogni cosa.
- **⟳** —

### Mondo affettivo / relazioni
- **le Vie**: il suo banco mobile.
- **l'Esattore pentito** (trasversale): lo **conosce** dai tempi della Serpe — qui, a casa, è l'incontro che
  fa **chiudere** l'arco del mulo disertore.
- **Artiglio**: cliente possibile per la merce peggiore (la posizione di R&Z).

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Gran Ducato — «Mercanti delle Vie».
- **bioma d'origine**: le **Vie** (strade, pedaggi, mercati del Ducato).
- **perché entra**: porta l'**aiuto** (rifornimento, informazioni) e il **seme** (può venderli).
- **aggancio al Cordone / alla Serpe**: è lo **snodo** dove il trasversale **Esattore pentito** paga il suo
  arco; e la leva di tensione (la sua merce può consegnare R&Z ad **Artiglio**). Rimando: `esattore-pentito.md`.
