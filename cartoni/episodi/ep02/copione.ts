// cartoni/episodi/ep02/copione.ts — il copione animato di «ep02 — Il regno senza riflesso».
//
// Fonte: saga/prosa/ep02.md (pagine 1–16). Ogni inquadratura dichiara la pagina
// da cui viene, e ogni didascalia è CITATA alla lettera da quella pagina
// (test/cartoni.episodi.test.ts). Il cartone non riscrive la prosa: la mette in
// scena, e ne sceglie le frasi (un episodio dura ~5′: le immagini dicono il resto).
//
// Il luogo è il Lago del Vespro (cartoni/luoghi/rivalba.ts): la riva di Rivalba
// coi suoi villaggi sull'acqua, il lago aperto della traversata, l'approdo.
// La gente: Brénta la lontra, le linci delle rive, il Custode-testuggine
// (cartoni/cast/laghi.ts). La ninna-nanna della Prima Tigre (p.3) è il brano
// cantato (cartoni/brani/): i versi compaiono col canto.
//
// Grammatica visiva (saga/bible/STILE_VISIVO.md §2–§3): varietà focale (drone ↔
// macro), il POV basso di Zara, Rocco monumentale (anche in una barca), lo scambio
// tra i due. Il cuore dell'episodio è il RIFLESSO (p.7) e lo sguardo di Brénta
// sulla corda (pp. 11–13): lì la camera si ferma e aspetta.

import { type Brani, versiCantati } from "../../audio/brani";
import BRANI from "../../brani/brani.json";
import { martinPescatore } from "../../cast/fauna";
import { type PosaLontra, folaga, lince, lontra, testuggine } from "../../cast/laghi";
import { type PosaRocco, rocco } from "../../cast/rocco";
import { type PosaZara, zara } from "../../cast/zara";
import { APPRODO, LAGO_VESPRO, RIVA, RIVALBA, cimaMassoCustode } from "../../luoghi/rivalba";
import { type Luce, mescolaLuce } from "../../motore/colore";
import { type Camera, type Livello } from "../../motore/fotogramma";
import { type Episodio, type Inquadratura, type UsoBrano } from "../../motore/montaggio";
import { type Defs, type P, g, n } from "../../motore/svg";
import { clamp, ease, lerp, onda, rampa, traccia } from "../../motore/tempo";
import { FINE_NODI, insertoCorda } from "../../scene/inserti";
import { barca, cerchiAcqua, galleggia, palo, remo, riflesso, tanaDiCanne } from "../../scene/lago";
import { LUCI } from "../../scene/luci";
import { palcoscenico } from "../../scene/palcoscenico";
import { CICLO, camTra, fase, inPunto } from "../../scene/regia";

// ------------------------------------------------------------- attrezzi --
const V = palcoscenico(RIVALBA);
const A = palcoscenico(APPRODO);
const Q = LAGO_VESPRO.quota;
/** Il piano del molo basso. */
const MOLO = Q - RIVA.alturaMolo - 4;
/** La barca di Brénta: lunga (ci sta un rinoceronte seduto al centro). */
const L_BARCA = 900;
const ACQUA = { lago: RIVALBA.colori.lago, chiaro: RIVALBA.colori.lagoChiaro };
/** Dove sta ormeggiata, contro la testa del molo. */
const X_ORMEGGIO = RIVA.molo[0] - L_BARCA / 2 - 20;
/** A bordo (coordinate della barca, prua a sinistra): Rocco al centro, Zara verso poppa che guarda Brénta, Brénta a poppa in piedi. */
const BORDO = { rocco: -170, zara: 150, brenta: 385, scalmo: 290 } as const;
/** Dove dorme Rocco: fuori dalla tana, sul piano, a sinistra (davanti al masso), e guarda verso la tana. */
const X_ROCCO_NOTTE = RIVA.tana - 560;
/** Il Custode: una vecchia testuggine di lago, grande; e dove sta il suo muso col collo fuori. */
const SCALA_CUSTODE = 1.3;
const TESTA_CUSTODE: P = [cimaMassoCustode()[0] - 230, cimaMassoCustode()[1] - 100];
/** Il nodo di Brénta, accanto all'ultimo di Toraki. */
const NODO_BRENTA = FINE_NODI + 0.05;
const NINNA = (BRANI as unknown as Brani)["ninna-nanna"];

/** Il giorno sul lago: la luce del mattino che scalda piano. */
const MATTINO: Luce = mescolaLuce(LUCI.alba, LUCI.giorno, 0.55);

interface Bordo {
  vogata?: number;
  /** remi in barca (0..1) */
  fermo?: number;
  brenta?: Partial<PosaLontra>;
  zara?: PosaZara | null;
  rocco?: PosaRocco | null;
  /** rollio e affondo in più (Rocco che sale) */
  inclina?: number;
  affonda?: number;
  /** quanto è carica (Rocco a bordo) */
  carico?: number;
  calma?: number;
  /** dove sta Brénta (coordinate della barca) e da che parte guarda, se non è a poppa col remo */
  brentaA?: { x: number; verso: 1 | -1 };
}

/** La barca di Brénta con chi c'è a bordo, a galla in x (tempo t). */
function laBarca(t: number, x: number, luce: Luce, defs: Defs, o: Bordo, id = "barca"): { disegno: string; y: number; ang: number } {
  const gal = galleggia(t, id, o.calma ?? 1);
  const ang = gal.ang + (o.inclina ?? 0);
  const y = Q + gal.dy + (o.affonda ?? 0);
  const sc = barca(luce, defs, id, { lunghezza: L_BARCA, carico: o.carico ?? (o.rocco ? 1 : 0.3), acqua: ACQUA });
  const scalmo: P = [BORDO.scalmo, sc.posti.bordo - 6];
  const rm = remo(luce, scalmo, o.vogata ?? 0, o.fermo ?? 0, -1, true);
  // Brénta a poppa, in piedi, guarda verso prua (a sinistra); o dove dice `brentaA`
  const bp: P = [o.brentaA?.x ?? BORDO.brenta, sc.posti.bordo + 64];
  const vB = o.brentaA?.verso ?? -1;
  const manico: P = [-(rm.manico[0] - bp[0]), rm.manico[1] - bp[1]];
  const posaB: PosaLontra = { t, zampe: "remo", ...o.brenta, manico: o.brentaA || (o.brenta?.zampe && o.brenta.zampe !== "remo") ? undefined : manico };
  let bordo = "";
  if (o.rocco) bordo += inPunto([BORDO.rocco, sc.posti.bordo + 104], rocco(o.rocco, { defs, luce, id: `${id}-rocco`, verso: -1 }), { verso: -1 });
  if (o.zara) bordo += inPunto([BORDO.zara, sc.posti.bordo + 44], zara(o.zara, { defs, luce, id: `${id}-zara`, verso: 1 }), { verso: 1, scala: 0.9 });
  bordo += inPunto(bp, lontra(posaB, { luce, defs, id: `${id}-brenta` }), { verso: vB });
  const disegno = sc.dietro + sc.aBordo(bordo) + rm.disegno + sc.davanti;
  return { disegno: `<g transform="translate(${n(x)} ${n(y)})rotate(${n(ang)})">${disegno}</g>`, y, ang };
}

/** Un pupazzo in piedi sul molo basso (in bolla). */
const sulMolo = (x: number, disegno: string, verso: 1 | -1 = 1, scala = 1) => inPunto([x, MOLO], disegno, { verso, scala });

/** Le linci della riva: dove stanno e come (ognuna col suo manto). */
const LINCI: readonly { x: number; modo: "seduta" | "in piedi"; verso: 1 | -1; scala: number }[] = [
  { x: 150, modo: "seduta", verso: -1, scala: 1 },
  { x: 420, modo: "in piedi", verso: 1, scala: 1.05 },
  { x: 720, modo: "seduta", verso: 1, scala: 0.95 },
  { x: 1020, modo: "in piedi", verso: -1, scala: 1 },
  { x: 1180, modo: "seduta", verso: -1, scala: 1.1 },
];
function linciDellaRiva(t: number, luce: Luce, defs: Defs, guardano = 0): string {
  return LINCI.map((l, i) => V.sulPalco(l.x, lince({ t: t + i * 1.3, modo: l.modo, seme: `riva${i}`, guarda: guardano * (i % 2) }, { luce, defs, id: `lince${i}` }), { verso: l.verso, scala: l.scala })).join("");
}
/** Linci lontane sulle passerelle del villaggio (livello a p=0.7). */
function linciSullePasserelle(t: number, luce: Luce, defs: Defs): Livello {
  const pos: [number, number][] = [[-2600, 1], [-2000, -1], [-1400, 1], [-760, -1], [-120, 1], [140, -1]];
  const s = pos.map(([x, v], i) => inPunto([x, 572], lince({ t: t + i, modo: i % 2 ? "seduta" : "in piedi", seme: `lontana${i}` }, { luce, defs, id: `ll${i}` }), { verso: v as 1 | -1, scala: 0.62 })).join("");
  return { id: "linci-lontane", contenuto: s, p: 0.7 };
}

