// cartoni/cast/rocco.ts — Rocco, il rinoceronte giovane (pupazzo di profilo).
//
// Fonte: saga/bible/rocco.md → «Morfologia di reference (vincolante)».
// Quello che il pupazzo DEVE rispettare, sempre:
//  - le ancore colore (pelle #8a8378 · ventre/pieghe #a29a8d · occhi #5a4632);
//  - il CORNO STORTO: una virgola, mai un uncino; anelli alla base; il corno
//    posteriore è solo un bozzo. Non si "corregge" mai;
//  - le zampe «un numero in più»: giunture larghe, piedi a tre dita grandi;
//  - occhi piccoli, caldi, con le ciglia lunghe — si vedono SEMPRE;
//  - orecchie tonde orlate di setole, mobilissime (il suo vero radar);
//  - niente vestiti, niente di umano: è un rinoceronte.
// Coordinate locali: guarda a destra, piedi a y=0, garrese ≈ 240 unità.

import { type Luce, inLuce, inOmbra, mescola, scurisci, schiarisci } from "../motore/colore";
import { caso } from "../motore/caso";
import { type Defs, type P, DEG, add, cerchioD, curva, ellisseD, g, mix, n, path, pt, rot, tr, tubo } from "../motore/svg";
import { clamp, onda, palpebra } from "../motore/tempo";
import { corpoDaSpina, ik2, piedeNelPasso } from "./anatomia";

/** Ancore colore dalla scheda (blindate da test/cartoni.motore.test.ts). */
export const ROCCO_ANCORE = { pelle: "#8a8378", chiaro: "#a29a8d", occhi: "#5a4632" } as const;

/** Colore del corno: cheratina calda (derivato, non un'ancora di scheda). */
const CORNO = "#b8a888";

export interface PosaRocco {
  /** Tempo (per respiro, orecchie, battito di ciglia). */
  t: number;
  /** "fermo" oppure "passo": nel passo serve la fase. */
  andatura: "fermo" | "passo";
  /** Fase del passo (0..1 per ciclo). Il copione la ricava dalla distanza. */
  fase?: number;
  /** Ampiezza del passo 0..1 (per partire e fermarsi senza scatti). */
  ampiezza?: number;
  /** Testa: gradi, + = muso in giù. */
  testa?: number;
  /** Testa girata per non mostrare il corno (0..1). */
  giro?: number;
  /** Orecchie: -1 indietro … +1 avanti (tese). */
  orecchie?: number;
  /** Bocca aperta 0..1 (quando parla). */
  bocca?: number;
  /** Chiusura forzata degli occhi 0..1 (oltre al battito). */
  occhi?: number;
  /** Sopracciglio preoccupato 0..1. */
  pena?: number;
  /** Piantato di traverso al vento (0..1): zampe larghe, testa bassa. */
  piantato?: number;
  /** Bagnato di pioggia (0..1): pelle più scura e lucida. */
  bagnato?: number;
  /** Il piede che schiaccia il ramo: alza la zampa anteriore vicina (0..1). */
  zampaSu?: number;
  /**
   * A terra (0..1): si mette giù — la pancia sul suolo, le zampe davanti distese in
   * avanti, quelle dietro raccolte sotto la groppa (ep03, p.8: «venne a sedersi vicino»).
   */
  aTerra?: number;
  /** Sfasamento del battito di ciglia (per non sbattere in sincrono). */
  semeCiglia?: number;
  /** Disegna l'ombra portata. */
  ombra?: boolean;
}

export interface CtxPupazzo {
  defs: Defs;
  luce: Luce;
  /** Prefisso unico per gli id (una istanza = un id). */
  id: string;
  /** Verso sullo schermo: 1 guarda a destra, -1 a sinistra (per la luce). */
  verso?: 1 | -1;
}

// -------------------------------------------------------------- geometria --
const L1_ANT = 68;
const L2_ANT = 74;
const L1_POST = 74;
const L2_POST = 76;
const FALCATA = 64;
/** La testa di un giovane è grande rispetto al corpo. */
const SCALA_TESTA = 1.16;

/** Quanto scende ogni vertebra-guida quando si mette a terra (il collo meno: la testa resta su). */
const A_TERRA = [92, 90, 88, 82, 66];

