// cartoni/cast/zara.ts — Zara, la tigre giovane (pupazzo di profilo).
//
// Fonte: saga/bible/zara.md → «Morfologia di reference (vincolante)».
// Quello che il pupazzo DEVE rispettare, sempre:
//  - ancore colore: manto #d08a3e (arancio caldo NON saturo) · crema #efe3cd
//    (guance, petto, ventre) · strisce #241f1a · occhi #7da05a che BRILLANO;
//  - strisce ASIMMETRICHE: fitte su spalle e coda, rade sui fianchi, e MAI
//    speculari tra destra e sinistra → ogni fianco ha il suo seme;
//  - IL SEGNO: la striscia a forcella (Y) in fronte, ramo destro più lungo;
//  - coda anellata fitta con la punta nera; orecchie con ocelli bianchi;
//  - asciutta, zampe lunghe (lo scatto prima della massa), testa alta;
//  - «si gonfia» quando vuole sembrare grande (collo su, petto avanti, mento
//    alto); quando è davvero sicura sta bassa e morbida.
// Coordinate locali: guarda a destra, piedi a y=0, spalla ≈ ⅔ del garrese di
// Rocco (≈ 160 unità contro 240).

import { type Luce, inLuce, inOmbra, mescola, scurisci, schiarisci } from "../motore/colore";
import { caso } from "../motore/caso";
import { type Defs, type P, DEG, add, cerchioD, curva, ellisseD, g, mix, mul, n, norm, path, perp, pt, rot, sub, tr, tubo } from "../motore/svg";
import { clamp, lerp, onda, palpebra } from "../motore/tempo";
import { corpoDaSpina, ik2, piedeNelPasso } from "./anatomia";
import type { CtxPupazzo } from "./rocco";

/** Ancore colore dalla scheda (blindate da test/cartoni.motore.test.ts). */
export const ZARA_ANCORE = { manto: "#d08a3e", crema: "#efe3cd", strisce: "#241f1a", occhi: "#7da05a" } as const;

export type AndaturaZara = "fermo" | "passo" | "corsa" | "seduta" | "acquattata";

export interface PosaZara {
  t: number;
  andatura: AndaturaZara;
  /** Fase del ciclo (passo/corsa). */
  fase?: number;
  /** Ampiezza del passo/corsa 0..1 (0 = piedi fermi sotto il corpo). */
  ampiezza?: number;
  /** Testa: gradi, + = muso in giù. */
  testa?: number;
  /** Orecchie: -1 appiattite indietro … +1 dritte avanti. */
  orecchie?: number;
  bocca?: number;
  occhi?: number;
  /** Sguardo: -1 indietro … +1 avanti (pupilla nell'occhio). */
  sguardo?: number;
  /** Si gonfia: pelo del collo su, petto avanti, mento alto (0..1). */
  gonfia?: number;
  /** Porta l'involto di foglie sul fianco. */
  involto?: boolean;
  /** Fusione con un'altra posa (per i passaggi: corsa → fermo). */
  verso?: { altra: PosaZara; k: number };
  semeCiglia?: number;
  ombra?: boolean;
  /** Bagnata di pioggia (0..1): pelo scurito e appiattito. */
  bagnata?: number;
  /** Coda avvolta attorno alle zampe (posa-firma da seduta). */
  codaAvvolta?: number;
}

// ------------------------------------------------------------- scheletro --
interface Scheletro {
  spina: P[];
  dorso: number[];
  ventre: number[];
  /** Bersagli dei piedi: ant. vicino, ant. lontano, post. vicino, post. lontano. */
  piedi: [P, P, P, P];
  /** Alzata/volo dei piedi (per piegare le dita). */
  volo: [number, number, number, number];
  testa: number;
  collo: P;
  coda: number[]; // angoli dei segmenti della coda (gradi)
  gonfia: number;
  /** Il metatarso posteriore (piede → garretto), vicino e lontano. */
  metatarso: [P, P];
}

const LUNG_CODA = 11;

