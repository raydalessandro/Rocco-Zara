// cartoni/audio/grammelot.ts — la voce dei personaggi, fatta di numeri.
//
// Un piccolo sintetizzatore a formanti (sorgente → filtro, come la voce vera):
//  - la SORGENTE è la glottide: un'onda a impulsi morbidi (Rosenberg) che
//    segue la melodia del piano, con la grana di una voce viva (l'altezza
//    trema un poco, l'ampiezza pure) e l'aria del soffio;
//  - il FILTRO è il tratto vocale: quattro risonanze (formanti) che scivolano
//    da una vocale all'altra, più grandi o più piccole a seconda di chi parla;
//  - le CONSONANTI sono poche e morbide (m n b d g p t k l w r s sc f h v):
//    chiusure, schiocchi, fruscii — quel che basta a dare il ritmo delle
//    sillabe senza dire parole vere.
// Deterministico: il caso è seminato col testo e col nome di chi parla.

import { mulberry32, fnv1a32 } from "../motore/caso";
import type { PianoBattuta, ProfiloVoce } from "../motore/voce";
import type { Vocale } from "../motore/parola";
import { Bus, SR, riverbero } from "./sintesi";

/** Formanti di riferimento (Hz) di un tratto vocale adulto, per vocale: F1 F2 F3 F4. */
const FORMANTI: Record<Vocale, readonly [number, number, number, number]> = {
  a: [760, 1320, 2560, 3500],
  e: [480, 1860, 2560, 3500],
  i: [300, 2250, 2950, 3700],
  o: [500, 880, 2500, 3400],
  u: [330, 760, 2400, 3300],
};
const BANDE = [70, 95, 140, 200];

/** Dove "tirano" le formanti durante una consonante (luogo d'articolazione). */
function locus(c: string): readonly [number, number, number] | null {
  if ("mbpwv".includes(c)) return [260, 820, 2200];
  if ("ndtlsr".includes(c)) return [280, 1700, 2600];
  if ("gkx".includes(c)) return [300, 2000, 2400];
  return null;
}

type Modo = "nasale" | "sonora" | "sorda" | "fricativa" | "approssimante" | "vibrata" | "aspirata" | "sonoraFric";
function modo(c: string): Modo | null {
  if (!c) return null;
  if ("mn".includes(c)) return "nasale";
  if ("bdg".includes(c)) return "sonora";
  if ("ptk".includes(c)) return "sorda";
  if ("sxf".includes(c)) return "fricativa";
  if (c === "v") return "sonoraFric";
  if ("lw".includes(c)) return "approssimante";
  if (c === "r") return "vibrata";
  return "aspirata";
}

/** Banda del fruscio per le fricative e gli schiocchi: [centro Hz, larghezza Hz]. */
function bandaRumore(c: string): readonly [number, number] {
  switch (c) {
    case "s":
      return [6200, 3800];
    case "x":
      return [3200, 2200];
    case "f":
    case "v":
      return [4200, 5200];
    case "p":
    case "b":
      return [900, 1200];
    case "t":
    case "d":
      return [4200, 3000];
    case "k":
    case "g":
      return [2100, 1400];
    default:
      return [2500, 3000];
  }
}

/** Risonatore a due poli (Klatt): guadagno 1 in continua. */
class Risonatore {
  private y1 = 0;
  private y2 = 0;
  private a = 1;
  private b = 0;
  private c = 0;
  imposta(f: number, bw: number): void {
    const T = 1 / SR;
    this.c = -Math.exp(-2 * Math.PI * bw * T);
    this.b = 2 * Math.exp(-Math.PI * bw * T) * Math.cos(2 * Math.PI * Math.min(f, SR * 0.45) * T);
    this.a = 1 - this.b - this.c;
  }
  passa(x: number): number {
    const y = this.a * x + this.b * this.y1 + this.c * this.y2;
    this.y2 = this.y1;
    this.y1 = y;
    return y;
  }
}

/** Passa-banda a due poli (per i fruscii), normalizzato al picco. */
class Banda {
  private y1 = 0;
  private y2 = 0;
  private x1 = 0;
  private x2 = 0;
  private b0 = 0;
  private a1 = 0;
  private a2 = 0;
  imposta(f: number, bw: number): void {
    const w = (2 * Math.PI * Math.min(f, SR * 0.45)) / SR;
    const q = Math.max(0.3, f / bw);
    const al = Math.sin(w) / (2 * q);
    const a0 = 1 + al;
    this.b0 = al / a0;
    this.a1 = (-2 * Math.cos(w)) / a0;
    this.a2 = (1 - al) / a0;
  }
  passa(x: number): number {
    const y = this.b0 * x - this.b0 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1;
    this.x1 = x;
    this.y2 = this.y1;
    this.y1 = y;
    return y;
  }
}

