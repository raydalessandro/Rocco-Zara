// cartoni/scene/pittura.ts — il kit di pennelli del palco.
//
// Tutto ciò che è uguale in ogni luogo: il cielo e le nuvole, il banco del
// temporale, le creste dei monti, il terreno dal profilo (con le pennellate
// e l'acqua al piede), l'erba del crinale e del prato, i cespugli, il canneto,
// l'erba di primo piano, la pioggia. Un luogo sceglie i parametri e compone.
//
// Due regole che valgono per ogni pennello (vedi docs/ANIMATORE.md §3):
//  - nei cicli con scarto fuori campo ogni elemento ha il SUO generatore
//    (`elemento(seme, i)`) e pesca tutto PRIMA di decidere se è in vista;
//  - i campionamenti sono allineati al mondo: niente sfarfallii con la camera.

import { inLuce, inOmbra, lontano, mescola, scurisci } from "../motore/colore";
import { caso, elemento, fnv1a32, frattale1 } from "../motore/caso";
import { ALTEZZA, LARGHEZZA, op, vista } from "../motore/fotogramma";
import { type P, ellisseD, g, n, path, pt } from "../motore/svg";
import { clamp, smooth } from "../motore/tempo";
import type { OpzPalco } from "./luogo";
import { piegaErba } from "./meteo";

export type Vista = { x0: number; x1: number; y0: number; y1: number };

// ----------------------------------------------------------------- cielo --
export function cielo(o: OpzPalco): string {
  const { luce, meteo, defs } = o;
  const C = o.luogo.colori;
  const notte = meteo.notte;
  const temp = meteo.temporale;
  const alto = mescola(mescola(C.cieloAlto, "#8c8f86", temp * 0.7), "#141b2a", notte);
  const orizz = mescola(mescola(C.cieloOrizzonte, "#c9c49a", temp * 0.8), "#2c3548", notte);
  const alba = meteo.lavato;
  const alto2 = mescola(alto, "#9fb4cc", alba * 0.6);
  const orizz2 = mescola(orizz, "#f3cfae", alba * 0.7);
  const url = defs.lineare("cielo", [0, 0], [0, ALTEZZA], [
    [0, alto2],
    [0.62, mescola(alto2, orizz2, 0.7)],
    [1, orizz2],
  ]);
  let s = `<rect x="-10" y="-10" width="${LARGHEZZA + 20}" height="${ALTEZZA + 20}" fill="${url}"/>`;
  // il sole (o la sua luce dietro le nuvole)
  const sx = o.soleA ? o.soleA[0] * LARGHEZZA : LARGHEZZA * 0.5 + (1600 - o.cam.x) * 0.05 * 1;
  const sy = o.soleA ? o.soleA[1] * ALTEZZA : ALTEZZA * (0.62 - meteo.sole * 0.5) - o.cam.y * 0.04;
  const velato = clamp(temp * 1.2 + notte);
  if (velato < 0.98) {
    const alone = defs.radiale("alone-sole", [0.5, 0.5], 0.5, [
      [0, "#fff6dc", 0.85 * (1 - velato)],
      [0.25, "#ffe7b0", 0.35 * (1 - velato)],
      [1, "#ffe7b0", 0],
    ], "objectBoundingBox");
    s += path(ellisseD([sx, sy], 520, 520), { fill: alone });
    s += path(ellisseD([sx, sy], 46, 46), { fill: mescola("#fff8e6", orizz2, velato), opacity: 1 - velato });
  }
  // stelle tra le nubi nella notte (poche, velate)
  if (notte > 0.05) {
    const r = caso("cielo/stelle");
    let st = "";
    for (let i = 0; i < 70; i++) {
      const x = r.tra(0, LARGHEZZA);
      const y = r.tra(0, ALTEZZA * 0.55);
      const rr = r.tra(0.8, 1.8);
      st += `M${n(x)} ${n(y)}h${n(rr)}v${n(rr)}h${n(-rr)}Z`;
    }
    s += path(st, { fill: "#dfe7ff", opacity: notte * (1 - temp * 0.8) * 0.8 });
  }
  const kLuna = notte * (1 - temp * 0.8);
  if (o.luna && notte > 0.05) s += luna(o, kLuna, true);
  s += nuvole(o, velato);
  // il disco sta davanti alle nuvole (di notte le nuvole sono veli scuri: la luna si vede sempre)
  if (o.luna && notte > 0.05) s += luna(o, kLuna, false);
  return s;
}

/**
 * La luna: un disco chiaro con le sue macchie e l'alone dell'aria umida intorno
 * (è fisica: niente raggi, niente scintille). Più è bassa, più è calda.
 */
