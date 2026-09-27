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
import { ik2, piedeNelPasso } from "./anatomia";
import { clamp, onda, palpebra } from "../motore/tempo";
import type { CtxFauna } from "./fauna";

export const BRENTA_ANCORE = { pelo: "#4a382a", gola: "#d9c9a6" } as const;

// ----------------------------------------------------------------- Brénta --
export interface PosaLontra {
  t: number;
  /**
   * Cosa fanno le zampe: il remo (il manico), un nodo davanti al petto, due colpetti sul
   * bordo, niente; o (ep04) il remo tenuto dritto davanti, come un bastone (`asta`).
   */
  zampe: "remo" | "nodo" | "tocco" | "ferme" | "asta";
  /** Dove stanno le zampe col remo (coordinate della lontra: i piedi a 0, guarda a destra). */
  manico?: P;
  /** Bocca 0..1 (parla). */
  bocca?: number;
  /** Testa: gradi (+ giù), per guardare la corda o in faccia. */
  testa?: number;
  /** Il busto si piega avanti (gradi), quando tira o si china sulla corda. */
  china?: number;
  /** (asta) Il morso al remo (0..1): la testa va al legno (ep04, p.18: «staccò col dente una scaglia dal suo remo»). */
  morde?: number;
  /** (asta) La scaglia staccata: 0 nessuna, poi tra i denti; e sul remo resta il segno. */
  scheggia?: number;
  /**
   * Una lontra qualunque della Gente delle Rive (non Brénta): col suo seme ha il suo pelo,
   * le vibrisse dritte e niente cicatrice. Senza seme è Brénta.
   */
  seme?: string;
}

