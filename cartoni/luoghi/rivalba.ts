// cartoni/luoghi/rivalba.ts — il Lago del Vespro, attorno a Rivalba (ep02, ep03, ep04).
//
// «Il Lago del Vespro fu tutto lì sotto: largo, grigio e oro, con la nebbia del
// mattino ancora addosso. […] Sotto, lungo le rive, cominciavano le passerelle.»
// (ep02, p.1) — e la reference `saga/reference/ambienti/rivalba/`: case su
// palafitte col tetto di paglia, passerelle, barche, massi tondi all'acqua,
// colline boscose nella nebbia, la luce d'oro; l'autunno («l'anno pendeva già
// verso il freddo»).
//
// Rivalba è la capitale del regno (saga/cartografia: il «centro» degli episodi
// ep02-ep04, all'orlo e al cuore). I luoghi con la stessa acqua e la stessa
// tavolozza:
//  - ORLO (ep02): la riva dei villaggi dove si arriva dal bosco (la ghiaia, le
//    barche a secco, le reti, il masso del Custode, la tana degli Ospiti, il
//    ciglio) e il lago aperto a sinistra, per la traversata;
//  - APPRODO (ep02, p.15): la lingua di sassi «dove le rive cominciavano a stringersi»;
//  - RIVALBA (ep03): il cuore, sull'acqua — passerelle su pali, tetti di canna, e
//    in mezzo i Massi del Consiglio; il molo basso con la barca di Brénta; la riva
//    e il sentiero che sale dietro;
//  - COPPELLE (ep03, ep04): sul colle dietro Rivalba, le pietre vecchie col
//    cerchio di conche «contro il cielo»;
//  - RIVE_BASSE (ep04): l'argine delle tane della Gente delle Rive, col varco, e
//    davanti la laguna — dove la piena passa «dritta alle tane»;
//  - ALTURA (ep04): il dosso sopra i laghi dove la marmotta fa la vedetta.
// La piena (ep04) non è un luogo: è l'acqua di questi luoghi più alta (`piena`
// dell'inquadratura), davanti a chi ci sta dentro.
// Le palafitte lontane stanno su un livello di mezzo (p=0.7); moli, passerelle,
// massi e barche ormeggiate sul piano dei personaggi.

import { type Luce, inLuce, inOmbra, lontano, mescola, scurisci } from "../motore/colore";
import { caso, elemento, fnv1a32, frattale1 } from "../motore/caso";
import { type Livello, vista } from "../motore/fotogramma";
import { type P, curva, ellisseD, n, path, pt } from "../motore/svg";
import { clamp, palpebra } from "../motore/tempo";
import { barca, barcaASecco, finestraDellaPalafitta, galleggia, gorgo, massoDelConsiglio, molo, palafitta, passerella, retiStese, tanaDiCanne } from "../scene/lago";
import { type Colori, type OpzPalco, creaLuogo } from "../scene/luogo";
import { piegaErba } from "../scene/meteo";
import { alberoDAutunno, pietraCoppellata, roccia } from "../scene/oggetti";
import { type Cresta, dalloSchermo, lunaRiflessa, monti } from "../scene/pittura";

// ------------------------------------------------------------ geografia --
/** L'acqua del lago (la stessa in tutti i luoghi di qui); all'orlo la riva è a x=0. */
export const LAGO_VESPRO = { quota: 900, riva: 0 } as const;

/** Dove stanno le cose all'orlo (ep02; piano dei personaggi). */
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
/** Gli alberi del bosco sul ciglio (x, altezza): Rocco e Zara ne escono in s02. */
const BOSCO_DEL_CIGLIO: readonly (readonly [number, number])[] = [
  [2980, 560],
  [3240, 640],
  [3470, 520],
  [3700, 610],
  [3960, 580],
  [4230, 660],
  [4520, 540],
  [4800, 600],
];


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
  // la luna bassa sull'acqua, «vera due volte»: la sua scia, spezzata dalle onde, e il disco rimandato
  if (o.luna && meteo.notte > 0.05) s += sciaDiLuna(o, p, ORIZZONTE + 4, 320) + lunaRiflessa(o, p, (_, y) => y > ORIZZONTE + 3);
  return s;
}

