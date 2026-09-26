// cartoni/cast/laghi.ts — la gente dei Laghi del Vespro (ep02).
//
//  - Brénta, la lontra barcaiola (saga/bible/comprimari/traghettatrice-delle-rive.md,
//    «Morfologia di reference»): corpo a fuso, pelo bruno scuro bagnato-lucido
//    #4a382a, gola e petto crema #d9c9a6; IL SEGNO: le vibrisse più lunghe del
//    normale, piegate TUTTE da una parte (il lato del remo), e le palmature
//    segnate da anni di corda (righe chiare sul palmo); una vecchia cicatrice da
//    amo sul muso; occhi castani ridenti con la ruga di chi guarda controluce.
//    Posa-firma: le zampe SEMPRE in opera (un capo di corda, un nodo, un remo).
//    Voga in piedi, guardando avanti, come si fa sui laghi.
//  - le linci delle rive (la Gente delle Rive, i confederati-lince): «coi musi
//    disegnati quasi come il suo» — un pupazzo per tutte, con la scala e il seme
//    (la madre, la lince piccola, chi sta sulle soglie).
//  - il Custode di ep02, p.4: una testuggine di lago (la prosa lo vuole lento, e
//    col collo che si allunga; nel canone dei nomi il Custode è una testuggine).
//    Il guscio lisciato dalle pietre è di Rèmolo (ep04): questo ha le placche.
//  - la folaga, che annuncia il lago col suo verso (p.1).
// Tutti di profilo, guardano a destra, piedi a y=0 (la folaga: galleggia a y=0).

import { type Luce, inLuce, inOmbra, mescola, scurisci, schiarisci } from "../motore/colore";
import { caso } from "../motore/caso";
import { type P, add, cerchioD, curva, ellisseD, g, n, path, pt, tubo } from "../motore/svg";
import { clamp, onda, palpebra } from "../motore/tempo";
import type { CtxFauna } from "./fauna";

export const BRENTA_ANCORE = { pelo: "#4a382a", gola: "#d9c9a6" } as const;

// ----------------------------------------------------------------- Brénta --
export interface PosaLontra {
  t: number;
  /** Cosa fanno le zampe: il remo (il manico), un nodo davanti al petto, due colpetti sul bordo, niente. */
  zampe: "remo" | "nodo" | "tocco" | "ferme";
  /** Dove stanno le zampe col remo (coordinate della lontra: i piedi a 0, guarda a destra). */
  manico?: P;
  /** Bocca 0..1 (parla). */
  bocca?: number;
  /** Testa: gradi (+ giù), per guardare la corda o in faccia. */
  testa?: number;
  /** Il busto si piega avanti (gradi), quando tira o si china sulla corda. */
  china?: number;
}

