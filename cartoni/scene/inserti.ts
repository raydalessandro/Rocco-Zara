// cartoni/scene/inserti.ts — i dettagli in macro (il ritmo vicino↔lontano, STILE §3).
//
//  - la pietra piatta coi segni (p.3, p.16): conche tonde, regolari, una accanto
//    all'altra — «fatti da qualcosa che non erano zampe». All'alba dopo la
//    pioggia: «una piccola luna per ogni segno». NIENTE bagliori: il tiepido è
//    fisico (il gelo resta sull'erba intorno, non sulla pietra; un filo di
//    vapore nell'aria fredda). Regola anti-New-Age dei ritornelli.
//  - la corda di Toraki (p.4, p.18): nodi fitti fino a metà, poi più niente.
//  - la zampa di Zara che legge (la zampa sul tiepido, la zampa sui nodi).
//  - (ep02) la corda sul legno della barca (p.11), le zampe palmate di Brénta
//    che la pesano e ci annodano il loro nodo (p.13); la corda nell'involto di
//    foglie (p.16: «i nodi adesso erano due»).
// Composizioni a schermo (1920×1080), con una lenta spinta della camera.

import { type Luce, inLuce, inOmbra, mescola, scurisci, schiarisci } from "../motore/colore";
import { caso } from "../motore/caso";
import type { Livello } from "../motore/fotogramma";
import { type Defs, type P, add, cerchioD, curva, ellisseD, g, mix, n, path, pt, tubo } from "../motore/svg";
import { clamp, ease, lerp, onda } from "../motore/tempo";
import { BRENTA_ANCORE } from "../cast/laghi";
import { ZARA_ANCORE } from "../cast/zara";

const BRENTA_PELO = BRENTA_ANCORE.pelo;
const BRENTA_UNGHIE = BRENTA_ANCORE.gola;

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
  /** Come stanno le conche: in fila (la pietra segnata, ep01) o a cerchi (le Coppelle, ep03). */
  conche?: "fila" | "cerchi";
  /** Di notte, nelle conche piene: la luna, piccola, in ognuna («piene di luna», ep03 p.13). */
  luna?: boolean;
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

