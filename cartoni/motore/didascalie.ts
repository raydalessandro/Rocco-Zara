// cartoni/motore/didascalie.ts — le parole sullo schermo.
//
// Le didascalie sono la voce del libro dentro il cartone: si CITANO dalla
// prosa, alla lettera (test/cartoni.episodi.test.ts lo verifica pagina per
// pagina), perché la prosa è un cancello umano e il cartone non la riscrive.
// Tipografia di casa: Fraunces, il serif caldo di Scrivia.

import { el, n } from "./svg";
import { ALTEZZA, LARGHEZZA, op } from "./fotogramma";
import { clamp, smooth } from "./tempo";

export interface Didascalia {
  /** Tempo locale di entrata e di uscita (secondi). */
  da: number;
  a: number;
  /** Il testo, citato alla lettera dalla prosa (senza gli asterischi del corsivo). */
  testo: string;
  /** Pagina della prosa da cui è citata. */
  pagina: number;
  /** Un pensiero: in corsivo. */
  pensiero?: boolean;
  /**
   * Chi dice le battute (il testo tra «»): un id del cast delle voci
   * (cartoni/cast/voci.ts), o uno per battuta nell'ordine. Senza `chi` le
   * battute restano alla narratrice. Il resto della didascalia è narrazione.
   */
  chi?: string | readonly string[];
  /**
   * La canta un brano (id in cartoni/brani/brani.json): nessuno la legge, compare
   * mentre il brano la canta (i tempi vengono dal brano: cartoni/audio/brani.ts).
   */
  canto?: string;
}

/** Titoli (non citazioni): testa e coda dell'episodio. */
export interface Titolo {
  da: number;
  a: number;
  righe: { testo: string; corpo: number; y: number; spaziatura?: number; peso?: number; corsivo?: boolean; colore?: string }[];
}

export const FONT = "Fraunces, 'Iowan Old Style', Palatino, Georgia, serif";

const CORPO = 46;
const INTERLINEA = 1.32;
const MAX_RIGA = 1480;

/** Larghezza stimata di un testo in Fraunces (media per carattere). */
function larghezza(s: string, corpo: number): number {
  let w = 0;
  for (const c of s) {
    if (c === " ") w += 0.26;
    else if ("il.,;:'’!|".includes(c)) w += 0.28;
    else if ("mwMW—".includes(c)) w += 0.82;
    else if (c === c.toUpperCase() && /[A-ZÀ-Ý]/.test(c)) w += 0.66;
    else w += 0.5;
  }
  return w * corpo;
}

/** A capo per parole, bilanciando le righe (niente vedove corte). */
export function aCapo(testo: string, corpo = CORPO, max = MAX_RIGA): string[] {
  const parole = testo.split(/\s+/).filter(Boolean);
  const tot = larghezza(testo, corpo);
  const nRighe = Math.max(1, Math.ceil(tot / max));
  const bersaglio = tot / nRighe;
  const righe: string[] = [];
  let cur = "";
  for (const p of parole) {
    const prova = cur ? cur + " " + p : p;
    if (cur && larghezza(prova, corpo) > bersaglio * 1.08 && righe.length < nRighe - 1) {
      righe.push(cur);
      cur = p;
    } else cur = prova;
  }
  if (cur) righe.push(cur);
  return righe;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Quanto è visibile una scritta (dissolvenze morbide in entrata e in uscita). */
export function presenza(t: number, da: number, a: number, rampa = 0.4): number {
  if (t < da || t > a) return 0;
  return Math.min(smooth((t - da) / rampa), smooth((a - t) / rampa));
}

function didascalia(d: Didascalia, t: number): string {
  const k = presenza(t, d.da, d.a);
  if (k <= 0) return "";
  const righe = aCapo(d.testo);
  const h = CORPO * INTERLINEA;
  const base = ALTEZZA - 92 - (righe.length - 1) * h;
  const sale = (1 - k) * 10;
  let testo = "";
  righe.forEach((r, i) => {
    testo += el("tspan", { x: LARGHEZZA / 2, y: base + i * h + sale }, esc(r));
  });
  const attr = {
    "font-family": FONT,
    "font-size": CORPO,
    "font-style": d.pensiero ? "italic" : undefined,
    "text-anchor": "middle",
    fill: "#fbf5e6",
  };
  // ombra morbida sotto il testo (leggibile su cielo e su erba)
  const ombra = el("text", { ...attr, fill: "#1a140c", opacity: 0.55, transform: "translate(0 3)", filter: "url(#didascalia-ombra)" }, testo);
  return el("g", { opacity: op(k) }, ombra + el("text", attr, testo));
}

function titolo(ti: Titolo, t: number): string {
  const k = presenza(t, ti.da, ti.a, 0.9);
  if (k <= 0) return "";
  // una velatura morbida dietro il titolo: si legge anche sul cielo chiaro
  const y0 = Math.min(...ti.righe.map((r) => r.y - r.corpo));
  const y1 = Math.max(...ti.righe.map((r) => r.y));
  let s = el("ellipse", { cx: LARGHEZZA / 2, cy: (y0 + y1) / 2, rx: 820, ry: (y1 - y0) / 2 + 170, fill: "url(#titolo-velo)", opacity: op(k * 0.85) });
  ti.righe.forEach((r, i) => {
    const ki = clamp(k * 1.4 - i * 0.2);
    if (ki <= 0) return;
    const attr = {
      "font-family": FONT,
      "font-size": r.corpo,
      "font-weight": r.peso ?? 400,
      "font-style": r.corsivo ? "italic" : undefined,
      "letter-spacing": r.spaziatura ?? undefined,
      "text-anchor": "middle",
      fill: r.colore ?? "#fbf5e6",
    };
    const y = r.y + (1 - ki) * 12;
    s += el("g", { opacity: op(ki) }, el("text", { ...attr, x: LARGHEZZA / 2, y: y + 3, fill: "#1a140c", opacity: 0.5, filter: "url(#didascalia-ombra)" }, esc(r.testo)) + el("text", { ...attr, x: LARGHEZZA / 2, y }, esc(r.testo)));
  });
  return s;
}

/** Lo strato a schermo con didascalie e titoli attivi al tempo locale t. */
export function strato(ds: readonly Didascalia[], ts: readonly Titolo[], t: number): string {
  let s = "";
  const attive = ds.filter((d) => t >= d.da && t <= d.a);
  if (attive.length) {
    // velatura in basso: la didascalia si legge su qualunque fondo
    const k = Math.max(...attive.map((d) => presenza(t, d.da, d.a)));
    s += el("rect", { x: 0, y: ALTEZZA - 330, width: LARGHEZZA, height: 330, fill: "url(#didascalia-velo)", opacity: op(k) });
    for (const d of attive) s += didascalia(d, t);
  }
  for (const ti of ts) s += titolo(ti, t);
  if (!s) return "";
  const defs =
    `<linearGradient id="didascalia-velo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d0a06" stop-opacity="0"/><stop offset="1" stop-color="#0d0a06" stop-opacity="0.62"/></linearGradient>` +
    `<filter id="didascalia-ombra" x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur stdDeviation="${n(5)}"/></filter>` +
    `<radialGradient id="titolo-velo"><stop offset="0" stop-color="#0d0a06" stop-opacity="0.55"/><stop offset="1" stop-color="#0d0a06" stop-opacity="0"/></radialGradient>`;
  return `<defs>${defs}</defs>${s}`;
}
