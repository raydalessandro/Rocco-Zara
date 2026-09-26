// cartoni/motore/svg.ts — penne e pennelli: dal punto alla stringa SVG.
//
// Il motore scrive SVG come testo. Qui ci sono: il formato dei numeri (corto e
// stabile, così lo stesso fotogramma è la stessa stringa), le curve morbide
// (Catmull-Rom → Bézier), il "tubo" che dà carne a uno scheletro di punti
// (zampe, colli, code), e il registro delle <defs> di un fotogramma.

export type P = readonly [number, number];

/** Numero → testo corto e deterministico (un decimale; niente "-0"). */
export function n(x: number): string {
  const r = Math.round(x * 10) / 10;
  return Object.is(r, -0) || r === 0 ? "0" : String(r);
}
/** Coppia di coordinate. */
export const pt = (p: P): string => `${n(p[0])} ${n(p[1])}`;

// ------------------------------------------------------------------ vettori --
export const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1]];
export const mul = (a: P, k: number): P => [a[0] * k, a[1] * k];
export const len = (a: P): number => Math.hypot(a[0], a[1]);
export const norm = (a: P): P => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l];
};
export const perp = (a: P): P => [-a[1], a[0]];
export const mix = (a: P, b: P, k: number): P => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
export const dist = (a: P, b: P): number => Math.hypot(b[0] - a[0], b[1] - a[1]);
export const rot = (a: P, rad: number, c: P = [0, 0]): P => {
  const s = Math.sin(rad);
  const k = Math.cos(rad);
  const x = a[0] - c[0];
  const y = a[1] - c[1];
  return [c[0] + x * k - y * s, c[1] + x * s + y * k];
};
export const polare = (r: number, rad: number): P => [Math.cos(rad) * r, Math.sin(rad) * r];
export const DEG = Math.PI / 180;

// ------------------------------------------------------------------- curve --
/**
 * Spline di Catmull-Rom (uniforme) → segmenti cubici. `chiusa` richiude la
 * forma. `tensione` 0 = spigoli, 1 = morbido standard.
 */
