// cartoni/cast/cervara.ts — Cervara, la lince giovane: il vanto delle rive (pupazzo di profilo).
//
// Fonte: saga/bible/comprimari/specchio-di-zara.md → «Morfologia di reference (vincolante)».
// Quello che il pupazzo DEVE rispettare, sempre:
//  - lince giovane compatta: più bassa di Zara ma più larga di spalla; zamponi da neve;
//  - manto sabbia-freddo #c9b18e a macchie brevi e nitide; basette ampie che
//    incorniciano il muso; coda corta a punta nera;
//  - IL SEGNO: i ciuffi auricolari NERI, lunghi, perfetti — con le punte un filo
//    piegate (se li lecca quando è nervosa): chi guarda bene lo nota, è il suo tell;
//  - occhi nocciola-oro #c2a35c, taglio calmo: lo sguardo di chi non deve dimostrare;
//  - il portamento: sta dritta, a suo agio, SENZA gonfiarsi (l'opposto di Zara).
// Ancore colore: #c9b18e · #1f1c18 · #c2a35c (blindate da test/cartoni.motore.test.ts).
// Coordinate locali: guarda a destra, piedi a y=0; un poco più bassa di Zara.

import { type Luce, inLuce, inOmbra, mescola, scurisci, schiarisci } from "../motore/colore";
import { caso } from "../motore/caso";
import { type Defs, type P, DEG, add, cerchioD, curva, ellisseD, g, mix, n, path, pt, rot, tr, tubo } from "../motore/svg";
import { clamp, lerp, onda, palpebra } from "../motore/tempo";
import { corpoDaSpina, ik2, piedeNelPasso } from "./anatomia";
import type { CtxPupazzo } from "./rocco";

/** Ancore colore dalla scheda: manto, il nero dei ciuffi, gli occhi. */
export const CERVARA_ANCORE = { manto: "#c9b18e", scuro: "#1f1c18", occhi: "#c2a35c" } as const;

export type AndaturaCervara = "fermo" | "passo" | "seduta";

export interface PosaCervara {
  t: number;
  andatura: AndaturaCervara;
  /** Fase del passo. */
  fase?: number;
  /** Ampiezza del passo 0..1. */
  ampiezza?: number;
  /** Testa: gradi, + = muso in giù. */
  testa?: number;
  /** Orecchie: -1 indietro … +1 avanti. */
  orecchie?: number;
  bocca?: number;
  /** Palpebre chiuse 0..1 (a riposo sono già un poco basse: il taglio calmo). */
  occhi?: number;
  /** Sguardo: -1 indietro … +1 avanti. */
  sguardo?: number;
  /** Seduta male (0..1): la schiena che cede, la testa bassa (p.13: «lei, seduta male»). */
  male?: number;
  /** Le punte dei ciuffi: 0 perfette, 1 piegate di lato (il suo segno). */
  ciuffi?: number;
  /** La zampa ai ciuffi (0..1): il colpetto veloce che li rimette a posto. */
  zampaAlCiuffo?: number;
  /** Fusione con un'altra posa (per i passaggi: seduta → in piedi, «alzandosi»). */
  verso?: { altra: PosaCervara; k: number };
  ombra?: boolean;
}

// ------------------------------------------------------------- scheletro --
interface Scheletro {
  spina: P[];
  dorso: number[];
  ventre: number[];
  piedi: [P, P, P, P];
  volo: [number, number, number, number];
  testa: number;
  collo: P;
  coda: number[];
  metatarso: [P, P];
}

const LUNG_CODA = 5;
const SCALA_TESTA = 1.12;

