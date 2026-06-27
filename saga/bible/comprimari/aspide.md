# Aspide — scheda canone (comprimario · la Serpe, il consigliere)

> **Promozione a scheda-voce.** Aspide è già canone in `../../cartografia/regni/pianura_alta/la_serpe.md`
> (il **consigliere di corte**, la vipera che *«sussurra al Signore e tiene i fili della rete»*). Qui si rifinisce
> la **voce** per il serializzatore. De-stereotipato: non "il viscido consigliere", ma il **veleno
> impersonale** — leale alla **Serpe come istituzione**, non a chi siede in cima.

- **specie**: vipera (il consigliere di corte)
- **tipo**: comprimario (antagonista ricorrente)
- **attribute_ear (dominante)**: connettere
- **età / mondo**: adulto/anziano / il Gran Ducato, la **corte** di Anguicorte (sempre **dietro** il trono)

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: **immobile, appena dietro il Signore** — la voce all'orecchio; la vipera **avvolta vicino**,
  che non colpisce mai allo scoperto: il veleno è **nelle parole**. Mai al centro della scena; sempre al suo margine.

### Natura
- **freddo, paziente, sussurrante**: non comanda — **suggerisce**, e il suggerimento è già veleno.
- **strumento puro**: non ha ambizione propria. Servirebbe Viscardo **o** Bissa allo stesso modo — è fedele
  alla **Serpe**, non a una testa. Per questo **sopravvive** a ogni faida.

### Paura (arco lungo, se ne ha)
- nessuna **personale** (non avendo ambizione, non ha nulla da perdere di proprio). L'unica crepa concepibile:
  il **fallimento della Serpe** come istituzione — la rete che serve.

### Il dono / la forza
- **tiene i fili della rete**: è il vertice della catena di spie ed esattori (Cècca, Sòrcio, Artiglio
  **salgono a lui**). Vede l'intero ragnatela; consiglia; il suo veleno è **informazione e suggerimento**.

### Arco di crescita (per soglie)
- antagonista ricorrente **costante**: non cresce, **persiste**. È il fattore freddo che la **successione non
  sposta** — chiunque vinca, lui resta a sussurrare.

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **regno + classe**: Gran Ducato / «il Signore e la Corte» → registro *"liscio, freddo, aforistico, mai una
  parola di troppo"* (`_voci.json`).
- **forestiero?** no (è la corte stessa).

**Tier 2 — firma individuale.**
- **superficie**: **sussurra**, non ordina mai; suggerimenti che sono già veleno («se posso permettermi…»).
  **sotto**: lo strumento puro, devoto alla **posizione**, non alla persona.
- **non direbbe MAI**: **ordinare apertamente** — né mostrare **ambizione propria** (non vuole il trono: vuole la rete).

> **Test (CARTA_VOCE §1.4):** «Il Signore farà come crede, s'intende. Converrebbe, però, che chi crede troppo non veda l'alba.» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: pianura_alta
  gruppo: il Signore e la Corte
  registro_ref: pianura_alta/il Signore e la Corte

voce_personaggio:
  name: Aspide
  role: comprimario
  archetype: il consigliere della Serpe — il veleno che sussurra; tiene i fili della rete
  underStress: abbassa ancora la voce, suggerisce invece di ordinare
  ritmo: sussurro liscio, freddo, aforistico
  words: se posso permettermi / il Signore farà come crede, ma / converrebbe
  never: ordina apertamente o mostra ambizione propria
```

### EAR
- **⇄** *(dominante)* **tiene i fili della rete** — il ragno della ragnatela: Cècca, Sòrcio, Artiglio
  convergono **su di lui**.
- **Δ** **legge** la corte e i rapporti (la mente strategica).
- **⟳** —

### Mondo affettivo / relazioni
- **Viscardo / Bissa**: serve la **posizione**, non l'una né l'altra — il **fattore freddo** che la faida di
  successione (lega a `bissa.md`) **non muove**.
- **Cècca · Sòrcio · Artiglio**: la **catena** che sale a lui (lega a `cecca.md`, `sorcio.md`, `artiglio.md`):
  ne è il vertice operativo.

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Gran Ducato — «il Signore e la Corte» (il consigliere, il **ragno della rete**).
- **bioma d'origine**: il **Cuore** di corte, Anguicorte.
- **perché entra**: è la **mente** della caccia al Cordone — chi muove pedine senza esporsi.
- **aggancio al Cordone / alla Serpe**: traduce in **strategia** l'ordine del vertice (trovare e tagliare il
  Cordone); raramente in scena, ma quando c'è, **pesa**. Costellazione: `la_serpe.md`.
