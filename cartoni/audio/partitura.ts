// cartoni/audio/partitura.ts — il suonatore: una partitura scritta come dati.
//
// La musica di un episodio è una lista di SEZIONI agganciate alle
// inquadrature (da quale a quale): se il montaggio cambia — o le voci
// allungano una scena — la musica la segue. Ogni sezione dice il tempo, gli
// accordi, come suona l'arpa, se c'è una melodia al flauto (da che battito),
// il basso (le radici, o un ostinato: i passi di qualcuno), i timpani; e, se
// serve, un controcanto (una seconda melodia, dall'altra parte).
// L'episodio scrive solo i dati (episodi/<id>/partitura.ts); qui si suona.

import { type Episodio, scaletta } from "../motore/montaggio";
import { Bus, arpa, basso, flauto, pad, timpano } from "./sintesi";

/** [battito, durata in battiti, nota MIDI] */
export type Nota = readonly [number, number, number];

/** Gli accordi che il suonatore conosce (note MIDI, dal basso). */
export const ACCORDI: Record<string, readonly number[]> = {
  D: [50, 57, 62, 66],
  Bm: [47, 54, 59, 62],
  G: [43, 55, 59, 62],
  A: [45, 52, 57, 61],
  Em: [40, 52, 55, 59],
  Dm: [50, 57, 62, 65],
  Bb: [46, 53, 58, 62],
  Gm: [43, 55, 58, 62],
  D5: [38, 45, 50, 57, 64],
  Dmaj9: [50, 57, 61, 64, 69],
  Bsus: [47, 52, 59, 61],
};

export interface Sezione {
  /** dalla prima all'ultima inquadratura (id) */
  da: string;
  a: string;
  bpm: number;
  accordi: string[];
  /** battiti per accordo */
  bpa: number;
  arpa?: "salita" | "rado" | "staccato";
  melodia?: Nota[];
  /** da che battito parte la melodia */
  attacco?: number;
  /** una seconda voce al flauto, dall'altra parte (ep03: i due riflessi), e da che battito parte */
  controcanto?: Nota[];
  attaccoControcanto?: number;
  /** basso: le radici degli accordi, o un ostinato (note MIDI, una per battito) */
  basso?: "radici" | readonly number[];
  timpani?: "cuore" | "rulli";
  /** volume generale della sezione */
  vel?: number;
  /** ritardo d'ingresso (s) dall'inizio della prima inquadratura */
  ritardo?: number;
}

/** Suona una sezione tra t0 e t1 (secondi) sul bus. */
export function suonaSezione(bus: Bus, z: Sezione, t0: number, t1: number): void {
  const beat = 60 / z.bpm;
  const v = z.vel ?? 1;
  const inizio = t0 + (z.ritardo ?? 0);
  const nBattiti = Math.floor((t1 - inizio) / beat);
  // accordi: il pad tiene, l'arpa disegna
  for (let b = 0, k = 0; b < nBattiti; b += z.bpa, k++) {
    const nome = z.accordi[k % z.accordi.length];
    const acc = ACCORDI[nome];
    const ta = inizio + b * beat;
    const dur = Math.min(z.bpa, nBattiti - b) * beat;
    pad(bus, ta, acc, dur, 0.85 * v, 0, Math.min(1.2, dur * 0.4), 1.4);
    if (z.basso === "radici") basso(bus, ta, acc[0] - 12 >= 28 ? acc[0] - 12 : acc[0], 0.8 * v, dur);
    const alti = [...acc.slice(1), ...acc.slice(1).map((m) => m + 12)];
    if (z.arpa === "salita") {
      const giro = [...alti, ...alti.slice(1, -1).reverse()];
      for (let s = 0; s < z.bpa * 2 && b + s / 2 < nBattiti; s++) arpa(bus, ta + (s * beat) / 2, giro[s % giro.length], 0.55 * v, ((s % 4) - 1.5) * 0.25);
    } else if (z.arpa === "rado") {
      for (let s = 0; s < z.bpa && b + s < nBattiti; s += 2) arpa(bus, ta + s * beat, alti[(k * 3 + s) % alti.length] + 12, 0.65 * v, 0.3, 3);
    } else if (z.arpa === "staccato") {
      for (let s = 0; s < z.bpa * 4 && b + s / 4 < nBattiti; s++) {
        if (s % 4 === 3) continue;
        arpa(bus, ta + (s * beat) / 4, alti[(s * 2 + k) % alti.length] + 12, 0.4 * v, 0.4, 0.5);
      }
    }
  }
  // un ostinato nel basso (i passi di qualcuno)
  if (Array.isArray(z.basso)) {
    const o = z.basso as readonly number[];
    for (let b = 0; b < nBattiti; b++) basso(bus, inizio + b * beat, o[b % o.length], 0.75 * v, beat * 0.9);
  }
  // timpani: il cuore che batte (attesa) o i rulli del temporale
  if (z.timpani === "cuore") {
    for (let b = 0; b < nBattiti; b++) {
      timpano(bus, inizio + b * beat, 35, 0.35 * v, b);
      timpano(bus, inizio + b * beat + beat * 0.28, 35, 0.2 * v, b + 99);
    }
  } else if (z.timpani === "rulli") {
    for (let b = 0; b < nBattiti; b += 4) {
      for (let r = 0; r < 8; r++) timpano(bus, inizio + (b + 2) * beat + r * beat * 0.125, 38, (0.08 + r * 0.03) * v, b * 10 + r);
      timpano(bus, inizio + (b + 3) * beat, 38, 0.45 * v, b + 7);
    }
  }
  // la melodia al flauto
  if (z.melodia) {
    const a = z.attacco ?? 0;
    let seme = 1;
    for (const [bb, d, m] of z.melodia) {
      const tn = inizio + (a + bb) * beat;
      if (tn + d * beat > t1 + 0.5) break;
      flauto(bus, tn, m, d * beat * 0.95, 0.8 * v, -0.15, seme++);
    }
  }
  // il controcanto: la stessa voce, un po' più piano, dall'altra parte
  if (z.controcanto) {
    const a = z.attaccoControcanto ?? z.attacco ?? 0;
    let seme = 101;
    for (const [bb, d, m] of z.controcanto) {
      const tn = inizio + (a + bb) * beat;
      if (tn + d * beat > t1 + 0.5) break;
      flauto(bus, tn, m, d * beat * 0.95, 0.66 * v, 0.3, seme++);
    }
  }
}

/** La musica di un episodio da una lista di sezioni: `export default suona(SEZIONI)`. */
export function suona(sezioni: readonly Sezione[]): (bus: Bus, ep: Episodio) => void {
  return (bus, ep) => {
    const sc = scaletta(ep);
    const dove = (id: string) => sc.find((p) => p.q.id === id);
    for (const z of sezioni) {
      const a = dove(z.da);
      const b = dove(z.a);
      if (!a || !b) continue;
      suonaSezione(bus, z, a.inizio, b.fine);
    }
  };
}
