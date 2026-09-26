// cartoni/cast/fauna.ts — la fauna minore dell'ep01.
//
//  - Cècca, la gazza (saga/bible/comprimari/cecca.md, «Morfologia di reference»):
//    nero con iridescenze blu-verdi #1c2430 / riflessi #3f6d7a, spalle e ventre
//    bianchi NETTI #f0ece1; coda a cuneo lunga metà del corpo; IL SEGNO: tre
//    timoniere di SINISTRA con le barbe spezzate + UN luccichio infilato tra le
//    penne del petto. Posa-firma: il saltello obliquo.
//  - il martin pescatore che «bucò il lago» (p.1);
//  - gli uccelli del canneto che si alzano in volo (p.7);
//  - la marmotta che fischia due volte, il fischio lungo (p.13).
// Tutti di profilo, guardano a destra, zampe a y=0.

import { type Luce, inLuce, inOmbra, mescola, scurisci, schiarisci } from "../motore/colore";
import { caso } from "../motore/caso";
import { type Defs, type P, add, cerchioD, curva, ellisseD, g, n, path, pt, tr } from "../motore/svg";
import { clamp, onda, palpebra } from "../motore/tempo";

export const CECCA_ANCORE = { nero: "#1c2430", bianco: "#f0ece1", riflessi: "#3f6d7a" } as const;

export interface CtxFauna {
  defs: Defs;
  luce: Luce;
  id: string;
  verso?: 1 | -1;
}

// ------------------------------------------------------------------ gazza --
export interface PosaGazza {
  t: number;
  /** "posata" sul ramo o "volo". */
  modo: "posata" | "volo";
  /** Fase del battito d'ali (volo). */
  fase?: number;
  /** Testa: gradi (+ giù). Lo scatto laterale continuo verso i riflessi. */
  testa?: number;
  /** Becco aperto (parla / tiene il luccichio). */
  becco?: number;
  /** Ha un luccichio nel becco. */
  nelBecco?: boolean;
}

