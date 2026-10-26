// test/cartoni.episodi.test.ts — gli EPISODI: il cartone non riscrive il canone.
//
// Gli episodi si scoprono da soli (cartoni/episodi/<id>/copione.ts): il motore
// arriva prima, gli episodi dopo, e ognuno porta i suoi cancelli.
//  1. le didascalie sono CITAZIONI: ognuna compare alla lettera nella pagina di
//     prosa che dichiara (la prosa è un cancello umano: il cartone la mette in
//     scena, non la riscrive) — oppure è una frase «cartone» dell'adattamento
//     dell'episodio (cartoni/episodi/<id>/adattamento.md, il secondo cancello:
//     vale solo se Ray l'ha approvato) — e si fanno in tempo a leggere;
//     l'adattamento, a sua volta, resta ancorato alla prosa (ogni `prosa` è alla
//     lettera nella sua pagina) e non porta nomi reali;
//  2. chi parla è nel cast delle voci (o è la narratrice);
//  3. il lessico: niente nomi reali nelle parole a schermo;
//  4. il montaggio, con le voci, sta in piedi (in fila, niente buchi, SVG sano),
//     e ogni voce sta dentro la sua didascalia;
//  5. se ci sono le voci registrate (narratrice, personaggi), ogni pezzo ha la
//     sua ripresa, col testo giusto, e la bocca dei personaggi le sta dietro;
//     e ogni suono del copione è un effetto che il motore sa fare.
//  6. sta nella serie (la sua puntata, dal grafo della saga), col titolo della
//     sua prosa, e con le voci dura intorno ai 5 minuti.

import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { effetto } from "../cartoni/audio/effetti";
import { Bus } from "../cartoni/audio/sintesi";
import { VOCI } from "../cartoni/cast/voci";
import { type Adattamento, fonteDidascalia, fontiDelCopione, leggiAdattamento } from "../cartoni/motore/adattamento";
import { aCapo } from "../cartoni/motore/didascalie";
import { inSvg } from "../cartoni/motore/fotogramma";
import { type Episodio, durata, fotogramma, scaletta } from "../cartoni/motore/montaggio";
import { DURATA_EPISODIO, puntataDi, puntate, titoliVolumi, titoloDallaProsa } from "../cartoni/motore/serie";
import { type Battute, type Narrazione, daNarrare, daRecitare } from "../cartoni/motore/voce";
import { conLeVoci } from "../cartoni/player/cartone";

const ROOT = process.cwd();
const leggi = (p: string) => readFileSync(join(ROOT, p), "utf8");
const DIR = join(ROOT, "cartoni/episodi");

const ID = existsSync(DIR) ? readdirSync(DIR).filter((d) => existsSync(join(DIR, d, "copione.ts"))).sort() : [];
const EPISODI: { id: string; ep: Episodio; musica: unknown; narr: Narrazione | null; bat: Battute | null; adatt: Adattamento | null }[] = await Promise.all(
  ID.map(async (id) => ({
    id,
    ep: (await import(join(DIR, id, "copione.ts"))).default as Episodio,
    musica: existsSync(join(DIR, id, "partitura.ts")) ? (await import(join(DIR, id, "partitura.ts"))).default : undefined,
    adatt: existsSync(join(DIR, id, "adattamento.md")) ? leggiAdattamento(readFileSync(join(DIR, id, "adattamento.md"), "utf8")) : null,
    narr: existsSync(join(DIR, id, "voce/narrazione.json")) ? (JSON.parse(readFileSync(join(DIR, id, "voce/narrazione.json"), "utf8")) as Narrazione) : null,
    bat: existsSync(join(DIR, id, "voce/battute.json")) ? (JSON.parse(readFileSync(join(DIR, id, "voce/battute.json"), "utf8")) as Battute) : null,
  })),
);

