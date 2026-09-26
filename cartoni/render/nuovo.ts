// cartoni/render/nuovo.ts — lo scheletro di un episodio nuovo, dalla sua prosa.
//
//   npx tsx cartoni/render/nuovo.ts --episodio ep02 [--luogo SOGLIA]
//
// Legge saga/prosa/<id>.md e scrive cartoni/episodi/<id>/{copione,partitura}.ts:
// un'inquadratura per pagina, che già gira (il luogo, due pupazzi fermi, le
// bocche agganciate alle voci), con TUTTE le frasi della pagina pronte da
// citare nei commenti — tempi proposti a una velocità di lettura comoda, il
// corsivo segnato come pensiero, e chi parla indovinato dove la prosa lo dice
// («disse Zara»). Da lì si fa regia: si scelgono le didascalie (alla lettera:
// il test lo controlla), si spezza una pagina in più inquadrature, si muovono
// camera e attori, si scrivono i suoni e la musica.
// Non sovrascrive niente: se l'episodio c'è già, si ferma.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const RADICE = resolve(__dirname, "../..");
const arg = (nome: string, def?: string) => {
  const i = process.argv.indexOf(`--${nome}`);
  return i >= 0 ? process.argv[i + 1] : def;
};

/** Le voci del cast che la prosa nomina (per indovinare `chi`). */
const NOMI: Record<string, string> = { Zara: "zara", Rocco: "rocco", "Cècca": "cecca" };

interface Frase {
  testo: string;
  pensiero: boolean;
  chi?: string;
}

/** Le frasi di una pagina: paragrafi → frasi, col corsivo tolto (a schermo non c'è). */
function frasi(pagina: string): Frase[] {
  const out: Frase[] = [];
  for (const par of pagina.split(/\n\s*\n/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean)) {
    // taglia dopo . ! ? … (anche dentro le «» chiuse), non dopo le iniziali
    const pezzi = par.match(/[^.!?…]+(?:[.!?…]+[»”]?|$)/g) ?? [par];
    for (const p of pezzi.map((x) => x.trim()).filter(Boolean)) {
      const testo = p.replace(/\*/g, "");
      const chiM = testo.match(/(?:disse|chiese|rispose|fece|gridò|sussurrò)\s+(Zara|Rocco|Cècca)/);
      const soloCorsivo = /^\*[^*]+\*[.!?…]?$/.test(p) || (p.includes("*") && /pensò/.test(p));
      out.push({ testo, pensiero: soloCorsivo, chi: testo.includes("«") ? (chiM ? NOMI[chiM[1]] : undefined) : undefined });
    }
  }
  return out;
}

const q = (s: string) => JSON.stringify(s);