/** Brénta in piedi (a poppa, di solito: la barca le copre le zampe dietro). */
export function lontra(posa: PosaLontra, ctx: CtxFauna): string {
  const { luce, defs, id } = ctx;
  const t = posa.t;
  const pelo = inLuce(BRENTA_ANCORE.pelo, luce);
  const peloLucido = inLuce(schiarisci(BRENTA_ANCORE.pelo, 0.28), luce);
  const peloScuro = inOmbra(BRENTA_ANCORE.pelo, luce);
  const gola = inLuce(BRENTA_ANCORE.gola, luce);
  const resp = onda(t, 2.1) * 1.5;
  const china = posa.china ?? 0;
  let s = "";
  // la coda: grossa alla radice, a punta (sta dietro, verso terra)
  s += path(curva([[-26, -30], [-58, -12], [-92, -4], [-104, -2], [-86, -14], [-50, -34], [-22, -48]], true), { fill: peloScuro });
  // il corpo a fuso, in piedi (si china attorno ai fianchi)
  const url = defs.lineare(`${id}-corpo`, [-40, -150], [40, 0], [
    [0, peloLucido],
    [0.45, pelo],
    [1, peloScuro],
  ]);
  let busto = path(curva([[-34, 0], [-40, -50], [-36, -104], [-22, -142 - resp], [6, -150 - resp], [26, -130], [34, -86], [30, -38], [22, 0]], true), { fill: url });
  // la gola e il petto crema
  busto += path(curva([[8, -142], [26, -126], [30, -92], [22, -56], [8, -60], [4, -100]], true), { fill: gola, opacity: 0.95 });
  // il lucido del bagnato: due strisce chiare che seguono il pelo
  busto += path(`M-28 -118Q-34 -80 -28 -40M-18 -132Q-24 -96 -20 -60`, { stroke: schiarisci(peloLucido, 0.25), "stroke-width": 3, fill: "none", opacity: 0.5, "stroke-linecap": "round" });
  // le zampe posteriori (corte, palmate)
  busto += path(ellisseD([-12, -2], 18, 6) + ellisseD([12, -1], 17, 6), { fill: peloScuro });
  s += g({ transform: `rotate(${n(china)} 0 -20)` }, busto);
  // la testa: larga e piatta, muso corto, vibrisse lunghe
  const collo: P = add([4 + china * 1.6, -150 - resp], [Math.sin((china * Math.PI) / 180) * 30, 0]);
  const ta = posa.testa ?? 0;
  let testa = path(curva([[-26, 4], [-28, -14], [-14, -28], [8, -30], [28, -22], [40, -10], [42, 2], [30, 12], [6, 16], [-16, 14]], true), { fill: pelo });
  testa += path(curva([[14, 6], [30, 4], [40, -2], [42, 4], [32, 12], [16, 14]], true), { fill: gola, opacity: 0.85 });
  // le orecchie piccole, basse
  testa += path(ellisseD([-16, -22], 6, 5), { fill: peloScuro });
  // il naso largo
  testa += path(curva([[36, -10], [44, -8], [46, -2], [40, 0], [34, -4]], true), { fill: "#1f1712" });
  // la cicatrice da amo, un filo chiaro sul muso
  testa += path("M24 -14q6 3 8 9", { stroke: schiarisci(gola, 0.1), "stroke-width": 1.6, fill: "none", opacity: 0.9, "stroke-linecap": "round" });
  // l'occhio castano che ride, con la ruga di chi guarda controluce
  const chiuso = Math.max(palpebra(t, 4.1, 0.3), 0.15);
  testa += path(ellisseD([16, -14], 4.4, 4.2 * (1 - chiuso * 0.8)), { fill: "#2a1c12" });
  testa += path(cerchioD([17.4, -15.6], 1.3), { fill: "#fff", opacity: 1 - chiuso });
  testa += path("M8 -22Q16 -26 24 -21M22 -10q4 3 9 1", { stroke: scurisci(pelo, 0.45), "stroke-width": 1.8, fill: "none", "stroke-linecap": "round" });
  // la bocca
  const b = clamp(posa.bocca ?? 0);
  testa += path(`M30 6Q36 ${n(8 + b * 7)} 42 5`, { stroke: "#1f1712", "stroke-width": 2, fill: b > 0.15 ? "#3a2019" : "none", "stroke-linecap": "round" });
  // IL SEGNO: le vibrisse lunghe, piegate tutte dalla stessa parte (verso il remo)
  const vib = Math.sin(t * 1.3) * 1.5;
  testa += path(`M38 -2q18 6 30 ${n(20 + vib)}M38 0q14 10 22 ${n(26 + vib)}M36 2q10 12 12 ${n(30 + vib)}M38 -5q22 2 36 ${n(12 + vib)}`, {
    stroke: schiarisci(gola, 0.2),
    "stroke-width": 1.3,
    fill: "none",
    opacity: 0.9,
    "stroke-linecap": "round",
  });
  s += g({ transform: `translate(${n(collo[0])} ${n(collo[1])})rotate(${n(ta)})` }, testa);
  // le braccia: corte, palmate; SEMPRE in opera
  const spalla: P = add([14 + china * 1.2, -118 - resp], [Math.sin((china * Math.PI) / 180) * 24, 0]);
  let mani: P[];
  const z = posa.zampe;
  if (z === "remo" && posa.manico) mani = [posa.manico, add(posa.manico, [-8, 6])];
  else if (z === "nodo") {
    const a = Math.sin(t * 6.3);
    mani = [add(spalla, [34 + a * 5, 26 + Math.cos(t * 6.3) * 4]), add(spalla, [24 - a * 5, 30])];
  } else if (z === "tocco") {
    const colpi = Math.abs(Math.sin(t * Math.PI * 2.2));
    mani = [add(spalla, [52, 52 + colpi * 10]), add(spalla, [30, 36])];
  } else mani = [add(spalla, [26, 40]), add(spalla, [14, 44])];
  const braccio = (m: P, lontano: boolean) => {
    const gomito = add(spalla, [(m[0] - spalla[0]) * 0.45 - 6, (m[1] - spalla[1]) * 0.55 + 12]);
    const col = lontano ? peloScuro : pelo;
    let d = path(curva([spalla, gomito, m]), { stroke: col, "stroke-width": 15, fill: "none", "stroke-linecap": "round" });
    // la zampa palmata, con le righe chiare della corda
    d += path(ellisseD(m, 9, 7), { fill: col });
    if (!lontano) d += path(`M${n(m[0] - 5)} ${n(m[1] - 1)}l9 -2M${n(m[0] - 4)} ${n(m[1] + 3)}l8 -1`, { stroke: schiarisci(gola, 0.1), "stroke-width": 1.2, opacity: 0.8 });
    return d;
  };
  s = braccio(mani[1], true) + s + braccio(mani[0], false);
  // il nodo tra le zampe: un capo di rete
  if (z === "nodo") s += path(`M${pt(add(mani[0], [-4, 2]))}q-10 14 -2 24q8 6 14 -4`, { stroke: inLuce("#9a9476", luce), "stroke-width": 2.2, fill: "none" });
  return s;
}

