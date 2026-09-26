// cartoni/render/suona.ts — scrive la colonna sonora di un episodio in WAV.
//
//   npx tsx cartoni/render/suona.ts --episodio ep01 [--narratrice] [--grammelot] [--uscita cartoni/out/ep01.wav]
//
// Musica (episodi/<id>/partitura.ts), effetti e ambiente dal copione; i
// personaggi con le loro voci registrate (episodi/<id>/voce/battute.json, se
// c'è — altrimenti, o con --grammelot, in grammelot); con --narratrice le
// riprese della voce narrante (voce/narrazione.json). Per leggere le riprese
// serve ffmpeg.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { VOCI } from "../cast/voci";
import { colonna, wav } from "../audio/colonna";
import { type Brani, postiDeiBrani, suonaBrani } from "../audio/brani";
import { battute } from "../audio/grammelot";
import { CALORE_BASE, type Calore, riprese } from "../audio/narratrice";
import { Bus, SR } from "../audio/sintesi";
import { durata, type Episodio } from "../motore/montaggio";
import type { Battute, Narrazione } from "../motore/voce";
import { conLeVoci } from "../player/cartone";

const RADICE = resolve(__dirname, "../..");
const arg = (nome: string, def?: string) => {
  const i = process.argv.indexOf(`--${nome}`);
  return i >= 0 ? process.argv[i + 1] : def;
};
const flag = (nome: string) => process.argv.includes(`--${nome}`);

/** Legge un brano (stereo, a 48 kHz). */
function leggiStereo(file: string): [Float32Array, Float32Array] {
  const buf = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-map", "0:a", "-f", "f32le", "-ac", "2", "-ar", String(SR), "-"], { maxBuffer: 1 << 30 });
  const x = new Float32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  const l = new Float32Array(x.length / 2);
  const r = new Float32Array(x.length / 2);
  for (let i = 0; i < l.length; i++) {
    l[i] = x[2 * i];
    r[i] = x[2 * i + 1];
  }
  return [l, r];
}

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
  const fileBattute = join(cartella, "voce/battute.json");
  const bat: Battute | null = !flag("grammelot") && existsSync(fileBattute) ? (JSON.parse(readFileSync(fileBattute, "utf8")) as Battute) : null;
  const uscita = resolve(arg("uscita", `cartoni/out/${id}${conNarratrice ? "_narrato" : ""}.wav`)!);
  let narr: Narrazione | null = null;
  if (conNarratrice) {
    const f = join(cartella, "voce/narrazione.json");
    if (!existsSync(f)) throw new Error(`nessuna ripresa della narratrice: manca ${f} (npx tsx cartoni/render/narra.ts --episodio ${id})`);
    narr = JSON.parse(readFileSync(f, "utf8")) as Narrazione;
  }
  const t0 = Date.now();
  const epV = conLeVoci(ep, narr, bat);
  if (epV.senzaRipresa.length) console.warn(`⚠ ${epV.senzaRipresa.length} pezzi di narrazione senza ripresa (restano solo scritti):\n  ${epV.senzaRipresa.join("\n  ")}`);
  if (epV.senzaRegistrazione.length) console.warn(`⚠ ${epV.senzaRegistrazione.length} battute senza registrazione (dette in grammelot):\n  ${epV.senzaRegistrazione.join("\n  ")}`);
  const voci = new Bus(durata(epV) + 3);
  battute(voci, epV.voci, VOCI);
  const file = new Map<string, Float32Array>();
  for (const e of epV.voci) {
    if (e.clip && !file.has(e.clip.file)) file.set(e.clip.file, leggiRipresa(join(cartella, "voce", e.clip.file)));
  }
  if (file.size) {
    const saga = JSON.parse(readFileSync(join(RADICE, "cartoni/voce/voce.json"), "utf8")) as { calore?: Calore };
    riprese(voci, epV.voci, file, { ...CALORE_BASE, ...saga.calore }, VOCI);
  }
  // i brani (le canzoni registrate) che l'episodio usa
  let braniBus: Bus | undefined;
  if (epV.inquadrature.some((q) => q.brano)) {
    const reg = JSON.parse(readFileSync(join(RADICE, "cartoni/brani/brani.json"), "utf8")) as Brani;
    const posti = postiDeiBrani(epV, reg);
    const audio = new Map<string, [Float32Array, Float32Array]>();
    for (const p of posti) if (!audio.has(p.id)) audio.set(p.id, leggiStereo(join(RADICE, "cartoni/brani", reg[p.id].file)));
    braniBus = new Bus(durata(epV) + 3);
    suonaBrani(braniBus, posti, audio);
  }
  if (epV.fuoriTempo.length) console.warn(`⚠ la storia rallenterebbe sotto un brano:\n  ${epV.fuoriTempo.join("\n  ")}`);
  const bus = colonna(epV, { musica, voci: { bus: voci, parlato: epV.voci }, brani: braniBus });
  mkdirSync(dirname(uscita), { recursive: true });
  writeFileSync(uscita, wav(bus));
  const registrate = epV.voci.filter((v) => v.tipo === "battuta" && v.clip).length;
  const grammelot = epV.voci.filter((v) => v.tipo === "battuta" && v.piano).length;
  const narrN = epV.voci.filter((v) => v.tipo === "narrazione").length;
  console.log(`colonna sonora: ${(bus.n / SR).toFixed(1)}s · ${registrate} battute registrate · ${grammelot} in grammelot · ${narrN} pezzi narrati → ${uscita} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
