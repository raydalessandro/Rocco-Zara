// cartoni/audio/effetti.ts — i rumori del mondo: vento, acqua, zampe, ali, tuoni.
//
// Ogni effetto è rumore seminato e filtrato, con un inviluppo. Anche qui niente
// magia: la pietra non suona, il luccichio è un "tic" di un sassolino che
// riflette il sole, il tuono è aria che rimbomba.

import { casoN, fnv1a32, frattale1, mulberry32 } from "../motore/caso";
import { type Bus, SR } from "./sintesi";

const idx = (t: number) => Math.round(t * SR);

/** Filtro passa-banda (RBJ), stato incluso. */
class PassaBanda {
  private b0: number;
  private b2: number;
  private a1: number;
  private a2: number;
  private x1 = 0;
  private x2 = 0;
  private y1 = 0;
  private y2 = 0;
  constructor(f: number, q: number) {
    const w = (2 * Math.PI * f) / SR;
    const al = Math.sin(w) / (2 * q);
    const a0 = 1 + al;
    this.b0 = al / a0;
    this.b2 = -al / a0;
    this.a1 = (-2 * Math.cos(w)) / a0;
    this.a2 = (1 - al) / a0;
  }
  passa(x: number): number {
    const y = this.b0 * x + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1;
    this.x1 = x;
    this.y2 = this.y1;
    this.y1 = y;
    return y;
  }
}

/** Un colpo sordo (zampa sull'erba, passo pesante): seno che cala + il fruscio dell'erba schiacciata. */
function tonfo(bus: Bus, t: number, vol: number, f = 70, durata = 0.22, seme = 1, pan = 0): void {
  const i0 = idx(t);
  const n = idx(durata);
  const r = mulberry32(seme);
  const erba = new PassaBanda(1400, 0.9);
  let fase = 0;
  for (let i = 0; i < n; i++) {
    const tt = i / SR;
    fase += (2 * Math.PI * f * 1.8 * (1 + 0.5 * Math.exp(-tt * 40))) / SR;
    const e = Math.exp(-tt * (12 / durata) * 0.35) * Math.min(1, (n - i) / 240);
    const fruscio = erba.passa(r() * 2 - 1) * Math.exp(-tt * 30);
    bus.add(i0 + i, (Math.sin(fase) * 0.45 + fruscio * 0.9) * e * vol * 0.5, pan);
  }
}

/** Rumore colorato con inviluppo: la materia di fruscii, spruzzi, schiocchi. */
function soffio(bus: Bus, t: number, durata: number, vol: number, fc: number, q: number, seme: number, inviluppo: (k: number) => number, pan = 0): void {
  const i0 = idx(t);
  const n = idx(durata);
  const r = mulberry32(seme);
  const bp = new PassaBanda(fc, q);
  for (let i = 0; i < n; i++) {
    const y = bp.passa(r() * 2 - 1);
    bus.add(i0 + i, y * vol * inviluppo(i / n), pan);
  }
}