/** Scheletro del corpo a riposo (centro del tronco), coda → collo. */
function spina(bob: number, respiro: number, piantato: number, aTerra = 0): P[] {
  const giu = piantato * 10;
  const s: P[] = [
    [-152, -178 + bob + giu],
    [-106, -162 + bob + giu],
    [-24, -156 + bob + giu - respiro * 0.6],
    [58, -166 + bob + giu - respiro],
    [116, -172 + bob + giu * 1.6],
  ];
  return aTerra > 0 ? s.map(([x, y], i) => [x, y + A_TERRA[i] * aTerra] as P) : s;
}
const DORSO = [6, 64, 70, 84, 58];
const VENTRE = [28, 70, 82, 78, 54];

export function rocco(posa: PosaRocco, ctx: CtxPupazzo): string {
  const { defs, luce, id } = ctx;
  const verso = ctx.verso ?? 1;
  const t = posa.t;
  const piantato = clamp(posa.piantato ?? 0);
  const bagnato = clamp(posa.bagnato ?? 0);
  const fase = posa.fase ?? 0;
  const cammina = posa.andatura === "passo";
  const respiro = onda(t, 3.4) * 2.2;
  const aTerra = clamp(posa.aTerra ?? 0);
  /** quanto scende il corpo (per le cose disegnate sul tronco) */
  const giuC = aTerra * A_TERRA[2];

  // --- colori sotto questa luce ------------------------------------------
  const pelleBase = mescola(ROCCO_ANCORE.pelle, "#4e4a44", bagnato * 0.45);
  const chiaroBase = mescola(ROCCO_ANCORE.chiaro, "#5e5952", bagnato * 0.4);
  const pelle = inLuce(pelleBase, luce);
  const pelleAlta = inLuce(mescola(pelleBase, chiaroBase, 0.45), luce);
  const pelleBassa = inOmbra(mescola(pelleBase, chiaroBase, 0.25), luce);
  const pelleOmbra = inOmbra(scurisci(pelleBase, 0.08), luce);
  const piega = inOmbra(scurisci(pelleBase, 0.28), luce);
  const pieghaLuce = inLuce(schiarisci(chiaroBase, 0.18), luce);
  const lontanaZampa = inOmbra(scurisci(pelleBase, 0.12), luce);
  const lato = (luce.lato * verso) as number; // da che parte (locale) viene la luce

  // --- il passo: bob del corpo, piedi --------------------------------------
  const amp = clamp(posa.ampiezza ?? 1);
  const bob = cammina ? -3.2 * Math.cos(fase * Math.PI * 4) * amp : 0;
  const sp = spina(bob, respiro, piantato, aTerra);
  const contorno = corpoDaSpina(sp, DORSO, VENTRE);
  const dPelle = curva(contorno, true);

  const spallaV: P = add(sp[3], [16, 26]);
  const spallaL: P = add(sp[3], [2, 20]);
  const ancaV: P = add(sp[1], [2, 12]);
  const ancaL: P = add(sp[1], [-10, 6]);
  const larg = piantato * 16;

  const piede = (fasePiede: number, radiceX: number, restX: number) => {
    if (!cammina) return { x: restX, y: 0, volo: 0 };
    const p = piedeNelPasso(fase + fasePiede, FALCATA * amp, 20 * amp);
    return { x: radiceX + (restX - radiceX) + p.dx, y: p.dy, volo: p.volo };
  };
  // fasi (passo laterale): post-vicina 0, ant-vicina .25, post-lontana .5, ant-lontana .75
  const fAV = piede(0.25, spallaV[0], spallaV[0] + 8 + larg);
  const fAL = piede(0.75, spallaL[0], spallaL[0] + 2 - larg * 0.5);
  const fPV = piede(0, ancaV[0], ancaV[0] + 8 - larg);
  const fPL = piede(0.5, ancaL[0], ancaL[0] + 2 + larg * 0.5);
  const zampaSu = clamp(posa.zampaSu ?? 0);
  if (zampaSu > 0) {
    fAV.y -= 34 * zampaSu;
    fAV.x += 10 * zampaSu;
  }
  // a terra: le anteriori si distendono in avanti sul suolo (il gomito giù), le posteriori
  // si raccolgono sotto la groppa (il ginocchio avanti, lungo la pancia)
  if (aTerra > 0) {
    fAV.x += 112 * aTerra;
    fAL.x += 100 * aTerra;
    fPV.x -= 34 * aTerra;
    fPL.x -= 30 * aTerra;
  }

  const ombraPortata = posa.ombra !== false ? ombraSotto(defs, id, luce, verso) : "";

  // --- zampe ---------------------------------------------------------------
  const zampa = (radice: P, px: number, py: number, l1: number, l2: number, piegaDir: 1 | -1, raggi: number[], fill: string, chiave: string) => {
    const bersaglio: P = [px, py - 16];
    const { ginocchio, fine } = ik2(radice, bersaglio, l1, l2, piegaDir);
    const d = tubo([radice, ginocchio, fine], raggi, { tappoInizio: false });
    const piedeD = piedeRocco(fine, py);
    let s = path(d, { fill });
    s += path(piedeD.pianta, { fill });
    // rughe al ginocchio
    const gx = ginocchio[0];
    const gy = ginocchio[1];
    s += path(`M${n(gx - 20)} ${n(gy - 4)}q${n(20)} ${n(7)} ${n(40)} 0M${n(gx - 16)} ${n(gy + 6)}q${n(16)} ${n(6)} ${n(32)} 0`, {
      stroke: piega,
      "stroke-width": 2.4,
      fill: "none",
      "stroke-linecap": "round",
      opacity: 0.55,
    });
    s += path(piedeD.unghie, { fill: inLuce(schiarisci(CORNO, 0.25), luce), opacity: 0.9 });
    return g({ "data-z": chiave }, s);
  };

  let lontane = "";
  lontane += zampa(ancaL, fPL.x, fPL.y, L1_POST, L2_POST, -1, [48, 30, 28], lontanaZampa, "pl");
  lontane += zampa(spallaL, fAL.x, fAL.y, L1_ANT, L2_ANT, 1, [40, 29, 28], lontanaZampa, "al");

  const zV = defs.lineare(`${id}-zampa`, [0, -170], [0, 0], [
    [0, pelle],
    [0.55, mescola(pelle, pelleBassa, 0.5)],
    [1, pelleOmbra],
  ]);
  let vicine = "";
  vicine += zampa(ancaV, fPV.x, fPV.y, L1_POST, L2_POST, -1, [54, 32, 30], zV, "pv");
  vicine += zampa(spallaV, fAV.x, fAV.y, L1_ANT, L2_ANT, 1, [46, 31, 30], zV, "av");

  // --- corpo ----------------------------------------------------------------
  const gCorpo = defs.lineare(`${id}-corpo`, [0, -250 + giuC], [0, -70 + giuC], [
    [0, pelleAlta],
    [0.45, pelle],
    [1, pelleBassa],
  ]);
  const clipCorpo = defs.clip(`${id}-clip`, dPelle);
  let corpo = path(dPelle, { fill: gCorpo });
  // ombra propria dal lato opposto alla luce + ventre chiaro (canone: ventre più chiaro)
  let dentro = "";
  dentro += path(ellisseD([-10, -60 + giuC], 190, 44), { fill: inOmbra(chiaroBase, luce), opacity: 0.55 });
  dentro += path(ellisseD([lato > 0 ? -150 : 130, -150 + giuC], 70, 110), { fill: pelleOmbra, opacity: 0.35 });
  // volume: la massa della spalla e della groppa prendono luce
  const vol = defs.radiale(`${id}-vol`, [0.5, 0.5], 0.5, [
    [0, schiarisci(pelleAlta, 0.12), 0.55],
    [1, pelleAlta, 0],
  ], "objectBoundingBox");
  dentro += path(ellisseD(add(sp[3], [4, -30]), 70, 64), { fill: vol });
  dentro += path(ellisseD(add(sp[1], [6, -26]), 66, 60), { fill: vol });
  // occlusione dove le zampe entrano nel corpo
  dentro += path(ellisseD(add(sp[3], [18, 70]), 64, 22), { fill: pelleOmbra, opacity: 0.4 });
  dentro += path(ellisseD(add(sp[1], [4, 62]), 70, 24), { fill: pelleOmbra, opacity: 0.4 });
  // grana della pelle: crateri fini (fissati al corpo)
  const r = caso("rocco/pelle");
  let crateri = "";
  for (let i = 0; i < 70; i++) {
    const x = r.tra(-190, 150);
    const y = r.tra(-235, -80) + bob + giuC;
    const rr = r.tra(1.6, 4.2);
    crateri += `M${n(x - rr)} ${n(y)}a${n(rr)} ${n(rr * 0.7)} 0 1 0 ${n(rr * 2)} 0a${n(rr)} ${n(rr * 0.7)} 0 1 0 ${n(-rr * 2)} 0Z`;
  }
  dentro += path(crateri, { fill: piega, opacity: 0.22 });
  // pieghe: spalla (la «corazza morbida» di un giovane), anca, fianco
  const pieghe = [
    curva([add(sp[3], [-18, -70]), add(sp[3], [-34, -28]), add(sp[3], [-36, 14]), add(sp[3], [-22, 56])]),
    curva([add(sp[1], [44, -56]), add(sp[1], [34, -18]), add(sp[1], [36, 22]), add(sp[1], [48, 54])]),
    curva([add(sp[2], [-10, 62]), add(sp[2], [34, 68]), add(sp[2], [70, 62])]),
  ].join("");
  const pieghe2 = [
    curva([add(sp[4], [-22, -44]), add(sp[4], [-30, -10]), add(sp[4], [-26, 26])]),
    curva([add(sp[4], [-6, -40]), add(sp[4], [-12, -12]), add(sp[4], [-8, 20])]),
  ].join("");
  dentro += g({ transform: "translate(5 -2)" }, path(pieghe + pieghe2, { stroke: pieghaLuce, "stroke-width": 3.2, fill: "none", "stroke-linecap": "round", opacity: 0.4 }));
  dentro += path(pieghe, { stroke: piega, "stroke-width": 3.4, fill: "none", "stroke-linecap": "round", opacity: 0.55 });
  dentro += path(pieghe2, { stroke: piega, "stroke-width": 2.4, fill: "none", "stroke-linecap": "round", opacity: 0.45 });
  // lucido di pioggia sul dorso
  if (bagnato > 0) {
    dentro += path(curva([add(sp[1], [0, -58]), add(sp[2], [0, -64]), add(sp[3], [0, -72])]), {
      stroke: schiarisci(luce.bordo, 0.3),
      "stroke-width": 6,
      fill: "none",
      "stroke-linecap": "round",
      opacity: 0.35 * bagnato,
    });
  }
  corpo += g({ "clip-path": clipCorpo }, dentro);

  // --- coda ------------------------------------------------------------------
  const oscCoda = onda(t, 2.2) * 6 + (cammina ? Math.sin(fase * Math.PI * 2) * 6 : 0);
  const radiceCoda = sp[0];
  const codaPunti: P[] = [
    radiceCoda,
    add(radiceCoda, [-12 + oscCoda * 0.2, 26]),
    add(radiceCoda, [-16 + oscCoda * 0.6, 52]),
    add(radiceCoda, [-14 + oscCoda, 72]),
  ];
  let coda = path(tubo(codaPunti, [9, 6, 4.5, 3.5]), { fill: pelleOmbra });
  const punta = codaPunti[3];
  coda += path(curva([add(punta, [-5, -4]), add(punta, [-7, 12]), add(punta, [0, 18]), add(punta, [6, 10]), add(punta, [4, -4])], true), {
    fill: scurisci(pelleBase, 0.45),
  });

  // --- bordo di luce (controluce) --------------------------------------------
  const dorsoLinea = curva(contorno.slice(0, 5));
  const bordo =
    luce.forzaBordo > 0.02
      ? path(dorsoLinea, {
          stroke: luce.bordo,
          "stroke-width": 5,
          fill: "none",
          "stroke-linecap": "round",
          opacity: clamp(luce.forzaBordo) * 0.75,
        })
      : "";

  // --- testa ---------------------------------------------------------------
  const testaG = testaRocco(posa, ctx, sp[4], { pelle, pelleAlta, pelleBassa, pelleOmbra, piega, pieghaLuce, pelleBase });

  return (
    ombraPortata +
    g({ "data-parte": "lontane" }, lontane) +
    coda +
    corpo +
    g({ "data-parte": "vicine" }, vicine) +
    bordo +
    testaG
  );
}

