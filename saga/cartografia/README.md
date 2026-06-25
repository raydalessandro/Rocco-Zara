# Cartografia — IL BRIEF (input della chat dedicata alla geografia)

> ✅ **ESEGUITO.** Questo brief è stato realizzato nella sessione cartografo. La
> geografia ora **fa fede** in **`CANONE_GEOGRAFICO.md`** (+ `regni/`, `ORIGINE.md`,
> `pipeline/`). Tienilo come **brief storico/metodologico**; non è lavoro pendente.

> Questa cartella è **pronta ma vuota di contenuto reale**: il geojson e i centri si
> scelgono in una **chat dedicata, a contesto fresco, senza codice**. Questo file è
> **l'input di quella chat**: cosa fare, con quali vincoli, verso quale schema.
>
> Modello di partenza: la `cartografia/` di isola (corpus *isolato* parallelo alla
> narrativa). **La differenza:** isola disegnava un'isola immaginaria a mano; noi
> partiamo da un **luogo reale** e lo *reskin*-iamo.

## 1. L'obiettivo

Costruire **il mondo di Rocco & Zara**: uno **stato/territorio immaginario** disegnato
**sopra la geografia di un luogo reale**, abbastanza grande e vario da reggere un
**viaggio di 50–100 puntate** in cui ogni episodio riprende dove il precedente si è
fermato. Sul territorio reale poseremo **centri gravitazionali** (vedi §5) attorno a
cui ruotano le avventure — così la trama "si scrive quasi da sé".

## 2. Perché un luogo reale

Per avere **riferimenti chiari e coerenti** (coste, fiumi, rilievi, boschi, radure,
distanze *vere*) invece di ricostruire un mondo a memoria e cadere in incoerenze.
Prendiamo la **verità fisica** dal reale; ci aggiungiamo sopra la **finzione**
(i nomi del nostro stato, i biomi reinterpretati, i centri gravitazionali).

## 3. Criteri per scegliere il luogo (checklist per la chat dedicata)

Il luogo deve essere:
- [ ] **Non urbanizzato** — gli animali vivono liberi; niente città, strade, edifici
      umani (o pochissimi, da ignorare/reskin). Cerchiamo natura.
- [ ] **Sufficientemente tracciato** — mappato bene (OSM/cartografia pubblica) così
      abbiamo geometrie reali da scaricare: coste, corsi d'acqua, boschi, sentieri,
      rilievi, radure.
- [ ] **Vario e bi/poli-biomico** — la storia origine ha **due mondi + una collina di
      confine** (savana ↔ foresta, Collina dei Baobab). Serve un territorio che
      offra **almeno due ambienti contrastanti + transizioni** (es. pianura aperta ↔
      foresta densa, con rilievi/valichi in mezzo). Anche più di due va bene: più
      biomi = più archi.
- [ ] **Grande abbastanza** — un'estensione che, percorsa a piedi da animali, dia
      decine di "tappe". Pensare a **un viaggio**, non a una mappa da tavolo.
- [ ] **Con un'identità geografica forte** — un delta, un altopiano, una grande valle,
      un arcipelago, un bacino fluviale: qualcosa con una **spina dorsale naturale**
      (un fiume, una catena, una costa) che diventi la **direttrice del viaggio**.

> NB: non serve che il luogo reale *somigli* a savana+foresta. Reinterpretiamo i biomi
> (una brughiera diventa "savana"; una pineta diventa "foresta"). Conta la **struttura**
> (contrasti + transizioni + spina dorsale), non l'etichetta reale.

## 4. La pipeline (cosa produrrà la chat dedicata)

1. **Scegliere il luogo** (con la checklist §3) e **delimitare il confine** del nostro
   stato (un poligono: è la "nazione" di Rocco & Zara).
2. **Scaricare il geojson reale** dentro quel confine. Fonti tipiche:
   - **OpenStreetMap** (Overpass API, estratti Geofabrik, o `osmnx`) per
     boschi (`landuse=forest`/`natural=wood`), acqua (`natural=water`, `waterway`),
     prati/aperto (`natural=scrub`/`grassland`/`heath`), rilievi (`natural=peak`,
     curve di livello), sentieri (`highway=path`/`track`), radure, rocce.
   - **Natural Earth** / **GADM** per profili a scala maggiore se serve un contesto.
   Si **clippa** tutto al confine, si **scartano** le feature urbane.
