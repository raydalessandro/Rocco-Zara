// cartoni/episodi/ep03/copione.ts — il copione animato di «ep03 — Lo specchio».
//
// Fonte: saga/prosa/ep03.md (pagine 1–17). Ogni inquadratura dichiara la pagina
// da cui viene, e ogni didascalia è CITATA alla lettera da quella pagina
// (test/cartoni.episodi.test.ts). Il cartone non riscrive la prosa: la mette in
// scena, e ne sceglie le frasi (le immagini dicono il resto).
//
// I luoghi (cartoni/luoghi/rivalba.ts): RIVALBA, il cuore del regno sull'acqua —
// le passerelle, i Massi del Consiglio, il molo basso con la barca di Brénta sotto
// il telo, la tana degli Ospiti, il sentiero che sale dietro; e le COPPELLE, sul
// colle, le pietre vecchie coi cerchi di conche.
// La gente: Cervara, la lince giovane — il vanto delle rive (cartoni/cast/cervara.ts);
// le linci di Rivalba; un camoscio dall'Altura (p.7). Cècca e Sòrcio NON si vedono:
// a bordo della barca ormeggiata c'è solo un «tec» e un russare (pp. 4, 12) — il
// furto si scopre dopo (ep04).
//
// Grammatica visiva (saga/bible/STILE_VISIVO.md §2–§3): lo specchio sta nei gesti
// che tornano — il colpetto ai ciuffi (p.3, p.16), il passo che suona e quello che
// no (p.6, p.15), i due riflessi (p.17). Il cuore è la notte alle Coppelle
// (pp. 13–15): lì la camera si ferma e aspetta.

import { type PosaCervara, cervara } from "../../cast/cervara";
import { camoscio } from "../../cast/fauna";
import { lince } from "../../cast/laghi";
import { type PosaRocco, rocco } from "../../cast/rocco";
import { type PosaZara, zara } from "../../cast/zara";
import { COPPELLE, CUORE, LAGO_VESPRO, RIVALBA, sulMassoDelConsiglio, sullaPasserella } from "../../luoghi/rivalba";
import { type Luce, mescolaLuce } from "../../motore/colore";
import type { Camera } from "../../motore/fotogramma";
import type { Episodio, Inquadratura, Suono } from "../../motore/montaggio";
import { type Defs, type P, n } from "../../motore/svg";
import { clamp, ease, impulso, lerp, onda, rampa, traccia } from "../../motore/tempo";
import { insertoPietra } from "../../scene/inserti";
import { palo, riflesso, tanaDiCanne } from "../../scene/lago";
import { LUCI } from "../../scene/luci";
import { palcoscenico } from "../../scene/palcoscenico";
import { CICLO, camTra, diSassoInSasso, fase, faseGaloppo, inPunto, tocchi } from "../../scene/regia";

// ------------------------------------------------------------- attrezzi --
const V = palcoscenico(RIVALBA);
const K = palcoscenico(COPPELLE);
const Q = LAGO_VESPRO.quota;
/** Il piano delle passerelle e quello del molo basso. */
const PASS = sullaPasserella(-1000);
const MOLO = sullaPasserella(1600);
/** Dove si cammina a x (passerella o molo). */
const piano = (x: number) => sullaPasserella(x);

const MATTINO: Luce = mescolaLuce(LUCI.alba, LUCI.giorno, 0.55);
const GIORNO: Luce = LUCI.giorno;
const POMERIGGIO: Luce = mescolaLuce(LUCI.giorno, LUCI.tramonto, 0.3);
const SERA: Luce = LUCI.tramonto;
const NOTTE: Luce = LUCI.notte;
const ALBA: Luce = LUCI.alba;

/** Cervara è un poco più bassa di Zara (la scheda). */
const SC_C = 0.95;

const Zp = (p: P, posa: PosaZara, verso: 1 | -1, L: Luce, defs: Defs, id = "zara") => inPunto(p, zara(posa, { defs, luce: L, id, verso }), { verso });
const Cp = (p: P, posa: PosaCervara, verso: 1 | -1, L: Luce, defs: Defs, id = "cervara") => inPunto(p, cervara(posa, { defs, luce: L, id, verso }), { verso, scala: SC_C });
const Rp = (p: P, posa: PosaRocco, verso: 1 | -1, L: Luce, defs: Defs, id = "rocco") => inPunto(p, rocco(posa, { defs, luce: L, id, verso }), { verso });
/** Cervara appoggiata al suolo di un luogo (sul pendio si inclina col suolo). */
const Csul = (PC: typeof V, x: number, posa: PosaCervara, verso: 1 | -1, L: Luce, defs: Defs, id = "cervara") => PC.sulPalco(x, cervara(posa, { defs, luce: L, id, verso }), { verso, scala: SC_C });
/** Una lince di Rivalba (ognuna col suo manto: il seme è il suo id). */
const Lince = (p: P, t: number, modo: "seduta" | "in piedi", verso: 1 | -1, L: Luce, defs: Defs, id: string, o: { testa?: number; guarda?: number; bocca?: number; scala?: number } = {}) =>
  inPunto(p, lince({ t, modo, seme: id, testa: o.testa, guarda: o.guarda, bocca: o.bocca }, { luce: L, defs, id }), { verso, scala: o.scala ?? 1 });

/** Le linci che vivono Rivalba, sulle passerelle e sulle soglie (per le inquadrature larghe). */
const GENTE: readonly [number, number, "seduta" | "in piedi", 1 | -1, number][] = [
  [-2480, PASS, "seduta", 1, 0.95],
  [-2050, PASS, "in piedi", -1, 1],
  [-1560, PASS, "seduta", -1, 0.9],
  [-1180, Q - 96, "seduta", 1, 0.9],
  [-920, PASS, "in piedi", 1, 1],
  [1180, Q - 96, "seduta", -1, 0.9],
  [1460, MOLO, "in piedi", -1, 1],
  [2010, MOLO, "seduta", -1, 0.95],
];
function genteDiRivalba(t: number, L: Luce, defs: Defs, salta: readonly number[] = []): string {
  return GENTE.map(([x, y, modo, verso, sc], i) => (salta.includes(i) ? "" : Lince([x, y], t + i * 1.7, modo, verso, L, defs, `gente${i}`, { scala: sc, guarda: 0.2 * (i % 2) }))).join("");
}

// ------------------------------------------------------ di sasso in sasso --
/** Gli appoggi della traversata dei Massi, da sinistra: la passerella lunga, i sette massi, la passerella corta. */
const SASSI: readonly P[] = [[-850, PASS], ...CUORE.massi.map((_, i) => sulMassoDelConsiglio(i)), [850, PASS]];

// la corsa di Zara sui Massi (p.6): svelta, e ogni appoggio suona
const ZARA_T0 = 0.5;
const ZARA_ARIA = 0.3;
const ZARA_SOSTA = 0.1;
// Cervara dietro (p.6), e Zara di notte (p.15): lo stesso passo lungo e basso, senza fermarsi
const SERA_ARIA = 0.5;
const SERA_SOSTA = 0.12;
// il camoscio (p.7): dal molo alla fine della passerella, poi quattro tocchi e dall'altra parte
const CAMOSCIO: readonly P[] = [[850, PASS], sulMassoDelConsiglio(6), sulMassoDelConsiglio(4), sulMassoDelConsiglio(2), sulMassoDelConsiglio(0), [-930, PASS]];
const CAM_T0 = 3.95;
const CAM_ARIA = 0.5;
const CAM_SOSTA = 0.15;

// ================================================================ copione ==

/** 1 · Rivalba sull'acqua, da lontano, nella nebbia del mattino (p.1). */
const s01: Inquadratura = {
  id: "s01",
  titolo: "Rivalba sull'acqua",
  pagina: 1,
  durata: 10.5,
  titoli: [
    {
      da: 0.5,
      a: 5.4,
      righe: [
        { testo: "Rocco & Zara", corpo: 136, y: 440, peso: 500 },
        { testo: "le Terre Annodate", corpo: 40, y: 512, spaziatura: 6, corsivo: true },
        { testo: "ep03 — Lo specchio", corpo: 54, y: 620 },
      ],
    },
  ],
  didascalie: [{ da: 5.7, a: 9.9, pagina: 1, testo: "Rivalba stava sull'acqua come una cosa posata bene:" }],
  ambiente: { vento: 0.2, lago: 0.4 },
  disegna(t, defs, v) {
    const L = MATTINO;
    const cam = camTra({ x: -1100, y: 460, zoom: 0.3 }, { x: -420, y: 640, zoom: 0.44 }, ease.dentroFuori(rampa(t, 3.6, 10.5)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.6 - 0.25 * rampa(t, 4, 10.5), sole: 0.3, vento: 0.2 }, attori: genteDiRivalba(v.t, L, defs) }) };
  },
};

/** 2 · I Massi del Consiglio, a pelo d'acqua (p.1). */
const s02: Inquadratura = {
  id: "s02",
  titolo: "I Massi del Consiglio",
  pagina: 1,
  durata: 9.3,
  entrata: { tipo: "dissolvenza", durata: 1 },
  didascalie: [{ da: 0.4, a: 8.9, pagina: 1, testo: "e in mezzo i Massi del Consiglio — pietre larghe e lisce, levigate da generazioni di zampe, dove il regno si mostra e si decide." }],
  ambiente: { vento: 0.2, lago: 0.5 },
  disegna(t, defs, v) {
    const L = mescolaLuce(MATTINO, GIORNO, 0.5);
    const cam = camTra({ x: -1050, y: 800, zoom: 1.02 }, { x: 180, y: 780, zoom: 1.1 }, ease.seno(t / 9.3));
    const att = genteDiRivalba(v.t, L, defs) + Cp(sulMassoDelConsiglio(CUORE.alto), { t: v.t, andatura: "fermo", testa: -2 }, -1, L, defs);
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.35 }, attori: att }) };
  },
};

/** 3 · Sopra il masso più alto, una lince giovane. Non faceva niente. Stava (p.1). */
const s03: Inquadratura = {
  id: "s03",
  titolo: "Una lince giovane",
  pagina: 1,
  durata: 9.1,
  didascalie: [
    { da: 0.6, a: 5.5, pagina: 1, testo: "Sopra il masso più alto, ferma nella luce, c'era una lince giovane." },
    { da: 5.9, a: 8.5, pagina: 1, testo: "Non faceva niente. Stava." },
  ],
  ambiente: { vento: 0.15, lago: 0.45 },
  disegna(t, defs, v) {
    const L = GIORNO;
    const cima = sulMassoDelConsiglio(CUORE.alto);
    // dal basso, a pelo d'acqua, su fino a lei: ferma, il sole alle spalle
    const cam = camTra({ x: 150, y: 800, zoom: 1.35 }, { x: cima[0] - 10, y: cima[1] - 95, zoom: 2.5 }, ease.dentroFuori(rampa(t, 0.4, 8.2)));
    const att = Cp(cima, { t: v.t, andatura: "fermo", testa: -2, orecchie: 0.45 }, -1, L, defs);
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.15 }, soleA: [0.8, 0.18], attori: att }) };
  },
};