/** Il piede grande, a tre dita: pianta arrotondata + tre unghie davanti. */
function piedeRocco(caviglia: P, py: number): { pianta: string; unghie: string } {
  const cx = caviglia[0] + 4;
  const base = py; // y del suolo (0) o sollevato
  const top = Math.min(caviglia[1] + 6, base - 18);
  const pianta = curva(
    [
      [cx - 30, base - 4],
      [cx - 33, top + 8],
      [cx - 16, top],
      [cx + 16, top],
      [cx + 34, top + 8],
      [cx + 36, base - 5],
      [cx + 20, base],
      [cx - 18, base],
    ],
    true,
  );
  let unghie = "";
  for (const [dx, w] of [
    [12, 11],
    [26, 10],
    [-2, 9],
  ] as const) {
    const x = cx + dx;
    unghie += `M${n(x - w / 2)} ${n(base - 1)}q${n(w / 2)} ${n(-12)} ${n(w)} 0Z`;
  }
  return { pianta, unghie };
}

function ombraSotto(defs: Defs, id: string, luce: Luce, verso: number): string {
  const spost = luce.lato * verso * luce.radenza * -60;
  const url = defs.radiale(`${id}-ombra`, [0.5, 0.5], 0.5, [
    [0, "#1b1812", 0.55 * luce.forzaOmbra],
    [0.7, "#1b1812", 0.25 * luce.forzaOmbra],
    [1, "#1b1812", 0],
  ], "objectBoundingBox");
  return path(ellisseD([-20 + spost, -2], 230 + luce.radenza * 90, 26), { fill: url });
}

