// cartoni/motore/montaggio.ts — il montaggio: inquadrature in fila, stacchi,
// dissolvenze, didascalie. È qui che il copione diventa un fotogramma.
//
// Un episodio è una lista di inquadrature. Ogni inquadratura sa disegnarsi a
// un tempo LOCALE (0 = il suo primo fotogramma) e porta con sé le sue
// didascalie (citate alla lettera dalla prosa: c'è un test) e i suoi suoni.
// Il montaggio calcola dove cade ogni inquadratura sulla linea del tempo e,
// a un tempo t qualunque, restituisce il fotogramma — anche a metà di una
// dissolvenza, quando in scena ce ne sono due.

import { Defs } from "./svg";
import { type Camera, type Fotogramma, type Livello, type Piano, componiPiano } from "./fotogramma";
import { clamp, smooth } from "./tempo";
import { strato, type Didascalia, type Titolo } from "./didascalie";

/** Come si entra in un'inquadratura. */
export type Entrata =
  | { tipo: "stacco" }
  | { tipo: "dissolvenza"; durata: number }
  | { tipo: "nero"; durata: number };

/** Un suono puntuale (effetto), a un tempo locale dell'inquadratura. */
export interface Suono {
  t: number;
  nome: string;
  vol?: number;
  /** Per i suoni che durano (fischio, passi, galoppo). */
  durata?: number;
  /** Per i suoni ritmici: colpi (o cicli) al secondo, presi dall'andatura in scena. */
  ritmo?: number;
}

/** L'aria di un'inquadratura, per la colonna sonora d'ambiente. */
export interface Ambiente {
  vento?: number;
  pioggia?: number;
  lago?: number;
  notte?: number;
  /** i grilli della notte (0..1) */
  grilli?: number;
}

export interface Disegno {
  livelli: Livello[];
  cam: Camera;
  /** Velo a tutto schermo proprio dell'inquadratura (lampi, buio). */
  velo?: { colore: string; opacita: number };
}

/**
 * Quel che il montaggio dà a un'inquadratura oltre al tempo della storia:
 * il tempo vero (con le voci la storia può rallentare, il mondo no) e le
 * bocche di chi sta parlando (cartoni/motore/voce.ts).
 */
export interface InScena {
  /** il tempo vero dall'inizio dell'inquadratura (per il mondo: vento, acqua, pioggia) */
  t: number;
  /** la bocca di chi parla adesso, 0..1 */
  bocca(chi: string): number;
}

/** Una scena senza voci: il tempo vero è quello della storia, nessuno parla. */
export const MUTA = (t: number): InScena => ({ t, bocca: () => 0 });

/**
 * Un brano (una canzone registrata, cartoni/brani/) che suona in un'inquadratura:
 * parte a `da` (tempo della storia dell'inquadratura), dal secondo `dal` del brano
 * fino al secondo `al` (o alla fine), col suo volume e le sue sfumate. Suona a
 * tempo vero: dove c'è un brano la storia non può rallentare (cartoni/motore/voce.ts).
 */
export interface UsoBrano {
  id: string;
  da: number;
  dal?: number;
  al?: number;
  vol?: number;
  /** sfumata d'entrata e d'uscita (s) */
  entra?: number;
  esce?: number;
}

export interface Inquadratura {
  id: string;
  /** Titolo breve per il foglio-provini e il copione. */
  titolo: string;
  /** Pagina della prosa dell'episodio (per ep01: saga/prosa/ep01.md) da cui viene. */
  pagina: number;
  durata: number;
  entrata?: Entrata;
  didascalie?: Didascalia[];
  titoli?: Titolo[];
  suoni?: Suono[];
  ambiente?: Ambiente;
  /** Un brano che suona sotto l'inquadratura (una canzone: la ninna-nanna…). */
  brano?: UsoBrano;
  /** Disegna al tempo locale t della storia (secondi dall'inizio dell'inquadratura). */
  disegna(t: number, defs: Defs, scena: InScena): Disegno;
}

export interface Episodio {
  id: string;
  titolo: string;
  /** Il file di prosa da cui le didascalie sono citate. */
  prosa: string;
  sfondo: string;
  inquadrature: Inquadratura[];
}

export interface Posto {
  q: Inquadratura;
  indice: number;
  inizio: number;
  fine: number;
}