export function curva(punti: readonly P[], chiusa = false, tensione = 1): string {
  const pts = punti;
  const N = pts.length;
  if (N === 0) return "";
  if (N === 1) return `M${pt(pts[0])}`;
  if (N === 2 && !chiusa) return `M${pt(pts[0])}L${pt(pts[1])}`;
  const get = (i: number): P => {
    if (chiusa) return pts[((i % N) + N) % N];
    return pts[Math.max(0, Math.min(N - 1, i))];
  };
  const k = tensione / 6;
  let d = `M${pt(pts[0])}`;
  const segs = chiusa ? N : N - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    const c1: P = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
    const c2: P = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    d += `C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return chiusa ? d + "Z" : d;
}

/** Polilinea con spigoli. */
export function poli(punti: readonly P[], chiusa = false): string {
  if (!punti.length) return "";
  return "M" + punti.map(pt).join("L") + (chiusa ? "Z" : "");
}

/** Normale media in un punto di una polilinea (per il tubo). */
function normali(punti: readonly P[]): P[] {
  const N = punti.length;
  const out: P[] = [];
  for (let i = 0; i < N; i++) {
    const a = punti[Math.max(0, i - 1)];
    const b = punti[Math.min(N - 1, i + 1)];
    out.push(norm(perp(sub(b, a))));
  }
  return out;
}

/**
 * Il tubo: un contorno morbido attorno a uno scheletro di punti con raggi
 * variabili. Con `tappi` arrotonda le estremità. È la carne di zampe, colli,
 * code, fili d'erba grossi, rami.
 */
export function tubo(
  punti: readonly P[],
  raggi: readonly number[],
  opz: { tappoInizio?: boolean; tappoFine?: boolean; tensione?: number } = {},
): string {
  const N = punti.length;
  if (N < 2) return "";
  const nn = normali(punti);
  const r = (i: number) => raggi[Math.min(i, raggi.length - 1)] ?? 1;
  const sin: P[] = [];
  const des: P[] = [];
  for (let i = 0; i < N; i++) {
    sin.push(add(punti[i], mul(nn[i], r(i))));
    des.push(sub(punti[i], mul(nn[i], r(i))));
  }
  const contorno: P[] = [...sin];
  if (opz.tappoFine !== false) {
    const dir = norm(sub(punti[N - 1], punti[N - 2]));
    contorno.push(add(punti[N - 1], mul(dir, r(N - 1) * 0.9)));
  }
  for (let i = N - 1; i >= 0; i--) contorno.push(des[i]);
  if (opz.tappoInizio !== false) {
    const dir = norm(sub(punti[0], punti[1]));
    contorno.push(add(punti[0], mul(dir, r(0) * 0.9)));
  }
  return curva(contorno, true, opz.tensione ?? 1);
}

/** Punti lungo una Bézier quadratica (per catene di scheletro). */
export function quadPunti(a: P, c: P, b: P, passi: number): P[] {
  const out: P[] = [];
  for (let i = 0; i <= passi; i++) {
    const t = i / passi;
    const u = 1 - t;
    out.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
  }
  return out;
}

/** Cerchio come path (comodo dentro i clip). */
export const cerchioD = (c: P, r: number): string =>
  `M${n(c[0] - r)} ${n(c[1])}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0Z`;

/** Ellisse come path. */
export const ellisseD = (c: P, rx: number, ry: number): string =>
  `M${n(c[0] - rx)} ${n(c[1])}a${n(rx)} ${n(ry)} 0 1 0 ${n(2 * rx)} 0a${n(rx)} ${n(ry)} 0 1 0 ${n(-2 * rx)} 0Z`;

// ------------------------------------------------------------ elementi/attr --
type Attr = Record<string, string | number | undefined | null | false>;

export function attrs(a: Attr): string {
  let s = "";
  for (const k of Object.keys(a)) {
    const v = a[k];
    if (v === undefined || v === null || v === false) continue;
    s += ` ${k}="${typeof v === "number" ? n(v) : v}"`;
  }
  return s;
}

export const el = (tag: string, a: Attr = {}, figli?: string): string =>
  figli === undefined ? `<${tag}${attrs(a)}/>` : `<${tag}${attrs(a)}>${figli}</${tag}>`;

export const path = (d: string, a: Attr = {}): string => (d ? el("path", { d, ...a }) : "");
export const g = (a: Attr, figli: string): string => (figli ? el("g", a, figli) : "");

/** Trasformazione composta: trasla, ruota (gradi), scala (anche speculare). */
export function tr(x = 0, y = 0, gradi = 0, sx = 1, sy = sx): string {
  let s = "";
  if (x || y) s += `translate(${n(x)} ${n(y)})`;
  if (gradi) s += `rotate(${n(gradi)})`;
  if (sx !== 1 || sy !== 1) s += `scale(${Math.round(sx * 1000) / 1000} ${Math.round(sy * 1000) / 1000})`;
  return s || "";
}

// ------------------------------------------------------------------ <defs> --
/**
 * Il registro delle definizioni di un fotogramma (gradienti, clip). Ogni
 * entità ci scrive con un prefisso suo, così gli id sono unici e stabili.
 */
export class Defs {
  private voci = new Map<string, string>();

  /** `prefisso` separa gli id di due inquadrature disegnate insieme (dissolvenza). */
  constructor(private readonly prefisso = "") {}

  has(id: string): boolean {
    return this.voci.has(this.prefisso + id);
  }

  /** Registra un markup già completo (l'id nel markup deve essere `idPieno(id)`). */
  add(id: string, markup: string): string {
    const pid = this.prefisso + id;
    if (!this.voci.has(pid)) this.voci.set(pid, markup);
    return `url(#${pid})`;
  }

  idPieno(id: string): string {
    return this.prefisso + id;
  }

  lineare(
    id: string,
    da: P,
    a: P,
    stop: readonly (readonly [number, string, number?])[],
    unita: "userSpaceOnUse" | "objectBoundingBox" = "userSpaceOnUse",
  ): string {
    const pid = this.prefisso + id;
    const s = stop.map(([o, c, op]) => el("stop", { offset: o, "stop-color": c, "stop-opacity": op ?? undefined })).join("");
    return this.add(id, el("linearGradient", { id: pid, gradientUnits: unita, x1: da[0], y1: da[1], x2: a[0], y2: a[1] }, s));
  }

  radiale(
    id: string,
    c: P,
    r: number,
    stop: readonly (readonly [number, string, number?])[],
    unita: "userSpaceOnUse" | "objectBoundingBox" = "userSpaceOnUse",
    fuoco?: P,
  ): string {
    const pid = this.prefisso + id;
    const s = stop.map(([o, col, op]) => el("stop", { offset: o, "stop-color": col, "stop-opacity": op ?? undefined })).join("");
    return this.add(id, el("radialGradient", { id: pid, gradientUnits: unita, cx: c[0], cy: c[1], r, fx: fuoco?.[0], fy: fuoco?.[1] }, s));
  }

  clip(id: string, d: string, trasf?: string): string {
    const pid = this.prefisso + id;
    return this.add(id, el("clipPath", { id: pid }, path(d, { transform: trasf })));
  }

  markup(): string {
    return [...this.voci.values()].join("");
  }
}
