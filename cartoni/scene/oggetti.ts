// cartoni/scene/oggetti.ts — gli oggetti di scena, per qualunque luogo.
//
// Rocce, lastre, rami secchi, alberi morti: la forma è del kit, il POSTO lo
// decide il luogo (cartoni/luoghi/…), che sa dove la prosa li vuole. Ogni
// oggetto si appoggia al suolo del luogo (`luogo.quota`) e prende i colori
// dalla sua tavolozza. Gli id dei gradienti portano il nome dell'oggetto:
// due oggetti uguali nello stesso luogo vogliono due nomi diversi.
//
// Anti-New-Age (ritornelli §2): la pietra tiepida non brilla. Se "si vede" il
// tiepido, è solo fisica: un filo di vapore nell'aria fredda dell'alba.

import { type Luce, inLuce, inOmbra, mescola, schiarisci } from "../motore/colore";
import { caso } from "../motore/caso";
import { type Defs, type P, curva, ellisseD, g, n, path, pt } from "../motore/svg";
import { clamp } from "../motore/tempo";
import type { Luogo, OpzPalco } from "./luogo";

/** Una roccia tonda con licheni e muschio, appoggiata al suolo. */
export function roccia(luogo: Luogo, seme: string, x: number, w: number, h: number, luce: Luce, defs: Defs, affonda = 0.2): string {
  const C = luogo.colori;
  const r = caso("roccia/" + seme);
  const y = luogo.quota(x) + h * affonda;
  const pts: P[] = [];
  const N = 11;
  for (let i = 0; i < N; i++) {
    const a = Math.PI + (i / (N - 1)) * Math.PI;
    const rr = 1 + r.segno(0.12);
    pts.push([x + Math.cos(a) * w * rr, y + Math.sin(a) * h * rr * (i === 0 || i === N - 1 ? 0 : 1)]);
  }
  pts.push([x + w * 0.9, y + h * 0.15], [x - w * 0.9, y + h * 0.15]);
  const d = curva(pts, true);
  const url = defs.lineare(`roccia-${seme}`, [x, y - h], [x, y], [
    [0, inLuce(schiarisci(C.roccia, 0.15), luce)],
    [0.6, inLuce(C.roccia, luce)],
    [1, inOmbra(C.rocciaScura, luce)],
  ]);
  let s = path(d, { fill: url });
  const clip = defs.clip(`clip-roccia-${seme}`, d);
  let dentro = "";
  let lic = "";
  for (let i = 0; i < 8; i++) {
    const cx = x + r.segno(w * 0.7);
    const cy = y - r.tra(0.2, 0.9) * h;
    lic += ellisseD([cx, cy], r.tra(4, 12), r.tra(3, 7));
  }
  dentro += path(lic, { fill: inLuce(C.lichene, luce), opacity: 0.5 });
  dentro += path(ellisseD([x - w * 0.2, y + h * 0.1], w * 0.9, h * 0.3), { fill: inLuce(C.muschio, luce), opacity: 0.45 });
  dentro += path(`M${n(x - w * 0.5)} ${n(y - h * 0.6)}q${n(w * 0.3)} ${n(h * 0.2)} ${n(w * 0.5)} ${n(h * 0.5)}`, { stroke: inOmbra(C.rocciaScura, luce), "stroke-width": 2, fill: "none", opacity: 0.5 });
  s += g({ "clip-path": clip }, dentro);
  return s;
}

/**
 * Una pietra piatta mezzo affondata, coi segni sul piano (le coppelle).
 * `o.coppellePiene`: acqua nei segni; `o.vaporePietra`: il tiepido all'alba.
 */
