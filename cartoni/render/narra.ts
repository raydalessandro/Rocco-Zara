// cartoni/render/narra.ts — le voci leggono un episodio (e i provini delle voci).
//
//   npx tsx cartoni/render/narra.ts --episodio ep01 [--chi narratrice,rocco,…] [--solo s05,s06]
//   npx tsx cartoni/render/narra.ts --provini [narratrice|personaggi] [--episodio ep01] [--uscita cartoni/out/provini_voce]
//
// Le voci della saga (cartoni/voce/voce.json): UNA narratrice e UNA voce per
// ogni personaggio. Ognuna è scelta da Ray (poi non si cambia) o ancora da
// scegliere (si usa la sua "provvisoria" e le riprese sono provini).
//
// Registrare un episodio:
// - la narratrice legge la narrazione → episodi/<id>/voce/narrazione.json
// - ogni personaggio con una voce dice le sue battute → episodi/<id>/voce/battute.json
//   (con la bocca: una cifra 0-9 ogni 40 ms, per il pupazzo)
// Le riprese (Opus 48 kHz, una per pezzo) si TENGONO come una registrazione: i
// tempi del cartone dipendono dalla loro durata. `--chi` registra solo alcune
// voci, `--solo` solo alcune inquadrature (il resto delle riprese resta).
//
// --provini: per scegliere a orecchio. `narratrice`: la stessa pagina letta
// da tutte le candidate; `personaggi`: le battute di ogni personaggio dette da
// ognuna delle sue voci in prova (voce.json → personaggi.<chi>.provini).
//
// Serve: python3 con piper-tts e/o kokoro-onnx (pip install piper-tts kokoro-onnx)
// e ffmpeg. I modelli stanno fuori dal repo: --modelli <cartella> o PIPER_VOCI,
// altrimenti ~/.cache/rocco-zara/voci (li scarica la prima volta).

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { VOCI } from "../cast/voci";
import type { Episodio } from "../motore/montaggio";
import { type Battute, type DaNarrare, type DaRecitare, type Narrazione, type Ripresa, daNarrare, daRecitare, impronta } from "../motore/voce";

const RADICE = resolve(__dirname, "../..");
const arg = (nome: string, def?: string) => {
  const i = process.argv.indexOf(`--${nome}`);
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : def;
};
const flag = (nome: string) => process.argv.includes(`--${nome}`);

interface Candidata {
  descrizione: string;
  motore: "piper" | "kokoro";
  /** Piper: il nome del modello; Kokoro: il nome della voce */
  modello: string;
  /** 1 = il passo della voce; di più = più lenta */
  lentezza: number;
  variazione?: number;
  cadenza?: number;
  /** semitoni: più acuta e più piccola (positivo) o più grave e più grande (negativo) */
  tono?: number;
  licenza: string;
}
interface Ruolo {
  stato: "da-scegliere" | "scelta";
  voce: string | null;
  provvisoria?: string;
  provini?: string[];
}
interface VociSaga {
  narratrice: Ruolo;
  personaggi: Record<string, Ruolo>;
  candidate: Record<string, Candidata>;
  /** come le voci sintetiche leggono certe parole (le didascalie non cambiano) */
  pronuncia?: Record<string, string>;
}

/** Il dizionario di pronuncia della saga (voce.json → pronuncia). */
let PRONUNCIA: Record<string, string> = {};

/** La voce che un ruolo usa adesso: la scelta, o la provvisoria. */
const voceDi = (r: Ruolo): string | undefined => r.voce ?? r.provvisoria;

/**
 * Il testo come lo deve leggere la voce: trattini → pause (o sospensione in
 * fondo), una chiusa alla fine, e le parole del dizionario di pronuncia.
 */