/** Il segnale di una battuta (mono, 48 kHz), più una coda per l'eco. */
export function suonaBattuta(p: PianoBattuta, v: ProfiloVoce): Float32Array {
  const coda = 0.25 + (v.eco ?? 0) * 1.2;
  const n = Math.ceil((p.durata + coda) * SR);
  const out = new Float32Array(n);
  const rnd = mulberry32(fnv1a32(`grammelot/${v.id}/${p.testo}`));
  const S = p.sillabe;
  if (!S.length) return out;

  // --- le curve di controllo, campionate ogni BLOCCO campioni -----------
  const BLOCCO = 32;
  const nb = Math.ceil(n / BLOCCO) + 1;
  const F0 = new Float32Array(nb);
  const AV = new Float32Array(nb); // sonorità (glottide)
  const AN = new Float32Array(nb); // fruscio di consonante
  const AH = new Float32Array(nb); // aspirazione (dentro il tratto)
  const NAS = new Float32Array(nb); // nasalità 0..1
  const FC = new Float32Array(nb); // centro del fruscio
  const FB = new Float32Array(nb); // larghezza del fruscio
  const FT = [new Float32Array(nb), new Float32Array(nb), new Float32Array(nb), new Float32Array(nb)];
  const k = v.formanti;
  for (let b = 0; b < nb; b++) {
    const t = (b * BLOCCO) / SR;
    // la sillaba corrente (o l'ultima iniziata)
    let s = S[0];
    let j = 0;
    for (let q = 0; q < S.length; q++) {
      if (S[q].t0 <= t) {
        s = S[q];
        j = q;
      }
    }
    const dentro = t < s.t1;
    const vIn = s.t0 + s.tc;
    const m = modo(s.cons);
    // melodia dentro la sillaba: inizio → culmine → fine (morbida)
    const u = (t - s.t0) / Math.max(1e-3, s.t1 - s.t0);
    const f0 = !dentro
      ? s.f0[2]
      : u < 0.5
        ? s.f0[0] + (s.f0[1] - s.f0[0]) * (0.5 - 0.5 * Math.cos(Math.PI * u * 2))
        : s.f0[1] + (s.f0[2] - s.f0[1]) * (0.5 - 0.5 * Math.cos(Math.PI * (u - 0.5) * 2));
    F0[b] = f0;
    // formanti: la vocale, tirate verso il luogo della consonante durante la consonante
    const fv = FORMANTI[s.vocale];
    const lc = locus(s.cons);
    const inCons = t >= s.t0 && t < vIn;
    for (let q = 0; q < 4; q++) {
      let f = fv[q];
      if (inCons && lc && q < 3) f = lc[q] * 0.7 + f * 0.3;
      if (inCons && m === "nasale") f = [260, s.cons === "m" ? 1000 : 1500, 2300, 3300][q];
      FT[q][b] = f * k;
    }
    // ampiezze
    let av = 0;
    let an = 0;
    let ah = 0;
    let nas = 0;
    const [fc, fb] = bandaRumore(s.cons);
    FC[b] = fc * Math.sqrt(k);
    FB[b] = fb;
    if (dentro) {
      if (inCons) {
        const uc = (t - s.t0) / Math.max(1e-3, s.tc);
        switch (m) {
          case "nasale":
            av = 0.42 * s.amp;
            nas = 1;
            break;
          case "sonora":
            av = uc < 0.75 ? 0.07 * s.amp : 0.5 * s.amp;
            an = uc >= 0.75 ? 0.5 * s.amp : 0;
            break;
          case "sorda":
            av = 0;
            an = uc >= 0.62 && uc < 0.82 ? 0.8 * s.amp : 0;
            ah = uc >= 0.8 ? 0.35 * s.amp : 0;
            break;
          case "fricativa":
            av = 0;
            an = 0.55 * s.amp * Math.sin(Math.PI * Math.min(1, uc * 1.1));
            break;
          case "sonoraFric":
            av = 0.35 * s.amp;
            an = 0.25 * s.amp;
            break;
          case "approssimante":
            av = 0.72 * s.amp;
            break;
          case "vibrata":
            av = s.amp * (0.25 + 0.75 * Math.abs(Math.cos(Math.PI * uc * (v.grana > 0.5 ? 3 : 1.5))));
            break;
          case "aspirata":
            av = 0.12 * s.amp;
            ah = 0.45 * s.amp;
            break;
          default:
            av = s.amp;
        }
      } else {
        // la vocale: attacco morbido, e si spegne se dopo c'è una pausa
        const succ = S[j + 1];
        const pausaDopo = !succ || succ.t0 - s.t1 > 0.02;
        const att = Math.min(1, (t - vIn) / 0.03 + (s.cons ? 0.5 : 0));
        const rel = pausaDopo ? Math.min(1, (s.t1 - t) / 0.06) : 1;
        av = s.amp * Math.max(0, att) * Math.max(0, rel);
      }
    }
    // un filo d'aria sempre, dove c'è voce
    ah += av * v.soffio * 0.22;
    AV[b] = av;
    AN[b] = an;
    AH[b] = ah;
    NAS[b] = nas;
  }
  // le formanti scivolano (coarticolazione): passa-basso sulle traiettorie
  const liscia = (x: Float32Array, tau: number) => {
    const g = Math.exp(-BLOCCO / SR / tau);
    for (let b = 1; b < x.length; b++) x[b] = x[b] * (1 - g) + x[b - 1] * g;
  };
  FT.forEach((x) => liscia(x, 0.028));
  liscia(F0, 0.03);
  liscia(AV, 0.008);
  liscia(AN, 0.004);
  liscia(AH, 0.01);
  liscia(NAS, 0.012);

  // --- la sorgente e il filtro, campione per campione ----------------------
  const R = [new Risonatore(), new Risonatore(), new Risonatore(), new Risonatore()];
  const RN = new Risonatore(); // la risonanza del naso
  const B = new Banda();
  let fase = 0;
  let gPrec = 0;
  let jit = 0;
  let deriva = 0;
  let shimmer = 1;
  let lp = 0;
  let dc = 0;
  let dcIn = 0;
  const tp = 0.42;
  const tn = 0.17;
  for (let i = 0; i < n; i++) {
    const b = Math.floor(i / BLOCCO);
    const w = (i % BLOCCO) / BLOCCO;
    const lerpB = (x: Float32Array) => x[b] + (x[Math.min(nb - 1, b + 1)] - x[b]) * w;
    if (i % BLOCCO === 0) {
      for (let q = 0; q < 4; q++) R[q].imposta(FT[q][b], BANDE[q] * (0.85 + 0.3 * k));
      RN.imposta(270 * k, 120);
      B.imposta(FC[b], FB[b]);
    }
    // l'altezza: la melodia + una deriva lenta + il tremito (grana)
    deriva = deriva * 0.9995 + (rnd() - 0.5) * 0.0009;
    const f0 = lerpB(F0) * (1 + deriva * v.grana * 2 + jit + 0.004 * Math.sin((2 * Math.PI * 5.3 * i) / SR));
    fase += f0 / SR;
    if (fase >= 1) {
      fase -= 1;
      jit = (rnd() - 0.5) * 0.012 * v.grana;
      shimmer = 1 + (rnd() - 0.5) * 0.18 * v.grana;
    }
    // impulso glottale (Rosenberg) e la sua derivata
    const ph = fase;
    const g = ph < tp ? 0.5 * (1 - Math.cos((Math.PI * ph) / tp)) : ph < tp + tn ? Math.cos((Math.PI * (ph - tp)) / (2 * tn)) : 0;
    const dg = (g - gPrec) * (SR / Math.max(60, f0)) * 0.08;
    gPrec = g;
    const av = lerpB(AV);
    const rumore = rnd() * 2 - 1;
    // aspirazione modulata dall'apertura della glottide
    const asp = rumore * lerpB(AH) * (0.35 + 0.65 * g) * 0.5;
    let x = dg * av * shimmer + asp;
    // il tratto vocale: formanti in cascata
    for (let q = 0; q < 4; q++) x = R[q].passa(x);
    // le nasali: meno bocca, più naso
    const nas = lerpB(NAS);
    if (nas > 0.001) x = x * (1 - 0.75 * nas) + RN.passa(dg * av) * 0.9 * nas;
    // il fruscio delle consonanti, fuori dal tratto
    x += B.passa(rumore) * lerpB(AN) * 1.6;
    // calore: via la punta più alta, e la continua
    lp = lp + 0.42 * (x - lp);
    dc = lp - dcIn + 0.995 * dc;
    dcIn = lp;
    out[i] = dc;
  }
  // normalizza al livello di una voce (RMS sul parlato), senza toccare le proporzioni interne
  let e = 0;
  let c = 0;
  for (let i = 0; i < n; i++) {
    const a = Math.abs(out[i]);
    if (a > 1e-4) {
      e += out[i] * out[i];
      c++;
    }
  }
  const rms = Math.sqrt(e / Math.max(1, c));
  const gain = rms > 0 ? (0.12 * (v.vol ?? 1)) / rms : 0;
  for (let i = 0; i < n; i++) out[i] = Math.tanh(out[i] * gain * 1.4) / 1.4;
  // il ricordo: un'eco lontana
  const eco = v.eco ?? 0;
  if (eco > 0) {
    const d = Math.round(0.19 * SR);
    let l = 0;
    for (let i = d; i < n; i++) {
      l = l * 0.6 + out[i - d] * 0.4;
      out[i] += l * eco * 0.55;
    }
  }
  return out;
}

/** Suona tutte le battute sul bus (con un poco di stanza). */
export function battute(bus: Bus, eventi: readonly { tg: number; piano?: PianoBattuta; chi: string }[], voci: Readonly<Record<string, ProfiloVoce>>): void {
  const secco = new Bus(bus.n / SR);
  const lontano = new Bus(bus.n / SR);
  for (const e of eventi) {
    if (!e.piano) continue;
    const v = voci[e.chi];
    if (!v) continue;
    const x = suonaBattuta(e.piano, v);
    const i0 = Math.round(e.tg * SR);
    const dst = (v.eco ?? 0) > 0 ? lontano : secco;
    for (let i = 0; i < x.length; i++) dst.add(i0 + i, x[i], v.pan ?? 0);
  }
  bus.mescola(riverbero(secco, 0.14, 0.72, 0.4));
  bus.mescola(riverbero(lontano, 0.45, 0.86, 0.3));
}
