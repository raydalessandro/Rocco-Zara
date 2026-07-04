# PROSATORE — il dettaglio normativo

> Compagno di `.claude/agents/prosatore.md`. Qui: il formato del manoscritto, il rito
> della sessione, il consuntivo, i casi limite. La skill dice *cosa sei*; questo doc
> dice *come si consegna*.

## 1. Il formato del manoscritto (`saga/prosa/epNN.md`)

```markdown
# ep03 — <titolo della puntata>
<!-- brief: sha del brief usato · grafo: 0.2.0-stagione -->

## Pagina 1
<prosa>

## Pagina 2
<prosa>
…
```

- **Un file per puntata**, header `## Pagina N` (identico a isola: l'estrattore del
  dataset di fine-tuning li usa come confini di pagina).
- Le note di regia per l'illustrazione **non** vivono qui: stanno nelle `tavole` del
  nodo (scenografo). Se in sessione nascono, si passano allo scenografo, non si
  lasciano commenti nel manoscritto.
- Il commento in testa (sha del brief + versione grafo) è la **tracciabilità**: la
  prosa è figlia di quel brief deterministico.

## 2. Il rito della sessione (con Ray)

1. **Apertura.** Carica brief + Carta + Metafore + ritornelli + pattern banditi.
   Dichiara in una riga cosa fa la puntata (dal brief): arco, faccia della Serpe,
   semi in gioco.
2. **Pagina.** Proponi UNA pagina + nota tecnica (3-4 righe: seme/ritornello/camera/
   parola nuova). Niente alternative multiple se Ray non le chiede.
3. **Correzione.** Ray taglia/cambia → si riscrive **quella** pagina, non si difende.
4. **Avanti.** Solo a pagina approvata.
5. **Chiusura.** Consuntivo (sotto) + commit su branch `prosa/epNN`.

## 3. Il consuntivo (in coda alla sessione, non nel manoscritto)

Tabella breve, nel messaggio di chiusura o nel corpo della PR:

| Voce | Contenuto |
|---|---|
| Semi piantati / pagati | id dal grafo, con la pagina dove accade |
| Ritornelli suonati | quale dei 5, formula usata (verifica: alla lettera) |
| Parole nuove | lessico introdotto al lettore (max 1-2 a puntata) |
| Debiti lasciati | ciò che la puntata promette alla prossima |
| Scarti di brief | punti dove la prosa ha dovuto interpretare (da ratificare) |

Se "Scarti di brief" non è vuoto → l'orchestratrice decide se il grafo va aggiornato
(corsia trama/backend), **prima** del merge della prosa.

## 4. La voce, operativamente

- **Frase breve, concreta, sensoriale.** Il limpido di Calvino: si vede, si tocca,
  si annusa. Subordinate rare; il ritmo fa il lavoro dell'aggettivo.
- **Doppio strato.** La superficie per i 6-8 anni (azione, corpo, dialogo); lo strato
  adulto è **posizione delle cose**, mai commento. Se serve spiegare, è saltato.
- **I personaggi parlano per registro di regno** (`_voci` + schede): un Dotto non ha
  le frasi di un carrettiere della Piana. In dubbio, rileggi la scheda, non "aggiusti".
- **Rocco e Zara**: la doppia scala vive anche nella prosa (chi vede cosa, da che
  altezza, chi passa dove). Non è solo materia per le tavole.

## 5. Casi limite (le risposte pronte)

| Caso | Mossa |
|---|---|
| Il brief contraddice un volume | Fermati. Segnala (è drift di grafo, non materia di prosa). |
| Serve un nome che il lessico non ha | Non coniare in sessione: proponi, Ray decide, si aggiunge a `mappa.json` **prima** (corsia lessico). |
| Una figura retorica "bellissima" ma umana | Si butta. La tabella di `METAFORE.md` dà l'equivalente nativo; se non c'è, si riscrive la frase. |
| La pagina viene troppo lunga | Il taglio-pagina è del brief (hook): si asciuga la prosa, non si sposta il confine. |
| Ray chiede un cambiamento che rompe un seme | Si fa notare UNA volta (con l'id del seme); se conferma, si esegue e si scrive negli "scarti". |
| Tentazione di descrivere la tavola | La prosa dice ciò che l'immagine non può. Riscrivi dal senso mancante (odore, tempo, pensiero). |

## 6. Verso il fine-tuning (perché la disciplina paga)

Le sessioni del prosatore producono, oltre al libro, il **corpus**: coppie
brief→prosa pulite, pagina per pagina. La disciplina (header `## Pagina N`, formule
alla lettera, zero commenti nel testo) è ciò che rende il manoscritto **estraibile**
senza pulizia manuale — esattamente come isola. Il prosatore umano-in-sessione di
oggi è il dataset del prosatore automatico di domani.