function luna(o: OpzPalco, k: number, alone: boolean): string {
  const { defs } = o;
  const L = o.luna!;
  const x = L.a[0] * LARGHEZZA;
  const y = L.a[1] * ALTEZZA;
  const r = L.r ?? 34;
  const bassa = clamp((L.a[1] - 0.35) / 0.4);
  const disco = mescola("#f4f1e4", "#f3dcb0", bassa * 0.6);
  if (alone) {
    const url = defs.radiale("alone-luna", [0.5, 0.5], 0.5, [
      [0, disco, 0.34 * k],
      [0.3, disco, 0.12 * k],
      [1, disco, 0],
    ], "objectBoundingBox");
    return path(ellisseD([x, y], r * 7, r * 7), { fill: url });
  }
  let s = path(ellisseD([x, y], r, r), { fill: disco, opacity: k });
  // i mari: macchie morbide, sempre quelle
  s += path(ellisseD([x - r * 0.28, y - r * 0.2], r * 0.34, r * 0.26) + ellisseD([x + r * 0.22, y + r * 0.12], r * 0.26, r * 0.22) + ellisseD([x - r * 0.05, y + r * 0.38], r * 0.18, r * 0.12), { fill: "#c9c3ad", opacity: 0.55 * k });
  return s;
}

/** Un punto dello schermo (frazioni 0..1) nelle coordinate di un livello a parallasse p. */
export function dalloSchermo(o: OpzPalco, p: number, a: readonly [number, number]): P {
  const z = Math.pow(Math.max(0.01, o.cam.zoom), p);
  return [o.cam.x * p + (a[0] - 0.5) * (LARGHEZZA / z), o.cam.y * p + (a[1] - 0.5) * (ALTEZZA / z)];
}

/**
 * La luna rimandata dall'acqua («vera due volte»), nelle coordinate di un livello a
 * parallasse p: un poco schiacciata, a strisce spostate dalle onde. Solo dove quel
 * livello ha acqua (`sullAcqua`), così la disegna chi sta davanti, lontano o vicino.
 */
export function lunaRiflessa(o: OpzPalco, p: number, sullAcqua: (x: number, y: number) => boolean): string {
  const L = o.luna;
  if (!L || L.riflesso === undefined || o.meteo.notte <= 0.05) return "";
  const z = Math.pow(Math.max(0.01, o.cam.zoom), p);
  const [x, y] = dalloSchermo(o, p, [L.a[0], L.riflesso]);
  if (!sullAcqua(x, y)) return "";
  const r = (L.r ?? 34) / z;
  const N = 9;
  let d = "";
  for (let i = 0; i < N; i++) {
    const u = ((i + 0.5) / N) * 2 - 1;
    const w = r * Math.sqrt(Math.max(0, 1 - u * u));
    const dx = Math.sin(o.t * 0.9 + i * 1.7) * r * 0.14;
    d += `M${n(x + dx - w)} ${n(y + u * r * 0.8)}h${n(2 * w)}`;
  }
  const bassa = clamp((L.a[1] - 0.35) / 0.4);
  return path(d, { stroke: mescola("#f4f1e4", "#f3dcb0", bassa * 0.6), "stroke-width": n(((r * 1.6) / N) * 0.85), opacity: 0.8 * o.meteo.notte, "stroke-linecap": "round" });
}

function nuvole(o: OpzPalco, velato: number): string {
  const { t, meteo, defs } = o;
  const r = caso("cielo/nuvole");
  const luceN = mescola(mescola("#fffaf0", "#b9bab0", meteo.temporale), "#3a4458", meteo.notte);
  const ombraN = mescola(mescola("#e4d3bb", "#7a7c72", meteo.temporale), "#222a3a", meteo.notte);
  const grad = defs.lineare("nube", [0, 0], [0, 1], [
    [0, mescola(luceN, "#ffffff", 0.3 * (1 - meteo.notte))],
    [0.55, luceN],
    [1, ombraN],
  ], "objectBoundingBox");
  let s = "";
  const visibili = (1 - velato * 0.6) * (1 - meteo.temporale * 0.6);
  for (let i = 0; i < 7; i++) {
    const base = r.tra(-300, LARGHEZZA + 300);
    const x = ((base + t * r.tra(3, 7) - o.cam.x * 0.02 + 6000) % (LARGHEZZA + 700)) - 350;
    const y = r.tra(70, 380) - o.cam.y * 0.02;
    const w = r.tra(220, 520);
    const h = w * r.tra(0.12, 0.2);
    const pezzi: string[] = [];
    const k = r.intero(4, 7);
    for (let j = 0; j < k; j++) {
      const u = j / (k - 1);
      const cx = x + (u - 0.5) * w * 1.1;
      const cy = y - Math.sin(u * Math.PI) * h * r.tra(0.4, 0.9);
      pezzi.push(ellisseD([cx, cy], (w / k) * r.tra(0.9, 1.5), h * r.tra(0.55, 0.9)));
    }
    pezzi.push(ellisseD([x, y + h * 0.2], w * 0.62, h * 0.42));
    s += path(pezzi.join(""), { fill: grad, opacity: n(0.5 * visibili) });
    // velature: pennellate orizzontali lungo il fondo della nube
    let pen = "";
    for (let j = 0; j < 4; j++) {
      const yy = y + h * r.tra(0, 0.5);
      const xx = x + r.segno(w * 0.4);
      pen += `M${n(xx - w * 0.3)} ${n(yy)}h${n(w * r.tra(0.3, 0.6))}`;
    }
    s += path(pen, { stroke: ombraN, "stroke-width": 6, opacity: n(0.18 * visibili), "stroke-linecap": "round" });
  }
  return s;
}

