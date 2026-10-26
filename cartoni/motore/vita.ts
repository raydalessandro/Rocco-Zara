// cartoni/motore/vita.ts — la vita piccola: quel che si muove anche da fermi.
//
// Un pupazzo fermo non è fermo: lo sguardo si sposta a scatti rari e torna, le
// ciglia battono a tempi diversi (a volte due volte), un'orecchia gira verso un
// suono, il peso passa da una zampa all'altra, la coda si muove da sola a tratti.
// E la camera, anche quando non si muove, respira. Tutto è funzione pura del tempo
// e di un SEME (il nome dell'istanza): due pupazzi non vanno mai in sincrono, e lo
// stesso tempo dà sempre lo stesso fotogramma. Il canone è lento, naturalistico:
// segni piccoli e radi, mai nervosi.

import { casoN, fnv1a32 } from "./caso";
import { clamp, smooth } from "./tempo";

/** Il seme di un'istanza: da un nome, o da un numero (lo `semeCiglia` di una posa). */
export const semeVita = (seme: string | number | undefined, chi: string): number =>
  fnv1a32(typeof seme === "number" ? `${chi}/${Math.round(seme * 1000)}` : `${chi}/${seme ?? ""}`);

/**
 * Eventi radi e deterministici: il tempo è tagliato in finestre di lunghezza
 * variabile (tra `min` e `max` secondi, pescate dal seme); dentro ogni finestra
 * un evento parte a un istante suo e dura `durata`. Restituisce l'età dell'evento
 * in corso (0..1 lungo la sua durata, o −1 se non ce n'è) e il generatore della
 * finestra (per pescare la forma dell'evento, sempre la stessa per quella finestra).
 */
export function evento(t: number, seme: number, min: number, max: number, durata: number): { eta: number; r: () => number; k: number } {
  // finestre a passo fisso `max`, ognuna col suo scarto: la lunghezza vera varia tra min e max
  const k = Math.floor(t / max);
  const r = casoN((seme ^ Math.imul(k + 1, 0x9e3779b1)) >>> 0);
  const inizio = k * max + r() * (max - min) + 0.01;
  const u = (t - inizio) / durata;
  const eta = u >= 0 && u < 1 ? u : -1;
  return { eta, r, k };
}

/** Un impulso morbido 0..1 lungo un'età 0..1 (sale, resta, scende). */
const campana = (eta: number): number => (eta < 0 ? 0 : Math.sin(Math.PI * clamp(eta)) ** 0.8);

/**
 * Lo sguardo che si sposta a scatti (saccadi) e torna: uno spostamento della
 * pupilla (−1..1, da sommare allo sguardo della posa), rado — ogni 4–9 s, tenuto
 * un secondo circa. Lo scatto è secco (è un occhio), il ritorno un poco più morbido.
 */
export function saccade(t: number, seme: number): number {
  const e = evento(t, seme ^ 0x5acca, 4, 9, 1.3);
  if (e.eta < 0) return 0;
  const verso = (e.r() < 0.5 ? -1 : 1) * (0.25 + e.r() * 0.35);
  const su = clamp(e.eta / 0.06);
  const giu = 1 - smooth((e.eta - 0.8) / 0.2);
  return verso * Math.min(su, giu);
}

/**
 * Il battito di ciglia, non uniforme: ogni 2,5–6 s, a volte doppio (un quarto delle
 * volte). 1 = occhio chiuso. Più vivo di `palpebra`, che resta per chi batte a tempo.
 */
export function battito(t: number, seme: number): number {
  const e = evento(t, seme ^ 0xc161, 2.5, 6, 0.42);
  if (e.eta < 0) return 0;
  const doppio = e.r() < 0.25;
  const u = e.eta;
  if (!doppio) return u < 0.45 ? Math.sin((u / 0.45) * Math.PI) : 0;
  // due battiti corti di fila
  const w = u < 0.5 ? u / 0.5 : (u - 0.5) / 0.5;
  return Math.sin(w * Math.PI) ** 1.4;
}

