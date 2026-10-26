// cartoni/episodi/ep01/copione.ts — il copione animato di «ep01 — Due mondi».
//
// Fonte: saga/prosa/ep01.md (pagine 1–19). Ogni inquadratura dichiara la
// pagina da cui viene, e ogni didascalia è CITATA alla lettera da quella
// pagina — o è una frase «cartone» dell'adattamento dell'episodio
// (episodi/ep01/adattamento.md, il secondo cancello: vale solo approvato da
// Ray; test/cartoni.episodi.test.ts). Il cartone non riscrive la prosa da sé:
// la mette in scena. Quello che la prosa non dice (dove sta la camera, quanto
// dura un passo) è regia, e sta tutto qui, leggibile.
//
// v2 (25/10/2026): la voce segue il bambino che ascolta. Il cartone dice di
// più della prosa (le frasi che servono a seguire la storia: la corda, il CRACK,
// il canneto, la sera del «Mio fratello—», il vento che gira, il buio) e dove la
// frase del libro non regge all'orecchio dice la frase dell'adattamento. Le
// inquadrature si allungano con le voci (~5′–5′30″ narrato).
//
// Grammatica visiva (saga/bible/STILE_VISIVO.md §2–§3, vincolante):
// varietà focale (drone ↔ macro), il POV basso e veloce di Zara, il
// contrasto di scala dal basso (Rocco monumentale), lo scambio tra i due
// mostrato — chi guida, chi protegge — e il ritmo vicino↔lontano.

import { gazza, marmotta, martinPescatore, stormo } from "../../cast/fauna";
import { type PosaRocco } from "../../cast/rocco";
import { type PosaZara } from "../../cast/zara";
import { LAGO, LUOGHI, SOGLIA, posatoioGazza, ramoSecco } from "../../luoghi/soglia";
import { type Luce, inLuce, mescolaLuce } from "../../motore/colore";
import { type Camera, type Livello } from "../../motore/fotogramma";
import { type Episodio, type Inquadratura } from "../../motore/montaggio";
import { type Defs, type P, cerchioD, ellisseD, g, n, path } from "../../motore/svg";
import { clamp, ease, impulso, lerp, onda, rampa, traccia } from "../../motore/tempo";
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
  durata: 13,
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
  didascalie: [
    { da: 5.3, a: 8.6, pagina: 1, testo: "La Soglia di Spondalta era una collina sola in mezzo alla luce" },
    // i due mondi detti in chiaro, sotto il drone che li mostra tutti e due (adattamento)
    { da: 8.9, a: 12.9, pagina: 1, testo: "Stava proprio dove un mondo finisce e l'altro non è ancora cominciato." },
  ],
  ambiente: { vento: 0.35, lago: 0.4 },
  disegna(t, defs, v) {
    const k = ease.morbido(t / 13);
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
  // la frase cade sulla corsa (adattamento)
  didascalie: [{ da: 0.8, a: 6.8, pagina: 1, testo: "Zara arrivò di corsa dal versante dei laghi: in quei giorni faceva tutto di corsa." }],
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
  durata: 9,
  didascalie: [
    { da: 0.6, a: 2.4, pagina: 1, testo: "In cima si fermò." },
    { da: 2.9, a: 8.5, pagina: 1, testo: "L'erba si muoveva piano, tutta da una parte, come il pelo di una bestia che respira" },
  ],
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
    const cam = camTra({ x: 70, y: -170, zoom: 1.7 }, { x: 60, y: -165, zoom: 1.85 }, ease.dentroFuori(t / 9));
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
  durata: 13,
  entrata: { tipo: "dissolvenza", durata: 0.9 },
  didascalie: [
    { da: 0.8, a: 3.5, pagina: 2, testo: "L'Aperto. Ne conosceva solo il nome." },
    { da: 3.9, a: 8.4, pagina: 2, testo: "Laggiù non c'era un posto — nemmeno uno — dove una tigre potesse sparire." },
    { da: 8.8, a: 12.7, pagina: 2, testo: "E allora perché, pensò, non riesco a smettere di guardare?", pensiero: true },
  ],
  ambiente: { vento: 0.45 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const zp: PosaZara = { t, andatura: "acquattata", involto: true, testa: -2, sguardo: 0.9, orecchie: 0.8 };
    const k = ease.morbido((t - 0.8) / 10.5);
    const cam = camTra({ x: 300, y: -40, zoom: 2.9 }, { x: 1250, y: 120, zoom: 0.62 }, k);
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: Z(275, zp, 1, L, defs) }) };
  },
};

/** 6 · All'alba: tutto freddo, tranne una pietra (p.3). Macro. */
const s06: Inquadratura = {
  id: "s06",
  titolo: "La pietra tiepida",
  pagina: 3,
  durata: 24,
  entrata: { tipo: "nero", durata: 1.4 },
  // l'inquadratura comincia dal freddo, poi la pietra, la zampa, i segni (adattamento, p.3)
  didascalie: [
    { da: 1.4, a: 5.9, pagina: 3, testo: "All'alba il freddo si prendeva tutto: l'erba, i sassi, la punta della coda." },
    { da: 6.3, a: 8.5, pagina: 3, testo: "Tutto, tranne una pietra." },
    { da: 9.0, a: 13.0, pagina: 3, testo: "Sotto la zampa si teneva tiepida, come una schiena addormentata." },
    { da: 13.5, a: 19.3, pagina: 3, testo: "Sopra correvano segni sottili, uno accanto all'altro. Non erano buche di pioggia, e non erano graffi." },
    { da: 19.8, a: 23.8, pagina: 3, testo: "Erano fatti bene. Fatti da qualcosa che non erano zampe." },
  ],
  suoni: [{ t: 9.3, nome: "zampa" }],
  ambiente: { vento: 0.15, lago: 0.2 },
  disegna(t, defs, v) {
    const L = mescolaLuce(LUCI.alba, LUCI.giorno, clamp(t / 24) * 0.5);
    return {
      cam: { x: 0, y: 0, zoom: 1 },
      // la zampa si posa quando la voce arriva al tiepido; la brina si scioglie piano col sole che sale
      livelli: insertoPietra({ t, luce: L, defs, piene: false, zampa: rampa(t, 8.4, 9.8), brina: 0.7 * (1 - t / 48), vapore: 0.35, cielo: "#c7d3de", spinta: t / 24 }),
    };
  },
};

