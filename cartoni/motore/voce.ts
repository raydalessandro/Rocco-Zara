// cartoni/motore/voce.ts — la voce nel tempo: chi parla, quando, e quanto aspetta la scena.
//
// Due cose, tutte e due pure (le usa il browser per le bocche e il render per
// l'audio, e danno lo stesso risultato). Le voci sono di due specie: le
// RIPRESE (una voce vera o sintetica, registrata una volta e tenuta: la
// narratrice e, se hanno la loro voce, i personaggi) e il GRAMMELOT (le
// battute che non hanno ancora una ripresa: si suonano in codice).
//
// 1. IL PIANO DI UNA BATTUTA. Dalla battuta vera (le sue sillabe, gli accenti,
//    la punteggiatura) e dal profilo della voce esce una fila di sillabe di
//    grammelot con tempi, altezze e aperture della bocca. È la "partitura"
//    che audio/grammelot.ts suona e che il pupazzo muove con la bocca.
//
// 2. L'EPISODIO CON LE VOCI. Le didascalie hanno tempi pensati per leggere;
//    una voce ne vuole altri. `conVoce` rifà i tempi: ogni didascalia dura
//    almeno quanto la sua voce (più un respiro prima e un margine dopo), e la
//    scena ASPETTA — il tempo della storia rallenta dentro la didascalia (i
//    pupazzi e la camera vanno più piano), mentre il tempo del MONDO (vento,
//    acqua, pioggia) resta quello vero. Stacchi, suoni e musica seguono.
//    Tutto il resto del copione non cambia: le azioni restano agganciate
//    alle loro didascalie.

import { caso } from "./caso";
import type { Didascalia, Titolo } from "./didascalie";
import type { Episodio, Inquadratura, InScena, Suono } from "./montaggio";
import { type Attacco, type Vocale, segmenta, sillabe } from "./parola";
import { clamp, smooth } from "./tempo";

// ------------------------------------------------------------- profili --
/** Come parla un personaggio (i profili del cast stanno in cartoni/cast/voci.ts). */
export interface ProfiloVoce {
  id: string;
  /** Il nome nel mondo (per il copione della voce). */
  nome: string;
  /** Altezza media della voce (Hz). */
  f0: number;
  /** Quanto sale e scende la melodia (semitoni). */
  estensione: number;
  /** Sillabe al secondo (il passo della voce). */
  ritmo: number;
  /** Il tratto vocale: 1 = adulto medio; >1 più piccolo (formanti alte), <1 più grande. */
  formanti: number;
  /** Aria nel suono 0..1 (voce soffiata). */
  soffio: number;
  /** Grana 0..1: irregolarità di altezza e ampiezza (una voce viva, non un oscillatore). */
  grana: number;
  /** Le consonanti del suo grammelot, per modo d'attacco della sillaba vera. */
  alfabeto: Record<Attacco, string>;
  /** Pausa dopo una virgola / a fine frase (s). */
  pause: { virgola: number; punto: number };
  /** Quanto si allunga l'ultima sillaba della frase (1 = niente; asciutta ~1.2, indugiante ~1.5). */
  finale?: number;
  /** Esita prima di parlare (0..1): probabilità di un piccolo "mh" a bocca chiusa in testa alla battuta. */
  esita?: number;
  /** Voce di un ricordo: lontana, con eco (0..1). */
  eco?: number;
  /** Volume relativo nel missaggio. */
  vol?: number;
  /** Dove sta nello stereo (−1 sinistra … +1 destra). */
  pan?: number;
}

// ------------------------------------------------------ piano battuta --
/** Una sillaba di grammelot, pronta da suonare e da mimare. */
export interface SillabaVoce {
  /** inizio e fine, in secondi dall'inizio della battuta */
  t0: number;
  t1: number;
  /** la consonante del grammelot ("" = attacco vocalico) e quanto dura */
  cons: string;
  tc: number;
  vocale: Vocale;
  /** altezza (Hz) all'inizio, al culmine e alla fine della sillaba */
  f0: readonly [number, number, number];
  /** intensità 0..1 */
  amp: number;
  /** apertura della bocca sulla vocale 0..1 */
  aperta: number;
}

