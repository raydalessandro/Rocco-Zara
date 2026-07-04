// mondo.ts — «il regno vivo»: arricchimento del brief dal canone largo.
//
// Legge (tutte sorgenti OPZIONALI, mai un throw):
//   cartografia/regni/<slug>/regno.json      → identità, prompt base, ruolo nel viaggio
//   cartografia/regni/<slug>/societa.json    → classi/presenze, tensione viva, estrazione
//   cartografia/regni/_faunario.json         → fauna di sfondo per zona + luoghi di zona
//   cartografia/regni/_voci.json             → registri delle classi + trasversali
//   cartografia/regno/rete_urbana.json       → il percorso (km, terreno, dislivello)
//   cartografia/luoghi_antichi.md            → «cosa si vede» al Luogo Antico
//   voce/METAFORE.md (§2 per-regno)          → sorgenti di metafora locali
//   cartografia/zones/_digest.json           → morfologia (dal GeoJSON, via tools/geo_digest.py)
//   cartografia/geo/INDICE_LUOGHI.json       → cella griglia + margine dal confine (coord canoniche congelate)
//   serializzatore/state/entities.json       → cantiere (schede/reference mancanti nel cast)
//
// Regole: determinismo fnv1a32(epId|sezione); ogni stringa passa dal lessico
// (saga/lessico/mappa.json → nomi reali→canonici); i nomi non canonici e non mappati
// vengono ANONIMIZZATI (mai nomi reali nel brief). Il blocco resta compatto (≤ ~24 righe).

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Canon, EpisodeNode, MondoInfo, SagaGraph } from "./types";

// ---------- infra ----------
const ROOT = process.cwd();
const cache = new Map<string, unknown>();

function readJson<T>(rel: string): T | null {
  if (cache.has(rel)) return cache.get(rel) as T | null;
  const p = join(ROOT, rel);
  let out: T | null = null;
  try {
    if (existsSync(p)) out = JSON.parse(readFileSync(p, "utf8")) as T;
  } catch {
    out = null;
  }
  cache.set(rel, out);
  return out;
}
function readText(rel: string): string {
  const k = `txt:${rel}`;
  if (cache.has(k)) return cache.get(k) as string;
  const p = join(ROOT, rel);
  let out = "";
  try {
    if (existsSync(p)) out = readFileSync(p, "utf8");
  } catch {
    out = "";
  }
  cache.set(k, out);
  return out;
}
export function fnv1a32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}
const norm = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
const asStr = (v: unknown): string => {
  if (typeof v === "string") return v;
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    for (const k of ["nome", "tipo", "descrizione", "testo"]) if (typeof o[k] === "string") return o[k] as string;
    return "";
  }
  return v == null ? "" : String(v);
};
const cut = (s: unknown, n: number) => {
  const t = asStr(s).replace(/\s+/g, " ").trim();
  return t.length <= n ? t : `${t.slice(0, n - 1).trimEnd()}…`;
};

// ---------- lessico: nomi reali → canonici; guardia anti-nome-reale ----------
type Lessico = { nomi?: Record<string, string> };
function lessico(): Record<string, string> {
  const m = readJson<Lessico>("saga/lessico/mappa.json");
  return m?.nomi || {};
}
const LEX_WORD = "A-Za-zÀ-ÿ"; // stessa classe-parola di applica_lessico.py (parità)
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export function applicaLessico(s: unknown): string {
  let out = asStr(s);
  const nomi = lessico();
  // chiavi più lunghe prima; sostituzione a CONFINE DI PAROLA (come boundary() in
  // applica_lessico.py) così "Po"→"Gran Fiume" non intacca "Popolo del Bosco"
  // (che diventava "Gran Fiumepolo…"). È parità col rename Python + idempotente.
  for (const k of Object.keys(nomi).sort((a, b) => b.length - a.length)) {
    if (!out.includes(k)) continue;
    out = out.replace(new RegExp(`(?<![${LEX_WORD}])${escapeRe(k)}(?![${LEX_WORD}])`, "g"), nomi[k]);
  }
  return out;
}