function scheletroBase(posa: PosaCervara): Scheletro {
  const t = posa.t;
  const f = posa.fase ?? 0;
  const amp = clamp(posa.ampiezza ?? 1);
  const resp = onda(t, 2.8) * 1.2;
  let spina: P[] = [
    [-78, -108],
    [-58, -104],
    [-8, -102 - resp * 0.4],
    [36, -110 - resp],
    [56, -140],
  ];
  // più larga di spalla: il dorso sale sulle spalle, il petto è pieno
  let dorso = [8, 24, 26, 44, 34];
  let ventre = [18, 40, 36, 50, 38];
  let piedi: [P, P, P, P] = [
    [50, 0],
    [38, 0],
    [-58, 0],
    [-70, 0],
  ];
  let volo: [number, number, number, number] = [0, 0, 0, 0];
  let metatarso: [P, P] = [
    [-14, -34],
    [-14, -34],
  ];
  let testa = (posa.testa ?? 0) - 8; // la testa alta, senza sforzo (non si gonfia: sta)
  // la coda corta: esce dalla groppa e sale appena, la punta nera
  let coda = [150, 164, 178, 192, 204].map((a, i) => a + onda(t, 3.3, i * 0.3) * (2 + i));

  switch (posa.andatura) {
    case "passo": {
      // il passo di chi sa dove mette i piedi: pochi su e giù, piedi posati
      const falcata = 54 * amp;
      const bob = -2 * Math.cos(f * Math.PI * 4) * amp;
      spina = spina.map(([x, y]) => [x, y + bob] as P);
      const pAV = piedeNelPasso(f + 0.25, falcata, 14);
      const pAL = piedeNelPasso(f + 0.75, falcata, 14);
      const pPV = piedeNelPasso(f, falcata, 16);
      const pPL = piedeNelPasso(f + 0.5, falcata, 16);
      piedi = [
        [50 + pAV.dx, pAV.dy],
        [38 + pAL.dx, pAL.dy],
        [-58 + pPV.dx, pPV.dy],
        [-70 + pPL.dx, pPL.dy],
      ];
      volo = [pAV.volo, pAL.volo, pPV.volo, pPL.volo];
      testa += Math.sin(f * Math.PI * 4 + 0.8) * 1.4 * amp;
      coda = coda.map((a, i) => a + Math.sin(f * Math.PI * 2 + i * 0.5) * 4 * amp);
      break;
    }
    case "seduta": {
      // seduta dritta come una statua; `male` la fa cedere: schiena tonda, testa giù
      const m = clamp(posa.male ?? 0);
      spina = [
        [-60, -24],
        [-44, -46],
        [-8, -84 - resp * 0.4 + 10 * m],
        [26 - 6 * m, -118 - resp + 22 * m],
        [48 - 8 * m, -142 + 34 * m],
      ];
      dorso = [10, 32, 26 + 4 * m, 34, 30];
      ventre = [22, 30, 28, 36, 32];
      piedi = [
        [44 + 6 * m, 0],
        [32 + 12 * m, 0],
        [-12, 0],
        [-22, 0],
      ];
      metatarso = [
        [-38, -8],
        [-38, -8],
      ];
      testa += -2 + 20 * m;
      coda = [120, 150, 172, 184, 186].map((a, i) => a + onda(t, 4, i * 0.2) * 2);
      break;
    }
    default:
      break;
  }
  return { spina, dorso, ventre, piedi, volo, testa, collo: spina[4], coda, metatarso };
}

const lerpP = (a: P, b: P, k: number): P => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

function scheletro(posa: PosaCervara): Scheletro {
  const a = scheletroBase(posa);
  if (!posa.verso || posa.verso.k <= 0) return a;
  const b = scheletroBase(posa.verso.altra);
  const k = clamp(posa.verso.k);
  return {
    spina: a.spina.map((p, i) => lerpP(p, b.spina[i], k)),
    dorso: a.dorso.map((d, i) => lerp(d, b.dorso[i], k)),
    ventre: a.ventre.map((d, i) => lerp(d, b.ventre[i], k)),
    piedi: a.piedi.map((p, i) => lerpP(p, b.piedi[i], k)) as [P, P, P, P],
    volo: a.volo.map((v, i) => lerp(v, b.volo[i], k)) as [number, number, number, number],
    testa: lerp(a.testa, b.testa, k),
    collo: lerpP(a.collo, b.collo, k),
    coda: a.coda.map((c, i) => lerp(c, b.coda[i], k)),
    metatarso: [lerpP(a.metatarso[0], b.metatarso[0], k), lerpP(a.metatarso[1], b.metatarso[1], k)],
  };
}