/** Le conche delle Coppelle: una in mezzo, e attorno due cerchi (la pietra vista un poco di sbieco). */
const CERCHI: readonly (readonly [number, number, number])[] = [
  [980, 580, 56],
  ...Array.from({ length: 6 }, (_, i) => [980 + 190 * Math.cos((i * Math.PI) / 3 + 0.3), 580 + 137 * Math.sin((i * Math.PI) / 3 + 0.3), 44] as const),
  ...Array.from({ length: 10 }, (_, i) => [980 + 345 * Math.cos((i * Math.PI) / 5), 580 + 248 * Math.sin((i * Math.PI) / 5), 34] as const),
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
  for (const [cx, cy, rr] of o.conche === "cerchi" ? CERCHI : CONCHE) {
    // la conca: una scodella scavata nella pietra. Luce da sinistra-alto:
    // ombra dentro il bordo di sinistra, luce sulla parete di destra.
    const ry = rr * 0.8;
    dentro += path(ellisseD([cx, cy], rr, ry), { fill: inLuce("#8d826e", luce) });
    const clipC = defs.clip(`clip-conca-${Math.round(cx)}-${Math.round(cy)}`, ellisseD([cx, cy], rr, ry));
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
      const ga = defs.radiale(`luna-${Math.round(cx)}-${Math.round(cy)}`, [cx - rr * 0.25, cy - ry * 0.3], rr * 1.05, [
        [0, schiarisci(o.cielo, 0.12)],
        [0.55, o.cielo],
        [1, scurisci(o.cielo, 0.28)],
      ]);
      dentro += path(ellisseD([cx + 1, cy + 2], rr * 0.86, ry * 0.84), { fill: ga });
      dentro += path(ellisseD([cx + 1, cy + 2], rr * 0.86, ry * 0.84), { fill: "none", stroke: inOmbra("#4d463d", luce), "stroke-width": 2, opacity: 0.5 });
      // un tremolio minimo sul pelo dell'acqua
      const tr = 0.5 + 0.5 * Math.sin(t * 1.3 + cx * 0.01);
      dentro += path(`M${n(cx - rr * 0.45)} ${n(cy - ry * 0.28)}q${n(rr * 0.3)} ${n(-5 - tr * 2)} ${n(rr * 0.55)} ${n(2)}`, { stroke: "#ffffff", "stroke-width": 3, fill: "none", opacity: 0.6, "stroke-linecap": "round" });
      if (o.luna) {
        // la luna, piccola, dentro ogni conca (sempre dallo stesso lato: è una sola, e le conche la rimandano tutte)
        const lc: P = [cx - rr * 0.18, cy - ry * 0.12];
        const alone = defs.radiale(`lunetta-${Math.round(cx)}-${Math.round(cy)}`, lc, rr * 0.6, [
          [0, "#f4f1e4", 0.5],
          [1, "#f4f1e4", 0],
        ]);
        dentro += path(ellisseD(lc, rr * 0.6, rr * 0.5), { fill: alone });
        dentro += path(ellisseD(add(lc, [Math.sin(t * 1.1 + cy) * 1.2, 0]), rr * 0.2, rr * 0.18), { fill: "#f6f3e8", opacity: 0.95 });
      }
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
/** Il fondo dell'inserto sulla barca: le tavole del pagliolo, vicine, bagnate qua e là. */
function tavoleDellaBarca(o: OpzCorda): string {
  const { luce, defs } = o;
  const gp = defs.lineare("corda-legno", [0, 0], [0, H], [
    [0, inLuce("#8a6a46", luce)],
    [1, inOmbra("#5e4630", luce)],
  ]);
  let s = `<rect x="-50" y="-50" width="${W + 100}" height="${H + 100}" fill="${gp}"/>`;
  const r = caso("corda/tavole");
  let fughe = "";
  let venature = "";
  for (let y = -40; y < H + 60; y += 150) {
    fughe += `M-60 ${n(y)}L${W + 60} ${n(y + r.segno(6))}`;
    for (let j = 0; j < 7; j++) {
      const yy = y + r.tra(12, 138);
      const x0 = r.tra(-100, W);
      venature += `M${n(x0)} ${n(yy)}q${n(r.tra(120, 300))} ${n(r.segno(10))} ${n(r.tra(300, 700))} ${n(r.segno(6))}`;
    }
  }
  s += path(venature, { stroke: inOmbra("#4a3624", luce), "stroke-width": 2, fill: "none", opacity: 0.35 });
  s += path(fughe, { stroke: "#2a1f15", "stroke-width": 6, fill: "none", opacity: 0.55 });
  // qualche goccia d'acqua di lago, e una chiazza bagnata
  let gocce = "";
  for (let i = 0; i < 26; i++) gocce += ellisseD([r.tra(0, W), r.tra(0, H)], r.tra(3, 9), r.tra(2, 6));
  s += path(gocce, { fill: "#e9eef0", opacity: 0.35 });
  s += path(ellisseD([420, 820], 260, 90), { fill: "#2a1f15", opacity: 0.18 });
  return s;
}

/** Il fondo dell'involto: foglie larghe e lunghe, avvolte, coi loro nervi (i colori dell'involto di Zara). */
function fogliDellInvolto(o: OpzCorda): string {
  const { luce, defs } = o;
  const gp = defs.lineare("corda-foglie", [0, 0], [0, H], [
    [0, inLuce("#4a5a2a", luce)],
    [1, inOmbra("#2c3619", luce)],
  ]);
  let s = `<rect x="-50" y="-50" width="${W + 100}" height="${H + 100}" fill="${gp}"/>`;
  const r = caso("corda/foglie");
  const toni = ["#56662f", "#62733a", "#7b8a44", "#4c5a29"];
  for (let i = 0; i < 7; i++) {
    const c: P = [r.tra(-100, W + 100), r.tra(80, H - 40)];
    const L = r.tra(700, 1200);
    const w = r.tra(170, 260);
    const ang = r.tra(-28, 28) + (i % 2 ? 180 : 0);
    const a: P = [-L / 2, 0];
    const b: P = [L / 2, 0];
    let f = path(`M${pt(a)}Q${n(-L * 0.1)} ${n(-w)} ${pt(b)}Q${n(L * 0.1)} ${n(w * 0.9)} ${pt(a)}Z`, { fill: inLuce(toni[i % toni.length], luce) });
    // l'ombra della foglia sopra, il nervo centrale, i nervi laterali
    f += path(`M${pt(a)}Q${n(L * 0.1)} ${n(w * 0.9)} ${pt(b)}Q${n(L * 0.05)} ${n(w * 0.45)} ${pt(a)}Z`, { fill: "#1d240f", opacity: 0.22 });
    f += path(`M${n(-L / 2 + 20)} 0Q0 ${n(-w * 0.12)} ${n(L / 2 - 20)} 0`, { stroke: inLuce("#9aa55c", luce), "stroke-width": 5, fill: "none", opacity: 0.75 });
    let nervi = "";
    for (let j = 1; j < 11; j++) {
      const x = -L / 2 + (j / 11) * L;
      const lung = w * 0.75 * Math.sin((j / 11) * Math.PI);
      nervi += `M${n(x)} ${n(-w * 0.06)}q${n(40)} ${n(-lung * 0.5)} ${n(90)} ${n(-lung * 0.8)}M${n(x)} ${n(-w * 0.04)}q${n(40)} ${n(lung * 0.5)} ${n(90)} ${n(lung * 0.75)}`;
    }
    f += path(nervi, { stroke: inLuce("#8e9a52", luce), "stroke-width": 2, fill: "none", opacity: 0.45 });
    s += g({ transform: `translate(${n(c[0])} ${n(c[1])})rotate(${n(ang)})` }, f);
  }
  // la penombra dentro l'involto
  s += path(ellisseD([W / 2, H * 0.55], W * 0.7, H * 0.6), { fill: "#fff6d8", opacity: 0.06 });
  return s;
}

/**
 * Il fondo dell'inserto alle Coppelle (ep04, p.18): la pietra larga, e le conche a
 * cerchi — due giri che passano sopra e sotto la corda — piene della pioggia della
 * notte, col cielo dell'alba dentro.
 */
function pietraDelleConche(o: OpzCorda): string {
  const { luce, defs } = o;
  const gp = defs.radiale("corda-coppelle", [900, 420], 1500, [
    [0, inLuce("#b7ab94", luce)],
    [0.6, inLuce("#998e7a", luce)],
    [1, inOmbra("#6c6457", luce)],
  ]);
  let s = `<rect x="-50" y="-50" width="${W + 100}" height="${H + 100}" fill="${gp}"/>`;
  const rg = caso("coppelle/grana");
  let grana = "";
  let lic = "";
  for (let i = 0; i < 360; i++) grana += ellisseD([rg.tra(0, W), rg.tra(0, H)], rg.tra(1.5, 5), rg.tra(1, 3));
  for (let i = 0; i < 9; i++) lic += ellisseD([rg.tra(0, W), rg.tra(0, H)], rg.tra(30, 90), rg.tra(16, 40));
  s += path(lic, { fill: inLuce("#c2b27c", luce), opacity: 0.18 });
  s += path(grana, { fill: inOmbra("#5b5448", luce), opacity: 0.26 });
  const cielo = inLuce("#c9d3dc", luce);
  const giri: [number, number, number][] = [];
  for (let i = 0; i < 12; i++) giri.push([980 + 470 * Math.cos((i * Math.PI) / 6 + 0.2), 560 + 400 * Math.sin((i * Math.PI) / 6 + 0.2), 40]);
  for (let i = 0; i < 16; i++) giri.push([980 + 700 * Math.cos((i * Math.PI) / 8), 560 + 560 * Math.sin((i * Math.PI) / 8), 34]);
  for (const [cx, cy, rr] of giri) {
    if (cy > 420 && cy < 760) continue; // dove passa la corda la pietra è liscia
    const ry = rr * 0.8;
    s += path(ellisseD([cx, cy], rr, ry), { fill: inLuce("#8d826e", luce) });
    const clipC = defs.clip(`coppelle-conca-${Math.round(cx)}-${Math.round(cy)}`, ellisseD([cx, cy], rr, ry));
    s += g({ "clip-path": clipC }, path(ellisseD([cx + rr * 0.3, cy + ry * 0.32], rr * 1.02, ry * 1.02), { fill: inLuce("#a79b84", luce) }) + path(ellisseD([cx - rr * 0.55, cy - ry * 0.55], rr * 0.9, ry * 0.7), { fill: inOmbra("#5d564b", luce), opacity: 0.75 }));
    // piena della pioggia della notte: il cielo dell'alba, e un filo di luce
    s += path(ellisseD([cx + 1, cy + 2], rr * 0.84, ry * 0.8), { fill: cielo, opacity: 0.9 });
    s += path(`M${n(cx - rr * 0.4)} ${n(cy - ry * 0.25)}q${n(rr * 0.3)} -5 ${n(rr * 0.55)} 2`, { stroke: "#ffffff", "stroke-width": 2.6, fill: "none", opacity: 0.55, "stroke-linecap": "round" });
  }
  return s;
}

/**
 * Un nodo fatto nella corda stessa, come quelli di Toraki (ep04): fino a metà è
 * l'anello che si alza e gira attorno al pegno, poi il nodo che si stringe; il pegno
 * (la scaglia di remo di Brénta) resta preso dentro, di traverso.
 */
function nodoDiCorda(p: P, k: number, pegno: "remo" | undefined, luce: Luce, fibra: string, fibraC: string, fibraS: string): string {
  let s = "";
  // il pegno: la scaglia chiara di remo, posata sulla pietra, che il nodo prende
  if (pegno === "remo") {
    // legno fresco: dentro un remo vecchio il legno è chiaro, e il filo si vede
    const legno = inLuce("#e4cf9f", luce);
    s += path(ellisseD(add(p, [10, 22]), 80, 13), { fill: "#1a1610", opacity: 0.22 });
    s += g({ transform: `translate(${n(p[0])} ${n(p[1] - 4)})rotate(-18)` }, path("M-84 -7L74 -16L86 -4L-76 9Z", { fill: legno, stroke: inOmbra("#7a5a36", luce), "stroke-width": 2.4 }) + path("M-70 -2L70 -9M-58 4L48 -1", { stroke: inOmbra("#9a7a52", luce), "stroke-width": 1.6, opacity: 0.6 }));
  }
  if (k < 0.55) {
    // l'anello: la corda si alza e gira
    const h = 70 * (k / 0.55);
    const anello = `M${n(p[0] - 46)} ${n(p[1])}C${n(p[0] - 46)} ${n(p[1] - h * 1.4)} ${n(p[0] + 40)} ${n(p[1] - h * 1.4)} ${n(p[0] + 30)} ${n(p[1] + 4)}`;
    s += path(anello, { stroke: fibraS, "stroke-width": 22, fill: "none", "stroke-linecap": "round" });
    s += path(anello, { stroke: fibra, "stroke-width": 16, fill: "none", "stroke-linecap": "round" });
    s += path(anello, { stroke: fibraC, "stroke-width": 5, fill: "none", "stroke-linecap": "round", opacity: 0.5, transform: "translate(-2 -3)" });
    return s;
  }
  // il nodo che si stringe: più piccolo e più duro man mano
  const st = (k - 0.55) / 0.45;
  const rr = 58 - 18 * st;
  s += path(ellisseD(add(p, [6, 12]), rr + 4, rr * 0.7), { fill: "#1a1610", opacity: 0.25 });
  s += path(ellisseD(p, rr, rr * 0.82), { fill: fibraS });
  s += path(ellisseD(add(p, [-3, -5]), rr * 0.82, rr * 0.64), { fill: fibra });
  s += path(`M${n(p[0] - rr * 0.7)} ${n(p[1] - 6)}Q${n(p[0])} ${n(p[1] - rr * 0.9)} ${n(p[0] + rr * 0.7)} ${n(p[1] - 2)}M${n(p[0] - rr * 0.6)} ${n(p[1] + 10)}Q${n(p[0])} ${n(p[1] - rr * 0.3)} ${n(p[0] + rr * 0.6)} ${n(p[1] + 12)}`, { stroke: fibraS, "stroke-width": 4, fill: "none", opacity: 0.8 });
  s += path(`M${n(p[0] - rr * 0.5)} ${n(p[1] - rr * 0.4)}q${n(rr * 0.4)} -8 ${n(rr * 0.8)} -2`, { stroke: fibraC, "stroke-width": 3, fill: "none", opacity: 0.7 });
  // le due punte della scaglia che escono dal nodo
  if (pegno === "remo") {
    const legno = inLuce("#e4cf9f", luce);
    const filo = { stroke: inOmbra("#7a5a36", luce), "stroke-width": 2.4 };
    s += g({ transform: `translate(${n(p[0])} ${n(p[1] - 4)})rotate(-18)` }, path(`M${n(rr * 0.7)} -10L74 -16L86 -4L${n(rr * 0.7)} 1Z`, { fill: legno, ...filo }) + path(`M-84 -7L${n(-rr * 0.7)} -8L${n(-rr * 0.7)} 4L-76 9Z`, { fill: legno, ...filo }));
  }
  return s;
}

/**
 * L'inserto del nodino vecchio (ep04, p.18: «sul bordo della pietra un nodino vecchio,
 * piccolo, consumato»): l'orlo della pietra delle conche, una fessura, e dentro un
 * nodo piccolo di corda grigia, sfilacciata — fatto come quelli di Toraki. La zampa
 * di Zara ci arriva e lo trova (0..1), prima degli occhi.
 */
export function insertoNodino(o: { t: number; luce: Luce; defs: Defs; zampa: number; spinta: number }): Livello[] {
  const { luce, defs, t } = o;
  const sc = 1 + 0.05 * ease.dentroFuori(o.spinta);
  const cam = `translate(${W / 2} ${H / 2})scale(${Math.round(sc * 1000) / 1000})translate(${-W / 2} ${-H / 2})`;
  // sotto, l'erba bagnata; sopra, la pietra, con l'orlo che scende di sbieco
  let fondo = `<rect x="-50" y="-50" width="${W + 100}" height="${H + 100}" fill="${inLuce("#6f7a44", luce)}"/>`;
  fondo += erbaMacro(t, luce, 0, "macro/erba-nodino");
  const orlo: P[] = [
    [-60, -60],
    [W + 60, -60],
    [W + 60, 470],
    [1500, 560],
    [1080, 640],
    [700, 760],
    [360, 830],
    [-60, 900],
  ];
  const dPietra = curva(orlo, true, 0.6);
  const gp = defs.radiale("nodino-pietra", [1100, 200], 1300, [
    [0, inLuce("#b7ab94", luce)],
    [0.7, inLuce("#978b77", luce)],
    [1, inOmbra("#6c6457", luce)],
  ]);
  let pietra = path(dPietra, { fill: gp });
  const clip = defs.clip("nodino-clip", dPietra);
  const rg = caso("nodino/grana");
  let grana = "";
  let lic = "";
  for (let i = 0; i < 300; i++) grana += ellisseD([rg.tra(0, W), rg.tra(0, 900)], rg.tra(1.5, 5), rg.tra(1, 3));
  for (let i = 0; i < 12; i++) lic += ellisseD([rg.tra(0, W), rg.tra(0, 820)], rg.tra(30, 90), rg.tra(16, 40));
  let dentro = path(lic, { fill: inLuce("#c2b27c", luce), opacity: 0.2 }) + path(grana, { fill: inOmbra("#5b5448", luce), opacity: 0.26 });
  // l'orlo: una fascia più scura dove la pietra gira verso il basso
  dentro += path(`M-60 870L360 800L700 730L1080 610L1500 530L${W + 60} 440`, { stroke: inOmbra("#5d564b", luce), "stroke-width": 60, fill: "none", opacity: 0.45 });
  // due conche in alto, piene
  for (const [cx, cy, rr] of [[1320, 160, 56], [1620, 250, 48]] as const) {
    dentro += path(ellisseD([cx, cy], rr, rr * 0.8), { fill: inLuce("#8d826e", luce) }) + path(ellisseD([cx + 1, cy + 2], rr * 0.84, rr * 0.66), { fill: inLuce("#c9d3dc", luce), opacity: 0.9 });
  }
  // la fessura sull'orlo, e il nodino dentro
  dentro += path("M860 700Q900 660 930 640Q960 626 990 600", { stroke: inOmbra("#3f3a33", luce), "stroke-width": 7, fill: "none", "stroke-linecap": "round" });
  pietra += g({ "clip-path": clip }, dentro);
  pietra += path(dPietra, { fill: "#1d1a14", opacity: 0.3, transform: "translate(10 18)" });
  // il nodino: una corda grigia sottile, due giri stretti attorno a un dente della pietra, i capi sfilacciati
  const grigio = inLuce("#8f887a", luce);
  const grigioS = inOmbra("#5f5a50", luce);
  const nc: P = [930, 650];
  let nodo = "";
  nodo += path(`M${n(nc[0] - 70)} ${n(nc[1] + 22)}Q${n(nc[0] - 30)} ${n(nc[1] + 6)} ${n(nc[0] - 18)} ${n(nc[1] + 2)}M${n(nc[0] + 18)} ${n(nc[1] - 6)}Q${n(nc[0] + 44)} ${n(nc[1] - 22)} ${n(nc[0] + 78)} ${n(nc[1] - 30)}`, { stroke: grigioS, "stroke-width": 9, fill: "none", "stroke-linecap": "round" });
  nodo += path(ellisseD(nc, 26, 20), { fill: grigioS });
  nodo += path(ellisseD(add(nc, [-2, -3]), 21, 15), { fill: grigio });
  nodo += path(`M${n(nc[0] - 18)} ${n(nc[1] - 4)}Q${n(nc[0])} ${n(nc[1] - 22)} ${n(nc[0] + 18)} ${n(nc[1] - 2)}M${n(nc[0] - 16)} ${n(nc[1] + 6)}Q${n(nc[0])} ${n(nc[1] - 8)} ${n(nc[0] + 16)} ${n(nc[1] + 8)}`, { stroke: grigioS, "stroke-width": 2.6, fill: "none", opacity: 0.85 });
  // i capi sfilacciati, e un poco di lichene: è lì da tanto
  nodo += path(`M${n(nc[0] - 70)} ${n(nc[1] + 22)}l-10 6M${n(nc[0] - 70)} ${n(nc[1] + 22)}l-12 -2M${n(nc[0] + 78)} ${n(nc[1] - 30)}l12 -6M${n(nc[0] + 78)} ${n(nc[1] - 30)}l10 4`, { stroke: grigio, "stroke-width": 2, "stroke-linecap": "round", opacity: 0.8 });
  nodo += path(ellisseD(add(nc, [8, -8]), 5, 3) + ellisseD(add(nc, [-12, 4]), 4, 2.4), { fill: inLuce("#b8ac74", luce), opacity: 0.7 });
  // la zampa di Zara: arriva dall'alto e posa le dita sul nodino
  const z = clamp(o.zampa);
  let zampa = "";
  if (z > 0) {
    const e = ease.fuoriCubo(z);
    const c: P = [lerp(700, 840, e), lerp(-260, 470, e)];
    zampa = g({ transform: `translate(${n(c[0])} ${n(c[1])})scale(1.15)translate(${n(-c[0])} ${n(-c[1])})` }, zampaDallAlto(c, luce, defs));
  }
  // (a scala 1,5: piccolo per la pietra, ma lo si deve vedere — la zampa lo trova)
  const nodoGrande = g({ transform: `translate(${nc[0]} ${nc[1]})scale(1.5)translate(${-nc[0]} ${-nc[1]})` }, nodo);
  return [
    { id: "fondo", contenuto: g({ transform: cam }, fondo + pietra + nodoGrande), schermo: true },
    { id: "zampa", contenuto: g({ transform: cam }, zampa), schermo: true },
  ];
}

/**
 * Una zampa di lontra vista dall'alto, sulla corda: l'avambraccio corto e
 * robusto che arriva da `spalla`, il pelo bagnato (Brénta non finisce mai
 * d'asciugare: qualche goccia), la mano palmata con cinque dita e le unghie chiare.
 */
function zampaDiLontra(c: P, spalla: P, luce: Luce, defs: Defs, id: string): string {
  const pelo = inLuce(BRENTA_PELO, luce);
  const peloC = inLuce(schiarisci(BRENTA_PELO, 0.16), luce);
  const peloS = inOmbra(BRENTA_PELO, luce);
  // la mano guarda dove va il braccio: le dita in fondo, oltre il polso
  const dir = Math.atan2(c[1] - spalla[1], c[0] - spalla[0]);
  const rot = (dir * 180) / Math.PI - 90;
  let s = "";
  // l'ombra corta sul fondo
  s += path(ellisseD(add(c, [24, 34]), 104, 62), { fill: "#1a1610", opacity: 0.3 });
  // l'avambraccio: dalla spalla (fuori quadro) al polso, più stretto della mano
  const polso = add(c, [-Math.cos(dir) * 34, -Math.sin(dir) * 34]);
  const spina: P[] = [spalla, mix(spalla, polso, 0.55), polso];
  const gb = defs.lineare(`braccio-${id}`, add(c, [-90, -60]), add(c, [110, 40]), [
    [0, peloS],
    [0.4, pelo],
    [0.7, peloC],
    [1, peloS],
  ]);
  s += path(tubo(spina, [100, 86, 72], { tappoInizio: false }), { fill: gb });
  // il pelo lucido, liscio, che segue il braccio; e qualche goccia (non finisce mai d'asciugare)
  let lisci = "";
  const r = caso(`macro/${id}`);
  for (let i = 0; i < 14; i++) {
    const p = mix(spina[0], spina[2], r.tra(0.08, 0.85));
    const dx = r.tra(-30, 30);
    lisci += `M${n(p[0] + dx)} ${n(p[1] - 16)}l${n(Math.cos(dir) * 30)} ${n(Math.sin(dir) * 30)}`;
  }
  s += path(lisci, { stroke: peloC, "stroke-width": 3, "stroke-linecap": "round", opacity: 0.5 });
  let gocce = "";
  for (let i = 0; i < 3; i++) {
    const p = add(mix(spina[0], spina[2], r.tra(0.35, 0.9)), [r.tra(-24, 24), 0]);
    gocce += ellisseD(p, r.tra(4, 6), r.tra(5, 7));
  }
  s += path(gocce, { fill: "#e9f1f2", opacity: 0.45 });
  // la mano: il palmo largo, cinque dita a ventaglio, la membrana chiara tra le dita, le unghie
  const dita: P[] = [
    [-66, 16],
    [-38, 50],
    [0, 62],
    [38, 52],
    [66, 20],
  ];
  let mano = "";
  let membrana = `M${pt(dita[0])}`;
  for (const d of dita.slice(1)) membrana += `Q${pt([d[0] * 0.78, d[1] * 0.62])} ${pt(d)}`;
  membrana += `L${pt([52, -8])}L${pt([-52, -8])}Z`;
  mano += path(membrana, { fill: mescola(pelo, "#b09a86", 0.6), opacity: 0.95 });
  mano += path(ellisseD([0, 0], 70, 50), { fill: pelo });
  mano += path(ellisseD([-8, -12], 46, 26), { fill: peloC, opacity: 0.45 });
  for (const d of dita) {
    mano += path(ellisseD(d, 18, 23), { fill: pelo });
    mano += path(ellisseD(add(d, [-3, -5]), 9, 10), { fill: peloC, opacity: 0.6 });
    mano += path(`M${pt([d[0] * 1.05, d[1] + 16])}l${n(d[0] * 0.07)} 10`, { stroke: inLuce(BRENTA_UNGHIE, luce), "stroke-width": 3.4, "stroke-linecap": "round" });
  }
  s += g({ transform: `translate(${n(c[0])} ${n(c[1])})rotate(${n(rot)})` }, mano);
  return s;
}

export interface OpzCorda {
  t: number;
  luce: Luce;
  defs: Defs;
  /** Quanto è srotolata 0..1. */
  srotolata: number;
  /** La zampa che passa sui nodi: posizione lungo la corda 0..1 (o <0 = assente). */
  lettura: number;
  spinta: number;
  /**
   * Su cosa sta la corda: la pietra dei segni (ep01, con le due conche: «si
   * somigliano»), il legno della barca (ep02, p.11: «La posò sul legno, tra
   * loro»), le foglie dell'involto (ep02, p.16) o la pietra delle Coppelle, coi
   * cerchi di conche piene di pioggia (ep04, p.18: «sulla pietra delle conche»).
   */
  fondo?: "pietra" | "legno" | "foglie" | "coppelle";
  /**
   * I nodi nuovi, dopo quelli di Toraki: dove (0..1 lungo la corda) e quanto sono fatti
   * (0..1). Di spago da rete (il nodo di Brénta, ep02) o, `corda`, fatti nella corda
   * stessa come quelli di Toraki, stretti attorno a un pegno (ep04: la scaglia di remo).
   */
  nuovi?: readonly { u: number; fatto: number; tipo?: "rete" | "corda"; pegno?: "remo" }[];
  /**
   * Le due zampe di Zara che annodano (ep04, p.18: «Le zampe ferme»): dove (0..1 lungo
   * la corda), quanto lavorano (0..1) e lo strattone finale che stringe (0..1).
   */
  zampeZara?: { u: number; lavora: number; stringe: number };
  /**
   * Le zampe palmate di Brénta sulla corda: dove (0..1 lungo la corda), lo
   * strappo secco al nodo a metà (0..1), e quanto lavorano (0..1: annodano).
   */
  zampeLontra?: { u: number; strappo?: number; lavora?: number };
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
  // il fondo: la pietra tiepida, vicina, con la grana e il sole caldo (o il legno, o le foglie)
  const suCosa = o.fondo ?? "pietra";
  let fondo = "";
  if (suCosa === "legno") fondo = tavoleDellaBarca(o);
  else if (suCosa === "foglie") fondo = fogliDellInvolto(o);
  else if (suCosa === "coppelle") fondo = pietraDelleConche(o);
  else {
    const gp = defs.radiale("corda-pietra", [760, 360], 1500, [
      [0, inLuce("#bcae93", luce)],
      [0.6, inLuce("#9d917b", luce)],
      [1, inOmbra("#6f6759", luce)],
    ]);
    fondo = `<rect x="-50" y="-50" width="${W + 100}" height="${H + 100}" fill="${gp}"/>`;
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
  }

  // la corda: fibra e crine, spessa (siamo vicinissimi). Srotolata fino a `srotolata`.
  const fine = clamp(o.srotolata);
  const N = 120;
  const pts: P[] = [];
  const strappo = clamp(o.zampeLontra?.strappo ?? 0);
  const scossa = (u: number): P => (strappo > 0 ? [Math.sin(strappo * 40) * 10 * (1 - strappo) * Math.exp(-Math.abs(u - FINE_NODI) * 6), 0] : [0, 0]);
  for (let i = 0; i <= N * fine; i++) pts.push(add(puntoCorda(i / N), scossa(i / N)));
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

  // i nodi nuovi: un nodo da rete, di spago verde di lago, accanto a quello di Toraki
  // (grosso come i suoi: si deve vedere che adesso sono due); o un nodo di corda col suo pegno
  for (const nv of o.nuovi ?? []) {
    const k = clamp(nv.fatto);
    if (k <= 0 || nv.u > fine) continue;
    if (nv.tipo === "corda") {
      nodi += nodoDiCorda(add(puntoCorda(nv.u), scossa(nv.u)), k, nv.pegno, luce, fibra, fibraC, fibraS);
      continue;
    }
    const p = add(puntoCorda(nv.u), scossa(nv.u));
    const spago = inLuce("#6f8f86", luce);
    const spagoC = inLuce("#9db8ae", luce);
    const spagoS = inOmbra("#3f5550", luce);
    // i due giri (fino a 0.6), poi il nodo stretto e il capo che resta
    const giri = Math.min(1, k / 0.6);
    let d = "";
    for (let j = 0; j < 2; j++) {
      const q = j / 2;
      if (giri <= q) continue;
      const kk = clamp((giri - q) * 2);
      const x = p[0] - 16 + j * 26;
      d += `M${n(x - 6)} ${n(p[1] - 38)}Q${n(x + 14)} ${n(p[1] - 4)} ${n(x - 6 + 4 * kk)} ${n(p[1] - 38 + 76 * kk)}`;
    }
    nodi += path(d, { stroke: spagoS, "stroke-width": 13, fill: "none", "stroke-linecap": "round" }) + path(d, { stroke: spago, "stroke-width": 9, fill: "none", "stroke-linecap": "round" });
    nodi += path(d, { stroke: spagoC, "stroke-width": 2.5, fill: "none", "stroke-linecap": "round", opacity: 0.6, transform: "translate(-2 -2)" });
    if (k > 0.6) {
      const st = (k - 0.6) / 0.4;
      const c = add(p, [0, -6]);
      nodi += path(ellisseD(add(c, [5, 10]), 30, 20), { fill: "#1a1610", opacity: 0.22 * st });
      nodi += path(ellisseD(c, 18 + st * 12, 14 + st * 8), { fill: spagoS, opacity: st });
      nodi += path(ellisseD(add(c, [-2, -3]), 14 + st * 10, 10 + st * 6), { fill: spago, opacity: st });
      nodi += path(`M${n(c[0] - 20)} ${n(c[1] - 2)}Q${n(c[0])} ${n(c[1] - 16)} ${n(c[0] + 22)} ${n(c[1] + 2)}M${n(c[0] - 14)} ${n(c[1] + 8)}Q${n(c[0] + 2)} ${n(c[1] - 2)} ${n(c[0] + 16)} ${n(c[1] + 12)}`, {
        stroke: spagoS,
        "stroke-width": 3,
        fill: "none",
        opacity: 0.9 * st,
      });
      // il capo che resta, tagliato corto (è spago da rete, non si spreca)
      nodi += path(`M${n(c[0] + 18)} ${n(c[1] + 8)}q${n(24)} ${n(20)} ${n(26)} ${n(54 * st)}`, { stroke: spago, "stroke-width": 6, fill: "none", "stroke-linecap": "round", opacity: st });
    }
  }
  // le zampe palmate di Brénta: arrivano da destra, dalla poppa (lei sta di fronte a
  // Zara, la corda tra loro); lavorano da sole mentre lei guarda Zara
  let zampeLontra = "";
  if (o.zampeLontra) {
    const u0 = clamp(o.zampeLontra.u, 0, fine);
    const lavora = o.zampeLontra.lavora ?? 0;
    for (const [i, du] of [
      [0, 0],
      [1, 0.075],
    ] as const) {
      const u = Math.min(fine, u0 + du);
      const muove: P = [Math.sin(o.t * 7.3 + i * 2) * 10 * lavora, Math.cos(o.t * 6.1 + i) * 8 * lavora];
      const c = add(add(add(puntoCorda(u), scossa(u)), [0, -24]), muove);
      zampeLontra += zampaDiLontra(c, add(c, [640 - i * 70, -560 + i * 50]), luce, defs, `lontra${i}`);
    }
  }
  // le due zampe di Zara che annodano: da sinistra e da destra, lavorano, poi tirano e stringono
  if (o.zampeZara) {
    const { u, lavora, stringe } = o.zampeZara;
    const p = puntoCorda(u);
    const una = zampaDallAlto([0, 0], luce, defs);
    const apri = 80 * ease.dentroFuori(clamp(stringe));
    for (const lato of [-1, 1] as const) {
      const muove: P = [Math.sin(o.t * 6.7 + lato) * 14 * lavora, Math.cos(o.t * 5.9 + lato * 2) * 10 * lavora];
      // le zampe tengono i due capi, larghe: in mezzo, il nodo che si fa
      const c = add(add(p, [lato * (165 + apri), -80]), muove);
      zampeLontra += g({ transform: `translate(${n(c[0])} ${n(c[1])})rotate(${n(lato * 14)})scale(${lato * 0.78} 0.78)` }, una);
    }
  }
  // la zampa che legge i nodi, uno per uno (e poi arriva al liscio)
  let zampa = zampeLontra;
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
