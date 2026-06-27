# il quinto colonna — scheda canone (comprimario · Arco 2, la Conca Ruggente)

> Nome proprio: **dal lessico**. Comprimario **ricorrente** (Arco 2) → Tier 2 compilato.
> È l'**ostile locale** del secondo arco: un **Protettore rispettato** che parla il «noi» del comune libero
> alla perfezione — ma è **vuoto**, e sotto serve la Serpe (Vermiglio). È lo **specchio oscuro della Leonessa**:
> stessa voce civica, uno la riempie, l'altro la svuota.

- **specie**: tasso (rispettabile, industrioso — e **scava** gallerie nascoste)
- **tipo**: comprimario (antagonista locale)
- **attribute_ear (dominante)**: cambiare
- **età / mondo**: adulto / il **Cuore** civico della Conca, dentro i Protettori

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: **impeccabile come l'ideale civico** — e un solo segno che tradisce: lo **sguardo che corre
  alle uscite** mentre parla di restare uniti. Il pelo troppo pulito di chi **predica** il lavoro sporco del
  comune ma non lo fa.

### Natura
- parla il **«noi»** civico con solennità perfetta — ma è **calcolo**: sotto la grande parola c'è solo lui
  (e chi lo paga).
- la rispettabilità è la sua arma: il comune **si fida**, e lui apre le porte da dentro.

### Paura (arco lungo, se ne ha)
- prima emersione: il rischio di **essere scoperto** → tocco: quando il pasticcio dell'Arlecchino sfiora la
  verità → fioritura (nera): si fa **ancora più solenne**, si copre col bene comune. Lo smascheramento è lo **scatto**.

### Il dono / la forza
- **la fiducia del comune**: la moneta che spende. Conosce le **difese dall'interno** — e le apre.

### Arco di crescita (per soglie)
- è il **nemico nascosto**: nessuna crescita, una **rivelazione**. Lo scatto è lo smascheramento — e la posta
  amara che lascia (un comune libero che scopre di poter essere tradito **da uno dei suoi**).

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **regno + classe**: Conca Ruggente / «i Protettori» → registro *"solenne, fermo, collettivo («noi»)"* (`_voci.json`)
  — **lo stesso** della Leonessa: qui è il punto. La voce è identica; **vuota** la differenza.
- **forestiero?** no — ed è proprio questo l'orrore: è **uno di loro**.

**Tier 2 — firma individuale.**
- **superficie**: il «noi» civico **perfetto**, levigato, sempre per "il bene della Conca". **sotto**: il calcolo
  personale, freddo.
- **non direbbe MAI**: lasciar trasparire l'**«io»** che lo muove — mai una crepa nel «noi» (al contrario della
  Leonessa, in cui l'«io» ferito **preme** sotto il plurale: lui sotto non ha nulla).

> **Test (CARTA_VOCE §1.4):** «Per la sicurezza della Conca, certe porte è meglio aprirle prima che le sfondino.» → si capisce chi parla (e si sente il falso).

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: laghi_oriente
  gruppo: i Protettori
  registro_ref: laghi_oriente/i Protettori

voce_personaggio:
  name: <dal lessico>
  role: comprimario
  archetype: il quinto colonna — il «noi» civico perfetto e vuoto
  underStress: si fa ancora più solenne, si copre col bene comune
  ritmo: frase civica solenne, plurale, levigata
  words: per il bene della Conca / noi tutti / la sicurezza del comune
  never: lascia trasparire l'«io» che lo muove (mai una crepa nel «noi»)
```

### EAR
- **⟳** *(dominante)* ha **cambiato lato di nascosto**: il tradimento è un'inversione coperta dal plurale.
- **⇄** usa la **connessione** civica (la fiducia) **per tradirla** — connette per aprire una falla.
- **Δ** —

### Mondo affettivo / relazioni
- **la Leonessa**: il suo **doppio** in chiaro — lei lo fiuta per prima (la loro è la tensione-chiave dell'arco).
- **la Serpe**: il suo vero padrone (Vermiglio dentro un comune turchino).

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Conca Ruggente — «i Protettori» (classe civica, **corrotto**).
- **bioma d'origine**: il **Cuore** civico (le mura che dovrebbe difendere).
- **perché entra**: è la prova **politica** dell'arco — *il libero comune tradito da dentro* (filo ricorrente
  della saga: i liberi minati non da fuori, ma da uno dei loro).
- **aggancio al Cordone / alla Serpe**: lavora di nascosto per la **Serpe**; aprendo le difese rischia di
  consegnare anche la via al nodo — il suo smascheramento **sblocca** la salita alle Pietre Incise.
