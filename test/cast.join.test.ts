// cast.join.test.ts — il gemello del join cast (audit di stagione, B1+B3).
//
// Il bug dei «fantasmi»: gli id `char_*` del cast di saga_graph.json non
// trovavano la scheda/entità e il serializzatore coniava personaggi nuovi
// («Char Zara») con voci casuali. Questo cancello lo vieta PER SEMPRE, sul
// grafo e sul canone VERI: ogni handle di cast deve risolvere un nome
// canonico (dal registro entità o dalla scheda) e — dove il registro la
// dichiara — una specie. Un solo posto dove correggere: entities.json.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { loadCanon } from "../saga/serializzatore/src/canon";
import { displayNameOf, sheetOf, entityOf, resolveCharacterVoice } from "../saga/serializzatore/src/voices";
import { buildSeed } from "../saga/serializzatore/src/buildSeed";
import { buildSagaContext } from "../saga/serializzatore/src/sagaContext";
import type { SagaGraph } from "../saga/serializzatore/src/types";

const ROOT = join(__dirname, "..");
const graph = JSON.parse(
  readFileSync(join(ROOT, "saga/trama/saga_graph.json"), "utf8"),
) as SagaGraph;
const canon = loadCanon(ROOT);

const tuttiGliHandle = (): string[] => {
  const out = new Set<string>();
  for (const ep of Object.values(graph.episodes || {})) {
    for (const h of ep.cast || []) out.add(h);
    if (ep.serpe_face) out.add(ep.serpe_face);
  }
  return [...out];
};

describe("join cast (grafo reale ↔ entities.json ↔ schede)", () => {
  it("nessun handle produce un nome-fantasma «Char …»", () => {
    const fantasmi = tuttiGliHandle()
      .map((h) => ({ h, nome: displayNameOf(h, canon) }))
      .filter((x) => /^Char\s/.test(x.nome));
    expect(fantasmi, JSON.stringify(fantasmi)).toEqual([]);
  });

  it("ogni handle con specie nel registro la porta fino al seed", () => {
    const senza = tuttiGliHandle().filter((h) => {
      const ent = entityOf(h, canon);
      if (!ent?.species) return false; // il registro non la dichiara: fuori scopo
      const sheet = sheetOf(h, canon);
      const specie = sheet?.species || ent.species;
      return !specie;
    });
    expect(senza).toEqual([]);
  });

  it("gli handle `char_*` agganciano la scheda quando esiste (voce reale, non casuale)", () => {
    // campione rappresentativo: articoli, preposizioni, apostrofi nei nomi-file
    for (const h of ["char_cecca", "char_mastino", "char_guardiano_guado", "char_lupa", "char_specchio_di_zara", "char_arlecchino"]) {
      expect(sheetOf(h, canon), h).toBeTruthy();
    }
    // e la voce di Cècca via char_cecca è la SUA (archetipo dalla scheda)
    const cv = resolveCharacterVoice("char_cecca", canon);
    expect(cv.name).toBe("Cècca");
    expect(cv.archetype || "").toMatch(/spia/i);
  });

  it("ep12 sul grafo vero: compagni con nome canonico e specie", () => {
    const ep12 = graph.episodes["ep12"];
    const ctx = buildSagaContext(graph, ep12.order_in_journey + 1);
    const seed = buildSeed("ep12", graph, ctx, canon);
    const byName = Object.fromEntries(seed.companions.map((c) => [c.name, c.kind]));
    expect(byName["il Mastino"]).toBe("cane mastino");
    expect(byName["Artiglio"]).toBe("falco");
    expect(Object.keys(byName).some((n) => /^Char\s/.test(n))).toBe(false);
    // dedup: il non-POV compare una volta sola, col nome vero
    expect(seed.companions.filter((c) => c.name === "Zara").length).toBe(1);
  });
});