/** Il banco del temporale: nuvole basse a fondo piatto, «come una riva di pietra», che avanzano da destra. */
export function bancoTemporale(o: OpzPalco): string {
  const { t, meteo, defs } = o;
  if (meteo.temporale < 0.02) return "";
  const r = caso("cielo/temporale");
  const avanza = meteo.temporale;
  const corpo = mescola("#5b6066", "#161c28", meteo.notte);
  const alto = mescola("#8b8f88", "#2b3342", meteo.notte);
  const fondo = mescola("#3b4046", "#0e131d", meteo.notte);
  // il fronte arriva da destra: a 0 è oltre il bordo, a 1 ha preso il cielo
  const fronte = LARGHEZZA * (1.05 - avanza * 1.3);
  const base = ALTEZZA * (0.55 - avanza * 0.1) - o.cam.y * 0.03; // la "riva": il fondo piatto
  const k = n(clamp(avanza * 2.5));
  let s = "";
  // la massa: cumuli pesanti in due file, appoggiati su un fondo dritto
  const lobi: string[] = [];
  const x0 = fronte;
  const x1 = fronte + LARGHEZZA * 1.6;
  for (let fila = 0; fila < 2; fila++) {
    const quanti = fila === 0 ? 16 : 11;
    for (let i = 0; i < quanti; i++) {
      const u = (i + r.tra(-0.3, 0.3)) / (quanti - 1);
      const x = x0 + u * (x1 - x0);
      const bordo = Math.min(1, (x - x0) / 260); // il fronte è più basso e tondo
      const rr = (fila === 0 ? r.tra(90, 170) : r.tra(170, 280)) * (0.55 + 0.45 * bordo);
      const y = base - (fila === 0 ? rr * 0.7 : 150 + rr * 0.6) * (0.6 + 0.4 * bordo) - r.tra(0, 50);
      lobi.push(ellisseD([x + Math.sin(t * 0.06 + i + fila) * 6, y], rr, rr * r.tra(0.62, 0.8)));
    }
  }
  // il corpo pieno tra i cumuli e il fondo (un path a sé: stesso verso di
  // rotazione degli ovali o si bucherebbero a vicenda)
  const pieno = `M${n(x0 + 70)} ${n(base)}Q${n(x0 + 40)} ${n(base - 120)} ${n(x0 + 200)} ${n(base - 190)}L${n(x1 + 300)} ${n(base - 260)}L${n(x1 + 300)} ${n(base)}Z`;
  const clipBase = defs.clip("banco-sotto", `M-500 -2000H${LARGHEZZA + 2000}V${n(base)}H-500Z`);
  const ga = defs.lineare("banco", [0, base - 560], [0, base], [
    [0, alto],
    [0.45, corpo],
    [1, fondo],
  ]);
  // la tenda di pioggia sotto il fondo: scura, che arriva fino all'orizzonte
  const tenda = defs.lineare("banco-tenda", [0, base], [0, base + 360], [
    [0, fondo, 0.75],
    [1, fondo, 0],
  ]);
  s += path(`M${n(x0 + 90)} ${n(base - 2)}L${n(x1 + 300)} ${n(base - 2)}L${n(x1 + 300)} ${n(base + 360)}L${n(x0 + 20)} ${n(base + 360)}Z`, { fill: tenda, opacity: n(clamp((avanza - 0.2) * 2)) });
  s += g({ "clip-path": clipBase, opacity: k }, path(pieno, { fill: ga }) + path(lobi.join(""), { fill: ga }));
  // il fondo dritto e scuro
  s += path(`M${n(fronte + 40)} ${n(base - 3)}H${n(fronte + LARGHEZZA * 1.7)}`, { stroke: fondo, "stroke-width": 8, "stroke-linecap": "round", opacity: k });
  // la frangia di pioggia che pende dal fondo, lontana
  if (avanza > 0.3) {
    let frangia = "";
    for (let i = 0; i < 60; i++) {
      const x = fronte + 100 + r.tra(0, LARGHEZZA * 1.4);
      frangia += `M${n(x)} ${n(base + 2)}l${n(-40)} ${n(r.tra(120, 320))}`;
    }
    s += path(frangia, { stroke: fondo, "stroke-width": 16, opacity: n(0.22 * clamp((avanza - 0.3) * 3)), "stroke-linecap": "round" });
  }
  // il lampo: un filo lontano dentro il banco, e la luce che lo segue
  if (meteo.lampo > 0.05) {
    const lx = fronte + LARGHEZZA * 0.4;
    let d = `M${n(lx)} ${n(base - 60)}`;
    let x = lx;
    let y = base - 60;
    const rl = caso("lampo/" + Math.floor(t * 3));
    while (y < base + 240) {
      x += rl.segno(34);
      y += rl.tra(26, 52);
      d += `L${n(x)} ${n(y)}`;
    }
    s += path(d, { stroke: "#eef2ff", "stroke-width": 3.5, fill: "none", opacity: n(meteo.lampo), "stroke-linejoin": "round" });
  }
  if (meteo.lampo > 0) s += `<rect width="${LARGHEZZA}" height="${ALTEZZA}" fill="#e8eeff" opacity="${op(meteo.lampo * 0.45)}"/>`;
  return s;
}

