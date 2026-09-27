// cartoni/episodi/ep04/copione.ts — il copione animato di «ep04 — Il primo nodo».
//
// Fonte: saga/prosa/ep04.md (pagine 1–19). Ogni inquadratura dichiara la pagina
// da cui viene, e ogni didascalia è CITATA alla lettera da quella pagina
// (test/cartoni.episodi.test.ts). Il cartone non riscrive la prosa: la mette in
// scena, e ne sceglie le frasi (le immagini dicono il resto).
//
// I luoghi (cartoni/luoghi/rivalba.ts): le COPPELLE, la sera del rito e all'alba;
// l'ALTURA della marmotta; RIVALBA nella piena (l'acqua alta davanti a tutto: i massi
// «a filo», il molo sott'acqua) e al mattino; le RIVE BASSE, l'argine delle tane col
// varco dove il lago entra «dritto alle tane» — e Rocco che ci si mette di traverso.
// La gente: Cervara; le linci di Rivalba che portano fuori i piccoli (in bocca, o nella
// cesta di giunchi coi topi d'acqua); la lince piccola col fratello in bocca; le lontre
// della Gente delle Rive; Rèmolo, il Custode anziano (la testuggine dal guscio liscio);
// Brénta col suo remo; le rane del coro (la creatura dell'episodio); la marmotta.
//
// La geografia della notte, a Rivalba: la fila viene da sinistra (dalle rive basse,
// lungo la passerella lunga, dove aspetta in coda) e va a destra, di masso in masso,
// verso la passerella corta, il molo e la riva — l'asciutto, il colle. Il «primo masso»
// è quello più a sinistra, accanto all'orlo della passerella lunga: lì sta chi è in
// testa, e lì, «sul bordo», sta Zara. Al mattino si torna a valle: da destra a sinistra.
//
// Il coro delle rane è il filo sonoro dell'episodio (il «personal detail» del grafo):
// canta a piena voce la sera, a mezza voce durante la piena, TACE nel momento peggiore
// (p.14), e riprende tutto insieme nell'attimo in cui il nodo chiude (p.18): il sì del
// lago. La musica gli fa posto: dove cantano le rane, spesso, non suona niente.
//
// Grammatica visiva (saga/bible/STILE_VISIVO.md §2–§3): Rocco dal basso, nel varco;
// Zara bassa e veloce quando corre ai massi; la fila sui massi di lato, come una
// frase che si legge; e due inserti (il nodo, il nodino vecchio) per le zampe.

import { type PosaCervara, cervara } from "../../cast/cervara";
import { marmotta } from "../../cast/fauna";
import { type PosaLince, lince, lontra, lontraCheNuota, rana, scagliaDiRemo, testuggine, type PosaTestuggine } from "../../cast/laghi";
import { type PosaRocco, rocco } from "../../cast/rocco";
import { type PosaZara, zara } from "../../cast/zara";
import { ALTURA, COPPELLE, LAGO_VESPRO, PIETRE_COPPELLE, RIVALBA, RIVE, RIVE_BASSE, VEDETTA, nelVarco, sulMassoDelConsiglio, sullaPasserella } from "../../luoghi/rivalba";
import { type Luce, mescolaLuce } from "../../motore/colore";
import type { Camera } from "../../motore/fotogramma";
import type { Episodio, Inquadratura } from "../../motore/montaggio";
import { type Defs, type P, ellisseD, n, path } from "../../motore/svg";
import { clamp, ease, impulso, lerp, rampa, traccia } from "../../motore/tempo";
import { insertoCorda, insertoNodino } from "../../scene/inserti";
import { custodiaDelPegno } from "../../scene/lago";
import { LUCI } from "../../scene/luci";
import type { Piena } from "../../scene/luogo";
import type { Meteo } from "../../scene/meteo";
import { palcoscenico } from "../../scene/palcoscenico";
import { CICLO, camTra, diSassoInSasso, fase, inPunto, tremito } from "../../scene/regia";

// ------------------------------------------------------------- attrezzi --
const V = palcoscenico(RIVALBA);
const K = palcoscenico(COPPELLE);
const B = palcoscenico(RIVE_BASSE);
const A = palcoscenico(ALTURA);
const Q = LAGO_VESPRO.quota;
/** Il piano delle passerelle (su cui si cammina). */
const PASS = sullaPasserella(-1000);

const SERA: Luce = LUCI.tramonto;
const IMBRUNIRE: Luce = mescolaLuce(LUCI.tramonto, LUCI.notte, 0.45);
const NOTTE: Luce = LUCI.notte;
const ALBA: Luce = LUCI.alba;
const MATTINO: Luce = mescolaLuce(LUCI.alba, LUCI.giorno, 0.6);

/** Cervara è un poco più bassa di Zara (la scheda). */
const SC_C = 0.95;

const Zp = (p: P, posa: PosaZara, verso: 1 | -1, L: Luce, defs: Defs, id = "zara", scala = 1) => inPunto(p, zara(posa, { defs, luce: L, id, verso }), { verso, scala });
const Cp = (p: P, posa: PosaCervara, verso: 1 | -1, L: Luce, defs: Defs, scala = SC_C) => inPunto(p, cervara(posa, { defs, luce: L, id: "cervara", verso }), { verso, scala });
const Rp = (p: P, posa: PosaRocco, verso: 1 | -1, L: Luce, defs: Defs, id = "rocco") => inPunto(p, rocco(posa, { defs, luce: L, id, verso }), { verso });
const Lince = (p: P, posa: PosaLince, verso: 1 | -1, L: Luce, defs: Defs, id: string, scala = 0.9) => inPunto(p, lince(posa, { luce: L, defs, id }), { verso, scala });
/** Rèmolo, il Custode anziano: la testuggine dal guscio liscio (guarda a destra col verso 1). */
const Remolo = (p: P, posa: Omit<PosaTestuggine, "liscio">, verso: 1 | -1, L: Luce, defs: Defs) => inPunto(p, testuggine({ ...posa, liscio: true }, { luce: L, defs, id: "remolo" }), { verso });
const Nuota = (x: number, y: number, t: number, seme: string, L: Luce, defs: Defs, verso: 1 | -1 = 1, o: { bocca?: number; travolta?: number; testa?: number } = {}, scala = 1) =>
  inPunto([x, y], lontraCheNuota({ t, seme, ...o }, { luce: L, defs, id: `nuoto-${seme}` }), { verso, scala });

// ----------------------------------------------------------------- piena --
/** La piena a Rivalba: di quanto è salito il lago (i massi più bassi restano «a filo», il molo va sotto). */
const LIV = 40;
const PICCO = 46;
const PIENA_RIVALBA: Piena = { livello: LIV, corrente: 0.45 };
const PIENA_ALTA: Piena = { livello: PICCO, corrente: 0.1 };
const PIOVE: Partial<Meteo> = { notte: 1, pioggia: 0.75, vento: 0.45, nebbia: 0.08 };
/** La notte della piena, per l'ambiente sonoro (le rane a mezza voce). */
const ARIA_PIENA = { vento: 0.4, pioggia: 0.75, lago: 0.6, notte: 1, rane: 0.4 };
/** Le rive basse nella piena: il lago dietro l'argine, la laguna davanti che sale (finché il varco è aperto). */
const rive = (livello: number, laguna: number, varco: number, o: Partial<Piena> = {}): Piena => ({ livello, laguna, varco, corrente: 0.3, ...o });

// ---------------------------------------------------------- la fila sui massi --
const masso = (i: number, dx = 0): P => sulMassoDelConsiglio(i, dx);
/** Il primo masso: il più a sinistra, accanto all'orlo della passerella lunga. Lì sta chi è in testa. */
const PRIMO = masso(0);
const SECONDO = masso(1);
/** Dove sta Cervara in testa, sul primo masso: un poco avanti, verso gli altri massi. */
const IN_TESTA = masso(0, 16);
/** L'orlo della passerella lunga (finisce a −760): da qui si salta sul primo masso. */
const X_ORLO = -790;
/** Dove sta Zara, «sul bordo» (p.4): sulla passerella lunga, poco prima dell'orlo. */
const X_BORDO = -1010;
/** La lince piccola col fratello in bocca, all'orlo: i massi davanti (p.6). */
const X_PICCOLA = -800;
/** I posti in coda, sulla passerella lunga: il primo è l'orlo, poi chi aspetta. */
const POSTI: readonly number[] = [X_ORLO, -1250, -1360, -1470, -1580];
/** Chi aspetta in coda coi piccoli: [seme, cosa porta]. */
const CODA: readonly (readonly [string, "cucciolo" | "cesta"])[] = [
  ["portatrice1", "cucciolo"],
  ["portatrice2", "cesta"],
  ["portatrice3", "cucciolo"],
];
/** La traversata della notte: dall'orlo, i sette massi da sinistra, la passerella corta. */
const TRAVERSATA: readonly P[] = [[X_ORLO, PASS], ...[0, 1, 2, 3, 4, 5, 6].map((i) => masso(i)), [900, PASS]];
/** Il ritorno del mattino (p.19): dalla passerella corta, i massi da destra, la passerella lunga. */
const RITORNO: readonly P[] = [[870, PASS], ...[6, 5, 4, 3, 2, 1, 0].map((i) => masso(i)), [-850, PASS]];
// il passo sui massi: lungo e basso, «come passa la sera» (ep03); un salto, un appoggio
const ARIA = 0.5;
const SOSTA = 0.14;
const PASSO_FILA = ARIA + SOSTA;
/** Quanto ci mette chi è in coda ad andare all'orlo, quando tocca a lei (s). */
const CAMMINO = 1.8;

/** Chi va di sasso in sasso da `t0` e poi, arrivato in fondo, prosegue al passo (verso: la direzione). */
function traversata(t: number, t0: number, punti: readonly P[], verso: 1 | -1, alto = 24): { p: P; volo: number; inAria: boolean; cammina: boolean } {
  const s = diSassoInSasso(punti, t, t0, ARIA, SOSTA, alto);
  const fine = t0 + (punti.length - 1) * PASSO_FILA;
  if (t < fine) return { p: s.p, volo: s.inAria ? Math.sin(Math.PI * s.u) : 0, inAria: s.inAria, cammina: false };
  const x = punti[punti.length - 1][0] + verso * 240 * (t - fine);
  return { p: [x, sullaPasserella(x)], volo: 0, inAria: false, cammina: true };
}

/**
 * Dove sta in coda la portatrice k (prima di partire dall'orlo a `partenze[k]`):
 * avanza di un posto ogni volta che parte chi le sta davanti; al suo turno va
 * all'orlo, di buon passo.
 */
function inCoda(t: number, k: number, partenze: readonly number[], posti: readonly number[] = POSTI): { x: number; va: number } {
  let x = posti[k + 1];
  let va = 0;
  for (let j = 0; j < k; j++) {
    const a = partenze[j] - CAMMINO;
    const u = rampa(t, a, a + 0.8, ease.dentroFuori);
    if (u > 0 && u < 1) va = 1;
    x += (posti[k - j] - posti[k - j + 1]) * u;
  }
  const a = partenze[k] - CAMMINO;
  const u = rampa(t, a, partenze[k] - 0.1, ease.lineare);
  if (u > 0 && u < 1) va = 1;
  x += (posti[0] - posti[1]) * u;
  return { x, va };
}

/** Una portatrice della fila: in coda, poi all'orlo, poi di sasso in sasso — salta raccolta, vola distesa. */
function portatrice(
  t: number,
  mondo: number,
  k: number,
  partenze: readonly number[],
  seme: string,
  porta: "cucciolo" | "cesta" | undefined,
  L: Luce,
  defs: Defs,
  o: { scala?: number; bagnata?: number; trema?: number; punti?: readonly P[]; posti?: readonly number[]; verso?: 1 | -1 } = {},
): string {
  const scala = o.scala ?? 0.9;
  const bagnata = o.bagnata ?? 1;
  const verso = o.verso ?? 1;
  if (t < partenze[k]) {
    const c = inCoda(t, k, partenze, o.posti);
    return Lince([c.x, sullaPasserella(c.x)], { t: mondo + k, modo: "in piedi", seme, porta, fase: c.va ? fase(c.x, 92, scala) : undefined, ampiezza: c.va, bagnata, testa: 6, trema: c.va ? 0 : o.trema }, verso, L, defs, seme, scala);
  }
  const s = traversata(t, partenze[k], o.punti ?? TRAVERSATA, verso);
  return Lince(s.p, { t: mondo + k, modo: "in piedi", seme, porta, volo: s.volo, fase: s.cammina ? fase(s.p[0], 92, scala) : s.inAria ? undefined : 0, ampiezza: s.cammina ? 1 : 0, bagnata, testa: 6 }, verso, L, defs, seme, scala);
}

/** La coda ferma sulla passerella lunga (bagnati, coi piccoli in bocca). */
function codaFerma(mondo: number, L: Luce, defs: Defs, o: { quanti?: number; trema?: number; teste?: (x: number) => number; piccola?: boolean } = {}): string {
  let s = CODA.slice(0, o.quanti ?? CODA.length)
    .map(([seme, porta], i) => {
      const x = POSTI[i + 1];
      return Lince([x, PASS], { t: mondo + i * 1.3, modo: "in piedi", seme, porta, bagnata: 1, testa: 8 + (o.teste?.(x) ?? 0), trema: o.trema }, 1, L, defs, seme);
    })
    .join("");
  if (o.piccola) s += Lince([POSTI[4], PASS], { t: mondo, modo: "in piedi", seme: "piccola", porta: "cucciolo", bagnata: 1, testa: 10 + (o.teste?.(POSTI[4]) ?? 0), trema: 0.6 }, 1, L, defs, "piccola", 0.55);
  return s;
}

/** Le linci che corrono sulle passerelle, piccole (i campi larghi della piena: «le corse piccole», p.2). */
function corse(t: number, L: Luce, defs: Defs): string {
  let s = "";
  for (const [x0, v, seme, porta] of [[-2400, 170, "corsa1", "cucciolo"], [-1700, 150, "corsa2", undefined], [880, 190, "corsa3", "cucciolo"], [-2900, 200, "corsa4", "cesta"]] as const) {
    const x = x0 + v * t;
    s += Lince([x, sullaPasserella(x)], { t, modo: "in piedi", seme, fase: fase(x, 92, 0.6), ampiezza: 1, porta, bagnata: 1 }, 1, L, defs, seme, 0.6);
  }
  return s;
}

