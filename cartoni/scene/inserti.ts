// cartoni/scene/inserti.ts — i dettagli in macro (il ritmo vicino↔lontano, STILE §3).
//
//  - la pietra piatta coi segni (p.3, p.16): conche tonde, regolari, una accanto
//    all'altra — «fatti da qualcosa che non erano zampe». All'alba dopo la
//    pioggia: «una piccola luna per ogni segno». NIENTE bagliori: il tiepido è
//    fisico (il gelo resta sull'erba intorno, non sulla pietra; un filo di
//    vapore nell'aria fredda). Regola anti-New-Age dei ritornelli.
//  - la corda di Toraki (p.4, p.18): nodi fitti fino a metà, poi più niente.
//  - la zampa di Zara che legge (la zampa sul tiepido, la zampa sui nodi).
// Composizioni a schermo (1920×1080), con una lenta spinta della camera.

import { type Luce, inLuce, inOmbra, mescola, scurisci, schiarisci } from "../motore/colore";
import { caso } from "../motore/caso";
import type { Livello } from "../motore/fotogramma";
import { type Defs, type P, add, cerchioD, curva, ellisseD, g, mix, n, path, pt, tubo } from "../motore/svg";
import { clamp, ease, lerp, onda } from "../motore/tempo";
import { ZARA_ANCORE } from "../cast/zara";

const W = 1920;
const H = 1080;

export interface OpzPietra {
  t: number;
  luce: Luce;
  defs: Defs;
  /** Le conche piene d'acqua di pioggia (alba del p.16). */
  piene: boolean;
  /** La zampa di Zara che si posa (0 fuori, 1 posata). */
  zampa: number;
  /** Brina sull'erba attorno (alba fredda). */
  brina: number;
  /** Vapore del tiepido (solo fisica). */
  vapore: number;
  /** Colore del cielo che si specchia nelle conche. */
  cielo: string;
  /** Spinta lenta della camera 0..1. */
  spinta: number;
}

/** Le conche: posizioni fisse (fatte bene, una accanto all'altra). */
const CONCHE: readonly (readonly [number, number, number])[] = [
  [820, 520, 62],
  [985, 480, 66],
  [1155, 486, 64],
  [1318, 530, 60],
  [900, 688, 58],
  [1070, 676, 62],
  [1236, 700, 57],
];

