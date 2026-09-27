// cartoni/scene/palco.ts — il palco: un luogo messo in scena a un tempo t.
//
// Il palco è un luogo in sezione, a strati di parallasse: la camera ci passa
// davanti e i lontani scorrono piano. L'ordine dei livelli è sempre lo stesso,
// qualunque sia il luogo:
//
//   cielo (a schermo) → i lontanissimi del luogo (monti…) → il temporale →
//   i lontani del luogo (acqua, pianure, boschi…) → [extra dietro] →
//   il suolo (terreno + cespugli + canneto + oggetti) → [extra] → gli attori →
//   l'erba del crinale → [attori davanti] → [la piena, e quel che le sta sopra] →
//   [primo piano] → la pioggia.
//
// Tutto è funzione di (luogo, camera, t, luce, meteo): niente stato.

import { type Livello, vista } from "../motore/fotogramma";
import type { OpzPalco } from "./luogo";
import { bancoTemporale, canneto, cespugli, cielo, piena, pioggia, primoPiano, terreno } from "./pittura";

/** Tutti i livelli del palco, dal cielo al primo piano. */
export function palco(o: OpzPalco): Livello[] {
  const { cam, luogo } = o;
  const v1 = vista(cam, 1, 0.25);
  const { terra, fronda } = terreno(o);
  // le cose del luogo, solo se in vista
  const inVista = (x: number, m = 400) => x > v1.x0 - m && x < v1.x1 + m;
  const oggetti = luogo.oggetti(o, inVista);
  const liv: Livello[] = [
    { id: "cielo", contenuto: cielo(o), schermo: true },
    ...luogo.lontanissimo(o),
    { id: "temporale", contenuto: bancoTemporale(o), schermo: true },
    ...luogo.lontano(o),
    ...(o.extraDietro ?? []),
    { id: "suolo", contenuto: terra + cespugli(o, v1) + canneto(o, v1) + oggetti, p: 1 },
    ...(o.extra ?? []),
    { id: "attori", contenuto: o.attori ?? "", p: 1 },
    { id: "fronda", contenuto: fronda, p: 1 },
    { id: "davanti", contenuto: (luogo.davanti?.(o, inVista) ?? "") + (o.attoriDavanti ?? ""), p: 1 },
  ];
  // la piena (ep04): l'acqua alta davanti al piano dei personaggi, e la schiuma del luogo
  if (o.piena) liv.push({ id: "piena", contenuto: piena(o) + (luogo.sullaPiena?.(o, inVista) ?? ""), p: 1 });
  if (o.primoPiano) liv.push({ id: "primo", contenuto: primoPiano(o, 1.7), p: 1.7 });
  liv.push({ id: "pioggia", contenuto: pioggia(o), schermo: true });
  return liv;
}

/** Colore di sfondo di sicurezza (sotto il cielo). */
export const SFONDO = "#1d1b17";
