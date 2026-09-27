// cartoni/scene/lago.ts — le cose d'acqua e di barca (i Laghi del Vespro, ep02).
//
// La barca di Brénta coi remi, il molo basso, i pali, le palafitte e le
// passerelle, le reti stese «che gocciolavano luce», le barche tirate a secco,
// la tana di canne; e il RIFLESSO: quel che l'acqua ferma rimanda (il cielo, le
// canne, chi si sporge), capovolto sotto la linea dell'acqua e mosso dalle onde
// — e per chi l'acqua «non ha ancora deciso», sfumato ai bordi (ep02, p.7).
//
// Tutto di profilo, con l'origine sulla linea dell'acqua (o del suolo): y verso
// il basso, le misure a scala dei pupazzi (Rocco è lungo ~490, Zara ~320).

import { type Luce, inLuce, inOmbra, mescola, schiarisci, scurisci } from "../motore/colore";
import { caso, elemento, fnv1a32 } from "../motore/caso";
import { type Defs, type P, cerchioD, curva, ellisseD, g, n, path, pt } from "../motore/svg";
import { clamp } from "../motore/tempo";

export const LEGNO = { chiaro: "#a8865c", medio: "#7d5f3e", scuro: "#4e3a26", bagnato: "#3b2d20" } as const;
export const PAGLIA = { chiara: "#c9aa69", scura: "#8a6d3f" } as const;
const ACQUA = { lago: "#65798a", chiaro: "#aab4b0" } as const;

// ------------------------------------------------------------------ barca --
/** Come sta a galla una barca: quanto sale e scende e quanto rolla (gradi), al tempo t. */
export function galleggia(t: number, seme: string, calma = 1): { dy: number; ang: number } {
  const r = caso(`galleggia/${seme}`);
  const f1 = r.tra(0.28, 0.36);
  const f2 = r.tra(0.5, 0.7);
  const ph = r.tra(0, 6);
  return {
    dy: (Math.sin(t * f1 * 2 * Math.PI + ph) * 3 + Math.sin(t * f2 * 2 * Math.PI) * 1.4) * calma,
    ang: (Math.sin(t * f1 * 2 * Math.PI + ph + 1.2) * 0.9 + Math.sin(t * f2 * 1.7 * Math.PI) * 0.4) * calma,
  };
}

export interface OpzBarca {
  /** Lunghezza dello scafo (la barca di Brénta: ~780, ci sta un rinoceronte seduto). */
  lunghezza?: number;
  /** Quanto pesca in più (0..1): col carico la barca affonda un poco. */
  carico?: number;
  /** La prua: a sinistra (-1, di norma: si va verso il largo) o a destra (1). */
  prua?: 1 | -1;
  /** Il mucchio di reti a poppa. */
  reti?: boolean;
  /** Il carico sotto un telo, legato, in mezzo alla barca («il carico che si custodisce per i giorni che contano», ep03). */
  telo?: boolean;
  /** Qualcosa sotto il telo: un colpetto da dentro (0..1, un bozzo che spunta) e un respiro (−1..1, il mucchio che sale e scende). */
  sottoIlTelo?: { colpo?: number; respiro?: number };
  /** I colori dell'acqua del luogo (per l'acqua che bagna lo scafo). */
  acqua?: { lago: string; chiaro: string };
}

export interface Scafo {
  /** Il bordo lontano e l'interno (va DIETRO a chi è a bordo). */
  dietro: string;
  /** La fiancata vicina, l'acqua che la bagna (va DAVANTI a chi è a bordo). */
  davanti: string;
  /** Dove stanno le cose, in coordinate della barca (y = linea dell'acqua). */
  posti: { prua: P; centro: P; poppa: P; scalmo: P; bordo: number };
  /** Mette a bordo: taglia quel che sta sotto il fondo della barca (le zampe di chi siede). */
  aBordo(disegno: string): string;
}

