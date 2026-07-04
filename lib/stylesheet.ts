// stylesheet.ts — costanti immagine condivise (SINGLE SOURCE).
// Lo STYLESHEET e le costanti di scena le leggono SIA i prompt-reference (F0.2)
// SIA i prompt-pagina (F1.2): un solo posto, niente drift, e il prefisso identico
// in testa a ogni prompt dà coerenza + cache. Portate 1:1 da Isola (to_manus_prompts.py).

export const WORLD_STYLE: Record<string, string> = {
  animali_del_bosco: "Naturalistic woodland animals with true animal anatomy and posture, gently stylized, never cartoon-flat and never dressed or in costume; a Watership Down spirit with warm Brian Wildsmith colour — cultural, not sartorial, anthropomorphism, at most a small carried object.",
  casa: "Naturalistic children and everyday lived-in settings, gently stylized for warmth, never cartoon-flat.",
  citta: "Naturalistic children in a warm everyday town, gently stylized, never cartoon-flat.",
  spazio: "A gentle near-future space setting, soft and wondrous, naturalistic figures, never glossy sci-fi.",
  sottomarino: "A soft underwater world, light filtering through water, naturalistic sea creatures, never cartoonish.",
  fiabesco: "A quiet grounded fairy-tale world, warm and real, never kitsch fantasy.",
};
export const DEFAULT_WORLD_STYLE = "A warm, naturalistic picture-book world, gently stylized, never cartoon-flat.";

export const SEASON_PALETTE_EN: Record<string, string> = {
  inverno: "Earthy restrained palette with cool whites and soft blues, low clear winter light.",
  primavera: "Earthy restrained palette with tender greens and pale yellows, new mobile spring light.",
  estate: "Earthy restrained palette with warm ochres and full shadows, high summer light.",
  autunno: "Earthy restrained palette with reds, browns and soft grays, low oblique autumn light.",
};

// scala relativa (altezza) per SCALA nei prompt-pagina (F1.2); protagonista = 1.0
export const KIND_SCALE: Record<string, number> = {
  uccello: 0.2, ghiandaia: 0.2, passero: 0.15, gufo: 0.3, corvo: 0.25,
  gatto: 0.3, coniglio: 0.3, riccio: 0.2, scoiattolo: 0.2, volpe: 0.4,
  cane: 0.45, tasso: 0.4, cerbiatto: 0.6, pesce: 0.25,
  adulto: 1.25, bambino: 0.9, bambina: 0.9,
  // — fauna delle Terre Annodate (B2): altezza VISIVA relativa in scena (spalla/testa),
  //   chiavi = specie canoniche di entities.json + _faunario.json. Il contrasto di mole
  //   Rocco ↔ Zara è il motore visivo della saga: la doppia scala va resa in ogni quadro.
  rinoceronte: 1.7, "tigre bianca": 1.0, tigre: 0.95,
  leone: 1.1, leonessa: 1.0, pantera: 0.7, lince: 0.6, "gatto selvatico": 0.35,
  lupo: 0.8, lupa: 0.75, "orso bruno": 1.3, cinghiale: 0.85,
  cervo: 1.2, capriolo: 0.7, camoscio: 0.75, stambecco: 0.9,
  bufalo: 1.5, bue: 1.4, cavallo: 1.5, mulo: 1.2, asino: 1.1,
  dromedario: 1.9, elefantessa: 2.6,
  mastino: 0.8, "cane mastino": 0.8, "cane da pastore": 0.6,
  lontra: 0.35, martora: 0.35, ermellino: 0.2, istrice: 0.4, ghiro: 0.15,
  "scoiattolo rosso": 0.2, marmotta: 0.25, lepre: 0.35, ratto: 0.2, pipistrello: 0.1,
  testuggine: 0.2, rospo: 0.1, rana: 0.08, ramarro: 0.08, granchio: 0.08,
  biscia: 0.15, "biscia (serpe)": 0.15, vipera: 0.1,
  cicala: 0.05, lucciola: 0.03,
  aquila: 0.45, gipeto: 0.5, falco: 0.35, nibbio: 0.35, civetta: 0.2, assiolo: 0.15,
  picchio: 0.15, gazza: 0.25, "gracchio alpino": 0.25, "martin pescatore": 0.12,
  cormorano: 0.5, garzetta: 0.6, "airone cenerino": 0.95, cicogna: 1.0,
  oca: 0.55, anatra: 0.35, gabbiano: 0.35,
};

export interface StylesheetOpts { world?: string; season?: string; ageHint?: number | null; }

export function buildStylesheet(opts: StylesheetOpts): string {
  const world = WORLD_STYLE[opts.world ?? ""] ?? DEFAULT_WORLD_STYLE;
  const palette = SEASON_PALETTE_EN[opts.season ?? ""] ?? "Earthy restrained palette.";
  const ages = typeof opts.ageHint === "number" && opts.ageHint <= 7 ? "ages 4-8" : "ages 5-10";
  return (
    "ART STYLE — fixed for this book:\n" +
    `${world}\n` +
    "Watercolor over fine, slightly textured ink linework; gentle washes, soft " +
    `gradients, visible paper grain. ${palette} Saturation always restrained — ` +
    "never neon, never glossy, never plastic.\n" +
    "Lighting: soft natural light, warm and diffuse, gentle watercolor shadows, " +
    "no harsh contrast, no dramatic chiaroscuro. A serene, lived-in feeling.\n" +
    "PAGE COMPOSITION: keep the upper ~28% of the frame quiet and low-detail " +
    "(open sky, mist, soft wash, plain wall) — this band hosts the page text. " +
    "Faces and key action live in the lower two thirds.\n" +
    "NEGATIVE: NO 3D render, NO photorealistic detail, NO oil-painting heaviness, " +
    "NO anime, NO manga, NO chibi, NO disney/pixar cartoon, NO flat vector, " +
    "NO comic-book style, NO airbrush gloss, NO neon, NO dark gothic, NO horror. " +
    "NO text, NO lettering, NO signs or written words anywhere in the image " +
    "(added later by the book compositor). " +
    `A high-quality contemporary European picture book for ${ages}.`
  );
}