// ----------------------------------------------------------------- monti --
export interface Cresta {
  seme: string;
  /** la linea di base e l'altezza massima */
  base: number;
  alt: number;
  col: string;
  /** quanto è affogata nella foschia (0..1) */
  fos: number;
  /** dove comincia e dove "cala" dietro l'orizzonte */
  x0: number;
  x1: number;
  /** neve sulle cime più alte */
  neve?: boolean;
}

/** Creste di monti su un livello lontano (parallasse p). */
export function monti(o: OpzPalco, p: number, creste: readonly Cresta[]): string {
  const { luce, meteo } = o;
  const C = o.luogo.colori;
  const v = vista(o.cam, p, 0.3);
  let s = "";
  for (const c of creste) {
    const pts: P[] = [];
    const passo = 60;
    const x0 = Math.max(c.x0, v.x0 - 200);
    const x1 = Math.min(c.x1 + 900, v.x1 + 200);
    if (x1 <= x0) continue;
    for (let x = Math.floor(x0 / passo) * passo; x <= x1; x += passo) {
      // i monti scendono verso destra e finiscono dietro l'orizzonte
      const cala = smooth((x - c.x1) / 700);
      const h = (frattale1(x * 0.0016, 4, c.base) * 0.5 + 0.55) * c.alt * (1 - cala) + (c.base - 280) * cala;
      pts.push([x, c.base - h]);
    }
    const d = `M${pt([pts[0][0], 900])}L${pts.map(pt).join("L")}L${pt([pts[pts.length - 1][0], 900])}Z`;
    const col = lontano(inLuce(c.col, luce), luce, c.fos + meteo.nebbia * 0.2);
    s += path(d, { fill: col });
    if (c.neve) {
      let neve = "";
      for (let i = 1; i < pts.length - 1; i++) {
        const [x, y] = pts[i];
        if (y < c.base - c.alt * 0.78 && pts[i - 1][1] > y && pts[i + 1][1] > y) {
          neve += `M${n(x - 50)} ${n(y + 40)}L${n(x)} ${n(y)}L${n(x + 46)} ${n(y + 36)}Q${n(x)} ${n(y + 26)} ${n(x - 50)} ${n(y + 40)}Z`;
        }
      }
      if (neve) s += path(neve, { fill: lontano(inLuce(C.neve, luce), luce, 0.4), opacity: 0.85 });
    }
  }
  return s;
}

