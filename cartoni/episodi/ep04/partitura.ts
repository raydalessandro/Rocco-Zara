// cartoni/episodi/ep04/partitura.ts — la musica di «ep04 — Il primo nodo».
//
// Musica scritta come dati (la suona cartoni/audio/partitura.ts), coi temi
// della serie (cartoni/audio/temi.ts). La musica di questo episodio FA POSTO al
// coro delle rane: dove cantano loro (p.2, p.18) non suona niente, e quando tacciono
// (p.14: «quando il lago trattiene il fiato») tace anche lei.
//  - la corda (ep02): la sera del rito — si alza e resta sospesa sulla sensibile, e la
//    interrompe il grido; torna, lontana, sul «gesto semplice» (p.9); torna sul nodo
//    (p.18) e resta di nuovo sospesa: la chiudono le rane, e il lago (ep02) risponde —
//    il sì del lago; e il nodino vecchio (p.18) e il saluto del Custode (p.19) ne sono
//    la seconda metà, quella che si posa;
//  - la notte della piena in Re minore (lo stesso Re di casa, al buio): i rulli del
//    temporale, i temi di Zara e di Cervara in minore, i passi di Rocco in minore
//    quando entra nel varco; e quando l'acqua delle tane smette di crescere (p.10),
//    un accordo di Re maggiore, piano: la terza piccarda della notte;
//  - le staffette al passo dei massi (un battito = un sasso, 0,64 s: «peso, zampa»);
//  - il passo di lato di Cervara (p.15): il suo tema caldo, in maggiore (come in ep03,
//    quando la fila si rovescia); poi Zara in testa col suo tema lento (quello che ha
//    imparato sui Massi), e al mattino i due temi insieme: Zara davanti, Cervara seconda;
//  - Brénta (ep02): lenta e in minore quando guarda la barca (p.17), di nuovo sé stessa
//    quando stacca la scaglia dal remo (p.18); l'amicizia (ep01) nella coda.
// Silenzi voluti: il grido e il fischio (p.1), il coro della sera (p.2), la tana che
// cede (p.4), «Reggo io» (p.7), «TIENE!» (p.10), le rane che tacciono (p.14), la
// custodia vuota e il Custode che parla (pp.17-18), le rane che riprendono (p.18), il
// fiato della marmotta (p.19). Tonalità di casa: Re maggiore; la notte, Re minore.

import { type Nota, type Sezione, suona } from "../../audio/partitura";
import { AMICIZIA, APERTO, BRENTA, CERVARA, CORDA, LAGO, PASSI_ROCCO, ZARA } from "../../audio/temi";

/** Una nota del Re maggiore portata in Re minore (armonico): il Fa diesis cala a Fa, il Si a Si bemolle; il Do diesis resta (la sensibile). */
const inMinore = (m: number): number => (m % 12 === 6 || m % 12 === 11 ? m - 1 : m);
const minore = (tema: readonly Nota[]): Nota[] => tema.map(([b, d, m]) => [b, d, inMinore(m)]);
/** Un tema lento il doppio. */
const lento = (tema: readonly Nota[]): Nota[] => tema.map(([b, d, m]) => [b * 2, d * 2, m]);
/** Un pezzo di tema, riportato a cominciare dal battito zero. */
const pezzo = (tema: readonly Nota[], da: number, a?: number): Nota[] => {
  const p = tema.slice(da, a);
  const b0 = p[0]?.[0] ?? 0;
  return p.map(([b, d, m]) => [b - b0, d, m]);
};

/** Il tema di Zara lento il doppio: quel che ha imparato sui Massi (ep03, p.15); qui lo insegna, e poi lo porta in testa. */
const ZARA_LENTA = lento(ZARA);
/** La prima metà della corda: sale piano, e resta sospesa sulla sensibile (il Do diesis). */
const CORDA_SOSPESA = pezzo(CORDA, 0, 5);
/** La seconda metà della corda: quella che si posa. */
const CORDA_POSA = pezzo(CORDA, 9);
/** I passi di Rocco in minore: nel varco. */
const PASSI_NEL_VARCO = PASSI_ROCCO.map(inMinore);

