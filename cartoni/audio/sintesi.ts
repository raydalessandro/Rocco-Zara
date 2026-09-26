// cartoni/audio/sintesi.ts — gli strumenti, fatti di numeri.
//
// Niente campioni registrati: ogni suono è una formula, e il caso è seminato
// (stesso copione → stessa colonna sonora, campione per campione). Strumenti
// volutamente semplici e caldi: un'arpa (corde pizzicate, parziali che
// decadono), un pad d'archi morbido, un flauto col vibrato, un basso pizzicato,
// un timpano. Il riverbero dà la stanza.

import { mulberry32 } from "../motore/caso";

export const SR = 48000;

/** Un bus stereo: due canali di campioni float. */
export class Bus {
  readonly l: Float32Array;
  readonly r: Float32Array;
  readonly n: number;
  constructor(secondi: number) {
    this.n = Math.ceil(secondi * SR);
    this.l = new Float32Array(this.n);
    this.r = new Float32Array(this.n);
  }
  /** Aggiunge un campione mono con pan (−1 sinistra … +1 destra), legge a potenza costante. */
  add(i: number, v: number, pan = 0): void {
    if (i < 0 || i >= this.n) return;
    const a = ((pan + 1) * Math.PI) / 4;
    this.l[i] += v * Math.cos(a);
    this.r[i] += v * Math.sin(a);
  }
  mescola(altro: Bus, guadagno = 1): void {
    const n = Math.min(this.n, altro.n);
    for (let i = 0; i < n; i++) {
      this.l[i] += altro.l[i] * guadagno;
      this.r[i] += altro.r[i] * guadagno;
    }
  }
}

export const hz = (midi: number): number => 440 * Math.pow(2, (midi - 69) / 12);
const idx = (t: number) => Math.round(t * SR);

// --------------------------------------------------------------- strumenti --
/**
 * Arpa / corda pizzicata: parziali armoniche con decadimento esponenziale
 * (le alte muoiono prima), un filo di inarmonicità, attacco istantaneo.
 */
export function arpa(bus: Bus, t: number, midi: number, vel: number, pan = 0, durata = 2.4): void {
  const f = hz(midi);
  const i0 = idx(t);
  const n = Math.min(idx(durata), bus.n - i0);
  if (n <= 0) return;
  const parz = f < 300 ? 7 : f < 900 ? 5 : 3;
  for (let k = 1; k <= parz; k++) {
    const fk = f * k * (1 + 0.0004 * k * k);
    if (fk > SR / 2.2) break;
    const amp = (vel * 0.22) / Math.pow(k, 1.4);
    const dec = 1.2 + k * 1.6 + f / 400; // 1/s
    const w = (2 * Math.PI * fk) / SR;
    const c = 2 * Math.cos(w);
    let y1 = Math.sin(-w);
    let y2 = Math.sin(-2 * w);
    const g = Math.exp(-dec / SR);
    let e = amp;
    for (let i = 0; i < n; i++) {
      const y = c * y1 - y2;
      y2 = y1;
      y1 = y;
      // attacco di 2 ms per non schioccare
      const att = i < 96 ? i / 96 : 1;
      bus.add(i0 + i, y * e * att, pan);
      e *= g;
    }
  }
}

/** Pad d'archi: tre voci un po' stonate tra loro, armoniche morbide, attacco e rilascio lenti. */
export function pad(bus: Bus, t: number, midis: readonly number[], durata: number, vel: number, pan = 0, attacco = 1.2, rilascio = 1.6): void {
  const i0 = idx(t);
  const n = Math.min(idx(durata + rilascio), bus.n - i0);
  if (n <= 0) return;
  const nSost = idx(durata);
  const nA = idx(attacco);
  const nR = idx(rilascio);
  const per = midis.length;
  for (let v = 0; v < per; v++) {
    const f0 = hz(midis[v]);
    for (const [st, pp] of [
      [-0.0021, -0.5],
      [0, 0],
      [0.0024, 0.5],
    ] as const) {
      const f = f0 * (1 + st);
      const arm = f < 200 ? 6 : 4;
      for (let k = 1; k <= arm; k++) {
        const fk = f * k;
        if (fk > 7000) break;
        const amp = (vel * 0.05) / (per * k * k * 0.6 + 0.4 * per);
        const w = (2 * Math.PI * fk) / SR;
        const c = 2 * Math.cos(w);
        let y1 = Math.sin(-w + v + k);
        let y2 = Math.sin(-2 * w + v + k);
        for (let i = 0; i < n; i++) {
          const y = c * y1 - y2;
          y2 = y1;
          y1 = y;
          let env = 1;
          if (i < nA) env = i / nA;
          if (i > nSost) env *= Math.max(0, 1 - (i - nSost) / nR);
          bus.add(i0 + i, y * amp * env * env, pan + pp * 0.6);
        }
      }
    }
  }
}

