// test/reference.sync.test.ts — cancello anti-drift (gemello di cast.sync.test.ts
// e digest.sync.test.ts): saga/reference/REFERENCE_BATCH.md (COMMITTATO, il fascicolo
// che l'illustratore legge) deve restare allineato all'output del generatore su
// entities.json + saga_graph.json. Usa il check-mode del generatore stesso (unico
// serializzatore, nessuna duplicazione di logica qui): exit 0 = allineato, exit 1 =
// divergente. Gira nel job JS ma richiede python3 (presente: il job CI parity-python
// lo usa); se mancasse, il test FALLISCE dicendolo.

import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";

const ROOT = process.cwd();

describe("reference sync (genera_batch.py --check)", () => {
  it("saga/reference/REFERENCE_BATCH.md è allineato a entities.json + saga_graph.json", () => {
    let stdout = "";
    try {
      stdout = execSync("python3 saga/reference/genera_batch.py --check", {
        cwd: ROOT,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (e) {
      const err = e as { code?: string; stdout?: string; stderr?: string };
      // python3 assente/non eseguibile: ENOENT → non passare silenziosamente.
      if (err.code === "ENOENT") {
        expect.fail(
          "python3 non è raggiungibile: impossibile verificare la sync del reference batch. " +
            "Assicura python3 nell'ambiente (il job CI parity-python lo usa).",
        );
      }
      expect.fail(
        "REFERENCE_BATCH.md non è allineato al generatore: rigenera con `python3 saga/reference/genera_batch.py`.\n" +
          (err.stdout ?? "") +
          (err.stderr ?? ""),
      );
    }
    expect(stdout).toMatch(/REFERENCE_BATCH\.md OK/);
  });
});
