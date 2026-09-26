// cartoni/luoghi/rivalba.ts — il Lago del Vespro: la riva di Rivalba e l'approdo (ep02).
//
// «Il Lago del Vespro fu tutto lì sotto: largo, grigio e oro, con la nebbia del
// mattino ancora addosso. […] Sotto, lungo le rive, cominciavano le passerelle.»
// (ep02, p.1) — e la reference `saga/reference/ambienti/rivalba/`: case su
// palafitte col tetto di paglia, passerelle, barche, massi tondi all'acqua,
// colline boscose nella nebbia, la luce d'oro; l'autunno («l'anno pendeva già
// verso il freddo»).
//
// Due luoghi con la stessa acqua e la stessa tavolozza:
//  - RIVALBA: la riva dei villaggi (a destra: la ghiaia, le barche a secco, le
//    reti, il masso del Custode, la tana degli Ospiti, e su fino al bosco da cui
//    si vede il lago) e il lago aperto a sinistra, per la traversata;
//  - APPRODO: la lingua di sassi «dove le rive cominciavano a stringersi» (p.15).
// Le palafitte e le passerelle stanno su un livello di mezzo (p=0.7), dietro il
// molo e la barca; il molo basso sta sul piano dei personaggi.

import { type Luce, inLuce, lontano, mescola, scurisci } from "../motore/colore";
import { elemento, fnv1a32, frattale1 } from "../motore/caso";
import { type Livello, vista } from "../motore/fotogramma";
import { type P, ellisseD, n, path, pt } from "../motore/svg";
import { barcaASecco, molo, palafitta, passerella, retiStese } from "../scene/lago";
import { type Colori, type OpzPalco, creaLuogo } from "../scene/luogo";
import { piegaErba } from "../scene/meteo";
import { roccia } from "../scene/oggetti";
import { type Cresta, monti } from "../scene/pittura";

// ------------------------------------------------------------ geografia --
/** L'acqua del lago: la riva di Rivalba è a x=0. */
export const LAGO_VESPRO = { quota: 900, riva: 0 } as const;

/** Dove stanno le cose della riva (piano dei personaggi). */
export const RIVA = {
  /** il molo basso (p.5): da-a, e l'altezza del piano sopra l'acqua */
  molo: [-560, -40] as const,
  alturaMolo: 22,
  /** dove sta ormeggiata la barca di Brénta (il centro dello scafo) */
  barca: -980,
  /** le barche tirate a secco e le reti stese (p.2) */
  secche: [300, 620] as const,
  reti: 860,
  /** il masso del Custode (p.4) */
  custode: 1320,
  /** la tana di canne degli Ospiti (p.3) */
  tana: 1780,
  /** dove il bosco si apre sul lago (p.1): il ciglio */
  ciglio: 2750,
  /** il lago aperto (la traversata, pp. 9-14) */
  largo: -6500,
} as const;

const C: Colori = {
  cieloAlto: "#93a8ba",
  cieloOrizzonte: "#f0d9a8",
  monteLontano: "#8f9aa6",
  monteMedio: "#6c786f",
  neve: "#e6e9ec",
  lago: "#65798a",
  lagoChiaro: "#aab4b0",
  canna: "#b59a5c",
  cannaScura: "#7a6538",
  erba: "#bdb49c",
  erbaScura: "#948b74",
  erbaChiara: "#dcd3b4",
  erbaAperto: "#87904e",
  erbaApertoScura: "#5b6536",
  terra: "#857863",
  roccia: "#8b857b",
  rocciaScura: "#57534c",
  lichene: "#aca176",
  muschio: "#66703f",
  bosco: "#4b5836",
  boscoScuro: "#2e3a25",
};

/**
 * Le altezze dei lontani, per le camere della riva (y ~ 700-800): l'orizzonte del
 * lago (livello a p=0.14) e l'acqua del villaggio (p=0.7) cadono appena sopra
 * l'acqua vicina (a quota 900, p=1).
 */
const ORIZZONTE = 170;
const ACQUA_VILLAGGIO = 642;

/** I colori dell'autunno nei boschi (le chiome gialle e ruggine tra le scure). */
const AUTUNNO = ["#b98a3a", "#a4642e", "#c7a24a", "#7d7a36"] as const;

// ------------------------------------------------------------- lontani --
const CRESTE: readonly Cresta[] = [
  { seme: "vespro/monti", base: 100, alt: 300, col: C.monteLontano, fos: 0.55, x0: -6000, x1: 6000 },
  { seme: "vespro/colli", base: 120, alt: 150, col: C.monteMedio, fos: 0.4, x0: -6000, x1: 6000 },
];