/** 4 · Rocco trova da rendersi utile (un palo storto); Zara, su un masso, niente (p.2). */
const s04: Inquadratura = {
  id: "s04",
  titolo: "A una piccola, niente",
  pagina: 2,
  durata: 8.8,
  entrata: { tipo: "dissolvenza", durata: 0.9 },
  didascalie: [{ da: 1.4, a: 7.7, pagina: 2, testo: "A uno grande, i posti d'acqua chiedono sempre qualcosa. A una piccola, per ora, niente." }],
  suoni: [{ t: 2.2, nome: "legno", vol: 0.5, durata: 1.2 }],
  ambiente: { vento: 0.2, lago: 0.5 },
  disegna(t, defs, v) {
    const L = GIORNO;
    // Rocco va al palo storto (tra l'ultimo masso e la passerella) e lo raddrizza con la
    // fronte; la lince sul masso fa il mezzo cenno. Zara, all'altro capo, guarda: e niente
    const xr = 1110 - 40 * ease.dentroFuori(rampa(t, 0.6, 1.8));
    const spinge = rampa(t, 1.8, 3.6);
    const rp: PosaRocco = { t, andatura: t > 0.6 && t < 1.8 ? "passo" : "fermo", fase: fase(1110 - xr, CICLO.roccoPasso), ampiezza: 1, testa: 6 + 16 * impulso(t, 1.7, 4.2, 0.4, 0.6) };
    const piega = 42 * (1 - ease.fuoriRitorno(spinge));
    const pole = `<g transform="translate(0 ${Q})">${palo(L, 808, 215, piega)}</g>`;
    const cenno = 14 * impulso(t, 3.9, 5.0, 0.3, 0.4);
    const giro = rampa(t, 4.4, 5.0);
    const zp: PosaZara = { t, andatura: "fermo", involto: true, testa: 4 - 6 * giro, sguardo: 0.6 - giro, orecchie: 0.6 - 0.9 * rampa(t, 6.6, 7.8) };
    const att =
      Lince(sulMassoDelConsiglio(5), v.t, "seduta", 1, L, defs, "masso5", { testa: cenno, guarda: 0.5, scala: 0.9 }) +
      Rp([xr, PASS], rp, -1, L, defs) +
      pole +
      Zp([1290, PASS], zp, t < 4.7 ? -1 : 1, L, defs);
    const cam = camTra({ x: 930, y: 730, zoom: 1.3 }, { x: 1180, y: 760, zoom: 1.55 }, ease.dentroFuori(rampa(t, 4.4, 6.6)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.2 }, attori: att }) };
  },
};

/** Le tre linci al sole sui massi di sinistra (p.2: i massi tengono il sole; p.3: «glielo dissero in tre»). */
function treLinci(t: number, mondo: number, L: Luce, defs: Defs, parlano: number): string {
  return [0, 1, 2]
    .map((i) => {
      const a = parlano + i * 1.35;
      const bocca = impulso(t, a, a + 1.1, 0.1, 0.1) * (0.4 + 0.4 * Math.abs(Math.sin(t * 13 + i)));
      return Lince(sulMassoDelConsiglio(i, 12), mondo + i * 2.1, "seduta", 1, L, defs, `tre${i}`, { bocca, guarda: 0.5, scala: 0.85, testa: 6 * impulso(t, a, a + 1.1) });
    })
    .join("");
}

/** Dove stanno i Forestieri, sulla passerella corta e sul molo, quando arriva Cervara (s05–s07). */
const X_ZARA_OSPITE = 1250;
const X_ROCCO_OSPITE = 1590;
const X_CERVARA_OSPITE = 860;

/** 5 · La lince scende dal masso a salutarli: «Qui si fa così» (p.3). */
const s05: Inquadratura = {
  id: "s05",
  titolo: "Qui si fa così",
  pagina: 3,
  durata: 13.4,
  entrata: { tipo: "dissolvenza", durata: 0.9 },
  didascalie: [
    { da: 3.5, a: 8.0, pagina: 3, testo: "«Qui si fa così,» disse infatti — frase piana, di casa.", chi: "cervara" },
    { da: 8.5, a: 13.2, pagina: 3, testo: "Si chiamava Cervara, ed era, glielo dissero in tre, il vanto delle rive." },
  ],
  ambiente: { vento: 0.2, lago: 0.5 },
  disegna(t, defs, v) {
    const L = GIORNO;
    // giù dal masso più alto, di masso in masso, senza un rumore, fino alla passerella
    const punti: P[] = [sulMassoDelConsiglio(3), sulMassoDelConsiglio(4), sulMassoDelConsiglio(5), sulMassoDelConsiglio(6), [X_CERVARA_OSPITE, PASS]];
    const s = diSassoInSasso(punti, t, 0.3, 0.55, 0.2, 34);
    const scende = t > 0.3 && t < 3.4;
    const cp: PosaCervara = { t: v.t, andatura: scende ? "passo" : "fermo", fase: (t - 0.3) * 1.7, ampiezza: scende ? 0.9 : 0, bocca: v.bocca("cervara"), testa: 2 };
    const zp: PosaZara = { t, andatura: "fermo", involto: true, testa: 2, sguardo: 0.7, bocca: v.bocca("zara") };
    const att = treLinci(t, v.t, L, defs, 8.9) + Rp([X_ROCCO_OSPITE, MOLO], { t, andatura: "fermo", testa: 8 }, -1, L, defs) + Zp([X_ZARA_OSPITE, PASS], zp, -1, L, defs) + Cp(s.p, cp, 1, L, defs);
    // giù col suo salto; poi i tre davanti a lei; poi, larghi, le tre linci al sole che lo dicono
    const k = traccia([[0, 0], [0.3, 0], [3.6, 1, ease.dentroFuori], [8.3, 1], [9.4, 2, ease.dentroFuori]])(t);
    const a: Camera = { x: 250, y: 740, zoom: 1.0 };
    const b: Camera = { x: 1110, y: 740, zoom: 1.25 };
    const c: Camera = { x: 420, y: 760, zoom: 0.82 };
    const cam = k <= 1 ? camTra(a, b, k) : camTra(b, c, k - 1);
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.2 }, attori: att }) };
  },
};

/** 6 · I ciuffi: il colpetto di zampa, e di nuovo perfetti (p.3). */
const s06: Inquadratura = {
  id: "s06",
  titolo: "I ciuffi",
  pagina: 3,
  durata: 7.2,
  didascalie: [{ da: 1.4, a: 6.4, pagina: 3, testo: "se li leccò — un colpetto di zampa, veloce, e di nuovo perfetti." }],
  ambiente: { vento: 0.2, lago: 0.4 },
  disegna(t, defs, v) {
    const L = GIORNO;
    const colpo = impulso(t, 3.1, 4.1, 0.3, 0.35);
    const cp: PosaCervara = { t: v.t, andatura: "fermo", testa: 2, zampaAlCiuffo: colpo, ciuffi: 0.45 * (1 - rampa(t, 3.5, 3.9)), sguardo: 0.2 };
    const att = Zp([X_ZARA_OSPITE, PASS], { t, andatura: "fermo", involto: true, testa: 2, sguardo: 0.7 }, -1, L, defs) + Cp([X_CERVARA_OSPITE, PASS], cp, 1, L, defs);
    const testa: P = [X_CERVARA_OSPITE + 50, PASS - 150];
    const cam = camTra({ x: testa[0] - 10, y: testa[1] + 14, zoom: 3.9 }, { x: testa[0] - 4, y: testa[1] + 8, zoom: 4.3 }, ease.dentroFuori(t / 7.2));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.15 }, attori: att }) };
  },
};

/** 7 · Zara lo vide (p.3). */
const s07: Inquadratura = {
  id: "s07",
  titolo: "Zara lo vide",
  pagina: 3,
  durata: 4.9,
  didascalie: [{ da: 0.4, a: 4.3, pagina: 3, testo: "Zara lo vide. Non seppe ancora cosa farsene." }],
  ambiente: { vento: 0.2, lago: 0.4 },
  disegna(t, defs, v) {
    const L = GIORNO;
    const zp: PosaZara = { t, andatura: "fermo", involto: true, testa: 3, sguardo: 0.9, occhi: 0.28 * rampa(t, 1.2, 1.8), orecchie: 0.7 - 0.4 * rampa(t, 2.4, 3.2) };
    const att = Cp([X_CERVARA_OSPITE, PASS], { t: v.t, andatura: "fermo", testa: 2 }, 1, L, defs) + Zp([X_ZARA_OSPITE, PASS], zp, -1, L, defs);
    const cam: Camera = { x: X_ZARA_OSPITE - 95, y: PASS - 128, zoom: 4.0 };
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.15 }, attori: att }) };
  },
};

/** 8 · Scendendo alla riva, dalla barca di Brénta sotto il telo: tec (p.4). */
const s08: Inquadratura = {
  id: "s08",
  titolo: "Il carico sotto il telo",
  pagina: 4,
  durata: 12.4,
  entrata: { tipo: "dissolvenza", durata: 0.9 },
  didascalie: [{ da: 1.0, a: 9.9, pagina: 4, testo: "dalla barca di Brénta — ormeggiata al molo basso, col carico che si custodisce per i giorni che contano — venne un suono piccolo: tec." }],
  suoni: [
    { t: 0.2, nome: "passi", durata: 8.5, vol: 0.45 },
    { t: 10.45, nome: "tec", vol: 0.9 },
  ],
  ambiente: { vento: 0.15, lago: 0.6 },
  disegna(t, defs, v) {
    const L = GIORNO;
    // i tre verso la riva lungo il molo, dietro la barca ormeggiata (Rocco avanti, Cervara in coda)
    const xr = 1680 + 76 * t;
    const xz = 1400 + 80 * t;
    const xc = 1170 + 84 * t;
    const cp: PosaCervara = { t: v.t, andatura: "passo", fase: fase(xc, CICLO.cervaraPasso, SC_C), ampiezza: 1, testa: 0 };
    const zp: PosaZara = { t, andatura: "passo", fase: fase(xz, CICLO.zaraPasso), ampiezza: 1, involto: true, testa: 2 };
    const rp: PosaRocco = { t, andatura: "passo", fase: fase(xr, CICLO.roccoPasso), ampiezza: 1, testa: 6 };
    const att = Rp([xr, piano(xr)], rp, 1, L, defs) + Zp([xz, piano(xz)], zp, 1, L, defs) + Cp([xc, piano(xc)], cp, 1, L, defs);
    // con loro lungo il molo; poi la camera resta sul telo, mentre loro escono
    const k = traccia([[0, 0], [7.2, 1, ease.lineare], [9.6, 2, ease.dentroFuori]])(t);
    const a: Camera = { x: 1480, y: 760, zoom: 1.15 };
    const b: Camera = { x: 1900, y: 770, zoom: 1.15 };
    const c: Camera = { x: CUORE.barca - 20, y: Q - 80, zoom: 2.4 };
    const cam = k <= 1 ? camTra(a, b, k) : camTra(b, c, k - 1);
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.15 }, attori: att, telo: { colpo: impulso(t, 10.42, 10.78, 0.05, 0.25) } }) };
  },
};