// ---------- sorgenti tipizzate (loose) ----------
type Regno = {
  id?: string; nome?: string; governo?: string;
  capitale?: { nome?: string }; leader?: { archetipo?: string; tratti?: string[] };
  centri?: Array<{ nome?: string }>; prompt_scrittura_base?: string;
  ruolo_nel_viaggio?: string; estetica?: unknown; cultura?: unknown;
};
type Societa = {
  classi?: Array<{ nome?: string; ruolo_sociale?: string; animali?: string[] }>;
  tensione_viva?: string; estrazione_personaggio?: string;
  principio_calviniano?: { nome?: string; idea?: string };
  zone?: Array<{ tipo?: string; luogo?: string }>;
};
type FaunaEntry = { specie?: string; zona?: string; classe?: string; ruolo?: string };
type Faunario = {
  zone_universali?: Record<string, string>;
  regni?: Record<string, { nome?: string; specie?: FaunaEntry[]; zone_geografiche?: Array<{ tipo?: string; luogo?: string }> }>;
};
type Voci = {
  regni?: Record<string, { nome?: string; voci?: Record<string, { registro?: string }> }>;
  trasversali?: Record<string, { registro?: string } | string>;
};
type Rete = { nodi?: Array<{ name?: string }>; vie?: Array<{ a?: string; b?: string; km?: number; emax?: number; tipo?: string }> };
type Digest = Record<string, { quota_min?: number; quota_max?: number; biomi?: Record<string, number>; corsi_acqua?: number; rilievi?: Array<{ name?: string; quota?: number }> }>;

const ZONE_KEY_BY_REGNO: Record<string, string> = {
  laghi_occidente: "origine_lecco",
  selva_di_mezzo: "foresta_appennino",
};
const ZONE_RANGE: Record<string, string> = {
  origine_lecco: "del Muro del Nord",
  foresta_appennino: "delle Gobbe del Sud",
};