export function effetto(bus: Bus, nome: string, t: number, vol = 1, durata?: number, ritmo?: number): void {
  const seme = fnv1a32(nome + "@" + t.toFixed(3));
  const r = casoN(seme);
  switch (nome) {
    case "galoppo": {
      // due appoggi ravvicinati per ciclo (anteriori, posteriori), leggeri
      const d = durata ?? 1;
      const hzCiclo = ritmo ?? 1.2;
      for (let k = 0; k * (1 / hzCiclo) < d; k++) {
        const t0 = t + k / hzCiclo;
        tonfo(bus, t0, vol * 0.5, 110, 0.12, seme + k * 4, -0.1);
        tonfo(bus, t0 + 0.07, vol * 0.4, 120, 0.1, seme + k * 4 + 1, 0.1);
        tonfo(bus, t0 + 0.42 / hzCiclo, vol * 0.55, 95, 0.14, seme + k * 4 + 2, -0.05);
        tonfo(bus, t0 + 0.48 / hzCiclo, vol * 0.45, 100, 0.12, seme + k * 4 + 3, 0.05);
      }
      break;
    }
    case "passi": {
      // i passi di Rocco: pesanti ma attutiti dall'erba
      const d = durata ?? 1;
      const hzPasso = ritmo ?? 1.7;
      for (let k = 0; k * (1 / hzPasso) < d; k++) {
        tonfo(bus, t + k / hzPasso + r.segno(0.02), vol * (0.8 + 0.2 * (k % 2)), 52, 0.3, seme + k, k % 2 ? 0.15 : -0.15);
      }
      break;
    }
    case "schiocco": {
      // il martin pescatore buca il lago: plop + spruzzo
      const i0 = idx(t);
      let fase = 0;
      for (let i = 0; i < idx(0.12); i++) {
        const tt = i / SR;
        fase += (2 * Math.PI * (1400 * Math.exp(-tt * 28) + 260)) / SR;
        bus.add(i0 + i, Math.sin(fase) * Math.exp(-tt * 30) * vol * 0.5, -0.3);
      }
      soffio(bus, t + 0.01, 0.6, vol * 0.9, 3200, 0.8, seme, (k) => Math.exp(-k * 7) * (1 - Math.exp(-k * 80)), -0.3);
      break;
    }
    case "gazza": {
      // «tchak-tchak»: raffiche di colpi rauchi
      const d = durata ?? 1.5;
      let tt = t;
      let k = 0;
      while (tt < t + d) {
        const q = r.intero(2, 4);
        for (let j = 0; j < q; j++) soffio(bus, tt + j * 0.085, 0.06, vol * 0.7, r.tra(2200, 3400), 3, seme + k * 7 + j, (u) => Math.sin(Math.PI * u) ** 0.5, 0.35);
        tt += q * 0.085 + r.tra(0.12, 0.3);
        k++;
      }
      break;
    }
    case "luccichio": {
      // un sassolino che riflette il sole: un "tic" piccolo e secco, niente campanelle
      soffio(bus, t, 0.03, vol * 0.35, 5200, 6, seme, (u) => Math.exp(-u * 8), 0.4);
      break;
    }
    case "frullo": {
      // ali che battono: rumore modulato a ~18 Hz
      soffio(bus, t, 0.45, vol * 0.8, 900, 0.7, seme, (u) => (0.5 + 0.5 * Math.sin(u * 0.45 * 18 * 2 * Math.PI)) * Math.sin(Math.PI * u), 0.3);
      break;
    }
    case "stormo": {
      for (let k = 0; k < 16; k++) {
        const t0 = t + r.tra(0, 1.4);
        soffio(bus, t0, 0.4, vol * 0.35, r.tra(700, 1300), 0.8, seme + k, (u) => (0.5 + 0.5 * Math.sin(u * 0.4 * r.tra(14, 22) * 2 * Math.PI)) * Math.sin(Math.PI * u), r.segno(0.8) - 0.3);
      }
      break;
    }
    case "crack": {
      // il ramo secco che esplode: schiocco largo + risonanze di legno
      soffio(bus, t, 0.09, vol * 2.2, 2500, 0.5, seme, (u) => Math.exp(-u * 5), 0.2);
      const i0 = idx(t);
      for (const [f, a, dec] of [
        [620, 0.35, 28],
        [1180, 0.25, 36],
        [1930, 0.18, 44],
      ] as const) {
        let fase = 0;
        for (let i = 0; i < idx(0.25); i++) {
          fase += (2 * Math.PI * f) / SR;
          bus.add(i0 + i, Math.sin(fase) * Math.exp(-(i / SR) * dec) * a * vol, 0.2);
        }
      }
      soffio(bus, t + 0.04, 0.35, vol * 0.6, 1200, 0.9, seme + 3, (u) => Math.exp(-u * 6), 0.1);
      break;
    }
    case "zampa": {
      tonfo(bus, t, vol * 0.5, 140, 0.12, seme, 0);
      soffio(bus, t, 0.2, vol * 0.25, 1600, 0.7, seme + 1, (u) => Math.exp(-u * 9), 0);
      break;
    }
    case "fruscio": {
      soffio(bus, t, durata ?? 1.2, vol * 0.35, 2600, 0.6, seme, (u) => Math.sin(Math.PI * u) * (0.6 + 0.4 * Math.sin(u * 40)), 0);
      break;
    }
    case "gonfia": {
      // Zara che si gonfia: un piccolo "fff" che sale
      const i0 = idx(t);
      const n = idx(0.35);
      const rr = mulberry32(seme);
      let lp = 0;
      for (let i = 0; i < n; i++) {
        const u = i / n;
        const a = 0.05 + 0.25 * u;
        lp = lp * (1 - a) + (rr() - 0.5) * a;
        bus.add(i0 + i, lp * Math.sin(Math.PI * u) * vol * 1.4, -0.2);
      }
      break;
    }
    case "fischio": {
      // la marmotta: fischio puro, acuto, che scende appena
      const d = durata ?? 0.5;
      const i0 = idx(t);
      const n = idx(d);
      let fase = 0;
      for (let i = 0; i < n; i++) {
        const u = i / n;
        fase += (2 * Math.PI * (2750 - 180 * u)) / SR;
        const e = Math.min(1, u * 30, (1 - u) * 12);
        bus.add(i0 + i, Math.sin(fase) * e * vol * 0.3, -0.4);
      }
      break;
    }
    case "tuono":
    case "tuono-lontano": {
      // aria che rimbomba: rumore scurissimo con un'onda lenta di colpi
      const lontano = nome === "tuono-lontano";
      const d = lontano ? 3.2 : 4.2;
      const i0 = idx(t + (lontano ? 0.3 : 0.05));
      const n = idx(d);
      const rr = mulberry32(seme);
      let lp1 = 0;
      let lp2 = 0;
      const a1 = lontano ? 0.012 : 0.03;
      for (let i = 0; i < n; i++) {
        const u = i / n;
        lp1 += (rr() * 2 - 1 - lp1) * a1;
        lp2 += (lp1 - lp2) * a1;
        const onde = 0.55 + 0.45 * frattale1(u * 9, 3, seme % 1000);
        const e = Math.min(1, u * (lontano ? 8 : 40)) * Math.exp(-u * 3.2) * onde;
        const colpo = !lontano && u < 0.03 ? (rr() * 2 - 1) * (1 - u / 0.03) * 0.25 : 0;
        bus.add(i0 + i, (lp2 * 14 + colpo) * e * vol * (lontano ? 0.35 : 0.6), 0.1);
      }
      break;
    }
    case "giunco": {
      soffio(bus, t, 0.06, vol * 0.9, 3600, 2, seme, (u) => Math.exp(-u * 6), -0.2);
      soffio(bus, t + 0.05, 0.3, vol * 0.25, 1800, 0.8, seme + 1, (u) => Math.exp(-u * 5), -0.2);
      break;
    }
    default:
      break;
  }
}