/** 7 · La corda di Toraki: nodi fitti fino a metà, poi il liscio (p.4). Macro. */
const s07: Inquadratura = {
  id: "s07",
  titolo: "La corda di Toraki",
  pagina: 4,
  durata: 23.5,
  entrata: { tipo: "dissolvenza", durata: 0.9 },
  // chi ascolta deve sapere subito chi è Toraki; lo srotolare lo fa la zampa in scena (adattamento, p.4)
  didascalie: [
    { da: 1.0, a: 5.2, pagina: 4, testo: "Nell'involto di foglie Zara portava la corda di Toraki, suo fratello." },
    { da: 5.6, a: 8.3, pagina: 4, testo: "Nodi fitti fino a metà, poi più niente." },
    { da: 8.7, a: 14.6, pagina: 4, testo: "Ogni nodo era un luogo dove suo fratello era stato. Leggerli con la zampa era come camminargli dietro." },
    { da: 15.0, a: 18.9, pagina: 4, testo: "Poi la zampa arrivò al liscio. Il liscio era lungo." },
    { da: 19.4, a: 22.9, pagina: 4, testo: "«Ora tocca a te,» aveva detto lui.", chi: "fratello" },
  ],
  suoni: [{ t: 4.7, nome: "fruscio" }],
  ambiente: { vento: 0.15 },
  disegna(t, defs, v) {
    // la corda si srotola sotto «Nodi fitti fino a metà»
    const srot = 0.22 + 0.78 * ease.fuoriCubo((t - 4.6) / 2.2);
    // la zampa legge nodo per nodo (si ferma un poco su ciascuno), poi il liscio
    let lettura = -1;
    if (t > 8.7) {
      const u = clamp((t - 8.9) / 5.6);
      const passi = 7;
      const f = u * passi;
      const gradino = Math.floor(f) + ease.dentroFuori(clamp((f - Math.floor(f)) * 2.2));
      lettura = lerp(0.07, FINE_NODI - 0.03, clamp(gradino / passi));
      if (t > 14.9) lettura = lerp(FINE_NODI - 0.03, 0.74, ease.fuori((t - 14.9) / 3.2));
    }
    return {
      cam: { x: 0, y: 0, zoom: 1 },
      livelli: insertoCorda({ t, luce: LUCI.giorno, defs, srotolata: srot, lettura, spinta: t / 23.5 }),
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
  durata: 11,
  didascalie: [
    { da: 0.5, a: 4.5, pagina: 5, testo: "I massi non si muovono. Quello sì: lento, controvento" },
    // la frase comincia qui, sotto Rocco che gira la testa (adattamento)
    { da: 4.9, a: 10.8, pagina: 5, testo: "Ogni tanto si fermava e girava la testa da una parte, sempre la stessa, come chi porta qualcosa che non vuole mostrare." },
  ],
  suoni: [{ t: 0.3, nome: "passi", durata: 4.4, ritmo: 1.08 }, { t: 8.7, nome: "passi", durata: 2.3, ritmo: 1.08 }],
  ambiente: { vento: 0.6 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    // cammina, si ferma, gira la testa (sempre dalla stessa parte), riparte
    const pos = traccia([
      [0, 1880],
      [4.6, 1780, ease.lineare],
      [5.0, 1772, ease.fuori],
      [8.6, 1772, ease.dentro],
      [11, 1700, ease.lineare],
    ]);
    const xr = pos(t);
    const amp = t < 4.8 ? 1 : t < 8.7 ? 1 - rampa(t, 4.6, 5.0) + rampa(t, 8.4, 8.8) : 1;
    const giro = clamp(0.35 + rampa(t, 5.0, 5.8) * 0.65 - rampa(t, 8.4, 9.0) * 0.4);
    const rp: PosaRocco = { t, andatura: "passo", fase: fase(1880 - xr, CICLO.roccoPasso), ampiezza: amp, giro, orecchie: 0.4, pena: 0.3 };
    const cam: Camera = { x: 1790 - t * 5, y: quota(1790) - 150, zoom: 1.45 };
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: R(xr, rp, -1, L, defs), meteo: { vento: 0.6 } }) };
  },
};