export function pietraSegnata(o: OpzPalco, x: number, nome = "segnata"): string {
  const { luce, defs, t, luogo } = o;
  const C = luogo.colori;
  const y = luogo.quota(x) + 6;
  const w = 118;
  const d = curva(
    [
      [x - w, y + 4],
      [x - w + 14, y - 10],
      [x - 20, y - 16],
      [x + 50, y - 14],
      [x + w - 10, y - 8],
      [x + w, y + 4],
      [x + 30, y + 14],
      [x - 60, y + 12],
    ],
    true,
  );
  const url = defs.lineare(`pietra-${nome}`, [x, y - 16], [x, y + 14], [
    [0, inLuce(mescola(C.roccia, "#b9a98a", 0.35), luce)],
    [1, inOmbra(C.rocciaScura, luce)],
  ]);
  let s = path(d, { fill: url });
  // i segni sul piano (visti di taglio: piccole conche, una accanto all'altra)
  let cop = "";
  for (let i = 0; i < 6; i++) {
    const cx = x - 70 + i * 26;
    cop += ellisseD([cx, y - 12 + Math.abs(i - 2.5) * 0.6], 7, 2.2);
  }
  s += path(cop, { fill: o.coppellePiene ? inLuce(mescola(C.lagoChiaro, "#ffffff", 0.3), luce) : inOmbra(C.rocciaScura, luce), opacity: 0.85 });
  // il tiepido: solo fisica. All'alba fredda, un filo di vapore che sale.
  const vap = clamp(o.vaporePietra ?? 0);
  if (vap > 0.01) {
    let v = "";
    for (let i = 0; i < 5; i++) {
      const sx = x - 60 + i * 30;
      const k = (t * 0.25 + i * 0.21) % 1;
      const vy = y - 14 - k * 110;
      const dx = Math.sin(t * 0.9 + i * 2) * 10 * k;
      v += ellisseD([sx + dx, vy], 12 + k * 26, 8 + k * 12);
    }
    s += path(v, { fill: "#f2f4f3", opacity: vap * 0.16 });
  }
  return s;
}

/**
 * Una pietra delle Coppelle (ep03, p.13; ep04): larga e bassa, e sul piano le
 * conche tonde a cerchi — una al centro, un giro intorno, un giro più largo —
 * «più vecchie di tutti i vanti». Vista un poco dall'alto: il piano si vede di
 * sbieco. Con `o.coppellePiene` le conche tengono l'acqua e ci sta la luna (o il
 * cielo): solo riflesso, niente luce propria. Appoggiata al suolo in x.
 */
export function pietraCoppellata(o: OpzPalco, x: number, seme: string, w = 300, h = 58): string {
  const { luce, defs, luogo } = o;
  const C = luogo.colori;
  const r = caso("coppellata/" + seme);
  const y = luogo.quota(x) + 8;
  const hw = w / 2;
  const ky = 0.24; // quanto si vede del piano (la prospettiva)
  const piano = y - h; // il centro del piano
  const fianco = poliMorbido([
    [x - hw - 6, y + 6],
    [x - hw, piano + 4],
    [x - hw * 0.4, piano + hw * ky * 0.9],
    [x + hw * 0.5, piano + hw * ky * 0.85],
    [x + hw + 2, piano + 2],
    [x + hw + 8, y + 6],
  ]);
  const gF = defs.lineare(`coppellata-${seme}-fianco`, [x, piano], [x, y + 6], [
    [0, inLuce(C.roccia, luce)],
    [1, inOmbra(C.rocciaScura, luce)],
  ]);
  let s = path(fianco, { fill: gF });
  // il piano: un ovale irregolare (la pietra è stata spaccata, non tornita)
  const bordo: P[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const rr = 1 + r.segno(0.09);
    bordo.push([x + Math.cos(a) * hw * rr, piano + Math.sin(a) * hw * ky * rr]);
  }
  const dPiano = poliMorbido(bordo);
  const gP = defs.lineare(`coppellata-${seme}-piano`, [x, piano - hw * ky], [x, piano + hw * ky], [
    [0, inLuce(mescola(C.roccia, "#c4b89c", 0.35), luce)],
    [1, inLuce(C.roccia, luce)],
  ]);
  s += path(dPiano, { fill: gP });
  // le conche: al centro, un giro, un giro più largo (poche fuori posto: sono fatte a mano)
  const piene = !!o.coppellePiene;
  const acqua = inLuce(mescola(C.lagoChiaro, "#dfe6ef", 0.45), luce);
  const buio = inOmbra(C.rocciaScura, luce);
  const centro: P = [x + r.segno(hw * 0.12), piano];
  const conche: [P, number][] = [[centro, hw * 0.1]];
  for (const [giro, quante, rr] of [[0.34, 6, 0.07], [0.64, 10, 0.055]] as const) {
    const fase = r.tra(0, Math.PI);
    for (let i = 0; i < quante; i++) {
      const a = fase + (i / quante) * Math.PI * 2 + r.segno(0.08);
      conche.push([[centro[0] + Math.cos(a) * hw * giro, centro[1] + Math.sin(a) * hw * giro * ky], hw * rr * r.tra(0.85, 1.15)]);
    }
  }
  let dc = "";
  let orli = "";
  let lune = "";
  for (const [c, rr] of conche) {
    dc += ellisseD(c, rr, rr * ky * 1.4);
    orli += `M${n(c[0] - rr)} ${n(c[1])}Q${n(c[0])} ${n(c[1] + rr * ky * 2.2)} ${n(c[0] + rr)} ${n(c[1])}`;
    if (piene) lune += ellisseD([c[0] - rr * 0.3, c[1] - rr * ky * 0.3], rr * 0.3, rr * ky * 0.45);
  }
  s += path(dc, { fill: piene ? acqua : buio, opacity: piene ? 0.95 : 0.85 });
  s += path(orli, { stroke: schiarisci(inLuce(C.roccia, luce), 0.15), "stroke-width": 1.4, fill: "none", opacity: 0.6 });
  if (piene) s += path(lune, { fill: "#f7f5ea", opacity: 0.9 });
  // le crepe del fianco e del piano
  let crepe = "";
  for (let i = 0; i < 3; i++) {
    const cx = x + r.segno(hw * 0.7);
    crepe += `M${n(cx)} ${n(piano + hw * ky * 0.8)}l${n(r.segno(6))} ${n(r.tra(10, 20))}l${n(r.segno(5))} ${n(r.tra(8, 16))}`;
  }
  crepe += `M${n(x + hw * 0.2)} ${n(piano - hw * ky * 0.5)}l${n(r.tra(20, 40))} ${n(r.tra(4, 10))}`;
  s += path(crepe, { stroke: inOmbra(C.rocciaScura, luce), "stroke-width": 1.8, fill: "none", opacity: 0.6 });
  // licheni sul bordo
  let lic = "";
  for (let i = 0; i < 7; i++) {
    const a = r.tra(0, Math.PI * 2);
    lic += ellisseD([x + Math.cos(a) * hw * 0.9, piano + Math.sin(a) * hw * ky * 0.9], r.tra(5, 11), r.tra(2, 4));
  }
  s += path(lic, { fill: inLuce(C.lichene, luce), opacity: 0.5 });
  return s;
}