/** Un bosco lontano su una collina: chiome scure e d'autunno, velate. */
function boscoLontano(o: OpzPalco, p: number, seme: string, base: number, alt: number, x0: number, x1: number, velo: number): string {
  const { luce } = o;
  const v = vista(o.cam, p, 0.3);
  const colle: P[] = [];
  const a = Math.max(x0, v.x0 - 200);
  const b = Math.min(x1, v.x1 + 200);
  if (b <= a) return "";
  for (let x = Math.floor(a / 50) * 50; x <= b + 50; x += 50) colle.push([x, base - (frattale1(x * 0.0021, 3, fnv1a32(seme) % 97) * 0.5 + 0.5) * alt]);
  let s = path(`M${pt([colle[0][0], 1100])}L${colle.map(pt).join("L")}L${pt([colle[colle.length - 1][0], 1100])}Z`, { fill: lontano(inLuce(C.bosco, luce), luce, velo) });
  const semeC = fnv1a32(`${seme}/chiome`);
  let scure = "";
  const aut: string[] = ["", "", "", ""];
  const quante = Math.round((x1 - x0) / 9);
  for (let i = 0; i < quante; i++) {
    const r = elemento(semeC, i);
    const x = r.tra(x0, x1);
    if (x < v.x0 - 30 || x > v.x1 + 30) continue;
    const cima = base - (frattale1(x * 0.0021, 3, fnv1a32(seme) % 97) * 0.5 + 0.5) * alt;
    const y = cima + Math.pow(r(), 1.6) * (base - cima) * 0.95 + 4;
    const rr = r.tra(5, 11);
    // l'autunno a macchie: dove il rumore lo vuole, non a caso ovunque
    const macchia = frattale1(x * 0.004 + 7, 2, 3);
    if (macchia > 0.15 && r.moneta(0.7)) aut[r.intero(0, 3)] += ellisseD([x, y], rr, rr * 1.15);
    else scure += ellisseD([x, y], rr, rr * 1.2);
  }
  s += path(scure, { fill: lontano(inLuce(C.boscoScuro, luce), luce, velo) });
  aut.forEach((d, i) => (s += path(d, { fill: lontano(inLuce(AUTUNNO[i], luce), luce, velo + 0.05) })));
  return s;
}

/** Il lago fino all'orizzonte: grigio e oro, i riflessi dei colli, la nebbia del mattino. */
function lagoAperto(o: OpzPalco, p: number): string {
  const { luce, meteo, t, defs } = o;
  const v = vista(o.cam, p, 0.3);
  const acqua = lontano(inLuce(mescola(C.lago, "#26303e", meteo.notte * 0.35), luce), luce, 0.2);
  const oro = lontano(inLuce(C.lagoChiaro, luce), luce, 0.2);
  const url = defs.lineare("vespro-lago", [0, ORIZZONTE], [0, ORIZZONTE + 500], [
    [0, oro],
    [0.3, mescola(oro, acqua, 0.5)],
    [0.7, acqua],
    [1, scurisci(acqua, 0.12)],
  ]);
  let s = path(`M${n(v.x0 - 400)} ${ORIZZONTE}H${n(v.x1 + 400)}V1400H${n(v.x0 - 400)}Z`, { fill: url });
  // la striscia d'oro del sole sull'acqua
  const semeO = fnv1a32("vespro/oro");
  let d = "";
  for (let i = 0; i < 90; i++) {
    const r = elemento(semeO, i);
    const x = r.tra(-2600, 2600);
    const y = r.tra(ORIZZONTE + 6, ORIZZONTE + 260);
    if (x < v.x0 - 80 || x > v.x1 + 80) continue;
    const w = r.tra(20, 110) * (1 - (y - ORIZZONTE) / 400);
    d += `M${n(x + Math.sin(t * 0.7 + i) * 5)} ${n(y)}h${n(w)}`;
  }
  s += path(d, { stroke: oro, "stroke-width": 2.4, opacity: 0.6 * (1 - meteo.notte), "stroke-linecap": "round" });
  // la nebbia del mattino: bande che si alzano tardi
  if (meteo.nebbia > 0.02) {
    const neb = lontano(inLuce("#f1ede2", luce), luce, 0.1);
    let nb = "";
    for (let i = 0; i < 6; i++) {
      const y = ORIZZONTE - 10 + i * 20;
      const x = ((t * (5 + i * 2)) % 600) - 300 + i * 150;
      nb += ellisseD([x + (v.x0 + v.x1) / 2, y], 3200, 16 + i * 4);
    }
    s += path(nb, { fill: neb, opacity: meteo.nebbia * 0.45 });
  }
  return s;
}

