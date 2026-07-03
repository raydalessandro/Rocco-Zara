// cli.ts — la pipeline episodio IMPUGNABILE da riga di comando.
//
// Rende eseguibile a mano la catena deterministica che finora giravano solo i test:
//   canone → serializeEpisodeFull → buildNode → extractHooks → buildBrief → auditContinuity
// e la chiusura di un episodio (applyEffects → riscrittura del grafo).
//
// Uso (via npm script `ep`, runner tsx):
//   npm run ep -- build ep_demo --graph saga/serializzatore/fixtures/saga_graph.demo.json
//   npm run ep -- close ep_demo --graph <path>
//   npm run ep -- audit ep_demo --graph <path>
//
// Invarianti rispettati:
// - determinismo (P2): NIENTE timestamp o valori casuali negli artefatti — stesso
//   input → stessi byte. Il nonce viene dal serializzatore (firma dello stato).
// - la CLI si FERMA al brief + audit: la prosa resta un cancello umano (P5) e le
//   immagini pure — qui non si chiama nessun LLM.
// - gli artefatti in saga/episodi/ sono DERIVATI e ricostruibili: la verità è nel
//   grafo (per questo la cartella è in .gitignore).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import {
  applyEffects,
  auditContinuity,
  buildSagaContext,
  serializeEpisodeFull,
} from "./src/index";
import type { Canon, EmittedSeed, SagaGraph, SagaVerdict } from "./src/types";
import { buildNode, extractHooks } from "../../lib/engine";
import { buildBrief } from "../../lib/brief";
import type { Hook, StoryNodeExt } from "../../lib/engineTypes";
import type { EntityRefRecord } from "../../lib/types";

// ---------- caricamento con errori leggibili ----------

/** Carica il grafo da file con errori umani (file assente / JSON malformato). */
export function loadGraphReadable(path: string): SagaGraph {
  if (!existsSync(path)) {
    throw new Error(`grafo non trovato: ${path}`);
  }
  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch (e) {
    throw new Error(`grafo illeggibile (${path}): ${(e as Error).message}`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(`grafo malformato — JSON non valido (${path}): ${(e as Error).message}`);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`grafo malformato (${path}): atteso un oggetto JSON alla radice.`);
  }
  return parsed as SagaGraph;
}

/** Esige che l'episodio esista nel grafo; altrimenti errore con gli episodi noti. */
function requireEpisode(graph: SagaGraph, episodeId: string) {
  const ep = graph.episodes?.[episodeId];
  if (!ep) {
    const known = Object.keys(graph.episodes || {}).sort();
    throw new Error(
      `episodio '${episodeId}' assente dal grafo. Episodi noti: ${known.length ? known.join(", ") : "(nessuno)"}`,
    );
  }
  return ep;
}

// ---------- API programmatica ----------

export interface RunEpisodeOpts {
  /** grafo già caricato (ha precedenza su graphPath). */
  graph?: SagaGraph;
  /** path del grafo. default: <root>/saga/trama/saga_graph.json */
  graphPath?: string;
  /** canone già caricato (altrimenti loadCanon(root) via serializeEpisodeFull). */
  canon?: Canon;
  /** radice repo. default: process.cwd() */
  root?: string;
  /** dir base degli artefatti (si scrive in <outDir>/<episodeId>/). default: <root>/saga/episodi */
  outDir?: string;
  /** se true scrive i 4 artefatti su disco (la CLI passa true; l'API di default no). */
  write?: boolean;
}

export interface RunEpisodeResult {
  seed: EmittedSeed;
  node: StoryNodeExt;
  hooks: Hook[];
  brief: string;
  entities: EntityRefRecord[];
  audit: SagaVerdict;
  /** path assoluti degli artefatti scritti (null se write !== true). */
  files: { seed: string; node: string; brief: string; audit: string } | null;
}

/** JSON deterministico: indent fisso, newline finale, nessun campo volatile aggiunto. */
function toJson(v: unknown): string {
  return JSON.stringify(v, null, 2) + "\n";
}