function scheletroBase(posa: PosaZara): Scheletro {
  const t = posa.t;
  const f = posa.fase ?? 0;
  const amp = clamp(posa.ampiezza ?? 1);
  const respiro = onda(t, 2.6) * 1.4;
  const gonfia = clamp(posa.gonfia ?? 0);
  let spina: P[] = [
    [-100, -122],
    [-74, -112],
    [-14, -108 - respiro * 0.4],
    [44, -112 - respiro],
    [76, -128],
  ];
  let dorso = [6, 26, 27, 40, 30];
  let ventre = [16, 44, 40, 46, 34];
  let piedi: [P, P, P, P] = [
    [60, 0],
    [48, 0],
    [-74, 0],
    [-86, 0],
  ];
  let volo: [number, number, number, number] = [0, 0, 0, 0];
  let metatarso: [P, P] = [
    [-15, -36],
    [-15, -36],
  ];
  let testa = posa.testa ?? 0;
  const codaBase: number[] = [];
  // coda a riposo: scende dalla groppa e risale in una J morbida
  for (let i = 0; i < LUNG_CODA; i++) {
    const k = i / (LUNG_CODA - 1);
    codaBase.push(112 - 150 * k * k + onda(t, 3.1, k * 0.35) * (5 + 14 * k));
  }
  let coda = codaBase;

  switch (posa.andatura) {
    case "passo": {
      const falcata = 60 * amp;
      const bob = -3 * Math.cos(f * Math.PI * 4) * amp;
      spina = spina.map(([x, y]) => [x, y + bob] as P);
      const pAV = piedeNelPasso(f + 0.25, falcata, 16);
      const pAL = piedeNelPasso(f + 0.75, falcata, 16);
      const pPV = piedeNelPasso(f, falcata, 18);
      const pPL = piedeNelPasso(f + 0.5, falcata, 18);
      piedi = [
        [60 + pAV.dx, pAV.dy],
        [48 + pAL.dx, pAL.dy],
        [-74 + pPV.dx, pPV.dy],
        [-86 + pPL.dx, pPL.dy],
      ];
      volo = [pAV.volo, pAL.volo, pPV.volo, pPL.volo];
      testa += Math.sin(f * Math.PI * 4 + 0.8) * 2.2 * amp;
      coda = codaBase.map((a, i) => a - 8 * (i / LUNG_CODA) * amp + Math.sin(f * Math.PI * 2 + i * 0.4) * 5 * amp);
      break;
    }
    case "corsa": {
      // Galoppo a balzi. Ogni piede: appoggio in [ini, fin) scorrendo da
      // avanti a indietro; poi volo ad arco. La spina si raccoglie quando i
      // posteriori atterrano sotto la pancia e si distende nel volo.
      const piede = (ff: number, ini: number, fin: number, avanti: number, indietro: number, su: number): { p: P; v: number } => {
        const x = ff - Math.floor(ff);
        const a = ini;
        const b = fin < ini ? fin + 1 : fin;
        const u = x < a ? x + 1 : x;
        if (u < b) {
          const k = (u - a) / (b - a);
          return { p: [lerp(avanti, indietro, k) * amp, 0], v: 0 };
        }
        const k = (u - b) / (1 - (b - a));
        const e = 0.5 - 0.5 * Math.cos(Math.PI * k);
        const alz = Math.sin(Math.PI * k);
        return { p: [lerp(indietro, avanti, e) * amp, -su * alz * amp], v: alz };
      };
      const aV = piede(f, 0.18, 0.5, 52, -46, 40);
      const aL = piede(f - 0.06, 0.18, 0.5, 50, -44, 36);
      const pV = piede(f, 0.44, 0.78, 62, -56, 34);
      const pL = piede(f - 0.05, 0.44, 0.78, 58, -54, 30);
      // raccolta massima ~0.55 (posteriori avanti sotto la pancia), distesa ~0.05
      const racc = 0.5 + 0.5 * Math.cos((f - 0.55) * Math.PI * 2); // 1 raccolta → 0 distesa
      const r2 = racc * amp;
      // fase di volo: dallo stacco dei posteriori (0.78) all'atterraggio degli anteriori (0.18)
      const fv = (f - 0.78 + 2) % 1;
      const alt = fv < 0.4 ? -Math.sin((fv / 0.4) * Math.PI) * 18 * amp : 0;
      const accorcia = 22 * r2;
      spina = [
        [-100 + accorcia * 0.6, -118 + alt + 6 * r2],
        [-74 + accorcia * 0.6, -110 + alt + 4 * r2],
        [-14 + accorcia * 0.1, -112 + alt - 14 * r2],
        [44 - accorcia * 0.4, -110 + alt - 2 * r2],
        [80 - accorcia * 0.4, -122 + alt + 4 * (1 - r2)],
      ];
      piedi = [
        [60 - accorcia * 0.4 + aV.p[0], aV.p[1]],
        [50 - accorcia * 0.4 + aL.p[0], aL.p[1]],
        [-74 + accorcia * 0.6 + pV.p[0], pV.p[1]],
        [-84 + accorcia * 0.6 + pL.p[0], pL.p[1]],
      ];
      volo = [aV.v, aL.v, pV.v, pL.v];
      metatarso = [
        [-15 - pV.v * 14, -34 + pV.v * 10],
        [-15 - pL.v * 14, -34 + pL.v * 10],
      ];
      testa += -alt * 0.15 - 4;
      coda = codaBase.map((_, i) => {
        const k = i / (LUNG_CODA - 1);
        return 172 - 14 * k + Math.sin(f * Math.PI * 2 - k * 2.2) * (8 + 14 * k) * amp;
      });
      break;
    }
    case "seduta": {
      // groppa a terra, cosce raccolte, zampe anteriori dritte, petto alto
      spina = [
        [-66, -26],
        [-50, -48],
        [-12, -86 - respiro * 0.4],
        [26, -120 - respiro],
        [52, -146],
      ];
      dorso = [10, 34, 26, 32, 28];
      ventre = [22, 30, 28, 34, 30];
      piedi = [
        [48, 0],
        [36, 0],
        [-12, 0],
        [-22, 0],
      ];
      metatarso = [
        [-40, -8],
        [-40, -8],
      ];
      testa += -4;
      const avv = clamp(posa.codaAvvolta ?? 1);
      const avvolta = [160, 62, 4, 0, -2, -4, -8, -18, -38, -70, -105];
      coda = codaBase.map((a, i) => lerp(a, avvolta[i] + onda(t, 4, 0.2) * 4 * (i / LUNG_CODA), avv));
      break;
    }
    case "acquattata": {
      // bassa tra due rocce: petto quasi a terra, gomiti alti, testa avanti
      spina = [
        [-100, -74],
        [-74, -68],
        [-14, -58 - respiro * 0.3],
        [42, -58 - respiro * 0.6],
        [74, -70],
      ];
      dorso = [5, 24, 22, 32, 24];
      ventre = [12, 28, 22, 26, 22];
      piedi = [
        [80, 0],
        [68, 0],
        [-54, 0],
        [-66, 0],
      ];
      metatarso = [
        [-34, -14],
        [-34, -14],
      ];
      testa += 8;
      coda = codaBase.map((_, i) => {
        const k = i / (LUNG_CODA - 1);
        return 176 - 10 * k + Math.sin(t * 2.2 - k * 3) * 9 * k; // la punta si agita
      });
      break;
    }
    default:
      break;
  }

  // si gonfia: petto avanti, collo su, mento alto
  if (gonfia > 0) {
    spina = spina.map(([x, y], i) => [x + (i >= 3 ? 5 * gonfia : 0), y - (i >= 3 ? (i === 4 ? 14 : 7) * gonfia : 0)] as P);
    dorso = dorso.map((d, i) => d + (i >= 3 ? 9 * gonfia : 2 * gonfia));
    ventre = ventre.map((d, i) => d + (i === 3 ? 5 * gonfia : 0));
    testa -= 14 * gonfia;
  }
  const collo = spina[4];
  return { spina, dorso, ventre, piedi, volo, testa, collo, coda, gonfia, metatarso };
}

