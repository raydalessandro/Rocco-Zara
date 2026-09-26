// cartoni/audio/temi.ts — i temi della serie: la musica che torna da un episodio all'altro.
//
// Come le voci (cartoni/voce/voce.json), anche i temi sono di tutta la serie:
// chi c'è in più episodi ha il suo tema, e il tema resta quello. Un episodio li
// importa da qui e li mette nelle sue sezioni (episodi/<id>/partitura.ts); i
// temi di una sola scena restano nella partitura del loro episodio.
// Note: [battito, durata in battiti, nota MIDI] (vedi audio/partitura.ts).

import type { Nota } from "./partitura";

/** Zara: veloce, pentatonico, a scatti («faceva tutto di corsa»). Da ep01. */
export const ZARA: Nota[] = [
  [0, 0.5, 69], [0.5, 0.5, 71], [1, 0.5, 74], [1.5, 0.5, 76], [2, 1, 78], [3, 0.5, 76], [3.5, 0.5, 74], [4, 1, 71],
  [5, 1, 74], [6, 0.5, 71], [6.5, 0.5, 69], [7, 1, 71],
  [8, 0.5, 69], [8.5, 0.5, 71], [9, 0.5, 74], [9.5, 0.5, 76], [10, 1, 78], [11, 0.5, 81], [11.5, 0.5, 78],
  [12, 1.5, 76], [13.5, 0.5, 74], [14, 2, 74],
];

/** Il mondo che si apre (una radura, un lago dall'alto): largo, che sale. Da ep01. */
export const APERTO: Nota[] = [[0, 2, 74], [2, 1, 76], [3, 1, 78], [4, 3, 81], [7, 1, 78], [8, 2, 76], [10, 2, 74], [12, 4, 73]];

/** L'amicizia di Rocco e Zara: caldo, discendente; chiude gli episodi. Da ep01. */
export const AMICIZIA: Nota[] = [
  [0, 1, 74], [1, 1, 73], [2, 1, 71], [3, 1, 69], [4, 1, 71], [5, 1, 69], [6, 1, 66], [7, 1, 64],
  [8, 1, 62], [9, 1, 64], [10, 1, 66], [11, 1, 69], [12, 2, 71], [14, 2, 69],
  [16, 1, 74], [17, 1, 73], [18, 1, 71], [19, 1, 69], [20, 1, 71], [21, 1, 73], [22, 2, 74], [24, 4, 74],
];

/** I passi di Rocco: un ostinato nel basso, lento, pesante e gentile (una nota per battito). Da ep01. */
export const PASSI_ROCCO: readonly number[] = [38, 33, 35, 30, 31, 38, 40, 33];

/** Il Lago del Vespro: una barcarola in sei (bpa 6), larga come l'acqua. Da ep02. */
export const LAGO: Nota[] = [
  [0, 1.5, 74], [1.5, 0.5, 76], [2, 1, 78], [3, 2, 81], [5, 1, 78],
  [6, 1.5, 76], [7.5, 0.5, 78], [8, 1, 76], [9, 2, 74], [11, 1, 71],
  [12, 1.5, 69], [13.5, 0.5, 71], [14, 1, 74], [15, 2, 76], [17, 1, 73],
  [18, 5, 74],
];

/**
 * Il riflesso: il tema del lago capovolto (specchio diatonico attorno al Re,
 * grado per grado: quel che saliva scende). Da ep02, p.7.
 */
export const RIFLESSO: Nota[] = [
  [0, 1.5, 74], [1.5, 0.5, 73], [2, 1, 71], [3, 2, 67], [5, 1, 71],
  [6, 1.5, 73], [7.5, 0.5, 71], [8, 1, 73], [9, 2, 74], [11, 1, 78],
  [12, 1.5, 79], [13.5, 0.5, 78], [14, 1, 74], [15, 2, 73], [17, 1, 76],
  [18, 5, 74],
];

/** Brénta: svelta e rotonda, con due note ribattute in testa — tòc tòc. Da ep02 (torna: «si paga al ritorno»). */
export const BRENTA: Nota[] = [
  [0, 0.5, 81], [0.5, 0.5, 81], [1, 1, 78], [2, 0.5, 76], [2.5, 0.5, 78], [3, 1, 74],
  [4, 0.5, 81], [4.5, 0.5, 81], [5, 1, 83], [6, 0.5, 81], [6.5, 0.5, 78], [7, 1, 76],
  [8, 0.5, 74], [8.5, 0.5, 74], [9, 0.5, 76], [9.5, 0.5, 78], [10, 1, 81], [11, 1, 78],
  [12, 1, 76], [13, 1, 73], [14, 2, 74],
];

/** La corda di Toraki: tenera, piana, a passi piccoli; sale piano e si posa. Da ep02 (la corda è di tutta la saga). */
export const CORDA: Nota[] = [
  [0, 2, 66], [2, 1, 69], [3, 1, 71], [4, 3, 74], [7, 1, 73],
  [8, 2, 71], [10, 1, 69], [11, 1, 66], [12, 4, 69],
  [16, 2, 66], [18, 1, 69], [19, 1, 71], [20, 2, 74], [22, 1, 76], [23, 1, 78],
  [24, 3, 76], [27, 1, 73], [28, 4, 74],
];

/**
 * Cervara, lo specchio di Zara: il tema di Zara capovolto (specchio diatonico
 * attorno al Re, come il riflesso) e lento il doppio — le stesse note, rovesciate
 * e calme: quel che in Zara scatta, in lei si posa. Da ep03.
 */
export const CERVARA: Nota[] = [
  [0, 1, 79], [1, 1, 78], [2, 1, 74], [3, 1, 73], [4, 2, 71], [6, 1, 73], [7, 1, 74], [8, 2, 78],
  [10, 2, 74], [12, 1, 78], [13, 1, 79], [14, 2, 78],
  [16, 1, 79], [17, 1, 78], [18, 1, 74], [19, 1, 73], [20, 2, 71], [22, 1, 67], [23, 1, 71],
  [24, 3, 73], [27, 1, 74], [28, 4, 74],
];
