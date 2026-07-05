# web/img — illustrazioni

L'interfaccia mostra un'immagine **se il file esiste**. Dove serve resta comunque la
direzione artistica (palette + prompt per i regni; `descriptor` del registro entità per
personaggi e luoghi), così lo slot vuoto non è mai un buco: è un promemoria di reference.

Due comportamenti:
- **regni / cast (comprimari)** — `imgSlot()`: se il file manca, lo slot **sparisce**.
- **entità (protagonisti, luoghi)** — `entShot()`: se il file manca, resta un **placeholder
  con lo stato** (`confermata` / `da generare`, letto da `saga/serializzatore/state/entities.json`).
  Appena carichi il file, la foto **appare da sola** e copre il placeholder.

Convenzione (formato **.webp**):

| cosa | percorso | chiave |
|---|---|---|
| regni | `web/img/regni/<id>.webp` | id: `laghi_occidente, laghi_oriente, pianura_alta, pianura_bassa, selva_di_mezzo, toscana` |
| cast (comprimari) | `web/img/cast/<slug>.webp` | slug = nome file della scheda senza `.md` (es. `cecca.webp`, `la-lupa.webp`) |
| protagonisti | `web/img/cast/<entityId>.webp` | entityId dal registro: `char_rocco.webp`, `char_zara.webp`, `char_toraki.webp` |
| luoghi | `web/img/luoghi/<entityId>.webp` | entityId dal registro (es. `rivalba.webp`, `luogo_le_coppelle.webp`, `luogo_pietre_leone.webp`) |

Note:
- **cast vs protagonisti**: la sezione *Cast* usa lo **slug** della scheda (`img/cast/<slug>.webp`);
  i tre *protagonisti* nella sezione *Personaggi* usano l'**entityId** (`img/cast/char_*.webp`).
  Non c'è collisione (gli entityId dei personaggi sono prefissati `char_`).
- **imageUrl ha la precedenza**: se un'entità in `entities.json` ha un `imageUrl` valorizzato,
  è quello a essere mostrato, prima ancora del file locale. (Oggi è sempre `null`: si carica
  la reference in repo con la convenzione qui sopra, oppure la si scrive nel registro.)
- I **16 luoghi** del registro: `luogo_collina_incontro, luogo_le_coppelle, luogo_pietre_incise,
  luogo_anguicorte_sepolto, luogo_rovine_ordinate, luogo_altare_roccia, luogo_pietre_leone,
  rivalba, forterocca, anguicorte, savenza, leonalba, spondalta_soglia, gran_fiume_guado,
  valico_mastino, le_conche`.

Per cambiare estensione o aggiungere fallback multipli, vedi `imgSlot()` / `entShot()` in `app.js`.