export function gazza(posa: PosaGazza, ctx: CtxFauna): string {
  const { luce, defs, id } = ctx;
  const t = posa.t;
  const nero = inLuce(CECCA_ANCORE.nero, luce);
  const riflesso = inLuce(CECCA_ANCORE.riflessi, luce);
  const bianco = inLuce(CECCA_ANCORE.bianco, luce);
  const biancoOmbra = inOmbra(CECCA_ANCORE.bianco, luce);
  const volo = posa.modo === "volo";
  // lo scatto: la testa punta i riflessi a piccoli colpi secchi
  const scatto = Math.round(Math.sin(t * 2.3) * 2 + Math.sin(t * 5.1)) * 7;
  const testaAng = (posa.testa ?? 0) + (volo ? 0 : scatto);
  const codaSu = volo ? 0 : Math.max(0, Math.sin(t * 3.1)) ** 6 * 14; // la coda che dondola
  let s = "";
  const base: P = volo ? [0, -30] : [0, -26];
  const bodyRot = volo ? -8 : -22;

  // coda a cuneo (metà della lunghezza): con le TRE timoniere spezzate
  const codaAng = volo ? 184 : 150 - codaSu;
  const rad = (codaAng * Math.PI) / 180;
  const radice = add(base, [-12, 4]);
  const punta = add(radice, [Math.cos(rad) * 50, Math.sin(rad) * 50]);
  const lat: P = [-Math.sin(rad), Math.cos(rad)];
  const larg0 = 7;
  const larg1 = 6;
  let codaD = `M${pt(add(radice, [lat[0] * larg0, lat[1] * larg0]))}L${pt(add(punta, [lat[0] * larg1, lat[1] * larg1]))}`;
  // bordo spezzato: tre penne con le barbe rotte (dentellatura irregolare)
  const r = caso("cecca/timoniere");
  for (let i = 1; i <= 6; i++) {
    const k = i / 6;
    const pp = add(punta, [lat[0] * larg1 * (1 - 2 * k), lat[1] * larg1 * (1 - 2 * k)]);
    const rientro = i % 2 === 0 ? r.tra(4, 9) : 0;
    codaD += `L${pt(add(pp, [-Math.cos(rad) * rientro, -Math.sin(rad) * rientro]))}`;
  }
  codaD += `L${pt(add(radice, [-lat[0] * larg0, -lat[1] * larg0]))}Z`;
  const gCoda = defs.lineare(`${id}-coda`, radice, punta, [
    [0, nero],
    [0.5, riflesso],
    [1, mescola(riflesso, "#6fa38f", 0.3)],
  ]);
  s += path(codaD, { fill: gCoda });

  // corpo
  let corpo = path(ellisseD([0, 0], 22, 13), { fill: nero });
  // ventre bianco netto
  corpo += path(curva([[-14, 4], [0, 12], [16, 6], [14, -2], [0, 2]], true), { fill: bianco });
  // ala (chiusa) con la spalla bianca e i riflessi blu-verdi
  if (!volo) {
    corpo += path(curva([[-20, -2], [-4, -10], [14, -6], [4, 2], [-18, 4]], true), { fill: riflesso });
    corpo += path(curva([[-4, -8], [8, -9], [12, -5], [0, -4]], true), { fill: bianco });
  }
  // il luccichio infilato tra le penne del petto (sempre uno)
  const lucc = 0.6 + 0.4 * Math.max(0, Math.sin(t * 4.2));
  corpo += path(ellisseD([15, 1], 2.4, 1.6), { fill: "#e8d58a" }) + path(cerchioD([15.6, 0.4], 0.9), { fill: "#ffffff", opacity: lucc });
  s += g({ transform: `translate(${n(base[0])} ${n(base[1])})rotate(${bodyRot})` }, corpo);

  // ali in volo: due battiti, l'ala lontana più scura
  if (volo) {
    const f = posa.fase ?? t * 3.2;
    const a = Math.sin(f * Math.PI * 2);
    const ala = (lontana: boolean) => {
      const h = a * 46 * (lontana ? 0.8 : 1);
      const d = curva([[-10, 0], [2, -h * 0.5 - 4], [14, -h - 2], [22, -h * 0.8], [18, -h * 0.2], [8, 2]], true);
      return path(d, { fill: lontana ? scurisci(riflesso, 0.3) : riflesso }) + (lontana ? "" : path(curva([[8, -h * 0.7], [16, -h - 1], [20, -h * 0.75], [12, -h * 0.55]], true), { fill: bianco }));
    };
    s = g({ transform: `translate(${n(base[0] - 4)} ${n(base[1])})` }, ala(true)) + s + g({ transform: `translate(${n(base[0] - 2)} ${n(base[1])})` }, ala(false));
  }

  // testa
  let testa = path(cerchioD([0, 0], 11), { fill: nero });
  testa += path(curva([[-4, -6], [4, -9], [9, -4], [2, -3]], true), { fill: riflesso, opacity: 0.6 });
  const b = clamp(posa.becco ?? 0);
  testa += path(`M9 -3L${n(24)} ${n(-1)}L9 ${n(1 + b * 2)}Z`, { fill: "#141414" });
  if (b > 0.05) testa += path(`M9 ${n(2 + b * 2)}L${n(22)} ${n(3 + b * 6)}L9 ${n(4 + b * 2)}Z`, { fill: "#141414" });
  if (posa.nelBecco) testa += path(ellisseD([22, 1], 3.2, 2), { fill: "#f0dc92" }) + path(cerchioD([23, 0.4], 1.1), { fill: "#fff" });
  const chiuso = palpebra(t, 2.9, 0.3);
  testa += path(cerchioD([4, -2], 2.6), { fill: "#090909" }) + path(cerchioD([3.2, -2.8], 0.9), { fill: "#fff", opacity: 1 - chiuso });
  const collo = volo ? add(base, [20, -6]) : add(base, [16, -16]);
  s += g({ transform: `translate(${n(collo[0])} ${n(collo[1])})rotate(${n(testaAng)})` }, testa);

  // zampe sul ramo
  if (!volo) s += path("M-2 -14L-4 0M4 -14L6 0M-8 0h8M2 0h9", { stroke: "#1a1a1a", "stroke-width": 2, fill: "none", "stroke-linecap": "round" });
  void biancoOmbra;
  return s;
}

// --------------------------------------------------------- martin pescatore --
export interface PosaMartin {
  t: number;
  modo: "volo" | "tuffo";
  fase?: number;
}

export function martinPescatore(posa: PosaMartin, ctx: CtxFauna): string {
  const { luce } = ctx;
  const blu = inLuce("#2b8db5", luce);
  const bluChiaro = inLuce("#5fc2da", luce);
  const arancio = inLuce("#dc7536", luce);
  let s = "";
  const tuffo = posa.modo === "tuffo";
  const f = posa.fase ?? posa.t * 7;
  const a = tuffo ? 0 : Math.sin(f * Math.PI * 2);
  if (!tuffo) {
    s += path(curva([[-4, 0], [2, -8 - a * 16], [10, -12 - a * 22], [12, -2]], true), { fill: scurisci(blu, 0.25) });
  }
  s += path(ellisseD([0, 0], 13, 6), { fill: blu });
  s += path(curva([[-8, 2], [4, 6], [12, 3], [4, 0]], true), { fill: arancio });
  s += path(curva([[-12, -2], [-4, -5], [6, -4], [-4, -1]], true), { fill: bluChiaro, opacity: 0.8 });
  s += path(cerchioD([12, -3], 5.5), { fill: blu });
  s += path(`M16 -4L${tuffo ? 34 : 30} -2L16 0Z`, { fill: "#1d1d1d" });
  s += path(cerchioD([13, -4], 1.4), { fill: "#0b0b0b" });
  s += path(ellisseD([11, 0], 2.4, 1.4), { fill: "#f4efe2" });
  s += path("M-12 0L-22 -2L-20 2Z", { fill: blu });
  if (!tuffo) s += path(curva([[-2, -1], [4, -9 - a * 12], [12, -13 - a * 18], [11, -2]], true), { fill: blu });
  return s;
}