// -------------------------------------------------------------- terreno --
/** Il suolo dal profilo del luogo, le pennellate, l'acqua al piede; più l'erba del crinale. */
export function terreno(o: OpzPalco): { terra: string; fronda: string } {
  const { luce, t, meteo, defs, luogo } = o;
  const C = luogo.colori;
  const v = vista(o.cam, 1, 0.25);
  const x0 = Math.max(-7000, v.x0 - 60);
  const x1 = Math.min(7000, v.x1 + 60);
  // campionamento allineato al mondo (passo a potenze di due): il profilo non
  // "bolle" quando la camera scorre o zooma
  const passo = 12 * Math.pow(2, Math.max(0, Math.ceil(Math.log2((x1 - x0) / 220 / 12))));
  const pts: P[] = [];
  for (let x = Math.floor(x0 / passo) * passo; x <= x1 + passo; x += passo) pts.push([x, luogo.quota(x)]);
  const fondo = Math.max(v.y1 + 200, 1200);
  const dSuolo = `M${pt([pts[0][0], fondo])}L${pts.map(pt).join("L")}L${pt([pts[pts.length - 1][0], fondo])}Z`;

  // colore: dal lato sinistro al destro; la brina all'alba
  const lav = meteo.lavato;
  const erbaSin = inLuce(mescola(C.erba, "#8fa0a0", lav * 0.25), luce);
  const erbaDes = inLuce(mescola(C.erbaAperto, "#b3b3a3", lav * 0.25), luce);
  const url = defs.lineare("suolo-collina", [luogo.suolo.da, 0], [luogo.suolo.a, 0], [
    [0, erbaSin],
    [0.5, mescola(erbaSin, erbaDes, 0.5)],
    [1, erbaDes],
  ]);
  const scuro = defs.lineare("suolo-prof", [0, -100], [0, 1200], [
    [0, "#000", 0],
    [0.35, "#1c1a12", 0.18],
    [1, "#1c1a12", 0.45],
  ]);
  let terra = path(dSuolo, { fill: url });
  terra += path(dSuolo, { fill: scuro });

  // pennellate: tratti d'erba e di terra, fissi nel mondo (il gouache)
  const pendenzaLocale = (x: number) => (luogo.quota(x + 30) - luogo.quota(x - 30)) / 60;
  const semeP = fnv1a32("collina/pennellate");
  let pen = "";
  let penChiare = "";
  for (let i = 0; i < 1400; i++) {
    const r = elemento(semeP, i);
    const x = r.tra(-6000, 6000);
    const sotto = r.tra(20, 900);
    const w = r.tra(18, 60);
    const scura = r.moneta(0.55);
    if (x < v.x0 - 60 || x > v.x1 + 60) continue;
    const y = luogo.quota(x) + sotto;
    if (y < v.y0 - 50 || y > v.y1 + 50) continue;
    const incl = pendenzaLocale(x) * w;
    if (scura) pen += `M${n(x)} ${n(y)}l${n(w)} ${n(incl)}`;
    else penChiare += `M${n(x)} ${n(y)}l${n(w)} ${n(incl)}`;
  }
  terra += path(pen, { stroke: inOmbra(C.erbaScura, luce), "stroke-width": 5, opacity: 0.28, "stroke-linecap": "round" });
  terra += path(penChiare, { stroke: inLuce(C.erbaChiara, luce), "stroke-width": 4, opacity: 0.22, "stroke-linecap": "round" });

  // l'acqua al piede (p=1): a sinistra della riva
  const A = luogo.acqua;
  if (A && v.x0 < A.riva + 400) {
    const acqua = inLuce(C.lago, luce);
    const acquaC = inLuce(C.lagoChiaro, luce);
    const u2 = defs.lineare("lago-vicino", [0, A.quota], [0, A.quota + 1400], [
      [0, acquaC],
      [0.3, acqua],
      [1, scurisci(acqua, 0.25)],
    ]);
    // la riva vicina scende di sbieco verso di noi: l'acqua si allarga in basso a sinistra
    terra += path(
      `M${n(Math.min(v.x0, -8000))} ${A.quota}L${n(A.riva)} ${A.quota}C${n(A.riva - 60)} ${n(A.quota + 140)} ${n(A.riva - 420)} ${n(A.quota + 420)} ${n(A.riva - 1100)} ${n(A.quota + 900)}L${n(A.riva - 2200)} ${n(A.quota + 4000)}L${n(Math.min(v.x0, -8000))} ${n(A.quota + 4000)}Z`,
      { fill: u2 },
    );
    // la battigia: una linea chiara lungo la riva
    terra += path(`M${n(A.riva + 6)} ${A.quota + 2}C${n(A.riva - 54)} ${n(A.quota + 142)} ${n(A.riva - 414)} ${n(A.quota + 422)} ${n(A.riva - 1094)} ${n(A.quota + 902)}`, { stroke: acquaC, "stroke-width": 5, fill: "none", opacity: 0.6 });
    let onde = "";
    const semeO = fnv1a32("lago/onde");
    for (let i = 0; i < 40; i++) {
      const r = elemento(semeO, i);
      const x = r.tra(-5200, A.riva - 20);
      const y = A.quota + r.tra(8, 300);
      const w = r.tra(20, 90);
      if (x < v.x0 || x > v.x1) continue;
      onde += `M${n(x + Math.sin(t + i) * 8)} ${n(y)}h${n(w)}`;
    }
    terra += path(onde, { stroke: acquaC, "stroke-width": 3, opacity: 0.5, "stroke-linecap": "round" });
    if (meteo.luccichii > 0.01) {
      // il sole che tocca l'acqua: «mille luccichii insieme»
      const semeL = fnv1a32("lago/luccichii");
      let lu = "";
      for (let i = 0; i < 160; i++) {
        const rl = elemento(semeL, i);
        const x = rl.tra(-5200, A.riva - 30);
        const y = A.quota + rl.tra(6, 260);
        const on = Math.sin(t * rl.tra(3, 7) + i * 2.3);
        const w = rl.tra(8, 26) * on;
        if (x < v.x0 || x > v.x1 || on < 0.35) continue;
        lu += `M${n(x - w)} ${n(y)}h${n(w * 2)}M${n(x)} ${n(y - w * 0.3)}v${n(w * 0.6)}`;
      }
      terra += path(lu, { stroke: "#fff8e0", "stroke-width": 3, opacity: n(0.9 * meteo.luccichii), "stroke-linecap": "round" });
    }
  }

  // la luna sull'acqua vicina (se l'inquadratura la vuole): «vera due volte»
  if (A && o.luna && meteo.notte > 0.05 && v.x0 < A.riva) {
    const xl = dalloSchermo(o, 1, o.luna.a)[0];
    const semeL = fnv1a32("lago/luna");
    let d = "";
    for (let i = 0; i < 70; i++) {
      const r = elemento(semeL, i);
      const k = r();
      const y = A.quota + 4 + k * k * 520;
      const w = (10 + k * 120) * r.tra(0.4, 1.2);
      const dx = r.segno(10 + k * 80) + Math.sin(t * 0.9 + i) * 4;
      if (xl + dx > A.riva) continue;
      d += `M${n(xl + dx - w / 2)} ${n(y)}h${n(w)}`;
    }
    terra += path(d, { stroke: "#f2eedc", "stroke-width": 3, opacity: 0.7 * meteo.notte, "stroke-linecap": "round" });
    terra += lunaRiflessa(o, 1, (x, y) => x < A.riva - 20 && y > A.quota + 6);
  }

  // la fronda del crinale: l'erba che fa la sagoma (il pelo che respira)
  const fronda = erbaCrinale(o, v);
  return { terra, fronda };
}