// ---------------------------------------------------------------- disegno --
interface Tav {
  manto: string;
  mantoAlto: string;
  mantoOmbra: string;
  crema: string;
  cremaOmbra: string;
  macchia: string;
  scuro: string;
}

export function cervara(posa: PosaCervara, ctx: CtxPupazzo): string {
  const { defs, luce, id } = ctx;
  const verso = ctx.verso ?? 1;
  const sk = scheletro(posa);
  const k = clamp(posa.zampaAlCiuffo ?? 0);
  // il colpetto ai ciuffi, come lo fanno i gatti: la zampa sale e la testa le scende
  // incontro, piegata; la zampa passa sull'orecchio dalla base in su
  if (k > 0) {
    sk.testa += 30 * k;
    sk.spina[4] = add(sk.spina[4], [-6 * k, 12 * k]);
    sk.collo = sk.spina[4];
  }

  const c: Tav = {
    manto: inLuce(CERVARA_ANCORE.manto, luce),
    mantoAlto: inLuce(schiarisci(CERVARA_ANCORE.manto, 0.12), luce),
    mantoOmbra: inOmbra(CERVARA_ANCORE.manto, luce),
    crema: inLuce("#ede5d3", luce),
    cremaOmbra: inOmbra("#ede5d3", luce),
    macchia: inLuce(scurisci(CERVARA_ANCORE.manto, 0.48), luce),
    scuro: inLuce(CERVARA_ANCORE.scuro, luce),
  };
  const lontanaZampa = inOmbra(scurisci(CERVARA_ANCORE.manto, 0.12), luce);
  const fianco = verso === 1 ? "destro" : "sinistro";

  const contorno = corpoDaSpina(sk.spina, sk.dorso, sk.ventre);
  const dCorpo = curva(contorno, true);
  const N = sk.spina.length;
  const dorsoLinea = contorno.slice(0, N);
  const ventreLinea = contorno.slice(N).reverse();

  // --- la testa (serve prima: la zampa ai ciuffi ci deve arrivare) ---------------
  const perno = add(sk.collo, [6, -4]);
  const ang = sk.testa + onda(posa.t, 5.1) * 0.6;
  const dallaTesta = (q: P): P => add(perno, rot([q[0] * SCALA_TESTA, q[1] * SCALA_TESTA], ang * DEG));

  // --- zampe ----------------------------------------------------------------------
  const spallaV = add(sk.spina[3], [6, 18]);
  const spallaL = add(sk.spina[3], [-4, 14]);
  const ancaV = add(sk.spina[1], [0, 10]);
  const ancaL = add(sk.spina[1], [-10, 6]);
  const zampa = (cp: P, volo: number, fill: string, dita: boolean) => zampone(cp, volo, fill, dita ? c.crema : "");
  const anteriore = (spalla: P, piede: P, volo: number, fill: string, lontana: boolean, alCiuffo = 0) => {
    let polso: P = add(piede, [-4 + volo * 10, -17 + volo * 3]);
    if (alCiuffo > 0) polso = mix(polso, dallaTesta([4, -24]), alCiuffo);
    const { ginocchio: gomito, fine } = ik2(spalla, polso, 34, 42, 1);
    // la punta della zampa: all'orecchio, e su lungo l'orecchio fino al ciuffo (il colpetto)
    const sulCiuffo = mix(dallaTesta([8, -36]), dallaTesta([3, -54]), alCiuffo * alCiuffo);
    const punta = alCiuffo > 0 ? mix(add(piede, [4, -9]), sulCiuffo, alCiuffo) : add(piede, [4, -9]);
    let s = path(tubo([spalla, gomito, fine, punta], [30, 18, 13, 12.5], { tappoInizio: false }), { fill });
    if (alCiuffo < 0.5) s += zampa(add(piede, [9, 0]), volo, fill, !lontana);
    else {
      // la zampa alzata: tonda, col bordo in ombra (si stacca dal muso), e le dita
      s += path(ellisseD(punta, 15, 12), { fill, stroke: c.mantoOmbra, "stroke-width": 1.4, "stroke-opacity": 0.55 });
      s += path(`M${n(punta[0] - 6)} ${n(punta[1] - 9)}q2 5 0 9M${n(punta[0] + 2)} ${n(punta[1] - 11)}q2 6 0 11`, { stroke: scurisci(c.crema, 0.4), "stroke-width": 1.3, fill: "none", "stroke-linecap": "round", opacity: 0.6 });
    }
    return s;
  };
  const posteriore = (anca: P, piede: P, volo: number, met: P, fill: string, lontana: boolean) => {
    const garretto: P = add(piede, met);
    const { ginocchio, fine } = ik2(anca, garretto, 44, 36, -1);
    let s = path(tubo([anca, ginocchio, fine, add(piede, [2, -9])], [38, 19, 12, 12], { tappoInizio: false }), { fill });
    s += zampa(add(piede, [7, 0]), volo, fill, !lontana);
    return s;
  };
  const lontane = posteriore(ancaL, sk.piedi[3], sk.volo[3], sk.metatarso[1], lontanaZampa, true) + anteriore(spallaL, sk.piedi[1], sk.volo[1], lontanaZampa, true);
  const zV = defs.lineare(`${id}-zampa`, [0, -120], [0, 0], [
    [0, c.manto],
    [0.6, mescola(c.manto, c.mantoOmbra, 0.3)],
    [1, mescola(c.mantoOmbra, c.crema, 0.3)],
  ]);
  const vicinaDietro = posteriore(ancaV, sk.piedi[2], sk.volo[2], sk.metatarso[0], zV, false);
  const vicinaDavanti = anteriore(spallaV, sk.piedi[0], sk.volo[0], zV, false, k);
  // le macchie sulle zampe vicine (brevi e nitide)
  const rz = caso(`cervara/zampe/${fianco}`);
  let mz = "";
  for (const [radice, piede, quante] of [
    [ancaV, sk.piedi[2], 6],
    [spallaV, sk.piedi[0], k > 0.3 ? 0 : 5],
  ] as const) {
    for (let i = 0; i < quante; i++) mz += ellisseD(add(mix(radice, piede, rz.tra(0.15, 0.75)), [rz.segno(7), 0]), rz.tra(2, 3.5), rz.tra(1.5, 2.6));
  }
  const macchieZampe = path(mz, { fill: c.macchia, opacity: 0.75 });

  // --- corpo --------------------------------------------------------------------
  const gCorpo = defs.lineare(`${id}-corpo`, [0, -150], [0, -60], [
    [0, c.mantoAlto],
    [0.55, c.manto],
    [1, mescola(c.manto, c.mantoOmbra, 0.45)],
  ]);
  const clip = defs.clip(`${id}-clip`, dCorpo);
  let dentro = "";
  // il ventre chiaro, sfumato
  const cremaG = defs.lineare(`${id}-crema`, [0, 0], [0, 1], [
    [0, c.crema, 0],
    [0.55, c.crema, 0.8],
    [1, c.cremaOmbra, 1],
  ], "objectBoundingBox");
  const pancia: P[] = [...ventreLinea.map((p) => add(p, [0, 6])), ...ventreLinea.slice().reverse().map((p, i, arr) => add(p, [0, -(16 + 12 * Math.sin((Math.PI * i) / (arr.length - 1)))]))];
  dentro += path(curva(pancia, true), { fill: cremaG });
  // le macchie: brevi e nitide, più fitte sui fianchi e sulle cosce (un seme per fianco)
  const rm = caso(`cervara/macchie/${fianco}`);
  let mc = "";
  for (let i = 0; i < 46; i++) {
    const u = rm.tra(0.05, 0.9);
    const a = dorsoLinea[Math.min(N - 1, Math.floor(u * (N - 1)))];
    const b = ventreLinea[Math.min(N - 1, Math.floor(u * (N - 1)))];
    const p = mix(a, b, rm.tra(0.18, 0.8));
    mc += ellisseD(add(p, [rm.segno(10), rm.segno(4)]), rm.tra(2.2, 4.2), rm.tra(1.6, 3));
  }
  dentro += path(mc, { fill: c.macchia, opacity: 0.7 });
  dentro += path(curva(ventreLinea.map((p) => add(p, [0, -3]))), { stroke: c.mantoOmbra, "stroke-width": 12, fill: "none", opacity: 0.25 });
  let corpo = path(dCorpo, { fill: gCorpo });
  corpo += g({ "clip-path": clip }, dentro);
  // il petto: pelo chiaro, a ciuffi
  const petto = add(sk.spina[4], [4, 22]);
  let gorg = "";
  for (let i = 0; i < 5; i++) {
    const a = (40 + i * 22) * DEG;
    const p = add(petto, [Math.cos(a) * 14, Math.sin(a) * 15]);
    const q = add(p, [Math.cos(a) * 8, Math.sin(a) * 8]);
    gorg += `M${pt(add(p, rot([0, -5], a)))}L${pt(q)}L${pt(add(p, rot([0, 5], a)))}Z`;
  }
  corpo += path(gorg, { fill: c.crema });

  // --- coda: corta, la punta nera -------------------------------------------------
  const seg = 11;
  const cp: P[] = [add(sk.spina[0], [4, 2])];
  for (let i = 0; i < sk.coda.length; i++) {
    const a = sk.coda[i] * DEG;
    cp.push(add(cp[i], [Math.cos(a) * seg, Math.sin(a) * seg]));
  }
  let codaG = path(tubo(cp, cp.map((_, i) => 9.5 - i * 0.7), { tappoInizio: false }), { fill: c.manto });
  codaG += path(tubo(cp.slice(-3), [7.6, 7, 6.4]), { fill: c.scuro });

  // --- bordo di luce, ombra --------------------------------------------------------
  const bordo = luce.forzaBordo > 0.02 ? path(curva(dorsoLinea), { stroke: luce.bordo, "stroke-width": 3.2, fill: "none", "stroke-linecap": "round", opacity: clamp(luce.forzaBordo) * 0.8 }) : "";
  const ombraP = posa.ombra !== false ? ombraSotto(defs, id, luce, verso) : "";

  const testaG = g({ transform: `translate(${n(perno[0])} ${n(perno[1])})rotate(${n(ang)})scale(${SCALA_TESTA})` }, testaCervara(posa, ctx, c));

  const seduta = (posa.verso && posa.verso.k > 0.5 ? posa.verso.altra.andatura : posa.andatura) === "seduta";
  // con la zampa ai ciuffi, la zampa vicina passa davanti alla testa
  const davanti = k > 0.05 ? vicinaDavanti : "";
  return ombraP + lontane + (seduta ? "" : codaG) + corpo + vicinaDietro + (k > 0.05 ? "" : vicinaDavanti) + macchieZampe + bordo + testaG + davanti + (seduta ? codaG : "");
}

