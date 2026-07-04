// test/digest.sync.test.ts — cancello anti-drift (gemello di cast.sync.test.ts):
// saga/cartografia/zones/_digest.json (COMMITTATO, sorgente della MORFOLOGIA nei
// brief) deve restare allineato all'output del generatore sui zones/*.geojson.
// Usa il check-mode del generatore stesso (unico serializzatore, nessuna
// duplicazione di logica qui): exit 0 = allineato, exit 1 = divergente con la
// diagnosi su stdout/stderr. Gira nel job JS ma richiede python3 (presente: il
// job CI parity-python lo usa); se mancasse, il test FALLISCE dicendolo.

import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";

const ROOT = process.cwd();

describe("digest sync (geo_digest.py --check)", () => {
  it("saga/cartografia/zones/_digest.json è allineato ai geojson", () => {
    let stdout = "";
    try {
      stdout = execSync(
        "python3 saga/cartografia/pipeline/geo_digest.py --check",
        {
          cwd: ROOT,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
    } catch (e) {
      const err = e as {
        code?: string;
        stdout?: string;
        stderr?: string;
      };
      // python3 assente/non eseguibile: ENOENT → non passare silenziosamente.
      if (err.code === "ENOENT") {
        expect.fail(
          "python3 non è raggiungibile: impossibile verificare la sync del digest geo. " +
            "Assicura python3 nell'ambiente (il job CI parity-python lo usa).",
        );
      }
      expect.fail(
        "zones/_digest.json non è allineato ai geojson: rigenera con `python3 saga/cartografia/pipeline/geo_digest.py`.\n" +
          (err.stdout ?? "") +
          (err.stderr ?? ""),
      );
    }
    expect(stdout).toMatch(/_digest\.json OK/);
  });
});
