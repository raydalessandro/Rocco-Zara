# ANIMATORE — il dettaglio normativo

> Compagno di `.claude/agents/animatore.md`. Qui: la serie, la ricetta di un episodio,
> come si scrive un copione animato, come si aggiunge un pupazzo, un luogo o una voce,
> come si gira, si consegna e si monta. Il panorama della corsia è in `cartoni/README.md`.

## La serie (la visione)

> Ray, 26/9/2026: tutta la stagione a cartoni, per farla vedere ai bambini — di fila,
> come un film lungo fatto di episodi. Si affina con calma, ma intanto si va avanti.

- **Un episodio animato per ogni episodio di prosa: 24, di circa 5 minuti** (come ep01).
  La prosa c'è tutta (`saga/prosa/ep01…ep24.md`, 14-20 pagine l'uno).
- **Sei puntate di circa 20 minuti**, una per volume — una macrostoria, un regno — coi
  suoi quattro episodi. Il raggruppamento non si scrive a mano: si ricava dal grafo
  (`cartoni/motore/serie.ts`: episodio → arco → volume; i titoli dall'indice
  `saga/trama/volumi/README.md`). Oggi:

  | Puntata | Volume | Episodi |
  |---|---|---|
  | 1 | i Laghi del Vespro | ep01–ep04 |
  | 2 | la Conca Ruggente | ep05–ep08 |
  | 3 | il Gran Ducato | ep09–ep12 |
  | 4 | la Piana dei Savi | ep13–ep16 |
  | 5 | la Selva di Mezzo | ep17–ep20 |
  | 6 | le Terre del Leone di Pietra | ep21–ep24 |

- **Un episodio alla volta, sempre con la stessa ricetta** (qui sotto). E il **catalogo
  cresce** con gli episodi: ogni luogo, pupazzo e voce nuovi entrano nel motore e
  servono a tutti gli episodi dopo — non si rifanno, non si copiano.
- **Il montaggio** (`render/monta.ts`): `--elenco` dice a che punto è la serie;
  `--puntata N` mette in fila i quattro episodi girati del volume N, così come sono
  (ognuno apre e chiude sul nero, il volume è lo stesso per tutti), un capitolo per
  episodio; `--stagione` tutte le puntate di fila, il film lungo.
- **La durata** è un cancello leggero: con le voci un episodio sta tra 3′ e 7′ (test),
  mirando a 5′ (`DURATA_EPISODIO` in `motore/serie.ts`). Fatti: ep01 4′10″, ep02 6′48″
  (c'è la ninna-nanna intera, un minuto), ep03 6′35″ (la prosa è quasi tutta dialogo:
  le didascalie sono scelte, e il resto lo dicono le immagini).

## La ricetta di un episodio (sempre la stessa)

1. **Leggere.** La prosa (`saga/prosa/epNN.md`); il suo nodo nel grafo
   (`saga/trama/saga_graph.json` → `episodes.epNN`: cast, centro, premessa, problema,
   soglia, risoluzione); il capitolo del volume (`saga/trama/volumi/VOLUME_N.md`); le
   schede dei personaggi (`saga/bible/`) e dei luoghi (`saga/cartografia/`).