function main(): void {
  const id = arg("episodio");
  if (!id || !/^ep\d{2,}$/.test(id)) throw new Error("uso: nuovo.ts --episodio epNN [--luogo SOGLIA]");
  const luogo = arg("luogo", "SOGLIA")!;
  const prosa = join(RADICE, "saga/prosa", `${id}.md`);
  if (!existsSync(prosa)) throw new Error(`manca la prosa: ${prosa} (il cartone viene dopo la prosa approvata)`);
  const cartella = join(RADICE, "cartoni/episodi", id);
  if (existsSync(join(cartella, "copione.ts"))) throw new Error(`${id} c'è già: non sovrascrivo (${cartella})`);
  const testo = readFileSync(prosa, "utf8");
  const titolo = (testo.match(/^# .*?—\s*(.+)$/m)?.[1] ?? id).trim();
  const parti = testo.split(/^## Pagina (\d+)\s*$/m);
  const pagine: { n: number; frasi: Frase[] }[] = [];
  for (let i = 1; i < parti.length; i += 2) pagine.push({ n: Number(parti[i]), frasi: frasi(parti[i + 1].replace(/<!--[\s\S]*?-->/g, "")) });
  const COST = id.toUpperCase();
  const file = (luogo === "SOGLIA" ? "soglia" : luogo.toLowerCase());

  let s = `// cartoni/episodi/${id}/copione.ts — il copione animato di «${id} — ${titolo}».
//
// Fonte: saga/prosa/${id}.md (pagine 1–${pagine.length}). SCHELETRO fatto da
// cartoni/render/nuovo.ts: un'inquadratura per pagina, con le frasi della pagina
// pronte da citare nei commenti. Da qui si fa regia (docs/ANIMATORE.md §1):
// si scelgono le didascalie (ALLA LETTERA: test/cartoni.episodi.test.ts), si
// mette chi parla (\`chi\`), si spezzano le pagine, si muovono camera e attori.

import { type PosaRocco } from "../../cast/rocco";
import { type PosaZara } from "../../cast/zara";
import { ${luogo} } from "../../luoghi/${file}";
import { type Camera } from "../../motore/fotogramma";
import { type Episodio, type Inquadratura } from "../../motore/montaggio";
import { ease } from "../../motore/tempo";
import { LUCI } from "../../scene/luci";
import { SFONDO } from "../../scene/palco";
import { palcoscenico } from "../../scene/palcoscenico";
import { camTra } from "../../scene/regia";

const { scena, R, Z } = palcoscenico(${luogo});

/** Zara e Rocco in cima, a guardarsi (ingombri: docs/ANIMATORE.md §1). */
const CIMA = { zara: -310, rocco: 240 } as const;
`;
  const ids: string[] = [];
  for (const p of pagine) {
    const sid = `s${String(p.n).padStart(2, "0")}`;
    ids.push(sid);
    let t = 0.5;
    const righe = p.frasi.map((f) => {
      const dur = Math.max(2.2, Math.round((f.testo.length / 15 + 0.8) * 10) / 10);
      const r = `    // { da: ${t.toFixed(1)}, a: ${(t + dur).toFixed(1)}, pagina: ${p.n}, testo: ${q(f.testo)}${f.pensiero ? ", pensiero: true" : ""}${f.testo.includes("«") ? `, chi: ${q(f.chi ?? "?")}` : ""} },`;
      t += dur + 0.4;
      return r;
    });
    const primo = p.frasi[0]?.testo ?? "";
    s += `
/** p.${p.n} · ${primo.slice(0, 70)}${primo.length > 70 ? "…" : ""} */
const ${sid}: Inquadratura = {
  id: ${q(sid)},
  titolo: ${q(`Pagina ${p.n}`)},
  pagina: ${p.n},
  durata: 8,${p.n > 1 ? `\n  entrata: { tipo: "dissolvenza", durata: 0.8 },` : ""}
  didascalie: [
    // le frasi della pagina (tempi proposti a ~15 caratteri al secondo; il test vuole ≤ 22):
${righe.join("\n")}
  ],
  ambiente: { vento: 0.3 },
  disegna(t, defs, v) {
    const L = LUCI.giorno;
    const cam: Camera = camTra({ x: 0, y: -150, zoom: 1 }, { x: 0, y: -170, zoom: 1.15 }, ease.dentroFuori(t / 8));
    const zp: PosaZara = { t, andatura: "fermo", bocca: v.bocca("zara") };
    const rp: PosaRocco = { t, andatura: "fermo", bocca: v.bocca("rocco") };
    const att = Z(CIMA.zara, zp, 1, L, defs) + R(CIMA.rocco, rp, -1, L, defs);
    return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: att }) };
  },
};
`;
  }
  s += `
export const ${COST}: Episodio = {
  id: ${q(id)},
  titolo: ${q(titolo)},
  prosa: ${q(`saga/prosa/${id}.md`)},
  sfondo: SFONDO,
  inquadrature: [${ids.join(", ")}],
};

export default ${COST};
`;
  const partitura = `// cartoni/episodi/${id}/partitura.ts — la musica di «${id} — ${titolo}».
//
// SCHELETRO: una sezione calma per tutto l'episodio. La musica è dati: sezioni
// agganciate alle inquadrature (vedi cartoni/audio/partitura.ts e, per un
// esempio intero con i temi, episodi/ep01/partitura.ts).

import { type Sezione, suona } from "../../audio/partitura";

const SEZIONI: Sezione[] = [
  { da: ${q(ids[0])}, a: ${q(ids[ids.length - 1])}, bpm: 72, accordi: ["D", "G", "Bm", "A"], bpa: 4, arpa: "rado", vel: 0.8 },
];

export default suona(SEZIONI);
`;
  mkdirSync(cartella, { recursive: true });
  writeFileSync(join(cartella, "copione.ts"), s);
  writeFileSync(join(cartella, "partitura.ts"), partitura);
  console.log(`${id} «${titolo}»: ${pagine.length} inquadrature (una per pagina) → ${cartella}/{copione,partitura}.ts`);
  console.log("Ora: scegli le didascalie (togli i // alle frasi che vuoi, alla lettera), metti chi parla, fai regia.");
}

main();