/** L'erba lungo il profilo e sparsa sul pendio: ciuffi mossi dal vento. */
function erbaCrinale(o: OpzPalco, v: Vista): string {
  const { luce, t, meteo, luogo } = o;
  const C = luogo.colori;
  const riva = luogo.acqua?.riva ?? -Infinity;
  const lav = meteo.lavato;
  const colE = inLuce(mescola(C.erba, "#9aa7a2", lav * 0.3), luce);
  const colS = inOmbra(C.erbaScura, luce);
  const colC = inLuce(mescola(C.erbaChiara, "#e6ebea", lav * 0.4), luce);
  const colA = inLuce(C.erbaAperto, luce);
  let scuri = "";
  let medi = "";
  let chiari = "";
  const lama = (x: number, y: number, h: number, l: number) => {
    const piega = piegaErba(x, t, meteo);
    const tip: P = [x + (piega + l) * h, y - h * (1 - Math.abs(piega) * 0.25)];
    const ctrl: P = [x + (piega * 0.3 + l * 0.5) * h, y - h * 0.55];
    const w = Math.max(1.2, h * 0.07);
    return `M${n(x - w)} ${n(y)}Q${pt(ctrl)} ${pt(tip)}Q${n(ctrl[0] + w * 0.6)} ${n(ctrl[1])} ${n(x + w)} ${n(y)}Z`;
  };
  // ciuffi a passo fisso nel mondo; da lontano se ne tengono meno, ognuno con
  // la sua soglia (così allontanandosi si diradano uno a uno, senza sfarfallare)
  const z = Math.max(0.1, o.cam.zoom);
  const passo = 16;
  const densita = clamp(z * 1.6, 0.2, 1);
  const semeF = fnv1a32("fronda/crinale");
  const i0 = Math.floor((v.x0 - 40) / passo);
  const i1 = Math.ceil((v.x1 + 40) / passo);
  const E = luogo.erba;
  for (let i = i0; i <= i1; i++) {
    const r = elemento(semeF, i + 1000000);
    const soglia = r();
    const xx = i * passo + r.tra(0, passo);
    const destra = xx > E.confine ? 1 : 0;
    const hBase = destra ? r.tra(E.destra[0], E.destra[1]) : r.tra(E.sinistra[0], E.sinistra[1]);
    const k = r.intero(3, 5);
    if (soglia > densita || xx < riva + 20) continue; // sull'acqua non cresce l'erba
    const y = luogo.quota(xx);
    if (y < v.y0 - 200 || y > v.y1 + 200) continue;
    for (let j = 0; j < k; j++) {
      const h = hBase * r.tra(0.6, 1.2);
      const l = r.segno(0.25);
      const xj = xx + r.segno(passo * 0.4);
      const d = lama(xj, luogo.quota(xj) + 3, h, l);
      const q = r();
      if (q < 0.3) scuri += d;
      else if (q < 0.75) medi += d;
      else chiari += d;
    }
  }
  // ciuffi sparsi sul pendio (danno la "materia" del prato)
  const semeS = fnv1a32("prato/sparsi");
  let sparsi = "";
  for (let i = 0; i < 700; i++) {
    const r2 = elemento(semeS, i);
    const soglia = r2();
    const x = r2.tra(-6000, 6000);
    const sotto = r2.tra(30, 700) ** 1.1;
    const h = r2.tra(12, 26);
    const l1 = r2.segno(0.3);
    const l2 = r2.segno(0.3);
    if (soglia > densita || x < v.x0 - 30 || x > v.x1 + 30 || x < riva + 60) continue;
    const y = luogo.quota(x) + sotto;
    if (y < v.y0 - 60 || y > v.y1 + 60) continue;
    sparsi += lama(x, y, h, l1) + lama(x + 5, y, h * 0.8, l2);
  }
  return (
    path(sparsi, { fill: mescola(colS, colE, 0.4), opacity: 0.8 }) +
    path(scuri, { fill: colS }) +
    path(medi, { fill: mescola(colE, colA, 0.35) }) +
    path(chiari, { fill: colC })
  );
}

