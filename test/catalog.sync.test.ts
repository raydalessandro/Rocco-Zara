// test/catalog.sync.test.ts — cancello anti-drift (quarto gemello di cast.sync,
// digest.sync e reference.sync): saga/reference/CATALOGO_VISIVO.md (COMMITTATO, il
// foglio di lavoro del ritrattista) deve restare allineato all'output del generatore
// su entities.json + le sezioni «Morfologia di reference» delle schede. Usa il
// check-mode del generatore stesso (unico serializzatore, nessuna duplicazione qui):
// exit 0 = allineato, exit 1 = divergente. Gira nel job JS ma richiede python3
// (presente: il job CI parity-python lo usa); se mancasse, il test FALLISCE dicendolo.

import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";

const ROOT = process.cwd();

describe("catalog sync (genera_catalogo.py --check)", () => {
  it("saga/reference/CATALOGO_VISIVO.md è allineato a entities.json + schede", () => {
    let stdout = "";
    try {
      stdout = execSync("python3 saga/reference/genera_catalogo.py --check", {
        cwd: ROOT,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (e) {
      const err = e as { code?: string; stdout?: string; stderr?: string };
      // python3 assente/non eseguibile: ENOENT → non passare silenziosamente.
      if (err.code === "ENOENT") {
        expect.fail(
          "python3 non è raggiungibile: impossibile verificare la sync del catalogo visivo. " +
            "Assicura python3 nell'ambiente (il job CI parity-python lo usa).",
        );
      }
      expect.fail(
        "CATALOGO_VISIVO.md non è allineato al generatore: rigenera con `python3 saga/reference/genera_catalogo.py`.\n" +
          (err.stdout ?? "") +
          (err.stderr ?? ""),
      );
    }
    expect(stdout).toMatch(/catalogo-sync ✓/);
  });
});
