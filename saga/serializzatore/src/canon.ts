// canon.ts — Caricatori del CANONE-LORE (§2 / §11).
//
// Legge i file reali di `saga/` (read-only) e li compone nel bundle `Canon` che
// `buildSeed` consuma. Sorgenti: saga_config.yaml (YAML), _voci.json (JSON),
// CARTA_VOCE.md (blocco YAML §4), le bible (blocchi ```yaml voce_personaggio```),
// ritornelli.md (heading), state/entities.json (registro entità).
//
// Niente qui dentro tocca lib/. È puramente lato-saga.

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import { parse as parseYaml } from "yaml";
import type {
  Canon,
  CartaVoce,
  CharacterSheet,
  EntityRegistry,
  Ritornello,
  SagaConfig,
  VociFile,
} from "./types";

// ---------- util ----------

function read(path: string): string {
  return readFileSync(path, "utf8");
}

/** slug stabile: minuscole, accenti via NFD, non-alfanumerici → "_". */
export function slug(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/** "custode-anziano" → "Custode Anziano" (per nomi-segnaposto stabili, §4.4). */
export function handleToName(handle: string): string {
  return handle
    .split(/[-_]/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Estrae tutti i blocchi ```yaml ... ``` da un markdown e li parsa. */
export function extractYamlBlocks(md: string): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  const re = /```ya?ml\s*\n([\s\S]*?)```/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    const body = m[1];
    try {
      const parsed = parseYaml(body);
      if (parsed && typeof parsed === "object") out.push(parsed as Record<string, unknown>);
    } catch {
      // blocco non-YAML valido: lo si ignora (robustezza).
    }
  }
  return out;
}

// ---------- protagonisti: fallback voce (le bible non hanno il blocco-macchina) ----------
// DATA GAP documentato: rocco/zara/toraki hanno la "Voce" in prosa, non un blocco
// ```yaml voce_personaggio```. Sintetizziamo qui il CharacterVoice dai loro campi-canone
// (sezione "Voce" / "non direbbe mai" delle bible). Se un domani la bible avrà il blocco,
// quello vince (vedi loadCharacters).
const PROTAGONIST_FALLBACK: Record<string, CharacterSheet> = {
  rocco: {
    castId: "rocco",
    nominalAge: 7,
    species: "rinoceronte",
    voce_personaggio: {
      name: "Rocco",
      role: "protagonista",
      archetype: "il gigante goffo e gentile — sincero, premuroso fino all'ansia di far danni",
      underStress: "quando si fida agisce con decisione: nella tempesta diventa saldo",
      ritmo: "frasi semplici, lessico concreto",
      words: "Scusa! / non volevo / il ramo, intendo",
      never: "una vanteria; non si mette mai al centro",
    },
  },
  zara: {
    castId: "zara",
    nominalAge: 7,
    species: "tigre",
    voce_personaggio: {
      name: "Zara",
      role: "protagonista",
      archetype: "orgogliosa e pungente in superficie, leale sotto",
      underStress: "dice il minimo dove servirebbe molto; quando si fida ringrazia con semplicità",
      ritmo: "secco, essenziale",
      words: "Grazie (raro, pesante) / sono veloce / non sono piccola",
      never: "ammettere paura davanti agli altri",
    },
  },
  toraki: {
    castId: "toraki",
    nominalAge: 12,
    species: "tigre bianca",
    voce_personaggio: {
      name: "Toraki",
      role: "protagonista",
      archetype: "scarna, in avanti, dell'anziano — poche parole, di chi ha già capito",
      underStress: "nasconde la fatica e va avanti, sempre verso il Luogo più lontano",
      ritmo: "scarno, minimo (si vede più di quanto si senta)",
      words: "avanti / il nodo / più vicino",
      never: "lamentarsi del peso o mostrare il costo di ciò che porta",
    },
  },
};

// ---------- loaders ----------

export function loadSagaConfig(root: string): SagaConfig {
  const p = join(root, "saga", "saga_config.yaml");
  return (parseYaml(read(p)) ?? {}) as SagaConfig;
}

export function loadVoci(root: string): VociFile {
  const p = join(root, "saga", "cartografia", "regni", "_voci.json");
  return JSON.parse(read(p)) as VociFile;
}

export function loadCartaVoce(root: string): CartaVoce {
  const p = join(root, "saga", "voce", "CARTA_VOCE.md");
  const blocks = extractYamlBlocks(read(p));
  // il blocco utile ha la chiave radice `carta_voce`.
  for (const b of blocks) {
    if (b && typeof b === "object" && "carta_voce" in b) {
      return (b as { carta_voce: CartaVoce }).carta_voce;
    }
  }
  return {};
}

function sheetFromBlock(castId: string, block: Record<string, unknown>): CharacterSheet {
  const rg = (block.registro_gruppo ?? undefined) as CharacterSheet["registro_gruppo"];
  const vp = (block.voce_personaggio ?? undefined) as CharacterSheet["voce_personaggio"];
  return { castId, registro_gruppo: rg, voce_personaggio: vp };
}

/** Indice cast: castId → scheda. Protagonisti (rocco/zara/toraki) + comprimari/*.md.
 *  Per i protagonisti senza blocco-macchina si usa il fallback canone. */
export function loadCharacters(root: string): Record<string, CharacterSheet> {
  const out: Record<string, CharacterSheet> = {};

  // protagonisti
  for (const id of ["rocco", "zara", "toraki"]) {
    const p = join(root, "saga", "bible", `${id}.md`);
    let sheet: CharacterSheet | undefined;
    if (existsSync(p)) {
      const blocks = extractYamlBlocks(read(p));
      const withVoice = blocks.find((b) => "voce_personaggio" in b || "registro_gruppo" in b);
      if (withVoice) {
        sheet = sheetFromBlock(id, withVoice);
        sheet.nominalAge = PROTAGONIST_FALLBACK[id]?.nominalAge ?? null;
        sheet.species = PROTAGONIST_FALLBACK[id]?.species;
      }
    }
    out[id] = sheet ?? { ...PROTAGONIST_FALLBACK[id] };
  }

  // comprimari (Tier 2 — 34 schede)
  const dir = join(root, "saga", "bible", "comprimari");
  if (existsSync(dir)) {
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".md")) continue;
      if (f.startsWith("_") || f === "README.md" || f === "MAPPA_CAST.md") continue;
      const castId = basename(f, ".md");
      const blocks = extractYamlBlocks(read(join(dir, f)));
      const withVoice = blocks.find((b) => "voce_personaggio" in b || "registro_gruppo" in b);
      if (withVoice) {
        const sheet = sheetFromBlock(castId, withVoice);
        sheet.filePath = join("saga", "bible", "comprimari", f);
        out[castId] = sheet;
      }
    }
  }
  return out;
}