// ================================================================ copione ==

/** 1 · L'alba sul bosco, la nebbia; la folaga (p.1). */
const s01: Inquadratura = {
  id: "s01",
  titolo: "Il verso della folaga",
  pagina: 1,
  durata: 11,
  titoli: [
    {
      da: 0.5,
      a: 5.4,
      righe: [
        { testo: "Rocco & Zara", corpo: 136, y: 440, peso: 500 },
        { testo: "le Terre Annodate", corpo: 40, y: 512, spaziatura: 6, corsivo: true },
        { testo: "ep02 — Il regno senza riflesso", corpo: 54, y: 620 },
      ],
    },
  ],
  didascalie: [{ da: 5.5, a: 10.8, pagina: 1, testo: "Il lago si annunciò con un verso: quello della folaga — il verso che fa quando arriva qualcuno." }],
  suoni: [{ t: 5.9, nome: "folaga", vol: 0.9 }],
  ambiente: { vento: 0.2, lago: 0.3 },
  disegna(t, defs, v) {
    // i titoli sul lago nella nebbia; poi la camera scende sull'acqua, fino alla folaga che chiama
    const XF = -1690;
    const cam = camTra({ x: -1500, y: 560, zoom: 0.34 }, { x: XF + 20, y: Q - 60, zoom: 2.6 }, ease.dentroFuori(rampa(t, 4.4, 9.4)));
    const chiama = -1.6 * Math.sin(Math.PI * rampa(t, 5.8, 6.9));
    const att = `<g transform="translate(${XF} ${Q})scale(1.8)">${folaga(v.t, { luce: LUCI.alba, defs, id: "folaga" }, chiama)}</g>` + cerchiAcqua(LUCI.alba, [XF, Q + 2], rampa(t, 5.9, 8.6), 0.8);
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: LUCI.alba, meteo: { nebbia: 1, vento: 0.15, sole: 0.2 }, attori: att }) };
  },
};

/** 2 · Il bosco si apre: il lago tutto lì sotto (p.1). */
const s02: Inquadratura = {
  id: "s02",
  titolo: "Il lago tutto lì sotto",
  pagina: 1,
  durata: 10.4,
  entrata: { tipo: "dissolvenza", durata: 1 },
  didascalie: [{ da: 1.2, a: 10.2, pagina: 1, testo: "Poi il bosco si aprì, e il Lago del Vespro fu tutto lì sotto: largo, grigio e oro, con la nebbia del mattino ancora addosso." }],
  suoni: [{ t: 0, nome: "passi", durata: 2.6, vol: 0.6 }],
  ambiente: { vento: 0.25, lago: 0.25 },
  disegna(t, defs, v) {
    const L = LUCI.alba;
    // arrivano al ciglio e si fermano: Zara davanti, Rocco dietro
    const xz = RIVA.ciglio + 60 - 170 * ease.fuori(clamp(t / 2.6));
    const xr = RIVA.ciglio + 420 - 150 * ease.fuori(clamp(t / 2.9));
    const zp: PosaZara = { t, andatura: t < 2.6 ? "passo" : "fermo", fase: fase(RIVA.ciglio + 60 - xz, CICLO.zaraPasso), ampiezza: 1 - rampa(t, 1.8, 2.6), involto: true, testa: 6, orecchie: 0.8 };
    const rp: PosaRocco = { t, andatura: t < 2.9 ? "passo" : "fermo", fase: fase(RIVA.ciglio + 420 - xr, CICLO.roccoPasso), ampiezza: 1 - rampa(t, 2.1, 2.9), testa: 4 };
    const cam = camTra({ x: 2650, y: 480, zoom: 1.1 }, { x: 1100, y: 580, zoom: 0.44 }, ease.dentroFuori(rampa(t, 1.2, 10.2)));
    const att = V.R(xr, rp, -1, L, defs) + V.Z(xz, zp, -1, L, defs);
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.75, vento: 0.2, sole: 0.25 }, attori: att }) };
  },
};

/** 3 · Sotto, lungo le rive, le passerelle; e linci dappertutto (pp. 1–2). */
const s03: Inquadratura = {
  id: "s03",
  titolo: "Le passerelle, le linci",
  pagina: 2,
  durata: 10,
  entrata: { tipo: "dissolvenza", durata: 1 },
  didascalie: [
    { da: 0.6, a: 3.4, pagina: 1, testo: "Sotto, lungo le rive, cominciavano le passerelle." },
    { da: 3.8, a: 9.8, pagina: 2, testo: "E linci — sulle passerelle, sulle soglie, sui massi — linci dappertutto, coi musi disegnati quasi come il suo." },
  ],
  ambiente: { vento: 0.2, lago: 0.6 },
  disegna(t, defs, v) {
    const L = MATTINO;
    const cam = camTra({ x: -600, y: 700, zoom: 0.75 }, { x: 500, y: 740, zoom: 0.95 }, ease.dentroFuori(t / 10));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.45 }, attori: linciDellaRiva(v.t, L, defs), extraDietro: [linciSullePasserelle(v.t, L, defs)] }) };
  },
};

/** 4 · Nessuno si voltò troppo; a due di passaggio spettava un cenno (p.2). */
const s04: Inquadratura = {
  id: "s04",
  titolo: "A due di passaggio",
  pagina: 2,
  durata: 9,
  didascalie: [
    { da: 0.5, a: 2.6, pagina: 2, testo: "Nessuno si voltò troppo." },
    { da: 3.0, a: 5.8, pagina: 2, testo: "A due di passaggio spettava un cenno." },
    { da: 6.4, a: 8.8, pagina: 2, testo: "Ricevettero il cenno." },
  ],
  suoni: [{ t: 0, nome: "passi", durata: 5.5, vol: 0.7 }],
  ambiente: { vento: 0.2, lago: 0.5 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    // camminano lungo la riva; la lince sul sasso fa il cenno (la testa che scende e risale)
    const xz = 200 + 60 * Math.min(t, 5.5);
    const xr = -420 + 58 * Math.min(t, 5.6);
    const zp: PosaZara = { t, andatura: t < 5.5 ? "passo" : "fermo", fase: fase(xz - 200, CICLO.zaraPasso), ampiezza: 1 - rampa(t, 5, 5.5), involto: true, testa: -2, sguardo: 0.4 };
    const rp: PosaRocco = { t, andatura: t < 5.6 ? "passo" : "fermo", fase: fase(xr + 420, CICLO.roccoPasso), ampiezza: 1 - rampa(t, 5, 5.6), testa: 6 };
    const cenno = Math.sin(Math.PI * rampa(t, 6.6, 7.6)) * 22;
    let att = LINCI.filter((l) => l.x !== 720).map((l, i) => V.sulPalco(l.x + 200, lince({ t: v.t + i, modo: l.modo, seme: `riva${i}`, guarda: 0.2 }, { luce: L, defs, id: `lc${i}` }), { verso: -1, scala: l.scala })).join("");
    att += V.sulPalco(820, lince({ t: v.t, modo: "seduta", seme: "cenno", testa: cenno, guarda: 0.5 }, { luce: L, defs, id: "cenno" }), { verso: -1, scala: 1.05 });
    att += V.R(xr, rp, 1, L, defs) + V.Z(xz, zp, 1, L, defs);
    const cam = camTra({ x: 350, y: 760, zoom: 1.05 }, { x: 600, y: 770, zoom: 1.2 }, ease.dentroFuori(t / 9));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.3 }, attori: att, extraDietro: [linciSullePasserelle(v.t, L, defs)] }) };
  },
};

/** 5 · La notte da Ospiti, nella tana di canne (p.3). */
const s05: Inquadratura = {
  id: "s05",
  titolo: "La tana degli Ospiti",
  pagina: 3,
  durata: 9,
  entrata: { tipo: "nero", durata: 1.2 },
  didascalie: [
    { da: 0.6, a: 4.4, pagina: 3, testo: "Passarono la notte da Ospiti, in una tana di canne vicino all'acqua," },
    { da: 4.9, a: 8.8, pagina: 3, testo: "Zara dormì raggomitolata con la zampa sopra l'involto." },
  ],
  ambiente: { vento: 0.1, lago: 0.3, notte: 1 },
  disegna(t, defs, v) {
    const L = mescolaLuce(LUCI.tramonto, LUCI.notte, rampa(t, 0, 4));
    const tana = tanaDiCanne(L, defs);
    const y = RIVALBA.quota(RIVA.tana);
    const zp: PosaZara = { t, andatura: "acquattata", testa: 24, occhi: 1, involto: true, codaAvvolta: 1 };
    const att =
      `<g transform="translate(${RIVA.tana} ${n(y)})">${tana.fondo}</g>` +
      V.Z(RIVA.tana + 10, zp, 1, L, defs) +
      `<g transform="translate(${RIVA.tana} ${n(y)})">${tana.fronte}</g>` +
      V.R(X_ROCCO_NOTTE, { t, andatura: "fermo", occhi: rampa(t, 3, 6), testa: 10 }, 1, L, defs);
    const cam = camTra({ x: RIVA.tana - 120, y: 700, zoom: 0.95 }, { x: RIVA.tana - 190, y: y - 110, zoom: 1.35 }, ease.dentroFuori(rampa(t, 3.5, 9)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { notte: rampa(t, 0, 4), nebbia: 0.3, vento: 0.1 }, attori: att }) };
  },
};

