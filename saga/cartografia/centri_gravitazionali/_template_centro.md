> ℹ️ **Nota di allineamento.** Nel canone del cartografo i "centri gravitazionali"
> sono realizzati dalla **grammatica delle 7 zone** (in particolare **Cuore** e
> **Soglia**) e dalle **città-rovina** (vedi `../regni/_faunario.md` e
> `../regno/rete_urbana.json`). Usa questo template per i **punti-calamita specifici**
> di una storia *dentro* una zona, non per ridefinire la struttura del mondo.

# Template — Centro gravitazionale `<id>`

> Un **centro gravitazionale** è un punto del territorio che fa da **calamita alle
> avventure**: ruota attorno ad esso (almeno) un **arco**. Copia questo file in
> `centri_gravitazionali/<id>.md` e compila. Vedi il brief: `cartografia/README.md` §5.

- **id**: `<snake_case>` (combacia col Point nel geojson)
- **name**: «<nome di finzione>»
- **tipo**: `naturale` | `animale` | `rovina`
  - *naturale*: struttura naturale divenuta luogo-di-ritrovo (radura, quercia, cascata, grotta…)
  - *animale*: costruita dagli animali stessi (diga, tana comune, mercato di scambio, sentiero battuto…)
  - *rovina*: antica struttura umana **abbandonata** (tempio, arco di pietra, pozzo) — presenza umana **passata e perduta**, ora riusata dagli animali
- **bioma**: `<dal geojson>`
- **quadrante / posizione**: `<settore>` — lat/lon `<…>`
- **storia del luogo** *(1–3 frasi)*: cos'era, com'è ora, chi lo frequenta. Per le
  rovine: chi l'ha costruito (umani perduti) e cosa gli animali ne fanno oggi.
- **chi lo abita / frequenta**: gruppi o creature legate al centro (popoleranno
  l'arco; alcune diventeranno "creature dell'episodio").
- **funzione narrativa**: che tipo di avventure attira; quale tensione vi nasce.
- **arco/i ospitati**: `<id arco in trama/>` — quante puntate vi ruotano.
- **come ci si arriva**: da quale centro precedente, lungo quale rotta (la spina del
  viaggio: ogni episodio riprende dove finiva il precedente).
- **EAR del centro**: Δ `<cosa distingue>` · ⇄ `<cosa connette>` · ⟳ `<cosa fa cambiare>`
- **vincoli visivi**: palette, elementi fissi (per la coerenza delle illustrazioni).

---

### Esempio (dalla storia origine, da ancorare al luogo reale)

- **id**: `albero_cavo`
- **name**: «L'Albero Cavo»
- **tipo**: `naturale`
- **bioma**: `foresta`
- **storia del luogo**: un albero antichissimo, cavo alla base; asciutto dentro anche
  nella tempesta. Zara ci andava da cucciola. È rifugio e soglia.
- **funzione narrativa**: riparo nelle avventure di tempesta; luogo di confidenze
  (dove cadono le difese di Rocco e Zara).
- **EAR**: Δ il dentro/fuori (asciutto vs. tempesta) · ⇄ dove i due si stringono
  insieme · ⟳ dove un legame si salda.
