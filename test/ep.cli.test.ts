// test/ep.cli.test.ts
// Cancello e2e della CLI di pipeline (saga/serializzatore/cli.ts).
// Blindiamo le proprietà verificate a mano dal backend alla consegna:
//  - determinismo end-to-end (stesso grafo → stessi byte di seed/node/brief/audit)
//  - parità col GOLDEN committato (fixtures/ep_demo.seedext.json)
//  - brief con gli elementi cardine (universali di voce, tabella pagine)
//  - audit PASS sulla fixture pulita
//  - write mode idempotente (doppio build → stessi sha dei 4 artefatti)
//  - close su COPIA del grafo (la fixture originale resta intatta)
//  - uno smoke shell sul wiring npm/tsx (un solo processo, volutamente)
// Import programmatico: la guardia `invokedDirectly` del modulo garantisce che
// importarlo NON esegua il main.

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runEpisode, closeEpisode, auditEpisode } from "@/saga/serializzatore/cli";
import type { RunEpisodeResult } from "@/saga/serializzatore/cli";

const ROOT = process.cwd();
const FIXTURE = join(ROOT, "saga/serializzatore/fixtures/saga_graph.demo.json");
const GOLDEN = join(ROOT, "saga/serializzatore/fixtures/ep_demo.seedext.json");

const sha256 = (buf: Buffer | string) => createHash("sha256").update(buf).digest("hex");

// Due run indipendenti sulla stessa fixture (via graphPath, come farebbe la CLI):
// li calcoliamo una volta sola e li riusiamo in più test.
let run1: RunEpisodeResult;
let run2: RunEpisodeResult;

beforeAll(() => {
  run1 = runEpisode("ep_demo", { graphPath: FIXTURE, root: ROOT });
  run2 = runEpisode("ep_demo", { graphPath: FIXTURE, root: ROOT });
});

describe("determinismo end-to-end (P2)", () => {
  it("due runEpisode senza write producono la stessa serializzazione di seed/node/brief/audit", () => {
    expect(JSON.stringify(run1.seed)).toBe(JSON.stringify(run2.seed));
    expect(JSON.stringify(run1.node)).toBe(JSON.stringify(run2.node));
    expect(run1.brief).toBe(run2.brief);
    expect(JSON.stringify(run1.audit)).toBe(JSON.stringify(run2.audit));
  });

  it("senza write non tocca il disco (files === null)", () => {
    expect(run1.files).toBeNull();
  });
});

describe("golden", () => {
  it("il seed prodotto combacia 1:1 col GOLDEN committato", () => {
    expect(existsSync(GOLDEN)).toBe(true);
    const golden = JSON.parse(readFileSync(GOLDEN, "utf8"));
    expect(run1.seed).toEqual(golden);
  });
});

describe("brief", () => {
  it("è una stringa non vuota con gli elementi cardine (intestazione, universali di voce, tabella pagine)", () => {
    const b = run1.brief;
    expect(typeof b).toBe("string");
    expect(b.length).toBeGreaterThan(0);
    // intestazione del writing brief (contratto di lib/brief.ts)
    expect(b.startsWith("# WRITING BRIEF — ")).toBe(true);
    // gli universali di voce arrivano dal narratorBrief del seed (golden)
    expect(b).toContain("Universali di voce");
    // la tabella pagina-per-pagina con il suo header stabile
    expect(b).toContain("## Pagina per pagina");
    expect(b).toContain("| pag | beat | tipo hook | zona | nota di pagina |");
  });
});

describe("audit", () => {
  it("auditEpisode su ep_demo: verdict PASS e checks non vuoti", () => {
    const v = auditEpisode("ep_demo", { graphPath: FIXTURE, root: ROOT });
    expect(v.verdict).toBe("PASS");
    expect(v.checks.length).toBeGreaterThan(0);
    // coerenza con l'audit incluso nel run completo
    expect(run1.audit.verdict).toBe("PASS");
    expect(run1.audit.checks.length).toBeGreaterThan(0);
  });
});

describe("write mode (build idempotente)", () => {
  let outBase: string;

  beforeAll(() => {
    outBase = mkdtempSync(join(tmpdir(), "ep-cli-out-"));
  });

  afterAll(() => {
    rmSync(outBase, { recursive: true, force: true });
  });

  it("write: true scrive i 4 artefatti; il secondo build NON li cambia (stessi sha)", () => {
    const first = runEpisode("ep_demo", {
      graphPath: FIXTURE,
      root: ROOT,
      outDir: outBase,
      write: true,
    });
    expect(first.files).not.toBeNull();
    const files = first.files as NonNullable<typeof first.files>;
    for (const p of [files.seed, files.node, files.brief, files.audit]) {
      expect(existsSync(p)).toBe(true);
    }
    const hashes1 = {
      seed: sha256(readFileSync(files.seed)),
      node: sha256(readFileSync(files.node)),
      brief: sha256(readFileSync(files.brief)),
      audit: sha256(readFileSync(files.audit)),
    };

    // secondo build sulla stessa outDir: stesso input → stessi byte
    const second = runEpisode("ep_demo", {
      graphPath: FIXTURE,
      root: ROOT,
      outDir: outBase,
      write: true,
    });
    const files2 = second.files as NonNullable<typeof second.files>;
    expect(files2).toEqual(files);
    expect(sha256(readFileSync(files2.seed))).toBe(hashes1.seed);
    expect(sha256(readFileSync(files2.node))).toBe(hashes1.node);
    expect(sha256(readFileSync(files2.brief))).toBe(hashes1.brief);
    expect(sha256(readFileSync(files2.audit))).toBe(hashes1.audit);
  });
});

describe("close su copia del grafo", () => {
  let tmpDir: string;
  let copyPath: string;
  let originalBytes: string;

  beforeAll(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "ep-cli-close-"));
    copyPath = join(tmpDir, "saga_graph.demo.json");
    originalBytes = readFileSync(FIXTURE, "utf8");
    copyFileSync(FIXTURE, copyPath);
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("closeEpisode riscrive la COPIA (seme fiorito) e la fixture originale resta intatta", () => {
    const r = closeEpisode("ep_demo", { graphPath: copyPath, root: ROOT });
    expect(r.graphPath).toBe(copyPath);
    expect(r.seedsBloomed).toContain("seed_pegno");

    // il grafo riscritto marca il seme fiorito in ep_demo
    const rewritten = JSON.parse(readFileSync(copyPath, "utf8"));
    expect(rewritten.seeds.seed_pegno.bloomed_at).toBe("ep_demo");
    // ...e la baseline cumulativa è stata scritta
    expect(rewritten.world_state_baselines._running).toBeTruthy();

    // la fixture ORIGINALE non è stata toccata (stessi byte di prima)
    expect(readFileSync(FIXTURE, "utf8")).toBe(originalBytes);
  });
});

describe("smoke shell (wiring npm/tsx)", () => {
  it(
    "npx tsx cli.ts audit ep_demo → exit 0 e verdict a stdout",
    () => {
      const out = execSync(
        "npx tsx saga/serializzatore/cli.ts audit ep_demo --graph saga/serializzatore/fixtures/saga_graph.demo.json",
        { cwd: ROOT, encoding: "utf8" },
      );
      // execSync lancia su exit != 0: se siamo qui il processo è uscito 0
      expect(out).toContain("Episodio : ep_demo");
      expect(out).toContain("PASS");
    },
    30_000, // tsx a freddo può essere lento: un solo processo, timeout largo
  );
});