/** La ninna-nanna, nel sonno: il brano parte sotto la narratrice e canta i sei versi (p.3). */
const NINNA_USO: UsoBrano = { id: "ninna-nanna", da: 7.4, dal: 5, al: 63, vol: 0.6, entra: 2.2, esce: 3 };

/** 6 · La ninna-nanna di casa (p.3): Zara dorme; la canzone le sale nel sonno. */
const s06: Inquadratura = {
  id: "s06",
  titolo: "La ninna-nanna di casa",
  pagina: 3,
  durata: 58,
  entrata: { tipo: "dissolvenza", durata: 1.2 },
  brano: NINNA_USO,
  didascalie: [
    { da: 0.6, a: 7.2, pagina: 3, testo: "E nel mezzo del sonno le salì, da sola com'era andata la zampa, la ninna-nanna di casa —" },
    { da: 7.6, a: 19.0, pagina: 3, testo: "quella che Toraki le cantava nelle notti di vento, e che a lui aveva cantato la madre, e alla madre la sua, indietro così fino a dove le madri non hanno più nome:" },
    ...versiCantati("ninna-nanna", NINNA, NINNA_USO, 3),
    { da: 48.2, a: 50.4, pagina: 3, testo: "Zara non la cantò." },
    { da: 50.8, a: 57.4, pagina: 3, testo: "La pensò soltanto, fino in fondo — e il fondo era il sonno." },
  ],
  ambiente: { vento: 0.05, lago: 0.25, notte: 1 },
  disegna(t, defs, v) {
    const L = LUCI.notte;
    const tana = tanaDiCanne(L, defs);
    const y = RIVALBA.quota(RIVA.tana);
    const zp: PosaZara = { t, andatura: "acquattata", testa: 24, occhi: 1, involto: true, codaAvvolta: 1, orecchie: 0.2 + 0.2 * onda(t, 7) };
    const att = `<g transform="translate(${RIVA.tana} ${n(y)})">${tana.fondo}</g>` + V.Z(RIVA.tana + 10, zp, 1, L, defs) + `<g transform="translate(${RIVA.tana} ${n(y)})">${tana.fronte}</g>`;
    // la camera: si avvicina a Zara mentre la canzone sale; durante i versi si allarga
    // piano sul lago di notte (le case, i lumi); poi torna da lei
    const vicina: Camera = { x: RIVA.tana + 30, y: y - 90, zoom: 2.1 };
    const lago: Camera = { x: RIVA.tana - 900, y: 740, zoom: 0.8 };
    const k = traccia([[0, 0], [16, 0], [30, 1, ease.dentroFuori], [44, 1], [52, 0, ease.dentroFuori]])(t);
    const cam = camTra(vicina, lago, k);
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { notte: 1, nebbia: 0.25, vento: 0.05 }, attori: att }) };
  },
};

/** 7 · Rocco, fuori, dormiva da fermo (p.3). */
const s07: Inquadratura = {
  id: "s07",
  titolo: "Rocco dormiva da fermo",
  pagina: 3,
  durata: 8.2,
  entrata: { tipo: "dissolvenza", durata: 1 },
  didascalie: [{ da: 0.8, a: 7.4, pagina: 3, testo: "Rocco, fuori, dormiva da fermo — che era il suo modo di dormire dovunque." }],
  ambiente: { vento: 0.05, lago: 0.2, notte: 1 },
  disegna(t, defs, v) {
    const L = LUCI.notte;
    const x = X_ROCCO_NOTTE;
    const rp: PosaRocco = { t, andatura: "fermo", occhi: 1, testa: 12 + 2 * onda(t, 4.5), orecchie: -0.2 };
    const tana = tanaDiCanne(L, defs);
    const y = RIVALBA.quota(RIVA.tana);
    const att = `<g transform="translate(${RIVA.tana} ${n(y)})">${tana.fondo}${tana.fronte}</g>` + V.R(x, rp, 1, L, defs);
    const cam = camTra({ x: x + 90, y: RIVALBA.quota(x) - 190, zoom: 1.35 }, { x: x + 220, y: RIVALBA.quota(x) - 210, zoom: 1.15 }, ease.dentroFuori(t / 8.2));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { notte: 1, nebbia: 0.25, vento: 0.05 }, attori: att }) };
  },
};

/** Da vicino, il muso del Custode (s08 → s09). */
const MUSO_CUSTODE: Camera = { x: TESTA_CUSTODE[0] - 40, y: TESTA_CUSTODE[1] + 40, zoom: 2.5 };

/** Il Custode sul masso, e Rocco e Zara davanti che lo ascoltano (s08, s09). */
function custodeEdue(t: number, mondo: number, L: Luce, defs: Defs, collo: number, testa: number, boccaC: number, boccaZ: number): string {
  return (
    inPunto(cimaMassoCustode(), testuggine({ t: mondo, collo, bocca: boccaC, testa }, { luce: L, defs, id: "custode" }), { verso: -1, scala: SCALA_CUSTODE }) +
    V.R(RIVA.custode - 960, { t, andatura: "fermo", testa: -6 }, 1, L, defs) +
    V.Z(RIVA.custode - 440, { t, andatura: "fermo", involto: true, testa: -16, orecchie: 0.6, bocca: boccaZ }, 1, L, defs)
  );
}

/** 8 · Al mattino, il Custode sul masso (p.4). */
const s08: Inquadratura = {
  id: "s08",
  titolo: "Il Custode",
  pagina: 4,
  durata: 11,
  entrata: { tipo: "nero", durata: 1 },
  didascalie: [
    { da: 0.6, a: 3.0, pagina: 4, testo: "Al mattino chiesero del cuore del regno," },
    { da: 3.4, a: 6.2, pagina: 4, testo: "Un Custode li ascoltò dall'alto di un masso," },
    { da: 6.8, a: 10.8, pagina: 4, testo: "«Di passaggio,» osservò infine, come si nomina un vento.", chi: "custode" },
  ],
  ambiente: { vento: 0.2, lago: 0.4 },
  disegna(t, defs, v) {
    const L = MATTINO;
    // il collo esce piano, dopo un respiro; parla col becco appena aperto
    const collo = 0.3 + 0.6 * ease.dentroFuori(rampa(t, 2.5, 6.5));
    const att = custodeEdue(t, v.t, L, defs, collo, 8, v.bocca("custode"), v.bocca("zara"));
    // i due davanti al masso; poi su, al Custode; poi il suo muso, per il «di passaggio»
    // (sul muso prima che parli: la battuta viene a 6,8)
    const k = traccia([[0, 0], [2.8, 0], [4.6, 1, ease.dentroFuori], [5.1, 1], [6.5, 2, ease.dentroFuori]])(t);
    const tutti: Camera = { x: RIVA.custode - 520, y: 720, zoom: 0.95 };
    const masso: Camera = { x: RIVA.custode - 160, y: 690, zoom: 1.6 };
    const cam = k <= 1 ? camTra(tutti, masso, k) : camTra(masso, MUSO_CUSTODE, k - 1);
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.35 }, attori: att }) };
  },
};

/** 9 · Indicò l'acqua (p.4). */
const s09: Inquadratura = {
  id: "s09",
  titolo: "Si attraversa",
  pagina: 4,
  durata: 6,
  didascalie: [{ da: 0.5, a: 5.6, pagina: 4, testo: "Indicò l'acqua: per andare al cuore, si attraversa." }],
  ambiente: { vento: 0.2, lago: 0.5 },
  disegna(t, defs, v) {
    const L = MATTINO;
    const giu = ease.dentroFuori(rampa(t, 0.6, 2.4)) * (1 - rampa(t, 4.6, 5.8));
    const att = custodeEdue(t, v.t, L, defs, 0.9 - 0.5 * rampa(t, 4.6, 5.8), 8 + 30 * giu, 0, 0);
    // dal muso del Custode, la camera va dove guarda lui: giù, verso l'acqua e il molo
    const cam = camTra(MUSO_CUSTODE, { x: 100, y: 780, zoom: 0.7 }, ease.dentroFuori(rampa(t, 1.2, 5.6)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.3 }, attori: att }) };
  },
};

