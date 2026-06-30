// types.ts — Tipi LATO-SAGA del serializzatore (§9 SPEC).
//
// Sono il vocabolario del livello-saga (grafo episodi, contesto/fold, verdetto,
// canone-lore). NON ridefiniscono nulla del motore: il contratto di OUTPUT verso il
// motore resta `SeedExt` (lib/engineTypes.ts), che importiamo dove serve.
//
// Confine (regola d'oro §0): qui non si tocca lib/. Si CONSUMA il motore.

import type { SeedExt } from "../../../lib/engineTypes";
import type { EntityRefRecord } from "../../../lib/types";

// ============================================================================
// 1) GRAFO EPISODI  (saga/trama/saga_graph.json — schema: schema_episodio.md)
// ============================================================================

/** Un delta di crescita (arco lungo) — entra nel fold solo se threshold_crossed. */
export interface GrowthDelta {
  who: string;
  axis: string;
  delta: string; // es. "+1"
  threshold_crossed?: boolean;
}
export interface FearDelta {
  who: string;
  fear: string;
  status?: string; // "implicita" | "esplicita" | ...
  threshold_crossed?: boolean;
}
export interface RelationDelta {
  between: string[];
  delta: string;
  threshold_crossed?: boolean;
}
export interface WorldDelta {
  place: string;
  change: string;
  threshold_crossed?: boolean;
}
export interface CreatureStatusDelta {
  id: string;
  status: string; // "introdotta" | "ricorrente" | "congedata" | ...
}

export interface EpisodeEffects {
  growth?: GrowthDelta[];
  fear?: FearDelta[];
  relation?: RelationDelta[];
  world?: WorldDelta[];
  creature_status?: CreatureStatusDelta[];
  // i seguenti sono ridondanti coi campi seeds_*/debts_* del nodo, ma lo schema li
  // ammette dentro effects: li accettiamo entrambi (l'unione è il fold).
  seeds_planted?: string[];
  seeds_bloomed?: string[];
  debts_opened?: string[];
  debts_closed?: string[];
}

export interface EpisodeCreature {
  id: string;
  species?: string;
  first_seen?: boolean;
  becomes_recurring?: boolean;
}

export interface NodoCordone {
  annodato_qui: boolean;
  regno?: string;
}

/** Un nodo-episodio. I campi *opzionali nuovi* (pov/theme/pugno/personal_detail/
 *  seed_nonce/cast/voice_overrides) sono le DECISIONI §14 adottate: opzionali, con
 *  fallback derivato. Tutto il resto rispecchia 1:1 schema_episodio.md. */
export interface EpisodeNode {
  id: string;
  title: string;
  arc: string;
  type: "stazione" | "viaggio" | "cardine" | "respiro" | string;
  order_in_journey: number;

  // ancora nel mondo
  regno: string;
  zona: string;
  bioma: string;
  center?: string;
  route_from?: string;
  location_primary?: string;
  locations_secondary?: string[];

  // spina autoconclusiva
  attribute_dominant: string; // distinguere | connettere | cambiare
  premise: string;
  problem: string;
  threshold_moment: string;
  resolution_mode: string;
  closure_type: number; // 1..7
  entry_point_type: string; // A..F
  register: string; // basso | medio | alto
  estimated_length?: number;

  // creatura dell'episodio
  episode_creature?: EpisodeCreature;

  // continuità
  seeds_planted?: string[];
  seeds_bloomed?: string[];
  callbacks?: string[];
  debts_opened?: string[];
  debts_closed?: string[];

  // missione / cordone
  luogo_antico?: string;
  nodo_cordone?: NodoCordone;
  toraki_trace?: boolean;
  serpe_face?: string; // handle del cast (artiglio|cecca|mastino|sorcio|...)

  // effects / delta
  effects?: EpisodeEffects;

  // voce & vincoli
  palette_emotiva?: string;
  voice_notes_essential?: string[];
  active_constraints_touched?: string[];

  // --- DECISIONI §14 (campi nuovi opzionali, con fallback derivato) ---
  /** §3.2 POV dell'episodio. Se assente: default per arco (alternanza del fuoco). */
  pov?: "rocco" | "zara" | string;
  /** §14.2 theme/pugno/personal_detail: campi nuovi opzionali, fallback derivato. */
  theme?: string;
  pugno?: string;
  personal_detail?: string;
  /** §8 nonce esplicito (vince su hash(id+graph_version)). */
  seed_nonce?: number;
  /** §4.5 cast presente: handle delle schede dei comprimari in scena. */
  cast?: string[];
  /** override degli assi-voce del MOTORE (engine axes), se l'autore vuole forzarli. */
  voice_overrides?: Record<string, string>;
}

