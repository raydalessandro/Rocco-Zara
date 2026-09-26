// test/cartoni.episodi.test.ts — gli EPISODI: il cartone non riscrive il canone.
//
// Gli episodi si scoprono da soli (cartoni/episodi/<id>/copione.ts): il motore
// arriva prima, gli episodi dopo, e ognuno porta i suoi cancelli.
//  1. le didascalie sono CITAZIONI: ognuna compare alla lettera nella pagina di
//     prosa che dichiara (la prosa è un cancello umano: il cartone la mette in
//     scena, non la riscrive), e si fanno in tempo a leggere;
//  2. chi parla è nel cast delle voci (o è la narratrice);
//  3. il lessico: niente nomi reali nelle parole a schermo;
//  4. il montaggio, con le voci, sta in piedi (in fila, niente buchi, SVG sano),
//     e ogni voce sta dentro la sua didascalia;
//  5. se ci sono le voci registrate (narratrice, personaggi), ogni pezzo ha la
//     sua ripresa, col testo giusto, e la bocca dei personaggi le sta dietro.

import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { VOCI } from "../cartoni/cast/voci";
import { aCapo } from "../cartoni/motore/didascalie";
import { inSvg } from "../cartoni/motore/fotogramma";
import { type Episodio, durata, fotogramma, scaletta } from "../cartoni/motore/montaggio";
import { type Battute, type Narrazione, daNarrare, daRecitare } from "../cartoni/motore/voce";
import { conLeVoci } from "../cartoni/player/cartone";

const ROOT = process.cwd();
const leggi = (p: string) => readFileSync(join(ROOT, p), "utf8");
const DIR = join(ROOT, "cartoni/episodi");

const ID = existsSync(DIR) ? readdirSync(DIR).filter((d) => existsSync(join(DIR, d, "copione.ts"))).sort() : [];
const EPISODI: { id: string; ep: Episodio; musica: unknown; narr: Narrazione | null; bat: Battute | null }[] = await Promise.all(
  ID.map(async (id) => ({
    id,
    ep: (await import(join(DIR, id, "copione.ts"))).default as Episodio,
    musica: existsSync(join(DIR, id, "partitura.ts")) ? (await import(join(DIR, id, "partitura.ts"))).default : undefined,
    narr: existsSync(join(DIR, id, "voce/narrazione.json")) ? (JSON.parse(readFileSync(join(DIR, id, "voce/narrazione.json"), "utf8")) as Narrazione) : null,
    bat: existsSync(join(DIR, id, "voce/battute.json")) ? (JSON.parse(readFileSync(join(DIR, id, "voce/battute.json"), "utf8")) as Battute) : null,
  })),
);

/** Normalizza come si legge a schermo: via il corsivo markdown, spazi semplici. */
const norma = (s: string) => s.replace(/\*/g, "").replace(/\s+/g, " ").trim();