/** 10 · Il molo basso, la barcaiola (p.5). */
const s10: Inquadratura = {
  id: "s10",
  titolo: "Brénta",
  pagina: 5,
  durata: 10,
  entrata: { tipo: "dissolvenza", durata: 0.9 },
  didascalie: [
    { da: 0.6, a: 6.4, pagina: 5, testo: "La barca stava a un molo basso, e la barcaiola era una lontra col pelo che non finiva mai d'asciugare." },
    { da: 6.8, a: 9.8, pagina: 5, testo: "La chiamavano Brénta." },
  ],
  ambiente: { vento: 0.2, lago: 0.7 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const b = laBarca(v.t, X_ORMEGGIO, L, defs, { fermo: 1, calma: 0.6, brenta: { zampe: "nodo", testa: 8 } });
    // dal molo, piano, fino a lei (le zampe in opera: un capo di rete, un nodo)
    const cam = camTra({ x: -700, y: 780, zoom: 0.95 }, { x: X_ORMEGGIO + BORDO.brenta - 30, y: Q - 130, zoom: 2.7 }, ease.dentroFuori(rampa(t, 2, 9.6)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.25 }, attori: b.disegno }) };
  },
};

/** 11 · «Al cuore? Si può. Se la barca dice di sì—» (p.5). */
const s11: Inquadratura = {
  id: "s11",
  titolo: "Se la barca dice di sì",
  pagina: 5,
  durata: 11,
  didascalie: [
    { da: 0.4, a: 7.4, pagina: 5, testo: "«Al cuore? Si può. Se la barca dice di sì—» Due colpetti col palmo sul bordo, tòc tòc, e stette a sentire.", chi: "brenta" },
    { da: 8.0, a: 10.8, pagina: 5, testo: "La barca disse di sì." },
  ],
  suoni: [
    { t: 5.3, nome: "toc", vol: 1 },
    { t: 8.2, nome: "legno", vol: 0.7, durata: 1.1 },
  ],
  ambiente: { vento: 0.2, lago: 0.7 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const tocca = t > 5.1 && t < 6.0;
    const risponde = Math.sin(Math.PI * rampa(t, 8.2, 9.4)) * 1.6;
    const b = laBarca(v.t, X_ORMEGGIO, L, defs, { fermo: 1, calma: 0.6, inclina: risponde, brenta: { zampe: tocca ? "tocco" : "ferme", bocca: v.bocca("brenta"), testa: t > 6 && t < 8 ? 14 : -4 } });
    const att = b.disegno + sulMolo(-330, zara({ t, andatura: "fermo", involto: true, testa: 8, bocca: v.bocca("zara") }, { defs, luce: L, id: "zara" }), -1) + sulMolo(-40, rocco({ t, andatura: "fermo", testa: 10 }, { defs, luce: L, id: "rocco" }), -1);
    // la domanda dal molo; poi vicino al palmo sul bordo (tòc tòc); poi larga, la barca che risponde
    const k = traccia([[0, 0], [3.4, 0], [4.8, 1, ease.dentroFuori], [6.8, 1], [8.0, 2, ease.dentroFuori]])(t);
    const molo: Camera = { x: -560, y: 740, zoom: 1.2 };
    const palmo: Camera = { x: X_ORMEGGIO + BORDO.brenta - 20, y: Q - 100, zoom: 2.5 };
    const tutta: Camera = { x: -760, y: 760, zoom: 1.05 };
    const cam = k <= 1 ? camTra(molo, palmo, k) : camTra(palmo, tutta, k - 1);
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.2 }, attori: att }) };
  },
};

/** 12 · La lince piccola che guarda Zara (p.6). */
const s12: Inquadratura = {
  id: "s12",
  titolo: "La lince piccola",
  pagina: 6,
  durata: 10,
  didascalie: [
    { da: 0.5, a: 6.2, pagina: 6, testo: "una lince piccola si fermò a guardare Zara — le strisce, la coda, il muso quasi-uguale-ma-no —" },
    { da: 6.8, a: 9.8, pagina: 6, testo: "Erano i primi musi, da che era nata, disegnati quasi come il suo." },
  ],
  ambiente: { vento: 0.2, lago: 0.6 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    // la piccola fissa Zara; la madre la richiama con un mezzo cenno (a metà strada)
    const mezzo = Math.sin(Math.PI * rampa(t, 4.8, 5.6)) * 12;
    const via = rampa(t, 5.8, 7.2);
    const att =
      V.sulPalco(160 + via * 120, lince({ t: v.t, modo: "seduta", seme: "piccola", guarda: 1 - via, testa: -6 }, { luce: L, defs, id: "piccola" }), { verso: -1, scala: 0.55 }) +
      V.sulPalco(420, lince({ t: v.t, modo: "in piedi", seme: "madre", testa: mezzo, guarda: 0.3 }, { luce: L, defs, id: "madre" }), { verso: -1, scala: 1 }) +
      sulMolo(-160, zara({ t, andatura: "fermo", involto: true, testa: 4, orecchie: 0.4 - rampa(t, 1, 3) * 0.6, sguardo: 0.6 }, { defs, luce: L, id: "zara" }), 1);
    // il POV basso di Zara, poi la piccola da vicino
    const cam = camTra({ x: 60, y: Q - 120, zoom: 1.8 }, { x: 150, y: Q - 100, zoom: 2.2 }, ease.dentroFuori(rampa(t, 0.5, 4.5)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.2 }, attori: att, extraDietro: [linciSullePasserelle(v.t, L, defs)] }) };
  },
};

/** 13 · Si tenne dritta (p.6). */
const s13: Inquadratura = {
  id: "s13",
  titolo: "Si tenne dritta",
  pagina: 6,
  durata: 5,
  didascalie: [{ da: 0.5, a: 4.6, pagina: 6, testo: "Si tenne dritta, e non contò altro." }],
  ambiente: { vento: 0.2, lago: 0.6 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const su = ease.fuori(rampa(t, 0.4, 1.6));
    const att = sulMolo(-160, zara({ t, andatura: "fermo", involto: true, gonfia: 0.5 * su, testa: 4 - 8 * su, orecchie: 0.7 * su }, { defs, luce: L, id: "zara" }), 1);
    const cam: Camera = { x: -60, y: MOLO - 120, zoom: 2 };
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.2 }, attori: att }) };
  },
};

/** 14 · Tra due pali, l'acqua ferma: il riflesso sfumato ai bordi (p.7). */
const s14: Inquadratura = {
  id: "s14",
  titolo: "Il riflesso",
  pagina: 7,
  durata: 12,
  entrata: { tipo: "dissolvenza", durata: 1 },
  didascalie: [
    { da: 0.6, a: 3.2, pagina: 7, testo: "Dal molo, tra due pali, l'acqua stava ferma." },
    { da: 3.6, a: 11.8, pagina: 7, testo: "Zara si sporse: c'erano il cielo, le canne, e lei — ma sfumata ai bordi, come una cosa che l'acqua non ha ancora deciso." },
  ],
  ambiente: { vento: 0.05, lago: 0.35 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const zx = -470;
    const sporge = ease.dentroFuori(rampa(t, 2.8, 5));
    const zd = inPunto([zx, MOLO], zara({ t, andatura: sporge > 0.5 ? "acquattata" : "fermo", testa: 12 + 26 * sporge, involto: true }, { defs, luce: L, id: "zara" }), { verso: -1 });
    const pali = `<g transform="translate(0 ${Q})">${palo(L, -600, 130, 4)}${palo(L, -340, 150, -3)}</g>`;
    const rif = riflesso(defs, "rif-zara", zd, Q, { t: v.t, opacita: 0.62 * sporge, onde: 0.08, sfuma: { c: [zx - 120, MOLO - 80], r: 130 } });
    const rifPali = riflesso(defs, "rif-pali", pali, Q, { t: v.t, opacita: 0.5, onde: 0.08 });
    // dal molo alla superficie: la camera scende a guardare quel che l'acqua rimanda
    const cam = camTra({ x: -470, y: MOLO - 140, zoom: 1.8 }, { x: -540, y: Q + 70, zoom: 2.4 }, ease.dentroFuori(rampa(t, 3.6, 10)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { vento: 0.05, nebbia: 0.2 }, extra: [{ id: "riflessi", contenuto: rifPali + rif, p: 1 }], attori: pali + zd }) };
  },
};

/**
 * 15 · Il lago impara le facce di tutti (p.7): solo l'acqua, e quel che rimanda.
 * «Vero due volte»: il riflesso quasi si decide (si allarga, si ferma) e poi torna
 * sfumato — per ora è vero una volta sola.
 */
const s15: Inquadratura = {
  id: "s15",
  titolo: "Vero una volta sola",
  pagina: 7,
  durata: 13,
  didascalie: [
    { da: 0.4, a: 5.8, pagina: 7, testo: "Il lago impara le facce di tutti; certe facce ci mette di più." },
    { da: 6.3, a: 12.8, pagina: 7, testo: "Vero due volte, si dice qui delle cose che l'acqua conferma. Il suo riflesso, per ora, era vero una volta sola." },
  ],
  ambiente: { vento: 0.05, lago: 0.3 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const zx = -470;
    const zd = inPunto([zx, MOLO], zara({ t, andatura: "acquattata", testa: 38, involto: true }, { defs, luce: L, id: "zara" }), { verso: -1 });
    const quasi = Math.sin(Math.PI * rampa(t, 6.4, 11.2));
    const rif = riflesso(defs, "rif-zara", zd, Q, { t: v.t, opacita: 0.62 + 0.12 * quasi, onde: (0.1 + 0.04 * onda(v.t, 3)) * (1 - 0.6 * quasi), sfuma: { c: [zx - 120, MOLO - 80], r: 110 + 10 * onda(v.t, 5) + 70 * quasi } });
    const cam: Camera = { x: -560, y: Q + 110, zoom: 2.6 };
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { vento: 0.05 }, extra: [{ id: "riflessi", contenuto: rif, p: 1 }], attori: zd }) };
  },
};

