// serializzatore.pcg.consistency.test.ts — guardie sul CONDIZIONAMENTO PCG.
//
// Nasce da un baco reale trovato in review: il `repertorio_crescita` (bible) e gli
// `effects.growth` (fixture) usavano axis-id DIVERSI da `saga_config.long_arcs.growth`.
// La chiave-asse è il JOIN: se non combacia, `focalDirections` SALTA in silenzio e la
// feature di punta non produce nulla — senza che nessun test rosseggi (l'esperimento
// usava id sintetici auto-coerenti). Questi test usano il CANONE VERO e l'avrebbero preso.
//
//   (A) GUARDIA DI COERENZA  — gli axis-id combaciano fra config / bible / fixture
//   (B) E2E                  — sul pipeline vero l'indirizzo focal si ACCENDE
//   (C) CONVERGENZA NULLA    — sotto i 2 fili niente nota (no convergenze spurie)

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { serializeEpisode, loadCanon, loadGraph } from "../saga/serializzatore/src/index";
import { convergence } from "../saga/serializzatore/src/pcg";
import { buildSagaContext } from "../saga/serializzatore/src/sagaContext";
import type { Canon, EpisodeNode, SagaContext, SagaGraph } from "../saga/serializzatore/src/types";

const ROOT = process.cwd();
const FIX = join(ROOT, "saga/serializzatore/fixtures/saga_graph.demo.json");
const graph = loadGraph(FIX);
const canon = loadCanon(ROOT);

type GrowthDef = { who: string; axis: string };
const growth: GrowthDef[] =
  ((canon.config as Record<string, unknown>).long_arcs as { growth?: GrowthDef[] } | undefined)?.growth ?? [];

describe("pcg — coerenza degli axis-id (il JOIN che, se rotto, rende il focal inerte)", () => {
  it("(A1) ogni asse di saga_config ha una voce nel repertorio_crescita della bible", () => {
    expect(growth.length).toBeGreaterThan(0);
    for (const { who, axis } of growth) {
      const rep = canon.characters[who]?.repertorio_crescita;
      expect(rep, `manca repertorio_crescita per ${who}`).toBeDefined();
      expect(
        rep?.[axis],
        `axis-id disallineato: saga_config dice «${who}:${axis}» ma la bible non ha quella chiave ` +
          `(→ focalDirections salterebbe in silenzio)`,
      ).toBeDefined();
    }
  });

  it("(A2) ogni effects.growth della fixture usa un axis-id canonico di saga_config", () => {
    const ok = new Set(growth.map((g) => `${g.who}:${g.axis}`));
    for (const ep of Object.values(graph.episodes ?? {})) {
      for (const g of (ep.effects?.growth ?? []) as GrowthDef[]) {
        expect(
          ok.has(`${g.who}:${g.axis}`),
          `la fixture dichiara una crescita «${g.who}:${g.axis}» non presente in saga_config.long_arcs.growth`,
        ).toBe(true);
      }
    }
  });
});

describe("pcg — il condizionamento si ACCENDE sul pipeline vero", () => {
  it("(B) ep_demo: il narratorBrief riceve l'indirizzo focal dalle bande (Zara attraversa qui)", () => {
    const seed = serializeEpisode("ep_demo", { graph, canon, root: ROOT });
    expect(seed.narratorBrief).toContain("Indirizzo focal");
    // Zara dichiara l'attraversamento di `troppo_piccola` in ep_demo → banda "attraversa"
    expect(seed.narratorBrief).toMatch(/troppo_piccola = attraversa/);
  });
});

describe("pcg — convergenza: niente nota spuria sotto i 2 fili", () => {
  const ctx: SagaContext = buildSagaContext(graph, 1);

  it("(C1) episodio senza semi che fioriscono, senza attraversamenti, senza nodo → null", () => {
    const ep = {
      id: "ep_vuoto",
      order_in_journey: 1,
      type: "respiro",
      attribute_dominant: "distinguere",
      effects: {},
      seeds_bloomed: [],
    } as unknown as EpisodeNode;
    expect(convergence(ep, ctx, graph, canon)).toBeNull();
  });

  it("(C2) un solo filo (solo il nodo del Cordone) → ancora null (servono ≥2)", () => {
    const ep = {
      id: "ep_un_filo",
      order_in_journey: 1,
      type: "respiro",
      attribute_dominant: "connettere",
      regno: "laghi_occidente",
      effects: {},
      seeds_bloomed: [],
      nodo_cordone: { annodato_qui: true, regno: "laghi_occidente" },
    } as unknown as EpisodeNode;
    expect(convergence(ep, ctx, graph, canon)).toBeNull();
  });
});