/** Esegue la catena deterministica completa per un episodio (e opzionalmente scrive gli artefatti). */
export function runEpisode(episodeId: string, opts: RunEpisodeOpts = {}): RunEpisodeResult {
  const root = opts.root || process.cwd();
  const graph =
    opts.graph || loadGraphReadable(opts.graphPath || join(root, "saga/trama/saga_graph.json"));
  requireEpisode(graph, episodeId);

  const { seed, entities, audit } = serializeEpisodeFull(episodeId, {
    graph,
    canon: opts.canon,
    root,
  });
  const node = buildNode(seed);
  const hooks = extractHooks(node);
  const brief = buildBrief(node, hooks, seed);

  let files: RunEpisodeResult["files"] = null;
  if (opts.write) {
    const dir = join(opts.outDir || join(root, "saga/episodi"), episodeId);
    mkdirSync(dir, { recursive: true });
    files = {
      seed: join(dir, "seed.json"),
      node: join(dir, "node.json"),
      brief: join(dir, "brief.md"),
      audit: join(dir, "audit.json"),
    };
    writeFileSync(files.seed, toJson(seed), "utf8");
    writeFileSync(files.node, toJson(node), "utf8");
    writeFileSync(files.brief, brief.endsWith("\n") ? brief : brief + "\n", "utf8");
    writeFileSync(files.audit, toJson(audit), "utf8");
  }

  return { seed, node, hooks, brief, entities, audit, files };
}

/** Chiude un episodio: applyEffects e riscrive il file del grafo. Ritorna cosa è cambiato. */
export function closeEpisode(
  episodeId: string,
  opts: { graphPath?: string; root?: string } = {},
): { graphPath: string; debtsClosed: string[]; seedsBloomed: string[] } {
  const root = opts.root || process.cwd();
  const graphPath = opts.graphPath || join(root, "saga/trama/saga_graph.json");
  const graph = loadGraphReadable(graphPath);
  requireEpisode(graph, episodeId);

  const next = applyEffects(graph, episodeId);

  // diff leggibile: cosa ha marcato questo close
  const debtsClosed = Object.keys(next.debts || {}).filter(
    (id) => next.debts[id].closed === episodeId && graph.debts?.[id]?.closed !== episodeId,
  );
  const seedsBloomed = Object.keys(next.seeds || {}).filter(
    (id) => next.seeds[id].bloomed_at === episodeId && graph.seeds?.[id]?.bloomed_at !== episodeId,
  );

  writeFileSync(graphPath, toJson(next), "utf8");
  return { graphPath, debtsClosed, seedsBloomed };
}

/** Solo il verdetto di continuità (senza toccare nulla). */
export function auditEpisode(
  episodeId: string,
  opts: { graph?: SagaGraph; graphPath?: string; root?: string } = {},
): SagaVerdict {
  const root = opts.root || process.cwd();
  const graph =
    opts.graph || loadGraphReadable(opts.graphPath || join(root, "saga/trama/saga_graph.json"));
  const ep = requireEpisode(graph, episodeId);
  const ctx = buildSagaContext(graph, ep.order_in_journey);
  return auditContinuity(episodeId, graph, ctx);
}

// ---------- main CLI ----------

const USAGE = `Uso: npm run ep -- <comando> <episodeId> [opzioni]

Comandi:
  build <episodeId>   catena completa: seed → nodo → hooks → brief → audit,
                      scrive seed.json, node.json, brief.md, audit.json
                      in <out>/<episodeId>/ (default: saga/episodi/<episodeId>/)
  close <episodeId>   applyEffects: chiude l'episodio e riscrive il file del grafo
  audit <episodeId>   solo il report di continuità a stdout

Opzioni:
  --graph <path>      path del grafo (default: saga/trama/saga_graph.json)
  --out <dir>         (solo build) dir base degli artefatti (default: saga/episodi)
  --strict            (solo build) exit 2 se l'audit ha violazioni

Esempio:
  npm run ep -- build ep_demo --graph saga/serializzatore/fixtures/saga_graph.demo.json`;

