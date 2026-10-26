// cartoni/scene/meteo.ts — il tempo che fa (vento, pioggia, temporale, notte).
//
// Il meteo è un gruppo di numeri che la regia può interpolare nel tempo, come la
// luce: il vento che gira a ep01 p.13 è `versoVento` da +1 a −1 in tre secondi.

import { frattale1 } from "../motore/caso";
import type { Passaggio } from "./luogo";

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

/**
 * L'erba piega: base del vento + raffiche che viaggiano (il pelo che respira); e se
 * qualcuno sta passando (`passaggi`), attorno a lui una piega in più: le lame davanti
 * si aprono via da lui, quelle dietro restano piegate un tratto (dove è appena passato)
 * e tornano su piano, più lontano.
 */
export function piegaErba(x: number, t: number, m: Meteo, passaggi?: readonly Passaggio[]): number {
  const v = m.versoVento;
  // le raffiche viaggiano nel verso del vento
  const onde = frattale1(x * 0.0022 - v * t * 0.55, 3, 7) * 0.5 + 0.5; // 0..1
  const respiro = Math.sin(x * 0.004 - v * t * 1.3) * 0.5 + 0.5;
  const base = 0.1 + m.vento * 0.35;
  let piega = v * (base + m.vento * (0.35 * onde + 0.25 * respiro)) + Math.sin(t * 2.1 + x * 0.05) * 0.03;
  return piega + pieghePassaggi(x, passaggi);
}

/** La somma delle pieghe dei passaggi in x (per chi campiona l'erba a modo suo). */
export function pieghePassaggi(x: number, passaggi?: readonly Passaggio[]): number {
  let piega = 0;
  if (passaggi) for (const p of passaggi) piega += pieghaDiPassaggio(x, p);
  return piega;
}

/** La piega locale di un passaggio in x: via da lui davanti, strascico dietro. */
export function pieghaDiPassaggio(x: number, p: Passaggio): number {
  const d = (x - p.x) * p.verso; // > 0 davanti a lui, < 0 dietro
  const r = Math.max(1, p.raggio);
  if (d > r * 1.6 || d < -r * 3.2) return 0;
  const lato = d >= 0 ? 1 : -1;
  // davanti: una campana stretta; dietro: lo strascico, più lungo e più basso
  const k = d >= 0 ? Math.exp(-((d / (r * 0.7)) ** 2)) : Math.exp(-((d / (r * 1.5)) ** 2)) * 0.75;
  return lato * p.verso * p.forza * 0.8 * k;
}
