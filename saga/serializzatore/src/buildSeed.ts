// buildSeed.ts — §3 il CUORE: episodio + contesto-saga → SeedExt completo.
//
// Il serializzatore fa qui tutto il ragionamento-saga ed emette un SeedExt standard
// (lib/engineTypes.ts) che il motore Scrivia, invariato, espande con buildNode.
// Mappatura campo-per-campo §3.1; POV §3.2; voci §4; entità §5; determinismo §8;
// estensione-contenuti §6 (seed_contents/recurring_motif/debt_content).

import type { CharacterVoice, VoiceOverrides } from "../../../lib/types";
import type {
  Canon,
  EmittedSeed,
  EpisodeNode,
  SagaContext,
  SagaGraph,
} from "./types";
import { resolveCharacterVoice, displayNameOf } from "./voices";
import { characterEntityId, locationEntityId } from "./entities";
import { applyPcg } from "./pcg";

// ---------- tabelle di derivazione (DECISIONI §14) ----------

// §3.2 alternanza del fuoco (MAPPA_CAST §Note): regno → POV di default.
// (Per gli archi "entrambi"/"finale" il default è una scelta stabile; l'episodio può
//  sempre forzare `pov`.)
const POV_BY_REGNO: Record<string, "rocco" | "zara"> = {
  laghi_occidente: "zara", // arco 1 — mette alla prova Zara
  laghi_oriente: "rocco", // arco 2 — mette alla prova Rocco
  pianura_alta: "rocco", // arco 3 — casa di Rocco
  pianura_bassa: "zara", // arco 4 — il fondo di Zara
  selva_di_mezzo: "rocco", // arco 5 — entrambi → default Rocco
  toscana: "rocco", // arco 6 — finale → default Rocco
};

// §14.2 theme di fallback dall'attributo EAR dominante.
const ATTR_THEME: Record<string, string> = {
  distinguere: "scoperta",
  connettere: "amicizia",
  cambiare: "crescere",
};

// §3 time_span_arc: mappa dal tipo-episodio (deterministica).
const TYPE_TIME_SPAN: Record<string, string> = {
  respiro: "un_pomeriggio",
  stazione: "un_giorno",
  viaggio: "un_giorno",
  cardine: "piu_giorni",
};

// figure "sagge" (abilitano closure_type 1 nel motore): handle che le segnalano.
const SAGE_HINTS = ["custode", "anziano", "antico", "antichi", "memoria", "voce-che-torna"];

// assi-voce del MOTORE (engine) ammessi in seed.voice (VoiceOverrides).
const ENGINE_VOICE_AXES = new Set([
  "temperamento",
  "ritmo",
  "distanza",
  "lente_sensoriale",
  "umorismo",
]);

// ---------- helpers ----------

/** hash 32-bit FNV-1a (deterministico, stabile) per il nonce §8. */
export function fnv1a32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function deriveNonce(ep: EpisodeNode, graph: SagaGraph): number {
  if (typeof ep.seed_nonce === "number" && ep.seed_nonce > 0) return ep.seed_nonce >>> 0;
  const n = fnv1a32(`${ep.id}@${graph.graph_version || "0"}`) >>> 0;
  return n === 0 ? 1 : n;
}

function regnoNome(canon: Canon, regnoId: string): string {
  const r = (canon.config.cartografia?.regni || []).find((x) => x.id === regnoId);
  return r?.nome || regnoId;
}

function speciesOf(castId: string, canon: Canon): string {
  const sheet = canon.characters[castId];
  return sheet?.species || "";
}

