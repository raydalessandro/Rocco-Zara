# `voce/` — la voce con cui si scrive il libro

La **postura del narratore**: come i fatti (che stanno in `bible/`, `trama/`,
`cartografia/`) vengono *detti*. È il livello "resa", distinto dal livello "cosa succede".

| File | Cosa | Per chi |
|---|---|---|
| `CARTA_VOCE.md` | **fonte di verità** della voce: prosa (firma/variabili/tabù) + blocco-macchina (assi, default, preset) | umani **e** script |
| `selettore.html` | *(da aggiungere)* strumento per scegliere/sentire un indirizzo di voce | solo umani |

## Regola d'oro del cablaggio
Gli **script di brief leggono solo `CARTA_VOCE.md`** (il blocco YAML in §4). Il selettore è
uno **strumento umano** che pesca dalla Carta: **non è un input di pipeline**. La scelta
delle manopole per il capitolo N è un **campo sul nodo-episodio** (`../trama/saga_graph.json`),
non qualcosa che passa dal selettore agli script.

## Rapporto con isola
Stesso **metodo** (firma/variabili/tabù, 4 assi, meccanismo+falsificazione), **contenuto
nostro**. La differenza-chiave: isola vive sul *taglio* (frase corta), R&Z sull'*intreccio*
(periodo che scorre) — perché R&Z è una narrazione che **avanza**, non vignette circolari.
