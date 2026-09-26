// cartoni/episodi/ep03/partitura.ts — la musica di «ep03 — Lo specchio».
//
// Musica scritta come dati (la suona cartoni/audio/partitura.ts), coi temi
// della serie (cartoni/audio/temi.ts):
//  - Cervara: il tema di Zara capovolto e lento il doppio — lo specchio; arriva
//    con lei sul masso più alto (p.1), torna quando scende a salutare (p.3) e
//    quando parla dei ciuffi (p.10);
//  - Zara: il suo tema di sempre (ep01), svelto e a scatti — finché, sui Massi di
//    notte (p.15), lo si sente lento: ha imparato il passo;
//  - il lago (ep02) all'apertura e sotto la luna; il riflesso (ep02) la sera, sulla
//    passerella; Brénta (ep02), appena, sulla barca ormeggiata; i passi di Rocco e
//    l'amicizia (ep01) quando Rocco si mette accanto a Zara;
//  - il finale: i due temi insieme, uno per parte (il controcanto) — i due
//    riflessi che l'acqua tiene insieme.
// Silenzi voluti: la traversata di Cervara (p.6: «non si sentì niente») è solo un
// velo d'accordo; «Tu almeno vai da qualche parte» (p.14) cade nel silenzio.
// Tonalità di casa: Re maggiore.

import { type Nota, type Sezione, suona } from "../../audio/partitura";
import { AMICIZIA, APERTO, BRENTA, CERVARA, LAGO, PASSI_ROCCO, RIFLESSO, ZARA } from "../../audio/temi";

/** Il tema di Zara lento il doppio: quel che ha imparato sui Massi (p.15), e il finale. */
const ZARA_LENTA: Nota[] = ZARA.map(([b, d, m]) => [b * 2, d * 2, m]);