const lerpP = (a: P, b: P, k: number): P => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

function scheletro(posa: PosaZara): Scheletro {
  const a = scheletroBase(posa);
  if (!posa.verso || posa.verso.k <= 0) return a;
  const b = scheletroBase(posa.verso.altra);
  const k = clamp(posa.verso.k);
  return {
    spina: a.spina.map((p, i) => lerpP(p, b.spina[i], k)),
    dorso: a.dorso.map((d, i) => lerp(d, b.dorso[i], k)),
    ventre: a.ventre.map((d, i) => lerp(d, b.ventre[i], k)),
    piedi: a.piedi.map((p, i) => lerpP(p, b.piedi[i], k)) as [P, P, P, P],
    volo: a.volo.map((v, i) => lerp(v, b.volo[i], k)) as [number, number, number, number],
    testa: lerp(a.testa, b.testa, k),
    collo: lerpP(a.collo, b.collo, k),
    coda: a.coda.map((c, i) => lerp(c, b.coda[i], k)),
    gonfia: lerp(a.gonfia, b.gonfia, k),
    metatarso: [lerpP(a.metatarso[0], b.metatarso[0], k), lerpP(a.metatarso[1], b.metatarso[1], k)],
  };
}

// ---------------------------------------------------------------- disegno --
/** La testa di una cucciola è grande: la si disegna a questa scala. */
const SCALA_TESTA = 1.26;

