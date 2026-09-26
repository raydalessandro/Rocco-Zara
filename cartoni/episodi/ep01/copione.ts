// cartoni/episodi/ep01/copione.ts — il copione animato di «ep01 — Due mondi».
//
// Fonte: saga/prosa/ep01.md (pagine 1–19). Ogni inquadratura dichiara la
// pagina da cui viene, e ogni didascalia è CITATA alla lettera da quella
// pagina (test/cartoni.episodi.test.ts). Il cartone non riscrive la prosa:
// la mette in scena. Quello che la prosa non dice (dove sta la camera, quanto
// dura un passo) è regia, e sta tutto qui, leggibile.
//
// Grammatica visiva (saga/bible/STILE_VISIVO.md §2–§3, vincolante):
// varietà focale (drone ↔ macro), il POV basso e veloce di Zara, il
// contrasto di scala dal basso (Rocco monumentale), lo scambio tra i due
// mostrato — chi guida, chi protegge — e il ritmo vicino↔lontano.

import { gazza, marmotta, martinPescatore, stormo } from "../../cast/fauna";
import { type PosaRocco } from "../../cast/rocco";
import { type PosaZara } from "../../cast/zara";
import { LAGO, LUOGHI, SOGLIA, posatoioGazza, ramoSecco } from "../../luoghi/soglia";
import { type Luce, mescolaLuce } from "../../motore/colore";
import { type Camera, type Livello } from "../../motore/fotogramma";
import { type Episodio, type Inquadratura } from "../../motore/montaggio";
import { type Defs, type P, cerchioD, ellisseD, g, n, path } from "../../motore/svg";
import { clamp, ease, lerp, onda, rampa, traccia } from "../../motore/tempo";
import { FINE_NODI, insertoCorda, insertoPietra } from "../../scene/inserti";
import { LUCI } from "../../scene/luci";
import { type Meteo } from "../../scene/meteo";
import { palcoscenico } from "../../scene/palcoscenico";
import { CICLO, camTra, fase, inPunto, scossa, tremito } from "../../scene/regia";

// ------------------------------------------------------------- attrezzi --
/** Il palco di tutto l'episodio: la Soglia di Spondalta. */
const { scena, R, Z, quota, canneDavanti } = palcoscenico(SOGLIA);

// Ingombri (scala 1, misurati sui pupazzi): Rocco va da −178 (coda) a +313
// (muso) attorno al suo centro; Zara da −160 a +163. Per guardarsi in faccia
// senza pestarsi servono ~550 unità tra i centri.
/** In cima: Zara a sinistra della pietra, Rocco a destra. */
const CIMA = { zara: -310, rocco: 240 } as const;
/** Il riparo della tempesta: Zara sotto il bordo di roccia, Rocco fuori, schiena al vento. */
const RIPARO = { zara: -110, rocco: 360 } as const;

// ================================================================ copione ==

/** 1 · La Soglia dall'alto: il drone scende verso la collina (p.1). */
const s01: Inquadratura = {
  id: "s01",
  titolo: "La Soglia dall'alto",
  pagina: 1,
  durata: 9,
  titoli: [
    {
      da: 0.5,
      a: 5,
      righe: [
        { testo: "Rocco & Zara", corpo: 136, y: 440, peso: 500 },
        { testo: "le Terre Annodate", corpo: 40, y: 512, spaziatura: 6, corsivo: true },
        { testo: "ep01 — Due mondi", corpo: 54, y: 620 },
      ],
    },
  ],
  didascalie: [{ da: 5.3, a: 8.9, pagina: 1, testo: "La Soglia di Spondalta era una collina sola in mezzo alla luce" }],
  ambiente: { vento: 0.35, lago: 0.4 },
  disegna(t, defs, v) {
    const k = ease.morbido(t / 9);
    const cam = camTra({ x: -900, y: 330, zoom: 0.19 }, { x: -160, y: 40, zoom: 0.34 }, k);
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: LUCI.giorno }) };
  },
};

/** 2 · Zara arriva di corsa, il POV basso e veloce (p.1). */
const s02: Inquadratura = {
  id: "s02",
  titolo: "Zara arriva di corsa",
  pagina: 1,
  durata: 7,
  entrata: { tipo: "dissolvenza", durata: 0.8 },
  didascalie: [{ da: 0.8, a: 6.8, pagina: 1, testo: "Zara ci arrivò dal versante dei laghi, di corsa, perché in quei giorni faceva tutto di corsa" }],
  suoni: [{ t: 0, nome: "galoppo", durata: 7, ritmo: 315 / (CICLO.zaraCorsa * 0.85) }],
  ambiente: { vento: 0.45, lago: 0.2 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const x = -2330 + 315 * t;
    const zp: PosaZara = { t, andatura: "corsa", fase: fase(x + 2330, CICLO.zaraCorsa, 0.85), ampiezza: 0.85, involto: true };
    const cam: Camera = { x: x + 230, y: quota(x + 120) - 120, zoom: 1.5 };
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: Z(x, zp, 1, L, defs), primo: true }) };
  },
};

/** 3 · In cima si fermò; l'erba come il pelo di una bestia che respira (p.1). */
const s03: Inquadratura = {
  id: "s03",
  titolo: "In cima si fermò",
  pagina: 1,
  durata: 7.5,
  didascalie: [{ da: 1.4, a: 7.3, pagina: 1, testo: "L'erba si muoveva piano, tutta da una parte, come il pelo di una bestia che respira" }],
  suoni: [{ t: 0, nome: "galoppo", durata: 0.5, ritmo: 1.2 }],
  ambiente: { vento: 0.7, lago: 0.2 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const x = -130 + 70 * ease.fuori(t / 0.45);
    const k = rampa(t, 0.15, 0.75);
    const zp: PosaZara = {
      t,
      andatura: "corsa",
      fase: fase(x + 130, CICLO.zaraCorsa, 0.85),
      ampiezza: 0.85 * (1 - k),
      involto: true,
      verso: { altra: { t, andatura: "fermo", involto: true, testa: -4, orecchie: 0.6 }, k },
    };
    const cam = camTra({ x: 70, y: -170, zoom: 1.7 }, { x: 60, y: -165, zoom: 1.85 }, ease.dentroFuori(t / 7.5));
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: Z(x, zp, 1, L, defs), meteo: { vento: 0.75 } }) };
  },
};