// ------------------------------------------------------------------ testa --
interface Tavolozza {
  pelle: string;
  pelleAlta: string;
  pelleBassa: string;
  pelleOmbra: string;
  piega: string;
  pieghaLuce: string;
  pelleBase: string;
}

function testaRocco(posa: PosaRocco, ctx: CtxPupazzo, collo: P, c: Tavolozza): string {
  const { defs, luce, id } = ctx;
  const t = posa.t;
  const piantato = clamp(posa.piantato ?? 0);
  const giro = clamp(posa.giro ?? 0);
  const cammina = posa.andatura === "passo";
  const cenno = cammina ? Math.sin((posa.fase ?? 0) * Math.PI * 4 + 0.6) * 2.5 : 0;
  const angolo = (posa.testa ?? 0) + piantato * 16 + giro * 10 + cenno + onda(t, 5.1) * 0.8;
  const perno: P = add(collo, [16, -4]);
  // giro: la testa si accorcia (scorcio) e il corno scivola dietro al profilo
  const sx = (1 - giro * 0.2) * SCALA_TESTA;
  const sy = SCALA_TESTA;

  const sagoma: P[] = [
    [-22, -34],
    [8, -54],
    [42, -54],
    [74, -38],
    [102, -16],
    [126, 4],
    [142, 20],
    [154, 34],
    [156, 44],
    [146, 50],
    [128, 56],
    [100, 62],
    [64, 64],
    [28, 58],
    [-2, 46],
    [-22, 22],
    [-28, -6],
  ];
  const bocca = clamp(posa.bocca ?? 0);
  if (bocca > 0) {
    // la mandibola si apre: abbassa i punti del labbro inferiore
    for (const i of [10, 11, 12]) sagoma[i] = [sagoma[i][0], sagoma[i][1] + bocca * (i === 10 ? 9 : 6)];
  }
  const dTesta = curva(sagoma, true);
  const gTesta = defs.lineare(`${id}-testa`, [0, -56], [0, 64], [
    [0, c.pelleAlta],
    [0.5, c.pelle],
    [1, c.pelleBassa],
  ]);

  let s = "";
  // orecchio lontano (dietro la testa)
  s += orecchio([-8, -44], -1, posa, ctx, c, true);
  // corno: prima della testa se girata (scivola dietro al profilo)
  const corno = cornoStorto(defs, id, luce, giro);
  if (giro > 0.5) s += corno;
  s += path(dTesta, { fill: gTesta });

  // dettagli dentro la testa
  const clipT = defs.clip(`${id}-clipT`, dTesta);
  let d = "";
  d += path(ellisseD([70, 48], 70, 20), { fill: c.pelleOmbra, opacity: 0.45 });
  const rg = caso("rocco/testa");
  let crateri = "";
  for (let i = 0; i < 26; i++) {
    const x = rg.tra(-16, 140);
    const y = rg.tra(-46, 56);
    const rr = rg.tra(1.3, 3);
    crateri += `M${n(x - rr)} ${n(y)}a${n(rr)} ${n(rr * 0.7)} 0 1 0 ${n(rr * 2)} 0a${n(rr)} ${n(rr * 0.7)} 0 1 0 ${n(-rr * 2)} 0Z`;
  }
  d += path(crateri, { fill: c.piega, opacity: 0.2 });
  // pieghe della guancia e del collo
  d += path(curva([[80, 8], [70, 30], [58, 52]]) + curva([[6, -30], [-2, 0], [2, 36]]), {
    stroke: c.piega,
    "stroke-width": 3.5,
    fill: "none",
    "stroke-linecap": "round",
    opacity: 0.6,
  });
  s += g({ "clip-path": clipT }, d);
  // bocca: labbro prensile «a mezza domanda»
  s += path(curva([[150, 42], [132, 50 + bocca * 4], [108, 52 + bocca * 3]]), {
    stroke: scurisci(c.pelleBase, 0.45),
    "stroke-width": 2.6,
    fill: "none",
    "stroke-linecap": "round",
  });
  if (bocca > 0.05) {
    s += path(curva([[146, 46], [128, 52 + bocca * 9], [110, 54 + bocca * 5], [128, 50]], true), {
      fill: "#3a2622",
      opacity: 0.8,
    });
  }
  // narice
  s += path("M136 16q6 -4 8 3q-4 5 -8 -3Z", { fill: scurisci(c.pelleBase, 0.5), opacity: 0.85 });
  // corno posteriore: solo un bozzo
  s += path(curva([[62, -44], [70, -58], [82, -58], [88, -44]], false) + "Z", { fill: inLuce(mescola(CORNO, c.pelleBase, 0.35), luce) });
  if (giro <= 0.5) s += corno;
  // occhio
  s += occhioRocco(posa, ctx, c, giro);
  // orecchio vicino
  s += orecchio([2, -40], 1, posa, ctx, c, false);

  return g({ transform: `translate(${n(perno[0])} ${n(perno[1])})rotate(${n(angolo)})scale(${Math.round(sx * 1000) / 1000} ${sy})` }, s);
}