export function perLaVoce(testo: string, pronuncia: Record<string, string> = PRONUNCIA): string {
  let s = testo.replace(/\s*[—–]\s*$/, "…").replace(/\s*[—–]\s*/g, ", ").replace(/\s+/g, " ").trim();
  for (const [parola, come] of Object.entries(pronuncia)) {
    if (parola.startsWith("_")) continue;
    s = s.replace(new RegExp(`(?<![A-Za-zÀ-ÿ])${parola}(?![A-Za-zÀ-ÿ])`, "gi"), (m) => (m[0] === m[0].toUpperCase() ? come[0].toUpperCase() + come.slice(1) : come));
  }
  s = s.replace(/^[,;:.\s]+/, "");
  if (!/[.!?…:;,]$/.test(s)) s += ".";
  return s.replace(/,$/, ".");
}

interface Letto {
  durata: number;
  sr: number;
  bocca: string;
}

/** Fa leggere dei pezzi a una candidata: un WAV per pezzo, con durata, frequenza e bocca. */
function leggi(c: Candidata, pezzi: { testo: string; file: string; lentezza?: number }[]): Map<string, Letto> {
  const modelli = resolve(arg("modelli", process.env.PIPER_VOCI ?? join(homedir(), ".cache/rocco-zara/voci"))!);
  const tmp = mkdtempSync(join(tmpdir(), "voce-"));
  const lavoro = join(tmp, "lavoro.json");
  writeFileSync(
    lavoro,
    JSON.stringify({ motore: c.motore, modello: c.modello, modelli, lentezza: c.lentezza, variazione: c.variazione ?? 0.6, cadenza: c.cadenza ?? 0.7, tono: c.tono ?? 0, pezzi }),
  );
  const out = execFileSync(arg("python", "python3")!, [join(RADICE, "cartoni/render/leggi_voce.py"), lavoro], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
    maxBuffer: 1 << 26,
  });
  rmSync(tmp, { recursive: true, force: true });
  const letti = new Map<string, Letto>();
  for (const riga of out.split("\n").filter(Boolean)) {
    const r = JSON.parse(riga) as Letto & { file: string };
    letti.set(r.file, { durata: r.durata, sr: r.sr, bocca: r.bocca });
  }
  return letti;
}

