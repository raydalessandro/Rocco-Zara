// cartoni/episodi/ep02/partitura.ts — la musica di «ep02 — Il regno senza riflesso».
//
// Musica scritta come dati (la suona cartoni/audio/partitura.ts), coi temi
// della serie (cartoni/audio/temi.ts):
//  - il Lago del Vespro: una barcarola in sei, che torna nella traversata;
//  - il riflesso (p.7): il tema del lago capovolto — l'acqua non ha ancora deciso;
//  - Brénta: svelto, due note ribattute in testa (tòc tòc);
//  - la corda di Toraki: tenera, quando la corda esce dall'involto e riceve il nodo;
//  - di ep01 tornano Zara (tra le linci), i passi di Rocco (la trattativa per
//    salire in barca) e l'amicizia (la barca che dice di sì anche a loro, il finale).
// Due silenzi voluti: la ninna-nanna (pp. 3, s06–s07) è la musica — un brano
// cantato (cartoni/brani/) — e a metà del lago (p.10, s21) il silenzio «salì
// dall'acqua tutto insieme»: lì la musica tace.
// Tonalità di casa: Re maggiore.

import { type Sezione, suona } from "../../audio/partitura";
import { AMICIZIA, APERTO, BRENTA, CORDA, LAGO, PASSI_ROCCO, RIFLESSO, ZARA } from "../../audio/temi";

const SEZIONI: Sezione[] = [
  // l'alba, la folaga, il bosco che si apre: il lago dall'alto
  { da: "s01", a: "s02", bpm: 66, accordi: ["D", "G", "D", "A"], bpa: 6, arpa: "salita", melodia: LAGO, attacco: 12, vel: 0.8 },
  // le passerelle, le linci dappertutto, il cenno
  { da: "s03", a: "s04", bpm: 92, accordi: ["Bm", "G", "D", "A"], bpa: 4, arpa: "staccato", melodia: ZARA, attacco: 4, vel: 0.7 },
  // la tana di canne, la notte che scende (poi tace: canta la ninna-nanna)
  { da: "s05", a: "s05", bpm: 56, accordi: ["D5", "Bm", "D5"], bpa: 6, arpa: "rado", vel: 0.6 },
  // s06–s07: la ninna-nanna (brano) — niente musica
  // il Custode sul masso: lento, grave
  { da: "s08", a: "s09", bpm: 50, accordi: ["Em", "Bm", "G", "D5"], bpa: 4, arpa: "rado", basso: "radici", vel: 0.65, ritardo: 0.6 },
  // Brénta al molo basso
  { da: "s10", a: "s11", bpm: 104, accordi: ["D", "A", "Bm", "G"], bpa: 4, arpa: "staccato", melodia: BRENTA, attacco: 4, vel: 0.7 },
  // la lince piccola; si tenne dritta
  { da: "s12", a: "s13", bpm: 72, accordi: ["Bm", "G", "D", "A"], bpa: 4, arpa: "rado", melodia: APERTO.slice(0, 5), attacco: 4, vel: 0.65 },
  // il riflesso: il lago capovolto
  { da: "s14", a: "s15", bpm: 60, accordi: ["Dmaj9", "G", "Dmaj9", "Bsus"], bpa: 6, arpa: "salita", melodia: RIFLESSO, attacco: 6, vel: 0.6, ritardo: 0.8 },
  // salire: un salto, una trattativa (i passi di Rocco)
  { da: "s16", a: "s17", bpm: 84, accordi: ["G", "D", "A", "D"], bpa: 4, basso: PASSI_ROCCO, vel: 0.7 },
  // la traversata: la barcarola del lago, il martin pescatore, le chiacchiere di Brénta
  { da: "s18", a: "s20", bpm: 66, accordi: ["D", "Bm", "G", "A"], bpa: 6, arpa: "salita", melodia: LAGO, attacco: 6, basso: "radici", vel: 0.75 },
  // s21: il silenzio salì dall'acqua — niente musica
  // «Cosa portate?»: il cuore
  { da: "s22", a: "s22", bpm: 70, accordi: ["Bsus", "Bm", "G", "Bsus"], bpa: 4, timpani: "cuore", vel: 0.55, ritardo: 0.8 },
  // la corda sul legno, lo sguardo di Brénta, la solitudine che se ne va
  { da: "s23", a: "s25", bpm: 64, accordi: ["D", "G", "Bm", "A"], bpa: 4, arpa: "rado", melodia: CORDA, attacco: 2, vel: 0.75 },
  // il nodo da pescatori accanto a quello di Toraki
  { da: "s26", a: "s29", bpm: 68, accordi: ["G", "D", "Em", "A", "D"], bpa: 4, arpa: "rado", melodia: CORDA.slice(9), attacco: 6, vel: 0.75 },
  // tòc tòc: la barca dice di sì anche a loro
  { da: "s30", a: "s30", bpm: 72, accordi: ["D", "G", "D", "A", "D"], bpa: 4, arpa: "salita", melodia: AMICIZIA.slice(0, 14), attacco: 2, vel: 0.85 },
  // l'approdo: «di là», e il conto al ritorno
  { da: "s31", a: "s32", bpm: 100, accordi: ["D", "A", "Bm", "G"], bpa: 4, arpa: "staccato", melodia: BRENTA, attacco: 8, vel: 0.65 },
  // via lungo la lingua di sassi; i due nodi; la coda
  { da: "s33", a: "s35", bpm: 76, accordi: ["D", "Bm", "G", "A", "D", "G", "A", "D"], bpa: 4, arpa: "salita", melodia: AMICIZIA, attacco: 2, basso: "radici", vel: 0.9 },
];

/** Tutta la musica dell'episodio: le sezioni, suonate dal suonatore del motore. */
export const musicaEp02 = suona(SEZIONI);

export default musicaEp02;