// ------------------------------------------------------------------ lince --
export interface PosaLince {
  t: number;
  modo: "seduta" | "in piedi";
  /** Testa: gradi (+ giù); `guarda` > 0 la gira verso chi guarda (0..1). */
  testa?: number;
  guarda?: number;
  bocca?: number;
  /** Seme: ogni lince ha le sue macchie e il suo colore. */
  seme?: string;
}

/** Una lince delle rive (adulta a scala 1: lunga ~240, alta al garrese ~125; più piccola di Zara). */
export function lince(posa: PosaLince, ctx: CtxFauna): string {
  const { luce, defs, id } = ctx;
  const r = caso(`lince/${posa.seme ?? id}`);
  const t = posa.t;
  const tinta = r.tra(-0.08, 0.1);
  const manto = inLuce(mescola("#bf9f74", tinta > 0 ? "#cda67a" : "#a79a86", Math.abs(tinta) * 2.5), luce);
  const mantoS = inOmbra(mescola("#9a7d58", "#8d8272", Math.max(0, -tinta) * 2), luce);
  const ventre = inLuce("#ece2cf", luce);
  const macchia = inLuce("#6a5238", luce);
  const nero = inLuce("#1d1916", luce);
  const seduta = posa.modo === "seduta";
  const resp = onda(t, 2.6, r()) * 1.2;
  const url = defs.lineare(`${id}-manto`, [0, -150], [0, 0], [
    [0, schiarisci(manto, 0.08)],
    [1, mantoS],
  ]);
  let s = "";
  let collo: P;
  if (seduta) {
    // seduta come i gatti: le anche tonde a terra, il petto dritto, le zampe davanti diritte
    s += path(tubo([[12, -78], [16, -40], [16, -8]], [10, 9, 8]), { fill: mantoS }); // la zampa lontana
    s += path(curva([[-70, -4], [-76, -44], [-58, -80], [-26, -104], [0, -130 - resp], [26, -140 - resp], [44, -122], [44, -88], [36, -48], [30, -6]], true), { fill: url });
    s += path(curva([[18, -128], [38, -116], [40, -80], [30, -50], [18, -70]], true), { fill: ventre, opacity: 0.9 });
    s += path(tubo([[30, -84], [32, -44], [32, -8]], [11, 10, 9]), { fill: manto }); // la zampa vicina
    s += path(ellisseD([36, -4], 14, 6) + ellisseD([20, -4], 12, 5), { fill: manto });
    // la coda corta, avvolta davanti alle zampe, col fiocco nero
    s += path(curva([[-58, -6], [-30, 2], [0, 2], [14, -4]]), { stroke: manto, "stroke-width": 12, fill: "none", "stroke-linecap": "round" });
    s += path(ellisseD([16, -5], 7, 6), { fill: nero });
    collo = [28, -142 - resp];
  } else {
    // in piedi: tronco compatto, zampe forti e piedi grandi («da neve»)
    const gamba = (a: P, b: P, c: P, rr: number, col: string) => path(tubo([a, b, c], [rr, rr * 0.85, rr * 0.75]), { fill: col }) + path(ellisseD(add(c, [5, -2]), rr * 1.3, rr * 0.55), { fill: col });
    s += gamba([28, -86], [26, -44], [22, -6], 10, mantoS) + gamba([-84, -82], [-94, -44], [-96, -6], 11, mantoS);
    // la coda corta, un poco su, col fiocco nero
    s += path(curva([[-102, -104], [-120, -112], [-128, -104]]), { stroke: manto, "stroke-width": 13, fill: "none", "stroke-linecap": "round" }) + path(ellisseD([-130, -103], 7, 6), { fill: nero });
    s += path(curva([[-106, -96], [-98, -118 - resp], [-50, -126 - resp], [20, -128], [58, -118], [72, -96], [62, -74], [10, -70], [-50, -70], [-96, -78]], true), { fill: url });
    s += path(curva([[-60, -74], [0, -72], [50, -80], [60, -92], [30, -80]], true), { fill: ventre, opacity: 0.85 });
    s += gamba([48, -86], [50, -44], [50, -6], 11, manto) + gamba([-70, -84], [-66, -46], [-72, -6], 12, manto);
    collo = [64, -122];
  }
  // le macchie (ognuna la sua)
  let m = "";
  for (let i = 0; i < 18; i++) {
    const x = seduta ? r.tra(-62, 24) : r.tra(-96, 50);
    const y = seduta ? r.tra(-110, -20) : r.tra(-120, -80);
    m += ellisseD([x, y], r.tra(2.5, 5), r.tra(2, 4));
  }
  s += path(m, { fill: macchia, opacity: 0.5 });
  // la testa: muso «quasi come quello di Zara», la gorgiera, i ciuffi NERI dritti
  const gira = clamp(posa.guarda ?? 0);
  let testa = path(curva([[-26, 12], [-30, -10], [-18, -28], [4, -32], [24, -24], [34, -8], [32, 8], [14, 18], [-12, 22]], true), { fill: manto });
  testa += path(curva([[-22, 8], [-32, 26], [-16, 36], [0, 28], [10, 34], [18, 20]], true), { fill: ventre, opacity: 0.92 });
  const orecchio = (x: number, lont: boolean) =>
    path(`M${n(x - 9)} -24L${n(x)} -50L${n(x + 9)} -24Z`, { fill: lont ? mantoS : manto }) + path(`M${n(x)} -50l${n(1 + gira * 2)} -18`, { stroke: nero, "stroke-width": 3.2, "stroke-linecap": "round" });
  testa = orecchio(-14 + gira * 6, true) + testa + orecchio(0 + gira * 10, false);
  const occhio = (x: number) => {
    const ch = palpebra(t, r.tra(3, 5), r());
    return path(ellisseD([x, -8], 4.6, 3.8 * (1 - ch * 0.85)), { fill: mescola("#b8a040", "#6b7a3a", r()) }) + path(ellisseD([x + 0.5, -8], 1.4, 3.3 * (1 - ch * 0.85)), { fill: "#101010" });
  };
  testa += occhio(14 - gira * 6);
  if (gira > 0.4) testa += occhio(-4);
  testa += path(curva([[28, -2], [34, 0], [32, 4], [27, 3]], true), { fill: "#5a3c34" });
  const b = clamp(posa.bocca ?? 0);
  testa += path(`M22 10Q28 ${n(12 + b * 6)} 33 8`, { stroke: "#2a201a", "stroke-width": 1.8, fill: b > 0.15 ? "#3a2019" : "none" });
  testa += path("M4 -26q2 8 0 14M-4 -22q0 6 -2 10M-8 6q10 4 20 2", { stroke: macchia, "stroke-width": 1.8, fill: "none", opacity: 0.7 });
  s += g({ transform: `translate(${n(collo[0])} ${n(collo[1])})rotate(${n(posa.testa ?? 0)})` }, testa);
  return s;
}