/** 4 · Un martin pescatore bucò il lago. Uno schiocco (p.1). */
const s04: Inquadratura = {
  id: "s04",
  titolo: "Il martin pescatore",
  pagina: 1,
  durata: 6,
  didascalie: [{ da: 0.5, a: 5.8, pagina: 1, testo: "Da qualche parte, sotto, un martin pescatore bucò il lago. Uno schiocco." }],
  suoni: [{ t: 2.35, nome: "schiocco" }],
  ambiente: { vento: 0.3, lago: 0.9 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const cam: Camera = { x: -2660 + t * 8, y: 760, zoom: 1.25 };
    const tuffo = 2.35;
    let att = "";
    const acqua: P = [-2760, LAGO.quota];
    if (t < tuffo) {
      // vola basso e poi si butta
      const k = t / tuffo;
      const x = lerp(-3300, acqua[0] - 30, k);
      const y = lerp(640, 700, k) + (k > 0.7 ? ((k - 0.7) / 0.3) ** 2 * 210 : 0);
      const tuffando = k > 0.72;
      att += inPunto([x, y], martinPescatore({ t, modo: tuffando ? "tuffo" : "volo" }, { defs, luce: L, id: "mp" }), { scala: 2.2, ang: tuffando ? 62 : 0 });
    }
    if (t >= tuffo) {
      // il buco nell'acqua: anelli che si allargano e qualche goccia
      const dt = t - tuffo;
      for (let i = 0; i < 3; i++) {
        const r = dt * (90 + i * 40) - i * 12;
        if (r <= 0) continue;
        att += path(ellisseD([acqua[0], acqua[1] + 8], r, r * 0.16), { fill: "none", stroke: "#e9f3f6", "stroke-width": 3, opacity: n(clamp(0.8 - dt * 0.25)) });
      }
      if (dt < 0.8) {
        let gocce = "";
        for (let i = 0; i < 9; i++) {
          const a = -Math.PI * (0.15 + (i / 8) * 0.7);
          const v = 180 + (i % 3) * 60;
          const gx = acqua[0] + Math.cos(a) * v * dt;
          const gy = acqua[1] + Math.sin(a) * v * dt + 520 * dt * dt;
          gocce += cerchioD([gx, gy], 4);
        }
        att += path(gocce, { fill: "#eaf4f7", opacity: n(1 - dt / 0.8) });
      }
    }
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: att }) };
  },
};

/** 5 · L'Aperto: bassa tra due rocce, guarda a lungo (p.2). */
const s05: Inquadratura = {
  id: "s05",
  titolo: "L'Aperto",
  pagina: 2,
  durata: 9,
  entrata: { tipo: "dissolvenza", durata: 0.9 },
  didascalie: [
    { da: 0.8, a: 3.9, pagina: 2, testo: "L'Aperto. Ne conosceva solo il nome." },
    { da: 4.3, a: 8.8, pagina: 2, testo: "E allora perché, pensò, non riesco a smettere di guardare?", pensiero: true },
  ],
  ambiente: { vento: 0.45 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const zp: PosaZara = { t, andatura: "acquattata", involto: true, testa: -2, sguardo: 0.9, orecchie: 0.8 };
    const k = ease.morbido((t - 0.8) / 6.5);
    const cam = camTra({ x: 300, y: -40, zoom: 2.9 }, { x: 1250, y: 120, zoom: 0.62 }, k);
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: Z(275, zp, 1, L, defs) }) };
  },
};

/** 6 · All'alba: tutto freddo, tranne una pietra (p.3). Macro. */
const s06: Inquadratura = {
  id: "s06",
  titolo: "La pietra tiepida",
  pagina: 3,
  durata: 8.5,
  entrata: { tipo: "nero", durata: 1.4 },
  didascalie: [
    { da: 1.4, a: 4.4, pagina: 3, testo: "Tutto, tranne una pietra." },
    { da: 4.8, a: 8.3, pagina: 3, testo: "Erano fatti bene. Fatti da qualcosa che non erano zampe." },
  ],
  suoni: [{ t: 1.5, nome: "zampa" }],
  ambiente: { vento: 0.15, lago: 0.2 },
  disegna(t, defs, v) {
    const L = mescolaLuce(LUCI.alba, LUCI.giorno, clamp(t / 8.5) * 0.5);
    return {
      cam: { x: 0, y: 0, zoom: 1 },
      livelli: insertoPietra({ t, luce: L, defs, piene: false, zampa: rampa(t, 0.4, 1.6), brina: 0.7 * (1 - t / 16), vapore: 0.35, cielo: "#c7d3de", spinta: t / 8.5 }),
    };
  },
};

/** 7 · La corda di Toraki: nodi fitti fino a metà, poi il liscio (p.4). Macro. */
const s07: Inquadratura = {
  id: "s07",
  titolo: "La corda di Toraki",
  pagina: 4,
  durata: 12.5,
  entrata: { tipo: "dissolvenza", durata: 0.9 },
  didascalie: [
    { da: 1.6, a: 6.6, pagina: 4, testo: "ogni nodo un luogo dove suo fratello era stato, e leggerli con la zampa era come camminargli dietro." },
    { da: 6.9, a: 9.9, pagina: 4, testo: "Poi la zampa arrivò al liscio. Il liscio era lungo." },
    { da: 10.2, a: 12.4, pagina: 4, testo: "«Ora tocca a te,» aveva detto lui.", chi: "fratello" },
  ],
  suoni: [{ t: 0.2, nome: "fruscio" }],
  ambiente: { vento: 0.15 },
  disegna(t, defs, v) {
    const srot = 0.22 + 0.78 * ease.fuoriCubo(t / 1.5);
    // la zampa legge nodo per nodo (si ferma un poco su ciascuno), poi il liscio
    let lettura = -1;
    if (t > 1.6) {
      const u = clamp((t - 1.8) / 4.9);
      const passi = 7;
      const f = u * passi;
      const gradino = Math.floor(f) + ease.dentroFuori(clamp((f - Math.floor(f)) * 2.2));
      lettura = lerp(0.07, FINE_NODI - 0.03, clamp(gradino / passi));
      if (t > 6.8) lettura = lerp(FINE_NODI - 0.03, 0.74, ease.fuori((t - 6.8) / 2.6));
    }
    return {
      cam: { x: 0, y: 0, zoom: 1 },
      livelli: insertoCorda({ t, luce: LUCI.giorno, defs, srotolata: srot, lettura, spinta: t / 12.5 }),
    };
  },
};