// ------------------------------------------------------------- cespugli --
/** Cespugli e qualche alberello giovane sui due versanti. */
export function cespugli(o: OpzPalco, v: Vista): string {
  const { luce, defs, t, meteo, luogo } = o;
  const C = luogo.colori;
  const K = luogo.cespugli;
  const grad = defs.lineare("cespuglio", [0, 0], [0, 1], [
    [0, inLuce(mescola(C.bosco, C.erbaChiara, 0.3), luce)],
    [0.6, inLuce(C.bosco, luce)],
    [1, inOmbra(C.boscoScuro, luce)],
  ], "objectBoundingBox");
  const semeCe = fnv1a32("versante/cespugli");
  let s = "";
  for (let i = 0; i < K.quanti; i++) {
    const r = elemento(semeCe, i);
    const sinistra = r.moneta(K.sinistraProb);
    const x = sinistra ? r.tra(K.sinistra[0], K.sinistra[1]) : r.tra(K.destra[0], K.destra[1]);
    const sotto = r.tra(K.sotto[0], K.sotto[1]);
    const y = luogo.quota(x) + sotto;
    const w = r.tra(40, 110) * (sinistra ? 1 : 0.6);
    if (x < v.x0 - w || x > v.x1 + w || y < v.y0 - w || y > v.y1 + w) continue;
    const pezzi: string[] = [];
    const k = r.intero(4, 7);
    const vento = piegaErba(x, t, meteo) * 4;
    for (let j = 0; j < k; j++) {
      const u = j / (k - 1);
      pezzi.push(ellisseD([x + (u - 0.5) * w * 1.3 + vento * u, y - Math.sin(u * Math.PI) * w * 0.5 - r.tra(0, w * 0.2)], w * r.tra(0.3, 0.45), w * r.tra(0.28, 0.4)));
    }
    s += path(pezzi.join(""), { fill: grad });
    // qualche albero giovane dietro i cespugli più grandi
    if (sinistra && w > 90 && sotto > 170 && r.moneta(0.4)) {
      const h = r.tra(180, 280);
      s += path(`M${n(x)} ${n(y)}q${n(-4)} ${n(-h * 0.5)} ${n(vento * 2)} ${n(-h)}`, { stroke: inOmbra("#4a3f33", luce), "stroke-width": 8, fill: "none", "stroke-linecap": "round" });
      const ch: string[] = [];
      for (let j = 0; j < 5; j++) ch.push(ellisseD([x + vento * 2 + r.segno(40), y - h + r.segno(40)], r.tra(40, 60), r.tra(34, 50)));
      s += path(ch.join(""), { fill: grad });
    }
  }
  return s;
}

