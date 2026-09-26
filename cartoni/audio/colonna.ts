// cartoni/audio/colonna.ts — la colonna sonora: musica + effetti + ambiente + voci.
//
// Legge l'episodio (suoni e ambienti dichiarati inquadratura per inquadratura),
// suona la partitura, mescola, e restituisce un bus stereo pronto da scrivere
// in WAV. Quando qualcuno parla la musica si fa da parte (e un poco anche gli
// effetti): più per la narratrice, meno per il grammelot.
// Tutto deterministico: stesso copione (e stesse riprese) → stessi campioni.

import { type Episodio, ambienti, durata, suoni } from "../motore/montaggio";
import { smooth } from "../motore/tempo";
import { type Aria, ambiente, effetto } from "./effetti";
import { Bus, SR, riverbero } from "./sintesi";

/** Chi parla e quando (per far posto alle voci). */
export interface Parlato {
  tg: number;
  durata: number;
  tipo: "battuta" | "narrazione";
}

export interface OpzColonna {
  musica: (bus: Bus, ep: Episodio) => void;
  volMusica?: number;
  volEffetti?: number;
  volAmbiente?: number;
  /** Le voci già suonate sul loro bus (grammelot e narratrice) e i loro tempi. */
  voci?: { bus: Bus; parlato: readonly Parlato[] };
  /** I brani (canzoni registrate) già messi al loro posto: vanno con la musica, senza il suo riverbero. */
  brani?: Bus;
  volBrani?: number;
  volVoci?: number;
}

/**
 * Quanto si abbassa il resto quando si parla, istante per istante (0..1 di
 * "posto fatto"): 1 durante la narratrice, 0.6 durante una battuta; sale in
 * 0.15 s e torna giù in 0.6 s (niente pompaggi).
 */
export function posto(parlato: readonly Parlato[], n: number): Float32Array {
  const bersaglio = new Float32Array(n);
  for (const p of parlato) {
    const k = p.tipo === "narrazione" ? 1 : 0.6;
    const i0 = Math.max(0, Math.round((p.tg - 0.1) * SR));
    const i1 = Math.min(n, Math.round((p.tg + p.durata + 0.15) * SR));
    for (let i = i0; i < i1; i++) bersaglio[i] = Math.max(bersaglio[i], k);
  }
  const su = 1 - Math.exp(-1 / (0.15 * SR));
  const giu = 1 - Math.exp(-1 / (0.6 * SR));
  let d = 0;
  for (let i = 0; i < n; i++) {
    const b = bersaglio[i];
    d += (b - d) * (b > d ? su : giu);
    bersaglio[i] = d;
  }
  return bersaglio;
}

/** L'aria a ogni istante: l'ambiente dell'inquadratura, sfumato sui cambi. */
function ariaDi(ep: Episodio): (t: number) => Aria {
  const as = ambienti(ep);
  const norma = (a: (typeof as)[number]["a"]): Aria => ({ vento: a.vento ?? 0.3, pioggia: a.pioggia ?? 0, lago: a.lago ?? 0, grilli: a.grilli ?? 0 });
  return (t: number) => {
    let i = as.findIndex((x) => t >= x.inizio && t < x.fine);
    if (i < 0) i = as.length - 1;
    const cur = norma(as[i].a);
    if (i === 0) return cur;
    const k = smooth((t - as[i].inizio) / 0.8);
    const prec = norma(as[i - 1].a);
    return {
      vento: prec.vento + (cur.vento - prec.vento) * k,
      pioggia: prec.pioggia + (cur.pioggia - prec.pioggia) * k,
      lago: prec.lago + (cur.lago - prec.lago) * k,
      grilli: prec.grilli! + (cur.grilli! - prec.grilli!) * k,
    };
  };
}

