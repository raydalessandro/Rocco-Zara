// mondo sulla stagione REALE (24 episodi): determinismo, copertura, lessico,
// comparse d'arco e fili aperti. Complementare ai test del modulo sul demo.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { loadCanon, loadGraph } from "../saga/serializzatore/src/canon";
import { buildMondo, applicaLessico } from "../saga/serializzatore/src/mondo";
import type { EpisodeNode } from "../saga/serializzatore/src/types";

const canon = loadCanon(process.cwd());
const graph = loadGraph("saga/trama/saga_graph.json");
const ep = (id: string) => (graph.episodes as Record<string, EpisodeNode>)[id];

describe("mondo — stagione reale (24 episodi)", () => {
  it("è deterministico", () => {
    expect(buildMondo(ep("ep05"), canon, graph).briefBlock).toBe(
      buildMondo(ep("ep05"), canon, graph).briefBlock,
    );
  });

  it("applicaLessico rispetta il confine di parola (parità con applica_lessico.py)", () => {
    // regressione: "Po"→"Gran Fiume" NON deve intaccare "Popolo del Bosco"
    // (bug: diventava "Gran Fiumepolo del Bosco"). Idempotente + boundary-safe.
    expect(applicaLessico("il Popolo del Bosco")).toBe("il Popolo del Bosco");
    expect(applicaLessico("sulle rive del Po")).toBe("sulle rive del Gran Fiume");
    expect(applicaLessico(applicaLessico("il Popolo del Bosco"))).toBe("il Popolo del Bosco");
  });

  it("ogni episodio produce un blocco non vuoto (anche il finale, anche il Ducato)", () => {
    for (const id of Object.keys(graph.episodes)) {
      expect(buildMondo(ep(id), canon, graph).briefBlock, id).not.toBe("");
    }
  });

  it("mai nomi reali nel blocco (lessico applicato, campione su 6 regni)", () => {
    const nomi = JSON.parse(readFileSync("saga/lessico/mappa.json", "utf8")).nomi as Record<string, string>;
    const bad = Object.keys(nomi).filter((k) => k.length >= 5 && /^[A-Z]/.test(k));
    const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    for (const id of ["ep01", "ep05", "ep10", "ep13", "ep18", "ep24"]) {
      const block = buildMondo(ep(id), canon, graph).briefBlock;
      for (const k of bad) {
        expect(new RegExp(`\\b${esc(k)}\\b`).test(block), `${id} contiene «${k}»`).toBe(false);
      }
    }
  });

  it("comparse d'arco: solo già-in-scena, mai il cast corrente né i protagonisti", () => {
    const m = buildMondo(ep("ep06"), canon, graph);
    const names = (m.info.comparse || []).join(" | ");
    expect(names).toContain("Leonessa");           // ep05, stesso arco, non nel cast di ep06
    expect(names).not.toContain("aiutante");        // è NEL cast di ep06
    expect(names).not.toContain("Zara");
    expect(names).not.toContain("Montanaro");       // entra solo a ep08: non è ancora in scena
    const primo = buildMondo(ep("ep05"), canon, graph);
    expect(primo.info.comparse ?? []).toEqual([]);  // primo capitolo d'arco: nessuna comparsa
  });

  it("fili aperti a ep06: quinto colonna aperto, pegno NO (fiorisce qui), traccia Toraki=ep04", () => {
    const m = buildMondo(ep("ep06"), canon, graph);
    const ids = m.info.fili_aperti || [];
    expect(ids).toContain("seed_quinto_colonna");
    expect(ids).not.toContain("seed_pegno_laghi");
    expect(m.briefBlock).toContain("ultima traccia di Toraki: ep04");
  });

  it("debito del Mastino: aperto a ep15, chiuso dopo ep19", () => {
    expect(buildMondo(ep("ep15"), canon, graph).info.fili_aperti || []).toContain("debt_mastino");
    expect(buildMondo(ep("ep21"), canon, graph).info.fili_aperti || []).not.toContain("debt_mastino");
  });
});