/** Le lontre nell'acqua alta attorno ai massi (p.3: «le lontre in acqua»). */
function lontreInAcqua(t: number, L: Luce, defs: Defs, y: number): string {
  return [[-120, "l1", 1], [400, "l2", -1], [640, "l3", 1]]
    .map(([x, seme, verso], i) => Nuota((x as number) + Math.sin(t * 0.4 + i) * 50, y, t + i, seme as string, L, defs, verso as 1 | -1))
    .join("");
}

/** I Custodi che contano le teste, dove la fila arriva, sulla passerella corta (p.3): le teste su e giù, a turno. */
function custodiCheContano(t: number, L: Luce, defs: Defs): string {
  return [1040, 1200]
    .map((x, i) => inPunto([x, PASS], testuggine({ t: t + i, collo: 0.7, testa: 16 * Math.max(0, Math.sin(t * 2.2 + i * 1.4)) ** 4 }, { luce: L, defs, id: `custode${i}` }), { verso: -1, scala: 0.55 }))
    .join("");
}

/** La corda del Popolo del Bosco (p.3: «alle corde»), tesa lungo i massi da un palo all'altro: dietro la fila. */
function cordaSuiMassi(L: Luce): string {
  const a: P = [-770, PASS - 50];
  const b: P = [840, PASS - 50];
  return path(`M${n(a[0])} ${n(a[1])}Q${n((a[0] + b[0]) / 2)} ${n(a[1] + 44)} ${n(b[0])} ${n(b[1])}`, { stroke: L === NOTTE ? "#6a604c" : "#a58d5e", "stroke-width": 3, fill: "none" });
}

/** Le rane del coro, sedute sulla soglia delle tane: [x, seme] (piccole: una rana è una rana). */
function coroDiRane(mondo: number, L: Luce, defs: Defs, rane: readonly (readonly [number, string])[], canta: number | ((i: number) => number), scala = 0.42): string {
  return rane
    .map(([x, seme], i) => inPunto([x, Q - RIVE.sogliaTane + 2], rana({ t: mondo, canta: typeof canta === "number" ? canta : canta(i), seme }, { luce: L, defs, id: seme }), { verso: i % 2 ? -1 : 1, scala }))
    .join("");
}

// ------------------------------------------------------------ le rive basse --
const VARCO = nelVarco();
/** Rocco nella laguna davanti al varco: le zampe giù nell'acqua. */
const Y_LAGUNA = Q + 70;
/** Dove Rocco sta nella laguna, di fianco al varco, prima di entrarci (girato verso il varco). */
const X_ROCCO_LAGUNA = 250;

/** Lo spruzzo che si alza dal varco quando il lago spinge di più (p.13: «non si vedeva quasi più»). */
function veloDiSpruzzi(t: number, forza: number): string {
  const caso01 = (k: number, s: number) => {
    const r = Math.sin(k * s) * 43758.5453;
    return r - Math.floor(r);
  };
  let velo = "";
  let gocce = "";
  // la nebbia d'acqua: strisce basse e larghe che salgono dal varco e vanno verso chi guarda
  for (let k = 0; k < 26; k++) {
    const r = caso01(k, 12.9898);
    const u = (t * (0.18 + 0.12 * r) + r) % 1;
    const x = -300 + r * 600 + Math.sin(t * 0.8 + k) * 30;
    const y = VARCO[1] - 20 - 230 * u;
    velo += ellisseD([x, y], (50 + 60 * r) * (0.6 + u), (9 + 10 * r) * (0.6 + u));
  }
  // gli spruzzi: gocce a ventaglio che scavalcano la schiena e ricadono
  for (let k = 0; k < 70; k++) {
    const r = caso01(k, 78.233);
    const u = (t * (0.9 + r) + r * 3) % 1;
    const x = -240 + r * 480 + (r - 0.5) * 160 * u;
    const y = VARCO[1] - 150 - 230 * u + 460 * u * u;
    gocce += ellisseD([x, y], 1.6 + 2.4 * r, 2 + 3 * r);
  }
  return path(velo, { fill: "#cfd6da", opacity: 0.2 * forza }) + path(gocce, { fill: "#e6e1d2", opacity: 0.75 * forza });
}

// ------------------------------------------------------------- le Coppelle --
const suColle = (x: number): P => [x, COPPELLE.quota(x)];
const PIETRA = PIETRE_COPPELLE[1];
/** Il piano della pietra grande (al centro): dove si posa la custodia, dove si annoda. */
const PIANO = COPPELLE.quota(PIETRA[0]) + 8 - PIETRA[2];
/** La custodia del pegno, sul piano della pietra grande, verso destra (dalla parte del Custode). */
const CUSTODIA: P = [60, PIANO + 8];
/** Dove Brénta posa la scaglia: sul piano, verso sinistra (dalla sua parte). */
const SCAGLIA: P = [-150, PIANO + 16];
/** Il nodino vecchio, sull'orlo della pietra (p.18). */
const NODINO: P = [140, PIANO + 18];
/** Chi sta dove attorno alla pietra grande (la sera del rito e all'alba). */
const XC = { cervara: -960, zara: -620, brenta: -330, remolo: 300, rocco: 760 } as const;
/** Le linci del rito, sedute ai lati: [x, seme]. */
const RITO: readonly (readonly [number, string])[] = [
  [-1260, "rito1"],
  [-1120, "rito2"],
  [1080, "rito3"],
  [1220, "rito4"],
];

/** La gente attorno alla pietra grande: ognuno al suo posto, con le pose che l'inquadratura cambia. */
function allaPietra(
  t: number,
  mondo: number,
  L: Luce,
  defs: Defs,
  o: {
    bagnati?: number;
    remolo?: Partial<PosaTestuggine>;
    brenta?: Partial<Parameters<typeof lontra>[0]>;
    brentaVerso?: 1 | -1;
    zara?: Partial<PosaZara>;
    cervara?: Partial<PosaCervara>;
    rocco?: Partial<PosaRocco>;
    rito?: Partial<PosaLince>;
    custodia?: number | null;
    scaglia?: boolean;
    senza?: readonly ("remolo" | "brenta" | "zara" | "cervara" | "rocco" | "rito")[];
  } = {},
): string {
  const b = o.bagnati ?? 0;
  const c = (chi: "remolo" | "brenta" | "zara" | "cervara" | "rocco" | "rito") => !(o.senza ?? []).includes(chi);
  let s = "";
  if (c("rito")) s += RITO.map(([x, seme], i) => K.sulPalco(x, lince({ t: mondo + i, modo: "seduta", seme, bagnata: b, testa: 6, ...o.rito }, { luce: L, defs, id: seme }), { verso: x < 0 ? 1 : -1, scala: 0.85 })).join("");
  if (c("rocco")) s += K.R(XC.rocco, { t, andatura: "fermo", bagnato: b, testa: 10, ...o.rocco }, -1, L, defs);
  if (c("cervara")) s += inPunto(suColle(XC.cervara), cervara({ t: mondo, andatura: "fermo", bagnata: b, testa: 4, ...o.cervara }, { defs, luce: L, id: "cervara", verso: 1 }), { verso: 1, scala: SC_C });
  if (o.custodia !== null && o.custodia !== undefined) s += inPunto(CUSTODIA, custodiaDelPegno(L, defs, "custodia", o.custodia), { scala: 1.1 });
  if (o.scaglia) s += scagliaDiRemo(L, SCAGLIA, -8);
  if (c("remolo")) s += Remolo(suColle(XC.remolo), { t: mondo, collo: 0.6, testa: 6, ...o.remolo }, -1, L, defs);
  if (c("brenta")) s += inPunto(suColle(XC.brenta), lontra({ t: mondo, zampe: "asta", testa: 4, ...o.brenta }, { luce: L, defs, id: "brenta" }), { verso: o.brentaVerso ?? 1 });
  if (c("zara")) s += K.Z(XC.zara, { t, andatura: "fermo", involto: true, bagnata: b, testa: 8, ...o.zara }, 1, L, defs);
  return s;
}

// ================================================================ copione ==

/** 1 · La sera del rito, alle Coppelle: la gente attorno alla pietra grande, e dal basso il coro delle rane (p.1). */
const s01: Inquadratura = {
  id: "s01",
  titolo: "La sera del rito",
  pagina: 1,
  durata: 7.6,
  titoli: [
    {
      da: 0.5,
      a: 5.6,
      righe: [
        { testo: "Rocco & Zara", corpo: 136, y: 300, peso: 500 },
        { testo: "le Terre Annodate", corpo: 40, y: 372, spaziatura: 6, corsivo: true },
        { testo: "ep04 — Il primo nodo", corpo: 54, y: 470 },
      ],
    },
  ],
  ambiente: { vento: 0.15, lago: 0, rane: 0.7 },
  disegna(t, defs, v) {
    const L = mescolaLuce(SERA, IMBRUNIRE, rampa(t, 0, 7.6, ease.lineare) * 0.6);
    const att = allaPietra(t, v.t, L, defs, { rito: { guarda: 0.3 }, zara: { andatura: "seduta", testa: 4 }, cervara: { andatura: "seduta" }, rocco: { testa: 8 } });
    const cam = camTra({ x: -120, y: 560, zoom: 0.6 }, { x: -100, y: 580, zoom: 0.7 }, ease.dentroFuori(t / 7.6));
    return { cam, livelli: K.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.2, sole: 0.08, vento: 0.15 }, soleA: [0.12, 0.5], attori: att }) };
  },
};

/** 2 · «L'acqua! L'acqua alle tane!»: la voce dal basso, e tutte le teste si voltano (p.1). */
const s02: Inquadratura = {
  id: "s02",
  titolo: "L'acqua alle tane",
  pagina: 1,
  durata: 4.8,
  didascalie: [{ da: 0.4, a: 3.4, pagina: 1, testo: "«L'acqua! L'acqua alle tane!»", chi: "gente" }],
  ambiente: { vento: 0.2, lago: 0, rane: 0.5 },
  disegna(t, defs, v) {
    const L = IMBRUNIRE;
    // al grido tutti si voltano verso il basso (a sinistra, il lago); Zara e Cervara si alzano
    const volta = rampa(t, 0.7, 1.3);
    const alza = ease.dentroFuori(rampa(t, 1.2, 2.2));
    const zs: PosaZara = { t, andatura: "seduta", involto: true, testa: 4 - 10 * volta, orecchie: 0.2 + 0.8 * volta, sguardo: -0.9 * volta };
    const att = allaPietra(t, v.t, L, defs, {
      rito: { guarda: 0.3 * (1 - volta), testa: -6 * volta },
      zara: { ...zs, verso: { altra: { t, andatura: "fermo", involto: true, testa: -8, orecchie: 1, sguardo: -0.9 }, k: alza } },
      cervara: { andatura: "seduta", testa: 4 - 8 * volta, orecchie: 0.4 + 0.5 * volta, verso: { altra: { t: v.t, andatura: "fermo", testa: -6 }, k: alza } },
      rocco: { testa: 8 - 14 * volta, orecchie: 0.8 * volta },
      remolo: { collo: 0.6 + 0.3 * volta, testa: 6 - 10 * volta },
      brenta: { testa: 4 - 16 * volta },
    });
    const cam = camTra({ x: -140, y: 560, zoom: 0.92 }, { x: -170, y: 560, zoom: 1.02 }, ease.dentroFuori(t / 4.8));
    return { cam, livelli: K.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.2, sole: 0.05, vento: 0.2 }, soleA: [0.1, 0.52], attori: att }) };
  },
};

/** 3 · Dall'Altura, il fischio della marmotta: due colpi lunghi (p.1). */
const s03: Inquadratura = {
  id: "s03",
  titolo: "La marmotta dell'Altura",
  pagina: 1,
  durata: 3.8,
  suoni: [
    { t: 0.6, nome: "fischio", vol: 0.9, durata: 0.95 },
    { t: 2.1, nome: "fischio", vol: 0.9, durata: 0.95 },
  ],
  ambiente: { vento: 0.3, lago: 0, rane: 0.3 },
  disegna(t, defs, v) {
    const L = IMBRUNIRE;
    const fischio = impulso(t, 0.6, 1.55, 0.06, 0.1) + impulso(t, 2.1, 3.05, 0.06, 0.1);
    const att = inPunto(VEDETTA(), marmotta({ t: v.t, ritta: rampa(t, 0, 0.4), fischio: clamp(fischio) }, { luce: L, defs, id: "marmotta" }), { scala: 1.1 });
    const cam = camTra({ x: VEDETTA()[0] + 10, y: VEDETTA()[1] - 60, zoom: 3.2 }, { x: VEDETTA()[0] + 10, y: VEDETTA()[1] - 56, zoom: 3.5 }, t / 3.8);
    return { cam, livelli: A.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.2, sole: 0.05, vento: 0.3 }, soleA: [0.1, 0.52], attori: att }) };
  },
};

/** 4 · Era la sera del rito. La piena arrivò prima: tutti giù di corsa; resta solo il Custode, alla sua velocità (p.1). */
const s04: Inquadratura = {
  id: "s04",
  titolo: "La piena arrivò prima",
  pagina: 1,
  durata: 7.8,
  didascalie: [
    { da: 0.5, a: 3.6, pagina: 1, testo: "Era la sera del rito, alle Coppelle." },
    { da: 4.4, a: 7.2, pagina: 1, testo: "La piena arrivò prima." },
  ],
  suoni: [{ t: 0.3, nome: "galoppo", durata: 2.2, vol: 0.5, ritmo: 2.2 }],
  ambiente: { vento: 0.35, pioggia: 0.3, lago: 0, rane: 0.4 },
  disegna(t, defs, v) {
    const L = mescolaLuce(IMBRUNIRE, NOTTE, rampa(t, 3, 7.8) * 0.7);
    // giù verso il lago (a sinistra), di corsa: Rocco al passo lungo, le linci del rito, Brénta;
    // Zara è già andata. Il Custode resta, e si avvia piano
    const xr = XC.rocco - 340 * t;
    const xb = XC.brenta - 300 * Math.max(0, t - 0.4);
    let att = K.R(xr, { t, andatura: "passo", fase: fase(xr, CICLO.roccoPasso), ampiezza: 1, testa: 4 }, -1, L, defs);
    att += [[1080, "rito3"], [1220, "rito4"], [-1120, "rito2"]]
      .map(([x0, seme], i) => {
        const x = (x0 as number) - 380 * Math.max(0, t - 0.2 * i);
        return K.sulPalco(x, lince({ t: v.t + i, modo: "in piedi", seme: seme as string, fase: fase(x, 92, 0.85), ampiezza: 1 }, { luce: L, defs, id: seme as string }), { verso: -1, scala: 0.85 });
      })
      .join("");
    att += inPunto(suColle(xb), lontra({ t: v.t, zampe: "asta", testa: 6 }, { luce: L, defs, id: "brenta" }), { verso: -1 });
    att += Remolo(suColle(XC.remolo - 26 * Math.max(0, t - 2)), { t: v.t, collo: 0.7, testa: 8, fase: Math.max(0, t - 2) * 0.3 }, -1, L, defs);
    const xz = XC.zara - 460 * t;
    if (xz > -2400) att += K.Z(xz, { t, andatura: "corsa", fase: fase(xz, CICLO.zaraCorsa), ampiezza: 1, involto: true }, -1, L, defs);
    const cam = camTra({ x: 0, y: 580, zoom: 1.05 }, { x: 40, y: 560, zoom: 0.9 }, ease.dentroFuori(rampa(t, 3.8, 7.8)));
    return { cam, livelli: K.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { notte: rampa(t, 3, 7.8) * 0.6, nebbia: 0.15, vento: 0.35, pioggia: 0.3 * rampa(t, 4, 6.5) }, coppelle: true, attori: att }) };
  },
};

