// cartoni/scene/luogo.ts — che cos'è un luogo per il motore.
//
// Un luogo è un palco in sezione: un PROFILO del suolo (dove camminano i
// personaggi), un'eventuale ACQUA al piede, una tavolozza, i parametri della
// vegetazione, e due funzioni sue: gli SFONDI (i livelli lontani, composti coi
// pennelli del kit) e gli OGGETTI (rocce, rami, la pietra coi segni…, messi
// dove la prosa li vuole). Tutto il resto — cielo, nuvole, temporale, terreno,
// erba, acqua vicina, pioggia — lo dipinge il motore, uguale per ogni luogo.
//
// Un nuovo episodio in un altro regno = un nuovo file in cartoni/luoghi/.

import type { Luce } from "../motore/colore";
import type { Camera, Livello } from "../motore/fotogramma";
import type { Defs, P } from "../motore/svg";
import type { Meteo } from "./meteo";

/** La tavolozza di un luogo (le chiavi sono quelle che il kit sa usare). */
export interface Colori {
  cieloAlto: string;
  cieloOrizzonte: string;
  monteLontano: string;
  monteMedio: string;
  neve: string;
  lago: string;
  lagoChiaro: string;
  canna: string;
  cannaScura: string;
  erba: string;
  erbaScura: string;
  erbaChiara: string;
  /** l'erba del lato destro (a Spondalta: l'Aperto, dorato) */
  erbaAperto: string;
  erbaApertoScura: string;
  terra: string;
  roccia: string;
  rocciaScura: string;
  lichene: string;
  muschio: string;
  bosco: string;
  boscoScuro: string;
}

export interface DatiLuogo {
  id: string;
  /** Il nome nel mondo (lessico delle Terre Annodate). */
  nome: string;
  /** Il profilo del suolo a p=1: (x, quota), y verso il basso. */
  profilo: readonly P[];
  /** Acqua a sinistra della riva, al livello `quota`. */
  acqua?: { quota: number; riva: number };
  colori: Colori;
  /** Il suolo sfuma dal colore di sinistra a quello di destra fra `da` e `a`. */
  suolo: { da: number; a: number };
  /** Erba del crinale: a sinistra del confine più alta, a destra più bassa. */
  erba: { confine: number; sinistra: readonly [number, number]; destra: readonly [number, number] };
  /** Cespugli e alberelli sui due versanti. */
  cespugli: {
    quanti: number;
    /** probabilità che un cespuglio stia a sinistra */
    sinistraProb: number;
    sinistra: readonly [number, number];
    destra: readonly [number, number];
    /** profondità sotto il crinale (verso chi guarda) */
    sotto: readonly [number, number];
  };
  /** Il canneto (tra due ascisse), se c'è. */
  canneto?: readonly [number, number];
}

export interface Luogo extends DatiLuogo {
  /** Quota del suolo all'ascissa x (p=1). */
  quota(x: number): number;
  /** Pendenza del suolo (per inclinare chi ci sta sopra). */
  pendenza(x: number): number;
  /** I livelli lontani, dietro il temporale (monti…). */
  lontanissimo(o: OpzPalco): Livello[];
  /** I livelli lontani davanti al temporale (acqua, pianura, bosco…). */
  lontano(o: OpzPalco): Livello[];
  /** Gli oggetti del luogo sul piano del suolo (solo quelli in vista). */
  oggetti(o: OpzPalco, inVista: (x: number, margine?: number) => boolean): string;
  /**
   * Le cose del luogo che stanno DAVANTI a chi è in scena (una barca ormeggiata
   * contro il molo su cui si cammina): dove un luogo non ne ha, niente.
   */
  davanti?(o: OpzPalco, inVista: (x: number, margine?: number) => boolean): string;
  /**
   * Nella piena (ep04): quel che il luogo mette SOPRA l'acqua alta — la schiuma
   * attorno ai massi e ai pali, l'acqua che si rompe contro chi le sta davanti.
   * Si disegna dopo la piena, solo quando c'è.
   */
  sullaPiena?(o: OpzPalco, inVista: (x: number, margine?: number) => boolean): string;
}

