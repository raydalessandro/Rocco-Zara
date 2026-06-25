# Continuità & anti-drift — l'accumulo coerente della storia nel tempo

> Il problema che hai sollevato: su 50–100 puntate **le cose cambiano**, e la trama va
> riportata **coerente** senza (a) gonfiare il contesto rileggendo tutte le puntate,
> (b) andare in **drift** (contraddizioni, personaggi che derivano, mondo incoerente).
> Gran parte la portano già i **semi**; questo è il pacchetto che gestisce il resto.

## Principio guida (dal seme + dal kernel)

**"La verità è nel grafo", applicata al tempo.** Lo stato canonico del mondo *non*
vive nella prosa accumulata: vive in **stato strutturato** che la prosa *rende*. Per
scrivere l'episodio N **non si rileggono** gli episodi 1…N-1: si costruisce uno
**snapshot compatto dello stato a N** a partire dal grafo. La prosa è output, non
fonte di verità.

E dal kernel (`P3`/`OP3`): **le soglie sono reali**. Un cambiamento è canonico **solo
se supera una soglia**; sotto soglia è cosmetico e non sporca lo stato. È ciò che
impedisce al mondo di accumulare rumore (= drift).

## I tre registri dello stato

1. **Canone fisso** (`bible/`, `cartografia/`): ciò che **non cambia mai** —
   aspetto/voci di Rocco e Zara, i tre luoghi-cardine, le regole. È *bloccato*: ogni
   episodio lo riceve identico (coerenza visiva e di voce "da serie").
2. **Stato evolutivo** (nel grafo, per episodio): ciò che **cambia per soglie** —
   crescita dei protagonisti, paure toccate/fiorite, relazioni, centri trasformati,
   creature diventate ricorrenti, semi piantati/raccolti, debiti aperti/chiusi.
3. **Resa** (prosa + immagini per episodio): output. **Non** è fonte di verità; se
   contraddice lo stato, è la resa a sbagliare.

## Il meccanismo: *delta* per episodio + *fold* deterministico

Ogni nodo-episodio dichiara, in modo strutturato, **cosa cambia** (i suoi *delta*):

```jsonc
"effects": {
  "growth":   [{ "who": "rocco", "axis": "vergogna_corno", "delta": "+1", "threshold_crossed": true }],
  "fear":     [{ "who": "zara",  "fear": "buio", "status": "toccata" }],
  "relation": [{ "between": ["rocco","zara"], "delta": "fiducia+", "threshold_crossed": false }],
  "world":    [{ "place": "albero_cavo", "change": "noto_come_rifugio", "threshold_crossed": true }],
  "seeds_planted":  ["seed_..."],
  "seeds_bloomed":  ["seed_..."],
  "debts_opened":   ["debt_..."],
  "debts_closed":   ["debt_..."],
  "creature_status":[{ "id": "...", "status": "introdotta|ricorrente" }]
}
```

Lo **stato del mondo a N** = `fold(effects₁ … effects_{N-1})`: una **riduzione
deterministica** dei delta, non un riassunto a mano. Solo i delta con
`threshold_crossed: true` entrano nello stato canonico (gli altri restano "colore"
dell'episodio). Questo snapshot — **piccolo, sempre ricostruibile** — è ciò che il
serializzatore passa al motore come contesto-saga dell'episodio N.

> Vantaggio: per scrivere N serve **O(stato)**, non **O(tutte le puntate)**. Il
> contesto attivo non cresce con la lunghezza della saga.

## "Un arco alla volta" (l'orizzonte attivo)

Combinato con la pianificazione a orizzonti (`archi_e_nodi.md` §5): in lavorazione c'è
**un solo arco** (6–10 episodi). Il contesto attivo è dunque:
- il **canone fisso** (bloccato, piccolo),
- lo **snapshot di stato** all'inizio dell'arco (compatto),
- il **grafo dell'arco corrente** (pochi nodi),
- i **semi/debiti aperti** rilevanti (lista breve).

Tutto il resto è **archiviato** e non entra in contesto. Niente bloat con la lunghezza.

## Compattazione per arco (il "recap canonico")

Alla chiusura di un arco, si produce un **recap d'arco**: un riassunto **compatto e
canonico** generato **dai delta strutturati** (non a mano, non dalla prosa), che
diventa la **nuova baseline**. I delta di dettaglio dell'arco si **archiviano**. Il
recap è la forma in cui la memoria lunga sopravvive **senza rileggere le puntate** —
ed essendo derivato dai delta, **non può andare in drift** rispetto allo stato.

```
[arco A: delta puntata-per-puntata] ──fold──► [recap canonico A] ──baseline──► arco B
                                   (i delta di A vanno in archivio)
```

## L'audit di continuità (il guardiano)

Prima e dopo ogni episodio (e a chiusura d'arco), il serializzatore fa girare un
**audit** (ruolo dell'`audit` di isola, esteso alla linea del tempo). Controlla:

- **Coerenza col canone fisso**: aspetto/voci/luoghi non derivano (drift di carattere).
- **Coerenza con lo stato**: ciò che l'episodio *asserisce* sul mondo non contraddice
  lo snapshot a N (drift di mondo). Se contraddice → flag.
- **Semi pagati**: ogni seme piantato ha un `bloom_target`; gli scaduti si segnalano
  (promesse non mantenute).
- **Debiti chiusi**: nessun debito resta aperto oltre la sua finestra senza ragione.
- **Soglie ben formate**: una crescita "scattata" (`threshold_crossed`) ha un episodio
  che la *guadagna* (non avviene dal nulla).
- **Quote di saga**: ripetizioni entro i budget (`saga_config.yaml`): creature
  ricorrenti, tipi-episodio, tetti lessicali (anti-ripetizione su scala lunga).

Output: un verdetto (PASS/FAIL + flag per episodio), come `critic_verdict.json` di
Scrivia ma a livello-saga.

## Perché i semi bastano per gran parte (e dove non bastano)

I **semi** coprono benissimo i *fili narrativi* (un oggetto, un gesto, una promessa che
ritorna): sono la fase ontologica ↻, "futuro già inscritto". Dove **non** bastano da
soli:
- **Lo stato cumulativo** (la crescita di un personaggio, un centro trasformato): non è
  un singolo filo, è una *somma* → serve il `fold` dei delta.
- **L'anti-contraddizione** (il mondo a N non deve smentire N-3): serve l'audit contro
  lo snapshot.
- **L'anti-ripetizione** (non rifare la stessa scena alla puntata 40): servono le quote.

Semi + delta/fold + recap + audit + quote = il pacchetto completo.

---

### In una riga

*Lo stato è il grafo, non la prosa; cambia solo per soglie; si accumula come delta che
si ripiegano in uno snapshot compatto; si compatta per arco in un recap canonico; e un
audit lo difende dalle contraddizioni e dalle ripetizioni. Per scrivere la puntata N
serve lo stato a N, non le N-1 puntate.*