/** 5 · Fino a un momento prima le rane cantavano: il coro di ogni sera, sulla soglia delle tane (p.2). */
const s05: Inquadratura = {
  id: "s05",
  titolo: "Il coro di ogni sera",
  pagina: 2,
  durata: 8.8,
  entrata: { tipo: "dissolvenza", durata: 1 },
  didascalie: [{ da: 1.2, a: 8.3, pagina: 2, testo: "Fino a un momento prima le rane cantavano — il coro di ogni sera, il lago d'accordo con se stesso." }],
  ambiente: { vento: 0.2, lago: 0.3, pioggia: 0.2, rane: 1 },
  disegna(t, defs, v) {
    const L = mescolaLuce(IMBRUNIRE, NOTTE, 0.4);
    // tre rane sulla soglia di una tana; poi la pioggia, e il coro va a mezza voce
    const piano = rampa(t, 5.6, 7.6);
    const [xt] = RIVE.tane[1];
    const att = coroDiRane(v.t, L, defs, [[xt - 46, "r1"], [xt + 30, "r2"], [xt + 70, "r3"]], (i) => 1 - (i === 1 ? 0.7 : 0.4) * piano);
    const cam = camTra({ x: xt + 10, y: Q - 22, zoom: 5.2 }, { x: xt + 60, y: Q - 60, zoom: 2.2 }, ease.dentroFuori(rampa(t, 3.0, 8.8)));
    return { cam, livelli: B.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { notte: 0.5, nebbia: 0.12, vento: 0.2, pioggia: 0.35 * rampa(t, 4.6, 7.2) }, attori: att }) };
  },
};

/** 6 · Dall'alto si vedeva tutto: Rivalba nella piena, i massi a filo, le corse piccole lungo le passerelle (p.2). */
const s06: Inquadratura = {
  id: "s06",
  titolo: "Rivalba nella piena",
  pagina: 2,
  durata: 4.8,
  entrata: { tipo: "dissolvenza", durata: 0.8 },
  ambiente: { ...ARIA_PIENA, corrente: 0.15 },
  disegna(t, defs, v) {
    const L = NOTTE;
    const att = cordaSuiMassi(L) + corse(v.t, L, defs) + lontreInAcqua(v.t, L, defs, Q - LIV);
    const cam = camTra({ x: -600, y: 600, zoom: 0.46 }, { x: -480, y: 620, zoom: 0.52 }, ease.dentroFuori(t / 4.8));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: PIOVE, attori: att, piena: PIENA_RIVALBA }) };
  },
};

/** 7 · Il varco: la corrente entra dritta alle tane, e nessuna schiena di lontra la regge (p.3). */
const s07: Inquadratura = {
  id: "s07",
  titolo: "Il varco",
  pagina: 3,
  durata: 7.8,
  entrata: { tipo: "dissolvenza", durata: 0.6 },
  didascalie: [{ da: 0.8, a: 7.4, pagina: 3, testo: "Un varco, dove la corrente entrava dritta alle tane e nessuna schiena di lontra la reggeva." }],
  suoni: [
    { t: 2.3, nome: "schizzo", vol: 0.6 },
    { t: 4.9, nome: "schizzo", vol: 0.55 },
  ],
  ambiente: { ...ARIA_PIENA, corrente: 0.8 },
  disegna(t, defs, v) {
    const L = NOTTE;
    const livello = 56;
    const laguna = 6 + 5 * (t / 7.8);
    const yLago = Q - livello;
    const yLaguna = Q - laguna;
    // due lontre si mettono di schiena nel varco, nell'acqua che passa: la corrente le prende e
    // le porta giù nella laguna, a turno
    const porta = (t0: number, x0: number, dx: number) => {
      if (t < t0) return { x: x0, y: yLago + 2, tv: 0.12 };
      const u = rampa(t, t0, t0 + 1.4, ease.fuori);
      return { x: x0 + dx * u, y: lerp(yLago + 2, yLaguna + 2, ease.dentro(rampa(t, t0, t0 + 0.6))), tv: 1 - rampa(t, t0 + 0.8, t0 + 2.2) };
    };
    const a = porta(2.2, -60, 300);
    const b = porta(4.8, 70, 280);
    const att = Nuota(a.x, a.y, v.t, "argine1", L, defs, -1, { travolta: a.tv }) + Nuota(b.x, b.y, v.t + 1, "argine2", L, defs, 1, { travolta: b.tv });
    const cam = camTra({ x: 30, y: 850, zoom: 2.3 }, { x: 60, y: 856, zoom: 2.55 }, ease.dentroFuori(t / 7.8));
    return { cam, livelli: B.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: PIOVE, attori: att, piena: rive(livello, laguna, 0) }) };
  },
};

/** 8 · E i massi, a filo: una portatrice carica non ha il passo, finisce in acqua, e torna indietro (p.3). */
const s08: Inquadratura = {
  id: "s08",
  titolo: "I massi a filo",
  pagina: 3,
  durata: 6.4,
  didascalie: [{ da: 0.6, a: 5.6, pagina: 3, testo: "E i massi — l'unica strada alta per portare fuori i piccoli —" }],
  suoni: [{ t: 2.3, nome: "schizzo", vol: 0.7 }],
  ambiente: { ...ARIA_PIENA, corrente: 0.2 },
  disegna(t, defs, v) {
    const L = NOTTE;
    // dal primo masso verso il secondo: il salto è corto, finisce in acqua tra i due; si
    // dibatte col piccolo in alto, e risale sul primo
    const a = PRIMO;
    const giu: P = [lerp(PRIMO[0], SECONDO[0], 0.5), Q - LIV + 26];
    let p: P = a;
    let volo = 0;
    let testa = 8;
    let verso: 1 | -1 = 1;
    if (t >= 1.6 && t < 2.3) {
      const u = (t - 1.6) / 0.7;
      p = [lerp(a[0], giu[0], u), lerp(a[1], giu[1], u) - 34 * Math.sin(Math.PI * Math.min(1, u * 1.4))];
      volo = Math.sin(Math.PI * u);
    } else if (t >= 2.3 && t < 3.6) {
      const u = (t - 2.3) / 1.3;
      p = [giu[0] + 8 * Math.sin(u * 11) * (1 - u), giu[1] - 4 * Math.abs(Math.sin(u * 9))];
      testa = -14;
    } else if (t >= 3.6) {
      const u = rampa(t, 3.6, 4.3);
      p = [lerp(giu[0], a[0], u), lerp(giu[1], a[1], u) - 30 * Math.sin(Math.PI * u)];
      volo = Math.sin(Math.PI * u);
      verso = -1;
    }
    const att =
      cordaSuiMassi(L) +
      codaFerma(v.t, L, defs, { quanti: 2, trema: 0.4 }) +
      Lince(p, { t: v.t, modo: "in piedi", seme: "portatrice4", porta: "cucciolo", volo, fase: volo > 0 ? undefined : 0, ampiezza: 0, bagnata: 1, testa, trema: t > 4.3 ? 0.7 : 0 }, t > 4.3 ? 1 : verso, L, defs, "scivola");
    const cam = camTra({ x: -600, y: 800, zoom: 2.2 }, { x: -580, y: 806, zoom: 2.4 }, ease.dentroFuori(t / 6.4));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: PIOVE, attori: att, piena: PIENA_RIVALBA }) };
  },
};

/** 9 · Zara guardava dal bordo, e le zampe le dicevano dentro. Ma era la Forestiera (p.4). */
const s09: Inquadratura = {
  id: "s09",
  titolo: "Dal bordo",
  pagina: 4,
  durata: 10.6,
  entrata: { tipo: "dissolvenza", durata: 0.6 },
  didascalie: [
    { da: 0.6, a: 4.6, pagina: 4, testo: "Zara guardava dal bordo, e le zampe le dicevano dentro" },
    { da: 5.1, a: 10.2, pagina: 4, testo: "Ma era la Forestiera, in un regno che non aveva mai avuto bisogno di nessuno." },
  ],
  ambiente: ARIA_PIENA,
  disegna(t, defs, v) {
    const L = NOTTE;
    // Zara si sporge: il peso avanti, poi indietro (le zampe dicono dentro); sul primo masso la
    // portatrice che non ha il passo, ferma, che trema; intorno il regno lavora senza guardarla
    const dentro = 0.28 * (impulso(t, 1.0, 2.6, 0.5, 0.6) + impulso(t, 3.0, 4.4, 0.4, 0.6));
    const zp: PosaZara = { t, andatura: "fermo", involto: true, bagnata: 1, testa: 10 + 8 * dentro, orecchie: 0.5 + 0.4 * dentro, sguardo: 0.8, verso: { altra: { t, andatura: "acquattata", involto: true, bagnata: 1, testa: 14 }, k: dentro } };
    const att =
      cordaSuiMassi(L) +
      codaFerma(v.t, L, defs, { trema: 0.3 }) +
      Zp([X_BORDO, PASS], zp, 1, L, defs) +
      Lince(PRIMO, { t: v.t, modo: "in piedi", seme: "portatrice4", porta: "cucciolo", bagnata: 1, testa: 18, trema: 0.8 }, 1, L, defs, "scivola");
    const k = traccia([[0, 0], [4.8, 0], [6.4, 1, ease.dentroFuori]])(t);
    const cam = camTra({ x: X_BORDO + 80, y: PASS - 120, zoom: 3.0 }, { x: -920, y: PASS - 120, zoom: 1.5 }, k);
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: PIOVE, attori: att, piena: PIENA_RIVALBA }) };
  },
};

/** 10 · Poi una tana cedette un angolo, e qualcuno strillò piccolo (p.4). */
const s10: Inquadratura = {
  id: "s10",
  titolo: "Una tana cede",
  pagina: 4,
  durata: 5.6,
  didascalie: [{ da: 0.8, a: 5.2, pagina: 4, testo: "Poi una tana cedette un angolo, e qualcuno strillò piccolo," }],
  suoni: [
    { t: 1.0, nome: "crollo", vol: 0.9 },
    { t: 1.75, nome: "strillo", vol: 0.8 },
  ],
  ambiente: { ...ARIA_PIENA, corrente: 0.5 },
  disegna(t, defs, v) {
    const L = NOTTE;
    const [x] = RIVE.tane[RIVE.crolla];
    const crollo = rampa(t, 1.0, 2.2, ease.dentro);
    const cam = camTra({ x: x + 30, y: Q - 56, zoom: 2.6 }, { x: x + 40, y: Q - 50, zoom: 2.9 }, ease.dentroFuori(t / 5.6));
    return { cam: tremito(cam, v.t, 3 * impulso(t, 1.0, 1.8, 0.05, 0.6)), livelli: B.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: PIOVE, piena: rive(58, 14, 0, { crollo }) }) };
  },
};

/** 11 · Zara corre ai massi (bassa e veloce): Cervara organizza le staffette sul primo masso (p.5). */
const s11: Inquadratura = {
  id: "s11",
  titolo: "In testa",
  pagina: 5,
  durata: 8.2,
  didascalie: [{ da: 1.4, a: 7.8, pagina: 5, testo: "Cervara organizzava le staffette sul primo masso — in testa, com'era giusto e come era sempre stato:" }],
  suoni: [{ t: 0, nome: "galoppo", durata: 1.4, vol: 0.5, ritmo: 2.6 }],
  ambiente: ARIA_PIENA,
  disegna(t, defs, v) {
    const L = NOTTE;
    // di corsa lungo la passerella lunga (davanti alla coda), poi si ferma sul bordo; Cervara, sul
    // primo masso, girata verso la fila, dispone: un cenno, un altro
    const xz = X_BORDO - 760 * (1 - ease.fuori(rampa(t, 0, 1.5)));
    const corre = t < 1.4;
    const zp: PosaZara = corre ? { t, andatura: "corsa", fase: fase(xz, CICLO.zaraCorsa), ampiezza: 1, involto: true, bagnata: 1 } : { t, andatura: "fermo", involto: true, bagnata: 1, testa: 6, orecchie: 0.8, sguardo: 0.6 };
    const cenno = impulso(t, 2.2, 3.4, 0.3, 0.4) + impulso(t, 4.6, 5.8, 0.3, 0.4);
    const cp: PosaCervara = { t: v.t, andatura: "fermo", bagnata: 1, testa: -2 + 12 * cenno, orecchie: 0.6, sguardo: 0.4 };
    const att = cordaSuiMassi(L) + codaFerma(v.t, L, defs) + Cp(IN_TESTA, cp, -1, L, defs) + Zp([xz, PASS], zp, 1, L, defs);
    const k = traccia([[0, 0], [1.5, 1, ease.fuori], [2.4, 1], [3.6, 2, ease.dentroFuori]])(t);
    const a: Camera = { x: X_BORDO - 420, y: PASS - 60, zoom: 2.2 };
    const b: Camera = { x: X_BORDO - 20, y: PASS - 70, zoom: 2.0 };
    const c: Camera = { x: -960, y: PASS - 100, zoom: 1.35 };
    const cam = k <= 1 ? camTra(a, b, k) : camTra(b, c, k - 1);
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: PIOVE, attori: att, piena: PIENA_RIVALBA }) };
  },
};

