// cartoni/motore/tempo.ts — il tempo del cartone: interpolazioni, easing, tracce.
//
// Tutto il motore è una funzione pura del tempo: fotogramma = f(copione, t).
// Qui vivono i mattoni numerici che le inquadrature usano per muovere le cose
// (niente stato, niente orologio: il tempo arriva sempre come argomento).

export const clamp = (v: number, a = 0, b = 1): number => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;
/** Dove sta v tra a e b (0..1, non clampato). */
export const inv = (a: number, b: number, v: number): number => (b === a ? 0 : (v - a) / (b - a));
/** Rimappa v da [a,b] a [c,d], clampato. */
export const remap = (v: number, a: number, b: number, c: number, d: number): number =>
  lerp(c, d, clamp(inv(a, b, v)));

export const smooth = (k: number): number => {
  const x = clamp(k);
  return x * x * (3 - 2 * x);
};
export const smoother = (k: number): number => {
  const x = clamp(k);
  return x * x * x * (x * (x * 6 - 15) + 10);
};

export type Easing = (k: number) => number;

export const ease = {
  lineare: ((k) => clamp(k)) as Easing,
  dentro: ((k) => clamp(k) ** 2) as Easing,
  fuori: ((k) => 1 - (1 - clamp(k)) ** 2) as Easing,
  dentroFuori: ((k) => smooth(k)) as Easing,
  morbido: ((k) => smoother(k)) as Easing,
  seno: ((k) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(k))) as Easing,
  fuoriCubo: ((k) => 1 - (1 - clamp(k)) ** 3) as Easing,
  dentroCubo: ((k) => clamp(k) ** 3) as Easing,
  /** Piccolo superamento e ritorno: per le cose che si fermano con peso. */
  fuoriRitorno: ((k) => {
    const x = clamp(k) - 1;
    const s = 1.4;
    return 1 + x * x * ((s + 1) * x + s);
  }) as Easing,
  /** Atterraggio pesante: arriva, schiaccia appena, si assesta. */
  assesta: ((k) => {
    const x = clamp(k);
    return 1 - Math.exp(-6 * x) * Math.cos(9 * x);
  }) as Easing,
};

/** Una chiave di animazione: [tempo, valore, easing verso la chiave dopo]. */
export type Chiave = readonly [number, number, Easing?];

/**
 * Traccia a chiavi: dato un tempo restituisce il valore interpolato.
 * Prima della prima chiave vale la prima, dopo l'ultima vale l'ultima.
 */
export function traccia(chiavi: readonly Chiave[]): (t: number) => number {
  const ks = [...chiavi].sort((a, b) => a[0] - b[0]);
  return (t: number) => {
    if (ks.length === 0) return 0;
    if (t <= ks[0][0]) return ks[0][1];
    for (let i = 0; i < ks.length - 1; i++) {
      const [t0, v0, e] = ks[i];
      const [t1, v1] = ks[i + 1];
      if (t <= t1) return lerp(v0, v1, (e ?? ease.dentroFuori)(inv(t0, t1, t)));
    }
    return ks[ks.length - 1][1];
  };
}

/** Finestra: 0 prima di a, 1 dopo b, rampa (con easing) in mezzo. */
export const rampa = (t: number, a: number, b: number, e: Easing = ease.dentroFuori): number =>
  e(inv(a, b, t));

/** Impulso: sale in [a, a+su], resta, scende in [b-giu, b]. */
export function impulso(t: number, a: number, b: number, su = 0.3, giu = 0.3): number {
  if (t <= a || t >= b) return 0;
  return Math.min(smooth(inv(a, a + su, t)), smooth(inv(b, b - giu, t)));
}

/** Oscillazione morbida (respiro, dondolio). */
export const onda = (t: number, periodo: number, fase = 0): number =>
  Math.sin(((t / periodo) + fase) * Math.PI * 2);

/** Fase ciclica 0..1. */
export const ciclo = (t: number, periodo: number, fase = 0): number => {
  const p = t / periodo + fase;
  return p - Math.floor(p);
};

/** Battito di ciglia deterministico: 1 = occhio chiuso. */
export function palpebra(t: number, periodo = 3.7, fase = 0): number {
  const p = ciclo(t, periodo, fase);
  const d = 0.06; // durata del battito in frazione di periodo
  if (p > d) return 0;
  return Math.sin((p / d) * Math.PI);
}