/** La barca da lago di Brénta: fondo piatto, prua alzata, fasciame a tre corsi, scalmi. */
export function barca(luce: Luce, defs: Defs, id: string, o: OpzBarca = {}): Scafo {
  const L = o.lunghezza ?? 780;
  const k = o.prua ?? -1;
  const affonda = 10 * clamp(o.carico ?? 0);
  const bordo = -64 + affonda; // l'orlo vicino (sopra l'acqua)
  const fondo = 34 + affonda;
  const h = L / 2;
  // il profilo della fiancata (prua a sinistra, poi si specchia)
  const X = (x: number) => x * -k;
  const prof: P[] = [
    [X(-h - 40), bordo - 34], // la punta della prua, alta
    [X(-h + 40), bordo - 6],
    [X(-h * 0.4), bordo + 2],
    [X(h * 0.3), bordo + 1],
    [X(h - 30), bordo - 8],
    [X(h + 6), bordo - 16], // lo specchio di poppa
    [X(h - 10), fondo - 6],
    [X(h * 0.4), fondo],
    [X(-h * 0.5), fondo - 2],
    [X(-h + 30), fondo - 16],
  ];
  const legno = inLuce(LEGNO.medio, luce);
  const legnoC = inLuce(LEGNO.chiaro, luce);
  const legnoS = inLuce(LEGNO.scuro, luce);
  const bagnato = inLuce(LEGNO.bagnato, luce);
  const url = defs.lineare(`${id}-fianco`, [0, bordo - 20], [0, fondo], [
    [0, legnoC],
    [0.45, legno],
    [0.8, legnoS],
    [1, bagnato],
  ]);
  // --- dietro: l'orlo lontano, un poco più alto (la vediamo appena dall'alto), e l'interno scuro
  const dietro =
    path(curva([[X(-h - 30), bordo - 30], [X(-h * 0.4), bordo - 12], [X(h * 0.3), bordo - 13], [X(h), bordo - 22], [X(h), bordo - 8], [X(h * 0.3), bordo], [X(-h * 0.4), bordo], [X(-h - 20), bordo - 18]], true), { fill: inOmbra(LEGNO.scuro, luce) }) +
    path(curva([[X(-h - 30), bordo - 30], [X(-h * 0.4), bordo - 12], [X(h * 0.3), bordo - 13], [X(h), bordo - 22]]), { stroke: legnoC, "stroke-width": 5, fill: "none", "stroke-linecap": "round" }) +
    // i banchi (le tavole di traverso), appena visibili
    path(`M${n(X(-h * 0.15) - 40)} ${n(bordo - 9)}h80M${n(X(h * 0.55) - 30)} ${n(bordo - 10)}h60`, { stroke: legnoS, "stroke-width": 6, opacity: 0.7 });
  // --- davanti: la fiancata col fasciame, lo specchio, gli scalmi, l'acqua che la bagna
  let davanti = path(curva(prof, true, 0.9), { fill: url });
  // i corsi del fasciame (tre linee che seguono l'orlo)
  for (let i = 1; i <= 3; i++) {
    const dy = i * ((fondo - bordo) / 4.2);
    davanti += path(curva([[X(-h + 10), bordo - 4 + dy * 0.8], [X(-h * 0.4), bordo + 2 + dy], [X(h * 0.3), bordo + 1 + dy], [X(h - 16), bordo - 6 + dy * 0.9]]), {
      stroke: legnoS,
      "stroke-width": 2,
      fill: "none",
      opacity: 0.55,
    });
  }
  // l'orlo vicino, chiaro e consumato
  davanti += path(curva([[X(-h - 40), bordo - 34], [X(-h + 40), bordo - 6], [X(-h * 0.4), bordo + 2], [X(h * 0.3), bordo + 1], [X(h - 30), bordo - 8], [X(h + 6), bordo - 16]]), {
    stroke: schiarisci(legnoC, 0.1),
    "stroke-width": 7,
    fill: "none",
    "stroke-linecap": "round",
  });
  // lo scalmo (dove gira il remo), verso poppa
  const scalmo: P = [X(h * 0.42), bordo - 6];
  davanti += path(`M${n(scalmo[0] - 5)} ${n(bordo + 2)}L${n(scalmo[0] - 3)} ${n(scalmo[1] - 10)}M${n(scalmo[0] + 5)} ${n(bordo + 2)}L${n(scalmo[0] + 3)} ${n(scalmo[1] - 10)}`, { stroke: legnoS, "stroke-width": 4, "stroke-linecap": "round" });
  // la cima arrotolata a prua
  davanti += path(ellisseD([X(-h + 70), bordo + 16], 16, 9), { fill: "none", stroke: inLuce("#b49a6a", luce), "stroke-width": 3.5 });
  // l'acqua che la bagna: sotto la linea del galleggiamento lo scafo sparisce nel lago
  // (solo dentro la sagoma dello scafo: niente bordi), e la linea chiara dell'acqua
  const colAcqua = o.acqua ?? ACQUA;
  const lago = inLuce(colAcqua.lago, luce);
  const clip = defs.clip(`${id}-scafo`, curva(prof, true, 0.9));
  const velo = defs.lineare(`${id}-bagnato`, [0, -2], [0, fondo], [
    [0, lago, 0.45],
    [0.4, lago, 0.8],
    [1, lago, 0.95],
  ]);
  davanti += `<g clip-path="${clip}">${path(`M${n(-h - 80)} -2H${n(h + 80)}V${n(fondo + 30)}H${n(-h - 80)}Z`, { fill: velo })}</g>`;
  davanti += path(`M${n(-h - 20)} 1Q${n(-h * 0.2)} 5 ${n(h * 0.3)} 1T${n(h + 10)} 2`, { stroke: inLuce(colAcqua.chiaro, luce), "stroke-width": 3, fill: "none", opacity: 0.75, "stroke-linecap": "round" });
  // le reti a poppa: un mucchio morbido e bitorzoluto, a maglie (che non sembri un
  // guscio), coi galleggianti di sughero e un lembo che pende fuori dal bordo
  let dietroReti = "";
  if (o.reti ?? true) {
    const rx = X(h * 0.72);
    const mucchio = curva(
      [
        [rx - 72, bordo + 2],
        [rx - 62, bordo - 16],
        [rx - 40, bordo - 22],
        [rx - 22, bordo - 34],
        [rx + 2, bordo - 28],
        [rx + 22, bordo - 38],
        [rx + 46, bordo - 24],
        [rx + 64, bordo - 10],
        [rx + 72, bordo + 2],
      ],
      true,
    );
    dietroReti += path(mucchio, { fill: inLuce("#8a8670", luce) });
    // le maglie: due trame di traverso, dentro il mucchio
    const clipR = defs.clip(`${id}-reti`, mucchio);
    let maglie = "";
    for (let x = -100; x <= 100; x += 11) maglie += `M${n(rx + x)} ${n(bordo + 4)}l40 -48M${n(rx + x)} ${n(bordo + 4)}l-40 -48`;
    dietroReti += `<g clip-path="${clipR}">${path(maglie, { stroke: inLuce("#bdb89c", luce), "stroke-width": 1.4, fill: "none", opacity: 0.75 })}${path(`M${n(rx - 80)} ${n(bordo - 6)}H${n(rx + 80)}V${n(bordo + 6)}H${n(rx - 80)}Z`, { fill: "#2a261c", opacity: 0.3 })}</g>`;
    for (const [dx, dy] of [[-44, -16], [-6, -26], [30, -30], [54, -12]] as const) {
      dietroReti += path(ellisseD([rx + dx, bordo + dy], 8, 5.5), { fill: inLuce("#d9a15a", luce) }) + path(ellisseD([rx + dx - 1.5, bordo + dy - 1.5], 4, 2.2), { fill: "#fff3d6", opacity: 0.45 });
    }
  }
  // il carico sotto il telo: un mucchio tondo, le pieghe della tela, una corda che lo lega
  if (o.telo) {
    const cx = X(-h * 0.1);
    const tela = inLuce("#8f846c", luce);
    const telaS = inOmbra("#5f5646", luce);
    const sale = (o.sottoIlTelo?.respiro ?? 0) * 5;
    const d = curva([[cx - 150, bordo + 2], [cx - 132, bordo - 38], [cx - 70, bordo - 60 - sale], [cx + 10, bordo - 66 - sale], [cx + 90, bordo - 56 - sale], [cx + 140, bordo - 30], [cx + 152, bordo + 2]], true);
    dietroReti += path(d, { fill: tela });
    // il colpetto da dentro: un bozzo piccolo che spunta e torna giù (un becco, sotto la tela)
    const bozzo = clamp(o.sottoIlTelo?.colpo ?? 0) * 13;
    if (bozzo > 0.2) dietroReti += path(curva([[cx + 38, bordo - 58 - sale], [cx + 52, bordo - 60 - sale - bozzo], [cx + 60, bordo - 61 - sale - bozzo * 1.05], [cx + 68, bordo - 60 - sale - bozzo * 0.6], [cx + 80, bordo - 57 - sale]], true), { fill: tela });
    dietroReti += path(`M${n(cx - 110)} ${n(bordo - 30)}Q${n(cx - 80)} ${n(bordo - 8)} ${n(cx - 60)} ${n(bordo)}M${n(cx - 10)} ${n(bordo - 58)}Q${n(cx + 10)} ${n(bordo - 28)} ${n(cx + 2)} ${n(bordo)}M${n(cx + 70)} ${n(bordo - 50)}Q${n(cx + 96)} ${n(bordo - 22)} ${n(cx + 110)} ${n(bordo)}`, { stroke: telaS, "stroke-width": 3, fill: "none", opacity: 0.8 });
    dietroReti += path(`M${n(cx - 140)} ${n(bordo - 16)}Q${n(cx)} ${n(bordo - 44)} ${n(cx + 142)} ${n(bordo - 14)}`, { stroke: inLuce("#a88b5c", luce), "stroke-width": 3.2, fill: "none" });
  }
  const taglio = defs.clip(`${id}-bordo`, `M${n(-h - 200)} ${n(bordo - 900)}H${n(h + 200)}V${n(fondo - 8)}H${n(-h - 200)}Z`);
  return {
    aBordo: (disegno: string) => `<g clip-path="${taglio}">${disegno}</g>`,
    dietro: dietro + dietroReti,
    davanti,
    posti: { prua: [X(-h * 0.62), bordo - 4], centro: [X(-h * 0.08), bordo - 2], poppa: [X(h * 0.62), bordo - 6], scalmo, bordo },
  };
}

