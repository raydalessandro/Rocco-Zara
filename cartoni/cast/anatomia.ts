// cartoni/cast/anatomia.ts — le ossa comuni dei pupazzi.
//
// I personaggi non sono disegni fissi: sono scheletri con la carne sopra.
// Qui ci sono i pezzi che servono a tutti i quadrupedi del cast:
//  - la cinematica inversa a due ossa (dove sta il ginocchio se la zampa
//    deve arrivare lì) — così i piedi POSANO a terra e non scivolano;
//  - il corpo tirato attorno a una spina (dorso sopra, ventre sotto);
//  - le andature (passo, corsa), con le fasi delle quattro zampe.

import { type P, add, dist, len, mul, norm, perp, sub } from "../motore/svg";
import { clamp } from "../motore/tempo";

/**
 * Due ossa (l1, l2) dalla radice verso il bersaglio. `piega` sceglie da che
 * parte si apre il ginocchio (+1 / -1 rispetto alla direzione radice→piede).
 * Se il bersaglio è troppo lontano, la zampa si distende e ci punta.
 */
export function ik2(radice: P, bersaglio: P, l1: number, l2: number, piega: 1 | -1): { ginocchio: P; fine: P } {
  const d = sub(bersaglio, radice);
  let L = len(d);
  const dir = norm(d);
  const max = (l1 + l2) * 0.999;
  const min = Math.abs(l1 - l2) + 0.001;
  L = Math.max(min, Math.min(max, L));
  const fine = add(radice, mul(dir, L));
  // legge del coseno: distanza lungo dir del ginocchio, e scarto laterale
  const a = (l1 * l1 - l2 * l2 + L * L) / (2 * L);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const base = add(radice, mul(dir, a));
  const ginocchio = add(base, mul(perp(dir), h * piega));
  return { ginocchio, fine };
}

/**
 * Il corpo attorno a una spina: per ogni vertebra-guida un'altezza di dorso
 * (verso l'alto dello schermo) e una di ventre. Restituisce il contorno
 * chiuso, dalla coda al collo sul dorso e ritorno sul ventre.
 */
export function corpoDaSpina(spina: readonly P[], sopra: readonly number[], sotto: readonly number[]): P[] {
  const N = spina.length;
  const dorso: P[] = [];
  const ventre: P[] = [];
  for (let i = 0; i < N; i++) {
    const a = spina[Math.max(0, i - 1)];
    const b = spina[Math.min(N - 1, i + 1)];
    let nrm = norm(perp(sub(b, a)));
    // la normale deve puntare verso l'alto dello schermo (y negativa)
    if (nrm[1] > 0) nrm = mul(nrm, -1);
    dorso.push(add(spina[i], mul(nrm, sopra[i])));
    ventre.push(sub(spina[i], mul(nrm, sotto[i])));
  }
  return [...dorso, ...ventre.reverse()];
}

/** Punto a metà strada su una polilinea (per agganciare pezzi alla spina). */
export function lungo(punti: readonly P[], k: number): P {
  const tot: number[] = [0];
  for (let i = 1; i < punti.length; i++) tot.push(tot[i - 1] + dist(punti[i - 1], punti[i]));
  const L = tot[tot.length - 1] * clamp(k);
  for (let i = 1; i < punti.length; i++) {
    if (L <= tot[i]) {
      const s = (L - tot[i - 1]) / (tot[i] - tot[i - 1] || 1);
      return [punti[i - 1][0] + (punti[i][0] - punti[i - 1][0]) * s, punti[i - 1][1] + (punti[i][1] - punti[i - 1][1]) * s];
    }
  }
  return punti[punti.length - 1];
}

// ---------------------------------------------------------------- andature --
/**
 * Il piede nel passo: dove sta rispetto alla sua radice (anca/spalla) a una
 * certa fase 0..1. Appoggio (`duty` della fase): il piede scorre indietro
 * piatto — nel mondo resta FERMO, perché il corpo avanza; volo: si alza ad
 * arco e torna avanti.
 */
export function piedeNelPasso(fase: number, falcata: number, alzata: number, duty = 0.64): { dx: number; dy: number; volo: number } {
  const f = fase - Math.floor(fase);
  if (f < duty) {
    const u = f / duty;
    return { dx: falcata * (0.5 - u), dy: 0, volo: 0 };
  }
  const u = (f - duty) / (1 - duty);
  const e = 0.5 - 0.5 * Math.cos(Math.PI * u);
  return { dx: falcata * (-0.5 + e), dy: -alzata * Math.sin(Math.PI * u), volo: Math.sin(Math.PI * u) };
}

/** Fasi delle quattro zampe nel passo laterale (PS, AS, PD, AD). */
export const FASI_PASSO = { postSin: 0, antSin: 0.25, postDes: 0.5, antDes: 0.75 } as const;