/** 9 · Cervara fa strada; ogni tanto guarda Zara (p.5). Le assi che cantano: sotto Zara, e sotto Rocco. */
const s09: Inquadratura = {
  id: "s09",
  titolo: "Un'attenzione pulita",
  pagina: 5,
  durata: 9.8,
  entrata: { tipo: "dissolvenza", durata: 0.9 },
  didascalie: [{ da: 1.6, a: 9.5, pagina: 5, testo: "E ogni tanto guardava Zara con un'attenzione pulita, senza cattiveria — che è peggio — come si guarda una che va da qualche parte." }],
  suoni: [
    { t: 0, nome: "passi", durata: 3.0, vol: 0.4 },
    { t: 2.6, nome: "asse", vol: 0.85 },
    { t: 8.9, nome: "legno", vol: 0.7, durata: 0.6 },
  ],
  ambiente: { vento: 0.2, lago: 0.5 },
  disegna(t, defs, v) {
    const L = GIORNO;
    // vanno verso le case (a sinistra). Cervara ha già passato l'asse che canta: Zara ci
    // mette la zampa (e l'asse canta), e Cervara si volta a guardarla; Rocco, dietro, fa cantare le altre
    const guarda = t > 3.8 && t < 7.2;
    const xc = -1542 - 70 * Math.min(t, 3.6) - 70 * Math.max(0, t - 7.6);
    const cp: PosaCervara = { t: v.t, andatura: t < 3.6 || t > 7.6 ? "passo" : "fermo", fase: fase(xc, CICLO.cervaraPasso, SC_C), ampiezza: 1, testa: guarda ? 4 : 0, sguardo: guarda ? 0.8 : 0.3, occhi: guarda ? 0.3 : undefined };
    const xz = -1282 - 68 * Math.min(t, 2.9) - 68 * Math.max(0, t - 8.0);
    const zp: PosaZara = { t, andatura: t < 2.9 || t > 8.0 ? "passo" : "fermo", fase: fase(xz, CICLO.zaraPasso), ampiezza: 1, involto: true, testa: 2 + 10 * impulso(t, 2.65, 3.9, 0.1, 0.6), orecchie: 0.7 - 1.2 * impulso(t, 2.6, 3.8, 0.08, 0.5), sguardo: guarda ? 0.5 : 0.2 };
    const xr = -960 - 64 * Math.min(t, 3.7) - 64 * Math.max(0, t - 8.3);
    const rp: PosaRocco = { t, andatura: t < 3.7 || t > 8.3 ? "passo" : "fermo", fase: fase(xr, CICLO.roccoPasso), ampiezza: 1, testa: 6, orecchie: -0.6 * impulso(t, 8.9, 9.8, 0.1, 0.5) };
    const att = Rp([xr, PASS], rp, -1, L, defs) + Zp([xz, PASS], zp, -1, L, defs) + Cp([xc, PASS], cp, guarda ? 1 : -1, L, defs);
    const cam = camTra({ x: -1330, y: 740, zoom: 1.45 }, { x: -1600, y: 740, zoom: 1.7 }, ease.dentroFuori(rampa(t, 0, 5.0)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.12 }, attori: att }) };
  },
};

/** 10 · Zara mise in fila le cose che l'altra faceva meglio (p.5). */
const s10: Inquadratura = {
  id: "s10",
  titolo: "In fila",
  pagina: 5,
  durata: 9.2,
  didascalie: [
    { da: 0.4, a: 5.4, pagina: 5, testo: "Zara mise in fila le cose che l'altra faceva meglio. Erano parecchie." },
    { da: 5.9, a: 8.6, pagina: 5, testo: "Smise di metterle in fila." },
  ],
  suoni: [{ t: 0, nome: "passi", durata: 9, vol: 0.35 }],
  ambiente: { vento: 0.2, lago: 0.5 },
  disegna(t, defs, v) {
    const L = GIORNO;
    const xz = -1700 - 52 * t;
    const xc = xz - 330;
    const scuote = impulso(t, 5.9, 6.9, 0.15, 0.3) * Math.sin(t * 18) * 7;
    const zp: PosaZara = { t, andatura: "passo", fase: fase(xz, CICLO.zaraPasso), ampiezza: 0.9, involto: true, testa: 7 - 10 * rampa(t, 6.4, 7.4) + scuote, orecchie: 0.25 + 0.5 * rampa(t, 6.4, 7.4) };
    const cp: PosaCervara = { t: v.t, andatura: "passo", fase: fase(xc, CICLO.cervaraPasso, SC_C), ampiezza: 1 };
    const att = Cp([xc, PASS], cp, -1, L, defs) + Zp([xz, PASS], zp, -1, L, defs);
    const cam: Camera = { x: xz - 70, y: PASS - 120, zoom: 2.35 };
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.1 }, attori: att }) };
  },
};

/** Dove aspettano la prova dei Massi: le due sulla passerella lunga, Rocco dall'altra parte (sul molo). */
const X_ROCCO_PROVA = 1500;
/** Dove si ferma Zara dopo la corsa (s12–s15): due passi più in là, a far posto. */
const X_ZARA_DOPO = 1160;

/** 11 · Al pomeriggio, i Massi: da pietra a pietra senza suono (p.6). */
const s11: Inquadratura = {
  id: "s11",
  titolo: "Da pietra a pietra",
  pagina: 6,
  durata: 6.8,
  entrata: { tipo: "dissolvenza", durata: 1 },
  didascalie: [{ da: 1.2, a: 6.4, pagina: 6, testo: "da pietra a pietra senza suono, perché sui Massi si va leggeri o non si va." }],
  ambiente: { vento: 0.15, lago: 0.5 },
  disegna(t, defs, v) {
    const L = POMERIGGIO;
    const att =
      genteDiRivalba(v.t, L, defs, [4, 5]) +
      Rp([X_ROCCO_PROVA, MOLO], { t, andatura: "fermo", testa: 4 }, -1, L, defs) +
      Cp([-980, PASS], { t: v.t, andatura: "fermo", testa: 0 }, 1, L, defs) +
      Zp([-850, PASS], { t, andatura: "fermo", involto: true, testa: 6, orecchie: 0.8, gonfia: 0.3 * rampa(t, 4, 5) }, 1, L, defs);
    const cam = camTra({ x: 60, y: 760, zoom: 0.72 }, { x: 20, y: 770, zoom: 0.8 }, ease.dentroFuori(t / 6.8));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.1, sole: 0.35 }, attori: att }) };
  },
};

/** 12 · Zara scatta: veloce, e il suo passo suona (p.6). */
const TOCCHI_ZARA = tocchi(SASSI.length, ZARA_T0, ZARA_ARIA, ZARA_SOSTA);
const s12: Inquadratura = {
  id: "s12",
  titolo: "Il suo passo suonava",
  pagina: 6,
  durata: 7.4,
  didascalie: [{ da: 3.9, a: 7.2, pagina: 6, testo: "Ma il suo passo suonava. Poco: abbastanza." }],
  suoni: [...TOCCHI_ZARA.slice(0, -1).map((tt, i): Suono => ({ t: tt, nome: "sasso", vol: 0.75 + 0.1 * (i % 2) })), { t: TOCCHI_ZARA.at(-1)!, nome: "zampa", vol: 0.8 }],
  ambiente: { vento: 0.15, lago: 0.5 },
  disegna(t, defs, v) {
    const L = POMERIGGIO;
    const s = diSassoInSasso(SASSI, t, ZARA_T0, ZARA_ARIA, ZARA_SOSTA, 56);
    const corre = t > ZARA_T0 && s.i < SASSI.length - 1;
    // arrivata, fa due passi avanti (per far posto) e si volta a guardare chi viene dietro
    const fine = ZARA_T0 + (SASSI.length - 1) * (ZARA_ARIA + ZARA_SOSTA) - ZARA_SOSTA;
    const avanti = X_ZARA_DOPO - SASSI.at(-1)![0];
    const xz = corre ? s.p[0] : SASSI.at(-1)![0] + avanti * ease.dentroFuori(rampa(t, fine + 0.2, fine + 2.4));
    const cammina = !corre && t > fine + 0.2 && t < fine + 2.4;
    const volta = t > fine + 2.5;
    const zp: PosaZara = corre
      ? { t, andatura: "corsa", fase: faseGaloppo(s, ZARA_SOSTA), ampiezza: 1, involto: true, testa: -4 }
      : { t, andatura: cammina ? "passo" : "fermo", fase: fase(xz, CICLO.zaraPasso), ampiezza: 0.8, involto: true, testa: 2, orecchie: 0.8, gonfia: 0.2 * rampa(t, fine, fine + 0.6) };
    // le increspature dove ha toccato (poco: abbastanza)
    let cerchi = "";
    TOCCHI_ZARA.forEach((tt, i) => {
      const e = (t - tt) / 1.6;
      if (e > 0 && e < 1 && i < SASSI.length - 2) cerchi += `<g transform="translate(${n(SASSI[i + 1][0])} ${Q + 2})"><ellipse rx="${n(90 + 90 * e)}" ry="${n(8 + 7 * e)}" fill="none" stroke="#eef1ea" stroke-width="1.6" opacity="${n(0.4 * (1 - e))}"/></g>`;
    });
    const att = cerchi + Rp([X_ROCCO_PROVA, MOLO], { t, andatura: "fermo", testa: 6 }, -1, L, defs) + Cp([-980, PASS], { t: v.t, andatura: "fermo" }, 1, L, defs) + Zp(corre ? s.p : [xz, PASS], zp, volta ? -1 : 1, L, defs);
    const cam: Camera = { x: clamp(xz + 140, -520, 860), y: 770, zoom: 1.12 };
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.1, sole: 0.35 }, attori: att }) };
  },
};