/** Un masso con una lastra a sbalzo: un riparo (sotto, un incavo in ombra). */
export function bordoDiRoccia(o: OpzPalco, x: number, nome = "bordo"): string {
  const { luce, defs, luogo } = o;
  const C = luogo.colori;
  const y = luogo.quota(x) + 8;
  const chiara = inLuce(schiarisci(C.roccia, 0.12), luce);
  const media = inLuce(C.roccia, luce);
  const scura = inOmbra(C.rocciaScura, luce);
  // il masso di base (facce piane: è pietra, non spugna)
  const base: P[] = [
    [x - 150, y],
    [x - 158, y - 52],
    [x - 128, y - 104],
    [x - 70, y - 118],
    [x - 34, y - 96],
    [x - 46, y - 40],
    [x - 30, y],
  ];
  const lastra: P[] = [
    [x - 142, y - 104],
    [x - 96, y - 150],
    [x + 20, y - 162],
    [x + 128, y - 142],
    [x + 146, y - 120],
    [x + 132, y - 108],
    [x + 30, y - 112],
    [x - 60, y - 98],
  ];
  const g1 = defs.lineare(`masso-${nome}`, [x, y - 130], [x, y], [
    [0, media],
    [1, scura],
  ]);
  let s = path(poliMorbido(base), { fill: g1 });
  // l'incavo sotto la lastra (il riparo): ombra profonda
  s += path(poliMorbido([
    [x - 40, y - 2],
    [x - 38, y - 60],
    [x - 20, y - 100],
    [x + 70, y - 108],
    [x + 110, y - 104],
    [x + 60, y - 70],
    [x + 20, y - 20],
    [x + 30, y],
  ]), { fill: inOmbra("#2e2b27", luce), opacity: 0.55 });
  const g2 = defs.lineare(`lastra-${nome}`, [x, y - 162], [x, y - 100], [
    [0, chiara],
    [0.6, media],
    [1, scura],
  ]);
  s += path(poliMorbido(lastra), { fill: g2 });
  // spigolo in luce e crepe
  s += path(`M${n(x - 96)} ${n(y - 150)}L${n(x + 20)} ${n(y - 162)}L${n(x + 128)} ${n(y - 142)}`, { stroke: schiarisci(chiara, 0.2), "stroke-width": 3, fill: "none", opacity: 0.6, "stroke-linecap": "round" });
  s += path(`M${n(x - 20)} ${n(y - 158)}l${n(8)} ${n(22)}l${n(-6)} ${n(16)}M${n(x + 70)} ${n(y - 148)}l${n(-4)} ${n(20)}M${n(x - 120)} ${n(y - 90)}l${n(14)} ${n(30)}l${n(-4)} ${n(26)}`, { stroke: scura, "stroke-width": 2.2, fill: "none", opacity: 0.7 });
  // licheni sulla lastra
  const r = caso(`${nome}/licheni`);
  let lic = "";
  for (let i = 0; i < 10; i++) lic += ellisseD([x + r.tra(-110, 110), y - r.tra(118, 150)], r.tra(5, 12), r.tra(2, 4));
  s += path(lic, { fill: inLuce(C.lichene, luce), opacity: 0.55 });
  return s;
}

