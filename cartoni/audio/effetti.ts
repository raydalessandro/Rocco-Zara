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
    case "folaga": {
      // il verso della folaga (ep02, p.1): due «pitt» secchi, metallici, sull'acqua
      for (const [dt, f0] of [[0, 1350], [0.26, 1250]] as const) {
        const i0 = idx(t + dt);
        let fase = 0;
        for (let i = 0; i < idx(0.13); i++) {
          const tt = i / SR;
          const f = f0 * (1 - tt * 2.2);
          fase += (2 * Math.PI * f) / SR;
          const e = Math.min(1, tt * 400) * Math.exp(-tt * 22);
          bus.add(i0 + i, (Math.sin(fase) + 0.4 * Math.sin(2 * fase) + 0.2 * Math.sin(3 * fase)) * e * vol * 0.22, -0.35);
        }
      }
      break;
    }
    case "toc": {
      // due colpetti col palmo sul bordo della barca: «tòc tòc» (ep02, p.5 e p.14)
      for (const [k, dt] of [[0, 0], [1, 0.24]] as const) {
        const i0 = idx(t + dt);
        let fase = 0;
        for (let i = 0; i < idx(0.09); i++) {
          const tt = i / SR;
          fase += (2 * Math.PI * (330 + 90 * Math.exp(-tt * 60))) / SR;
          bus.add(i0 + i, Math.sin(fase) * Math.exp(-tt * 55) * vol * 0.55, 0.15);
        }
        soffio(bus, t + dt, 0.04, vol * 0.5, 2400, 1.2, seme + k, (u) => Math.exp(-u * 9), 0.15);
      }
      break;
    }
    case "remo": {
      // un colpo di remo: la pala entra, l'acqua gira, gocciola
      const d = durata ?? 1;
      const hz = ritmo ?? 0.55;
      for (let k = 0; k * (1 / hz) < d; k++) {
        const t0 = t + k / hz;
        soffio(bus, t0, 0.55, vol * 0.5, 700, 0.9, seme + k * 3, (u) => Math.sin(Math.PI * Math.min(1, u * 1.4)) * (1 - u * 0.6), 0.25);
        soffio(bus, t0 + 0.45, 0.35, vol * 0.25, 2600, 1.6, seme + k * 3 + 1, (u) => Math.exp(-u * 5), 0.3);
        for (let j = 0; j < 3; j++) {
          const tg = t0 + 0.55 + j * 0.13 + r.tra(0, 0.05);
          const i0 = idx(tg);
          let fase = 0;
          for (let i = 0; i < idx(0.05); i++) {
            const tt = i / SR;
            fase += (2 * Math.PI * (900 + 1400 * Math.exp(-tt * 70))) / SR;
            bus.add(i0 + i, Math.sin(fase) * Math.exp(-tt * 60) * vol * 0.12, 0.3);
          }
        }
      }
      break;
    }
    case "legno": {
      // la barca che s'inclina e decide di reggere: uno scricchiolio lungo, basso
      const d = durata ?? 0.9;
      const i0 = idx(t);
      const n = idx(d);
      const bp = new PassaBanda(260, 3);
      let fase = 0;
      for (let i = 0; i < n; i++) {
        const u = i / n;
        fase += (2 * Math.PI * (38 + 18 * Math.sin(u * 9))) / SR;
        const graffio = Math.sin(fase) > 0.93 ? 1 : 0; // i piccoli scatti del legno
        const y = bp.passa((r() * 2 - 1) * (0.3 + graffio));
        bus.add(i0 + i, y * Math.sin(Math.PI * u) * vol * 0.9, 0);
      }
      break;
    }
    case "giunco": {
      soffio(bus, t, 0.06, vol * 0.9, 3600, 2, seme, (u) => Math.exp(-u * 6), -0.2);
      soffio(bus, t + 0.05, 0.3, vol * 0.25, 1800, 0.8, seme + 1, (u) => Math.exp(-u * 5), -0.2);
      break;
    }
    case "tec": {
      // un colpetto secco, di becco su legno (ep03, p.4 e p.12): un «tec» solo; con
      // `durata`, tanti, piccoli e fitti («tec, tec»), a intervalli mai uguali
      const colpi: number[] = [0];
      for (let dt = r.tra(0.16, 0.24); dt < (durata ?? 0); dt += r.tra(0.13, 0.3)) colpi.push(dt);
      colpi.forEach((dt, k) => {
        const v = vol * (k === 0 ? 1 : r.tra(0.55, 0.9));
        const i0 = idx(t + dt);
        let f1 = 0;
        let f2 = 0;
        for (let i = 0; i < idx(0.05); i++) {
          const s = i / SR;
          f1 += (2 * Math.PI * 1180) / SR;
          f2 += (2 * Math.PI * 2650) / SR;
          bus.add(i0 + i, (Math.sin(f1) * Math.exp(-s * 150) * 0.55 + Math.sin(f2) * Math.exp(-s * 240) * 0.35) * v * 0.5, -0.3);
        }
        soffio(bus, t + dt, 0.014, v * 0.9, 4200, 1.4, seme + k, (u) => Math.exp(-u * 4), -0.3);
      });
      break;
    }
    case "russare": {
      // qualcuno di piccolo che russa di gusto (ep03, p.12): lungo e pari — dentro il
      // ronfo (il palato che vibra: colpetti fitti dentro una formante), fuori un soffio
      const d = durata ?? 6;
      const periodo = 1 / (ritmo ?? 0.32);
      for (let k = 0; k * periodo < d; k++) {
        const t0 = t + k * periodo;
        const rr = mulberry32(seme + k * 7);
        const f1 = new PassaBanda(560, 2.2);
        const f2 = new PassaBanda(1250, 3);
        const i0 = idx(t0);
        const n = idx(1.3);
        const passo = SR / r.tra(26, 31);
        for (let i = 0; i < n; i++) {
          const u = i / n;
          const colpo = Math.exp(-((i % passo) / SR) * 260); // un colpetto a ogni vibrazione del palato
          const x = (rr() * 2 - 1) * colpo;
          const e = Math.sin(Math.PI * u) ** 0.8;
          bus.add(i0 + i, (f1.passa(x) * 1.2 + f2.passa(x) * 0.5) * e * vol * 0.7, 0.35);
        }
        soffio(bus, t0 + 1.45, 0.95, vol * 0.18, 1700, 1.1, seme + k * 7 + 1, (u) => Math.sin(Math.PI * u) ** 1.5, 0.35);
      }
      break;
    }
    case "sasso": {
      // una zampa che si posa su una pietra e SUONA (ep03, p.6): le unghie che toccano,
      // la pietra che risponde sorda, un filo di graniglia
      soffio(bus, t, 0.012, vol * 0.8, 4600, 1.6, seme, (u) => Math.exp(-u * 3), 0);
      const i0 = idx(t + 0.004);
      let fase = 0;
      for (let i = 0; i < idx(0.07); i++) {
        const s = i / SR;
        fase += (2 * Math.PI * (210 + 60 * Math.exp(-s * 80))) / SR;
        bus.add(i0 + i, Math.sin(fase) * Math.exp(-s * 70) * vol * 0.45, 0);
      }
      soffio(bus, t + 0.01, 0.09, vol * 0.25, 2200, 0.9, seme + 1, (u) => Math.exp(-u * 5), 0);
      break;
    }
    case "soffio": {
      // un soffio: l'aria di chi passa leggero (il camoscio sui Massi, ep03 p.7)
      soffio(bus, t, durata ?? 0.5, vol * 0.3, 900, 0.7, seme, (u) => Math.sin(Math.PI * u) ** 2, 0);
      break;
    }
    case "asse": {
      // un'asse di passerella che canta sotto un passo: uno scricchiolio breve, più alto del «legno»
      const d = durata ?? 0.35;
      const i0 = idx(t);
      const n = idx(d);
      const bp = new PassaBanda(640, 4);
      let fase = 0;
      for (let i = 0; i < n; i++) {
        const u = i / n;
        fase += (2 * Math.PI * (70 + 40 * Math.sin(u * 7))) / SR;
        const graffio = Math.sin(fase) > 0.9 ? 1 : 0;
        const y = bp.passa((r() * 2 - 1) * (0.25 + graffio));
        bus.add(i0 + i, y * Math.sin(Math.PI * u) * vol * 1.1, 0.1);
      }
      break;
    }
    case "fiato": {
      // la marmotta dopo una notte di fischi (ep04, p.19): «senza fischio, solo fiato» —
      // la stessa curva del fischio, ma d'aria
      const d = durata ?? 0.5;
      const i0 = idx(t);
      const n = idx(d);
      const rr = mulberry32(seme);
      const bp = new PassaBanda(2600, 7);
      for (let i = 0; i < n; i++) {
        const u = i / n;
        const e = Math.min(1, u * 20, (1 - u) * 8);
        bus.add(i0 + i, bp.passa(rr() * 2 - 1) * e * vol * 0.9, -0.4);
      }
      break;
    }
    case "crollo": {
      // un angolo di tana che cede (ep04, p.4): la terra bagnata che si stacca, scivola e cade in acqua
      tonfo(bus, t, vol * 0.8, 55, 0.45, seme, 0.2);
      soffio(bus, t, 0.5, vol * 0.5, 900, 0.8, seme + 1, (u) => Math.sin(Math.PI * Math.min(1, u * 3)) * (1 - u) * (0.6 + 0.4 * Math.sin(u * 60)), 0.2);
      effetto(bus, "schizzo", t + 0.32, vol * 0.9);
      break;
    }
    case "strillo": {
      // un piccolo che strilla (ep04, p.4: «qualcuno strillò piccolo»): un fischietto di voce, corto, che sale e ricade
      const d = durata ?? 0.3;
      const i0 = idx(t);
      const n = idx(d);
      let fase = 0;
      for (let i = 0; i < n; i++) {
        const u = i / n;
        const f = 1900 + 900 * Math.sin(Math.PI * Math.min(1, u * 1.6)) - 300 * u + 60 * Math.sin(u * 90);
        fase += (2 * Math.PI * f) / SR;
        const e = Math.min(1, u * 25, (1 - u) * 6);
        bus.add(i0 + i, (Math.sin(fase) + 0.25 * Math.sin(2 * fase)) * e * vol * 0.16, 0.3);
      }
      break;
    }
    case "schizzo": {
      // uno spruzzo: qualcosa che entra in acqua, e le gocce che ricadono
      soffio(bus, t, 0.35, vol * 0.9, 2300, 0.7, seme, (u) => Math.exp(-u * 6) * (1 - Math.exp(-u * 90)), 0.1);
      soffio(bus, t + 0.02, 0.25, vol * 0.5, 600, 0.8, seme + 1, (u) => Math.exp(-u * 8), 0.1);
      for (let j = 0; j < 4; j++) {
        const i0 = idx(t + 0.25 + j * 0.09 + r.tra(0, 0.05));
        let fase = 0;
        for (let i = 0; i < idx(0.04); i++) {
          const tt = i / SR;
          fase += (2 * Math.PI * (1100 + 1500 * Math.exp(-tt * 70))) / SR;
          bus.add(i0 + i, Math.sin(fase) * Math.exp(-tt * 70) * vol * 0.12, 0.15);
        }
      }
      break;
    }
    case "guado": {
      // i passi nell'acqua alta: il piede che entra (sordo) e l'acqua che si sposta
      const d = durata ?? 1;
      const hz = ritmo ?? 1.6;
      for (let k = 0; k * (1 / hz) < d; k++) {
        const t0 = t + k / hz + r.segno(0.02);
        tonfo(bus, t0, vol * 0.5, 60, 0.25, seme + k, k % 2 ? 0.15 : -0.15);
        soffio(bus, t0 + 0.02, 0.3, vol * 0.45, 1500, 0.8, seme + 100 + k, (u) => Math.sin(Math.PI * Math.min(1, u * 4)) * (1 - u), k % 2 ? 0.15 : -0.15);
      }
      break;
    }
    case "scheggia": {
      // il dente che stacca una scaglia dal remo (ep04, p.18): uno schiocco di legno, piccolo e secco
      soffio(bus, t, 0.03, vol * 1.4, 3400, 1, seme, (u) => Math.exp(-u * 5), 0.15);
      const i0 = idx(t + 0.004);
      for (const [f, a, dec] of [
        [1650, 0.22, 60],
        [2700, 0.14, 80],
      ] as const) {
        let fase = 0;
        for (let i = 0; i < idx(0.12); i++) {
          fase += (2 * Math.PI * f) / SR;
          bus.add(i0 + i, Math.sin(fase) * Math.exp(-(i / SR) * dec) * a * vol, 0.15);
        }
      }
      break;
    }
    case "stringe": {
      // una corda che si stringe su un nodo: le fibre che scricchiolano, un fruscio che sale
      const d = durata ?? 0.4;
      const i0 = idx(t);
      const n = idx(d);
      const rr = mulberry32(seme);
      let fase = 0;
      for (let i = 0; i < n; i++) {
        const u = i / n;
        fase += (2 * Math.PI * (20 + 30 * u)) / SR;
        const grana = Math.sin(fase) > 0.85 ? 1 : 0.2;
        bus.add(i0 + i, (rr() * 2 - 1) * grana * Math.sin(Math.PI * u) * vol * 0.12, -0.1);
      }
      soffio(bus, t, d, vol * 0.4, 1100, 3, seme + 1, (u) => Math.sin(Math.PI * u) * u, -0.1);
      break;
    }
    case "coperchio": {
      // il coperchio di corteccia della custodia che si alza: un piccolo colpo di legno e uno sfregamento
      const i0 = idx(t);
      let fase = 0;
      for (let i = 0; i < idx(0.08); i++) {
        const tt = i / SR;
        fase += (2 * Math.PI * (420 + 120 * Math.exp(-tt * 60))) / SR;
        bus.add(i0 + i, Math.sin(fase) * Math.exp(-tt * 50) * vol * 0.4, 0);
      }
      soffio(bus, t + 0.05, 0.3, vol * 0.3, 1800, 1.2, seme, (u) => Math.sin(Math.PI * u), 0);
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
  /** i grilli della notte (ep03): dove non ci sono, l'aria resta quella di sempre */
  grilli?: number;
  /** il coro delle rane (ep04): 0 zitte, a mezza voce, 1 a piena voce */
  rane?: number;
  /** l'acqua che corre forte (ep04: la piena nel varco) */
  corrente?: number;
}

