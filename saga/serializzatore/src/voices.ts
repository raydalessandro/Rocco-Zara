// voices.ts — §4 Risoluzione delle VOCI (personaggio → CharacterVoice).
//
// Per OGNI personaggio presente nell'episodio produce un `CharacterVoice`
// (lib/types.ts), che alimenta lib/brief.ts. Due livelli:
//   Tier 2 (ricorrenti): dal blocco ```yaml voce_personaggio``` della scheda.
//   Tier 1 (passaggio):  sintetizzato dal registro-di-gruppo (_voci.json).
// I nomi `<dal lessico>` → nome-segnaposto stabile (handle della scheda), §4.4.

import type { CharacterVoice } from "../../../lib/types";
import type { Canon, CharacterSheet, GroupVoice } from "./types";
import { handleToName } from "./canon";

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

/** Risolve il CharacterVoice di UN personaggio (castId). Tier2 se c'è, altrimenti Tier1,
 *  altrimenti un minimo stabile. `displayName` (se passato) sovrascrive il nome risolto. */
export function resolveCharacterVoice(
  castId: string,
  canon: Canon,
  displayName?: string,
): CharacterVoice {
  const sheet = canon.characters[castId];
  let cv: CharacterVoice;
  if (sheet?.voce_personaggio) {
    cv = fromTier2(castId, sheet);
  } else if (sheet?.registro_gruppo?.registro_ref) {
    const gv = lookupGroupVoice(canon, sheet.registro_gruppo.registro_ref);
    const name = displayName || handleToName(castId);
    cv = gv ? synthTier1(name, gv) : { name, role: "comprimario" };
  } else {
    cv = { name: displayName || handleToName(castId), role: "comprimario" };
  }
  if (displayName) cv.name = displayName;
  return cv;
}

/** L'handle del cast usato come chiave-voce (slug stabile). I protagonisti hanno
 *  handle = id; i comprimari = slug del file; serpe_face/episode_creature danno id. */
export function castHandle(id: string): string {
  return id.trim();
}

/** Nome canonico (display) per un castId, da scheda o dal fallback handle. */
export function displayNameOf(castId: string, canon: Canon): string {
  const vp = canon.characters[castId]?.voce_personaggio;
  const raw = (vp?.name || "").trim();
  if (raw && raw !== "<dal lessico>") return raw;
  return handleToName(castId);
}
