// test/serializzatore.seed.test.ts
// Test end-to-end del serializzatore saga→SeedExt sulla fixture (§13).
// Copre: mappatura §3, POV §3.2, voci §4 (Tier1+Tier2), entità §5, fold §7,
// determinismo §8, contenuti §6, audit §10, applyEffects/recapArc §9.4, e un
// confronto col GOLDEN committato (fixtures/ep_demo.seedext.json).

import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  serializeEpisode,
  serializeEpisodeFull,
  buildSagaContext,
  deriveNonce,
  fnv1a32,
  auditContinuity,
  applyEffects,
  recapArc,
  loadCanon,
  loadGraph,
  synthTier1,
  lookupGroupVoice,
} from "@/saga/serializzatore/src/index";
import type { Canon, SagaGraph } from "@/saga/serializzatore/src/types";
import type { CharacterVoice } from "@/lib/types";

const ROOT = process.cwd();
const FIXTURE = join(ROOT, "saga/serializzatore/fixtures/saga_graph.demo.json");
const GOLDEN = join(ROOT, "saga/serializzatore/fixtures/ep_demo.seedext.json");

let graph: SagaGraph;
let canon: Canon;

beforeAll(() => {
  graph = loadGraph(FIXTURE);
  canon = loadCanon(ROOT);
});

const voiceByName = (vs: CharacterVoice[], name: string) => vs.find((v) => v.name === name);

describe("§3 mappatura episodio → SeedExt (ep_demo)", () => {
  it("protagonista da POV (alternanza del fuoco: laghi_occidente → Zara) + entità stabili", () => {
    const seed = serializeEpisode("ep_demo", { graph, canon, root: ROOT });
    expect(seed.id).toBe("ep_demo");
    expect(seed.protagonist.name).toBe("Zara");
    expect(seed.protagonist.kind).toBe("tigre");
    expect(seed.protagonist.entityId).toBe("char_zara");
    const names = seed.companions.map((c) => c.name);
    expect(names).toContain("Rocco");
    expect(names).toContain("Cècca");
    expect(names).toContain("Custode Anziano"); // name <dal lessico> → handle stabile
    expect(seed.companions.find((c) => c.name === "Rocco")?.entityId).toBe("char_rocco");
  });

  it("knob del motore in overrides (enum dalla lettera dello schema)", () => {
    const seed = serializeEpisode("ep_demo", { graph, canon, root: ROOT });
    expect(seed.overrides?.attribute_dominant).toBe("distinguere");
    expect(seed.overrides?.closure_type).toBe(7);
    expect(seed.overrides?.entry_point_type).toBe("D");
    expect(seed.overrides?.register).toBe("alto");
    expect(seed.overrides?.time_span_arc).toBe("piu_giorni"); // type 'cardine'
  });

  it("nonce deterministico §8 = fnv1a32(id@graph_version)", () => {
    const seed = serializeEpisode("ep_demo", { graph, canon, root: ROOT });
    const expected = deriveNonce(graph.episodes["ep_demo"], graph);
    expect(seed.nonce).toBe(expected);
    expect(seed.nonce).toBe(fnv1a32("ep_demo@demo-1"));
  });

  it("§6 contenuti: seed_contents (piantato), recurring_motif (ritornello), debt_content (debito aperto)", () => {
    const seed = serializeEpisode("ep_demo", { graph, canon, root: ROOT });
    // pianta seed_segno → seed_contents = [contenuto del seme]
    expect(seed.seed_contents).toEqual([graph.seeds["seed_segno"].what]);
    // nodo annodato qui → ritornello #5 (la pietra che si lascia, tiepida)
    const r5 = canon.ritornelli.find((r) => r.n === 5)?.essence;
    expect(seed.recurring_motif).toBe(r5);
    expect((seed.recurring_motif || "").length).toBeGreaterThan(0);
    // nessun debito aperto qui → porta il debito ancora aperto (debt_promessa da ep01)
    expect(seed.debt_content).toBe(graph.debts["debt_promessa"].what);
  });

  it("§6.1 il narratorBrief annota il pagamento del seme che fiorisce qui", () => {
    const seed = serializeEpisode("ep_demo", { graph, canon, root: ROOT });
    expect(seed.narratorBrief ?? "").toContain("seed_pegno");
    expect((seed.narratorBrief ?? "").toLowerCase()).toContain("paga qui il seme");
  });

  it("has_sage_figure = true quando è presente un Custode", () => {
    const seed = serializeEpisode("ep_demo", { graph, canon, root: ROOT });
    expect(seed.has_sage_figure).toBe(true);
  });
});

