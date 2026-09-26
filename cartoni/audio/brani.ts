// cartoni/audio/brani.ts — i brani: le canzoni registrate della saga (cartoni/brani/).
//
// La musica dei cartoni è quasi tutta sintetizzata dalle partiture; i BRANI sono
// l'eccezione: canzoni vere, fatte una volta e tenute (la prima: la ninna-nanna
// della Prima Tigre, cantata come una filastrocca — fatta da Ray con Suno, 26/9/2026).
// Il registro `cartoni/brani/brani.json` dice di ogni brano il file, la durata, le
// sezioni (l'introduzione, la strofa cantata, la parte canticchiata…) e i VERSI
// col momento in cui sono cantati: così le didascalie compaiono mentre il brano
// le canta, e un episodio può usarne anche solo un pezzo (la canticchiata, per
// farla tornare senza ripetere le parole).
//
// In un'inquadratura: `brano: { id, da, dal, al }` (montaggio.ts) e le didascalie
// dei versi con `canto: id` — le fa `versiCantati`. Il brano suona a tempo vero,
// con la musica: cala sotto le voci come la partitura.

import type { Didascalia } from "../motore/didascalie";
import { type Episodio, type UsoBrano, scaletta } from "../motore/montaggio";
import { smooth } from "../motore/tempo";
import { Bus, SR } from "./sintesi";

/** Un brano del registro (cartoni/brani/brani.json). */
export interface Brano {
  file: string;
  titolo: string;
  /** secondi */
  durata: number;
  /** le parti del brano: nome → [da, a] in secondi */
  sezioni: Record<string, readonly [number, number]>;
  /** i versi cantati, in ordine, col momento in cui si cantano */
  versi: readonly { testo: string; da: number; a: number }[];
  /** da dove viene il testo (il canone) */
  testo?: string;
  fonte: string;
  licenza: string;
}

export type Brani = Record<string, Brano>;

/**
 * Le didascalie dei versi cantati, a tempo col brano: ogni verso compare un
 * attimo prima di essere cantato e resta fino al verso dopo. `uso` è il brano
 * dell'inquadratura (lo stesso oggetto, così i tempi combaciano); `righe` quali
 * versi (di norma tutti); `pagina` la pagina della prosa dove i versi stanno.
 */
export function versiCantati(id: string, brano: Brano, uso: UsoBrano, pagina: number, righe?: readonly number[], anticipo = 0.25): Didascalia[] {
  const dal = uso.dal ?? 0;
  const quali = righe ?? brano.versi.map((_, i) => i);
  return quali.map((i, k) => {
    const v = brano.versi[i];
    const prossimo = k + 1 < quali.length ? brano.versi[quali[k + 1]].da : v.a + 0.8;
    return { da: uso.da + (v.da - dal) - anticipo, a: uso.da + (prossimo - dal) - anticipo, testo: v.testo, pagina, pensiero: true, canto: id };
  });
}

/** Dove suonano i brani di un episodio (già coi tempi delle voci): tempo dell'episodio, pezzo del brano. */
export interface PostoBrano {
  id: string;
  tg: number;
  dal: number;
  al: number;
  vol: number;
  entra: number;
  esce: number;
}

export function postiDeiBrani(ep: Episodio, brani: Brani): PostoBrano[] {
  const out: PostoBrano[] = [];
  for (const p of scaletta(ep)) {
    const b = p.q.brano;
    if (!b) continue;
    const reg = brani[b.id];
    if (!reg) throw new Error(`${p.q.id}: il brano «${b.id}» non c'è in cartoni/brani/brani.json`);
    const dal = b.dal ?? 0;
    // il brano finisce dove dice `al`, o alla fine del file (anche oltre l'inquadratura:
    // la canticchiata può accompagnare le scene dopo; i versi però stanno nella sua)
    const al = Math.min(b.al ?? reg.durata, reg.durata);
    out.push({ id: b.id, tg: p.inizio + b.da, dal, al, vol: b.vol ?? 1, entra: b.entra ?? 0.4, esce: b.esce ?? 1.2 });
  }
  return out;
}

/** Suona i brani su un bus: `audio` è ogni brano già letto, stereo, a SR. */
export function suonaBrani(bus: Bus, posti: readonly PostoBrano[], audio: ReadonlyMap<string, readonly [Float32Array, Float32Array]>): void {
  for (const p of posti) {
    const a = audio.get(p.id);
    if (!a) continue;
    const i0 = Math.round(p.tg * SR);
    const s0 = Math.round(p.dal * SR);
    const n = Math.max(0, Math.min(Math.round((p.al - p.dal) * SR), a[0].length - s0));
    const nIn = Math.max(1, Math.round(p.entra * SR));
    const nOut = Math.max(1, Math.round(p.esce * SR));
    for (let i = 0; i < n; i++) {
      const j = i0 + i;
      if (j < 0 || j >= bus.n) continue;
      let g = p.vol;
      if (i < nIn) g *= smooth(i / nIn);
      if (i > n - nOut) g *= smooth((n - i) / nOut);
      bus.l[j] += a[0][s0 + i] * g;
      bus.r[j] += a[1][s0 + i] * g;
    }
  }
}
