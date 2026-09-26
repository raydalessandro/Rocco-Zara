// cartoni/render/monta.ts — monta le puntate (e la stagione intera) dagli episodi girati.
//
//   npx tsx cartoni/render/monta.ts --elenco                  # la serie: puntate, episodi, cosa c'è già
//   npx tsx cartoni/render/monta.ts --puntata 1 [--parziale] [--senza-narratrice] [--uscita file.mp4]
//   npx tsx cartoni/render/monta.ts --stagione [--parziale] [--senza-narratrice]   # tutte di fila: il film lungo
//
// Una puntata sono gli episodi del suo volume (motore/serie.ts: la serie si ricava
// dal grafo della saga), girati da gira.mjs — cartoni/out/<id>_narrato.mp4, o <id>.mp4
// con --senza-narratrice — e messi uno dietro l'altro così come sono: ogni episodio
// apre e chiude sul nero, e il volume è già lo stesso per tutti (−18 LUFS). Non si
// ricodifica niente (-c copy): per questo gli episodi devono essere girati allo
// stesso modo, e lo si controlla prima. Ogni episodio diventa un capitolo del file
// (col titolo della sua prosa), per saltare dall'uno all'altro.
// Senza --parziale si ferma se manca un episodio; con --parziale monta quelli che ci sono.
// Serve ffmpeg (con ffprobe).

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { type Puntata, puntate, titoliVolumi, titoloDallaProsa } from "../motore/serie";

const RADICE = resolve(__dirname, "../..");
const arg = (nome: string, def?: string) => {
  const i = process.argv.indexOf(`--${nome}`);
  return i >= 0 ? process.argv[i + 1] : def;
};
const flag = (nome: string) => process.argv.includes(`--${nome}`);

/** La serie, dal grafo della saga e dall'indice dei volumi. */
function laSerie(radice = RADICE): Puntata[] {
  const grafo = JSON.parse(readFileSync(join(radice, "saga/trama/saga_graph.json"), "utf8"));
  const indice = readFileSync(join(radice, "saga/trama/volumi/README.md"), "utf8");
  return puntate(grafo, titoliVolumi(indice));
}

const titolo = (id: string) => {
  const f = join(RADICE, "saga/prosa", `${id}.md`);
  return (existsSync(f) && titoloDallaProsa(readFileSync(f, "utf8"))) || id;
};
const girato = (id: string, narrato: boolean) => join(RADICE, "cartoni/out", `${id}${narrato ? "_narrato" : ""}.mp4`);
const mmss = (s: number) => `${Math.floor(s / 60)}′${String(Math.round(s % 60)).padStart(2, "0")}″`;

/** Durata e forma dei flussi di un video (quel che deve combaciare per unire senza ricodificare). */
function sonda(file: string): { durata: number; forma: string } {
  const out = JSON.parse(
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=codec_type,codec_name,width,height,r_frame_rate,pix_fmt,sample_rate,channels", "-of", "json", file], { encoding: "utf8" }),
  );
  const forma = (out.streams as Record<string, unknown>[])
    .map((s) => [s.codec_type, s.codec_name, s.width, s.height, s.r_frame_rate, s.pix_fmt, s.sample_rate, s.channels].filter((x) => x !== undefined).join(":"))
    .sort()
    .join(" | ");
  return { durata: Number(out.format.duration), forma };
}

function elenco(serie: Puntata[], narrato: boolean): void {
  let fatti = 0;
  let totale = 0;
  for (const p of serie) {
    console.log(`\nPuntata ${p.numero} — ${p.titolo}`);
    for (const id of p.episodi) {
      totale++;
      const copione = existsSync(join(RADICE, "cartoni/episodi", id, "copione.ts"));
      const f = girato(id, narrato);
      const stato = existsSync(f) ? `girato (${mmss(sonda(f).durata)})` : copione ? "copione, da girare" : "da fare";
      if (copione) fatti++;
      console.log(`  ${copione ? "●" : "○"} ${id} — ${titolo(id)}: ${stato}`);
    }
  }
  console.log(`\n${fatti}/${totale} episodi col copione.`);
}