export interface SeedRegistryEntry {
  id: string;
  what: string;
  kind?: string;
  planted?: string; // episodeId dove è piantato
  bloom_target?: string; // episodeId atteso di fioritura
  bloomed_at?: string; // episodeId dove ha fiorito (scritto da applyEffects)
}
export interface DebtRegistryEntry {
  id: string;
  what: string;
  kind?: string;
  opened?: string; // episodeId
  window?: number; // entro quanti episodi va chiuso
  closed?: string; // episodeId (se chiuso)
}
export interface CreatureRegistryEntry {
  id: string;
  species?: string;
  returns?: number;
}

export interface SagaGraph {
  schema_version?: string;
  graph_version: string;
  saga?: string;
  arcs: Record<string, ArcInfo>;
  episodes: Record<string, EpisodeNode>;
  seeds: Record<string, SeedRegistryEntry>;
  callbacks?: Record<string, unknown>;
  debts: Record<string, DebtRegistryEntry>;
  creatures: Record<string, CreatureRegistryEntry>;
  world_state_baselines: Record<string, unknown>;
}

export interface ArcInfo {
  id?: string;
  title?: string;
  regno?: string;
  order?: number;
  pov_default?: "rocco" | "zara" | string;
}

// ============================================================================
// 2) CONTESTO-SAGA / FOLD  (§7)
// ============================================================================

export interface OpenSeed {
  id: string;
  planted: string;
  bloom_target?: string;
  what: string;
}
export interface OpenDebt {
  id: string;
  opened: string;
  window?: number;
  what: string;
}
export interface CordoneState {
  nodi_annodati: string[]; // regni i cui nodi sono già saldati
  prossimo?: string; // prossimo regno-nodo lungo la rotta
}

/** Snapshot di stato a N (forma machine-readable §7). Compatto e ricostruibile. */
export interface Snapshot {
  at_episode: string;
  arc: string;
  protagonists: Record<string, Record<string, string>>; // who -> { axis: "+3(soglia)" }
  fears: Record<string, Record<string, string>>; // who -> { fear: status }
  relations: Record<string, string>; // "rocco|zara" -> delta-cumulato
  world: Record<string, string>; // place -> stato
  open_seeds: OpenSeed[];
  open_debts: OpenDebt[];
  recurring_creatures: { id: string; returns: number }[];
  cordone: CordoneState;
}

/** Canone FISSO pinnato a inizio-arco (la baseline che l'episodio non può smentire). */
export interface FixedCanon {
  arc: string;
  cordone: CordoneState;
}

/** Il contesto-saga a N (firma §9): { snapshot, openSeeds, openDebts, fixedCanon }. */
export interface SagaContext {
  atEpisode: string;
  n: number;
  snapshot: Snapshot;
  openSeeds: OpenSeed[];
  openDebts: OpenDebt[];
  fixedCanon: FixedCanon;
}

// ============================================================================
// 3) CANONE-LORE  (il bundle statico che buildSeed consuma)
// ============================================================================

/** Una scheda-personaggio (blocco-macchina dalle bible: voce_personaggio + registro_gruppo). */
export interface CharacterSheet {
  castId: string; // handle stabile (slug del file o id protagonista)
  filePath?: string;
  registro_gruppo?: {
    regno?: string;
    gruppo?: string;
    registro_ref?: string;
  };
  voce_personaggio?: {
    name?: string;
    role?: "protagonista" | "comprimario" | string;
    archetype?: string;
    underStress?: string;
    ritmo?: string;
    words?: string;
    never?: string;
  };
  /** repertorio focal per banda di crescita (PCG): axis → { prima|attraversa|dopo: verbi
   *  fisici }. Qualitativo → vive nella bible (blocco-macchina fratello di voce_personaggio),
   *  letto da canon.ts; lo consuma saga/serializzatore/src/pcg.ts (focalDirections). */
  repertorio_crescita?: Record<string, { prima?: string[]; attraversa?: string[]; dopo?: string[] }>;
  /** età nominale (per i protagonisti; il register è comunque sovrascritto). */
  nominalAge?: number | null;
  /** specie (kind) dichiarata nella scheda, se nota. */
  species?: string;
}

