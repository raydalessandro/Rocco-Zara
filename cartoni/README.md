# cartoni/ — i cartoni animati delle saghe, in codice

> Un cartone è una **funzione pura del tempo**: `fotogramma = f(copione, t)`.
> Niente pennelli, niente timeline a mano: pupazzi vettoriali con lo scheletro,
> un palco a strati di parallasse, una camera, un montaggio, voci e colonna sonora
> sintetizzate. **Stesso copione → stesso cartone, byte per byte** (è il principio
> del seme — *stesso nonce, stessa storia* — portato ai fotogrammi).

Due cose separate, che viaggiano in due pacchetti:

- **il motore** — tutto quello che fa un cartone qualunque (motore, palco, luoghi,
  pupazzi, voci, audio, render). Migliorarlo migliora ogni episodio.
- **gli episodi** — `episodi/<id>/`: il copione animato, la partitura, e (se c'è)
  la narrazione registrata. Ognuno si aggiunge quando c'è, e i test lo trovano da soli.

Primo episodio fatto: **ep01 — Due mondi** (`episodi/ep01/`): 26 inquadrature dalle
19 pagine della sua prosa (`saga/prosa/ep01.md`), 4′10″ con le voci.

## La serie

Tutta la stagione a cartoni, da guardare di fila come un film lungo fatto di episodi:
**24 episodi di circa 5 minuti** (uno per episodio di prosa), montati a quattro a quattro
in **6 puntate di circa 20 minuti**, una per volume (i Laghi del Vespro, la Conca
Ruggente, il Gran Ducato, la Piana dei Savi, la Selva di Mezzo, le Terre del Leone di
Pietra). Le puntate si ricavano dal grafo della saga (`motore/serie.ts`). Si fa un
episodio alla volta, sempre con la stessa ricetta (`docs/ANIMATORE.md`, «La ricetta di un
episodio»), e intanto il catalogo cresce: ogni luogo, pupazzo e voce nuovi entrano nel
motore e servono agli episodi dopo.

```bash
npx tsx cartoni/render/monta.ts --elenco        # a che punto è la serie
npx tsx cartoni/render/monta.ts --puntata 1     # i 4 episodi girati del volume 1, in fila → cartoni/out/puntata1_narrato.mp4
npx tsx cartoni/render/monta.ts --stagione      # tutte le puntate di fila: il film lungo
```

## Come si gira

```bash
npx tsx cartoni/render/suona.ts --episodio ep01                         # colonna sonora (personaggi con le loro voci) → cartoni/out/ep01.wav
node cartoni/render/gira.mjs --episodio ep01 --audio cartoni/out/ep01.wav   # video 1080p24 → cartoni/out/ep01.mp4
node cartoni/render/gira.mjs --episodio ep01 --da 90 --a 105 --larghezza 960  # un pezzo, in piccolo, per guardare

# con la voce narrante (le riprese in episodi/ep01/voce/): stessi comandi con --narratrice;
# con --grammelot i personaggi tornano a parlare in grammelot anche se sono registrati
npx tsx cartoni/render/suona.ts --episodio ep01 --narratrice
node cartoni/render/gira.mjs --episodio ep01 --narratrice --audio cartoni/out/ep01_narrato.wav
```

Servono **Playwright + un Chromium** (fuori dal `package.json`: la CI non gira video)
e **ffmpeg**. Se Playwright non è nei posti soliti: `PLAYWRIGHT_MODULE=/percorso/playwright`,
`CHROME_PATH=/percorso/chrome`. Un fotogramma 1080p costa ~150 ms; con due lavoratori
l'episodio intero gira in 8-10 minuti.

**Un episodio nuovo** parte dalla sua prosa approvata:

```bash
npx tsx cartoni/render/nuovo.ts --episodio ep02     # scheletro: un'inquadratura per pagina, le frasi pronte da citare
npx tsx cartoni/render/narra.ts --episodio ep02      # registra le voci (narratrice e personaggi)
python3 cartoni/render/ascolta.py --episodio ep02    # si capisce? un riconoscitore vocale ascolta le riprese
```

## Le voci

- **Ogni personaggio ha la sua voce**, e poi la tiene: Rocco una voce d'uomo, Zara di
  ragazza, Cècca piccola e svelta, il fratello di Zara lontana, da ricordo. Dicono le
  battute vere (le «» della prosa, `chi: "zara"` nel copione), registrate una volta
  (`render/narra.ts`) in `episodi/<id>/voce/battute.json`; la bocca del pupazzo segue
  il volume della ripresa. Le voci sono sintetiche (Kokoro, Piper) e trasformate:
  più acute e piccole o più gravi e grandi (`tono`), più lente o svelte (`lentezza`).
  Il cast è in `voce/voce.json`: ogni ruolo è *da scegliere* (con una voce provvisoria
  e i suoi provini) o *scelto* da Ray — e da lì non si cambia (un test lo controlla).
- **Il grammelot resta** (come Pingu: il ritmo, le vocali e la melodia della battuta
  vera, parole inventate, sintetizzato in codice da `audio/grammelot.ts`): è il ripiego
  per le battute non ancora registrate, e il modo di provare un episodio nuovo prima di
  registrarlo.
- **La narratrice** legge la narrazione — tutto quello che nelle didascalie sta fuori
  dalle «». È **una sola per la saga**: Ray l'ha scelta dai provini — **Paola, da
  bambina** (più lenta, e più acuta di 4 semitoni: altezza e formanti salgono insieme,
  come in una voce più piccola). Anche le sue riprese si tengono in `episodi/<id>/voce/`.
- **Le stesse in tutti gli episodi.** Ogni registrazione porta l'impronta delle
  impostazioni della sua voce: se in `voce.json` una voce cambia, il test dice quali
  episodi riregistrare. Il missaggio è uno per tutti.
- **La ninna-nanna** della Prima Tigre è un brano vero (`brani/`, fatto da Ray con
  Suno): quando la si canta i versi compaiono a tempo col canto; la parte canticchiata
  può tornare negli altri episodi.
- **Le voci si capiscono.** Più una voce è spinta verso l'acuto, meno si capisce: il
  cast è stato scelto controllando ogni battuta con un riconoscitore vocale; le parole
  che una voce sintetica sbaglia si correggono nel dizionario `pronuncia` di `voce.json`
  (solo per le voci: le didascalie restano quelle della prosa).
- **I tempi seguono le voci.** Una didascalia dura almeno quanto la sua voce: la
  storia *aspetta* (pupazzi e camera rallentano dentro quella didascalia), il mondo no
  (vento, acqua, pioggia vanno al tempo vero). Suoni, musica e stacchi seguono.

## Com'è fatto

```
cartoni/
  motore/      il tempo (easing, tracce), il caso SEMINATO, la penna SVG, la luce,
               la camera a parallasse, il montaggio (stacchi, dissolvenze, nero),
               le didascalie (Fraunces, a capo bilanciato), la parola (chi parla,
               sillabe italiane), la voce (piano delle battute, bocche, tempi),
               la serie (le puntate, dal grafo della saga)
  scene/       il palco: il kit di pennelli (cielo, temporale, monti, terreno, erba,
               canneto, pioggia), gli oggetti (rocce, lastre, rami), il meteo, le luci,
               gli inserti in macro, la regia (sul palco, passi, scosse) e il
               palcoscenico (un luogo pronto per il copione)
  luoghi/      i luoghi del mondo: profilo, tavolozza, lontani, oggetti (soglia.ts:
               la Soglia di Spondalta)
  cast/        i pupazzi (Rocco, Zara, Cècca, fauna minore) e le loro voci
  audio/       strumenti di sintesi, effetti, il suonatore di partiture, il grammelot,
               la narratrice, il missaggio → WAV
  voce/        voce.json: il cast delle voci (la narratrice e una voce per personaggio),
               le candidate, la pronuncia
  brani/       le canzoni registrate (la ninna-nanna) e il loro registro brani.json
  player/      il cartone per il browser (CARTONE.svg(t)), con le voci
  render/      gira.mjs (Chrome headless → ffmpeg), suona.ts (WAV), narra.ts (registra
               le voci e fa i provini) con leggi_voce.py, ascolta.py (si capisce?),
               nuovo.ts (scheletro di un episodio), monta.ts (le puntate, la stagione)
  episodi/     <id>/copione.ts · partitura.ts · voce/ (riprese) — il pacchetto a parte
```

## Le regole (blindate da `test/cartoni.motore.test.ts` e `test/cartoni.episodi.test.ts`)

1. **Le didascalie sono citazioni.** Ogni parola a schermo viene *alla lettera* dalla
   pagina di prosa dichiarata. Il cartone mette in scena la prosa, non la riscrive
   (la prosa è cancello umano). Nessuna battuta nuova, nemmeno in grammelot: il
   grammelot *suona* una battuta che la prosa ha già.
2. **I colori vengono dalle schede.** Le «ancore colore» di `saga/bible/*.md` sono la
   fonte; i pupazzi le leggono (test: se la scheda cambia, il test lo dice).
3. **Morfologia di reference = vincolo.** Il corno storto di Rocco (virgola, mai uncino),
   le zampe «un numero in più», le ciglia; la forcella a Y di Zara, le strisce
   asimmetriche con un seme diverso per fianco, gli occhi verdi che *brillano*; le tre
   timoniere spezzate di Cècca e il luccichio tra le penne. Niente vestiti, mai.
4. **Il caso è seminato.** `Math.random` e gli orologi sono banditi (test). Nei cicli
   che scartano ciò che è fuori campo, ogni elemento ha il **suo** generatore
   (`elemento(seme, i)`): altrimenti le cose saltano quando la camera si muove.
   L'unica cosa non deterministica — le voci sintetiche (Piper non ridice mai una
   frase identica) — sta fuori, nelle riprese registrate, che si tengono.
