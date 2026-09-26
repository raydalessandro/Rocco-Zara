// cartoni/render/narra.ts — la narratrice legge un episodio (e i provini della voce).
//
//   npx tsx cartoni/render/narra.ts --episodio ep01 [--voce serena] [--solo s05,s06]
//   npx tsx cartoni/render/narra.ts --provini [--episodio ep01] [--uscita cartoni/out/provini_voce]
//
// La voce della saga è UNA (cartoni/voce/voce.json): finché Ray non la
// sceglie si usa la "provvisoria" e le riprese sono provini; scelta la voce,
// le riprese sono definitive e un'altra voce non si può più usare. Le riprese vanno
// in episodi/<id>/voce/ (una per pezzo di narrazione, Opus 48 kHz) con il loro
// registro narrazione.json: si tengono come si tiene una registrazione — la
// voce sintetica non ridice mai una frase identica, e i tempi del cartone
// dipendono dalla durata di ogni ripresa.
//
// --provini: la stessa pagina letta da tutte le candidate, un file per voce,
// per scegliere a orecchio.
//
// Serve: python3 con piper-tts (pip install piper-tts) e ffmpeg. I modelli
// (60–120 MB l'uno) stanno fuori dal repo: --modelli <cartella> o PIPER_VOCI,
// altrimenti ~/.cache/rocco-zara/piper (li scarica la prima volta).

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { VOCI } from "../cast/voci";
import type { Episodio } from "../motore/montaggio";
import { type DaNarrare, type Narrazione, daNarrare } from "../motore/voce";

const RADICE = resolve(__dirname, "../..");
const arg = (nome: string, def?: string) => {
  const i = process.argv.indexOf(`--${nome}`);
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : def;
};
const flag = (nome: string) => process.argv.includes(`--${nome}`);

interface Candidata {
  descrizione: string;
  motore: "piper";
  modello: string;
  lentezza: number;
  variazione: number;
  cadenza: number;
  /** semitoni: più acuta e più piccola (una bambina); 0 = la voce com'è */
  tono?: number;
  licenza: string;
}
interface VoceSaga {
  stato: "da-scegliere" | "scelta";
  narratrice: string | null;
  provvisoria?: string;
  candidate: Record<string, Candidata>;
}

/** Il testo come lo deve leggere la voce: trattini → pause, una chiusa alla fine. */
export function perLaVoce(testo: string): string {
  let s = testo.replace(/\s*[—–]\s*/g, ", ").replace(/\s+/g, " ").trim();
  s = s.replace(/^[,;:.\s]+/, "");
  if (!/[.!?…:;,]$/.test(s)) s += ".";
  return s.replace(/,$/, ".");
}

/** Fa leggere dei pezzi a una candidata: un WAV per pezzo, con durata e frequenza di campionamento. */
function leggi(c: Candidata, pezzi: { testo: string; file: string; lentezza?: number }[]): Map<string, { durata: number; sr: number }> {
  const modelli = resolve(arg("modelli", process.env.PIPER_VOCI ?? join(homedir(), ".cache/rocco-zara/piper"))!);
  const tmp = mkdtempSync(join(tmpdir(), "narra-"));
  const lavoro = join(tmp, "lavoro.json");
  writeFileSync(lavoro, JSON.stringify({ modello: c.modello, modelli, lentezza: c.lentezza, variazione: c.variazione, cadenza: c.cadenza, tono: c.tono ?? 0, pezzi }));
  const out = execFileSync(arg("python", "python3")!, [join(RADICE, "cartoni/render/piper_narra.py"), lavoro], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
    maxBuffer: 1 << 26,
  });
  rmSync(tmp, { recursive: true, force: true });
  const durate = new Map<string, { durata: number; sr: number }>();
  for (const riga of out.split("\n").filter(Boolean)) {
    const r = JSON.parse(riga) as { file: string; durata: number; sr: number };
    durate.set(r.file, { durata: r.durata, sr: r.sr });
  }
  return durate;
}

const ffmpeg = (...a: string[]) => execFileSync("ffmpeg", ["-v", "error", "-y", ...a]);

async function episodio(id: string): Promise<Episodio> {
  return (await import(join(RADICE, "cartoni/episodi", id, "copione.ts"))).default as Episodio;
}

