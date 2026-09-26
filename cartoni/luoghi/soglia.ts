// cartoni/luoghi/soglia.ts — la Soglia di Spondalta (ep01).
//
// Una collina sola in mezzo alla luce (ep01, p.1): a sinistra il versante dei
// laghi (monti, lago, canneto), a destra l'Aperto (erba corta fino in fondo
// all'aria, mandrie lontane come sassi in cammino).
//
// Qui c'è solo quello che è DI QUESTO luogo: il profilo della collina, la
// tavolozza, i lontani (i monti del lago e l'orizzonte dell'Aperto, il lago
// lontano, la riva col bosco di Zara) e dove stanno le cose che la prosa nomina.
// Cielo, temporale, terreno, erba, pioggia li dipinge il kit (scene/pittura.ts).

import { type Luce, inLuce, lontano, mescola, scurisci } from "../motore/colore";
import { elemento, fnv1a32, frattale1 } from "../motore/caso";
import { type Livello, vista } from "../motore/fotogramma";
import { type P, ellisseD, n, path, pt } from "../motore/svg";
import { type Colori, type OpzPalco, creaLuogo } from "../scene/luogo";
import { piegaErba } from "../scene/meteo";
import { alberoSecco, bordoDiRoccia, pietraSegnata, posatoio, ramoSecco as ramo, roccia } from "../scene/oggetti";
import { type Cresta, monti } from "../scene/pittura";

// ------------------------------------------------------------ geografia --
/** Il livello dell'acqua del lago e la riva. */
export const LAGO = { quota: 905, riva: -2450 } as const;

/** Dove stanno le cose che la prosa nomina. */
export const LUOGHI = {
  /** la conca in cima con la pietra piatta segnata (p.3, p.14, p.16) */
  pietra: 40,
  /** il bordo di roccia sotto cui ripara Zara nella tempesta (p.14) */
  bordoRoccia: -120,
  /** le due rocce da cui guarda l'Aperto (p.2) */
  roccia1: 230,
  roccia2: 330,
  /** il ramo secco che esplode sotto la zampa (p.7) */
  ramoCrack: 150,
  /** il ramo secco della gazza, sopra la riva (p.6, p.17) */
  ramoGazza: -2280,
  /** il canneto della riva (scende fino al piede della collina) */
  canneto: [-2900, -1900] as const,
} as const;

const C: Colori = {
  cieloAlto: "#7ea2c3",
  cieloOrizzonte: "#f1e2bf",
  monteLontano: "#8f9cb6",
  monteMedio: "#71819a",
  neve: "#e9ecf0",
  lago: "#6c8fa4",
  lagoChiaro: "#a8c3cf",
  canna: "#bb9a58",
  cannaScura: "#80683b",
  erba: "#9fa25a",
  erbaScura: "#6f7a41",
  erbaChiara: "#c9bd74",
  erbaAperto: "#c4a861",
  erbaApertoScura: "#9c8547",
  terra: "#7b6a4f",
  roccia: "#8f877a",
  rocciaScura: "#5f5a52",
  lichene: "#b9ab76",
  muschio: "#6d7743",
  bosco: "#4f5f3a",
  boscoScuro: "#35432a",
};

// ------------------------------------------------------------- lontani --
/** I monti del lago: scendono verso destra e finiscono DIETRO l'orizzonte dell'Aperto. */
const CRESTE: readonly Cresta[] = [
  { seme: "monti/lontani", base: 250, alt: 520, col: C.monteLontano, fos: 0.5, x0: -3400, x1: -150, neve: true },
  { seme: "monti/medi", base: 290, alt: 380, col: C.monteMedio, fos: 0.3, x0: -3000, x1: -380 },
];

/** L'Aperto all'orizzonte: una linea bassa, velata, e colline azzurre (non monti). */
function orizzonteAperto(luce: Luce): string {
  const oriz = lontano(inLuce(C.erbaAperto, luce), luce, 0.7);
  let s = path(`M${n(-200)} ${n(262)}Q${n(1500)} ${n(250)} ${n(4200)} ${n(258)}L${n(4200)} ${n(900)}L${n(-200)} ${n(900)}Z`, { fill: oriz });
  s += path(`M${n(-100)} ${n(264)}Q${n(700)} ${n(236)} ${n(1400)} ${n(258)}Q${n(2200)} ${n(240)} ${n(3200)} ${n(262)}L${n(3200)} ${n(270)}L${n(-100)} ${n(270)}Z`, { fill: lontano(inLuce(C.monteLontano, luce), luce, 0.7), opacity: 0.8 });
  return s;
}