/** Le pagine della prosa: numero → testo normalizzato. */
function pagine(file: string): Map<number, string> {
  const out = new Map<number, string>();
  const parti = leggi(file).split(/^## Pagina (\d+)\s*$/m);
  for (let i = 1; i < parti.length; i += 2) out.set(Number(parti[i]), norma(parti[i + 1]));
  return out;
}

type Mappa = { nomi: Record<string, string> };
const mappa: Mappa = JSON.parse(leggi("saga/lessico/mappa.json"));
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const chiavi = [...Object.keys(mappa.nomi), "foulard", "Kainua"].sort((a, b) => b.length - a.length);
const PATTERN = new RegExp("(?<![A-Za-zÀ-ÿ])(?:" + chiavi.map(escape).join("|") + ")(?![A-Za-zÀ-ÿ])");

describe("cartoni — gli episodi presenti", () => {
  it("ogni cartella di episodio ha un copione che si carica, con id e musica (anche nessun episodio va bene: il motore sta in piedi da solo)", () => {
    for (const { id, ep, musica } of EPISODI) {
      expect(ep.id, id).toBe(id);
      expect(ep.inquadrature.length, id).toBeGreaterThan(0);
      expect(typeof musica, `${id}/partitura.ts: export default (bus, ep) => void`).toBe("function");
    }
  });
});

for (const { id, ep, narr, bat } of EPISODI) {
  describe(`cartoni — ${id}: le didascalie sono citazioni della prosa`, () => {
    const pp = pagine(ep.prosa);

    it("la prosa di riferimento esiste ed è a pagine; ogni inquadratura dichiara una pagina che esiste", () => {
      expect(pp.size).toBeGreaterThan(0);
      for (const q of ep.inquadrature) expect(pp.has(q.pagina), `${q.id} → pagina ${q.pagina}`).toBe(true);
    });

    it("ogni didascalia compare ALLA LETTERA nella pagina dichiarata", () => {
      const mancanti: string[] = [];
      for (const q of ep.inquadrature) {
        for (const d of q.didascalie ?? []) {
          const pagina = pp.get(d.pagina) ?? "";
          if (!pagina.includes(norma(d.testo))) mancanti.push(`${q.id} p.${d.pagina}: «${d.testo}»`);
        }
      }
      expect(mancanti, mancanti.join("\n")).toEqual([]);
    });

    it("le didascalie di un'inquadratura stanno dentro la sua durata e non si accavallano", () => {
      for (const q of ep.inquadrature) {
        const ds = [...(q.didascalie ?? [])].sort((a, b) => a.da - b.da);
        ds.forEach((d, i) => {
          expect(d.da, q.id).toBeGreaterThanOrEqual(0);
          expect(d.a, q.id).toBeLessThanOrEqual(q.durata);
          expect(d.a, q.id).toBeGreaterThan(d.da);
          if (i > 0) expect(d.da, `${q.id}: «${d.testo}»`).toBeGreaterThanOrEqual(ds[i - 1].a);
        });
      }
    });

    it("si fanno in tempo a leggere (≤ 22 caratteri al secondo) e vanno a capo in al più tre righe", () => {
      const veloci: string[] = [];
      for (const q of ep.inquadrature) {
        for (const d of q.didascalie ?? []) {
          const cps = d.testo.length / (d.a - d.da);
          if (cps > 22) veloci.push(`${q.id} (${cps.toFixed(1)} c/s): «${d.testo}»`);
          expect(aCapo(d.testo).length, d.testo).toBeLessThanOrEqual(3);
        }
      }
      expect(veloci, veloci.join("\n")).toEqual([]);
    });

    it("chi parla è nel cast delle voci (o è la narratrice), e ogni battuta ha qualcuno che la dice", () => {
      const ammessi = new Set([...Object.keys(VOCI), "narratrice"]);
      for (const q of ep.inquadrature) {
        for (const d of q.didascalie ?? []) {
          const chi = d.chi === undefined ? [] : typeof d.chi === "string" ? [d.chi] : [...d.chi];
          for (const c of chi) expect(ammessi.has(c), `${q.id}: chi = ${c}`).toBe(true);
          if (d.testo.includes("«")) expect(chi.length, `${q.id}: «${d.testo}» — chi la dice?`).toBeGreaterThan(0);
        }
      }
    });

    it("le parole a schermo (didascalie e titoli) non contengono nomi reali", () => {
      const testi = ep.inquadrature.flatMap((q) => [...(q.didascalie ?? []).map((d) => d.testo), ...(q.titoli ?? []).flatMap((t) => t.righe.map((r) => r.testo))]);
      expect(testi.filter((t) => PATTERN.test(t))).toEqual([]);
    });
  });

  describe(`cartoni — ${id}: il montaggio con le voci`, () => {
    const epV = conLeVoci(ep, narr, bat);
    const sc = scaletta(epV);

    it("stesso tempo → stesso fotogramma; SVG ben chiusi (un campione per inquadratura)", () => {
      for (const p of sc) {
        const t = p.inizio + p.q.durata * 0.37;
        const svg = inSvg(fotogramma(epV, t, sc));
        expect(inSvg(fotogramma(epV, t, sc))).toBe(svg);
        expect((svg.match(/<g[ >]/g) ?? []).length).toBe((svg.match(/<\/g>/g) ?? []).length);
        expect(svg).not.toMatch(/NaN|undefined|Infinity/);
      }
    });

    it("in fila, senza buchi; dissolvenze più corte di chi le precede; apre e chiude sul nero", () => {
      let t = 0;
      sc.forEach((p, i) => {
        expect(p.inizio).toBeCloseTo(t, 9);
        t = p.fine;
        const e = p.q.entrata;
        if (e && e.tipo !== "stacco" && i > 0) expect(e.durata).toBeLessThan(sc[i - 1].q.durata);
      });
      expect(durata(epV)).toBeCloseTo(t, 9);
      expect(new Set(epV.inquadrature.map((q) => q.id)).size).toBe(epV.inquadrature.length);
      expect(fotogramma(epV, 0, sc).velo?.opacita).toBeCloseTo(1, 3);
      expect(fotogramma(epV, durata(epV), sc).velo?.opacita ?? 0).toBeGreaterThan(0.95);
    });

    it("ogni voce sta dentro la sua didascalia, e due voci non si parlano sopra", () => {
      for (const v of epV.voci) {
        const p = sc.find((x) => x.q.id === v.q)!;
        const d = p.q.didascalie![v.didascalia];
        expect(v.tg, `${v.q}: ${v.testo}`).toBeGreaterThanOrEqual(p.inizio + d.da);
        expect(v.tg + v.durata, `${v.q}: ${v.testo}`).toBeLessThanOrEqual(p.inizio + d.a);
      }
      for (let i = 1; i < epV.voci.length; i++) expect(epV.voci[i].tg).toBeGreaterThanOrEqual(epV.voci[i - 1].tg + epV.voci[i - 1].durata - 1e-9);
    });

    if (bat) {
      it("le battute registrate sono complete: ogni battuta ha la sua ripresa, di chi la dice, col testo giusto; e la bocca le sta dietro", () => {
        expect(epV.senzaRegistrazione, epV.senzaRegistrazione.join("\n")).toEqual([]);
        for (const b of daRecitare(ep, VOCI)) {
          const c = bat.clip[b.chiave];
          expect(c?.testo, b.chiave).toBe(b.testo);
          expect(c.chi, b.chiave).toBe(b.chi);
          expect(existsSync(join(DIR, id, "voce", c.file)), c.file).toBe(true);
          expect(c.durata).toBeGreaterThan(0.2);
          expect(Math.abs((c.bocca ?? "").length - Math.ceil(c.durata * 25)), `${b.chiave}: bocca`).toBeLessThanOrEqual(2);
        }
      });
    }

    if (narr) {
      it("la narrazione registrata è completa: ogni pezzo ha la sua ripresa, col testo giusto, e il file c'è", () => {
        expect(epV.senzaRipresa, epV.senzaRipresa.join("\n")).toEqual([]);
        for (const p of daNarrare(ep, VOCI)) {
          const c = narr.clip[p.chiave];
          expect(c?.testo, p.chiave).toBe(p.testo);
          expect(existsSync(join(DIR, id, "voce", c.file)), c.file).toBe(true);
          expect(c.durata).toBeGreaterThan(0.2);
        }
      });
    }
  });
}