export function insertoPietra(o: OpzPietra): Livello[] {
  const { luce, defs, t } = o;
  const sc = 1 + 0.06 * ease.dentroFuori(o.spinta);
  const cam = `translate(${W / 2} ${H / 2})scale(${Math.round(sc * 1000) / 1000})translate(${-W / 2} ${-H / 2})`;
  let fondo = "";
  // l'erba tutto attorno (fuori dalla pietra), con la brina dell'alba
  const erba = inLuce(mescola("#7f8a4c", "#98a3a0", o.brina * 0.5), luce);
  fondo += `<rect x="-50" y="-50" width="${W + 100}" height="${H + 100}" fill="${erba}"/>`;
  fondo += erbaMacro(t, luce, o.brina, "macro/erba");
  // la pietra: piatta, mezzo affondata, con i bordi morbidi e la grana
  const bordo: P[] = [
    [330, 330],
    [700, 250],
    [1150, 260],
    [1560, 360],
    [1640, 600],
    [1460, 850],
    [1000, 910],
    [560, 870],
    [300, 700],
  ];
  const dPietra = curva(bordo, true);
  const gp = defs.radiale("macro-pietra", [900, 460], 900, [
    [0, inLuce("#b3a58c", luce)],
    [0.6, inLuce("#978b77", luce)],
    [1, inOmbra("#6c6457", luce)],
  ]);
  let pietra = path(dPietra, { fill: gp });
  const clip = defs.clip("clip-macro-pietra", dPietra);
  let dentro = "";
  const rg = caso("macro/grana");
  let grana = "";
  let lic = "";
  for (let i = 0; i < 260; i++) {
    const x = rg.tra(280, 1680);
    const y = rg.tra(230, 930);
    grana += ellisseD([x, y], rg.tra(1.5, 5), rg.tra(1, 3));
    if (i < 12) lic += ellisseD([rg.tra(340, 1620), rg.tra(280, 880)], rg.tra(20, 70), rg.tra(12, 34));
  }
  dentro += path(lic, { fill: inLuce("#bcae78", luce), opacity: 0.22 });
  dentro += path(grana, { fill: inOmbra("#5b5448", luce), opacity: 0.3 });
  // le conche: tonde, regolari — e, dopo la pioggia, piene di cielo
  for (const [cx, cy, rr] of CONCHE) {
    // la conca: una scodella scavata nella pietra. Luce da sinistra-alto:
    // ombra dentro il bordo di sinistra, luce sulla parete di destra.
    const ry = rr * 0.8;
    dentro += path(ellisseD([cx, cy], rr, ry), { fill: inLuce("#8d826e", luce) });
    const clipC = defs.clip(`clip-conca-${cx}-${cy}`, ellisseD([cx, cy], rr, ry));
    dentro += g(
      { "clip-path": clipC },
      path(ellisseD([cx + rr * 0.3, cy + ry * 0.32], rr * 1.02, ry * 1.02), { fill: inLuce("#a79b84", luce) }) +
        path(ellisseD([cx - rr * 0.55, cy - ry * 0.55], rr * 0.9, ry * 0.7), { fill: inOmbra("#5d564b", luce), opacity: 0.75 }),
    );
    // il labbro: chiaro in basso a destra (dove la luce prende il bordo)
    dentro += path(`M${n(cx - rr * 0.7)} ${n(cy + ry * 0.72)}A${n(rr)} ${n(ry)} 0 0 0 ${n(cx + rr * 0.98)} ${n(cy - ry * 0.1)}`, {
      stroke: inLuce("#cfc3a8", luce),
      "stroke-width": 4,
      fill: "none",
      opacity: 0.7,
      "stroke-linecap": "round",
    });
    if (o.piene) {
      // «una piccola luna per ogni segno»: acqua tonda, precisa, che specchia il cielo
      const ga = defs.radiale(`luna-${cx}-${cy}`, [cx - rr * 0.25, cy - ry * 0.3], rr * 1.05, [
        [0, schiarisci(o.cielo, 0.12)],
        [0.55, o.cielo],
        [1, scurisci(o.cielo, 0.28)],
      ]);
      dentro += path(ellisseD([cx + 1, cy + 2], rr * 0.86, ry * 0.84), { fill: ga });
      dentro += path(ellisseD([cx + 1, cy + 2], rr * 0.86, ry * 0.84), { fill: "none", stroke: inOmbra("#4d463d", luce), "stroke-width": 2, opacity: 0.5 });
      // un tremolio minimo sul pelo dell'acqua
      const tr = 0.5 + 0.5 * Math.sin(t * 1.3 + cx * 0.01);
      dentro += path(`M${n(cx - rr * 0.45)} ${n(cy - ry * 0.28)}q${n(rr * 0.3)} ${n(-5 - tr * 2)} ${n(rr * 0.55)} ${n(2)}`, { stroke: "#ffffff", "stroke-width": 3, fill: "none", opacity: 0.6, "stroke-linecap": "round" });
    }
  }
  pietra += g({ "clip-path": clip }, dentro);
  // ombra del bordo della pietra sull'erba
  const ombraB = path(dPietra, { fill: "#1d1a14", opacity: 0.35, transform: "translate(14 22)" });

  // vapore: nell'aria fredda dell'alba il tiepido si vede come un respiro
  let vapore = "";
  if (o.vapore > 0.01) {
    const rv = caso("macro/vapore");
    let v = "";
    for (let i = 0; i < 14; i++) {
      const x0 = rv.tra(420, 1500);
      const k = (t * rv.tra(0.05, 0.1) + rv()) % 1;
      const x = x0 + Math.sin(t * 0.4 + i) * 40 * k;
      const y = rv.tra(420, 820) - k * 380;
      v += ellisseD([x, y], 60 + k * 160, 26 + k * 50);
    }
    vapore = path(v, { fill: "#f4f6f5", opacity: 0.07 * o.vapore });
  }

  // la zampa di Zara: entra dall'alto a sinistra e si posa accanto ai segni
  const z = clamp(o.zampa);
  let zampa = "";
  if (z > 0) {
    const e = ease.fuoriCubo(z);
    const cx = lerp(420, 560, e);
    const cy = lerp(-260, 470, e);
    zampa = g({ transform: `translate(${n(cx)} ${n(cy)})scale(1.2)translate(${n(-cx)} ${n(-cy)})` }, zampaDallAlto([cx, cy], luce, defs));
  }
  return [
    { id: "fondo", contenuto: fondo, schermo: true },
    { id: "pietra", contenuto: g({ transform: cam }, ombraB + pietra), schermo: true },
    { id: "zampa", contenuto: g({ transform: cam }, zampa), schermo: true },
    { id: "vapore", contenuto: g({ transform: cam }, vapore), schermo: true },
  ];
}

