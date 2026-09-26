// cartoni/audio/narratrice.ts — le voci registrate nel missaggio.
//
// La narratrice è UNA per tutta la saga, e ogni personaggio ha la SUA voce
// (cartoni/voce/voce.json): le loro riprese sono file audio (non si rifanno a
// ogni render: la ripresa buona si tiene come si tiene una registrazione). Qui
// le riprese, già lette in campioni, si mettono al loro posto sul tempo
// dell'episodio: la narratrice al centro e scaldata un poco (bassi più pieni,
// alti più morbidi, un filo di stanza); i personaggi dove stanno nello stereo,
// col loro volume, e chi parla da un ricordo con l'eco. Nessun I/O: i file li
// legge il render.

import type { EventoVoce, ProfiloVoce } from "../motore/voce";
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
 * `voci`: i profili dei personaggi (volume, stereo, eco) per le battute.
 */
export function riprese(
  bus: Bus,
  eventi: readonly EventoVoce[],
  file: ReadonlyMap<string, Float32Array>,
  calore: Calore = CALORE_BASE,
  voci: Readonly<Record<string, ProfiloVoce>> = {},
): void {
  const narratrice = new Bus(bus.n / SR);
  const personaggi = new Bus(bus.n / SR);
  const ricordi = new Bus(bus.n / SR);
  for (const e of eventi) {
    if (!e.clip) continue;
    const src = file.get(e.clip.file);
    if (!src) continue;
    const x = Float32Array.from(src);
    const i0 = Math.round(e.tg * SR);
    if (e.tipo === "narrazione") {
      mensola(x, 220, calore.bassi, false);
      mensola(x, 5200, calore.alti, true);
      livella(x, 0.11 * (calore.vol ?? 1) * (e.pensiero ? 0.88 : 1));
      for (let i = 0; i < x.length; i++) narratrice.add(i0 + i, x[i], 0);
      continue;
    }
    const v = voci[e.chi];
    livella(x, 0.11 * (v?.vol ?? 1));
    const eco = v?.eco ?? 0;
    if (eco > 0) {
      // il ricordo: un'eco lontana
      const d = Math.round(0.19 * SR);
      const y = new Float32Array(x.length + d * 4);
      y.set(x);
      let l = 0;
      for (let i = d; i < y.length; i++) {
        l = l * 0.6 + y[i - d] * 0.4;
        y[i] += l * eco * 0.55;
      }
      for (let i = 0; i < y.length; i++) ricordi.add(i0 + i, y[i], v?.pan ?? 0);
    } else {
      for (let i = 0; i < x.length; i++) personaggi.add(i0 + i, x[i], v?.pan ?? 0);
    }
  }
  bus.mescola(riverbero(narratrice, calore.stanza, 0.7, 0.45));
  bus.mescola(riverbero(personaggi, 0.14, 0.72, 0.4));
  bus.mescola(riverbero(ricordi, 0.45, 0.86, 0.3));
}

/** Compatibilità: solo la narratrice. */
export function narrazione(bus: Bus, eventi: readonly EventoVoce[], file: ReadonlyMap<string, Float32Array>, calore: Calore = CALORE_BASE): void {
  riprese(bus, eventi.filter((e) => e.tipo === "narrazione"), file, calore);
}