/** Il corno storto: virgola, mai uncino; anelli di crescita alla base. */
function cornoStorto(defs: Defs, id: string, luce: Luce, giro: number): string {
  const base: P = [112, -8];
  const L = 80 * (1 - giro * 0.25);
  const punti: P[] = [];
  const raggi: number[] = [];
  const N = 7;
  for (let i = 0; i <= N; i++) {
    const s = i / N;
    // si inclina in avanti (lo storto) e la punta torce verso l'alto (la virgola)
    const piegatura = s < 0.3 ? 0 : s > 0.8 ? 1 : (s - 0.3) / 0.5;
    const a = (-52 - 46 * piegatura * piegatura * (3 - 2 * piegatura)) * DEG;
    const prev = punti[i - 1] ?? base;
    punti.push(i === 0 ? base : add(prev, [Math.cos(a) * (L / N), Math.sin(a) * (L / N)]));
    raggi.push(19 * Math.pow(1 - s, 0.85) + 1.2);
  }
  const d = tubo(punti, raggi, { tappoInizio: false });
  const url = defs.lineare(`${id}-corno`, [100, -10], [140, -80], [
    [0, inOmbra(CORNO, luce)],
    [0.5, inLuce(CORNO, luce)],
    [1, inLuce(schiarisci(CORNO, 0.25), luce)],
  ]);
  let s = path(d, { fill: url });
  // anelli di crescita
  for (let k = 1; k <= 3; k++) {
    const p = punti[k];
    const q = punti[k + 1];
    const dir = [q[0] - p[0], q[1] - p[1]];
    const ang = Math.atan2(dir[1], dir[0]);
    const r = raggi[k] * 0.95;
    const a = add(p, rot([0, -r], ang));
    const b = add(p, rot([0, r], ang));
    const m = add(mix(a, b, 0.5), rot([4, 0], ang));
    s += path(`M${pt(a)}Q${pt(m)} ${pt(b)}`, { stroke: inOmbra(scurisci(CORNO, 0.3), luce), "stroke-width": 1.6, fill: "none", opacity: 0.6 });
  }
  return s;
}