/** 12 · «Di zampa in zampa. Di masso in masso. Si fa così.» Piana anche nell'acqua (p.5). */
const s12: Inquadratura = {
  id: "s12",
  titolo: "Di masso in masso",
  pagina: 5,
  durata: 7.2,
  didascalie: [{ da: 0.5, a: 6.8, pagina: 5, testo: "«Di zampa in zampa,» disse, piana anche nell'acqua. «Di masso in masso. Si fa così.»", chi: "cervara" }],
  ambiente: ARIA_PIENA,
  disegna(t, defs, v) {
    const L = NOTTE;
    const cp: PosaCervara = { t: v.t, andatura: "fermo", bagnata: 1, testa: 2, bocca: v.bocca("cervara"), orecchie: 0.6, sguardo: 0.5 };
    const att = Zp([X_BORDO, PASS], { t, andatura: "fermo", involto: true, bagnata: 1, testa: 4, sguardo: 0.3 }, 1, L, defs) + Cp(IN_TESTA, cp, -1, L, defs);
    const testa: P = [IN_TESTA[0] - 90, IN_TESTA[1] - 128];
    const cam = camTra({ x: testa[0] - 30, y: testa[1] + 34, zoom: 2.9 }, { x: testa[0] - 24, y: testa[1] + 28, zoom: 3.2 }, ease.dentroFuori(t / 7.2));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: PIOVE, attori: att, piena: PIENA_RIVALBA }) };
  },
};

/** Dove si mette Zara accanto alla lince piccola (dietro di lei: la piccola davanti, i massi davanti a tutte e due). */
const X_ACCANTO = -935;

/** 13 · Vicino a Zara, la lince piccola tremava con un batuffolo di fratello in bocca (p.6). */
const s13: Inquadratura = {
  id: "s13",
  titolo: "La lince piccola",
  pagina: 6,
  durata: 8.2,
  didascalie: [
    { da: 0.5, a: 2.8, pagina: 6, testo: "Vicino a Zara, la lince piccola" },
    { da: 3.2, a: 7.8, pagina: 6, testo: "tremava con un batuffolo di fratello in bocca, e i massi davanti." },
  ],
  ambiente: ARIA_PIENA,
  disegna(t, defs, v) {
    const L = NOTTE;
    // la piccola trema all'orlo, i massi davanti; Zara arriva e le si mette accanto (dietro di lei)
    const va = ease.dentroFuori(rampa(t, 4.6, 6.4));
    const xz = lerp(X_ACCANTO - 220, X_ACCANTO, va);
    const att =
      Zp([xz, PASS], { t, andatura: t > 4.6 && t < 6.4 ? "passo" : "fermo", fase: fase(xz, CICLO.zaraPasso), ampiezza: 0.7, involto: true, bagnata: 1, testa: 12, sguardo: 0.7 }, 1, L, defs) +
      Lince([X_PICCOLA, PASS], { t: v.t, modo: "in piedi", seme: "piccola", porta: "cucciolo", trema: 1, bagnata: 1, testa: 10 }, 1, L, defs, "piccola", 0.55);
    const cam = camTra({ x: X_PICCOLA + 50, y: PASS - 56, zoom: 4.4 }, { x: X_PICCOLA - 60, y: PASS - 96, zoom: 2.6 }, ease.dentroFuori(rampa(t, 2.8, 8)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: PIOVE, attori: att, piena: PIENA_RIVALBA }) };
  },
};

/** 14 · «Il peso prima. Poi la zampa. E il masso non ti dice niente.» — e glielo mostra sul posto (p.6). */
const s14: Inquadratura = {
  id: "s14",
  titolo: "Il peso prima",
  pagina: 6,
  durata: 10.4,
  didascalie: [{ da: 0.5, a: 10.0, pagina: 6, testo: "«Il peso prima,» le disse, e glielo mostrò sul posto: appoggi te, poi la zampa. «Poi la zampa. E il masso non ti dice niente.»", chi: "zara" }],
  ambiente: ARIA_PIENA,
  disegna(t, defs, v) {
    const L = NOTTE;
    // sul posto: il corpo va avanti (il peso), POI la zampa si alza e si posa; due volte, lenta
    const peso = 0.45 * (impulso(t, 2.6, 4.6, 0.6, 0.8) + impulso(t, 6.2, 8.2, 0.6, 0.8));
    // la zampa si alza e si posa DOPO che il peso è andato avanti (due volte)
    const passo = rampa(t, 3.6, 4.4) * (1 - rampa(t, 5.4, 6.2)) + rampa(t, 7.2, 8.0);
    const zp: PosaZara = {
      t,
      andatura: "fermo",
      involto: true,
      bagnata: 1,
      testa: 12 - 6 * peso,
      bocca: v.bocca("zara"),
      sguardo: 0.6,
      verso: { altra: { t, andatura: "passo", fase: 0.1 + 0.25 * passo, ampiezza: 0.5, involto: true, bagnata: 1, testa: 10 }, k: peso },
    };
    const att = Zp([X_ACCANTO, PASS], zp, 1, L, defs) + Lince([X_PICCOLA, PASS], { t: v.t, modo: "in piedi", seme: "piccola", porta: "cucciolo", trema: 1 - 0.6 * rampa(t, 6, 9.5), bagnata: 1, testa: 8 }, 1, L, defs, "piccola", 0.55);
    const cam = camTra({ x: X_PICCOLA - 70, y: PASS - 92, zoom: 2.7 }, { x: X_PICCOLA - 66, y: PASS - 88, zoom: 2.95 }, ease.dentroFuori(t / 10.4));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: PIOVE, attori: att, piena: PIENA_RIVALBA }) };
  },
};

/** 15 · La piccola provò: il peso, poi la zampa — e il masso non disse niente. Cervara, avanti, guarda (p.6). */
const s15: Inquadratura = {
  id: "s15",
  titolo: "Il masso non disse niente",
  pagina: 6,
  durata: 5.6,
  didascalie: [{ da: 1.8, a: 5.2, pagina: 6, testo: "La piccola provò. Il masso non disse niente." }],
  ambiente: ARIA_PIENA,
  disegna(t, defs, v) {
    const L = NOTTE;
    // dall'orlo al primo masso: si raccoglie, salta, si posa senza un suono
    const s = diSassoInSasso([[X_PICCOLA, PASS], masso(0, -8)], t, 1.0, 0.6, 1, 20);
    const volo = s.inAria ? Math.sin(Math.PI * s.u) : 0;
    const att =
      Zp([X_ACCANTO, PASS], { t, andatura: "fermo", involto: true, bagnata: 1, testa: 6, sguardo: 0.9, orecchie: 0.8 }, 1, L, defs) +
      Cp(SECONDO, { t: v.t, andatura: "fermo", bagnata: 1, testa: 8, sguardo: 0.6, orecchie: 0.7 }, -1, L, defs) +
      Lince(s.p, { t: v.t, modo: "in piedi", seme: "piccola", porta: "cucciolo", volo, fase: 0, ampiezza: 0, bagnata: 1, testa: 10 - 6 * rampa(t, 2.2, 3) }, 1, L, defs, "piccola", 0.55);
    const cam = camTra({ x: -840, y: 790, zoom: 3.0 }, { x: -700, y: 786, zoom: 2.7 }, ease.dentroFuori(rampa(t, 0.8, 3.2)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: PIOVE, attori: att, piena: PIENA_RIVALBA }) };
  },
};

/** 16 · Alle rive basse: Rocco nell'acqua davanti al varco, la corrente lo scansa; «Serve una diga. Non c'è.» (p.7). */
const s16: Inquadratura = {
  id: "s16",
  titolo: "Serve una diga",
  pagina: 7,
  durata: 7.2,
  entrata: { tipo: "dissolvenza", durata: 0.6 },
  didascalie: [{ da: 2.4, a: 6.8, pagina: 7, testo: "«Serve una diga,» disse la Gente delle Rive. «Non c'è.»", chi: "gente" }],
  suoni: [{ t: 0.6, nome: "guado", durata: 1.6, vol: 0.5, ritmo: 1.2 }],
  ambiente: { ...ARIA_PIENA, corrente: 0.8 },
  disegna(t, defs, v) {
    const L = NOTTE;
    const laguna = 13;
    // la corrente lo scansa e lui rientra, lo scansa e rientra
    const scansa = 70 * (impulso(t, 0.4, 1.8, 0.3, 0.8) + impulso(t, 2.6, 4.0, 0.3, 0.8));
    const xr = X_ROCCO_LAGUNA + scansa;
    const rp: PosaRocco = { t, andatura: "fermo", bagnato: 1, testa: 10, piantato: 0.5, orecchie: -0.4 };
    const bocca = v.bocca("gente");
    const att =
      Rp([xr, Y_LAGUNA], rp, -1, L, defs) +
      Nuota(-250, Q - laguna, v.t, "gente1", L, defs, 1, { bocca }, 1.3) +
      Nuota(560, Q - laguna, v.t + 1, "gente2", L, defs, -1, { bocca: bocca * 0.8 }, 1.3) +
      Nuota(700, Q - laguna + 4, v.t + 2, "gente3", L, defs, -1, { bocca: bocca * 0.9 }, 1.2);
    const cam = camTra({ x: 140, y: 830, zoom: 1.55 }, { x: 160, y: 836, zoom: 1.65 }, ease.dentroFuori(t / 7.2));
    return { cam, livelli: B.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: PIOVE, attori: att, piena: rive(60, laguna, 0) }) };
  },
};

/** 17 · Rocco guardò il varco. Poi guardò se stesso, la cosa più grande sulla riva (p.7). */
const s17: Inquadratura = {
  id: "s17",
  titolo: "La cosa più grande",
  pagina: 7,
  durata: 7.0,
  didascalie: [{ da: 0.5, a: 6.6, pagina: 7, testo: "Rocco guardò il varco. Poi guardò se stesso, che era la cosa più grande sulla riva." }],
  ambiente: { ...ARIA_PIENA, corrente: 0.8 },
  disegna(t, defs, v) {
    const L = NOTTE;
    // lo sguardo al varco (su, verso l'argine), poi giù lungo il suo corpo: e resta lì, a pensarci
    const giu = ease.dentroFuori(rampa(t, 3.4, 4.6));
    const rp: PosaRocco = { t, andatura: "fermo", bagnato: 1, testa: -14 + 44 * giu, occhi: 0.25 * giu, orecchie: 0.4 - 0.6 * giu, pena: 0.3 * giu };
    const att = Rp([X_ROCCO_LAGUNA, Y_LAGUNA], rp, -1, L, defs);
    const cam = camTra({ x: 40, y: 800, zoom: 2.0 }, { x: 170, y: 830, zoom: 1.7 }, ease.dentroFuori(rampa(t, 3.2, 6.4)));
    return { cam, livelli: B.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: PIOVE, attori: att, piena: rive(61, 14, 0) }) };
  },
};

/** 18 · «Reggo io,» disse. Nessuno gli chiese come (p.7). */
const s18: Inquadratura = {
  id: "s18",
  titolo: "Reggo io",
  pagina: 7,
  durata: 4.8,
  didascalie: [{ da: 0.4, a: 4.4, pagina: 7, testo: "«Reggo io,» disse. Nessuno gli chiese come.", chi: "rocco" }],
  ambiente: { ...ARIA_PIENA, corrente: 0.8 },
  disegna(t, defs, v) {
    const L = NOTTE;
    const rp: PosaRocco = { t, andatura: "fermo", bagnato: 1, testa: 4, bocca: v.bocca("rocco"), orecchie: 0.6 };
    const att =
      Rp([X_ROCCO_LAGUNA, Y_LAGUNA], rp, -1, L, defs) +
      Nuota(-230, Q - 14, v.t, "gente1", L, defs, 1, { testa: -10 }, 1.3) +
      Nuota(560, Q - 14, v.t + 1, "gente2", L, defs, -1, { testa: -10 }, 1.3);
    // dal basso, a pelo d'acqua
    const cam = camTra({ x: 90, y: 790, zoom: 2.4 }, { x: 96, y: 784, zoom: 2.6 }, ease.dentroFuori(t / 4.8));
    return { cam, livelli: B.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: PIOVE, attori: att, piena: rive(62, 15, 0) }) };
  },
};

/** Dove si ferma Rèmolo, sulla passerella lunga, accanto a Zara sul bordo (s19–s20): lui girato verso di lei. */
const X_REMOLO = -1240;
/** Zara sul bordo, all'orlo della passerella lunga (s19–s21). */
const X_ORLO_ZARA = -820;

/** 19 · Il Custode anziano arrivò attraverso tutto questo alla sua velocità: lenta (p.8). */
const s19: Inquadratura = {
  id: "s19",
  titolo: "Alla sua velocità",
  pagina: 8,
  durata: 8.2,
  entrata: { tipo: "dissolvenza", durata: 0.6 },
  didascalie: [{ da: 0.6, a: 7.8, pagina: 8, testo: "Il Custode anziano arrivò attraverso tutto questo alla sua velocità, che era una: lenta." }],
  ambiente: ARIA_PIENA,
  disegna(t, defs, v) {
    const L = NOTTE;
    // lui avanza piano lungo la passerella lunga; attorno le corse (chi torna a prendere altri piccoli
    // gli passa davanti, di buon passo, nell'altro verso)
    const xr = X_REMOLO - 460 + 460 * (t / 8.2);
    const xp1 = -700 - 330 * t;
    const xp2 = -760 - 300 * Math.max(0, t - 3.2);
    const att =
      Remolo([xr, PASS], { t: v.t, collo: 0.6, fase: t * 0.3, testa: 4 }, 1, L, defs) +
      Zp([X_ORLO_ZARA, PASS], { t, andatura: "fermo", involto: true, bagnata: 1, testa: 8 }, 1, L, defs) +
      Lince([xp1, PASS], { t: v.t, modo: "in piedi", seme: "corre1", fase: fase(xp1, 92, 0.9), ampiezza: 1, bagnata: 1 }, -1, L, defs, "corre1") +
      (t > 3.2 ? Lince([xp2, PASS], { t: v.t, modo: "in piedi", seme: "corre2", fase: fase(xp2, 92, 0.9), ampiezza: 1, bagnata: 1 }, -1, L, defs, "corre2", 0.95) : "");
    const cam = camTra({ x: X_REMOLO - 380, y: PASS - 90, zoom: 1.7 }, { x: X_REMOLO + 120, y: PASS - 96, zoom: 1.6 }, ease.dentroFuori(t / 8.2));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: PIOVE, attori: att, piena: PIENA_RIVALBA }) };
  },
};

