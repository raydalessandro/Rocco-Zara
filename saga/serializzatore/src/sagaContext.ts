// sagaContext.ts — §7 Lo STATO fra episodi (fold / snapshot).
//
// Stato a N = fold(effects₁ … effects_{N-1}): riduzione DETERMINISTICA. Entrano nello
// stato "duro" solo i delta con threshold_crossed:true (il resto è colore). Lo snapshot
// è piccolo e ricostruibile. Fonte: trama/continuita_e_anti_drift.md.

import type {
  EpisodeNode,
  OpenDebt,
  OpenSeed,
  SagaContext,
  SagaGraph,
  Snapshot,
} from "./types";

// ---------- util ----------

function episodesUpTo(graph: SagaGraph, nExclusive: number): EpisodeNode[] {
  return Object.values(graph.episodes || {})
    .filter((e) => typeof e.order_in_journey === "number" && e.order_in_journey < nExclusive)
    .sort((a, b) => a.order_in_journey - b.order_in_journey);
}

function episodeAtOrder(graph: SagaGraph, n: number): EpisodeNode | undefined {
  return Object.values(graph.episodes || {}).find((e) => e.order_in_journey === n);
}

function relKey(between: string[]): string {
  return [...between].map((s) => s.trim()).sort().join("|");
}

function parseDelta(d: string): number | null {
  const m = /^([+-]?\d+)/.exec((d || "").trim());
  return m ? Number(m[1]) : null;
}

function fmtSigned(n: number): string {
  return (n > 0 ? "+" : "") + String(n);
}

/** Rotta inferita dal grafo: regni in ordine di prima comparsa (min order_in_journey). */
export function inferRotta(graph: SagaGraph): string[] {
  const firstSeen: Record<string, number> = {};
  for (const e of Object.values(graph.episodes || {})) {
    if (!e.regno) continue;
    if (!(e.regno in firstSeen) || e.order_in_journey < firstSeen[e.regno]) {
      firstSeen[e.regno] = e.order_in_journey;
    }
  }
  return Object.keys(firstSeen).sort((a, b) => firstSeen[a] - firstSeen[b]);
}

// ---------- fold ----------

export function buildSagaContext(graph: SagaGraph, n: number): SagaContext {
  const prior = episodesUpTo(graph, n);
  const target = episodeAtOrder(graph, n) ?? prior[prior.length - 1];
  const atEpisode = target?.id ?? `@order_${n}`;
  const arc = target?.arc ?? "";

  // --- protagonisti: somma dei soli delta threshold_crossed ---
  const protagonists: Record<string, Record<string, number>> = {};
  const fears: Record<string, Record<string, string>> = {};
  const relations: Record<string, string> = {};
  const world: Record<string, string> = {};

  for (const e of prior) {
    const fx = e.effects || {};
    for (const g of fx.growth || []) {
      if (!g.threshold_crossed) continue;
      const v = parseDelta(g.delta);
      if (v == null) continue;
      (protagonists[g.who] ||= {});
      protagonists[g.who][g.axis] = (protagonists[g.who][g.axis] || 0) + v;
    }
    for (const f of fx.fear || []) {
      (fears[f.who] ||= {});
      fears[f.who][f.fear] = f.status || "implicita";
    }
    for (const r of fx.relation || []) {
      if (!r.threshold_crossed) continue;
      relations[relKey(r.between)] = r.delta;
    }
    for (const w of fx.world || []) {
      if (!w.threshold_crossed) continue;
      world[w.place] = w.change;
    }
  }

  // formatta i protagonisti come "+3(soglia)"
  const protagonistsOut: Snapshot["protagonists"] = {};
  for (const who of Object.keys(protagonists)) {
    protagonistsOut[who] = {};
    for (const axis of Object.keys(protagonists[who])) {
      protagonistsOut[who][axis] = `${fmtSigned(protagonists[who][axis])}(soglia)`;
    }
  }

  // --- semi/debiti aperti ---
  const plantedAt: Record<string, string> = {}; // seedId -> episodeId
  const bloomed = new Set<string>();
  const openedAt: Record<string, string> = {}; // debtId -> episodeId
  const closed = new Set<string>();
  const creatureCount: Record<string, number> = {};

  for (const e of prior) {
    for (const s of e.seeds_planted || []) if (!(s in plantedAt)) plantedAt[s] = e.id;
    for (const s of e.effects?.seeds_planted || []) if (!(s in plantedAt)) plantedAt[s] = e.id;
    for (const s of e.seeds_bloomed || []) bloomed.add(s);
    for (const s of e.effects?.seeds_bloomed || []) bloomed.add(s);
    for (const d of e.debts_opened || []) if (!(d in openedAt)) openedAt[d] = e.id;
    for (const d of e.effects?.debts_opened || []) if (!(d in openedAt)) openedAt[d] = e.id;
    for (const d of e.debts_closed || []) closed.add(d);
    for (const d of e.effects?.debts_closed || []) closed.add(d);
    if (e.episode_creature?.id) {
      creatureCount[e.episode_creature.id] = (creatureCount[e.episode_creature.id] || 0) + 1;
    }
  }

  const openSeeds: OpenSeed[] = Object.keys(plantedAt)
    .filter((id) => !bloomed.has(id))
    .map((id) => ({
      id,
      planted: plantedAt[id],
      bloom_target: graph.seeds?.[id]?.bloom_target,
      what: graph.seeds?.[id]?.what ?? "",
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const openDebts: OpenDebt[] = Object.keys(openedAt)
    .filter((id) => !closed.has(id))
    .map((id) => ({
      id,
      opened: openedAt[id],
      window: graph.debts?.[id]?.window,
      what: graph.debts?.[id]?.what ?? "",
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const recurring_creatures = Object.keys(creatureCount)
    .map((id) => ({ id, returns: creatureCount[id] }))
    .filter((c) => c.returns >= 1)
    .sort((a, b) => a.id.localeCompare(b.id));

  // --- cordone (inferito dal grafo) ---
  const annodati: string[] = [];
  for (const e of prior) {
    if (e.nodo_cordone?.annodato_qui) {
      const regno = e.nodo_cordone.regno || e.regno;
      if (regno && !annodati.includes(regno)) annodati.push(regno);
    }
  }
  const rotta = inferRotta(graph);
  const prossimo = rotta.find((r) => !annodati.includes(r));
  const cordone = { nodi_annodati: annodati, prossimo };

  const snapshot: Snapshot = {
    at_episode: atEpisode,
    arc,
    protagonists: protagonistsOut,
    fears,
    relations,
    world,
    open_seeds: openSeeds,
    open_debts: openDebts,
    recurring_creatures,
    cordone,
  };

  return {
    atEpisode,
    n,
    snapshot,
    openSeeds,
    openDebts,
    fixedCanon: { arc, cordone },
  };
}
