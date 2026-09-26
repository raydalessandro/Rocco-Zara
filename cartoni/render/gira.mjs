#!/usr/bin/env node
// cartoni/render/gira.mjs — gira il cartone: dal copione al video.
//
//   node cartoni/render/gira.mjs --episodio ep01 [--narratrice] [--audio file.wav]
//                                [--fps 24] [--larghezza 1920] [--lavoratori 2]
//                                [--da 0] [--a <fine>] [--uscita cartoni/out/ep01.mp4]
//
// --narratrice gira i tempi della versione narrata (le riprese in
// episodi/<id>/voce/): l'audio va fatto con lo stesso flag (suona.ts).
//
// Come funziona: esbuild impacchetta il copione dell'episodio con le voci
// (player/cartone.ts → conLeVoci, gli stessi tempi di suona.ts); Chrome headless
// (Playwright) carica il pacchetto e il font di casa; per ogni fotogramma si
// chiama la funzione pura CARTONE.svg(t) e si fotografa la pagina; i JPEG
// vanno dritti in ffmpeg (niente file temporanei per fotogramma). Con più
// lavoratori il tempo si divide a pezzi contigui, poi ffmpeg li cuce.
//
// Dipendenze fuori dal package.json (non servono alla CI): Playwright con un
// Chromium (PLAYWRIGHT_MODULE / CHROME_PATH se non sono nei posti soliti) e
// ffmpeg nel PATH.

import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const RADICE = resolve(QUI, "../..");

// ------------------------------------------------------------------ argomenti --
const arg = (nome, def) => {
  const i = process.argv.indexOf(`--${nome}`);
  return i >= 0 ? process.argv[i + 1] : def;
};
const FPS = Number(arg("fps", 24));
const W = Number(arg("larghezza", 1920));
const H = Math.round((W * 9) / 16);
const LAVORATORI = Math.max(1, Number(arg("lavoratori", 2)));
const EPISODIO = arg("episodio", "");
const NARRATRICE = process.argv.includes("--narratrice");
const USCITA = resolve(RADICE, arg("uscita", `cartoni/out/${EPISODIO}${NARRATRICE ? "_narrato" : ""}.mp4`));
const AUDIO = arg("audio", "");
const QUALITA = Number(arg("qualita", 20)); // CRF di x264

// ------------------------------------------------------------------ il pacchetto --
/** Il pacchetto del cartone di un episodio: copione + voci + player, in un solo script. */
export async function impacchetta(episodio = EPISODIO, narratrice = NARRATRICE) {
  if (!episodio) throw new Error("manca --episodio (es. --episodio ep01)");
  const require = createRequire(join(RADICE, "package.json"));
  const { build } = require("esbuild");
  const cartella = join(RADICE, "cartoni/episodi", episodio);
  if (!existsSync(join(cartella, "copione.ts"))) throw new Error(`episodio sconosciuto: ${cartella}/copione.ts`);
  const narr = join(cartella, "voce/narrazione.json");
  if (narratrice && !existsSync(narr)) throw new Error(`nessuna ripresa della narratrice: manca ${narr}`);
  const ingresso =
    `import ep from ${JSON.stringify(join(cartella, "copione.ts"))};\n` +
    `import { conLeVoci, registra } from ${JSON.stringify(join(RADICE, "cartoni/player/cartone.ts"))};\n` +
    (narratrice ? `import narrazione from ${JSON.stringify(narr)};\nregistra(conLeVoci(ep, narrazione));\n` : `registra(conLeVoci(ep));\n`);
  const out = await build({
    stdin: { contents: ingresso, resolveDir: RADICE, loader: "ts", sourcefile: "cartone-ingresso.ts" },
    bundle: true,
    format: "iife",
    platform: "browser",
    target: "es2020",
    write: false,
    minify: true,
    logLevel: "silent",
  });
  return out.outputFiles[0].text;
}

export function fontCss() {
  const f = readFileSync(join(RADICE, "public/fonts/fraunces-latin.woff2")).toString("base64");
  return `@font-face{font-family:"Fraunces";src:url(data:font/woff2;base64,${f}) format("woff2");font-weight:300 700;font-style:normal;}`;
}

// ------------------------------------------------------------------ Chromium --
export async function apriChromium() {
  let pw;
  const tentativi = [process.env.PLAYWRIGHT_MODULE, "playwright", "playwright-core"].filter(Boolean);
  for (const m of tentativi) {
    try {
      pw = createRequire(join(RADICE, "package.json"))(m);
      break;
    } catch {}
  }
  if (!pw) {
    try {
      const radiceGlobale = execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim();
      pw = createRequire(join(radiceGlobale, "noop.js"))("playwright");
    } catch {}
  }
  if (!pw) throw new Error("Playwright non trovato: installalo (npm i -g playwright) o indica PLAYWRIGHT_MODULE.");
  const candidati = [
    process.env.CHROME_PATH,
    "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell",
  ].filter((p) => p && existsSync(p));
  return pw.chromium.launch(candidati.length ? { executablePath: candidati[0] } : {});
}

