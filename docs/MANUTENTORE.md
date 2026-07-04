# MANUTENTORE — il dettaglio normativo

> Compagno di `.claude/agents/manutentore.md`. Qui: il rito del giro, le classi con
> esempi nostri, la disciplina dell'archivio.

## 1. Il rito del giro (sempre uguale)

1. **Apri col report**: `python3 tools/verifica_referenze.py --report` + lettura dei
   pannelli (`README.md`, `saga/TODO.md`, README di cartella toccati di recente).
2. **Scrivi il perimetro** (nel messaggio o nella descrizione della PR): elenco
   puntato di ciò che il giro farà, ogni voce marcata **A** o **B**.
3. **Le B si propongono** (opzioni + raccomandazione). Si eseguono solo le B decise.
4. **Esegui le A** con edit chirurgici: un tema = un commit, messaggi in italiano.
5. **Grep di coerenza** per ogni spostamento; `npm run refs` e `npm run check` verdi.
6. **Chiudi i pannelli**: ciò che il giro ha cambiato si riflette in TODO/README/
   TEST_SPEC — con numeri **verificati** (conteggio test dal check appena girato).
7. **PR** su branch `chore/…` con l'elenco A/B come descrizione.

## 2. Le classi, con esempi di casa nostra

| Classe A (si esegue) | Classe B (si propone) |
|---|---|
| `git mv docs/DOC_CONCLUSO.md docs/_archivio/` + riga nel README d'archivio | eliminare un file "inutile" (mai di default: proporre archivio vs delete) |
| correggere `seme/generations.json` → `.jsonl` in un doc | rinominare un doc o una cartella (rompe le abitudini: decide Ray) |
| spuntare nel TODO un item **già** chiuso da una PR mergiata | riscrivere la struttura di un pannello (README root, TODO) |
| allineare il conteggio test nel README dopo un check verde | cambiare una convenzione (naming branch, formato commit) |
| aggiungere a un README di cartella il file che mancava in tabella | promuovere/degradare lo status di un doc (vivo ↔ archivio) quando è ambiguo |

Regola pratica: se per farlo devi **scegliere** tra due esiti sensati, è B.

## 3. L'archivio (`docs/_archivio/`)

- Ci va ciò che è **concluso**: liste-lavori esaurite, tracce di costruzione,
  fotografie di momenti passati. Ogni ingresso = una riga nella tabella del suo README
  (file, cos'era).
- **Non si aggiorna mai** un file archiviato; se torna utile, si **cita**, non si
  resuscita. Se serve una versione viva, se ne scrive una nuova al posto giusto.
- Lo strumento delle referenze **ignora** l'archivio per costruzione (né sorgente né
  orfano): l'archivio non fa rumore.

## 4. Lo strumento (che cosa dice davvero)

- `--check` (= `npm run refs`): **solo** path citati nei sorgenti di **codice**
  (ts/tsx/py/mjs/js) che non esistono. Rosso = qualcuno promette un file che manca.
  È oggettivo: può entrare in CI quando si vuole (oggi è fuori da `npm run check`,
  scelta deliberata: prima si vede quanto è stabile).
- `--report`: il quadro (rotti ovunque con whitelist annotata, orfani nelle
  zone-canone, duplicati byte-identici). Il report **non è una sentenza**: gli orfani
  legittimi esistono (appunti umani, immagini di riferimento); i dinamici
  (`regni/`, `zones/`) sono raggruppati apposta.
- Manutenzione dello strumento stesso: whitelist e prefissi (in testa al file) si
  aggiornano quando nascono nuovi doc-roadmap o nuove zone dinamiche — è Classe A se
  il caso è evidente, B se cambia la semantica del check.

## 5. Cosa resta fuori per sempre

Comportamento di codice, canone narrativo, test di sostanza, la carta, i brief.
Il manutentore che "sistema" un test rosso cambiandolo non è un manutentore: è un
incidente. Rosso di sostanza → corsia titolare.