function occhioRocco(posa: PosaRocco, ctx: CtxPupazzo, c: Tavolozza, giro: number): string {
  const { luce } = ctx;
  const t = posa.t;
  const chiuso = clamp(Math.max(posa.occhi ?? 0, palpebra(t, 4.3, posa.semeCiglia ?? 0.1)));
  const pena = clamp(posa.pena ?? 0);
  const cx = 60 - giro * 6;
  const cy = -6;
  const rx = 7.5;
  const ry = 6.5;
  let s = "";
  // incavo dell'occhio (ombra morbida)
  s += path(ellisseD([cx, cy], rx + 6, ry + 5), { fill: c.pelleOmbra, opacity: 0.5 });
  // iride calda + pupilla + lucina
  s += path(ellisseD([cx, cy], rx, ry), { fill: inLuce(ROCCO_ANCORE.occhi, luce) });
  s += path(ellisseD([cx + 1.5, cy], rx * 0.5, ry * 0.6), { fill: "#241a12" });
  s += path(cerchioD([cx - 2, cy - 2.5], 1.8), { fill: "#fffaf0", opacity: 0.9 });
  // palpebra (scende nel battito)
  if (chiuso > 0.02) {
    const h = ry * 2 * chiuso;
    s += path(`M${n(cx - rx - 1)} ${n(cy - ry - 1)}h${n(rx * 2 + 2)}v${n(h + 1)}q${n(-rx - 1)} ${n(3)} ${n(-rx * 2 - 2)} 0Z`, { fill: c.pelle });
  }
  // sopracciglio: la pena alza l'interno
  const by = cy - ry - 5 - pena * 3;
  s += path(`M${n(cx - 12)} ${n(by + 4 - pena * 4)}Q${n(cx - 2)} ${n(by - 3 - pena * 2)} ${n(cx + 12)} ${n(by + 2)}`, {
    stroke: c.piega,
    "stroke-width": 3,
    fill: "none",
    "stroke-linecap": "round",
    opacity: 0.8,
  });
  // ciglia lunghe (la gentilezza abita lì)
  const ly = cy - ry + ry * 2 * chiuso;
  let ciglia = "";
  for (let i = 0; i < 4; i++) {
    const x = cx - 3 + i * 3.4;
    ciglia += `M${n(x)} ${n(ly)}q${n(3 + i)} ${n(-6)} ${n(7 + i * 1.5)} ${n(-7 + i * 0.6)}`;
  }
  s += path(ciglia, { stroke: "#2a211a", "stroke-width": 1.4, fill: "none", "stroke-linecap": "round" });
  return s;
}

