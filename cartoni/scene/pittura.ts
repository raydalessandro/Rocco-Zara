// cartoni/scene/pittura.ts — il kit di pennelli del palco.
//
// Tutto ciò che è uguale in ogni luogo: il cielo e le nuvole, il banco del
// temporale, le creste dei monti e le colline a strati, il terreno dal profilo
// (con il lato in luce e quello in ombra, le pennellate, l'acqua al piede),
// l'erba del crinale e del prato, i cespugli, il canneto, le ombre portate,
// il primo piano sfocato, il pulviscolo, la pioggia. Un luogo sceglie i
// parametri e compone.
//
// Due regole che valgono per ogni pennello (vedi docs/ANIMATORE.md §3):
//  - nei cicli con scarto fuori campo ogni elemento ha il SUO generatore
//    (`elemento(seme, i)`) e pesca tutto PRIMA di decidere se è in vista;
//  - i campionamenti sono allineati al mondo: niente sfarfallii con la camera.
//
// E una di pittura (STILE_VISIVO §1-§3, «mai cartoon-flat»): il palco ha tre
// cose che un fondale piatto non ha — la PROFONDITÀ (strati a parallasse,
// affogati nella foschia man mano che si allontanano, il primo piano sfocato),
// la LUCE (un lato in luce e uno in ombra, le ombre portate di tutto dal lato
// opposto al sole, lunghe quando il sole è basso) e la MATERIA (le pennellate,
// le chiazze, i fiori, la terra nuda). Niente bagliori: la luce si vede da
// quello che illumina.

import { type Luce, inLuce, inOmbra, lontano, mescola, schiarisci, scurisci } from "../motore/colore";
import { caso, elemento, fnv1a32, frattale1 } from "../motore/caso";
import { ALTEZZA, LARGHEZZA, aSchermo, op, vista } from "../motore/fotogramma";
import { type Defs, type P, ellisseD, g, n, path, pt } from "../motore/svg";
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

/** I due livelli di nuvole: uno lontano (piccole, piatte, p≈0,04) e uno vicino (grandi, p≈0,09). */
const STRATI_NUVOLE = [
  { nome: "lontane", p: 0.04, quante: 46, w: [120, 260] as const, y: [-500, -250] as const, deriva: 1.4, cirri: 0.5 },
  { nome: "vicine", p: 0.09, quante: 34, w: [260, 620] as const, y: [-560, -150] as const, deriva: 2.6, cirri: 0.15 },
] as const;

/** L'ascissa del mondo coperta dalle nuvole (si ripete oltre, a piastrella). */
const MONDO_NUVOLE = 18000;

/**
 * Le nuvole stanno nel MONDO, non sullo schermo: ogni nuvola ha il suo posto
 * (x, y, forma) pescato dal suo seme su tutta l'ascissa del mondo, e il cielo
 * la proietta a schermo con la parallasse del suo strato. Così inquadrature con
 * camere diverse vedono cieli diversi, le panoramiche le vedono scorrere, e due
 * inquadrature sullo stesso punto vedono lo stesso cielo. Derivano col tempo,
 * nel verso del vento e tanto più quanto più tira. La forma: lobi irregolari
 * sopra, il fondo più piatto, e qualche cirro a pennellate; di giorno l'ombra
 * sotto è fredda, al tramonto e all'alba il fondo prende il colore della luce
 * bassa (sottoilluminato), di notte sono veli scuri.
 * Si disegnano dentro `cielo()` (livello a schermo): la proiezione la fa `aSchermo`.
 */
