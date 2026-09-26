// cartoni/render/suona.ts — scrive la colonna sonora di un episodio in WAV.
//
//   npx tsx cartoni/render/suona.ts --episodio ep01 [--narratrice] [--uscita cartoni/out/ep01.wav]
//
// Musica (episodi/<id>/partitura.ts), effetti e ambiente dal copione, il
// grammelot dei personaggi, e — con --narratrice — le riprese della voce
// narrante (episodi/<id>/voce/narrazione.json; per leggerle serve ffmpeg).

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { VOCI } from "../cast/voci";
import { colonna, wav } from "../audio/colonna";
import { battute } from "../audio/grammelot";
import { CALORE_BASE, type Calore, narrazione } from "../audio/narratrice";
import { Bus, SR } from "../audio/sintesi";
import { durata, type Episodio } from "../motore/montaggio";
import type { Narrazione } from "../motore/voce";
import { conLeVoci } from "../player/cartone";

const RADICE = resolve(__dirname, "../..");
const arg = (nome: string, def?: string) => {
  const i = process.argv.indexOf(`--${nome}`);
  return i >= 0 ? process.argv[i + 1] : def;
};
const flag = (nome: string) => process.argv.includes(`--${nome}`);

/** Legge una ripresa (qualunque formato ffmpeg capisca) come campioni mono a 48 kHz. */
function leggiRipresa(file: string): Float32Array {
  const buf = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-f", "f32le", "-ac", "1", "-ar", String(SR), "-"], { maxBuffer: 1 << 28 });
  return new Float32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

async function main(): Promise<void> {
  const id = arg("episodio");
  if (!id) throw new Error("uso: suona.ts --episodio ep01 [--narratrice] [--uscita file.wav]");
  const cartella = join(RADICE, "cartoni/episodi", id);
  const ep: Episodio = (await import(join(cartella, "copione.ts"))).default;
  const musica = (await import(join(cartella, "partitura.ts"))).default;
  const conNarratrice = flag("narratrice");
  const uscita = resolve(arg("uscita", `cartoni/out/${id}${conNarratrice ? "_narrato" : ""}.wav`)!);
  let narr: Narrazione | null = null;
  if (conNarratrice) {
    const f = join(cartella, "voce/narrazione.json");
    if (!existsSync(f)) throw new Error(`nessuna ripresa della narratrice: manca ${f} (npx tsx cartoni/render/narra.ts --episodio ${id})`);
    narr = JSON.parse(readFileSync(f, "utf8")) as Narrazione;
  }
  const t0 = Date.now();
  const epV = conLeVoci(ep, narr);
  if (epV.senzaRipresa.length) console.warn(`⚠ ${epV.senzaRipresa.length} pezzi di narrazione senza ripresa (restano solo scritti):\n  ${epV.senzaRipresa.join("\n  ")}`);
  const voci = new Bus(durata(epV) + 3);
  battute(voci, epV.voci, VOCI);
  if (narr) {
    const saga = JSON.parse(readFileSync(join(RADICE, "cartoni/voce/voce.json"), "utf8")) as { calore?: Calore };
    const riprese = new Map<string, Float32Array>();
    for (const e of epV.voci) {
      if (e.clip && !riprese.has(e.clip.file)) riprese.set(e.clip.file, leggiRipresa(join(cartella, "voce", e.clip.file)));
    }
    narrazione(voci, epV.voci, riprese, { ...CALORE_BASE, ...saga.calore });
  }
  const bus = colonna(epV, { musica, voci: { bus: voci, parlato: epV.voci } });
  mkdirSync(dirname(uscita), { recursive: true });
  writeFileSync(uscita, wav(bus));
  const battuteN = epV.voci.filter((v) => v.tipo === "battuta").length;
  const narrN = epV.voci.filter((v) => v.tipo === "narrazione").length;
  console.log(`colonna sonora: ${(bus.n / SR).toFixed(1)}s · ${battuteN} battute · ${narrN} pezzi narrati → ${uscita} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