/** 13 · Cervara, dietro, passa sugli stessi sassi come passa la sera (p.6). */
const s13: Inquadratura = {
  id: "s13",
  titolo: "Come passa la sera",
  pagina: 6,
  durata: 7.6,
  didascalie: [{ da: 0.8, a: 6.8, pagina: 6, testo: "Cervara, dietro, passò sugli stessi sassi come passa la sera: e non si sentì niente." }],
  ambiente: { vento: 0.1, lago: 0.45 },
  disegna(t, defs, v) {
    const L = POMERIGGIO;
    const t0 = 0.5;
    const punti: P[] = [[-980, PASS], ...SASSI.slice(1)];
    const s = diSassoInSasso(punti, t, t0, SERA_ARIA, SERA_SOSTA, 30);
    const va = t > t0 && s.i < punti.length - 1;
    const cp: PosaCervara = { t: v.t, andatura: va ? "passo" : "fermo", fase: (t - t0) * 1.55, ampiezza: va ? 1 : 0, testa: 0 };
    // Zara, arrivata, si è voltata a guardarla
    const zp: PosaZara = { t, andatura: "fermo", involto: true, testa: 2, orecchie: 0.6, sguardo: 0.8 };
    const att = Rp([X_ROCCO_PROVA, MOLO], { t, andatura: "fermo", testa: 6 }, -1, L, defs) + Zp([X_ZARA_DOPO, PASS], zp, -1, L, defs) + Cp(s.p, cp, 1, L, defs);
    const cam: Camera = { x: clamp(s.p[0] + 60, -560, 900), y: 760, zoom: 1.3 };
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.1, sole: 0.35 }, attori: att }) };
  },
};

/** 14 · Un camoscio attraversa i Massi: quattro tocchi, un soffio, dall'altra parte (p.7). */
const s14: Inquadratura = {
  id: "s14",
  titolo: "Un camoscio",
  pagina: 7,
  durata: 9.0,
  didascalie: [
    { da: 0.6, a: 4.2, pagina: 7, testo: "Fu allora che un camoscio attraversò i Massi." },
    { da: 4.6, a: 8.2, pagina: 7, testo: "quattro tocchi, un soffio, dall'altra parte." },
  ],
  suoni: [{ t: 5.4, nome: "soffio", vol: 0.7, durata: 0.8 }],
  ambiente: { vento: 0.15, lago: 0.45 },
  disegna(t, defs, v) {
    const L = POMERIGGIO;
    // arriva dal molo, a balzi, dietro ai tre; poi i Massi: quattro tocchi, e via tra le case
    let p: P;
    let racc: number;
    if (t < CAM_T0) {
      const k = clamp((t - 0.6) / (CAM_T0 - 0.6));
      const x = lerp(2200, 850, k);
      const balzo = Math.abs(Math.sin(k * Math.PI * 7));
      p = [x, piano(x) - 22 * balzo];
      racc = 1 - balzo;
    } else {
      const s = diSassoInSasso(CAMOSCIO, t, CAM_T0, CAM_ARIA, CAM_SOSTA, 70);
      if (s.i >= CAMOSCIO.length - 1) {
        const dopo = t - (CAM_T0 + (CAMOSCIO.length - 1) * (CAM_ARIA + CAM_SOSTA) - CAM_SOSTA);
        const x = -930 - 380 * dopo;
        const balzo = Math.abs(Math.sin(dopo * Math.PI * 2.2));
        p = [x, PASS - 22 * balzo];
        racc = 1 - balzo;
      } else {
        p = s.p;
        racc = s.inAria ? 1 - Math.sin(Math.PI * s.u) : 1;
      }
    }
    const camoscioD = t > 0.5 ? inPunto(p, camoscio({ t: v.t, raccolto: racc, testa: 4 }, { luce: L, defs, id: "camoscio" }), { verso: -1, scala: 1.05 }) : "";
    // i tre lo guardano passare (Cervara si volta anche lei)
    const cv = t > 3.3 ? -1 : 1;
    const att = camoscioD + Rp([X_ROCCO_PROVA, MOLO], { t, andatura: "fermo", testa: 4, orecchie: 0.8 * rampa(t, 1.2, 1.8) }, -1, L, defs) + Zp([X_ZARA_DOPO, PASS], { t, andatura: "fermo", involto: true, testa: 0, orecchie: 0.9, sguardo: 0.9 }, -1, L, defs) + Cp([850, PASS], { t: v.t, andatura: "fermo", testa: -2, orecchie: 0.7 }, cv, L, defs);
    const cam = camTra({ x: 1320, y: 750, zoom: 0.95 }, { x: -380, y: 770, zoom: 0.8 }, ease.dentroFuori(rampa(t, CAM_T0 - 0.2, 7.6)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.1, sole: 0.35 }, attori: att }) };
  },
};

/** 15 · «Lui è l'acqua. Voi due siete ancora pioggia.» Cervara se lo tiene (p.7). */
const s15: Inquadratura = {
  id: "s15",
  titolo: "Ancora pioggia",
  pagina: 7,
  durata: 11,
  didascalie: [
    { da: 0.5, a: 7.1, pagina: 7, testo: "«Ecco,» disse Rocco piano. «Lui è l'acqua. Voi due siete ancora pioggia.»", chi: "rocco" },
    { da: 7.6, a: 10.6, pagina: 7, testo: "Non disse niente. Se lo tenne." },
  ],
  ambiente: { vento: 0.12, lago: 0.4 },
  disegna(t, defs, v) {
    const L = POMERIGGIO;
    // Cervara guardava ancora dove è andato il camoscio; alla fine si volta verso Rocco, e se lo tiene
    const volta = t > 7.5;
    const cp: PosaCervara = { t: v.t, andatura: "fermo", testa: volta ? -10 + 16 * rampa(t, 9.2, 10.4) : -2, sguardo: volta ? 0.6 : 0.2, occhi: 0.3, orecchie: 0.5 };
    const att =
      Rp([X_ROCCO_PROVA, MOLO], { t, andatura: "fermo", testa: 12, bocca: v.bocca("rocco"), orecchie: 0.2 }, -1, L, defs) +
      Zp([X_ZARA_DOPO, PASS], { t, andatura: "fermo", involto: true, testa: -4, sguardo: 0.5 }, t > 0.9 ? 1 : -1, L, defs) +
      Cp([850, PASS], cp, volta ? 1 : -1, L, defs);
    const k = traccia([[0, 0], [7.0, 0], [8.2, 1, ease.dentroFuori]])(t);
    const cam = camTra({ x: 1200, y: 690, zoom: 1.35 }, { x: 890, y: PASS - 128, zoom: 3.2 }, k);
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.1, sole: 0.3 }, attori: att }) };
  },
};

/** In fondo alla passerella lunga: la sera (p.8) e «il solito punto» (p.17). */
const X_FONDO = CUORE.fondoPasserella - 30;

/** 16 · La sera, in fondo a una passerella: piena di cose fatte quasi bene (p.8). */
const s16: Inquadratura = {
  id: "s16",
  titolo: "Piena",
  pagina: 8,
  durata: 9.2,
  entrata: { tipo: "dissolvenza", durata: 1.2 },
  didascalie: [{ da: 2.8, a: 8.9, pagina: 8, testo: "Non era stanca. Era piena — di cose fatte quasi bene, che è una stanchezza più lunga." }],
  suoni: [{ t: 0.3, nome: "passi", durata: 2.4, vol: 0.35 }],
  ambiente: { vento: 0.1, lago: 0.35 },
  disegna(t, defs, v) {
    const L = SERA;
    const xz = X_FONDO + 210 * (1 - ease.fuori(rampa(t, 0.3, 2.9)));
    const siede = rampa(t, 2.9, 3.8);
    const zp: PosaZara = siede > 0 ? { t, andatura: "fermo", involto: true, verso: { altra: { t, andatura: "seduta", involto: true, testa: 6 }, k: siede } } : { t, andatura: "passo", fase: fase(xz, CICLO.zaraPasso), ampiezza: 1 - rampa(t, 2.4, 2.9), involto: true };
    const att = Zp([xz, PASS], zp, -1, L, defs);
    const cam = camTra({ x: X_FONDO + 40, y: 750, zoom: 1.35 }, { x: X_FONDO - 20, y: 770, zoom: 1.6 }, ease.dentroFuori(t / 9.2));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { sole: 0.12, nebbia: 0.2, vento: 0.1 }, soleA: [0.16, 0.44], attori: att }) };
  },
};

/** Zara seduta in fondo alla passerella, che guarda giù (s17). */
function zaraSulBordo(t: number, L: Luce, defs: Defs, testa: number): string {
  return Zp([X_FONDO, PASS], { t, andatura: "seduta", involto: true, testa }, -1, L, defs);
}

/** 17 · Il riflesso, un po' meno sfumato di ieri, e non abbastanza (p.8). */
const s17: Inquadratura = {
  id: "s17",
  titolo: "Un po' meno sfumato",
  pagina: 8,
  durata: 7.6,
  didascalie: [{ da: 0.8, a: 6.5, pagina: 8, testo: "Dall'acqua ferma il suo riflesso la guardava un po' meno sfumato di ieri, e non abbastanza." }],
  ambiente: { vento: 0.05, lago: 0.3 },
  disegna(t, defs, v) {
    const L = SERA;
    const zd = zaraSulBordo(t, L, defs, 8 + 26 * ease.dentroFuori(rampa(t, 0.4, 2.6)));
    const rif = riflesso(defs, "rif-zara", zd, Q, { t: v.t, opacita: 0.6, onde: 0.07, sfuma: { c: [X_FONDO - 60, PASS - 80], r: 165 } });
    const cam = camTra({ x: X_FONDO - 20, y: 790, zoom: 1.8 }, { x: X_FONDO - 60, y: Q + 64, zoom: 2.2 }, ease.dentroFuori(rampa(t, 1.2, 6.8)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { sole: 0.1, nebbia: 0.2, vento: 0.05 }, soleA: [0.16, 0.44], extra: [{ id: "riflessi", contenuto: rif, p: 1 }], attori: zd }) };
  },
};

/** 18 · Rocco viene a sedersi vicino, con rito; le mette accanto il silenzio (p.8). */
const s18: Inquadratura = {
  id: "s18",
  titolo: "Con rito",
  pagina: 8,
  durata: 9.6,
  entrata: { tipo: "dissolvenza", durata: 0.8 },
  didascalie: [{ da: 4.4, a: 8.9, pagina: 8, testo: "Le mise accanto il silenzio, che era la cosa sua che pesava meglio." }],
  suoni: [
    { t: 0.9, nome: "asse", vol: 0.55 },
    { t: 1.9, nome: "asse", vol: 0.5 },
    { t: 2.9, nome: "asse", vol: 0.55 },
    { t: 3.9, nome: "legno", vol: 0.8, durata: 1.5 },
  ],
  ambiente: { vento: 0.08, lago: 0.3 },
  disegna(t, defs, v) {
    const L = SERA;
    const xr = X_FONDO + 330 + 260 * (1 - ease.fuori(rampa(t, 0.2, 3.7)));
    const giu = ease.dentroFuori(rampa(t, 3.9, 6.0));
    const rp: PosaRocco = { t, andatura: t < 3.7 ? "passo" : "fermo", fase: fase(xr, CICLO.roccoPasso), ampiezza: 1 - rampa(t, 3.2, 3.7), aTerra: giu, testa: 6 + 10 * giu, occhi: 0.2 * giu };
    const att = Rp([xr, PASS], rp, -1, L, defs) + zaraSulBordo(t, L, defs, 10 - 4 * rampa(t, 5, 7));
    const cam = camTra({ x: X_FONDO + 260, y: 740, zoom: 1.15 }, { x: X_FONDO + 150, y: 760, zoom: 1.3 }, ease.dentroFuori(rampa(t, 0, 7)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { sole: 0.08, nebbia: 0.2, vento: 0.05 }, soleA: [0.12, 0.47], attori: att }) };
  },
};

