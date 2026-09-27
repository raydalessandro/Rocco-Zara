// cartoni/scene/regia.ts — gli attrezzi della regia: mettere in scena.
//
// Mettere un pupazzo sul palco (in piedi sul pendio, girato dalla parte
// giusta), ricavare la fase del passo dalla strada fatta (così i piedi non
// scivolano), far tremare la camera quando un ramo esplode.

import { type Luce } from "../motore/colore";
import { type Camera } from "../motore/fotogramma";
import { rumore1 } from "../motore/caso";
import { type Defs, type P, g, n, path } from "../motore/svg";
import { clamp } from "../motore/tempo";
import type { Luogo } from "./luogo";

/** Quel che serve di un luogo per metterci qualcuno sopra. */
export type Suolo = Pick<Luogo, "quota" | "pendenza">;

/** Strada per ciclo di andatura, a scala 1 (misurata sui cicli dei pupazzi). */
export const CICLO = {
  /** Rocco al passo: falcata 64 in appoggio per 0.64 del ciclo → 100. */
  roccoPasso: 100,
  /** Zara al passo: 60 / 0.64. */
  zaraPasso: 93.75,
  /** Zara al galoppo: 98 di appoggio in 0.32 del ciclo. */
  zaraCorsa: 306,
  /** Cervara al passo (ep03): falcata 54 in appoggio per 0.64 del ciclo. */
  cervaraPasso: 84.4,
} as const;

/** La fase dell'andatura dalla strada percorsa. */
export const fase = (strada: number, ciclo: number, scala = 1): number => Math.abs(strada) / (ciclo * scala);

export interface OpzSulPalco {
  verso?: 1 | -1;
  scala?: number;
  /** quanto seguire la pendenza (0 = in bolla, 1 = tutto; default 0.75) */
  inclina?: number;
  dy?: number;
}

/**
 * Un pupazzo sul palco: piedi sul suolo, inclinato col pendio (non del tutto:
 * gli animali tengono la testa in bolla), girato a destra (1) o a sinistra (-1).
 */
export function sulPalco(suolo: Suolo, x: number, disegno: string, o: OpzSulPalco = {}): string {
  const verso = o.verso ?? 1;
  const sc = o.scala ?? 1;
  const ang = (Math.atan(suolo.pendenza(x)) * 180) / Math.PI * (o.inclina ?? 0.75);
  const y = suolo.quota(x) + (o.dy ?? 0);
  return g({ transform: `translate(${n(x)} ${n(y)})rotate(${n(ang)})scale(${Math.round(verso * sc * 1000) / 1000} ${Math.round(sc * 1000) / 1000})` }, disegno);
}

/** Un pupazzo in un punto qualunque (in volo, su un ramo), senza suolo. */
export function inPunto(p: P, disegno: string, o: { verso?: 1 | -1; scala?: number; ang?: number } = {}): string {
  const verso = o.verso ?? 1;
  const sc = o.scala ?? 1;
  return g({ transform: `translate(${n(p[0])} ${n(p[1])})rotate(${n(o.ang ?? 0)})scale(${Math.round(verso * sc * 1000) / 1000} ${Math.round(sc * 1000) / 1000})` }, disegno);
}

/** La camera a metà strada tra due inquadrature (lo zoom si mescola in scala logaritmica: il dolly è regolare). */
export const camTra = (a: Camera, b: Camera, k: number): Camera => ({
  x: a.x + (b.x - a.x) * k,
  y: a.y + (b.y - a.y) * k,
  zoom: Math.exp(Math.log(a.zoom) + (Math.log(b.zoom) - Math.log(a.zoom)) * k),
  rot: (a.rot ?? 0) + ((b.rot ?? 0) - (a.rot ?? 0)) * k,
});

/** Scossa della camera dopo un colpo al tempo t0 (decade in `durata`). */
export function scossa(cam: Camera, t: number, t0: number, forza: number, durata = 0.6): Camera {
  if (t < t0 || t > t0 + durata) return cam;
  const k = 1 - (t - t0) / durata;
  const a = forza * k * k;
  return { ...cam, scossaX: rumore1(t * 40, 3) * a, scossaY: rumore1(t * 40, 9) * a };
}