/** Dove cade ogni inquadratura sulla linea del tempo. */
export function scaletta(ep: Episodio): Posto[] {
  let t = 0;
  return ep.inquadrature.map((q, indice) => {
    const p = { q, indice, inizio: t, fine: t + q.durata };
    t += q.durata;
    return p;
  });
}

export const durata = (ep: Episodio): number => ep.inquadrature.reduce((s, q) => s + q.durata, 0);

/** L'inquadratura attiva al tempo t (l'ultima iniziata). */
export function postoA(sc: Posto[], t: number): Posto {
  let lo = 0;
  let hi = sc.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (sc[mid].inizio <= t) lo = mid;
    else hi = mid - 1;
  }
  return sc[lo];
}

function piano(p: Posto, tLoc: number, opacita: number): { piano: Piano; defs: string; velo?: Disegno["velo"] } {
  const defs = new Defs(`${p.q.id}-`);
  const d = p.q.disegna(tLoc, defs, MUTA(tLoc));
  return { piano: componiPiano(p.q.id, d.livelli, d.cam, opacita), defs: defs.markup(), velo: d.velo };
}

/** Il fotogramma dell'episodio al tempo t (secondi). */
export function fotogramma(ep: Episodio, t: number, sc: Posto[] = scaletta(ep)): Fotogramma {
  const tot = sc[sc.length - 1].fine;
  const tt = clamp(t, 0, tot - 1e-6);
  const cur = postoA(sc, tt);
  const tLoc = tt - cur.inizio;
  const piani: Piano[] = [];
  let defs = "";
  let velo: Fotogramma["velo"];
  const e = cur.q.entrata ?? { tipo: "stacco" };

  if (e.tipo === "dissolvenza" && cur.indice > 0 && tLoc < e.durata) {
    // la precedente continua sotto, questa sale sopra
    const prec = sc[cur.indice - 1];
    const a = piano(prec, prec.q.durata + tLoc, 1);
    const b = piano(cur, tLoc, smooth(tLoc / e.durata));
    piani.push(a.piano, b.piano);
    defs = a.defs + b.defs;
    velo = b.velo ?? a.velo;
  } else {
    const a = piano(cur, tLoc, 1);
    piani.push(a.piano);
    defs = a.defs;
    velo = a.velo;
  }

  // il nero: chiusura della precedente e apertura di questa
  let nero = 0;
  if (e.tipo === "nero" && tLoc < e.durata / 2) nero = 1 - smooth(tLoc / (e.durata / 2));
  const succ = sc[cur.indice + 1];
  const es = succ?.q.entrata;
  if (es && es.tipo === "nero") {
    const manca = cur.fine - tt;
    if (manca < es.durata / 2) nero = Math.max(nero, 1 - smooth(manca / (es.durata / 2)));
  }
  // apertura e chiusura dell'episodio
  nero = Math.max(nero, 1 - smooth(tt / 0.6), 1 - smooth((tot - tt) / 1.2));

  // didascalie e titoli: strato a schermo sopra tutto
  const sopra = strato(cur.q.didascalie ?? [], cur.q.titoli ?? [], tLoc);
  if (sopra) {
    piani.push({ id: "didascalie", opacita: 1, livelli: [{ id: "didascalie", trasf: "", contenuto: sopra }] });
  }
  if (nero > 0.001) {
    // il nero va SOTTO le didascalie dei titoli? No: sopra a tutto, tranne i titoli di testa.
    velo = { colore: "#000000", opacita: nero };
  }
  return { t: tt, sfondo: ep.sfondo, defs, piani, velo: combina(velo, nero) };
}

function combina(v: Fotogramma["velo"], nero: number): Fotogramma["velo"] {
  if (nero > 0.001) return { colore: "#000000", opacita: nero };
  return v;
}

/** Tutti i suoni dell'episodio, a tempo globale (per la colonna sonora). */
export function suoni(ep: Episodio): (Suono & { tg: number; q: string })[] {
  return scaletta(ep).flatMap((p) => (p.q.suoni ?? []).map((s) => ({ ...s, tg: p.inizio + s.t, q: p.q.id })));
}

/** L'ambiente a ogni inquadratura, a tempo globale. */
export function ambienti(ep: Episodio): { inizio: number; fine: number; a: Ambiente }[] {
  return scaletta(ep).map((p) => ({ inizio: p.inizio, fine: p.fine, a: p.q.ambiente ?? {} }));
}