/** Poligono con gli spigoli appena smussati (la pietra: facce piane, angoli morbidi). */
export function poliMorbido(pts: readonly P[]): string {
  const N = pts.length;
  let d = "";
  for (let i = 0; i < N; i++) {
    const a = pts[(i - 1 + N) % N];
    const b = pts[i];
    const c = pts[(i + 1) % N];
    const p1: P = [b[0] + (a[0] - b[0]) * 0.18, b[1] + (a[1] - b[1]) * 0.18];
    const p2: P = [b[0] + (c[0] - b[0]) * 0.18, b[1] + (c[1] - b[1]) * 0.18];
    d += `${i === 0 ? "M" : "L"}${pt(p1)}Q${pt(b)} ${pt(p2)}`;
  }
  return d + "Z";
}

/** Un ramo secco a terra, che si può spezzare sotto una zampa. `rotto` 0..1. */
export function ramoSecco(luogo: Luogo, x: number, luce: Luce, rotto: number): string {
  const y = luogo.quota(x) - 4;
  const col = inLuce("#8a7458", luce);
  if (rotto <= 0) {
    return path(`M${n(x - 80)} ${n(y)}Q${n(x)} ${n(y - 10)} ${n(x + 80)} ${n(y - 2)}M${n(x - 20)} ${n(y - 6)}l${n(22)} ${n(-18)}`, { stroke: col, "stroke-width": 6, fill: "none", "stroke-linecap": "round" });
  }
  // due monconi che saltano via + schegge
  const k = clamp(rotto);
  const r = caso("ramo/schegge");
  let s = path(`M${n(x - 80)} ${n(y + k * 6)}L${n(x - 6)} ${n(y - 6 - k * 10)}`, { stroke: col, "stroke-width": 6, "stroke-linecap": "round" });
  s += path(`M${n(x + 8 + k * 20)} ${n(y - 10 - k * 14)}L${n(x + 80 + k * 30)} ${n(y - k * 2)}`, { stroke: col, "stroke-width": 6, "stroke-linecap": "round" });
  let sch = "";
  for (let i = 0; i < 9; i++) {
    const a = r.tra(-Math.PI, 0);
    const d = 20 + k * r.tra(40, 120);
    const px = x + Math.cos(a) * d;
    const py = y - 8 + Math.sin(a) * d + k * k * 60;
    sch += `M${n(px)} ${n(py)}l${n(r.segno(8))} ${n(r.segno(8))}`;
  }
  s += path(sch, { stroke: col, "stroke-width": 3, "stroke-linecap": "round", opacity: 1 - k * 0.6 });
  return s;
}

/** Un albero secco (un posatoio per gli uccelli). */
export function alberoSecco(o: OpzPalco, x: number): string {
  const { luce, luogo } = o;
  const y = luogo.quota(x);
  const col = inLuce("#6e6152", luce);
  const d =
    `M${n(x)} ${n(y)}C${n(x - 6)} ${n(y - 90)} ${n(x + 10)} ${n(y - 160)} ${n(x - 4)} ${n(y - 250)}` +
    `M${n(x + 2)} ${n(y - 150)}C${n(x + 40)} ${n(y - 180)} ${n(x + 90)} ${n(y - 190)} ${n(x + 150)} ${n(y - 230)}` +
    `M${n(x - 2)} ${n(y - 200)}C${n(x - 40)} ${n(y - 230)} ${n(x - 70)} ${n(y - 250)} ${n(x - 110)} ${n(y - 300)}` +
    `M${n(x + 80)} ${n(y - 196)}l${n(20)} ${n(-40)}`;
  return path(d, { stroke: col, "stroke-width": 9, fill: "none", "stroke-linecap": "round" });
}