// -------------------------------------------------------------- canneto --
/** Il canneto del luogo (p=1). `davanti`: un velo di canne davanti ai personaggi. */
export function canneto(o: OpzPalco, v: { x0: number; x1: number }, davanti = false): string {
  const { luce, t, meteo, luogo } = o;
  const C = luogo.colori;
  if (!luogo.canneto) return "";
  const [a, b] = luogo.canneto;
  if (v.x1 < a - 100 || v.x0 > b + 100) return "";
  const livelloAcqua = luogo.acqua?.quota ?? Infinity;
  const semeCa = fnv1a32(davanti ? "canneto/davanti" : "canneto/riva");
  let steli = "";
  let pennacchi = "";
  const quante = davanti ? 36 : 260;
  for (let i = 0; i < quante; i++) {
    const r = elemento(semeCa, i);
    const x = r.tra(a, b);
    const dy = r.tra(0, 30);
    const h = r.tra(140, 260) * (davanti ? 1.25 : 1);
    const scarto = r.segno(0.08);
    if (x < v.x0 - 40 || x > v.x1 + 40) continue;
    const y = Math.min(luogo.quota(x), livelloAcqua) + dy + (davanti ? 30 : 0);
    const lean = piegaErba(x * 1.5, t, meteo) * 0.35 + scarto;
    const tip: P = [x + lean * h, y - h];
    steli += `M${n(x)} ${n(y)}Q${n(x + lean * h * 0.4)} ${n(y - h * 0.6)} ${pt(tip)}`;
    pennacchi += ellisseD([tip[0] + lean * 6, tip[1] + 8], 4, 14);
  }
  return (
    path(steli, { stroke: inLuce(C.cannaScura, luce), "stroke-width": 3.2, fill: "none", "stroke-linecap": "round" }) +
    path(pennacchi, { fill: inLuce(C.canna, luce), opacity: 0.9 })
  );
}

// ---------------------------------------------------------- primo piano --
export function primoPiano(o: OpzPalco, p: number): string {
  const { luce, t, meteo, luogo } = o;
  const C = luogo.colori;
  const v = vista(o.cam, p, 0.2);
  const col = inOmbra(scurisci(C.erbaScura, 0.25), luce);
  const colC = inLuce(C.erbaChiara, luce);
  const semePP = fnv1a32("primo-piano/erba");
  let d = "";
  let dc = "";
  // steli alti nella parte bassa dello schermo: a p>1 scorrono veloci
  for (let i = 0; i < 70; i++) {
    const r = elemento(semePP, i);
    const x = r.tra(-9000, 9000);
    const dy = r.tra(0, 120);
    const h = r.tra(90, 240);
    const w = r.tra(3, 6);
    const chiaro = r.moneta(0.3);
    if (x < v.x0 - 60 || x > v.x1 + 60) continue;
    const baseY = luogo.quota(x / p) * p + 120 + dy;
    const piega = piegaErba(x / p, t, meteo) * 0.9;
    const tip: P = [x + piega * h, baseY - h];
    const lama = `M${n(x - w)} ${n(baseY)}Q${n(x + piega * h * 0.35)} ${n(baseY - h * 0.55)} ${pt(tip)}Q${n(x + piega * h * 0.35 + w)} ${n(baseY - h * 0.55)} ${n(x + w)} ${n(baseY)}Z`;
    if (chiaro) dc += lama;
    else d += lama;
  }
  return path(d, { fill: col, opacity: 0.95 }) + path(dc, { fill: colC, opacity: 0.8 });
}

// ------------------------------------------------------------- pioggia --
export function pioggia(o: OpzPalco): string {
  const { meteo, t, cam } = o;
  if (meteo.pioggia < 0.02) return "";
  const r = caso("pioggia");
  let d = "";
  const N = Math.round(240 * meteo.pioggia);
  // cade di sbieco, spinta dal vento
  const sbieco = -meteo.versoVento * (0.35 + meteo.vento * 0.4);
  const rip = o.riparo;
  const zx0 = rip ? LARGHEZZA / 2 + (rip.x0 - cam.x) * cam.zoom : 0;
  const zx1 = rip ? LARGHEZZA / 2 + (rip.x1 - cam.x) * cam.zoom : 0;
  const zy0 = rip ? ALTEZZA / 2 + (rip.y0 - cam.y) * cam.zoom : 0;
  const Wt = LARGHEZZA + 600;
  for (let i = 0; i < N; i++) {
    const vel = r.tra(1500, 2100);
    const y0 = r.tra(0, ALTEZZA + 200);
    const x0 = r.tra(0, Wt);
    const cadi = t * vel;
    const y = ((y0 + cadi) % (ALTEZZA + 200)) - 100;
    const x = ((((x0 - cadi * sbieco) % Wt) + Wt) % Wt) - 300;
    const L = r.tra(34, 76);
    if (rip && x > zx0 && x < zx1 && y > zy0) continue; // nel riparo non piove
    d += `M${n(x)} ${n(y)}l${n(L * sbieco)} ${n(L)}`;
  }
  return path(d, { stroke: mescola("#b8c6dc", "#ffffff", meteo.lampo), "stroke-width": 1.9, opacity: n(0.42 + meteo.lampo * 0.3), "stroke-linecap": "round" });
}