/** 20 · Tre parole: «Il rito aspetta.» — «E si farà?» — «Si farà. Dopo.» (p.8). */
const s20: Inquadratura = {
  id: "s20",
  titolo: "Il rito aspetta",
  pagina: 8,
  durata: 10.2,
  didascalie: [
    { da: 1.2, a: 3.9, pagina: 8, testo: "«Il rito aspetta.»", chi: "custode" },
    { da: 4.6, a: 6.3, pagina: 8, testo: "«E si farà?»", chi: "zara" },
    { da: 7.2, a: 9.8, pagina: 8, testo: "«Si farà. Dopo.»", chi: "custode" },
  ],
  ambiente: ARIA_PIENA,
  disegna(t, defs, v) {
    const L = NOTTE;
    // ogni frase del Custode arriva DOPO un respiro visibile (la sua posa-firma); prima guarda la
    // notte al lavoro (su, verso i massi), poi lei
    const respiro = impulso(t, 0.2, 1.2, 0.4, 0.4) + impulso(t, 6.2, 7.2, 0.4, 0.4);
    const att =
      Remolo([X_REMOLO, PASS], { t: v.t, collo: 0.75, testa: -8 + 10 * rampa(t, 0.4, 1.2), bocca: v.bocca("custode"), respiro }, 1, L, defs) +
      Zp([X_ORLO_ZARA, PASS], { t, andatura: "fermo", involto: true, bagnata: 1, testa: 10, bocca: v.bocca("zara"), sguardo: 0.6, orecchie: 0.5 }, -1, L, defs);
    const k = traccia([[0, 0], [4.2, 0], [4.8, 1, ease.dentroFuori], [6.6, 1], [7.1, 0, ease.dentroFuori]])(t);
    const cam = camTra({ x: X_REMOLO + 200, y: PASS - 80, zoom: 2.6 }, { x: X_ORLO_ZARA - 130, y: PASS - 110, zoom: 2.6 }, k);
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: PIOVE, attori: att, piena: PIENA_RIVALBA }) };
  },
};

/** 21 · Era un gesto semplice: si porta un pegno, si annoda una corda, si torna a casa. Il difficile era esserci (p.9). */
const s21: Inquadratura = {
  id: "s21",
  titolo: "Un gesto semplice",
  pagina: 9,
  durata: 12.8,
  didascalie: [
    { da: 1.0, a: 6.8, pagina: 9, testo: "Era un gesto semplice: si porta un pegno, si annoda una corda, si torna a casa." },
    { da: 7.4, a: 12.4, pagina: 9, testo: "Il difficile, semmai, era tutto il resto: esserci. Contare per qualcuno abbastanza da esserci." },
  ],
  ambiente: { ...ARIA_PIENA, pioggia: 0.6 },
  disegna(t, defs, v) {
    const L = NOTTE;
    // Zara guarda lontano, oltre i massi, verso il colle delle Coppelle; la zampa sull'involto.
    // Poi, larghi: lei piccola sull'orlo, e il regno al lavoro nella notte (esserci)
    const att = cordaSuiMassi(L) + Remolo([X_REMOLO, PASS], { t: v.t, collo: 0.6, testa: 6 }, 1, L, defs) + Zp([X_ORLO_ZARA, PASS], { t, andatura: "fermo", involto: true, bagnata: 1, testa: -8 + 10 * rampa(t, 7, 9), sguardo: 0.8, orecchie: 0.6 }, 1, L, defs) + custodiCheContano(v.t, L, defs);
    const cam = camTra({ x: X_ORLO_ZARA + 60, y: PASS - 120, zoom: 2.6 }, { x: X_ORLO_ZARA + 620, y: PASS - 180, zoom: 0.9 }, ease.dentroFuori(rampa(t, 1.5, 12.8)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { ...PIOVE, pioggia: 0.55 }, attori: att, piena: PIENA_RIVALBA }) };
  },
};

/** 22 · Rocco entrò nel varco e ci si mise di traverso, tutto: la corrente lo prese in pieno, e lui restò (p.10). */
const s22: Inquadratura = {
  id: "s22",
  titolo: "Nel varco",
  pagina: 10,
  durata: 8.4,
  entrata: { tipo: "dissolvenza", durata: 0.6 },
  didascalie: [{ da: 0.6, a: 7.8, pagina: 10, testo: "Rocco entrò nel varco e ci si mise di traverso, tutto, e la corrente lo prese in pieno e lui restò." }],
  suoni: [
    { t: 0.4, nome: "guado", durata: 2.4, vol: 0.6, ritmo: 1.1 },
    { t: 3.2, nome: "schizzo", vol: 0.8 },
  ],
  ambiente: { ...ARIA_PIENA, corrente: 0.9 },
  disegna(t, defs, v) {
    const L = NOTTE;
    // dalla laguna sale sulla soglia del varco, si pianta di traverso; la laguna, dietro, smette di salire
    const va = ease.dentroFuori(rampa(t, 0.4, 3.0));
    const x = lerp(X_ROCCO_LAGUNA, VARCO[0], va);
    const y = lerp(Y_LAGUNA, VARCO[1], ease.dentroFuori(rampa(t, 1.4, 3.0)));
    const piantato = rampa(t, 2.8, 3.6);
    const chiude = rampa(t, 2.9, 3.8);
    const rp: PosaRocco = { t, andatura: t < 3 ? "passo" : "fermo", fase: fase(x, CICLO.roccoPasso), ampiezza: 0.7 * (1 - piantato), bagnato: 1, piantato, testa: 6 + 8 * piantato, orecchie: -0.6 * piantato };
    const colpo = impulso(t, 3.0, 3.8, 0.05, 0.6);
    const laguna = 13 + 3 * rampa(t, 0, 3.4);
    const cam = camTra({ x: 160, y: 800, zoom: 1.45 }, { x: 30, y: 780, zoom: 1.6 }, ease.dentroFuori(t / 8.4));
    return { cam: tremito(cam, v.t, 4 * colpo), livelli: B.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: PIOVE, attori: Rp([x, y], rp, -1, L, defs), piena: rive(62 + 2 * chiude, laguna, chiude) }) };
  },
};

/** 23 · L'acqua salì contro il suo fianco, cercò sopra, cercò sotto, trovò un rinoceronte dappertutto (p.10). */
const s23: Inquadratura = {
  id: "s23",
  titolo: "Un rinoceronte dappertutto",
  pagina: 10,
  durata: 7.2,
  didascalie: [{ da: 0.5, a: 6.8, pagina: 10, testo: "L'acqua salì contro il suo fianco, cercò sopra, cercò sotto, trovò un rinoceronte dappertutto." }],
  ambiente: { ...ARIA_PIENA, corrente: 0.9 },
  disegna(t, defs, v) {
    const L = NOTTE;
    const rp: PosaRocco = { t, andatura: "fermo", bagnato: 1, piantato: 1, testa: 14, orecchie: -0.7, occhi: 0.3 * impulso(t, 2.4, 3.6) };
    // dal basso, vicino: le zampe nell'acqua che passa sotto, gli spruzzi che scavalcano la schiena
    const cam = camTra({ x: -40, y: 790, zoom: 2.2 }, { x: 40, y: 740, zoom: 2.0 }, ease.dentroFuori(t / 7.2));
    return { cam: tremito(cam, v.t, 1.2), livelli: B.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: PIOVE, attori: Rp(VARCO, rp, -1, L, defs), piena: rive(64 + 4 * (t / 7.2), 16, 1) }) };
  },
};

/** 24 · Dietro di lui, di colpo, l'acqua delle tane smise di crescere (p.10). */
const s24: Inquadratura = {
  id: "s24",
  titolo: "Smise di crescere",
  pagina: 10,
  durata: 5.4,
  didascalie: [{ da: 0.5, a: 5.0, pagina: 10, testo: "Dietro di lui, di colpo, l'acqua delle tane smise di crescere." }],
  ambiente: { ...ARIA_PIENA, corrente: 0.6 },
  disegna(t, defs, v) {
    const L = NOTTE;
    const att = Rp(VARCO, { t, andatura: "fermo", bagnato: 1, piantato: 1, testa: 14, orecchie: -0.7 }, -1, L, defs);
    // dalla tana vicina al varco, larghi: l'acqua ferma sotto le bocche, e i due occhi che tornano a guardare
    const cam = camTra({ x: RIVE.tane[3][0] + 20, y: Q - 60, zoom: 2.4 }, { x: 300, y: 820, zoom: 1.1 }, ease.dentroFuori(rampa(t, 0.8, 5.4)));
    return { cam, livelli: B.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: PIOVE, attori: att, piena: rive(68, 16, 1, { crollo: 1 }) }) };
  },
};

/** 25 · «TIENE!» gridò qualcuno: e la parola corre per la riva (p.10). */
const s25: Inquadratura = {
  id: "s25",
  titolo: "Tiene",
  pagina: 10,
  durata: 4.6,
  didascalie: [{ da: 0.3, a: 3.4, pagina: 10, testo: "«TIENE!» gridò qualcuno,", chi: "gente" }],
  ambiente: { ...ARIA_PIENA, corrente: 0.6 },
  disegna(t, defs, v) {
    const L = NOTTE;
    // una lontra sull'argine salta su e grida; poi le teste nell'acqua si voltano una dopo l'altra (la parola che corre)
    const su = ease.fuori(rampa(t, 0.1, 0.5));
    const bocca = v.bocca("gente");
    const x0 = 820;
    const att =
      inPunto([x0, B.quota(x0) + 2], lontra({ t: v.t, zampe: "ferme", seme: "tiene", bocca, testa: -18 * su, china: -6 * su }, { luce: L, defs, id: "tiene" }), { verso: -1, scala: 0.9 }) +
      [1150, 1450, 1750].map((x, i) => Nuota(x, Q - 16, v.t + i, `voce${i}`, L, defs, 1, { bocca: impulso(t, 1.6 + i * 0.45, 2.4 + i * 0.45, 0.1, 0.2) * 0.8, testa: -8 })).join("");
    const cam = camTra({ x: x0 + 40, y: 760, zoom: 2.2 }, { x: 1400, y: 800, zoom: 1.2 }, ease.dentroFuori(rampa(t, 1.2, 4.4)));
    return { cam, livelli: B.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: PIOVE, attori: att, piena: rive(68, 16, 1, { crollo: 1 }) }) };
  },
};

/** 26 · Zara, sul primo masso, sentì la parola arrivare e passare oltre. Tiene (p.11). */
const s26: Inquadratura = {
  id: "s26",
  titolo: "La parola passa",
  pagina: 11,
  durata: 6.4,
  entrata: { tipo: "dissolvenza", durata: 0.5 },
  didascalie: [{ da: 0.6, a: 6.0, pagina: 11, testo: "Zara, sul primo masso, sentì la parola arrivare e passare oltre. Tiene." }],
  ambiente: ARIA_PIENA,
  disegna(t, defs, v) {
    const L = NOTTE;
    // la parola viene dalle rive basse (da sinistra): le teste della coda si voltano una dopo
    // l'altra, poi Zara sul primo masso, poi Cervara sul secondo — e la parola va oltre
    const volta = (x: number) => impulso(t, 0.8 + (x + 1600) / 520, 2.6 + (x + 1600) / 520, 0.2, 0.6);
    const att =
      cordaSuiMassi(L) +
      codaFerma(v.t, L, defs, { teste: (x) => -16 * volta(x) }) +
      Cp(SECONDO, { t: v.t, andatura: "fermo", bagnata: 1, testa: 4 - 10 * volta(SECONDO[0]), orecchie: 0.5 + 0.5 * volta(SECONDO[0]), sguardo: -0.3 }, -1, L, defs) +
      Zp(masso(0, -12), { t, andatura: "fermo", involto: true, bagnata: 1, testa: -4 - 8 * volta(PRIMO[0]), orecchie: 0.4 + 0.6 * volta(PRIMO[0]), sguardo: 0.3 }, -1, L, defs);
    const cam = camTra({ x: -1260, y: PASS - 80, zoom: 1.8 }, { x: -740, y: PASS - 100, zoom: 2.1 }, ease.dentroFuori(rampa(t, 0.4, 5.6)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: PIOVE, attori: att, piena: PIENA_RIVALBA }) };
  },
};

/** Le partenze delle staffette dall'orlo (s27): una ogni due passi. */
const PARTENZE_27: readonly number[] = [1.3, 1.3 + 2 * PASSO_FILA, 1.3 + 4 * PASSO_FILA];

/** 27 · Le staffette partono: un piccolo, poi un altro, poi una nidiata di topi d'acqua in una cesta (p.12). */
const s27: Inquadratura = {
  id: "s27",
  titolo: "Le staffette",
  pagina: 12,
  durata: 11.2,
  didascalie: [{ da: 0.6, a: 10.8, pagina: 12, testo: "Le staffette partirono. Di zampa in zampa, di masso in masso: un piccolo, poi un altro, poi una nidiata intera di topi d'acqua dentro una cesta di giunchi." }],
  ambiente: ARIA_PIENA,
  disegna(t, defs, v) {
    const L = NOTTE;
    // Cervara in testa, dal secondo masso; dietro, dalla coda all'orlo e poi di masso in masso,
    // le portatrici a due passi l'una dall'altra; Zara resta sul bordo a farle partire
    const cs = traversata(t, 0.4, TRAVERSATA.slice(2), 1);
    const va = t > 0.4 && !cs.cammina;
    const cervaraD = Cp(cs.p, { t: v.t, andatura: va || cs.cammina ? "passo" : "fermo", fase: cs.cammina ? fase(cs.p[0], CICLO.cervaraPasso, SC_C) : (t - 0.4) * 1.55, ampiezza: va || cs.cammina ? 1 : 0, bagnata: 1, testa: 2 }, 1, L, defs);
    const fila = CODA.map(([seme, porta], k) => portatrice(t, v.t, k, PARTENZE_27, seme, porta, L, defs)).join("");
    const att = cordaSuiMassi(L) + Zp([X_BORDO - 40, PASS], { t, andatura: "fermo", involto: true, bagnata: 1, testa: 6, sguardo: 0.4 }, 1, L, defs) + fila + cervaraD + custodiCheContano(v.t, L, defs);
    const cam = camTra({ x: -760, y: 760, zoom: 1.1 }, { x: 260, y: 760, zoom: 0.95 }, ease.dentroFuori(rampa(t, 1.0, 11.2)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: PIOVE, attori: att, piena: PIENA_RIVALBA }) };
  },
};