/** 9 · La gazza sul ramo secco guarda l'involto, e poi il luccichio (p.6). */
const s10: Inquadratura = {
  id: "s10",
  titolo: "La gazza",
  pagina: 6,
  durata: 16,
  entrata: { tipo: "dissolvenza", durata: 0.8 },
  didascalie: [
    // «lei» all'orecchio non si sa chi è; il nome sì (adattamento)
    { da: 0.8, a: 5.4, pagina: 6, testo: "Stava su un ramo secco sopra la riva, e non guardava Zara: guardava l'involto." },
    { da: 5.8, a: 8.8, pagina: 6, testo: "«Tu saresti quella che— aspetta, cos'è quel—»", chi: "cecca" },
    // «verso sud» lo dice il volo; una pausa prima della chiusura (adattamento)
    { da: 9.3, a: 15.3, pagina: 6, testo: "Uno scatto, il luccichio nel becco, e via, bassa sopra il canneto — senza finire né la frase né il lavoro." },
  ],
  suoni: [
    { t: 5.9, nome: "gazza", durata: 2.6 },
    { t: 8.4, nome: "luccichio" },
    { t: 9.1, nome: "frullo" },
    { t: 9.8, nome: "frullo" },
  ],
  ambiente: { vento: 0.3, lago: 0.7 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const perch = posatoioGazza();
    const luccichio: P = [-2030, quota(-2030) - 6];
    let att = "";
    // Zara in riva, a bere; poi alza la testa (e la gazza, intanto, le guarda l'involto)
    const beve = 1 - rampa(t, 0.4, 1.0);
    att += Z(-2400, { t, andatura: "fermo", involto: true, testa: 26 * beve - 6, sguardo: 0.9, orecchie: 0.7 }, 1, L, defs);
    // il luccichio tra i sassi
    if (t > 8.2 && t < 9.6) {
      const b = Math.sin((t - 8.2) * 9) * 0.5 + 0.5;
      att += path(`M${n(luccichio[0] - 14)} ${n(luccichio[1])}h28M${n(luccichio[0])} ${n(luccichio[1] - 14)}v28`, { stroke: "#fff6d6", "stroke-width": 3, opacity: n(0.4 + 0.6 * b), "stroke-linecap": "round" });
      att += path(ellisseD(luccichio, 5, 3), { fill: "#f0dc92" });
    }
    // la gazza
    if (t < 9.0) {
      const guarda = t < 8.3 ? 28 : 28 - 44 * rampa(t, 8.3, 8.5); // lo scatto verso il luccichio
      att += inPunto(perch, gazza({ t, modo: "posata", testa: guarda, becco: v.bocca("cecca") }, { defs, luce: L, id: "cecca" }), { scala: 2.1, verso: -1 });
    } else {
      // uno scatto giù sul luccichio, poi via bassa verso sud
      const k = t - 9.0;
      let p: P;
      if (k < 0.5) p = [lerp(perch[0], luccichio[0], ease.dentroFuori(k / 0.5)), lerp(perch[1], luccichio[1] - 20, ease.dentro(k / 0.5))];
      else p = [luccichio[0] + (k - 0.5) * 520, luccichio[1] - 30 - (k - 0.5) * 60 + Math.sin(k * 5) * 6];
      att += inPunto(p, gazza({ t, modo: "volo", fase: t * 3.4, nelBecco: k > 0.45 }, { defs, luce: L, id: "cecca" }), { scala: 2.1, ang: k < 0.5 ? 20 : -4 });
    }
    const cam = camTra({ x: -2250, y: 740, zoom: 2.05 }, { x: -1950, y: 700, zoom: 1.35 }, ease.dentroFuori((t - 8.9) / 2.8));
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

/** 10b · Da vicino non era un masso. CRACK: il ramo esplode, mezzo canneto si alza in volo. «Scusa!» (p.7). */
const CRACK = 7.9;
const s12: Inquadratura = {
  id: "s12",
  titolo: "CRACK",
  pagina: 7,
  durata: 17,
  didascalie: [
    { da: 0.6, a: 6.6, pagina: 7, testo: "Da vicino non era un masso: era un rinoceronte giovane, con le zampe di una taglia in più e un corno che gli cresceva storto" },
    { da: 7.0, a: 12.0, pagina: 7, testo: "Fece un passo, CRACK, un ramo esplose sotto la zampa e mezzo canneto si alzò in volo." },
    { da: 12.4, a: 16.9, pagina: 7, testo: "«Scusa!» disse. Al ramo, agli uccelli, e un po' anche a lei.", chi: "rocco" },
  ],
  suoni: [{ t: CRACK, nome: "crack" }, { t: CRACK + 0.2, nome: "stormo" }, { t: CRACK - 0.6, nome: "passi", durata: 0.6, ritmo: 1.76 }],
  ambiente: { vento: 0.4, lago: 0.3 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    // «da vicino»: Rocco grande, dal basso, con la testa girata; poi il passo, e il ramo
    const xr = 250 - 18 * ease.fuori((t - (CRACK - 0.6)) / 0.6);
    const rp: PosaRocco = {
      t,
      andatura: "passo",
      fase: fase(580 - xr, CICLO.roccoPasso),
      ampiezza: 1 - rampa(t, CRACK - 0.2, CRACK + 0.2),
      giro: 0.8 - rampa(t, CRACK + 0.1, CRACK + 0.4) * 0.5,
      orecchie: 1,
      pena: rampa(t, CRACK + 0.2, CRACK + 0.5),
      bocca: v.bocca("rocco"),
    };
    const rotto = t < CRACK ? 0 : clamp((t - CRACK) / 1.4);
    const zp: PosaZara = { t, andatura: "fermo", involto: true, testa: -14 * (1 - rampa(t, CRACK, CRACK + 1)), sguardo: 0.8, orecchie: 0.6 - rampa(t, CRACK - 0.1, CRACK + 0.1) * 1.2 + rampa(t, CRACK + 1.0, CRACK + 2.0) * 1.2, occhi: t > CRACK && t < CRACK + 0.25 ? 0.8 : 0 };
    // la camera parte vicina, dal basso (il rinoceronte giovane visto da una tigre piccola), e si apre prima del passo
    let cam = camTra({ x: 150, y: -190, zoom: 1.5 }, { x: -20, y: -60, zoom: 0.98 }, ease.dentroFuori(rampa(t, 3.0, CRACK - 0.8)));
    cam = scossa(cam, t, CRACK, 18, 0.7);
    const att = ramoSecco(L, rotto) + Z(CIMA.zara, zp, 1, L, defs) + R(xr, rp, -1, L, defs);
    // lo stormo si alza dal canneto lontano, da dietro la spalla della collina
    const stormoL: Livello = { id: "stormo", p: 0.34, contenuto: g({ transform: "translate(-700 470)scale(1.5)" }, stormo(t, clamp((t - CRACK - 0.15) / 3.2), { defs, luce: L, id: "st" }, 42)) };
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
  durata: 18,
  didascalie: [
    { da: 0.3, a: 3.2, pagina: 8, testo: "«Sei piccola,» disse lui, guardandola dritto in faccia", chi: "rocco" },
    { da: 3.5, a: 5.8, pagina: 8, testo: "«Sono giovane.»", chi: "zara" },
    { da: 6.1, a: 9.8, pagina: 8, testo: "«Anch'io,» disse il rinoceronte, e girò la testa. «Rocco.»", chi: "rocco" },
    { da: 10.1, a: 12.0, pagina: 8, testo: "«Zara.»", chi: "zara" },
    { da: 12.4, a: 17.7, pagina: 8, testo: "Tornarono l'indomani, senza esserselo promesso. E il giorno dopo ancora." },
  ],
  suoni: [{ t: 3.5, nome: "gonfia" }],
  ambiente: { vento: 0.35 },
  disegna(t, defs, v) {
    // sotto la coda («Tornarono l'indomani») la luce cala verso il tramonto: i giorni che passano
    const L = mescolaLuce(LUCI.giorno, LUCI.tramonto, rampa(t, 12.4, 18) * 0.55);
    const gonfia = rampa(t, 3.4, 3.8, ease.fuoriRitorno) * (1 - rampa(t, 10.1, 11.0));
    const zp: PosaZara = { t, andatura: "fermo", involto: true, gonfia, bocca: v.bocca("zara"), orecchie: 0.5 + gonfia * 0.5, sguardo: 0.8 };
    const giro = rampa(t, 7.0, 7.8);
    const rp: PosaRocco = { t, andatura: "fermo", bocca: v.bocca("rocco"), giro, testa: 8 - giro * 4, orecchie: 0.3 };
    const cam = camTra({ x: -30, y: -170, zoom: 1.72 }, { x: -40, y: -175, zoom: 1.9 }, ease.dentroFuori(t / 18));
    const att = Z(CIMA.zara, zp, 1, L, defs) + R(CIMA.rocco, rp, -1, L, defs);
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: att }) };
  },
};