/** Un prato visto da vicino: lame d'erba piene, in tre toni, con la brina sulle punte. */
export function erbaMacro(t: number, luce: Luce, brina: number, seme: string): string {
  const r = caso(seme);
  const toni = [inOmbra("#56613a", luce), inLuce("#86914f", luce), inLuce(mescola("#b9b36e", "#dfe6e6", brina * 0.5), luce)];
  const strati = ["", "", ""];
  let gelo = "";
  for (let i = 0; i < 520; i++) {
    const x = r.tra(-60, W + 60);
    const y = r.tra(-40, H + 120);
    const a = r.tra(-2.3, -0.8) + onda(t, 4.2, i * 0.013) * 0.04;
    const L = r.tra(70, 190);
    const w = r.tra(5, 11);
    const tip: P = [x + Math.cos(a) * L, y + Math.sin(a) * L];
    const ctrl: P = [x + Math.cos(a + 0.25) * L * 0.55, y + Math.sin(a + 0.25) * L * 0.55];
    const lama = `M${n(x - w)} ${n(y)}Q${pt(ctrl)} ${pt(tip)}Q${n(ctrl[0] + w)} ${n(ctrl[1])} ${n(x + w)} ${n(y)}Z`;
    const k = Math.min(2, Math.floor(r() * 3));
    strati[k] += lama;
    if (brina > 0 && r.moneta(0.55)) {
      gelo += ellisseD(mix(ctrl, tip, r.tra(0.3, 0.95)), r.tra(2, 4.5), r.tra(1.5, 3));
    }
  }
  return (
    path(strati[0], { fill: toni[0] }) +
    path(strati[1], { fill: toni[1] }) +
    path(strati[2], { fill: toni[2], opacity: 0.85 }) +
    (gelo ? path(gelo, { fill: "#f4f8fb", opacity: 0.8 * brina }) : "")
  );
}