/**
 * La piena (ep04, «la piena di fine stagione»): di quanto l'acqua vicina è salita
 * sopra il suo livello. `laguna`, dove il luogo ha un'acqua chiusa davanti a una riva
 * (le rive basse), è quella che sale dalle tane; `livello` quella del lago aperto,
 * dietro. La `corrente` (−1..1) dice da che parte scorre l'acqua alta e quanto forte;
 * `varco` (0..1) se il varco delle rive basse è aperto (0) o chiuso da qualcuno (1);
 * `crollo` (0..1) una tana che cede un angolo.
 */
export interface Piena {
  livello: number;
  laguna?: number;
  corrente?: number;
  varco?: number;
  crollo?: number;
}

/** Le opzioni di un palco a un tempo t: chi lo guarda, con che luce e che tempo. */
export interface OpzPalco {
  luogo: Luogo;
  cam: Camera;
  t: number;
  luce: Luce;
  meteo: Meteo;
  defs: Defs;
  /** Personaggi e oggetti del piano p=1, già in coordinate del palco. */
  attori?: string;
  /** Attori davanti all'erba del crinale (raro: il canneto davanti, i giunchi). */
  attoriDavanti?: string;
  /** Livelli extra forniti dall'inquadratura, davanti al suolo. */
  extra?: Livello[];
  /** Livelli extra DIETRO il suolo (es. lo stormo che si alza lontano). */
  extraDietro?: Livello[];
  /** Il riparo dalla pioggia (coordinate del palco): dentro non piove. */
  riparo?: { x0: number; x1: number; y0: number };
  /** Posizione del sole a schermo (frazioni 0..1), se l'inquadratura lo vuole lì. */
  soleA?: readonly [number, number];
  /**
   * La luna, di notte: dove sta a schermo (frazioni 0..1) e quanto è grande (raggio
   * in pixel). I luoghi d'acqua ne disegnano anche la scia sul lago e, se c'è
   * `riflesso` (l'altezza a schermo, 0..1), il disco rimandato dall'acqua («vera due volte»).
   */
  luna?: { a: readonly [number, number]; r?: number; riflesso?: number };
  /** Disegna l'erba di primo piano (p>1). */
  primoPiano?: boolean;
  /** Mostra le mandrie lontane (dove il luogo ne ha). */
  mandrie?: boolean;
  /** Vapore di tepore sulla pietra (alba fredda). */
  vaporePietra?: number;
  /** Acqua nelle coppelle (dopo la pioggia). */
  coppellePiene?: boolean;
  /** Sotto il telo della barca ormeggiata (ep03): un colpetto da dentro (0..1), un respiro (−1..1). */
  telo?: { colpo?: number; respiro?: number };
  /** La piena (ep04): l'acqua vicina più alta, davanti a tutto il piano dei personaggi. */
  piena?: Piena;
}

/** Quota da un profilo: Hermite con tangenti alla Catmull-Rom (x non uniformi). */
export function quotaDaProfilo(P: readonly P[], x: number): number {
  if (x <= P[0][0]) return P[0][1];
  if (x >= P[P.length - 1][0]) return P[P.length - 1][1];
  let i = 0;
  while (x > P[i + 1][0]) i++;
  const p0 = P[Math.max(0, i - 1)];
  const p1 = P[i];
  const p2 = P[i + 1];
  const p3 = P[Math.min(P.length - 1, i + 2)];
  const u = (x - p1[0]) / (p2[0] - p1[0]);
  const m1 = (p2[1] - p0[1]) / (p2[0] - p0[0]);
  const m2 = (p3[1] - p1[1]) / (p3[0] - p1[0]);
  const h = p2[0] - p1[0];
  const u2 = u * u;
  const u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * p1[1] + (u3 - 2 * u2 + u) * h * m1 + (-2 * u3 + 3 * u2) * p2[1] + (u3 - u2) * h * m2;
}

/** Costruisce un luogo dai suoi dati e dalle sue due funzioni di pittura. */
export function creaLuogo(
  dati: DatiLuogo,
  pittura: Pick<Luogo, "lontanissimo" | "lontano" | "oggetti" | "davanti" | "sullaPiena">,
): Luogo {
  const quota = (x: number) => quotaDaProfilo(dati.profilo, x);
  return {
    ...dati,
    ...pittura,
    quota,
    pendenza: (x: number) => (quota(x + 4) - quota(x - 4)) / 8,
  };
}