/** 16 · Salire, per Zara, fu un salto. Per Rocco fu una trattativa (p.8). */
const s16: Inquadratura = {
  id: "s16",
  titolo: "Un salto, una trattativa",
  pagina: 8,
  durata: 9,
  entrata: { tipo: "dissolvenza", durata: 0.8 },
  didascalie: [
    { da: 0.4, a: 3.4, pagina: 8, testo: "Salire, per Zara, fu un salto. Per Rocco fu una trattativa." },
    { da: 3.9, a: 8.8, pagina: 8, testo: "«Tu al centro,» disse Brénta, misurandolo con l'occhio come si misura un carico.", chi: "brenta" },
  ],
  suoni: [
    { t: 0.95, nome: "zampa", vol: 0.8 },
    { t: 2.9, nome: "legno", vol: 1, durata: 1.2 },
    { t: 5.0, nome: "legno", vol: 0.9, durata: 1.0 },
    { t: 7.2, nome: "legno", vol: 1, durata: 1.4 },
  ],
  ambiente: { vento: 0.2, lago: 0.7 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    // il salto di Zara: dal molo alla barca, un arco, e giù seduta al suo posto
    const kz = rampa(t, 0.3, 1.0, ease.lineare);
    const x0: P = [-300, MOLO];
    const x1: P = [X_ORMEGGIO + BORDO.zara, Q - 30];
    const salto: P = [lerp(x0[0], x1[0], kz), lerp(x0[1], x1[1], kz) - Math.sin(Math.PI * kz) * 150];
    // Rocco arriva in fondo al molo e mette una zampa sulla poppa: la barca si piega; indietro; ci riprova.
    // (Brénta intanto è passata a prua, a far da contrappeso, e lo misura con l'occhio.)
    const arriva = rampa(t, 0.8, 2.2);
    const pesa = traccia([[0, 0], [2.2, 0], [2.9, 1, ease.dentroFuori], [3.6, 0.15, ease.dentroFuori], [5.0, 1, ease.dentroFuori], [5.8, 0.35, ease.dentroFuori], [7.2, 1, ease.dentroFuori], [9, 0.9]])(t);
    const rx = lerp(0, -330, ease.dentroFuori(arriva)) - 90 * pesa;
    const b = laBarca(v.t, X_ORMEGGIO, L, defs, {
      fermo: 1,
      inclina: 4.5 * pesa + Math.sin(v.t * 5) * 0.6 * pesa,
      affonda: 16 * pesa,
      zara: t > 1.0 ? { t, andatura: "seduta", testa: -4, codaAvvolta: 1, orecchie: 0.5 - 0.7 * pesa } : null,
      brentaA: { x: -330, verso: 1 },
      brenta: { zampe: "ferme", bocca: v.bocca("brenta"), testa: 4 * onda(t, 3) },
    });
    let att = b.disegno;
    if (t <= 1.0) att += inPunto(salto, zara({ t, andatura: t < 0.35 ? "fermo" : "corsa", fase: 0.3, ampiezza: 0.9, involto: true }, { defs, luce: L, id: "zara-salto" }), { verso: -1 });
    att += sulMolo(rx, rocco({ t, andatura: arriva > 0 && arriva < 1 ? "passo" : "fermo", fase: fase(-rx, CICLO.roccoPasso), ampiezza: 0.8, testa: 14 + 8 * pesa, pena: 0.4 + 0.4 * pesa }, { defs, luce: L, id: "rocco" }), -1);
    // prima il molo e la poppa (il salto, Rocco che arriva); poi più larga, fino a Brénta a prua
    const cam = camTra({ x: -520, y: 750, zoom: 1.2 }, { x: -760, y: 745, zoom: 1.0 }, ease.dentroFuori(rampa(t, 3.2, 5.2)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.2 }, attori: att }) };
  },
};

/** 17 · Fermo come un sasso in secca (p.8). */
const s17: Inquadratura = {
  id: "s17",
  titolo: "Stare fermo",
  pagina: 8,
  durata: 10,
  didascalie: [
    { da: 0.4, a: 4.8, pagina: 8, testo: "«E fermo come un sasso in secca—» La barca s'inclinò, pensò su, decise di reggere.", chi: "brenta" },
    { da: 5.2, a: 9.8, pagina: 8, testo: "Stare fermo, Rocco lo sapeva fare benissimo. Era il muoversi, il problema." },
  ],
  suoni: [{ t: 2.0, nome: "legno", vol: 0.8, durata: 1.6 }],
  ambiente: { vento: 0.2, lago: 0.7 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    // la barca ci pensa (dopo la battuta di Brénta), poi decide di reggere
    const pensa = Math.sin(Math.PI * rampa(t, 1.8, 4.2)) * 3.5 * (1 - rampa(t, 3.6, 4.6));
    const b = laBarca(v.t, X_ORMEGGIO, L, defs, { fermo: 1, inclina: pensa, carico: 1, zara: { t, andatura: "seduta", testa: 2, codaAvvolta: 1 }, rocco: { t, andatura: "fermo", testa: 4, occhi: rampa(t, 6.5, 7.2) * 0.5 }, brenta: { zampe: "ferme", bocca: v.bocca("brenta"), testa: -4 } });
    const cam = camTra({ x: X_ORMEGGIO - 60, y: Q - 150, zoom: 1.5 }, { x: X_ORMEGGIO - 140, y: Q - 170, zoom: 1.75 }, ease.dentroFuori(t / 10));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.2 }, attori: b.disegno }) };
  },
};

/** La traversata: dove sta la barca al tempo t di un'inquadratura (va a sinistra, piano). */
const xBarca = (inizio: number, t: number, vel = 55) => inizio - vel * t;

/** 18 · Il martin pescatore (p.9). */
const s18: Inquadratura = {
  id: "s18",
  titolo: "L'acqua di mezzo",
  pagina: 9,
  durata: 11,
  entrata: { tipo: "dissolvenza", durata: 1.2 },
  didascalie: [
    { da: 0.6, a: 4.2, pagina: 9, testo: "L'acqua di mezzo era d'un grigio che teneva dentro l'oro." },
    { da: 4.8, a: 10.8, pagina: 9, testo: "si tuffò, sbagliò pesce, riemerse con niente e un'aria offesa, come se il pesce avesse barato." },
  ],
  suoni: [
    { t: 0, nome: "remo", durata: 11, ritmo: 0.55, vol: 0.6 },
    { t: 6.2, nome: "schiocco", vol: 0.8 },
  ],
  ambiente: { vento: 0.15, lago: 0.8 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const xb = xBarca(RIVA.largo + 900, v.t);
    const posato = t > 7.5;
    const b = laBarca(v.t, xb, L, defs, { vogata: v.t * 0.55, carico: 1, zara: { t, andatura: "seduta", testa: -8 + 10 * rampa(t, 7.6, 8.4), codaAvvolta: 1, sguardo: -0.5 }, rocco: { t, andatura: "fermo", testa: 2 }, brenta: { zampe: "remo", testa: -2 } });
    // la punta della prua (dove andrà a posarsi), che segue la barca e il suo dondolio
    const a = (b.ang * Math.PI) / 180;
    const pl: P = [-L_BARCA / 2 - 36, -86];
    const prua: P = [xb + pl[0] * Math.cos(a) - pl[1] * Math.sin(a), b.y + pl[0] * Math.sin(a) + pl[1] * Math.cos(a)];
    // il martin pescatore (tutto rispetto alla barca che avanza): arriva basso sull'acqua, si alza,
    // si tuffa davanti alla prua, riemerge con niente e va a posarsi sulla punta, offeso, a sgocciolare
    const TUFFO = -780;
    let m: P;
    let modo: "volo" | "tuffo" | "posato" = "volo";
    let ang = 0;
    if (t < 5.8) m = [xb - 1350 + 570 * rampa(t, 1.0, 5.8, ease.lineare), Q - 58 - 8 * onda(t, 0.9)];
    else if (t < 6.02) m = [xb + TUFFO - 20, Q - 58 - 60 * ease.fuori(rampa(t, 5.8, 6.02))];
    else if (t < 6.26) {
      const k = rampa(t, 6.02, 6.26, ease.dentro);
      m = [xb + TUFFO - 20 + 20 * k, Q - 118 + 118 * k];
      modo = "tuffo";
      ang = 70;
    } else if (t < 6.56) m = [xb + TUFFO, Q + 40];
    else if (!posato) {
      const k = rampa(t, 6.56, 7.5);
      m = [lerp(xb + TUFFO, prua[0], ease.dentroFuori(k)), lerp(Q - 10, prua[1], ease.fuori(k)) - Math.sin(Math.PI * k) * 60];
    } else {
      m = prua;
      modo = "posato";
    }
    let att = b.disegno;
    if (!(t > 6.26 && t < 6.56)) att += inPunto(m, martinPescatore({ t, modo, offeso: rampa(t, 7.8, 8.6), bagnato: 1 - rampa(t, 10, 11) * 0.5 }, { luce: L, defs, id: "martin" }), { verso: -1, scala: 2, ang });
    att += cerchiAcqua(L, [xb + TUFFO + 55 * Math.max(0, t - 6.26), Q + 2], rampa(t, 6.2, 8.4), 0.9);
    // la camera segue la barca: larga; poi il tuffo; poi la punta della prua, e l'offesa
    const k = traccia([[0, 0], [4.8, 0], [5.9, 1, ease.dentroFuori], [6.8, 1], [7.9, 2, ease.dentroFuori]])(t);
    const larga: Camera = { x: xb - 520, y: Q - 150, zoom: 1.05 };
    const tuffo: Camera = { x: xb + TUFFO + 60, y: Q - 90, zoom: 1.7 };
    const punta: Camera = { x: prua[0] + 120, y: prua[1] + 10, zoom: 2.6 };
    const cam = k <= 1 ? camTra(larga, tuffo, k) : camTra(tuffo, punta, k - 1);
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.25, luccichii: 0.35 }, attori: att }) };
  },
};