const SEZIONI: Sezione[] = [
  // la sera del rito alle Coppelle: la corda si alza e resta sospesa… (s02: il grido; s03: il fischio)
  { da: "s01", a: "s01", bpm: 72, accordi: ["D", "G", "D", "A"], bpa: 4, arpa: "rado", melodia: CORDA_SOSPESA, attacco: 1, vel: 0.5 },
  // «La piena arrivò prima»: il Re minore, e i primi rulli
  { da: "s04", a: "s04", bpm: 60, accordi: ["Dm", "Bb"], bpa: 4, timpani: "rulli", vel: 0.4, ritardo: 4.2 },
  // s05: il coro di ogni sera — solo le rane
  // la piena: Rivalba dall'alto, il varco, i massi a filo
  { da: "s06", a: "s08", bpm: 84, accordi: ["Dm", "Bb", "Gm", "A"], bpa: 4, arpa: "staccato", timpani: "rulli", vel: 0.45 },
  // Zara dal bordo: le zampe le dicono dentro (il suo tema, in minore, trattenuto)
  { da: "s09", a: "s09", bpm: 70, accordi: ["Dm", "Gm", "Bb", "A"], bpa: 4, arpa: "rado", melodia: minore(ZARA).slice(0, 8), attacco: 2, vel: 0.42 },
  // s10: la tana che cede — niente musica
  // Cervara in testa, piana anche nell'acqua: il suo tema, in minore
  { da: "s11", a: "s12", bpm: 64, accordi: ["Dm", "Bb", "Gm", "A"], bpa: 4, arpa: "rado", melodia: minore(CERVARA).slice(0, 12), attacco: 3, vel: 0.45 },
  // la lince piccola che trema: un velo
  { da: "s13", a: "s13", bpm: 50, accordi: ["Dm"], bpa: 8, vel: 0.3 },
  // «Il peso prima»: il tema lento di Zara, in minore — la lezione passa di zampa in zampa
  { da: "s14", a: "s15", bpm: 66, accordi: ["Dm", "Bb", "Gm", "A"], bpa: 4, arpa: "rado", melodia: minore(ZARA_LENTA), attacco: 1, vel: 0.42 },
  // alle rive basse: la diga che non c'è; Rocco guarda il varco, poi se stesso (s18, «Reggo io»: il silenzio)
  { da: "s16", a: "s17", bpm: 60, accordi: ["Dm", "Bb", "Dm", "A"], bpa: 4, basso: PASSI_NEL_VARCO, timpani: "cuore", vel: 0.45 },
  // il Custode anziano, alla sua velocità: un accordo che cambia piano
  { da: "s19", a: "s20", bpm: 44, accordi: ["Gm", "Dm"], bpa: 8, basso: "radici", vel: 0.32 },
  // «Era un gesto semplice»: la corda, lontana, in maggiore
  { da: "s21", a: "s21", bpm: 72, accordi: ["D", "G", "D", "A"], bpa: 4, arpa: "rado", melodia: CORDA_SOSPESA, attacco: 1, vel: 0.38 },
  // Rocco nel varco: i suoi passi in minore, i rulli, e resta
  { da: "s22", a: "s23", bpm: 72, accordi: ["Dm", "Bb", "Gm", "A"], bpa: 4, arpa: "staccato", basso: PASSI_NEL_VARCO, timpani: "rulli", vel: 0.55 },
  // l'acqua delle tane smette di crescere: Re maggiore, piano (s25, «TIENE!»: il silenzio, e la parola)
  { da: "s24", a: "s24", bpm: 50, accordi: ["Dmaj9"], bpa: 8, vel: 0.4, ritardo: 0.6 },
  // la parola passa; le staffette al passo dei massi: un battito, un sasso — peso, zampa
  { da: "s26", a: "s28", bpm: 94, accordi: ["D", "A", "Bm", "G"], bpa: 4, arpa: "staccato", basso: "radici", melodia: CERVARA, attacco: 8, vel: 0.45 },
  // il punto più alto: l'acqua ci rimane, a pensarci; Rocco non si vede quasi più; la fila rallenta
  { da: "s29", a: "s31", bpm: 50, accordi: ["Bsus", "Bm", "Bsus", "Em"], bpa: 8, vel: 0.32 },
  // s32: le rane tacciono — tace anche la musica
  // il passo di lato: il tema di Cervara, caldo, in maggiore; «Tu lo porti meglio. Vai.»
  { da: "s33", a: "s34", bpm: 58, accordi: ["G", "D", "A", "D"], bpa: 4, arpa: "salita", melodia: CERVARA, attacco: 3, vel: 0.5, ritardo: 1.2 },
  // Zara andò: il suo tema lento, in testa
  { da: "s35", a: "s35", bpm: 66, accordi: ["D", "Bm", "G", "A"], bpa: 4, arpa: "salita", basso: "radici", melodia: ZARA_LENTA, attacco: 1, vel: 0.55 },
  // l'alba grigia e poi meno grigia
  { da: "s36", a: "s36", bpm: 56, accordi: ["D", "G", "Em", "A"], bpa: 4, arpa: "rado", melodia: APERTO, attacco: 2, vel: 0.42 },
  // Rocco diventato riva, che la riva restituisce; «Ho freddo alle ginocchia»
  { da: "s37", a: "s38", bpm: 60, accordi: ["G", "D", "A", "D"], bpa: 4, basso: PASSI_ROCCO, melodia: AMICIZIA.slice(0, 8), attacco: 5, vel: 0.45 },
  // alle Coppelle, alla luce nuova (s40: la custodia vuota — il silenzio)
  { da: "s39", a: "s39", bpm: 66, accordi: ["D", "G"], bpa: 6, arpa: "salita", vel: 0.4 },
  // «Nessuno disse ladro»: Brénta lenta, in Si minore, guarda la barca
  { da: "s41", a: "s42", bpm: 52, accordi: ["Bm", "Em", "G", "Bsus"], bpa: 4, arpa: "rado", melodia: lento(BRENTA).slice(0, 6), attacco: 4, vel: 0.36 },
  // s43: «Il rito non aspetta due volte» — il silenzio
  // Brénta risolve: il suo tema, di nuovo sé stessa (e non finisce)
  { da: "s44", a: "s44", bpm: 76, accordi: ["D", "G", "A", "D"], bpa: 4, arpa: "rado", melodia: BRENTA.slice(0, 12), attacco: 3, vel: 0.42 },
  // il nodo: la corda si alza e resta sospesa… (s46: la chiudono le rane)
  { da: "s45", a: "s45", bpm: 60, accordi: ["D", "G", "Bm", "A"], bpa: 4, arpa: "rado", melodia: CORDA_SOSPESA, attacco: 0, vel: 0.42 },
  // il sì del lago: la barcarola, sopra il coro
  { da: "s47", a: "s47", bpm: 66, accordi: ["D", "G"], bpa: 6, arpa: "salita", melodia: LAGO, attacco: 0, vel: 0.45 },
  // il nodino vecchio: la corda che si posa
  { da: "s48", a: "s48", bpm: 60, accordi: ["D", "Bm", "G", "A"], bpa: 4, arpa: "rado", melodia: CORDA_POSA, attacco: 2, vel: 0.45 },
  // a valle sui massi lucidi: Zara in testa, Cervara seconda — i due temi insieme (s50: solo fiato)
  { da: "s49", a: "s49", bpm: 66, accordi: ["D", "G", "Bm", "A"], bpa: 4, arpa: "salita", melodia: ZARA_LENTA, attacco: 1, controcanto: CERVARA, attaccoControcanto: 5, vel: 0.52 },
  // il Custode saluta uno che è avanti sulla strada
  { da: "s51", a: "s51", bpm: 56, accordi: ["G", "D", "A", "D"], bpa: 4, arpa: "rado", melodia: pezzo(CORDA, 13), attacco: 3, vel: 0.42 },
  // la coda: l'amicizia
  { da: "s52", a: "s52", bpm: 76, accordi: ["D", "G", "A", "D"], bpa: 4, arpa: "salita", melodia: AMICIZIA, attacco: 1, basso: "radici", vel: 0.7 },
];

/** Tutta la musica dell'episodio: le sezioni, suonate dal suonatore del motore. */
export const musicaEp04 = suona(SEZIONI);

export default musicaEp04;