export function zara(posa: PosaZara, ctx: CtxPupazzo): string {
  const { defs, luce, id } = ctx;
  const verso = ctx.verso ?? 1;
  const sk = scheletro(posa);
  const bagnata = clamp(posa.bagnata ?? 0);

  const mantoBase = mescola(ZARA_ANCORE.manto, "#6b4a2c", bagnata * 0.35);
  const cremaBase = mescola(ZARA_ANCORE.crema, "#9d9484", bagnata * 0.35);
  const manto = inLuce(mantoBase, luce);
  const mantoAlto = inLuce(schiarisci(mantoBase, 0.14), luce);
  const mantoOmbra = inOmbra(mantoBase, luce);
  const crema = inLuce(cremaBase, luce);
  const cremaOmbra = inOmbra(cremaBase, luce);
  const striscia = inLuce(ZARA_ANCORE.strisce, luce);
  const lontanaZampa = inOmbra(scurisci(mantoBase, 0.1), luce);
  // il fianco che vediamo: guarda a destra → fianco destro. Semi diversi.
  const fianco = verso === 1 ? "destro" : "sinistro";

  const contorno = corpoDaSpina(sk.spina, sk.dorso, sk.ventre);
  const dCorpo = curva(contorno, true);
  const N = sk.spina.length;
  const dorsoLinea = contorno.slice(0, N);
  const ventreLinea = contorno.slice(N).reverse();

  // --- zampe ----------------------------------------------------------------
  const spallaV = add(sk.spina[3], [6, 18]);
  const spallaL = add(sk.spina[3], [-4, 14]);
  const ancaV = add(sk.spina[1], [0, 10]);
  const ancaL = add(sk.spina[1], [-10, 6]);

  const anteriore = (spalla: P, piede: P, volo: number, fill: string, lontana: boolean) => {
    const polso: P = add(piede, [-4 + volo * 10, -17 + volo * 3]);
    const { ginocchio: gomito, fine } = ik2(spalla, polso, 40, 50, 1);
    const zampaD = tubo([spalla, gomito, fine, add(piede, [4, -9])], [28, 16, 11.5, 11], { tappoInizio: false });
    let s = path(zampaD, { fill });
    s += zampettaD(add(piede, [8, 0]), volo, fill, lontana ? "" : crema);
    return s;
  };
  const posteriore = (anca: P, piede: P, volo: number, met: P, fill: string, lontana: boolean) => {
    const garretto: P = add(piede, met);
    const { ginocchio, fine } = ik2(anca, garretto, 50, 42, -1);
    const zampaD = tubo([anca, ginocchio, fine, add(piede, [2, -9])], [36, 18, 10.5, 10.5], { tappoInizio: false });
    let s = path(zampaD, { fill });
    s += zampettaD(add(piede, [6, 0]), volo, fill, lontana ? "" : crema);
    return s;
  };

  const lontane =
    posteriore(ancaL, sk.piedi[3], sk.volo[3], sk.metatarso[1], lontanaZampa, true) +
    anteriore(spallaL, sk.piedi[1], sk.volo[1], lontanaZampa, true);
  const zV = defs.lineare(`${id}-zampa`, [0, -120], [0, 0], [
    [0, manto],
    [0.55, mescola(manto, mantoOmbra, 0.35)],
    [1, mescola(mantoOmbra, crema, 0.25)],
  ]);
  let vicine = posteriore(ancaV, sk.piedi[2], sk.volo[2], sk.metatarso[0], zV, false) + anteriore(spallaV, sk.piedi[0], sk.volo[0], zV, false);
  // strisce delle zampe vicine (sottili, di traverso sulla coscia e sull'avambraccio)
  const rz = caso(`zara/zampe/${fianco}`);
  let sz = "";
  for (const [radice, piede, quante] of [
    [ancaV, sk.piedi[2], 4],
    [spallaV, sk.piedi[0], 3],
  ] as const) {
    for (let i = 0; i < quante; i++) {
      const base = mix(radice, piede, 0.18 + i * 0.13 + rz.tra(-0.03, 0.03));
      const w = rz.tra(9, 15);
      const sp = rz.tra(1.6, 2.8);
      sz += `M${n(base[0] - w)} ${n(base[1] - 1)}q${n(w)} ${n(-sp * 2)} ${n(w * 2)} ${n(rz.segno(3))}q${n(-w)} ${n(sp * 2 + 1)} ${n(-w * 2)} ${n(-rz.segno(3))}Z`;
    }
  }
  vicine += path(sz, { fill: striscia, opacity: 0.8 });

  // --- corpo ----------------------------------------------------------------
  const gCorpo = defs.lineare(`${id}-corpo`, [0, -160], [0, -60], [
    [0, mantoAlto],
    [0.5, manto],
    [1, mescola(manto, mantoOmbra, 0.5)],
  ]);
  const clip = defs.clip(`${id}-clip`, dCorpo);
  let dentro = "";
  // ventre e petto crema: sfumano dal basso (niente fasce nette)
  const cremaG = defs.lineare(`${id}-crema`, [0, 0], [0, 1], [
    [0, crema, 0],
    [0.5, crema, 0.85],
    [1, mescola(crema, cremaOmbra, 0.3), 1],
  ], "objectBoundingBox");
  const pancia: P[] = [
    ...ventreLinea.map((p) => add(p, [0, 6])),
    ...ventreLinea
      .slice()
      .reverse()
      .map((p, i, arr) => {
        const k = i / (arr.length - 1); // 0 = collo, 1 = coda
        const alza = 18 + 16 * Math.sin(Math.PI * k) + (k < 0.3 ? 26 * (1 - k / 0.3) : 0);
        return add(p, [0, -alza]);
      }),
  ];
  dentro += path(curva(pancia, true), { fill: cremaG });
  // strisce: fitte su spalle e groppa, rade sui fianchi, seme per fianco
  dentro += strisce(dorsoLinea, ventreLinea, fianco, striscia);
  // ombra propria in basso, calda
  dentro += path(curva(ventreLinea.map((p) => add(p, [0, -3]))), { stroke: mantoOmbra, "stroke-width": 14, fill: "none", opacity: 0.3 });
  if (bagnata > 0)
    dentro += path(curva(dorsoLinea.map((p) => add(p, [0, 6]))), {
      stroke: schiarisci(luce.bordo, 0.2),
      "stroke-width": 4,
      fill: "none",
      opacity: 0.3 * bagnata,
    });
  let corpo = path(dCorpo, { fill: gCorpo });
  corpo += g({ "clip-path": clip }, dentro);
  corpo += ciuffi(sk, manto, crema, sk.gonfia);

  // --- coda ------------------------------------------------------------------
  const codaG = codaZara(sk, ctx, fianco, { manto, mantoOmbra, striscia });

  // --- involto di foglie (la corda di Toraki dentro) --------------------------
  const inv = posa.involto ? involto(sk, posa, luce) : "";

  // --- bordo di luce -----------------------------------------------------------
  const bordo =
    luce.forzaBordo > 0.02
      ? path(curva(dorsoLinea), { stroke: luce.bordo, "stroke-width": 3.5, fill: "none", "stroke-linecap": "round", opacity: clamp(luce.forzaBordo) * 0.8 })
      : "";

  const ombraP = posa.ombra !== false ? ombraSotto(defs, id, luce, verso) : "";

  const testaG = testaZara(sk, posa, ctx, { manto, mantoAlto, mantoOmbra, crema, cremaOmbra, striscia });

  const seduta = posa.andatura === "seduta";
  return ombraP + lontane + (seduta ? "" : codaG) + corpo + vicine + inv + bordo + testaG + (seduta ? codaG : "");
}