/** Sul masso da cui si parla al Consiglio (p.9): Cervara seduta in cima, Zara sul masso accanto. */
const CIMA = sulMassoDelConsiglio(CUORE.alto, 20);
const ACCANTO = sulMassoDelConsiglio(CUORE.alto - 1, -55);
function alMasso(t: number, mondo: number, L: Luce, defs: Defs, c: Partial<PosaCervara>, z: Partial<PosaZara>): string {
  return Zp(ACCANTO, { t, andatura: "fermo", involto: true, testa: -10, sguardo: 0.6, ...z }, 1, L, defs) + Cp(CIMA, { t: mondo, andatura: "seduta", testa: 4, ...c }, -1, L, defs);
}
const SU_ZARA: Camera = { x: ACCANTO[0] + 40, y: ACCANTO[1] - 115, zoom: 2.6 };
const SU_CERVARA: Camera = { x: CIMA[0] - 30, y: CIMA[1] - 120, zoom: 2.6 };

/** 19 · Il giorno dopo, sul masso del Consiglio: «Il mio posto è qui» (p.9). */
const s19: Inquadratura = {
  id: "s19",
  titolo: "Il mio posto è qui",
  pagina: 9,
  durata: 9.4,
  entrata: { tipo: "nero", durata: 1 },
  didascalie: [
    { da: 1.2, a: 4.7, pagina: 9, testo: "«Il mio posto è qui,» disse, piana.", chi: "cervara" },
    { da: 5.2, a: 8.3, pagina: 9, testo: "«Qui si nasce con l'acqua in—»", chi: "cervara" },
  ],
  ambiente: { vento: 0.15, lago: 0.45 },
  disegna(t, defs, v) {
    const L = MATTINO;
    const att = genteDiRivalba(v.t, L, defs) + alMasso(t, v.t, L, defs, { bocca: v.bocca("cervara"), sguardo: 0.2 }, {});
    const cam = camTra({ x: -80, y: 700, zoom: 1.55 }, { x: -70, y: 690, zoom: 1.85 }, ease.dentroFuori(t / 9.4));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.3 }, attori: att }) };
  },
};

/** 20 · «E com'è?» — «Com'è cosa.» — «Nascere col posto già pronto.» (p.9). */
const s20: Inquadratura = {
  id: "s20",
  titolo: "E com'è?",
  pagina: 9,
  durata: 14,
  didascalie: [
    { da: 0.4, a: 3.0, pagina: 9, testo: "«E com'è?» chiese Zara.", chi: "zara" },
    { da: 3.5, a: 5.5, pagina: 9, testo: "«Com'è cosa.»", chi: "cervara" },
    { da: 6.0, a: 9.1, pagina: 9, testo: "«Nascere col posto già pronto.»", chi: "zara" },
    { da: 9.6, a: 12.9, pagina: 9, testo: "Per la prima volta, non rispose subito." },
  ],
  ambiente: { vento: 0.15, lago: 0.45 },
  disegna(t, defs, v) {
    const L = MATTINO;
    const ferma = rampa(t, 9.6, 11);
    const att = alMasso(t, v.t, L, defs, { bocca: v.bocca("cervara"), sguardo: 0.3 - 0.9 * ferma, testa: 4 + 8 * ferma, orecchie: 0.4 - 0.5 * impulso(t, 10.5, 12.5) }, { bocca: v.bocca("zara") });
    // sull'una e sull'altra, a turno; poi resta su Cervara che non risponde
    const k = traccia([[0, 0], [3.2, 0], [3.7, 1, ease.dentroFuori], [5.6, 1], [6.1, 0, ease.dentroFuori], [9.2, 0], [9.9, 1, ease.dentroFuori]])(t);
    const vicino = rampa(t, 9.9, 14);
    const cam = camTra(camTra(SU_ZARA, SU_CERVARA, k), { ...SU_CERVARA, zoom: 3.3, y: SU_CERVARA.y - 10 }, vicino * 0.8);
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.25 }, attori: att }) };
  },
};

/** 21 · «È come i ciuffi.» — si tocca un orecchio senza pensarci (p.10). */
const s21: Inquadratura = {
  id: "s21",
  titolo: "È come i ciuffi",
  pagina: 10,
  durata: 13,
  didascalie: [
    { da: 0.4, a: 6.0, pagina: 10, testo: "«È come i ciuffi,» disse infine, e si toccò un orecchio senza pensarci.", chi: "cervara" },
    { da: 6.5, a: 12.7, pagina: 10, testo: "«Belli. Fermi. Di casa.» Una pausa piana. «Si fa così, e io lo so fare.»", chi: "cervara" },
  ],
  ambiente: { vento: 0.15, lago: 0.45 },
  disegna(t, defs, v) {
    const L = MATTINO;
    const tocca = impulso(t, 2.0, 3.8, 0.5, 0.6) * 0.75;
    const att = alMasso(t, v.t, L, defs, { bocca: v.bocca("cervara"), zampaAlCiuffo: tocca, ciuffi: 0.2, sguardo: 0.1 }, {});
    const cam = camTra({ ...SU_CERVARA, zoom: 2.2, y: SU_CERVARA.y + 10 }, { ...SU_CERVARA, zoom: 2.5 }, ease.dentroFuori(t / 13));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.25 }, attori: att }) };
  },
};

/** 22 · Zara, che di cose dette bene al posto delle risposte se ne intendeva, la riconobbe (p.10). */
const s22: Inquadratura = {
  id: "s22",
  titolo: "La riconobbe al volo",
  pagina: 10,
  durata: 7.2,
  didascalie: [{ da: 0.6, a: 6.6, pagina: 10, testo: "e Zara, che di cose dette bene al posto delle risposte se ne intendeva, la riconobbe al volo." }],
  suoni: [{ t: 2.0, nome: "gonfia", vol: 0.5 }],
  ambiente: { vento: 0.15, lago: 0.45 },
  disegna(t, defs, v) {
    const L = MATTINO;
    // il suo gesto, quello di sempre (si gonfia un poco), e subito lo lascia andare: l'ha riconosciuto
    const gonfia = 0.45 * impulso(t, 1.9, 4.0, 0.35, 0.8);
    const vede = rampa(t, 5.0, 5.6);
    const att = alMasso(t, v.t, L, defs, { sguardo: -0.3 }, { gonfia, testa: -10 - 6 * gonfia, occhi: 0.25 * (1 - vede), sguardo: 0.6 + 0.3 * vede, orecchie: 0.3 + 0.6 * vede });
    const cam = camTra({ ...SU_ZARA, zoom: 2.9 }, { ...SU_ZARA, zoom: 3.2, x: SU_ZARA.x + 10 }, ease.dentroFuori(t / 7.2));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.25 }, attori: att }) };
  },
};

/** Di notte: dove dorme Rocco (fuori, sul pendio, da fermo) e la luna sul lago. */
const X_ROCCO_NOTTE = CUORE.tana + 560;
const LUNA_ALTA = { a: [0.14, 0.2] as const, r: 22 };

/** 23 · Quella notte Zara non dormì (p.11). */
const s23: Inquadratura = {
  id: "s23",
  titolo: "Non dormì",
  pagina: 11,
  durata: 9.0,
  entrata: { tipo: "nero", durata: 1.2 },
  didascalie: [
    { da: 1.0, a: 3.7, pagina: 11, testo: "Quella notte Zara non dormì." },
    { da: 4.2, a: 8.2, pagina: 11, testo: "era tutto a posto, e proprio quello non la faceva dormire." },
  ],
  ambiente: { vento: 0.05, lago: 0.15, notte: 1, grilli: 0.7 },
  disegna(t, defs, v) {
    const L = NOTTE;
    const tana = tanaDiCanne(L, defs);
    const y = RIVALBA.quota(CUORE.tana);
    const zp: PosaZara = { t, andatura: "acquattata", testa: 18, occhi: 0, involto: true, sguardo: 0.3 * onda(t, 5), orecchie: 0.3 };
    const att =
      Zp([CUORE.tana + 10, y], zp, 1, L, defs) +
      `<g transform="translate(${CUORE.tana} ${n(y)})">${tana.fronte}</g>` +
      V.R(X_ROCCO_NOTTE, { t, andatura: "fermo", occhi: 1, testa: 12 + 2 * onda(t, 4.5), orecchie: -0.2 }, -1, L, defs);
    const cam = camTra({ x: CUORE.tana + 150, y: 760, zoom: 1.0 }, { x: CUORE.tana + 40, y: y - 100, zoom: 1.75 }, ease.dentroFuori(rampa(t, 1, 9.6)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { notte: 1, nebbia: 0.2, vento: 0.05 }, luna: LUNA_ALTA, attori: att }) };
  },
};

/** 24 · La luna stava bassa sull'acqua, vera due volte (p.11). */
const s24: Inquadratura = {
  id: "s24",
  titolo: "Vera due volte",
  pagina: 11,
  durata: 7.6,
  didascalie: [{ da: 2.4, a: 6.1, pagina: 11, testo: "La luna stava bassa sull'acqua, vera due volte." }],
  ambiente: { vento: 0.05, lago: 0.2, notte: 1, grilli: 0.6 },
  disegna(t, defs, v) {
    const L = NOTTE;
    // esce piano dalla tana, fino all'orlo; la camera va dove guarda lei
    const xz = CUORE.tana - 230 * ease.dentroFuori(rampa(t, 0.3, 3.0));
    const va = t > 0.3 && t < 3.0;
    const y = RIVALBA.quota(xz);
    const zp: PosaZara = { t, andatura: va ? "passo" : "fermo", fase: fase(xz, CICLO.zaraPasso), ampiezza: 0.8, involto: true, testa: -6 };
    const tana = tanaDiCanne(L, defs);
    const att = V.R(X_ROCCO_NOTTE, { t, andatura: "fermo", occhi: 1, testa: 12 + 2 * onda(t, 4.5) }, -1, L, defs) + Zp([xz, y], zp, -1, L, defs) + (xz > CUORE.tana - 120 ? `<g transform="translate(${CUORE.tana} ${n(RIVALBA.quota(CUORE.tana))})">${tana.fronte}</g>` : "");
    const cam = camTra({ x: CUORE.tana - 80, y: 800, zoom: 1.4 }, { x: 1250, y: 690, zoom: 0.6 }, ease.dentroFuori(rampa(t, 2.2, 7.4)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { notte: 1, nebbia: 0.2, vento: 0.05 }, luna: { a: [0.3, 0.37], r: 24, riflesso: 0.84 }, attori: att }) };
  },
};

