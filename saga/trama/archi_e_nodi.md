# Archi & nodi — la struttura del viaggio lungo (50–100 puntate)

> isola erano **12 storie fisse** in cicli A/B/C/D. Rocco & Zara è un **viaggio** di
> decine di puntate dove **le cose cambiano nel tempo**: serve una struttura più forte.
> Questo documento la definisce. Fondamento: `ontologia/COME_SI_APPLICA.md` (EAR
> frattale + soglie). Compagno anti-drift: `continuita_e_anti_drift.md`.

## 1. Tre livelli, stessa forma (frattale EAR)

Per il kernel (`A5`/`P4`/`T3`) **lo stesso pattern si ripete a ogni scala**. Quindi:

```
SAGA  (l'intero viaggio)            Δ due mondi separati → ⇄ ponti costruiti → ⟳ una casa
  └─ ARCO (una regione/centro)      Δ il conflitto del luogo → ⇄ chi si unisce → ⟳ cosa cambia lì
       └─ EPISODIO (una puntata)    Δ il problema che apre → ⇄ l'incontro/cooperazione → ⟳ il segno che resta
```

Un **episodio** è una saga in miniatura; un **arco** è un episodio in grande. Questo è
il motore di coerenza: ogni livello deve poter dichiarare il proprio Δ/⇄/⟳. Se non li
ha tutti e tre, è incompleto (è il check minimo del kernel, `P6`).

## 2. Il viaggio è una *spina* geografica

A differenza di isola (storie sparse sull'isola), qui gli episodi sono **ordinati come
una rotta** attraverso il territorio: **ogni episodio riprende dove finiva il
precedente** (posizione fisica + stato del mondo). La **spina del viaggio** è la
direttrice naturale del luogo reale (un fiume, una costa, una valle — vedi
`cartografia/README.md` §4.4). I **centri gravitazionali** sono le **stazioni** lungo
la spina: un arco vive attorno a un centro; il viaggio tra due centri è "strada".

```
   centro₁ ───strada─── centro₂ ───strada─── centro₃ ───strada─── …
  [ARCO A ]            [ARCO B ]            [ARCO C ]
```

## 3. Tipi di episodio (come il "monster of the week" + plot in Pokémon)

Ogni nodo-episodio ha un **tipo** che ne dichiara la funzione:

| Tipo | Cosa fa | Frequenza |
|---|---|---|
| `stazione` | avventura autoconclusiva attorno a un centro; introduce una **creatura dell'episodio** | la spina dorsale della serie |
| `viaggio` | si attraversa la strada tra due centri; mondo che cambia, piccoli incontri | tra un arco e l'altro |
| `cardine` | la **trama di fondo avanza visibilmente** (un ponte tra i due mondi si compie, una soglia di saga si supera) | ~1 per arco (la chiusura d'arco) |
| `respiro` | beat di personaggio/relazione; poca trama, molto cuore (una paura toccata, un arco di crescita che scatta) | sparso, dosato |

Regola: una creatura dell'episodio può **tornare** (diventare ricorrente) — è il modo
"Pokémon" di popolare il mondo senza inventare tutto da zero ogni volta.

## 4. Cosa avanza sotto le avventure (gli archi lunghi)

Sotto le puntate corrono **archi di lungo periodo** che la macchina della trama tiene
(campi del nodo-episodio, vedi `schema_episodio.md`):

- **Arco di saga (EAR macro)**: due mondi → ponti → casa. Ogni `cardine` lo fa
  avanzare di un passo (una *soglia* di saga superata).
- **Archi di crescita dei protagonisti**: Rocco (vergogna del corno → forza) e Zara
  («troppo piccola» → «misura giusta»). Avanzano per **soglie discrete** (`P3`): non
  un po' a ogni puntata, ma scatti guadagnati in episodi `respiro`/`cardine`.
- **Archi di paura**: Rocco (cose piccole e veloci) e Zara (buio profondo) — come le
  `fear_arc` di isola: prima emersione *seminata*, poi tocchi, poi fioritura.
- **Semi & debiti**: piantati in un episodio, raccolti più avanti (la fase ontologica
  ↻; vedi `ontologia/COME_SI_APPLICA.md`). Portano la **memoria** della saga.
- **Mondo che cambia**: un centro può trasformarsi (una diga rotta, un'amicizia tra
  mondi che attecchisce); il cambiamento è canonico solo **oltre soglia** (anti-drift).

## 5. Pianificazione a *orizzonti* (per non bloccare 100 puntate in anticipo)

Non si scrive il grafo di 100 episodi al primo colpo (sarebbe rigido e fonte di drift).
Si lavora a **orizzonti**:

1. **Saga skeleton** (stabile): l'arco EAR macro + l'elenco ordinato degli **archi**
   (le regioni/centri) con la *domanda* di ciascuno e cosa cambia alla fine. Pochi
   campi, molto stabili. È la "stella polare".
2. **Arco corrente** (dettagliato): il grafo degli **episodi** dell'arco in corso
   (6–10 nodi) completamente modellato — spina, semi, tipi, beat.
3. **Arco prossimo** (abbozzato): titoli/funzioni, semi che riceverà.
4. **Oltre** (semi sparsi): solo i semi a lunga gittata e le promesse aperte.

Quando un arco si chiude, il successivo passa da "abbozzato" a "dettagliato". Così il
contesto attivo resta **piccolo** (un arco alla volta) — chiave per evitare drift e
costi (vedi `continuita_e_anti_drift.md` §"un arco alla volta").

## 6. Come un episodio diventa una storia (aggancio al motore)

Ogni nodo-episodio, una volta modellato, viene tradotto dal **serializzatore** in un
`Seed` per il motore Scrivia (`serializzatore/README.md`, M2). Le **voci** di Rocco e
Zara, il loro **aspetto** e i **luoghi** arrivano **bloccati dal canone** (`bible/`,
`cartografia/`): il motore *rende*, non reinventa. Il `seed_nonce` resta l'invariante
di riproducibilità (stesso nonce → stessa resa).

## 7. Quote & vincoli di saga (anti-ripetizione su scala lunga)

Su 100 puntate il rischio non è solo il drift, è la **ripetizione**. Come isola con le
`quote_tracker` (quante volte un detto, un'onomatopea, una scena notturna nella saga),
fissiamo nel `saga_config.yaml` budget di saga: quante volte una creatura ricorrente
può tornare, ogni quanto un `cardine`, tetti lessicali, varietà dei tipi-episodio in
una finestra. Il serializzatore li verifica (audit di continuità).

---

### Check di un arco ben fatto (dal kernel)

- [ ] Dichiara Δ/⇄/⟳ proprio (e li *eredita* frattali dalla saga).
- [ ] Ha la sua **risonanza completa** (4 fasi ⊙∞◇↻, `P5`/`T4`): apertura, ciclo che
      si auto-alimenta, momento-cardine insostituibile, semi lasciati. Se ne manca una,
      l'arco è "osservazione parziale", non legame vero.
- [ ] Ha ≥1 `cardine` che fa avanzare la saga di una **soglia**.
- [ ] Apre semi che fioriranno **fuori** dall'arco (memoria lunga).
- [ ] Cambia *qualcosa* nel mondo o nei protagonisti, **oltre soglia** (non cosmetico).