interface CliArgs {
  command: string;
  episodeId: string;
  graphPath?: string;
  outDir?: string;
  strict: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const [command, episodeId, ...rest] = argv;
  if (!command || command === "--help" || command === "-h") {
    throw new Error(USAGE);
  }
  if (!["build", "close", "audit"].includes(command)) {
    throw new Error(`comando sconosciuto '${command}'.\n\n${USAGE}`);
  }
  if (!episodeId || episodeId.startsWith("--")) {
    throw new Error(`manca l'episodeId per '${command}'.\n\n${USAGE}`);
  }
  const args: CliArgs = { command, episodeId, strict: false };
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === "--graph") {
      args.graphPath = rest[++i];
      if (!args.graphPath) throw new Error("--graph richiede un path.");
    } else if (a === "--out") {
      args.outDir = rest[++i];
      if (!args.outDir) throw new Error("--out richiede una directory.");
    } else if (a === "--strict") {
      args.strict = true;
    } else {
      throw new Error(`opzione sconosciuta '${a}'.\n\n${USAGE}`);
    }
  }
  return args;
}

/** Righe umane del verdetto (per build e audit). */
function verdictLines(audit: SagaVerdict): string[] {
  const total = audit.checks.length;
  const passed = audit.checks.filter((c) => c.pass).length;
  const L: string[] = [];
  L.push(`Audit    : ${audit.verdict ?? "n/d"} (${passed}/${total} check)`);
  for (const c of audit.checks.filter((c) => !c.pass)) {
    L.push(`  ✗ ${c.key} — ${c.label}${c.note ? ` (${c.note})` : ""}`);
  }
  for (const f of audit.episode_flags) {
    L.push(`  ⚑ [${f.severity}] ${f.episode}: ${f.issue}`);
  }
  return L;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = process.cwd();
  // path relativo alla repo per la stampa; assoluto se sta fuori (niente ../../..)
  const rel = (p: string) => {
    const r = relative(root, p);
    return !r || r.startsWith("..") ? p : r;
  };

  if (args.command === "build") {
    const r = runEpisode(args.episodeId, {
      graphPath: args.graphPath,
      outDir: args.outDir,
      root,
      write: true,
    });
    const semi = r.node.seeds || [];
    console.log(`Episodio : ${args.episodeId}`);
    console.log(`Titolo   : ${r.node.title}`);
    console.log(
      `Pagine   : ${r.node.pages} (~${r.node.estimated_words} parole) — soglia p${r.node.threshold_page}`,
    );
    console.log(
      `Semi     : ${semi.length}${semi.length ? ` (${semi.map((s) => `${s.id} p${s.planted_page}→p${s.payoff_page}`).join(", ")})` : ""}`,
    );
    console.log(`Hooks    : ${r.hooks.length} · Entità: ${r.entities.length}`);
    for (const line of verdictLines(r.audit)) console.log(line);
    console.log(`Artefatti: ${rel(join((r.files as NonNullable<typeof r.files>).seed, ".."))}/{seed.json, node.json, brief.md, audit.json}`);
    if (r.audit.verdict !== "PASS" && args.strict) {
      console.error("--strict: audit con violazioni → exit 2 (artefatti comunque scritti).");
      process.exit(2);
    }
    return;
  }

  if (args.command === "close") {
    const r = closeEpisode(args.episodeId, { graphPath: args.graphPath, root });
    console.log(`Episodio '${args.episodeId}' chiuso — grafo riscritto: ${rel(r.graphPath)}`);
    console.log(
      `  Debiti chiusi : ${r.debtsClosed.length ? r.debtsClosed.join(", ") : "(nessuno)"}`,
    );
    console.log(
      `  Semi fioriti  : ${r.seedsBloomed.length ? r.seedsBloomed.join(", ") : "(nessuno)"}`,
    );
    console.log(`  Baseline      : world_state_baselines["_running"] aggiornata (snapshot cumulativo).`);
    return;
  }

  // audit
  const v = auditEpisode(args.episodeId, { graphPath: args.graphPath, root });
  console.log(`Episodio : ${args.episodeId}`);
  for (const line of verdictLines(v)) console.log(line);
  for (const c of v.checks.filter((c) => c.pass)) {
    console.log(`  ✓ ${c.key} — ${c.label}`);
  }
}

// Esegue main solo se il file è invocato direttamente (tsx saga/serializzatore/cli.ts),
// non quando viene importato come modulo (API programmatica / test).
const invokedDirectly = /\/cli\.(ts|js|mjs|cjs)$/.test(process.argv[1] || "");
if (invokedDirectly) {
  try {
    main();
  } catch (e) {
    console.error(`Errore: ${(e as Error).message}`);
    process.exit(1);
  }
}
