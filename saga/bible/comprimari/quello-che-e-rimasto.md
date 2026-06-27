# quello che è rimasto — scheda canone (comprimario · Arco 3, il Gran Ducato)

> Nome proprio: **dal lessico**. Comprimario **ricorrente** (Arco 3) → Tier 2 compilato.
> È lo **specchio interiore di Rocco** nell'arco di casa: un suo pari che **è rimasto** e ha chinato la
> testa sotto il tributo. Rocco è **partito**; lui no. La colpa rovescia: chi se n'è andato e chi è restato.

- **specie**: bufalo (del Popolo dell'Aperto, come Rocco)
- **tipo**: comprimario
- **attribute_ear (dominante)**: connettere
- **età / mondo**: giovane-adulto / il Gran Ducato, la **Pianura Alta** (il villaggio di Rocco)

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: **il collo basso** — la testa portata bassa per abitudine, non per stanchezza: la postura di
  chi ha **imparato a non alzarla**. Forte come Rocco, ma piegato. Quando per un attimo la solleva, si vede
  quanto gli costa.

### Natura
- **piano, paziente, rassegnato**: brontola sottovoce, sopporta, "qualcuno doveva restare".
- non è un vile: ha **assorbito** lui i colpi di Artiglio perché ne ricadessero meno sugli altri.

### Paura (arco lungo, se ne ha)
- prima emersione: quando Rocco **torna** — e torna *senza* aver chinato la testa → tocco: il sospetto, mai
  detto, che la sua sopportazione fosse anche **resa** (ho protetto gli altri, o solo evitato di scegliere?)
  → fioritura: alzare la testa, una volta, perché Rocco è tornato.

### Il dono / la forza
- **regge**: il villaggio è ancora in piedi perché lui si è piegato al posto degli altri. Una forza che
  **tiene** invece di spaccare — il rovescio esatto della forza di Rocco.

### Arco di crescita (per soglie)
- da **specchio rassegnato** a (forse) **chi rialza la testa** — lo scatto è il ritorno di Rocco: non un
  rimprovero, ma una possibilità.

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **regno + classe**: Gran Ducato / «Popolo dell'Aperto» → registro *"piano, paziente, un po' brontolone"* (`_voci.json`).
- **forestiero?** no (è la gente di Rocco).

**Tier 2 — firma individuale.**
- **superficie**: brontola piano, "si fa così, si tira avanti". **sotto**: una colpa rovescia — ha barattato
  la dignità per la sopravvivenza degli altri, e non sa più se è stato amore o paura.
- **non direbbe MAI**: ammettere che **restare è stata una scelta** quanto partire (si racconta di non aver
  avuto scelta — è il suo specchio con Rocco).

> **Test (CARTA_VOCE §1.4):** «Tu sei andato. Io… qualcuno doveva restare. Si fa così.» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: pianura_alta
  gruppo: Popolo dell'Aperto
  registro_ref: pianura_alta/Popolo dell'Aperto

voce_personaggio:
  name: <dal lessico>
  role: comprimario
  archetype: il pari che è rimasto e ha chinato la testa — piano, paziente, rassegnato
  underStress: brontola più piano, si chiude nel «si sopporta»
  ritmo: frase piana, lenta, un po' brontolona
  words: si fa così / si tira avanti / qualcuno doveva restare
  never: ammette che restare è stata una scelta quanto partire
```

### EAR
- **⇄** *(dominante)* tiene insieme il villaggio **assorbendo il tributo** — la connessione diventata catena.
  Lo **specchio** di Rocco: stessa facoltà (⇄), terreno opposto (Rocco connette *andando fuori*, lui *restando e portando*).
- **Δ** —
- **⟳** può **alzare la testa** — lo scatto, innescato dal ritorno di Rocco.

### Mondo affettivo / relazioni
- **il villaggio**: ciò per cui si è piegato.
- **Rocco**: il pari che è partito → il confronto restare/partire è il **cuore emotivo** dell'arco di casa.
- **Artiglio**: l'oppressore di cui ha incassato i colpi.

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Gran Ducato — «Popolo dell'Aperto» (la gente di Rocco, sotto tributo).
- **bioma d'origine**: la **Pianura Alta** (il villaggio).
- **perché entra**: è la **prova interiore** dell'arco di casa — Rocco deve guardare chi sarebbe potuto essere.
- **aggancio al Cordone / alla Serpe**: vive sotto **Artiglio**; il suo eventuale rialzare la testa è il primo
  segno che la presa della Serpe, a casa di Rocco, può incrinarsi.
