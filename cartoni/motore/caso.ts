// cartoni/motore/caso.ts — il caso deterministico.
//
// Il cartone non tira mai dadi veri: ogni "a caso" (un filo d'erba, una goccia,
// una striscia) viene da un generatore seminato con un nome. Stesso nome →
// stessa sequenza, su ogni macchina: è la regola del seme ("stesso nonce =
// stessa storia") portata ai fotogrammi. Il caso di sistema è bandito (c'è un test).

/** FNV-1a a 32 bit (lo stesso hash del serializzatore): nome → seme. */
export function fnv1a32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: piccolo, veloce, riproducibile. Restituisce [0,1). */
export function mulberry32(seme: number): () => number {
  let a = seme >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Caso {
  /** [0,1) */
  (): number;
  /** [a,b) */
  tra(a: number, b: number): number;
  /** intero in [a,b] */
  intero(a: number, b: number): number;
  /** ±r */
  segno(r?: number): number;
  /** uno a caso */
  scegli<T>(xs: readonly T[]): T;
  /** vero con probabilità p */
  moneta(p?: number): boolean;
  /** approssimazione gaussiana (somma di 3 uniformi), media 0, dev ~1 */
  gauss(): number;
}

/** Un generatore con nome: `caso("erba/collina")`. */
export function caso(nome: string): Caso {
  return casoN(fnv1a32(nome));
}

/**
 * Il generatore dell'elemento i di una famiglia (seme = fnv1a32 del nome).
 * Nei cicli che scartano ciò che è fuori campo, ogni elemento deve avere i
 * SUOI numeri: se l'ordine delle estrazioni dipendesse da cosa è visibile,
 * le cose salterebbero quando la camera si muove.
 */
export function elemento(seme: number, i: number): Caso {
  return casoN((seme ^ Math.imul(i + 1, 0x9e3779b1)) >>> 0);
}

/** Un generatore da un seme numerico. */
export function casoN(seme: number): Caso {
  const r = mulberry32(seme);
  const c = (() => r()) as Caso;
  c.tra = (a, b) => a + (b - a) * r();
  c.intero = (a, b) => Math.floor(a + (b - a + 1) * r());
  c.segno = (x = 1) => (r() * 2 - 1) * x;
  c.scegli = <T,>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)];
  c.moneta = (p = 0.5) => r() < p;
  c.gauss = () => (r() + r() + r() - 1.5) * 2;
  return c;
}

/** Hash intero → [0,1): per il rumore senza stato. */
function h1(i: number, seme: number): number {
  let x = Math.imul(i ^ seme, 0x27d4eb2d);
  x ^= x >>> 15;
  x = Math.imul(x, 0x85ebca6b);
  x ^= x >>> 13;
  return (x >>> 0) / 4294967296;
}

function h2(i: number, j: number, seme: number): number {
  return h1(Math.imul(i, 73856093) ^ Math.imul(j, 19349663), seme);
}

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

/** Rumore di valore 1D, liscio, in [-1,1]. */
export function rumore1(x: number, seme = 0): number {
  const i = Math.floor(x);
  const f = x - i;
  const a = h1(i, seme);
  const b = h1(i + 1, seme);
  return (a + (b - a) * fade(f)) * 2 - 1;
}

/** Rumore di valore 2D, liscio, in [-1,1]. */
export function rumore2(x: number, y: number, seme = 0): number {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = fade(x - i);
  const fy = fade(y - j);
  const a = h2(i, j, seme);
  const b = h2(i + 1, j, seme);
  const c = h2(i, j + 1, seme);
  const d = h2(i + 1, j + 1, seme);
  const ab = a + (b - a) * fx;
  const cd = c + (d - c) * fx;
  return (ab + (cd - ab) * fy) * 2 - 1;
}

/** Rumore frattale 1D (qualche ottava): per raffiche, tremolii, profili. */
export function frattale1(x: number, ottave = 3, seme = 0): number {
  let v = 0;
  let amp = 1;
  let tot = 0;
  let f = 1;
  for (let o = 0; o < ottave; o++) {
    v += rumore1(x * f, seme + o * 101) * amp;
    tot += amp;
    amp *= 0.5;
    f *= 2;
  }
  return v / tot;
}
