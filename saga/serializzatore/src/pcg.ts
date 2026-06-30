// pcg.ts — strato di CONDIZIONAMENTO PCG sopra il serializzatore.
//
// Oggi `buildSeed.ts` è un MAPPATORE DI CAMPI: passa gli override DICHIARATI
// dell'episodio (entry/closure/register/attribute) e usa nonce = hash(id@graph_version).
// Lo snapshot del fold (sagaContext.ts) NON condiziona la generazione. Questo modulo
// aggiunge ciò che mancava — la parte che nel PoC avevamo provato e che vivevano solo
// nel `brief_pcg.py` non committato:
//
//   (1) NONCE DERIVATO DALLO STATO  (SPEC §8, forma piena): stessa puntata a stati di
//       viaggio diversi -> seed diverso; stesso stato -> deterministico.
//   (2) BANDE DI CRESCITA dallo snapshot -> INDIRIZZO FOCAL (la realizzazione segue
//       la crescita: "nasconde il corno" -> "spinge col corno").
//   (3) CONVERGENZA (il miglioramento): più fili aperti che ATTERRANO SULLO STESSO BEAT
//       di soglia, invece di sparsi — complessità che SERVE alla storia. Reso operativo
//       dalle fasi di risonanza ∿ del kernel AILA (ontologia/EAR_KERNEL).
//
// Tutto deterministico, zero LLM. Consuma lo snapshot che sagaContext.ts produce già.
// Si innesta con UNA riga in buildSeed (vedi `applyPcg`, in coda).

import type { Canon, EpisodeNode, EmittedSeed, SagaContext, SagaGraph } from "./types";

// hash 32-bit FNV-1a, ridichiarato qui per non creare un ciclo con buildSeed.ts.
function fnv1a32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// ============================================================================
// (1) BANDE DI CRESCITA — lette dallo snapshot del fold
// ============================================================================
// sagaContext somma SOLO i delta `threshold_crossed` -> il valore è il N. di
// attraversamenti accumulati su quell'asse. Modello a 3 bande:
//   prima       = 0 attraversamenti  (vergogna / fugge / piccola)
//   attraversa  = l'episodio CORRENTE dichiara l'attraversamento proprio qui
//   dopo        = >=1 attraversamento già accumulato (forza / guarda / misura)
// (combacia col Vol.1: Rocco attraversa al cap.4, "dopo" dal 5; Zara-sguardo al cap.6.)

export type Band = "prima" | "attraversa" | "dopo";

/** ids dei protagonisti dal canone (fallback ai due noti). */
function protagonistIds(canon: Canon): string[] {
  const p = (canon.config as any).protagonists;
  return Array.isArray(p) && p.length ? p.map((x: any) => x.id) : ["rocco", "zara"];
}

/** assi di crescita di un personaggio (saga_config.long_arcs.growth). */
function axesOf(who: string, canon: Canon): string[] {
  const g = (canon.config as any).long_arcs?.growth;
  return Array.isArray(g) ? g.filter((a: any) => a.who === who).map((a: any) => a.axis) : [];
}

function crossCount(ctx: SagaContext, who: string, axis: string): number {
  const raw = ctx.snapshot.protagonists?.[who]?.[axis]; // es. "+2(soglia)"
  const m = raw ? /([+-]?\d+)/.exec(raw) : null;
  return m ? Math.abs(Number(m[1])) : 0;
}

function crossingHere(ep: EpisodeNode, who: string, axis: string): boolean {
  return (ep.effects?.growth || []).some(
    (g: any) => g.who === who && g.axis === axis && g.threshold_crossed,
  );
}

export function bandOf(ctx: SagaContext, ep: EpisodeNode, who: string, axis: string): Band {
  if (crossingHere(ep, who, axis)) return "attraversa";
  return crossCount(ctx, who, axis) >= 1 ? "dopo" : "prima";
}

// ============================================================================
// (1b) INDIRIZZO FOCAL per banda — dal repertorio della BIBLE (canon), non hardcoded
// ============================================================================
// Il repertorio banda→verbi è QUALITATIVO: vive nella bible come blocco-macchina
// `repertorio_crescita` (canon.characters[who].repertorio_crescita), fratello di
// `voce_personaggio`. Qui lo si LEGGE soltanto: se un asse non ha repertorio, si salta.
// (Le chiavi-asse devono combaciare con gli `axis` del saga_graph — vedi nota in IMPL_NOTES.)

/** Indirizzo focal per il brief: per ogni asse con repertorio, la banda e un verbo-guida. */
export function focalDirections(ctx: SagaContext, ep: EpisodeNode, canon: Canon): string[] {
  const out: string[] = [];
  for (const who of protagonistIds(canon)) {
    const rep = canon.characters[who]?.repertorio_crescita;
    if (!rep) continue;
    for (const axis of axesOf(who, canon)) {
      const bands = rep[axis];
      if (!bands) continue;
      const b = bandOf(ctx, ep, who, axis);
      const pool = bands[b];
      if (pool && pool.length) out.push(`${who} · ${axis} = ${b} → es. «${pool[0]}»`);
    }
  }
  return out;
}

// ============================================================================
// (2) NONCE DERIVATO DALLO STATO  (SPEC §8, forma piena)
// ============================================================================
function journeyTotal(graph: SagaGraph): number {
  const orders = Object.values(graph.episodes || {}).map((e) => e.order_in_journey || 0);
  return Math.max(1, ...orders);
}