/** Flauto: fondamentale con due armoniche, vibrato che arriva dopo l'attacco, un soffio. */
export function flauto(bus: Bus, t: number, midi: number, durata: number, vel: number, pan = 0, seme = 1): void {
  const f = hz(midi);
  const i0 = idx(t);
  const rel = 0.14;
  const n = Math.min(idx(durata + rel), bus.n - i0);
  if (n <= 0) return;
  const nA = idx(0.06);
  const nS = idx(durata);
  const nR = idx(rel);
  const rnd = mulberry32(seme);
  let fase = 0;
  let soffio = 0;
  for (let i = 0; i < n; i++) {
    const tt = i / SR;
    const vib = 1 + 0.0045 * Math.sin(2 * Math.PI * 5.2 * tt) * Math.min(1, Math.max(0, (tt - 0.22) / 0.3));
    fase += (2 * Math.PI * f * vib) / SR;
    let env = 1;
    if (i < nA) env = i / nA;
    if (i > nS) env *= Math.max(0, 1 - (i - nS) / nR);
    soffio = soffio * 0.97 + (rnd() - 0.5) * 0.03;
    const y = Math.sin(fase) + 0.22 * Math.sin(2 * fase) + 0.07 * Math.sin(3 * fase) + soffio * 0.6;
    bus.add(i0 + i, y * vel * 0.11 * env, pan);
  }
}

/** Basso pizzicato: fondamentale e ottava, decadimento medio. */
export function basso(bus: Bus, t: number, midi: number, vel: number, durata = 1.1): void {
  const f = hz(midi);
  const i0 = idx(t);
  const n = Math.min(idx(durata), bus.n - i0);
  if (n <= 0) return;
  let fase = 0;
  const g = Math.exp(-2.6 / SR);
  let e = vel * 0.34;
  for (let i = 0; i < n; i++) {
    fase += (2 * Math.PI * f) / SR;
    const att = i < 240 ? i / 240 : 1;
    const coda = i > n - 480 ? (n - i) / 480 : 1;
    bus.add(i0 + i, (Math.sin(fase) + 0.35 * Math.sin(2 * fase) + 0.1 * Math.sin(3 * fase)) * e * att * coda, 0);
    e *= g;
  }
}

/** Timpano: seno che scende di intonazione nell'attacco, un colpo di rumore, coda lunga. */
export function timpano(bus: Bus, t: number, midi: number, vel: number, seme = 7): void {
  const f = hz(midi);
  const i0 = idx(t);
  const n = Math.min(idx(2.4), bus.n - i0);
  if (n <= 0) return;
  const rnd = mulberry32(seme);
  let fase = 0;
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const tt = i / SR;
    const ff = f * (1 + 0.35 * Math.exp(-tt * 30));
    fase += (2 * Math.PI * ff) / SR;
    const e = Math.exp(-tt * 1.9);
    lp = lp * 0.9 + (rnd() - 0.5) * 0.1;
    const colpo = Math.exp(-tt * 60) * lp * 4;
    bus.add(i0 + i, (Math.sin(fase) * 0.9 + colpo) * e * vel * 0.4, 0);
  }
}

// -------------------------------------------------------------- riverbero --
/** Riverbero "Freeverb" ridotto: 4 pettini con smorzamento + 2 passa-tutto per canale. */
export function riverbero(bus: Bus, bagnato = 0.25, stanza = 0.82, smorza = 0.3): Bus {
  const out = new Bus(bus.n / SR);
  const pettini = [1557, 1617, 1491, 1422];
  const passa = [556, 441];
  for (const [src, dst, off] of [
    [bus.l, out.l, 0],
    [bus.r, out.r, 23],
  ] as const) {
    const pb = pettini.map((d) => new Float32Array(d + off));
    const pi = pettini.map(() => 0);
    const pf = pettini.map(() => 0);
    const ab = passa.map((d) => new Float32Array(d + off));
    const ai = passa.map(() => 0);
    for (let i = 0; i < src.length; i++) {
      const x = src[i] * 0.015;
      let s = 0;
      for (let k = 0; k < 4; k++) {
        const b = pb[k];
        const y = b[pi[k]];
        pf[k] = y * (1 - smorza) + pf[k] * smorza;
        b[pi[k]] = x + pf[k] * stanza;
        pi[k] = (pi[k] + 1) % b.length;
        s += y;
      }
      for (let k = 0; k < 2; k++) {
        const b = ab[k];
        const y = b[ai[k]];
        b[ai[k]] = s + y * 0.5;
        s = y - s;
        ai[k] = (ai[k] + 1) % b.length;
      }
      dst[i] = src[i] * (1 - bagnato) + s * bagnato * 3;
    }
  }
  return out;
}
