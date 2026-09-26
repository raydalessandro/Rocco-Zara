// cartoni/motore/colore.ts — i colori e la luce.
//
// I colori dei personaggi vengono dalle «ancore colore» delle schede (canone):
// qui non si inventano, si ILLUMINANO. La luce della scena (ora del giorno,
// tempesta, alba lavata) tinge tutto con la stessa mano, così un quadro resta
// un quadro solo: moltiplica per l'ambiente, spinge le ombre verso il freddo,
// affoga i lontani nella foschia.

export type RGB = readonly [number, number, number];

export function rgb(hex: string): RGB {
  const h = hex.replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(f.slice(0, 2), 16), parseInt(f.slice(2, 4), 16), parseInt(f.slice(4, 6), 16)];
}

const byte = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
export function hex(c: RGB): string {
  return "#" + c.map((v) => byte(v).toString(16).padStart(2, "0")).join("");
}

/** Mescola due colori (k=0 → a, k=1 → b). */
export function mescola(a: string, b: string, k: number): string {
  const A = rgb(a);
  const B = rgb(b);
  return hex([A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k, A[2] + (B[2] - A[2]) * k]);
}
export const schiarisci = (c: string, k: number) => mescola(c, "#ffffff", k);
export const scurisci = (c: string, k: number) => mescola(c, "#000000", k);

/** Moltiplica canale per canale (luce colorata su una superficie). */
export function moltiplica(c: string, m: RGB): string {
  const C = rgb(c);
  return hex([C[0] * m[0], C[1] * m[1], C[2] * m[2]]);
}

/** Satura (k>0) o desatura (k<0) attorno alla luminanza. */
export function satura(c: string, k: number): string {
  const [r, g, b] = rgb(c);
  const l = 0.299 * r + 0.587 * g + 0.114 * b;
  return hex([l + (r - l) * (1 + k), l + (g - l) * (1 + k), l + (b - l) * (1 + k)]);
}

export function luminanza(c: string): number {
  const [r, g, b] = rgb(c);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

// -------------------------------------------------------------------- luce --
/** La luce di una scena: una sola per quadro, per tutti. */
export interface Luce {
  /** Moltiplicatore sulle superfici in luce (1 = neutro). */
  ambiente: RGB;
  /** Moltiplicatore sulle superfici in ombra propria. */
  ombra: RGB;
  /** Colore della luce radente/controluce (bordo luminoso). */
  bordo: string;
  /** Forza del bordo luminoso 0..1 (controluce del tramonto = alto). */
  forzaBordo: number;
  /** Da che parte viene la luce: -1 sinistra, +1 destra (per ombre e bordi). */
  lato: number;
  /** Colore della foschia (prospettiva aerea). */
  foschia: string;
  /** Lunghezza delle ombre portate (0 = sole a picco, 1 = radente). */
  radenza: number;
  /** Opacità delle ombre portate. */
  forzaOmbra: number;
}

export const m = (r: number, g: number, b: number): RGB => [r, g, b];

/** Superficie in luce, sotto questa luce. */
export const inLuce = (c: string, L: Luce): string => moltiplica(c, L.ambiente);
/** Superficie in ombra propria, sotto questa luce. */
export const inOmbra = (c: string, L: Luce): string => moltiplica(c, L.ombra);
/** Affoga un colore nella foschia (0 = vicino, 1 = sparito). */
export const lontano = (c: string, L: Luce, k: number): string => mescola(c, L.foschia, Math.max(0, Math.min(1, k)));

/** Interpola due luci (per i passaggi: pomeriggio → temporale → notte). */
export function mescolaLuce(a: Luce, b: Luce, k: number): Luce {
  const mm = (x: RGB, y: RGB): RGB => [x[0] + (y[0] - x[0]) * k, x[1] + (y[1] - x[1]) * k, x[2] + (y[2] - x[2]) * k];
  return {
    ambiente: mm(a.ambiente, b.ambiente),
    ombra: mm(a.ombra, b.ombra),
    bordo: mescola(a.bordo, b.bordo, k),
    forzaBordo: a.forzaBordo + (b.forzaBordo - a.forzaBordo) * k,
    lato: a.lato + (b.lato - a.lato) * k,
    foschia: mescola(a.foschia, b.foschia, k),
    radenza: a.radenza + (b.radenza - a.radenza) * k,
    forzaOmbra: a.forzaOmbra + (b.forzaOmbra - a.forzaOmbra) * k,
  };
}