/** Lo zampone da neve: largo e tondo, con le dita; in volo si piega. */
function zampone(cp: P, volo: number, fill: string, dita: string): string {
  const w = 19;
  const h = 15;
  const pieg = volo * 6;
  const d = curva(
    [
      [cp[0] - w, cp[1] - 1],
      [cp[0] - w + 1, cp[1] - h + 2],
      [cp[0] - 2, cp[1] - h - 2],
      [cp[0] + w - 2, cp[1] - h + 4 + pieg],
      [cp[0] + w + 2, cp[1] - 3 + pieg],
      [cp[0] + 6, cp[1] + 0.5],
    ],
    true,
  );
  let s = path(d, { fill });
  if (dita) s += path(`M${n(cp[0] + 2)} ${n(cp[1] - 1)}q1 -5 0 -8M${n(cp[0] + 10)} ${n(cp[1] - 2 + pieg * 0.5)}q1 -5 -1 -8`, { stroke: scurisci(dita, 0.45), "stroke-width": 1.3, fill: "none", "stroke-linecap": "round", opacity: 0.45 });
  return s;
}

function ombraSotto(defs: Defs, id: string, luce: Luce, verso: number): string {
  const spost = luce.lato * verso * luce.radenza * -36;
  const url = defs.radiale(`${id}-ombra`, [0.5, 0.5], 0.5, [
    [0, "#1b1812", 0.5 * luce.forzaOmbra],
    [0.7, "#1b1812", 0.22 * luce.forzaOmbra],
    [1, "#1b1812", 0],
  ], "objectBoundingBox");
  return path(ellisseD([-8 + spost, -1], 112 + luce.radenza * 50, 13), { fill: url });
}

