// cartoni/motore/serie.ts — la serie: gli episodi, a quattro a quattro, in puntate.
//
// La visione (Ray, 26/9/2026): tutta la stagione a cartoni, da guardare di fila
// come un film lungo fatto di episodi. Un episodio animato per ogni episodio di
// prosa (24), di circa 5 minuti; montati a quattro a quattro in 6 puntate di circa
// 20 minuti: una puntata per volume, cioè una macrostoria, un regno.
//
// La serie non si scrive a mano: si ricava dal grafo della saga
// (saga/trama/saga_graph.json: ogni episodio ha il suo arco, ogni arco il suo
// volume) e dai titoli dei volumi (saga/trama/volumi/README.md). Se la saga cambia
// (un volume fuso a tre capitoli, un episodio spostato), la serie la segue.
// Il montaggio vero delle puntate è render/monta.ts.

/** Quel che serve del grafo della saga. */
export interface GrafoSerie {
  arcs: Readonly<Record<string, { volume: number }>>;
  episodes: Readonly<Record<string, { arc: string }>>;
}

export interface Puntata {
  /** Il numero della puntata, che è quello del volume. */
  numero: number;
  /** Il titolo del volume (es. «i Laghi del Vespro»). */
  titolo: string;
  /** Gli episodi, in ordine. */
  episodi: string[];
}

/**
 * Quanto dura un episodio, con le voci (secondi): si mira a ~5′; sotto i 3′ o sopra
 * i 7′ la puntata non sta più nei suoi ~20′ (il test degli episodi lo controlla).
 */
export const DURATA_EPISODIO = { mira: 300, min: 180, max: 420 } as const;

/** I titoli dei volumi, dalla tabella dell'indice: `| 1 | [i Laghi del Vespro](VOLUME_1.md) | …`. */
export function titoliVolumi(indice: string): Record<number, string> {
  const out: Record<number, string> = {};
  for (const m of indice.matchAll(/^\|\s*(\d+)\s*\|\s*\[([^\]]+)\]\(VOLUME_\d+\.md\)/gm)) out[Number(m[1])] = m[2].trim();
  return out;
}

/** Le puntate della serie: gli episodi raggruppati per volume, in ordine. */
export function puntate(grafo: GrafoSerie, titoli: Readonly<Record<number, string>>): Puntata[] {
  const per = new Map<number, string[]>();
  for (const [id, e] of Object.entries(grafo.episodes)) {
    const arco = grafo.arcs[e.arc];
    if (!arco) throw new Error(`${id}: l'arco «${e.arc}» non c'è nel grafo`);
    per.set(arco.volume, [...(per.get(arco.volume) ?? []), id]);
  }
  return [...per.keys()]
    .sort((a, b) => a - b)
    .map((numero) => {
      const titolo = titoli[numero];
      if (!titolo) throw new Error(`volume ${numero}: manca il titolo nell'indice dei volumi`);
      return { numero, titolo, episodi: per.get(numero)!.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)) };
    });
}

/** La puntata in cui sta un episodio (undefined se non è nella serie). */
export const puntataDi = (serie: readonly Puntata[], id: string): Puntata | undefined => serie.find((p) => p.episodi.includes(id));

/** Il titolo di un episodio, dall'intestazione della sua prosa (`# ep02 — Il regno senza riflesso`). */
export function titoloDallaProsa(prosa: string): string | undefined {
  return /^#\s+ep\d+\s+[—–-]\s+(.+?)\s*$/m.exec(prosa)?.[1];
}