function lagoLontano(o: OpzPalco, p: number): string {
  const { luce, meteo, t, defs } = o;
  const v = vista(o.cam, p, 0.3);
  let s = "";
  // specchio d'acqua: dalla sinistra fin sotto la collina
  const acqua = lontano(inLuce(mescola(C.lago, "#2a3446", meteo.notte * 0.3), luce), luce, 0.25);
  const acquaChiara = lontano(inLuce(C.lagoChiaro, luce), luce, 0.3);
  const url = defs.lineare("lago-lontano", [0, 300], [0, 700], [
    [0, acquaChiara],
    [0.35, acqua],
    [1, scurisci(acqua, 0.15)],
  ]);
  s += path(`M${n(Math.min(v.x0, -4000))} 300L${n(260)} 300Q${n(420)} 330 ${n(380)} 420L${n(260)} 900L${n(Math.min(v.x0, -4000))} 900Z`, { fill: url });
  // riflessi dei monti: tremolano
  const semeRif = fnv1a32("lago/riflessi");
  let rif = "";
  for (let i = 0; i < 60; i++) {
    const r = elemento(semeRif, i);
    const x = r.tra(-3600, 300);
    const y = r.tra(310, 520);
    const w = r.tra(30, 140);
    if (x < v.x0 - 100 || x > v.x1 + 100) continue;
    const dx = Math.sin(t * 0.8 + i) * 6;
    rif += `M${n(x + dx)} ${n(y)}h${n(w)}`;
  }
  s += path(rif, { stroke: acquaChiara, "stroke-width": 2.5, opacity: 0.55, "stroke-linecap": "round" });
  // scintille del sole (se c'è)
  const luccica = (1 - meteo.temporale) * (1 - meteo.notte);
  if (luccica > 0.05) {
    let sc = "";
    const semeSc = fnv1a32("lago/scintille");
    for (let i = 0; i < 50; i++) {
      const r = elemento(semeSc, i);
      const x = r.tra(-1600, 300);
      const y = r.tra(305, 380);
      const on = Math.max(0, Math.sin(t * r.tra(2, 4) + i * 1.7));
      const w = r.tra(6, 18);
      if (x < v.x0 - 50 || x > v.x1 + 50 || on < 0.6) continue;
      sc += `M${n(x)} ${n(y)}h${n(w)}`;
    }
    s += path(sc, { stroke: "#fff6d8", "stroke-width": 2, opacity: 0.8 * luccica, "stroke-linecap": "round" });
  }
  // nebbia bassa sul lago (bande morbide che scorrono)
  if (meteo.nebbia > 0.02) {
    const neb = lontano(inLuce("#eef0ec", luce), luce, 0.2);
    let d = "";
    for (let i = 0; i < 5; i++) {
      const y = 300 + i * 26;
      const x = -3600 + ((t * (6 + i * 2)) % 400);
      d += ellisseD([x + 1600, y], 2400, 18 + i * 3);
    }
    s += path(d, { fill: neb, opacity: meteo.nebbia * 0.35 });
  }
  return s;
}