/** 8a · Il masso grigio sul versante aperto (p.5). */
const s08: Inquadratura = {
  id: "s08",
  titolo: "Un masso grigio che si muoveva",
  pagina: 5,
  durata: 6.5,
  entrata: { tipo: "dissolvenza", durata: 1 },
  didascalie: [{ da: 0.8, a: 6.3, pagina: 5, testo: "Fu così che vide, sul versante aperto, un masso grigio che si muoveva." }],
  ambiente: { vento: 0.5 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const cam = camTra({ x: 820, y: 60, zoom: 0.78 }, { x: 900, y: 110, zoom: 0.86 }, ease.dentroFuori(t / 6.5));
    // lontano (finto: più piccolo), sale controvento
    const xr = 1900 - 22 * t;
    const ferma = t > 3.2 && t < 4.8;
    const rp: PosaRocco = { t, andatura: ferma ? "fermo" : "passo", fase: fase(1900 - xr, CICLO.roccoPasso, 0.34), giro: ferma ? 1 : 0.5 };
    const att = Z(170, { t, andatura: "seduta", involto: true, sguardo: 1, orecchie: 0.7 }, 1, L, defs) + R(xr, rp, -1, L, defs, "rocco", 0.34);
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: att }) };
  },
};

/** 8b · Da vicino: lento, controvento, la testa girata sempre dalla stessa parte (p.5). */
const s09: Inquadratura = {
  id: "s09",
  titolo: "Lento, controvento",
  pagina: 5,
  durata: 7.5,
  didascalie: [
    { da: 0.5, a: 3.9, pagina: 5, testo: "I massi non si muovono. Quello sì: lento, controvento" },
    { da: 4.2, a: 7.3, pagina: 5, testo: "come chi porta qualcosa che non vuole mostrare." },
  ],
  suoni: [{ t: 0.3, nome: "passi", durata: 2.8, ritmo: 1.08 }, { t: 5.0, nome: "passi", durata: 2.5, ritmo: 1.08 }],
  ambiente: { vento: 0.6 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    // cammina, si ferma, gira la testa (sempre dalla stessa parte), riparte
    const pos = traccia([
      [0, 1880],
      [3.0, 1800, ease.lineare],
      [3.4, 1792, ease.fuori],
      [4.8, 1792, ease.dentro],
      [7.5, 1720, ease.lineare],
    ]);
    const xr = pos(t);
    const amp = t < 3.2 ? 1 : t < 4.9 ? 1 - rampa(t, 3.0, 3.4) + rampa(t, 4.6, 5.0) : 1;
    const giro = clamp(0.35 + rampa(t, 3.3, 3.9) * 0.65 - rampa(t, 4.6, 5.2) * 0.4);
    const rp: PosaRocco = { t, andatura: "passo", fase: fase(1880 - xr, CICLO.roccoPasso), ampiezza: amp, giro, orecchie: 0.4, pena: 0.3 };
    const cam: Camera = { x: 1790 - t * 6, y: quota(1790) - 150, zoom: 1.45 };
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: R(xr, rp, -1, L, defs), meteo: { vento: 0.6 } }) };
  },
};

/** 9 · La gazza sul ramo secco guarda l'involto, e poi il luccichio (p.6). */
const s10: Inquadratura = {
  id: "s10",
  titolo: "La gazza",
  pagina: 6,
  durata: 10.5,
  entrata: { tipo: "dissolvenza", durata: 0.8 },
  didascalie: [
    { da: 0.8, a: 4.3, pagina: 6, testo: "«Tu saresti quella che— aspetta, cos'è quel—»", chi: "cecca" },
    { da: 5.0, a: 10.3, pagina: 6, testo: "Uno scatto, il luccichio nel becco, e via bassa sopra il canneto, verso sud, senza finire né la frase né il lavoro." },
  ],
  suoni: [
    { t: 1.0, nome: "gazza", durata: 2.6 },
    { t: 3.9, nome: "luccichio" },
    { t: 4.6, nome: "frullo" },
    { t: 5.3, nome: "frullo" },
  ],
  ambiente: { vento: 0.3, lago: 0.7 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const perch = posatoioGazza();
    const luccichio: P = [-2030, quota(-2030) - 6];
    let att = "";
    // Zara in riva, a bere; poi alza la testa
    const beve = 1 - rampa(t, 0.4, 1.0);
    att += Z(-2400, { t, andatura: "fermo", involto: true, testa: 26 * beve - 6, sguardo: 0.9, orecchie: 0.7 }, 1, L, defs);
    // il luccichio tra i sassi
    if (t > 3.7 && t < 5.1) {
      const b = Math.sin((t - 3.7) * 9) * 0.5 + 0.5;
      att += path(`M${n(luccichio[0] - 14)} ${n(luccichio[1])}h28M${n(luccichio[0])} ${n(luccichio[1] - 14)}v28`, { stroke: "#fff6d6", "stroke-width": 3, opacity: n(0.4 + 0.6 * b), "stroke-linecap": "round" });
      att += path(ellisseD(luccichio, 5, 3), { fill: "#f0dc92" });
    }
    // la gazza
    if (t < 4.5) {
      const guarda = t < 3.8 ? 28 : 28 - 44 * rampa(t, 3.8, 4.0); // lo scatto verso il luccichio
      att += inPunto(perch, gazza({ t, modo: "posata", testa: guarda, becco: v.bocca("cecca") }, { defs, luce: L, id: "cecca" }), { scala: 2.1, verso: -1 });
    } else {
      // uno scatto giù sul luccichio, poi via bassa verso sud
      const k = t - 4.5;
      let p: P;
      if (k < 0.5) p = [lerp(perch[0], luccichio[0], ease.dentroFuori(k / 0.5)), lerp(perch[1], luccichio[1] - 20, ease.dentro(k / 0.5))];
      else p = [luccichio[0] + (k - 0.5) * 520, luccichio[1] - 30 - (k - 0.5) * 60 + Math.sin(k * 5) * 6];
      att += inPunto(p, gazza({ t, modo: "volo", fase: t * 3.4, nelBecco: k > 0.45 }, { defs, luce: L, id: "cecca" }), { scala: 2.1, ang: k < 0.5 ? 20 : -4 });
    }
    const cam = camTra({ x: -2250, y: 740, zoom: 2.05 }, { x: -1950, y: 700, zoom: 1.35 }, ease.dentroFuori((t - 4.4) / 2.8));
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: att, davanti: canneDavanti(v.t, L, defs, cam, cam.x - 1600, cam.x + 1600) }) };
  },
};