const SEZIONI: Sezione[] = [
  // Rivalba sull'acqua, i Massi: il lago
  { da: "s01", a: "s02", bpm: 66, accordi: ["D", "G", "D", "A"], bpa: 6, arpa: "salita", melodia: LAGO, attacco: 10, vel: 0.8 },
  // la lince giovane sul masso più alto: il suo tema, la prima volta
  { da: "s03", a: "s03", bpm: 62, accordi: ["Dmaj9", "G", "Bm", "A"], bpa: 4, arpa: "rado", melodia: CERVARA.slice(0, 8), attacco: 1, vel: 0.7 },
  // Rocco trova da rendersi utile; a una piccola, niente
  { da: "s04", a: "s04", bpm: 80, accordi: ["G", "D", "A", "D"], bpa: 4, basso: PASSI_ROCCO, melodia: ZARA.slice(0, 8), attacco: 9, vel: 0.6 },
  // scende a salutarli: «qui si fa così», il vanto delle rive, i ciuffi
  { da: "s05", a: "s07", bpm: 64, accordi: ["D", "Bm", "G", "A"], bpa: 4, arpa: "salita", melodia: CERVARA, attacco: 2, vel: 0.7 },
  // la barca ormeggiata: il telo, il «tec» (Brénta, appena)
  { da: "s08", a: "s08", bpm: 72, accordi: ["Bm", "Em", "Bsus", "Bm"], bpa: 4, arpa: "rado", melodia: BRENTA.slice(0, 6), attacco: 5, vel: 0.5 },
  // Cervara fa strada; Zara mette in fila
  { da: "s09", a: "s09", bpm: 88, accordi: ["D", "A", "Bm", "G"], bpa: 4, arpa: "staccato", melodia: CERVARA.slice(0, 12), attacco: 2, vel: 0.6 },
  { da: "s10", a: "s10", bpm: 80, accordi: ["Bm", "G", "D", "A"], bpa: 4, arpa: "rado", melodia: ZARA.slice(0, 12), attacco: 1, vel: 0.55 },
  // il pomeriggio sui Massi: la prova; Zara scatta
  { da: "s11", a: "s12", bpm: 104, accordi: ["D5", "D5", "A", "D5"], bpa: 4, arpa: "staccato", vel: 0.55 },
  // Cervara passa come la sera: un velo d'accordo e basta
  { da: "s13", a: "s13", bpm: 50, accordi: ["Dmaj9"], bpa: 8, vel: 0.35 },
  // il camoscio: il mondo che si apre; Rocco, piano
  { da: "s14", a: "s14", bpm: 72, accordi: ["D", "G", "D", "A"], bpa: 4, arpa: "salita", melodia: APERTO, attacco: 2, vel: 0.65 },
  { da: "s15", a: "s15", bpm: 60, accordi: ["G", "D", "Em", "A"], bpa: 4, basso: "radici", vel: 0.5, ritardo: 0.6 },
  // la sera sulla passerella: il riflesso; poi Rocco accanto (l'amicizia)
  { da: "s16", a: "s17", bpm: 58, accordi: ["Dmaj9", "G", "Dmaj9", "Bsus"], bpa: 6, arpa: "salita", melodia: RIFLESSO, attacco: 2, vel: 0.6 },
  { da: "s18", a: "s18", bpm: 64, accordi: ["G", "D", "A", "D"], bpa: 4, arpa: "rado", basso: PASSI_ROCCO, melodia: AMICIZIA.slice(0, 8), attacco: 7, vel: 0.65 },
  // il giorno dopo, sul masso del Consiglio: le domande
  { da: "s19", a: "s20", bpm: 66, accordi: ["D", "Bm", "Bsus", "Bm"], bpa: 4, arpa: "rado", vel: 0.5 },
  // «È come i ciuffi»: il suo tema, piano; Zara la riconosce
  { da: "s21", a: "s22", bpm: 62, accordi: ["G", "D", "Bm", "A"], bpa: 4, arpa: "rado", melodia: CERVARA.slice(8), attacco: 1, vel: 0.55 },
  // la notte: la tana, la luna vera due volte (il lago, piano)
  { da: "s23", a: "s24", bpm: 56, accordi: ["Bm", "G", "D", "A"], bpa: 6, arpa: "rado", melodia: LAGO.slice(0, 10), attacco: 12, vel: 0.5 },
  // tec, tec; e qualcuno che russa (niente musica: il legno parla)
  // le Coppelle: le pietre vecchie, piene di luna
  { da: "s26", a: "s30", bpm: 52, accordi: ["D5", "Bm", "D5", "Em", "D5", "Bm", "A", "D5"], bpa: 6, arpa: "rado", vel: 0.5 },
  // s31: «Tu almeno vai da qualche parte» — silenzio
  // la fila si rovescia: il tema di Cervara, caldo, in maggiore
  { da: "s32", a: "s32", bpm: 58, accordi: ["G", "D", "A", "D", "G", "Bm", "A", "D"], bpa: 4, arpa: "salita", melodia: CERVARA, attacco: 4, vel: 0.6, ritardo: 1.4 },
  // la lezione: prima tu, poi la zampa
  { da: "s33", a: "s35", bpm: 60, accordi: ["D", "G", "D", "A"], bpa: 4, arpa: "rado", vel: 0.45 },
  // sui Massi, di notte, una tigre come la sera: il tema di Zara, lento
  { da: "s36", a: "s36", bpm: 66, accordi: ["D", "Bm", "G", "A"], bpa: 4, arpa: "salita", melodia: ZARA_LENTA, attacco: 1, vel: 0.6 },
  // l'alba sulla discesa: il gesto, e la cosa sotto il gesto; gli specchi
  { da: "s37", a: "s38", bpm: 64, accordi: ["D", "G", "Em", "A", "D", "G", "A", "D"], bpa: 4, arpa: "salita", melodia: APERTO, attacco: 8, vel: 0.6 },
  // i due riflessi che l'acqua tiene insieme: i due temi, uno per parte
  { da: "s39", a: "s42", bpm: 60, accordi: ["D", "G", "Bm", "A", "D", "G", "A", "D"], bpa: 4, arpa: "salita", melodia: ZARA_LENTA, attacco: 2, controcanto: CERVARA, attaccoControcanto: 3, vel: 0.7 },
];

/** Tutta la musica dell'episodio: le sezioni, suonate dal suonatore del motore. */
export const musicaEp03 = suona(SEZIONI);

export default musicaEp03;