// --- il canneto (p.11): la geografia della scena si tiene per le tre inquadrature --
/** Dove Rocco entra nel canneto (l'orlo alto, dove la riva comincia a scendere) e dove si ferma dopo tre passi. */
const CANNETO = { entra: -1580, ferma: -1900 } as const;

/**
 * Le canne che Rocco schiaccia (p.11: «Tre passi, e il canneto non ci fu più»):
 * un fitto di canne sull'orlo, ognuna col suo seme; cade — e resta a terra —
 * quando il muso gli passa sopra. `fronte` è dove arriva il muso (scende verso
 * sinistra). Davanti a lui restano in piedi: le disegna il luogo.
 */
function canneSchiacciate(fronte: number, t: number, luce: Luce): string {
  const C = SOGLIA.colori;
  let steli = "";
  let pennacchi = "";
  const quante = 26;
  for (let i = 0; i < quante; i++) {
    // posizioni fisse (seminate per indice): tra l'orlo e il punto dove si ferma
    const u = ((i * 0.618033) % 1);
    const x = lerp(CANNETO.ferma - 120, CANNETO.entra + 60, u) + Math.sin(i * 7.3) * 14;
    const h = 150 + ((i * 37) % 90);
    const y = quota(x) + 10;
    // cade quando il muso le passa sopra; a terra resta, verso la strada fatta
    const k = ease.assesta(clamp((x + 30 - fronte) / 70));
    const lean = 0.08 + 0.02 * onda(t, 2.3, i);
    const ang = lerp(-Math.PI / 2 + lean, -Math.PI + 0.12, k);
    const tip: P = [x + Math.cos(ang) * h, y + Math.sin(ang) * h];
    const mid: P = [x + Math.cos(ang) * h * 0.55 + (1 - k) * 6, y + Math.sin(ang) * h * 0.55 + k * 14];
    steli += `M${n(x)} ${n(y)}Q${n(mid[0])} ${n(mid[1])} ${n(tip[0])} ${n(tip[1])}`;
    pennacchi += ellisseD([tip[0], tip[1] + 6 * (1 - k)], 4, 14 - 8 * k);
  }
  return path(steli, { stroke: inLuce(C.cannaScura, luce), "stroke-width": 3.2, fill: "none", "stroke-linecap": "round" }) + path(pennacchi, { fill: inLuce(C.canna, luce), opacity: 0.9 });
}

