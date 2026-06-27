# web/img — illustrazioni

L'interfaccia mostra un'immagine **se il file esiste**, altrimenti non mostra nulla (lo slot sparisce) e resta la direzione artistica (palette + prompt).

Convenzione (formato **.webp**):
- regni → `web/img/regni/<id>.webp`  (id: laghi_occidente, laghi_oriente, pianura_alta, pianura_bassa, selva_di_mezzo, toscana)
- cast  → `web/img/cast/<slug>.webp` (slug = nome file della scheda senza `.md`, es. `artiglio.webp`, `la-lupa.webp`)

Per cambiare estensione o aggiungere fallback multipli, vedi `imgSlot()` in `app.js`.
