// test/cast.sync.test.ts — cancello anti-drift: web/data/cast.json (GENERATO)
// deve restare allineato alle schede di saga/bible/comprimari/ + MAPPA_CAST.md.
// Usa il check-mode del generatore stesso (unico serializzatore, nessuna
// duplicazione di logica qui): exit 0 = allineato, exit 1 = divergente con
// l'elenco delle entry che differiscono su stderr.

import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";

const ROOT = process.cwd();

describe("cast sync (web/tools/build_cast.mjs --check)", () => {
  it("web/data/cast.json è allineato alle schede comprimari", () => {
    let stdout = "";
    try {
      stdout = execSync("node web/tools/build_cast.mjs --check", {
        cwd: ROOT,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (e) {
      const err = e as { stdout?: string; stderr?: string };
      expect.fail(
        "web/data/cast.json non è allineato alle schede comprimari: rigenera con `node web/tools/build_cast.mjs`.\n" +
          (err.stdout ?? "") +
          (err.stderr ?? ""),
      );
    }
    expect(stdout).toMatch(/cast\.json OK/);
  });
});
