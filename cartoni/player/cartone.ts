// cartoni/player/cartone.ts — il cartone come funzione, per il browser.
//
// Questo è il cuore del pacchetto che esbuild impacchetta (gira.mjs gli mette
// davanti il copione scelto con --episodio): la stessa funzione pura `svg(t)`
// serve il player dal vivo (sala di regia, anteprime) e il render in video
// (gira.mjs la chiama fotogramma per fotogramma in Chrome headless).
// Stesso copione, stesso tempo → stesso fotogramma, byte per byte.

import { VOCI } from "../cast/voci";
import { inSvg } from "../motore/fotogramma";
import { type Episodio, durata, fotogramma, scaletta } from "../motore/montaggio";
import { type EpisodioConVoce, type Narrazione, conVoce } from "../motore/voce";

/**
 * L'episodio come si gira: il grammelot dei personaggi sempre (i tempi e le
 * bocche vengono dalle battute), la narratrice se ci sono le sue riprese.
 * Video (gira.mjs) e audio (suona.ts) passano di qui: stessi tempi, al campione.
 */
export function conLeVoci(ep: Episodio, narrazione?: Narrazione | null): EpisodioConVoce {
  return conVoce(ep, { voci: VOCI, narrazione });
}

export interface Cartone {
  id: string;
  titolo: string;
  durata: number;
  scaletta: { id: string; titolo: string; pagina: number; inizio: number; fine: number }[];
  svg: (t: number, larghezza?: number) => string;
}

/** Prepara il cartone di un episodio (già con le voci, se le ha). */
export function cartone(ep: Episodio): Cartone {
  const sc = scaletta(ep);
  return {
    id: ep.id,
    titolo: ep.titolo,
    durata: durata(ep),
    scaletta: sc.map((p) => ({ id: p.q.id, titolo: p.q.titolo, pagina: p.q.pagina, inizio: p.inizio, fine: p.fine })),
    svg: (t: number, larghezza = 1920): string => inSvg(fotogramma(ep, t, sc), larghezza),
  };
}

/** Lo espone come `globalThis.CARTONE` (quello che il render chiama). */
export function registra(ep: Episodio): Cartone {
  const c = cartone(ep);
  (globalThis as unknown as { CARTONE: Cartone }).CARTONE = c;
  return c;
}
