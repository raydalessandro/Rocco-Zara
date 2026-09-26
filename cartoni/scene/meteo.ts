// cartoni/scene/meteo.ts — il tempo che fa (vento, pioggia, temporale, notte).
//
// Il meteo è un gruppo di numeri che la regia può interpolare nel tempo, come la
// luce: il vento che gira a ep01 p.13 è `versoVento` da +1 a −1 in tre secondi.

import { frattale1 } from "../motore/caso";

export interface Meteo {
  /** Vento: forza 0..1. */
  vento: number;
  /** Pioggia 0..1. */
  pioggia: number;
  /** Nuvole del temporale 0..1 (il banco basso che avanza da destra). */
  temporale: number;
  /** Nebbia bassa sull'acqua 0..1. */
  nebbia: number;
  /** Notte 0..1 (stelle, luce blu). */
  notte: number;
  /** Lampo in corso 0..1. */
  lampo: number;
  /** Alba lavata: brina e acqua sulle cose 0..1. */
  lavato: number;
  /** Il sole: posizione in cielo 0 (orizzonte) … 1 (alto). */
  sole: number;
  /** Da dove soffia: +1 l'erba piega verso destra, −1 verso sinistra. */
  versoVento: number;
  /** Il sole che tocca l'acqua: luccichii 0..1. */
  luccichii: number;
}

export const METEO_SERENO: Meteo = {
  vento: 0.35,
  pioggia: 0,
  temporale: 0,
  nebbia: 0.25,
  notte: 0,
  lampo: 0,
  lavato: 0,
  sole: 0.55,
  versoVento: 1,
  luccichii: 0,
};

/** L'erba piega: base del vento + raffiche che viaggiano (il pelo che respira). */
export function piegaErba(x: number, t: number, m: Meteo): number {
  const v = m.versoVento;
  // le raffiche viaggiano nel verso del vento
  const onde = frattale1(x * 0.0022 - v * t * 0.55, 3, 7) * 0.5 + 0.5; // 0..1
  const respiro = Math.sin(x * 0.004 - v * t * 1.3) * 0.5 + 0.5;
  const base = 0.1 + m.vento * 0.35;
  return v * (base + m.vento * (0.35 * onde + 0.25 * respiro)) + Math.sin(t * 2.1 + x * 0.05) * 0.03;
}
