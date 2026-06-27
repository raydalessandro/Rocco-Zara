# Stile visivo di saga — canone (A1)

> Il "look" di Rocco & Zara, dichiarato come **canone nostro** (finora viveva solo in
> `lib/stylesheet.ts` di Scrivia). Vale per **reference** e **pagine**. Il punto chiave:
> a differenza di isola — dove le immagini erano belle ma **ferme**, quasi tutte alla
> stessa distanza e angolo — qui il **movimento** va portato anche nel *come* si
> rappresenta, non solo in *cosa*. Lo stile va scelto perché **sappia rendere il moto**.

## 1. Lo stile-casa — animali **naturalistici**, niente vestiti
Canone: **animali fisicamente naturalistici**, gentilmente stilizzati, **mai
cartoon-flat** e **mai vestiti/in costume**. Distinzione che regge tutto il mondo:
- ❌ antropomorfismo **sartoriale** (vestiti, postura bipede, oggetti umani) → **no**;
- ✅ antropomorfismo **culturale/comportamentale** (lingua, società, miti, politica) → **sì**.

Il modello è **Watership Down**: conigli che sono conigli, ma con lingua, cultura, mito,
politica. Registro grafico vicino a **Brian Wildsmith** (colore caldo, gesto) — **non**
Beatrix Potter, che invece *veste* gli animali. La base tecnica resta lo stile di Scrivia
`WORLD_STYLE.animali_del_bosco` (anatomia animale, naturalistica), **riletto senza
vestiti**. Palette: **terrosa/stagionale** (le `SEASON_PALETTE` di Scrivia seguono il
viaggio nelle stagioni).

**Maneggio di oggetti:** niente mani-da-umano, ma **un minimo di maneggio dove serve alla
storia** — annodare il Cordone, portare un pegno — come fanno *davvero* corvidi, lontre,
elefanti. Mai un indumento; al massimo un piccolo oggetto **portato**.

→ **Variazione rispetto a isola:** linea **più gestuale**, capace di **diagonali** e di
rendere la **corsa**; non la posa statica e centrata.

## 2. Il movimento — requisiti espliciti (non opzionali)
Lo stile e ogni prompt-immagine **devono** poter chiedere:
- **Varietà focale & distanza:** primo piano molto vicino ↔ panoramica/lontano. Alternare,
  non restare alla "media distanza" di isola.
- **Cambi d'angolo & punto di vista:** **vista da drone** (stacco sul corridoio reale del
  DEM), **POV** (la telecamera *è* il personaggio), dal basso, dall'alto.
- **Resa del moto:** corsa, salto, vento, acqua — diagonali, scie, sfocato di movimento in
  primo piano.
- **Lo scambio tra i personaggi mostrato:** rendere visivamente l'azione/comunicazione tra
  Rocco e Zara (chi guida, chi protegge), non due figure ferme che si guardano.

## 3. Le due leve che isola non aveva
- **Contrasto di scala (Rocco enorme ↔ Zara minuscola):** un dono per la prospettiva. Dal
  **basso** Rocco diventa monumentale (il datore d'ombra → vedi ritornello *ombra*); dall'
  **alto** si cerca la piccola Zara; i due **nello stesso quadro costringono** a una
  composizione dinamica. È a questo che serve estendere **`KIND_SCALE`** col nostro
  bestiario (vedi `TODO.md`, B2).
- **La camera come personaggio:** il **POV di Zara** è basso, veloce, foglie che sfrecciano
  in primo piano (la velocità *resa* visiva); quello di **Rocco** è alto, lento, largo.
  **Alternarli** in una sequenza d'azione *mostra* la complementarità **senza una parola**.
- **Ritmo vicino↔lontano:** drone che si stacca sul paesaggio ↔ **macro** su un nodo che si
  stringe, un occhio, una zampa sulla pietra tiepida. Il ritmo *è* il movimento.

## 4. Avvertenza operativa
Se lo stile-canone fissasse solo *medium* e *palette*, un illustratore **rifarebbe isola
con colori nuovi**. Per questo §2–§3 sono **vincolanti**: varietà focale, cambi d'angolo,
POV e resa del moto vanno **richiesti** nei prompt, non lasciati impliciti.

> Resta aperto (vedi `TODO.md`): **A2** il marcatore individuale di Rocco/Zara/Toraki (un
> **segno naturale** distintivo — cicatrice, orecchio intagliato, macchia, occhio diverso;
> **mai un indumento** — ancora anti-drift visiva), **A3** la palette esatta di Rocco.
> Questo doc chiude **A1** (stile + movimento come canone).