/**
 * Un remo, vogato in piedi guardando avanti (come si fa sui laghi): gira sullo
 * scalmo, il manico nelle zampe di chi voga, la pala in acqua verso poppa.
 * `fase` 0..1 è il ciclo (fino a 0.5 la passata, pala in acqua; poi la pala esce e
 * torna); `fermo` (0..1) lo tira in barca, lungo il bordo. `verso` = da che parte
 * dello scalmo sta la pala (+1 a destra); `spinge` per chi voga in piedi guardando
 * avanti. Restituisce il disegno, il manico (per le zampe) e la pala.
 */
export function remo(luce: Luce, scalmo: P, fase: number, fermo = 0, verso: 1 | -1 = 1, spinge = false): { disegno: string; manico: P; pala: P } {
  const f = ((fase % 1) + 1) % 1;
  const passata = f < 0.5;
  const u = passata ? f / 0.5 : (f - 0.5) / 0.5;
  // la pala va verso poppa nella passata, torna dopo; chi voga in piedi guardando
  // avanti SPINGE (la pala sta davanti allo scalmo, e nella passata torna indietro)
  const va0 = passata ? u : 1 - u;
  const va = spinge ? 1 - va0 : va0;
  const alza = passata ? 0 : Math.sin(u * Math.PI) * 0.3; // fuori dall'acqua mentre torna
  const angV = ((20 + va * 32) * Math.PI) / 180; // dal verticale, verso poppa
  let d: P = [verso * Math.sin(angV), Math.cos(angV) * (1 - alza)];
  // tirato in barca: quasi orizzontale, lungo il bordo verso poppa
  const kf = clamp(fermo);
  d = [d[0] * (1 - kf) + verso * kf, d[1] * (1 - kf) + 0.08 * kf];
  const nd = Math.hypot(d[0], d[1]);
  d = [d[0] / nd, d[1] / nd];
  const Lp = 300 - 60 * kf;
  // il manico: chi voga in piedi lo tiene all'altezza del petto (non davanti al muso)
  const Lm = spinge ? 62 : 105;
  const pala: P = [scalmo[0] + d[0] * Lp, scalmo[1] + d[1] * Lp];
  const manico: P = [scalmo[0] - d[0] * Lm, scalmo[1] - d[1] * Lm];
  const legno = inLuce(LEGNO.chiaro, luce);
  const sotto = mescola(legno, inLuce(ACQUA.lago, luce), 0.6);
  // il fusto: sopra l'acqua pieno, sotto velato dall'acqua
  let s = "";
  if (pala[1] > 0 && manico[1] < 0) {
    const k = -manico[1] / (pala[1] - manico[1]);
    const pelo: P = [manico[0] + (pala[0] - manico[0]) * k, 0];
    s += path(`M${pt(manico)}L${pt(pelo)}`, { stroke: legno, "stroke-width": 7, "stroke-linecap": "round" });
    s += path(`M${pt(pelo)}L${pt(pala)}`, { stroke: sotto, "stroke-width": 6, "stroke-linecap": "round", opacity: 0.8 });
  } else s += path(`M${pt(manico)}L${pt(pala)}`, { stroke: legno, "stroke-width": 7, "stroke-linecap": "round" });
  const ang = (Math.atan2(d[1], d[0]) * 180) / Math.PI;
  s += g({ transform: `translate(${n(pala[0])} ${n(pala[1])})rotate(${n(ang)})` }, path(ellisseD([-14, 0], 44, 10), { fill: pala[1] > 8 ? sotto : inLuce(LEGNO.medio, luce), opacity: pala[1] > 8 ? 0.8 : 1 }));
  // lo sgocciolio quando la pala esce
  if (!passata && u < 0.45 && kf < 0.5) {
    const k2 = u / 0.45;
    s += path(`M${n(pala[0])} ${n(pala[1] + 6)}l0 ${n(10 + k2 * 26)}M${n(pala[0] - 12 * verso)} ${n(pala[1] + 4)}l0 ${n(6 + k2 * 20)}`, { stroke: "#eef3f2", "stroke-width": 2, opacity: 0.6 * (1 - k2), "stroke-linecap": "round" });
  }
  return { disegno: s, manico, pala };
}