/** La zampa del gatto: tonda, con le dita; in volo si piega. */
function zampettaD(c: P, volo: number, fill: string, dita: string): string {
  const w = 16;
  const h = 13;
  const pieg = volo * 6;
  const d = curva(
    [
      [c[0] - w, c[1] - 1],
      [c[0] - w + 1, c[1] - h + 2],
      [c[0] - 2, c[1] - h - 2],
      [c[0] + w - 2, c[1] - h + 4 + pieg],
      [c[0] + w + 2, c[1] - 3 + pieg],
      [c[0] + 6, c[1] + 0.5],
    ],
    true,
  );
  let s = path(d, { fill });
  if (dita) {
    s += path(`M${n(c[0] + 3)} ${n(c[1] - 1)}q1 -4 0 -7M${n(c[0] + 10)} ${n(c[1] - 2 + pieg * 0.5)}q1 -4 -1 -7`, {
      stroke: scurisci(dita, 0.45),
      "stroke-width": 1.3,
      fill: "none",
      "stroke-linecap": "round",
      opacity: 0.45,
    });
  }
  return s;
}

function ombraSotto(defs: Defs, id: string, luce: Luce, verso: number): string {
  const spost = luce.lato * verso * luce.radenza * -40;
  const url = defs.radiale(`${id}-ombra`, [0.5, 0.5], 0.5, [
    [0, "#1b1812", 0.5 * luce.forzaOmbra],
    [0.7, "#1b1812", 0.22 * luce.forzaOmbra],
    [1, "#1b1812", 0],
  ], "objectBoundingBox");
  return path(ellisseD([-10 + spost, -1], 130 + luce.radenza * 60, 14), { fill: url });
}

/**
 * Le strisce del corpo: sottili, affusolate, un po' ondulate. Nascono sul
 * dorso e scendono verso il ventre; fitte su spalle e groppa, rade sui
 * fianchi (scheda). Il seme dipende dal FIANCO: destra e sinistra non
 * combaciano mai. Qualcuna è doppia, qualcuna si biforca.
 */
function strisce(dorso: P[], ventre: P[], fianco: string, colore: string): string {
  const r = caso(`zara/strisce/${fianco}`);
  const campiona = (linea: P[], u: number): P => {
    const x = u * (linea.length - 1);
    const i = Math.min(linea.length - 2, Math.floor(x));
    return mix(linea[i], linea[i + 1], x - i);
  };
  const tratto = (inizio: P, fine: P, w: number, ondula: number): string => {
    const giu = norm(sub(fine, inizio));
    const lat = perp(giu);
    const L = Math.hypot(fine[0] - inizio[0], fine[1] - inizio[1]);
    const pts: P[] = [];
    const M = 5;
    for (let i = 0; i <= M; i++) {
      const k = i / M;
      const c = add(add(inizio, mul(giu, L * k)), mul(lat, Math.sin(k * Math.PI * 1.3) * ondula));
      const ww = w * Math.sin(Math.PI * Math.min(1, k * 1.15 + 0.08)) + 0.4;
      pts.push(add(c, mul(lat, ww)));
    }
    for (let i = M; i >= 0; i--) {
      const k = i / M;
      const c = add(add(inizio, mul(giu, L * k)), mul(lat, Math.sin(k * Math.PI * 1.3) * ondula));
      const ww = w * Math.sin(Math.PI * Math.min(1, k * 1.15 + 0.08)) + 0.4;
      pts.push(sub(c, mul(lat, ww * 0.8)));
    }
    return curva(pts, true);
  };
  let d = "";
  let u = 0.02;
  while (u < 0.96) {
    const dens = 0.5 + 1.1 * Math.exp(-(((u - 0.8) / 0.11) ** 2)) + 0.7 * Math.exp(-(((u - 0.12) / 0.09) ** 2));
    const passo = (0.052 / dens) * r.tra(0.75, 1.35);
    const a = campiona(dorso, u);
    const b = campiona(ventre, u);
    const quanto = r.tra(0.32, 0.72) * (u > 0.88 ? 0.6 : 1);
    const inizio = mix(a, b, -0.03);
    const fine = mix(a, b, quanto);
    const w = r.tra(2.6, 4.4) * (0.8 + 0.25 * dens);
    d += tratto(inizio, fine, w, r.segno(7));
    // strisce doppie ravvicinate (tipiche)
    if (r.moneta(0.3)) {
      const u2 = u + passo * 0.35;
      d += tratto(mix(campiona(dorso, u2), campiona(ventre, u2), 0.05), mix(campiona(dorso, u2), campiona(ventre, u2), quanto * 0.7), w * 0.7, r.segno(5));
    }
    // striscette che salgono dal ventre sui fianchi
    if (u > 0.3 && u < 0.7 && r.moneta(0.45)) {
      const bb = mix(a, b, 1.02);
      d += tratto(bb, mix(a, b, r.tra(0.62, 0.78)), w * 0.8, r.segno(4));
    }
    u += passo;
  }
  return path(d, { fill: colore, opacity: 0.9 });
}