/** Una voce-di-gruppo (Tier 1) da _voci.json. */
export interface GroupVoice {
  modello?: string;
  tipo_modello?: string;
  registro?: string;
  tratti?: string[];
  in_rima?: boolean;
  esempio_in_voce?: string;
  intensita?: string;
}

export interface VociFile {
  regni: Record<
    string,
    { nome?: string; voci: Record<string, GroupVoice> }
  >;
  trasversali: Record<string, GroupVoice>;
}

/** Il blocco carta_voce (CARTA_VOCE.md §4) — assi NATIVI R&Z (respiro/luce/narratore/verso). */
export interface CartaVoce {
  id?: string;
  versione?: string;
  universali?: string[];
  indirizzo_default?: Record<string, string>;
  preset?: Record<string, Record<string, string>>;
  // gli `assi` sono freeform e li teniamo grezzi per il narratorBrief
  assi?: Record<string, unknown>;
  [k: string]: unknown;
}

export interface Ritornello {
  n: number;
  title: string;
  funzione?: string;
  essence: string; // sintesi breve (1ª riga utile) per il recurring_motif
}

/** Un record del registro entità persistente (state/entities.json). */
export interface EntityRecord {
  entityId: string;
  name: string;
  kind: "character" | "location" | "object";
  species?: string;
  descriptor?: string;
  /** reference confermata (foglio visivo) — se presente, pre-popola story.entities. */
  imageUrl?: string;
  status?: EntityRefRecord["status"];
  prohibitions?: string[];
}

export interface EntityRegistry {
  version?: string;
  entities: Record<string, EntityRecord>;
}

/** Frammenti del saga_config.yaml che il serializzatore consuma. */
export interface SagaConfig {
  saga?: { language?: string; id?: string; title?: string; nome_mondo?: string };
  episode_spine?: {
    attribute_dominant?: string[];
    entry_point_type?: string[];
    closure_type?: number[];
    register?: string[];
    pages_default?: number;
  };
  protagonists?: { id: string; species?: string; ear?: string; origin_regno?: string; origin_bioma?: string }[];
  missione?: {
    oggetto?: string;
    terminus?: string;
    rotta?: string[];
    nodi_totali?: number;
  };
  cartografia?: {
    regni?: { id: string; nome?: string; stemma?: string; capitale?: string }[];
    zone_grammar?: string[];
    biomes?: string[];
  };
  saga_quotas?: {
    recurring_creature_returns_max?: number;
    same_episode_type_in_window?: { window?: number; max_same?: number };
    lexicon?: string[];
  };
  world_rules?: Record<string, string>;
  [k: string]: unknown;
}

/** Il bundle-lore passato a buildSeed (firma §9, arg `canon`). */
export interface Canon {
  root: string;
  config: SagaConfig;
  voci: VociFile;
  cartaVoce: CartaVoce;
  characters: Record<string, CharacterSheet>; // castId -> scheda
  ritornelli: Ritornello[];
  entities: EntityRegistry;
}

// ============================================================================
// 4) VERDETTO AUDIT  (§10, stile critic_verdict.json)
// ============================================================================

export interface SagaCheck {
  key: string;
  label: string;
  pass: boolean;
  note: string;
}
export interface EpisodeFlag {
  episode: string;
  severity: "info" | "warn" | "error" | string;
  issue: string;
}
export interface SagaVerdict {
  verdict: "PASS" | "FAIL" | null;
  checks: SagaCheck[];
  episode_flags: EpisodeFlag[];
}

// ============================================================================
// 5) RECAP D'ARCO  (§7)
// ============================================================================

export interface ArcRecap {
  arc: string;
  at: string; // ultimo episodio dell'arco
  baseline: Snapshot;
}

// ============================================================================
// 6) OUTPUT EMESSO  (SeedExt + id episodio, letto dal motore via `node.id`)
// ============================================================================

/** Ciò che il serializzatore EMETTE: un SeedExt + `id` (il motore fa node.id = seed.id).
 *  `EmittedSeed` è un superset di SeedExt: assegnabile dove serve un SeedExt. */
export type EmittedSeed = SeedExt & { id: string };