/** 25 · Passando sopra il molo: tec, tec — e a bordo qualcuno russa di gusto (p.12). */
const s25: Inquadratura = {
  id: "s25",
  titolo: "Tec, tec",
  pagina: 12,
  durata: 10.4,
  entrata: { tipo: "dissolvenza", durata: 0.9 },
  didascalie: [
    { da: 1.6, a: 5.0, pagina: 12, testo: "Passando sopra il molo lo risentì: tec." },
    { da: 5.5, a: 8.6, pagina: 12, testo: "qualcuno, a bordo, russava di gusto." },
  ],
  suoni: [
    { t: 1.1, nome: "tec", vol: 0.8 },
    { t: 4.2, nome: "tec", vol: 0.7, durata: 0.9 },
    { t: 5.4, nome: "russare", vol: 0.9, durata: 6 },
  ],
  ambiente: { vento: 0.05, lago: 0.2, notte: 1, grilli: 0.5 },
  disegna(t, defs, v) {
    const L = NOTTE;
    // sale per il sentiero sopra il molo; al primo «tec» le orecchie si voltano, poi va
    const ferma = t > 1.2 && t < 2.4;
    const xz = 3080 + 40 * Math.min(t, 1.2) + 40 * Math.max(0, t - 2.4);
    const zp: PosaZara = { t, andatura: ferma ? "fermo" : "passo", fase: fase(xz, CICLO.zaraPasso), ampiezza: 0.8, involto: true, testa: -4, orecchie: ferma ? -0.2 : 0.4, sguardo: ferma ? -0.6 : 0.3 };
    const att = V.Z(xz, zp, 1, L, defs);
    const russa = t > 5.4 ? Math.sin(((t - 5.4) * 0.32 + 0.05) * Math.PI * 2) : 0;
    const colpo = impulso(t, 1.05, 1.4, 0.05, 0.2) + 0.7 * impulso(t, 4.15, 4.35, 0.04, 0.1) + 0.6 * impulso(t, 4.45, 4.62, 0.04, 0.1) + 0.8 * impulso(t, 4.7, 4.95, 0.04, 0.12);
    const cam = camTra({ x: 2420, y: 760, zoom: 0.78 }, { x: CUORE.barca + 60, y: Q - 50, zoom: 1.7 }, ease.dentroFuori(rampa(t, 5.4, 8.8)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { notte: 1, nebbia: 0.15, vento: 0.05 }, luna: LUNA_ALTA, attori: att, telo: { colpo: clamp(colpo), respiro: russa } }) };
  },
};

// ------------------------------------------------------------ le Coppelle --
/** Alle Coppelle: Cervara seduta davanti alla pietra grande, e dove si siede Zara. */
const X_CERVARA_COPPELLE = 250;
const X_ZARA_COPPELLE = 480;
const LUNA_COPPELLE = { a: [0.74, 0.22] as const, r: 26 };
const suColle = (x: number): P => [x, COPPELLE.quota(x)];

/** 26 · Le Coppelle nella notte (p.13). */
const s26: Inquadratura = {
  id: "s26",
  titolo: "Le Coppelle",
  pagina: 13,
  durata: 6.6,
  entrata: { tipo: "dissolvenza", durata: 1.2 },
  didascalie: [{ da: 1.2, a: 4.9, pagina: 13, testo: "Le Coppelle stavano nella notte come stanno da sempre:" }],
  ambiente: { vento: 0.08, lago: 0, notte: 1, grilli: 0.9 },
  disegna(t, defs, v) {
    const L = NOTTE;
    const xz = 1480 - 46 * t;
    const att = Cp(suColle(X_CERVARA_COPPELLE), { t: v.t, andatura: "seduta", male: 1, ciuffi: 1, testa: 6 }, -1, L, defs) + K.Z(xz, { t, andatura: "passo", fase: fase(xz, CICLO.zaraPasso), ampiezza: 0.8, involto: true }, -1, L, defs);
    const cam = camTra({ x: 250, y: 560, zoom: 0.7 }, { x: 420, y: 580, zoom: 0.8 }, ease.dentroFuori(t / 6.6));
    return { cam, livelli: K.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { notte: 1, nebbia: 0.1, vento: 0.08 }, coppelle: true, luna: LUNA_COPPELLE, attori: att }) };
  },
};

/** 27 · Le conche tonde a cerchi, piene di luna (p.13). */
const s27: Inquadratura = {
  id: "s27",
  titolo: "Piene di luna",
  pagina: 13,
  durata: 5.2,
  entrata: { tipo: "dissolvenza", durata: 0.8 },
  didascalie: [{ da: 0.6, a: 4.9, pagina: 13, testo: "pietre larghe, e sopra le conche tonde a cerchi, piene di luna." }],
  ambiente: { vento: 0.05, lago: 0, notte: 1, grilli: 0.9 },
  disegna(t, defs) {
    return { cam: { x: 0, y: 0, zoom: 1 }, livelli: insertoPietra({ t, luce: NOTTE, defs, piene: true, zampa: 0, brina: 0, vapore: 0, cielo: "#27324a", spinta: t / 5.2, conche: "cerchi", luna: true }) };
  },
};

/** 28 · Cervara. Sola, seduta male, i ciuffi piegati di lato (p.13). */
const s28: Inquadratura = {
  id: "s28",
  titolo: "Seduta male",
  pagina: 13,
  durata: 8.8,
  entrata: { tipo: "dissolvenza", durata: 0.8 },
  didascalie: [{ da: 0.6, a: 8.4, pagina: 13, testo: "Cervara. Sola, seduta male — lei, seduta male — davanti ai segni, i ciuffi d'un orecchio piegati di lato." }],
  ambiente: { vento: 0.06, lago: 0, notte: 1, grilli: 0.8 },
  disegna(t, defs, v) {
    const L = NOTTE;
    const att = Cp(suColle(X_CERVARA_COPPELLE), { t: v.t, andatura: "seduta", male: 1, ciuffi: 1, testa: 8, sguardo: -0.2, orecchie: 0.1 }, -1, L, defs);
    const cam = camTra({ x: X_CERVARA_COPPELLE - 60, y: 600, zoom: 2.0 }, { x: X_CERVARA_COPPELLE - 20, y: 590, zoom: 2.5 }, ease.dentroFuori(t / 8.8));
    return { cam, livelli: K.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { notte: 1, nebbia: 0.1, vento: 0.06 }, coppelle: true, luna: LUNA_COPPELLE, attori: att }) };
  },
};

/** 29 · «Il vanto delle rive… e nessuno—» La frase cadde nel cerchio, a metà (p.13). */
const s29: Inquadratura = {
  id: "s29",
  titolo: "La frase cadde nel cerchio",
  pagina: 13,
  durata: 13.2,
  didascalie: [
    { da: 0.8, a: 9.0, pagina: 13, testo: "«Il vanto delle rive,» disse, piana, guardando le conche. «Di un posto dove tutto si fa così, e nessuno—»", chi: "cervara" },
    { da: 9.5, a: 12.7, pagina: 13, testo: "La frase cadde nel cerchio, a metà." },
  ],
  suoni: [{ t: 0, nome: "passi", durata: 2.6, vol: 0.25 }],
  ambiente: { vento: 0.06, lago: 0, notte: 1, grilli: 0.8 },
  disegna(t, defs, v) {
    const L = NOTTE;
    // Zara arriva piano, e si ferma accanto; Cervara non scatta: la riconosce e basta (le orecchie, appena)
    const xz = X_ZARA_COPPELLE + 380 * (1 - ease.fuori(rampa(t, 0, 2.8)));
    const zp: PosaZara = { t, andatura: t < 2.8 ? "passo" : "fermo", fase: fase(xz, CICLO.zaraPasso), ampiezza: 0.8 * (1 - rampa(t, 2.2, 2.8)), involto: true, testa: 6, orecchie: 0.3 };
    const cp: PosaCervara = { t: v.t, andatura: "seduta", male: 1, ciuffi: 1, testa: 10, bocca: v.bocca("cervara"), orecchie: 0.1 + 0.5 * impulso(t, 1.6, 3.4, 0.3, 0.8), sguardo: -0.3 };
    const att = Cp(suColle(X_CERVARA_COPPELLE), cp, -1, L, defs) + K.Z(xz, zp, -1, L, defs);
    const k = traccia([[0, 0], [9.2, 0.3, ease.lineare], [12.8, 1, ease.dentroFuori]])(t);
    const cam = camTra({ x: 390, y: 610, zoom: 1.7 }, { x: 60, y: 640, zoom: 2.0 }, k);
    return { cam, livelli: K.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { notte: 1, nebbia: 0.1, vento: 0.06 }, coppelle: true, luna: LUNA_COPPELLE, attori: att }) };
  },
};

/** Le due, sedute male, una accanto all'altra (s30–s33). */
function dueSedute(t: number, mondo: number, L: Luce, defs: Defs, c: Partial<PosaCervara>, z: Partial<PosaZara>): string {
  return Cp(suColle(X_CERVARA_COPPELLE), { t: mondo, andatura: "seduta", male: 1, ciuffi: 1, testa: 8, ...c }, -1, L, defs) + K.Z(X_ZARA_COPPELLE, { t, andatura: "seduta", male: 1, involto: true, testa: 10, ...z }, -1, L, defs);
}

/** 30 · Zara si siede accanto. Male anche lei, per compagnia (p.13). */
const s30: Inquadratura = {
  id: "s30",
  titolo: "Per compagnia",
  pagina: 13,
  durata: 6.2,
  didascalie: [{ da: 1.2, a: 5.8, pagina: 13, testo: "Zara si sedette accanto. Male anche lei, per compagnia." }],
  ambiente: { vento: 0.06, lago: 0, notte: 1, grilli: 0.8 },
  disegna(t, defs, v) {
    const L = NOTTE;
    const siede = ease.dentroFuori(rampa(t, 0.8, 2.2));
    const male = ease.dentroFuori(rampa(t, 2.0, 3.4));
    const zp: PosaZara = { t, andatura: "fermo", involto: true, testa: 6, verso: { altra: { t, andatura: "seduta", male, involto: true, testa: 6 + 6 * male }, k: siede } };
    const att = Cp(suColle(X_CERVARA_COPPELLE), { t: v.t, andatura: "seduta", male: 1, ciuffi: 1, testa: 8 }, -1, L, defs) + K.Z(X_ZARA_COPPELLE, zp, -1, L, defs);
    const cam = camTra({ x: 360, y: 620, zoom: 1.95 }, { x: 350, y: 625, zoom: 2.1 }, ease.dentroFuori(t / 6.2));
    return { cam, livelli: K.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { notte: 1, nebbia: 0.1, vento: 0.06 }, coppelle: true, luna: LUNA_COPPELLE, attori: att }) };
  },
};

