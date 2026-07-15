// test/thumb.sync.test.ts — cancello anti-drift (gemello di cast/digest/reference/catalog):
// ogni immagine di reference (saga/reference/{personaggi,ambienti}) deve avere la sua
// miniatura in <dir>/_thumb/<base>.webp — è ciò che la griglia del sito carica al posto
// dei 6–8 MB originali. Usa il --check del generatore (solo presenza, non richiede sharp):
// exit 0 = tutte presenti, exit 1 = mancanti (con l'elenco). Se aggiungi un'immagine,
// rigenera con `node saga/reference/tools/genera_thumb.mjs`.

import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";

const ROOT = process.cwd();

describe("thumb sync (genera_thumb.mjs --check)", () => {
  it("ogni reference ha la sua miniatura in _thumb/", () => {
    let stdout = "";
    try {
      stdout = execSync("node saga/reference/tools/genera_thumb.mjs --check", {
        cwd: ROOT,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (e) {
      const err = e as { stdout?: string; stderr?: string };
      expect.fail(
        "miniature mancanti: rigenera con `node saga/reference/tools/genera_thumb.mjs`.\n" +
          (err.stdout ?? "") +
          (err.stderr ?? ""),
      );
    }
    expect(stdout).toMatch(/thumb OK/);
  });
});