/** Il cerchio che si allarga dove qualcosa tocca l'acqua (tuffi, remi, gocce). */
export function cerchiAcqua(luce: Luce, c: P, eta: number, grandezza = 1): string {
  if (eta <= 0 || eta >= 1) return "";
  let s = "";
  for (let i = 0; i < 3; i++) {
    const e = eta - i * 0.18;
    if (e <= 0) continue;
    const r = (20 + e * 120) * grandezza;
    s += path(ellisseD(c, r, r * 0.16), { fill: "none", stroke: inLuce("#eef1ea", luce), "stroke-width": 2.5 * (1 - e), opacity: 0.8 * (1 - e) });
  }
  return s;
}

/** L'anello d'acqua attorno a un palo piantato nel lago (alla linea dell'acqua, y=0). */
export function increspatura(luce: Luce, x: number, r: number): string {
  return path(`M${n(x - r)} 2Q${n(x)} 7 ${n(x + r)} 2`, { stroke: "#eef1ea", "stroke-width": 1.8, fill: "none", opacity: 0.55, "stroke-linecap": "round" }) + path(`M${n(x - r * 0.7)} 7Q${n(x)} 10 ${n(x + r * 0.7)} 7`, { stroke: scurisci(inLuce(ACQUA.lago, luce), 0.2), "stroke-width": 1.4, fill: "none", opacity: 0.5 });
}

// --------------------------------------------------------- molo e pali --
/** Il molo basso: tavole a quota `y` (sopra l'acqua a 0) da x0 a x1, sui suoi pali. */
export function molo(luce: Luce, x0: number, x1: number, y: number, seme = "molo"): string {
  const legno = inLuce(LEGNO.medio, luce);
  const legnoC = inLuce(LEGNO.chiaro, luce);
  const legnoS = inLuce(LEGNO.scuro, luce);
  const r = caso(`molo/${seme}`);
  let s = "";
  // i pali (scendono sotto l'acqua)
  for (let x = x0 + 20; x <= x1 - 10; x += 150) {
    const xx = x + r.tra(-10, 10);
    s += path(`M${n(xx - 9)} ${n(y - 10)}L${n(xx - 8)} 8L${n(xx + 8)} 8L${n(xx + 9)} ${n(y - 10)}Z`, { fill: legnoS });
    s += increspatura(luce, xx, 14);
  }
  // il piano: una fascia di tavole con le fughe
  s += path(`M${n(x0)} ${n(y - 6)}L${n(x1)} ${n(y - 8)}L${n(x1)} ${n(y + 12)}L${n(x0)} ${n(y + 14)}Z`, { fill: legno });
  s += path(`M${n(x0)} ${n(y - 6)}L${n(x1)} ${n(y - 8)}`, { stroke: legnoC, "stroke-width": 4 });
  let fughe = "";
  for (let x = x0 + 40; x < x1; x += r.tra(60, 110)) fughe += `M${n(x)} ${n(y - 6)}l${n(r.segno(3))} 18`;
  s += path(fughe, { stroke: legnoS, "stroke-width": 1.6, opacity: 0.7 });
  return s;
}

/** Un palo piantato nell'acqua (alto `h` sopra l'acqua), un po' storto. */
export function palo(luce: Luce, x: number, h: number, piega = 0): string {
  const legnoS = inLuce(LEGNO.scuro, luce);
  return (
    path(`M${n(x - 9)} 8L${n(x - 8 + piega)} ${n(-h)}Q${n(x + piega)} ${n(-h - 8)} ${n(x + 8 + piega)} ${n(-h)}L${n(x + 9)} 8Z`, { fill: legnoS }) +
    path(`M${n(x - 3 + piega * 0.9)} ${n(-h + 6)}L${n(x - 3)} 0`, { stroke: inLuce(LEGNO.chiaro, luce), "stroke-width": 2, opacity: 0.5 }) +
    increspatura(luce, x, 18)
  );
}

// ------------------------------------------------- palafitte e passerelle --
export interface OpzPalafitta {
  /** Larghezza della casa. */
  w?: number;
  /** Altezza del piano sopra l'acqua. */
  piano?: number;
  /** Altezza delle pareti. */
  pareti?: number;
  /** Una finestra accesa (la sera, la notte). */
  lume?: number;
}

/**
 * La pianta di una palafitta: le misure, i pali, la porta e la finestra, pescati dal
 * suo seme SEMPRE nello stesso ordine (così chi deve sapere dov'è la finestra — il
 * lume riflesso nella piena, ep04 — la trova dove la disegna `palafitta`).
 * Restituisce anche il generatore, pronto per il tetto.
 */
function piantaPalafitta(seme: string, o: OpzPalafitta) {
  const r = caso(`palafitta/${seme}`);
  const w = o.w ?? r.tra(260, 380);
  const hp = o.piano ?? r.tra(70, 110);
  const hw = o.pareti ?? r.tra(120, 160);
  const nPali = Math.round(w / 55);
  const pali: { x: number; piede: number }[] = [];
  for (let i = 0; i <= nPali; i++) {
    const x = -w / 2 + 10 + (i * (w - 20)) / nPali + r.segno(4);
    pali.push({ x, piede: r.segno(3) });
  }
  const pw = w * 0.8;
  const top = -hp - 12 - hw;
  const px = r.tra(-pw * 0.25, pw * 0.1);
  const fx = px + (r.moneta(0.5) ? 70 : -70);
  return { r, w, hp, hw, pali, pw, top, px, fx };
}

/** Dov'è la finestra di una palafitta (il centro, coordinate della casa: l'acqua a y=0). */
export function finestraDellaPalafitta(seme: string, o: OpzPalafitta = {}): P {
  const k = piantaPalafitta(seme, o);
  return [k.fx, k.top + k.hw * 0.3 + 12];
}