/** 10a · Il giorno che il masso grigio salì la collina (p.7). */
const s11: Inquadratura = {
  id: "s11",
  titolo: "Il masso sale la collina",
  pagina: 7,
  durata: 7.5,
  entrata: { tipo: "nero", durata: 1.2 },
  didascalie: [{ da: 0.8, a: 7.3, pagina: 7, testo: "Il giorno che il masso grigio salì la collina, le zampe di Zara dissero via. Lei, per una volta, non le ascoltò." }],
  suoni: [{ t: 0.2, nome: "passi", durata: 7.3, ritmo: 1.76 }],
  ambiente: { vento: 0.4 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const xr = 580 - 44 * t;
    const rp: PosaRocco = { t, andatura: "passo", fase: fase(580 - xr, CICLO.roccoPasso), giro: 0.8, orecchie: 0.2 };
    // le zampe dicono via: si abbassa, il peso indietro… e resta
    const via = rampa(t, 2.2, 2.6) * (1 - rampa(t, 4.4, 5.4));
    const zp: PosaZara = { t, andatura: "fermo", involto: true, orecchie: 0.9 - via * 1.6, verso: { altra: { t, andatura: "acquattata", involto: true }, k: via * 0.75 } };
    const cam = camTra({ x: 160, y: -150, zoom: 1.2 }, { x: 60, y: -150, zoom: 1.4 }, ease.dentroFuori(t / 7.5));
    const att = ramoSecco(L, 0) + Z(CIMA.zara, zp, 1, L, defs) + R(xr, rp, -1, L, defs);
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: att }) };
  },
};

/** 10b · CRACK: il ramo esplode, mezzo canneto si alza in volo. «Scusa!» (p.7). */
const s12: Inquadratura = {
  id: "s12",
  titolo: "CRACK",
  pagina: 7,
  durata: 5,
  didascalie: [{ da: 1.3, a: 4.9, pagina: 7, testo: "«Scusa!» disse. Al ramo, agli uccelli, e un po' anche a lei.", chi: "rocco" }],
  suoni: [{ t: 0.55, nome: "crack" }, { t: 0.75, nome: "stormo" }, { t: 0, nome: "passi", durata: 0.6, ritmo: 1.76 }],
  ambiente: { vento: 0.4, lago: 0.3 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const xr = 250 - 18 * ease.fuori(t / 0.6);
    const rp: PosaRocco = {
      t,
      andatura: "passo",
      fase: fase(580 - xr, CICLO.roccoPasso),
      ampiezza: 1 - rampa(t, 0.4, 0.8),
      giro: 0.8 - rampa(t, 0.7, 1.0) * 0.5,
      orecchie: 1,
      pena: rampa(t, 0.8, 1.1),
      bocca: v.bocca("rocco"),
    };
    const rotto = t < 0.55 ? 0 : clamp((t - 0.55) / 1.4);
    const zp: PosaZara = { t, andatura: "fermo", involto: true, orecchie: -0.6 + rampa(t, 1.6, 2.6) * 1.2, occhi: t > 0.55 && t < 0.8 ? 0.8 : 0 };
    let cam: Camera = { x: -20, y: -60, zoom: 0.98 };
    cam = scossa(cam, t, 0.55, 18, 0.7);
    const att = ramoSecco(L, rotto) + Z(CIMA.zara, zp, 1, L, defs) + R(xr, rp, -1, L, defs);
    // lo stormo si alza dal canneto lontano, da dietro la spalla della collina
    const stormoL: Livello = { id: "stormo", p: 0.34, contenuto: g({ transform: "translate(-700 470)scale(1.5)" }, stormo(t, clamp((t - 0.7) / 3.2), { defs, luce: L, id: "st" }, 42)) };
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: att, extraDietro: [stormoL] }) };
  },
};

/** 10c · Dal basso: il sole alle sue spalle, e la sua ombra cadde su Zara (p.7). */
const s13: Inquadratura = {
  id: "s13",
  titolo: "L'ombra",
  pagina: 7,
  durata: 7.5,
  didascalie: [
    { da: 0.5, a: 4.4, pagina: 7, testo: "Il sole gli stava alle spalle, e la sua ombra cadde su Zara tutta insieme." },
    { da: 4.7, a: 7.3, pagina: 7, testo: "Dentro l'ombra l'aria era fresca." },
  ],
  suoni: [{ t: 0.35, nome: "passi", durata: 1.2, ritmo: 1.6 }],
  ambiente: { vento: 0.3 },
  disegna(t, defs, v) {
    const Lsole = mescolaLuce(LUCI.giorno, LUCI.tramonto, 0.55);
    // Rocco fa un passo avanti: l'ombra arriva su di lei tutta insieme
    const xr = 232 - 36 * ease.dentroFuori(clamp((t - 0.3) / 1.4));
    const rp: PosaRocco = { t, andatura: "passo", fase: fase(232 - xr, CICLO.roccoPasso), ampiezza: 1 - rampa(t, 1.3, 1.8), giro: 0.2, pena: 0.5, orecchie: 0.5 };
    const ombra = rampa(t, 1.0, 1.7);
    const Lombra = mescolaLuce(Lsole, { ...LUCI.giorno, ambiente: [0.62, 0.66, 0.78], ombra: [0.45, 0.48, 0.6], forzaBordo: 0.05, bordo: "#c9d8ff" }, ombra);
    const zp: PosaZara = { t, andatura: "fermo", involto: true, testa: -18, sguardo: 0.6, orecchie: 0.4 + ombra * 0.4, occhi: rampa(t, 4.8, 5.2) * 0.5 * (1 - rampa(t, 6.3, 6.7)) };
    const cam = camTra({ x: -60, y: -215, zoom: 1.9 }, { x: -70, y: -225, zoom: 2.0 }, ease.dentroFuori(t / 7.5));
    // l'ombra di Rocco a terra, che si allunga fino a lei
    const ombraTerra = path(ellisseD([lerp(40, -250, ombra), quota(-100) + 4], lerp(120, 260, ombra), 20), { fill: "#1c2030", opacity: n(0.35 * ombra) });
    const att = ombraTerra + Z(-330, zp, 1, Lombra, defs) + R(xr, rp, -1, Lsole, defs);
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: Lsole, attori: att, soleA: [0.7, 0.36], meteo: { sole: 0.3 } }) };
  },
};