5. **Anti-New-Age.** La pietra è *tiepida*, non magica: niente bagliori (test), al
   massimo un filo di vapore nell'aria fredda dell'alba. Niente suoni magici.
6. **Lessico.** Nessun nome reale né a schermo né nel codice (stessa mappa del linter).
7. **Grammatica visiva** (`saga/bible/STILE_VISIVO.md` §2-§3, vincolante): varietà
   focale drone↔macro, POV basso e veloce di Zara, contrasto di scala dal basso,
   lo scambio tra i due mostrato (chi guida, chi protegge).
8. **Una voce per ruolo.** La narratrice e ogni personaggio: scelti da Ray una volta,
   per sempre; mai due ruoli con la stessa voce (test su `voce/voce.json`).
9. **La serie.** Ogni episodio sta in una puntata (dal grafo), col titolo della sua
   prosa, e con le voci dura tra 3′ e 7′ (si mira a 5′).

## Il cancello

Questa corsia **non** sostituisce le illustrazioni del libro (quelle restano il
cancello immagini: Manus + scelta umana). È un terzo mezzo — l'animatica — e il suo
cancello è **Ray che guarda e ascolta**: il foglio-provini, il video, e le voci (i
provini) prima di qualsiasi pubblicazione. Dettaglio: `docs/ANIMATORE.md`.