function nuvole(o: OpzPalco, velato: number): string {
  const { t, meteo, defs, luce } = o;
  const bassa = clamp(luce.forzaBordo); // quanto la luce è radente (tramonto, alba)
  const luceN = mescola(mescola(mescola("#fffaf0", luce.bordo, bassa * 0.35), "#b9bab0", meteo.temporale), "#3a4458", meteo.notte);
  const ombraFredda = mescola("#d9d6d2", "#b9c2d6", 0.5);
  const ombraN = mescola(mescola(mescola(ombraFredda, luce.bordo, bassa * 0.8), "#7a7c72", meteo.temporale), "#222a3a", meteo.notte);
  const visibili = (1 - velato * 0.6) * (1 - meteo.temporale * 0.6);
  if (visibili < 0.02) return "";
  const vento = (meteo.versoVento || 1) * (0.5 + meteo.vento) * 6;
  let s = "";
  for (const S of STRATI_NUVOLE) {
    const grad = defs.lineare(`nube-${S.nome}`, [0, 0], [0, 1], [
      [0, mescola(luceN, "#ffffff", 0.3 * (1 - meteo.notte))],
      [0.5, luceN],
      [1, ombraN],
    ], "objectBoundingBox");
    const seme = fnv1a32(`cielo/nuvole/${S.nome}`);
    const z = Math.pow(Math.max(0.01, o.cam.zoom), S.p);
    const deriva = t * S.deriva * vento;
    let corpi = "";
    let fondi = "";
    let cirri = "";
    let ombre = "";
    for (let i = 0; i < S.quante; i++) {
      const r = elemento(seme, i);
      // ogni nuvola pesca TUTTO prima dello scarto (regola del kit)
      const x0 = r.tra(-MONDO_NUVOLE / 2, MONDO_NUVOLE / 2);
      const y = r.tra(S.y[0], S.y[1]);
      const w = r.tra(S.w[0], S.w[1]);
      const h = w * r.tra(0.13, 0.22);
      const cirro = r.moneta(S.cirri);
      const k = r.intero(5, 9);
      const lobi: [number, number, number, number][] = [];
      for (let j = 0; j < k; j++) lobi.push([r.tra(-0.5, 0.5), r.tra(0.3, 0.9), r.tra(0.7, 1.4), r.tra(0.4, 0.75)]);
      const pennellate: [number, number, number][] = [];
      for (let j = 0; j < 3; j++) pennellate.push([r.segno(0.4), r.tra(0, 0.4), r.tra(0.3, 0.7)]);
      const alzata = r.tra(0, 1);
      // la deriva è a piastrella sul mondo: la nuvola che esce a destra rientra a sinistra
      const xm = ((((x0 + deriva) % MONDO_NUVOLE) + MONDO_NUVOLE * 1.5) % MONDO_NUVOLE) - MONDO_NUVOLE / 2;
      const [sx, sy] = aSchermo(o.cam, S.p, xm, y);
      const ws = w * z;
      const hs = h * z;
      if (sx < -ws - 60 || sx > LARGHEZZA + ws + 60 || sy < -hs * 2 || sy > ALTEZZA * 0.7) continue;
      if (cirro) {
        // un cirro: tre pennellate lunghe e sottili, spettinate
        for (let j = 0; j < 3; j++) {
          const yy = sy + j * hs * 0.5 - hs * 0.5;
          cirri += `M${n(sx - ws * (0.5 + j * 0.1))} ${n(yy)}q${n(ws * 0.5)} ${n(-hs * 0.3)} ${n(ws * (1 + j * 0.15))} ${n(-hs * 0.1 * j)}`;
        }
        continue;
      }
      for (const [u, su, rx, ry] of lobi) {
        const cx = sx + u * ws * 1.1;
        const cy = sy - Math.sin((u + 0.5) * Math.PI) * hs * su * (0.5 + alzata * 0.4);
        corpi += ellisseD([cx, cy], (ws / k) * rx, hs * ry);
      }
      // il fondo piatto: una striscia bassa e larga che chiude la nuvola
      fondi += ellisseD([sx, sy + hs * 0.12], ws * 0.64, hs * 0.34);
      // le velature sotto il fondo (l'ombra che la luce bassa colora)
      for (const [dx, dy, l] of pennellate) ombre += `M${n(sx + dx * ws - ws * l * 0.5)} ${n(sy + hs * (0.2 + dy))}h${n(ws * l)}`;
    }
    const opac = (S.p < 0.06 ? 0.42 : 0.55) * visibili;
    s += path(corpi + fondi, { fill: grad, opacity: n(opac) });
    s += path(ombre, { stroke: ombraN, "stroke-width": n(5 / Math.max(0.6, z)), opacity: n(0.22 * visibili), "stroke-linecap": "round" });
    s += path(cirri, { stroke: luceN, "stroke-width": n(5 * z), fill: "none", opacity: n(0.3 * visibili), "stroke-linecap": "round" });
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

// ------------------------------------------------------------- colline --
export interface Collina {
  seme: string;
  /** la linea di base e l'altezza massima dei crinali */
  base: number;
  alt: number;
  col: string;
  /** quanto è affogata nella foschia (0..1) */
  fos: number;
  x0: number;
  x1: number;
  /** alberi e cespugli in silhouette sul crinale (0 = nessuno, 1 = fitti); default 0,5 */
  alberi?: number;
  /** il velo di foschia bassa ai piedi (default: sì) */
  velo?: boolean;
}

/** Il crinale di una collina all'ascissa x (dolce: due ottave, non i monti). */
function crinale(c: Collina, x: number): number {
  return c.base - (frattale1(x * 0.0009, 2, fnv1a32(c.seme) % 97) * 0.5 + 0.5) * c.alt;
}

/**
 * Colline lontane a strati (la prospettiva aerea): crinali morbidi, una linea di
 * alberi e cespugli in silhouette sul crinale, tutto affogato nella foschia
 * secondo `fos` e la nebbia; ai piedi un velo chiaro a bassa opacità, più forte
 * quando l'aria è calda e ferma (pomeriggio) o lavata (alba). Un luogo ne mette
 * due o tre tra i monti e il suolo (p≈0,45 / 0,6 / 0,75) e la profondità arriva.
 */
export function collineLontane(o: OpzPalco, p: number, colline: readonly Collina[]): string {
  const { luce, meteo, defs } = o;
  const v = vista(o.cam, p, 0.3);
  const z = Math.pow(Math.max(0.01, o.cam.zoom), p);
  let s = "";
  for (const c of colline) {
    const x0 = Math.max(c.x0, v.x0 - 200);
    const x1 = Math.min(c.x1, v.x1 + 200);
    if (x1 <= x0) continue;
    const fos = clamp(c.fos + meteo.nebbia * 0.25);
    const pts: P[] = [];
    const passo = 40;
    for (let x = Math.floor(x0 / passo) * passo; x <= x1 + passo; x += passo) pts.push([x, crinale(c, x)]);
    // il piede: la collina finisce alla sua base e sfuma nell'aria (sotto c'è l'acqua o la
    // pianura del livello più lontano, che deve restare visibile dall'alto)
    const fondo = c.base + c.alt * 0.6;
    const d = `M${pt([pts[0][0], fondo])}L${pts.map(pt).join("L")}L${pt([pts[pts.length - 1][0], fondo])}Z`;
    const col = lontano(inLuce(c.col, luce), luce, fos);
    const sfuma = defs.lineare(`colle-${c.seme}`, [0, c.base - c.alt * 0.1], [0, fondo], [
      [0, col, 1],
      [0.4, col, 0.9],
      [1, col, 0],
    ]);
    s += path(d, { fill: sfuma });
    // il versante in ombra: dove il crinale volta le spalle al sole, una banda appena più scura
    let ombra = "";
    for (let i = 1; i < pts.length; i++) {
      const pend = (pts[i][1] - pts[i - 1][1]) / passo; // >0 scende verso destra
      const controluce = -pend * luce.lato; // il versante guarda via dal sole
      const prof = Math.min(c.alt * 0.5, 40 + controluce * 300);
      if (controluce > 0.04) ombra += `M${pt(pts[i - 1])}L${pt(pts[i])}L${n(pts[i][0])} ${n(pts[i][1] + prof)}L${n(pts[i - 1][0])} ${n(pts[i - 1][1] + prof)}Z`;
    }
    s += path(ombra, { fill: lontano(inOmbra(c.col, luce), luce, fos), opacity: 0.45 });
    // gli alberi del crinale: puntini e lobi in silhouette, seminati nel mondo
    const fitto = c.alberi ?? 0.5;
    if (fitto > 0.02) {
      const semeA = fnv1a32(`${c.seme}/alberi`);
      const quanti = Math.round(((c.x1 - c.x0) / 26) * fitto);
      let chiome = "";
      let fusti = "";
      for (let i = 0; i < quanti; i++) {
        const r = elemento(semeA, i);
        const x = r.tra(c.x0, c.x1);
        const sotto = Math.pow(r(), 1.8) * c.alt * 0.4;
        const rr = r.tra(5, 12) * (0.7 + 0.3 * (1 - sotto / c.alt));
        const alto = r.moneta(0.3);
        const gruppo = r.intero(1, 3);
        if (x < v.x0 - 40 || x > v.x1 + 40) continue;
        const y = crinale(c, x) + sotto + 2;
        for (let j = 0; j < gruppo; j++) {
          const xx = x + j * rr * 1.3;
          chiome += ellisseD([xx, y - rr * (alto ? 1.6 : 0.8)], rr * (alto ? 0.55 : 1), rr * (alto ? 1.5 : 0.85));
          if (alto) fusti += `M${n(xx)} ${n(y)}v${n(-rr * 1.2)}`;
        }
      }
      const colA = lontano(inOmbra(scurisci(c.col, 0.3), luce), luce, fos * 0.9);
      s += path(chiome, { fill: colA, opacity: 0.85 });
      s += path(fusti, { stroke: colA, "stroke-width": n(1.6 / z), opacity: 0.7 });
    }
    // il velo ai piedi: foschia bassa nell'aria calda e in quella lavata
    if (c.velo !== false) {
      const forza = (0.2 + 0.3 * clamp(1 - meteo.sole * 1.2) + 0.4 * meteo.lavato + 0.5 * meteo.nebbia) * (1 - meteo.notte * 0.7) * (1 - meteo.temporale * 0.6);
      if (forza > 0.03) {
        const velo = defs.lineare(`velo-${c.seme}`, [0, c.base - c.alt * 0.45], [0, c.base + c.alt * 0.2], [
          [0, luce.foschia, 0],
          [0.7, luce.foschia, 0.5 * forza],
          [1, luce.foschia, 0.6 * forza],
        ]);
        s += path(`M${n(x0 - 100)} ${n(c.base - c.alt * 0.45)}H${n(x1 + 100)}V${n(c.base + c.alt * 0.2)}H${n(x0 - 100)}Z`, { fill: velo });
      }
    }
  }
  return s;
}

/**
 * Un bosco lontano in silhouette: una fascia di chiome tonde (e qualche cima a
 * punta) lungo una linea di base che ondeggia, velata dalla foschia. Senza il
 * «sotto» delle colline: è l'orlo di un bosco visto da lontano, non un colle.
 */
export function boscoLontano(o: OpzPalco, p: number, b: { seme: string; base: number; alt: number; col: string; fos: number; x0: number; x1: number; fitto?: number }): string {
  const { luce, meteo } = o;
  const v = vista(o.cam, p, 0.3);
  const x0 = Math.max(b.x0, v.x0 - 100);
  const x1 = Math.min(b.x1, v.x1 + 100);
  if (x1 <= x0) return "";
  const fos = clamp(b.fos + meteo.nebbia * 0.2);
  const cima = (x: number) => b.base - (frattale1(x * 0.004, 2, fnv1a32(b.seme) % 89) * 0.5 + 0.5) * b.alt;
  const semeB = fnv1a32(`${b.seme}/chiome`);
  const quante = Math.round(((b.x1 - b.x0) / 18) * (b.fitto ?? 1));
  let dietro = "";
  let davanti = "";
  for (let i = 0; i < quante; i++) {
    const r = elemento(semeB, i);
    const x = r.tra(b.x0, b.x1);
    const rr = r.tra(8, 20);
    const punta = r.moneta(0.2);
    const sotto = r.tra(0, b.alt * 0.4);
    const avanti = r.moneta(0.5);
    if (x < v.x0 - 40 || x > v.x1 + 40) continue;
    const y = cima(x) + sotto;
    const d = punta ? `M${n(x - rr * 0.6)} ${n(y + rr)}L${n(x)} ${n(y - rr * 1.8)}L${n(x + rr * 0.6)} ${n(y + rr)}Z` : ellisseD([x, y], rr, rr * 1.1);
    if (avanti) davanti += d;
    else dietro += d;
  }
  const base = `M${n(x0)} 1600L${n(x0)} ${n(b.base)}H${n(x1)}V1600Z`;
  return (
    path(base, { fill: lontano(inLuce(b.col, luce), luce, fos) }) +
    path(dietro, { fill: lontano(inLuce(b.col, luce), luce, fos) }) +
    path(davanti, { fill: lontano(inOmbra(scurisci(b.col, 0.25), luce), luce, fos * 0.9) })
  );
}

// ------------------------------------------------------- ombre portate --
export interface OpzOmbra {
  /** mezza larghezza dell'impronta a terra */
  larghezza: number;
  /** quanto è alta la cosa che fa ombra: l'ombra si allunga di tanto, col sole basso */
  lunghezza: number;
  /** il verso del disegno in cui sta (1, o −1 se è specchiato: la luce è a schermo) */
  verso?: 1 | -1;
  /** la pendenza del suolo (dy/dx): l'ombra la segue */
  pendenza?: number;
  /** moltiplicatore dell'opacità (default 1) */
  forza?: number;
  /** mezza altezza dell'ellisse (default: in proporzione alla larghezza) */
  spessore?: number;
}

/**
 * L'ombra portata di una cosa appoggiata al suolo, nelle sue coordinate (origine
 * al piede, y=0 il suolo): un'ellisse morbida (gradiente radiale) spostata dal
 * lato OPPOSTO alla luce e allungata con la radenza, con l'opacità della luce
 * (`forzaOmbra`: di notte sotto la luna resta un'ombra appena). È quello che
 * tiene a terra rocce, cespugli, alberi, canne e pupazzi: senza, galleggiano.
 */
export function ombraPortata(defs: Defs, id: string, luce: Luce, o: OpzOmbra): string {
  const verso = o.verso ?? 1;
  const rad = clamp(luce.radenza);
  const allunga = o.lunghezza * (0.15 + rad * 0.75);
  const spost = -luce.lato * verso * allunga * 0.55;
  const rx = o.larghezza + allunga * 0.5;
  const ry = o.spessore ?? Math.max(4, o.larghezza * 0.16 + 3);
  const k = clamp(luce.forzaOmbra) * (o.forza ?? 1);
  const url = defs.radiale(`${id}-ombra`, [0.5, 0.5], 0.5, [
    [0, "#1b1812", 0.75 * k],
    [0.55, "#1b1812", 0.42 * k],
    [1, "#1b1812", 0],
  ], "objectBoundingBox");
  const d = ellisseD([spost, 0], rx, ry);
  const incl = o.pendenza ? (Math.atan(o.pendenza) * 180) / Math.PI : 0;
  return path(d, incl ? { fill: url, transform: `rotate(${n(incl)})` } : { fill: url });
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

  // --- il lato in luce e quello in ombra -------------------------------------
  // Dalla pendenza locale e da dove sta il sole: il versante che gli volta le
  // spalle prende l'ombra propria, a bande morbide che seguono il profilo (gli
  // stessi campioni allineati al mondo del profilo: niente sfarfallii). La forza
  // è quantizzata in pochi gradini e disegnata a strati cumulativi, così la
  // transizione resta graduale lungo il pendio.
  const pendenzaLocale = (x: number) => (luogo.quota(x + 30) - luogo.quota(x - 30)) / 60;
  const forzaO = luce.forzaOmbra * (0.55 + 0.45 * luce.radenza) * (1 - meteo.temporale * 0.5);
  const ombraA = (x: number) => clamp(-pendenzaLocale(x) * luce.lato * 2.2) * forzaO;
  // un gradiente orizzontale sul profilo: uno stop ogni due campioni, l'opacità
  // è quanto quel tratto di versante volta le spalle al sole
  const tintaOmbra = inOmbra(mescola(C.erbaScura, "#3a3f52", 0.35), luce);
  const xa = pts[0][0];
  const xb = pts[pts.length - 1][0];
  const stop: [number, string, number][] = [];
  for (let i = 0; i < pts.length; i += 2) stop.push([(pts[i][0] - xa) / (xb - xa), tintaOmbra, Math.round(ombraA(pts[i][0]) * 0.5 * 100) / 100]);
  const sfumaOmbra = defs.lineare("suolo-ombra", [xa, 0], [xb, 0], stop);
  terra += path(dSuolo, { fill: sfumaOmbra });

  // --- la materia: chiazze d'erba più chiara e più scura, fisse nel mondo ----
  const semeCh = fnv1a32("collina/chiazze");
  let chiare = "";
  let scure = "";
  for (let i = 0; i < 140; i++) {
    const r = elemento(semeCh, i);
    const x = r.tra(-6000, 6000);
    const sotto = r.tra(30, 800);
    const rx = r.tra(120, 420);
    const ry = r.tra(16, 60);
    const chiara = r.moneta(0.5);
    if (x < v.x0 - rx || x > v.x1 + rx) continue;
    const y = luogo.quota(x) + sotto;
    if (y < v.y0 - ry || y > v.y1 + ry) continue;
    (chiara ? (chiare += ellisseD([x, y], rx, ry)) : (scure += ellisseD([x, y], rx, ry)));
  }
  terra += path(chiare, { fill: inLuce(C.erbaChiara, luce), opacity: 0.07 });
  terra += path(scure, { fill: inOmbra(C.erbaScura, luce), opacity: 0.08 });

  // --- pennellate a fasce: seguono il profilo a profondità diverse, più fitte e
  // lunghe verso la camera (in basso), rade e corte in alto; il tono varia tra
  // luce e ombra secondo il versante (il gouache)
  const semeP = fnv1a32("collina/pennellate");
  const FASCE = [40, 110, 200, 320, 470, 650, 860];
  let pen = "";
  let penChiare = "";
  let penOmbra = "";
  let ip = 0;
  FASCE.forEach((sotto, f) => {
    const quante = 90 + f * 48;
    const lung = 16 + f * 8;
    for (let j = 0; j < quante; j++, ip++) {
      const r = elemento(semeP, ip);
      const x = r.tra(-6000, 6000);
      const dy = r.segno(sotto * 0.22 + 8);
      const w = lung * r.tra(0.7, 1.3);
      const q = r();
      if (x < v.x0 - 60 || x > v.x1 + 60) continue;
      const y = luogo.quota(x) + sotto + dy;
      if (y < v.y0 - 50 || y > v.y1 + 50) continue;
      const incl = pendenzaLocale(x) * w;
      const ombra = ombraA(x) / Math.max(0.01, forzaO);
      const d = `M${n(x)} ${n(y)}l${n(w)} ${n(incl)}`;
      if (ombra > 0.35 && q < 0.7) penOmbra += d;
      else if (q < 0.5) pen += d;
      else penChiare += d;
    }
  });
  terra += path(pen, { stroke: inOmbra(C.erbaScura, luce), "stroke-width": 5, opacity: 0.26, "stroke-linecap": "round" });
  terra += path(penOmbra, { stroke: inOmbra(scurisci(C.erbaScura, 0.3), luce), "stroke-width": 5.5, opacity: 0.3, "stroke-linecap": "round" });
  terra += path(penChiare, { stroke: inLuce(C.erbaChiara, luce), "stroke-width": 4, opacity: 0.22, "stroke-linecap": "round" });

  // --- i fiori: puntini radi di tre colori terrosi, solo da vicino -------------
  const zf = Math.max(0.1, o.cam.zoom);
  if (zf > 0.55 && meteo.notte < 0.9) {
    const semeFi = fnv1a32("collina/fiori");
    const FIORI = ["#e9d27a", "#d9a3a8", "#f2efe0"] as const;
    const d = ["", "", ""];
    const densita = clamp((zf - 0.5) * 1.2);
    for (let k = 0; k < 220; k++) {
      const r = elemento(semeFi, k);
      const soglia = r();
      const x = r.tra(-6000, 6000);
      const sotto = r.tra(24, 420);
      const rr = r.tra(2.2, 3.6);
      const c = r.intero(0, 2);
      if (soglia > densita || x < v.x0 - 10 || x > v.x1 + 10) continue;
      const y = luogo.quota(x) + sotto;
      if (y < v.y0 - 10 || y > v.y1 + 10 || (luogo.acqua && x < luogo.acqua.riva + 60)) continue;
      d[c] += ellisseD([x, y], rr, rr * 0.8) + ellisseD([x + rr * 1.6, y + rr * 0.9], rr * 0.7, rr * 0.55);
    }
    d.forEach((dd, c) => (terra += path(dd, { fill: inLuce(FIORI[c], luce), opacity: 0.8 * (1 - meteo.notte) })));
  }

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
  // ai piedi del canneto, una striscia d'ombra leggera dal lato opposto alla luce
  let ombra = "";
  if (!davanti) {
    const xa = Math.max(a, v.x0 - 40);
    const xb = Math.min(b, v.x1 + 40);
    const spost = -luce.lato * (30 + luce.radenza * 90);
    for (let x = Math.floor(xa / 24) * 24; x <= xb; x += 24) {
      const y = Math.min(luogo.quota(x), livelloAcqua) + 14;
      ombra += `M${n(x + spost - 16)} ${n(y)}h${n(32)}`;
    }
  }
  return (
    path(ombra, { stroke: "#1b1812", "stroke-width": 14, opacity: n(0.2 * luce.forzaOmbra), "stroke-linecap": "round" }) +
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

// --------------------------------------------------------------- piena --
/**
 * La piena (ep04): l'acqua vicina salita sopra il suo livello, DAVANTI a tutto il
 * piano dei personaggi — copre le zampe di chi ci sta dentro, i pali, il piede dei
 * massi, le passerelle sommerse. È torbida (la pioggia di tutto il cielo, la terra
 * delle rive), la corrente le scorre sopra a strisce, la pioggia la punteggia; dove
 * la riva sale più della piena, l'acqua finisce sulla riva. Niente bagliori: è
 * acqua sporca, di notte. Le strisce e i cerchi stanno fermi nel mondo (una piastrella
 * che si ripete), così la camera ci passa sopra senza farli scivolare.
 */
export function piena(o: OpzPalco): string {
  const P = o.piena;
  const A = o.luogo.acqua;
  if (!P || !A) return "";
  const h = P.laguna ?? P.livello;
  if (h <= 0.5) return "";
  const { luce, t, meteo, defs, luogo } = o;
  const C = luogo.colori;
  const yF = A.quota - h;
  const v = vista(o.cam, 1, 0.25);
  const x0 = v.x0 - 60;
  const x1 = v.x1 + 60;
  const passo = 12 * Math.pow(2, Math.max(0, Math.ceil(Math.log2((x1 - x0) / 220 / 12))));
  const fondo = Math.max(v.y1 + 200, A.quota + 400);
  const onda = (x: number) => Math.sin(x * 0.021 - t * 1.9) * 1.8 + Math.sin(x * 0.047 + t * 1.2) * 1.1;
  const sopra: P[] = [];
  const sotto: P[] = [];
  for (let x = Math.floor(x0 / passo) * passo; x <= x1 + passo; x += passo) {
    const y = yF + onda(x);
    sopra.push([x, y]);
    // sul lago va giù fino in fondo; sulla riva finisce dove il suolo sale sopra la piena
    sotto.push([x, x < A.riva ? fondo : Math.max(y, luogo.quota(x) + 3)]);
  }
  const torbida = mescola(C.lago, "#6b5a40", 0.32);
  const url = defs.lineare("piena", [0, yF - 4], [0, yF + 520], [
    [0, inLuce(mescola(C.lagoChiaro, "#8f7d5c", 0.4), luce)],
    [0.06, inLuce(torbida, luce)],
    [1, inOmbra(scurisci(torbida, 0.3), luce)],
  ]);
  let s = path(`M${sopra.map(pt).join("L")}L${sotto.reverse().map(pt).join("L")}Z`, { fill: url, opacity: 0.96 });
  // il pelo dell'acqua: una linea più chiara, rotta dalle onde
  s += path(`M${sopra.map(pt).join("L")}`, { stroke: inLuce(mescola(C.lagoChiaro, "#d8d2c0", 0.3), luce), "stroke-width": 2.4, fill: "none", opacity: 0.55 });
  const TILE = 2400;
  const tessere = (base: number, dx: number): number[] => {
    const b = (((base + dx) % TILE) + TILE) % TILE;
    const out: number[] = [];
    for (let k = Math.floor((x0 - b) / TILE); b + k * TILE < x1; k++) out.push(b + k * TILE);
    return out;
  };
  // la corrente: strisce che scorrono, lunghe al pelo e corte in fondo
  const c = P.corrente ?? 0;
  if (Math.abs(c) > 0.02) {
    const semeC = fnv1a32("piena/corrente");
    let d = "";
    for (let i = 0; i < 70; i++) {
      const r = elemento(semeC, i);
      const base = r.tra(0, TILE);
      const k = r();
      const prof = 3 + k * k * 170;
      const lung = (30 + (1 - k) * 110) * r.tra(0.5, 1.2);
      const vel = r.tra(60, 170) * c;
      for (const x of tessere(base, vel * t)) {
        const y = yF + prof + onda(x) * (1 - k);
        if (y > v.y1 + 20) continue;
        d += `M${n(x)} ${n(y)}h${n(lung * Math.sign(c))}`;
      }
    }
    s += path(d, { stroke: inLuce(mescola(C.lagoChiaro, "#cfc6ae", 0.25), luce), "stroke-width": 2.2, fill: "none", opacity: 0.32 * Math.min(1, Math.abs(c) * 1.4), "stroke-linecap": "round" });
  }
  // la pioggia sulla piena: cerchi che si aprono e spariscono
  if (meteo.pioggia > 0.05) {
    const semeP = fnv1a32("piena/gocce");
    // tre età: il cerchio appena aperto si vede di più
    const d = ["", "", ""];
    const quanti = Math.round(60 * meteo.pioggia);
    for (let i = 0; i < quanti; i++) {
      const r = elemento(semeP, i);
      const periodo = r.tra(0.55, 1.1);
      const u = (t + r.tra(0, periodo)) / periodo;
      const giro = Math.floor(u);
      const e = u - giro;
      // ogni goccia cade in un posto nuovo: il posto dipende dal giro
      const q = elemento(semeP, 100000 + i * 997 + giro);
      const base = q.tra(0, TILE);
      const prof = q.tra(3, 90);
      const rr = 3 + e * 16 * (1 - prof / 140);
      for (const x of tessere(base, 0)) d[Math.min(2, Math.floor(e * 3))] += ellisseD([x, yF + prof + onda(x)], rr, rr * 0.22);
    }
    d.forEach((dd, k) => (s += path(dd, { stroke: inLuce("#d9dccf", luce), "stroke-width": 1.4, fill: "none", opacity: (0.5 - k * 0.15) * meteo.pioggia })));
  }
  return s;
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