export interface PianoBattuta {
  chi: string;
  testo: string;
  durata: number;
  sillabe: SillabaVoce[];
}

/** Le consonanti che chiudono le labbra (la bocca del pupazzo si chiude). */
export const LABIALI = "mbpwv";

const APERTURA: Record<Vocale, number> = { a: 1, e: 0.72, i: 0.46, o: 0.8, u: 0.44 };

/** Quanto dura la consonante del grammelot (s), prima della vocale. */
function durataConsonante(c: string): number {
  if (!c) return 0;
  if ("mn".includes(c)) return 0.075;
  if ("bdg".includes(c)) return 0.06;
  if ("ptk".includes(c)) return 0.075;
  if ("sxf".includes(c)) return 0.09;
  if ("hv".includes(c)) return 0.06;
  if ("lw".includes(c)) return 0.055;
  if (c === "r") return 0.045;
  return 0.05;
}

const semitoni = (st: number) => Math.pow(2, st / 12);
const FINE_FRASE = new Set(["punto", "domanda", "esclamazione", "sospesa"]);

/** Il piano di una battuta in grammelot per una voce. Deterministico. */
export function pianifica(testo: string, v: ProfiloVoce): PianoBattuta {
  const r = caso(`voce/${v.id}/${testo}`);
  const ss = sillabe(testo);
  const out: SillabaVoce[] = [];
  // le frasi: da un punto (o ? ! …) al successivo; la melodia scende in ognuna
  const frasi: [number, number][] = [];
  let i0 = 0;
  ss.forEach((s, i) => {
    if (FINE_FRASE.has(s.pausa) || i === ss.length - 1) {
      frasi.push([i0, i]);
      i0 = i + 1;
    }
  });
  let t = 0;
  // l'esitazione: un "mh" a bocca chiusa prima di osare (mai su un'esclamazione)
  const esclamativa = ss.some((s) => s.pausa === "esclamazione");
  if (v.esita && !esclamativa && ss.length && r() < v.esita) {
    const d = 0.24;
    out.push({ t0: 0, t1: d, cons: "m", tc: d, vocale: "u", f0: [v.f0 * 0.95, v.f0 * 0.98, v.f0 * 0.92], amp: 0.5, aperta: 0 });
    t = d + 0.16;
  }
  for (const [a, b] of frasi) {
    const n = b - a + 1;
    const chiusura = ss[b].pausa;
    const domanda = chiusura === "domanda";
    const esclama = chiusura === "esclamazione";
    const tronca = ss.slice(a, b + 1).some((s) => s.pausa === "tronca");
    const alza = esclama ? v.estensione * 0.35 : 0;
    for (let i = a; i <= b; i++) {
      const s = ss[i];
      const u = n > 1 ? (i - a) / (n - 1) : 1;
      const ultima = i === b;
      // durata: il passo della voce, l'accento, la sillaba chiusa, l'allungamento finale
      let d = (1 / v.ritmo) * r.tra(0.86, 1.14);
      if (s.tonica) d *= 1.3;
      if (s.chiusa) d *= 1.08;
      if (ultima && !tronca) d *= v.finale ?? 1.4;
      if (s.pausa === "tronca") d *= 0.75;
      const scelte = v.alfabeto[s.attacco] ?? "";
      const cons = scelte ? scelte[Math.floor(r() * scelte.length)] : "";
      const tc = Math.min(durataConsonante(cons), d * 0.42);
      // melodia (semitoni attorno a f0): la frase scende piano; la sillaba
      // accentata sale con uno "scoop" e ricade; la domanda risale alla fine
      const vaga = r.segno(1.1);
      const decl = tronca ? v.estensione * 0.1 : v.estensione * (0.35 - 0.7 * u);
      const base = alza + decl + vaga;
      const accento = v.estensione * (esclama ? 0.7 : 0.55);
      let st0: number;
      let st1: number;
      let st2: number;
      if (s.tonica) {
        st0 = base + accento - 2.2;
        st1 = base + accento;
        st2 = base + accento * 0.55;
      } else {
        st0 = base + 0.4;
        st1 = base + 0.7;
        st2 = base - 0.3;
      }
      if (ultima && domanda) st2 = st1 + v.estensione * 0.8;
      else if (ultima && !tronca) st2 = st1 - v.estensione * 0.5;
      if (domanda && u > 0.55 && !ultima) st2 += v.estensione * 0.25;
      const amp = (s.tonica ? 1 : 0.78) * (ultima && !domanda ? 0.85 : 1) * (esclama ? 1.08 : 1);
      out.push({
        t0: t,
        t1: t + d,
        cons,
        tc,
        vocale: s.vocale,
        f0: [v.f0 * semitoni(st0), v.f0 * semitoni(st1), v.f0 * semitoni(st2)],
        amp: Math.min(1, amp),
        aperta: APERTURA[s.vocale] * (0.72 + 0.28 * Math.min(1, amp)),
      });
      t += d;
      // le pause della punteggiatura (non dopo l'ultima sillaba della battuta)
      if (i < ss.length - 1) {
        if (s.pausa === "virgola") t += v.pause.virgola * r.tra(0.85, 1.15);
        else if (s.pausa === "tronca") t += 0.12;
        else if (s.pausa === "sospesa") t += v.pause.punto * 1.3;
        else if (FINE_FRASE.has(s.pausa)) t += v.pause.punto * r.tra(0.9, 1.1);
      }
    }
  }
  return { chi: v.id, testo, durata: t, sillabe: out };
}

