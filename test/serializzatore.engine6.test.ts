// test/serializzatore.engine6.test.ts
// Parità dell'estensione §6 (serializzatore/SPEC.md) sul motore.
// Verifica due cose insieme:
//  (1) INIEZIONE: con seed_contents/debt_content/recurring_motif valorizzati, il nodo
//      del motore riceve quei contenuti nei semi/debito/motivo.
//  (2) PARITÀ: senza quei campi, il nodo è IDENTICO a prima (stesso nonce → stessa RNG,
//      stessa struttura), a parte i segnaposto. L'estensione è puramente additiva.
//
// NB: nel motore il motivo ricorrente sta in node.recurring_image (canon.recurring_image).

import { describe, it, expect } from "vitest";
import { buildNode } from "@/lib/engine";

function baseSeed(nonce: number, withSaga: boolean): any {
  const s: any = {
    language: "it",
    title: "Parità §6",
    protagonist: { name: "Zara", age: 7, kind: "tigre" },
    companions: [{ name: "Rocco", kind: "rinoceronte" }],
    world_flavor: "i Laghi del Vespro · soglia · foresta",
    setting: { primary: "la collina" },
    theme: "amicizia",
    pugno: "x",
    personal_detail: "y",
    length_pages: 12, // pages<=12 → count_short = 2 semi
    packs: [],
    spine: { premise: "p", problem: "q", threshold_moment: "t", resolution_mode: "r", closure: "" },
    voice: {},
    nonce,
  };
  if (withSaga) {
    s.seed_contents = ["AAA-seme-uno", "BBB-seme-due"];
    s.debt_content = "DEBT-contenuto-vero";
    s.recurring_motif = "MOTIF-pietra-tiepida";
  }
  return s;
}

/** Cerca un nonce per cui il motore genera SIA un debito SIA un motivo ricorrente. */
function findNonceWithDebtAndRecurring(): number {
  for (let n = 1; n < 5000; n++) {
    const node: any = buildNode(baseSeed(n, false));
    if (node.debt && node.recurring_image) return n;
  }
  throw new Error("nessun nonce con debito+ricorrenza entro 5000 (improbabile)");
}

describe("§6 — estensione contenuti-saga nel motore", () => {
  const nonce = findNonceWithDebtAndRecurring();

  it("inietta i contenuti-saga nei semi, nel debito e nel motivo ricorrente", () => {
    const node: any = buildNode(baseSeed(nonce, true));
    expect(node.seeds.map((s: any) => s.what)).toEqual(["AAA-seme-uno", "BBB-seme-due"]);
    expect(node.debt.what).toBe("DEBT-contenuto-vero");
    expect(node.recurring_image.motif).toBe("MOTIF-pietra-tiepida");
  });

  it("senza contenuti-saga resta ai segnaposto (comportamento storico)", () => {
    const node: any = buildNode(baseSeed(nonce, false));
    for (const s of node.seeds) expect(s.what).toBe(`[${s.kind}]`);
    expect(node.debt.what).toBe(`[${node.debt.kind}]`);
    expect(node.recurring_image.motif).toBe("[motivo]");
  });

  it("PARITÀ: a parte i segnaposto, il nodo è identico (RNG/struttura intatti)", () => {
    const withSaga: any = buildNode(baseSeed(nonce, true));
    const without: any = buildNode(baseSeed(nonce, false));
    // normalizza il nodo "con saga" rimettendo i segnaposto, poi deve combaciare 1:1.
    withSaga.seeds = withSaga.seeds.map((s: any) => ({ ...s, what: `[${s.kind}]` }));
    if (withSaga.debt) withSaga.debt = { ...withSaga.debt, what: `[${withSaga.debt.kind}]` };
    if (withSaga.recurring_image)
      withSaga.recurring_image = { ...withSaga.recurring_image, motif: "[motivo]" };
    expect(withSaga).toEqual(without);
  });

  it("determinismo: stesso nonce → stesso nodo", () => {
    expect(buildNode(baseSeed(nonce, false))).toEqual(buildNode(baseSeed(nonce, false)));
  });

  it("indici-contenuto eccedenti sono ignorati (solo-contenuti, niente cambio di conteggio)", () => {
    const s = baseSeed(nonce, true);
    s.seed_contents = ["solo-uno"]; // meno dei semi generati → il 2° resta segnaposto
    const node: any = buildNode(s);
    expect(node.seeds[0].what).toBe("solo-uno");
    expect(node.seeds[1].what).toBe(`[${node.seeds[1].kind}]`);
    expect(node.seeds.length).toBe(2); // il conteggio non cambia
  });
});