/** Una casa su palafitte, col tetto di paglia spiovente (la riva di Rivalba). Origine: sull'acqua, al centro. */
export function palafitta(luce: Luce, defs: Defs, seme: string, o: OpzPalafitta = {}): string {
  const { r, w, hp, hw, pali: piantati, pw, top, px, fx } = piantaPalafitta(seme, o);
  const legno = inLuce(LEGNO.medio, luce);
  const legnoC = inLuce(LEGNO.chiaro, luce);
  const legnoS = inLuce(LEGNO.scuro, luce);
  let s = "";
  // i pali
  let pali = "";
  for (const { x, piede } of piantati) {
    pali += `M${n(x - 6)} ${n(-hp)}L${n(x - 7 + piede)} 6L${n(x + 7)} 6L${n(x + 6)} ${n(-hp)}Z`;
    s += increspatura(luce, x, 12);
  }
  s = path(pali, { fill: legnoS }) + s;
  // il piano (la terrazza sporge un poco)
  s += path(`M${n(-w / 2 - 30)} ${n(-hp - 12)}h${n(w + 60)}v14h${n(-w - 60)}Z`, { fill: legno });
  s += path(`M${n(-w / 2 - 30)} ${n(-hp - 12)}h${n(w + 60)}`, { stroke: legnoC, "stroke-width": 3 });
  // le pareti di assi verticali
  const url = defs.lineare(`palafitta-${seme}-pareti`, [0, top], [0, -hp - 12], [
    [0, scurisci(legno, 0.25)],
    [1, legno],
  ]);
  s += path(`M${n(-pw / 2)} ${n(-hp - 12)}V${n(top)}H${n(pw / 2)}V${n(-hp - 12)}Z`, { fill: url });
  let assi = "";
  for (let x = -pw / 2 + 18; x < pw / 2; x += 18) assi += `M${n(x)} ${n(top + 4)}V${n(-hp - 14)}`;
  s += path(assi, { stroke: legnoS, "stroke-width": 1.4, opacity: 0.55 });
  // la porta e una finestrella
  s += path(`M${n(px - 22)} ${n(-hp - 12)}V${n(top + hw * 0.32)}Q${n(px)} ${n(top + hw * 0.22)} ${n(px + 22)} ${n(top + hw * 0.32)}V${n(-hp - 12)}Z`, { fill: inOmbra(LEGNO.bagnato, luce) });
  const lume = clamp(o.lume ?? 0);
  s += path(`M${n(fx - 14)} ${n(top + hw * 0.3)}h28v24h-28Z`, { fill: lume > 0 ? mescola(inOmbra(LEGNO.bagnato, luce), "#f2b35a", lume) : inOmbra(LEGNO.bagnato, luce) });
  // il tetto di paglia: spiovente, sporge, con le ciocche
  const tetto = top - r.tra(110, 150);
  const sporge = 40;
  const pagliaU = defs.lineare(`palafitta-${seme}-tetto`, [0, tetto], [0, top + 20], [
    [0, inLuce(PAGLIA.chiara, luce)],
    [1, inLuce(PAGLIA.scura, luce)],
  ]);
  s += path(`M${n(-pw / 2 - sporge)} ${n(top + 18)}Q${n(-pw * 0.2)} ${n(tetto + 20)} ${n(0)} ${n(tetto)}Q${n(pw * 0.2)} ${n(tetto + 20)} ${n(pw / 2 + sporge)} ${n(top + 18)}Z`, { fill: pagliaU });
  let ciocche = "";
  for (let i = 0; i < 40; i++) {
    const u = r.tra(-1, 1);
    const x = u * (pw / 2 + sporge);
    const y0 = tetto + Math.abs(u) * (top + 18 - tetto) * 0.98;
    ciocche += `M${n(x)} ${n(y0 + 6)}l${n(u * 6)} ${n(r.tra(14, 30))}`;
  }
  s += path(ciocche, { stroke: inLuce(PAGLIA.scura, luce), "stroke-width": 2, opacity: 0.6, "stroke-linecap": "round" });
  s += path(`M${n(-pw / 2 - sporge)} ${n(top + 18)}Q0 ${n(top + 26)} ${n(pw / 2 + sporge)} ${n(top + 18)}`, { stroke: inLuce(PAGLIA.scura, luce), "stroke-width": 5, fill: "none", "stroke-linecap": "round" });
  return s;
}

/** Una passerella su pali, a quota `y` (sopra l'acqua a 0), da x0 a x1. */
export function passerella(luce: Luce, x0: number, x1: number, y: number, seme = "passerella"): string {
  const r = caso(`passerella/${seme}`);
  const legno = inLuce(LEGNO.medio, luce);
  const legnoS = inLuce(LEGNO.scuro, luce);
  let s = "";
  let pali = "";
  for (let x = x0 + 10; x <= x1; x += 110) {
    const xx = x + r.segno(8);
    pali += `M${n(xx - 5)} ${n(y)}L${n(xx - 5)} 6L${n(xx + 5)} 6L${n(xx + 5)} ${n(y)}Z`;
    s += increspatura(luce, xx, 10);
  }
  s = path(pali, { fill: legnoS }) + s;
  s += path(`M${n(x0)} ${n(y - 5)}L${n(x1)} ${n(y - 7)}L${n(x1)} ${n(y + 5)}L${n(x0)} ${n(y + 7)}Z`, { fill: legno });
  // il corrimano di corda
  s += path(`M${n(x0)} ${n(y - 38)}Q${n((x0 + x1) / 2)} ${n(y - 26)} ${n(x1)} ${n(y - 40)}`, { stroke: inLuce("#a58d5e", luce), "stroke-width": 2, fill: "none", opacity: 0.8 });
  return s;
}

// ---------------------------------------------------- i Massi del Consiglio --
/**
 * Un masso del Consiglio (ep03, p.1): «pietre larghe e lisce, levigate da
 * generazioni di zampe». Sorge dall'acqua; il piano in cima è largo e appena
 * bombato, più chiaro (lisciato) — ma non brilla. Origine: sul pelo dell'acqua,
 * al centro; `w` è la larghezza, `h` l'altezza della cima sopra l'acqua.
 */