// ---------------------------------------------------------------- ambiente --
export interface Aria {
  vento: number;
  pioggia: number;
  lago: number;
}

/**
 * Il fondo continuo: vento, sciabordio del lago, pioggia. `aria(t)` dice quanto
 * di ciascuno c'è a ogni istante (il copione lo dichiara per inquadratura).
 */
export function ambiente(bus: Bus, aria: (t: number) => Aria, seme = 11): void {
  const r = mulberry32(seme);
  let b1 = 0;
  let b2 = 0; // vento: rumore marrone filtrato
  let lagoLp = 0;
  let hp = 0;
  let prec = 0;
  const bpVento = new PassaBanda(420, 0.6);
  const gocce: { i: number; v: number }[] = [];
  let a: Aria = aria(0);
  for (let i = 0; i < bus.n; i++) {
    if (i % 480 === 0) a = aria(i / SR); // aggiornato ogni 10 ms
    const tt = i / SR;
    const w = r() * 2 - 1;
    // vento: raffiche lente
    b1 += (w - b1) * 0.02;
    b2 += (b1 - b2) * 0.05;
    const raffica = 0.55 + 0.45 * frattale1(tt * 0.35, 3, 5);
    const vento = bpVento.passa(b2 * 8) * a.vento ** 1.6 * raffica * 0.55;
    // lago: sciabordio (rumore basso che pulsa piano)
    lagoLp += (w - lagoLp) * 0.008;
    const onda = Math.max(0, frattale1(tt * 0.6, 2, 17)) ** 1.5;
    const lago = lagoLp * onda * a.lago * 1.8;
    // pioggia: fruscio chiaro + gocce
    hp = w - prec;
    prec = w;
    const pioggia = hp * 0.05 * a.pioggia;
    if (a.pioggia > 0.05 && r() < a.pioggia * 0.0016) gocce.push({ i, v: r() * 0.25 });
    bus.add(i, vento + lago + pioggia, Math.sin(tt * 0.2) * 0.3);
  }
  // le gocce: piccoli tic sparsi
  for (const g of gocce) {
    for (let k = 0; k < 120; k++) bus.add(g.i + k, Math.sin(k * 0.9) * Math.exp(-k / 25) * g.v * 0.2, ((g.i % 7) - 3) / 4);
  }
}