function monta(nome: string, titoloFile: string, episodi: string[], narrato: boolean, parziale: boolean, uscita: string): void {
  const presenti = episodi.filter((id) => existsSync(girato(id, narrato)));
  const mancanti = episodi.filter((id) => !presenti.includes(id));
  if (mancanti.length && !parziale) {
    throw new Error(`${nome}: mancano ${mancanti.length} episodi girati (${mancanti.join(", ")}) — girali con gira.mjs${narrato ? " --narratrice" : ""}, o monta quelli che ci sono con --parziale`);
  }
  if (!presenti.length) throw new Error(`${nome}: nessun episodio girato`);
  if (mancanti.length) console.warn(`⚠ ${nome}: monto ${presenti.length} ${presenti.length === 1 ? "episodio" : "episodi"} su ${episodi.length} (mancano ${mancanti.join(", ")})`);
  const sonde = presenti.map((id) => ({ id, ...sonda(girato(id, narrato)) }));
  const diverse = sonde.filter((s) => s.forma !== sonde[0].forma);
  if (diverse.length) {
    throw new Error(`${nome}: gli episodi non sono girati allo stesso modo, non si possono unire senza ricodificare:\n  ${sonde.map((s) => `${s.id}: ${s.forma}`).join("\n  ")}\nrigirali con lo stesso gira.mjs`);
  }
  const lavoro = mkdtempSync(join(RADICE, "cartoni/out", ".monta-"));
  try {
    const lista = join(lavoro, "lista.txt");
    writeFileSync(lista, presenti.map((id) => `file '${girato(id, narrato).replace(/'/g, "'\\''")}'`).join("\n") + "\n");
    // i capitoli: uno per episodio, col titolo della sua prosa
    let t = 0;
    const capitoli = sonde.map((s) => {
      const c = `[CHAPTER]\nTIMEBASE=1/1000\nSTART=${Math.round(t * 1000)}\nEND=${Math.round((t + s.durata) * 1000)}\ntitle=${s.id} — ${titolo(s.id)}\n`;
      t += s.durata;
      return c;
    });
    const meta = join(lavoro, "capitoli.txt");
    writeFileSync(meta, `;FFMETADATA1\ntitle=${titoloFile}\n\n${capitoli.join("\n")}`);
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lista, "-i", meta, "-map", "0", "-map_metadata", "1", "-map_chapters", "1", "-c", "copy", "-movflags", "+faststart", uscita]);
    console.log(`${titoloFile}: ${sonde.map((s) => `${s.id} ${mmss(s.durata)}`).join(" + ")} = ${mmss(t)} → ${uscita}`);
  } finally {
    rmSync(lavoro, { recursive: true, force: true });
  }
}

function main(): void {
  const serie = laSerie();
  const narrato = !flag("senza-narratrice");
  const parziale = flag("parziale");
  const coda = narrato ? "_narrato" : "";
  if (flag("elenco")) return elenco(serie, narrato);
  if (flag("stagione")) {
    const tutti = serie.flatMap((p) => p.episodi);
    return monta("la stagione", "Rocco & Zara — la stagione", tutti, narrato, parziale, resolve(arg("uscita", `cartoni/out/stagione${coda}.mp4`)!));
  }
  const n = Number(arg("puntata"));
  const p = serie.find((x) => x.numero === n);
  if (!p) throw new Error(`uso: monta.ts --elenco | --puntata <1-${serie.length}> | --stagione  [--parziale] [--senza-narratrice] [--uscita file.mp4]`);
  monta(`la puntata ${p.numero}`, `Rocco & Zara — Puntata ${p.numero}: ${p.titolo}`, p.episodi, narrato, parziale, resolve(arg("uscita", `cartoni/out/puntata${p.numero}${coda}.mp4`)!));
}

try {
  main();
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}
