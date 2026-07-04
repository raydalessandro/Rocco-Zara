// test/geo.sync.test.ts — cancello anti-drift (QUARTO gemello, con cast/digest/
// reference-sync): il geo pack committato in saga/cartografia/geo/ (confini, acque,
// centri, riferimenti di trama, manifest, INDICE_LUOGHI — la fonte unica delle
// coordinate che il serializzatore porta nel brief) deve restare internamente
// coerente. A differenza degli altri gemelli qui NON si rigenera (la rigenerazione
// vuole rete: DEM + Overpass): si verificano gli INVARIANTI del pack col check-mode
// del generatore stesso (stdlib puro, unica sede della logica — vedi il docstring
// di geo_confini.py). Exit 0 = coerente, exit 1 = drift con la diagnosi.
// Gira nel job JS ma richiede python3 (come digest.sync); se manca, FALLISCE dicendolo.

import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";

const ROOT = process.cwd();

describe("geo sync (geo_confini.py --check)", () => {
  it("saga/cartografia/geo/ è un pack coerente (layer ↔ manifest ↔ INDICE_LUOGHI)", () => {
    let stdout = "";
    try {
      stdout = execSync(
        "python3 saga/cartografia/pipeline/geo_confini.py --check",
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
      if (err.code === "ENOENT") {
        expect.fail(
          "python3 non è raggiungibile: impossibile verificare gli invarianti del geo pack. " +
            "Assicura python3 nell'ambiente (il job CI parity-python lo usa).",
        );
      }
      expect.fail(
        "geo pack in drift (layer/manifest/INDICE non coerenti). Diagnosi del check:\n" +
          (err.stdout ?? "") +
          (err.stderr ?? "") +
          "\nSe hai mosso coordinate: l'INDICE_LUOGHI è la fonte unica — riallinea i layer.",
      );
    }
    expect(stdout).toMatch(/geo pack OK/);
  });
});
