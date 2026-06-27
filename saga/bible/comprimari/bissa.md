# Bissa — scheda canone (comprimario · la Serpe, l'erede / linea propria)

> **Promozione a scheda-voce.** Bissa è già canone in `../../cartografia/regni/pianura_alta/la_serpe.md`
> (la **giovane Vipera**, l'erede). Qui si rifinisce la **voce** (Tier 2) e si apre la sua **linea propria**:
> la **successione** — Bissa contro Viscardo — una faida interna alla Serpe che R&Z possono **sfruttare**.
> È il *"secondo che genera trama"* dell'Arco 3, ma il suo filo attraversa l'intera saga.

- **specie**: vipera (giovane — l'erede della Serpe)
- **tipo**: comprimario (antagonista, linea propria)
- **attribute_ear (dominante)**: cambiare
- **età / mondo**: giovane / il Gran Ducato, la **corte** di Anguicorte

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: **tesa dove Viscardo è immobile** — dove il vecchio Serpe sta avvolto e paziente, lei è
  avvolta e **pronta a scattare in anticipo**. Il **guizzo troppo svelto**: l'impazienza in una stirpe che ha
  fatto della pazienza un'arma.

### Natura
- **ambiziosa, impaziente**: vuole provare il **proprio veleno**, non aspettare il proprio turno. Prenderebbe
  i Luoghi e il Cordone **più in fretta e più brutalmente** di quanto il vertice consenta.
- mal sopporta la **pazienza** di Viscardo: la legge come debolezza.

### Paura (arco lungo, se ne ha)
- prima emersione: il terrore di **restare per sempre l'erede** — di morire Vipera senza diventare mai Serpe
  → tocco: ogni indugio di Viscardo → fioritura (nera): rischia di più, e così diventa **più pericolosa** e
  insieme **più sfruttabile** (la sua fretta apre crepe nella compattezza della Serpe).

### Il dono / la forza
- **l'audacia**: osa ciò che Viscardo rimanda. È più imprevedibile — e proprio per questo la **leva** che R&Z
  imparano a usare: dividere il vertice contro sé stesso.

### Arco di crescita (per soglie)
- **linea propria** (multi-arco): la faida di **successione**. Non "cresce" verso il bene; cambia gli **equilibri**
  della Serpe. Lo scatto è quando la sua impazienza, sobillata o sfruttata, **incrina** l'unità del vertice.

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **regno + classe**: Gran Ducato / «il Signore e la Corte» → registro *"liscio, freddo, aforistico"* (`_voci.json`)
  — **lo stesso** di Viscardo: ma in lei il liscio è **teso**, troppo svelto a chiudere. È il punto.
- **forestiero?** no (è il **sangue** della Serpe, non solo il braccio).

**Tier 2 — firma individuale.**
- **superficie**: il freddo di corte, ma **affilato d'impazienza** — taglia corto, vuole concludere **adesso**.
  **sotto**: la fretta di chi non sopporta di aspettare.
- **non direbbe MAI**: **consigliare di aspettare** — "aspettare" è la parola di Viscardo, quella che odia.

> **Test (CARTA_VOCE §1.4):** «Viscardo aspetta. Viscardo aspetta sempre. Io no: il mio turno è adesso.» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: pianura_alta
  gruppo: il Signore e la Corte
  registro_ref: pianura_alta/il Signore e la Corte

voce_personaggio:
  name: Bissa
  role: comprimario
  archetype: la giovane Vipera — erede impaziente, freddo di corte teso d'ambizione
  underStress: taglia corto, vuole agire subito, sfida la pazienza del vertice
  ritmo: frase liscia e fredda, ma svelta a chiudere
  words: adesso / il mio turno / Viscardo aspetta troppo
  never: consiglia di aspettare
```

### EAR
- **⟳** *(dominante)* vuole **cambiare l'ordine**: accelerare la successione, rovesciare la pazienza del vertice.
- **Δ** —
- **⇄** —

### Mondo affettivo / relazioni
- **Viscardo**: il vecchio Serpe, rivale e ostacolo — la **faida di successione** è la sua linea.
- **Aspide**: il consigliere che **bilancia** lei e Viscardo (chi lo tira dalla sua parte, vince).
- **Artiglio**: un braccio che lei vorrebbe usare **a modo suo** (lega a `artiglio.md`).

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Gran Ducato — «il Signore e la Corte» (l'**erede** della Serpe).
- **bioma d'origine**: il **Cuore** di corte, Anguicorte.
- **perché entra**: è il **motore di trama** che il verticale offre ai protagonisti: la **crepa interna** della Serpe.
- **aggancio al Cordone / alla Serpe**: la sua impazienza è la **leva** narrativa contro la compattezza della
  Serpe — il modo in cui due piccoli possono opporsi a un potere grande: **dividerlo**. Costellazione: `la_serpe.md`.