/** 11 · «Sei piccola.» «Sono giovane.» «Anch'io.» (p.8). */
const s14: Inquadratura = {
  id: "s14",
  titolo: "Sei piccola / Sono giovane",
  pagina: 8,
  durata: 11,
  didascalie: [
    { da: 0.3, a: 2.8, pagina: 8, testo: "«Sei piccola,» disse lui, guardandola dritto in faccia", chi: "rocco" },
    { da: 3.0, a: 5.2, pagina: 8, testo: "«Sono giovane.»", chi: "zara" },
    { da: 5.4, a: 8.6, pagina: 8, testo: "«Anch'io,» disse il rinoceronte, e girò la testa. «Rocco.»", chi: "rocco" },
    { da: 8.9, a: 10.8, pagina: 8, testo: "«Zara.»", chi: "zara" },
  ],
  suoni: [{ t: 3.0, nome: "gonfia" }],
  ambiente: { vento: 0.35 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const gonfia = rampa(t, 2.9, 3.3, ease.fuoriRitorno) * (1 - rampa(t, 8.9, 9.8));
    const zp: PosaZara = { t, andatura: "fermo", involto: true, gonfia, bocca: v.bocca("zara"), orecchie: 0.5 + gonfia * 0.5, sguardo: 0.8 };
    const giro = rampa(t, 6.1, 6.8);
    const rp: PosaRocco = { t, andatura: "fermo", bocca: v.bocca("rocco"), giro, testa: 8 - giro * 4, orecchie: 0.3 };
    const cam = camTra({ x: -30, y: -170, zoom: 1.72 }, { x: -40, y: -175, zoom: 1.9 }, ease.dentroFuori(t / 11));
    const att = Z(CIMA.zara, zp, 1, L, defs) + R(CIMA.rocco, rp, -1, L, defs);
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: att }) };
  },
};

/** 12 · Nel canneto: «Dove passo io, passi tu.» (p.11). */
const s15: Inquadratura = {
  id: "s15",
  titolo: "Dove passo io, passi tu",
  pagina: 11,
  durata: 10.5,
  entrata: { tipo: "dissolvenza", durata: 1 },
  didascalie: [
    { da: 0.8, a: 3.7, pagina: 11, testo: "Zara si mise davanti: «Dove passo io, passi tu.»", chi: "zara" },
    { da: 4.0, a: 7.8, pagina: 11, testo: "E lui dietro, un passo alla volta, enorme e attento — e non si ruppe più niente." },
    { da: 8.0, a: 10.3, pagina: 11, testo: "Quasi niente. Un giunco, forse due." },
  ],
  suoni: [{ t: 0.2, nome: "passi", durata: 10.2, ritmo: 1.44, vol: 0.6 }, { t: 8.3, nome: "giunco" }],
  ambiente: { vento: 0.35, lago: 0.8 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    // camminano verso il lago: lei avanti, lui dietro, piano
    const xz = -1880 - 36 * t;
    const xr = xz + 540;
    const zp: PosaZara = { t, andatura: "passo", fase: fase(-1880 - xz, CICLO.zaraPasso), ampiezza: 0.8, involto: true, testa: -4 + onda(t, 3) * 3, orecchie: 0.6, bocca: v.bocca("zara") };
    const rp: PosaRocco = { t, andatura: "passo", fase: fase(-1880 - xz, CICLO.roccoPasso), ampiezza: 0.62, testa: 14, orecchie: 0.8, pena: 0.4 };
    const cam: Camera = { x: xz + 270, y: quota(xz + 270) - 170, zoom: 1.12 };
    // il giunco che si spezza: piega di colpo e resta piegato
    let giunco = "";
    const xg = -2300;
    if (t > 8.3) {
      const k = ease.assesta(clamp((t - 8.3) / 0.9));
      const y0 = quota(xg);
      const a = (-90 + 70 * k) * (Math.PI / 180);
      giunco = path(`M${n(xg)} ${n(y0)}L${n(xg)} ${n(y0 - 110)}L${n(xg + Math.cos(a) * 130)} ${n(y0 - 110 + Math.sin(a) * 130)}`, { stroke: "#80683b", "stroke-width": 3.5, fill: "none", "stroke-linecap": "round" });
    }
    const att = giunco + Z(xz, zp, -1, L, defs) + R(xr, rp, -1, L, defs);
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: att, davanti: canneDavanti(v.t, L, defs, cam, cam.x - 1300, cam.x + 1300) }) };
  },
};

/** 13 · La marmotta fischia due volte; a sud il cielo mette su un colore nuovo (p.13). */
const s16: Inquadratura = {
  id: "s16",
  titolo: "Il fischio lungo",
  pagina: 13,
  durata: 11,
  entrata: { tipo: "dissolvenza", durata: 1 },
  didascalie: [
    { da: 0.4, a: 4.4, pagina: 13, testo: "Fischiò due volte, quel pomeriggio — il fischio lungo, quello che non riguarda le volpi." },
    { da: 4.8, a: 10.8, pagina: 13, testo: "A sud il cielo aveva messo su un colore nuovo: nuvole basse, ferme come una riva di pietra che però avanzava." },
  ],
  suoni: [
    { t: 1.3, nome: "fischio", durata: 0.45 },
    { t: 2.2, nome: "fischio", durata: 1.1 },
    { t: 5.5, nome: "tuono-lontano" },
  ],
  ambiente: { vento: 0.55 },
  disegna(t, defs, v) {
    const k = rampa(t, 3.6, 9.5, ease.morbido);
    const L = mescolaLuce(LUCI.giorno, LUCI.presagio, rampa(t, 4.0, 10));
    const xm = -760;
    const ym = quota(xm) - 30;
    const fischio = clamp(Math.max(rampa(t, 1.25, 1.35) * (1 - rampa(t, 1.7, 1.8)), rampa(t, 2.15, 2.25) * (1 - rampa(t, 3.2, 3.3))));
    const att = inPunto([xm, ym], marmotta({ t, ritta: rampa(t, 0.2, 0.8), fischio }, { defs, luce: L, id: "marm" }), { scala: 1.6 });
    const cam = camTra({ x: -740, y: ym - 60, zoom: 2.6 }, { x: 420, y: -420, zoom: 0.8 }, k);
    const meteo: Partial<Meteo> = { temporale: 0.08 + rampa(t, 3.5, 11) * 0.42, vento: 0.5 + k * 0.25, versoVento: lerp(1, -1, rampa(t, 5.0, 8.0)) };
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: att, meteo }) };
  },
};

