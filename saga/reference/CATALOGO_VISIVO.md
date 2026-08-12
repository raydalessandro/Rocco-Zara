# Catalogo visivo — kit di generazione reference (per Manus)

> **Cosa è**: il fascicolo da cui generare le **reference di catalogo (contesto 1c)** — i ritratti
> riusabili e vincolanti di ogni entità. Generato da `genera_catalogo.py`; le fonti vincolanti
> sono il registro (`entities.json`) e le schede canone (`bible/`).

> **Per Manus**: incarna l'agente **`ritrattista`** (`.claude/agents/ritrattista.md`) — questo
> file è il suo **foglio di lavoro**. Flusso: proposta `ritratto` → validazione umana (le
> modifiche si scrivono PRIMA in morfologia) → conferma → set HD `fronte`·`tre_quarti`·
> `profilo`·`segno` → consegna in branch (path 1c + registro + patch scheda ⚠ se serve).

> **Regole di tavola (sempre, ogni vista)**: animali **naturalistici**, gentilmente stilizzati;
> **mai vestiti/costumi, mai cartoon-flat, mai pose umane, mai aloni o effetti**; scala reale fra
> specie; il **segno naturale** distintivo visibile e fedele; fondo = bioma del regno, neutro e
> secondario (il soggetto è la reference).

> **Viste standard ⚠ (proposta da ratificare)** — personaggi: proposta = `ritratto`; dopo la
> conferma umana, set HD: `fronte` · `tre_quarti` · `profilo` · `segno`. Luoghi: `campo` ·
> `materia`. Naming: `public/reference/<entityId>/<entityId>_<vista>.jpg` (+ `_hd/`).

## 1 · Personaggi