/** L'orecchio tondo orlato di setole — il radar di Rocco. */
function orecchio(base: P, lato: 1 | -1, posa: PosaRocco, ctx: CtxPupazzo, c: Tavolozza, lontano: boolean): string {
  const t = posa.t;
  const tensione = posa.orecchie ?? 0;
  // guizzi: ogni tanto l'orecchio gira da solo
  const guizzo = Math.max(0, Math.sin(t * 1.3 + (lontano ? 2 : 0))) ** 12 * 18;
  const ang = -20 + tensione * 26 - (lontano ? 12 : 0) + guizzo;
  const col = lontano ? c.pelleOmbra : c.pelle;
  const sag: P[] = [
    [-11, 0],
    [-15, -22],
    [-10, -40],
    [0, -48],
    [10, -40],
    [13, -20],
    [10, 0],
  ];
  let s = path(curva(sag, true), { fill: col });
  if (!lontano) {
    s += path(curva([[-6, -4], [-9, -22], [-5, -36], [1, -40], [6, -34], [7, -18], [5, -4]], true), {
      fill: inOmbra(mescola(ROCCO_ANCORE.chiaro, "#7a5a4a", 0.25), ctx.luce),
      opacity: 0.85,
    });
    // setole corte sull'orlo
    let set = "";
    for (let i = 0; i < 7; i++) {
      const k = i / 6;
      const a = (-150 + k * 120) * DEG;
      const p: P = [Math.cos(a) * 12.5, -24 + Math.sin(a) * 23.5];
      const q: P = [Math.cos(a) * 15.5, -24 + Math.sin(a) * 27];
      set += `M${pt(p)}L${pt(q)}`;
    }
    s += path(set, { stroke: scurisci(c.pelleBase, 0.3), "stroke-width": 1.3, "stroke-linecap": "round", opacity: 0.55 });
  }
  return g({ transform: tr(base[0], base[1], ang * lato > 0 ? ang : ang) }, s);
}