3. **Classificare** le feature nei **biomi/zone** del nostro mondo (la "savana", la
   "foresta", i "valichi", l'"acqua"…) — è il reskin: ogni feature reale prende un
   `bioma` e un `id` nostro (vedi `convenzioni/schema_luogo.md`).
4. **Tracciare la direttrice del viaggio** — una o più **rotte** lungo la spina dorsale
   naturale (il fiume, la costa, la valle): è l'ordine in cui gli episodi attraversano
   il territorio (`trama/archi_e_nodi.md` → "spina del viaggio").
5. **Posare i centri gravitazionali** (§5) lungo la direttrice: ognuno sarà la
   **stazione** di un arco.
6. **Trovare il CENTRO dell'origine** e **adattare il Capitolo 1**: dove, in *questo*
   luogo reale, si incontrano Rocco e Zara? Quale collina è la "Collina dei Baobab"?
   Si riscrive l'origine ancorata a coordinate vere (resta Ep01).
7. **Scrivere le schede-luogo** (`convenzioni/schema_luogo.md`) per ogni zona/centro e
   caricare il geojson in `geo/` (il **viewer Leaflet** in `geo/viewer/` lo ispeziona).

## 5. I centri gravitazionali (l'invenzione sopra il reale)

Gli animali vivono liberi: **niente strutture umane**. Ma vogliamo **punti di
aggregazione** che facciano da calamita alle avventure — antropomorfizzando *quel
tanto*. Tipi ammessi:
- **Strutture naturali divenute luoghi-di-ritrovo** (una radura, una grande quercia,
  una cascata, una grotta) — come l'**albero cavo** e la **radura** già nella storia.
- **Strutture costruite dagli animali stessi** (dighe, tane comuni, sentieri battuti,
  cataste, "mercati" di scambio) — antropomorfismo leggero.
- **Antiche strutture/rovine abbandonate** (templi, archi di pietra, muretti, pozzi):
  presenza umana **passata e perduta**, ora riusata dagli animali. Dà mistero e storia
  al mondo senza popolarlo di umani.

Ogni centro: un `id`, un **tipo** (naturale / animale / rovina), un **bioma**, una
posizione (coordinate reali), una **funzione narrativa** (che avventure attira), e
**quale arco** vi si svolge. Template: `centri_gravitazionali/_template_centro.md`.

## 6. Il contratto con il resto della saga

- La **cartografia è isolata** dalla narrativa (come in isola): è autoritativa sul
  **fisico** (coordinate, distanze, biomi, transizioni), **non** sul canone narrativo
  (personaggi, semi, archi → vivono in `bible/` e `trama/`). Dove si sovrappongono,
  vince il canone narrativo; la cartografia dettaglia senza contraddire.
- I **centri gravitazionali** ↔ le **stazioni degli archi** (`trama/archi_e_nodi.md`):
  un centro = una calamita di episodi.
- Le **rotte** ↔ la **spina del viaggio**: l'ordine fisico in cui gli episodi
  attraversano il mondo.
- Output consumati a valle: prompt-immagine arricchiti (coerenza visiva dei luoghi),
  audit di continuità geografica, e — un giorno — un mondo digitale esplorabile.

## 7. Cosa NON fare in questa chat

- Non scrivere codice del motore (è un lavoro di mondo, non di engine).
- Non toccare `lib/` di Scrivia.
- Non popolare il mondo di umani: presenza umana solo **passata** (rovine).
- Non scegliere il luogo "a sentimento": passare dalla checklist §3.

---

**Stato cartella:** scaffold pronto. `geo/` attende il geojson reale; `geo/viewer/` ha
il viewer Leaflet (ereditato da isola, da ripuntare sul nuovo geojson);
`convenzioni/` ha gli schemi target; `centri_gravitazionali/` ha il template.
