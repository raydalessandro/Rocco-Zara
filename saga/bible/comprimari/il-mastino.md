# il Mastino — scheda canone (comprimario · la Serpe, il vassallo dei valichi)

> **Promozione a scheda-voce.** Il Mastino è già canone in `../../cartografia/regni/pianura_alta/la_serpe.md`
> (il **vassallo** che tiene i **valichi orientali** — *"un blocco da aggirare o piegare, non un simbolo"*).
> Qui si rifinisce la **voce** (è il **modello** stesso del registro «i Vassalli»). De-stereotipato: non "il
> bruto", ma il **guerriero fiero** con un **proprio codice** — vassallo della Serpe, ma per onore feudale, non
> da lacchè: per questo lo si può **aggirare o piegare** facendo leva sull'onore.

- **specie**: cane mastino (signore-condottiero dei valichi)
- **tipo**: comprimario (antagonista ricorrente — blocco)
- **attribute_ear (dominante)**: distinguere
- **età / mondo**: adulto / il Gran Ducato, i **valichi orientali** (Serpàna / Cimàrio)

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: **piantato sul valico come una porta di fortezza**; la posa fiera, il **ringhio che è orgoglio**
  più che minaccia; cicatrici portate come **medaglie**. Non si nasconde, non tende agguati: ti affronta **a viso aperto**.

### Natura
- **passionale, sprezzante, fiero** (boria cavalleresca): onorevole **nel proprio codice**; **disprezza
  l'inganno**; tiene i valichi come una **carica** d'onore.
- serve la Serpe da **vassallo fiero**, non da servo — la sua lealtà è **feudale e condizionata**, non assoluta.

### Paura (arco lungo, se ne ha)
- prima emersione: il **disonore** → tocco: essere costretto a un atto **sotto il proprio codice** (un agguato,
  un tradimento) → fioritura: lì la sua lealtà alla Serpe **si incrina** — la cucitura per cui può **piegarsi**.

### Il dono / la forza
- è una **muraglia militare vera**: tiene i passi, forte e coraggioso. Ma il suo **onore è la leva**: chi lo
  affronta a viso aperto e si mostra **degno** può aggirarlo — o **conquistarlo**.

### Arco di crescita (per soglie)
- blocco **ricorrente**: il muro sul cammino. Lo scatto possibile (multi-arco): **piegarsi** — se R&Z lo
  battono *per onore*, non per forza, o se la Serpe lo costringe a un disonore che non sopporta.

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **regno + classe**: Gran Ducato / «i Vassalli» → registro *"passionale, sprezzante, fiero"* (`_voci.json`) —
  **il registro è modellato su di lui** («da Mastino»): ne è l'**archetipo**.
- **forestiero?** no (signore di un feudo del Ducato).

**Tier 2 — firma individuale.**
- **superficie**: fiero, ringhiante, cavalleresco-borioso; **sfida apertamente**. **sotto**: un onore da
  guerriero che è **forza e cucitura** insieme.
- **non direbbe MAI**: **colpire di nascosto** o **disonorare un nemico degno** (il discriminante: niente agguati).

> **Test (CARTA_VOCE §1.4):** «A viso aperto, allora. Il mio valico non si ruba: si merita. Nessuno passa che non valga il passo.» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: pianura_alta
  gruppo: i Vassalli
  registro_ref: pianura_alta/i Vassalli

voce_personaggio:
  name: il Mastino
  role: comprimario
  archetype: il Mastino — vassallo fiero dei valichi; boria cavalleresca, orgoglio che ringhia
  underStress: ringhia il proprio onore, sfida a viso aperto
  ritmo: passionale, sprezzante, fiero, a sfida
  words: a viso aperto / il mio valico / l'onore / nessuno passa
  never: colpisce di nascosto o disonora un nemico degno
```

### EAR
- **Δ** *(dominante)* il **gatekeeper** che giudica **chi è degno di passare** — la sua logica di valico (e la
  sua cucitura: se ti mostri degno, vacilla).
- **⟳** un blocco **che si può piegare** — l'onore è la leva.
- **⇄** —

### Mondo affettivo / relazioni
- **il Giurato** (Arco 2, `il-giurato.md`): **guerriero-specchio** — l'onore di qua (Serpe) e di là (i liberi):
  due codici a confronto.
- **la Serpe** (vertice): vassallo **fiero**, lealtà **condizionata** — può piegarsi se disonorato.
- **Rocco e Zara**: possono **vincerlo per onore**, non per forza (la chiave del blocco).

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno**: Gran Ducato — «i Vassalli» (signore dei valichi orientali, Serpàna/Cimàrio).
- **bioma d'origine**: l'**Orlo** montano, i **valichi** orientali.
- **perché entra**: è il **blocco fisico** sul cammino — un muro **da aggirare o piegare**, mai un simbolo.
- **aggancio al Cordone / alla Serpe**: chiude i passi per ordine della Serpe; ma il suo onore lo rende
  **incrinabile** — un possibile varco là dove la forza non basta. Costellazione: `la_serpe.md`.
