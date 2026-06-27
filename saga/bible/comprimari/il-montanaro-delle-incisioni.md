# il Montanaro delle incisioni — scheda canone (comprimario · Arco 2, la Conca Ruggente)

> Nome proprio: **dal lessico**. Comprimario **ricorrente** (Arco 2) → Tier 2 compilato.
> È la **porta al nodo** del secondo arco: conduce alle **Pietre Incise**, il Luogo Antico della Conca.
> Sa quali segni sono **antichi** e quali no — senza sapere che cosa siano (il tabù regge: *strano = fisico*).

- **specie**: stambecco (montanaro d'altura, verso il **Mare di Dentro**)
- **tipo**: comprimario
- **attribute_ear (dominante)**: distinguere
- **età / mondo**: vecchio / le **Gobbe** alte della Conca, in vista del Mare di Dentro

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: le **corna ad anelli** — un anello per ogni inverno, lette come si legge un tronco. Lo sguardo
  che **va sempre prima al cielo** che a chi gli parla. Sta sul ciglio del precipizio come su un sentiero piano.

### Natura
- **secco, meteorologico, sentenzioso**: dice poco, e quel poco è **tempo e pietra**. Legge la nuvola
  prima della frase.
- non spreca parole né passi: l'economia di chi vive dove l'errore costa.

### Paura (arco lungo, se ne ha)
- non in primo piano. Semmai un **rispetto antico** per i segni incisi: non li tocca, non li nomina, ci passa
  accanto come davanti a qualcosa che c'era **prima**.

### Il dono / la forza
- **legge la pietra e il cielo**: sa quali incisioni sono vecchie di ere e quali di ieri; sa quando arriva
  il tempo. È la **chiave del nodo** e la guida che porta R&Z lassù vivi.

### Arco di crescita (per soglie)
- minimo (è una guida). Lo scatto possibile: dal **mostrare** i segni al **dire**, una volta sola, che quei
  segni «non li hanno fatti zampe» — e poi tace, perché non sa altro.

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **regno + classe**: Conca Ruggente / «Montanari del Mare di Dentro» → registro *"secco, meteorologico,
  sentenzioso"* (`_voci.json`).
- **forestiero?** no (è il più radicato di tutti, ma dell'alto, non del Cuore civico).

**Tier 2 — firma individuale.**
- **superficie**: sentenze brevi, di tempo e roccia ("nuvola bassa, non si sale"). **sotto**: una reverenza
  silenziosa per ciò che è antico.
- **non direbbe MAI**: una **parola in più del necessario** — e mai darebbe un **nome** a ciò che non capisce.

> **Test (CARTA_VOCE §1.4):** «La pietra è vecchia. Il segno, più vecchio della pietra. Si sale all'alba.» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: laghi_oriente
  gruppo: Montanari del Mare di Dentro
  registro_ref: laghi_oriente/Montanari del Mare di Dentro

voce_personaggio:
  name: <dal lessico>
  role: comprimario
  archetype: il montanaro delle incisioni — secco, meteorologico, sentenzioso
  underStress: si chiude, riferisce solo l'essenziale, guarda il cielo
  ritmo: sentenza breve, meteorologica, spaziata
  words: nuvola bassa / la pietra è vecchia / all'alba si sale
  never: una parola in più del necessario, o un nome a ciò che non capisce
```

### EAR
- **Δ** *(dominante)* **distingue** il segno antico dal segno nuovo — la facoltà che apre il nodo.
- **⇄** connette R&Z al **luogo** (è il tramite fisico verso le Pietre Incise).
- **⟳** —

### Mondo affettivo / relazioni
- **l'alto**: la sua casa; il Cuore civico gli sta stretto.
- **R&Z**: li giudica dal passo prima che dalle parole — se reggono la salita, si fida.

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Conca Ruggente — «Montanari del Mare di Dentro» (gente d'altura).
- **bioma d'origine**: le **Gobbe** alte / la **Rovina** in quota (le Pietre Incise).
- **perché entra**: è la **porta al nodo** — senza di lui le Pietre Incise non si raggiungono.
- **aggancio al Cordone**: conosce le incisioni «non fatte da zampe» senza saperne il senso — il **tratto fisico**
  dei primi, mai spiegato. Qui Zara annoda il tratto della Conca.