// ------------------------------------------------------------------ testa --
function testaCervara(posa: PosaCervara, ctx: CtxPupazzo, c: Tav): string {
  const { defs, id, luce } = ctx;
  const t = posa.t;
  let s = "";
  // l'orecchio lontano, dietro
  s += orecchio([0, -36], posa, c, true);
  // la testa: cranio tondo, muso corto, fronte larga
  const sagoma: P[] = [
    [-18, -20],
    [-8, -36],
    [10, -42],
    [28, -39],
    [42, -30],
    [50, -18],
    [56, -9],
    [59, 0],
    [56, 8],
    [47, 14],
    [34, 18],
    [18, 20],
    [4, 19],
    [-10, 13],
    [-18, 2],
  ];
  const bocca = clamp(posa.bocca ?? 0);
  if (bocca > 0) {
    sagoma[9] = [47, 14 + bocca * 6];
    sagoma[10] = [34, 19 + bocca * 7];
    sagoma[11] = [18, 21 + bocca * 3];
  }
  const d = curva(sagoma, true);
  const gT = defs.lineare(`${id}-testa`, [0, -42], [0, 20], [
    [0, c.mantoAlto],
    [0.55, c.manto],
    [1, mescola(c.manto, c.mantoOmbra, 0.45)],
  ]);
  s += path(d, { fill: gT });
  const clipT = defs.clip(`${id}-clipT`, d);
  let dt = "";
  // il muso chiaro, il bianco attorno all'occhio
  dt += path(curva([[30, -2], [44, -8], [58, -6], [60, 6], [48, 14], [32, 19], [14, 21], [6, 14], [18, 4]], true), { fill: c.crema });
  dt += path(ellisseD([30, -22], 11, 7), { fill: c.crema, opacity: 0.85 });
  // i segni del viso: la riga scura che parte dall'occhio, le macchioline della fronte
  let st = `M22 -16q-10 4 -20 12q10 -6 21 -9Z`;
  st += `M18 -8q-8 6 -14 14q8 -5 15 -11Z`;
  dt += path(st, { fill: c.scuro, opacity: 0.85 });
  let pun = "";
  const rp = caso("cervara/fronte");
  for (let i = 0; i < 7; i++) pun += ellisseD([rp.tra(6, 34), rp.tra(-38, -28)], 1.4, 1.1);
  dt += path(pun, { fill: c.macchia, opacity: 0.8 });
  s += g({ "clip-path": clipT }, dt);
  // il naso e la bocca
  s += path("M53 -11q7 -1 7 5q-2 3 -7 2Z", { fill: inLuce("#9c6a5e", luce) });
  s += path(`M58 4Q53 11 43 ${n(12 + bocca * 5)}`, { stroke: c.scuro, "stroke-width": 1.7, fill: "none", "stroke-linecap": "round" });
  if (bocca > 0.05) s += path(`M56 8Q49 ${n(14 + bocca * 8)} 38 ${n(17 + bocca * 5)}Q47 12 56 8Z`, { fill: "#3e2420" });
  // le vibrisse
  s += path("M47 2q15 -5 28 -4M47 5q15 1 28 5M45 8q11 5 22 10", { stroke: schiarisci(c.crema, 0.3), "stroke-width": 1, fill: "none", opacity: 0.75 });
  // l'occhio: nocciola-oro, calmo (la palpebra a riposo scende un poco)
  s += occhio(posa, ctx, c);
  // LE BASETTE: ampie, a punte, incorniciano il muso (chiare, con le righe scure)
  s += path("M6 14l-12 22l8 -4l-4 14l9 -9l1 12l6 -12l5 8l1 -14l6 4l-4 -14Z", { fill: c.crema });
  s += path("M-2 20l-4 12M6 22l-1 12M13 20l3 9", { stroke: c.scuro, "stroke-width": 1.6, fill: "none", opacity: 0.55, "stroke-linecap": "round" });
  // l'orecchio vicino, coi ciuffi
  s += orecchio([10, -40], posa, c, false);
  void t;
  return s;
}