export function colonna(ep: Episodio, o: OpzColonna): Bus {
  const tot = durata(ep);
  const musica = new Bus(tot + 2);
  o.musica(musica, ep);
  const musicaR = riverbero(musica, 0.3, 0.84, 0.35);
  // i brani hanno già la loro stanza: si aggiungono alla musica dopo il riverbero
  if (o.brani) musicaR.mescola(o.brani, o.volBrani ?? 1);

  const fx = new Bus(tot + 5);
  for (const s of suoni(ep)) effetto(fx, s.nome, s.tg, s.vol ?? 1, s.durata, s.ritmo);
  const fxR = riverbero(fx, 0.12, 0.7, 0.4);

  const amb = new Bus(tot + 1);
  ambiente(amb, ariaDi(ep));

  const out = new Bus(tot);
  if (o.voci && o.voci.parlato.length) {
    // la musica cala di ~8 dB sotto la narratrice (~5 sotto il grammelot), gli effetti di ~2, l'ambiente di ~3
    const d = posto(o.voci.parlato, out.n);
    const gm = o.volMusica ?? 1;
    const gf = o.volEffetti ?? 0.9;
    const ga = o.volAmbiente ?? 0.55;
    const gv = o.volVoci ?? 1;
    const vb = o.voci.bus;
    for (let i = 0; i < out.n; i++) {
      const k = d[i];
      const m = gm * (1 - 0.6 * k);
      const f = gf * (1 - 0.22 * k);
      const a = ga * (1 - 0.3 * k);
      out.l[i] = (i < musicaR.n ? musicaR.l[i] * m : 0) + (i < fxR.n ? fxR.l[i] * f : 0) + (i < amb.n ? amb.l[i] * a : 0) + (i < vb.n ? vb.l[i] * gv : 0);
      out.r[i] = (i < musicaR.n ? musicaR.r[i] * m : 0) + (i < fxR.n ? fxR.r[i] * f : 0) + (i < amb.n ? amb.r[i] * a : 0) + (i < vb.n ? vb.r[i] * gv : 0);
    }
  } else {
    out.mescola(musicaR, o.volMusica ?? 1);
    out.mescola(fxR, o.volEffetti ?? 0.9);
    out.mescola(amb, o.volAmbiente ?? 0.55);
  }

  // apertura e chiusura come il video (0.6 s dal nero, 1.2 s al nero)
  const nIn = Math.round(0.6 * SR);
  const nOut = Math.round(1.2 * SR);
  for (let i = 0; i < out.n; i++) {
    let g = 1;
    if (i < nIn) g = smooth(i / nIn);
    if (i > out.n - nOut) g = Math.min(g, smooth((out.n - i) / nOut));
    out.l[i] *= g;
    out.r[i] *= g;
  }
  // normalizza al picco e ammorbidisce gli estremi (niente distorsioni)
  let picco = 1e-9;
  for (let i = 0; i < out.n; i++) picco = Math.max(picco, Math.abs(out.l[i]), Math.abs(out.r[i]));
  const g = 0.92 / picco;
  for (let i = 0; i < out.n; i++) {
    out.l[i] = Math.tanh(out.l[i] * g * 1.1) / Math.tanh(1.1);
    out.r[i] = Math.tanh(out.r[i] * g * 1.1) / Math.tanh(1.1);
  }
  return out;
}

/** Il bus come WAV PCM 16 bit stereo. */
export function wav(bus: Bus): Uint8Array {
  const n = bus.n;
  const dati = n * 4;
  const buf = new ArrayBuffer(44 + dati);
  const v = new DataView(buf);
  const scrivi = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
  };
  scrivi(0, "RIFF");
  v.setUint32(4, 36 + dati, true);
  scrivi(8, "WAVE");
  scrivi(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 2, true);
  v.setUint32(24, SR, true);
  v.setUint32(28, SR * 4, true);
  v.setUint16(32, 4, true);
  v.setUint16(34, 16, true);
  scrivi(36, "data");
  v.setUint32(40, dati, true);
  for (let i = 0, o = 44; i < n; i++, o += 4) {
    v.setInt16(o, Math.max(-32767, Math.min(32767, Math.round(bus.l[i] * 32767))), true);
    v.setInt16(o + 2, Math.max(-32767, Math.min(32767, Math.round(bus.r[i] * 32767))), true);
  }
  return new Uint8Array(buf);
}