/** 28 · E la fila prese un ritmo: peso, zampa. Peso, zampa (p.12). */
const s28: Inquadratura = {
  id: "s28",
  titolo: "Peso, zampa",
  pagina: 12,
  durata: 7.2,
  didascalie: [{ da: 0.5, a: 6.8, pagina: 12, testo: "E la fila prese un ritmo, perché le file lo prendono sempre: peso, zampa. Peso, zampa." }],
  ambiente: ARIA_PIENA,
  disegna(t, defs, v) {
    const L = NOTTE;
    // da vicino, un masso a filo: le portatrici ci passano sopra una dopo l'altra, a tempo
    let fila = "";
    const semi = ["portatrice1", "portatrice2", "portatrice3", "portatrice4", "portatrice5", "portatrice6"] as const;
    semi.forEach((seme, i) => {
      const t0 = -2.2 + i * 2 * PASSO_FILA;
      if (t < t0) return;
      const s = traversata(t, t0, TRAVERSATA, 1);
      fila += Lince(s.p, { t: v.t + i, modo: "in piedi", seme, porta: i % 3 === 1 ? "cesta" : "cucciolo", volo: s.volo, fase: s.inAria ? undefined : 0, ampiezza: 0, bagnata: 1, testa: 6 }, 1, L, defs, seme);
    });
    const m = masso(2);
    const cam = camTra({ x: m[0] - 40, y: m[1] - 50, zoom: 2.3 }, { x: m[0] - 10, y: m[1] - 50, zoom: 2.5 }, ease.dentroFuori(t / 7.2));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: PIOVE, attori: cordaSuiMassi(L) + fila, piena: PIENA_RIVALBA }) };
  },
};

/** Cervara in testa, ferma sul primo masso nel momento peggiore: guarda l'acqua (s29–s33). */
const cervaraFerma = (mondo: number, L: Luce, defs: Defs, o: Partial<PosaCervara> = {}, verso: 1 | -1 = 1) => Cp(IN_TESTA, { t: mondo, andatura: "fermo", bagnata: 1, testa: 20, orecchie: -0.2, sguardo: 0.1, ...o }, verso, L, defs);

/** 29 · A metà della notte l'acqua trovò il suo punto più alto e ci rimase, a pensarci (p.13). */
const s29: Inquadratura = {
  id: "s29",
  titolo: "Il punto più alto",
  pagina: 13,
  durata: 6.2,
  entrata: { tipo: "dissolvenza", durata: 0.8 },
  didascalie: [{ da: 0.6, a: 5.8, pagina: 13, testo: "A metà della notte l'acqua trovò il suo punto più alto e ci rimase, a pensarci." }],
  ambiente: { ...ARIA_PIENA, rane: 0.25, pioggia: 0.5 },
  disegna(t, defs, v) {
    const L = NOTTE;
    const att = cordaSuiMassi(L) + codaFerma(v.t, L, defs, { piccola: true, trema: 0.3 }) + Zp([X_BORDO, PASS], { t, andatura: "fermo", involto: true, bagnata: 1, testa: 4 }, 1, L, defs) + cervaraFerma(v.t, L, defs);
    const cam = camTra({ x: -360, y: 700, zoom: 0.6 }, { x: -340, y: 710, zoom: 0.64 }, ease.dentroFuori(t / 6.2));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { ...PIOVE, pioggia: 0.5 }, attori: att, piena: PIENA_ALTA }) };
  },
};

/** 30 · Nel varco, Rocco non si vedeva quasi più (p.13). */
const s30: Inquadratura = {
  id: "s30",
  titolo: "Non si vedeva quasi più",
  pagina: 13,
  durata: 3.6,
  ambiente: { ...ARIA_PIENA, corrente: 1, rane: 0.15 },
  disegna(t, defs, v) {
    const L = NOTTE;
    const att = Rp(VARCO, { t, andatura: "fermo", bagnato: 1, piantato: 1, testa: 18, orecchie: -1, occhi: 0.6 }, -1, L, defs);
    const cam = camTra({ x: 0, y: 770, zoom: 1.4 }, { x: 0, y: 776, zoom: 1.5 }, t / 3.6);
    return { cam: tremito(cam, v.t, 1.5), livelli: B.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { ...PIOVE, pioggia: 0.9 }, attori: att, davanti: veloDiSpruzzi(v.t, 1), piena: rive(76, 16, 1) }) };
  },
};

/** 31 · La fila rallenta; e Zara sente che alla fila serve una testa che non guardi l'acqua (p.13). */
const s31: Inquadratura = {
  id: "s31",
  titolo: "Una testa",
  pagina: 13,
  durata: 7.8,
  didascalie: [{ da: 0.6, a: 7.4, pagina: 13, testo: "E Zara sentì che il ritmo, da solo, non bastava più: alla fila serviva una testa che non guardasse l'acqua." }],
  ambiente: { ...ARIA_PIENA, rane: 0.12, pioggia: 0.5 },
  disegna(t, defs, v) {
    const L = NOTTE;
    // Cervara in testa sul primo masso, ferma, la testa verso l'acqua; la coda stretta dietro; Zara sul bordo
    const att =
      cordaSuiMassi(L) +
      codaFerma(v.t, L, defs, { piccola: true, trema: 0.5 }) +
      Zp([X_BORDO, PASS], { t, andatura: "fermo", involto: true, bagnata: 1, testa: 2 - 4 * rampa(t, 3, 5), orecchie: 0.3 + 0.6 * rampa(t, 3, 5), sguardo: 0.9 }, 1, L, defs) +
      cervaraFerma(v.t, L, defs);
    const cam = camTra({ x: -1060, y: PASS - 70, zoom: 1.4 }, { x: X_BORDO + 90, y: PASS - 110, zoom: 2.2 }, ease.dentroFuori(rampa(t, 1.5, 7.8)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { ...PIOVE, pioggia: 0.5 }, attori: att, piena: PIENA_ALTA }) };
  },
};

/** 32 · Le rane tacevano. Quando il lago trattiene il fiato, qualcuno deve respirare per lui (p.14). */
const s32: Inquadratura = {
  id: "s32",
  titolo: "Le rane tacevano",
  pagina: 14,
  durata: 9.6,
  didascalie: [
    { da: 1.4, a: 4.6, pagina: 14, testo: "Fu lì che se ne accorse: le rane tacevano." },
    { da: 5.2, a: 9.2, pagina: 14, testo: "Quando il lago trattiene il fiato, qualcuno deve respirare per lui." },
  ],
  ambiente: { vento: 0.2, pioggia: 0.35, lago: 0.3, notte: 1, rane: 0 },
  disegna(t, defs, v) {
    const L = NOTTE;
    // il muso di Zara: le orecchie che cercano (il coro non c'è), poi lo sguardo alla fila ferma e al primo masso
    const cerca = Math.sin(t * 1.6) * (1 - rampa(t, 4.5, 5.5));
    const zp: PosaZara = { t, andatura: "fermo", involto: true, bagnata: 1, testa: 4 * cerca, orecchie: 0.9 + 0.1 * cerca, sguardo: 0.2 + 0.7 * rampa(t, 5.5, 6.5), occhi: 0 };
    const att = Zp([X_BORDO, PASS], zp, 1, L, defs) + cervaraFerma(v.t, L, defs);
    const testa: P = [X_BORDO + 128, PASS - 128];
    const cam = camTra({ x: testa[0] - 10, y: testa[1] + 10, zoom: 3.4 }, { x: testa[0] + 90, y: testa[1] + 26, zoom: 2.2 }, ease.dentroFuori(rampa(t, 5.2, 9.2)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { ...PIOVE, pioggia: 0.35, vento: 0.2 }, attori: att, piena: { livello: PICCO, corrente: 0.05 } }) };
  },
};

/** Cervara, fatto il passo di lato: giù dal colmo del primo masso, davanti, nell'acqua fino ai garretti. */
const CERVARA_DI_LATO: P = [IN_TESTA[0] + 44, IN_TESTA[1] + 36];

/** 33 · Cervara si voltò a cercarla — e fece la cosa che nessuno aveva mai visto fare al vanto delle rive: un passo di lato (p.15). */
const s33: Inquadratura = {
  id: "s33",
  titolo: "Un passo di lato",
  pagina: 15,
  durata: 9.8,
  didascalie: [{ da: 0.5, a: 9.4, pagina: 15, testo: "Cervara, in testa, si voltò a cercarla — e fece la cosa che nessuno, a Rivalba, aveva mai visto fare al vanto delle rive: un passo di lato." }],
  ambiente: { vento: 0.2, pioggia: 0.3, lago: 0.3, notte: 1, rane: 0 },
  disegna(t, defs, v) {
    const L = NOTTE;
    // si volta (verso Zara, a sinistra), la guarda; poi un passo: giù dal colmo, verso chi guarda
    const volta = t > 1.4;
    const lato = ease.dentroFuori(rampa(t, 6.4, 8.2));
    const p: P = [lerp(IN_TESTA[0], CERVARA_DI_LATO[0], lato), lerp(IN_TESTA[1], CERVARA_DI_LATO[1], lato)];
    const cp: PosaCervara = { t: v.t, andatura: t > 6.4 && t < 8.2 ? "passo" : "fermo", fase: lato * 1.2, ampiezza: 0.6, bagnata: 1, testa: volta ? 4 + 10 * lato : 20, sguardo: volta ? 0.7 : 0.1, orecchie: 0.5 };
    const att =
      cordaSuiMassi(L) +
      codaFerma(v.t, L, defs, { piccola: true, trema: 0.4 }) +
      Zp([X_BORDO, PASS], { t, andatura: "fermo", involto: true, bagnata: 1, testa: 2, orecchie: 0.9, sguardo: 0.8 - 0.4 * rampa(t, 7, 8.5), occhi: 0.2 * impulso(t, 8.2, 9.6) }, 1, L, defs) +
      Cp(p, cp, volta ? -1 : 1, L, defs, SC_C * (1 + 0.04 * lato));
    const cam = camTra({ x: -770, y: PASS - 110, zoom: 2.0 }, { x: -780, y: PASS - 92, zoom: 1.85 }, ease.dentroFuori(t / 9.8));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { ...PIOVE, pioggia: 0.3, vento: 0.2 }, attori: att, piena: { livello: PICCO, corrente: 0.05 } }) };
  },
};

/** 34 · «Il peso prima. Tu lo porti meglio. Vai.» (p.15). */
const s34: Inquadratura = {
  id: "s34",
  titolo: "Tu lo porti meglio",
  pagina: 15,
  durata: 6.2,
  didascalie: [{ da: 0.4, a: 5.8, pagina: 15, testo: "«Il peso prima,» disse soltanto. «Tu lo porti meglio. Vai.»", chi: "cervara" }],
  ambiente: { vento: 0.2, pioggia: 0.3, lago: 0.3, notte: 1, rane: 0 },
  disegna(t, defs, v) {
    const L = NOTTE;
    const att =
      Zp([X_BORDO, PASS], { t, andatura: "fermo", involto: true, bagnata: 1, testa: 0, orecchie: 0.9, sguardo: 0.6 }, 1, L, defs) +
      Cp(CERVARA_DI_LATO, { t: v.t, andatura: "fermo", bagnata: 1, testa: 12, bocca: v.bocca("cervara"), sguardo: 0.6 }, -1, L, defs, SC_C * 1.04);
    const testa: P = [CERVARA_DI_LATO[0] - 92, CERVARA_DI_LATO[1] - 132];
    const cam = camTra({ x: testa[0] - 30, y: testa[1] + 30, zoom: 2.7 }, { x: testa[0] - 24, y: testa[1] + 24, zoom: 3.0 }, ease.dentroFuori(t / 6.2));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { ...PIOVE, pioggia: 0.3, vento: 0.2 }, attori: att, piena: { livello: PICCO, corrente: 0.05 } }) };
  },
};

/** Quando Zara salta sul primo masso (s35), e le partenze di chi la segue (la piccola per ultima). */
const T0_ZARA = 0.9;
const PARTENZE_35: readonly number[] = [0, 1, 2, 3].map((k) => T0_ZARA + (k + 1) * 2 * PASSO_FILA);

/** 35 · Zara andò: il peso, poi la zampa; e dietro di lei la fila riprese la conta, fino all'ultimo piccolo passato (p.15). */
const s35: Inquadratura = {
  id: "s35",
  titolo: "Zara andò",
  pagina: 15,
  durata: 12.4,
  didascalie: [
    { da: 0.3, a: 2.0, pagina: 15, testo: "Zara andò." },
    { da: 2.6, a: 12.0, pagina: 15, testo: "E dietro di lei la fila riprese la conta dalla sua schiena, e la conta tenne, e i massi non dissero niente fino all'ultimo piccolo passato." },
  ],
  ambiente: { vento: 0.2, pioggia: 0.25, lago: 0.35, notte: 1, rane: 0 },
  disegna(t, defs, v) {
    const L = NOTTE;
    // Zara all'orlo (due passi), poi in testa col passo di Cervara, lungo e basso, senza fermarsi;
    // dietro, a due passi, la fila; per ultima la piccola col fratello
    const xz0 = lerp(X_BORDO, X_ORLO, ease.dentroFuori(rampa(t, 0.1, T0_ZARA - 0.05)));
    let zp: PosaZara;
    let pz: P;
    if (t < T0_ZARA) {
      pz = [xz0, PASS];
      zp = { t, andatura: t > 0.1 ? "passo" : "fermo", fase: fase(xz0, CICLO.zaraPasso), ampiezza: 0.8, involto: true, bagnata: 1, testa: 2 };
    } else {
      const zs = traversata(t, T0_ZARA, TRAVERSATA, 1, 26);
      pz = zs.p;
      zp = { t, andatura: "passo", fase: zs.cammina ? fase(zs.p[0], CICLO.zaraPasso) : (t - T0_ZARA) * 1.5, ampiezza: 1, involto: true, bagnata: 1, testa: 0 };
    }
    let fila = CODA.map(([seme, porta], k) => portatrice(t, v.t, k, PARTENZE_35, seme, porta, L, defs)).join("");
    fila += portatrice(t, v.t, 3, PARTENZE_35, "piccola", "cucciolo", L, defs, { scala: 0.55 });
    const att = cordaSuiMassi(L) + Zp(pz, zp, 1, L, defs) + fila + Cp(CERVARA_DI_LATO, { t: v.t, andatura: "fermo", bagnata: 1, testa: 6, sguardo: 0.4 }, 1, L, defs, SC_C * 1.04);
    const cam = camTra({ x: -820, y: PASS - 90, zoom: 1.7 }, { x: 180, y: 770, zoom: 0.9 }, ease.dentroFuori(rampa(t, 1.0, 11.5)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { ...PIOVE, pioggia: 0.25, vento: 0.2 }, attori: att, piena: { livello: PICCO - 2, corrente: 0.1 } }) };
  },
};