/** Ciuffi di pelo: gorgiera sul petto e, se gonfia, cresta sul collo. */
function ciuffi(sk: Scheletro, manto: string, crema: string, gonfia: number): string {
  const petto = add(sk.spina[4], [6, 22]);
  let d = "";
  for (let i = 0; i < 5; i++) {
    const a = (30 + i * 20) * DEG;
    const p = add(petto, [Math.cos(a) * 14, Math.sin(a) * 16]);
    const q = add(p, [Math.cos(a) * (7 + gonfia * 10), Math.sin(a) * (7 + gonfia * 10)]);
    d += `M${pt(add(p, rot([0, -5], a)))}L${pt(q)}L${pt(add(p, rot([0, 5], a)))}Z`;
  }
  let s = path(d, { fill: crema });
  if (gonfia > 0.02) {
    let c = "";
    const a0 = sk.spina[3];
    const a1 = sk.spina[4];
    for (let i = 0; i < 8; i++) {
      const k = i / 7;
      const base = mix(add(a0, [-6, -38]), add(a1, [-2, -26]), k);
      const h = (5 + 11 * Math.sin(Math.PI * k)) * gonfia;
      c += `M${n(base[0] - 5)} ${n(base[1] + 4)}L${n(base[0] + 1)} ${n(base[1] - h)}L${n(base[0] + 6)} ${n(base[1] + 4)}Z`;
    }
    s += path(c, { fill: manto });
  }
  return s;
}

function codaZara(sk: Scheletro, ctx: CtxPupazzo, fianco: string, c: { manto: string; mantoOmbra: string; striscia: string }): string {
  const { defs, id } = ctx;
  const seg = 13.5;
  const pts: P[] = [add(sk.spina[0], [4, 2])];
  for (let i = 0; i < sk.coda.length; i++) {
    const a = sk.coda[i] * DEG;
    pts.push(add(pts[i], [Math.cos(a) * seg, Math.sin(a) * seg]));
  }
  const raggi = pts.map((_, i) => 8.5 - (i / pts.length) * 3.2);
  const d = tubo(pts, raggi, { tappoInizio: false });
  const clipC = defs.clip(`${id}-clipCoda`, d);
  // anelli fitti (uno per segmento, spessore vario), punta nera
  const r = caso(`zara/coda/${fianco}`);
  let anelli = "";
  for (let i = 1; i < pts.length - 2; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const dir = norm(sub(b, a));
    const lat = perp(dir);
    const w = r.tra(2.2, 3.8) + i * 0.15;
    const c0 = add(a, mul(dir, r.tra(2, 8)));
    const obl = r.segno(3);
    anelli += `M${pt(add(add(c0, mul(lat, 12)), mul(dir, -w + obl)))}L${pt(add(add(c0, mul(lat, 12)), mul(dir, w + obl)))}L${pt(add(add(c0, mul(lat, -12)), mul(dir, w - obl)))}L${pt(add(add(c0, mul(lat, -12)), mul(dir, -w - obl)))}Z`;
  }
  const punta = pts[pts.length - 1];
  let s = path(d, { fill: c.manto });
  s += g(
    { "clip-path": clipC },
    path(anelli, { fill: c.striscia, opacity: 0.92 }) + path(tubo([pts[pts.length - 3], pts[pts.length - 2], punta], [10, 9, 8]), { fill: c.striscia }),
  );
  return s;
}