/**
 * Il fondo continuo: vento, sciabordio del lago, pioggia, i grilli di notte.
 * `aria(t)` dice quanto di ciascuno c'è a ogni istante (il copione lo dichiara
 * per inquadratura).
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
  // l'acqua che corre (ep04): un rombo basso e rotto, e sopra il fruscio. Seminata a parte,
  // e solo dove c'è: altrove i campioni restano quelli di prima
  {
    const rc = mulberry32(seme * 71 + 3);
    const rombo = new PassaBanda(430, 0.7);
    const fruscio = new PassaBanda(1900, 0.9);
    let lp = 0;
    let ac: Aria = aria(0);
    for (let i = 0; i < bus.n; i++) {
      if (i % 480 === 0) ac = aria(i / SR);
      const k = ac.corrente ?? 0;
      if (k <= 0.001) continue;
      const w = rc() * 2 - 1;
      lp += (w - lp) * 0.08;
      const tt = i / SR;
      const turb = 0.55 + 0.45 * frattale1(tt * 3.1, 2, 23);
      bus.add(i, (rombo.passa(lp * 5) + fruscio.passa(w) * 0.22) * turb * k * 0.55, Math.sin(tt * 0.13) * 0.2);
    }
  }
  // le rane (ep04): dieci, ognuna con la sua voce, il suo passo e il suo posto; il «cra» è un
  // treno di colpi fitti, i «cra» vengono a serie. Chi canta già a mezza voce e chi solo a
  // piena; quando il coro riprende dopo il silenzio, ripartono tutte insieme. Seminate a parte
  {
    const rr = mulberry32(seme * 53 + 11);
    const lungR = bus.n / SR;
    for (let c = 0; c < 10; c++) {
      const fc = 520 + rr() * 480;
      const pr = 38 + rr() * 30;
      const colpi = 6 + Math.floor(rr() * 8);
      const pan = rr() * 1.6 - 0.8;
      const soglia = 0.05 + rr() * 0.5;
      const volR = 0.03 + rr() * 0.02;
      const durColpo = Math.round(0.012 * SR);
      let t0 = rr() * 1.5;
      let serie = 0;
      while (t0 < lungR) {
        const quante = aria(t0).rane ?? 0;
        if (quante <= soglia) {
          t0 += 0.05;
          serie = 0;
          continue;
        }
        const v = volR * Math.min(1, 0.4 + (quante - soglia) / 0.25);
        for (let k = 0; k < colpi; k++) {
          const i0 = Math.round((t0 + k / pr) * SR);
          const ek = Math.sin((Math.PI * (k + 0.5)) / colpi);
          let fase = 0;
          for (let i = 0; i < durColpo; i++) {
            fase += (2 * Math.PI * fc) / SR;
            bus.add(i0 + i, (Math.sin(fase) + 0.45 * Math.sin(2 * fase) + 0.2 * Math.sin(3 * fase)) * Math.exp(-(i / SR) * 260) * ek * v, pan);
          }
        }
        serie++;
        if (serie < 2 + Math.floor(rr() * 4)) t0 += 0.26 + rr() * 0.14;
        else {
          t0 += 0.8 + rr() * 1.3;
          serie = 0;
        }
      }
    }
  }
  // i grilli: pochi, ognuno col suo tono, il suo posto e il suo passo (tre o quattro
  // impulsi a canto). Seminati a parte: dove non ci sono, i campioni restano quelli di prima
  const rg = mulberry32(seme * 31 + 7);
  const lung = bus.n / SR;
  const durImp = Math.round(0.016 * SR);
  for (let c = 0; c < 5; c++) {
    const f = 4100 + rg() * 1000;
    const pan = rg() * 1.4 - 0.7;
    const passo = 0.5 + rg() * 0.6;
    const impulsi = 3 + Math.floor(rg() * 2);
    for (let t0 = rg() * passo; t0 < lung; t0 += passo * (0.85 + rg() * 0.3)) {
      const quanti = aria(t0).grilli ?? 0;
      const v = quanti * (0.45 + rg() * 0.55) * 0.035;
      if (quanti <= 0.01) continue;
      for (let k = 0; k < impulsi; k++) {
        const i0 = Math.round((t0 + k * 0.03) * SR);
        let fase = 0;
        for (let i = 0; i < durImp; i++) {
          fase += (2 * Math.PI * f) / SR;
          bus.add(i0 + i, Math.sin(fase) * Math.sin((Math.PI * i) / durImp) * v, pan);
        }
      }
    }
  }
}
