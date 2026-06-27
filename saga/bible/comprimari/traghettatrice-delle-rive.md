# la Traghettatrice delle Rive — scheda canone (comprimario · Arco 1, i Laghi del Vespro)

> Nome proprio: **dal lessico**. Comprimario **ricorrente** (Arco 1) → Tier 2 compilato.
> È il **passaggio e il riparo** del primo arco — e la sua barca è dove scatta un seme.

- **specie**: lontra (gente d'acqua e di barca) — *adattabile al roster*
- **tipo**: comprimario
- **attribute_ear (dominante)**: connettere
- **età / mondo**: adulta / i Laghi del Vespro, le **rive**

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: **le zampe svelte ai nodi** (annoda reti senza guardare) e il **pelo sempre umido**;
  una **vecchia cicatrice da amo** sul muso.

### Natura
- **concreta, calda, proverbiale**: parla per **immagini d'acqua e di rete**.
- **pratica**: non si fida delle parole vuote — solo di ciò che tiene.

### Paura (arco lungo, se ne ha)
- *non in primo piano*: la sua misura è il **nodo** — o tiene o non tiene; il resto la riguarda poco.

### Il dono / la forza
- **muove sull'acqua**: **dà passaggio e riparo** ai due nell'Arco 1; conosce ogni riva e corrente;
  **i suoi nodi tengono**.

### Arco di crescita (per soglie)
- minimo: il suo scatto è **decidere di fidarsi** dei due (dare passaggio a degli sconosciuti).

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **regno + classe**: Laghi del Vespro / «la Gente delle Rive» → registro *"concreto, proverbiale,
  caldo"* (`_voci.json`).
- **forestiero?** no.

**Tier 2 — firma individuale.**
- **superficie**: **proverbi di rete e di nodo**. **sotto**: un cuore caldo sotto la praticità.
- **non direbbe MAI**: una promessa **"a parole"** — per lei il nodo o tiene o non tiene.

> **Test (CARTA_VOCE §1.4):** «Rete annodata stretta, pesce sicuro. Parola annodata stretta, lo stesso.» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: laghi_occidente
  gruppo: la Gente delle Rive
  registro_ref: laghi_occidente/la Gente delle Rive

voce_personaggio:
  name: <dal lessico>
  role: comprimario
  archetype: la barcaiola proverbiale — concreta, calda, d'acqua
  underStress: torna ai proverbi, si fa pratica e spiccia
  ritmo: frase breve e proverbiale, immagini d'acqua e di nodo
  words: il nodo tiene / rete / corrente / a parole no
  never: promette "a parole vuote"
```

### EAR
- **⇄** *(dominante)* il **passaggio** che connette le rive e le persone — e i **nodi** che rimano
  col Cordone **senza nominarlo**.
- **Δ** legge l'**acqua** e le correnti (cosa farà il lago).
- **⟳** dare passaggio ai due **cambia** la loro rotta — e apre la scena del furto.

### Mondo affettivo / relazioni
- **il lago**: casa e mestiere.
- **Rocco e Zara**: passeggeri → forse amici.
- **Cècca**: è **sulla sua barca** che la gazza può rubare un pegno (il seme già previsto).

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Laghi del Vespro — «la Gente delle Rive» (gente d'acqua e di barca).
- **bioma d'origine**: **acqua / rive**.
- **perché entra**: dà **passaggio e riparo** nell'Arco 1.
- **aggancio al Cordone / alla Serpe**: sulla sua barca scatta il seme **"Cècca ruba un pegno"**; i
  suoi **proverbi di nodo** rimano col Cordone senza nominarlo.
