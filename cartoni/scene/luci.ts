// cartoni/scene/luci.ts — le luci dell'episodio (una per momento del giorno).
//
// Una luce tinge personaggi e paesaggio con la stessa mano. I valori sono
// scelti a occhio sulla palette terrosa/stagionale di STILE_VISIVO §1: il
// pomeriggio caldo della Soglia, il cielo che «mette su un colore nuovo»,
// la notte d'acqua, l'alba lavata e fredda.

import { type Luce, m } from "../motore/colore";

export const LUCI = {
  /** Pomeriggio pieno, sole dal lato dell'Aperto (destra). */
  giorno: {
    ambiente: m(1.04, 1.0, 0.9),
    ombra: m(0.66, 0.66, 0.74),
    bordo: "#fff1cf",
    forzaBordo: 0.25,
    lato: 1,
    foschia: "#d9dcd2",
    radenza: 0.35,
    forzaOmbra: 0.8,
  },
  /** Sole basso alle spalle: controluce d'oro, ombre lunghe. */
  tramonto: {
    ambiente: m(1.06, 0.9, 0.74),
    ombra: m(0.56, 0.5, 0.62),
    bordo: "#ffd48a",
    forzaBordo: 0.85,
    lato: 1,
    foschia: "#e9c79a",
    radenza: 0.9,
    forzaOmbra: 0.9,
  },
  /** Il cielo nuovo del temporale che arriva: luce giallastra, piatta. */
  presagio: {
    ambiente: m(0.86, 0.86, 0.74),
    ombra: m(0.5, 0.52, 0.58),
    bordo: "#e8e2b0",
    forzaBordo: 0.15,
    lato: -1,
    foschia: "#a9aa92",
    radenza: 0.2,
    forzaOmbra: 0.45,
  },
  /** Notte di tempesta: blu d'acqua. */
  notte: {
    ambiente: m(0.44, 0.5, 0.64),
    ombra: m(0.26, 0.3, 0.42),
    bordo: "#c9d8ff",
    forzaBordo: 0.2,
    lato: 1,
    foschia: "#3a4658",
    radenza: 0.1,
    forzaOmbra: 0.25,
  },
  /** Alba lavata e fredda. */
  alba: {
    ambiente: m(0.95, 0.94, 1.0),
    ombra: m(0.62, 0.66, 0.8),
    bordo: "#ffe2c4",
    forzaBordo: 0.55,
    lato: -1,
    foschia: "#dfe4ea",
    radenza: 0.8,
    forzaOmbra: 0.55,
  },
} satisfies Record<string, Luce>;

export type NomeLuce = keyof typeof LUCI;
