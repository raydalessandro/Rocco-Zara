// cartoni/scene/palcoscenico.ts — un luogo pronto per la regia.
//
// Ogni copione ripeteva gli stessi attrezzi: "dammi il palco a questo tempo
// con questa luce e questi attori", "metti Rocco qui, girato di là", "un velo
// di canne davanti". Il palcoscenico li lega a un luogo una volta sola:
//
//   const { scena, R, Z, quota } = palcoscenico(SOGLIA);
//   disegna: (t, defs) => ({ cam, livelli: scena(t, defs, { cam, luce, attori: Z(275, posa, 1, luce, defs) }) })
//
// Così un'inquadratura nuova si scrive in poche righe: camera, luce, posa.

import { type PosaRocco, rocco } from "../cast/rocco";
import { type PosaZara, zara } from "../cast/zara";
import type { Luce } from "../motore/colore";
import type { Camera, Livello } from "../motore/fotogramma";
import type { Defs } from "../motore/svg";
import type { Luogo, Piena } from "./luogo";
import { METEO_SERENO, type Meteo } from "./meteo";
import { palco } from "./palco";
import { canneto } from "./pittura";
import { type OpzSulPalco, sulPalco } from "./regia";

/** Quel che un'inquadratura chiede al palco. */
export interface OpzScena {
  cam: Camera;
  luce: Luce;
  /**
   * Il tempo del MONDO (vento, acqua, pioggia, nuvole): di norma il tempo vero
   * dell'inquadratura (`scena.t` di InScena), così quando la storia rallenta
   * per aspettare una voce il vento non va al rallentatore. Senza: il tempo della storia.
   */
  mondo?: number;
  /** Il tempo che fa (si parte dal sereno e si cambia solo quel che serve). */
  meteo?: Partial<Meteo>;
  attori?: string;
  /** Attori davanti all'erba del crinale (es. un velo di canne). */
  davanti?: string;
  /** L'erba di primo piano (p>1). */
  primo?: boolean;
  extra?: Livello[];
  extraDietro?: Livello[];
  /** Vapore di tepore sulla pietra (0..1). */
  vapore?: number;
  /** Acqua nelle coppelle. */
  coppelle?: boolean;
  /** Dove non piove (coordinate del palco). */
  riparo?: { x0: number; x1: number; y0: number };
  /** Il sole in un punto preciso dello schermo (frazioni 0..1). */
  soleA?: readonly [number, number];
  /**
   * La luna (di notte): dove sta a schermo, quanto è grande e — se l'acqua la
   * rimanda, «vera due volte» — a che altezza dello schermo sta il suo riflesso.
   */
  luna?: { a: readonly [number, number]; r?: number; riflesso?: number };
  /** Le mandrie lontane (dove il luogo ne ha; default sì). */
  mandrie?: boolean;
  /** Sotto il telo della barca ormeggiata (dove il luogo ne ha una): un colpetto, un respiro. */
  telo?: { colpo?: number; respiro?: number };
  /** La piena (ep04): l'acqua vicina più alta, davanti a tutti (e la schiuma del luogo). */
  piena?: Piena;
}

export interface Palcoscenico {
  luogo: Luogo;
  quota: (x: number) => number;
  /** I livelli del palco al tempo t. */
  scena(t: number, defs: Defs, o: OpzScena): Livello[];
  /** Un disegno qualunque appoggiato al suolo in x. */
  sulPalco(x: number, disegno: string, o?: OpzSulPalco): string;
  /** Rocco sul palco. */
  R(x: number, posa: PosaRocco, verso: 1 | -1, luce: Luce, defs: Defs, id?: string, scala?: number): string;
  /** Zara sul palco. */
  Z(x: number, posa: PosaZara, verso: 1 | -1, luce: Luce, defs: Defs, id?: string, scala?: number): string;
  /** Un velo di canne davanti agli attori, tra x0 e x1 (dove il luogo ha un canneto). */
  canneDavanti(t: number, luce: Luce, defs: Defs, cam: Camera, x0: number, x1: number): string;
}

export function palcoscenico(luogo: Luogo): Palcoscenico {
  return {
    luogo,
    quota: luogo.quota,
    scena: (t, defs, o) =>
      palco({
        luogo,
        cam: o.cam,
        t: o.mondo ?? t,
        luce: o.luce,
        meteo: { ...METEO_SERENO, ...o.meteo },
        defs,
        attori: o.attori,
        attoriDavanti: o.davanti,
        primoPiano: o.primo,
        extra: o.extra,
        extraDietro: o.extraDietro,
        vaporePietra: o.vapore,
        coppellePiene: o.coppelle,
        riparo: o.riparo,
        soleA: o.soleA,
        luna: o.luna,
        telo: o.telo,
        piena: o.piena,
        mandrie: o.mandrie ?? true,
      }),
    sulPalco: (x, disegno, o) => sulPalco(luogo, x, disegno, o),
    R: (x, posa, verso, luce, defs, id = "rocco", scala = 1) => sulPalco(luogo, x, rocco(posa, { defs, luce, id, verso }), { verso, scala }),
    Z: (x, posa, verso, luce, defs, id = "zara", scala = 1) => sulPalco(luogo, x, zara(posa, { defs, luce, id, verso }), { verso, scala }),
    canneDavanti: (t, luce, defs, cam, x0, x1) => canneto({ luogo, cam, t, luce, meteo: METEO_SERENO, defs }, { x0, x1 }, true),
  };
}
