// serializzatore.pcg.test.ts — strato PCG di condizionamento (saga/serializzatore/src/pcg.ts).
//
// Verifica le proprietà provate nel PoC, ora nel motore:
//   (1) NONCE DETERMINISTICO dallo stato  — stesso stato → stesso nonce
//   (2) SENSIBILITÀ allo stato             — stato diverso → nonce diverso
//   (3) CONVERGENZA                        — ≥2 fili sul beat di soglia → nota (fase 'node' su cardine)
//   (4) BANDE                              — attraversamento dichiarato qui → 'attraversa'; accumulato → 'dopo'
//
// Hermetic: legge la fixture via fs (niente resolveJsonModule), canone minimo (solo i campi
// che pcg legge), import relativi (niente dipendenza dall'alias).

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { buildSagaContext } from "../saga/serializzatore/src/sagaContext";
import { deriveNonceFromState, convergence, bandOf } from "../saga/serializzatore/src/pcg";
import type { Canon, SagaContext, SagaGraph } from "../saga/serializzatore/src/types";

const graph = JSON.parse(
  readFileSync(
    new URL("../saga/serializzatore/fixtures/saga_graph.demo.json", import.meta.url),
    "utf8",
  ),
) as SagaGraph;

// canone minimo: pcg legge solo protagonisti + assi di crescita.
const canon = {
  config: {
    protagonists: [{ id: "rocco" }, { id: "zara" }],
    long_arcs: {
      growth: [
        { who: "rocco", axis: "vergogna_del_corno" },
        { who: "zara", axis: "guardare_invece_di_fuggire" },
      ],
    },
  },
  characters: {},
} as unknown as Canon;

const ep = graph.episodes["ep_demo"]; // cardine, order_in_journey = 2
const ctx: SagaContext = buildSagaContext(graph, ep.order_in_journey);

/** clona il contesto e vi inietta un attraversamento accumulato su Rocco. */
function ctxWithRoccoCrossed(): SagaContext {
  const c = JSON.parse(JSON.stringify(ctx)) as SagaContext;
  c.snapshot.protagonists.rocco = { vergogna_del_corno: "+1(soglia)" };
  return c;
}

describe("pcg — condizionamento dallo stato", () => {
  it("(1) nonce deterministico: stesso stato → stesso nonce", () => {
    const a = deriveNonceFromState(ep, ctx, graph, canon);
    const b = deriveNonceFromState(ep, ctx, graph, canon);
    expect(a).toBe(b);
    expect(a).toBeGreaterThan(0);
  });

  it("(2) sensibilità allo stato: stato diverso → nonce diverso", () => {
    const base = deriveNonceFromState(ep, ctx, graph, canon);
    const moved = deriveNonceFromState(ep, ctxWithRoccoCrossed(), graph, canon);
    expect(moved).not.toBe(base);
  });

  it("(3) convergenza: ≥2 fili sul beat di soglia → nota, fase 'node' (cardine)", () => {
    const cv = convergence(ep, ctx, graph, canon);
    expect(cv).not.toBeNull();
    expect(cv!.threads.length).toBeGreaterThanOrEqual(2);
    expect(cv!.phase).toBe("node");
    expect(cv!.beat).toBe(ep.threshold_moment);
  });

  it("(4) bande: attraversamento dichiarato qui → 'attraversa'; accumulato → 'dopo'", () => {
    // ep_demo dichiara l'attraversamento di Zara (effects.growth, threshold_crossed:true)
    expect(bandOf(ctx, ep, "zara", "guardare_invece_di_fuggire")).toBe("attraversa");
    // Rocco non attraversa qui, ma ha un attraversamento accumulato → 'dopo'
    expect(bandOf(ctxWithRoccoCrossed(), ep, "rocco", "vergogna_del_corno")).toBe("dopo");
    // senza accumulo e senza attraversamento qui → 'prima'
    expect(bandOf(ctx, ep, "rocco", "vergogna_del_corno")).toBe("prima");
  });
});
