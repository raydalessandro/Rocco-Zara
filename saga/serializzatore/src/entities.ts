// entities.ts — §5 Binding ENTITÀ (registro di reference, coerenza "da serie").
//
// Garantisce che Rocco sia SEMPRE lo stesso entityId fra episodi (e quindi alleghi
// sempre la stessa reference). Le convenzioni di id rispecchiano quelle del motore
// (lib/engine.ts: entityIdOfCharacter / locationEntityId), così il Passo 0 ritrova
// le entità con lo stesso identificatore.

import type { EntityRefRecord } from "../../../lib/types";
import type { Canon, EntityRecord, EntityRegistry } from "./types";
import { slug } from "./canon";

/** id-entità di un personaggio (mirror di lib/engine.ts → entityIdOfCharacter). */
export function characterEntityId(name: string): string {
  return "char_" + slug(name || "anon");
}
/** id-entità di un luogo (mirror di lib/engine.ts → locationEntityId). */
export function locationEntityId(primary: string): string {
  return "luogo_" + slug(primary || "luogo");
}

/** Ritorna il record del registro per un entityId (o undefined). */
export function getRecord(reg: EntityRegistry, entityId: string): EntityRecord | undefined {
  return reg.entities?.[entityId];
}

/** Un'entità è "confermata" (pre-popolabile in story.entities) se ha una reference. */
export function isConfirmed(rec: EntityRecord | undefined): boolean {
  return Boolean(rec && (rec.imageUrl || rec.status === "confermata"));
}

/** Converte un EntityRecord del registro in EntityRefRecord (lib/types.ts).
 *  Se manca la reference, lo status è "da_generare" (il Passo 0 la chiederà). */
export function toRefRecord(rec: EntityRecord): EntityRefRecord {
  const out: EntityRefRecord = {
    id: rec.entityId,
    name: rec.name,
    kind: rec.kind,
    descriptor: rec.descriptor || "",
    status: rec.status || (rec.imageUrl ? "confermata" : "da_generare"),
  };
  if (rec.species) out.species = rec.species;
  if (rec.prohibitions) out.prohibitions = rec.prohibitions;
  if (rec.imageUrl) out.imageUrl = rec.imageUrl;
  return out;
}

/** Pre-popola story.entities dell'episodio: per ogni entityId necessario, usa il
 *  record del registro se esiste (reference già confermata → niente Passo 0), altrimenti
 *  emette un record "da_generare" con il nome noto (entità nuova → conferma una volta). */
export function buildStoryEntities(
  reg: EntityRegistry,
  needed: { entityId: string; name: string; kind: EntityRefRecord["kind"]; species?: string }[],
): EntityRefRecord[] {
  const seen = new Set<string>();
  const out: EntityRefRecord[] = [];
  for (const n of needed) {
    if (seen.has(n.entityId)) continue;
    seen.add(n.entityId);
    const rec = getRecord(reg, n.entityId);
    if (rec) {
      out.push(toRefRecord(rec));
    } else {
      out.push({
        id: n.entityId,
        name: n.name,
        kind: n.kind,
        descriptor: "",
        status: "da_generare",
        ...(n.species ? { species: n.species } : {}),
      });
    }
  }
  return out;
}

/** Helper: nome canonico di un'entità-personaggio dal registro (se presente). */
export function entityNameFromRegistry(canon: Canon, entityId: string): string | undefined {
  return canon.entities.entities?.[entityId]?.name;
}