function occhio(posa: PosaCervara, ctx: CtxPupazzo, c: Tav): string {
  const { defs, id, luce } = ctx;
  const t = posa.t;
  const calma = 0.24;
  const chiuso = clamp(Math.max(posa.occhi ?? calma, palpebra(t, 3.9, 0.35)));
  const cx = 31;
  const cy = -17;
  const sg = clamp(posa.sguardo ?? 0.3, -1, 1);
  const forma = `M${n(cx - 10)} ${n(cy + 2)}Q${n(cx - 2)} ${n(cy - 8)} ${n(cx + 10)} ${n(cy - 2)}Q${n(cx + 2)} ${n(cy + 6)} ${n(cx - 10)} ${n(cy + 2)}Z`;
  const oro = inLuce(CERVARA_ANCORE.occhi, luce);
  const iride = defs.radiale(`${id}-iride`, [cx + sg * 2, cy - 1], 8, [
    [0, schiarisci(oro, 0.35)],
    [0.6, oro],
    [1, scurisci(oro, 0.35)],
  ]);
  let s = path(forma, { fill: iride });
  s += path(ellisseD([cx + 1.5 + sg * 3, cy - 1], 2.4, 4), { fill: "#15120e" });
  s += path(cerchioD([cx - 2 + sg, cy - 4], 1.6), { fill: "#ffffff", opacity: 0.9 });
  if (chiuso > 0.02) s += path(`M${n(cx - 11)} ${n(cy - 9)}H${n(cx + 11)}V${n(cy - 8 + 14 * chiuso)}Q${n(cx)} ${n(cy - 4 + 14 * chiuso)} ${n(cx - 11)} ${n(cy - 8 + 14 * chiuso)}Z`, { fill: c.manto });
  s += path(forma, { stroke: c.scuro, "stroke-width": 1.8, fill: "none" });
  return s;
}