function regnoJson(slug: string): Regno | null {
  return readJson<Regno>(`saga/cartografia/regni/${slug}/regno.json`);
}
function societaJson(slug: string): Societa | null {
  return readJson<Societa>(`saga/cartografia/regni/${slug}/societa.json`);
}
function faunarioRegno(slug: string) {
  const f = readJson<Faunario>("saga/cartografia/regni/_faunario.json");
  if (!f?.regni) return { zone: f?.zone_universali || {}, specie: [] as FaunaEntry[], zoneGeo: [] as Array<{ tipo?: string; luogo?: string }> };
  const entry = Object.values(f.regni).find((r) => norm(r?.nome || "") === norm(displayNomeRegno(slug)) || norm(r?.nome || "") === norm(slug));
  return { zone: f.zone_universali || {}, specie: entry?.specie || [], zoneGeo: entry?.zone_geografiche || [] };
}
function vociRegno(slug: string) {
  const v = readJson<Voci>("saga/cartografia/regni/_voci.json");
  const entry = v?.regni ? Object.values(v.regni).find((r) => norm(r?.nome || "") === norm(slug)) : undefined;
  const tras: string[] = [];
  for (const [k, val] of Object.entries(v?.trasversali || {})) {
    const reg = typeof val === "string" ? val : val?.registro || "";
    if (reg) tras.push(`${k}: ${cut(reg, 70)}`);
  }
  return { voci: entry?.voci || {}, trasversali: tras };
}
function displayNomeRegno(slug: string): string {
  return regnoJson(slug)?.nome || slug;
}
// whitelist di nomi-centro canonici (tutte le capitali/centri con nome vero)
function centriCanonici(): Set<string> {
  const k = "centriCanonici";
  if (cache.has(k)) return cache.get(k) as Set<string>;
  const s = new Set<string>();
  for (const slug of ["laghi_occidente", "laghi_oriente", "pianura_alta", "pianura_bassa", "selva_di_mezzo", "toscana"]) {
    const r = regnoJson(slug);
    const add = (n?: string) => {
      const nn = (n || "").replace(/\s*\(.*\)$/, "").trim();
      if (nn && !/^centro\s+\d+$/i.test(nn)) s.add(nn);
    };
    add(r?.capitale?.nome);
    for (const c of r?.centri || []) add(c?.nome);
  }
  cache.set(k, s);
  return s;
}
function nomiCanonici(): Set<string> {
  const k = "nomiCanonici";
  if (cache.has(k)) return cache.get(k) as Set<string>;
  const s = new Set<string>(centriCanonici());
  for (const v of Object.values(lessico())) {
    const vv = v.replace(/^(il|lo|la|i|gli|le|l')\s+/i, "").trim();
    if (vv) s.add(vv);
    s.add(v.trim());
  }
  cache.set(k, s);
  return s;
}
function nomeCentroSicuro(raw: string): string | null {
  const mapped = applicaLessico(raw).replace(/\s*\(.*\)$/, "").trim();
  if (nomiCanonici().has(mapped)) return mapped;
  return null; // non canonico e non mappato → si anonimizza a monte
}

// ---------- sezioni ----------
function secPercorso(ep: EpisodeNode): string | null {
  const rete = readJson<Rete>("saga/cartografia/regno/rete_urbana.json");
  if (!rete?.vie?.length) return null;
  const want = new Set([norm(ep.center || ""), norm(ep.route_from || "")]);
  const nName = (x?: string) => norm(applicaLessico(x || ""));
  // via diretta center↔route_from
  const diretta = rete.vie.find((v) => want.has(nName(v.a)) && want.has(nName(v.b)) && nName(v.a) !== nName(v.b));
  if (diretta) {
    const a = nomeCentroSicuro(diretta.a || "") || "il centro di partenza";
    const b = nomeCentroSicuro(diretta.b || "") || "il centro d'arrivo";
    return `PERCORSO (rete delle Vie): ${a} → ${b}: ~${Math.round(diretta.km || 0)} km, terreno ${diretta.tipo || "?"}, dislivello ≤ ${diretta.emax ?? "?"} m.`;
  }
  // vie che toccano il centro dell'episodio
  const touch = rete.vie.filter((v) => want.has(nName(v.a)) || want.has(nName(v.b))).slice(0, 2);
  if (!touch.length) return null;
  const dirs = touch.map((v) => {
    const otherRaw = want.has(nName(v.a)) ? v.b || "" : v.a || "";
    const other = nomeCentroSicuro(otherRaw) || "un centro vicino";
    return `${other} (~${Math.round(v.km || 0)} km, ${v.tipo || "?"})`;
  });
  return `PERCORSO (rete delle Vie): da qui si va verso ${dirs.join(" e ")}.`;
}

function secFauna(ep: EpisodeNode, slug: string): { line: string | null; picks: string[] } {
  const { specie } = faunarioRegno(slug);
  if (!specie.length) return { line: null, picks: [] };
  const zonaCap = (ep.zona || "").charAt(0).toUpperCase() + (ep.zona || "").slice(1);
  const inZona = specie.filter((s) => (s.zona || "") === zonaCap);
  const pool = (inZona.length >= 3 ? inZona : specie).filter((s) => s.specie);
  const h = fnv1a32(`${ep.id}|fauna`);
  const picks: FaunaEntry[] = [];
  for (let i = 0; picks.length < Math.min(3, pool.length) && i < pool.length; i++) {
    const cand = pool[(h + i * 7) % pool.length];
    if (!picks.includes(cand)) picks.push(cand);
  }
  const extra = pool[(h + 29) % pool.length];
  const fmt = (s: FaunaEntry) => `${s.specie}${s.classe ? ` (${s.classe})` : ""}`;
  const cand = extra && !picks.includes(extra) ? ` · candidata creatura-di-capitolo: ${fmt(extra)} ⚠` : "";
  return {
    line: `FAUNA DI SFONDO (det. dal faunario, zona ${zonaCap}): ${picks.map(fmt).join(", ")}${cand}.`,
    picks: picks.map((p) => p.specie || ""),
  };
}

function secZona(ep: EpisodeNode, slug: string): string | null {
  const { zone, zoneGeo } = faunarioRegno(slug);
  const zonaCap = (ep.zona || "").charAt(0).toUpperCase() + (ep.zona || "").slice(1);
  const soZona = (societaJson(slug)?.zone || []).find((z) => (z.tipo || "") === zonaCap)?.luogo;
  const descr = zone[zonaCap];
  const geo = zoneGeo.find((z) => (z.tipo || "") === zonaCap)?.luogo;
  const parts = [
    soZona ? `qui: ${cut(applicaLessico(soZona), 90)}` : null,
    descr ? cut(descr, soZona ? 70 : 90) : null,
    geo && geo !== soZona ? `(faunario: ${cut(applicaLessico(geo), 60)})` : null,
  ].filter(Boolean);
  return parts.length ? `ZONA (${zonaCap}): ${parts.join(" — ")}.` : null;
}

function secPresenze(ep: EpisodeNode, slug: string): string | null {
  const so = societaJson(slug);
  if (!so?.classi?.length) return null;
  const h = fnv1a32(`${ep.id}|presenze`);
  const c = so.classi;
  const i1 = h % c.length;
  const i2 = (h >> 3) % c.length;
  const pick = [c[i1], i2 !== i1 ? c[i2] : c[(i2 + 1) % c.length]].filter(Boolean);
  const fmt = (x: NonNullable<Societa["classi"]>[number]) =>
    `${x.nome}${x.animali?.length ? ` (${x.animali[0]})` : ""} — ${cut(x.ruolo_sociale || "", 55)}`;
  const tens = so.tensione_viva ? ` · tensione viva: ${cut(applicaLessico(so.tensione_viva), 110)}` : "";
  return `PRESENZE (società): ${pick.map(fmt).join("; ")}${tens}.`;
}

function secVoci(slug: string): string | null {
  const { voci, trasversali } = vociRegno(slug);
  const entries = Object.entries(voci).slice(0, 3).map(([k, v]) => `${k}: ${cut(v?.registro || "", 55)}`);
  const tras = trasversali.length ? ` · trasversali → ${trasversali.join("; ")}` : "";
  return entries.length ? `VOCI (registri del regno): ${entries.join("; ")}${tras}.` : null;
}

function secMetafore(slug: string): string | null {
  const nome = displayNomeRegno(slug);
  const md = readText("saga/voce/METAFORE.md");
  const m = md.match(/### Per-regno[\s\S]*?(?=\n## )/);
  if (m) {
    const bullets = m[0].split(/\n- \*\*/).slice(1);
    for (const b of bullets) {
      const title = b.split(":**")[0];
      if (norm(nome).startsWith(norm(title.split("(")[0])) || norm(title).includes(norm(nome).split("_")[0])) {
        const body = (b.split(":**")[1] || "").trim();
        if (/^stesso metodo/i.test(body)) break; // bullet collettivo: non formalizzato → fallback
        return `METAFORE LOCALI: ${cut(applicaLessico(body), 160)} (METAFORE §2).`;
      }
    }
  }
  const pc = societaJson(slug)?.principio_calviniano;
  if (pc?.idea) {
    const nomePr = pc.nome ? ` — «${cut(pc.nome, 40)}»` : "";
    return `METAFORE LOCALI (dal principio del regno${nomePr}): ${cut(applicaLessico(pc.idea), 150)} ⚠ da formalizzare in METAFORE §2.`;
  }
  const r = regnoJson(slug);
  const tinta = typeof r?.estetica === "string" ? r.estetica : typeof r?.cultura === "string" ? r.cultura : "";
  return tinta
    ? `METAFORE LOCALI: tinta dal regno — ${cut(applicaLessico(tinta), 110)} ⚠ da formalizzare in METAFORE §2.`
    : `METAFORE LOCALI: ⚠ regno non ancora in METAFORE §2 — tinta da societa.md.`;
}

function secLuogoAntico(ep: EpisodeNode, slug: string): string | null {
  if (!ep.luogo_antico) return null;
  const md = readText("saga/cartografia/luoghi_antichi.md");
  const nome = displayNomeRegno(slug);
  for (const row of md.split("\n")) {
    if (!row.startsWith("|")) continue;
    const cells = row.split("|").map((c) => c.trim());
    if (cells.length < 4) continue;
    if (norm(cells[1]).includes(norm(slug)) || norm(cells[1]).includes(norm(nome)) || norm(nome).includes(norm(cells[1]))) {
      const vista = cells[3];
      if (vista && !/cosa si vede/i.test(vista)) return `LUOGO ANTICO (cosa si vede): ${cut(applicaLessico(vista), 150)}.`;
    }
  }
  return null;
}

// luogo geo: pesca dal canone congelato (geo/INDICE_LUOGHI.json) la cella-griglia,
// il margine dal confine e i luoghi vicini, per il centro/route_from dell'episodio.
// Fonte unica delle coordinate — mai ricalcolata qui, solo letta e messa in brief.
type LuogoIdx = { nome?: string; tipo?: string; regno?: number | string; coord?: [number, number]; cella?: string; margine_km?: number };
type IndiceLuoghi = { luoghi?: LuogoIdx[] };
const REGNO_NUM: Record<string, number> = {
  laghi_occidente: 1, laghi_oriente: 2, pianura_alta: 3, pianura_bassa: 4, selva_di_mezzo: 5, toscana: 6,
};
function indiceLuoghi(): LuogoIdx[] {
  return readJson<IndiceLuoghi>("saga/cartografia/geo/INDICE_LUOGHI.json")?.luoghi || [];
}
function trovaLuogo(nomeGrezzo: string, slug: string): LuogoIdx | null {
  const target = norm(applicaLessico(nomeGrezzo).replace(/\s*\(.*\)$/, ""));
  if (!target) return null;
  const rn = REGNO_NUM[slug];
  const pool = indiceLuoghi().filter((l) => rn == null || l.regno === rn || l.regno === String(rn));
  return (
    pool.find((l) => norm(l.nome || "") === target) ||
    pool.find((l) => norm(l.nome || "").includes(target) || target.includes(norm(l.nome || ""))) ||
    null
  );
}
function secLuogoGeo(ep: EpisodeNode, slug: string): { line: string | null; info: { cella?: string; margine_km?: number; vicini?: string[] } } {
  const nomeCentro = ep.center || ep.route_from || "";
  const qui = trovaLuogo(nomeCentro, slug);
  if (!qui?.cella) return { line: null, info: {} };
  const rn = REGNO_NUM[slug];
  const vicini = indiceLuoghi()
    .filter((l) => l.cella === qui.cella && l.nome !== qui.nome && (rn == null || l.regno === rn || l.regno === String(rn)))
    .slice(0, 3)
    .map((l) => nomeCentroSicuro(l.nome || "") || (l.tipo === "luogo_antico" ? "un Luogo Antico" : null))
    .filter((x): x is string => !!x);
  const margine = typeof qui.margine_km === "number" ? ` · a ${qui.margine_km.toFixed(1)} km dal confine` : "";
  const altrove = vicini.length ? ` · nella stessa cella: ${vicini.join(", ")}` : "";
  return {
    line: `LUOGO (geo, cella ${qui.cella}): coordinate canoniche congelate${margine}${altrove}.`,
    info: { cella: qui.cella, margine_km: qui.margine_km, vicini },
  };
}

function secMorfologia(slug: string): string | null {
  const key = ZONE_KEY_BY_REGNO[slug];
  if (!key) return null;
  const d = readJson<Digest>("saga/cartografia/zones/_digest.json");
  const z = d?.[key];
  if (!z) return null;
  const biomi = Object.entries(z.biomi || {}).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([b]) => b).join("/");
  const range = ZONE_RANGE[key] ? ` ${ZONE_RANGE[key]}` : "";
  const ril = (z.rilievi || []).slice(0, 2).map((r) => {
    const canon = applicaLessico(r.name || "");
    const isCanon = canon !== (r.name || "") || nomiCanonici().has(canon);
    return isCanon && canon ? `${canon} (~${r.quota} m)` : `una cima${range} (~${r.quota} m)`;
  });
  const parts = [
    z.quota_min != null && z.quota_max != null ? `quote ${z.quota_min}–${z.quota_max} m` : null,
    biomi ? `biomi dominanti: ${biomi}` : null,
    z.corsi_acqua ? `corsi d'acqua: ${z.corsi_acqua}` : null,
    ril.length ? `rilievi: ${ril.join(", ")}` : null,
  ].filter(Boolean);
  return parts.length ? `MORFOLOGIA (geo): ${parts.join(" · ")}.` : null;
}

function secCantiere(ep: EpisodeNode): string | null {
  const reg = readJson<{ entities?: Record<string, { name?: string; status?: string; nota?: string }> }>(
    "saga/serializzatore/state/entities.json",
  );
  const ents = (reg as { entities?: Record<string, { name?: string; status?: string; nota?: string }> })?.entities
    || (reg as unknown as Record<string, { name?: string; status?: string; nota?: string }>);
  if (!ents) return null;
  const flags: string[] = [];
  for (const h of [...(ep.cast || []), ...(ep.serpe_face ? [ep.serpe_face] : [])]) {
    const e = ents[h] || ents[`char_${h}`];
    if (!e) continue;
    const marks: string[] = [];
    if ((e.name || "").includes("⚠")) marks.push("nome dal lessico");
    if ((e.nota || "").includes("⚠")) marks.push("scheda mancante");
    if (e.status && e.status !== "confermata") marks.push(`reference ${e.status}`);
    if (marks.length) flags.push(`${(e.name || h).replace(/\s*⚠.*/, "")} (${marks.join(", ")})`);
  }
  const uniq = [...new Set(flags)];
  return uniq.length ? `CANTIERE (da sviluppare, toccati qui): ${uniq.slice(0, 4).join("; ")}.` : null;
}

// comparse d'arco: personaggi già in scena in ALTRI capitoli dello stesso volume —
// richiamabili qui come sfondo/continuità (mai obbligatori: il mondo non si resetta).
function secComparse(
  ep: EpisodeNode,
  graph: SagaGraph,
  canon: Canon,
): { line: string | null; names: string[] } {
  const eps = Object.values(graph.episodes || {}) as EpisodeNode[];
  const inCast = new Set<string>([
    ...(ep.cast || []),
    ...(ep.serpe_face ? [ep.serpe_face, `char_${ep.serpe_face}`] : []),
  ]);
  const skip = new Set(["char_zara", "char_rocco", "char_toraki"]);
  const seen = new Map<string, number>();
  const myOrd = ep.order_in_journey ?? 0;
  for (const e of eps) {
    if (!e || e.arc !== ep.arc || e.id === ep.id) continue;
    if ((e.order_in_journey ?? 0) >= myOrd) continue; // solo chi è GIÀ entrato in scena
    for (const h of e.cast || []) {
      if (skip.has(h) || inCast.has(h)) continue;
      const o = e.order_in_journey ?? 0;
      if (!seen.has(h) || o < (seen.get(h) as number)) seen.set(h, o);
    }
  }
  if (!seen.size) return { line: null, names: [] };
  const reg = canon.entities as unknown as
    | { entities?: Record<string, { name?: string; species?: string }> }
    | Record<string, { name?: string; species?: string }>;
  const ents = ((reg as { entities?: Record<string, { name?: string; species?: string }> })?.entities
    || reg) as Record<string, { name?: string; species?: string }>;
  const picks = [...seen.entries()]
    .sort((a, b) => a[1] - b[1])
    .slice(0, 4)
    .map(([eid]) => {
      const e = ents?.[eid] || {};
      const nome = (e.name || eid).replace(/\s*⚠.*$/, "").trim();
      return e.species ? `${nome} (${e.species})` : nome;
    });
  return {
    line: `COMPARSE D'ARCO (già in scena nel volume, richiamabili come sfondo): ${picks.join(", ")}.`,
    names: picks,
  };
}

// fili aperti «nel frattempo»: semi piantati e non ancora fioriti, debiti aperti,
// ultima traccia di Toraki — la memoria del mondo tra un capitolo e l'altro.
function secFiliAperti(ep: EpisodeNode, graph: SagaGraph): { line: string | null; ids: string[] } {
  const ords = new Map<string, number>();
  for (const [id, e] of Object.entries(graph.episodes || {}))
    ords.set(id, (e as EpisodeNode).order_in_journey ?? 0);
  const my = ords.get(ep.id) ?? ep.order_in_journey ?? 0;
  const epOrd = (sv?: string): number | null => {
    const m = /ep\d+/.exec(sv || "");
    return m ? ords.get(m[0]) ?? null : null;
  };
  const parts: string[] = [];
  const ids: string[] = [];
  const seeds = Object.entries(graph.seeds || {})
    .map(([id, sd]) => {
      const o = sd as { what?: string; planted?: string; blooms?: string };
      return { id, what: o.what || id, po: epOrd(o.planted), bo: epOrd(o.blooms) };
    })
    .filter((x) => x.po != null && (x.po as number) < my && (x.bo == null || (x.bo as number) > my))
    .sort((a, b) => (b.po as number) - (a.po as number))
    .slice(0, 3);
  for (const sd of seeds) {
    parts.push(cut(applicaLessico(sd.what), 70));
    ids.push(sd.id);
  }
  const debtsSrc = (graph as unknown as { debts?: Record<string, { what?: string; opened?: string; closed?: string }> }).debts || {};
  const debts = Object.entries(debtsSrc)
    .map(([id, d]) => ({ id, what: d.what || id, po: epOrd(d.opened), co: epOrd(d.closed) }))
    .filter((x) => x.po != null && (x.po as number) < my && (x.co == null || (x.co as number) > my))
    .slice(0, 1);
  for (const d of debts) {
    parts.push(`debito aperto: ${cut(applicaLessico(d.what), 60)}`);
    ids.push(d.id);
  }
  let torakiId: string | null = null;
  let best = -1;
  for (const e of Object.values(graph.episodes || {}) as EpisodeNode[]) {
    const o = e.order_in_journey ?? 0;
    if (e.toraki_trace && o < my && o > best) {
      best = o;
      torakiId = e.id;
    }
  }
  if (torakiId != null) {
    const d = my - best;
    parts.push(`ultima traccia di Toraki: ${torakiId} (${d} tapp${d === 1 ? "a" : "e"} fa)`);
  }
  if (!parts.length) return { line: null, ids };
  return { line: `FILI APERTI (nel frattempo, nel mondo): ${parts.join(" · ")}.`, ids };
}

// ---------- API ----------
export function buildMondo(
  ep: EpisodeNode,
  canon: Canon,
  graph: SagaGraph,
): { info: MondoInfo; briefBlock: string } {
  const slug = ep.regno || "";
  const r = regnoJson(slug);
  const L: string[] = [];
  const info: MondoInfo = { regno: slug };

  if (r) {
    const tratti = (r.leader?.tratti || []).slice(0, 3).join(", ");
    L.push(
      `REGNO: ${r.nome || slug} — governo: ${cut(r.governo || "?", 60)}${r.leader?.archetipo ? ` — vertice: ${r.leader.archetipo}${tratti ? ` (${tratti})` : ""}` : ""}.`,
    );
    if (r.ruolo_nel_viaggio) L.push(`RUOLO NEL VIAGGIO: ${cut(applicaLessico(r.ruolo_nel_viaggio), 120)}.`);
    if (r.prompt_scrittura_base) L.push(`SCRITTURA (base regno): ${cut(applicaLessico(r.prompt_scrittura_base), 200)}`);
    info.nome = r.nome;
  }
  const push = (x: string | null) => { if (x) L.push(x); };
  push(secZona(ep, slug));
  push(secPercorso(ep));
  push(secLuogoAntico(ep, slug));
  const luogoGeo = secLuogoGeo(ep, slug);
  push(luogoGeo.line);
  if (luogoGeo.info.cella) info.luogo_geo = luogoGeo.info;
  const fauna = secFauna(ep, slug);
  push(fauna.line);
  info.fauna_sfondo = fauna.picks;
  push(secPresenze(ep, slug));
  const comp = secComparse(ep, graph, canon);
  push(comp.line);
  if (comp.names.length) info.comparse = comp.names;
  push(secVoci(slug));
  push(secMetafore(slug));
  push(secMorfologia(slug));
  const fili = secFiliAperti(ep, graph);
  push(fili.line);
  if (fili.ids.length) info.fili_aperti = fili.ids;
  push(secCantiere(ep));

  if (!L.length) return { info, briefBlock: "" };
  const briefBlock = ["## MONDO — il regno vivo (auto, dal canone)", ...L.map((l) => applicaLessico(l))].join("\n");
  info.righe = L.length;
  return { info, briefBlock };
}