/** L'involto di foglie legato stretto, che batte sul fianco. */
function involto(sk: Scheletro, posa: PosaZara, luce: Luce): string {
  const base = mix(sk.spina[2], sk.spina[3], 0.62);
  const batte = posa.andatura === "corsa" ? Math.sin((posa.fase ?? 0) * Math.PI * 2 + 1.2) * 5 : 0;
  const c: P = add(base, [0, 16 + batte]);
  const foglia = inLuce("#56662f", luce);
  const fogliaChiara = inLuce("#7b8a44", luce);
  const nervo = inLuce("#9aa55c", luce);
  const corda = inLuce("#a88b5c", luce);
  let s = "";
  // la cordicella che lo tiene: gira sul dorso e sotto il petto
  s += path(`M${pt(add(c, [-4, -12]))}Q${pt(add(base, [2, -34]))} ${pt(add(sk.spina[3], [-4, -40]))}`, { stroke: corda, "stroke-width": 2, fill: "none", opacity: 0.85 });
  s += path(`M${pt(add(c, [6, 10]))}Q${pt(add(c, [12, 24]))} ${pt(add(sk.spina[3], [8, 40]))}`, { stroke: corda, "stroke-width": 2, fill: "none", opacity: 0.85 });
  // tre foglie lunghe avvolte, punte che sporgono
  s += path(curva([add(c, [-24, 2]), add(c, [-8, -12]), add(c, [14, -10]), add(c, [24, -2]), add(c, [8, 4]), add(c, [-10, 6])], true), { fill: foglia });
  s += path(curva([add(c, [-18, -4]), add(c, [0, -14]), add(c, [20, -12]), add(c, [4, -4])], true), { fill: fogliaChiara });
  s += path(curva([add(c, [-20, 8]), add(c, [-2, 14]), add(c, [22, 8]), add(c, [2, 2])], true), { fill: scurisci(foglia, 0.12) });
  s += path(`M${pt(add(c, [-18, -3]))}Q${pt(add(c, [0, -10]))} ${pt(add(c, [18, -9]))}M${pt(add(c, [-16, 8]))}Q${pt(add(c, [0, 11]))} ${pt(add(c, [18, 6]))}`, { stroke: nervo, "stroke-width": 1, fill: "none", opacity: 0.7 });
  // il nodo stretto
  s += path(`M${pt(add(c, [-2, -13]))}Q${pt(add(c, [3, 0]))} ${pt(add(c, [0, 13]))}`, { stroke: corda, "stroke-width": 2.4, fill: "none" });
  s += path(cerchioD(add(c, [1, -1]), 2.6), { fill: corda });
  return s;
}

// ------------------------------------------------------------------ testa --
interface TavZ {
  manto: string;
  mantoAlto: string;
  mantoOmbra: string;
  crema: string;
  cremaOmbra: string;
  striscia: string;
}

function testaZara(sk: Scheletro, posa: PosaZara, ctx: CtxPupazzo, c: TavZ): string {
  const { defs, luce, id } = ctx;
  const t = posa.t;
  const ang = sk.testa + onda(t, 4.7) * 0.8;
  const perno = add(sk.collo, [6, -4]);
  let s = "";

  // orecchio lontano (appena dietro la nuca)
  s += orecchioZara([-2, -38], posa, c, true);

  // testa da cucciola: cranio tondo, muso corto e largo
  const sagoma: P[] = [
    [-20, -22],
    [-8, -40],
    [12, -48],
    [32, -44],
    [46, -32],
    [54, -20],
    [60, -12],
    [64, -4],
    [63, 5],
    [57, 11],
    [48, 17],
    [36, 21],
    [22, 24],
    [6, 25],
    [-8, 20],
    [-20, 8],
  ];
  const bocca = clamp(posa.bocca ?? 0);
  if (bocca > 0) {
    sagoma[10] = [48, 17 + bocca * 7];
    sagoma[11] = [36, 22 + bocca * 8];
    sagoma[12] = [22, 25 + bocca * 4];
  }
  const d = curva(sagoma, true);
  const gTesta = defs.lineare(`${id}-testa`, [0, -48], [0, 25], [
    [0, c.mantoAlto],
    [0.55, c.manto],
    [1, mescola(c.manto, c.mantoOmbra, 0.5)],
  ]);
  s += path(d, { fill: gTesta });
  const clipT = defs.clip(`${id}-clipT`, d);
  let dt = "";
  // guancia e muso crema, bianco sopra l'occhio
  dt += path(curva([[30, -2], [46, -8], [62, -6], [66, 6], [52, 16], [34, 22], [14, 26], [-4, 20], [12, 8]], true), { fill: c.crema });
  dt += path(curva([[14, 18], [34, 16], [50, 14], [40, 24], [18, 28]], true), { fill: mescola(c.crema, c.cremaOmbra, 0.5) });
  dt += path(ellisseD([30, -27], 10, 4.5), { fill: c.crema, opacity: 0.95 });
  // segni del viso: strisce della guancia (dietro l'occhio, verso la nuca)
  let st = "";
  st += `M14 -14q-8 8 -8 20q3 -9 11 -17Z`;
  st += `M4 -20q-10 6 -14 18q6 -8 16 -14Z`;
  st += `M22 4q-6 6 -8 14q5 -5 10 -10Z`;
  // sopracciglio scuro e sopra l'occhio
  st += `M24 -36q10 -4 20 2q-9 -1 -20 1Z`;
  // LA FORCELLA A Y in fronte: gambo verso il naso, due rami verso le orecchie
  // (il destro più lungo). Di profilo se ne vede il ramo sul nostro lato.
  st += `M40 -40q-8 -3 -14 -9q7 2 15 6Z`;
  st += `M40 -40q-6 -6 -8 -12q4 4 9 9Z`;
  st += `M40 -41q4 4 6 9q-5 -3 -7 -8Z`;
  dt += path(st, { fill: c.striscia, opacity: 0.95 });
  s += g({ "clip-path": clipT }, dt);
  // naso rosa-bruno
  s += path("M56 -12q8 -2 9 5q-2 4 -8 3Z", { fill: inLuce("#b07466", luce) });
  // bocca
  s += path(`M63 5Q58 13 46 ${n(15 + bocca * 6)}`, { stroke: scurisci(c.manto, 0.55), "stroke-width": 1.8, fill: "none", "stroke-linecap": "round" });
  if (bocca > 0.05) s += path(`M60 10Q52 ${n(17 + bocca * 9)} 40 ${n(20 + bocca * 6)}Q50 14 60 10Z`, { fill: "#4a2624" });
  // vibrisse
  s += path("M50 3q16 -5 30 -4M50 6q16 1 30 5M48 9q12 5 24 11", { stroke: schiarisci(c.crema, 0.3), "stroke-width": 1, fill: "none", opacity: 0.75 });
  // occhio verde che brilla
  s += occhioZara(posa, ctx, c);
  // gorgiera della guancia
  s += path("M-10 14l-10 5l7 0l-8 8l9 -3l-4 8l10 -7l1 6l5 -8Z", { fill: c.crema });
  // orecchio vicino con l'ocello bianco sul retro
  s += orecchioZara([4, -40], posa, c, false);
  return g({ transform: `translate(${n(perno[0])} ${n(perno[1])})rotate(${n(ang)})scale(${SCALA_TESTA})` }, s);
}

