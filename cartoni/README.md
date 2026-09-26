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

Primo episodio: **ep01 — Due mondi** (`episodi/ep01/`), animatica pilota di ~3′50″
dalle 19 pagine della sua prosa (`saga/prosa/ep01.md`).

## Come si gira

```bash
npx tsx cartoni/render/suona.ts --episodio ep01                         # colonna sonora → cartoni/out/ep01.wav
node cartoni/render/gira.mjs --episodio ep01 --audio cartoni/out/ep01.wav   # video 1080p24 → cartoni/out/ep01.mp4
node cartoni/render/gira.mjs --episodio ep01 --da 90 --a 105 --larghezza 960  # un pezzo, in piccolo, per guardare

# con la voce narrante (le riprese in episodi/ep01/voce/): stessi comandi con --narratrice
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
```

## Le voci

- **I personaggi parlano in grammelot** (come Pingu): una lingua che non esiste, fatta
  del ritmo, delle vocali e della melodia della battuta vera. La didascalia dice le
  parole, la voce dice il tono. Le voci sono profili di numeri (`cast/voci.ts`: altezza,
  passo, grandezza del tratto vocale, aria, grana, l'alfabeto delle consonanti) suonati
  da un piccolo sintetizzatore a formanti (`audio/grammelot.ts`); le bocche dei pupazzi
  seguono le sillabe. Chi dice una battuta lo scrive il copione: `chi: "zara"`.
- **La narratrice** (facoltativa) legge la narrazione — tutto quello che nelle
  didascalie sta fuori dalle «». È **una sola per la saga** (`voce/voce.json`): Ray l'ha
  scelta dai provini — **Paola, da bambina** (più lenta, e più acuta di 4 semitoni:
  altezza e formanti salgono insieme, come in una voce più piccola) — e resta quella
  (un test lo controlla). Le sue riprese si fanno una volta (`render/narra.ts`, con
  Piper) e si tengono in `episodi/<id>/voce/` come una registrazione: una voce
  sintetica non ridice mai una frase identica.
- **I tempi seguono le voci.** Una didascalia dura almeno quanto la sua voce: la
  storia *aspetta* (pupazzi e camera rallentano dentro quella didascalia), il mondo no
  (vento, acqua, pioggia vanno al tempo vero). Suoni, musica e stacchi seguono.

## Com'è fatto

```
cartoni/
  motore/      il tempo (easing, tracce), il caso SEMINATO, la penna SVG, la luce,
               la camera a parallasse, il montaggio (stacchi, dissolvenze, nero),
               le didascalie (Fraunces, a capo bilanciato), la parola (chi parla,
               sillabe italiane), la voce (piano delle battute, bocche, tempi)
  scene/       il palco: il kit di pennelli (cielo, temporale, monti, terreno, erba,
               canneto, pioggia), gli oggetti (rocce, lastre, rami), il meteo, le luci,
               gli inserti in macro, la regia (sul palco, passi, scosse) e il
               palcoscenico (un luogo pronto per il copione)
  luoghi/      i luoghi del mondo: profilo, tavolozza, lontani, oggetti (soglia.ts:
               la Soglia di Spondalta)
  cast/        i pupazzi (Rocco, Zara, Cècca, fauna minore) e le loro voci
  audio/       strumenti di sintesi, effetti, il suonatore di partiture, il grammelot,
               la narratrice, il missaggio → WAV
  voce/        voce.json: la voce narrante della saga (una) e le candidate
  player/      il cartone per il browser (CARTONE.svg(t)), con le voci
  render/      gira.mjs (Chrome headless → ffmpeg), suona.ts (WAV), narra.ts (riprese
               della narratrice e provini), nuovo.ts (scheletro di un episodio)
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
   L'unica cosa non deterministica — la voce sintetica della narratrice — sta fuori,
   nelle riprese registrate.
5. **Anti-New-Age.** La pietra è *tiepida*, non magica: niente bagliori (test), al
   massimo un filo di vapore nell'aria fredda dell'alba. Niente suoni magici.
6. **Lessico.** Nessun nome reale né a schermo né nel codice (stessa mappa del linter).
7. **Grammatica visiva** (`saga/bible/STILE_VISIVO.md` §2-§3, vincolante): varietà
   focale drone↔macro, POV basso e veloce di Zara, contrasto di scala dal basso,
   lo scambio tra i due mostrato (chi guida, chi protegge).
8. **Una voce narrante.** Scelta una volta, per sempre (test su `voce/voce.json`).

## Il cancello

Questa corsia **non** sostituisce le illustrazioni del libro (quelle restano il
cancello immagini: Manus + scelta umana). È un terzo mezzo — l'animatica — e il suo
cancello è **Ray che guarda e ascolta**: il foglio-provini, il video, e la voce
narrante (i provini) prima di qualsiasi pubblicazione. Dettaglio: `docs/ANIMATORE.md`.
