// cartoni/audio/narratrice.ts — la voce narrante nel missaggio.
//
// La narratrice è UNA per tutta la saga (cartoni/voce/voce.json): le sue
// riprese sono file audio (non si rifanno a ogni render: una voce sintetica
// non ridice mai una frase uguale, e la ripresa buona si tiene come si tiene
// una registrazione). Qui le riprese, già lette in campioni, si mettono al
// loro posto sul tempo dell'episodio e si scaldano un poco: bassi più pieni,
// alti più morbidi, un filo di stanza. Nessun I/O: i file li legge il render.

import type { EventoVoce } from "../motore/voce";
import { Bus, SR, riverbero } from "./sintesi";

/** Come si scalda la voce (decibel e stanza 0..1). */
export interface Calore {
  bassi: number;
  alti: number;
  stanza: number;
  /** volume relativo della narratrice */
  vol?: number;
}

export const CALORE_BASE: Calore = { bassi: 2.5, alti: -2, stanza: 0.12, vol: 1 };

/** Filtro a mensola (RBJ): `alto` = mensola degli acuti, altrimenti dei bassi. */
function mensola(x: Float32Array, f: number, db: number, alto: boolean): void {
  if (Math.abs(db) < 0.01) return;
  const A = Math.pow(10, db / 40);
  const w = (2 * Math.PI * f) / SR;
  const cs = Math.cos(w);
  const al = (Math.sin(w) / 2) * Math.SQRT2;
  const r = 2 * Math.sqrt(A) * al;
  let b0: number, b1: number, b2: number, a0: number, a1: number, a2: number;
  if (alto) {
    b0 = A * (A + 1 + (A - 1) * cs + r);
    b1 = -2 * A * (A - 1 + (A + 1) * cs);
    b2 = A * (A + 1 + (A - 1) * cs - r);
    a0 = A + 1 - (A - 1) * cs + r;
    a1 = 2 * (A - 1 - (A + 1) * cs);
    a2 = A + 1 - (A - 1) * cs - r;
  } else {
    b0 = A * (A + 1 - (A - 1) * cs + r);
    b1 = 2 * A * (A - 1 - (A + 1) * cs);
    b2 = A * (A + 1 - (A - 1) * cs - r);
    a0 = A + 1 + (A - 1) * cs + r;
    a1 = -2 * (A - 1 + (A + 1) * cs);
    a2 = A + 1 + (A - 1) * cs - r;
  }
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const y = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1;
    x1 = x[i];
    y2 = y1;
    y1 = y;
    x[i] = y;
  }
}

/** Porta una ripresa al livello di voce del missaggio (RMS sul parlato). */
function livella(x: Float32Array, rms: number): void {
  let e = 0;
  let c = 0;
  for (let i = 0; i < x.length; i++) {
    if (Math.abs(x[i]) > 0.003) {
      e += x[i] * x[i];
      c++;
    }
  }
  const g = c ? rms / Math.sqrt(e / c) : 0;
  const nf = Math.min(480, x.length >> 1);
  for (let i = 0; i < x.length; i++) {
    const f = Math.min(1, i / nf, (x.length - 1 - i) / nf);
    x[i] *= g * f;
  }
}

/**
 * Mette le riprese sul bus. `riprese`: file → campioni (48 kHz, mono), già
 * letti dal render. Le riprese mancanti si saltano (la didascalia resta).
 */
export function narrazione(bus: Bus, eventi: readonly EventoVoce[], riprese: ReadonlyMap<string, Float32Array>, calore: Calore = CALORE_BASE): void {
  const secco = new Bus(bus.n / SR);
  for (const e of eventi) {
    if (e.tipo !== "narrazione" || !e.clip) continue;
    const src = riprese.get(e.clip.file);
    if (!src) continue;
    const x = Float32Array.from(src);
    mensola(x, 220, calore.bassi, false);
    mensola(x, 5200, calore.alti, true);
    livella(x, 0.11 * (calore.vol ?? 1) * (e.pensiero ? 0.88 : 1));
    const i0 = Math.round(e.tg * SR);
    for (let i = 0; i < x.length; i++) secco.add(i0 + i, x[i], 0);
  }
  bus.mescola(riverbero(secco, calore.stanza, 0.7, 0.45));
}
