// cartoni/episodi/ep01/partitura.ts — la musica di «ep01 — Due mondi».
//
// Musica scritta come dati (la suona cartoni/audio/partitura.ts): sezioni
// agganciate alle inquadrature (così se il montaggio cambia, la musica lo
// segue), progressioni di accordi, e tre temi della serie (cartoni/audio/temi.ts):
//  - il tema di Zara: veloce, pentatonico, a scatti (corre, «faceva tutto di corsa»);
//  - i passi di Rocco: un basso lento e pesante, gentile;
//  - il tema dell'amicizia: caldo, discendente, che torna nel finale.
// Tonalità di casa: Re maggiore; il temporale in re minore; il riparo di nuovo in Re.

import { type Nota, type Sezione, suona } from "../../audio/partitura";
import { AMICIZIA, APERTO, PASSI_ROCCO, ZARA } from "../../audio/temi";

const SPIA: Nota[] = [[0, 0.5, 76], [0.5, 0.5, 75], [1, 0.5, 76], [2, 0.5, 79], [2.5, 0.5, 78], [3, 0.5, 76], [4, 0.5, 71], [4.5, 0.5, 72], [5, 0.5, 71], [6, 1, 76]];
const RIPARO: Nota[] = [[0, 4, 69], [4, 2, 71], [6, 2, 69], [8, 6, 66]];

const SEZIONI: Sezione[] = [
  { da: "s01", a: "s01", bpm: 80, accordi: ["D", "G", "D", "A"], bpa: 4, arpa: "salita", vel: 0.8 },
  { da: "s02", a: "s03", bpm: 104, accordi: ["D", "G", "Bm", "A"], bpa: 4, arpa: "salita", melodia: ZARA, attacco: 2, basso: "radici" },
  { da: "s04", a: "s05", bpm: 72, accordi: ["G", "D", "Em", "A", "D"], bpa: 4, arpa: "rado", melodia: APERTO, attacco: 6, vel: 0.85 },
  { da: "s06", a: "s07", bpm: 60, accordi: ["D5", "D5", "Bm", "D5"], bpa: 6, arpa: "rado", vel: 0.85 },
  { da: "s08", a: "s09", bpm: 72, accordi: ["Bm", "G", "D", "A"], bpa: 4, basso: PASSI_ROCCO, vel: 0.8 },
  { da: "s10", a: "s10", bpm: 126, accordi: ["Em", "Em", "A", "A"], bpa: 4, arpa: "staccato", melodia: SPIA, attacco: 4, vel: 0.7 },
  { da: "s11", a: "s11", bpm: 76, accordi: ["Bsus", "Bm", "G", "Bsus"], bpa: 4, timpani: "cuore", vel: 0.75 },
  // s12: il CRACK — la musica tace (è la battuta comica)
  { da: "s13", a: "s14", bpm: 72, accordi: ["Dmaj9", "G", "D", "A", "D"], bpa: 4, arpa: "rado", melodia: AMICIZIA.slice(0, 8), attacco: 20, vel: 0.8, ritardo: 1.2 },
  { da: "s15", a: "s15", bpm: 92, accordi: ["D", "Bm", "G", "A"], bpa: 4, arpa: "rado", melodia: AMICIZIA.slice(0, 14), attacco: 1, basso: PASSI_ROCCO },
  { da: "s16", a: "s17", bpm: 66, accordi: ["Dm", "Bb", "Gm", "A"], bpa: 4, timpani: "rulli", vel: 0.75 },
  { da: "s18", a: "s18", bpm: 60, accordi: ["Dm", "Bb", "A"], bpa: 4, timpani: "rulli", vel: 0.6 },
  { da: "s19", a: "s19", bpm: 60, accordi: ["D", "G", "D"], bpa: 4, melodia: RIPARO, attacco: 1, vel: 0.85, ritardo: 1.2 },
  { da: "s20", a: "s20", bpm: 62, accordi: ["D", "G", "D", "A"], bpa: 4, arpa: "salita", melodia: APERTO.slice(0, 5), attacco: 3, vel: 0.85 },
  { da: "s21", a: "s21", bpm: 100, accordi: ["Em", "A", "Em", "A"], bpa: 4, arpa: "staccato", melodia: SPIA, attacco: 8, vel: 0.7 },
  { da: "s22", a: "s24", bpm: 70, accordi: ["G", "D", "Bm", "A", "G", "A", "D"], bpa: 4, arpa: "rado", melodia: AMICIZIA.slice(14), attacco: 14, vel: 0.9 },
  { da: "s25", a: "s26", bpm: 76, accordi: ["D", "Bm", "G", "A", "D", "G", "A", "D"], bpa: 4, arpa: "salita", melodia: AMICIZIA, attacco: 2, basso: "radici", vel: 0.9 },
];

/** Tutta la musica dell'episodio: le sezioni, suonate dal suonatore del motore. */
export const musicaEp01 = suona(SEZIONI);

export default musicaEp01;
