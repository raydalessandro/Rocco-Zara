// cartoni/cast/voci.ts — come parlano i personaggi.
//
// Ogni personaggio ha una VOCE registrata (il cast è in cartoni/voce/voce.json:
// una voce per ruolo, scelta da Ray e poi tenuta): dice le sue battute vere.
// Qui c'è il suo PROFILO, che serve a due cose:
//  - il posto nel missaggio delle sue battute registrate: volume, stereo, e
//    l'eco di chi parla da un ricordo;
//  - il GRAMMELOT, il ripiego per le battute non ancora registrate: una lingua
//    inventata fatta del ritmo, delle vocali e della melodia della battuta vera
//    (come Pingu), suonata da cartoni/audio/grammelot.ts coi numeri del profilo
//    (altezza, passo delle sillabe, grandezza del tratto vocale, aria, grana,
//    l'alfabeto delle consonanti). Cambiare un grammelot = cambiare questi numeri.

import type { ProfiloVoce } from "../motore/voce";

export type { ProfiloVoce };

// Alfabeti: una lettera = un suono del grammelot (vedi grammelot.ts):
//   m n = nasali · b d g = occlusive sonore · p t k = occlusive sorde
//   l w = approssimanti · r = vibrata · s x (sc) f h v = fricative · "" = nessuna

/**
 * Rocco (saga/bible/rocco.md, «Voce»): il grande goffo, gentile; esita prima
 * di osare, frasi semplici che atterrano. Basso e morbido, tutto labbra e nasi,
 * e spesso un piccolo "mh" prima di parlare.
 */
const ROCCO: ProfiloVoce = {
  id: "rocco",
  nome: "Rocco",
  f0: 110,
  estensione: 5,
  ritmo: 3.1,
  formanti: 0.8,
  soffio: 0.3,
  grana: 0.35,
  alfabeto: { nessuno: "h", labiale: "mb", nasale: "n", occlusiva: "bdg", fricativa: "vh", liquida: "lw", vibrante: "l" },
  pause: { virgola: 0.3, punto: 0.45 },
  finale: 1.5,
  esita: 0.6,
  vol: 1,
  pan: 0.08,
};

/**
 * Zara (saga/bible/zara.md, «Voce»): giovane tigre, orgogliosa e pungente,
 * diretta, asciutta. Veloce e chiara, a scatti; la melodia salta, le frasi
 * finiscono corte.
 */
const ZARA: ProfiloVoce = {
  id: "zara",
  nome: "Zara",
  f0: 262,
  estensione: 7,
  ritmo: 4.4,
  formanti: 1.2,
  soffio: 0.35,
  grana: 0.25,
  alfabeto: { nessuno: "", labiale: "pb", nasale: "n", occlusiva: "tdk", fricativa: "sf", liquida: "l", vibrante: "r" },
  pause: { virgola: 0.2, punto: 0.35 },
  finale: 1.2,
  vol: 0.92,
  pan: -0.08,
};

/**
 * Cècca, la gazza (saga/bible/comprimari/cecca.md): rapida, pettegola, si
 * interrompe da sola. Chiacchiera fitta, ruvida, a colpi di becco.
 */
const CECCA: ProfiloVoce = {
  id: "cecca",
  nome: "Cècca",
  f0: 430,
  estensione: 8,
  ritmo: 6.2,
  formanti: 1.4,
  soffio: 0.25,
  grana: 0.75,
  alfabeto: { nessuno: "k", labiale: "p", nasale: "n", occlusiva: "kt", fricativa: "xs", liquida: "r", vibrante: "r" },
  pause: { virgola: 0.12, punto: 0.25 },
  finale: 1.1,
  vol: 0.8,
  pan: -0.2,
};

/** Il fratello di Zara, nel ricordo (ep01 p.4): più grave, lontano, con l'eco. */
const FRATELLO: ProfiloVoce = {
  id: "fratello",
  nome: "il fratello di Zara",
  f0: 150,
  estensione: 4,
  ritmo: 3.4,
  formanti: 1.02,
  soffio: 0.45,
  grana: 0.2,
  alfabeto: { nessuno: "", labiale: "mb", nasale: "n", occlusiva: "td", fricativa: "sh", liquida: "l", vibrante: "r" },
  pause: { virgola: 0.28, punto: 0.4 },
  eco: 0.6,
  vol: 0.6,
};

/** Il cast delle voci: `chi` nelle didascalie è una di queste chiavi (o "narratrice"). */
export const VOCI: Readonly<Record<string, ProfiloVoce>> = {
  rocco: ROCCO,
  zara: ZARA,
  cecca: CECCA,
  fratello: FRATELLO,
};
