// index.ts — entry del serializzatore + componenti §9.4 (applyEffects/recapArc).
//
// serializeEpisode(episodeId) → SeedExt è il ponte completo: canone-lore + grafo +
// stato a N → un SeedExt che il motore Scrivia rende. Qui si re-esportano anche i 4
// componenti §9 e si implementano applyEffects/recapArc (aggiornamento di stato).

import type { EmittedSeed, ArcRecap, SagaGraph } from "./types";
import type { EntityRefRecord } from "../../../lib/types";
import { buildSagaContext } from "./sagaContext";
import { buildSeed, episodeEntityNeeds } from "./buildSeed";
import { auditContinuity } from "./audit";
import { buildStoryEntities } from "./entities";
import { loadCanon, loadGraph } from "./canon";
import type { Canon } from "./types";

// re-export dei contratti §9 e degli helper utili ai test/chat-test
export { buildSagaContext } from "./sagaContext";
export { buildSeed, episodeEntityNeeds, deriveNonce, fnv1a32, resolvePov } from "./buildSeed";
export { auditContinuity } from "./audit";
export { loadCanon, loadGraph, loadCharacters, loadRitornelli, slug } from "./canon";
export { resolveCharacterVoice, synthTier1, lookupGroupVoice } from "./voices";
export { buildStoryEntities, characterEntityId, locationEntityId } from "./entities";
export type * from "./types";

function deepClone<T>(o: T): T {
  return JSON.parse(JSON.stringify(o)) as T;
}

/** §9.4 — applica gli effects dell'episodio allo stato del grafo.
 *  Aggiorna i registri (debiti chiusi, semi fioriti) e scrive lo snapshot cumulativo
 *  fino a QUESTO episodio in world_state_baselines["_running"]. Ritorna un grafo nuovo. */
export function applyEffects(graph: SagaGraph, episodeId: string): SagaGraph {
  const g = deepClone(graph);
  const ep = g.episodes?.[episodeId];
  if (!ep) throw new Error(`applyEffects: episodio '${episodeId}' assente.`);

  // debiti chiusi qui → marca closed nel registro
  for (const id of [...(ep.debts_closed || []), ...(ep.effects?.debts_closed || [])]) {
    if (g.debts?.[id]) g.debts[id].closed = episodeId;
  }
  // semi fioriti qui → marca bloom (campo additivo, forward-compat)
  for (const id of [...(ep.seeds_bloomed || []), ...(ep.effects?.seeds_bloomed || [])]) {
    if (g.seeds?.[id]) g.seeds[id].bloomed_at = episodeId;
  }
  // snapshot cumulativo INCLUSO questo episodio
  const ctxIncl = buildSagaContext(g, ep.order_in_journey + 1);
  g.world_state_baselines = g.world_state_baselines || {};
  g.world_state_baselines["_running"] = ctxIncl.snapshot;
  return g;
}

/** §9.4 / §7 — recap d'arco: fold dei delta dell'arco → baseline canonica nuova. */
export function recapArc(graph: SagaGraph, arcId: string): { recap: ArcRecap; graph: SagaGraph } {
  const g = deepClone(graph);
  const arcEps = Object.values(g.episodes || {}).filter((e) => e.arc === arcId);
  if (!arcEps.length) {
    const recap: ArcRecap = {
      arc: arcId,
      at: "",
      baseline: buildSagaContext(g, 0).snapshot,
    };
    return { recap, graph: g };
  }
  const lastOrder = Math.max(...arcEps.map((e) => e.order_in_journey));
  const last = arcEps.find((e) => e.order_in_journey === lastOrder)!;
  const baseline = buildSagaContext(g, lastOrder + 1).snapshot;
  const recap: ArcRecap = { arc: arcId, at: last.id, baseline };
  g.world_state_baselines = g.world_state_baselines || {};
  g.world_state_baselines[arcId] = recap;
  return { recap, graph: g };
}

// ---------- entry ----------

export interface SerializeOpts {
  graph?: SagaGraph;
  canon?: Canon;
  /** radice repo (per caricare canone+grafo se non passati). default: process.cwd(). */
  root?: string;
  /** path del grafo (se non si passa `graph`). default: saga/trama/saga_graph.json */
  graphPath?: string;
}

function resolveInputs(opts: SerializeOpts): { graph: SagaGraph; canon: Canon } {
  const root = opts.root || process.cwd();
  const graph =
    opts.graph || loadGraph(opts.graphPath || `${root}/saga/trama/saga_graph.json`);
  const canon = opts.canon || loadCanon(root);
  return { graph, canon };
}

/** Il ponte completo: episodio → SeedExt (fully-populated). */
export function serializeEpisode(episodeId: string, opts: SerializeOpts = {}): EmittedSeed {
  const { graph, canon } = resolveInputs(opts);
  const ep = graph.episodes?.[episodeId];
  if (!ep) throw new Error(`serializeEpisode: episodio '${episodeId}' assente dal grafo.`);
  const ctx = buildSagaContext(graph, ep.order_in_journey);
  return buildSeed(episodeId, graph, ctx, canon);
}

/** Variante "completa": SeedExt + story.entities pre-popolate + verdetto d'audit. */
export function serializeEpisodeFull(
  episodeId: string,
  opts: SerializeOpts = {},
): { seed: EmittedSeed; entities: EntityRefRecord[]; audit: ReturnType<typeof auditContinuity> } {
  const { graph, canon } = resolveInputs(opts);
  const ep = graph.episodes?.[episodeId];
  if (!ep) throw new Error(`serializeEpisodeFull: episodio '${episodeId}' assente.`);
  const ctx = buildSagaContext(graph, ep.order_in_journey);
  const seed = buildSeed(episodeId, graph, ctx, canon);
  const entities = buildStoryEntities(canon.entities, episodeEntityNeeds(seed));
  const audit = auditContinuity(episodeId, graph, ctx);
  return { seed, entities, audit };
}