/** Il villaggio sull'acqua (p=0.7): palafitte e passerelle lungo la riva, con qualche lume. */
function villaggio(o: OpzPalco, p: number): string {
  const { luce, defs, meteo } = o;
  const v = vista(o.cam, p, 0.25);
  const acquaY = ACQUA_VILLAGGIO; // la linea dell'acqua di questo livello
  const lume = meteo.notte;
  const case_: [string, number, number][] = [
    ["a", -2900, 300],
    ["b", -2300, 340],
    ["c", -1650, 280],
    ["d", -1050, 360],
    ["e", -380, 300],
  ];
  // l'acqua di questo livello (le case ci stanno dentro coi pali)
  let s = path(`M${n(v.x0 - 300)} ${acquaY}H${n(260)}V1400H${n(v.x0 - 300)}Z`, { fill: lontano(inLuce(C.lago, luce), luce, 0.1) });
  s += path(`M${n(v.x0 - 300)} ${acquaY + 1}H${n(260)}`, { stroke: lontano(inLuce(C.lagoChiaro, luce), luce, 0.1), "stroke-width": 3, opacity: 0.7 });
  // le passerelle tra una casa e l'altra, fino a riva
  const pass: [number, number][] = [[-2750, -2420], [-2140, -1780], [-1500, -1200], [-880, -520], [-240, 320]];
  for (const [a, b] of pass) {
    if (b < v.x0 - 200 || a > v.x1 + 200) continue;
    s += `<g transform="translate(0 ${acquaY})">${passerella(luce, a, b, -70, `v${a}`)}</g>`;
  }
  for (const [seme, x, w] of case_) {
    if (x + w < v.x0 - 200 || x - w > v.x1 + 200) continue;
    s += `<g transform="translate(${n(x)} ${acquaY})">${palafitta(luce, defs, seme, { w, lume: lume * (seme === "d" || seme === "b" ? 1 : 0.3) })}</g>`;
  }
  // la riva di questo livello: la ghiaia e il bosco dietro, a destra dell'acqua
  s += path(`M${n(260)} ${acquaY + 2}Q${n(700)} ${acquaY - 14} ${n(1600)} ${acquaY - 30}L${n(4000)} ${acquaY - 60}L${n(4000)} 1400L${n(260)} 1400Z`, { fill: lontano(inLuce(C.terra, luce), luce, 0.15) });
  return s;
}

// ---------------------------------------------------------------- RIVALBA --
export const RIVALBA = creaLuogo(
  {
    id: "rivalba",
    nome: "la riva di Rivalba, sul Lago del Vespro",
    profilo: [
      [-30000, 1500],
      [-900, 1240],
      [-260, 1040],
      [0, 904],
      [400, 894],
      [1100, 886],
      [1950, 876],
      [2250, 800],
      [2550, 640],
      [2800, 572],
      [3300, 548],
      [8000, 520],
    ],
    acqua: LAGO_VESPRO,
    colori: C,
    // la ghiaia della riva, poi l'erba verso il bosco
    suolo: { da: 1300, a: 2300 },
    erba: { confine: 2000, sinistra: [5, 12], destra: [22, 40] },
    cespugli: { quanti: 16, sinistraProb: 0.02, sinistra: [1500, 1900], destra: [2300, 5200], sotto: [40, 200] },
    canneto: [-1500, -700],
  },
  {
    lontanissimo: (o): Livello[] => [
      { id: "monti", contenuto: monti(o, 0.06, CRESTE), p: 0.06 },
      { id: "colli", contenuto: boscoLontano(o, 0.1, "vespro/colli", ORIZZONTE + 20, 170, -9000, 9000, 0.34), p: 0.1 },
    ],
    lontano: (o): Livello[] => [
      { id: "lago", contenuto: lagoAperto(o, 0.14), p: 0.14 },
      { id: "villaggio", contenuto: villaggio(o, 0.7), p: 0.7 },
    ],
    oggetti: (o, inVista) => {
      const { luce, defs, luogo, t } = o;
      let s = "";
      const q = LAGO_VESPRO.quota;
      if (inVista(-300, 700)) s += `<g transform="translate(0 ${q})">${molo(luce, RIVA.molo[0], RIVA.molo[1], -RIVA.alturaMolo)}</g>`;
      for (const [i, x] of RIVA.secche.entries()) if (inVista(x)) s += `<g transform="translate(${x} ${n(luogo.quota(x) + 4)})rotate(${i ? -3 : 2})">${barcaASecco(luce, defs, `secca${i}`, i ? 380 : 440)}</g>`;
      if (inVista(RIVA.reti, 500)) s += `<g transform="translate(${RIVA.reti} ${n(luogo.quota(RIVA.reti))})">${retiStese(luce, t, 300, 210)}</g>`;
      if (inVista(RIVA.custode)) s += roccia(luogo, "masso-custode", RIVA.custode, 190, 150, luce, defs, 0.15);
      for (const [x, w, h] of [[80, 90, 60], [-120, 120, 50], [180, 60, 40], [2200, 80, 56]] as const) if (inVista(x)) s += roccia(luogo, `riva${x}`, x, w, h, luce, defs, 0.3);
      return s;
    },
  },
);