/**
 * Un albero d'autunno (l'anno che pende verso il freddo): tronco che si
 * assottiglia, due rami, la chioma a nuvole di foglie in tre strati (l'ombra
 * dietro, il colore, la luce in cima). Ogni albero ha il suo seme e il suo tono.
 */
export function alberoDAutunno(o: OpzPalco, x: number, seme: string, h = 520): string {
  const { luce, luogo } = o;
  const r = caso("albero/" + seme);
  const y = luogo.quota(x) + 6;
  const toni = ["#8a7a3c", "#a8843a", "#96603a", "#6f7442", "#b3923f"];
  const tono = toni[Math.floor(r.tra(0, toni.length)) % toni.length];
  const accanto = toni[(toni.indexOf(tono) + 1 + Math.floor(r.tra(0, 2))) % toni.length];
  const corteccia = inLuce("#5a4a3a", luce);
  const cortecciaS = inOmbra("#3b3027", luce);
  const piega = r.segno(24);
  // il tronco: largo alla base, sottile in alto, un poco storto
  const cima: P = [x + piega, y - h * 0.62];
  const tronco = `M${n(x - 26)} ${n(y)}C${n(x - 20)} ${n(y - h * 0.3)} ${n(cima[0] - 14)} ${n(y - h * 0.45)} ${n(cima[0] - 8)} ${n(cima[1])}L${n(cima[0] + 8)} ${n(cima[1])}C${n(cima[0] + 12)} ${n(y - h * 0.4)} ${n(x + 20)} ${n(y - h * 0.25)} ${n(x + 28)} ${n(y)}Z`;
  let s = path(tronco, { fill: corteccia });
  s += path(`M${n(x + 8)} ${n(y)}C${n(x + 10)} ${n(y - h * 0.25)} ${n(cima[0] + 4)} ${n(y - h * 0.42)} ${n(cima[0] + 6)} ${n(cima[1])}`, { stroke: cortecciaS, "stroke-width": 10, fill: "none", opacity: 0.6 });
  // i rami
  const rami = `M${n(x + piega * 0.4)} ${n(y - h * 0.4)}Q${n(x + 60)} ${n(y - h * 0.5)} ${n(x + 120 + r.segno(20))} ${n(y - h * 0.62)}M${n(x + piega * 0.6)} ${n(y - h * 0.5)}Q${n(x - 50)} ${n(y - h * 0.58)} ${n(x - 110 + r.segno(20))} ${n(y - h * 0.7)}`;
  s += path(rami, { stroke: corteccia, "stroke-width": 12, fill: "none", "stroke-linecap": "round" });
  // la chioma: nuvole di foglie attorno alla cima, in tre strati
  const centro: P = [x + piega, y - h * 0.74];
  const nuvole: [number, number, number][] = [];
  for (let i = 0; i < 11; i++) {
    const a = r.tra(0, Math.PI * 2);
    const d = r.tra(0, 1);
    nuvole.push([centro[0] + Math.cos(a) * 170 * d, centro[1] + Math.sin(a) * 110 * d, r.tra(70, 120)]);
  }
  let dietro = "";
  let medio = "";
  let luceC = "";
  for (const [cx, cy, rr] of nuvole) {
    dietro += ellisseD([cx + 10, cy + 14], rr * 1.05, rr * 0.92);
    medio += ellisseD([cx, cy], rr * 0.92, rr * 0.8);
    luceC += ellisseD([cx - rr * 0.22, cy - rr * 0.3], rr * 0.55, rr * 0.42);
  }
  s += path(dietro, { fill: inOmbra(tono, luce) });
  s += path(medio, { fill: inLuce(mescola(tono, accanto, 0.3), luce) });
  s += path(luceC, { fill: inLuce(schiarisci(tono, 0.14), luce), opacity: 0.8 });
  // qualche foglia più accesa, sparsa
  let foglie = "";
  for (let i = 0; i < 22; i++) {
    const [cx, cy, rr] = nuvole[Math.floor(r.tra(0, nuvole.length)) % nuvole.length];
    foglie += ellisseD([cx + r.segno(rr * 0.8), cy + r.segno(rr * 0.6)], r.tra(6, 11), r.tra(4, 7));
  }
  s += path(foglie, { fill: inLuce(accanto, luce), opacity: 0.85 });
  return s;
}

/** Dove posa un uccello sull'albero secco piantato in x. */
export const posatoio = (luogo: Luogo, x: number): P => [x + 120, luogo.quota(x) - 214];