/** 36 · L'alba arrivò grigia e poi meno grigia, e trovò la piena stanca (p.16). */
const s36: Inquadratura = {
  id: "s36",
  titolo: "La piena stanca",
  pagina: 16,
  durata: 6.0,
  entrata: { tipo: "nero", durata: 1.2 },
  didascalie: [{ da: 1.0, a: 5.6, pagina: 16, testo: "L'alba arrivò grigia e poi meno grigia, e trovò la piena stanca." }],
  ambiente: { vento: 0.15, lago: 0.4, rane: 0 },
  disegna(t, defs, v) {
    const L = mescolaLuce(NOTTE, ALBA, 0.3 + 0.4 * rampa(t, 0, 6));
    // le portatrici addormentate dove la fila è arrivata, sulla passerella corta, coi piccoli; l'acqua che cala
    const att = [[1000, "dorme1"], [1130, "dorme2"], [1260, "dorme3"]]
      .map(([x, seme], i) => Lince([x as number, PASS], { t: v.t + i, modo: "seduta", seme: seme as string, testa: 18, bagnata: 0.6 }, -1, L, defs, seme as string, 0.8))
      .join("");
    const cam = camTra({ x: 200, y: 700, zoom: 0.55 }, { x: 300, y: 700, zoom: 0.6 }, ease.dentroFuori(t / 6));
    return {
      cam,
      livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { lavato: 0.6, nebbia: 0.6, sole: 0.02, vento: 0.15, notte: 0.45 * (1 - rampa(t, 0, 6)), pioggia: 0.1 * (1 - rampa(t, 0, 3)) }, attori: att, piena: { livello: 22 - 6 * (t / 6), corrente: 0.1 } }),
    };
  },
};

/** 37 · Nel varco, Rocco era ancora lì: c'era entrato rinoceronte, era diventato riva; la riva lo restituisce, un fianco alla volta (p.16). */
const s37: Inquadratura = {
  id: "s37",
  titolo: "Diventato riva",
  pagina: 16,
  durata: 10.4,
  entrata: { tipo: "dissolvenza", durata: 0.8 },
  didascalie: [{ da: 0.6, a: 10.0, pagina: 16, testo: "Nel varco, Rocco era ancora lì: c'era entrato rinoceronte ed era diventato riva, e adesso la riva lo restituiva a fatica, un fianco alla volta." }],
  suoni: [
    { t: 5.0, nome: "guado", durata: 0.8, vol: 0.5, ritmo: 1 },
    { t: 7.2, nome: "guado", durata: 2.4, vol: 0.5, ritmo: 0.9 },
  ],
  ambiente: { vento: 0.1, lago: 0.4, rane: 0 },
  disegna(t, defs, v) {
    const L = mescolaLuce(NOTTE, ALBA, 0.8);
    // fermo, di fango fino alla pancia; poi una zampa si stacca, poi l'altra, e scende adagio verso la laguna
    const esce = rampa(t, 7.2, 10.4, ease.dentroFuori);
    const x = lerp(VARCO[0], 300, esce);
    const y = lerp(VARCO[1], Y_LAGUNA - 20, ease.dentroFuori(rampa(t, 8, 10.4)));
    const rp: PosaRocco = { t, andatura: t > 7.2 ? "passo" : "fermo", fase: fase(x, CICLO.roccoPasso), ampiezza: 0.4, fango: 1, bagnato: 0.8, piantato: 1 - rampa(t, 4.5, 6), zampaSu: impulso(t, 4.8, 6.2, 0.3, 0.5), testa: 16 - 8 * rampa(t, 4.5, 6), occhi: 0.3 };
    const cam = camTra({ x: 40, y: 780, zoom: 1.7 }, { x: 160, y: 800, zoom: 1.5 }, ease.dentroFuori(t / 10.4));
    return { cam, livelli: B.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { lavato: 0.5, nebbia: 0.45, sole: 0.06, vento: 0.1 }, soleA: [0.82, 0.42], attori: Rp([x, y], rp, 1, L, defs), piena: rive(18, 6, 0, { crollo: 1 }) }) };
  },
};

/** 38 · «Ho freddo alle ginocchia,» disse Rocco (p.16). */
const s38: Inquadratura = {
  id: "s38",
  titolo: "Freddo alle ginocchia",
  pagina: 16,
  durata: 4.6,
  didascalie: [{ da: 0.4, a: 4.2, pagina: 16, testo: "«Ho freddo alle ginocchia,» disse Rocco.", chi: "rocco" }],
  ambiente: { vento: 0.1, lago: 0.4, rane: 0 },
  disegna(t, defs, v) {
    const L = ALBA;
    const rp: PosaRocco = { t, andatura: "fermo", fango: 1, bagnato: 0.8, testa: 10, bocca: v.bocca("rocco"), pena: 0.5, orecchie: -0.3 };
    const p: P = [300, Y_LAGUNA - 20];
    const cam = camTra({ x: 470, y: 760, zoom: 2.6 }, { x: 460, y: 750, zoom: 2.8 }, ease.dentroFuori(t / 4.6));
    return { cam, livelli: B.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { lavato: 0.4, nebbia: 0.35, sole: 0.12, vento: 0.1 }, soleA: [0.82, 0.4], attori: Rp(p, rp, 1, L, defs), piena: rive(16, 5, 0, { crollo: 1 }) }) };
  },
};

/** 39 · Alle Coppelle salirono tutti, bagnati, alla luce nuova (p.17). */
const s39: Inquadratura = {
  id: "s39",
  titolo: "Alla luce nuova",
  pagina: 17,
  durata: 6.0,
  entrata: { tipo: "dissolvenza", durata: 1 },
  didascalie: [{ da: 1.0, a: 5.6, pagina: 17, testo: "Alle Coppelle salirono tutti, bagnati, alla luce nuova." }],
  ambiente: { vento: 0.15, lago: 0, rane: 0 },
  disegna(t, defs, v) {
    const L = mescolaLuce(ALBA, MATTINO, rampa(t, 0, 6) * 0.5);
    const att = allaPietra(t, v.t, L, defs, { bagnati: 0.6, custodia: 0, rocco: { fango: 1, bagnato: 0.5 } });
    const cam = camTra({ x: -60, y: 520, zoom: 0.6 }, { x: -40, y: 560, zoom: 0.74 }, ease.dentroFuori(t / 6));
    return { cam, livelli: K.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { lavato: 0.5, nebbia: 0.3, sole: 0.15, vento: 0.15 }, soleA: [0.85, 0.34], coppelle: true, attori: att }) };
  },
};

/** 40 · Il Custode aprì la custodia del pegno — la scaglia del fuoco del regno. La custodia era vuota (p.17). */
const s40: Inquadratura = {
  id: "s40",
  titolo: "La custodia era vuota",
  pagina: 17,
  durata: 13.0,
  didascalie: [
    { da: 0.5, a: 9.6, pagina: 17, testo: "Il Custode anziano aprì la custodia del pegno — la scaglia del fuoco del regno, che viaggiava sulla barca di Brénta per i giorni che contano." },
    { da: 10.2, a: 12.6, pagina: 17, testo: "La custodia era vuota." },
  ],
  suoni: [{ t: 8.2, nome: "coperchio", vol: 0.8 }],
  ambiente: { vento: 0.1, lago: 0, rane: 0 },
  disegna(t, defs, v) {
    const L = MATTINO;
    // il collo di Rèmolo si allunga sulla pietra; il coperchio si alza col suo muso; dentro, niente
    const collo = 0.6 + 0.4 * rampa(t, 5.5, 7.5);
    const aperta = ease.dentroFuori(rampa(t, 8.2, 9.6));
    const att = allaPietra(t, v.t, L, defs, { bagnati: 0.5, remolo: { collo, testa: 14 + 10 * rampa(t, 6, 8) }, custodia: aperta, zara: { sguardo: 0.9, testa: 12 }, rocco: { fango: 1, bagnato: 0.4 } });
    const k = traccia([[0, 0], [5.0, 0], [8.0, 1, ease.dentroFuori], [10.0, 1], [10.6, 2, ease.dentroFuori]])(t);
    const a: Camera = { x: 0, y: 580, zoom: 1.25 };
    const b: Camera = { x: CUSTODIA[0] + 60, y: CUSTODIA[1] - 40, zoom: 2.6 };
    const c: Camera = { x: CUSTODIA[0] + 16, y: CUSTODIA[1] - 30, zoom: 4.6 };
    const cam = k <= 1 ? camTra(a, b, k) : camTra(b, c, k - 1);
    return { cam, livelli: K.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { lavato: 0.4, nebbia: 0.25, sole: 0.2, vento: 0.1 }, soleA: [0.85, 0.3], coppelle: true, attori: att }) };
  },
};

/** 41 · Nessuno disse ladro: le facce attorno alla pietra, ferme (p.17). */
const s41: Inquadratura = {
  id: "s41",
  titolo: "Nessuno disse ladro",
  pagina: 17,
  durata: 3.6,
  didascalie: [{ da: 0.6, a: 2.8, pagina: 17, testo: "Nessuno disse ladro." }],
  ambiente: { vento: 0.12, lago: 0, rane: 0 },
  disegna(t, defs, v) {
    const L = MATTINO;
    // nessuno parla: le facce attorno alla pietra e alla custodia aperta; Brénta col muso basso
    const att = allaPietra(t, v.t, L, defs, {
      bagnati: 0.4,
      custodia: 1,
      remolo: { collo: 0.5, testa: 10 },
      zara: { testa: 14, orecchie: -0.2, sguardo: 0.9 },
      rocco: { testa: 16, pena: 0.6, fango: 1, bagnato: 0.3 },
      cervara: { testa: 12 },
      brenta: { testa: 14, china: 6 },
    });
    const cam = camTra({ x: -60, y: 590, zoom: 1.1 }, { x: -80, y: 596, zoom: 1.2 }, ease.dentroFuori(t / 3.6));
    return { cam, livelli: K.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { lavato: 0.3, nebbia: 0.25, sole: 0.22, vento: 0.12 }, soleA: [0.85, 0.28], coppelle: true, attori: att }) };
  },
};

/** 42 · E Brénta guardava la sua barca, giù al molo: quel che guarda — la barca ormeggiata, sola, nell'acqua che cala (p.17). */
const s42: Inquadratura = {
  id: "s42",
  titolo: "La barca al molo",
  pagina: 17,
  durata: 6.8,
  didascalie: [{ da: 0.4, a: 6.4, pagina: 17, testo: "e Brénta guardava la sua barca, giù al molo, come si guarda una zampa che ti ha tradito." }],
  ambiente: { vento: 0.12, lago: 0.5, rane: 0 },
  disegna(t, defs, v) {
    const L = mescolaLuce(ALBA, MATTINO, 0.7);
    // giù a Rivalba: la barca contro il molo, il telo sul carico; l'acqua della piena che se ne va
    const cam = camTra({ x: 1480, y: 800, zoom: 1.3 }, { x: 1560, y: 826, zoom: 1.5 }, ease.dentroFuori(t / 6.8));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { lavato: 0.3, nebbia: 0.35, sole: 0.2, vento: 0.12 }, piena: { livello: 12, corrente: 0.05 } }) };
  },
};

/** 43 · «Il rito non aspetta due volte,» disse il Custode (p.18). */
const s43: Inquadratura = {
  id: "s43",
  titolo: "Non aspetta due volte",
  pagina: 18,
  durata: 7.0,
  entrata: { tipo: "dissolvenza", durata: 0.6 },
  didascalie: [{ da: 1.3, a: 6.6, pagina: 18, testo: "«Il rito non aspetta due volte,» disse il Custode.", chi: "custode" }],
  ambiente: { vento: 0.1, lago: 0, rane: 0 },
  disegna(t, defs, v) {
    const L = MATTINO;
    const respiro = impulso(t, 0.2, 1.2, 0.4, 0.4);
    const att = allaPietra(t, v.t, L, defs, { bagnati: 0.3, custodia: 1, remolo: { collo: 0.7, testa: 2, bocca: v.bocca("custode"), respiro } });
    // la testa di Rèmolo: il collo fuori dal guscio, verso la pietra (a sinistra)
    const testa: P = [XC.remolo - 170, COPPELLE.quota(XC.remolo) - 76];
    const cam = camTra({ x: testa[0] + 30, y: testa[1] + 6, zoom: 4.0 }, { x: testa[0] + 24, y: testa[1] + 4, zoom: 4.5 }, ease.dentroFuori(t / 7));
    return { cam, livelli: K.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { lavato: 0.3, nebbia: 0.2, sole: 0.25, vento: 0.1 }, soleA: [0.85, 0.26], coppelle: true, attori: att }) };
  },
};

/** 44 · Fu Brénta a risolvere: una scaglia dal suo remo — «Trent'anni di lago, dentro questo legno—» (p.18). */
const s44: Inquadratura = {
  id: "s44",
  titolo: "Una scaglia di remo",
  pagina: 18,
  durata: 11.0,
  didascalie: [{ da: 0.5, a: 10.6, pagina: 18, testo: "Fu Brénta a risolvere: staccò col dente una scaglia dal suo remo — «Trent'anni di lago, dentro questo legno—» e non finì. La posò sulla pietra.", chi: "brenta" }],
  suoni: [{ t: 2.6, nome: "scheggia", vol: 0.9 }],
  ambiente: { vento: 0.1, lago: 0, rane: 0 },
  disegna(t, defs, v) {
    const L = MATTINO;
    // il morso al remo (la scaglia tra i denti); poi parla, e non finisce; poi si china e la posa sulla pietra
    const morde = impulso(t, 1.6, 3.0, 0.5, 0.4);
    const scheggia = t > 2.6 ? 1 - rampa(t, 8.4, 8.8) : 0;
    const posa = impulso(t, 8.0, 9.6, 0.5, 0.6);
    const att = allaPietra(t, v.t, L, defs, { bagnati: 0.3, custodia: 1, scaglia: t > 8.8, brenta: { morde, scheggia, bocca: v.bocca("brenta"), testa: 4 + 22 * posa, china: 20 * posa } });
    const cam = camTra({ x: XC.brenta + 30, y: COPPELLE.quota(XC.brenta) - 150, zoom: 2.6 }, { x: XC.brenta + 110, y: COPPELLE.quota(XC.brenta) - 110, zoom: 2.1 }, ease.dentroFuori(rampa(t, 6.5, 10)));
    return { cam, livelli: K.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { lavato: 0.3, nebbia: 0.2, sole: 0.25, vento: 0.1 }, soleA: [0.85, 0.26], coppelle: true, attori: att }) };
  },
};

/** Dove si annoda: il nodo di Brénta (ep02) a 0.555, il primo nodo di Zara sul suo tratto di corda. */
const NODO_BRENTA = 0.555;
const NODO_ZARA = 0.68;
/** Quando il nodo chiude (s45), e con lui ripartono le rane (s46). */
const CHIUDE = 7.2;