2. **Il catalogo: cosa c'è e cosa manca.** Luoghi (`cartoni/luoghi/`), pupazzi
   (`cartoni/cast/`), voci (`cartoni/voce/voce.json` + `cartoni/cast/voci.ts`). Quello
   che manca si aggiunge **al motore**, riusabile, mai dentro l'episodio: un luogo = un
   file in `luoghi/` (§3); un pupazzo = dalla «Morfologia di reference» della sua
   scheda (§2; se la scheda non c'è, si chiede al ritrattista); un personaggio che
   parla = un profilo in `cast/voci.ts` e un ruolo in `voce.json`, con una voce
   provvisoria e i provini (§5). La voce la sceglie Ray.
3. **Lo scheletro.** `npx tsx cartoni/render/nuovo.ts --episodio epNN`.
4. **La regia.** Il copione (§1: inquadrature, didascalie citate alla lettera, `chi` su
   ogni «», camera, luce, meteo, suoni) e la partitura (§6), con la grammatica visiva.
   Si mira a ~5′.
5. **Le prove, prima di registrare.** `suona.ts` + `gira.mjs --da … --a … --larghezza
   960` a pezzi (le battute non registrate si sentono in grammelot), e il foglio-provini.
6. **Le voci.** Se ci sono voci nuove: `narra.ts --provini personaggi` (Ray sceglie, o
   si parte con la provvisoria). Poi `narra.ts --episodio epNN` registra la narratrice
   e i personaggi, e `python3 cartoni/render/ascolta.py --episodio epNN` controlla che
   si capisca (§5).
7. **Girare.** `suona.ts --episodio epNN --narratrice`, poi `gira.mjs --episodio epNN
   --narratrice --audio cartoni/out/epNN_narrato.wav`.
8. **Controllare e consegnare** (§7): test verdi, foglio-provini, il video, il
   consuntivo. Se il motore è cresciuto, due PR (prima il motore, poi l'episodio con
   le sue riprese); se no, una. Ray guarda e ascolta; il merge è suo, o su sua
   autorizzazione.
9. **Quando i quattro episodi di un volume ci sono**: `monta.ts --puntata N`.

## 0. Motore ed episodi: due pacchetti

- **Motore** = tutto `cartoni/` tranne `cartoni/episodi/`, più `test/cartoni.motore.test.ts`.
  Non importa nessun episodio: i suoi test girano con un episodio di prova scritto
  nel test. Si consegna (e si migliora) da solo.
- **Episodio** = `cartoni/episodi/<id>/`: `copione.ts` (`export default` l'Episodio),
  `partitura.ts` (`export default` la musica: `suona(SEZIONI)`), e — se c'è la
  narratrice — `voce/narrazione.json` + le riprese. `test/cartoni.episodi.test.ts`
  scopre da solo gli episodi presenti.

Un episodio nuovo nasce dalla sua prosa approvata con
`npx tsx cartoni/render/nuovo.ts --episodio epNN` (un'inquadratura per pagina, le
frasi della pagina pronte da citare, due pupazzi fermi sul palco): da lì si fa regia.

## 1. Il copione (`cartoni/episodi/<id>/copione.ts`)

Un episodio è una lista di **inquadrature**. Ognuna dichiara:

| campo | cosa | vincolo |
|---|---|---|
| `id`, `titolo` | `s01`…, titolo breve per il foglio-provini | id unici |
| `pagina` | la pagina della prosa dell'episodio da cui viene | deve esistere |
| `durata` | secondi (tempo della storia) | > 0 |
| `entrata` | `stacco` · `dissolvenza` (durata) · `nero` (durata: il tempo che passa) | dissolvenza < durata della precedente |
| `didascalie` | `{da, a, testo, pagina, pensiero?, chi?}` | **citazione alla lettera** della pagina; ≤ 22 caratteri/s; niente accavallamenti; chi dice le «» |
| `titoli` | testa e coda (non citazioni) | niente nomi reali |
| `suoni` | effetti a tempo locale (`nome`, `vol`, `durata`, `ritmo`) | il `ritmo` dei passi viene dall'andatura in scena |
| `ambiente` | `vento`, `pioggia`, `lago` per la colonna d'ambiente | — |
| `disegna(t, defs, v)` | restituisce `{ cam, livelli, velo? }` | funzione **pura** di `t` |

Il terzo argomento `v` (InScena) porta la scena viva: `v.bocca("zara")` è la bocca di
chi sta parlando adesso (0..1, dalle sillabe della sua battuta), `v.t` il **tempo vero**
dell'inquadratura. Si usa così:

```ts
const { scena, R, Z, quota } = palcoscenico(SOGLIA);   // il luogo, una volta
// …
disegna(t, defs, v) {
  const zp: PosaZara = { t, andatura: "fermo", bocca: v.bocca("zara") };
  return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce, attori: Z(-310, zp, 1, luce, defs) }) };
}
```

`mondo: v.t` fa andare vento, acqua e pioggia al tempo vero anche quando la storia
rallenta per aspettare una voce (§4).

Regia, non riscrittura: quello che la prosa non dice (dove sta la camera, quanto
dura un passo, da che parte soffia il vento) è regia e sta nel copione, leggibile.
Quello che la prosa **dice** non si contraddice: se la regia ha bisogno di uno scarto
(es. il canneto «verso sud», che ha costretto ad allungare il canneto fino al piede
della collina), lo si **segnala** nel consuntivo.

### Ingombri (per non far pestare i pupazzi)

A scala 1: Rocco va da −178 (coda) a +313 (muso) attorno al centro; Zara da −160
a +163 (col muso grande: da vicino il naso sta a ~+165). Cervara (a scala 0,95, la
sua) da −110 a +130. Per guardarsi in faccia servono ~550 unità tra i centri di Rocco e
Zara (`CIMA`, `RIPARO` nel copione di ep01), ~300 tra Zara e Cervara (ep03: sotto, i
nasi si toccano). Quando camminano insieme: separati, oppure chi è più vicino alla
camera disegnato **dopo**. In fila sulla stessa passerella: ~330 tra Cervara davanti e
Zara dietro, ~320 tra Zara e Rocco. Una barca ormeggiata *davanti* al molo (ep03) copre
le zampe di chi ci cammina: si capisce che passa dietro, non dentro.

### Andature senza scivolare

La fase del passo si ricava dalla **strada fatta** (`fase(strada, CICLO.x, scala)`):
così i piedi in appoggio restano fermi nel mondo. `CICLO` è misurato sui pupazzi
(Rocco al passo 100, Zara al passo 93,75, Zara al galoppo 306 × ampiezza, Cervara al
passo 84,4). **Di sasso in sasso** (ep03, i Massi): la traversata si scrive come
appoggi (punti), un tempo in aria e uno di sosta per salto (`diSassoInSasso` nel
copione di ep03); il galoppo di Zara mette il volo tra 0,78 e 1,18 del ciclo e
l'appoggio tra 0,18 e 0,78, così a ogni sasso le zampe toccano davvero — e il suono
(`sasso`) cade sugli istanti degli appoggi (`tocchi`).

## 2. I pupazzi (`cartoni/cast/`)

- **Fonte:** la «Morfologia di reference» della scheda (`saga/bible/…`). Le ancore
  colore si esportano come costante (`ROCCO_ANCORE`, …) e un test le confronta con la
  scheda.
- **Struttura:** scheletro (spina + corpo tirato attorno) → zampe con IK a due ossa
  (`anatomia.ts`) → testa con le sue pose (bocca, occhi, orecchie, giro).
- **Luce:** un pupazzo non ha colori "suoi" a schermo: li ha sotto una `Luce`
  (`inLuce`/`inOmbra`), la stessa del palco. Eccezione voluta: gli occhi di Zara
  *brillano* (tengono metà del loro verde anche al buio).
- **Id dei gradienti:** usa SEMPRE il valore restituito da `defs.lineare/radiale/clip`
  (le inquadrature in dissolvenza hanno prefissi diversi).
- **Il catalogo** (cresce con gli episodi): `rocco.ts`, `zara.ts`, `cecca.ts`;
  `fauna.ts` (la gazza, la marmotta, lo stormo, il martin pescatore — in volo, in
  picchiata, e `posato`, con l'aria `offeso` e `bagnato`); `laghi.ts`, la gente del Lago
  del Vespro (ep02): **Brénta** la lontra (`lontra`: in piedi, le zampe al remo, al nodo,
  al bordo; `BRENTA_ANCORE` dalla sua scheda, test), le **linci** (`lince`: seduta o in
  piedi, ognuna col suo manto dal suo `seme`, e il cenno), il **Custode** (`testuggine`:
  il collo che esce piano), la folaga. Da ep03: **Cervara** (`cervara.ts`, lo specchio
  di Zara: in piedi, al passo, seduta — dritta, o `male` —; i ciuffi neri che si piegano
  (`ciuffi`) e il colpetto di zampa che li rimette a posto (`zampaAlCiuffo`: la zampa
  sale all'orecchio e la testa le scende incontro, come fanno i gatti); `verso` per
  passare da una posa all'altra, «alzandosi»; `CERVARA_ANCORE` dalla scheda, test), il
  **camoscio** dell'Altura (`fauna.ts → camoscio`: `raccolto` 1 = zampe sotto, 0 = in
  volo). E crescono i due di sempre: Rocco si mette **a terra** (`aTerra` 0..1: la
  pancia giù, le zampe davanti distese, quelle dietro raccolte — ep03 p.8, «venne a
  sedersi vicino»), Zara si siede **male** (`male`, per compagnia). Le pose nuove non
  cambiano un fotogramma degli episodi girati (le impronte di ep01/ep02 si confrontano
  con `main`). Un comprimario senza scheda disegnata si fa dalla sua scheda di
  `saga/bible/comprimari/` e si segnala.

## 3. Il palco (`cartoni/scene/`) e i luoghi (`cartoni/luoghi/`)

- Un **luogo** (`luoghi/<nome>.ts`, con `creaLuogo`) è solo quello che è suo: il
  profilo del suolo, l'acqua al piede, la tavolozza, i parametri dell'erba e dei
  cespugli, i **lontani** (monti, pianure, boschi: composti coi pennelli del kit) e gli
  **oggetti** messi dove la prosa li vuole. Cielo, temporale, terreno, erba, canneto,
  pioggia li dipinge il kit (`scene/pittura.ts`), uguale per ogni luogo; `palco.ts`
  mette i livelli sempre nello stesso ordine. Un regno nuovo = un file in `luoghi/`.
- Livelli con **parallasse** `p` (1 = piano dei personaggi; <1 lontano; >1 primo
  piano); la camera li sposta di `cam·p` e li ingrandisce di `zoom^p` (dolly).
- Tutto ciò che è fuori campo si scarta, ma **dopo** aver pescato i numeri
  dell'elemento (`elemento(seme, i)`), e i campionamenti di profili/erba sono
  **allineati al mondo** (passi fissi o a potenze di due): niente sfarfallii.
- Meteo e luce sono parametri (`Meteo`, `LUCI`), interpolabili nel tempo
  (`mescolaLuce`): il vento che gira a ep01 p.13 è `versoVento` da +1 a −1.
- **I luoghi fatti**: `soglia.ts` (ep01: la Soglia di Spondalta) e `rivalba.ts`, il
  Lago del Vespro: `ORLO` (ep02: l'orlo di Rivalba, la riva dei villaggi — il molo basso,
  le barche a secco, le reti stese, il masso del Custode, la tana di canne, il ciglio col
  bosco d'autunno), `APPRODO` (ep02: la lingua di sassi), `RIVALBA` (ep03: il cuore del
  regno sull'acqua — le passerelle su pali, i sette **Massi del Consiglio** col più alto
  in mezzo, il molo basso con la barca di Brénta sotto il telo, il lavatoio delle reti,
  l'orlo dove il lago gira, la tana degli Ospiti, il sentiero che sale dietro; la città
  sull'acqua e il colle delle Coppelle nei lontani) e `COPPELLE` (ep03: il colle, le
  pietre larghe coi cerchi di conche, il lago di notte laggiù coi lumi di Rivalba). Dove
  stanno le cose che la prosa nomina è una costante esportata (`RIVA`, `CUORE`,
  `PIETRE_COPPELLE`) e ci sono le funzioni per starci sopra (`sulMassoDelConsiglio`,
  `sullaPasserella`), non numeri nel copione.
- **Davanti a chi è in scena**: un luogo può avere delle cose `davanti` (`creaLuogo`:
  disegnate dopo gli attori). Rivalba ci mette la barca ormeggiata contro il molo: chi
  cammina sul molo le passa dietro. Col `telo` dell'inquadratura (`colpo`, `respiro`) il
  carico sotto la tela si muove: un bozzo che spunta (il «tec», p.4), il mucchio che sale
  e scende (qualcuno che russa, p.12) — senza mostrare chi c'è sotto.
- **La luna** (`luna` dell'inquadratura: dove sta a schermo e quanto è grande): il disco
  e il suo alone (più bassa, più calda), e sull'acqua la scia; con `riflesso` (l'altezza a
  schermo del disco rimandato) anche la luna specchiata, sull'acqua lontana o su quella
  vicina, spezzata dalle onde — «vera due volte» (ep03 p.11). Si mette dove l'acqua è
  aperta: dietro le case e i colli non si vede.
- **Il lago** (`scene/lago.ts`): `galleggia` (il dondolio, seminato), `barca` (la
  fiancata, le reti a poppa, gli scalmi; `aBordo` taglia chi è dentro sotto l'orlo),
  `remo` (vogato in piedi guardando avanti, `spinge`), `cerchiAcqua`, `molo`, `palo`,
  `palafitta`, `retiStese`, `barcaASecco`, `tanaDiCanne` (fondo e fronte: chi dorme
  sta in mezzo), `massoDelConsiglio` (levigato in cima, bagnato al piede), `gorgo`
  (l'acqua che gira) e **`riflesso`**: il disegno specchiato sotto la linea dell'acqua,
  mosso dalle onde, e se serve **sfumato ai bordi** (ep02 p.7: «come una cosa che
  l'acqua non ha ancora deciso»).
- **Gli inserti** (`scene/inserti.ts`): la pietra coi segni; la corda di Toraki con la
  zampa di Zara che legge i nodi, su un `fondo` (`pietra` di ep01, con le due conche;
  `legno` della barca; `foglie` dell'involto), coi nodi `nuovi` che le si aggiungono (il
  nodo da pescatori di Brénta, ep02 p.13) e le zampe palmate di Brénta (`zampeLontra`).
  La pietra ha anche le conche `a cerchi` (le Coppelle, ep03) e di notte, piene, la
  `luna` in ognuna («piene di luna», p.13): con la zampa di Zara che si posa senza un
  suono (p.15). Negli oggetti (`scene/oggetti.ts`) la pietra coppellata vista di lato
  (`pietraCoppellata`) e gli alberi d'autunno (`alberoDAutunno`).

## 4. Le voci (`motore/parola.ts`, `motore/voce.ts`, `cast/voci.ts`, `audio/`)

- **Chi parla.** Una didascalia si spezza in *narrazione* (fuori dalle «») e *battute*
  (dentro). `chi` dice di chi sono le battute (`"zara"`, o una lista in ordine). Senza
  `chi` una battuta resta alla narratrice (una frase *ricordata*); ma ogni didascalia
  con le «» deve dichiarare `chi` (test), anche solo `"narratrice"`.
- **Le battute registrate.** Ogni personaggio con un ruolo in `voce.json` dice le sue
  battute con la sua voce: riprese in `episodi/<id>/voce/battute.json` (testo, durata,
  file, voce, e la **bocca**: una cifra 0-9 ogni 40 ms dal volume della ripresa, che il
  pupazzo mima). Una ripresa vale solo se il suo testo è quello della didascalia.
- **Il grammelot** è il ripiego per le battute senza ripresa (e `--grammelot` lo forza
  su tutto l'episodio): la battuta vera diventa sillabe (accenti, punteggiatura); il
  profilo di `cast/voci.ts` ne fa un piano — tempi, melodia, consonanti del *suo*
  alfabeto (Rocco: labbra e nasi; Zara: denti e scatti; Cècca: becco), bocca aperta
  sulle vocali e chiusa su m/b/p — che il sintetizzatore a formanti suona e il pupazzo
  mima. I profili danno anche volume, posto nello stereo ed eco (il ricordo) alle
  battute registrate.
- **I tempi.** `conVoce` (via `player/cartone.ts → conLeVoci`, lo stesso per video e
  audio) rifà i tempi: ogni didascalia dura almeno respiro (0,3 s) + voce + margine
  (0,6 s); si prende fino al 60% della pausa che la segue, poi la **storia rallenta**
  dentro la didascalia (il consuntivo riporta di quanto). La narrazione muta (senza
  narratrice) conta come tempo di lettura solo se viene *prima* di una battuta.
- **Niente battute nuove.** Né le voci né il grammelot sono un permesso di far parlare
  chi la prosa fa tacere: si dicono solo le «» della prosa.

## 5. Il cast delle voci (`cartoni/voce/voce.json`, `render/narra.ts`, `render/leggi_voce.py`)

- **Una voce per ruolo, per sempre.** `voce.json` ha la `narratrice` e i `personaggi`;
  ogni ruolo è `da-scegliere` (con una `provvisoria` e i suoi `provini`) o `scelta` (con
  la `voce`, e chi e quando). Due ruoli non hanno mai la stessa voce. Il test vieta le
  riprese con una voce diversa da quella del ruolo, e marca `provino` tutto quello che è
  registrato prima della scelta. Scelta del 26/9/2026: la narratrice è **Paola, da
  bambina** (`paola-bambina`); i personaggi sono ancora provvisori: Rocco `nicola-grande`,
  Zara `sara-ragazza`, Cècca `sara-gazza`, il fratello `riccardo-ricordo`, da ep02
  Brénta `dora-barcaiola` e il Custode `george-custode`, da ep03 Cervara
  `siwis-cervara` (Sara e Siwis; in prova anche `emma-cervara`, più bassa e composta).
- **Scegliere** (cancello di Ray): `npx tsx cartoni/render/narra.ts --provini narratrice`
  fa leggere la stessa pagina a tutte le candidate; `--provini personaggi` fa dire a
  ogni personaggio le sue battute con ognuna delle sue voci in prova. Scelta fatta:
  `stato: "scelta"`, `voce: "<id>"`, e si rifanno le riprese.
- **Una candidata** è un modello con pochi numeri: `motore` (`piper` o `kokoro`),
  `modello` (il modello Piper, o la voce Kokoro), `lentezza` (1 = il suo passo; di più =
  più lenta), per Piper `variazione` e `cadenza` (quanto variano suono e ritmo), e
  `tono` (semitoni). Il `tono` fa la voce più acuta *e più piccola* (o più grave e più
  grande, se negativo): si fa leggere più lenta di 2^(tono/12) e si riascolta più
  veloce dello stesso fattore, così altezza e formanti si muovono insieme e il passo
  resta quello di `lentezza`, senza stirare il suono. Con Piper la `lentezza` col tono
  rende un po' meno: si regola a orecchio (`paola-bambina` a 1.38 è circa il 10% più
  lenta di `paola` a 1.12).
- **Il cast cresce mescolando.** Kokoro ha poche voci italiane (Sara, Nicola), ma una
  candidata Kokoro può essere un **miscuglio** di voci del modello, anche di altre
  lingue: `modello: "if_sara*0.4+pf_dora*0.6"` (Brénta), `"im_nicola*0.4+bm_george*0.6"`
  (il Custode). L'italiano lo legge comunque (la pronuncia è della lingua, non della
  voce), il timbro cambia: così due ruoli non si somigliano. Più la voce straniera
  pesa, meno si capisce: si controlla con `ascolta.py` (o sulle battute di prova) prima
  di proporla.
- **Che si capisca.** Più una voce sale di tono, meno si capisce: prima di proporre una
  voce si fa trascrivere ogni battuta a un riconoscitore vocale e si tengono le
  impostazioni che la fanno capire tutta:
  `python3 cartoni/render/ascolta.py --episodio epNN [--chi rocco,narratrice]` (Whisper,
  via faster-whisper) confronta parola per parola quello che sente con quello che la
  voce doveva dire, e dà le riprese peggiori e le parole capite per voce. Il
  riconoscitore sbaglia anche lui (le riprese cortissime, le parole che si fondono:
  «tocca a te» → «toccatti»): dice dove ascoltare, il verdetto è di chi ascolta. Le
  parole che una voce sbaglia vanno nel dizionario `pronuncia` di `voce.json` (es.
  `giovane` → `giòvane`; ep03: `tec` → `tecc`, e `ancora pioggia` → `ancora, pióggia`,
  perché «pioggia» detta da Rocco si sentiva «più oggi»): vale solo per le voci, le
  didascalie restano quelle della prosa. Una chiave può essere più di una parola (un
  respiro prima di una parola aiuta più di un accento).
  Ep01 (26/9/2026): Rocco 100% delle parole, Zara 94%, la narratrice 73% — e Paola
  adulta, senza tono, fa lo stesso (75%): è il modello, non il tono; il riconoscitore
  ne perde soprattutto le R («pietra» → «pietta»). Con meno `variazione` (0,3) sale
  intorno all'80%. Ep02: la narratrice 75%; ep03: 76%, Cervara 94%, Zara 100%, Rocco 90%
  (il riconoscitore non capisce un «Ecco» da solo, lo scrive «Rexon»: si ascolta).
- **Registrare**: `npx tsx cartoni/render/narra.ts --episodio epNN` registra la
  narratrice (`narrazione.json`) e le battute di ogni personaggio (`battute.json`) in
  `episodi/epNN/voce/`; `--chi zara,rocco` solo alcune voci, `--solo s05,s06` solo
  alcune inquadrature. Serve python3 con `piper-tts` e `kokoro-onnx`, e ffmpeg; i modelli
  stanno fuori dal repo (`--modelli` o `PIPER_VOCI`, li scarica la prima volta). Le
  riprese (Opus, una per pezzo) **si tengono**: i tempi del cartone dipendono dalla loro
  durata (e Piper non ridice mai una frase identica; Kokoro sì, sulla stessa macchina).
  Se una voce cambia, si riregistrano le sue riprese in tutti gli episodi che ci sono
  (`--chi <ruolo>`) e si rigirano: è per questo che conviene sceglierle presto.
- **Uguali in tutti gli episodi.** Ogni registro di riprese (`narrazione.json`,
  `battute.json`) porta l'`impronta` delle impostazioni con cui la voce l'ha letto
  (motore, modello, lentezza, variazione, cadenza, tono). Il test la confronta con
  `voce.json`: se una voce cambia, dice quali episodi riregistrare
  (`narra.ts --episodio epNN --chi <ruolo>`), e `--solo` non mescola riprese fatte con
  impostazioni diverse. Il missaggio (`calore`, volume, stereo, eco) è lo stesso per
  tutti gli episodi. La voce della narratrice resta quella di ep01 (Ray, 26/9/2026:
  le prove rifatte, anche con le stesse impostazioni ma fuori dal cartone, gli sono
  suonate più metalliche).
- **Licenze.** Ogni candidata dichiara la sua in `voce.json` e va rispettata prima di
  pubblicare. Kokoro: Apache 2.0. Riccardo (Piper): BSD del dataset M-AILABS. Paola
  (Piper): dataset CC0 ma modello derivato da una voce inglese addestrata su dati *solo
  per ricerca*: per uso commerciale **non è pulita**.

## 6. Audio (`cartoni/audio/`)

- **Partitura come dati** (`episodi/<id>/partitura.ts` → `suona(SEZIONI)` di
  `audio/partitura.ts`): sezioni agganciate alle inquadrature (se il montaggio o le voci
  cambiano i tempi, la musica li segue), progressioni, temi, ostinati nel basso.
- **I temi della serie** (`audio/temi.ts`): come le voci, anche i temi sono di tutta
  la serie. Chi c'è in più episodi ha il suo tema e lo tiene — Zara, i passi di Rocco,
  l'amicizia (chiude gli episodi), il mondo che si apre (da ep01); il Lago del Vespro,
  il riflesso (il tema del lago capovolto), Brénta, la corda di Toraki (da ep02);
  Cervara (da ep03): il tema di Zara capovolto (specchio diatonico attorno al Re) e lento
  il doppio — le stesse note rovesciate e calme (un test lo tiene così). La partitura di
  un episodio li importa da lì; un tema di una sola scena resta nella sua partitura. Un
  tema nuovo che tornerà si mette in `temi.ts` subito. Una sezione può avere un
  **`controcanto`**: una seconda melodia, dall'altra parte dello stereo (ep03, il finale:
  Zara e Cervara insieme, i due riflessi che l'acqua tiene insieme).
- **Il silenzio è musica.** Dove la prosa fa tacere (ep02 p.10: «Il silenzio salì
  dall'acqua tutto insieme») nessuna sezione copre l'inquadratura; sotto un brano
  nemmeno (il brano è la musica).
- **Brani** (`cartoni/brani/`): le canzoni vere, fatte una volta e tenute — la prima
  è la ninna-nanna della Prima Tigre, fatta da Ray con Suno (26/9/2026: introduzione
  suonata, i sei versi cantati «da filastrocca», poi canticchiata). Il registro
  `brani.json` dice il file, le sezioni, i versi col momento in cui si cantano (i versi
  devono essere quelli del canone: test), la fonte e la licenza. In un'inquadratura:
  `brano: { id, da, dal, al }` e le didascalie dei versi fatte da
  `versiCantati(id, brano, uso, pagina)` (`canto`: nessuno le legge, compaiono col
  canto). Il brano va con la musica e cala sotto le voci; sotto un brano la storia non
  può rallentare (suona a tempo vero): una voce nella sua finestra deve starci, se no
  il test (`fuoriTempo`) lo dice. Canone (`saga/bible/prima_tigre.md`): il testo intero
  della ninna-nanna una volta sola (ep02); la canticchiata può tornare quanto si vuole.
  Il `vol` del brano lo tiene appena sotto la narratrice (ep02: 0,6): è una ninna-nanna
  pensata nel sonno, non un numero musicale.
- **Effetti**: rumore seminato e filtrato. Niente suoni "magici" (campanelle sulla
  pietra, arpeggi scintillanti sui segni): è la stessa regola anti-New-Age. Il catalogo
  cresce (ep03): `tec` (un colpetto di becco su legno; con `durata`, tanti e fitti),
  `russare` (lungo e pari: il ronfo e il soffio), `sasso` (una zampa che si posa su una
  pietra e *suona*), `soffio` (l'aria di chi passa leggero), `asse` (un'asse che canta).
  Un nome che il motore non conosce non suona: il test lo vieta. E nell'ambiente, di
  notte, i `grilli` (seminati a parte: dove non ci sono, l'aria resta quella di prima,
  campione per campione).
- **Missaggio**: musica con riverbero, effetti, ambiente, voci; quando si parla la
  musica cala (~8 dB sotto la narratrice, ~5 sotto il grammelot), un poco anche effetti
  e ambiente; picco normalizzato e saturazione morbida; il render porta tutto a −18 LUFS.

## 7. Girare e consegnare

1. `npx vitest run test/cartoni.*` verdi (e `npm run check` prima della PR).
2. Foglio-provini: un fotogramma per inquadratura → la prima cosa che Ray guarda.
3. `suona.ts --episodio <id>` → `gira.mjs --episodio <id> --audio …` →
   `cartoni/out/<id>.mp4` (fuori da git: si rigenera dal copione). Con `--narratrice`
   la versione narrata (stesso flag a tutti e due). Un render alla volta: due insieme
   si rubano i due processori.
4. **Il sincrono**: il video dura quanto la colonna sonora (stessi tempi, le voci
   comprese); un fotogramma prima di ogni battuta ha la bocca chiusa, uno sulla
   sillaba più forte ce l'ha aperta.
5. **Per mandarlo** in chat (tetto ~30 MB) si ricomprime: x264 in due passate a ~780
   kbit/s col sonoro AAC a 128k (5′ ≈ 28 MB). Il file buono resta quello di `gira.mjs`.
6. **Consuntivo** nel messaggio o nella PR: inquadrature ↔ pagine, scarti di regia
   dalla prosa (da ratificare), dove la storia rallenta per le voci, cosa manca.
7. Branch + PR come ogni altra corsia; motore ed episodi in pacchetti separati. Il
   video **non si pubblica** senza l'ok di Ray.
8. **Le puntate**: `npx tsx cartoni/render/monta.ts --puntata N` (i quattro episodi del
   volume, girati con lo stesso `gira.mjs`: se no si ferma e dice quale rigirare);
   `--parziale` per montare quelli che ci sono; `--stagione` per tutto di fila.

## 8. Casi limite

- **La prosa cambia** → il test delle citazioni diventa rosso: si aggiorna la
  didascalia (o si toglie), non si "aggiusta" il test. Se c'è la narrazione, il test
  delle riprese dice quali pezzi rifare (`narra.ts --solo`).
- **La scheda cambia colore** → il test delle ancore è rosso: si aggiorna la costante
  del pupazzo (che è una copia dichiarata, non una seconda fonte).
- **Una voce a schermo non c'è in prosa** (serve una battuta nuova) → non la si
  scrive qui: si chiede al prosatore / a Ray.
- **Una battuta ha troppa voce per la sua scena** (la storia rallenta sotto ~0,5×) →
  si allunga l'inquadratura nel copione o si sposta la didascalia, non si accorcia la voce.
- **Un episodio esce dalla forbice** (sotto 3′ o sopra 7′ con le voci) → si rivede la
  regia (quante pagine per inquadratura, quanto dura il silenzio), non la forbice.
- **La saga cambia forma** (un volume fuso a tre capitoli, un episodio spostato) → la
  serie segue il grafo da sola; il test «quattro per puntata» e la tabella della serie
  qui sopra si aggiornano insieme, con Ray.