/** 12a · Una volta Rocco volle vedere il canneto da vicino. Tre passi (p.11). */
const s15a: Inquadratura = {
  id: "s15a",
  titolo: "Il canneto non ci fu più",
  pagina: 11,
  durata: 12,
  entrata: { tipo: "dissolvenza", durata: 1 },
  didascalie: [
    { da: 0.8, a: 5.8, pagina: 11, testo: "Una volta Rocco volle vedere il canneto da vicino. Tre passi, e il canneto non ci fu più." },
    { da: 8.2, a: 11.4, pagina: 11, testo: "«Scusa!» disse. Al canneto.", chi: "rocco" },
  ],
  suoni: [
    { t: 1.0, nome: "passi", durata: 5.6, ritmo: 1.6 },
    { t: 2.6, nome: "giunco", vol: 1.2 },
    { t: 4.0, nome: "giunco", vol: 1.2 },
    { t: 5.4, nome: "giunco", vol: 1.2 },
  ],
  ambiente: { vento: 0.3, lago: 0.6, rane: 0.5 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    // tre passi dentro: entra dall'orlo, scende, e dove passa le canne restano a terra
    const k = ease.dentroFuori(rampa(t, 1.0, 6.6, ease.lineare));
    const xr = lerp(CANNETO.entra, CANNETO.ferma, k);
    const amp = rampa(t, 0.8, 1.4) * (1 - rampa(t, 6.2, 6.8));
    const rp: PosaRocco = { t, andatura: "passo", fase: fase(CANNETO.entra - xr, CICLO.roccoPasso), ampiezza: amp, testa: 16, orecchie: 0.9, giro: 0.3, pena: rampa(t, 6.6, 7.4) * 0.5, bocca: v.bocca("rocco") };
    // Zara resta sull'orlo e guarda
    const zp: PosaZara = { t, andatura: "fermo", involto: true, testa: 2, sguardo: -0.9, orecchie: 0.8 - rampa(t, 5.0, 6.0) * 1.2 };
    const cam: Camera = { x: xr + 40, y: quota(xr + 40) - 150, zoom: 1.15 };
    const att = canneSchiacciate(xr - 313, v.t, L) + Z(CANNETO.entra + 420, zp, -1, L, defs) + R(xr, rp, -1, L, defs);
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: att }) };
  },
};

/** 12b · Le rane tacquero. Zara si mise davanti: «Dove passo io, passi tu.» (p.11). */
const s15b: Inquadratura = {
  id: "s15b",
  titolo: "Dove passo io, passi tu",
  pagina: 11,
  durata: 18,
  didascalie: [
    { da: 0.8, a: 4.2, pagina: 11, testo: "Le rane tacquero, offese come sanno esserlo solo le rane." },
    { da: 4.6, a: 9.0, pagina: 11, testo: "Zara si mise davanti: «Dove passo io, passi tu.»", chi: "zara" },
    { da: 9.4, a: 14.2, pagina: 11, testo: "E lui dietro, un passo alla volta, enorme e attento — e non si ruppe più niente." },
    { da: 14.6, a: 17.8, pagina: 11, testo: "Quasi niente. Un giunco, forse due." },
  ],
  suoni: [{ t: 4.4, nome: "galoppo", durata: 4.4, ritmo: 2.6, vol: 0.5 }, { t: 9.4, nome: "passi", durata: 8.6, ritmo: 1.44, vol: 0.6 }, { t: 15.0, nome: "giunco" }],
  // le rane: zitte (una o due, con riserva)
  ambiente: { vento: 0.35, lago: 0.8, rane: 0.1 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    // Zara gli passa davanti al trotto (dall'orlo fin oltre il suo muso), poi camminano: lei avanti, lui dietro, piano
    const AVANTI = CANNETO.ferma - 540;
    const trotto = ease.dentroFuori(rampa(t, 4.4, 8.8, ease.lineare));
    const strada = (CANNETO.entra + 420 - AVANTI) * trotto;
    const xz = t < 9.4 ? CANNETO.entra + 420 - strada : AVANTI - 36 * (t - 9.4);
    const xr = t < 9.4 ? CANNETO.ferma : xz + 540;
    const kPasso = rampa(t, 8.4, 9.4);
    const zp: PosaZara =
      t < 9.4
        ? {
            t,
            andatura: "corsa",
            fase: fase(strada, CICLO.zaraCorsa, 0.55),
            ampiezza: 0.55 * rampa(t, 4.3, 4.8) * (1 - kPasso),
            involto: true,
            bocca: v.bocca("zara"),
            orecchie: 0.6,
            verso: { altra: { t, andatura: "passo", fase: fase(xz - AVANTI, CICLO.zaraPasso), ampiezza: 0.8, involto: true }, k: kPasso },
          }
        : { t, andatura: "passo", fase: fase(AVANTI - xz, CICLO.zaraPasso), ampiezza: 0.8, involto: true, testa: -4 + onda(t, 3) * 3, orecchie: 0.6, bocca: v.bocca("zara") };
    const rp: PosaRocco = { t, andatura: "passo", fase: fase(CANNETO.ferma - xr, CICLO.roccoPasso), ampiezza: 0.62 * rampa(t, 9.2, 9.9), testa: 14, orecchie: 0.8, pena: 0.4 - 0.2 * rampa(t, 9, 12) };
    const cx = t < 9.4 ? lerp(CANNETO.ferma + 120, AVANTI + 270, ease.dentroFuori(rampa(t, 4.6, 9.2))) : xz + 270;
    const cam: Camera = { x: cx, y: quota(cx) - 170, zoom: 1.12 };
    // il giunco che si spezza: piega di colpo e resta piegato
    let giunco = "";
    const xg = AVANTI - 36 * (15.0 - 9.4) - 120;
    if (t > 15.0) {
      const k = ease.assesta(clamp((t - 15.0) / 0.9));
      const y0 = quota(xg);
      const a = (-90 + 70 * k) * (Math.PI / 180);
      giunco = path(`M${n(xg)} ${n(y0)}L${n(xg)} ${n(y0 - 110)}L${n(xg + Math.cos(a) * 130)} ${n(y0 - 110 + Math.sin(a) * 130)}`, { stroke: "#80683b", "stroke-width": 3.5, fill: "none", "stroke-linecap": "round" });
    }
    // le canne schiacciate restano dov'erano (lui ci sta ancora dentro, poi ne esce dietro a lei)
    const att = giunco + canneSchiacciate(CANNETO.ferma - 313, v.t, L) + R(xr, rp, -1, L, defs) + Z(xz, zp, -1, L, defs);
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: att, davanti: canneDavanti(v.t, L, defs, cam, cam.x - 1300, Math.min(cam.x + 1300, CANNETO.ferma - 200)) }) };
  },
};