/** La bocca 0..1 a `t` secondi dall'inizio della battuta (0 fuori). */
export function boccaBattuta(p: PianoBattuta, t: number): number {
  if (t < -0.05 || t > p.durata + 0.15) return 0;
  let best = 0;
  for (let k = 0; k < p.sillabe.length; k++) {
    const s = p.sillabe[k];
    if (t < s.t0 - 0.06 || t > s.t1 + 0.12) continue;
    const v0 = s.t0 + s.tc; // inizio della vocale
    const succ = p.sillabe[k + 1];
    // si apre sulla vocale, si richiude alla fine (del tutto se chi viene dopo è labiale o c'è pausa)
    const apre = smooth((t - v0 + 0.02) / 0.07);
    const chiudeA = succ && Math.abs(succ.t0 - s.t1) < 1e-6 && !LABIALI.includes(succ.cons) ? 0.35 : 0;
    const chiude = 1 - (1 - chiudeA) * smooth((t - (s.t1 - 0.05)) / 0.09);
    let b = s.aperta * apre * chiude;
    // durante la consonante: labbra chiuse (m, b, p…) o socchiuse
    if (t >= s.t0 && t < v0) b = LABIALI.includes(s.cons) ? 0 : 0.22 * s.aperta;
    best = Math.max(best, b);
  }
  return clamp(best);
}

// ------------------------------------------------------------ le riprese --
/** Una ripresa: un pezzo letto da una voce, in un file audio fuori dal copione. */
export interface Ripresa {
  /** il testo letto: deve essere quello del segmento, o la ripresa non vale */
  testo: string;
  /** durata del parlato (s) */
  durata: number;
  /** il file, relativo alla cartella voce/ dell'episodio */
  file: string;
  /** chi parla (le battute dei personaggi) */
  chi?: string;
  /** la voce che ha letto (id in cartoni/voce/voce.json) */
  voce?: string;
  /** la bocca per il pupazzo: una cifra 0-9 ogni 40 ms (le battute) */
  bocca?: string;
}

/** Compatibilità: la ripresa della narratrice. */
export type ClipNarrazione = Ripresa;

/** Il registro delle riprese della narratrice (episodi/<id>/voce/narrazione.json). */
export interface Narrazione {
  /** la voce che ha letto (id in cartoni/voce/voce.json) */
  voce: string;
  /** "provino" finché la voce della saga non è scelta */
  stato: "provino" | "definitiva";
  /** le impostazioni della voce con cui sono state fatte le riprese (vedi `impronta`) */
  impronta?: string;
  /** chiave: `${inquadratura}/${didascalia}/${segmento}` */
  clip: Record<string, Ripresa>;
}