/** Registra la narrazione di un episodio con una voce. */
async function registra(saga: VoceSaga): Promise<void> {
  const id = arg("episodio");
  if (!id) throw new Error("manca --episodio");
  const nomeVoce = arg("voce", saga.narratrice ?? saga.provvisoria);
  if (!nomeVoce) throw new Error("nessuna voce: né scelta né provvisoria in cartoni/voce/voce.json");
  const c = saga.candidate[nomeVoce];
  if (!c) throw new Error(`voce sconosciuta: ${nomeVoce} (candidate: ${Object.keys(saga.candidate).join(", ")})`);
  if (saga.stato === "scelta" && nomeVoce !== saga.narratrice) throw new Error(`la voce della saga è «${saga.narratrice}»: non si cambia episodio per episodio`);
  const ep = await episodio(id);
  const cartella = join(RADICE, "cartoni/episodi", id, "voce");
  mkdirSync(cartella, { recursive: true });
  const registro = join(cartella, "narrazione.json");
  const solo = arg("solo")?.split(",");
  const prima: Narrazione | null = existsSync(registro) ? JSON.parse(readFileSync(registro, "utf8")) : null;
  if (solo && prima && prima.voce !== nomeVoce) throw new Error(`le altre riprese sono di «${prima.voce}»: rifalle tutte (senza --solo) per cambiare voce`);
  const pezzi: DaNarrare[] = daNarrare(ep, VOCI).filter((p) => !solo || solo.includes(p.q));
  const tmp = mkdtempSync(join(tmpdir(), "riprese-"));
  const nomeFile = (p: DaNarrare) => p.chiave.replace(/\//g, "-");
  console.log(`${id}: ${pezzi.length} pezzi letti da «${nomeVoce}» (${c.modello})…`);
  const durate = leggi(
    c,
    pezzi.map((p) => ({ testo: perLaVoce(p.testo), file: join(tmp, nomeFile(p) + ".wav"), lentezza: p.pensiero ? c.lentezza * 1.06 : undefined })),
  );
  const clip: Narrazione["clip"] = solo && prima ? { ...prima.clip } : {};
  for (const p of pezzi) {
    const wav = join(tmp, nomeFile(p) + ".wav");
    const file = nomeFile(p) + ".ogg";
    ffmpeg("-i", wav, "-ac", "1", "-ar", "48000", "-c:a", "libopus", "-b:a", "56k", join(cartella, file));
    clip[p.chiave] = { testo: p.testo, durata: durate.get(wav)?.durata ?? 0, file };
  }
  rmSync(tmp, { recursive: true, force: true });
  const n: Narrazione = { voce: nomeVoce, stato: saga.stato === "scelta" ? "definitiva" : "provino", clip };
  writeFileSync(registro, JSON.stringify(n, null, 1) + "\n");
  const tot = Object.values(clip).reduce((s, x) => s + x.durata, 0);
  console.log(`→ ${registro} (${Object.keys(clip).length} riprese, ${tot.toFixed(1)}s di voce, stato: ${n.stato})`);
}

/** I provini: la stessa pagina letta da tutte le candidate. */
async function provini(saga: VoceSaga): Promise<void> {
  const id = arg("episodio", "ep01")!;
  const uscita = resolve(arg("uscita", "cartoni/out/provini_voce")!);
  mkdirSync(uscita, { recursive: true });
  const ep = await episodio(id);
  // l'inizio dell'episodio: abbastanza per sentire il passo, il calore, le pause
  const pagina = daNarrare(ep, VOCI).slice(0, 9);
  for (const [nome, c] of Object.entries(saga.candidate)) {
    const tmp = mkdtempSync(join(tmpdir(), "provino-"));
    const pezzi = pagina.map((p, k) => ({ testo: perLaVoce(p.testo), file: join(tmp, `${String(k).padStart(2, "0")}.wav`), lentezza: p.pensiero ? c.lentezza * 1.06 : undefined }));
    const letti = leggi(c, pezzi);
    // in fila, con un respiro di 0.7 s tra un pezzo e l'altro (alla stessa frequenza dei pezzi)
    const sr = letti.get(pezzi[0].file)?.sr ?? 22050;
    const lista = join(tmp, "lista.txt");
    ffmpeg("-f", "lavfi", "-i", `anullsrc=r=${sr}:cl=mono`, "-t", "0.7", "-c:a", "pcm_s16le", join(tmp, "pausa.wav"));
    writeFileSync(lista, pezzi.map((p) => `file '${p.file}'\nfile '${join(tmp, "pausa.wav")}'`).join("\n"));
    const file = join(uscita, `${nome}.m4a`);
    ffmpeg("-f", "concat", "-safe", "0", "-i", lista, "-ac", "1", "-ar", "44100", "-c:a", "aac", "-b:a", "128k", file);
    rmSync(tmp, { recursive: true, force: true });
    console.log(`provino «${nome}» (${c.descrizione}) → ${file}`);
  }
}

async function main(): Promise<void> {
  const saga = JSON.parse(readFileSync(join(RADICE, "cartoni/voce/voce.json"), "utf8")) as VoceSaga;
  if (flag("provini")) await provini(saga);
  else await registra(saga);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