// ------------------------------------------------------------- testuggine --
export interface PosaTestuggine {
  t: number;
  /** Il collo fuori (0 = dentro il guscio, 1 = tutto allungato). */
  collo: number;
  bocca?: number;
  /** Testa: gradi (+ giù); per «indicare l'acqua» si abbassa. */
  testa?: number;
}

/** Il Custode di ep02: una testuggine di lago, vecchia, placche e muschio (lunga ~220). */
export function testuggine(posa: PosaTestuggine, ctx: CtxFauna): string {
  const { luce, defs, id } = ctx;
  const t = posa.t;
  const guscio = inLuce("#5d5a3e", luce);
  const guscioS = inOmbra("#3e3b28", luce);
  const pelle = inLuce("#6f6a52", luce);
  const macchie = inLuce("#b8a45e", luce);
  let s = "";
  // le zampe tozze
  s += path(`M-60 -20l-10 20h26zM40 -22l6 22h24z`, { fill: pelle });
  // il guscio a cupola, con le placche
  const url = defs.radiale(`${id}-guscio`, [-10, -90], 150, [
    [0, schiarisci(guscio, 0.12)],
    [1, guscioS],
  ]);
  s += path(curva([[-110, -18], [-100, -62], [-60, -96], [0, -104], [58, -92], [96, -58], [104, -18]], false) + "Z", { fill: url });
  s += path(`M-110 -18Q0 -4 104 -18L100 -8Q0 4 -106 -8Z`, { fill: inLuce("#b8a36b", luce), opacity: 0.8 });
  let placche = "M-70 -30Q-60 -70 -30 -86M-20 -24Q-14 -70 10 -98M30 -26Q42 -64 64 -84M-94 -40Q-40 -50 20 -48Q70 -46 98 -40";
  placche += "M-36 -86Q0 -70 40 -88";
  s += path(placche, { stroke: guscioS, "stroke-width": 3, fill: "none", opacity: 0.8 });
  s += path(ellisseD([-40, -70], 14, 5) + ellisseD([30, -78], 10, 4), { fill: inLuce("#6e7a42", luce), opacity: 0.5 }); // un filo di muschio
  // il collo e la testa: esce piano (sempre piano)
  const k = clamp(posa.collo);
  const base: P = [96, -40];
  const cima: P = [96 + 20 + k * 58, -40 - k * 44];
  const ta = posa.testa ?? 0;
  s += path(curva([base, [base[0] + 20 + k * 20, base[1] - k * 30], cima]), { stroke: pelle, "stroke-width": 22, fill: "none", "stroke-linecap": "round" });
  s += path(`M${n(base[0] + 6)} ${n(base[1] + 4)}Q${n(base[0] + 30 + k * 16)} ${n(base[1] - k * 20)} ${pt(add(cima, [2, 8]))}`, { stroke: macchie, "stroke-width": 3, fill: "none", opacity: 0.6 });
  let testa = path(curva([[-10, 10], [-12, -6], [2, -14], [20, -12], [30, -2], [28, 8], [10, 12]], true), { fill: pelle });
  testa += path("M-4 -8q8 -4 16 -2M0 4q8 4 18 0", { stroke: macchie, "stroke-width": 2.4, fill: "none", opacity: 0.7 });
  // l'occhio: lento, si chiude a metà (un respiro prima di parlare)
  const ch = Math.max(palpebra(t, 5.5, 0.2), 0.35 + 0.1 * Math.sin(t * 0.4));
  testa += path(ellisseD([12, -5], 3.6, 3.4 * (1 - ch * 0.7)), { fill: "#2a2618" }) + path(cerchioD([13, -6], 0.9), { fill: "#fff", opacity: 0.7 * (1 - ch) });
  // il becco corneo e la bocca
  const b = clamp(posa.bocca ?? 0);
  testa += path(`M22 2Q28 ${n(4 + b * 6)} 30 1`, { stroke: "#2a2618", "stroke-width": 2, fill: b > 0.15 ? "#3a2c1c" : "none" });
  s += g({ transform: `translate(${n(cima[0])} ${n(cima[1])})rotate(${n(ta - 10 + k * 10)})` }, testa);
  return s;
}