/** 12c · Una sera quasi glielo disse. «Mio fratello—» … «Quando vuoi.» (p.12). */
const s15c: Inquadratura = {
  id: "s15c",
  titolo: "Quando vuoi",
  pagina: 12,
  durata: 14,
  entrata: { tipo: "nero", durata: 1.4 },
  didascalie: [
    { da: 1.6, a: 3.9, pagina: 12, testo: "Una sera quasi glielo disse." },
    { da: 5.0, a: 8.0, pagina: 12, testo: "«Mio fratello—» e si fermò", chi: "zara" },
    { da: 10.2, a: 12.5, pagina: 12, testo: "«Quando vuoi.»", chi: "rocco" },
  ],
  ambiente: { vento: 0.15, lago: 0.3, grilli: 0.35 },
  disegna(t, defs, v) {
    // la sera in cima: la luce del tramonto che cede alla notte, i grilli
    const L = mescolaLuce(LUCI.tramonto, LUCI.notte, 0.45 + 0.1 * rampa(t, 0, 14));
    // Zara parte (orecchie su, la testa che si alza) e si ferma: la testa cala, lo sguardo va a sud, dove il lago finisce
    const parte = rampa(t, 4.6, 5.2);
    const ferma = rampa(t, 6.6, 7.8);
    const zp: PosaZara = { t, andatura: "fermo", involto: true, bocca: v.bocca("zara"), testa: -6 - 6 * parte + 16 * ferma, sguardo: 0.7 - 1.2 * ferma, orecchie: 0.4 + 0.5 * parte - 0.8 * ferma, occhi: 0.25 * ferma * (1 - rampa(t, 9.6, 10.2)) };
    // Rocco non spinge: la guarda in faccia, come guardava le cose (la testa gira verso di lei, piano)
    const guarda = rampa(t, 8.6, 10.0);
    const rp: PosaRocco = { t, andatura: "fermo", bocca: v.bocca("rocco"), giro: 0.35 - 0.35 * guarda, testa: 6 - 4 * guarda, orecchie: 0.2 + 0.5 * guarda };
    // su di lei, poi il campo a due quando lui risponde
    const cam = camTra({ x: -230, y: -175, zoom: 1.95 }, { x: -30, y: -175, zoom: 1.6 }, ease.dentroFuori(rampa(t, 8.4, 10.6)));
    const att = Z(CIMA.zara, zp, 1, L, defs) + R(CIMA.rocco, rp, -1, L, defs);
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: L, meteo: { notte: 0.4, sole: 0.04, nebbia: 0.3, vento: 0.15 }, soleA: [0.08, 0.5], mandrie: false, attori: att }) };
  },
};

/** 13 · La marmotta fischia due volte; a sud il cielo mette su un colore nuovo (p.13). */
const s16: Inquadratura = {
  id: "s16",
  titolo: "Il fischio lungo",
  pagina: 13,
  durata: 17,
  entrata: { tipo: "dissolvenza", durata: 1 },
  didascalie: [
    // chi fischia si dice (adattamento: nel cartone «bisogna dire della marmotta» non c'è)
    { da: 0.5, a: 5.2, pagina: 13, testo: "La marmotta fischiò due volte: il fischio lungo, quello che non riguarda le volpi." },
    { da: 5.6, a: 12.2, pagina: 13, testo: "A sud il cielo aveva messo su un colore nuovo: nuvole basse, ferme come una riva di pietra che però avanzava." },
    { da: 12.6, a: 16.6, pagina: 13, testo: "Il vento girò e portò odore d'acqua. Non di lago: di acqua che cade." },
  ],
  suoni: [
    { t: 1.6, nome: "fischio", durata: 0.45 },
    { t: 2.6, nome: "fischio", durata: 1.1 },
    { t: 7.0, nome: "tuono-lontano" },
    { t: 14.6, nome: "tuono-lontano", vol: 0.7 },
  ],
  ambiente: { vento: 0.55 },
  disegna(t, defs, v) {
    const k = rampa(t, 4.8, 11.5, ease.morbido);
    const L = mescolaLuce(LUCI.giorno, LUCI.presagio, rampa(t, 5.0, 12));
    const xm = -760;
    const ym = quota(xm) - 30;
    const fischio = clamp(Math.max(rampa(t, 1.55, 1.65) * (1 - rampa(t, 2.0, 2.1)), rampa(t, 2.55, 2.65) * (1 - rampa(t, 3.6, 3.7))));
    const att = inPunto([xm, ym], marmotta({ t, ritta: rampa(t, 0.2, 0.8), fischio }, { defs, luce: L, id: "marm" }), { scala: 1.6 });
    const cam = camTra({ x: -740, y: ym - 60, zoom: 2.6 }, { x: 420, y: -420, zoom: 0.8 }, k);
    // il vento gira sotto «Il vento girò»: l'erba piega dall'altra parte, con una raffica
    const gira = rampa(t, 12.6, 15.4);
    const meteo: Partial<Meteo> = { temporale: 0.08 + rampa(t, 4.8, 16) * 0.45, vento: 0.5 + k * 0.2 + impulso(t, 12.8, 15.6, 0.6, 1.2) * 0.3, versoVento: lerp(1, -1, gira) };
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: att, meteo }) };
  },
};