function apertoLontano(o: OpzPalco, p: number): string {
  const { luce, t, meteo } = o;
  const v = vista(o.cam, p, 0.3);
  let s = "";
  const erba = lontano(inLuce(mescola(C.erbaAperto, C.erba, 0.35), luce), luce, 0.4);
  const erbaS = lontano(inLuce(C.erbaApertoScura, luce), luce, 0.4);
  // onde di terreno basse
  const pts: P[] = [];
  const x0 = Math.floor(Math.max(-400, v.x0 - 100) / 80) * 80;
  const x1 = Math.max(x0 + 100, v.x1 + 100);
  for (let x = x0; x <= x1 + 80; x += 80) pts.push([x, 330 + frattale1(x * 0.002, 3, 11) * 14]);
  s += path(`M${pt([x0, 900])}L${pts.map(pt).join("L")}L${pt([x1, 900])}Z`, { fill: erba });
  // le strisce del vento sull'erba corta
  const semeSt = fnv1a32("aperto/strisce");
  let st = "";
  for (let i = 0; i < 90; i++) {
    const r = elemento(semeSt, i);
    const x = r.tra(-300, 5200);
    const y = r.tra(340, 700);
    const w = r.tra(40, 160) * (0.6 + (y - 340) / 400);
    if (x < v.x0 - 80 || x > v.x1 + 80) continue;
    st += `M${n(x + Math.sin(t * 0.4 + i) * 4)} ${n(y)}h${n(w)}`;
  }
  s += path(st, { stroke: erbaS, "stroke-width": 3, opacity: 0.35, "stroke-linecap": "round" });
  // chiazze d'erba più scura e macchie di cespugli lontani
  let ch = "";
  let cesp = "";
  const semeCh = fnv1a32("aperto/chiazze");
  for (let i = 0; i < 160; i++) {
    const r = elemento(semeCh, i);
    const x = r.tra(-300, 3000);
    const y = r.tra(338, 700);
    const k = 0.5 + (y - 330) / 300;
    const rx = r.tra(60, 200) * k;
    const ry = r.tra(4, 10) * k;
    const cespuglio = r.moneta(0.4);
    const dx = r.segno(40);
    const cx = r.tra(5, 11) * k;
    const cy = r.tra(3, 6) * k;
    if (x < v.x0 - 150 || x > v.x1 + 150) continue;
    ch += ellisseD([x, y], rx, ry);
    if (cespuglio) cesp += ellisseD([x + dx, y - 3 * k], cx, cy);
  }
  s += path(ch, { fill: erbaS, opacity: 0.32 });
  s += path(cesp, { fill: lontano(inLuce(C.boscoScuro, luce), luce, 0.45), opacity: 0.8 });
  // le mandrie: «come sassi in cammino» (p.2)
  if (o.mandrie) {
    const col = lontano(inLuce("#4b4238", luce), luce, 0.5);
    let m = "";
    const semeM = fnv1a32("aperto/mandria");
    for (let i = 0; i < 26; i++) {
      const mr = elemento(semeM, i);
      const bx = mr.tra(1200, 3600);
      const x = bx + t * mr.tra(1.5, 3.5);
      const y = mr.tra(345, 392);
      const w = mr.tra(7, 12) * (0.8 + (y - 340) / 120);
      if (x < v.x0 - 30 || x > v.x1 + 30) continue;
      const pass = Math.sin(t * 3 + i) * 0.6;
      m += ellisseD([x, y - w * 0.35 + pass], w, w * 0.42);
    }
    s += path(m, { fill: col, opacity: (1 - meteo.notte) * 0.85 });
  }
  return s;
}

/** La riva lontana: il bosco sulla sponda (il mondo di Zara), l'acqua, le canne; e l'Aperto medio. */
function rivaMedia(o: OpzPalco, p: number): string {
  const { luce, t, meteo } = o;
  const v = vista(o.cam, p, 0.3);
  let s = "";
  const bosco = lontano(inLuce(C.bosco, luce), luce, 0.28 + meteo.nebbia * 0.1);
  const boscoS = lontano(inLuce(C.boscoScuro, luce), luce, 0.3);
  const semeB = fnv1a32("riva/bosco");
  let chiome = "";
  let chiomeS = "";
  for (let i = 0; i < 90; i++) {
    const r = elemento(semeB, i);
    const x = r.tra(-4200, -600);
    const y = 360 + r.tra(-10, 30) + (x + 600) * -0.02;
    const rr = r.tra(40, 90);
    if (x < v.x0 - 120 || x > v.x1 + 120) continue;
    chiomeS += ellisseD([x + 8, y + 10], rr, rr * 0.8);
    chiome += ellisseD([x, y], rr * 0.92, rr * 0.75);
  }
  s += path(chiomeS, { fill: boscoS });
  s += path(chiome, { fill: bosco });
  // riva: fascia d'acqua più vicina, con il canneto lontano
  const acqua = lontano(inLuce(C.lago, luce), luce, 0.12);
  s += path(`M${n(Math.min(v.x0, -5000))} 430L${n(-500)} 430Q${n(-300)} 460 ${n(-420)} 560L${n(Math.min(v.x0, -5000))} 560Z`, { fill: acqua, opacity: 0.9 });
  let canne = "";
  const semeC = fnv1a32("riva/canne");
  for (let i = 0; i < 160; i++) {
    const r = elemento(semeC, i);
    const x = r.tra(-4600, -560);
    const h = r.tra(30, 70);
    if (x < v.x0 - 30 || x > v.x1 + 30) continue;
    const lean = piegaErba(x * 3, t, meteo) * 10;
    canne += `M${n(x)} 440Q${n(x + lean * 0.5)} ${n(440 - h / 2)} ${n(x + lean)} ${n(440 - h)}`;
  }
  s += path(canne, { stroke: lontano(inLuce(C.canna, luce), luce, 0.2), "stroke-width": 3, fill: "none", "stroke-linecap": "round" });
  // l'Aperto medio: dossi d'erba
  const erba = lontano(inLuce(C.erbaAperto, luce), luce, 0.18);
  const pts: P[] = [];
  const x0 = Math.floor(Math.max(-200, v.x0 - 100) / 60) * 60;
  const x1 = Math.max(x0 + 100, v.x1 + 100);
  for (let x = x0; x <= x1 + 60; x += 60) pts.push([x, 420 + frattale1(x * 0.003, 3, 5) * 30]);
  s += path(`M${pt([x0, 1100])}L${pts.map(pt).join("L")}L${pt([x1, 1100])}Z`, { fill: erba });
  return s;
}