/** Un'orecchia che gira verso un suono (0..1), ogni 3–8 s per un attimo; ogni orecchio col suo seme. */
export function orecchioCheGira(t: number, seme: number, quale: 0 | 1): number {
  const e = evento(t, seme ^ (quale ? 0x0e2 : 0x0e1), 3, 8, 0.9);
  return campana(e.eta) * (0.6 + e.r() * 0.4);
}

/**
 * Il peso che passa da una zampa all'altra (−1..1, lento): ogni 6–10 s il bacino si
 * sposta di poco e una zampa dietro si piega. Resta sul nuovo appoggio finché non
 * cambia di nuovo (un passaggio morbido di ~1,2 s).
 */
export function pesoSulleZampe(t: number, seme: number): number {
  const max = 10;
  const min = 6;
  const k = Math.floor(t / max);
  const lato = (j: number) => (casoN((seme ^ 0x9e50 ^ Math.imul(j + 1, 0x9e3779b1)) >>> 0)() < 0.5 ? -1 : 1);
  const r = casoN((seme ^ 0x9e50 ^ Math.imul(k + 1, 0x9e3779b1)) >>> 0);
  const prima = lato(k - 1);
  const dopo = r() < 0.5 ? -1 : 1;
  const inizio = k * max + r() * (max - min);
  const u = smooth((t - inizio) / 1.2);
  return (prima + (dopo - prima) * u) * 0.5;
}

/** La coda che si muove da sola a tratti (0..1): un colpo ogni 5–12 s, più spesso se tesa. */
export function codaDaSola(t: number, seme: number, tesa = 0): number {
  const e = evento(t, seme ^ 0xc0da, 5 - tesa * 2.5, 12 - tesa * 6, 1.6);
  return campana(e.eta) * (0.5 + e.r() * 0.5);
}

/** Un respiro un poco irregolare attorno al suo periodo (−1..1): non un metronomo. */
export function respiro(t: number, periodo: number, seme: number): number {
  const r = casoN(seme ^ 0x2e5);
  const f1 = r();
  const f2 = r();
  const p = periodo * (1 + 0.08 * Math.sin((t / periodo) * 0.37 + f1 * 6.28));
  return Math.sin((t / p + f2) * Math.PI * 2);
}

// ----------------------------------------------------------- la camera --
export interface VitaCamera {
  /** spostamento a schermo (px) */
  dx: number;
  dy: number;
  /** fattore di zoom (1 = nessuno) */
  z: number;
}

/**
 * La camera non è mai del tutto ferma: una deriva lentissima (±4–6 px di schermo su
 * due cicli incommensurabili di 7–11 s, seminati dall'id dell'inquadratura) e un
 * respiro di zoom dello 0,3–0,5 %. `velocita` è quanto la camera si muove già di suo
 * (px di schermo al secondo): la deriva si spegne da sola quando corre, così non si
 * somma ai carrelli. Si misura sul tempo VERO, non su quello della storia.
 */
export function vitaCamera(id: string, t: number, velocita = 0): VitaCamera {
  const r = casoN(fnv1a32(`camera/${id}`));
  const T1 = 7 + r() * 2;
  const T2 = T1 * (1.2 + r() * 0.35); // incommensurabile e fino a ~11 s
  const T3 = 5.5 + r() * 3;
  const f1 = r() * 6.28;
  const f2 = r() * 6.28;
  const f3 = r() * 6.28;
  const A = 4 + r() * 2;
  const k = 1 / (1 + velocita / 40);
  const dx = A * k * (0.65 * Math.sin((t / T1) * 6.2832 + f1) + 0.35 * Math.sin((t / T2) * 6.2832 + f2));
  const dy = A * 0.7 * k * (0.65 * Math.cos((t / T2) * 6.2832 + f1 * 0.7) + 0.35 * Math.sin((t / T1) * 6.2832 + f2 * 1.3));
  const z = 1 + (0.003 + r() * 0.002) * k * Math.sin((t / T3) * 6.2832 + f3);
  return { dx, dy, z };
}