/** 14 · Il buio arriva prima della sera. «Vieni. C'è un posto.» Lo guidò lei (p.14). */
const s17: Inquadratura = {
  id: "s17",
  titolo: "Lo guidò lei",
  pagina: 14,
  durata: 13,
  entrata: { tipo: "dissolvenza", durata: 1 },
  didascalie: [
    { da: 0.5, a: 5.5, pagina: 14, testo: "Il buio arrivò prima della sera, e li prese sul crinale, troppo in alto per scendere." },
    { da: 6.0, a: 9.8, pagina: 14, testo: "«Vieni,» disse Zara. «C'è un posto.»", chi: "zara" },
    { da: 10.3, a: 12.8, pagina: 14, testo: "Lo guidò lei." },
  ],
  suoni: [{ t: 9.6, nome: "passi", durata: 3.4, ritmo: 1.84 }, { t: 2.5, nome: "tuono-lontano" }, { t: 7.4, nome: "tuono-lontano" }],
  ambiente: { vento: 0.8, pioggia: 0.3, notte: 0.6 },
  disegna(t, defs, v) {
    const kb = rampa(t, 0, 13);
    const L = mescolaLuce(LUCI.presagio, LUCI.notte, 0.35 + kb * 0.5);
    // fermi sul crinale, col muso al vento, finché il buio li prende; poi lei si muove, e lui dietro
    const via = rampa(t, 9.4, 10.2);
    const xz = 300 - 46 * Math.max(0, t - 9.6);
    const xr = xz + 540;
    const zp: PosaZara = { t, andatura: "passo", fase: fase(300 - xz, CICLO.zaraPasso), ampiezza: 0.9 * via, involto: true, testa: -6 - 8 * (1 - via), bocca: v.bocca("zara"), orecchie: 0.4 - 0.5 * (1 - via), sguardo: 0.6 };
    const rp: PosaRocco = { t, andatura: "passo", fase: fase(300 - xz, CICLO.roccoPasso), ampiezza: 0.9 * rampa(t, 9.8, 10.6), testa: 10 - 6 * (1 - via), orecchie: 0.9, pena: 0.3 + 0.3 * (1 - via) };
    const cam: Camera = tremito({ x: xz + 270, y: -170, zoom: 1.2 - 0.12 * (1 - via) }, t, 3);
    const meteo: Partial<Meteo> = { temporale: 0.6 + kb * 0.3, notte: 0.35 + kb * 0.5, vento: 0.85, versoVento: -1, pioggia: rampa(t, 6, 13) * 0.35, nebbia: 0 };
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: Z(xz, zp, -1, L, defs) + R(xr, rp, -1, L, defs), meteo, mandrie: false }) };
  },
};