/** 14 · Il buio arriva prima della sera. «Vieni. C'è un posto.» Lo guidò lei (p.14). */
const s17: Inquadratura = {
  id: "s17",
  titolo: "Lo guidò lei",
  pagina: 14,
  durata: 8,
  entrata: { tipo: "dissolvenza", durata: 1 },
  didascalie: [
    { da: 0.5, a: 3.4, pagina: 14, testo: "«Vieni,» disse Zara. «C'è un posto.»", chi: "zara" },
    { da: 4.0, a: 7.8, pagina: 14, testo: "Lo guidò lei." },
  ],
  suoni: [{ t: 0.2, nome: "passi", durata: 7.8, ritmo: 1.84 }, { t: 2.5, nome: "tuono-lontano" }],
  ambiente: { vento: 0.8, pioggia: 0.3, notte: 0.6 },
  disegna(t, defs, v) {
    const kb = rampa(t, 0, 8);
    const L = mescolaLuce(LUCI.presagio, LUCI.notte, 0.35 + kb * 0.5);
    const xz = 300 - 46 * t;
    const xr = xz + 540;
    const zp: PosaZara = { t, andatura: "passo", fase: fase(300 - xz, CICLO.zaraPasso), ampiezza: 0.9, involto: true, testa: -6, bocca: v.bocca("zara"), orecchie: 0.4 };
    const rp: PosaRocco = { t, andatura: "passo", fase: fase(300 - xz, CICLO.roccoPasso), ampiezza: 0.9, testa: 10, orecchie: 0.9, pena: 0.3 };
    const cam: Camera = tremito({ x: xz + 270, y: -170, zoom: 1.2 }, t, 3);
    const meteo: Partial<Meteo> = { temporale: 0.6 + kb * 0.3, notte: 0.35 + kb * 0.5, vento: 0.85, versoVento: -1, pioggia: rampa(t, 3, 8) * 0.35, nebbia: 0 };
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: Z(xz, zp, -1, L, defs) + R(xr, rp, -1, L, defs), meteo, mandrie: false }) };
  },
};

/** 15a · La tempesta: Rocco si pianta di traverso al vento (p.15). */
const s18: Inquadratura = {
  id: "s18",
  titolo: "Grande come una riva",
  pagina: 15,
  durata: 9,
  didascalie: [
    { da: 0.4, a: 3.2, pagina: 15, testo: "Il mondo diventò acqua e rumore." },
    { da: 3.6, a: 8.8, pagina: 15, testo: "si piantò di traverso al vento, grande come una riva, e non si mosse più." },
  ],
  suoni: [{ t: 0.9, nome: "tuono" }, { t: 5.2, nome: "tuono" }],
  ambiente: { vento: 1, pioggia: 1, notte: 1 },
  disegna(t, defs, v) {
    const lampo = Math.max(lampeggio(t, 0.8), lampeggio(t, 5.0));
    const L = mescolaLuce(LUCI.notte, { ...LUCI.notte, ambiente: [1.1, 1.12, 1.25], ombra: [0.6, 0.62, 0.75] }, lampo * 0.8);
    const piantato = rampa(t, 1.8, 3.2, ease.assesta);
    const xr = RIPARO.rocco + 50 - 50 * ease.dentroFuori(clamp(t / 2));
    const rp: PosaRocco = { t, andatura: "passo", fase: fase(RIPARO.rocco + 50 - xr, CICLO.roccoPasso), ampiezza: 1 - rampa(t, 1.2, 2.0), piantato, bagnato: 0.9, testa: 6, orecchie: -0.6, occhi: 0.25 };
    const zp: PosaZara = { t, andatura: "acquattata", bagnata: 0.8, involto: true, orecchie: -0.8, codaAvvolta: 1, occhi: 0.2 };
    const cam: Camera = tremito({ x: 90, y: -160, zoom: 1.3 }, t, 5);
    const meteo: Partial<Meteo> = { temporale: 1, notte: 1, pioggia: 1, vento: 1, versoVento: -1, lampo, nebbia: 0 };
    const riparo = { x0: -330, x1: lerp(-330, xr - 300, piantato), y0: -260 };
    return {
      cam,
      livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: Z(RIPARO.zara, zp, -1, L, defs) + R(xr, rp, -1, L, defs), meteo, mandrie: false, riparo }),
    };
  },
};

/** 15b · «Nella tua ombra mi sono sentita al sicuro.» (p.15). */
const s19: Inquadratura = {
  id: "s19",
  titolo: "Al sicuro",
  pagina: 15,
  durata: 10,
  didascalie: [
    { da: 1.4, a: 6.4, pagina: 15, testo: "«Nella tua ombra mi sono sentita al sicuro.»", chi: "zara" },
    { da: 6.8, a: 9.8, pagina: 15, testo: "Il tuono dopo arrivò da più lontano." },
  ],
  suoni: [{ t: 7.2, nome: "tuono-lontano" }],
  ambiente: { vento: 0.7, pioggia: 0.8, notte: 1 },
  disegna(t, defs, v) {
    const lampo = lampeggio(t, 6.9) * 0.35;
    const L = mescolaLuce(LUCI.notte, { ...LUCI.notte, ambiente: [0.9, 0.95, 1.1] }, lampo);
    const rp: PosaRocco = { t, andatura: "fermo", piantato: 1, bagnato: 0.9, testa: 8, orecchie: rampa(t, 2.2, 2.8) * 1.4 - 0.4, occhi: 0.3 * (1 - rampa(t, 2.2, 2.6)) };
    const zp: PosaZara = { t, andatura: "acquattata", bagnata: 0.7, involto: true, bocca: v.bocca("zara"), testa: 4, sguardo: -0.7, orecchie: -0.2 + rampa(t, 1.0, 2.0) * 0.5 };
    const cam: Camera = tremito({ x: -20, y: -110, zoom: 2.1 }, t, 2);
    const meteo: Partial<Meteo> = { temporale: 1, notte: 1, pioggia: 0.8 * (1 - t / 20), vento: 0.8 - t * 0.03, versoVento: -1, lampo, nebbia: 0 };
    return {
      cam,
      livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: Z(RIPARO.zara, zp, -1, L, defs) + R(RIPARO.rocco, rp, -1, L, defs), meteo, mandrie: false, riparo: { x0: -330, x1: RIPARO.rocco - 300, y0: -260 } }),
    };
  },
};