const ffmpeg = (...a: string[]) => execFileSync("ffmpeg", ["-v", "error", "-y", ...a]);
const opus = (wav: string, file: string) => ffmpeg("-i", wav, "-ac", "1", "-ar", "48000", "-c:a", "libopus", "-b:a", "56k", file);
const nomeFile = (chiave: string) => chiave.replace(/\//g, "-");

async function episodio(id: string): Promise<Episodio> {
  return (await import(join(RADICE, "cartoni/episodi", id, "copione.ts"))).default as Episodio;
}

function candidata(saga: VociSaga, id: string | undefined, ruolo: string): Candidata & { id: string } {
  if (!id) throw new Error(`${ruolo}: nessuna voce (né scelta né provvisoria) in cartoni/voce/voce.json`);
  const c = saga.candidate[id];
  if (!c) throw new Error(`${ruolo}: voce sconosciuta «${id}»`);
  return { ...c, id };
}

/** La narratrice legge la narrazione dell'episodio. */
function registraNarrazione(saga: VociSaga, ep: Episodio, cartella: string, solo?: string[]): void {
  const r = saga.narratrice;
  const c = candidata(saga, voceDi(r), "narratrice");
  const registro = join(cartella, "narrazione.json");
  const prima: Narrazione | null = existsSync(registro) ? JSON.parse(readFileSync(registro, "utf8")) : null;
  if (solo && prima && prima.voce !== c.id) throw new Error(`le altre riprese della narrazione sono di «${prima.voce}»: rifalle tutte (senza --solo)`);
  if (solo && prima && prima.impronta !== impronta(c)) throw new Error(`le altre riprese della narrazione sono fatte con impostazioni diverse di «${c.id}»: rifalle tutte (senza --solo), se no la voce cambia a metà episodio`);
  const pezzi: DaNarrare[] = daNarrare(ep, VOCI).filter((p) => !solo || solo.includes(p.q));
  const tmp = mkdtempSync(join(tmpdir(), "riprese-"));
  console.log(`narratrice: ${pezzi.length} pezzi letti da «${c.id}»…`);
  const letti = leggi(c, pezzi.map((p) => ({ testo: perLaVoce(p.testo), file: join(tmp, nomeFile(p.chiave) + ".wav"), lentezza: p.pensiero ? c.lentezza * 1.06 : undefined })));
  const clip: Record<string, Ripresa> = solo && prima ? { ...prima.clip } : {};
  for (const p of pezzi) {
    const wav = join(tmp, nomeFile(p.chiave) + ".wav");
    const file = nomeFile(p.chiave) + ".ogg";
    opus(wav, join(cartella, file));
    clip[p.chiave] = { testo: p.testo, durata: letti.get(wav)?.durata ?? 0, file };
  }
  rmSync(tmp, { recursive: true, force: true });
  const n: Narrazione = { voce: c.id, stato: r.stato === "scelta" ? "definitiva" : "provino", impronta: impronta(c), clip };
  writeFileSync(registro, JSON.stringify(n, null, 1) + "\n");
  console.log(`→ ${registro} (${Object.keys(clip).length} riprese, stato: ${n.stato})`);
}

/** I personaggi dicono le loro battute, ognuno con la sua voce. */
function registraBattute(saga: VociSaga, ep: Episodio, cartella: string, chi: string[] | undefined, solo?: string[]): void {
  const registro = join(cartella, "battute.json");
  const prima: Battute | null = existsSync(registro) ? JSON.parse(readFileSync(registro, "utf8")) : null;
  const tutte: DaRecitare[] = daRecitare(ep, VOCI);
  const personaggi = [...new Set(tutte.map((b) => b.chi))].filter((p) => !chi || chi.includes(p));
  const b: Battute = { voci: { ...(prima?.voci ?? {}) }, clip: { ...(prima?.clip ?? {}) } };
  for (const p of personaggi) {
    const r = saga.personaggi[p];
    if (!r || !voceDi(r)) {
      console.warn(`⚠ ${p}: nessuna voce in voce.json → resta in grammelot`);
      continue;
    }
    const c = candidata(saga, voceDi(r), p);
    const sue = tutte.filter((x) => x.chi === p && (!solo || solo.includes(x.q)));
    if (solo && prima?.voci[p] && prima.voci[p].voce !== c.id) throw new Error(`le altre battute di ${p} sono di «${prima.voci[p].voce}»: rifalle tutte (senza --solo)`);
    if (solo && prima?.voci[p] && prima.voci[p].impronta !== impronta(c)) throw new Error(`le altre battute di ${p} sono fatte con impostazioni diverse di «${c.id}»: rifalle tutte (senza --solo)`);
    // cambiando voce, le vecchie riprese di questo personaggio non valgono più
    if (!solo) for (const [k, v] of Object.entries(b.clip)) if (v.chi === p) delete b.clip[k];
    const tmp = mkdtempSync(join(tmpdir(), "battute-"));
    console.log(`${p}: ${sue.length} battute dette da «${c.id}»…`);
    const letti = leggi(c, sue.map((x) => ({ testo: perLaVoce(x.testo), file: join(tmp, nomeFile(x.chiave) + ".wav") })));
    for (const x of sue) {
      const wav = join(tmp, nomeFile(x.chiave) + ".wav");
      const file = nomeFile(x.chiave) + ".ogg";
      opus(wav, join(cartella, file));
      const l = letti.get(wav);
      b.clip[x.chiave] = { chi: p, voce: c.id, testo: x.testo, durata: l?.durata ?? 0, file, bocca: l?.bocca ?? "" };
    }
    rmSync(tmp, { recursive: true, force: true });
    b.voci[p] = { voce: c.id, stato: r.stato === "scelta" ? "definitiva" : "provino", impronta: impronta(c) };
  }
  writeFileSync(registro, JSON.stringify(b, null, 1) + "\n");
  console.log(`→ ${registro} (${Object.keys(b.clip).length} battute: ${Object.entries(b.voci).map(([k, v]) => `${k}=${v.voce} (${v.stato})`).join(", ")})`);
}

/** In fila, con un respiro tra un pezzo e l'altro, in un file da ascoltare. */
function inFila(pezzi: string[], sr: number, uscita: string, tmp: string): void {
  const pausa = join(tmp, "pausa.wav");
  ffmpeg("-f", "lavfi", "-i", `anullsrc=r=${sr}:cl=mono`, "-t", "0.7", "-c:a", "pcm_s16le", pausa);
  const lista = join(tmp, "lista.txt");
  writeFileSync(lista, pezzi.map((f) => `file '${f}'\nfile '${pausa}'`).join("\n"));
  ffmpeg("-f", "concat", "-safe", "0", "-i", lista, "-ac", "1", "-ar", "44100", "-c:a", "aac", "-b:a", "128k", uscita);
}

/** I provini: per la narratrice, o per ogni personaggio. */
async function provini(saga: VociSaga, quali: string): Promise<void> {
  const id = arg("episodio", "ep01")!;
  const uscita = resolve(arg("uscita", "cartoni/out/provini_voce")!);
  mkdirSync(uscita, { recursive: true });
  const ep = await episodio(id);
  if (quali !== "personaggi") {
    // la stessa pagina (l'inizio dell'episodio) per tutte le candidate che leggono
    const pagina = daNarrare(ep, VOCI).slice(0, 9);
    for (const [nome, c] of Object.entries(saga.candidate)) {
      const tmp = mkdtempSync(join(tmpdir(), "provino-"));
      const pezzi = pagina.map((p, k) => ({ testo: perLaVoce(p.testo), file: join(tmp, `${String(k).padStart(2, "0")}.wav`), lentezza: p.pensiero ? c.lentezza * 1.06 : undefined }));
      const letti = leggi(c, pezzi);
      inFila(pezzi.map((p) => p.file), letti.get(pezzi[0].file)?.sr ?? 22050, join(uscita, `narratrice_${nome}.m4a`), tmp);
      rmSync(tmp, { recursive: true, force: true });
      console.log(`provino narratrice «${nome}» → ${join(uscita, `narratrice_${nome}.m4a`)}`);
    }
  }
  if (quali !== "narratrice") {
    // ogni personaggio: le sue battute, da ognuna delle sue voci in prova
    const tutte = daRecitare(ep, VOCI);
    for (const [p, r] of Object.entries(saga.personaggi)) {
      const sue = tutte.filter((x) => x.chi === p);
      if (!sue.length) continue;
      for (const nome of r.provini ?? [voceDi(r)!]) {
        const c = candidata(saga, nome, p);
        const tmp = mkdtempSync(join(tmpdir(), "provino-"));
        const pezzi = sue.map((x, k) => ({ testo: perLaVoce(x.testo), file: join(tmp, `${String(k).padStart(2, "0")}.wav`) }));
        const letti = leggi(c, pezzi);
        const file = join(uscita, `${p}_${nome}.m4a`);
        inFila(pezzi.map((x) => x.file), letti.get(pezzi[0].file)?.sr ?? 24000, file, tmp);
        rmSync(tmp, { recursive: true, force: true });
        console.log(`provino ${p} «${nome}» (${c.descrizione}) → ${file}`);
      }
    }
  }
}

async function main(): Promise<void> {
  const saga = JSON.parse(readFileSync(join(RADICE, "cartoni/voce/voce.json"), "utf8")) as VociSaga;
  PRONUNCIA = saga.pronuncia ?? {};
  if (flag("provini")) {
    await provini(saga, arg("provini", "tutti")!);
    return;
  }
  const id = arg("episodio");
  if (!id) throw new Error("manca --episodio");
  const ep = await episodio(id);
  const cartella = join(RADICE, "cartoni/episodi", id, "voce");
  mkdirSync(cartella, { recursive: true });
  const solo = arg("solo")?.split(",");
  const chi = arg("chi")?.split(",");
  if (!chi || chi.includes("narratrice")) registraNarrazione(saga, ep, cartella, solo);
  const personaggi = chi?.filter((c) => c !== "narratrice");
  if (!chi || personaggi!.length) registraBattute(saga, ep, cartella, personaggi, solo);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
