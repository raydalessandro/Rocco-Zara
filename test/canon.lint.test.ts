// test/canon.lint.test.ts — Il linter del canone (cancello anti-drift).
//
// Il mondo di Rocco & Zara usa un lessico inventato ("Terre Annodate"): i nomi
// reali italiani sono BANDITI dal canone, tranne nei path-substrato dichiarati
// (sottotesto d'autore, atlante del cartografo…). La fonte di verità è
// saga/lessico/mappa.json (chiavi: "nomi" = dizionario reale→canone, "frasi",
// "substrato" = prefissi path repo-relative a nomi reali VOLUTI). Il drift
// storico che questo cancello ferma: nomi reali reintrodotti nel canone da
// generatori o zip (successo 3 volte).
//
// Tre passate:
//  1. file interi:  saga/**/*.{md,json,yaml} + web/data/*.json, meno substrato;
//  2. blocchi-macchina: i blocchi ```yaml``` di saga/bible/**/*.md, ANCHE nel
//     substrato (il contenuto finisce nella pipeline LLM, vedi sotto);
//  3. battute in-world «…» nelle schede di saga/bible/comprimari/.
//
// La regex è la STESSA boundary-safe di saga/lessico/applica_lessico.py:
//   (?<![A-Za-zÀ-ÿ])KEY(?![A-Za-zÀ-ÿ])   — case-sensitive, Node 22 supporta
// il lookbehind. Le chiavi sono escapate e l'alterazione è ordinata
// longest-first per evitare match parziali ("Bismantova" dentro "Pietra di
// Bismantova"). Ogni file è letto UNA volta sola (cache condivisa tra passate).

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();

// ---------------------------------------------------------------- la mappa --
type Mappa = { nomi: Record<string, string>; frasi: Record<string, string>; substrato: string[] };
const mappa: Mappa = JSON.parse(readFileSync(join(ROOT, "saga/lessico/mappa.json"), "utf8"));

// Denylist extra: nomi banditi che non hanno una voce di sostituzione in "nomi"
// (foulard = anacronismo ricorrente dei generatori; Kainua = nome etrusco reale).
const DENY_EXTRA = ["foulard", "Kainua"];

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const chiavi = [...Object.keys(mappa.nomi), ...DENY_EXTRA].sort((a, b) => b.length - a.length);
const PATTERN = new RegExp(
  "(?<![A-Za-zÀ-ÿ])(?:" + chiavi.map(escapeRe).join("|") + ")(?![A-Za-zÀ-ÿ])",
  "g",
);

// ------------------------------------------------------------ i file, UNA volta --
const relPath = (abs: string) => relative(ROOT, abs).split(sep).join("/");

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

// Corpus: saga/**/*.{md,json,yaml} + web/data/*.json — letti una volta sola,
// come mappa path-relative → righe (le passate lavorano tutte per riga).
const corpus = new Map<string, string[]>();
for (const abs of walk(join(ROOT, "saga"))) {
  if (/\.(md|json|yaml)$/.test(abs)) corpus.set(relPath(abs), readFileSync(abs, "utf8").split("\n"));
}
for (const nome of readdirSync(join(ROOT, "web/data")).sort()) {
  if (nome.endsWith(".json")) {
    corpus.set("web/data/" + nome, readFileSync(join(ROOT, "web/data", nome), "utf8").split("\n"));
  }
}

// Una violazione leggibile: "file:riga: [nome] contesto".
function lintRiga(file: string, riga: string, numero: number, out: string[]) {
  for (const m of riga.matchAll(PATTERN)) {
    const da = Math.max(0, (m.index ?? 0) - 30);
    const ctx = riga.slice(da, (m.index ?? 0) + m[0].length + 30).trim();
    out.push(`${file}:${numero}: [${m[0]}] …${ctx}…`);
  }
}

const fallisciSe = (violazioni: string[], intestazione: string) => {
  expect(violazioni, `${intestazione} (${violazioni.length}):\n${violazioni.join("\n")}`).toEqual([]);
};