/** 16 · L'alba lavata: una piccola luna per ogni segno (p.16). Macro. */
const s20: Inquadratura = {
  id: "s20",
  titolo: "Una piccola luna per ogni segno",
  pagina: 16,
  durata: 10,
  entrata: { tipo: "nero", durata: 1.8 },
  didascalie: [
    { da: 1.2, a: 4.2, pagina: 16, testo: "Tutto, tranne il posto dove avevano dormito." },
    { da: 4.5, a: 6.6, pagina: 16, testo: "Si lascia tiepida, pensò", pensiero: true },
    { da: 6.9, a: 9.8, pagina: 16, testo: "una piccola luna per ogni segno." },
  ],
  suoni: [{ t: 2.0, nome: "zampa" }],
  ambiente: { vento: 0.1, lago: 0.3 },
  disegna(t, defs, v) {
    return {
      cam: { x: 0, y: 0, zoom: 1 },
      livelli: insertoPietra({ t, luce: LUCI.alba, defs, piene: true, zampa: rampa(t, 1.2, 2.3), brina: 1, vapore: 0.7, cielo: "#c4d2de", spinta: t / 10 }),
    };
  },
};

/** 17 · Di nuovo la gazza: mille luccichii, e per una volta non si lascia strappare (p.17). */
const s21: Inquadratura = {
  id: "s21",
  titolo: "Mille luccichii",
  pagina: 17,
  durata: 8,
  entrata: { tipo: "dissolvenza", durata: 0.9 },
  didascalie: [{ da: 0.6, a: 7.8, pagina: 17, testo: "Durò finché il sole non toccò il lago: mille luccichii insieme — e per una volta Cècca non si lasciò strappare." }],
  suoni: [{ t: 5.4, nome: "frullo" }, { t: 5.9, nome: "frullo" }],
  ambiente: { vento: 0.2, lago: 0.8 },
  disegna(t, defs, v) {
    const L = mescolaLuce(LUCI.alba, LUCI.giorno, 0.3);
    const perch = posatoioGazza();
    let att = "";
    if (t < 5.3) {
      att += inPunto(perch, gazza({ t: t * 0.25, modo: "posata", testa: 6 }, { defs, luce: L, id: "cecca" }), { scala: 2.2, verso: -1 });
    } else {
      const k = t - 5.3;
      const p: P = [perch[0] + k * 560, perch[1] + 40 * ease.fuori(clamp(k / 0.6)) + 10];
      att += inPunto(p, gazza({ t, modo: "volo", fase: t * 3.6 }, { defs, luce: L, id: "cecca" }), { scala: 2.2, ang: -2 });
    }
    const cam = camTra({ x: -2330, y: 760, zoom: 1.9 }, { x: -2230, y: 740, zoom: 1.75 }, ease.dentroFuori(t / 8));
    const meteo: Partial<Meteo> = { lavato: 0.5, luccichii: rampa(t, 1.2, 3.0), sole: 0.2, nebbia: 0.5 };
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: att, meteo }) };
  },
};

/** 17b · «La conosci?» «No. Ma lei conosce noi.» (p.17). */
const s22: Inquadratura = {
  id: "s22",
  titolo: "Lei conosce noi",
  pagina: 17,
  durata: 6.5,
  didascalie: [
    { da: 0.3, a: 2.6, pagina: 17, testo: "«La conosci?» chiese Rocco.", chi: "rocco" },
    { da: 2.9, a: 6.3, pagina: 17, testo: "«No,» disse Zara. «Ma lei conosce noi.»", chi: "zara" },
  ],
  ambiente: { vento: 0.2 },
  disegna(t, defs, v) {
    const L = mescolaLuce(LUCI.alba, LUCI.giorno, 0.45);
    const zp: PosaZara = { t, andatura: "seduta", involto: true, bocca: v.bocca("zara"), sguardo: 1, testa: -4, orecchie: 0.8 };
    const rp: PosaRocco = { t, andatura: "fermo", bocca: v.bocca("rocco"), testa: 4, orecchie: 0.6, giro: 0 };
    const cam: Camera = { x: 70 + t * 3, y: -175, zoom: 1.6 };
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: R(-170, rp, 1, L, defs) + Z(300, zp, 1, L, defs), meteo: { lavato: 0.4, sole: 0.3 } }) };
  },
};

/** 18a · La corda accanto ai segni: «Si somigliano.» (p.18). Macro. */
const s23: Inquadratura = {
  id: "s23",
  titolo: "Si somigliano",
  pagina: 18,
  durata: 7,
  entrata: { tipo: "dissolvenza", durata: 0.9 },
  didascalie: [
    { da: 0.6, a: 3.0, pagina: 18, testo: "«Si somigliano,» disse.", chi: "rocco" },
    { da: 3.3, a: 6.8, pagina: 18, testo: "Poi guardò lei: «Dove va, il resto?»", chi: "rocco" },
  ],
  ambiente: { vento: 0.15 },
  disegna(t, defs, v) {
    return { cam: { x: 0, y: 0, zoom: 1 }, livelli: insertoCorda({ t, luce: LUCI.giorno, defs, srotolata: 1, lettura: -1, spinta: 0.4 + t / 12 }) };
  },
};