/**
 * L'orecchio della lince: alto e a punta, il dorso nero, e in cima IL CIUFFO —
 * nero, lungo, dritto come un pennello nuovo; con `ciuffi` la punta si piega di lato.
 */
function orecchio(base: P, posa: PosaCervara, c: Tav, lontano: boolean): string {
  const t = posa.t;
  const tens = posa.orecchie ?? 0.4;
  const guizzo = Math.max(0, Math.sin(t * 1.4 + (lontano ? 1.1 : 0))) ** 16 * 10;
  const ang = -4 - tens * 12 + guizzo - (lontano ? 12 : 0);
  const sag: P[] = [
    [-10, 2],
    [-9, -14],
    [-2, -32],
    [2, -34],
    [9, -16],
    [10, 2],
  ];
  const piega = clamp(posa.ciuffi ?? 0.12);
  // il ciuffo: dritto per due terzi, poi la punta che piega (di lato: verso dietro)
  const cima: P = [0, -34];
  const meta: P = [0.6, -50];
  const punta: P = [0.6 - 12 * piega, -61 + 4 * piega];
  const ciuffo = path(`M${pt(add(cima, [-2.4, 0]))}L${pt(add(meta, [-1.6, 0]))}Q${pt(add(meta, [-1, -6]))} ${pt(punta)}Q${pt(add(meta, [1.4, -5]))} ${pt(add(meta, [1.6, 0]))}L${pt(add(cima, [2.4, 0]))}Z`, { fill: c.scuro });
  if (lontano) return g({ transform: tr(base[0], base[1], ang) }, path(curva(sag, true), { fill: c.mantoOmbra }) + ciuffo);
  let s = path(curva(sag, true), { fill: c.manto });
  // il dorso nero dell'orecchio, col segno chiaro in mezzo
  s += path(curva([[-10, 0], [-9, -14], [-2, -32], [0, -24], [-4, -8], [-4, 2]], true), { fill: c.scuro });
  s += path(ellisseD([-6, -11], 2.2, 3.6), { fill: "#e9e3d4", opacity: 0.9 });
  // il pelo chiaro dentro
  s += path(curva([[1, -2], [2, -18], [6, -20], [8, -6], [6, 1]], true), { fill: c.crema, opacity: 0.8 });
  s += ciuffo;
  return g({ transform: tr(base[0], base[1], ang) }, s);
}