/** Parsa i 5 ritornelli da ritornelli.md (heading "## N. Titolo · *funzione: …*"). */
export function loadRitornelli(root: string): Ritornello[] {
  const p = join(root, "saga", "bible", "ritornelli.md");
  if (!existsSync(p)) return [];
  const md = read(p);
  const out: Ritornello[] = [];
  const lines = md.split("\n");
  const headRe = /^##\s+(\d+)\.\s+(.+?)\s*(?:·\s*\*funzione:\s*(.+?)\*)?\s*$/;
  for (let i = 0; i < lines.length; i++) {
    const m = headRe.exec(lines[i]);
    if (!m) continue;
    const n = Number(m[1]);
    let title = m[2].trim();
    // toglie eventuale "· *funzione...*" residuo se la regex non l'ha catturato
    title = title.replace(/\s*·\s*\*funzione[\s\S]*$/, "").trim();
    const funzione = (m[3] || "").trim() || undefined;
    // essence = primo bullet "Versione nostra:" o il primo bullet utile dopo l'heading.
    let essence = "";
    for (let j = i + 1; j < Math.min(i + 14, lines.length); j++) {
      const l = lines[j].trim();
      if (l.startsWith("## ")) break;
      const mv = /\*\*Versione nostra:\*\*\s*(.+)$/.exec(l);
      if (mv) {
        essence = mv[1].replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
        break;
      }
    }
    if (!essence) essence = title;
    out.push({ n, title, funzione, essence });
  }
  return out.sort((a, b) => a.n - b.n);
}

export function loadEntities(root: string): EntityRegistry {
  const p = join(root, "saga", "serializzatore", "state", "entities.json");
  if (!existsSync(p)) return { entities: {} };
  return JSON.parse(read(p)) as EntityRegistry;
}

/** Compone l'intero bundle-lore. `root` = radice della repo. */
export function loadCanon(root: string): Canon {
  return {
    root,
    config: loadSagaConfig(root),
    voci: loadVoci(root),
    cartaVoce: loadCartaVoce(root),
    characters: loadCharacters(root),
    ritornelli: loadRitornelli(root),
    entities: loadEntities(root),
  };
}

/** Carica un grafo-saga da file JSON (saga_graph.json o una fixture). */
export function loadGraph(path: string): import("./types").SagaGraph {
  return JSON.parse(read(path)) as import("./types").SagaGraph;
}