/** 19 · «Succede ai migliori» (p.9). */
const s19: Inquadratura = {
  id: "s19",
  titolo: "Succede ai migliori",
  pagina: 9,
  durata: 10,
  didascalie: [
    { da: 0.4, a: 5.4, pagina: 9, testo: "«Succede ai migliori,» disse Brénta senza voltarsi. Un nodo. «L'acqua è vera due volte.»", chi: "brenta" },
    { da: 5.9, a: 9.8, pagina: 9, testo: "Un colpo di remo. «Lui ha creduto a quella sbagliata.»", chi: "brenta" },
  ],
  suoni: [{ t: 0.2, nome: "remo", durata: 10, ritmo: 0.5, vol: 0.5 }],
  ambiente: { vento: 0.15, lago: 0.8 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const xb = xBarca(RIVA.largo + 300, v.t);
    const nodo = t > 2.6 && t < 3.6;
    const b = laBarca(v.t, xb, L, defs, { vogata: v.t * 0.5, carico: 1, zara: { t, andatura: "seduta", testa: 0, codaAvvolta: 1, orecchie: 0.5 }, rocco: { t, andatura: "fermo", testa: 2 }, brenta: { zampe: nodo ? "nodo" : "remo", bocca: v.bocca("brenta"), testa: -2 } });
    const cam = camTra({ x: xb + BORDO.brenta - 120, y: Q - 170, zoom: 2.2 }, { x: xb + BORDO.brenta - 160, y: Q - 170, zoom: 2.35 }, ease.dentroFuori(t / 10));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.2 }, attori: b.disegno }) };
  },
};

/** 20 · «È lontano, il cuore?» (p.10). */
const s20: Inquadratura = {
  id: "s20",
  titolo: "Il lago decide, io remo",
  pagina: 10,
  durata: 9,
  didascalie: [
    { da: 0.5, a: 4.0, pagina: 10, testo: "«È lontano, il cuore?» chiese Rocco, dopo un poco.", chi: "rocco" },
    { da: 4.5, a: 8.8, pagina: 10, testo: "«Quanto basta.» Un colpo di remo. «Il lago decide, io remo—»", chi: "brenta" },
  ],
  suoni: [{ t: 0.3, nome: "remo", durata: 9, ritmo: 0.5, vol: 0.55 }],
  ambiente: { vento: 0.15, lago: 0.8 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const xb = xBarca(RIVA.largo - 250, v.t);
    const b = laBarca(v.t, xb, L, defs, { vogata: v.t * 0.5, carico: 1, zara: { t, andatura: "seduta", testa: 2, codaAvvolta: 1 }, rocco: { t, andatura: "fermo", testa: -4, bocca: v.bocca("rocco"), pena: 0.3 }, brenta: { zampe: "remo", bocca: v.bocca("brenta"), testa: -4 } });
    const cam = camTra({ x: xb - 40, y: Q - 150, zoom: 1.35 }, { x: xb + 60, y: Q - 150, zoom: 1.45 }, ease.dentroFuori(t / 9));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.2 }, attori: b.disegno }) };
  },
};

/** 21 · A metà del lago, tirò i remi in barca. Il silenzio (p.10). */
const s21: Inquadratura = {
  id: "s21",
  titolo: "Il silenzio",
  pagina: 10,
  durata: 9,
  didascalie: [{ da: 0.5, a: 8.8, pagina: 10, testo: "E poi, a metà del lago e a metà d'una frase, tirò i remi in barca. Il silenzio salì dall'acqua tutto insieme." }],
  suoni: [{ t: 0, nome: "remo", durata: 2.2, ritmo: 0.5, vol: 0.5 }],
  ambiente: { vento: 0.02, lago: 0.15 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const xb = xBarca(RIVA.largo - 700, Math.min(v.t, 3) + Math.max(0, v.t - 3) * 0.15);
    const fermo = ease.dentroFuori(rampa(t, 2.4, 4));
    const b = laBarca(v.t, xb, L, defs, { vogata: Math.min(v.t, 2.4) * 0.5, fermo, carico: 1, calma: 1 - 0.6 * fermo, zara: { t, andatura: "seduta", testa: 0, codaAvvolta: 1 }, rocco: { t, andatura: "fermo", testa: 2 }, brenta: { zampe: fermo > 0.9 ? "ferme" : "remo", testa: 10 * fermo } });
    // si allarga: la barca sola in mezzo al lago fermo
    const cam = camTra({ x: xb + 40, y: Q - 150, zoom: 1.4 }, { x: xb, y: Q - 260, zoom: 0.55 }, ease.dentroFuori(rampa(t, 3.5, 8.8)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.3, vento: 0.02 }, attori: b.disegno }) };
  },
};

/** 22 · «Cosa portate?» (p.11). */
const s22: Inquadratura = {
  id: "s22",
  titolo: "Cosa portate?",
  pagina: 11,
  durata: 8,
  didascalie: [
    { da: 0.8, a: 2.8, pagina: 11, testo: "«Cosa portate?»", chi: "brenta" },
    { da: 3.4, a: 7.8, pagina: 11, testo: "Zara sentì le zampe dire via. Ma via, lì, non esisteva." },
  ],
  ambiente: { vento: 0.02, lago: 0.12 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const xb = RIVA.largo - 700 - 55 * 3 - 0.15 * 55 * 6;
    const b = laBarca(v.t, xb, L, defs, { fermo: 1, carico: 1, calma: 0.4, zara: { t, andatura: "seduta", testa: -4 + 8 * rampa(t, 3.4, 4.4), codaAvvolta: 1, orecchie: 0.8 - 1.4 * rampa(t, 3.4, 4.2) + 0.9 * rampa(t, 5.6, 6.8), sguardo: 0.8 }, rocco: { t, andatura: "fermo", testa: 2 }, brenta: { zampe: "ferme", bocca: v.bocca("brenta"), testa: 16 } });
    // il campo e controcampo in uno: da Brénta che guarda l'involto, a Zara
    const cam = camTra({ x: xb + BORDO.brenta - 100, y: Q - 170, zoom: 2.6 }, { x: xb + BORDO.zara + 40, y: Q - 130, zoom: 2.6 }, ease.dentroFuori(rampa(t, 2.6, 4)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.3, vento: 0.02 }, attori: b.disegno }) };
  },
};

/** 23 · La corda di suo fratello, sul legno (p.11). */
const s23: Inquadratura = {
  id: "s23",
  titolo: "La corda sul legno",
  pagina: 11,
  durata: 11.3,
  entrata: { tipo: "dissolvenza", durata: 0.8 },
  didascalie: [
    { da: 0.5, a: 8.4, pagina: 11, testo: "e tirò fuori la corda di suo fratello, il nodo a metà, davanti a un'estranea, per la prima volta da che l'aveva al fianco." },
    { da: 8.7, a: 11.1, pagina: 11, testo: "La posò sul legno, tra loro." },
  ],
  ambiente: { vento: 0.02, lago: 0.1 },
  disegna(t, defs) {
    const srot = ease.dentroFuori(rampa(t, 0.6, 7.6));
    const lettura = t < 8 ? srot * 0.9 : -1;
    return { cam: { x: 0, y: 0, zoom: 1 }, livelli: insertoCorda({ t, luce: LUCI.giorno, defs, srotolata: srot, lettura, spinta: t / 11.3, fondo: "legno" }) };
  },
};