function occhioZara(posa: PosaZara, ctx: CtxPupazzo, c: TavZ): string {
  const { defs, id, luce } = ctx;
  const t = posa.t;
  const chiuso = clamp(Math.max(posa.occhi ?? 0, palpebra(t, 3.3, posa.semeCiglia ?? 0.55)));
  const cx = 34;
  const cy = -18;
  const sg = clamp(posa.sguardo ?? 0.4, -1, 1);
  // mandorla allungata, grande
  const occhio = `M${n(cx - 11)} ${n(cy + 2)}Q${n(cx - 3)} ${n(cy - 9)} ${n(cx + 11)} ${n(cy - 2)}Q${n(cx + 3)} ${n(cy + 7)} ${n(cx - 11)} ${n(cy + 2)}Z`;
  // il verde BRILLA: non si spegne con la luce (tiene parte della sua luce)
  const verde = mescola(inLuce(ZARA_ANCORE.occhi, luce), ZARA_ANCORE.occhi, 0.5);
  const iride = defs.radiale(`${id}-iride`, [cx + sg * 2, cy - 1], 9, [
    [0, schiarisci(verde, 0.5)],
    [0.55, verde],
    [1, scurisci(verde, 0.35)],
  ]);
  let s = path(occhio, { fill: iride });
  s += path(ellisseD([cx + 1.5 + sg * 3, cy - 1], 3, 4.4), { fill: "#15120e" });
  s += path(cerchioD([cx - 2 + sg, cy - 4.5], 1.8), { fill: "#ffffff", opacity: 0.95 });
  s += path(cerchioD([cx + 4 + sg, cy + 1.5], 0.9), { fill: "#ffffff", opacity: 0.6 });
  if (chiuso > 0.02) {
    s += path(`M${n(cx - 12)} ${n(cy - 10)}H${n(cx + 12)}V${n(cy - 9 + 15 * chiuso)}Q${n(cx)} ${n(cy - 5 + 15 * chiuso)} ${n(cx - 12)} ${n(cy - 9 + 15 * chiuso)}Z`, { fill: c.manto });
  }
  // contorno scuro (il "trucco" naturale delle tigri)
  s += path(occhio, { stroke: "#1b1510", "stroke-width": 1.9, fill: "none" });
  return s;
}

function orecchioZara(base: P, posa: PosaZara, c: TavZ, lontano: boolean): string {
  const t = posa.t;
  const tens = posa.orecchie ?? 0.3;
  const guizzo = Math.max(0, Math.sin(t * 1.7 + (lontano ? 1.4 : 0))) ** 14 * 14;
  const ang = -6 - tens * 14 + guizzo - (lontano ? 14 : 0);
  // orecchio tondo: fuori arancio, bordo posteriore scuro con l'ocello bianco
  const sag: P[] = [
    [-11, 2],
    [-11, -12],
    [-4, -22],
    [6, -22],
    [12, -12],
    [11, 2],
  ];
  if (lontano) return g({ transform: tr(base[0], base[1], ang) }, path(curva(sag, true), { fill: c.mantoOmbra }));
  let s = path(curva(sag, true), { fill: c.manto });
  s += path(curva([[-11, 0], [-11, -12], [-4, -22], [-1, -16], [-5, -6], [-5, 2]], true), { fill: "#2a2119" });
  s += path(ellisseD([-6, -10], 2.6, 4), { fill: "#f4efe4" });
  s += path(curva([[1, -2], [2, -14], [7, -16], [9, -6], [7, 1]], true), { fill: c.crema, opacity: 0.8 });
  return g({ transform: tr(base[0], base[1], ang) }, s);
}