/** humanizza un id-luogo ("collina_incontro" → "Collina Incontro"). */
function humanizePlace(id: string): string {
  return (id || "")
    .split(/[-_]/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** POV dell'episodio (§3.2): campo esplicito → default d'arco → default per regno. */
export function resolvePov(ep: EpisodeNode, graph: SagaGraph): "rocco" | "zara" {
  const explicit = ep.pov === "rocco" || ep.pov === "zara" ? ep.pov : undefined;
  const arcDefault = graph.arcs?.[ep.arc]?.pov_default;
  const arcPov = arcDefault === "rocco" || arcDefault === "zara" ? arcDefault : undefined;
  return explicit ?? arcPov ?? POV_BY_REGNO[ep.regno] ?? "rocco";
}

/** Selezione deterministica del ritornello attivo (§3 recurring_motif). */
function pickRitornelloEssence(ep: EpisodeNode, canon: Canon): string | undefined {
  const byN = (n: number) => canon.ritornelli.find((r) => r.n === n)?.essence;
  if (ep.nodo_cordone?.annodato_qui) return byN(5) || byN(1); // consegna / cordone
  if (ep.luogo_antico) return byN(2) || byN(1); // pietra tiepida e segni
  if (ep.toraki_trace) return byN(4); // tracce di Toraki
  return byN(3); // l'ombra di Rocco (amicizia) — default caldo
}

/** Costruisce la nota-narratore d'autore (CARTA_VOCE + note + pagamento-semi §6.1). */
function buildNarratorBrief(ep: EpisodeNode, canon: Canon, graph: SagaGraph): string {
  const L: string[] = [];
  const cv = canon.cartaVoce || {};
  // luce scelta dal bioma (mappatura nativa R&Z)
  const luceByBioma: Record<string, string> = {
    foresta: "bosco",
    savana: "aperto",
    roccia: "pietra",
    rovina: "pietra",
    acqua: "aperto",
    umido: "bosco",
  };
  const ind = { ...(cv.indirizzo_default || {}) };
  if (ep.bioma && luceByBioma[ep.bioma]) ind.luce = luceByBioma[ep.bioma];

  if (Array.isArray(cv.universali) && cv.universali.length) {
    L.push("Universali di voce:");
    for (const u of cv.universali) L.push(`- ${u}`);
  }
  const indParts = Object.keys(ind).map((k) => `${k}=${ind[k]}`);
  if (indParts.length) L.push(`Indirizzo: ${indParts.join(" · ")}.`);

  if (Array.isArray(ep.voice_notes_essential) && ep.voice_notes_essential.length) {
    L.push("Note di voce essenziali:");
    for (const n of ep.voice_notes_essential) L.push(`- ${n}`);
  }
  if (Array.isArray(ep.active_constraints_touched) && ep.active_constraints_touched.length) {
    L.push(`Vincoli attivi qui: ${ep.active_constraints_touched.join("; ")}.`);
  }
  // §6.1 — semi che FIORISCONO qui (piantati prima): nota di pagamento al brief.
  const bloomed = Array.from(
    new Set([...(ep.seeds_bloomed || []), ...(ep.effects?.seeds_bloomed || [])]),
  );
  for (const id of bloomed) {
    const s = graph.seeds?.[id];
    const where = s?.planted ? ` piantato in ${s.planted}` : "";
    L.push(`Paga qui il seme \`${id}\`${where}: ${s?.what ?? "(contenuto non in registro)"}.`);
  }
  return L.join("\n");
}

// ---------- §3.1 la mappatura ----------

export function buildSeed(
  episodeId: string,
  graph: SagaGraph,
  ctx: SagaContext,
  canon: Canon,
): EmittedSeed {
  const ep = graph.episodes?.[episodeId];
  if (!ep) throw new Error(`buildSeed: episodio '${episodeId}' assente dal grafo.`);

  // --- POV / protagonista / compagno ---
  const povId = resolvePov(ep, graph);
  const otherId = povId === "rocco" ? "zara" : "rocco";

  const protName = displayNameOf(povId, canon);
  const protSpecies = speciesOf(povId, canon) || "animale";
  const protAge = canon.characters[povId]?.nominalAge ?? null;
  const protEntityId = characterEntityId(protName);

  // --- compagni: altro protagonista + serpe_face + cast[] (dedup per entityId) ---
  const companionHandles: string[] = [otherId];
  if (ep.serpe_face) companionHandles.push(ep.serpe_face);
  for (const h of ep.cast || []) companionHandles.push(h);

  const seenEntity = new Set<string>([protEntityId]);
  const companions: { name: string; kind: string; entityId: string }[] = [];
  for (const h of companionHandles) {
    const name = displayNameOf(h, canon);
    const eid = characterEntityId(name);
    if (seenEntity.has(eid)) continue;
    seenEntity.add(eid);
    companions.push({ name, kind: speciesOf(h, canon), entityId: eid });
  }

  // --- mondo / setting ---
  const regnoLabel = regnoNome(canon, ep.regno);
  const world_flavor = `${regnoLabel} · ${ep.zona} · ${ep.bioma}`;
  const primaryRaw = ep.location_primary || ep.center || `${regnoLabel} — ${ep.zona}`;
  const primary = ep.location_primary || ep.center ? humanizePlace(primaryRaw) : primaryRaw;
  const settingEntityId = locationEntityId(ep.center || ep.location_primary || primary);
  const settingNotes = `${ep.zona} · ${ep.bioma}${ep.luogo_antico ? ` · Luogo Antico: ${humanizePlace(ep.luogo_antico)}` : ""}`;

  // --- spina ---
  const spine = {
    premise: ep.premise || "",
    problem: ep.problem || "",
    threshold_moment: ep.threshold_moment || "",
    resolution_mode: ep.resolution_mode || "",
    closure: "", // direzione-chiusura opzionale; il numero va in overrides.closure_type
  };

  // --- theme / pugno / personal_detail (§14.2 fallback derivato) ---
  const theme = (ep.theme || ATTR_THEME[ep.attribute_dominant] || "").trim();
  const pugno = (ep.pugno || ep.palette_emotiva || "").trim();
  const personal_detail = (ep.personal_detail || ep.voice_notes_essential?.[0] || "").trim();

  // --- pagine ---
  const wpp = 70; // words_per_page_avg (motore) — solo per la conversione; il motore clampa
  const pagesDefault = canon.config.episode_spine?.pages_default ?? 12;
  const length_pages = ep.estimated_length
    ? Math.max(1, Math.round(ep.estimated_length / wpp))
    : pagesDefault;

  // --- voce (VoiceOverrides) — solo override d'asse-MOTORE espliciti; default {} ---
  const voice: VoiceOverrides = {};
  for (const [k, v] of Object.entries(ep.voice_overrides || {})) {
    if (ENGINE_VOICE_AXES.has(k) && v) (voice as Record<string, string>)[k] = v;
  }

  // --- determinismo (§8) ---
  const nonce = deriveNonce(ep, graph);

  // --- voci-personaggio (§4) ---
  const characterVoices: CharacterVoice[] = [];
  const seenVoiceName = new Set<string>();
  const pushVoice = (cvv: CharacterVoice) => {
    if (seenVoiceName.has(cvv.name)) return;
    seenVoiceName.add(cvv.name);
    characterVoices.push(cvv);
  };
  // pov + other come protagonisti
  pushVoice({ ...resolveCharacterVoice(povId, canon, protName), role: "protagonista" });
  pushVoice({ ...resolveCharacterVoice(otherId, canon, displayNameOf(otherId, canon)), role: "protagonista" });
  // comprimari presenti
  for (const c of companions) {
    if (c.name === protName) continue;
    const handle = ep.serpe_face && displayNameOf(ep.serpe_face, canon) === c.name
      ? ep.serpe_face
      : (ep.cast || []).find((h) => displayNameOf(h, canon) === c.name) || c.name;
    if (handle === displayNameOf(otherId, canon) || handle === otherId) continue;
    pushVoice(resolveCharacterVoice(handle, canon, c.name));
  }

  // --- narratorBrief (§3) ---
  const narratorBrief = buildNarratorBrief(ep, canon, graph);

  // --- overrides (i knob del motore) ---
  const overrides: NonNullable<EmittedSeed["overrides"]> = {
    attribute_dominant: ep.attribute_dominant,
    entry_point_type: ep.entry_point_type,
    closure_type: ep.closure_type,
    register: ep.register,
    time_span_arc: TYPE_TIME_SPAN[ep.type] || undefined,
  };

  // --- estensione-contenuti (§6): semi/motivo/debito ---
  const seed_contents: string[] = (ep.seeds_planted || []).map(
    (id) => graph.seeds?.[id]?.what ?? `[${id}]`,
  );
  const recurring_motif = pickRitornelloEssence(ep, canon);
  const openedHere = ep.debts_opened?.[0];
  const debt_content = openedHere
    ? graph.debts?.[openedHere]?.what
    : ctx.openDebts[0]?.what;

  // --- has_sage_figure ---
  const presentHandles = [povId, otherId, ...(ep.cast || []), ...(ep.serpe_face ? [ep.serpe_face] : [])];
  const has_sage_figure = presentHandles.some((h) =>
    SAGE_HINTS.some((s) => h.toLowerCase().includes(s)),
  );

  const seed: EmittedSeed = {
    id: ep.id,
    language: canon.config.saga?.language || "it",
    title: ep.title,
    protagonist: { name: protName, age: protAge, kind: protSpecies, entityId: protEntityId },
    companions,
    world_flavor,
    setting: { primary, notes: settingNotes, entityId: settingEntityId },
    theme,
    pugno,
    personal_detail,
    length_pages,
    packs: [],
    spine,
    voice,
    nonce,
    characterVoices,
    narratorBrief,
    overrides,
    seed_contents,
    has_sage_figure,
  };
  // campi additivi solo se valorizzati (così il golden resta pulito)
  if (recurring_motif) seed.recurring_motif = recurring_motif;
  if (debt_content) seed.debt_content = debt_content;

  // PCG: condizionamento dallo STATO accumulato (nonce dallo stato + indirizzo focal dalle
  // bande di crescita + nota di convergenza). Sovrascrive il nonce id@graph_version qui sopra.
  return applyPcg(seed, ep, ctx, graph, canon);
}

/** Entità in scena dell'episodio (per pre-popolare story.entities, §5). */
export function episodeEntityNeeds(
  seed: EmittedSeed,
): { entityId: string; name: string; kind: "character" | "location"; species?: string }[] {
  const needs: { entityId: string; name: string; kind: "character" | "location"; species?: string }[] = [];
  needs.push({
    entityId: seed.protagonist.entityId!,
    name: seed.protagonist.name,
    kind: "character",
    species: seed.protagonist.kind,
  });
  for (const c of seed.companions) {
    needs.push({ entityId: c.entityId!, name: c.name, kind: "character", species: c.kind });
  }
  needs.push({ entityId: seed.setting.entityId!, name: seed.setting.primary, kind: "location" });
  return needs;
}