// ------------------------------------------------------- uccelli del canneto --
/** Uno stormo di piccoli uccelli che si alza (p.7): posizioni relative all'origine. */
export function stormo(t: number, eta: number, ctx: CtxFauna, quanti = 14): string {
  const { luce } = ctx;
  if (eta <= 0) return "";
  const r = caso("stormo/canneto");
  const col = inLuce("#5c4a36", luce);
  const colAla = inLuce("#7a6246", luce);
  let s = "";
  for (let i = 0; i < quanti; i++) {
    const ritardo = r.tra(0, 0.35);
    const e = Math.max(0, eta - ritardo);
    if (e <= 0) continue;
    const dx = r.tra(-60, 60) + e * r.tra(120, 360) * (r.moneta(0.7) ? -1 : 1);
    const dy = -e * r.tra(260, 520) + e * e * r.tra(40, 120);
    const sc = r.tra(0.8, 1.2);
    const f = t * r.tra(9, 13) + i;
    const a = Math.sin(f * Math.PI * 2);
    const corpo = ellisseD([0, 0], 7, 3.6);
    const ali = `M-2 -1Q4 ${n(-10 - a * 12)} ${n(10)} ${n(-6 - a * 16)}Q6 -2 2 1ZM-2 -1Q-2 ${n(-8 - a * 10)} ${n(4)} ${n(-4 - a * 14)}Z`;
    s += g({ transform: `translate(${n(dx)} ${n(dy)})scale(${sc})` }, path(ali, { fill: colAla }) + path(corpo, { fill: col }) + path(cerchioD([6, -1], 3), { fill: col }));
  }
  return s;
}

// ---------------------------------------------------------------- marmotta --
export interface PosaMarmotta {
  t: number;
  /** Quanto è alzata sulla vedetta 0..1 (0 = accucciata, 1 = ritta). */
  ritta: number;
  /** Fischio: bocca aperta 0..1. */
  fischio: number;
}

/** La marmotta di vedetta sul sasso: ritta sulle zampe posteriori, fischia. */
export function marmotta(posa: PosaMarmotta, ctx: CtxFauna): string {
  const { luce, defs, id } = ctx;
  const pelo = inLuce("#8b7355", luce);
  const peloChiaro = inLuce("#b89d77", luce);
  const scuro = inLuce("#4d3d2c", luce);
  const k = clamp(posa.ritta);
  const resp = onda(posa.t, 1.6) * 1.2;
  const h = 34 + 30 * k; // altezza del busto
  const url = defs.lineare(`${id}-pelo`, [0, -h - 20], [0, 0], [
    [0, peloChiaro],
    [1, pelo],
  ]);
  // busto a pera: largo ai fianchi, stretto alle spalle
  let s = path(curva([[-20, 0], [-24, -h * 0.35], [-16, -h * 0.8], [-6, -h - resp], [8, -h - resp], [16, -h * 0.75], [22, -h * 0.3], [18, 0]], true), { fill: url });
  s += path(curva([[-6, -6], [-10, -h * 0.5], [-2, -h * 0.85], [8, -h * 0.8], [10, -h * 0.4], [6, -4]], true), { fill: peloChiaro, opacity: 0.55 });
  // zampine anteriori raccolte al petto
  s += path(`M${n(-2)} ${n(-h * 0.62)}q7 5 13 2M${n(-4)} ${n(-h * 0.55)}q6 6 12 4`, { stroke: scuro, "stroke-width": 4, "stroke-linecap": "round", fill: "none", opacity: 0.4 + 0.6 * k });
  // testa tonda con la mascherina scura
  const ty = -h - 12;
  let testa = path(curva([[-12, 2], [-13, -9], [-4, -15], [8, -14], [16, -6], [16, 4], [6, 9], [-6, 8]], true), { fill: pelo });
  testa += path(curva([[2, -11], [10, -11], [16, -5], [8, -3]], true), { fill: scuro, opacity: 0.75 });
  testa += path(cerchioD([5, -6], 2.1), { fill: "#101010" }) + path(cerchioD([4.4, -6.6], 0.7), { fill: "#fff" });
  testa += path(ellisseD([-8, -13], 3.6, 2.6), { fill: scuro });
  testa += path(ellisseD([14, 2], 3, 2.2), { fill: peloChiaro });
  const f = clamp(posa.fischio);
  if (f > 0.05) testa += path(ellisseD([13, 6], 2 + f, 1 + f * 2.5), { fill: "#3a241c" });
  s += g({ transform: `translate(2 ${n(ty)})rotate(${n(-6 * f)})` }, testa);
  // coda corta e piedi
  s += path(curva([[-18, -4], [-30, 2], [-34, -2], [-24, -8]], true), { fill: scuro, opacity: 0.8 });
  s += path(ellisseD([-6, 0], 10, 3.5) + ellisseD([10, 0], 10, 3.5), { fill: scuro });
  return s;
}

export { tr };