/** Brénta in piedi (a poppa, di solito: la barca le copre le zampe dietro). */
export function lontra(posa: PosaLontra, ctx: CtxFauna): string {
  const { luce, defs, id } = ctx;
  const t = posa.t;
  const qualunque = posa.seme !== undefined;
  const base = qualunque ? mescola(BRENTA_ANCORE.pelo, caso(`lontra/${posa.seme}`).moneta(0.5) ? "#5e4a36" : "#3d3026", 0.5) : BRENTA_ANCORE.pelo;
  const pelo = inLuce(base, luce);
  const peloLucido = inLuce(schiarisci(base, 0.28), luce);
  const peloScuro = inOmbra(base, luce);
  const gola = inLuce(BRENTA_ANCORE.gola, luce);
  const resp = onda(t, 2.1) * 1.5;
  const morde = posa.zampe === "asta" ? clamp(posa.morde ?? 0) : 0;
  const china = (posa.china ?? 0) + 10 * morde;
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
  // la cicatrice da amo, un filo chiaro sul muso (solo Brénta)
  if (!qualunque) testa += path("M24 -14q6 3 8 9", { stroke: schiarisci(gola, 0.1), "stroke-width": 1.6, fill: "none", opacity: 0.9, "stroke-linecap": "round" });
  // l'occhio castano che ride, con la ruga di chi guarda controluce
  const chiuso = Math.max(palpebra(t, 4.1, 0.3), 0.15);
  testa += path(ellisseD([16, -14], 4.4, 4.2 * (1 - chiuso * 0.8)), { fill: "#2a1c12" });
  testa += path(cerchioD([17.4, -15.6], 1.3), { fill: "#fff", opacity: 1 - chiuso });
  testa += path("M8 -22Q16 -26 24 -21M22 -10q4 3 9 1", { stroke: scurisci(pelo, 0.45), "stroke-width": 1.8, fill: "none", "stroke-linecap": "round" });
  // la bocca
  const b = clamp(posa.bocca ?? 0);
  testa += path(`M30 6Q36 ${n(8 + b * 7)} 42 5`, { stroke: "#1f1712", "stroke-width": 2, fill: b > 0.15 ? "#3a2019" : "none", "stroke-linecap": "round" });
  // IL SEGNO: le vibrisse lunghe, piegate tutte dalla stessa parte (verso il remo); le altre lontre le hanno dritte
  const vib = Math.sin(t * 1.3) * 1.5;
  testa += path(qualunque ? `M38 -2q14 -2 26 ${n(-2 + vib)}M38 0q14 3 26 ${n(6 + vib)}M36 2q12 6 22 ${n(12 + vib)}` : `M38 -2q18 6 30 ${n(20 + vib)}M38 0q14 10 22 ${n(26 + vib)}M36 2q10 12 12 ${n(30 + vib)}M38 -5q22 2 36 ${n(12 + vib)}`, {
    stroke: schiarisci(gola, 0.2),
    "stroke-width": 1.3,
    fill: "none",
    opacity: 0.9,
    "stroke-linecap": "round",
  });
  // la scaglia di remo tra i denti
  const sch = posa.zampe === "asta" ? clamp(posa.scheggia ?? 0) : 0;
  if (sch > 0) testa += path("M34 4l16 -3l2 3l-16 4Z", { fill: inLuce(schiarisci(LEGNO_CHIARO, 0.2), luce), stroke: inOmbra(LEGNO_CHIARO, luce), "stroke-width": 0.8 });
  s += g({ transform: `translate(${n(collo[0])} ${n(collo[1])})rotate(${n(ta - 26 * morde)})` }, testa);
  // le braccia: corte, palmate; SEMPRE in opera
  const spalla: P = add([14 + china * 1.2, -118 - resp], [Math.sin((china * Math.PI) / 180) * 24, 0]);
  let mani: P[];
  const z = posa.zampe;
  if (z === "remo" && posa.manico) mani = [posa.manico, add(posa.manico, [-8, 6])];
  else if (z === "nodo") {
    const a = Math.sin(t * 6.3);
    mani = [add(spalla, [34 + a * 5, 26 + Math.cos(t * 6.3) * 4]), add(spalla, [24 - a * 5, 30])];
  } else if (z === "asta") {
    // il remo dritto davanti, tenuto con tutte e due le zampe (una più su)
    mani = [[58, -118 - resp], [56, -84]];
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
  // il remo dritto (asta): la pala a terra, il fusto su fino sopra la testa; dove ha morso, il legno vivo
  let asta = "";
  if (z === "asta") {
    const legno = inLuce(LEGNO_CHIARO, luce);
    const legnoS = inOmbra(LEGNO_CHIARO, luce);
    asta += path("M52 0Q44 -34 50 -74L60 -74Q66 -34 58 0Z", { fill: legno, stroke: legnoS, "stroke-width": 1.2 });
    asta += path("M52 -72L50 -250Q55 -256 60 -250L60 -72Z", { fill: legno });
    asta += path("M53 -240L53 -84", { stroke: schiarisci(legno, 0.2), "stroke-width": 1.4, opacity: 0.6 });
    if (sch > 0) asta += path(ellisseD([57, -178], 3.4, 8), { fill: inLuce(schiarisci(LEGNO_CHIARO, 0.35), luce) });
  }
  s = braccio(mani[1], true) + asta + s + braccio(mani[0], false);
  // il nodo tra le zampe: un capo di rete
  if (z === "nodo") s += path(`M${pt(add(mani[0], [-4, 2]))}q-10 14 -2 24q8 6 14 -4`, { stroke: inLuce("#9a9476", luce), "stroke-width": 2.2, fill: "none" });
  return s;
}

/** Il legno chiaro dei remi (lo stesso di scene/lago.ts). */
const LEGNO_CHIARO = "#a8865c";

/** La scaglia di remo (ep04, p.18): una scheggia chiara di legno vecchio, posata (origine: il suo centro). */
export function scagliaDiRemo(luce: Luce, c: P, ang = 0): string {
  return g(
    { transform: `translate(${n(c[0])} ${n(c[1])})rotate(${n(ang)})` },
    path("M-11 -1l20 -4l3 3l-20 5Z", { fill: inLuce(schiarisci(LEGNO_CHIARO, 0.2), luce), stroke: inOmbra(LEGNO_CHIARO, luce), "stroke-width": 0.8 }) +
      path("M-8 0l16 -3", { stroke: inOmbra(LEGNO_CHIARO, luce), "stroke-width": 0.6, opacity: 0.6 }),
  );
}

// ------------------------------------------------------- lontre in acqua --
export interface PosaNuoto {
  t: number;
  /** ogni lontra il suo pelo */
  seme: string;
  bocca?: number;
  /** testa: gradi (+ giù) */
  testa?: number;
  /** travolta dalla corrente (0..1): gira su sé stessa, e schizza (ep04, p.3: «nessuna schiena di lontra la reggeva») */
  travolta?: number;
}

/**
 * Una lontra che nuota (ep04: «le lontre in acqua»): la testa fuori, la schiena che
 * affiora, la punta della coda; dietro, la scia a V. Origine: il pelo dell'acqua, sotto
 * il muso; guarda a destra, lunga ~170.
 */
export function lontraCheNuota(posa: PosaNuoto, ctx: CtxFauna): string {
  const { luce } = ctx;
  const t = posa.t;
  const r = caso(`nuoto/${posa.seme}`);
  const base = mescola(BRENTA_ANCORE.pelo, r.moneta(0.5) ? "#5e4a36" : "#3a2d22", r.tra(0.2, 0.6));
  const pelo = inLuce(base, luce);
  const lucido = inLuce(schiarisci(base, 0.3), luce);
  const gola = inLuce(BRENTA_ANCORE.gola, luce);
  const acqua = inLuce("#dfe4df", luce);
  const dondola = Math.sin(t * 2.4 + r.tra(0, 6)) * 2;
  const tv = clamp(posa.travolta ?? 0);
  let s = "";
  // la scia: due linee che si aprono dietro
  s += path(`M20 4Q-40 10 -120 22M20 2Q-50 2 -130 -2`, { stroke: acqua, "stroke-width": 2, fill: "none", opacity: 0.45 * (1 - tv), "stroke-linecap": "round" });
  // la schiena che affiora e la punta della coda
  s += path(`M-120 2Q-86 ${n(-12 + dondola)} -40 -8Q-10 -4 4 0Z`, { fill: pelo });
  s += path(`M-104 -2Q-72 ${n(-10 + dondola)} -40 -6`, { stroke: lucido, "stroke-width": 2, fill: "none", opacity: 0.6 });
  s += path(`M-150 2q10 ${n(-6 + dondola)} 20 -2`, { stroke: pelo, "stroke-width": 5, fill: "none", "stroke-linecap": "round" });
  // la testa
  let testa = path(curva([[-26, 4], [-28, -14], [-14, -28], [8, -30], [28, -22], [40, -10], [42, 2], [30, 12], [6, 16], [-16, 14]], true), { fill: pelo });
  testa += path(curva([[14, 6], [30, 4], [40, -2], [42, 4], [32, 12], [16, 14]], true), { fill: gola, opacity: 0.85 });
  // il lucido del pelo bagnato sulla testa (di notte è quello che si vede)
  testa += path("M-20 -18Q-2 -31 22 -24", { stroke: lucido, "stroke-width": 2.6, fill: "none", opacity: 0.75, "stroke-linecap": "round" });
  testa += path(ellisseD([-16, -22], 6, 5), { fill: inOmbra(base, luce) });
  testa += path(curva([[36, -10], [44, -8], [46, -2], [40, 0], [34, -4]], true), { fill: "#1f1712" });
  const ch = palpebra(t, 3.6 + r.tra(0, 1), r());
  testa += path(ellisseD([16, -14], 4.2, 4 * (1 - ch * 0.8)), { fill: "#2a1c12" });
  const b = clamp(posa.bocca ?? 0);
  testa += path(`M30 6Q36 ${n(8 + b * 7)} 42 5`, { stroke: "#1f1712", "stroke-width": 2, fill: b > 0.15 ? "#3a2019" : "none", "stroke-linecap": "round" });
  testa += path("M38 -2q14 -2 24 -2M38 0q14 3 24 6", { stroke: schiarisci(gola, 0.2), "stroke-width": 1.2, fill: "none", opacity: 0.85 });
  s += g({ transform: `translate(8 ${n(-14 + dondola * 0.5)})rotate(${n((posa.testa ?? 0) - 8)})` }, testa);
  // il pelo dell'acqua davanti: la taglia a filo
  s += path(`M-160 1Q-20 5 60 1`, { stroke: acqua, "stroke-width": 2.4, fill: "none", opacity: 0.55 });
  if (tv > 0) {
    // travolta: gira su sé stessa, e l'acqua schizza bianca
    let sp = "";
    for (let i = 0; i < 10; i++) {
      const a = r.tra(0, Math.PI);
      const d = r.tra(20, 70) * tv;
      sp += ellisseD([Math.cos(a) * d - 40, -Math.sin(a) * d * 0.8], r.tra(3, 7), r.tra(2, 5));
    }
    s = g({ transform: `rotate(${n(-34 * tv * Math.sin(t * 6))} -40 0)` }, s) + path(sp, { fill: acqua, opacity: 0.7 * tv });
  }
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
  /** (in piedi) Il passo (ep04, le staffette): la fase, dalla strada fatta; l'ampiezza 0..1. */
  fase?: number;
  ampiezza?: number;
  /** (in piedi) Il salto di sasso in sasso: 0 le zampe sotto, 1 distese in volo. */
  volo?: number;
  /** Cosa porta in bocca (ep04): un piccolo preso per la collottola, o la cesta di giunchi coi topi d'acqua. */
  porta?: "cucciolo" | "cesta";
  /** Trema (0..1): la piccola coi massi davanti (ep04, p.6). */
  trema?: number;
  /** Bagnata di pioggia (0..1): il manto più scuro. */
  bagnata?: number;
}

/** Le zampe della lince in piedi: [radice, piede a riposo, lunghezze, piega], lontana davanti, lontana dietro, vicina davanti, vicina dietro. */
const ZAMPE_LINCE: readonly (readonly [P, P, number, number, 1 | -1, number])[] = [
  [[28, -86], [22, -6], 44, 42, 1, 0.75],
  [[-84, -82], [-96, -6], 44, 40, -1, 0.5],
  [[48, -86], [50, -6], 44, 42, 1, 0.25],
  [[-70, -84], [-72, -6], 44, 40, -1, 0],
];

/** Una lince delle rive (adulta a scala 1: lunga ~240, alta al garrese ~125; più piccola di Zara). */
export function lince(posa: PosaLince, ctx: CtxFauna): string {
  const { luce, defs, id } = ctx;
  const r = caso(`lince/${posa.seme ?? id}`);
  const t = posa.t;
  const tinta = r.tra(-0.08, 0.1);
  const bagnata = clamp(posa.bagnata ?? 0);
  const manto = inLuce(mescola(mescola("#bf9f74", tinta > 0 ? "#cda67a" : "#a79a86", Math.abs(tinta) * 2.5), "#5e4d3a", bagnata * 0.35), luce);
  const mantoS = inOmbra(mescola(mescola("#9a7d58", "#8d8272", Math.max(0, -tinta) * 2), "#4a3d2e", bagnata * 0.35), luce);
  const ventre = inLuce("#ece2cf", luce);
  const macchia = inLuce("#6a5238", luce);
  const nero = inLuce("#1d1916", luce);
  const seduta = posa.modo === "seduta";
  const resp = onda(t, 2.6, r()) * 1.2;
  // il passo e il salto (ep04): le zampe con la cinematica, invece che ferme
  const muove = !seduta && (posa.fase !== undefined || (posa.volo ?? 0) > 0);
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
  } else if (muove) {
    // in piedi che va (ep04): il passo laterale, o il salto — le zampe raccolte sotto, poi distese
    const vo = clamp(posa.volo ?? 0);
    const amp = clamp(posa.ampiezza ?? 1) * (1 - vo);
    const bob = -2.4 * Math.cos((posa.fase ?? 0) * Math.PI * 4) * amp;
    const gambaIK = (k: number, rr: number, col: string) => {
      const [anca, riposo, l1, l2, piega, off] = ZAMPE_LINCE[k];
      const radice = add(anca, [0, bob]);
      const p = piedeNelPasso((posa.fase ?? 0) + off, 46 * amp, 14 * amp);
      const avanti = piega === 1 ? 1 : -1;
      const piede: P = [riposo[0] + p.dx + avanti * 52 * vo, riposo[1] + p.dy - 16 * vo];
      const { ginocchio, fine } = ik2(radice, piede, l1, l2, piega);
      return path(tubo([radice, ginocchio, fine], [rr, rr * 0.85, rr * 0.75]), { fill: col }) + path(ellisseD(add(fine, [5, -2]), rr * 1.3, rr * 0.55), { fill: col });
    };
    s += gambaIK(0, 10, mantoS) + gambaIK(1, 11, mantoS);
    s += path(curva([[-102, -104 + bob], [-120, -112 + bob], [-128, -104 + bob]]), { stroke: manto, "stroke-width": 13, fill: "none", "stroke-linecap": "round" }) + path(ellisseD([-130, -103 + bob], 7, 6), { fill: nero });
    s += path(curva([[-106, -96 + bob], [-98, -118 - resp + bob], [-50, -126 - resp + bob], [20, -128 + bob], [58, -118 + bob], [72, -96 + bob], [62, -74 + bob], [10, -70 + bob], [-50, -70 + bob], [-96, -78 + bob]], true), { fill: url });
    s += path(curva([[-60, -74 + bob], [0, -72 + bob], [50, -80 + bob], [60, -92 + bob], [30, -80 + bob]], true), { fill: ventre, opacity: 0.85 });
    s += gambaIK(2, 11, manto) + gambaIK(3, 12, manto);
    collo = [64, -122 + bob];
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
  // quel che porta in bocca: appeso alla bocca, giù a piombo (non gira con la testa)
  if (posa.porta) {
    const a = ((posa.testa ?? 0) * Math.PI) / 180;
    const bocca: P = add(collo, [Math.cos(a) * 27 - Math.sin(a) * 12, Math.sin(a) * 27 + Math.cos(a) * 12]);
    s += posa.porta === "cucciolo" ? cucciolo(t, bocca, luce, `${id}-cucciolo`, clamp(posa.trema ?? 0)) : cestaDiGiunchi(t, bocca, luce);
  }
  // chi trema: un tremito fitto e piccolo, tutto intero
  const tr = clamp(posa.trema ?? 0);
  if (tr > 0) s = g({ transform: `translate(${n(Math.sin(t * 41) * 1.4 * tr)} ${n(Math.sin(t * 29 + 1) * 0.6 * tr)})` }, s);
  return s;
}

/**
 * Un piccolo di lince preso per la collottola (ep04, p.6: «un batuffolo di fratello in
 * bocca»): tondo di pelo, le zampine che penzolano, gli occhi chiusi — come stanno i
 * piccoli quando li portano. Appeso al punto `presa` (la bocca di chi lo porta).
 */
export function cucciolo(t: number, presa: P, luce: Luce, id: string, trema = 0): string {
  const pelo = inLuce("#cbb89a", luce);
  const peloS = inOmbra("#a8977c", luce);
  const macchia = inLuce("#7a654a", luce);
  const r = caso(`cucciolo/${id}`);
  const dondola = Math.sin(t * 2.1) * 5 + Math.sin(t * 23) * 1.5 * trema;
  let s = "";
  // le zampine e la coda, dietro
  s += path(tubo([[-8, 26], [-10, 38], [-9, 44]], [4, 3.5, 3]) + tubo([[8, 27], [10, 39], [9, 45]], [4, 3.5, 3]), { fill: peloS });
  s += path(curva([[-12, 22], [-22, 30], [-20, 40]]), { stroke: peloS, "stroke-width": 5, fill: "none", "stroke-linecap": "round" });
  // il corpo: un batuffolo (tante piccole tonde sul bordo)
  let bordo = ellisseD([0, 18], 14, 16);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    bordo += ellisseD([Math.cos(a) * 13, 18 + Math.sin(a) * 15], 4.5, 4.5);
  }
  s += path(bordo, { fill: pelo });
  let m = "";
  for (let i = 0; i < 7; i++) m += ellisseD([r.tra(-8, 8), r.tra(8, 30)], 1.6, 1.3);
  s += path(m, { fill: macchia, opacity: 0.6 });
  // le zampine davanti
  s += path(tubo([[-4, 28], [-5, 40], [-4, 46]], [4, 3.5, 3]) + tubo([[5, 29], [6, 40], [5, 47]], [4, 3.5, 3]), { fill: pelo });
  // la testa, girata verso chi guarda: occhi chiusi, orecchie piccole coi ciuffetti
  s += path(`M-9 2l-2 -10l7 6ZM9 2l2 -10l-7 6Z`, { fill: peloS });
  s += path(ellisseD([0, 4], 10, 8.5), { fill: pelo });
  s += path("M-5 4q2 1.6 4 0M1 4q2 1.6 4 0", { stroke: "#2a211a", "stroke-width": 1.2, fill: "none", "stroke-linecap": "round" });
  s += path(ellisseD([0, 8], 1.8, 1.2), { fill: "#8a5a50" });
  return g({ transform: `translate(${n(presa[0])} ${n(presa[1] - 4)})rotate(${n(dondola)})` }, s);
}