/** 24 · Brénta guardò la corda, poi lei (p.12). */
const s24: Inquadratura = {
  id: "s24",
  titolo: "Uno sguardo diverso",
  pagina: 12,
  durata: 10,
  didascalie: [
    { da: 0.5, a: 3.2, pagina: 12, testo: "Brénta guardò la corda a lungo." },
    { da: 3.8, a: 9.8, pagina: 12, testo: "Poi guardò lei — non le strisce, non la taglia: lei — e fu uno sguardo diverso da tutti quelli delle rive." },
  ],
  ambiente: { vento: 0.02, lago: 0.1 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const xb = RIVA.largo - 700 - 55 * 3 - 0.15 * 55 * 6;
    const alza = ease.dentroFuori(rampa(t, 3.8, 5.2));
    const b = laBarca(v.t, xb, L, defs, { fermo: 1, carico: 1, calma: 0.3, zara: { t, andatura: "seduta", testa: 0, codaAvvolta: 1, orecchie: 0.3, sguardo: 0.9 }, rocco: { t, andatura: "fermo", testa: 2 }, brenta: { zampe: "ferme", testa: 26 - 30 * alza } });
    const cam = camTra({ x: xb + BORDO.brenta - 60, y: Q - 150, zoom: 2.8 }, { x: xb + (BORDO.brenta + BORDO.zara) / 2, y: Q - 150, zoom: 2.2 }, ease.dentroFuori(rampa(t, 3.4, 9)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.3, vento: 0.02 }, attori: b.disegno }) };
  },
};

/** 25 · Più sola che tra le canne con un rinoceronte (p.12): la barca sola sul lago fermo. */
const s25: Inquadratura = {
  id: "s25",
  titolo: "La solitudine",
  pagina: 12,
  durata: 11,
  entrata: { tipo: "dissolvenza", durata: 1 },
  didascalie: [
    { da: 0.6, a: 5.8, pagina: 12, testo: "tra cento musi quasi uguali al suo, Zara era stata più sola che tra le canne con un rinoceronte." },
    { da: 6.3, a: 10.8, pagina: 12, testo: "E la solitudine, che non aveva fatto rumore arrivando, se ne andò facendone un po'." },
  ],
  ambiente: { vento: 0.03, lago: 0.15 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const xb = RIVA.largo - 700 - 55 * 3 - 0.15 * 55 * 6;
    const b = laBarca(v.t, xb, L, defs, { fermo: 1, carico: 1, calma: 0.3, zara: { t, andatura: "seduta", testa: 0, codaAvvolta: 1 }, rocco: { t, andatura: "fermo", testa: 2 }, brenta: { zampe: "ferme" } });
    const cam = camTra({ x: xb - 200, y: Q - 330, zoom: 0.5 }, { x: xb - 120, y: Q - 300, zoom: 0.62 }, ease.dentroFuori(t / 11));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.35, vento: 0.03, luccichii: 0.2 }, attori: b.disegno }) };
  },
};

/** 26 · «Dormi con la zampa sopra» — le zampe di Brénta sul liscio (p.13). */
const s26: Inquadratura = {
  id: "s26",
  titolo: "La zampa ci va da sola",
  pagina: 13,
  durata: 8.4,
  entrata: { tipo: "dissolvenza", durata: 0.8 },
  didascalie: [
    { da: 0.5, a: 3.2, pagina: 13, testo: "«Dormi con la zampa sopra.»", chi: "brenta" },
    { da: 3.6, a: 8.2, pagina: 13, testo: "«L'ho visto salire a bordo. La zampa ci va da sola.»", chi: "brenta" },
  ],
  ambiente: { vento: 0.02, lago: 0.1 },
  disegna(t, defs) {
    // sul liscio, a pesarla come si pesa una cima
    const u = lerp(FINE_NODI + 0.2, FINE_NODI + 0.12, ease.dentroFuori(t / 8.4));
    return { cam: { x: 0, y: 0, zoom: 1 }, livelli: insertoCorda({ t, luce: LUCI.giorno, defs, srotolata: 1, lettura: -1, spinta: 0.3 + t / 20, fondo: "legno", zampeLontra: { u } }) };
  },
};

/** 27 · Lo strappo da lavoro: il nodo non si mosse (p.13). */
const s27: Inquadratura = {
  id: "s27",
  titolo: "Il nodo non si mosse",
  pagina: 13,
  durata: 6,
  didascalie: [
    { da: 0.4, a: 3.0, pagina: 13, testo: "Poi diede un colpetto secco al nodo a metà" },
    { da: 3.4, a: 5.8, pagina: 13, testo: "Il nodo non si mosse." },
  ],
  suoni: [{ t: 1.6, nome: "zampa", vol: 0.9 }],
  ambiente: { vento: 0.02, lago: 0.1 },
  disegna(t, defs) {
    // la zampa va sul nodo a metà (l'ultimo di Toraki) e dà lo strappo
    const strappo = rampa(t, 1.5, 2.6, ease.lineare);
    const u = lerp(FINE_NODI + 0.12, FINE_NODI - 0.02, ease.dentroFuori(rampa(t, 0.2, 1.4)));
    return { cam: { x: 0, y: 0, zoom: 1 }, livelli: insertoCorda({ t, luce: LUCI.giorno, defs, srotolata: 1, lettura: -1, spinta: 0.6, fondo: "legno", zampeLontra: { u, strappo: strappo > 0 && strappo < 1 ? strappo : 0 } }) };
  },
};

/** 28 · Il nodo da pescatori, accanto a quello di Toraki (p.13). */
const s28: Inquadratura = {
  id: "s28",
  titolo: "Il nodo da pescatori",
  pagina: 13,
  durata: 12,
  didascalie: [
    { da: 0.4, a: 5.8, pagina: 13, testo: "«Chi tiene la zampa sopra una cosa anche nel sonno—» un capo della sua rete, due giri, «—trasporta cose care.»", chi: "brenta" },
    { da: 6.3, a: 11.8, pagina: 13, testo: "E annodò il suo nodo da pescatori accanto a quello di Toraki senza guardarlo nemmeno una volta:" },
  ],
  ambiente: { vento: 0.02, lago: 0.1 },
  disegna(t, defs) {
    const fatto = ease.dentroFuori(rampa(t, 2.5, 10.5));
    // le zampe annodano da sole, appena a destra del nodo che nasce (lei guarda Zara)
    return { cam: { x: 0, y: 0, zoom: 1 }, livelli: insertoCorda({ t, luce: LUCI.giorno, defs, srotolata: 1, lettura: -1, spinta: 0.7 + t / 30, fondo: "legno", nuovi: [{ u: NODO_BRENTA, fatto }], zampeLontra: { u: NODO_BRENTA + 0.045, lavora: rampa(t, 2.3, 2.8) * (1 - rampa(t, 10.2, 10.8)) } }) };
  },
};

/** 29 · «Il vostro tiene.» «Grazie.» (p.13). */
const s29: Inquadratura = {
  id: "s29",
  titolo: "Il vostro tiene",
  pagina: 13,
  durata: 7,
  didascalie: [
    { da: 0.6, a: 3.2, pagina: 13, testo: "«Il vostro tiene,» disse.", chi: "brenta" },
    { da: 3.8, a: 6.8, pagina: 13, testo: "«Grazie,» disse Zara.", chi: "zara" },
  ],
  ambiente: { vento: 0.02, lago: 0.12 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const xb = RIVA.largo - 700 - 55 * 3 - 0.15 * 55 * 6;
    const b = laBarca(v.t, xb, L, defs, { fermo: 1, carico: 1, calma: 0.3, zara: { t, andatura: "seduta", testa: -2, codaAvvolta: 1, orecchie: 0.6, bocca: v.bocca("zara"), sguardo: 0.9 }, rocco: { t, andatura: "fermo", testa: 2 }, brenta: { zampe: "ferme", bocca: v.bocca("brenta"), testa: -2 } });
    const cam = camTra({ x: xb + BORDO.brenta - 80, y: Q - 160, zoom: 2.6 }, { x: xb + BORDO.zara + 40, y: Q - 130, zoom: 2.6 }, ease.dentroFuori(rampa(t, 3.0, 4.0)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.3, vento: 0.02 }, attori: b.disegno }) };
  },
};