/** La scia della luna su un'acqua che va da `y0` in giù per `h`: strisce spezzate, strette lontano, larghe vicino. */
function sciaDiLuna(o: OpzPalco, p: number, y0: number, h: number): string {
  const { t, meteo } = o;
  const x = dalloSchermo(o, p, o.luna!.a)[0];
  const semeL = fnv1a32("vespro/luna");
  let d = "";
  for (let i = 0; i < 46; i++) {
    const r = elemento(semeL, i);
    const k = r();
    const y = y0 + k * k * h;
    const w = (6 + k * 60) * r.tra(0.4, 1.2);
    const dx = r.segno(8 + k * 40) + Math.sin(t * 0.8 + i) * 3;
    d += `M${n(x + dx - w / 2)} ${n(y)}h${n(w)}`;
  }
  return path(d, { stroke: "#f2eedc", "stroke-width": 2.6, opacity: 0.75 * meteo.notte, "stroke-linecap": "round" });
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

// ------------------------------------------------------------------- ORLO --
/** L'orlo del regno (ep02): la riva dei villaggi dove si arriva dal bosco, e il lago aperto. */
export const ORLO = creaLuogo(
  {
    id: "orlo",
    nome: "l'orlo di Rivalba, la riva dei villaggi sul Lago del Vespro",
    profilo: [
      [-30000, 1500],
      [-900, 1240],
      [-260, 1040],
      [0, 904],
      [400, 894],
      [1100, 886],
      [1950, 876],
      [2250, 862],
      [2450, 790],
      [2650, 650],
      [2850, 574],
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
      if (inVista(RIVA.custode)) s += roccia(luogo, "masso-custode", RIVA.custode, 300, 150, luce, defs, 0.15);
      // il bosco da cui arrivano (p.1: «Poi il bosco si aprì»), sul piano oltre il ciglio
      for (const [x, h] of BOSCO_DEL_CIGLIO) if (inVista(x, 400)) s += alberoDAutunno(o, x, `ciglio${x}`, h);
      for (const [x, w, h] of [[80, 90, 60], [-120, 120, 50], [180, 60, 40], [2200, 80, 56]] as const) if (inVista(x)) s += roccia(luogo, `riva${x}`, x, w, h, luce, defs, 0.3);
      return s;
    },
  },
);

/** Dove si appoggia chi sale sul masso del Custode. */
export const cimaMassoCustode = (): P => [RIVA.custode + 10, ORLO.quota(RIVA.custode) - 150 * 0.85];

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

// ---------------------------------------------------------------- RIVALBA --
/** Rivalba, il cuore (ep03): dove stanno le cose (piano dei personaggi; y verso il basso, l'acqua a 900). */
export const CUORE = {
  /** i Massi del Consiglio: [centro, larghezza, altezza della cima sopra l'acqua], da sinistra */
  massi: [
    [-650, 152, 56],
    [-430, 176, 78],
    [-200, 190, 96],
    [50, 236, 158],
    [292, 186, 92],
    [516, 162, 72],
    [724, 150, 54],
  ] as readonly (readonly [number, number, number])[],
  /** il masso più alto: quello da cui si parla al Consiglio (p.1, p.9) */
  alto: 3,
  /** le passerelle (da, a) e quanto stanno sopra l'acqua */
  passerelle: [
    [-2700, -760],
    [830, 1320],
  ] as readonly (readonly [number, number])[],
  alturaPasserella: 46,
  /** il molo basso (pp. 4, 12), con la barca di Brénta ormeggiata dietro */
  molo: [1320, 2140] as const,
  alturaMolo: 22,
  /** la barca di Brénta, ormeggiata contro il molo (davanti a chi ci cammina) */
  barca: 1790,
  lunghezzaBarca: 700,
  /** il lavatoio delle reti e l'orlo dove il lago gira (p.9) */
  lavatoio: -1780,
  gorgo: -3000,
  /** in fondo alla passerella: la sera (p.8) e «il solito punto» (p.17) */
  fondoPasserella: -2620,
  /** la riva, la tana degli Ospiti, il sentiero che sale dietro Rivalba (p.11) */
  riva: 2140,
  tana: 2520,
  sentiero: [2760, 5400] as const,
};

/** Le case di Rivalba sul piano dei personaggi (dietro passerelle e massi): [x, seme, larghezza, lume]. */
const CASE_CUORE: readonly (readonly [number, string, number, number])[] = [
  [-2230, "cuore-a", 300, 0.8],
  [-1250, "cuore-b", 340, 1],
  [1080, "cuore-c", 280, 0.6],
];

/** Dove finisce l'acqua della città lontana (p=0.7): più in là c'è la riva, e il colle. */
const FINE_CITTA = 1700;

/** La città sull'acqua, lontana (p=0.7): tante palafitte, le passerelle, i lumi la sera. */
function cittaSullAcqua(o: OpzPalco, p: number): string {
  const { luce, defs, meteo } = o;
  const v = vista(o.cam, p, 0.25);
  if (v.x0 > FINE_CITTA) return "";
  const acquaY = ACQUA_VILLAGGIO;
  const lume = meteo.notte;
  const x1 = Math.min(v.x1 + 300, FINE_CITTA);
  let s = path(`M${n(v.x0 - 300)} ${acquaY}H${n(x1)}V1400H${n(v.x0 - 300)}Z`, { fill: lontano(inLuce(C.lago, luce), luce, 0.1) });
  s += path(`M${n(v.x0 - 300)} ${acquaY + 1}H${n(x1)}`, { stroke: lontano(inLuce(C.lagoChiaro, luce), luce, 0.1), "stroke-width": 3, opacity: 0.7 });
  const semeC = fnv1a32("cuore/citta");
  const case_: [number, number, string][] = [];
  for (let i = 0; i < 16; i++) {
    const r = elemento(semeC, i);
    const x = -4200 + i * 520 + r.segno(90);
    const w = r.tra(240, 360);
    if (x + w / 2 < FINE_CITTA - 60) case_.push([x, w, `cc${i}`]);
  }
  for (let i = 0; i < case_.length - 1; i++) {
    const [a, wa] = case_[i];
    const [b, wb] = case_[i + 1];
    const x0 = a + wa / 2 + 20;
    const x1 = b - wb / 2 - 20;
    if (x1 < v.x0 - 200 || x0 > v.x1 + 200 || x1 <= x0) continue;
    s += `<g transform="translate(0 ${acquaY})">${passerella(luce, x0, x1, -70, `cc${i}`)}</g>`;
  }
  for (const [x, w, seme] of case_) {
    if (x + w < v.x0 - 200 || x - w > v.x1 + 200) continue;
    const r = elemento(semeC, 1000 + Math.round(x));
    s += `<g transform="translate(${n(x)} ${acquaY})">${palafitta(luce, defs, seme, { w, lume: lume * (r.moneta(0.6) ? 1 : 0.25) })}</g>`;
  }
  return s;
}

/** Il colle dietro Rivalba (p=0.36), e in cima le pietre vecchie «contro il cielo» (p.11): si vedono dai massi. */
function colleDelleCoppelle(o: OpzPalco, p: number): string {
  const { luce } = o;
  const v = vista(o.cam, p, 0.3);
  if (v.x1 < -400 || v.x0 > 3200) return "";
  const col = lontano(inLuce(C.bosco, luce), luce, 0.26);
  const cresta = (x: number) => (x < 900 ? 520 - ((x + 300) / 1200) * 400 : x > 1600 ? 120 + ((x - 1600) / 1400) * 350 : 120 - Math.sin(((x - 900) / 700) * Math.PI) * 8);
  const pts: P[] = [];
  for (let x = -300; x <= 3000; x += 50) pts.push([x, cresta(x)]);
  let s = path(`M-300 1400L${pts.map(pt).join("L")}L3000 1400Z`, { fill: col });
  // il bosco sui fianchi; in cima, tra le pietre, niente alberi
  const semeB = fnv1a32("cuore/colle");
  let chiome = "";
  for (let i = 0; i < 110; i++) {
    const r = elemento(semeB, i);
    const x = r.tra(-250, 2950);
    if (x > 860 && x < 1640) continue;
    const y = cresta(x) + r.tra(4, 140);
    chiome += ellisseD([x, y], r.tra(18, 34), r.tra(20, 38));
  }
  s += path(chiome, { fill: lontano(inLuce(C.boscoScuro, luce), luce, 0.28) });
  let pietre = "";
  for (const [x, w] of [[930, 44], [1060, 58], [1210, 50], [1350, 62], [1480, 46], [1590, 38]] as const) pietre += `M${n(x - w / 2)} ${n(cresta(x) + 2)}Q${n(x)} ${n(cresta(x) - w * 0.55)} ${n(x + w / 2)} ${n(cresta(x) + 2)}Z`;
  s += path(pietre, { fill: lontano(inLuce(C.rocciaScura, luce), luce, 0.3) });
  return s;
}

/** Rivalba, il cuore del regno sull'acqua (ep03). */
export const RIVALBA = creaLuogo(
  {
    id: "rivalba",
    nome: "Rivalba, il cuore del regno, sull'acqua",
    profilo: [
      [-30000, 1500],
      [-900, 1240],
      [900, 1200],
      [1700, 1060],
      [CUORE.riva, 904],
      [2500, 890],
      [2700, 878],
      [2900, 840],
      [3200, 764],
      [3600, 680],
      [4200, 604],
      [5000, 552],
      [8000, 500],
    ],
    acqua: { quota: LAGO_VESPRO.quota, riva: CUORE.riva },
    colori: C,
    suolo: { da: 2300, a: 3400 },
    erba: { confine: 2700, sinistra: [5, 12], destra: [18, 34] },
    cespugli: { quanti: 14, sinistraProb: 0.02, sinistra: [2300, 2600], destra: [2800, 5600], sotto: [40, 200] },
    canneto: [-3560, -3140],
  },
  {
    lontanissimo: (o): Livello[] => [
      { id: "monti", contenuto: monti(o, 0.06, CRESTE), p: 0.06 },
      { id: "colli", contenuto: boscoLontano(o, 0.1, "vespro/colli", ORIZZONTE + 20, 170, -9000, 9000, 0.34), p: 0.1 },
    ],
    lontano: (o): Livello[] => [
      { id: "lago", contenuto: lagoAperto(o, 0.14), p: 0.14 },
      { id: "colle", contenuto: colleDelleCoppelle(o, 0.36), p: 0.36 },
      { id: "citta", contenuto: cittaSullAcqua(o, 0.7), p: 0.7 },
    ],
    oggetti: (o, inVista) => {
      const { luce, defs, t, meteo } = o;
      const q = LAGO_VESPRO.quota;
      const acqua = { lago: C.lago, chiaro: C.lagoChiaro };
      let s = "";
      // l'orlo dove il lago gira, lontano dalle passerelle
      if (inVista(CUORE.gorgo, 300)) s += `<g transform="translate(${CUORE.gorgo} ${q + 4})">${gorgo(luce, t, 110)}</g>`;
      // le case, dietro a tutto
      for (const [x, seme, w, lume] of CASE_CUORE) if (inVista(x, w)) s += `<g transform="translate(${x} ${q})">${palafitta(luce, defs, seme, { w, lume: lume * meteo.notte, piano: 96 })}</g>`;
      // il lavatoio delle reti: le reti a bagno tra due pali, accanto alla passerella
      if (inVista(CUORE.lavatoio, 400)) s += `<g transform="translate(${CUORE.lavatoio - 150} ${q + 6})">${retiStese(luce, t, 300, 120, "lavatoio")}</g>`;
      // i moli e le passerelle, sopra l'acqua
      for (const [a, b] of CUORE.passerelle) if (inVista((a + b) / 2, (b - a) / 2 + 200)) s += `<g transform="translate(0 ${q})">${molo(luce, a, b, -CUORE.alturaPasserella, `passerella${a}`)}</g>`;
      if (inVista((CUORE.molo[0] + CUORE.molo[1]) / 2, 700)) s += `<g transform="translate(0 ${q})">${molo(luce, CUORE.molo[0], CUORE.molo[1], -CUORE.alturaMolo, "molo-cuore")}</g>`;
      // i Massi del Consiglio
      CUORE.massi.forEach(([x, w, h], i) => {
        if (inVista(x, w)) s += `<g transform="translate(${x} ${q})">${massoDelConsiglio(luce, defs, `consiglio${i}`, w, h, acqua)}</g>`;
      });
      // la tana degli Ospiti sulla riva, e il bosco del sentiero
      if (inVista(CUORE.tana, 300)) {
        const tn = tanaDiCanne(luce, defs);
        s += `<g transform="translate(${CUORE.tana} ${n(o.luogo.quota(CUORE.tana))})">${tn.fondo}${tn.fronte}</g>`;
      }
      // il sentiero che sale dietro Rivalba (p.11): una striscia di terra battuta sul fianco
      if (inVista((CUORE.sentiero[0] + CUORE.sentiero[1]) / 2, 1500)) {
        const pts: P[] = [];
        for (let x = CUORE.sentiero[0] - 300; x <= CUORE.sentiero[1]; x += 40) pts.push([x, o.luogo.quota(x) + 18 + Math.sin(x * 0.004) * 6]);
        s += path(`M${pts.map(pt).join("L")}`, { stroke: inLuce(mescola(C.terra, "#d2c3a0", 0.35), luce), "stroke-width": 18, fill: "none", opacity: 0.55, "stroke-linecap": "round", "stroke-linejoin": "round" });
      }
      for (const [x, h] of [[3000, 560], [3380, 620], [3760, 540], [4180, 640], [4620, 580], [5100, 620]] as const) if (inVista(x, 400)) s += alberoDAutunno(o, x, `sentiero${x}`, h);
      return s;
    },
    // la barca di Brénta, ormeggiata contro il molo basso (dalla parte di chi guarda): il
    // carico sotto il telo. Chi cammina sul molo le passa dietro
    davanti: (o, inVista) => {
      if (!inVista(CUORE.barca, 600)) return "";
      // nella piena (ep04) la barca sale con l'acqua, e la corrente la strattona
      const gal = galleggia(o.t, "ormeggio", o.piena ? 1.4 : 0.5);
      const sc = barca(o.luce, o.defs, "ormeggio", { lunghezza: CUORE.lunghezzaBarca, carico: 0.6, telo: true, sottoIlTelo: o.telo, acqua: { lago: C.lago, chiaro: C.lagoChiaro } });
      return `<g transform="translate(${CUORE.barca} ${n(LAGO_VESPRO.quota - (o.piena?.livello ?? 0) + gal.dy)})rotate(${n(gal.ang)})">${sc.dietro}${sc.davanti}</g>`;
    },
    // nella piena: la schiuma attorno ai massi, ai pali delle case, sotto le passerelle
    sullaPiena: (o, inVista) => schiumaDiRivalba(o, inVista),
  },
);

/**
 * La schiuma della piena a Rivalba (ep04): dove l'acqua alta incontra i massi, i pali
 * delle case, le passerelle «a filo», la barca ormeggiata — un collare chiaro e rotto
 * che si muove, e a valle una coda nel verso della corrente.
 */
function schiumaDiRivalba(o: OpzPalco, inVista: (x: number, m?: number) => boolean): string {
  const P = o.piena;
  if (!P) return "";
  const { luce, t } = o;
  const yF = LAGO_VESPRO.quota - P.livello;
  const c = P.corrente ?? 0;
  const seme = fnv1a32("rivalba/schiuma");
  let d = "";
  let code = "";
  // un collare di schiuma tra x0 e x1: tante bolle piatte che tremano, e la coda a valle
  const collare = (chiave: number, x0: number, x1: number, fitto = 1) => {
    const quante = Math.max(3, Math.round(((x1 - x0) / 14) * fitto));
    for (let i = 0; i < quante; i++) {
      const r = elemento(seme, chiave * 1000 + i);
      const x = x0 + ((i + r.tra(-0.3, 0.3)) / quante) * (x1 - x0) + Math.sin(t * r.tra(1.5, 3) + i) * 3;
      d += ellisseD([x, yF + r.tra(-2, 3)], r.tra(5, 12), r.tra(1.6, 3.2));
    }
    if (Math.abs(c) > 0.05) {
      const da = c > 0 ? x1 : x0;
      for (let j = 0; j < 4; j++) {
        const r = elemento(seme, chiave * 1000 + 500 + j);
        const lung = r.tra(40, 120) * Math.abs(c);
        const y = yF + r.tra(2, 12);
        const scorre = ((t * r.tra(30, 60)) % 40) * Math.sign(c);
        code += `M${n(da + scorre)} ${n(y)}q${n(Math.sign(c) * lung * 0.5)} ${n(r.segno(4))} ${n(Math.sign(c) * lung)} ${n(r.segno(3))}`;
      }
    }
  };
  CUORE.massi.forEach(([x, w, h], i) => {
    if (h > P.livello - 4 && inVista(x, w)) collare(i + 1, x - w / 2 - 18, x + w / 2 + 20);
  });
  // le passerelle e il molo: se l'acqua arriva a filo delle tavole, la schiuma ci corre sotto
  const sotto = (chiave: number, a: number, b: number, altura: number) => {
    if (Math.abs(altura - P.livello) < 16 && inVista((a + b) / 2, (b - a) / 2 + 100)) collare(chiave, a, b, 0.35);
  };
  CUORE.passerelle.forEach(([a, b], i) => sotto(20 + i, a, b, CUORE.alturaPasserella));
  sotto(30, CUORE.molo[0], CUORE.molo[1], CUORE.alturaMolo);
  // i pali delle case
  CASE_CUORE.forEach(([x, , w], i) => {
    if (!inVista(x, w)) return;
    const quanti = Math.round(w / 55);
    for (let k = 0; k <= quanti; k++) {
      const px = x - w / 2 + 10 + (k * (w - 20)) / quanti;
      collare(40 + i * 10 + k, px - 12, px + 12, 1.4);
    }
  });
  // la barca ormeggiata, lungo la linea dell'acqua
  if (inVista(CUORE.barca, 600)) collare(60, CUORE.barca - CUORE.lunghezzaBarca / 2, CUORE.barca + CUORE.lunghezzaBarca / 2, 0.5);
  // di notte, i lumi delle case rimandati dall'acqua alta: una colonna di tratti caldi che trema
  let lumi = "";
  if (o.meteo.notte > 0.05) {
    for (const [x, sm, w, lume] of CASE_CUORE) {
      if (lume <= 0 || !inVista(x, w)) continue;
      const cx = x + finestraDellaPalafitta(sm, { w, piano: 96 })[0];
      for (let k = 0; k < 10; k++) {
        const larga = (15 - k) * (0.55 + 0.45 * Math.sin(t * 3.1 + k * 1.7)) * lume;
        lumi += `M${n(cx - larga + Math.sin(t * 2.3 + k) * 3)} ${n(yF + 6 + k * 8)}h${n(2 * larga)}`;
      }
    }
  }
  const col = inLuce("#e6e1d2", luce);
  return (
    path(lumi, { stroke: "#f2b35a", "stroke-width": 3, fill: "none", opacity: 0.4 * o.meteo.notte, "stroke-linecap": "round" }) +
    path(code, { stroke: col, "stroke-width": 2, fill: "none", opacity: 0.4, "stroke-linecap": "round" }) +
    path(d, { fill: col, opacity: 0.55 })
  );
}

/** Dove si posa chi sta sul masso i del Consiglio, a dx dal centro (coordinate del palco). */
export function sulMassoDelConsiglio(i: number, dx = 0): P {
  const [x, w, h] = CUORE.massi[i];
  const k = Math.min(1, Math.abs(dx) / (w / 2));
  return [x + dx, LAGO_VESPRO.quota - h - 4 + 10 * k * k];
}

/** Quanto sta la passerella (o il molo basso) a x: la quota su cui si cammina. */
export function sullaPasserella(x: number): number {
  if (x >= CUORE.molo[0] && x <= CUORE.molo[1]) return LAGO_VESPRO.quota - CUORE.alturaMolo - 6;
  return LAGO_VESPRO.quota - CUORE.alturaPasserella - 6;
}

// --------------------------------------------------------------- COPPELLE --
/** Le Coppelle: le tre pietre larghe sul piano dei personaggi, [x, larghezza, altezza]. */
export const PIETRE_COPPELLE: readonly (readonly [number, number, number])[] = [
  [-660, 300, 54],
  [-40, 380, 66],
  [600, 290, 50],
];

/** Il lago di notte visto dal colle (p=0.14): lontano e basso, la luna sopra, e i lumi di Rivalba. */
function lagoDalColle(o: OpzPalco, p: number): string {
  const { luce, meteo } = o;
  const v = vista(o.cam, p, 0.3);
  const y0 = 130; // il lago è giù: dal colle lo si vede sopra l'erba vicina
  const acqua = lontano(inLuce(mescola(C.lago, "#26303e", meteo.notte * 0.4), luce), luce, 0.25);
  let s = path(`M${n(v.x0 - 400)} ${y0}H${n(v.x1 + 400)}V1400H${n(v.x0 - 400)}Z`, { fill: acqua });
  if (o.luna && meteo.notte > 0.05) s += sciaDiLuna(o, p, y0 + 3, 260) + lunaRiflessa(o, p, (_, y) => y > y0 + 3);
  // i lumi di Rivalba, laggiù sull'acqua
  if (meteo.notte > 0.05) {
    const semeL = fnv1a32("coppelle/lumi");
    let d = "";
    for (let i = 0; i < 24; i++) {
      const r = elemento(semeL, i);
      d += ellisseD([r.tra(-900, 700), y0 + r.tra(10, 40)], r.tra(1.5, 3), r.tra(1.5, 2.5));
    }
    s += path(d, { fill: "#f3cf85", opacity: 0.8 * meteo.notte });
  }
  return s;
}

/** Le Coppelle, sul colle dietro Rivalba (ep03 pp.13-15; ep04): le pietre vecchie in cerchio. */
export const COPPELLE = creaLuogo(
  {
    id: "coppelle",
    nome: "le Coppelle, sul colle dietro Rivalba",
    profilo: [
      [-30000, 980],
      [-3000, 820],
      [-1600, 726],
      [-600, 690],
      [400, 686],
      [1500, 716],
      [3000, 800],
      [30000, 960],
    ],
    colori: { ...C, erba: "#aaa58c", erbaScura: "#7f7a64", erbaAperto: "#8e9163", erbaApertoScura: "#626645" },
    suolo: { da: -1500, a: 1500 },
    erba: { confine: 99999, sinistra: [8, 20], destra: [8, 20] },
    cespugli: { quanti: 12, sinistraProb: 0.5, sinistra: [-2800, -1100], destra: [1100, 2800], sotto: [40, 220] },
  },
  {
    lontanissimo: (o): Livello[] => [
      { id: "monti", contenuto: monti(o, 0.06, CRESTE), p: 0.06 },
      { id: "colli", contenuto: boscoLontano(o, 0.1, "vespro/colli", ORIZZONTE + 30, 150, -9000, 9000, 0.34), p: 0.1 },
    ],
    lontano: (o): Livello[] => [{ id: "lago", contenuto: lagoDalColle(o, 0.14), p: 0.14 }],
    oggetti: (o, inVista) => {
      let s = "";
      // due pietre più indietro (piccole), poi le tre sul piano
      for (const [x, i, w, h] of [[-1400, 0, 260, 46], [1300, 1, 240, 44]] as const) if (inVista(x, w)) s += pietraCoppellata(o, x, `dietro${i}`, w, h);
      PIETRE_COPPELLE.forEach(([x, w, h], i) => {
        if (inVista(x, w)) s += pietraCoppellata(o, x, `coppella${i}`, w, h);
      });
      for (const [x, h] of [[-2300, 600], [-1900, 520], [2000, 560], [2450, 640]] as const) if (inVista(x, 400)) s += alberoDAutunno(o, x, `colle${x}`, h);
      return s;
    },
  },
);

// ------------------------------------------------------------- RIVE BASSE --
/**
 * Le rive basse (ep04): l'argine di terra, di sassi e di canne dove la Gente delle
 * Rive ha le tane — le bocche sul pelo dell'acqua, «tane basse» — e davanti la laguna
 * chiusa. Lo guardiamo dalla laguna: l'argine attraversa il quadro, dietro c'è il lago
 * e il colle delle Coppelle. In mezzo il VARCO (p.3): una sella nell'argine dove, con
 * la piena, il lago passa e cade nella laguna, «dritto alle tane»; chi ci si mette di
 * traverso lo chiude (p.10).
 */
export const RIVE = {
  /** il varco: il centro, la metà della larghezza, e quanto sta la sua soglia sopra l'acqua */
  varco: 0,
  mezzoVarco: 250,
  sogliaVarco: 24,
  /** quanto sta l'argine sopra l'acqua */
  argine: 104,
  /** le tane nell'argine: [x, larghezza della bocca]; le bocche stanno a filo dell'acqua */
  tane: [
    [-1640, 70],
    [-1180, 84],
    [-760, 64],
    [560, 80],
    [940, 66],
    [1420, 76],
  ] as readonly (readonly [number, number])[],
  /** la tana che cede un angolo (p.4) */
  crolla: 3,
  /** quanto sta la bocca di una tana sopra l'acqua */
  sogliaTane: 6,
} as const;

const C_RIVE: Colori = {
  ...C,
  erba: "#6e604a",
  erbaScura: "#4a4234",
  erbaChiara: "#8c7d62",
  erbaAperto: "#655a46",
  erbaApertoScura: "#463e30",
  terra: "#5f5442",
};

/** La quota dell'argine visto dalla laguna: in cima a 796, giù nella sella del varco fino alla soglia. */
const PROFILO_RIVE: readonly P[] = [
  [-30000, 800],
  [-3000, 792],
  [-2000, 800],
  [-1200, 790],
  [-600, 796],
  [-430, 800],
  [-330, 836],
  [-262, 868],
  [-190, 876],
  [0, 877],
  [190, 876],
  [262, 868],
  [330, 836],
  [430, 800],
  [900, 794],
  [1600, 798],
  [2400, 790],
  [30000, 796],
];

/** Un ciuffo di canne sull'argine (i pennacchi piegati dal vento). */
function canneSullArgine(o: OpzPalco, x: number, seme: number, quante: number): string {
  const { luce, t, meteo, luogo } = o;
  let steli = "";
  let pennacchi = "";
  for (let i = 0; i < quante; i++) {
    const r = elemento(seme, i);
    const xx = x + r.segno(40);
    const h = r.tra(90, 200);
    const y = luogo.quota(xx) + r.tra(0, 8);
    const lean = piegaErba(xx * 1.5, t, meteo) * 0.35 + r.segno(0.08);
    const tip: P = [xx + lean * h, y - h];
    steli += `M${n(xx)} ${n(y)}Q${n(xx + lean * h * 0.4)} ${n(y - h * 0.6)} ${pt(tip)}`;
    pennacchi += ellisseD([tip[0] + lean * 6, tip[1] + 8], 4, 13);
  }
  return path(steli, { stroke: inLuce(C.cannaScura, luce), "stroke-width": 3, fill: "none", "stroke-linecap": "round" }) + path(pennacchi, { fill: inLuce(C.canna, luce), opacity: 0.9 });
}

/** La bocca di una tana nell'argine: un arco scuro sul pelo dell'acqua, l'orlo di fango, qualche stecco. */
function boccaDiTana(o: OpzPalco, i: number, crollo: number): string {
  const { luce, t } = o;
  const [x, w] = RIVE.tane[i];
  const yb = LAGO_VESPRO.quota - RIVE.sogliaTane;
  const h = w * 0.62;
  const r = caso(`tana/${i}`);
  const fango = inLuce(mescola(C_RIVE.terra, "#9a8a6a", 0.25), luce);
  const buio = inLuce("#17130e", luce);
  let s = "";
  // la cicatrice dell'angolo crollato (p.4): la terra viva, più scura, e la bocca che si allarga
  const allarga = crollo > 0.3 ? w * 0.35 * clamp((crollo - 0.3) / 0.4) : 0;
  s += path(ellisseD([x + allarga * 0.3, yb + 3], w * 0.75 + allarga, 7), { fill: fango, opacity: 0.8 });
  const arco = `M${n(x - w / 2)} ${n(yb)}C${n(x - w / 2)} ${n(yb - h * 0.9)} ${n(x - w * 0.25)} ${n(yb - h)} ${n(x)} ${n(yb - h)}C${n(x + w * 0.25 + allarga)} ${n(yb - h)} ${n(x + w / 2 + allarga)} ${n(yb - h * 0.9 + allarga * 0.3)} ${n(x + w / 2 + allarga)} ${n(yb)}Z`;
  s += path(arco, { fill: fango, transform: `translate(0 -4)scale(1)`, opacity: 0.9 });
  s += path(arco, { fill: buio });
  // gli stecchi e le canne intrecciate sopra la bocca (la tana è fatta, non scavata a caso)
  let stecchi = "";
  for (let k = 0; k < 7; k++) {
    const a = r.tra(0.1, 0.9) * Math.PI;
    const px = x - Math.cos(a) * (w / 2 + 6);
    const py = yb - Math.sin(a) * (h + 6);
    stecchi += `M${n(px)} ${n(py)}l${n(r.segno(18))} ${n(-r.tra(4, 14))}`;
  }
  s += path(stecchi, { stroke: inLuce(C.cannaScura, luce), "stroke-width": 2.4, "stroke-linecap": "round", opacity: 0.85 });
  // due occhi piccoli, dentro, in qualche tana (i piccoli che aspettano)
  if ((i === 1 || i === 4) && crollo === 0) {
    const ch = palpebra(t, 3.3 + i * 0.4, i * 0.37);
    const oy = yb - h * 0.42;
    s += path(ellisseD([x - 7, oy], 2.6, 2.4 * (1 - ch)) + ellisseD([x + 7, oy], 2.6, 2.4 * (1 - ch)), { fill: "#d8d3c2", opacity: 0.85 });
  }
  return s;
}

/**
 * L'argine rimandato dalla laguna: sotto il pelo dell'acqua una fascia scura che sfuma
 * (la terra capovolta, mossa), e il fango bagnato che luccica appena sulla linea dell'acqua.
 */
function argineNellaLaguna(o: OpzPalco): string {
  const { luce, defs, t } = o;
  const q = LAGO_VESPRO.quota;
  const v = vista(o.cam, 1, 0.25);
  const url = defs.lineare("rive-riflesso", [0, q], [0, q + 150], [
    [0, inOmbra(C_RIVE.terra, luce), 0.75],
    [0.5, inOmbra(C_RIVE.terra, luce), 0.3],
    [1, inOmbra(C_RIVE.terra, luce), 0],
  ]);
  let s = path(`M${n(v.x0 - 50)} ${q}H${n(v.x1 + 50)}V${q + 150}H${n(v.x0 - 50)}Z`, { fill: url });
  // la sella del varco, rimandata anche lei: lì il riflesso è più corto
  s += path(`M-420 ${q}Q0 ${q + 36} 420 ${q}Z`, { fill: inLuce(C.lago, luce), opacity: 0.45 });
  // le increspature che rompono il riflesso
  let d = "";
  const seme = fnv1a32("rive/increspature");
  for (let i = 0; i < 90; i++) {
    const r = elemento(seme, i);
    const x = r.tra(-3200, 3200);
    const y = q + 4 + r() ** 1.5 * 140;
    if (x < v.x0 - 60 || x > v.x1 + 60) continue;
    d += `M${n(x + Math.sin(t * 0.8 + i) * 6)} ${n(y)}h${n(r.tra(20, 80))}`;
  }
  s += path(d, { stroke: inLuce(C.lagoChiaro, luce), "stroke-width": 2, opacity: 0.35, "stroke-linecap": "round" });
  // il fango bagnato sulla linea dell'acqua
  s += path(`M${n(v.x0 - 50)} ${q - 3}H${n(v.x1 + 50)}`, { stroke: inLuce("#8f846c", luce), "stroke-width": 3, opacity: 0.5 });
  return s;
}

/** Il pezzo d'argine sopra la tana che cede (p.4): stacca, scivola e va giù nella laguna. */
function angoloCheCede(o: OpzPalco, crollo: number): string {
  if (crollo <= 0) return "";
  const { luce, defs } = o;
  const [x, w] = RIVE.tane[RIVE.crolla];
  const yb = LAGO_VESPRO.quota - RIVE.sogliaTane;
  const h = w * 0.62;
  const pezzo: P[] = [
    [x + 4, yb - h - 4],
    [x + w * 0.55, yb - h - 30],
    [x + w * 1.05, yb - h * 0.55],
    [x + w * 0.62, yb - 6],
    [x + w * 0.42, yb - h * 0.5],
  ];
  // la terra viva dove c'era il pezzo
  let s = path(curva(pezzo, true), { fill: inLuce("#3a3024", luce), opacity: 0.9 });
  const k = clamp(crollo);
  const cx = x + w * 0.6;
  const cy = yb - h * 0.6;
  const url = defs.lineare("rive-pezzo", [0, yb - h - 30], [0, yb], [
    [0, inLuce(C_RIVE.erbaChiara, luce)],
    [1, inOmbra(C_RIVE.terra, luce)],
  ]);
  s += `<g transform="translate(${n(18 * k)} ${n(90 * k * k)})rotate(${n(28 * k)} ${n(cx)} ${n(cy)})">${path(curva(pezzo, true), { fill: url })}${path(`M${n(x + 10)} ${n(yb - h - 6)}l14 -12M${n(x + w * 0.5)} ${n(yb - h - 26)}l8 -16`, { stroke: inLuce(C.cannaScura, luce), "stroke-width": 2.4, "stroke-linecap": "round" })}</g>`;
  return s;
}

/**
 * Il lago dietro l'argine, nella sella del varco, e — finché il varco è aperto — l'acqua
 * che scavalca la soglia e cade nella laguna: una lingua liscia in cima, rotta in basso.
 */
function acquaNelVarco(o: OpzPalco): string {
  const P = o.piena;
  if (!P) return "";
  const { luce, t, luogo, defs } = o;
  const q = LAGO_VESPRO.quota;
  const yLago = q - P.livello;
  const ySoglia = q - RIVE.sogliaVarco;
  const yLaguna = q - (P.laguna ?? 0);
  const aperto = 1 - clamp(P.varco ?? 0);
  const torbida = inLuce(mescola(C.lago, "#6b5a40", 0.3), luce);
  const chiara = inLuce(mescola(C.lagoChiaro, "#8f7d5c", 0.35), luce);
  let s = "";
  if (yLago < ySoglia) {
    // il lago dietro, alto: riempie la sella fino al suo livello
    const sopra: P[] = [];
    const sotto: P[] = [];
    for (let x = -460; x <= 460; x += 10) {
      const y = yLago + Math.sin(x * 0.03 + t * 3) * 1.6;
      sopra.push([x, y]);
      sotto.push([x, Math.max(y, luogo.quota(x) + 2)]);
    }
    s += path(`M${sopra.map(pt).join("L")}L${sotto.reverse().map(pt).join("L")}Z`, { fill: torbida });
    // la corrente che va verso il varco, dai due lati
    let d = "";
    const semeV = fnv1a32("varco/corrente");
    for (let i = 0; i < 16; i++) {
      const r = elemento(semeV, i);
      const lato = i % 2 ? 1 : -1;
      const k = ((t * r.tra(0.5, 0.9) + r()) % 1);
      const x = lato * (440 - k * 400);
      const y = yLago + r.tra(3, Math.max(4, ySoglia - yLago - 2));
      d += `M${n(x)} ${n(y)}h${n(-lato * r.tra(14, 40))}`;
    }
    s += path(d, { stroke: chiara, "stroke-width": 2, opacity: 0.5, "stroke-linecap": "round" });
  }
  // la lingua che cade nella laguna (finché nessuno la chiude)
  if (aperto > 0.02 && yLago < yLaguna - 2) {
    const top = Math.min(yLago, ySoglia);
    const giu = yLaguna + 6;
    const L = RIVE.mezzoVarco - 16;
    const url = defs.lineare("varco-lingua", [0, top], [0, giu], [
      [0, chiara],
      [0.5, torbida],
      [1, inLuce("#d9d4c4", luce)],
    ]);
    const lingua = `M${n(-L)} ${n(top)}Q0 ${n(top - 3)} ${n(L)} ${n(top)}L${n(L + 12)} ${n(giu)}L${n(-L - 12)} ${n(giu)}Z`;
    s += path(lingua, { fill: url, opacity: 0.92 * aperto });
    // le righe che cadono
    let righe = "";
    const semeL = fnv1a32("varco/lingua");
    const H = Math.max(6, giu - top);
    for (let i = 0; i < 36; i++) {
      const r = elemento(semeL, i);
      const x = r.tra(-L, L);
      const y = top + ((t * r.tra(60, 120) + r.tra(0, H)) % H);
      righe += `M${n(x)} ${n(y)}l${n(x * 0.02)} ${n(r.tra(6, 16))}`;
    }
    s += path(righe, { stroke: inLuce("#e4e0d2", luce), "stroke-width": 2.2, opacity: 0.6 * aperto, "stroke-linecap": "round" });
    // l'orlo dove l'acqua scavalca la soglia: una riga di schiuma che trema
    let orlo = "";
    for (let x = -L; x <= L; x += 14) orlo += ellisseD([x + Math.sin(t * 5 + x) * 3, top + 2 + Math.sin(t * 7 + x * 0.3) * 1.5], 9, 3.2);
    s += path(orlo, { fill: inLuce("#ece8da", luce), opacity: 0.75 * aperto });
  }
  return s;
}

/** Sopra la piena, alle rive basse: la schiuma dove cade la lingua, alle bocche delle tane, il tonfo del pezzo crollato; e se il varco è chiuso, l'acqua che cerca sopra e sotto chi lo chiude. */
function sullaPienaDelleRive(o: OpzPalco, inVista: (x: number, m?: number) => boolean): string {
  const P = o.piena;
  if (!P) return "";
  const { luce, t } = o;
  const q = LAGO_VESPRO.quota;
  const yLago = q - P.livello;
  const ySoglia = q - RIVE.sogliaVarco;
  const yLaguna = q - (P.laguna ?? 0);
  const chiuso = clamp(P.varco ?? 0);
  const col = inLuce("#e6e1d2", luce);
  const seme = fnv1a32("rive/schiuma");
  let bolle = "";
  let righe = "";
  let gocce = "";
  let velo = "";
  let forzaVelo = 0;
  // dove la lingua cade: la schiuma che si allarga
  if (1 - chiuso > 0.02 && yLago < yLaguna - 2 && inVista(0, 400)) {
    for (let i = 0; i < 40; i++) {
      const r = elemento(seme, i);
      const k = (t * r.tra(0.2, 0.45) + r()) % 1;
      const x = r.segno(1) * (RIVE.mezzoVarco - 20) * r() + Math.sign(r.segno(1)) * k * 160;
      bolle += ellisseD([x, yLaguna + 2 + k * 18], (6 + 10 * (1 - k)) * (1 - chiuso), 2.4 * (1 - k * 0.5));
    }
  }
  // chi chiude il varco: l'acqua che passa tra le zampe (sotto), e che scavalca la schiena (sopra)
  if (chiuso > 0.02 && yLago < ySoglia + 2 && inVista(0, 400)) {
    const forza = clamp((ySoglia - yLago) / 50);
    for (const [x0, w] of [[-150, 26], [-40, 18], [70, 22], [170, 16]] as const) {
      const r = elemento(seme, 900 + x0);
      const vibra = Math.sin(t * 17 + x0) * 2;
      righe += `M${n(x0 - w / 2 + vibra)} ${n(ySoglia - 4)}Q${n(x0 + vibra)} ${n(ySoglia + 10)} ${n(x0 + w / 2 + r.segno(3))} ${n(yLaguna + 3)}`;
      bolle += ellisseD([x0, yLaguna + 3], w * 0.8 * chiuso, 3);
    }
    // gli spruzzi sopra la schiena: a colpi, più fitti quando il lago è più alto
    const colpi = Math.round(4 + 6 * forza);
    for (let k = 0; k < colpi; k++) {
      const r = elemento(seme, 2000 + k);
      const periodo = r.tra(1.4, 2.6) * (1.2 - forza * 0.5);
      const u = ((t + r.tra(0, periodo)) % periodo) / periodo;
      if (u > 0.45) continue;
      const e = u / 0.45;
      const x0 = r.tra(-200, 200);
      const y0 = ySoglia - r.tra(220, 250);
      for (let j = 0; j < 7; j++) {
        const rj = elemento(seme, 3000 + k * 10 + j);
        const x = x0 + rj.segno(60) * e;
        const y = y0 - rj.tra(60, 160) * (0.6 + forza) * e + 380 * e * e;
        gocce += ellisseD([x, y], rj.tra(3, 7) * chiuso, rj.tra(3, 8) * chiuso);
      }
    }
    // la nebbia d'acqua attorno alle zampe: più fitta quando il lago spinge di più
    for (let k = 0; k < 6; k++) {
      const r = elemento(seme, 2600 + k);
      velo += ellisseD([r.tra(-230, 230) + Math.sin(t * 0.9 + k) * 20, ySoglia - r.tra(10, 70)], r.tra(60, 120), r.tra(18, 36));
    }
    forzaVelo = (0.1 + 0.18 * forza) * chiuso;
  }
  // alle bocche delle tane, se l'acqua ci arriva
  RIVE.tane.forEach(([x, w], i) => {
    if (!inVista(x, w)) return;
    if (yLaguna < q - RIVE.sogliaTane + 4) {
      for (let k = 0; k < 5; k++) {
        const r = elemento(seme, 4000 + i * 10 + k);
        bolle += ellisseD([x + r.segno(w * 0.5) + Math.sin(t * 2 + k) * 3, yLaguna + r.tra(0, 3)], r.tra(5, 10), r.tra(1.5, 2.8));
      }
    }
  });
  // il tonfo del pezzo crollato (p.4)
  const cr = P.crollo ?? 0;
  if (cr > 0.45 && cr < 0.95) {
    const [x, w] = RIVE.tane[RIVE.crolla];
    const e = (cr - 0.45) / 0.5;
    for (let j = 0; j < 12; j++) {
      const r = elemento(seme, 5000 + j);
      gocce += ellisseD([x + w * 0.7 + r.segno(90) * e, yLaguna - r.tra(80, 200) * e + 300 * e * e], r.tra(2, 4), r.tra(2, 5));
    }
    bolle += ellisseD([x + w * 0.7, yLaguna + 2], 30 + 60 * e, 4);
  }
  return (
    (velo ? path(velo, { fill: col, opacity: forzaVelo }) : "") +
    path(righe, { stroke: col, "stroke-width": 3, fill: "none", opacity: 0.7, "stroke-linecap": "round" }) +
    path(bolle, { fill: col, opacity: 0.6 }) +
    path(gocce, { fill: col, opacity: 0.75 })
  );
}

/** Le rive basse, sotto Rivalba (ep04): l'argine delle tane, il varco, la laguna davanti. */
export const RIVE_BASSE = creaLuogo(
  {
    id: "rive-basse",
    nome: "le rive basse della Gente delle Rive, sotto Rivalba",
    profilo: PROFILO_RIVE,
    // la laguna sta davanti a tutto l'argine: l'acqua c'è dappertutto, sotto il suo piede
    acqua: { quota: LAGO_VESPRO.quota, riva: 30000 },
    colori: C_RIVE,
    suolo: { da: -2000, a: 2000 },
    erba: { confine: 0, sinistra: [4, 10], destra: [4, 10] },
    cespugli: { quanti: 0, sinistraProb: 0.5, sinistra: [-2000, -1000], destra: [1000, 2000], sotto: [40, 120] },
  },
  {
    lontanissimo: (o): Livello[] => [
      { id: "monti", contenuto: monti(o, 0.06, CRESTE), p: 0.06 },
      { id: "colli", contenuto: boscoLontano(o, 0.1, "vespro/colli", ORIZZONTE + 20, 170, -9000, 9000, 0.34), p: 0.1 },
    ],
    lontano: (o): Livello[] => [
      { id: "lago", contenuto: lagoAperto(o, 0.14), p: 0.14 },
      { id: "colle", contenuto: colleDelleCoppelle(o, 0.36), p: 0.36 },
    ],
    oggetti: (o, inVista) => {
      const { luce, defs, luogo } = o;
      let s = argineNellaLaguna(o) + acquaNelVarco(o);
      // i sassi che fanno l'argine, grossi ai due lati del varco
      for (const [x, w, h] of [[-330, 70, 54], [-420, 90, 46], [320, 76, 58], [430, 84, 44], [-1900, 60, 30], [1900, 64, 34], [-980, 40, 22], [1180, 44, 24]] as const) {
        if (inVista(x, w + 40)) s += roccia(luogo, `argine${x}`, x, w, h, luce, defs, 0.35);
      }
      // le tane
      RIVE.tane.forEach(([x, w], i) => {
        if (inVista(x, w + 60)) s += boccaDiTana(o, i, i === RIVE.crolla ? o.piena?.crollo ?? 0 : 0);
      });
      s += angoloCheCede(o, o.piena?.crollo ?? 0);
      // le canne in cima all'argine (non nel varco)
      const semeC = fnv1a32("rive/canne");
      for (let i = 0; i < 26; i++) {
        const r = elemento(semeC, i);
        const x = r.tra(-3000, 3000);
        if (Math.abs(x) < 470 || !inVista(x, 260)) continue;
        s += canneSullArgine(o, x, fnv1a32(`rive/ciuffo${i}`), r.intero(5, 9));
      }
      return s;
    },
    sullaPiena: (o, inVista) => sullaPienaDelleRive(o, inVista),
  },
);

/** Dove sta chi chiude il varco: in mezzo, sulla soglia (coordinate del palco). */
export const nelVarco = (): P => [RIVE.varco, LAGO_VESPRO.quota - RIVE.sogliaVarco + 1];

// ------------------------------------------------------------------ ALTURA --
/** Il sasso della vedetta, sull'Altura. */
const VEDETTA_X = 0;

/** L'Altura (ep04): il dosso sopra i laghi dove la marmotta fa la vedetta, e laggiù il lago. */
export const ALTURA = creaLuogo(
  {
    id: "altura",
    nome: "l'Altura, sopra i Laghi del Vespro",
    profilo: [
      [-30000, 760],
      [-1600, 700],
      [-700, 650],
      [-240, 606],
      [0, 596],
      [300, 612],
      [900, 668],
      [30000, 740],
    ],
    colori: { ...C, erba: "#9d9876", erbaScura: "#6f6b52", erbaChiara: "#c3bd98", erbaAperto: "#8f8a64", erbaApertoScura: "#66623f", roccia: "#8e8a82", rocciaScura: "#55524d" },
    suolo: { da: -1500, a: 1500 },
    erba: { confine: 99999, sinistra: [8, 18], destra: [8, 18] },
    cespugli: { quanti: 8, sinistraProb: 0.5, sinistra: [-2400, -900], destra: [900, 2400], sotto: [40, 160] },
  },
  {
    lontanissimo: (o): Livello[] => [
      { id: "monti", contenuto: monti(o, 0.06, CRESTE), p: 0.06 },
      { id: "colli", contenuto: boscoLontano(o, 0.1, "vespro/colli", ORIZZONTE + 30, 150, -9000, 9000, 0.34), p: 0.1 },
    ],
    lontano: (o): Livello[] => [{ id: "lago", contenuto: lagoDalColle(o, 0.14), p: 0.14 }],
    oggetti: (o, inVista) => {
      const { luce, defs, luogo } = o;
      let s = "";
      for (const [x, w, h, seme] of [[VEDETTA_X, 96, 130, "vedetta"], [-420, 70, 40, "altura1"], [360, 90, 46, "altura2"], [-900, 60, 30, "altura3"]] as const) {
        if (inVista(x, w + 40)) s += roccia(luogo, seme, x, w, h, luce, defs, 0.2);
      }
      return s;
    },
  },
);

/** Dove sta la marmotta (i piedi), sul sasso della vedetta. */
export const VEDETTA = (): P => [VEDETTA_X + 6, ALTURA.quota(VEDETTA_X) + 130 * 0.2 - 130 + 6];

/** Per chi disegna la luce del luogo (le inquadrature scelgono tra le LUCI del kit). */
export type { Luce };