export function massoDelConsiglio(luce: Luce, defs: Defs, seme: string, w: number, h: number, acqua: { lago: string; chiaro: string } = ACQUA): string {
  const r = caso(`masso/${seme}`);
  const pietra = inLuce(mescola("#9a948a", "#8c8676", r.tra(0, 1)), luce);
  const liscia = inLuce("#bdb5a4", luce);
  const scura = inOmbra("#57524a", luce);
  const bagnata = inOmbra("#4a463f", luce);
  const hw = w / 2;
  // un sasso vero: più largo in basso, i fianchi che si gonfiano, le spalle tonde,
  // il piano appena storto (ognuno il suo)
  const storto = r.segno(5);
  const sagoma: P[] = [
    [-hw - 22, 18],
    [-hw - 14, -h * 0.18],
    [-hw - 4, -h * 0.55],
    [-hw + 8, -h + 14 + storto],
    [-hw * 0.6, -h - 1 + storto * 0.6],
    [-hw * 0.1, -h - 5 + storto * 0.2],
    [hw * 0.4, -h - 3 - storto * 0.3],
    [hw - 10, -h + 12 - storto * 0.8],
    [hw + 4, -h * 0.5 + r.segno(6)],
    [hw + 16, -h * 0.15],
    [hw + 24, 18],
  ];
  const d = curva(sagoma, true, 0.85);
  const url = defs.lineare(`masso-${seme}`, [0, -h], [0, 10], [
    [0, pietra],
    [0.7, mescola(pietra, scura, 0.45)],
    [1, bagnata],
  ]);
  let s = path(d, { fill: url });
  const clip = defs.clip(`masso-${seme}-clip`, d);
  let dentro = "";
  // il piano lisciato dalle zampe: una fascia chiara lungo la cima
  dentro += path(curva([[-hw + 8, -h + 10], [-hw * 0.5, -h - 1], [0, -h - 4], [hw * 0.5, -h - 1], [hw - 8, -h + 10], [hw * 0.4, -h + 14], [-hw * 0.4, -h + 14]], true), { fill: liscia, opacity: 0.85 });
  // la linea bagnata, poco sopra l'acqua (il lago sale e scende)
  dentro += path(`M${n(-hw - 20)} ${n(-8 - r.tra(0, 6))}L${n(hw + 20)} ${n(-10 - r.tra(0, 6))}L${n(hw + 20)} 20L${n(-hw - 20)} 20Z`, { fill: bagnata, opacity: 0.55 });
  // il fianco in ombra (a destra) e una faccia più chiara (a sinistra)
  dentro += path(curva([[hw * 0.25, -h + 16], [hw + 30, -h * 0.5], [hw + 30, 20], [hw * 0.35, 20], [hw * 0.45, -h * 0.5]], true), { fill: scura, opacity: 0.35 });
  dentro += path(curva([[-hw - 4, -h * 0.5], [-hw + 10, -h + 18], [-hw * 0.45, -h + 20], [-hw * 0.55, -h * 0.45]], true), { fill: liscia, opacity: 0.25 });
  // qualche segno della pietra (non licheni: qui ci si passa sopra)
  let segni = "";
  for (let i = 0; i < 4; i++) {
    const x = r.tra(-hw * 0.7, hw * 0.7);
    const y = r.tra(-h * 0.7, -h * 0.25);
    segni += `M${n(x)} ${n(y)}q${n(r.segno(8))} ${n(10)} ${n(r.segno(4))} ${n(r.tra(10, 22))}`;
  }
  dentro += path(segni, { stroke: scura, "stroke-width": 1.8, fill: "none", opacity: 0.5 });
  // sotto il pelo dell'acqua la pietra sparisce nel lago
  const velo = defs.lineare(`masso-${seme}-velo`, [0, 0], [0, 16], [
    [0, inLuce(acqua.lago, luce), 0.5],
    [1, inLuce(acqua.lago, luce), 0.95],
  ]);
  dentro += path(`M${n(-hw - 30)} 0H${n(hw + 30)}V30H${n(-hw - 30)}Z`, { fill: velo });
  s += g({ "clip-path": clip }, dentro);
  s += path(`M${n(-hw - 14)} 2Q${n(0)} 7 ${n(hw + 14)} 2`, { stroke: inLuce(acqua.chiaro, luce), "stroke-width": 2.4, fill: "none", opacity: 0.7, "stroke-linecap": "round" });
  return s;
}

/** Dove si posa un piede sulla cima di un masso del Consiglio (y rispetto all'acqua), a `dx` dal centro. */
export function cimaDelMasso(w: number, h: number, dx: number): number {
  const k = clamp(Math.abs(dx) / (w / 2));
  return -h - 4 + 10 * k * k;
}

/** Il gorgo: «l'orlo dove il lago gira» (ep03, p.9) — anelli d'acqua che girano piano. Origine: il centro, sul pelo. */
export function gorgo(luce: Luce, t: number, r = 90): string {
  const chiaro = inLuce(ACQUA.chiaro, luce);
  let d = "";
  for (let i = 0; i < 4; i++) {
    const rr = r * (0.35 + i * 0.22);
    const a0 = t * (0.5 - i * 0.08) + i * 1.3;
    for (let j = 0; j < 2; j++) {
      const a = a0 + j * Math.PI;
      const p0: P = [Math.cos(a) * rr, Math.sin(a) * rr * 0.22];
      const p1: P = [Math.cos(a + 1.2) * rr, Math.sin(a + 1.2) * rr * 0.22];
      const c: P = [Math.cos(a + 0.6) * rr * 1.08, Math.sin(a + 0.6) * rr * 0.24];
      d += `M${pt(p0)}Q${pt(c)} ${pt(p1)}`;
    }
  }
  return path(d, { stroke: chiaro, "stroke-width": 2.2, fill: "none", opacity: 0.6, "stroke-linecap": "round" });
}