/** firma stabile dello stato a N: bande + relazione + cordone + quarto-di-viaggio + semi aperti. */
export function stateSignature(ep: EpisodeNode, ctx: SagaContext, graph: SagaGraph, canon: Canon): string {
  const bands = protagonistIds(canon).flatMap((who) =>
    axesOf(who, canon).map((axis) => `${who}:${axis}:${bandOf(ctx, ep, who, axis)}`),
  );
  const rel = Object.keys(ctx.snapshot.relations).length;         // n. relazioni a soglia
  const cord = ctx.snapshot.cordone.nodi_annodati.length;          // nodi del Cordone
  const q = Math.floor((ep.order_in_journey / journeyTotal(graph)) * 4); // quarto di viaggio
  const seeds = ctx.openSeeds.map((s) => s.id).sort().join(",");   // semi aperti
  return `${ep.id}|${bands.join("|")}|rel${rel}|cord${cord}|q${q}|${seeds}|${graph.graph_version || "0"}`;
}

/** Sostituto di deriveNonce: lo stato accumulato entra nel nonce. seed_nonce esplicito vince. */
export function deriveNonceFromState(ep: EpisodeNode, ctx: SagaContext, graph: SagaGraph, canon: Canon): number {
  if (typeof ep.seed_nonce === "number" && ep.seed_nonce > 0) return ep.seed_nonce >>> 0;
  const n = fnv1a32(stateSignature(ep, ctx, graph, canon)) >>> 0;
  return n === 0 ? 1 : n;
}

// ============================================================================
// (3) CONVERGENZA — il miglioramento (fasi di risonanza ∿ di AILA)
// ============================================================================
// "Complessità che SERVE alla storia" = più fili aperti che ATTERRANO sullo STESSO beat
// (il momento di soglia / il cardine), invece di sparsi. Nel kernel AILA la fase NODO (◇,
// dominante ⇄/connettere) è "compressione informativa massima, densità relazionale di
// picco": la convergenza È quella fase resa operativa. Consegniamo al prosatore i fili che
// si incontrano qui come UN solo momento, con la trasformazione di senso del seme (non solo
// "paga il seme X a pag. N": "il seme e l'attraversamento sono lo stesso gesto").

export type Phase = "gate" | "spiral" | "node" | "seed";

export interface ConvergenceNote {
  phase: Phase;        // fase ∿ dominante dell'episodio
  beat: string;        // dove atterrano: il threshold_moment
  threads: string[];   // i fili che convergono
  instruction: string; // la nota per il prosatore
}

export function convergence(ep: EpisodeNode, ctx: SagaContext, graph: SagaGraph, canon: Canon): ConvergenceNote | null {
  const threads: string[] = [];

  // (a) semi che FIORISCONO qui — col contenuto (seme SEMANTICO, non posizionale)
  const bloomed = Array.from(new Set([...(ep.seeds_bloomed || []), ...(ep.effects?.seeds_bloomed || [])]));
  for (const id of bloomed) {
    const s = graph.seeds?.[id];
    if (s?.what) threads.push(`il seme «${s.what}» (da ${s.planted ?? "?"}) fiorisce`);
  }
  // (b) attraversamenti di crescita dichiarati proprio qui
  for (const who of protagonistIds(canon)) {
    for (const axis of axesOf(who, canon)) {
      if (crossingHere(ep, who, axis)) threads.push(`${who} attraversa la soglia di «${axis}»`);
    }
  }
  // (c) nodo del Cordone annodato qui
  if (ep.nodo_cordone?.annodato_qui) {
    threads.push(`si annoda il nodo del Cordone (${ep.nodo_cordone.regno || ep.regno})`);
  }

  // meno di due fili: niente da far convergere
  if (threads.length < 2) return null;

  // fase ∿ dominante: cardine -> node; altrimenti dall'attributo EAR
  const phase: Phase =
    ep.type === "cardine" ? "node"
    : ep.attribute_dominant === "distinguere" ? "gate"
    : ep.attribute_dominant === "cambiare" ? "spiral"
    : "node";

  const instruction =
    `CONVERGENZA (fase ${phase}): questi ${threads.length} fili NON vanno sparsi nella puntata — ` +
    `atterrano nello STESSO momento, il punto di soglia («${ep.threshold_moment || "—"}»). ` +
    `Sono un'unica immagine, non scene separate: il seme che fiorisce e l'attraversamento sono lo ` +
    `stesso gesto. Lascia che il loro senso si trasformi insieme, senza spiegarlo.`;

  return { phase, beat: ep.threshold_moment || "", threads, instruction };
}

// ============================================================================
// APPLICAZIONE — una sola chiamata che buildSeed fa in coda
// ============================================================================
// Augmenta l'EmittedSeed: (2) nonce dallo stato + (1)+(3) addendum condizionato al
// narratorBrief (indirizzo focal dalle bande + nota di convergenza). Il PROSATORE legge
// il narratorBrief: è esattamente il punto in cui "spinge un tasto e riceve l'indirizzo".

export function applyPcg(
  seed: EmittedSeed,
  ep: EpisodeNode,
  ctx: SagaContext,
  graph: SagaGraph,
  canon: Canon,
): EmittedSeed {
  // (2) nonce dallo stato — sostituisce hash(id@graph_version)
  seed.nonce = deriveNonceFromState(ep, ctx, graph, canon);

  const lines: string[] = [];
  // (1) indirizzo focal dalle bande
  const fd = focalDirections(ctx, ep, canon);
  if (fd.length) {
    lines.push("Indirizzo focal (dallo stato del viaggio — la realizzazione segue la crescita):");
    for (const d of fd) lines.push(`- ${d}`);
  }
  // (3) convergenza
  const cv = convergence(ep, ctx, graph, canon);
  if (cv) {
    lines.push("");
    lines.push(cv.instruction);
  }
  if (lines.length) {
    seed.narratorBrief = (seed.narratorBrief ? seed.narratorBrief + "\n\n" : "") + lines.join("\n");
  }
  return seed;
}
