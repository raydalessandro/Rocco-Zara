# <Nome> — scheda canone (<ruolo>)

> Struttura per nuove schede (comprimari, creature ricorrenti). I campi *bloccati*
> (aspetto, voce, dono, paura) sono canone duro per la coerenza "da serie".
> Per l'EAR vedi `../../ontologia/COME_SI_APPLICA.md`. Per la **resa** della voce
> (postura del narratore) vedi `../../voce/CARTA_VOCE.md`.
>
> **Chiavi `registro_ref` (reali):** in `../../cartografia/regni/_voci.json` i registri stanno
> sotto `regni[n].voci[<Gruppo>]`, dove `<Gruppo>` è il **nome esatto del gruppo** (con spazi,
> es. `Popolo dell'Aperto`, `Contadini del Gran Fiume`). Forma del ref: `<regno>/<Gruppo>`
> (regno per slug o numero). Per i **forestieri** vale la *voce forestiera* — chiave
> trasversale `trasversali/forestiera` in `_voci.json`. Per un membro di **gilda/corporazione**
> la voce viene dalla sua **classe** sociale (le voci si danno alle classi, non alle gilde).

- **specie**: …
- **tipo**: protagonista | co-protagonista | comprimario | creatura-ricorrente
- **attribute_ear (dominante)**: distinguere | connettere | cambiare
- **età / mondo**: …

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: … (l'elemento che non si "corregge" mai nelle illustrazioni)

### Natura
- …

### Paura (arco lungo, se ne ha)
- prima emersione: ep… → tocchi → fioritura

### Il dono / la forza
- …

### Arco di crescita (per soglie)
- da … a … (scatti guadagnati, non graduali)

### Voce — a due tier
> La voce di un personaggio sta su **due livelli**. Il **Tier 1** vale per chiunque
> (basta il mondo). Il **Tier 2** si compila **solo per chi diventa ricorrente**
> (regola esplicita in `../../cartografia/regni/_voci.md`: *"Solo i personaggi che diventano
> ricorrenti riceveranno poi una voce individuale rifinita"*).
> **Promemoria:** il registro **non si mostra mai nel testo** — le battute sono originali.
> È *maniera*, non citazione.

**Tier 1 — registro di gruppo (default, ereditato dal mondo).**
- **regno + gruppo**: … → eredita il registro «…» da `_voci.md`.
  *(Per un comprimario di passaggio questo È già la voce: non serve altro.)*
- **forestiero?** se sì, porta la parlata del **luogo d'origine** → chiave `trasversali/forestiera`.
- **di una gilda/corporazione?** la voce viene dalla sua **classe** sociale (non dalla gilda).

**Tier 2 — firma individuale (solo ricorrenti).** *(prosa per gli umani)*
- come parla in **superficie** / che cosa c'è **sotto**: …
- **non direbbe MAI**: … *(il campo che distingue di più — è il primo vincolo che il
  briefer applica ai dialoghi; cfr. `lib/brief.ts`)*

> **Test di riconoscibilità (CARTA_VOCE §1.4):** una battuta deve dire **chi parla
> senza il nome**. Se non lo dice, la firma non sta lavorando.

<!--
  BLOCCO-MACCHINA — il serializzatore estrae QUESTO per popolare `seed.characterVoices`.
  Campi 1:1 con `lib/types.ts → CharacterVoice`. Stessa logica di CARTA_VOCE §4
  (prosa sopra per gli umani, YAML sotto per gli script).
  Compilare il blocco `voce_personaggio` SOLO per i ricorrenti (Tier 2).
  `registro_gruppo` è Tier 1 (baseline): valido per tutti, lo applicherà l'applicatore
  di registro-di-gruppo; lo `struct` attuale lo ignora (forward-compat).
-->
```yaml
registro_gruppo:                # Tier 1 — vale anche senza il blocco sotto
  regno: <…>
  gruppo: <…>
  registro_ref: <chiave da _voci.json>   # es. pianura_alta/Popolo dell'Aperto

voce_personaggio:               # Tier 2 — solo ricorrenti; = CharacterVoice
  name: <Nome>
  role: protagonista | comprimario
  archetype: <dominante>                  # la postura di base
  underStress: <come cambia sotto pressione — la miscela>
  ritmo: <respiro/cadenza — es. "periodo disteso" | "colpo breve">
  words: <2–4 parole "sue" / tic lessicali>
  never: <la frase o il registro che non userebbe MAI>   # il discriminante
```

### EAR
- **Δ** cosa distingue · **⇄** cosa connette · **⟳** cosa fa cambiare

### Mondo affettivo / relazioni
- …

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno d'origine / ospite**: … (classe, posizione nella società, forestiero?)
- **bioma d'origine**: …
- **perché entra nella trama**: … (movente personale, non solo funzione)
- **aggancio al Cordone / alla Serpe**: …
