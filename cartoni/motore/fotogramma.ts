// cartoni/motore/fotogramma.ts — il fotogramma, la camera, il montaggio.
//
// Un fotogramma è una pila di LIVELLI (sfondo lontano → primo piano), ognuno
// con la sua profondità di parallasse: la camera li sposta e li ingrandisce in
// misura diversa, ed è così che un disegno piatto diventa un paesaggio in cui
// si entra. Le inquadrature restituiscono livelli; il montaggio decide quali
// inquadrature sono in scena a un tempo t (anche due, in dissolvenza).

import { Defs, n } from "./svg";

export const LARGHEZZA = 1920;
export const ALTEZZA = 1080;

/** La camera: dove guarda (coordinate del palco), quanto è vicina, se trema. */
export interface Camera {
  x: number;
  y: number;
  zoom: number;
  /** Inclinazione in gradi (camera "olandese"). */
  rot?: number;
  /** Tremolio già calcolato (px di schermo). */
  scossaX?: number;
  scossaY?: number;
}

/**
 * Un livello del fotogramma. `p` è la parallasse: 1 = il piano dei personaggi,
 * <1 lontano (si muove poco), >1 vicino (primo piano, si muove molto). Con
 * `schermo: true` il livello non segue la camera (cielo pieno, pioggia, grana).
 */
export interface Livello {
  id: string;
  contenuto: string;
  p?: number;
  schermo?: boolean;
  opacita?: number;
  filtro?: string;
  misto?: string;
}

/** Un'inquadratura in scena a questo tempo (in dissolvenza possono essere due). */
export interface Piano {
  id: string;
  opacita: number;
  livelli: { id: string; trasf: string; contenuto: string; opacita?: number; filtro?: string; misto?: string }[];
}

export interface Fotogramma {
  t: number;
  sfondo: string;
  defs: string;
  piani: Piano[];
  /** Velo a tutto schermo (nero per le chiusure, bianco per i lampi). */
  velo?: { colore: string; opacita: number };
}

/** La matrice di un livello per una camera: zoom^p (dolly), spostamento×p. */
export function matriceLivello(cam: Camera, p: number): string {
  const z = Math.pow(Math.max(0.01, cam.zoom), p);
  const rot = ((cam.rot ?? 0) * Math.PI) / 180;
  const c = Math.cos(rot) * z;
  const s = Math.sin(rot) * z;
  // schermo = centro + R·z·(mondo − cam·p) + scossa
  const tx = -(cam.x * p);
  const ty = -(cam.y * p);
  const e = LARGHEZZA / 2 + c * tx - s * ty + (cam.scossaX ?? 0) * p;
  const f = ALTEZZA / 2 + s * tx + c * ty + (cam.scossaY ?? 0) * p;
  return `matrix(${r4(c)} ${r4(s)} ${r4(-s)} ${r4(c)} ${n(e)} ${n(f)})`;
}
const r4 = (x: number) => {
  const r = Math.round(x * 10000) / 10000;
  return Object.is(r, -0) ? "0" : String(r);
};
/** Opacità a tre decimali, mai negativa. */
export const op = (x: number): string => String(Math.max(0, Math.round(x * 1000) / 1000));

/** Da coordinate di un livello (parallasse p) a coordinate schermo. */
export function aSchermo(cam: Camera, p: number, x: number, y: number): [number, number] {
  const z = Math.pow(Math.max(0.01, cam.zoom), p);
  const rot = ((cam.rot ?? 0) * Math.PI) / 180;
  const dx = x - cam.x * p;
  const dy = y - cam.y * p;
  return [
    LARGHEZZA / 2 + (Math.cos(rot) * dx - Math.sin(rot) * dy) * z + (cam.scossaX ?? 0) * p,
    ALTEZZA / 2 + (Math.sin(rot) * dx + Math.cos(rot) * dy) * z + (cam.scossaY ?? 0) * p,
  ];
}

/** Il rettangolo del mondo (a parallasse p) visto dalla camera, con margine. */
export function vista(cam: Camera, p: number, margine = 0.1): { x0: number; x1: number; y0: number; y1: number } {
  const z = Math.pow(Math.max(0.01, cam.zoom), p);
  const mx = (LARGHEZZA / 2 / z) * (1 + margine);
  const my = (ALTEZZA / 2 / z) * (1 + margine);
  // con la rotazione allarghiamo per sicurezza
  const k = cam.rot ? 1.25 : 1;
  return { x0: cam.x * p - mx * k, x1: cam.x * p + mx * k, y0: cam.y * p - my * k, y1: cam.y * p + my * k };
}

/** Converte i livelli di un'inquadratura in un piano, data la camera. */
export function componiPiano(id: string, livelli: Livello[], cam: Camera, opacita = 1): Piano {
  return {
    id,
    opacita,
    livelli: livelli
      .filter((l) => l.contenuto)
      .map((l) => ({
        id: `${id}-${l.id}`,
        trasf: l.schermo ? "" : matriceLivello(cam, l.p ?? 1),
        contenuto: l.contenuto,
        opacita: l.opacita,
        filtro: l.filtro,
        misto: l.misto,
      })),
  };
}

/** Il fotogramma come un unico SVG (per il render e per i provini). */
export function inSvg(f: Fotogramma, larghezzaPx = LARGHEZZA): string {
  const hPx = Math.round((larghezzaPx * ALTEZZA) / LARGHEZZA);
  let corpo = `<rect width="${LARGHEZZA}" height="${ALTEZZA}" fill="${f.sfondo}"/>`;
  for (const p of f.piani) {
    let dentro = "";
    for (const l of p.livelli) {
      dentro += `<g${l.trasf ? ` transform="${l.trasf}"` : ""}${l.opacita !== undefined && l.opacita < 1 ? ` opacity="${op(l.opacita)}"` : ""}${l.filtro ? ` filter="${l.filtro}"` : ""}${l.misto ? ` style="mix-blend-mode:${l.misto}"` : ""}>${l.contenuto}</g>`;
    }
    corpo += p.opacita < 1 ? `<g opacity="${op(p.opacita)}">${dentro}</g>` : dentro;
  }
  if (f.velo && f.velo.opacita > 0) {
    corpo += `<rect width="${LARGHEZZA}" height="${ALTEZZA}" fill="${f.velo.colore}" opacity="${op(f.velo.opacita)}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARGHEZZA} ${ALTEZZA}" width="${larghezzaPx}" height="${hPx}"><defs>${f.defs}</defs>${corpo}</svg>`;
}

export { Defs };