/**
 * La cesta di giunchi coi topi d'acqua dentro (ep04, p.12: «una nidiata intera di topi
 * d'acqua dentro una cesta di giunchi»): intrecciata, col manico in bocca a chi la
 * porta; dal bordo spuntano le testine, a turno.
 */
export function cestaDiGiunchi(t: number, presa: P, luce: Luce): string {
  const giunco = inLuce("#a88d5a", luce);
  const giuncoS = inOmbra("#7a643c", luce);
  const topo = inLuce("#6b5540", luce);
  const topoS = inOmbra("#4d3c2c", luce);
  const dondola = Math.sin(t * 1.9) * 4;
  let s = "";
  // il manico: un arco dalla bocca ai due lati della cesta
  s += path("M-24 30Q-20 -2 0 0Q20 -2 24 30", { stroke: giuncoS, "stroke-width": 4, fill: "none", "stroke-linecap": "round" });
  // le testine che spuntano, a turno (dietro il bordo davanti)
  for (let i = 0; i < 3; i++) {
    const su = Math.max(0, Math.sin(t * 1.3 + i * 2.1)) ** 2;
    const x = -14 + i * 14;
    const y = 30 - su * 9;
    s += path(ellisseD([x, y], 6, 5.5) + ellisseD([x - 4, y - 4], 2.6, 2.6) + ellisseD([x + 4, y - 4], 2.6, 2.6), { fill: topo });
    s += path(ellisseD([x - 2, y - 1], 1.3, 1.3) + ellisseD([x + 2, y - 1], 1.3, 1.3), { fill: "#111" });
    s += path(ellisseD([x, y + 2.5], 1.4, 1), { fill: topoS });
  }
  // la cesta: più larga in alto, a trama
  const corpo = "M-28 30L-22 62Q0 68 22 62L28 30Q0 36 -28 30Z";
  s += path(corpo, { fill: giunco });
  let trama = "";
  for (let y = 36; y < 64; y += 6) trama += `M${n(-27 + (y - 30) * 0.18)} ${y}Q0 ${y + 5} ${n(27 - (y - 30) * 0.18)} ${y}`;
  for (let x = -20; x <= 20; x += 8) trama += `M${x} 33L${n(x * 0.8)} 64`;
  s += path(trama, { stroke: giuncoS, "stroke-width": 1.6, fill: "none", opacity: 0.8 });
  s += path("M-28 30Q0 36 28 30", { stroke: giuncoS, "stroke-width": 3.4, fill: "none" });
  return g({ transform: `translate(${n(presa[0])} ${n(presa[1] - 2)})rotate(${n(dondola)})` }, s);
}