// ------------------------------------------------------------------ passate --
describe("linter del canone (saga/lessico/mappa.json)", () => {
  it("passata 1 — nessun nome reale nei file interi (canone, meno substrato)", () => {
    // QUARANTENA — debito esplicito, NON substrato: decisione all'orchestratrice.
    // La passata 1 sul tree attuale trova nomi reali in questi due file di web/
    // (la "sala di regia", autore-facing):
    //  - web/data/cast.json: GENERATO da build_cast.mjs a partire dalle schede
    //    comprimari (substrato: sottotesto d'autore voluto) — tagline/specie/
    //    blurb citano Como, Brescia, Siena… L'allineamento alle schede è già
    //    blindato da test/cast.sync.test.ts (--check).
    //  - web/data/narrativa.json: campi "ref" dell'atlante editoriale con le
    //    ancore reali dei Luoghi Antichi (Valcamonica, Marzabotto…).
    // La corsia testing non decide se è sottotesto voluto (→ substrato in
    // mappa.json) o drift da ripulire: finché l'orchestratrice non ratifica,
    // i due file restano esclusi QUI (non in mappa.json), così il cancello
    // resta vivo su tutto il resto — saga/** e ogni NUOVO file di web/data.
    const QUARANTENA = ["web/data/cast.json", "web/data/narrativa.json"];

    const violazioni: string[] = [];
    for (const [file, righe] of corpus) {
      if (mappa.substrato.some((p) => file.startsWith(p))) continue; // dir con "/" finale o file singoli
      if (QUARANTENA.includes(file)) continue;
      righe.forEach((riga, i) => lintRiga(file, riga, i + 1, violazioni));
    }
    fallisciSe(violazioni, "Nomi reali nel canone");
  });

  it("passata 2 — nessun nome reale nei blocchi-macchina ```yaml``` della bibbia (ANCHE nel substrato)", () => {
    // Motivazione: i blocchi voce_personaggio/registro_gruppo finiscono via
    // serializzatore in seed.characterVoices → nel writing brief → nel prompt
    // LLM. Lì il nome reale è un leak di PIPELINE anche dove il file è
    // sottotesto legittimo (comprimari = substrato): per questo la passata
    // include tutta saga/bible/**, substrato compreso, ma linta SOLO le righe
    // dentro i fence yaml. (Il tree attuale è già pulito: 5 leak appena
    // corretti, commit 068881b.)
    const violazioni: string[] = [];
    for (const [file, righe] of corpus) {
      if (!file.startsWith("saga/bible/") || !file.endsWith(".md")) continue;
      let dentroYaml = false;
      righe.forEach((riga, i) => {
        if (!dentroYaml && /^\s*```yaml\s*$/.test(riga)) { dentroYaml = true; return; }
        if (dentroYaml && /^\s*```\s*$/.test(riga)) { dentroYaml = false; return; }
        if (dentroYaml) lintRiga(file, riga, i + 1, violazioni);
      });
    }
    fallisciSe(violazioni, "Nomi reali nei blocchi-macchina (leak di pipeline)");
  });

  it("passata 3 — nessun nome reale nelle battute in-world «…» dei comprimari", () => {
    // Le battute virgolettate «…» sono voce IN-WORLD anche dentro le schede
    // del substrato: un animale delle Terre Annodate non nomina Firenze.
    // Implementata perché sul tree attuale dà zero falsi positivi (verificato:
    // 0 match su tutte le schede). Scansione per battuta sull'intero testo
    // (le «…» possono attraversare più righe), riga calcolata dall'offset.
    const violazioni: string[] = [];
    for (const [file, righe] of corpus) {
      if (!file.startsWith("saga/bible/comprimari/") || !file.endsWith(".md")) continue;
      const testo = righe.join("\n");
      for (const battuta of testo.matchAll(/«[^»]*»/g)) {
        for (const m of battuta[0].matchAll(PATTERN)) {
          const rigaN = testo.slice(0, (battuta.index ?? 0) + (m.index ?? 0)).split("\n").length;
          violazioni.push(`${file}:${rigaN}: [${m[0]}] ${battuta[0].slice(0, 80)}`);
        }
      }
    }
    fallisciSe(violazioni, "Nomi reali nelle battute in-world");
  });
});