### Rocco — `char_rocco`
- **soggetto**: rinoceronte
- **scheda (fonte vincolante)**: `saga/bible/rocco.md`
- **aspetto canonico**:
  - corno storto (la madre dice che si raddrizzerà — non si è ancora raddrizzato);
  - zampe troppo grandi per il corpo; corporatura massiccia;
  - pelle spessa. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia e proporzioni: rinoceronte giovane — garrese ≈ 1,5× la spalla di Zara; corpo compatto ma zampe visibilmente «un numero in più»: giunture larghe, piedi a tre dita grandi che sembrano prestati da un adulto
  - pelle: grigio caldo di polvere (#8a8378), ventre e pieghe interne più chiari (#a29a8d); grana ruvida a crateri fini; pieghe marcate su spalle, collo e anche (la corazza morbida di un giovane)
  - IL CORNO STORTO (geometria esatta): corno nasale unico a base larga, inclinato verso la SUA sinistra di ~20° rispetto all'asse del muso, con una lieve torsione della punta verso l'alto — una virgola, mai un uncino; anelli di crescita visibili alla base; il corno posteriore è solo un bozzo appena accennato
  - testa: fronte alta, labbro prensile morbido spesso fermo «a mezza domanda»; orecchie tonde orlate di setole corte, molto mobili (il suo vero radar)
  - occhi: piccoli, marrone caldo (#5a4632), ciglia lunghe — la gentilezza abita lì; nelle tavole gli occhi si vedono SEMPRE, anche in campo largo
  - posa-firma: il peso un filo in avanti; da fermo appoggia PRIMA una nocca sola (il gesto della misura, ep05); quando protegge, il corpo si mette tra la luce/il pericolo e l'altro — l'ombra è un gesto
  - ancore colore: #8a8378 · #a29a8d · #5a4632
- **nota di firma**: Il corno storto è la firma visiva di Rocco: non si "corregge" nelle illustrazioni.
- **reference (registro)**: rinoceronte giovane, corporatura massiccia, pelle spessa; corno STORTO (firma visiva, non si corregge); zampe troppo grandi per il corpo; occhi gentili
- **viste**: proposta `char_rocco_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_rocco/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_rocco_ritratto_v5.png (rigenerare solo su richiesta)

### Zara — `char_zara`
- **soggetto**: tigre
- **scheda (fonte vincolante)**: `saga/bible/zara.md`
- **aspetto canonico**:
  - piccola (di taglia — si offende se glielo dicono: "non sono piccola, sono solo giovane");
  - strisce nere su arancione; occhi verdi (brillano anche di giorno);
  - artigli affilati. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia e proporzioni: tigre giovane, asciutta — spalla ≈ ⅔ del garrese di Rocco; zampe lunghe rispetto al tronco (lo scatto viene prima della massa); il collo porta la testa alta anche da ferma
  - manto: arancio caldo NON saturo (#d08a3e); guance, petto e ventre crema (#efe3cd); strisce nero-bruno (#241f1a) ASIMMETRICHE: fitte su spalle e coda, rade sui fianchi — mai speculari tra lato destro e sinistro
  - IL SEGNO di riconoscimento: UNA striscia a forcella (a Y) al centro della fronte, con il ramo destro un filo più lungo — è il marchio che la distingue da ogni altra tigre in ogni tavola
  - coda: anellata fitta, punta nera; da seduta la avvolge intorno alle zampe (posa-firma dalla prima notte)
  - occhi: verdi CHE BRILLANO (#7da05a), grandi, taglio allungato — il brillio la distingue dal verde-pietra fermo di Toraki; orecchie con ocelli bianchi netti sul retro
  - posa-firma: quando vuole sembrare grande «si gonfia» — pelo del collo su, petto avanti, mento alto: il tell delle tavole; quando è davvero sicura, invece, sta bassa e morbida
  - ancore colore: #d08a3e · #241f1a · #efe3cd · #7da05a
- **nota di firma**: Occhi verdi + taglia minuta = firma visiva di Zara.
- **reference (registro)**: tigre giovane, manto arancione a strisce nere, taglia piccola (giovane); occhi verdi che brillano; agile e veloce
- **viste**: proposta `char_zara_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_zara/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_zara_ritratto_v5.png (rigenerare solo su richiesta)

### lo Specchio di Zara ⚠nome dal lessico — `char_specchio_di_zara`
- **soggetto**: lince (lo stemma del regno — lei ne è il vanto)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/specchio-di-zara.md`
- **aspetto canonico**:
  - firma visiva: il portamento — sta dritta, a suo agio, senza gonfiarsi (l'opposto di Zara, che si gonfia per sembrare grande). I ciuffi sulle orecchie della lince, perfetti. La grazia di chi non ha mai dovuto dimostrare di appartenere. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: lince giovane compatta — più bassa di Zara ma più larga di spalla; zamponi da neve sproporzionati ed eleganti insieme
  - manto: sabbia-freddo (#c9b18e) a macchie brevi e nitide; basette ampie che incorniciano il muso; coda corta a punta nera
  - IL SEGNO: i ciuffi auricolari NERI, lunghi, perfetti — ma con le punte un filo piegate (se li lecca quando è nervosa): solo chi guarda bene lo nota, ed è il suo tell
  - occhi: nocciola-oro chiari (#c2a35c), taglio calmo — lo sguardo di chi non deve dimostrare
  - posa-firma: l'appoggio da manuale — sui massi non muove MAI un sasso; quando cede il posto di testa (ep04), lo fa con un solo passo laterale, pulito
  - ancore colore: #c9b18e · #1f1c18 · #c2a35c
- **reference (registro)**: lince giovane, lo stemma del regno; portamento dritto e a suo agio SENZA gonfiarsi (l'opposto di Zara); ciuffi sulle orecchie perfetti; la grazia di chi non ha mai dovuto dimostrare di appartenere
- **viste**: proposta `char_specchio_di_zara_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_specchio_di_zara/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_specchio_di_zara_ritratto_v5.png (rigenerare solo su richiesta)

### Toraki — `char_toraki`
- **soggetto**: tigre bianca (Forestiera, "marcata")
- **scheda (fonte vincolante)**: `saga/bible/toraki.md`
- **aspetto canonico**:
  - tigre bianca: strisce scure su manto bianco — l'inverso del manto arancione di Zara. I due fratelli sono una coppia speculare: lei calda, lui chiaro.
  - più grande e più adulto di Zara; stessa agilità, con l'autorità di chi è venuto prima.
  - occhi di giada (si rappresentano verdi): «tutti dicono che ha gli occhi di giada» — è così che lo si riconosce e lo si nomina (marchio del precursore che si vede solo nelle tracce). Verde-pietra, fermo: lo distingue dagli occhi verdi che brillano di Zara, ed è in rima con le pietre antiche verso cui va (e con l'ancora orientale — la giada). #### Morfologia di reference (vincolante per il ritrattista)
  - taglia e proporzioni: più grande di Zara di un quarto abbondante, già adulto; stessa agilità, zero spreco — ogni movimento parte finito
  - manto: bianco caldo (#f2efe8) con strisce grigio-carbone RADE (#3a3a3c), larghe e distanziate — l'inverso esatto di Zara: lei calda e fitta, lui chiaro e rado
  - IL SEGNO (canonizza DECISIONI №12 ⚠): sul fianco SINISTRO una striscia sola che si interrompe a metà — parte dal dorso e muore a mezzo costato, netta, come un segno non finito; nelle tavole è il suo riconoscimento a distanza insieme alla taglia
  - occhi: giada verde-pietra (#6f8f7a), FERMI — non brillano mai; palpebre basse di chi ha già guardato tutto due volte
  - coda: bassa e quasi immobile anche in marcia; le orecchie lavorano al posto suo
  - posa-firma: il polso che gira due volte quando annoda — la «calligrafia di famiglia» che Zara riconosce nei suoi nodi
  - ancore colore: #f2efe8 · #3a3a3c · #6f8f7a
- **nota di firma**: Manto bianco + taglia maggiore = firma visiva di Toraki (lo distingue da Zara a colpo d'occhio).
- **reference (registro)**: tigre BIANCA (strisce scure su manto bianco — l'inverso di Zara), più grande e adulta; occhi di giada (verde-pietra, fermo)
- **viste**: proposta `char_toraki_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_toraki/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_toraki_ritratto_v5.png (rigenerare solo su richiesta)

### Artiglio — `char_artiglio`
- **soggetto**: falco (l'esattore della Serpe)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/artiglio.md`
- **aspetto canonico**:
  - firma visiva: gira alto in cerchio prima di calare — il predatore che "fa i conti" dall'alto e poi piomba. Gli artigli che stringe e flette quando "cita il dovuto". Lo sguardo che prezza chi ha sotto. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: falco compatto, spalle larghe da picchiata; in volo la sagoma è un'ancora rovesciata
  - livrea: dorso ardesia (#4a5560), petto crema barrato fitto di bruno (#8a6a4a); coda a bande nette
  - IL SEGNO: UNA remigante primaria sinistra BIANCA — una sola, che in volo lampeggia come una lama chiara: è così che lo si riconosce da terra prima di riconoscerlo
  - occhi: giallo intenso (#d8a020) cerchiati di scuro; lo sguardo non «cerca»: ha già trovato
  - zampe: artigli anteriori lucidi, visibilmente troppo lunghi — curati come strumenti
  - posa-firma: da fermo tiene le ali semi-aperte, mai chiuse del tutto: il decollo è sempre già cominciato
  - ancore colore: #4a5560 · #d8a020
- **reference (registro)**: falco, l'esattore della Serpe; gira alto in cerchio prima di calare; gli artigli che stringe e flette quando cita il dovuto; lo sguardo che prezza chi ha sotto
- **viste**: proposta `char_artiglio_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_artiglio/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_artiglio_ritratto_v5.png (rigenerare solo su richiesta)

### Aspide — `char_aspide`
- **soggetto**: vipera (il consigliere di corte)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/aspide.md`
- **aspetto canonico**:
  - firma visiva: immobile, appena dietro il Signore — la voce all'orecchio; la vipera avvolta vicino, che non colpisce mai allo scoperto: il veleno è nelle parole. Mai al centro della scena; sempre al suo margine. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: più piccola di Bissa; presenza che si dimentica — ed è il punto
  - livrea: grigio-cenere uniforme (#5d5a54), pattern quasi assente: si confonde coi selciati della corte; una cucitura di scaglie più chiare lungo il labbro
  - occhi: ambra spenta, mezze palpebre — sembra sempre sul punto di dormire, non dorme mai
  - IL SEGNO: la punta della coda in perpetuo movimento MINIMO quando tutto il resto è fermo — scrive nell'aria; nelle tavole è il dettaglio che lo tradisce
  - posa-firma: mai al centro dell'inquadratura di corte: sempre a mezzo passo dietro la spalla di chi comanda
  - ancore colore: #5d5a54 · #b9a26a (occhi)
- **reference (registro)**: vipera, il consigliere; immobile, appena dietro il Signore, la voce all'orecchio; non colpisce mai allo scoperto: il veleno è nelle parole; sempre al margine della scena
- **viste**: proposta `char_aspide_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_aspide/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_aspide_ritratto_v5.png (rigenerare solo su richiesta)

### Bissa — `char_bissa`
- **soggetto**: vipera (giovane — l'erede della Serpe)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/bissa.md`
- **aspetto canonico**:
  - firma visiva: tesa dove Viscardo è immobile — dove il vecchio Serpe sta avvolto e paziente, lei è avvolta e pronta a scattare in anticipo. Il guizzo troppo svelto: l'impazienza in una stirpe che ha fatto della pazienza un'arma. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: vipera giovane, snella — metà di Viscardo; il corpo disegna sempre almeno un'ansa pronta, mai completamente avvolta
  - livrea: bronzo giovane LUCIDO (#7a5f3a) con losanghe dorsali scure ben stampate (#3c2f22); ventre chiaro pulito — la muta perfetta, scaglie quasi smaltate: l'esatto opposto dell'opacità di Viscardo
  - testa: triangolare, affilata; occhi ambra CHIARA a fessura, rapidi — si muovono prima del corpo
  - IL SEGNO: il guizzo — nelle tavole ha sempre una parte del corpo un mezzo tempo AVANTI rispetto alla posa (la testa già girata, l'ansa già carica): l'impazienza resa anatomia
  - posa-firma: si solleva più del necessario quando parla ai sottoposti (guadagnare altezza è la sua fame)
  - ancore colore: #7a5f3a · #3c2f22
- **reference (registro)**: vipera giovane, l'erede della Serpe; tesa dove Viscardo è immobile — avvolta e pronta a scattare in anticipo; il guizzo troppo svelto
- **viste**: proposta `char_bissa_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_bissa/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_bissa_ritratto_v5.png (rigenerare solo su richiesta)

### Cècca — `char_cecca`
- **soggetto**: gazza (la spia della Serpe)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/cecca.md`
- **aspetto canonico**:
  - firma visiva: lo scatto della testa verso ogni riflesso — l'occhio è già altrove, su qualcosa che brilla, anche mentre ti parla. Rigira fra le penne frammenti lucenti che non riesce a lasciare. La gazza non è goffa: è precisa — finché qualcosa non luccica. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: gazza grande, coda lunga a cuneo che è metà della sua lunghezza
  - livrea: nero con iridescenze blu-verdi (#1c2430, riflessi #3f6d7a); spalle e ventre bianchi NETTI — bicromia pulita, da manifesto
  - IL SEGNO: tre penne timoniere di SINISTRA con le barbe spezzate (troppo bottino trascinato) + fra le penne del petto, sempre UN luccichio infilato — ogni tavola uno diverso
  - occhi: neri vivi, con lo scatto laterale continuo: la testa punta ogni riflesso anche mentre parla con te
  - posa-firma: il saltello obliquo d'avvicinamento — mai in linea retta verso ciò che vuole
  - ancore colore: #1c2430 · #f0ece1 · #3f6d7a
- **reference (registro)**: gazza; lo scatto della testa verso ogni riflesso, l'occhio già altrove su qualcosa che brilla; frammenti lucenti fra le penne. Precisa, finché qualcosa non luccica.
- **viste**: proposta `char_cecca_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_cecca/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_cecca_ritratto_v5.png (rigenerare solo su richiesta)

### Sòrcio — `char_sorcio`
- **soggetto**: ratto (contrabbando e voci, per la Serpe)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/sorcio.md`
- **aspetto canonico**:
  - firma visiva: stracarico di refurtiva che gli scivola di continuo (raccoglie, perde, raccoglie); si nasconde nel posto più sbagliato con aria soddisfatta; la posa da gran professionista smentita da una coda che trema. Lo scarto postura/realtà è il personaggio. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: ratto tondo, basso, da dispensa più che da vicolo
  - pelo: grigio-topo opaco (#6e675f), ventre più chiaro e perennemente spolverato di qualcosa
  - IL SEGNO: l'orecchio destro con una tacca a V netta + i baffi ASIMMETRICI (metà tranciati in una vecchia trappola) — il muso pende sempre un filo dal lato dei baffi corti
  - coda: nuda, con un anello di pelle più chiara a metà (lo chiamano «l'anello rubato»)
  - occhi e palpebre: a metà, SEMPRE — sonnecchia in piedi; nelle tavole comiche dorme in pose impossibili
  - posa-firma: da scoperto si finge cosa — immobile, sguardo nel vuoto, come merce sul banco
  - ancore colore: #6e675f · #b9a98f
- **reference (registro)**: ratto della Serpe; stracarico di refurtiva che gli scivola di continuo; si nasconde nel posto più sbagliato con aria soddisfatta; posa da gran professionista smentita dai fatti
- **viste**: proposta `char_sorcio_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_sorcio/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_sorcio_ritratto_v2.png (rigenerare solo su richiesta)

### Viscardo ⚠scheda mancante — `char_viscardo`
- **soggetto**: vipera — anziana, grande (il doppio di Bissa)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/viscardo.md`
- **aspetto canonico**:
  - vipera color bronzo vecchio: scaglie olivastre spente, opache ai bordi (l'età che non fa più la muta lucida); il ventre color pergamena.
  - occhi ad ambra, a fessura, mai chiusi — nemmeno quando sembra dormire: è così che la corte sa che non dorme mai.
  - segno naturale: una cicatrice anulare a metà corpo — il morso di un rivale che non c'è più («inghiotte i rivali»: la cicatrice è tutto ciò che ne resta).
  - l'immobilità è la firma: nelle tavole Viscardo non è mai còlto in movimento — è già arrivato, o non si è ancora mosso. Si muove una volta sola in tutta la stagione (ep24, la ritirata: e persino quella è lenta, scelta, senza sconfitta nel corpo).
  - la lingua assaggia l'aria una volta sola, lentissima — il suo unico gesto ricorrente. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia e proporzioni: vipera anziana, il DOPPIO di Bissa in lunghezza e spessore; il corpo occupa la scena come un tronco caduto — non si capisce mai dove finisca
  - livrea: bronzo vecchio OPACO (#6b5a3a) con losanghe quasi cancellate dall'età; ventre pergamena (#c9b78e); i bordi delle scaglie opachi, come una muta che non arriva più
  - LA CICATRICE ANULARE (geometria): a metà corpo, una fascia larga due dita di scaglie irregolari e più chiare (#8d7c5c) che circonda TUTTO il corpo — il morso del rivale che non c'è più; in ogni veduta laterale deve leggersi
  - occhi: ambra torbida (#c99a3e), a fessura, MAI chiusi — nemmeno nel riposo; l'unico movimento ricorrente è la lingua nera, una volta sola, lentissima
  - posa-firma: l'immobilità totale — nelle tavole non è mai còlto in movimento: è già arrivato, o non si è ancora mosso
  - ancore colore: #6b5a3a · #c9b78e · #c99a3e
- **reference (registro)**: vipera anziana, il Signore della Serpe; immobile e paziente dove Bissa scatta — la costellazione è in cartografia/regni/pianura_alta/la_serpe.md
- **viste**: proposta `char_viscardo_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_viscardo/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_viscardo_ritratto_v5.png (rigenerare solo su richiesta)

### il Cacciatore — `char_cacciatore`
- **soggetto**: martora (predatore agile, instancabile) — adattabile al roster
- **scheda (fonte vincolante)**: `saga/bible/comprimari/cacciatore.md`
- **aspetto canonico**:
  - firma visiva: un orecchio strappato (una vecchia caccia finita male) — il marchio di chi ha già perso una volta e non lo perdona. Al collo, un dente di una cattura: il suo unico vezzo (al limite del "pegno portato" — mai vestiti). #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: martora — un nastro di muscolo asciutto; nelle tavole è più LUNGO di quanto sembri possibile
  - pelo: fulvo scuro lucido (#6a4a2c); bavetta golare giallo-crema (#e0b64a) a margini NETTI, la sua fiamma
  - IL SEGNO: al collo, su un cordino di tendine, il dente-trofeo della vecchia cattura (fino a ep23; dopo: il cordino VUOTO — e il vuoto si deve vedere) + tre graffi paralleli vecchi sulla spalla destra: l'unica preda che si difese
  - occhi: bruni quasi neri, tondi, senza fondo; non sbatte quasi mai le palpebre
  - respiro: conta — i fianchi vanno a tempo regolare anche nello sforzo: è il suo metronomo, e nelle tavole si rende con la posa raccolta, mai scomposta
  - ancore colore: #6a4a2c · #e0b64a
- **reference (registro)**: martora, predatore instancabile; un orecchio strappato (una vecchia caccia finita male); al collo il dente di una cattura; ha già perso una volta e non lo perdona
- **viste**: proposta `char_cacciatore_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_cacciatore/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_cacciatore_ritratto_v5.png (rigenerare solo su richiesta)

### il Cittadino del Leone — `char_cittadino_leone`
- **soggetto**: leone (lo stemma di Leonalba — la gloria civile)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/il-cittadino-del-leone.md`
- **aspetto canonico**:
  - firma visiva: magnifico e tagliente, la criniera portata come un'incoronazione; parla scolpendo l'aria (la terzina si vede nel gesto). Guarda chi ha davanti come per assegnargli un posto nella memoria — o negarglielo. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: leone in piena forza, criniera piena portata «a corona» — pettinata dal vento della piazza, mai spettinata dal mondo
  - mantello: dorato civico (#c29b5e), criniera più scura (#8a5f2e) con il bordo esterno acceso dal sole d'alba
  - IL SEGNO: un canino più BIANCO degli altri, visibile quando parla in epigrafi — il lampo nel discorso
  - occhi: ambra da rostro, sopracciglio scolpito; guarda come per assegnarti un posto nella memoria
  - posa-firma: la zampa destra a mezz'aria un istante PRIMA di ogni gesto — scolpisce l'aria; a ep21 resta così, interrotto: la statua di se stesso
  - ancore colore: #c29b5e · #8a5f2e
- **reference (registro)**: leone, lo stemma di Leonalba; magnifico e tagliente, la criniera portata come un'incoronazione; parla scolpendo l'aria; guarda come per assegnarti un posto nella memoria
- **viste**: proposta `char_cittadino_leone_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_cittadino_leone/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_cittadino_leone_ritratto_v5.png (rigenerare solo su richiesta)

### il Custode anziano — `char_custode_anziano`
- **soggetto**: testuggine di lago (longeva — la memoria fatta animale) — adattabile al roster
- **scheda (fonte vincolante)**: `saga/bible/comprimari/custode-anziano.md`
- **aspetto canonico**:
  - firma visiva: il guscio liscio dove ha riposato per anni contro le pietre antiche — la pietra ha levigato il carapace. Porta addosso, senza saperlo, il segno del luogo che custodisce. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: lince anziana, più leggera del giusto; il pelo fa volume dove il corpo non c'è più
  - manto: base sbiadita (#b8a488) con macchie slavate; grigio pieno ai fianchi e sul muso (#9b968c); ciuffi auricolari diradati
  - IL SEGNO: l'iride verde-acqua slavato (#a8b8a0) — occhi che sembrano pozze basse — e un canino inferiore che sporge appena dal labbro
  - posa-firma: si siede con le zampe anteriori perfettamente appaiate, simmetriche; parla poco e ogni frase arriva DOPO un respiro visibile
  - ancore colore: #b8a488 · #9b968c · #a8b8a0
- **reference (registro)**: testuggine di lago, vecchissima; il guscio liscio, levigato da anni di riposo contro le pietre antiche — porta addosso il segno del luogo che custodisce
- **viste**: proposta `char_custode_anziano_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_custode_anziano/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_custode_anziano_ritratto_v5.png (rigenerare solo su richiesta)

### il Custode delle Pietre — `char_custode_pietre_leone`
- **soggetto**: asino (vecchio — umile, paziente, fuori dal tempo)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/il-custode-delle-pietre-del-leone.md`
- **aspetto canonico**:
  - firma visiva: grigio di muso, consumato come le pietre che cura; le zampe conoscono ogni lastra. Lo si vede rassettare, sgombrare, tenere pulito — un gesto umile ripetuto da una vita. Occhi caldi, pazienti. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: asino piccolo e fermo, di quelli che portano da sempre
  - mantello: grigio-cenere umile (#8f8a82), muso chiaro; orecchie lunghe con gli orli consumati dai rovi del sentiero
  - IL SEGNO: la CROCE MULINA scura sul dorso — la riga di spalla che incrocia la riga dorsale: il segno vero degli asini, qui portato come un ufficio (la croce di chi porta)
  - occhi: pazienti, cerchiati di chiaro; battito di ciglia lento, da chi ha visto salire tutti
  - posa-firma: si volta per ULTIMO, sempre — e sgombra il sentiero prima di seguirti
  - ancore colore: #8f8a82 · #4a4642 (croce)
- **reference (registro)**: asino vecchio; grigio di muso, consumato come le pietre che cura; le zampe conoscono ogni lastra; lo si vede rassettare e tenere pulito, un gesto umile ripetuto da una vita; occhi caldi
- **viste**: proposta `char_custode_pietre_leone_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_custode_pietre_leone/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_custode_pietre_leone_ritratto_v5.png (rigenerare solo su richiesta)

### il Dotto che smonta — `char_dotto_che_smonta`
- **soggetto**: gufo (l'occhio del sapere — stemma dei Savi; il dottore di Savenza)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/il-dotto-che-smonta.md`
- **aspetto canonico**:
  - firma visiva: lo sguardo fisso che ti seziona — il gufo che non sbatte le palpebre e ti guarda come un reperto da smontare. Inclina la testa lentamente, come chi gira un oggetto per trovarne le giunture. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: gufo reale grande, spalle piene, presenza da cattedra
  - piumaggio: bruno-carta (#8a744f) barrato fine, come pagine fitte; ciuffi auricolari ordinati, simmetrici
  - IL SEGNO: le «LENTI» — due cerchi di piume più chiare, perfetti, attorno agli occhi (#e3d8c0): occhiali naturali da esaminatore
  - occhi: arancio intenso (#d98e2b), fermi; sbatte le palpebre UNA volta, alla fine di ogni dimostrazione — il suo punto fermo
  - zampe: maneggia tutto con la punta degli artigli, mai con la presa piena — il mondo tenuto con le pinze
  - ancore colore: #8a744f · #e3d8c0 · #d98e2b
- **reference (registro)**: gufo, l'occhio del sapere; lo sguardo fisso che seziona — non sbatte le palpebre e ti guarda come un reperto; inclina la testa piano, come chi cerca le giunture di un oggetto
- **viste**: proposta `char_dotto_che_smonta_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_dotto_che_smonta/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_dotto_che_smonta_ritratto_v5.png (rigenerare solo su richiesta)

### il Giurato della parola data — `char_giurato`
- **soggetto**: orso bruno (di confine — ruvido, enorme, lento a parlare)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/il-giurato.md`
- **aspetto canonico**:
  - firma visiva: le cicatrici sugli avambracci — una per ogni parola tenuta a costo del sangue. Sta fermo come un masso; quando dà la mano (la zampa), la stretta è un patto. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: orso bruno massiccio, gobba di spalla alta; da seduto è comunque più alto di chi gli parla
  - pelo: bruno terra (#5b4632), più chiaro sul muso quadrato
  - IL SEGNO: sulla spalla sinistra, il pelo CONSUMATO a fascia diagonale — dove per anni è corsa la fascia da Giurato (da ep08 la fascia non c'è più; il segno resta, ed è il personaggio) + un artiglio anteriore spezzato
  - occhi: piccoli, seri, infossati — di quelli che firmano
  - posa-firma: di guardia alla porta ANCHE senza carica: seduto, dritto, il peso pari sulle quattro zampe
  - ancore colore: #5b4632 · #8a7458
- **reference (registro)**: orso bruno di confine, enorme e lento a parlare; cicatrici sugli avambracci, una per ogni parola tenuta a costo del sangue; quando dà la zampa, la stretta è un patto
- **viste**: proposta `char_giurato_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_giurato/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_giurato_ritratto_v2.png (rigenerare solo su richiesta)

### il Guardiano del guado — `char_guardiano_guado`
- **soggetto**: garzetta (l'airone bianco; è nel roster dei Contadini/Argini del Gran Fiume) — adattabile
- **scheda (fonte vincolante)**: `saga/bible/comprimari/guardiano-del-guado.md`
- **aspetto canonico**:
  - firma visiva: l'immobilità — sta nell'acqua bassa fermo come un palo, finché non si muove di colpo. Una zampa segnata da una vecchia piena. (segno naturale.) #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: garzetta — verticale, leggera, un tratto di pennello bianco in mezzo alla piena
  - piumaggio: bianco calcare (#eee9df); piume del capo a pennello corto; becco giallo pallido, zampe scure
  - IL SEGNO: la zampa SINISTRA con due dita fuse da vecchia ferita — la «zampa segnata» che ripiega e riserva per i passi che contano
  - occhi: gialli chiari, tondi, fermi sull'acqua — leggono la corrente come una pagina
  - posa-firma: su UNA zampa anche nella piena, immobile mentre tutto scorre; le frasi arrivano quando l'acqua lo permette
  - ancore colore: #eee9df · #c8b45a
- **reference (registro)**: garzetta; l'immobilità — sta nell'acqua bassa fermo come un palo finché non si muove di colpo; una zampa segnata da una vecchia piena (segno naturale)
- **viste**: proposta `char_guardiano_guado_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_guardiano_guado/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_guardiano_guado_ritratto_v5.png (rigenerare solo su richiesta)

### il Marinaio del Mare — `char_marinaio`
- **soggetto**: cormorano (marinaio-navigatore, pescatore preciso del mare di Marleone)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/il-marinaio-del-mare.md`
- **aspetto canonico**:
  - firma visiva: incrostato di sale, l'occhio che strizza all'orizzonte misurando le distanze; gesti deliberati, mai affrettati; controlla due volte prima di muovere (la cima, la marea, la rotta). #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: cormorano grande, collo a esse pronta, corpo da tuffo
  - piumaggio: nero-verde petrolio (#22302c) con gola bianca; becco uncinato grigio corno
  - IL SEGNO: incrostazioni di SALE visibili come brina sulle punte delle ali e attorno alle zampe — il mare portato addosso, sempre
  - occhi: verde smeraldo (#3f7a5f) che STRIZZA all'orizzonte — misura anche quando ti guarda
  - posa-firma: ad ali APERTE ad asciugare, immobile, di fronte al vento — la croce di chi misura due volte; controlla la cima, poi la ricontrolla
  - ancore colore: #22302c · #3f7a5f · #e9e4d6 (sale)
- **reference (registro)**: cormorano di Marleone; incrostato di sale, l'occhio che strizza all'orizzonte misurando; gesti deliberati, mai affrettati; controlla due volte prima di muovere
- **viste**: proposta `char_marinaio_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_marinaio/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_marinaio_ritratto_v5.png (rigenerare solo su richiesta)

### il Mastino — `char_mastino`
- **soggetto**: cane mastino (signore-condottiero dei valichi)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/il-mastino.md`
- **aspetto canonico**:
  - firma visiva: piantato sul valico come una porta di fortezza; la posa fiera, il ringhio che è orgoglio più che minaccia; cicatrici portate come medaglie. Non si nasconde, non tende agguati: ti affronta a viso aperto. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: mastodontico — il torace più largo delle spalle di Rocco giovane; giogaia pesante, passo che si sente
  - mantello: fulvo-orzo (#a97e4f) con maschera nera piena sul muso; orecchie mozze corte
  - IL SEGNO: da ep19 la striscia di pelo chiaro (#cbb693) attorno al collo dove stava il collare di servizio — il segno del servizio che resta quando il servizio è tolto; PRIMA di ep19: collare di cuoio scuro con placca liscia senza stemma
  - cicatrici: sottili, vecchie, sul petto — da tenuta, non da rissa
  - posa-firma: la fronte SEMPRE alta — non abbassa la testa nemmeno per bere (beve piegando il collo di lato); quando concede il passo, si scosta di UN passo esatto
  - ancore colore: #a97e4f · #1d1b18 · #cbb693
- **reference (registro)**: mastino, signore-condottiero dei valichi; piantato sul valico come una porta di fortezza; il ringhio che è orgoglio più che minaccia; cicatrici portate come medaglie; affronta a viso aperto
- **viste**: proposta `char_mastino_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_mastino/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_mastino_ritratto_v5.png (rigenerare solo su richiesta)

### il Mercante delle Vie — `char_mercante_vie`
- **soggetto**: dromedario (mercante delle carovane sulle Vie)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/il-mercante-delle-vie.md`
- **aspetto canonico**:
  - firma visiva: la groppa sempre stracarica (porta più di chiunque) e l'occhio che prezza tutto in un battito — merce, animale, notizia. Lento di passo, velocissimo di parola: il contrasto è il personaggio. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: dromedario alto, ossa lunghe; nelle tavole entra sempre «a rate» — prima il collo, poi il resto
  - mantello: sabbia-strada (#b99a6b), consunto a chiazze su gomiti e ginocchia; ciglia lunghissime piene di polvere
  - IL SEGNO: la gobba PIEGATA di lato (anni di carichi asimmetrici) + al collo una campanella MUTA — il batacchio tolto («il silenzio non si vende: si affitta»)
  - muso: labbro inferiore pendulo che mastica sempre qualcosa, anche il niente
  - posa-firma: fermo di tre quarti col carico in vista, l'occhio semichiuso che ha già fatto il prezzo
  - ancore colore: #b99a6b · #7d6647
- **reference (registro)**: dromedario delle carovane; la groppa sempre stracarica, l'occhio che prezza tutto in un battito; lento di passo, velocissimo di parola
- **viste**: proposta `char_mercante_vie_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_mercante_vie/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_mercante_vie_ritratto_v5.png (rigenerare solo su richiesta)

### il Montanaro delle incisioni — `char_montanaro`
- **soggetto**: stambecco (montanaro d'altura, verso il Mare di Dentro)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/il-montanaro-delle-incisioni.md`
- **aspetto canonico**:
  - firma visiva: le corna ad anelli — un anello per ogni inverno, lette come si legge un tronco. Lo sguardo che va sempre prima al cielo che a chi gli parla. Sta sul ciglio del precipizio come su un sentiero piano. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: stambecco adulto, tarchiato, tutto garretti e collo
  - mantello: grigio-bruno roccia (#8d7f6b), barba corta; zoccoli spaccati da presa, neri
  - IL SEGNO: le corna ad arco con gli anelli di crescita MOLTO marcati — e il QUARTO anello più scuro degli altri (nessuno sa perché, lui non lo dice); il gesto di contarli col dito è la sua posa pensosa
  - occhi: orizzontali di capra, color pietra bagnata — guardano prima il cielo, poi te
  - posa-firma: fermo su un appoggio impossibile, in piano come fosse piano
  - ancore colore: #8d7f6b · #5a5148
- **reference (registro)**: stambecco d'altura; corna ad anelli, uno per inverno, lette come un tronco; lo sguardo che va sempre prima al cielo; sta sul precipizio come su un sentiero piano
- **viste**: proposta `char_montanaro_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_montanaro/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_montanaro_ritratto_v5.png (rigenerare solo su richiesta)

### il Solitario — `char_solitario`
- **soggetto**: gatto selvatico (solitario, guardingo)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/il-solitario.md`
- **aspetto canonico**:
  - firma visiva: sempre angolato per andarsene — il corpo già rivolto all'uscita mentre ti parla. Tiene la distanza, sobbalza al contatto; ma gli occhi seguono tutto (la guardia che non smette mai). #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: gatto selvatico tozzo, più grosso d'un gatto e più corto d'una lince; tutto spalle
  - manto: grigio-bosco (#6d675c) a strisce sfumate; la coda CLAVATA ad anelli con la punta nera TONDA — il suo distintivo di specie, sempre leggibile
  - IL SEGNO: l'orecchio sinistro piegato in avanti da un vecchio congelamento — l'inverno che si è tenuto addosso
  - occhi: verde-freddo, socchiusi; guarda di lato anche quando risponde
  - posa-firma: il corpo SEMPRE a tre quarti via da chi parla — l'aiuto, quando arriva, arriva di spalle
  - ancore colore: #6d675c · #3f3b35
- **reference (registro)**: gatto selvatico; sempre angolato per andarsene — il corpo già rivolto all'uscita mentre parla; tiene la distanza, ma gli occhi seguono tutto
- **viste**: proposta `char_solitario_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_solitario/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_solitario_ritratto_v5.png (rigenerare solo su richiesta)

### il giovane Disputante — `char_giovane_disputante`
- **soggetto**: assiolo (giovane — dei Dotti, la disputa: piccolo, insonne, dal richiamo insistente)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/il-giovane-disputante.md`
- **aspetto canonico**:
  - firma visiva: piccolo e irrequieto, la testa che gira a cogliere ogni angolo dell'argomento; gli occhi troppo svegli; il richiamo insistente (il "chiù" dell'assiolo) che è la sua insistenza retorica fatta verso. Sempre proteso in avanti, pronto alla replica. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: nibbio — elegante, tutto apertura e coda
  - piumaggio: bruno-rossiccio (#9a5f38), testa più chiara striata; la CODA FORCUTA inconfondibile è la sua sagoma-firma in cielo e in aula
  - IL SEGNO: una piuma della forcella sinistra SEMPRE fuori posto (parla troppo, anche in volo) — il difetto che lo rende vero
  - occhi: ambra vivace, mobili — cercano il pubblico prima dell'argomento
  - posa-firma: il capo portato a quindici gradi, mento su: l'arringa è nel collo prima che nella voce
  - ancore colore: #9a5f38 · #c9a06a
- **reference (registro)**: assiolo giovane; piccolo e irrequieto, la testa che gira a cogliere ogni angolo dell'argomento; occhi troppo svegli; il richiamo insistente che è la sua retorica fatta verso
- **viste**: proposta `char_giovane_disputante_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_giovane_disputante/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_giovane_disputante_ritratto_v5.png (rigenerare solo su richiesta)

### il quinto colonna — `char_quinto_colonna`
- **soggetto**: tasso (rispettabile, industrioso — e scava gallerie nascoste)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/il-quinto-colonna.md`
- **aspetto canonico**:
  - firma visiva: impeccabile come l'ideale civico — e un solo segno che tradisce: lo sguardo che corre alle uscite mentre parla di restare uniti. Il pelo troppo pulito di chi predica il lavoro sporco del comune ma non lo fa. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: tasso compatto, spalle da scavatore
  - livrea: maschera bianca/nera IMMACOLATA (#f1ede4 / #1f1d1b), i margini delle bande perfetti come tracciati con la squadra
  - IL SEGNO (in negativo): è l'UNICO sempre pulito in un regno di cantieri — mai calce sulle zampe, mai polvere sulla maschera; nelle tavole di gruppo il suo nitore stona, ed è il punto
  - unghie: da scavo, lunghe, lucide — tenute come strumenti da lavoro che non lavorano
  - posa-firma: il sorriso di cortesia a bocca chiusa, il capo inclinato di lato quel filo in più
  - ancore colore: #f1ede4 · #1f1d1b
- **reference (registro)**: tasso rispettabile e industrioso; impeccabile come l'ideale civico — ma lo sguardo corre alle uscite mentre predica l'unità; il pelo troppo pulito
- **viste**: proposta `char_quinto_colonna_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_quinto_colonna/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_quinto_colonna_ritratto_v2.png (rigenerare solo su richiesta)

### il riccio capocorda — `char_riccio_capocorda`
- **soggetto**: riccio
- **reference (registro)**: riccio europeo compatto e svelto, capo delle legature del molo delle Conche; spine bruno-grigie con punte chiare, occhi scuri attenti, un breve cappio di corda e tre piccoli cavigli di legno infilati naturalmente fra gli aculei; zampe sempre su quattro appoggi, mai vestito o in costume
- **viste**: proposta `char_riccio_capocorda_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_riccio_capocorda/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_riccio_capocorda_ritratto_v1.png (rigenerare solo su richiesta)

### il tentatore — `char_tentatore`
- **soggetto**: cervo (lo stemma della Selva — la libertà selvatica fatta magnificenza)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/il-tentatore.md`
- **aspetto canonico**:
  - firma visiva: magnifico e senza peso — si muove nel bosco come chi non possiede niente e tutto; il palco alto, mai chinato. È la cosa più bella dell'arco: la libertà che si vede. (E in quella bellezza, il rischio.) #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: cervo grande, da Cuore della Selva; incede senza rumore anche sul secco
  - mantello: rosso-bruno nobile (#8a5a34), specchio anale chiaro; collo pieno da stagione buona
  - IL SEGNO: il PALCO altissimo, perfettamente simmetrico, a dodici punte — portato senza peso: mai un ramo che tocca un ramo, nemmeno nel folto (è questa l'impossibilità che incanta)
  - occhi: scuri, liquidi, senza fretta — offrono sempre l'adesso
  - posa-firma: fermo al margine dell'inquadratura, di tre quarti, come un invito; a ep20 la ghianda germogliata posata senza una parola
  - ancore colore: #8a5a34 · #d9c7a8
- **reference (registro)**: cervo, lo stemma della Selva — la libertà selvatica fatta magnificenza; magnifico e senza peso, il palco alto mai chinato; la cosa più bella dell'arco, e in quella bellezza il rischio
- **viste**: proposta `char_tentatore_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_tentatore/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_tentatore_ritratto_v5.png (rigenerare solo su richiesta)

### l'Esattore pentito — `char_esattore_pentito`
- **soggetto**: mulo (bestia da soma dell'Aperto) — adattabile al roster (`../../cartografia/regni/_faunario.md`)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/esattore-pentito.md`
- **aspetto canonico**:
  - firma visiva: il segno del basto sul collo — il callo dei carichi che ha portato per anni e non porta più. Non se l'è tolto: lo porta vuoto. (segno naturale, mai finimenti-vestito.) #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: mulo da soma, ossatura forte, carne asciutta di lavoro
  - mantello: baio spento (#6b5138), muso brizzolato prima del tempo
  - IL SEGNO: la geografia del servizio tolto — due strisce di pelo rovinato sui fianchi (le cinghie del basto) e la riga chiara sul collo (il collare che non c'è più); criniera tagliata da servizio con ricrescita disuguale
  - occhi: grandi, scuri, con la palpebra pesante di chi ha contato troppo
  - posa-firma: la schiena DRITTA — innaturale per un mulo da soma, ed è tutto il personaggio in una linea; l'inchino perfetto, da servizio, riservato a chi non se lo aspetta
  - ancore colore: #6b5138 · #9a8a72
- **reference (registro)**: mulo dell'Aperto; il segno del basto sul collo — il callo dei carichi che non porta più: lo porta VUOTO (segno naturale, mai finimenti)
- **viste**: proposta `char_esattore_pentito_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_esattore_pentito/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_esattore_pentito_ritratto_v5.png (rigenerare solo su richiesta)

### l'Esule libero — `char_esule_libero`
- **soggetto**: cavallo (di pianura, fuggito nel bosco — un fuori-posto vivente)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/l-esule-libero.md`
- **aspetto canonico**:
  - firma visiva: la criniera selvatica e incolta (nessuno lo tiene più) e i segni sbiaditi di un vecchio finimento — libero, ma scavato da ciò che la libertà gli è costata. Non sta mai del tutto fermo: non appartiene a nessun luogo, e in nessuno si posa. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: cavallo di pianura, alto, con l'ossatura da tiro e la carne da bosco — un fuori-posto anche anatomico
  - mantello: morello slavato (#3f3a38) con riflessi rossastri; criniera LUNGA e incolta, piena di lappole; zoccoli non pareggiati
  - IL SEGNO: i segni sbiaditi del vecchio finimento — pelo ricresciuto BIANCO a strisce su groppa e testiera: la libertà che porta ancora la mappa della soma
  - occhi: grandi, scuri, con il bianco che affiora quando si parla di «tornare»
  - posa-firma: il passo — ANCORA la marcia della colonna, quattro tempi troppo regolari; non sta mai del tutto fermo: un piede batte
  - ancore colore: #3f3a38 · #8a8078 (segni)
- **reference (registro)**: cavallo di pianura fuggito nel bosco; criniera selvatica e incolta, i segni sbiaditi di un vecchio finimento; libero ma scavato; non sta mai del tutto fermo
- **viste**: proposta `char_esule_libero_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_esule_libero/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_esule_libero_ritratto_v5.png (rigenerare solo su richiesta)

### l'aiutante delle Conche — `char_arlecchino`
- **soggetto**: scoiattolo (regolabile) — svelto, indaffarato, terragno
- **scheda (fonte vincolante)**: `saga/bible/comprimari/l-aiutante-arlecchino.md`
- **aspetto canonico**:
  - firma visiva: le guance sempre piene (porta sempre più di quanto può tenere) e un ciuffo che non sta giù. È l'Arlecchino che giocoliera con troppe cose: ne perde una, ne acchiappa due. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: scoiattolo rosso piccolo anche per la specie — la coda è più grande di lui
  - manto: rosso vivo (#b4552e), ventre crema; ciuffetti alle orecchie
  - IL SEGNO: una NOCCIOLINA di pelo bianco sulla punta della coda — la bandierina che lo segue ovunque, sempre un battito AVANTI rispetto a lui
  - guance: MAI vuote — parla pieno, e si capisce lo stesso (purtroppo, dice Sòrcio)
  - posa-firma: si ferma a metà di un gesto quando pensa (raro, e le tavole lo celebrano); il carrello rovesciato al momento giusto è il suo capolavoro involontario
  - ancore colore: #b4552e · #efe0c8
- **reference (registro)**: scoiattolo svelto; guance sempre piene (porta più di quanto può tenere), un ciuffo che non sta giù; giocoliere di troppe cose: ne perde una, ne acchiappa due
- **viste**: proposta `char_arlecchino_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_arlecchino/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_arlecchino_ritratto_v2.png (rigenerare solo su richiesta)

### la Casa dell'Aquila — `char_casa_aquila`
- **soggetto**: aquila (la Casa dell'Aquila — il sangue estense)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/la-casa-dell-aquila.md`
- **aspetto canonico**:
  - firma visiva: si porta come uno stemma vivo — ogni posa è un blasone, ogni gesto un'impresa araldica. Guarda dall'alto (di posatoio e di spirito); l'inclinazione sprezzante del capo che misura i tuoi avi. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: aquila reale grande; anche da ferma sembra in posa per uno stemma — ed è il punto
  - piumaggio: bruno-oro scuro (#5f4a2a) con la NUCA DORATA (#c8a24e) portata sempre alla luce: l'araldica vivente
  - IL SEGNO: la cera del becco gialla IMMACOLATA e gli artigli mai sporchi — un'aquila che non caccia più: viene servita
  - occhi: oro freddo, con l'inclinazione sprezzante del capo che misura i tuoi avi prima di te
  - posa-firma: ali chiuse «a mantello» perfetto; ogni gesto è un'impresa araldica, mai un movimento di necessità
  - ancore colore: #5f4a2a · #c8a24e
- **reference (registro)**: aquila della corte di Aquilara; si porta come uno stemma vivo — ogni posa un blasone; guarda dall'alto, di posatoio e di spirito; l'inclinazione sprezzante del capo che misura i tuoi avi
- **viste**: proposta `char_casa_aquila_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_casa_aquila/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_casa_aquila_ritratto_v5.png (rigenerare solo su richiesta)

### la Leonessa civica ⚠nome dal lessico — `char_leonessa_civica`
- **soggetto**: leonessa (lo stemma del regno — lei ne è il cuore vivo)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/la-leonessa-civica.md`
- **aspetto canonico**:
  - firma visiva: i segni del servizio, non dell'ornamento — una cicatrice presa sulle mura, le zampe consumate dal lavoro fatto per il comune. Sta dritta come chi ha già dato e lo rifarebbe. Niente grazia da erede (è il rovescio dello Specchio di Zara): la sua fierezza è guadagnata. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: leonessa asciutta, larga di spalle — costruita dal cantiere, non dalla caccia
  - manto: sabbia operosa (#c2a068), gomiti e garretti scuriti dal lavoro; niente criniera: la solennità sta nel collo dritto e nel mento parallelo a terra
  - IL SEGNO: una cicatrice PULITA che taglia il sopracciglio destro (il cantiere, non la guerra) + i polpastrelli anteriori scuriti di calce — le zampe di chi firma col lavoro
  - occhi: ambra seria (#b98a3a), palpebra franca — guarda negli occhi e aspetta che tu regga
  - posa-firma: la zampa sulla spalla, data di peso, davanti a tutti — il suo sigillo
  - ancore colore: #c2a068 · #b98a3a
- **reference (registro)**: leonessa, lo stemma del regno; i segni del servizio e non dell'ornamento — una cicatrice presa sulle mura, le zampe consumate dal lavoro fatto per il comune; sta dritta come chi ha già dato
- **viste**: proposta `char_leonessa_civica_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_leonessa_civica/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_leonessa_civica_ritratto_v2.png (rigenerare solo su richiesta)

### la Lupa — `char_lupa`
- **soggetto**: lupa (lo stemma di Pietralupa)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/la-lupa.md`
- **aspetto canonico**:
  - firma visiva: il labbro arricciato in un mezzo ghigno permanente; magra, di un orgoglio scarno (Pietralupa che perse e non si piegò); l'occhio storto verso la direzione di Leonalba, rancore di vecchia data. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: lupa magra, canna asciutta — le costole si LEGGONO: orgoglio scarno, non fame
  - mantello: grigio-terra (#7d7268) con sella scura; pelo corto di crete, non folto di montagna
  - IL SEGNO: il labbro superiore SINISTRO arricciato fisso in un mezzo ghigno (vecchia ferita di rovo) + l'occhio sinistro un filo storto verso fuori — verso Leonalba, dicono nelle sue città
  - occhi: gialli asciutti, ridenti senza allegria
  - posa-firma: coda bassa MA mai fra le zampe — la sconfitta portata come una divisa, non come una resa; la spiga amara masticata di lato
  - ancore colore: #7d7268 · #4d463f
- **reference (registro)**: lupa, lo stemma di Pietralupa; magra, di un orgoglio scarno; il labbro arricciato in un mezzo ghigno permanente; l'occhio storto verso Leonalba — rancore di vecchia data
- **viste**: proposta `char_lupa_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_lupa/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_lupa_ritratto_v5.png (rigenerare solo su richiesta)

### la Pantera — `char_pantera`
- **soggetto**: pantera (lo stemma di Muralba — la città di seta)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/la-pantera.md`
- **aspetto canonico**:
  - firma visiva: liscia, immacolata, composta; il muso non rivela nulla; si muove senza rumore, «di seta». L'inclinazione misurata del capo che non concede una sola lettura. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: pantera piena, spalle basse, linea continua — un'onda ferma
  - manto: NERO assoluto (#141210) con le rosette fantasma (#1d1a16) visibili SOLO in luce radente — nelle tavole: un accenno, mai un pattern
  - IL SEGNO (in negativo): NESSUN segno — ed è il suo segno: manto immacolato, simmetria perfetta, zero cicatrici (chi non combatte non si segna); fra i personaggi è l'unica senza storia scritta addosso
  - occhi: giallo-seta (#d8c46a), palpebra a metà; il muso non rivela nulla — l'inclinazione del capo di CINQUE gradi quando osserva è tutta la sua espressività
  - posa-firma: appare già seduta, se ne va senza che si veda il primo passo
  - ancore colore: #141210 · #d8c46a
- **reference (registro)**: pantera, lo stemma della città di seta; liscia, immacolata, composta; il muso non rivela nulla; si muove senza rumore; l'inclinazione misurata del capo che non concede una sola lettura
- **viste**: proposta `char_pantera_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_pantera/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_pantera_ritratto_v5.png (rigenerare solo su richiesta)

### la Traghettatrice delle rive — `char_traghettatrice`
- **soggetto**: lontra (gente d'acqua e di barca) — adattabile al roster
- **scheda (fonte vincolante)**: `saga/bible/comprimari/traghettatrice-delle-rive.md`
- **aspetto canonico**:
  - firma visiva: le zampe svelte ai nodi (annoda reti senza guardare) e il pelo sempre umido; una vecchia cicatrice da amo sul muso. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: lontra adulta, corpo a fuso; in acqua sta come altri stanno in piedi
  - pelo: bruno scuro bagnato-lucido (#4a382a), gola e petto crema (#d9c9a6)
  - IL SEGNO: le vibrisse più lunghe del normale, piegate TUTTE verso destra (il lato del remo) + le palmature anteriori segnate da anni di corda — righe chiare sul palmo
  - occhi: castani ridenti, con la ruga fissa di chi guarda controluce sull'acqua
  - posa-firma: le zampe SEMPRE in opera — un capo di corda, un nodo, un remo: parla annodando; il nodo da rete accanto al nodo del Cordone è il suo gesto d'accoglienza
  - ancore colore: #4a382a · #d9c9a6
- **reference (registro)**: lontra; zampe svelte ai nodi (annoda reti senza guardare), pelo sempre umido, una vecchia cicatrice da amo sul muso
- **viste**: proposta `char_traghettatrice_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_traghettatrice/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_traghettatrice_ritratto_v5.png (rigenerare solo su richiesta)

### la Voce che torna — `char_voce_che_torna`
- **soggetto**: cicala — omaggio al Grillo; ancora autoriale: le cicale del Fedro di Platone (i cantori che attraversano il tempo). Mai in-storia. — alternativa: grillo (omaggio diretto).
- **scheda (fonte vincolante)**: `saga/bible/comprimari/voce-che-torna.md`
- **aspetto canonico**:
  - firma visiva: piccola; la si sente prima di vederla. Ali come vetro vecchio, un filo incrinato. La si trova sempre sulle pietre tiepide, e canta quando una cicala non dovrebbe (al freddo, di notte). Riconoscibile dal canto — una cadenza sua — più che dall'aspetto: e sembra sempre la stessa, in ogni regno. #### Morfologia di reference (vincolante per il ritrattista)
  - resa vincolante: si SENTE più che vedersi — nelle tavole è prima di tutto una vibrazione dell'aria calda (onde di calore sopra la pietra), non un primo piano
  - quando si vede: una cicala grande, ambra-verde (#8a8a4a), ali a vetrata con venature scure (#4a4a32), posata di tre quarti
  - IL SEGNO: sta SEMPRE sulla pietra più antica dell'inquadratura — è così che la si trova: si cerca la pietra, non la cicala
  - il canto: reso col paesaggio (l'aria che trema, le altre creature in ascolto), mai con note disegnate
  - a ep24: il battito di silenzio — la tavola lo rende con la cicala ferma e TUTTI gli occhi del quadro rivolti a lei
  - ancore colore: #8a8a4a · #4a4a32
- **reference (registro)**: cicala; piccola, la si sente prima di vederla; ali come vetro vecchio, un filo incrinato; la si trova sempre sulle pietre tiepide
- **viste**: proposta `char_voce_che_torna_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_voce_che_torna/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_voce_che_torna_ritratto_v5.png (rigenerare solo su richiesta)

### la memoria sepolta — `char_memoria_sepolta`
- **soggetto**: elefantessa (vecchia, del Popolo dell'Aperto — i grandi della pianura)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/la-memoria-sepolta.md`
- **aspetto canonico**:
  - firma visiva: si ferma sul selciato dove gli altri passano e basta, e vi appoggia una zampa (o la proboscide) come chi ascolta qualcosa sotto. Cammina una strada che nessun giovane capisce, fino a quel punto della piazza, e lì resta. La gravità lenta della matriarca. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: elefantessa anziana, monumentale — nelle tavole occupa il quadro come un edificio
  - pelle: grigio-selciato (#7c7873) con crepe chiare come commessure di pietra; orecchie con gli orli mangiati dal tempo
  - IL SEGNO: la zanna sinistra SPEZZATA a metà e LEVIGATA — l'ha consumata lei, sfregando i selciati per sentire cosa c'è sotto; l'altra è intera ma opaca
  - occhi: piccoli nell'enormità, castano fondo, con la palpebra lenta di chi ricorda a fatica e apposta
  - posa-firma: la zampa anteriore destra che si posa PIATTA, sempre per prima — ascolta col peso; il gesto di far posare la zampa a un altro è la sua massima confidenza
  - ancore colore: #7c7873 · #cfc8ba (zanne)
- **reference (registro)**: elefantessa vecchia del Popolo dell'Aperto; si ferma sul selciato dove gli altri passano e vi appoggia la zampa come chi ascolta qualcosa sotto
- **viste**: proposta `char_memoria_sepolta_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_memoria_sepolta/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_memoria_sepolta_ritratto_v5.png (rigenerare solo su richiesta)

### le Creature della Rovina — `char_creature_rovina`
- **soggetto**: piccole creature notturne della rovina (un coro: pipistrelli, civette, grilli — il bosco-
- **scheda (fonte vincolante)**: `saga/bible/comprimari/le-creature-della-rovina.md`
- **aspetto canonico**:
  - firma visiva: occhi nel buio, sagome che non si mettono a fuoco; appaiono fra le pietre rotte solo di notte; scala infantile, movimento storto. Reali — ma la rovina le fa sbagliate. #### Morfologia di reference (vincolante per il ritrattista)
  - resa vincolante: MAI a fuoco pieno — sagome a scala infantile (pipistrelli, civette piccole, grilli, rospetti) rese come occhi e profili nel buio
  - palette: fondo #12141a, occhi #e8d9a0 — punti caldi nel freddo; i corpi si suggeriscono, non si disegnano
  - IL SEGNO: si dispongono sempre in ARCO attorno a ciò che guardano, mai in fila — un piccolo anfiteatro di occhi fra le pietre rotte
  - movimento: un mezzo tempo «storto» — reali, ma la rovina li fa sbagliati; nelle tavole: pose leggermente fuori asse, mai grottesche
  - quando cantano (ep20): le bocche non si vedono — la filastrocca è resa dalle pose in ascolto delle altre creature
  - ancore colore: #12141a · #e8d9a0
- **reference (registro)**: coro di piccole creature notturne della rovina (pipistrelli, civette, grilli); occhi nel buio, sagome che non si mettono a fuoco; scala infantile, movimento storto; appaiono fra le pietre rotte, solo di notte
- **viste**: proposta `char_creature_rovina_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_creature_rovina/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_creature_rovina_ritratto_v5.png (rigenerare solo su richiesta)

### quello che è rimasto — `char_quello_che_e_rimasto`
- **soggetto**: bufalo (del Popolo dell'Aperto, come Rocco)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/quello-che-e-rimasto.md`
- **aspetto canonico**:
  - firma visiva: il collo basso — la testa portata bassa per abitudine, non per stanchezza: la postura di chi ha imparato a non alzarla. Forte come Rocco, ma piegato. Quando per un attimo la solleva, si vede quanto gli costa. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: bufalo massiccio, ma svuotato — la struttura c'è, la carne è stanca
  - mantello: nero-terra opaco (#2e2a26), polveroso; corna larghe a mezzaluna, basse
  - IL SEGNO: la SELLA di pelo consumato sul garrese — la geografia di stagioni di giogo del tributo — + una corna con la punta SEGATA di netto (il tributo si prende anche così)
  - occhi: grandi, pesanti, con l'orlo rosso di polvere; guarda sempre a metà distanza, mai in faccia, tranne UNA volta (ep09)
  - posa-firma: il passo della colonna anche da solo — testa bassa, ritmo di giogo
  - ancore colore: #2e2a26 · #6a5a48
- **reference (registro)**: bufalo del Popolo dell'Aperto; il collo basso — la testa portata bassa per abitudine, non stanchezza: la postura di chi ha imparato a non alzarla; forte come Rocco, ma piegato
- **viste**: proposta `char_quello_che_e_rimasto_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_quello_che_e_rimasto/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_quello_che_e_rimasto_ritratto_v5.png (rigenerare solo su richiesta)

### uno degli Antichi — `char_uno_degli_antichi`
- **soggetto**: rospo (creatura di pietra, antichissima, immobile sull'Altare)
- **scheda (fonte vincolante)**: `saga/bible/comprimari/uno-degli-antichi.md`
- **aspetto canonico**:
  - firma visiva: immobilità di pietra — la pelle vecchia come il masso su cui sta, quasi ne fa parte. Gli occhi guardano attraverso di te, a qualcosa dietro. Sembra ascoltare la roccia più che chi gli parla. #### Morfologia di reference (vincolante per il ritrattista)
  - taglia: rospo ENORME per un rospo — quanto una pietra di soglia; e come una pietra sta
  - pelle: come roccia muschiata (#5a5f4a) con chiazze verdi (#7a8062); verruche larghe, opache — la pelle di chi non si muove da ere
  - IL SEGNO: sulla schiena cresce MUSCHIO VERO — l'immobilità fatta prova; palpebre che salgono dal BASSO verso l'alto, lente come maree
  - occhi: oro antico velato, pupilla orizzontale; guardano da prima che tu arrivassi
  - posa-firma: la zampa a tre dita APERTE che tocca la pietra — il gesto del «Visto.»
  - ancore colore: #5a5f4a · #7a8062 · #b99f4e (occhi)
- **reference (registro)**: rospo antichissimo; immobilità di pietra — la pelle vecchia come il masso su cui sta, quasi ne fa parte; gli occhi guardano attraverso, a qualcosa dietro
- **viste**: proposta `char_uno_degli_antichi_ritratto` → HD dopo conferma: `fronte`·`tre_quarti`·`profilo`·`segno` → `public/reference/char_uno_degli_antichi/`
- **status**: confermata · **già in catalogo**: saga/reference/personaggi/char_uno_degli_antichi_ritratto_v5.png (rigenerare solo su richiesta)

## 2 · Luoghi Antichi

### i massi coppellati — `luogo_le_coppelle`
- **key-art (registro)**: massi coppellati dei monti del lago (Spondalta/Muro del Nord): coppelle scavate nella roccia da mani che non erano zampe; pietra tiepida quando intorno è freddo
- **viste da generare**: `luogo_le_coppelle_campo` · `luogo_le_coppelle_materia` → `public/reference/luogo_le_coppelle/`
- **status**: confermata

### il Luogo sepolto di Anguicorte — `luogo_anguicorte_sepolto`
- **key-art (registro)**: il Luogo Antico del Gran Ducato: pietre tagliate e murate nel selciato della capitale, segni spezzati riusati al contrario; in una crepa, tiepido
- **viste da generare**: `luogo_anguicorte_sepolto_campo` · `luogo_anguicorte_sepolto_materia` → `public/reference/luogo_anguicorte_sepolto/`
- **status**: confermata

### l'Altare di Roccia — `luogo_altare_roccia`
- **key-art (registro)**: il masso-altare della Selva di Mezzo: pietra nuda nel folto, i segni sul piano superiore, il muschio che si ferma a un palmo dal bordo
- **viste da generare**: `luogo_altare_roccia_campo` · `luogo_altare_roccia_materia` → `public/reference/luogo_altare_roccia/`
- **status**: confermata

### la collina dell'incontro — `luogo_collina_incontro`
- **key-art (registro)**: la soglia (B1, Spondalta) tra i Laghi del Vespro e il Gran Ducato: dove savana e foresta si toccano su una collina non alta ma ripida
- **viste da generare**: `luogo_collina_incontro_campo` · `luogo_collina_incontro_materia` → `public/reference/luogo_collina_incontro/`
- **status**: confermata

### le Pietre Incise — `luogo_pietre_incise`
- **key-art (registro)**: le rocce incise d'altura della Conca Ruggente: figure antiche su lastre inclinate verso il cielo, i segni che somigliano a quelli delle Coppelle
- **viste da generare**: `luogo_pietre_incise_campo` · `luogo_pietre_incise_materia` → `public/reference/luogo_pietre_incise/`
- **status**: confermata

### le Pietre del Leone — `luogo_pietre_leone`
- **key-art (registro)**: l'acropoli dei primi nelle Terre del Leone: le lastre più antiche di tutte, di nessuna città, dove il disegno si compone
- **viste da generare**: `luogo_pietre_leone_campo` · `luogo_pietre_leone_materia` → `public/reference/luogo_pietre_leone/`
- **status**: confermata

### le Rovine Ordinate — `luogo_rovine_ordinate`
- **key-art (registro)**: le rovine della Piana dei Savi: filari di pietre antiche allineate come i campi, un ordine che non è quello dei registri
- **viste da generare**: `luogo_rovine_ordinate_campo` · `luogo_rovine_ordinate_materia` → `public/reference/luogo_rovine_ordinate/`
- **status**: confermata

## 3 · Capitali e scene madri

### Anguicorte — `anguicorte`
- **key-art (registro)**: capitale del Gran Ducato, la corte della Serpe: palazzo basso e lungo sopra il selciato del mercato vecchio; le colonne del tributo, soglie di pietra antica murata a testa in giù; bronzo vecchio, porpora spenta, ombre lunghe — e una crepa nel selciato larga quanto la punta di un corno
- **viste da generare**: `anguicorte_campo` · `anguicorte_materia` → `public/reference/anguicorte/`
- **status**: confermata

### Forterocca — `forterocca`
- **key-art (registro)**: capitale della Conca Ruggente: città-fortezza di pietra chiara a gradoni sulle conche d'acqua; argini, il molo delle conche, torri campanarie; l'acqua che rimbomba sotto — operosa e verticale contro il Muro del Nord
- **viste da generare**: `forterocca_campo` · `forterocca_materia` → `public/reference/forterocca/`
- **status**: confermata

### Leonalba — `leonalba`
- **key-art (registro)**: capitale delle Terre del Leone: acropoli di pietra dorata sopra il mare, in luce d'alba; la piazza delle gare coi vessilli delle contrade, scalinate — e il sentiero che sale alle Pietre
- **viste da generare**: `leonalba_campo` · `leonalba_materia` → `public/reference/leonalba/`
- **status**: confermata

### Rivalba — `rivalba`
- **key-art (registro)**: capitale dei Laghi del Vespro: città di riva in legno e pietra levigata — passerelle su palafitte, barche a remo, i massi lisci dove il regno si mostra; luce di vespro dorata sull'acqua, brume basse al mattino
- **viste da generare**: `rivalba_campo` · `rivalba_materia` → `public/reference/rivalba/`
- **status**: confermata

### Savenza — `savenza`
- **key-art (registro)**: capitale della Piana dei Savi: città ordinata degli argini — canali dritti, l'aula grande, archivi a torre, nebbia bassa; carta, inchiostro, lanterne; gufi e civette ai cornicioni
- **viste da generare**: `savenza_campo` · `savenza_materia` → `public/reference/savenza/`
- **status**: confermata

### il guado del Gran Fiume — `gran_fiume_guado`
- **key-art (registro)**: il Gran Fiume in piena: acqua larga come un mondo, marrone e argento; passi di pietra a pelo d'acqua, cielo enorme, nessun riparo
- **viste da generare**: `gran_fiume_guado_campo` · `gran_fiume_guado_materia` → `public/reference/gran_fiume_guado/`
- **status**: confermata

### il valico del Mastino — `valico_mastino`
- **key-art (registro)**: il budello di roccia e terra battuta tra due pareti — il campo del duello; nella ripresa a sud, verso la Selva: neve sporca, rovi, e il collare strappato
- **viste da generare**: `valico_mastino_campo` · `valico_mastino_materia` → `public/reference/valico_mastino/`
- **status**: confermata

### la Soglia di Spondalta — `spondalta_soglia`
- **key-art (registro)**: il confine nord dove tutto comincia: canneto e rive, nebbie basse, acqua ferma in luce fredda — e la pietra tiepida della prima notte
- **viste da generare**: `spondalta_soglia_campo` · `spondalta_soglia_materia` → `public/reference/spondalta_soglia/`
- **status**: confermata

### le conche alte — `le_conche`
- **key-art (registro)**: le conche alte di Forterocca: vasche d'acqua a gradoni tenute da argini e pietre-chiave; calce bagnata, corde, impalcature — e inciso nell'argine, «il dente del forestiero»
- **viste da generare**: `le_conche_campo` · `le_conche_materia` → `public/reference/le_conche/`
- **status**: confermata


> ⚠ senza scheda abbinata (verificare mapping): char_riccio_capocorda