/** 31 · «Tu almeno vai da qualche parte.» Piana come sempre. Ferma come mai (p.14). */
const s31: Inquadratura = {
  id: "s31",
  titolo: "Tu almeno vai da qualche parte",
  pagina: 14,
  durata: 8.6,
  entrata: { tipo: "dissolvenza", durata: 0.8 },
  didascalie: [{ da: 0.8, a: 7.8, pagina: 14, testo: "«Tu almeno vai da qualche parte,» disse Cervara. Piana come sempre. Ferma come mai.", chi: "cervara" }],
  ambiente: { vento: 0.05, lago: 0, notte: 1, grilli: 0.6 },
  disegna(t, defs, v) {
    const L = NOTTE;
    const att = dueSedute(t, v.t, L, defs, { bocca: v.bocca("cervara"), sguardo: -0.4, occhi: 0.3 }, {});
    const testa: P = [X_CERVARA_COPPELLE + 44, COPPELLE.quota(X_CERVARA_COPPELLE) - 120];
    const cam = camTra({ x: testa[0] - 30, y: testa[1] + 14, zoom: 3.2 }, { x: testa[0] - 24, y: testa[1] + 10, zoom: 3.5 }, ease.dentroFuori(t / 8.6));
    return { cam, livelli: K.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { notte: 1, nebbia: 0.1, vento: 0.05 }, coppelle: true, luna: LUNA_COPPELLE, attori: att }) };
  },
};

/** 32 · E la fila si rovescia tutta insieme (p.14). */
const s32: Inquadratura = {
  id: "s32",
  titolo: "La fila si rovescia",
  pagina: 14,
  durata: 16.8,
  didascalie: [
    { da: 0.5, a: 7.6, pagina: 14, testo: "E Zara, che aveva passato giorni a metterle in fila i primati, sentì la fila rovesciarsi tutta insieme —" },
    { da: 8.1, a: 16.4, pagina: 14, testo: "perché il vanto del regno aveva appena detto, alla straniera senza riflesso, la cosa che la straniera avrebbe dato una stagione per sentirsi dire." },
  ],
  ambiente: { vento: 0.05, lago: 0, notte: 1, grilli: 0.6 },
  disegna(t, defs, v) {
    const L = NOTTE;
    // il muso di Zara: le orecchie che salgono piano, gli occhi che si aprono; poi, larghe, le due
    const su = ease.dentroFuori(rampa(t, 3.5, 9));
    const att = dueSedute(t, v.t, L, defs, { sguardo: -0.4 }, { male: 1 - 0.7 * su, orecchie: -0.2 + 0.9 * su, occhi: 0, sguardo: 0.2 + 0.5 * su, testa: 12 - 10 * su });
    const muso: P = [X_ZARA_COPPELLE - 55, COPPELLE.quota(X_ZARA_COPPELLE) - 118];
    const cam = camTra({ x: muso[0] + 10, y: muso[1] + 12, zoom: 3.3 }, { x: 330, y: 600, zoom: 1.45 }, ease.dentroFuori(rampa(t, 8.0, 17.6)));
    return { cam, livelli: K.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { notte: 1, nebbia: 0.1, vento: 0.05 }, coppelle: true, luna: LUNA_COPPELLE, attori: att }) };
  },
};

/** 33 · «Il passo sui massi: non è nelle zampe, è nel peso. Prima tu. Poi la zampa.» (p.15). */
const s33: Inquadratura = {
  id: "s33",
  titolo: "Prima tu. Poi la zampa.",
  pagina: 15,
  durata: 9.4,
  didascalie: [{ da: 0.5, a: 9.0, pagina: 15, testo: "«Il passo sui massi,» disse poi Cervara, alzandosi. «Non è nelle zampe. È nel peso. Prima tu. Poi la zampa.»", chi: "cervara" }],
  ambiente: { vento: 0.05, lago: 0, notte: 1, grilli: 0.6 },
  disegna(t, defs, v) {
    const L = NOTTE;
    // si alza (seduta → in piedi), e si volta verso Zara, da pari a pari
    const alza = ease.dentroFuori(rampa(t, 1.7, 2.9));
    const volta = t > 3.1;
    const bocca = v.bocca("cervara");
    const cp: PosaCervara = { t: v.t, andatura: "seduta", male: 1, ciuffi: 1 - 0.6 * alza, testa: 8, bocca, verso: { altra: { t: v.t, andatura: "fermo", testa: 2 }, k: alza } };
    const xc = X_CERVARA_COPPELLE - 90 * ease.dentroFuori(rampa(t, 2.4, 3.4));
    const cervaraD = volta ? Cp(suColle(xc), { t: v.t, andatura: t < 3.4 ? "passo" : "fermo", fase: (t - 2.4) * 1.2, ampiezza: 0.6 * (1 - rampa(t, 3.0, 3.4)), testa: 4, ciuffi: 0.4, bocca }, 1, L, defs) : Cp(suColle(xc), cp, -1, L, defs);
    const att = cervaraD + K.Z(X_ZARA_COPPELLE, { t, andatura: "seduta", male: 0.3, involto: true, testa: -6, orecchie: 0.6, sguardo: 0.6 }, -1, L, defs);
    const cam = camTra({ x: 360, y: 610, zoom: 1.9 }, { x: 350, y: 605, zoom: 2.1 }, ease.dentroFuori(t / 9.4));
    return { cam, livelli: K.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { notte: 1, nebbia: 0.1, vento: 0.05 }, coppelle: true, luna: LUNA_COPPELLE, attori: att }) };
  },
};

/** 34 · Lo mostra una volta, lenta, da pari a pari (p.15). */
const s34: Inquadratura = {
  id: "s34",
  titolo: "Da pari a pari",
  pagina: 15,
  durata: 6.2,
  didascalie: [{ da: 0.6, a: 5.4, pagina: 15, testo: "Lo mostrò una volta, lenta, da pari a pari — non da vanto a ospite." }],
  ambiente: { vento: 0.05, lago: 0, notte: 1, grilli: 0.6 },
  disegna(t, defs, v) {
    const L = NOTTE;
    // sulla pietra grande, piano: prima il peso (il corpo va avanti), poi la zampa
    const passi = 3.2 * ease.dentroFuori(rampa(t, 0.4, 6.4));
    const scatto = passi - Math.floor(passi);
    const peso = Math.floor(passi) + ease.morbido(clamp(scatto * 1.6));
    const x = 170 - 70 * peso;
    const yPietra = COPPELLE.quota(-40) + 8 - 66 + 12;
    const cp: PosaCervara = { t: v.t, andatura: "passo", fase: passi * 0.5, ampiezza: 0.7, testa: 6, ciuffi: 0.3 };
    const att = Cp([x, yPietra], cp, -1, L, defs) + K.Z(X_ZARA_COPPELLE, { t, andatura: "seduta", involto: true, testa: -2, orecchie: 0.8, sguardo: 0.9 }, -1, L, defs);
    const cam = camTra({ x: 160, y: 590, zoom: 1.75 }, { x: 120, y: 590, zoom: 1.9 }, ease.dentroFuori(t / 6.2));
    return { cam, livelli: K.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { notte: 1, nebbia: 0.1, vento: 0.05 }, coppelle: true, luna: LUNA_COPPELLE, attori: att }) };
  },
};

/** 35 · Zara provò. La pietra, sotto, non disse niente. Riprovò. Niente (p.15). */
const s35: Inquadratura = {
  id: "s35",
  titolo: "La pietra non disse niente",
  pagina: 15,
  durata: 7.8,
  entrata: { tipo: "dissolvenza", durata: 0.7 },
  didascalie: [
    { da: 0.6, a: 4.4, pagina: 15, testo: "Zara provò. La pietra, sotto, non disse niente." },
    { da: 4.9, a: 7.2, pagina: 15, testo: "Riprovò. Niente." },
  ],
  ambiente: { vento: 0.04, lago: 0, notte: 1, grilli: 0.7 },
  disegna(t, defs) {
    const zampa = traccia([[0, 0], [0.6, 0], [3.2, 1, ease.morbido], [4.6, 1], [5.2, 0.55, ease.dentroFuori], [6.8, 1, ease.morbido]])(t);
    return { cam: { x: 0, y: 0, zoom: 1 }, livelli: insertoPietra({ t, luce: NOTTE, defs, piene: true, zampa, brina: 0, vapore: 0, cielo: "#27324a", spinta: 0.4 + t / 20, conche: "cerchi", luna: true }) };
  },
};

/** 36 · Sui Massi del Consiglio, una tigre passò come passa la sera (p.15). */
const s36: Inquadratura = {
  id: "s36",
  titolo: "Una tigre, come la sera",
  pagina: 15,
  durata: 8.4,
  entrata: { tipo: "dissolvenza", durata: 1.2 },
  didascalie: [{ da: 1.4, a: 7.4, pagina: 15, testo: "Sui Massi del Consiglio, per la prima volta, una tigre passò come passa la sera." }],
  ambiente: { vento: 0.04, lago: 0.2, notte: 1, grilli: 0.4 },
  disegna(t, defs, v) {
    const L = NOTTE;
    const t0 = 1.0;
    const s = diSassoInSasso(SASSI, t, t0, SERA_ARIA, SERA_SOSTA, 32);
    const va = t > t0 && s.i < SASSI.length - 1;
    const zp: PosaZara = { t, andatura: va ? "passo" : "fermo", fase: (t - t0) * 1.5, ampiezza: va ? 1 : 0, involto: true, testa: 0 };
    const att = Cp([-1000, PASS], { t: v.t, andatura: "seduta", testa: 0 }, 1, L, defs) + Zp(s.p, zp, 1, L, defs);
    const cam: Camera = { x: clamp(s.p[0] + 80, -420, 700), y: 740, zoom: 0.95 };
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { notte: 1, nebbia: 0.1, vento: 0.04 }, luna: { a: [0.7, 0.2], r: 24, riflesso: 0.9 }, attori: att }) };
  },
};

/** Sulla discesa, all'alba (s37, s38). */
const X_DISCESA = 4150;