export async function paginaCartone(browser, js, css, larghezza, altezza) {
  const page = await browser.newPage({ viewport: { width: larghezza, height: altezza } });
  await page.setContent(
    `<!doctype html><html><head><meta charset="utf-8"><style>${css}html,body{margin:0;background:#000;overflow:hidden}#c svg{display:block}</style></head>` +
      `<body><div id="c"></div><span style="font-family:Fraunces;position:absolute;opacity:0">Rocco</span><script>${js}</script></body></html>`,
  );
  await page.evaluate(() => document.fonts.ready);
  return page;
}

// ------------------------------------------------------------------ il giro --
async function giraPezzo(browser, js, css, da, a, file, indice) {
  const page = await paginaCartone(browser, js, css, W, H);
  const ff = spawn("ffmpeg", [
    "-y", "-loglevel", "error",
    "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-preset", "medium", "-crf", String(QUALITA), "-pix_fmt", "yuv420p",
    "-r", String(FPS), file,
  ], { stdio: ["pipe", "inherit", "inherit"] });
  const fine = new Promise((ok, ko) => ff.on("close", (c) => (c === 0 ? ok() : ko(new Error("ffmpeg " + c)))));
  const t0 = Date.now();
  for (let f = da; f < a; f++) {
    const t = f / FPS;
    await page.evaluate(([tt, w]) => {
      document.getElementById("c").innerHTML = globalThis.CARTONE.svg(tt, w);
    }, [t, W]);
    const buf = await page.screenshot({ type: "jpeg", quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if ((f - da) % 120 === 0) {
      const s = (Date.now() - t0) / 1000;
      process.stdout.write(`  [${indice}] ${f - da}/${a - da} fotogrammi · ${s.toFixed(0)}s\n`);
    }
  }
  ff.stdin.end();
  await fine;
  await page.close();
}

async function main() {
  const js = await impacchetta();
  const css = fontCss();
  const durata = Number(new Function(`${js}; return CARTONE.durata;`)());
  if (NARRATRICE && !AUDIO) console.warn("⚠ versione narrata senza --audio: il video avrà i tempi della narratrice ma sarà muto");
  const da = Math.round(Number(arg("da", 0)) * FPS);
  const a = Math.round(Math.min(durata, Number(arg("a", durata))) * FPS);
  // una cartella di lavoro tutta sua: due giri insieme non si pestano i pezzi
  mkdirSync(dirname(USCITA), { recursive: true });
  const tmp = mkdtempSync(join(dirname(USCITA), ".pezzi-"));
  console.log(`cartone ${EPISODIO}${NARRATRICE ? " (narrato)" : ""}: ${durata.toFixed(1)}s · ${a - da} fotogrammi · ${W}×${H} @ ${FPS}fps · ${LAVORATORI} lavoratori`);
  const browser = await apriChromium();
  const passo = Math.ceil((a - da) / LAVORATORI);
  const pezzi = [];
  const lavori = [];
  for (let i = 0; i < LAVORATORI; i++) {
    const p0 = da + i * passo;
    const p1 = Math.min(a, p0 + passo);
    if (p1 <= p0) continue;
    const file = join(tmp, `pezzo_${i}.mp4`);
    pezzi.push(file);
    lavori.push(giraPezzo(browser, js, css, p0, p1, file, i));
  }
  const t0 = Date.now();
  await Promise.all(lavori);
  await browser.close();
  console.log(`girato in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  const lista = join(tmp, "lista.txt");
  writeFileSync(lista, pezzi.map((p) => `file '${p}'`).join("\n"));
  const muto = join(tmp, "muto.mp4");
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lista, "-c", "copy", muto]);
  mkdirSync(dirname(USCITA), { recursive: true });
  if (AUDIO) {
    // volume da web: −18 LUFS integrati, picco vero −1,5 dB (loudnorm di ffmpeg)
    // l'audio parte dallo stesso istante del video (anche nei giri parziali con --da)
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", muto, "-ss", (da / FPS).toFixed(3), "-i", resolve(AUDIO), "-c:v", "copy", "-af", "loudnorm=I=-18:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", USCITA]);
  } else {
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", muto, "-c", "copy", "-movflags", "+faststart", USCITA]);
  }
  rmSync(tmp, { recursive: true, force: true });
  console.log(`pronto: ${USCITA}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