/** 30 · Tòc tòc: la barca diceva di sì anche a loro (p.14). */
const s30: Inquadratura = {
  id: "s30",
  titolo: "Diceva di sì anche a loro",
  pagina: 14,
  durata: 11,
  entrata: { tipo: "dissolvenza", durata: 0.8 },
  didascalie: [
    { da: 0.5, a: 4.6, pagina: 14, testo: "Brénta batté due colpetti sul bordo, tòc tòc, com'aveva fatto al molo." },
    { da: 5.1, a: 10.8, pagina: 14, testo: "Solo che stavolta — e Zara lo sentì nelle zampe, prima che in ogni altro posto — la barca diceva di sì anche a loro." },
  ],
  suoni: [
    { t: 2.8, nome: "toc", vol: 1 },
    { t: 7.6, nome: "legno", vol: 0.55, durata: 1.2 },
    { t: 9.6, nome: "remo", durata: 2, ritmo: 0.5, vol: 0.5 },
  ],
  ambiente: { vento: 0.1, lago: 0.4 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const xb = RIVA.largo - 700 - 55 * 3 - 0.15 * 55 * 6 - Math.max(0, v.t - 9.6) * 55;
    const tocca = t > 2.6 && t < 3.4;
    const si = Math.sin(Math.PI * rampa(t, 7.5, 9)) * 1.4;
    const b = laBarca(v.t, xb, L, defs, { fermo: 1 - rampa(t, 0.5, 2.2), vogata: Math.max(0, v.t - 9.6) * 0.5, inclina: si, carico: 1, zara: { t, andatura: "seduta", testa: 2, codaAvvolta: 1, orecchie: 0.2 + 0.7 * rampa(t, 7.6, 8.4) }, rocco: { t, andatura: "fermo", testa: 2 }, brenta: { zampe: tocca ? "tocco" : "remo", testa: -4 } });
    const cam = camTra({ x: xb + 100, y: Q - 140, zoom: 1.5 }, { x: xb + BORDO.zara, y: Q - 120, zoom: 2.2 }, ease.dentroFuori(rampa(t, 4.5, 9)));
    return { cam, livelli: V.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.25, luccichii: 0.25 }, attori: b.disegno }) };
  },
};

/** 31 · L'approdo: «Di là» (p.15). */
const s31: Inquadratura = {
  id: "s31",
  titolo: "Di là",
  pagina: 15,
  durata: 8,
  entrata: { tipo: "dissolvenza", durata: 1.2 },
  didascalie: [{ da: 1.0, a: 7.6, pagina: 15, testo: "«Di là. Dove l'acqua si fa stretta e le voci si fanno tante—»", chi: "brenta" }],
  ambiente: { vento: 0.2, lago: 0.6 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const xb = -560;
    const indica = ease.dentroFuori(rampa(t, 1.4, 2.6));
    const b = laBarca(v.t, xb, L, defs, { fermo: 1, carico: 0.3, calma: 0.6, brenta: { zampe: "ferme", bocca: v.bocca("brenta"), testa: -14 * indica, china: -6 * indica } });
    const att = b.disegno + A.Z(150, { t, andatura: "fermo", involto: true, testa: -6, orecchie: 0.6 }, 1, L, defs) + A.R(520, { t, andatura: "fermo", testa: -4 }, 1, L, defs);
    const cam = camTra({ x: -120, y: 730, zoom: 1.0 }, { x: 60, y: 740, zoom: 1.1 }, ease.dentroFuori(t / 8));
    return { cam, livelli: A.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.25 }, attori: att }) };
  },
};

/** 32 · «Posso reggerti il molo» — «Si paga al ritorno» (p.15). */
const s32: Inquadratura = {
  id: "s32",
  titolo: "Una storia vera",
  pagina: 15,
  durata: 14,
  didascalie: [
    { da: 0.5, a: 3.2, pagina: 15, testo: "«Posso reggerti il molo,» provò.", chi: "rocco" },
    { da: 3.7, a: 5.8, pagina: 15, testo: "«Il molo regge da solo.»", chi: "brenta" },
    { da: 6.2, a: 11.0, pagina: 15, testo: "«A parole no: mi dovete una storia vera. Vale più dell'oro, da queste parti.»", chi: "brenta" },
    { da: 11.4, a: 13.8, pagina: 15, testo: "Primo colpo di remo. «Si paga al ritorno.»", chi: "brenta" },
  ],
  suoni: [{ t: 11.4, nome: "remo", durata: 2.6, ritmo: 0.55, vol: 0.6 }],
  ambiente: { vento: 0.2, lago: 0.6 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const parte = Math.max(0, v.t - 11.4);
    const xb = -560 - parte * 40;
    const b = laBarca(v.t, xb, L, defs, { fermo: 1 - rampa(t, 4.2, 6), vogata: parte * 0.55, carico: 0.3, calma: 0.7, brenta: { zampe: t < 6 ? "ferme" : "remo", bocca: v.bocca("brenta"), testa: -4 } });
    const att = b.disegno + A.Z(150, { t, andatura: "fermo", involto: true, testa: -4, orecchie: 0.5, bocca: v.bocca("zara") }, -1, L, defs) + A.R(430, { t, andatura: "fermo", testa: 6, bocca: v.bocca("rocco"), pena: 0.6 - 0.4 * rampa(t, 6, 9) }, -1, L, defs);
    const cam = camTra({ x: 80, y: 740, zoom: 1.25 }, { x: -60, y: 740, zoom: 1.1 }, ease.dentroFuori(t / 14));
    return { cam, livelli: A.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.25 }, attori: att }) };
  },
};

/** 33 · Dietro, i colpi di remo si fecero piccoli (p.16). */
const s33: Inquadratura = {
  id: "s33",
  titolo: "Verso dove le rive si stringono",
  pagina: 16,
  durata: 8.2,
  entrata: { tipo: "dissolvenza", durata: 1 },
  didascalie: [{ da: 0.6, a: 7.8, pagina: 16, testo: "Dietro, i colpi di remo si fecero piccoli, poi minuti, poi acqua e basta." }],
  suoni: [
    { t: 0, nome: "remo", durata: 5, ritmo: 0.55, vol: 0.35 },
    { t: 0.2, nome: "passi", durata: 7.8, vol: 0.6 },
  ],
  ambiente: { vento: 0.25, lago: 0.4 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const xb = -1400 - v.t * 60;
    const b = laBarca(v.t, xb, L, defs, { vogata: v.t * 0.55, carico: 0.3, brenta: { zampe: "remo" } });
    const xz = 500 + 62 * t;
    const xr = 40 + 58 * t;
    const zp: PosaZara = { t, andatura: "passo", fase: fase(xz, CICLO.zaraPasso), ampiezza: 1, involto: true, testa: 2 };
    const rp: PosaRocco = { t, andatura: "passo", fase: fase(xr, CICLO.roccoPasso), ampiezza: 1, testa: 4 };
    const att = b.disegno + A.R(xr, rp, 1, L, defs) + A.Z(xz, zp, 1, L, defs);
    const cam = camTra({ x: 100, y: 700, zoom: 0.7 }, { x: 500, y: 710, zoom: 0.75 }, ease.dentroFuori(t / 8.2));
    return { cam, livelli: A.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { nebbia: 0.3 }, attori: att }) };
  },
};

/** 34 · Sotto la zampa, i nodi adesso erano due (p.16). */
const s34: Inquadratura = {
  id: "s34",
  titolo: "I nodi adesso erano due",
  pagina: 16,
  durata: 9,
  entrata: { tipo: "dissolvenza", durata: 0.8 },
  didascalie: [{ da: 0.6, a: 8.6, pagina: 16, testo: "Sotto la zampa, quando lo toccò, i nodi adesso erano due: quello di suo fratello, e uno che rispondeva." }],
  ambiente: { vento: 0.2, lago: 0.2 },
  disegna(t, defs) {
    // la zampa sui nodi, dentro l'involto di foglie: si ferma sul nodo a metà, e accanto ce n'è uno che risponde
    const lettura = lerp(FINE_NODI - 0.26, FINE_NODI - 0.02, ease.dentroFuori(rampa(t, 1, 6.5)));
    return { cam: { x: 0, y: 0, zoom: 1 }, livelli: insertoCorda({ t, luce: LUCI.giorno, defs, srotolata: 1, lettura, spinta: t / 9, fondo: "foglie", nuovi: [{ u: NODO_BRENTA, fatto: 1 }] }) };
  },
};

/** 35 · Coda. */
const s35: Inquadratura = {
  id: "s35",
  titolo: "Coda",
  pagina: 16,
  durata: 6.4,
  entrata: { tipo: "dissolvenza", durata: 1 },
  titoli: [
    {
      da: 0.4,
      a: 6.3,
      righe: [
        { testo: "Rocco & Zara", corpo: 104, y: 420, peso: 500 },
        { testo: "ep02 — Il regno senza riflesso", corpo: 46, y: 500 },
        { testo: "continua in ep03 — Lo specchio", corpo: 34, y: 610, corsivo: true },
        { testo: "animatica · disegnata e animata in codice", corpo: 26, y: 690, spaziatura: 2, colore: "#e9dcc0" },
      ],
    },
  ],
  ambiente: { vento: 0.25, lago: 0.4 },
  disegna(t, defs, v) {
    const L = LUCI.tramonto;
    const cam: Camera = { x: -300 + t * 12, y: 640, zoom: 0.36 - t * 0.004 };
    return { cam, livelli: A.scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { sole: 0.15, nebbia: 0.35 } }) };
  },
};

export const EP02: Episodio = {
  id: "ep02",
  titolo: "Il regno senza riflesso",
  prosa: "saga/prosa/ep02.md",
  sfondo: "#1d1b17",
  inquadrature: [s01, s02, s03, s04, s05, s06, s07, s08, s09, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19, s20, s21, s22, s23, s24, s25, s26, s27, s28, s29, s30, s31, s32, s33, s34, s35],
};

export default EP02;

void g;
void onda;