/** 37 · Sulla discesa, il colpetto ai ciuffi: e stavolta Zara la vede per intero (p.16). */
const s37: Inquadratura = {
  id: "s37",
  titolo: "La cosa sotto il gesto",
  pagina: 16,
  durata: 11.8,
  entrata: { tipo: "nero", durata: 1.2 },
  didascalie: [
    { da: 1.2, a: 5.5, pagina: 16, testo: "Sulla discesa Cervara si fermò a sistemarsi i ciuffi —" },
    { da: 6.0, a: 11.3, pagina: 16, testo: "e stavolta Zara la vide per intero: il gesto, e la cosa sotto il gesto." },
  ],
  ambiente: { vento: 0.12, lago: 0.1 },
  disegna(t, defs, v) {
    const L = ALBA;
    const xc = X_DISCESA - 60 + 260 * (1 - ease.fuori(rampa(t, 0, 2.4)));
    const gesto = impulso(t, 3.0, 5.2, 0.6, 0.7);
    const cp: PosaCervara = { t: v.t, andatura: t < 2.4 ? "passo" : "fermo", fase: fase(xc, CICLO.cervaraPasso, SC_C), ampiezza: 1 - rampa(t, 1.8, 2.4), zampaAlCiuffo: gesto, ciuffi: 1 - rampa(t, 3.9, 4.6), testa: 2 };
    const xz = X_DISCESA + 300 + 250 * (1 - ease.fuori(rampa(t, 0, 2.7)));
    const zp: PosaZara = { t, andatura: t < 2.7 ? "passo" : "fermo", fase: fase(xz, CICLO.zaraPasso), ampiezza: 1 - rampa(t, 2.1, 2.7), involto: true, testa: 6, sguardo: 0.8, orecchie: 0.5 + 0.3 * rampa(t, 6, 7) };
    const att = Csul(V, xc, cp, -1, L, defs) + V.Z(xz, zp, -1, L, defs);
    // le due che scendono; poi da vicino il gesto (tutto intero); poi Zara che l'ha visto
    const k = traccia([[0, 0], [2.5, 0], [3.0, 1, ease.dentroFuori], [5.4, 1], [6.2, 2, ease.dentroFuori]])(t);
    const a: Camera = { x: X_DISCESA + 170, y: RIVALBA.quota(X_DISCESA) - 140, zoom: 1.5 };
    const b: Camera = { x: X_DISCESA - 90, y: RIVALBA.quota(X_DISCESA - 60) - 118, zoom: 2.8 };
    const c: Camera = { x: X_DISCESA + 140, y: RIVALBA.quota(X_DISCESA + 150) - 120, zoom: 2.3 };
    const cam = k <= 1 ? camTra(a, b, k) : camTra(b, c, k - 1);
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { lavato: 0.2, nebbia: 0.35, sole: 0.08, vento: 0.1 }, attori: att }) };
  },
};

/** 38 · Certi specchi funzionano così (p.16): scendono insieme, il lago che prende la luce. */
const s38: Inquadratura = {
  id: "s38",
  titolo: "Certi specchi",
  pagina: 16,
  durata: 13.2,
  entrata: { tipo: "dissolvenza", durata: 1 },
  didascalie: [
    { da: 0.6, a: 6.0, pagina: 16, testo: "Certi specchi funzionano così: basta guardarci dentro insieme, una volta." },
    { da: 6.5, a: 12.5, pagina: 16, testo: "Non era l'unica, a tenersi in ordine il davanti mentre il dietro tremava — e non lo era mai stata." },
  ],
  suoni: [{ t: 0, nome: "passi", durata: 14, vol: 0.3 }],
  ambiente: { vento: 0.12, lago: 0.2 },
  disegna(t, defs, v) {
    const L = mescolaLuce(ALBA, MATTINO, rampa(t, 0, 14));
    const xc = 3860 - 42 * t;
    const xz = xc + 170;
    const cp: PosaCervara = { t: v.t, andatura: "passo", fase: fase(xc, CICLO.cervaraPasso, SC_C), ampiezza: 1, testa: 2 };
    const zp: PosaZara = { t, andatura: "passo", fase: fase(xz, CICLO.zaraPasso), ampiezza: 1, involto: true, testa: 2 };
    const att = Csul(V, xc, cp, -1, L, defs) + V.Z(xz, zp, -1, L, defs);
    const cam = camTra({ x: 3150, y: 600, zoom: 0.62 }, { x: 2850, y: 640, zoom: 0.62 }, ease.dentroFuori(t / 13.2));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { lavato: 0.2 * (1 - t / 14), nebbia: 0.35, sole: 0.1 + 0.1 * (t / 14), vento: 0.1 }, attori: att }) };
  },
};

/** La mattina dopo, «dal solito punto»: Zara che si sporge, e il suo riflesso (s39–s41). */
function zaraSiSporge(t: number, L: Luce, defs: Defs): string {
  return Zp([X_FONDO, PASS], { t, andatura: "acquattata", involto: true, testa: 36 }, -1, L, defs);
}
const RIF_ZARA = (defs: Defs, t: number, zd: string, r: number) => riflesso(defs, "rif-zara", zd, Q, { t, opacita: 0.62, onde: 0.05, sfuma: { c: [X_FONDO - 120, PASS - 70], r } });

/** 39 · Dal solito punto: il riflesso c'era, più fermo ai bordi (p.17). */
const s39: Inquadratura = {
  id: "s39",
  titolo: "Il solito punto",
  pagina: 17,
  durata: 9.2,
  entrata: { tipo: "dissolvenza", durata: 1.2 },
  didascalie: [{ da: 1.4, a: 8.4, pagina: 17, testo: "Zara si sporse dal solito punto: il riflesso c'era, più fermo ai bordi — quasi vero due volte, ormai." }],
  ambiente: { vento: 0.05, lago: 0.3 },
  disegna(t, defs, v) {
    const L = MATTINO;
    const sporge = ease.dentroFuori(rampa(t, 0.4, 2.2));
    const zd = sporge < 0.5 ? Zp([X_FONDO, PASS], { t, andatura: "fermo", involto: true, testa: 10 + 20 * sporge }, -1, L, defs) : zaraSiSporge(t, L, defs);
    const rif = RIF_ZARA(defs, v.t, zd, 150 + 90 * rampa(t, 3, 8.5));
    const cam = camTra({ x: X_FONDO - 40, y: 780, zoom: 1.7 }, { x: X_FONDO - 110, y: Q + 72, zoom: 2.3 }, ease.dentroFuori(rampa(t, 1.6, 7.5)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.3, vento: 0.05 }, extra: [{ id: "riflessi", contenuto: rif, p: 1 }], attori: zd }) };
  },
};

/** Cervara che passa sulla passerella, dietro Zara (s40–s41): dritta e perfetta. */
function cervaraDietro(t: number, mondo: number, L: Luce, defs: Defs): { d: string; x: number } {
  const x = X_FONDO + 150 + 330 * (1 - ease.fuori(rampa(t, 0.6, 6.4)));
  const va = t < 6.4;
  return { d: Cp([x, PASS], { t: mondo, andatura: va ? "passo" : "fermo", fase: fase(x, CICLO.cervaraPasso, SC_C), ampiezza: 1 - rampa(t, 5.8, 6.4), testa: -2 }, -1, L, defs, "cervara"), x };
}

/** 40 · Dietro il suo, sull'acqua, passò quello di Cervara, dritto e perfetto (p.17). */
const s40: Inquadratura = {
  id: "s40",
  titolo: "Dritto e perfetto",
  pagina: 17,
  durata: 12.2,
  didascalie: [
    { da: 0.6, a: 7.1, pagina: 17, testo: "Dietro il suo, sull'acqua, passò quello di Cervara, dritto e perfetto come il primo giorno." },
    { da: 7.6, a: 11.8, pagina: 17, testo: "Solo che adesso Zara sapeva cosa costava, quel dritto." },
  ],
  ambiente: { vento: 0.05, lago: 0.3 },
  disegna(t, defs, v) {
    const L = MATTINO;
    const zd = zaraSiSporge(t, L, defs);
    const c = cervaraDietro(t, v.t, L, defs);
    const rifC = riflesso(defs, "rif-cervara", c.d, Q, { t: v.t, opacita: 0.7, onde: 0.03 });
    const rif = rifC + RIF_ZARA(defs, v.t, zd, 240);
    const cam = camTra({ x: X_FONDO - 60, y: Q + 70, zoom: 1.9 }, { x: X_FONDO - 40, y: Q + 76, zoom: 2.0 }, ease.dentroFuori(t / 12.2));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.3, vento: 0.05 }, extra: [{ id: "riflessi", contenuto: rif, p: 1 }], attori: c.d + zd }) };
  },
};

/** 41 · I due riflessi che l'acqua teneva insieme: chi delle due, veramente, era lo specchio? (p.17). */
const s41: Inquadratura = {
  id: "s41",
  titolo: "Lo specchio",
  pagina: 17,
  durata: 11.2,
  didascalie: [
    { da: 1.0, a: 4.6, pagina: 17, testo: "e la domanda le salì da sola, e lì rimase:" },
    { da: 5.1, a: 8.6, pagina: 17, testo: "chi delle due, veramente, era lo specchio?" },
  ],
  ambiente: { vento: 0.04, lago: 0.25 },
  disegna(t, defs, v) {
    const L = MATTINO;
    const zd = zaraSiSporge(t, L, defs);
    const c = cervaraDietro(99, v.t, L, defs);
    const rif = riflesso(defs, "rif-cervara", c.d, Q, { t: v.t, opacita: 0.7, onde: 0.03 }) + RIF_ZARA(defs, v.t, zd, 250);
    const cam = camTra({ x: X_FONDO - 40, y: Q + 76, zoom: 2.0 }, { x: X_FONDO - 60, y: Q + 90, zoom: 2.45 }, ease.dentroFuori(t / 11.2));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.3, vento: 0.04 }, extra: [{ id: "riflessi", contenuto: rif, p: 1 }], attori: c.d + zd }) };
  },
};

/** 42 · Coda. */
const s42: Inquadratura = {
  id: "s42",
  titolo: "Coda",
  pagina: 17,
  durata: 6.4,
  entrata: { tipo: "dissolvenza", durata: 1 },
  titoli: [
    {
      da: 0.4,
      a: 6.3,
      righe: [
        { testo: "Rocco & Zara", corpo: 104, y: 420, peso: 500 },
        { testo: "ep03 — Lo specchio", corpo: 46, y: 500 },
        { testo: "continua in ep04 — Il primo nodo", corpo: 34, y: 610, corsivo: true },
        { testo: "animatica · disegnata e animata in codice", corpo: 26, y: 690, spaziatura: 2, colore: "#e9dcc0" },
      ],
    },
  ],
  ambiente: { vento: 0.2, lago: 0.4 },
  disegna(t, defs, v) {
    const L = MATTINO;
    const cam: Camera = { x: -600 + t * 14, y: 600, zoom: 0.36 - t * 0.004 };
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.4, sole: 0.3 } }) };
  },
};

export const EP03: Episodio = {
  id: "ep03",
  titolo: "Lo specchio",
  prosa: "saga/prosa/ep03.md",
  sfondo: "#1d1b17",
  inquadrature: [s01, s02, s03, s04, s05, s06, s07, s08, s09, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19, s20, s21, s22, s23, s24, s25, s26, s27, s28, s29, s30, s31, s32, s33, s34, s35, s36, s37, s38, s39, s40, s41, s42],
};

export default EP03;