/** Dove si appoggia chi sale sul masso del Custode. */
export const cimaMassoCustode = (): P => [RIVA.custode + 10, RIVALBA.quota(RIVA.custode) - 150 * 0.85];

// ---------------------------------------------------------------- APPRODO --
/** La lingua di sassi (p.15): ghiaia, qualche canna, un legno portato dall'acqua; le rive che si stringono. */
export const APPRODO = creaLuogo(
  {
    id: "approdo",
    nome: "l'approdo, dove le rive si stringono",
    profilo: [
      [-30000, 1500],
      [-700, 1200],
      [-200, 1010],
      [0, 904],
      [500, 896],
      [1400, 884],
      [2600, 860],
      [6000, 820],
    ],
    acqua: LAGO_VESPRO,
    colori: { ...C, erba: "#c1b8a1", erbaScura: "#978e78", erbaAperto: "#8a8f52", terra: "#8e8472" },
    suolo: { da: 1000, a: 2200 },
    erba: { confine: 1300, sinistra: [4, 10], destra: [18, 34] },
    cespugli: { quanti: 12, sinistraProb: 0.02, sinistra: [1500, 1800], destra: [1800, 4200], sotto: [40, 200] },
    canneto: [-900, -380],
  },
  {
    lontanissimo: (o): Livello[] => [
      { id: "monti", contenuto: monti(o, 0.06, CRESTE), p: 0.06 },
      { id: "colli", contenuto: boscoLontano(o, 0.1, "vespro/colli", ORIZZONTE + 20, 170, -9000, 9000, 0.34), p: 0.1 },
    ],
    lontano: (o): Livello[] => [
      { id: "lago", contenuto: lagoAperto(o, 0.14), p: 0.14 },
      // le rive che si stringono: due colli boscosi più vicini, uno per parte
      { id: "colle-sx", contenuto: boscoLontano(o, 0.3, "approdo/sx", 290, 230, -9000, -600, 0.24), p: 0.3 },
      { id: "colle-dx", contenuto: boscoLontano(o, 0.34, "approdo/dx", 330, 220, 200, 9000, 0.2), p: 0.34 },
    ],
    oggetti: (o, inVista) => {
      const { luce, defs, luogo } = o;
      let s = "";
      // i sassi della lingua: tanti, piccoli e tondi
      const seme = fnv1a32("approdo/sassi");
      let sassi = "";
      for (let i = 0; i < 90; i++) {
        const r = elemento(seme, i);
        const x = r.tra(-40, 1500);
        if (!inVista(x, 60)) continue;
        const w = r.tra(8, 26);
        sassi += ellisseD([x, luogo.quota(x) + r.tra(-2, 10)], w, w * r.tra(0.45, 0.7));
      }
      s += path(sassi, { fill: inLuce(mescola(C.roccia, "#c8bca4", 0.25), luce), opacity: 0.9 });
      for (const [x, w, h] of [[240, 110, 64], [760, 70, 44], [1200, 130, 70]] as const) if (inVista(x)) s += roccia(luogo, `approdo${x}`, x, w, h, luce, defs, 0.3);
      // un legno portato dall'acqua
      if (inVista(460)) s += path(`M${n(380)} ${n(luogo.quota(380) - 4)}Q${n(470)} ${n(luogo.quota(470) - 16)} ${n(560)} ${n(luogo.quota(560) - 6)}`, { stroke: inLuce("#9c8a6c", luce), "stroke-width": 12, fill: "none", "stroke-linecap": "round" });
      void piegaErba;
      return s;
    },
  },
);

/** Per chi disegna la luce del luogo (le inquadrature scelgono tra le LUCI del kit). */
export type { Luce };