/** 45 · Zara annodò: il primo nodo del suo tratto di corda, stretto attorno alla scaglia di remo (p.18). */
const s45: Inquadratura = {
  id: "s45",
  titolo: "Il primo nodo",
  pagina: 18,
  // finisce quando il nodo chiude: lo stacco sulle rane è l'attimo esatto (p.18)
  durata: CHIUDE + 0.05,
  entrata: { tipo: "dissolvenza", durata: 0.8 },
  didascalie: [{ da: 0.8, a: 4.6, pagina: 18, testo: "Zara annodò. Il primo nodo del suo tratto di corda," }],
  suoni: [
    { t: 1.4, nome: "stringe", vol: 0.5, durata: 0.5 },
    { t: 3.6, nome: "stringe", vol: 0.6, durata: 0.5 },
    { t: CHIUDE - 0.45, nome: "stringe", vol: 1, durata: 0.45 },
  ],
  ambiente: { vento: 0.05, lago: 0, rane: 0 },
  disegna(t, defs) {
    // la scaglia è già sulla pietra, sotto la corda: la corda si alza, gira, si stringe
    const fatto = 0.02 + 0.98 * rampa(t, 0.9, CHIUDE - 0.2, ease.dentroFuori);
    const stringe = rampa(t, CHIUDE - 0.5, CHIUDE, ease.dentro);
    return {
      cam: { x: 0, y: 0, zoom: 1 },
      livelli: insertoCorda({
        t,
        luce: MATTINO,
        defs,
        srotolata: 1,
        lettura: -1,
        spinta: 0.2 + t / 20,
        fondo: "coppelle",
        nuovi: [{ u: NODO_BRENTA, fatto: 1 }, { u: NODO_ZARA, fatto, tipo: "corda", pegno: "remo" }],
        zampeZara: { u: NODO_ZARA, lavora: rampa(t, 0.6, 1.2) * (1 - rampa(t, CHIUDE - 0.8, CHIUDE - 0.5)), stringe },
      }),
    };
  },
};

/** 46 · E nell'attimo esatto in cui il nodo chiuse, dalle rive sotto, il coro delle rane riprese (p.18). */
const s46: Inquadratura = {
  id: "s46",
  titolo: "Il coro riprende",
  pagina: 18,
  durata: 6.6,
  didascalie: [{ da: 0.6, a: 6.2, pagina: 18, testo: "E nell'attimo esatto in cui il nodo chiuse, dalle rive sotto, il coro delle rane riprese —" }],
  ambiente: { vento: 0.1, lago: 0.3, rane: 1 },
  disegna(t, defs, v) {
    const L = mescolaLuce(ALBA, MATTINO, 0.5);
    // alle rive basse, al sole nuovo: le rane sulle soglie delle tane, tutte insieme
    const [x0] = RIVE.tane[0];
    const [x1] = RIVE.tane[1];
    const att = coroDiRane(v.t, L, defs, [[x0 - 54, "a1"], [x0 + 20, "a2"], [x0 + 64, "a3"], [x1 - 60, "a4"], [x1 + 16, "a5"], [x1 + 58, "a6"]], 1);
    const cam = camTra({ x: x0 + 10, y: Q - 24, zoom: 4.6 }, { x: (x0 + x1) / 2, y: Q - 60, zoom: 2.3 }, ease.dentroFuori(rampa(t, 1.0, 6.6)));
    return { cam, livelli: B.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { lavato: 0.3, nebbia: 0.2, sole: 0.25, vento: 0.1, luccichii: 0.4 }, soleA: [0.8, 0.3], attori: att, piena: rive(10, 3, 0, { crollo: 1 }) }) };
  },
};

/** 47 · Tutto insieme, a piena voce: il sì del lago. Sulle Coppelle, tutti si voltano ad ascoltare (p.18). */
const s47: Inquadratura = {
  id: "s47",
  titolo: "Il sì del lago",
  pagina: 18,
  durata: 5.2,
  didascalie: [{ da: 0.5, a: 4.8, pagina: 18, testo: "tutto insieme, a piena voce: il sì del lago." }],
  ambiente: { vento: 0.1, lago: 0, rane: 0.8 },
  disegna(t, defs, v) {
    const L = MATTINO;
    const su = rampa(t, 0.2, 1.4);
    const att = allaPietra(t, v.t, L, defs, {
      bagnati: 0.2,
      custodia: 1,
      remolo: { collo: 0.9, testa: -10 * su },
      zara: { andatura: "acquattata", testa: 14 - 10 * su, orecchie: 1, sguardo: -0.5 },
      rocco: { testa: -6 * su, orecchie: 0.8, fango: 0.7 },
      cervara: { testa: -4 * su, orecchie: 0.9 },
      brenta: { testa: -12 * su },
      rito: { testa: -8 * su, guarda: -0.4 * su },
    });
    const cam = camTra({ x: -40, y: 570, zoom: 1.0 }, { x: -60, y: 550, zoom: 0.84 }, ease.dentroFuori(t / 5.2));
    return { cam, livelli: K.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { lavato: 0.2, nebbia: 0.2, sole: 0.3, vento: 0.1 }, soleA: [0.85, 0.24], coppelle: true, attori: att }) };
  },
};

/** 48 · Dentro il coro, la sua zampa trovò sul bordo della pietra un nodino vecchio — e lo riconobbe prima degli occhi (p.18). */
const s48: Inquadratura = {
  id: "s48",
  titolo: "Il nodino vecchio",
  pagina: 18,
  durata: 12.6,
  entrata: { tipo: "dissolvenza", durata: 0.6 },
  didascalie: [
    { da: 0.5, a: 7.2, pagina: 18, testo: "Fu lì, dentro il coro, che la sua zampa trovò sul bordo della pietra un nodino vecchio, piccolo, consumato —" },
    { da: 7.7, a: 12.2, pagina: 18, testo: "e lo riconobbe prima degli occhi, come si riconosce un passo in casa." },
  ],
  ambiente: { vento: 0.05, lago: 0, rane: 0.8 },
  disegna(t, defs) {
    const zampa = traccia([[0, 0], [0.6, 0], [3.6, 0.85, ease.morbido], [5.4, 0.85], [6.8, 1, ease.dentroFuori]])(t);
    return { cam: { x: 0, y: 0, zoom: 1 }, livelli: insertoNodino({ t, luce: MATTINO, defs, zampa, spinta: t / 12.6 }) };
  },
};

/** 49 · Tornarono a valle sui massi lucidi: in testa andava Zara, e Cervara dietro, seconda (p.19). */
const s49: Inquadratura = {
  id: "s49",
  titolo: "Seconda",
  pagina: 19,
  durata: 12.6,
  entrata: { tipo: "dissolvenza", durata: 1 },
  didascalie: [
    { da: 0.6, a: 9.0, pagina: 19, testo: "In testa, davanti a tutto il regno, andava Zara — e Cervara dietro di lei, seconda, col passo di chi ha scelto il posto e lo tiene." },
    { da: 9.6, a: 12.2, pagina: 19, testo: "Sotto, le rane cantavano." },
  ],
  ambiente: { vento: 0.2, lago: 0.5, rane: 1 },
  disegna(t, defs, v) {
    const L = MATTINO;
    // la fila del ritorno, al sole, da destra: Zara, Cervara a due passi, poi le linci coi piccoli
    // (asciutti, adesso); Rocco li aspetta sulla passerella lunga
    const t0 = 0.2;
    const zs = traversata(t, t0, RITORNO, -1);
    const cs = traversata(t, t0 + 2 * PASSO_FILA, RITORNO, -1);
    const posti = [870, 1010, 1120, 1230];
    const partenze = [0, 1, 2].map((k) => t0 + (k + 2) * 2 * PASSO_FILA);
    const fila = CODA.map(([seme, porta], k) => portatrice(t, v.t, k, partenze, seme, porta, L, defs, { bagnata: 0, punti: RITORNO, posti, verso: -1 })).join("");
    const cStart = t0 + 2 * PASSO_FILA;
    const att =
      Rp([-1150, PASS], { t, andatura: "fermo", fango: 0.5, testa: 6, orecchie: 0.6 }, 1, L, defs) +
      fila +
      Cp(t < cStart ? [980, PASS] : cs.p, { t: v.t, andatura: t > cStart ? "passo" : "fermo", fase: cs.cammina ? fase(cs.p[0], CICLO.cervaraPasso, SC_C) : (t - cStart) * 1.55, ampiezza: t > cStart ? 1 : 0, testa: 2 }, -1, L, defs) +
      Zp(zs.p, { t, andatura: t > t0 ? "passo" : "fermo", fase: zs.cammina ? fase(zs.p[0], CICLO.zaraPasso) : (t - t0) * 1.5, ampiezza: t > t0 ? 1 : 0, involto: true, testa: -2 }, -1, L, defs);
    const cam = camTra({ x: 520, y: 740, zoom: 0.95 }, { x: -520, y: 740, zoom: 0.85 }, ease.dentroFuori(rampa(t, 0.6, 12.6)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.2, sole: 0.35, vento: 0.2, luccichii: 0.6, lavato: 0.1 }, attori: att }) };
  },
};

/** 50 · Sopra, la marmotta dell'Altura fischiava ormai senza fischio, solo fiato (p.19). */
const s50: Inquadratura = {
  id: "s50",
  titolo: "Solo fiato",
  pagina: 19,
  durata: 3.4,
  suoni: [
    { t: 0.5, nome: "fiato", vol: 0.8, durata: 0.8 },
    { t: 1.9, nome: "fiato", vol: 0.7, durata: 0.8 },
  ],
  ambiente: { vento: 0.2, lago: 0, rane: 0.35 },
  disegna(t, defs, v) {
    const L = MATTINO;
    const fischio = 0.5 * (impulso(t, 0.5, 1.3, 0.1, 0.1) + impulso(t, 1.9, 2.7, 0.1, 0.1));
    const att = inPunto(VEDETTA(), marmotta({ t: v.t, ritta: 0.8, fischio }, { luce: L, defs, id: "marmotta" }), { scala: 1.1 });
    const cam = camTra({ x: VEDETTA()[0] + 10, y: VEDETTA()[1] - 56, zoom: 3.2 }, { x: VEDETTA()[0] + 10, y: VEDETTA()[1] - 56, zoom: 3.4 }, t / 3.4);
    return { cam, livelli: A.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.15, sole: 0.35, vento: 0.2 }, attori: att }) };
  },
};

/** Il nodino vecchio sulla pietra (visto da vicino nei campi larghi): due giri di corda grigia, consumata. */
function nodinoSullaPietra(L: Luce): string {
  const [x, y] = NODINO;
  const grigio = L === MATTINO ? "#8f887a" : "#7c766a";
  return `<g transform="translate(${n(x)} ${n(y)})">${path("M-12 4q5 -4 10 -2M2 -3q6 -3 12 1", { stroke: "#5f5a50", "stroke-width": 2.4, fill: "none", "stroke-linecap": "round" })}${path(ellisseD([0, 0], 5, 4), { fill: grigio })}</g>`;
}

/** 51 · Il Custode anziano, ultimo della fila, allunga il collo verso il nodino vecchio, e lo saluta con un cenno (p.19). */
const s51: Inquadratura = {
  id: "s51",
  titolo: "Uno che è avanti",
  pagina: 19,
  durata: 10.4,
  entrata: { tipo: "dissolvenza", durata: 1 },
  didascalie: [
    { da: 0.8, a: 4.4, pagina: 19, testo: "Allungò il collo verso il nodino vecchio," },
    { da: 5.0, a: 10.0, pagina: 19, testo: "e lo salutò con un cenno, come si saluta uno che è avanti sulla strada." },
  ],
  ambiente: { vento: 0.15, lago: 0, rane: 0.6 },
  disegna(t, defs, v) {
    const L = MATTINO;
    // sulle Coppelle vuote, al sole: lui solo accanto alla pietra grande; il collo verso l'orlo, poi il cenno
    const collo = 0.5 + 0.5 * ease.dentroFuori(rampa(t, 0.8, 3.6));
    const cenno = impulso(t, 6.6, 8.4, 0.5, 0.8);
    const att = nodinoSullaPietra(L) + Remolo(suColle(XC.remolo), { t: v.t, collo, testa: 16, cenno }, -1, L, defs);
    const cam = camTra({ x: NODINO[0] + 140, y: NODINO[1] - 60, zoom: 1.6 }, { x: NODINO[0] + 70, y: NODINO[1] - 34, zoom: 2.6 }, ease.dentroFuori(rampa(t, 0.4, 7)));
    return { cam, livelli: K.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.2, sole: 0.35, vento: 0.15 }, soleA: [0.8, 0.22], coppelle: true, attori: att }) };
  },
};

/** 52 · Coda: fine della prima puntata. */
const s52: Inquadratura = {
  id: "s52",
  titolo: "Coda",
  pagina: 19,
  durata: 7.0,
  entrata: { tipo: "dissolvenza", durata: 1 },
  titoli: [
    {
      da: 0.4,
      a: 6.9,
      righe: [
        { testo: "Rocco & Zara", corpo: 104, y: 330, peso: 500 },
        { testo: "ep04 — Il primo nodo", corpo: 46, y: 410 },
        { testo: "fine della prima puntata · i Laghi del Vespro", corpo: 34, y: 490, corsivo: true },
        { testo: "continua in ep05 — Il regno dei giuramenti", corpo: 30, y: 545, corsivo: true },
        { testo: "animatica · disegnata e animata in codice", corpo: 26, y: 610, spaziatura: 2, colore: "#e9dcc0" },
      ],
    },
  ],
  ambiente: { vento: 0.2, lago: 0.4, rane: 0.6 },
  disegna(t, defs, v) {
    const L = MATTINO;
    // il villaggio in basso, sotto le righe della coda
    const cam: Camera = { x: -1500 + t * 14, y: 380, zoom: 0.42 - t * 0.003 };
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.35, sole: 0.35, luccichii: 0.4 } }) };
  },
};

export const EP04: Episodio = {
  id: "ep04",
  titolo: "Il primo nodo",
  prosa: "saga/prosa/ep04.md",
  sfondo: "#1d1b17",
  inquadrature: [s01, s02, s03, s04, s05, s06, s07, s08, s09, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19, s20, s21, s22, s23, s24, s25, s26, s27, s28, s29, s30, s31, s32, s33, s34, s35, s36, s37, s38, s39, s40, s41, s42, s43, s44, s45, s46, s47, s48, s49, s50, s51, s52],
};

export default EP04;