/** 18b · «Avanti. Dove i regni si toccano.» … «Vengo anch'io.» (p.18). */
const s24: Inquadratura = {
  id: "s24",
  titolo: "Vengo anch'io",
  pagina: 18,
  durata: 9.5,
  didascalie: [
    { da: 0.4, a: 3.8, pagina: 18, testo: "«Avanti. Dove i regni si toccano.»", chi: "zara" },
    { da: 4.4, a: 9.3, pagina: 18, testo: "Un altro momento, il più lungo. «Vengo anch'io.»", chi: "rocco" },
  ],
  ambiente: { vento: 0.3 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const zp: PosaZara = { t, andatura: "fermo", involto: false, bocca: v.bocca("zara"), sguardo: 0.7, orecchie: 0.6 };
    // il fiato grande: un respiro lungo prima di dirlo
    const rp: PosaRocco = { t, andatura: "fermo", bocca: v.bocca("rocco"), testa: 10 - rampa(t, 6.8, 7.3) * 10, occhi: rampa(t, 4.6, 5.2) * 0.6 * (1 - rampa(t, 6.4, 6.9)), orecchie: 0.2 + rampa(t, 7, 7.4) * 0.6 };
    const cam = camTra({ x: -30, y: -165, zoom: 1.72 }, { x: -20, y: -180, zoom: 2.0 }, ease.dentroFuori(t / 9.5));
    const att = Z(CIMA.zara, zp, 1, L, defs) + R(CIMA.rocco, rp, -1, L, defs);
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: att }) };
  },
};

/** 19 · Partirono che il sole era basso e il cielo enorme (p.19). */
const s25: Inquadratura = {
  id: "s25",
  titolo: "Partirono",
  pagina: 19,
  durata: 14,
  entrata: { tipo: "dissolvenza", durata: 1.2 },
  didascalie: [
    { da: 0.6, a: 6.2, pagina: 19, testo: "Partirono che il sole era basso e il cielo enorme, di quelli che stanno sopra tutti i regni insieme." },
    { da: 7.4, a: 13.4, pagina: 19, testo: "e la collina restò indietro, coi suoi segni e il suo tiepido." },
  ],
  suoni: [{ t: 0.2, nome: "passi", durata: 7.6, ritmo: 1.76 }],
  ambiente: { vento: 0.4, lago: 0.3 },
  disegna(t, defs, v) {
    const L = LUCI.tramonto;
    // Rocco scende verso sud; Zara passa la pietra, torna indietro di un passo,
    // ci posa la zampa — un momento solo — e lo raggiunge.
    const xr = 260 + 44 * t;
    const rp: PosaRocco = { t, andatura: "passo", fase: fase(xr - 260, CICLO.roccoPasso) };
    let xz: number;
    let zp: PosaZara;
    let verso: 1 | -1 = 1;
    if (t < 1.8) {
      xz = -60 + 110 * t;
      zp = { t, andatura: "passo", fase: fase(xz + 60, CICLO.zaraPasso), involto: true };
      if (t > 1.5) zp = { ...zp, ampiezza: 1 - rampa(t, 1.5, 1.8) };
    } else if (t < 4.6) {
      // di spalle alla strada: la zampa sulla pietra, quella che legge
      const k = clamp((t - 1.8) / 0.7);
      xz = 138 - 26 * ease.dentroFuori(k);
      verso = -1;
      zp = { t, andatura: "fermo", involto: true, testa: 26 * rampa(t, 2.4, 2.9) * (1 - rampa(t, 3.8, 4.3)), occhi: rampa(t, 2.7, 3.0) * 0.6 * (1 - rampa(t, 3.7, 4.0)) };
    } else {
      // lo raggiunge: al trotto finché non è dietro di lui, poi al passo
      const meta = xr - 400;
      const d = (t - 4.6) * 170;
      xz = Math.min(112 + d, meta);
      const kPasso = clamp(1 - (meta - (112 + d)) / 80);
      zp = {
        t,
        andatura: "corsa",
        fase: fase(d, CICLO.zaraCorsa, 0.55),
        ampiezza: 0.55,
        involto: true,
        verso: { altra: { t, andatura: "passo", fase: fase(xz, CICLO.zaraPasso), involto: true }, k: kPasso },
      };
    }
    const k = ease.morbido(clamp((t - 5.5) / 8.5));
    const cam = camTra({ x: 250, y: -110, zoom: 1.2 }, { x: 620, y: 200, zoom: 0.3 }, k);
    const att = Z(xz, zp, verso, L, defs) + R(xr, rp, 1, L, defs);
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: att, meteo: { sole: 0.12, nebbia: 0.3 } }) };
  },
};

/** 20 · Coda. */
const s26: Inquadratura = {
  id: "s26",
  titolo: "Coda",
  pagina: 19,
  durata: 6.5,
  titoli: [
    {
      da: 0.4,
      a: 6.4,
      righe: [
        { testo: "Rocco & Zara", corpo: 104, y: 420, peso: 500 },
        { testo: "ep01 — Due mondi", corpo: 46, y: 500 },
        { testo: "continua in ep02 — Il regno senza riflesso", corpo: 34, y: 610, corsivo: true },
        { testo: "animatica pilota · disegnata e animata in codice", corpo: 26, y: 690, spaziatura: 2, colore: "#e9dcc0" },
      ],
    },
  ],
  ambiente: { vento: 0.35 },
  disegna(t, defs, v) {
    const L = LUCI.tramonto;
    const cam: Camera = { x: 520 + t * 10, y: 180, zoom: 0.3 - t * 0.004 };
    return { cam, livelli: scena(14 + t, defs, { mondo: 14 + v.t, cam, luce: L, meteo: { sole: 0.12, nebbia: 0.3 } }) };
  },
};

/** Il lampo: un picco rapido che decade (con un secondo guizzo). */
function lampeggio(t: number, t0: number): number {
  const d = t - t0;
  if (d < 0 || d > 0.9) return 0;
  return Math.max(Math.exp(-d * 9), d > 0.18 ? 0.7 * Math.exp(-(d - 0.18) * 11) : 0);
}

export const EP01: Episodio = {
  id: "ep01",
  titolo: "Due mondi",
  prosa: "saga/prosa/ep01.md",
  sfondo: "#1d1b17",
  inquadrature: [s01, s02, s03, s04, s05, s06, s07, s08, s09, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19, s20, s21, s22, s23, s24, s25, s26],
};

export default EP01;