/** Il vento che scuote la camera (tempesta): un tremito continuo, leggero. */
export function tremito(cam: Camera, t: number, forza: number): Camera {
  return { ...cam, scossaX: rumore1(t * 6, 21) * forza, scossaY: rumore1(t * 5, 33) * forza * 0.6 };
}

/** Bocca che parla: aperture ritmiche dentro una finestra [a, b]. */
export function parla(t: number, a: number, b: number, ritmo = 7): number {
  if (t < a || t > b) return 0;
  const k = Math.min(1, (t - a) / 0.08, (b - t) / 0.08);
  return clamp(k) * (0.35 + 0.65 * Math.abs(Math.sin(t * ritmo + Math.sin(t * 13) * 0.6)));
}

// ------------------------------------------------------ di sasso in sasso --
/** Dove sta chi va di sasso in sasso a un istante (ep03, i Massi; ep04, le staffette). */
export interface Salto {
  p: P;
  /** l'ultimo appoggio toccato */
  i: number;
  /** dentro il salto (0..1), o 1 se sta fermo sull'appoggio */
  u: number;
  inAria: boolean;
  /** quanto è passato dall'ultimo appoggio (s), per chi deve raccogliersi e ripartire */
  appoggio: number;
}

/**
 * Chi va di sasso in sasso: parte da `punti[0]` a t0; ogni salto dura `aria`, ogni
 * appoggio `sosta`; `alto` è quanto sale l'arco del salto (ep03, «Di sasso in sasso»).
 */
export function diSassoInSasso(punti: readonly P[], t: number, t0: number, aria: number, sosta: number, alto: number): Salto {
  const passo = aria + sosta;
  const k = t - t0;
  if (k <= 0) return { p: punti[0], i: 0, u: 0, inAria: false, appoggio: 0 };
  const i = Math.floor(k / passo);
  if (i >= punti.length - 1) return { p: punti[punti.length - 1], i: punti.length - 1, u: 1, inAria: false, appoggio: k - (punti.length - 1) * passo + sosta };
  const dentro = k - i * passo;
  if (dentro < aria) {
    const u = dentro / aria;
    const a = punti[i];
    const b = punti[i + 1];
    return { p: [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u - alto * 4 * u * (1 - u)], i, u, inAria: true, appoggio: 0 };
  }
  return { p: punti[i + 1], i: i + 1, u: 1, inAria: false, appoggio: dentro - aria };
}

/** Gli istanti in cui chi va di sasso in sasso tocca ogni appoggio dopo il primo (per i suoni). */
export const tocchi = (quanti: number, t0: number, aria: number, sosta: number): number[] => Array.from({ length: quanti - 1 }, (_, i) => t0 + i * (aria + sosta) + aria);

/** Il galoppo di Zara su un salto: il volo va da 0.78 a 1.18 del ciclo, l'appoggio da 0.18 a 0.78. */
export const faseGaloppo = (s: Salto, sosta: number): number => (s.inAria ? s.i + 0.78 + 0.4 * s.u : s.i + 0.18 + 0.6 * clamp(s.appoggio / sosta));

/** La corda di Toraki posata a terra (piccola, nei campi larghi). */
export function cordaATerra(suolo: Suolo, x0: number, x1: number, luce: Luce, defs: Defs, dy = -4): string {
  void defs;
  const fibra = "#a88b5c";
  let d = "";
  const N = 16;
  let nodi = "";
  for (let i = 0; i <= N; i++) {
    const x = x0 + ((x1 - x0) * i) / N;
    const y = suolo.quota(x) + dy + Math.sin(i * 1.3) * 2;
    d += `${i === 0 ? "M" : "L"}${n(x)} ${n(y)}`;
    if (i > 0 && i < N / 2) nodi += `M${n(x - 3)} ${n(y)}a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z`;
  }
  void luce;
  return path(d, { stroke: fibra, "stroke-width": 3.5, fill: "none", "stroke-linecap": "round" }) + path(nodi, { fill: "#7d6440" });
}