describe("§4 voci", () => {
  it("Tier 2 dal blocco voce_personaggio: Zara (protagonista) e Cècca (comprimario)", () => {
    const seed = serializeEpisode("ep_demo", { graph, canon, root: ROOT });
    const zara = voiceByName(seed.characterVoices!, "Zara");
    expect(zara?.role).toBe("protagonista");
    expect((zara?.never || "").toLowerCase()).toContain("paura"); // canone duro di Zara
    const cecca = voiceByName(seed.characterVoices!, "Cècca");
    expect(cecca?.role).toBe("comprimario");
    expect(cecca?.archetype && cecca.archetype.length).toBeGreaterThan(0);
    expect(cecca?.words && cecca.words.length).toBeGreaterThan(0);
  });

  it("Tier 1 sintetizzato dal registro-di-gruppo (_voci.json)", () => {
    const gv = lookupGroupVoice(canon, "laghi_occidente/i Custodi");
    expect(gv).toBeTruthy();
    const cv = synthTier1("Tale dei Custodi", gv!);
    expect(cv.name).toBe("Tale dei Custodi");
    expect(cv.role).toBe("comprimario");
    expect((cv.archetype || cv.ritmo || cv.words || "").length).toBeGreaterThan(0);
  });
});

describe("§7 fold / contesto a N", () => {
  it("snapshot a N=2: soglie, relazione, mondo, semi/debiti aperti, cordone", () => {
    const ctx = buildSagaContext(graph, 2);
    expect(ctx.snapshot.relations["rocco|zara"]).toBeTruthy(); // soglia in ep01
    expect(ctx.snapshot.world["collina_incontro"]).toBeTruthy();
    expect(ctx.openSeeds.map((s) => s.id)).toContain("seed_pegno"); // piantato in ep01, non fiorito prima di N=2
    expect(ctx.openDebts.map((d) => d.id)).toContain("debt_promessa");
    expect(ctx.snapshot.cordone.nodi_annodati).toEqual([]); // ep01 non annoda
    expect(ctx.snapshot.cordone.prossimo).toBe("laghi_occidente");
  });
});

describe("§10 audit di continuità", () => {
  it("la fixture pulita PASSA", () => {
    const ctx = buildSagaContext(graph, 2);
    const v = auditContinuity("ep_demo", graph, ctx);
    expect(v.verdict).toBe("PASS");
  });

  it("spina incompleta → FAIL con flag", () => {
    const broken: SagaGraph = JSON.parse(JSON.stringify(graph));
    broken.episodes["ep_demo"].premise = "";
    const ctx = buildSagaContext(broken, 2);
    const v = auditContinuity("ep_demo", broken, ctx);
    expect(v.verdict).toBe("FAIL");
    expect(v.episode_flags.length).toBeGreaterThan(0);
    expect(v.checks.find((c) => c.key === "spine_complete")?.pass).toBe(false);
  });

  it("doppio nodo sullo stesso regno → FAIL", () => {
    // se a N il regno risulta già annodato e l'episodio riannoda → errore
    const g2: SagaGraph = JSON.parse(JSON.stringify(graph));
    g2.episodes["ep01"].nodo_cordone = { annodato_qui: true, regno: "laghi_occidente" };
    const ctx = buildSagaContext(g2, 2); // ora nodi_annodati = [laghi_occidente]
    const v = auditContinuity("ep_demo", g2, ctx); // ep_demo riannoda lo stesso regno
    expect(v.checks.find((c) => c.key === "cordone_no_double_knot")?.pass).toBe(false);
    expect(v.verdict).toBe("FAIL");
  });
});

describe("§9.4 applyEffects / recapArc", () => {
  it("applyEffects marca il seme fiorito e scrive la baseline _running", () => {
    const g2 = applyEffects(graph, "ep_demo");
    expect(g2.seeds["seed_pegno"].bloomed_at).toBe("ep_demo");
    expect(g2.world_state_baselines["_running"]).toBeTruthy();
    // immutabilità: il grafo originale non è toccato
    expect(graph.seeds["seed_pegno"].bloomed_at).toBeUndefined();
  });

  it("recapArc folda l'arco: il nodo del regno risulta annodato a fine arco", () => {
    const { recap } = recapArc(graph, "arco_origine");
    expect(recap.at).toBe("ep_demo");
    expect(recap.baseline.cordone.nodi_annodati).toContain("laghi_occidente");
  });
});

describe("determinismo & golden", () => {
  it("serializzare due volte dà lo stesso SeedExt", () => {
    const a = serializeEpisode("ep_demo", { graph, canon, root: ROOT });
    const b = serializeEpisode("ep_demo", { graph, canon, root: ROOT });
    expect(a).toEqual(b);
  });

  it("combacia 1:1 col GOLDEN committato", () => {
    expect(existsSync(GOLDEN)).toBe(true);
    const golden = JSON.parse(readFileSync(GOLDEN, "utf8"));
    const seed = serializeEpisode("ep_demo", { graph, canon, root: ROOT });
    expect(seed).toEqual(golden);
  });

  it("serializeEpisodeFull restituisce anche story.entities e l'audit", () => {
    const full = serializeEpisodeFull("ep_demo", { graph, canon, root: ROOT });
    const ids = full.entities.map((e) => e.id);
    expect(ids).toContain("char_zara");
    expect(ids).toContain("luogo_le_coppelle");
    // entità nuove (non nel registro) restano da_generare
    const custode = full.entities.find((e) => e.id === "char_custode_anziano");
    expect(custode?.status).toBe("da_generare");
    expect(full.audit.verdict).toBe("PASS");
  });
});