// ------------------------------------------------------------- testuggine --
export interface PosaTestuggine {
  t: number;
  /** Il collo fuori (0 = dentro il guscio, 1 = tutto allungato). */
  collo: number;
  bocca?: number;
  /** Testa: gradi (+ giù); per «indicare l'acqua» si abbassa. */
  testa?: number;
  /**
   * Il guscio liscio di Rèmolo, il Custode anziano (ep04): levigato da anni di riposo
   * contro le pietre antiche, chiaro e senza placche; l'occhio verde-acqua slavato.
   */
  liscio?: boolean;
  /** Il respiro visibile prima di parlare (0..1): la gola che si gonfia (la sua posa-firma). */
  respiro?: number;
  /** Il cenno (0..1): la testa che scende e torna — il saluto (ep04, p.19). */
  cenno?: number;
  /** Il passo, lento (la fase; ep04, p.8: «alla sua velocità, che era una: lenta»). */
  fase?: number;
}

/** Rèmolo, il Custode anziano (saga/bible/comprimari/custode-anziano.md, ancore colore): il guscio, la pelle, gli occhi. */
export const REMOLO_ANCORE = { guscio: "#b8a488", pelle: "#9b968c", occhi: "#a8b8a0" } as const;

/** Il Custode di ep02: una testuggine di lago, vecchia, placche e muschio (lunga ~220); con `liscio`, Rèmolo (ep04). */
export function testuggine(posa: PosaTestuggine, ctx: CtxFauna): string {
  const { luce, defs, id } = ctx;
  const t = posa.t;
  const liscio = !!posa.liscio;
  const guscio = inLuce(liscio ? REMOLO_ANCORE.guscio : "#5d5a3e", luce);
  const guscioS = inOmbra(liscio ? mescola(REMOLO_ANCORE.pelle, "#4e4a42", 0.45) : "#3e3b28", luce);
  const pelle = inLuce(liscio ? REMOLO_ANCORE.pelle : "#6f6a52", luce);
  const macchie = inLuce(liscio ? "#c9c1ab" : "#b8a45e", luce);
  // il passo lento: le zampe avanti e indietro a coppie, il guscio che dondola appena
  const passa = posa.fase !== undefined;
  const f = (posa.fase ?? 0) * Math.PI * 2;
  const dx1 = passa ? Math.sin(f) * 10 : 0;
  const dx2 = passa ? Math.sin(f + Math.PI) * 10 : 0;
  const su1 = passa ? Math.max(0, Math.cos(f)) * 5 : 0;
  const su2 = passa ? Math.max(0, Math.cos(f + Math.PI)) * 5 : 0;
  const dondola = passa ? Math.sin(f * 2) * 1.2 : 0;
  let s = "";
  // le zampe tozze (quelle di Rèmolo: colonne larghe da elefante, con le unghie chiare)
  if (liscio) {
    const colonna = (x: number, su: number) => `M${n(x - 12)} ${n(-28 - su)}Q${n(x - 15)} ${n(-10 - su)} ${n(x - 13)} ${n(-su)}H${n(x + 13)}Q${n(x + 15)} ${n(-12 - su)} ${n(x + 10)} ${n(-28 - su)}Z`;
    const unghie = (x: number, su: number) => `M${n(x - 8)} ${n(-1 - su)}v-4M${n(x)} ${n(-1 - su)}v-4M${n(x + 8)} ${n(-1 - su)}v-4`;
    s += path(colonna(-40 + dx2 * 0.8, su2) + colonna(62 + dx1 * 0.8, su1), { fill: inOmbra(REMOLO_ANCORE.pelle, luce) });
    s += path(colonna(-60 + dx1, su1) + colonna(44 + dx2, su2), { fill: pelle });
    s += path(unghie(-60 + dx1, su1) + unghie(44 + dx2, su2), { stroke: inLuce("#d8d0bc", luce), "stroke-width": 2, "stroke-linecap": "round", fill: "none", opacity: 0.8 });
  } else s += path(passa ? `M${n(-60 + dx1)} ${n(-20 - su1)}l-10 ${n(20)}h26zM${n(40 + dx2)} ${n(-22 - su2)}l6 ${n(22)}h24z` : `M-60 -20l-10 20h26zM40 -22l6 22h24z`, { fill: pelle });
  // il guscio a cupola, con le placche (o liscio, levigato dalle pietre)
  const url = defs.radiale(`${id}-guscio`, [-10, -90], 150, [
    [0, schiarisci(guscio, liscio ? 0.2 : 0.12)],
    [1, guscioS],
  ]);
  const dCupola = curva([[-110, -18], [-100, -62], [-60, -96], [0, -104], [58, -92], [96, -58], [104, -18]], false) + "Z";
  // (il guscio di Rèmolo ha il contorno: liscio sì, ma è un guscio, non una pietra)
  let corpo = path(dCupola, liscio ? { fill: url, stroke: inOmbra("#5e584c", luce), "stroke-width": 3 } : { fill: url });
  corpo += path(`M-110 -18Q0 -4 104 -18L100 -8Q0 4 -106 -8Z`, { fill: inLuce(liscio ? "#cbbd9c" : "#b8a36b", luce), opacity: 0.8 });
  if (liscio) {
    // levigato: niente placche, gli anelli di crescita (e l'ombra delle placche che non ci sono
    // più), l'orlo segnato, e il lucido della pietra
    corpo += path("M-86 -40Q0 -70 84 -42M-60 -70Q0 -92 56 -72M-100 -26Q0 -44 96 -26", { stroke: guscioS, "stroke-width": 2.2, fill: "none", opacity: 0.55 });
    corpo += path("M-44 -30Q-40 -62 -24 -94M34 -30Q42 -62 32 -96", { stroke: guscioS, "stroke-width": 1.6, fill: "none", opacity: 0.25 });
    corpo += path("M-108 -17Q0 -3 102 -17", { stroke: inOmbra("#5e584c", luce), "stroke-width": 2, fill: "none", opacity: 0.7 });
    corpo += path(ellisseD([-24, -82], 46, 9), { fill: "#f4efe2", opacity: 0.22 });
  } else {
    let placche = "M-70 -30Q-60 -70 -30 -86M-20 -24Q-14 -70 10 -98M30 -26Q42 -64 64 -84M-94 -40Q-40 -50 20 -48Q70 -46 98 -40";
    placche += "M-36 -86Q0 -70 40 -88";
    corpo += path(placche, { stroke: guscioS, "stroke-width": 3, fill: "none", opacity: 0.8 });
    corpo += path(ellisseD([-40, -70], 14, 5) + ellisseD([30, -78], 10, 4), { fill: inLuce("#6e7a42", luce), opacity: 0.5 }); // un filo di muschio
  }
  s += passa ? g({ transform: `rotate(${n(dondola)} 0 -20)` }, corpo) : corpo;
  // il collo e la testa: esce piano (sempre piano)
  const k = clamp(posa.collo);
  const base: P = [96, -40];
  const cima: P = [96 + 20 + k * 58, -40 - k * 44];
  const ta = (posa.testa ?? 0) + 22 * clamp(posa.cenno ?? 0);
  s += path(curva([base, [base[0] + 20 + k * 20, base[1] - k * 30], cima]), { stroke: pelle, "stroke-width": 22, fill: "none", "stroke-linecap": "round" });
  s += path(`M${n(base[0] + 6)} ${n(base[1] + 4)}Q${n(base[0] + 30 + k * 16)} ${n(base[1] - k * 20)} ${pt(add(cima, [2, 8]))}`, { stroke: macchie, "stroke-width": 3, fill: "none", opacity: 0.6 });
  // il respiro prima di parlare: la gola che si gonfia, sotto il collo
  const rs = clamp(posa.respiro ?? 0);
  if (rs > 0) s += path(ellisseD(add(cima, [-10 - 8 * k, 14]), 10 + 6 * rs, 5 + 7 * rs), { fill: inLuce(liscio ? "#b3ad9f" : "#8a8468", luce) });
  let testa = path(curva([[-10, 10], [-12, -6], [2, -14], [20, -12], [30, -2], [28, 8], [10, 12]], true), { fill: pelle });
  testa += path("M-4 -8q8 -4 16 -2M0 4q8 4 18 0", { stroke: macchie, "stroke-width": 2.4, fill: "none", opacity: 0.7 });
  // l'occhio: lento, si chiude a metà (un respiro prima di parlare); quello di Rèmolo, verde-acqua slavato
  const ch = Math.max(palpebra(t, 5.5, 0.2), 0.35 + 0.1 * Math.sin(t * 0.4));
  if (liscio) testa += path(ellisseD([12, -5], 3.8, 3.6 * (1 - ch * 0.7)), { fill: inLuce(REMOLO_ANCORE.occhi, luce) }) + path(ellisseD([12.6, -5], 1.4, 2.4 * (1 - ch * 0.7)), { fill: "#1d1c16" });
  else testa += path(ellisseD([12, -5], 3.6, 3.4 * (1 - ch * 0.7)), { fill: "#2a2618" });
  testa += path(cerchioD([13, -6], 0.9), { fill: "#fff", opacity: 0.7 * (1 - ch) });
  // il becco corneo e la bocca
  const b = clamp(posa.bocca ?? 0);
  testa += path(`M22 2Q28 ${n(4 + b * 6)} 30 1`, { stroke: "#2a2618", "stroke-width": 2, fill: b > 0.15 ? "#3a2c1c" : "none" });
  s += g({ transform: `translate(${n(cima[0])} ${n(cima[1])})rotate(${n(ta - 10 + k * 10)})` }, testa);
  return s;
}

