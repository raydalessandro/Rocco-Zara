// voices.ts — §4 Risoluzione delle VOCI (personaggio → CharacterVoice).
//
// Per OGNI personaggio presente nell'episodio produce un `CharacterVoice`
// (lib/types.ts), che alimenta lib/brief.ts. Due livelli:
//   Tier 2 (ricorrenti): dal blocco ```yaml voce_personaggio``` della scheda.
//   Tier 1 (passaggio):  sintetizzato dal registro-di-gruppo (_voci.json).
// I nomi `<dal lessico>` → nome-segnaposto stabile (handle della scheda), §4.4.

import type { CharacterVoice } from "../../../lib/types";
import type { Canon, CharacterSheet, GroupVoice } from "./types";
import { handleToName, slug } from "./canon";

/** "pianura_alta/il Signore e la Corte" → { regnoKey:"pianura_alta", gruppo:"il Signore e la Corte" }.
 *  "trasversali/forestiera" → { regnoKey:"trasversali", gruppo:"forestiera" }. */
export function parseRegistroRef(ref: string): { regnoKey: string; gruppo: string } | null {
  const i = ref.indexOf("/");
  if (i < 0) return null;
  return { regnoKey: ref.slice(0, i).trim(), gruppo: ref.slice(i + 1).trim() };
}

/** Cerca la voce-di-gruppo in _voci.json, accettando regno per slug o per numero. */
export function lookupGroupVoice(canon: Canon, ref: string): GroupVoice | undefined {
  const parsed = parseRegistroRef(ref);
  if (!parsed) return undefined;
  const { regnoKey, gruppo } = parsed;
  if (regnoKey === "trasversali") {
    return canon.voci.trasversali?.[gruppo];
  }
  // numero diretto ("3") oppure slug ("pianura_alta")
  const regni = canon.voci.regni || {};
  let bucket = regni[regnoKey];
  if (!bucket) {
    for (const k of Object.keys(regni)) {
      if (regni[k]?.nome === regnoKey) {
        bucket = regni[k];
        break;
      }
    }
  }
  return bucket?.voci?.[gruppo];
}

/** Tier 1 — sintesi deterministica del CharacterVoice dal registro-di-gruppo.
 *  Mappa SPEC §4.3: archetype/ritmo/words dal registro/tratti/esempio della classe. */
export function synthTier1(name: string, gv: GroupVoice): CharacterVoice {
  const cv: CharacterVoice = { name, role: "comprimario" };
  const archetype = gv.modello || gv.registro;
  if (archetype) cv.archetype = archetype;
  if (gv.registro) cv.ritmo = gv.registro;
  const words = (gv.tratti || []).filter(Boolean).join(" / ");
  if (words) cv.words = words;
  // Tier 1 non ha "underStress" né "never": campi opzionali, restano assenti.
  return cv;
}

/** Tier 2 — mappa 1:1 il blocco voce_personaggio su CharacterVoice. */
export function fromTier2(castId: string, sheet: CharacterSheet): CharacterVoice {
  const vp = sheet.voce_personaggio!;
  const rawName = (vp.name || "").trim();
  const name = !rawName || rawName === "<dal lessico>" ? handleToName(castId) : rawName;
  const role: CharacterVoice["role"] = vp.role === "protagonista" ? "protagonista" : "comprimario";
  const cv: CharacterVoice = { name, role };
  if (vp.archetype) cv.archetype = vp.archetype;
  if (vp.underStress) cv.underStress = vp.underStress;
  if (vp.ritmo) cv.ritmo = vp.ritmo;
  if (vp.words) cv.words = vp.words;
  if (vp.never) cv.never = vp.never;
  return cv;
}

/** Record del registro-entità per un handle di cast: id diretto o con prefisso char_.
 *  (Il cast[] del grafo usa gli entityId `char_*`; serpe_face/pov usano l'handle corto.) */
export function entityOf(handle: string, canon: Canon): { name?: string; species?: string } | undefined {
  const reg = (canon.entities?.entities || {}) as Record<string, { name?: string; species?: string }>;
  return reg[handle] || reg[`char_${handle}`] || undefined;
}

/** Toglie l'articolo iniziale («il Mastino» → «Mastino») per l'aggancio ai nomi-file. */
function senzaArticolo(s: string): string {
  return (s || "").replace(/^(?:il|lo|la|le|li|i|gli|un|uno|una|l)[-_\s'’]+/i, "");
}
const chiave = (s: string) => slug(senzaArticolo(s));

/** La scheda per un handle di cast: diretta ('zara'), senza prefisso e a meno di
 *  slug ('char_specchio_di_zara'→'specchio-di-zara'), via nome del registro-entità
 *  ↔ basename della scheda («il Mastino» ↔ `il-mastino.md`), o — ultima — per
 *  suffisso UNIVOCO ('arlecchino' ↔ `l-aiutante-arlecchino`; se ambiguo, niente).
 *  È IL join che spegne i fantasmi «Char Zara» (audit di stagione, B1). */
export function sheetOf(handle: string, canon: Canon): CharacterSheet | undefined {
  const corto = handle.replace(/^char_/, "");
  const direct =
    canon.characters[handle] || canon.characters[corto] || canon.characters[slug(corto)];
  if (direct) return direct;
  const want = chiave((entityOf(handle, canon)?.name || "").split("⚠")[0]);
  const keys = Object.keys(canon.characters);
  if (want) {
    for (const key of keys) if (chiave(key) === want) return canon.characters[key];
  }
  const coda = slug(corto);
  if (coda) {
    const suffisso = keys.filter((k) => k === coda || k.endsWith(`-${coda}`));
    if (suffisso.length === 1) return canon.characters[suffisso[0]];
  }
  return undefined;
}

/** Risolve il CharacterVoice di UN personaggio (castId). Tier2 se c'è, altrimenti Tier1,
 *  altrimenti un minimo stabile. `displayName` (se passato) sovrascrive il nome risolto. */
export function resolveCharacterVoice(
  castId: string,
  canon: Canon,
  displayName?: string,
): CharacterVoice {
  const sheet = sheetOf(castId, canon);
  let cv: CharacterVoice;
  if (sheet?.voce_personaggio) {
    cv = fromTier2(sheet.castId || castId, sheet);
  } else if (sheet?.registro_gruppo?.registro_ref) {
    const gv = lookupGroupVoice(canon, sheet.registro_gruppo.registro_ref);
    const name = displayName || displayNameOf(castId, canon);
    cv = gv ? synthTier1(name, gv) : { name, role: "comprimario" };
  } else {
    cv = { name: displayName || displayNameOf(castId, canon), role: "comprimario" };
  }
  if (displayName) cv.name = displayName;
  return cv;
}

/** L'handle del cast usato come chiave-voce (slug stabile). I protagonisti hanno
 *  handle = id; i comprimari = slug del file; serpe_face/episode_creature danno id. */
export function castHandle(id: string): string {
  return id.trim();
}

/** Nome canonico (display) per un castId: scheda → registro-entità → fallback handle
 *  (senza il prefisso `char_`: mai più «Char Zara»). */
export function displayNameOf(castId: string, canon: Canon): string {
  const vp = sheetOf(castId, canon)?.voce_personaggio;
  const raw = (vp?.name || "").trim();
  if (raw && raw !== "<dal lessico>") return raw;
  // il registro-entità può portare annotazioni d'autore («… ⚠nome dal lessico»):
  // sono per il CANTIERE, non per il nome in scena.
  const entName = (entityOf(castId, canon)?.name || "").split("⚠")[0].trim();
  if (entName) return entName;
  return handleToName(castId.replace(/^char_/, ""));
}