/** La serie: gli episodi a quattro a quattro nelle puntate (motore/serie.ts). */
const SERIE = puntate(JSON.parse(leggi("saga/trama/saga_graph.json")), titoliVolumi(leggi("saga/trama/volumi/README.md")));

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

describe("cartoni — l'adattamento (il secondo cancello): il parser", () => {
  const ESEMPIO = `# epXX — prova · l'adattamento per il cartone

stato: approvato
approvato: Ray · 2026-10-25

## Pagina 1

### s01
- prosa: «di quelle che stanno dove un mondo finisce»
- cartone: «Stava dove un mondo finisce.»
- perché: detto in chiaro.

### s01
- prosa: «*Vero due volte*»
- cartone: «Vero due volte.»
- perché: via il corsivo.

## Pagina 3

### s06
- prosa: «la punta della coda»
- cartone: «La punta della coda.»
- perché: maiuscola.
`;
  it("legge stato, approvazione e le entrate (pagina, inquadratura, prosa, cartone, perché); gli id possono ripetersi", () => {
    const a = leggiAdattamento(ESEMPIO);
    expect(a.stato).toBe("approvato");
    expect(a.approvato).toBe("Ray · 2026-10-25");
    expect(a.voci).toEqual([
      { pagina: 1, inquadratura: "s01", prosa: "di quelle che stanno dove un mondo finisce", cartone: "Stava dove un mondo finisce.", perche: "detto in chiaro." },
      { pagina: 1, inquadratura: "s01", prosa: "Vero due volte", cartone: "Vero due volte.", perche: "via il corsivo." },
      { pagina: 3, inquadratura: "s06", prosa: "la punta della coda", cartone: "La punta della coda.", perche: "maiuscola." },
    ]);
    expect(leggiAdattamento("stato: proposta\n").stato).toBe("proposta");
  });

  it("un file senza stato, approvato senza firma, o un'entrata a metà, non passano", () => {
    expect(() => leggiAdattamento("## Pagina 1\n")).toThrow(/stato/);
    expect(() => leggiAdattamento("stato: approvato\n## Pagina 1\n")).toThrow(/approvato: Ray/);
    expect(() => leggiAdattamento("stato: proposta\n## Pagina 1\n### s01\n- prosa: «a»\n")).toThrow(/cartone/);
  });

  it("dice da dove viene una didascalia: dalla prosa (vince sempre), dall'adattamento (alla lettera, stessa pagina), o da nessuna", () => {
    const a = leggiAdattamento(ESEMPIO);
    const pp = new Map([[1, "La Soglia, di quelle che stanno dove un mondo finisce. Vero due volte"], [3, "la punta della coda"]]);
    expect(fonteDidascalia("Vero due volte", 1, pp, a)).toBe("prosa");
    expect(fonteDidascalia("Stava dove un mondo finisce.", 1, pp, a)).toBe("adattamento");
    expect(fonteDidascalia("Stava dove un mondo finisce.", 3, pp, a)).toBe("nessuna");
    expect(fonteDidascalia("Stava dove un mondo finisce.", 1, pp, null)).toBe("nessuna");
    expect(fonteDidascalia("Stava dove un mondo *finisce*.", 1, pp, a)).toBe("adattamento");
  });
});