// ----------------------------------------------------- reti, barche a secco --
/** Le reti stese tra due pali «che gocciolavano luce»: origine a terra, al primo palo. */
export function retiStese(luce: Luce, t: number, w: number, h: number, seme = "reti"): string {
  const legnoS = inLuce(LEGNO.scuro, luce);
  const corda = inLuce("#8f8a70", luce);
  const r = caso(`reti/${seme}`);
  let s = path(`M-4 0L-3 ${n(-h)}L4 ${n(-h)}L5 0ZM${n(w - 4)} 0L${n(w - 3)} ${n(-h - 6)}L${n(w + 4)} ${n(-h - 6)}L${n(w + 5)} 0Z`, { fill: legnoS });
  // la rete: un velo che pende, con le maglie
  const sag = h * 0.28;
  const top = `M0 ${n(-h + 8)}Q${n(w / 2)} ${n(-h + 8 + sag)} ${n(w)} ${n(-h + 2)}`;
  s += path(`${top}L${n(w - 10)} ${n(-h * 0.35)}Q${n(w / 2)} ${n(-h * 0.2 + sag * 0.6)} ${n(10)} ${n(-h * 0.4)}Z`, { fill: corda, opacity: 0.32 });
  let maglie = "";
  for (let i = 1; i < 12; i++) {
    const x = (i * w) / 12;
    const yt = -h + 8 + sag * 4 * (x / w) * (1 - x / w);
    maglie += `M${n(x)} ${n(yt)}l${n(r.segno(4))} ${n(h * 0.58)}`;
  }
  for (let j = 1; j < 6; j++) maglie += `M4 ${n(-h + 8 + j * h * 0.1)}Q${n(w / 2)} ${n(-h + 8 + j * h * 0.1 + sag)} ${n(w - 4)} ${n(-h + 2 + j * h * 0.1)}`;
  s += path(maglie, { stroke: corda, "stroke-width": 1.2, fill: "none", opacity: 0.7 });
  s += path(top, { stroke: corda, "stroke-width": 2.4, fill: "none" });
  // le gocce: cadono e brillano
  let gocce = "";
  let lampi = "";
  for (let i = 0; i < 14; i++) {
    const e = elemento(fnv1a32(`reti/${seme}/gocce`), i);
    const x = e.tra(12, w - 12);
    const periodo = e.tra(1.1, 2.2);
    const f = ((t + e.tra(0, periodo)) % periodo) / periodo;
    const y0 = -h * 0.3 + sag * 0.5;
    const y = y0 + f * f * (h * 0.7);
    gocce += ellisseD([x, y], 1.6, 2.6);
    if (f < 0.12) lampi += cerchioD([x, y0], 2.6);
  }
  s += path(gocce, { fill: "#f4f1e4", opacity: 0.75 });
  s += path(lampi, { fill: "#fffbe8", opacity: 0.9 });
  return s;
}

/** Una barca tirata a secco, rovesciata sulla ghiaia. Origine: a terra, al centro. */
export function barcaASecco(luce: Luce, defs: Defs, seme: string, L = 420): string {
  const r = caso(`secco/${seme}`);
  const h = L / 2;
  const alta = r.tra(60, 80);
  const legno = inLuce(LEGNO.medio, luce);
  const url = defs.lineare(`secco-${seme}`, [0, -alta], [0, 0], [
    [0, inLuce(LEGNO.chiaro, luce)],
    [1, inLuce(LEGNO.scuro, luce)],
  ]);
  let s = path(curva([[-h, 0], [-h + 20, -alta * 0.7], [-h * 0.3, -alta], [h * 0.5, -alta * 0.95], [h, -alta * 0.4], [h + 10, 0]], true), { fill: url });
  s += path(curva([[-h + 16, -alta * 0.45], [-h * 0.3, -alta * 0.66], [h * 0.5, -alta * 0.62], [h - 6, -alta * 0.26]]), { stroke: inLuce(LEGNO.scuro, luce), "stroke-width": 2, fill: "none", opacity: 0.6 });
  s += path(`M${n(-h - 6)} 0H${n(h + 16)}`, { stroke: legno, "stroke-width": 6, "stroke-linecap": "round" });
  return s;
}

// --------------------------------------------------------- la tana di canne --
/** La tana di canne degli Ospiti (p.3), in sezione: `fondo` (dietro chi ci dorme) e `fronte` (l'arco davanti). */
export function tanaDiCanne(luce: Luce, defs: Defs, w = 360, h = 230): { fondo: string; fronte: string } {
  const r = caso("tana/canne");
  const canna = inLuce(PAGLIA.chiara, luce);
  const cannaS = inLuce(PAGLIA.scura, luce);
  const url = defs.lineare("tana-fondo", [0, -h], [0, 0], [
    [0, scurisci(cannaS, 0.35)],
    [1, scurisci(cannaS, 0.55)],
  ]);
  // il fondo: la parete interna, a cupola
  let fondo = path(`M${n(-w / 2)} 0C${n(-w / 2)} ${n(-h * 0.8)} ${n(-w * 0.25)} ${n(-h)} 0 ${n(-h)}C${n(w * 0.25)} ${n(-h)} ${n(w / 2)} ${n(-h * 0.8)} ${n(w / 2)} 0Z`, { fill: url });
  let fasci = "";
  for (let i = 0; i < 26; i++) {
    const u = -1 + (2 * i) / 25;
    const x = u * (w / 2) * 0.96;
    const yTop = -h * Math.sqrt(Math.max(0, 1 - u * u)) * 0.98;
    fasci += `M${n(x)} 0Q${n(x * 0.85)} ${n(yTop * 0.6)} ${n(x * 0.3 + r.segno(6))} ${n(yTop)}`;
  }
  fondo += path(fasci, { stroke: scurisci(cannaS, 0.2), "stroke-width": 2.2, fill: "none", opacity: 0.55 });
  // la fronte: l'arco d'ingresso e le spalle della tana (la vediamo aperta)
  const fronte =
    path(`M${n(-w / 2 - 20)} 4C${n(-w / 2 - 20)} ${n(-h * 0.86)} ${n(-w * 0.26)} ${n(-h - 16)} 0 ${n(-h - 16)}C${n(w * 0.26)} ${n(-h - 16)} ${n(w / 2 + 20)} ${n(-h * 0.86)} ${n(w / 2 + 20)} 4L${n(w / 2 - 6)} 4C${n(w / 2 - 6)} ${n(-h * 0.8)} ${n(w * 0.24)} ${n(-h + 4)} 0 ${n(-h + 4)}C${n(-w * 0.24)} ${n(-h + 4)} ${n(-w / 2 + 6)} ${n(-h * 0.8)} ${n(-w / 2 + 6)} 4Z`, { fill: canna }) +
    path(
      Array.from({ length: 30 }, (_, i) => {
        const u = -1 + (2 * i) / 29;
        const x = u * (w / 2 + 7);
        const y = -(h + 6) * Math.sqrt(Math.max(0, 1 - u * u));
        return `M${n(x)} ${n(y + 6)}l${n(u * 10)} ${n(-14 - Math.abs(u) * 6)}`;
      }).join(""),
      { stroke: cannaS, "stroke-width": 2, "stroke-linecap": "round", opacity: 0.8 },
    );
  return { fondo, fronte };
}