/** La zampa anteriore di Zara vista dall'alto: arancio, dita crema, strisce. */
export function zampaDallAlto(c: P, luce: Luce, defs: Defs): string {
  const manto = inLuce(ZARA_ANCORE.manto, luce);
  const mantoAlto = inLuce(schiarisci(ZARA_ANCORE.manto, 0.14), luce);
  const mantoOmbra = inOmbra(ZARA_ANCORE.manto, luce);
  const crema = inLuce(ZARA_ANCORE.crema, luce);
  const striscia = inLuce(ZARA_ANCORE.strisce, luce);
  let s = "";
  // ombra portata sulla pietra (la zampa è appoggiata: ombra corta e morbida)
  s += path(ellisseD(add(c, [26, 40]), 150, 110), { fill: "#1a1610", opacity: 0.28 });
  // l'avambraccio che arriva dal bordo in alto: più stretto della zampa
  const spina: P[] = [add(c, [-150, -620]), add(c, [-80, -330]), add(c, [-14, -80])];
  const braccio = tubo(spina, [92, 84, 88], { tappoInizio: false });
  const gb = defs.lineare("braccio-zara", add(c, [-160, 0]), add(c, [60, 0]), [
    [0, mantoOmbra],
    [0.45, manto],
    [0.75, mantoAlto],
    [1, mantoOmbra],
  ]);
  s += path(braccio, { fill: gb });
  // strisce di traverso sull'avambraccio (affusolate, asimmetriche)
  const r = caso("macro/braccio");
  let st = "";
  for (let i = 0; i < 6; i++) {
    const k = 0.1 + i * 0.13 + r.tra(-0.02, 0.02);
    const p = mix(spina[0], spina[2], k);
    const w = r.tra(70, 96);
    const sp = r.tra(8, 16);
    const inc = r.segno(10);
    st += `M${n(p[0] - w)} ${n(p[1] + inc)}Q${n(p[0])} ${n(p[1] - sp - 10)} ${n(p[0] + w * 0.8)} ${n(p[1] - inc - 18)}Q${n(p[0])} ${n(p[1] + sp)} ${n(p[0] - w)} ${n(p[1] + inc)}Z`;
  }
  s += path(st, { fill: striscia, opacity: 0.88 });
  // la zampa: larga e tonda, più della caviglia
  const gz = defs.radiale("zampa-alto", add(c, [-30, -40]), 190, [
    [0, mantoAlto],
    [0.7, manto],
    [1, mantoOmbra],
  ]);
  s += path(ellisseD(c, 128, 96), { fill: gz });
  // quattro dita ad arco sul davanti, pelo più chiaro verso le punte
  const dita: P[] = [
    [-92, 50],
    [-34, 84],
    [32, 86],
    [92, 54],
  ];
  const gd = defs.lineare("dita-alto", [0, 0], [0, 1], [
    [0, manto],
    [1, mescola(manto, crema, 0.55)],
  ], "objectBoundingBox");
  for (const d of dita) s += path(ellisseD(add(c, d), 46, 40), { fill: gd });
  // le pieghe tra le dita
  let pieghe = "";
  for (const [a, b] of [
    [-64, 64],
    [0, 88],
    [64, 68],
  ] as const) {
    pieghe += `M${pt(add(c, [a * 0.8, b - 46]))}Q${pt(add(c, [a, b - 12]))} ${pt(add(c, [a * 1.05, b + 14]))}`;
  }
  s += path(pieghe, { stroke: scurisci(mantoOmbra, 0.25), "stroke-width": 4, fill: "none", "stroke-linecap": "round", opacity: 0.7 });
  // pelo: tratti corti che seguono la forma
  let pelo = "";
  const rp = caso("macro/pelo");
  for (let i = 0; i < 60; i++) {
    const a = rp.tra(0, Math.PI * 2);
    const rr = rp.tra(0.2, 0.9);
    const p = add(c, [Math.cos(a) * 118 * rr, Math.sin(a) * 86 * rr]);
    pelo += `M${pt(p)}l${n(Math.cos(a) * 10)} ${n(Math.sin(a) * 10 + 4)}`;
  }
  s += path(pelo, { stroke: mantoAlto, "stroke-width": 2.2, "stroke-linecap": "round", opacity: 0.5 });
  return s;
}

// ---------------------------------------------------------------- la corda --
export interface OpzCorda {
  t: number;
  luce: Luce;
  defs: Defs;
  /** Quanto è srotolata 0..1. */
  srotolata: number;
  /** La zampa che passa sui nodi: posizione lungo la corda 0..1 (o <0 = assente). */
  lettura: number;
  spinta: number;
}

/** Il percorso della corda sulla pietra: attraversa il quadro, appena ondulata. */
function puntoCorda(u: number): P {
  const x = lerp(-120, 2040, u);
  const y = 600 + Math.sin(u * Math.PI * 1.2 + 0.3) * 90 - u * 60;
  return [x, y];
}

/** Dove finiscono i nodi di Toraki: «nodi fitti fino a metà, poi più niente». */
export const FINE_NODI = 0.5;