// ----------------------------------------------------------------- folaga --
/** La folaga che galleggia (p.1): nera, becco e scudo frontale bianchi. Origine: la linea dell'acqua. */
export function folaga(t: number, ctx: CtxFauna, verso = 0): string {
  const { luce } = ctx;
  const nero = inLuce("#1f2022", luce);
  const bianco = inLuce("#f1efe8", luce);
  const dy = Math.sin(t * 1.9) * 1.2;
  const testa = Math.round(Math.sin(t * 1.3) * 2) * 3 + verso * 10;
  let s = path(curva([[-26, 0], [-20, -14 + dy], [4, -18 + dy], [20, -10 + dy], [22, 0]], false) + "Z", { fill: nero });
  let tt = path(cerchioD([0, 0], 8), { fill: nero });
  tt += path(`M6 -4L18 0L6 3Z`, { fill: bianco }) + path(ellisseD([5, -4], 3, 5), { fill: bianco });
  tt += path(cerchioD([1, -2], 1.4), { fill: "#8a1f1a" });
  s += g({ transform: `translate(20 ${n(-24 + dy)})rotate(${testa})` }, tt);
  s += path(`M20 ${n(-18 + dy)}L20 ${n(-10 + dy)}`, { stroke: nero, "stroke-width": 7 });
  return s;
}