/**
 * L'impronta di una voce: le impostazioni che la fanno quella che è (motore,
 * modello, lentezza, variazione, cadenza, tono, e le voci del coro se è un coro),
 * in otto cifre. Ogni registro di riprese la porta: se in voce.json una voce
 * cambia, il test elenca gli episodi registrati con quella vecchia — così la
 * stessa voce suona uguale in tutti gli episodi.
 */
export function impronta(c: { motore?: string; modello?: string; lentezza?: number; variazione?: number; cadenza?: number; tono?: number; coro?: readonly unknown[] }): string {
  const base = [c.motore ?? "piper", c.modello ?? "", c.lentezza ?? 1, c.variazione ?? null, c.cadenza ?? null, c.tono ?? 0];
  const chiave = JSON.stringify(c.coro ? [...base, c.coro] : base);
  let h = 0x811c9dc5;
  for (let i = 0; i < chiave.length; i++) {
    h ^= chiave.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/** Il registro delle battute registrate dei personaggi (episodi/<id>/voce/battute.json). */
export interface Battute {
  /** per ogni personaggio: la voce che l'ha detta e se è quella scelta */
  voci: Record<string, { voce: string; stato: "provino" | "definitiva"; impronta?: string }>;
  /** chiave: `${inquadratura}/${didascalia}/${segmento}`; ogni ripresa ha `chi`, `voce`, `bocca` */
  clip: Record<string, Ripresa>;
}

/** La bocca 0..1 a `t` secondi dall'inizio di una ripresa (dal suo volume, 25 volte al secondo). */
export function boccaRipresa(b: string, t: number): number {
  if (t < 0 || !b) return 0;
  const x = t * 25;
  const i = Math.floor(x);
  if (i >= b.length) return 0;
  const a = (b.charCodeAt(i) - 48) / 9;
  const c = i + 1 < b.length ? (b.charCodeAt(i + 1) - 48) / 9 : 0;
  return clamp(a + (c - a) * (x - i));
}

export const chiaveClip = (q: string, didascalia: number, segmento: number): string => `${q}/${didascalia}/${segmento}`;

/** Un pezzo che legge la narratrice (quel che si registra). */
export interface DaNarrare {
  chiave: string;
  q: string;
  testo: string;
  pensiero: boolean;
}

/**
 * Tutto quel che legge la narratrice in un episodio, in ordine: la narrazione
 * delle didascalie, e le battute di chi non ha una voce nel cast.
 */
export function daNarrare(ep: Episodio, voci: Readonly<Record<string, ProfiloVoce>>): DaNarrare[] {
  const out: DaNarrare[] = [];
  for (const q of ep.inquadrature) {
    (q.didascalie ?? []).forEach((d, i) =>
      (d.canto ? [] : segmenta(d.testo, d.chi)).forEach((s, j) => {
        if (s.tipo === "battuta" && voci[s.chi]) return;
        out.push({ chiave: chiaveClip(q.id, i, j), q: q.id, testo: s.testo, pensiero: !!d.pensiero });
      }),
    );
  }
  return out;
}

/** Una battuta che un personaggio dice con la sua voce (quel che si registra). */
export interface DaRecitare {
  chiave: string;
  q: string;
  chi: string;
  testo: string;
}

/** Tutte le battute dei personaggi che hanno un profilo di voce, in ordine. */
export function daRecitare(ep: Episodio, voci: Readonly<Record<string, ProfiloVoce>>): DaRecitare[] {
  const out: DaRecitare[] = [];
  for (const q of ep.inquadrature) {
    (q.didascalie ?? []).forEach((d, i) =>
      (d.canto ? [] : segmenta(d.testo, d.chi)).forEach((s, j) => {
        if (s.tipo === "battuta" && voci[s.chi]) out.push({ chiave: chiaveClip(q.id, i, j), q: q.id, chi: s.chi, testo: s.testo });
      }),
    );
  }
  return out;
}

// ------------------------------------------------ l'episodio con voci --
export interface OpzVoce {
  /** Il cast delle voci (cartoni/cast/voci.ts). */
  voci: Readonly<Record<string, ProfiloVoce>>;
  /** Le riprese della narratrice; senza, la narrazione resta muta (solo didascalie). */
  narrazione?: Narrazione | null;
  /** Le battute registrate dei personaggi; quelle che mancano si dicono in grammelot. */
  battute?: Battute | null;
  /** La voce parte dopo che la didascalia è apparsa (s). */
  attacco?: number;
  /** La didascalia resta dopo che la voce ha finito (s). */
  coda?: number;
  /** Il respiro tra due pezzi della stessa didascalia (s). */
  respiro?: number;
  /** Quanta parte della pausa dopo una didascalia la sua voce può prendersi. */
  prestito?: number;
}

export interface EventoVoce {
  /** l'inquadratura */
  q: string;
  /** l'inizio, in secondi dall'inizio dell'episodio (tempo vero) */
  tg: number;
  durata: number;
  tipo: "battuta" | "narrazione";
  chi: string;
  testo: string;
  /** l'indice della didascalia (nell'inquadratura) e del segmento */
  didascalia: number;
  segmento: number;
  /** pensiero (corsivo): la narratrice lo dice più piano */
  pensiero?: boolean;
  piano?: PianoBattuta;
  clip?: Ripresa;
}

/** Come scorre il tempo di un'inquadratura: nodi (tempo vero, tempo della storia). */
export interface TempoInquadratura {
  durataStoria: number;
  durata: number;
  nodi: [number, number][];
}

export interface EpisodioConVoce extends Episodio {
  voci: EventoVoce[];
  tempi: Record<string, TempoInquadratura>;
  /** segmenti di narrazione senza ripresa (o con una ripresa di un testo diverso) */
  senzaRipresa: string[];
  /** battute senza registrazione (dette in grammelot), quando le registrazioni ci sono */
  senzaRegistrazione: string[];
  /** didascalie che farebbero rallentare la storia sotto un brano (che suona a tempo vero) */
  fuoriTempo: string[];
}

/** Interpolazione a tratti su nodi [x, y] crescenti; fuori, pendenza 1. */
function aTratti(nodi: readonly (readonly [number, number])[], x: number): number {
  if (x <= nodi[0][0]) return nodi[0][1] + (x - nodi[0][0]);
  const u = nodi[nodi.length - 1];
  if (x >= u[0]) return u[1] + (x - u[0]);
  let i = 0;
  while (x > nodi[i + 1][0]) i++;
  const [x0, y0] = nodi[i];
  const [x1, y1] = nodi[i + 1];
  return x1 === x0 ? y1 : y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
}

interface Pezzo {
  tipo: "battuta" | "narrazione";
  chi: string;
  testo: string;
  /** durata della voce (0 = muto: la narrazione senza narratrice, che si legge soltanto) */
  durata: number;
  segmento: number;
  piano?: PianoBattuta;
  clip?: Ripresa;
}

/** Caratteri al secondo di una lettura svelta: il tempo minimo di un pezzo muto. */
const LETTURA = 25;

/** Rifà i tempi dell'episodio attorno alle voci (vedi l'intestazione). */
export function conVoce(ep: Episodio, o: OpzVoce): EpisodioConVoce {
  const attacco = o.attacco ?? 0.3;
  const coda = o.coda ?? 0.6;
  const respiro = o.respiro ?? 0.3;
  const prestito = o.prestito ?? 0.6;
  const senzaRipresa: string[] = [];
  const senzaRegistrazione: string[] = [];
  const fuoriTempo: string[] = [];
  const tempi: Record<string, TempoInquadratura> = {};
  const locali: { q: Inquadratura; eventi: (EventoVoce & { t: number })[] }[] = [];

  for (const q of ep.inquadrature) {
    const ordinate = (q.didascalie ?? []).map((d, i) => ({ d, i })).sort((x, y) => x.d.da - y.d.da);
    // nodi (tempo della storia → tempo vero)
    const nodi: [number, number][] = [[0, 0]];
    let N = 0;
    let R = 0;
    const didascalie: Didascalia[] = [];
    const eventi: (EventoVoce & { t: number })[] = [];
    // dove suona un brano (a tempo vero) la storia non può rallentare
    const B = q.brano;
    const finestra = B ? ([B.da, B.da + ((B.al ?? Infinity) - (B.dal ?? 0))] as const) : null;
    ordinate.forEach(({ d, i }, k) => {
      const pezzi: Pezzo[] = [];
      (d.canto ? [] : segmenta(d.testo, d.chi)).forEach((s, j) => {
        const chiave = chiaveClip(q.id, i, j);
        if (s.tipo === "battuta") {
          const v = o.voci[s.chi];
          if (v) {
            // la battuta registrata, se c'è (e se è proprio quella); se no il grammelot
            const reg = o.battute?.clip[chiave];
            if (reg && reg.testo === s.testo && reg.chi === s.chi) {
              pezzi.push({ tipo: "battuta", chi: s.chi, testo: s.testo, durata: reg.durata, segmento: j, clip: reg });
              return;
            }
            if (o.battute) senzaRegistrazione.push(`${chiave} (${s.chi}): «${s.testo}»`);
            const piano = pianifica(s.testo, v);
            pezzi.push({ tipo: "battuta", chi: s.chi, testo: s.testo, durata: piano.durata, segmento: j, piano });
            return;
          }
        }
        // narrazione (o battuta lasciata alla narratrice): con la ripresa, o muta
        const clip = o.narrazione?.clip[chiave];
        if (clip && clip.testo === s.testo) {
          pezzi.push({ tipo: "narrazione", chi: "narratrice", testo: s.testo, durata: clip.durata, segmento: j, clip });
          return;
        }
        if (o.narrazione) senzaRipresa.push(`${chiave}: «${s.testo}»`);
        pezzi.push({ tipo: "narrazione", chi: "narratrice", testo: s.testo, durata: 0, segmento: j });
      });
      // quanto serve: la voce, e il tempo di leggere i pezzi muti che vengono
      // PRIMA di una voce (così una battuta dopo la narrazione arriva quando chi
      // legge c'è arrivato); quelli dopo l'ultima voce si leggono mentre si
      // ascolta, e bastano i tempi della didascalia
      const muto = (p: Pezzo) => p.durata <= 0;
      const lettura = (p: Pezzo) => p.testo.length / LETTURA;
      let ultima = -1;
      pezzi.forEach((p, j) => {
        if (!muto(p)) ultima = j;
      });
      pezzi.splice(ultima + 1);
      const parlata = ultima >= 0;
      const L = d.a - d.da;
      const serve = parlata
        ? attacco + pezzi.reduce((x, p) => x + (muto(p) ? lettura(p) : p.durata), 0) + respiro * (pezzi.length - 1) + coda
        : 0;
      // la pausa prima della didascalia scorre com'è
      R += d.da - N;
      N = d.da;
      nodi.push([R, N]);
      const inizioR = R;
      // la didascalia: si prende un po' della pausa dopo, poi (se serve) la scena rallenta
      const prossima = ordinate[k + 1]?.d.da ?? q.durata;
      const extra = Math.max(0, serve - L);
      const presa = Math.min(extra, Math.max(0, prossima - d.a) * prestito);
      const fineN = d.a + presa;
      const zona = Math.max(fineN - d.da, serve);
      if (finestra && zona > fineN - d.da + 1e-6 && d.da < finestra[1] && fineN > finestra[0]) {
        fuoriTempo.push(`${q.id}: «${d.testo}» ha bisogno di ${(zona - (fineN - d.da)).toFixed(2)} s in più mentre suona «${B!.id}»: allarga la sua finestra (il brano non aspetta)`);
      }
      R += zona;
      N = fineN;
      nodi.push([R, N]);
      didascalie[i] = { ...d, da: inizioR, a: parlata ? inizioR + zona : inizioR + L };
      if (parlata) {
        // il tempo che avanza va ai pezzi muti (in proporzione alle lettere)
        const muti = pezzi.filter(muto);
        const lettereMute = muti.reduce((x, p) => x + p.testo.length, 0);
        const avanzo = zona - serve;
        let tv = inizioR + attacco;
        for (const p of pezzi) {
          if (muto(p)) {
            tv += lettura(p) + (lettereMute > 0 ? (avanzo * p.testo.length) / lettereMute : 0) + respiro;
            continue;
          }
          eventi.push({ q: q.id, tg: 0, t: tv, durata: p.durata, tipo: p.tipo, chi: p.chi, testo: p.testo, didascalia: i, segmento: p.segmento, pensiero: d.pensiero, piano: p.piano, clip: p.clip });
          tv += p.durata + respiro;
        }
      }
    });
    R += q.durata - N;
    N = q.durata;
    nodi.push([R, N]);
    // nodi ripuliti (niente doppioni)
    const pul = nodi.filter((n, k) => k === 0 || n[0] > nodi[k - 1][0] + 1e-9 || n[1] > nodi[k - 1][1] + 1e-9);
    tempi[q.id] = { durataStoria: q.durata, durata: R, nodi: pul };
    locali.push({ q: { ...q, didascalie: q.didascalie ? didascalie : undefined }, eventi });
  }

  // le inquadrature nuove, e le voci sul tempo dell'episodio
  let tg = 0;
  const voci: EventoVoce[] = [];
  const inquadrature = locali.map(({ q, eventi }) => {
    const T = tempi[q.id];
    const storia = (t: number) => aTratti(T.nodi, t); // tempo vero → tempo della storia
    const nodiInv = T.nodi.map(([a, b]) => [b, a] as [number, number]);
    const vero = (t: number) => aTratti(nodiInv, t); // tempo della storia → tempo vero
    for (const { t: tl, ...e } of eventi) voci.push({ ...e, tg: tg + tl });
    tg += T.durata;
    const battute = eventi.filter((e) => e.tipo === "battuta");
    const bocca = (chi: string, t: number): number => {
      let b = 0;
      for (const e of battute) {
        if (e.chi !== chi) continue;
        if (e.piano) b = Math.max(b, boccaBattuta(e.piano, t - e.t));
        else if (e.clip?.bocca) b = Math.max(b, boccaRipresa(e.clip.bocca, t - e.t));
      }
      return b;
    };
    const suoni = q.suoni?.map((s): Suono => {
      const t0 = vero(s.t);
      if (s.durata === undefined) return { ...s, t: t0 };
      const dur = Math.max(1e-3, vero(s.t + s.durata) - t0);
      return { ...s, t: t0, durata: dur, ritmo: s.ritmo !== undefined ? (s.ritmo * s.durata) / dur : undefined };
    });
    const titoli = q.titoli?.map((ti): Titolo => ({ ...ti, da: vero(ti.da), a: vero(ti.a) }));
    const nuova: Inquadratura = {
      ...q,
      durata: T.durata,
      suoni,
      titoli,
      brano: q.brano ? { ...q.brano, da: vero(q.brano.da) } : undefined,
      disegna: (t, defs) => q.disegna(storia(t), defs, { t, bocca: (chi) => bocca(chi, t) } satisfies InScena),
    };
    return nuova;
  });
  return { ...ep, inquadrature, voci, tempi, senzaRipresa, senzaRegistrazione, fuoriTempo };
}

/** Quanto la scena rallenta al massimo (1 = mai): per il consuntivo. */
export function rallentamento(t: TempoInquadratura): number {
  let min = 1;
  for (let k = 1; k < t.nodi.length; k++) {
    const dR = t.nodi[k][0] - t.nodi[k - 1][0];
    const dN = t.nodi[k][1] - t.nodi[k - 1][1];
    if (dR > 1e-6) min = Math.min(min, dN / dR);
  }
  return min;
}
