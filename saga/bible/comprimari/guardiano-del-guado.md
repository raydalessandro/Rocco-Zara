# il Guardiano del guado — scheda canone (comprimario · neutro)

> Nome proprio: **dal lessico** (da assegnare). Comprimario **ricorrente** → Tier 2 compilato.
> **Neutro**: aiuta o ostacola per un **proprio codice** (il fiume non prende parte).

- **specie**: airone (la sentinella ferma dell'acqua) — *adattabile al roster*
- **tipo**: comprimario
- **attribute_ear (dominante)**: connettere
- **età / mondo**: adulto / il **Gran Fiume**, nella **Piana dei Savi**

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: **l'immobilità** — sta nell'acqua bassa fermo come un palo, finché non si muove
  di colpo. Una **zampa segnata** da una vecchia piena. (segno **naturale**.)

### Natura
- **paziente, fatalista-bonario**; parla per **sentenze del fiume**.
- **neutrale per codice**: chi rispetta la regola del guado passa, chiunque sia.

### Paura (arco lungo, se ne ha)
- *non in primo piano* (è un neutro): la sua "linea" non è la paura, è il **codice del guado** —
  che però una volta, al momento giusto, potrebbe **scegliere** di piegare.

### Il dono / la forza
- **legge il fiume** (l'arte dell'argine-mastro: sa **dove l'acqua salirà prima che salga**).
- **vede passare tutti**: sa **chi è passato di qui** — anche **Toraki**.

### Arco di crescita (per soglie)
- minimo (neutro): il suo "scatto" è **una scelta singola che pesa** — al **midpoint**, aiutare
  o no R&Z al guado mentre la piena monta e la Serpe preme.

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **regno + gruppo**: Piana dei Savi / «Contadini del Gran Fiume» → registro *"umido, paziente,
  fatalista-bonario"* (`_voci.json`). *(N.B.: il suo **mestiere** è argine-mastro — corporazione
  in `società` — ma il **gruppo-voce** in `_voci.json` è «Contadini del Gran Fiume».)*
- **forestiero?** no.

**Tier 2 — firma individuale.**
- **superficie**: **sentenze brevi** sul fiume e sul passaggio, poi silenzio. **sotto**: sa più
  di quanto dice — è l'**informatore neutrale**.
- **non direbbe MAI**: schierarsi — *«il fiume non prende parte».*

> **Test (CARTA_VOCE §1.4):** «Chi rispetta il guado, passa. L'acqua sale comunque.» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: pianura_bassa
  gruppo: Contadini del Gran Fiume
  registro_ref: pianura_bassa/Contadini del Gran Fiume

voce_personaggio:
  name: <dal lessico>
  role: comprimario
  archetype: il neutrale del guado — gnomico, paziente, del fiume
  underStress: si fa più gnomico, si chiude nel codice
  ritmo: sentenza breve, poi silenzio
  words: il fiume / la piena / chi rispetta passa
  never: prende parte / si schiera
```

### EAR
- **Δ** legge **il vero segno dell'acqua** (cosa farà la piena).
- **⇄** *(dominante)* è il **guado**: lega le due rive e chi le attraversa (o non le lega).
- **⟳** una **sua scelta** può **cambiare il nodo** (al midpoint).

### Mondo affettivo / relazioni
- nessun legame forte (è un neutro): **il fiume è la sua lealtà**.
- **R&Z** e **la Serpe**: entrambi vogliono il guado — e vogliono ciò che lui **sa** (Toraki).

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Piana dei Savi — gente del **Gran Fiume** (il grande guado = il **MIDPOINT**).
- **bioma d'origine**: **umido / acqua**.
- **perché entra**: è il **custode del passaggio** che R&Z (e la Serpe) devono attraversare.
- **aggancio Cordone/Serpe**: ha **visto passare Toraki** → ha la **traccia più fresca** al
  midpoint; la Serpe vuole il guado, ma lui **non si schiera**.