// ------------------------------------------------------ la custodia del pegno --
/**
 * La custodia del pegno (ep04, p.17): una scatola tonda di legno scavato, lisciata
 * dalle zampe, coi cerchi di conche incisi sul fianco e una cordicella; il coperchio
 * di corteccia, legato dietro. `aperta` (0..1) lo alza: dentro, il vuoto. Origine: a
 * terra, al centro; alta ~46.
 */
export function custodiaDelPegno(luce: Luce, defs: Defs, id: string, aperta = 0): string {
  const legno = inLuce("#6e5238", luce);
  const legnoS = inOmbra("#4a3524", luce);
  const legnoC = inLuce("#9a7a55", luce);
  const url = defs.lineare(`${id}-custodia`, [-32, 0], [32, 0], [
    [0, legnoS],
    [0.35, legno],
    [0.6, legnoC],
    [1, legnoS],
  ]);
  let s = path(ellisseD([2, 1], 38, 5), { fill: "#1a1610", opacity: 0.3 });
  // il fianco: un cilindro basso, visto un poco dall'alto
  s += path("M-30 -40L-30 -4Q0 6 30 -4L30 -40Z", { fill: url });
  // i cerchi incisi: una fila di conche piccole, come quelle delle pietre
  let conche = "";
  for (let i = 0; i < 5; i++) conche += ellisseD([-20 + i * 10, -22 + (i % 2) * 6], 2.6, 2.2);
  s += path(conche, { fill: legnoS, opacity: 0.8 });
  s += path("M-30 -12Q0 -3 30 -12", { stroke: inLuce("#b49a6a", luce), "stroke-width": 2.2, fill: "none" });
  // l'interno (quando si apre: il vuoto)
  s += path(ellisseD([0, -40], 30, 7), { fill: aperta > 0.05 ? inLuce("#140f0a", luce) : legnoC });
  s += path(ellisseD([0, -40], 30, 7), { fill: "none", stroke: legnoS, "stroke-width": 1.6 });
  // il coperchio di corteccia: gira attorno al bordo dietro (a sinistra)
  const a = -110 * clamp(aperta);
  s += g({ transform: `rotate(${n(a)} -30 -41)` }, path("M-32 -44Q0 -52 32 -44L32 -39Q0 -32 -32 -39Z", { fill: inLuce("#7d6a50", luce) }) + path("M-26 -45Q0 -50 26 -45", { stroke: inLuce("#a8946e", luce), "stroke-width": 1.2, fill: "none" }));
  return s;
}

// ---------------------------------------------------------------- riflesso --
export interface OpzRiflesso {
  /** Il tempo (le onde scorrono). */
  t: number;
  /** Quanto si vede (l'acqua ferma rimanda di più). */
  opacita?: number;
  /** Quanto è mossa l'acqua (0 = specchio, 1 = increspata). */
  onde?: number;
  /**
   * Sfumato ai bordi (ep02, p.7: «come una cosa che l'acqua non ha ancora deciso»):
   * il centro del riflesso che resta (coordinate del disegno DIRITTO) e il raggio.
   */
  sfuma?: { c: P; r: number };
}

/**
 * Il riflesso di un disegno sull'acqua ferma a quota `q` (coordinate del disegno):
 * capovolto sotto la linea dell'acqua, un poco più scuro, increspato dalle onde.
 */
export function riflesso(defs: Defs, id: string, disegno: string, q: number, o: OpzRiflesso): string {
  if (!disegno) return "";
  const onde = clamp(o.onde ?? 0.3);
  const pid = defs.idPieno(`${id}-onde`);
  const scorre = (o.t * 18) % 400;
  const filtro = defs.add(
    `${id}-onde`,
    `<filter id="${pid}" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">` +
      `<feTurbulence type="fractalNoise" baseFrequency="0.004 0.09" numOctaves="2" seed="7" result="t"/>` +
      `<feOffset in="t" dx="${n(scorre)}" dy="0" result="o"/>` +
      `<feDisplacementMap in="SourceGraphic" in2="o" scale="${n(4 + onde * 22)}" xChannelSelector="R" yChannelSelector="G" result="d"/>` +
      `<feGaussianBlur in="d" stdDeviation="${n(0.6 + onde * 1.4)} ${n(1.2 + onde * 2)}"/>` +
      `</filter>`,
  );
  const clip = defs.clip(`${id}-sotto`, `M-100000 ${n(q)}H100000V${n(q + 100000)}H-100000Z`);
  let dentro = g({ transform: `translate(0 ${n(2 * q)})scale(1 -1)` }, disegno);
  if (o.sfuma) {
    // la maschera: piena al centro, niente ai bordi (il centro va capovolto anche lui)
    const c: P = [o.sfuma.c[0], 2 * q - o.sfuma.c[1]];
    const pidM = defs.idPieno(`${id}-sfuma`);
    const pidG = defs.idPieno(`${id}-sfuma-g`);
    defs.add(
      `${id}-sfuma`,
      `<radialGradient id="${pidG}" gradientUnits="userSpaceOnUse" cx="${n(c[0])}" cy="${n(c[1])}" r="${n(o.sfuma.r)}">` +
        `<stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="0.45" stop-color="#fff" stop-opacity="0.85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>` +
        `<mask id="${pidM}" maskUnits="userSpaceOnUse" x="-100000" y="-100000" width="200000" height="200000"><rect x="-100000" y="-100000" width="200000" height="200000" fill="url(#${pidG})"/></mask>`,
    );
    dentro = g({ mask: `url(#${pidM})` }, dentro);
  }
  return g({ "clip-path": clip }, g({ filter: filtro, opacity: String(Math.round((o.opacita ?? 0.55) * 1000) / 1000) }, dentro));
}