/** 15a · La tempesta: Rocco si pianta di traverso al vento (p.15). */
const s18: Inquadratura = {
  id: "s18",
  titolo: "Grande come una riva",
  pagina: 15,
  durata: 16,
  didascalie: [
    { da: 0.4, a: 3.3, pagina: 15, testo: "Il mondo diventò acqua e rumore." },
    // sotto la tempesta si dice il gesto; «un posto» su riga sua (adattamento)
    { da: 3.7, a: 8.6, pagina: 15, testo: "E Rocco si piantò di traverso al vento, grande come una riva, e non si mosse più." },
    { da: 9.0, a: 15.4, pagina: 15, testo: "La sua ombra diventò un posto. L'unico fermo, con dentro una tigre piccola che contava i tuoni sul suo fiato lento." },
  ],
  suoni: [{ t: 0.9, nome: "tuono" }, { t: 5.2, nome: "tuono" }, { t: 11.7, nome: "tuono" }],
  ambiente: { vento: 1, pioggia: 1, notte: 1 },
  disegna(t, defs, v) {
    const lampo = Math.max(lampeggio(t, 0.8), lampeggio(t, 5.0), lampeggio(t, 11.5));
    const L = mescolaLuce(LUCI.notte, { ...LUCI.notte, ambiente: [1.1, 1.12, 1.25], ombra: [0.6, 0.62, 0.75] }, lampo * 0.8);
    const piantato = rampa(t, 1.8, 3.2, ease.assesta);
    const xr = RIPARO.rocco + 50 - 50 * ease.dentroFuori(clamp(t / 2));
    const rp: PosaRocco = { t, andatura: "passo", fase: fase(RIPARO.rocco + 50 - xr, CICLO.roccoPasso), ampiezza: 1 - rampa(t, 1.2, 2.0), piantato, bagnato: 0.9, testa: 6, orecchie: -0.6, occhi: 0.25 };
    // lei conta i tuoni: a ogni tuono le orecchie scattano, e la testa si alza un poco verso di lui
    const conta = impulso(t, 11.6, 13.0, 0.2, 1.0);
    const zp: PosaZara = { t, andatura: "acquattata", bagnata: 0.8, involto: true, orecchie: -0.8 + conta * 0.9, codaAvvolta: 1, occhi: 0.2 * (1 - conta), testa: -6 * conta, sguardo: 0.4 * rampa(t, 9.5, 11) };
    // nella terza frase la camera scende verso di lei, dentro l'ombra
    const cam: Camera = tremito(camTra({ x: 90, y: -160, zoom: 1.3 }, { x: -40, y: -125, zoom: 1.85 }, ease.dentroFuori(rampa(t, 8.8, 14.2))), t, 5);
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
  durata: 14,
  entrata: { tipo: "nero", durata: 1.8 },
  didascalie: [
    { da: 1.2, a: 4.2, pagina: 16, testo: "Tutto, tranne il posto dove avevano dormito." },
    { da: 4.5, a: 6.6, pagina: 16, testo: "Si lascia tiepida, pensò", pensiero: true },
    // una frase sola sulla macro delle conche piene (adattamento)
    { da: 7.0, a: 13.4, pagina: 16, testo: "I segni erano pieni d'acqua di pioggia: dentro ogni conca stava tonda, precisa — una piccola luna per ogni segno." },
  ],
  suoni: [{ t: 2.0, nome: "zampa" }],
  ambiente: { vento: 0.1, lago: 0.3 },
  disegna(t, defs, v) {
    return {
      cam: { x: 0, y: 0, zoom: 1 },
      livelli: insertoPietra({ t, luce: LUCI.alba, defs, piene: true, zampa: rampa(t, 1.2, 2.3), brina: 1, vapore: 0.7, cielo: "#c4d2de", spinta: t / 14 }),
    };
  },
};

/** 17 · Di nuovo la gazza: mille luccichii, e per una volta non si lascia strappare (p.17). */
const s21: Inquadratura = {
  id: "s21",
  titolo: "Mille luccichii",
  pagina: 17,
  durata: 15.5,
  entrata: { tipo: "dissolvenza", durata: 0.9 },
  didascalie: [
    { da: 0.6, a: 3.2, pagina: 17, testo: "Sul ramo secco, la gazza. Di nuovo." },
    // alla gazza basta lo sguardo (adattamento)
    { da: 3.6, a: 7.4, pagina: 17, testo: "Stavolta guardò tutti e due, poi l'involto, poi ancora loro." },
    { da: 7.8, a: 14.2, pagina: 17, testo: "Durò finché il sole non toccò il lago: mille luccichii insieme — e per una volta Cècca non si lasciò strappare." },
  ],
  suoni: [{ t: 12.4, nome: "frullo" }, { t: 12.9, nome: "frullo" }],
  ambiente: { vento: 0.2, lago: 0.8 },
  disegna(t, defs, v) {
    const L = mescolaLuce(LUCI.alba, LUCI.giorno, 0.3);
    const perch = posatoioGazza();
    let att = "";
    // i due ai lati dell'albero secco: Zara giù all'acqua, Rocco su, sull'orlo del pendio; il ramo tra loro
    att += Z(-2440, { t, andatura: "seduta", involto: true, testa: -16, sguardo: 0.9, orecchie: 0.8 }, 1, L, defs);
    att += R(-1600, { t, andatura: "fermo", testa: 10, giro: 0.1, orecchie: 0.8 }, -1, L, defs);
    if (t < 12.3) {
      // lo sguardo della gazza: su Zara (giù, a sinistra), su Rocco (su), sull'involto (giù, a lungo), poi ancora loro
      const guarda = traccia([[0, 6], [3.6, 6], [4.4, 26, ease.dentroFuori], [5.0, 26], [5.5, -4, ease.dentroFuori], [6.0, -4], [6.6, 30, ease.dentroFuori], [7.6, 30], [8.2, 8, ease.dentroFuori]])(t);
      att += inPunto(perch, gazza({ t: t * 0.25, modo: "posata", testa: guarda }, { defs, luce: L, id: "cecca" }), { scala: 2.2, verso: -1 });
    } else {
      const k = t - 12.3;
      const p: P = [perch[0] + k * 560, perch[1] + 40 * ease.fuori(clamp(k / 0.6)) + 10];
      att += inPunto(p, gazza({ t, modo: "volo", fase: t * 3.6 }, { defs, luce: L, id: "cecca" }), { scala: 2.2, ang: -2 });
    }
    // sulla gazza; poi il campo coi due sotto; poi di nuovo lei e il lago che luccica
    const k1 = ease.dentroFuori(rampa(t, 3.0, 7.0));
    const k2 = ease.dentroFuori(rampa(t, 7.6, 11.0));
    const cam = camTra(camTra({ x: -2330, y: 760, zoom: 1.9 }, { x: -2030, y: 680, zoom: 0.86 }, k1), { x: -2360, y: 760, zoom: 1.6 }, k2);
    const meteo: Partial<Meteo> = { lavato: 0.5, luccichii: rampa(t, 8.2, 10.4), sole: 0.2, nebbia: 0.5 };
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
  inquadrature: [s01, s02, s03, s04, s05, s06, s07, s08, s09, s10, s11, s12, s13, s14, s15a, s15b, s15c, s16, s17, s18, s19, s20, s21, s22, s23, s24, s25, s26],
};

export default EP01;