// ------------------------------------------------------------------- rana --
export interface PosaRana {
  t: number;
  /** Canta (0..1): i sacchi vocali che si gonfiano e si sgonfiano, a colpi (il coro). */
  canta: number;
  /** ogni rana il suo verde e le sue macchie, e il suo ritmo */
  seme?: string;
}

/**
 * Una rana delle rive (ep04: il coro di ogni sera; la creatura dell'episodio): verde
 * d'acqua con le macchie scure, la riga chiara sul dorso, il ventre crema, l'occhio
 * d'oro in cima alla testa; quando canta, ai lati della bocca le si gonfiano i sacchi
 * — due palloncini grigio-chiari. Seduta, di profilo, guarda a destra; piedi a y=0,
 * lunga ~70 a scala 1.
 */
export function rana(posa: PosaRana, ctx: CtxFauna): string {
  const { luce, defs, id } = ctx;
  const t = posa.t;
  const r = caso(`rana/${posa.seme ?? id}`);
  const verde = inLuce(mescola("#6f8a3a", r.moneta(0.5) ? "#7a7a3e" : "#5b7a3c", r.tra(0.1, 0.6)), luce);
  const verdeS = inOmbra("#4d6128", luce);
  const scuro = inLuce("#34401c", luce);
  const crema = inLuce("#d9d2a0", luce);
  const ritmo = r.tra(2.8, 4.2);
  const fase = r.tra(0, 6);
  // il canto: colpi rapidi (il sacco si gonfia a ogni «cra»)
  const colpo = Math.max(0, Math.sin(t * ritmo * Math.PI * 2 + fase)) ** 0.6;
  const sacco = clamp(posa.canta) * colpo;
  let s = "";
  // la zampa di dietro lontana (appena), il corpo, la coscia grande piegata, il piede lungo avanti
  s += path(ellisseD([-14, -8], 16, 8), { fill: verdeS });
  const url = defs.lineare(`${id}-rana`, [0, -40], [0, 0], [
    [0, schiarisci(verde, 0.1)],
    [1, verdeS],
  ]);
  s += path(curva([[-34, -6], [-30, -24], [-10, -36], [16, -36], [34, -26], [40, -14], [30, -4], [0, -2]], true), { fill: url });
  s += path(curva([[-10, -6], [14, -4], [32, -8], [22, -2], [0, 0]], true), { fill: crema, opacity: 0.9 });
  // le macchie e la riga chiara sul dorso
  let m = "";
  for (let i = 0; i < 7; i++) m += ellisseD([r.tra(-26, 20), r.tra(-30, -14)], r.tra(2.4, 4.6), r.tra(1.8, 3.4));
  s += path(m, { fill: scuro, opacity: 0.7 });
  s += path("M-26 -24Q-4 -38 24 -32", { stroke: inLuce("#b6c47a", luce), "stroke-width": 2.2, fill: "none", opacity: 0.7 });
  // la coscia piegata e il piede lungo, palmato, in avanti lungo il suolo
  s += path(ellisseD([-18, -12], 18, 11), { fill: verde });
  s += path(`M-4 -2L22 -1L30 0L22 1L-4 1Z`, { fill: verdeS });
  s += path("M-18 -16q10 -2 16 4", { stroke: scuro, "stroke-width": 1.6, fill: "none", opacity: 0.5 });
  // la zampa davanti, dritta
  s += path(tubo([[24, -14], [28, -6], [30, 0]], [4, 3.2, 2.6]), { fill: verde });
  s += path("M26 0h10", { stroke: verde, "stroke-width": 2.2, "stroke-linecap": "round" });
  // il sacco vocale (quello vicino), all'angolo della bocca: un palloncino di pelle
  // chiara e sottile, lucido, che si gonfia a ogni «cra»
  if (sacco > 0.02) {
    const c: P = [31, -13];
    const gs = defs.radiale(`${id}-sacco`, [c[0] - 3, c[1] - 3], 13, [
      [0, inLuce("#f4f2e6", luce)],
      [1, inLuce("#b7bba9", luce)],
    ]);
    s += path(ellisseD(c, 4 + 7 * sacco, 3 + 7 * sacco), { fill: gs, opacity: 0.94 });
    s += path(ellisseD([c[0] - 2 - 1.5 * sacco, c[1] - 2 - 2 * sacco], 1.2 + 1.6 * sacco, 0.8 + 1 * sacco), { fill: "#ffffff", opacity: 0.7 });
  }
  // la testa: il muso piatto, la bocca lunga, l'occhio d'oro in cima con la riga scura
  s += path("M22 -22Q38 -24 42 -16", { stroke: scuro, "stroke-width": 1.4, fill: "none" });
  s += path("M18 -30L40 -18", { stroke: scuro, "stroke-width": 2.4, opacity: 0.55, "stroke-linecap": "round" });
  const ch = palpebra(t, r.tra(3, 5), r());
  s += path(ellisseD([22, -34], 6, 5.4), { fill: verde });
  s += path(ellisseD([23, -35], 4.4, 4 * (1 - ch * 0.9)), { fill: inLuce("#c9a441", luce) });
  s += path(ellisseD([23.4, -35], 2.6, 1.3 * (1 - ch * 0.9)), { fill: "#141208" });
  s += path(ellisseD([38, -22], 1.2, 1), { fill: scuro });
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