// ---------------------------------------------------------------- luogo --
export const SOGLIA = creaLuogo(
  {
    id: "soglia",
    nome: "la Soglia di Spondalta",
    profilo: [
      [-6000, 930],
      [-3200, 915],
      [-2500, 900],
      [-2150, 820],
      [-1600, 560],
      [-1050, 300],
      [-600, 120],
      [-260, 24],
      [0, 0],
      [240, 14],
      [560, 90],
      [1050, 260],
      [1650, 520],
      [2300, 760],
      [2900, 820],
      [6000, 840],
    ],
    acqua: LAGO,
    colori: C,
    // più verde verso il lago, più oro verso l'Aperto
    suolo: { da: -2400, a: 2400 },
    // verso l'Aperto l'erba è più corta e dorata
    erba: { confine: 0, sinistra: [24, 48], destra: [16, 30] },
    // il bosco che comincia: quasi tutti sul versante dei laghi
    cespugli: { quanti: 36, sinistraProb: 0.82, sinistra: [-2400, -380], destra: [520, 2400], sotto: [70, 460] },
    canneto: LUOGHI.canneto,
  },
  {
    lontanissimo: (o): Livello[] => [{ id: "monti", contenuto: monti(o, 0.06, CRESTE) + orizzonteAperto(o.luce), p: 0.06 }],
    lontano: (o): Livello[] => [
      { id: "lago", contenuto: lagoLontano(o, 0.16), p: 0.16 },
      { id: "aperto", contenuto: apertoLontano(o, 0.16), p: 0.16 },
      { id: "riva", contenuto: rivaMedia(o, 0.34), p: 0.34 },
    ],
    oggetti: (o, inVista) => {
      const { luce, defs, luogo } = o;
      let s = "";
      if (inVista(LUOGHI.bordoRoccia)) s += bordoDiRoccia(o, LUOGHI.bordoRoccia);
      if (inVista(LUOGHI.pietra)) s += pietraSegnata(o, LUOGHI.pietra);
      if (inVista(LUOGHI.roccia1)) s += roccia(luogo, "una", LUOGHI.roccia1, 70, 58, luce, defs);
      if (inVista(LUOGHI.roccia2)) s += roccia(luogo, "due", LUOGHI.roccia2, 84, 70, luce, defs);
      if (inVista(-760)) s += roccia(luogo, "pendio", -760, 60, 40, luce, defs, 0.35);
      if (inVista(900)) s += roccia(luogo, "aperto", 900, 50, 34, luce, defs, 0.35);
      if (inVista(LUOGHI.ramoGazza, 600)) s += alberoSecco(o, LUOGHI.ramoGazza);
      return s;
    },
  },
);

/** Dove posa la gazza sull'albero secco. */
export const posatoioGazza = (): P => posatoio(SOGLIA, LUOGHI.ramoGazza);

/** Il ramo secco che esplode sotto la zampa di Rocco (p.7). `rotto` 0..1. */
export const ramoSecco = (luce: Luce, rotto: number): string => ramo(SOGLIA, LUOGHI.ramoCrack, luce, rotto);