for (const { id, ep, narr, bat, adatt } of EPISODI) {
  describe(`cartoni — ${id}: le didascalie sono citazioni della prosa (o dell'adattamento approvato)`, () => {
    const pp = pagine(ep.prosa);

    it("la prosa di riferimento esiste ed è a pagine; ogni inquadratura dichiara una pagina che esiste", () => {
      expect(pp.size).toBeGreaterThan(0);
      for (const q of ep.inquadrature) expect(pp.has(q.pagina), `${q.id} → pagina ${q.pagina}`).toBe(true);
    });

    it("ogni didascalia compare ALLA LETTERA nella pagina dichiarata della prosa, oppure è una frase «cartone» dell'adattamento della stessa pagina", () => {
      const fonti = fontiDelCopione(ep, pp, adatt);
      const mancanti = fonti.filter((f) => f.fonte === "nessuna").map((f) => `${f.q} p.${f.pagina}: «${f.testo}»`);
      expect(mancanti, mancanti.join("\n")).toEqual([]);
    });

    it("se cita l'adattamento, l'adattamento è approvato da Ray (il secondo cancello)", () => {
      const citate = fontiDelCopione(ep, pp, adatt).filter((f) => f.fonte === "adattamento");
      if (!citate.length) return;
      expect(
        adatt!.stato,
        `${id} cita ${citate.length} frasi dell'adattamento, che è ancora \`proposta\`: approvarlo in cartoni/episodi/${id}/adattamento.md (stato: approvato, approvato: Ray · data) o togliere le citazioni:\n` +
          citate.map((f) => `  ${f.q} p.${f.pagina}: «${f.testo}»`).join("\n"),
      ).toBe("approvato");
    });

    if (adatt) {
      it("l'adattamento resta ancorato alla prosa: ogni entrata ha la sua «prosa» ALLA LETTERA nella pagina dichiarata, e dice che cosa cambia", () => {
        const mancanti = adatt.voci.filter((v) => !(pp.get(v.pagina) ?? "").includes(v.prosa)).map((v) => `${v.inquadratura} p.${v.pagina}: «${v.prosa}»`);
        expect(mancanti, mancanti.join("\n")).toEqual([]);
        for (const v of adatt.voci) {
          expect(v.cartone, `${v.inquadratura} p.${v.pagina}`).not.toBe("");
          expect(v.perche, `${v.inquadratura} p.${v.pagina}: manca il perché`).not.toBe("");
        }
      });

      it("le frasi «cartone» dell'adattamento non contengono nomi reali (lessico, come le didascalie)", () => {
        expect(adatt.voci.map((v) => v.cartone).filter((t) => PATTERN.test(t))).toEqual([]);
      });
    }

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

  describe(`cartoni — ${id}: i suoni`, () => {
    it("ogni suono del copione è un effetto che il motore sa fare (un nome sbagliato non suonerebbe)", () => {
      for (const q of ep.inquadrature) {
        for (const s of q.suoni ?? []) {
          const b = new Bus(2 + (s.durata ?? 0));
          effetto(b, s.nome, 0.1, s.vol ?? 1, s.durata, s.ritmo);
          let e = 0;
          for (let i = 0; i < b.n; i += 7) e += Math.abs(b.l[i]) + Math.abs(b.r[i]);
          expect(e, `${q.id}: «${s.nome}»`).toBeGreaterThan(0);
        }
      }
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

    it("sta nella serie, col titolo della sua prosa, e con le voci dura intorno ai 5′ (tra 3′ e 7′: quattro fanno una puntata di ~20′)", () => {
      expect(puntataDi(SERIE, id), `${id}: non è nella serie (saga/trama/saga_graph.json)`).toBeDefined();
      expect(ep.prosa).toBe(`saga/prosa/${id}.md`);
      expect(ep.titolo).toBe(titoloDallaProsa(leggi(ep.prosa)));
      const d = durata(epV);
      expect(d, `${id}: ${Math.floor(d / 60)}′${Math.round(d % 60)}″`).toBeGreaterThanOrEqual(DURATA_EPISODIO.min);
      expect(d, `${id}: ${Math.floor(d / 60)}′${Math.round(d % 60)}″`).toBeLessThanOrEqual(DURATA_EPISODIO.max);
    });

    it("sotto un brano la storia non rallenta (il brano suona a tempo vero), e ogni didascalia cantata ha il suo brano nell'inquadratura", () => {
      expect(epV.fuoriTempo, epV.fuoriTempo.join("\n")).toEqual([]);
      for (const q of ep.inquadrature) for (const d of q.didascalie ?? []) if (d.canto) expect(q.brano?.id, `${q.id}: «${d.testo}»`).toBe(d.canto);
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