export function insertoCorda(o: OpzCorda): Livello[] {
  const { luce, defs } = o;
  const sc = 1 + 0.05 * ease.dentroFuori(o.spinta);
  const cam = `translate(${W / 2} ${H / 2})scale(${Math.round(sc * 1000) / 1000})translate(${-W / 2} ${-H / 2})`;
  // il fondo: la pietra tiepida, vicina, con la grana e il sole caldo
  const gp = defs.radiale("corda-pietra", [760, 360], 1500, [
    [0, inLuce("#bcae93", luce)],
    [0.6, inLuce("#9d917b", luce)],
    [1, inOmbra("#6f6759", luce)],
  ]);
  let fondo = `<rect x="-50" y="-50" width="${W + 100}" height="${H + 100}" fill="${gp}"/>`;
  const rg = caso("corda/grana");
  let grana = "";
  let lic = "";
  for (let i = 0; i < 360; i++) grana += ellisseD([rg.tra(0, W), rg.tra(0, H)], rg.tra(1.5, 5), rg.tra(1, 3));
  for (let i = 0; i < 9; i++) lic += ellisseD([rg.tra(0, W), rg.tra(0, H)], rg.tra(30, 90), rg.tra(16, 40));
  fondo += path(lic, { fill: inLuce("#c2b27c", luce), opacity: 0.2 });
  fondo += path(grana, { fill: inOmbra("#5b5448", luce), opacity: 0.26 });
  // due conche del segno, in alto a destra (la somiglianza: «Si somigliano», p.18)
  for (const [x, y, rr] of [
    [1540, 200, 70],
    [1740, 250, 66],
  ] as const) {
    const ry = rr * 0.8;
    fondo += path(ellisseD([x, y], rr, ry), { fill: inLuce("#8d826e", luce) });
    const clipC = defs.clip(`corda-clip-conca-${x}`, ellisseD([x, y], rr, ry));
    fondo += g(
      { "clip-path": clipC },
      path(ellisseD([x + rr * 0.3, y + ry * 0.32], rr * 1.02, ry * 1.02), { fill: inLuce("#a79b84", luce) }) +
        path(ellisseD([x - rr * 0.55, y - ry * 0.55], rr * 0.9, ry * 0.7), { fill: inOmbra("#5d564b", luce), opacity: 0.75 }),
    );
  }

  // la corda: fibra e crine, spessa (siamo vicinissimi). Srotolata fino a `srotolata`.
  const fine = clamp(o.srotolata);
  const N = 120;
  const pts: P[] = [];
  for (let i = 0; i <= N * fine; i++) pts.push(puntoCorda(i / N));
  let corda = "";
  const fibra = inLuce("#b0935f", luce);
  const fibraC = inLuce("#cdb27c", luce);
  const fibraS = inOmbra("#7d6440", luce);
  if (pts.length >= 2) {
    corda += path(tubo(pts.map((p) => add(p, [8, 14])), pts.map(() => 20)), { fill: "#1a1610", opacity: 0.25 });
    corda += path(tubo(pts, pts.map(() => 22)), { fill: fibraS });
    corda += path(tubo(pts.map((p) => add(p, [0, -4])), pts.map(() => 17)), { fill: fibra });
    corda += path(tubo(pts.map((p) => add(p, [0, -9])), pts.map(() => 6)), { fill: fibraC, opacity: 0.6 });
    // la torsione dei trefoli
    let tors = "";
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i];
      tors += `M${n(p[0] - 9)} ${n(p[1] + 16)}Q${n(p[0])} ${n(p[1])} ${n(p[0] + 9)} ${n(p[1] - 18)}`;
    }
    corda += path(tors, { stroke: fibraS, "stroke-width": 3, fill: "none", opacity: 0.55 });
  }
  // i nodi: fitti fino a metà, ognuno stretto attorno a un pegno diverso
  const rn = caso("corda/nodi");
  const pegni = ["#e8e2d4", "#4f4032", "#c9a24a", "#3d4f6b", "#8a6d4d", "#d9d3c2", "#6e7b4a", "#a44f3a"];
  let nodi = "";
  const quanti = 8;
  for (let i = 0; i < quanti; i++) {
    const u = 0.08 + (i / (quanti - 1)) * (FINE_NODI - 0.1) + rn.tra(-0.006, 0.006);
    if (u > fine) break;
    const p = puntoCorda(u);
    const rr = rn.tra(36, 44);
    nodi += path(ellisseD(add(p, [6, 12]), rr + 4, rr * 0.7), { fill: "#1a1610", opacity: 0.25 });
    nodi += path(ellisseD(p, rr, rr * 0.82), { fill: fibraS });
    nodi += path(ellisseD(add(p, [-3, -5]), rr * 0.82, rr * 0.64), { fill: fibra });
    // gli avvolgimenti del nodo
    nodi += path(`M${n(p[0] - rr * 0.7)} ${n(p[1] - 6)}Q${n(p[0])} ${n(p[1] - rr * 0.9)} ${n(p[0] + rr * 0.7)} ${n(p[1] - 2)}M${n(p[0] - rr * 0.6)} ${n(p[1] + 10)}Q${n(p[0])} ${n(p[1] - rr * 0.3)} ${n(p[0] + rr * 0.6)} ${n(p[1] + 12)}`, {
      stroke: fibraS,
      "stroke-width": 4,
      fill: "none",
      opacity: 0.8,
    });
    nodi += path(`M${n(p[0] - rr * 0.5)} ${n(p[1] - rr * 0.4)}q${n(rr * 0.4)} ${n(-8)} ${n(rr * 0.8)} ${n(-2)}`, { stroke: fibraC, "stroke-width": 3, fill: "none", opacity: 0.7 });
    // il pegno: un ciuffo di pelo, una piuma, una scaglia di corteccia, un filo…
    const col = inLuce(pegni[i % pegni.length], luce);
    const tipo = i % 4;
    const q = add(p, [rn.segno(8), -rr * 0.6]);
    if (tipo === 0) {
      let ciuffo = "";
      for (let j = 0; j < 5; j++) ciuffo += `M${pt(q)}q${n(rn.segno(16))} ${n(-24)} ${n(rn.segno(24))} ${n(-rn.tra(40, 56))}`;
      nodi += path(ciuffo, { stroke: col, "stroke-width": 3.5, fill: "none", "stroke-linecap": "round" });
    } else if (tipo === 1) {
      const ang = rn.tra(-40, 20);
      nodi += g({ transform: `rotate(${n(ang)} ${n(q[0])} ${n(q[1])})` }, path(curva([q, add(q, [10, -30]), add(q, [4, -64]), add(q, [-8, -30])], true), { fill: col }) + path(`M${pt(q)}L${pt(add(q, [3, -62]))}`, { stroke: scurisci(col, 0.3), "stroke-width": 2 }));
    } else if (tipo === 2) {
      nodi += path(curva([add(q, [-16, 4]), add(q, [-12, -18]), add(q, [10, -22]), add(q, [18, 0]), add(q, [2, 8])], true), { fill: col });
      nodi += path(`M${pt(add(q, [-8, -4]))}l14 -10M${pt(add(q, [-4, 4]))}l16 -8`, { stroke: scurisci(col, 0.3), "stroke-width": 2 });
    } else {
      nodi += path(`M${pt(q)}q${n(20)} ${n(-10)} ${n(30)} ${n(-40)}q${n(4)} ${n(-14)} ${n(-6)} ${n(-22)}`, { stroke: col, "stroke-width": 4, fill: "none", "stroke-linecap": "round" });
    }
  }

  // la zampa che legge i nodi, uno per uno (e poi arriva al liscio)
  let zampa = "";
  if (o.lettura >= 0) {
    const p = puntoCorda(clamp(o.lettura, 0, fine));
    zampa = zampaDallAlto(add(p, [-30, -70]), luce, defs);
  }
  return [
    { id: "fondo", contenuto: g({ transform: cam }, fondo), schermo: true },
    { id: "corda", contenuto: g({ transform: cam }, corda + nodi), schermo: true },
    { id: "zampa", contenuto: g({ transform: cam }, zampa), schermo: true },
  ];
}
