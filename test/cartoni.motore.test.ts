// test/cartoni.motore.test.ts — il MOTORE del cartone, da solo (senza episodi).
//
// Il motore sta in piedi da solo: questi test non importano nessun episodio
// (quelli hanno i loro, in test/cartoni.episodi.test.ts, che li scopre da sé).
// Qui: l'invariante madre del seme (stesso copione, stesso tempo → stesso
// fotogramma e stessa colonna sonora, byte per byte), gli attrezzi, i luoghi,
// le voci (grammelot, tempi, narratrice), la serie (le puntate dal grafo della
// saga) e i cancelli del canone che valgono per tutto il codice: ancore colore
// dei pupazzi, lessico, anti-New-Age.
// Un episodio di prova piccolo piccolo, scritto qui, fa girare il montaggio.

import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { CECCA_ANCORE, martinPescatore } from "../cartoni/cast/fauna";
import { CERVARA_ANCORE } from "../cartoni/cast/cervara";
import { BRENTA_ANCORE } from "../cartoni/cast/laghi";
import { ROCCO_ANCORE } from "../cartoni/cast/rocco";
import { VOCI } from "../cartoni/cast/voci";
import { ZARA_ANCORE } from "../cartoni/cast/zara";
import { wav } from "../cartoni/audio/colonna";
import { ambiente, effetto } from "../cartoni/audio/effetti";
import { suonaBattuta } from "../cartoni/audio/grammelot";
import { Bus, SR, arpa } from "../cartoni/audio/sintesi";
import { SOGLIA } from "../cartoni/luoghi/soglia";
import { caso, elemento, fnv1a32 } from "../cartoni/motore/caso";
import { aCapo } from "../cartoni/motore/didascalie";
import { aSchermo, inSvg, matriceLivello } from "../cartoni/motore/fotogramma";
import { type Episodio, durata, fotogramma, postoA, scaletta, suoni } from "../cartoni/motore/montaggio";
import { segmenta, sillabe, sillabeParola } from "../cartoni/motore/parola";
import { Defs } from "../cartoni/motore/svg";
import { ease, traccia } from "../cartoni/motore/tempo";
import { type Battute, type Narrazione, boccaBattuta, boccaRipresa, chiaveClip, conVoce, daNarrare, daRecitare, impronta, pianifica } from "../cartoni/motore/voce";
import { type Brani, postiDeiBrani, versiCantati } from "../cartoni/audio/brani";
import { DURATA_EPISODIO, puntataDi, puntate, titoliVolumi, titoloDallaProsa } from "../cartoni/motore/serie";
import { FINE_NODI, insertoCorda, insertoPietra } from "../cartoni/scene/inserti";
import { galleggia, riflesso } from "../cartoni/scene/lago";
import { APPRODO, COPPELLE, CUORE, LAGO_VESPRO, ORLO, RIVA, RIVALBA, sulMassoDelConsiglio, sullaPasserella } from "../cartoni/luoghi/rivalba";
import * as TEMI from "../cartoni/audio/temi";
import { LUCI } from "../cartoni/scene/luci";
import { palcoscenico } from "../cartoni/scene/palcoscenico";

const ROOT = process.cwd();
const leggi = (p: string) => readFileSync(join(ROOT, p), "utf8");

// ------------------------------------------------ l'episodio di prova --
const { scena, R, Z } = palcoscenico(SOGLIA);
const PROVA: Episodio = {
  id: "prova",
  titolo: "Prova",
  prosa: "(nessuna)",
  sfondo: "#1d1b17",
  inquadrature: [
    {
      id: "a",
      titolo: "Due in cima",
      pagina: 1,
      durata: 6,
      didascalie: [
        { da: 0.5, a: 2.5, pagina: 1, testo: "«Sei piccola,» disse lui.", chi: "rocco" },
        { da: 3, a: 5.5, pagina: 1, testo: "«Sono giovane.»", chi: "zara" },
      ],
      suoni: [{ t: 1, nome: "passi", durata: 2, ritmo: 1.5 }],
      disegna(t, defs, v) {
        const cam = { x: 0, y: -150, zoom: 1.2 };
        const L = LUCI.giorno;
        const att = Z(-310, { t, andatura: "fermo", bocca: v.bocca("zara") }, 1, L, defs) + R(240, { t, andatura: "fermo", bocca: v.bocca("rocco") }, -1, L, defs);
        return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: L, attori: att }) };
      },
    },
    {
      id: "b",
      titolo: "La collina",
      pagina: 1,
      durata: 4,
      entrata: { tipo: "dissolvenza", durata: 0.8 },
      didascalie: [{ da: 0.5, a: 3.5, pagina: 1, testo: "La collina restò indietro." }],
      disegna(t, defs, v) {
        const cam = { x: -200, y: 100, zoom: 0.4 };
        return { cam, livelli: scena(t, defs, { mondo: v.t, cam, luce: LUCI.tramonto }) };
      },
    },
  ],
};

describe("cartoni — determinismo", () => {
  it("stesso tempo → stesso fotogramma, byte per byte (anche con le voci)", () => {
    for (const ep of [PROVA, conVoce(PROVA, { voci: VOCI })]) {
      const sc = scaletta(ep);
      for (const p of sc) {
        const t = p.inizio + p.q.durata * 0.37;
        expect(inSvg(fotogramma(ep, t, sc))).toBe(inSvg(fotogramma(ep, t, sc)));
      }
    }
  });

  it("i generatori con lo stesso nome danno la stessa sequenza; quelli per elemento non dipendono dall'ordine", () => {
    const a = caso("prova");
    const b = caso("prova");
    for (let i = 0; i < 50; i++) expect(a()).toBe(b());
    const s = fnv1a32("famiglia");
    const primo = elemento(s, 7)();
    elemento(s, 3)();
    expect(elemento(s, 7)()).toBe(primo);
  });

  it("niente Math.random né orologi nel codice che disegna e suona", () => {
    const vietati = /Math\.random|Date\.now|performance\.now|new Date\(/;
    const trovati: string[] = [];
    const cammina = (d: string) => {
      for (const n of readdirSync(join(ROOT, d)).sort()) {
        const p = `${d}/${n}`;
        if (statSync(join(ROOT, p)).isDirectory()) {
          if (n !== "render" && n !== "out" && n !== "dist") cammina(p);
        } else if (n.endsWith(".ts")) {
          readFileSync(join(ROOT, p), "utf8")
            .split("\n")
            .forEach((r, i) => {
              if (vietati.test(r)) trovati.push(`${p}:${i + 1}`);
            });
        }
      }
    };
    cammina("cartoni");
    expect(trovati).toEqual([]);
  });

  it("i grilli della notte: dove non ci sono, l'ambiente resta quello di prima campione per campione; dove ci sono, si sentono", () => {
    const aria = (grilli?: number) => () => ({ vento: 0.1, pioggia: 0, lago: 0.2, ...(grilli === undefined ? {} : { grilli }) });
    const suona = (grilli?: number) => {
      const b = new Bus(3);
      ambiente(b, aria(grilli));
      return Buffer.from(b.l.buffer);
    };
    expect(suona(0).equals(suona())).toBe(true);
    expect(suona(0.8).equals(suona())).toBe(false);
  });

  it("la colonna sonora è deterministica (strumenti, effetti, grammelot)", () => {
    const suona = () => {
      const b = new Bus(1.5);
      arpa(b, 0.1, 62, 0.8, -0.3);
      effetto(b, "crack", 0.5);
      effetto(b, "fischio", 0.9, 1, 0.4);
      return wav(b);
    };
    const x = suona();
    const y = suona();
    expect(x.length).toBe(44 + Math.ceil(1.5 * SR) * 4);
    expect(Buffer.from(x).equals(Buffer.from(y))).toBe(true);
    expect(String.fromCharCode(...x.slice(0, 4))).toBe("RIFF");
    const p = pianifica("Dove passo io, passi tu.", VOCI.zara);
    expect(Buffer.from(suonaBattuta(p, VOCI.zara).buffer).equals(Buffer.from(suonaBattuta(p, VOCI.zara).buffer))).toBe(true);
  });
});

describe("cartoni — montaggio", () => {
  const sc = scaletta(PROVA);

  it("le inquadrature sono in fila, senza buchi, e la durata torna", () => {
    let t = 0;
    for (const p of sc) {
      expect(p.inizio).toBeCloseTo(t, 9);
      t = p.fine;
    }
    expect(durata(PROVA)).toBeCloseTo(t, 9);
  });

  it("postoA trova l'inquadratura giusta anche sui bordi", () => {
    for (const p of sc) {
      expect(postoA(sc, p.inizio).q.id).toBe(p.q.id);
      expect(postoA(sc, p.fine - 1e-6).q.id).toBe(p.q.id);
    }
  });

  it("apre e chiude sul nero; ogni fotogramma è SVG ben chiuso", () => {
    expect(fotogramma(PROVA, 0, sc).velo?.opacita).toBeCloseTo(1, 3);
    expect(fotogramma(PROVA, durata(PROVA), sc).velo?.opacita ?? 0).toBeGreaterThan(0.95);
    for (const t of [0.7, 3, 6.3, 8]) {
      const svg = inSvg(fotogramma(PROVA, t, sc));
      expect((svg.match(/<g[ >]/g) ?? []).length).toBe((svg.match(/<\/g>/g) ?? []).length);
      expect(svg).not.toMatch(/NaN|undefined|Infinity/);
    }
  });
});

describe("cartoni — attrezzi e luoghi", () => {
  it("traccia: vale la prima chiave prima, l'ultima dopo, e interpola in mezzo", () => {
    const f = traccia([
      [0, 10],
      [1, 20, ease.lineare],
      [2, 0],
    ]);
    expect(f(-1)).toBe(10);
    expect(f(0.5)).toBeCloseTo(15, 9);
    expect(f(3)).toBe(0);
  });

  it("la camera: aSchermo e matriceLivello dicono la stessa cosa", () => {
    const cam = { x: 120, y: -80, zoom: 1.7 };
    const [sx, sy] = aSchermo(cam, 1, 300, 40);
    const m = matriceLivello(cam, 1).match(/matrix\(([^)]+)\)/)![1].split(" ").map(Number);
    expect(m[0] * 300 + m[2] * 40 + m[4]).toBeCloseTo(sx, 0);
    expect(m[1] * 300 + m[3] * 40 + m[5]).toBeCloseTo(sy, 0);
  });

  it("il suolo di un luogo è continuo e passa dai punti del profilo", () => {
    for (let x = -5000; x < 5000; x += 7) expect(Math.abs(SOGLIA.quota(x + 1) - SOGLIA.quota(x))).toBeLessThan(3);
    for (const [x, y] of SOGLIA.profilo) expect(SOGLIA.quota(x)).toBeCloseTo(y, 6);
  });

  it("le didascalie vanno a capo in al più tre righe", () => {
    expect(aCapo("Uno scatto, il luccichio nel becco, e via bassa sopra il canneto, verso sud, senza finire né la frase né il lavoro.").length).toBeLessThanOrEqual(3);
  });
});

describe("cartoni — il lago (ep02): la riva, le barche, i riflessi, la corda sul legno", () => {
  it("l'orlo, l'approdo, Rivalba e le Coppelle: suolo continuo; all'orlo le cose stanno dove la prosa le vuole (il molo e la barca sull'acqua, la tana e il masso all'asciutto)", () => {
    for (const L of [ORLO, APPRODO, RIVALBA, COPPELLE]) {
      for (let x = -3000; x < 6000; x += 7) expect(Math.abs(L.quota(x + 1) - L.quota(x)), `${L.id} x=${x}`).toBeLessThan(3);
      for (const [x, y] of L.profilo) expect(L.quota(x)).toBeCloseTo(y, 6);
    }
    const q = LAGO_VESPRO.quota; // y cresce verso il basso: sotto il pelo dell'acqua = quota > q
    for (const x of [RIVA.molo[0], RIVA.molo[1] - 60, RIVA.barca, RIVA.largo]) expect(ORLO.quota(x), `acqua a x=${x}`).toBeGreaterThan(q);
    for (const x of [RIVA.custode, RIVA.tana, RIVA.ciglio, ...RIVA.secche, RIVA.reti]) expect(ORLO.quota(x), `asciutto a x=${x}`).toBeLessThan(q);
    expect(RIVA.molo[0]).toBeLessThan(RIVA.molo[1]);
  });

  it("Rivalba (ep03): i Massi del Consiglio escono dall'acqua uno accanto all'altro, il più alto è quello da cui si parla; passerelle, molo e barca sull'acqua, la tana e il sentiero all'asciutto", () => {
    const q = LAGO_VESPRO.quota;
    const alte = CUORE.massi.map(([, , h]) => h);
    expect(Math.max(...alte)).toBe(alte[CUORE.alto]);
    CUORE.massi.forEach(([x, w], i) => {
      expect(RIVALBA.quota(x), `sotto il masso ${i} c'è acqua`).toBeGreaterThan(q);
      expect(sulMassoDelConsiglio(i)[1], `la cima del masso ${i} sta sopra l'acqua`).toBeLessThan(q);
      if (i > 0) {
        const [xp, wp] = CUORE.massi[i - 1];
        const salto = x - w / 2 - (xp + wp / 2);
        expect(salto, `tra il masso ${i - 1} e il ${i}: un passo`).toBeGreaterThan(20);
        expect(salto, `tra il masso ${i - 1} e il ${i}: un passo`).toBeLessThan(110);
      }
    });
    for (const [a, b] of CUORE.passerelle) for (const x of [a, (a + b) / 2, b]) expect(RIVALBA.quota(x), `acqua sotto la passerella a x=${x}`).toBeGreaterThan(q);
    for (const x of [CUORE.molo[0], CUORE.barca, CUORE.barca - CUORE.lunghezzaBarca / 2 - 40, CUORE.barca + CUORE.lunghezzaBarca / 2]) expect(RIVALBA.quota(x), `acqua a x=${x}`).toBeGreaterThan(q);
    for (const x of [CUORE.molo[0] + 10, CUORE.fondoPasserella]) expect(sullaPasserella(x)).toBeLessThan(q);
    for (const x of [CUORE.tana, CUORE.sentiero[0], CUORE.sentiero[1]]) expect(RIVALBA.quota(x), `asciutto a x=${x}`).toBeLessThan(q);
  });

  it("una barca a galla dondola poco, sempre uguale per lo stesso nome; la calma la ferma", () => {
    for (let t = 0; t < 60; t += 0.37) {
      const a = galleggia(t, "barca");
      expect(Math.abs(a.dy)).toBeLessThan(5);
      expect(Math.abs(a.ang)).toBeLessThan(1.5);
      expect(galleggia(t, "barca")).toEqual(a);
      const ferma = galleggia(t, "barca", 0);
      expect(Math.abs(ferma.dy) + Math.abs(ferma.ang)).toBe(0);
    }
  });

  it("il riflesso: capovolto attorno al pelo dell'acqua, solo sotto; sfumato ai bordi se serve", () => {
    const defs = new Defs("");
    const r = riflesso(defs, "prova", '<circle cx="0" cy="850" r="20"/>', 900, { t: 1, opacita: 0.6, sfuma: { c: [0, 850], r: 100 } });
    expect(r).toContain("translate(0 1800)scale(1 -1)");
    expect(r).toContain("clip-path");
    expect(r).toContain("mask=");
    expect(riflesso(new Defs(""), "vuoto", "", 900, { t: 1 })).toBe("");
  });

  it("la corda sul legno o nell'involto non ha le conche della pietra (quelle sono di ep01); il nodo nuovo c'è solo quando lo si fa", () => {
    const testo = (o: Partial<Parameters<typeof insertoCorda>[0]>) =>
      insertoCorda({ t: 1, luce: LUCI.giorno, defs: new Defs(""), srotolata: 1, lettura: -1, spinta: 0, ...o })
        .map((l) => l.contenuto)
        .join("");
    expect(testo({})).toContain("conca");
    expect(testo({ fondo: "legno" })).not.toContain("conca");
    expect(testo({ fondo: "foglie" })).not.toContain("conca");
    const senza = testo({ fondo: "legno", nuovi: [{ u: FINE_NODI + 0.05, fatto: 0 }] });
    const con = testo({ fondo: "legno", nuovi: [{ u: FINE_NODI + 0.05, fatto: 1 }] });
    expect(senza).toBe(testo({ fondo: "legno" }));
    expect(con.length).toBeGreaterThan(senza.length);
    expect(testo({ fondo: "legno", zampeLontra: { u: FINE_NODI + 0.1, strappo: 0.4, lavora: 1 } })).not.toMatch(/NaN|undefined|Infinity/);
  });

  it("il martin pescatore posato (anche offeso e bagnato) è ben disegnato e sempre uguale", () => {
    const ctx = { luce: LUCI.giorno, defs: new Defs(""), id: "mp" };
    for (const t of [0, 1.3, 7.9]) {
      const d = martinPescatore({ t, modo: "posato", offeso: 1, bagnato: 1 }, ctx);
      expect(d).not.toMatch(/NaN|undefined|Infinity/);
      expect(martinPescatore({ t, modo: "posato", offeso: 1, bagnato: 1 }, ctx)).toBe(d);
    }
  });
});

describe("cartoni — i temi della serie (cartoni/audio/temi.ts): la musica che torna", () => {
  const temi = Object.entries(TEMI).filter(([, v]) => Array.isArray(v)) as [string, readonly unknown[]][];

  it("ogni tema è fatto bene: note in fila, durate positive, dentro l'estensione degli strumenti", () => {
    expect(temi.length).toBeGreaterThanOrEqual(8);
    for (const [nome, tema] of temi) {
      if (typeof tema[0] === "number") {
        for (const m of tema as number[]) expect(m, nome).toBeGreaterThanOrEqual(24);
        continue; // un ostinato nel basso: una nota per battito
      }
      let prima = -1;
      for (const [b, d, m] of tema as [number, number, number][]) {
        expect(b, nome).toBeGreaterThanOrEqual(prima);
        expect(d, nome).toBeGreaterThan(0);
        expect(m, nome).toBeGreaterThanOrEqual(48);
        expect(m, nome).toBeLessThanOrEqual(96);
        prima = b;
      }
    }
  });

  it("il riflesso è il tema del lago capovolto, Cervara quello di Zara (specchi diatonici attorno al Re)", () => {
    const scala = [62, 64, 66, 67, 69, 71, 73]; // Re maggiore
    const grado = (m: number) => {
      const o = Math.floor((m - 62) / 12);
      const i = scala.indexOf(m - 12 * o);
      expect(i, `nota ${m} fuori dalla scala`).toBeGreaterThanOrEqual(0);
      return o * 7 + i;
    };
    const nota = (g: number) => scala[((g % 7) + 7) % 7] + 12 * Math.floor(g / 7);
    const asse = grado(74);
    expect(TEMI.RIFLESSO.length).toBe(TEMI.LAGO.length);
    TEMI.LAGO.forEach(([b, d, m], i) => expect(TEMI.RIFLESSO[i]).toEqual([b, d, nota(2 * asse - grado(m))]));
    // Cervara è lo specchio di Zara: le sue note capovolte, e lente il doppio
    expect(TEMI.CERVARA.length).toBe(TEMI.ZARA.length);
    TEMI.ZARA.forEach(([b, d, m], i) => expect(TEMI.CERVARA[i]).toEqual([b * 2, d * 2, nota(2 * asse - grado(m))]));
  });
});

describe("cartoni — la parola: chi parla, e con che sillabe", () => {
  it("una didascalia si spezza in narrazione e battute (con chi le dice)", () => {
    const s = segmenta("«Anch'io,» disse il rinoceronte, e girò la testa. «Rocco.»", "rocco");
    expect(s.map((x) => [x.tipo, x.chi, x.testo])).toEqual([
      ["battuta", "rocco", "Anch'io,"],
      ["narrazione", "narratrice", "disse il rinoceronte, e girò la testa."],
      ["battuta", "rocco", "Rocco."],
    ]);
    expect(segmenta("«No,» disse Zara.", ["zara"])[0].chi).toBe("zara");
    expect(segmenta("«Ora tocca a te,» aveva detto lui.")[0].chi).toBe("narratrice");
    expect(segmenta("La collina restò indietro.")).toEqual([{ tipo: "narrazione", testo: "La collina restò indietro.", chi: "narratrice" }]);
  });

  it("le sillabe italiane (alla buona, quanto basta al ritmo)", () => {
    expect(sillabeParola("collina")).toEqual(["col", "li", "na"]);
    expect(sillabeParola("Spondalta")).toEqual(["Spon", "dal", "ta"]);
    expect(sillabeParola("aspetta")).toEqual(["a", "spet", "ta"]);
    expect(sillabeParola("sopra")).toEqual(["so", "pra"]);
    expect(sillabeParola("giovane")).toEqual(["gio", "va", "ne"]);
  });

  it("accento e punteggiatura: l'accento scritto vince; la domanda e la frase tronca si vedono", () => {
    const s = sillabe("La conosci? Così—");
    expect(s.find((x) => x.testo === "sì")?.tonica).toBe(true);
    expect(s.find((x) => x.testo === "sci")?.pausa).toBe("domanda");
    expect(s[s.length - 1].pausa).toBe("tronca");
  });
});

describe("cartoni — le voci", () => {
  it("il piano di una battuta: sillabe in fila dentro la durata, deterministico, al passo della voce", () => {
    const p = pianifica("Nella tua ombra mi sono sentita al sicuro.", VOCI.zara);
    expect(pianifica("Nella tua ombra mi sono sentita al sicuro.", VOCI.zara)).toEqual(p);
    let t = 0;
    for (const s of p.sillabe) {
      expect(s.t0).toBeGreaterThanOrEqual(t - 1e-9);
      expect(s.t1).toBeGreaterThan(s.t0);
      t = s.t1;
    }
    expect(t).toBeCloseTo(p.durata, 9);
    // 15 sillabe al passo di Zara: tra 0.6× e 1.6× del tempo nominale
    expect(p.durata).toBeGreaterThan((15 / VOCI.zara.ritmo) * 0.6);
    expect(p.durata).toBeLessThan((15 / VOCI.zara.ritmo) * 1.6);
    // Rocco parla più piano di Zara
    expect(pianifica("Dove passo io, passi tu.", VOCI.rocco).durata).toBeGreaterThan(pianifica("Dove passo io, passi tu.", VOCI.zara).durata);
  });

  it("la bocca: chiusa fuori dalla battuta e sulle consonanti di labbra, aperta sulle vocali", () => {
    const p = pianifica("Sono giovane.", VOCI.zara);
    expect(boccaBattuta(p, -0.5)).toBe(0);
    expect(boccaBattuta(p, p.durata + 0.5)).toBe(0);
    const s = p.sillabe[1];
    expect(boccaBattuta(p, (s.t0 + s.tc + s.t1) / 2)).toBeGreaterThan(0.3);
    const m = pianifica("Mamma mia.", { ...VOCI.rocco, esita: 0 });
    const lab = m.sillabe.find((x) => "mbp".includes(x.cons) && x.tc > 0.03)!;
    expect(boccaBattuta(m, lab.t0 + lab.tc / 2)).toBe(0);
  });

  it("il grammelot suona: niente NaN, niente saturazione, e non è silenzio", () => {
    for (const chi of Object.keys(VOCI)) {
      const x = suonaBattuta(pianifica("Dove va, il resto?", VOCI[chi]), VOCI[chi]);
      let picco = 0;
      let e = 0;
      let finiti = true;
      for (const v of x) {
        finiti &&= Number.isFinite(v);
        picco = Math.max(picco, Math.abs(v));
        e += v * v;
      }
      expect(finiti, chi).toBe(true);
      expect(picco).toBeLessThan(1);
      expect(Math.sqrt(e / x.length)).toBeGreaterThan(0.01);
    }
  });

  it("con le voci ogni didascalia dura quanto la sua voce, e la storia aspetta (tutto in fila, niente accavallamenti)", () => {
    // una ripresa finta della narratrice per l'unico pezzo narrato dell'inquadratura b
    const narr: Narrazione = { voce: "prova", stato: "provino", clip: { [chiaveClip("b", 0, 0)]: { testo: "La collina restò indietro.", durata: 3.4, file: "b-0-0.ogg" } } };
    expect(daNarrare(PROVA, VOCI).map((p) => p.chiave)).toEqual([chiaveClip("a", 0, 1), chiaveClip("b", 0, 0)]);
    const ep = conVoce(PROVA, { voci: VOCI, narrazione: narr });
    expect(ep.senzaRipresa).toEqual([`${chiaveClip("a", 0, 1)}: «disse lui.»`]);
    expect(ep.voci.map((v) => [v.q, v.tipo, v.chi])).toEqual([
      ["a", "battuta", "rocco"],
      ["a", "battuta", "zara"],
      ["b", "narrazione", "narratrice"],
    ]);
    const sc = scaletta(ep);
    for (const v of ep.voci) {
      const p = sc.find((x) => x.q.id === v.q)!;
      const d = p.q.didascalie![v.didascalia];
      // la voce sta dentro la sua didascalia, con un respiro prima e un margine dopo
      expect(v.tg).toBeGreaterThanOrEqual(p.inizio + d.da + 0.29);
      expect(v.tg + v.durata).toBeLessThanOrEqual(p.inizio + d.a - 0.59);
    }
    for (let i = 1; i < ep.voci.length; i++) expect(ep.voci[i].tg).toBeGreaterThanOrEqual(ep.voci[i - 1].tg + ep.voci[i - 1].durata);
    // la scena si è allungata quanto serviva, e il tempo della storia non torna mai indietro
    expect(durata(ep)).toBeGreaterThanOrEqual(durata(PROVA));
    for (const T of Object.values(ep.tempi)) {
      for (let k = 1; k < T.nodi.length; k++) {
        expect(T.nodi[k][0]).toBeGreaterThanOrEqual(T.nodi[k - 1][0]);
        expect(T.nodi[k][1]).toBeGreaterThanOrEqual(T.nodi[k - 1][1]);
      }
    }
    // i suoni seguono: i passi restano dentro la loro inquadratura
    for (const s of suoni(ep)) expect(s.tg + (s.durata ?? 0)).toBeLessThanOrEqual(sc[0].fine + 1e-6);
  });
});

describe("cartoni — le battute registrate", () => {
  it("una battuta registrata prende il posto del grammelot, e la bocca segue il suo volume", () => {
    const chiave = chiaveClip("a", 0, 0);
    expect(daRecitare(PROVA, VOCI).map((b) => [b.chiave, b.chi, b.testo])).toEqual([
      [chiave, "rocco", "Sei piccola,"],
      [chiaveClip("a", 1, 0), "zara", "Sono giovane."],
    ]);
    const b: Battute = {
      voci: { rocco: { voce: "prova", stato: "provino" } },
      clip: { [chiave]: { chi: "rocco", voce: "prova", testo: "Sei piccola,", durata: 0.4, file: "a-0-0.ogg", bocca: "0599" } },
    };
    const ep = conVoce(PROVA, { voci: VOCI, battute: b });
    const rocco = ep.voci.find((v) => v.chi === "rocco")!;
    expect(rocco.clip?.file).toBe("a-0-0.ogg");
    expect(rocco.piano).toBeUndefined();
    expect(rocco.durata).toBe(0.4);
    // Zara non è registrata: resta in grammelot, e si dice
    expect(ep.voci.find((v) => v.chi === "zara")?.piano).toBeDefined();
    expect(ep.senzaRegistrazione).toEqual([`${chiaveClip("a", 1, 0)} (zara): «Sono giovane.»`]);
    // la bocca: 0 prima, aperta dove la ripresa è forte, 0 dopo
    expect(boccaRipresa("0599", -0.1)).toBe(0);
    expect(boccaRipresa("0599", 0.1)).toBeGreaterThan(0.9);
    expect(boccaRipresa("0599", 0.2)).toBe(0);
    // un testo diverso da quello della didascalia non vale: si torna al grammelot
    const sbagliata = conVoce(PROVA, { voci: VOCI, battute: { ...b, clip: { [chiave]: { ...b.clip[chiave], testo: "Sei grande," } } } });
    expect(sbagliata.voci.find((v) => v.chi === "rocco")?.piano).toBeDefined();
  });
});

describe("cartoni — le voci della saga: una per ruolo, e poi sempre quella (cartoni/voce/voce.json)", () => {
  type Ruolo = { stato: string; voce: string | null; provvisoria?: string; provini?: string[] };
  type Saga = {
    narratrice: Ruolo;
    personaggi: Record<string, Ruolo>;
    candidate: Record<string, { motore: string; modello: string; lentezza: number; variazione?: number; cadenza?: number; tono?: number; licenza: string }>;
  };
  const saga: Saga = JSON.parse(leggi("cartoni/voce/voce.json"));
  const ruoli: [string, Ruolo][] = [["narratrice", saga.narratrice], ...Object.entries(saga.personaggi)];
  const attuale = (r: Ruolo) => r.voce ?? r.provvisoria;

  it("ogni ruolo è chiaro: scelta (una candidata) o da scegliere (con una provvisoria); i provini sono candidate", () => {
    const nomi = Object.keys(saga.candidate);
    for (const [nome, r] of ruoli) {
      expect(["da-scegliere", "scelta"], nome).toContain(r.stato);
      if (r.stato === "scelta") expect(nomi, nome).toContain(r.voce);
      else {
        expect(r.voce, nome).toBeNull();
        expect(nomi, nome).toContain(r.provvisoria);
      }
      for (const pv of r.provini ?? []) expect(nomi, `${nome}: provino ${pv}`).toContain(pv);
    }
    for (const [nome, c] of Object.entries(saga.candidate)) {
      expect(["piper", "kokoro"], nome).toContain(c.motore);
      expect(c.lentezza, nome).toBeGreaterThan(0);
      expect(c.licenza.length, nome).toBeGreaterThan(10);
    }
  });

  it("due ruoli non hanno mai la stessa voce, e ogni personaggio ha il suo profilo nel cast", () => {
    const usate = ruoli.map(([, r]) => attuale(r));
    expect(new Set(usate).size).toBe(usate.length);
    for (const p of Object.keys(saga.personaggi)) expect(Object.keys(VOCI), p).toContain(p);
  });

  it("ogni episodio registrato usa le voci della saga (e finché una voce non è scelta, le sue riprese sono provini) — con le stesse impostazioni: la stessa voce suona uguale in tutti gli episodi", () => {
    const dir = join(ROOT, "cartoni/episodi");
    const episodi = existsSync(dir) ? readdirSync(dir) : [];
    for (const id of episodi) {
      const fn = join(dir, id, "voce/narrazione.json");
      if (existsSync(fn)) {
        const n: Narrazione = JSON.parse(readFileSync(fn, "utf8"));
        expect(n.voce, `${id}: la narratrice della saga è ${attuale(saga.narratrice)}`).toBe(attuale(saga.narratrice));
        expect(n.stato, id).toBe(saga.narratrice.stato === "scelta" ? "definitiva" : "provino");
        expect(n.impronta, `${id}: la narrazione è registrata con impostazioni di «${n.voce}» diverse da quelle di voce.json: riregistrala (narra.ts --episodio ${id} --chi narratrice)`).toBe(impronta(saga.candidate[n.voce]));
      }
      const fb = join(dir, id, "voce/battute.json");
      if (existsSync(fb)) {
        const b: Battute = JSON.parse(readFileSync(fb, "utf8"));
        for (const [chi, v] of Object.entries(b.voci)) {
          const r = saga.personaggi[chi];
          expect(r, `${id}: ${chi} non ha un ruolo in voce.json`).toBeDefined();
          expect(v.voce, `${id}: la voce di ${chi} è ${attuale(r)}`).toBe(attuale(r));
          expect(v.stato, `${id}: ${chi}`).toBe(r.stato === "scelta" ? "definitiva" : "provino");
          expect(v.impronta, `${id}: le battute di ${chi} sono registrate con impostazioni di «${v.voce}» diverse da quelle di voce.json: riregistrale (narra.ts --episodio ${id} --chi ${chi})`).toBe(impronta(saga.candidate[v.voce]));
        }
        for (const [k, c] of Object.entries(b.clip)) expect(c.voce, `${id} ${k}`).toBe(b.voci[c.chi!]?.voce);
      }
    }
  });
});

describe("cartoni — i brani della saga (cartoni/brani/): canzoni registrate, coi versi del canone", () => {
  const brani: Brani = JSON.parse(leggi("cartoni/brani/brani.json"));
  const voci = Object.entries(brani).filter(([k]) => !k.startsWith("_"));

  it("ogni brano ha il suo file, le sezioni in fila dentro la durata, i versi in ordine dentro le sezioni, la fonte e la licenza", () => {
    expect(voci.length).toBeGreaterThan(0);
    for (const [id, b] of voci) {
      expect(existsSync(join(ROOT, "cartoni/brani", b.file)), `${id}: ${b.file}`).toBe(true);
      expect(statSync(join(ROOT, "cartoni/brani", b.file)).size, id).toBeGreaterThan(10_000);
      const sez = Object.values(b.sezioni).sort((x, y) => x[0] - y[0]);
      expect(sez[0][0], id).toBe(0);
      expect(sez[sez.length - 1][1], id).toBeCloseTo(b.durata, 3);
      for (let i = 1; i < sez.length; i++) expect(sez[i][0], id).toBeCloseTo(sez[i - 1][1], 6);
      b.versi.forEach((v, i) => {
        expect(v.a, `${id}: ${v.testo}`).toBeGreaterThan(v.da);
        if (i > 0) expect(v.da, `${id}: ${v.testo}`).toBeGreaterThanOrEqual(b.versi[i - 1].a);
        expect(v.a, id).toBeLessThanOrEqual(b.durata);
      });
      expect(b.fonte.length, id).toBeGreaterThan(20);
      expect(b.licenza.length, id).toBeGreaterThan(20);
    }
  });

  it("i versi cantati sono quelli del canone, alla lettera e in ordine", () => {
    for (const [id, b] of voci) {
      if (!b.testo) continue;
      const canone = leggi(b.testo);
      // nel canone i versi stanno in corsivo, uno dopo l'altro, separati da « / »
      const blocco = canone.split(/\n\s*\n/).find((p) => p.includes(b.versi[0].testo)) ?? "";
      const corsivo = blocco.slice(blocco.indexOf("*") + 1, blocco.lastIndexOf("*"));
      const righe = corsivo.replace(/\s+/g, " ").split(" / ").map((r) => r.trim());
      expect(b.versi.map((v) => v.testo), id).toEqual(righe);
    }
  });

  it("i versi compaiono col canto, e sotto un brano la storia non rallenta (se una voce ne avesse bisogno, si dice)", () => {
    const b = brani["ninna-nanna"];
    const uso = { id: "ninna-nanna", da: 2, dal: 15 };
    const versi = versiCantati("ninna-nanna", b, uso, 1);
    expect(versi.length).toBe(b.versi.length);
    expect(versi[0].da).toBeCloseTo(2 + (b.versi[0].da - 15) - 0.25, 6);
    expect(versi.every((d) => d.canto === "ninna-nanna" && d.pensiero)).toBe(true);
    const fine = versi[versi.length - 1].a + 1;
    const conBrano = (narrata: { da: number; a: number }): Episodio => ({
      ...PROVA,
      inquadrature: [{ ...PROVA.inquadrature[0], durata: fine + 4, brano: uso, didascalie: [{ ...narrata, pagina: 1, testo: "Zara non la cantò." }, ...versi] }],
    });
    const narr = (durata: number) => ({ voce: "x", stato: "definitiva" as const, clip: { "a/0/0": { testo: "Zara non la cantò.", durata, file: "x.ogg" } } });
    // una voce che ci sta nella sua didascalia, anche dentro la finestra del brano: niente da dire
    const ok = conVoce(conBrano({ da: 2.1, a: 3.9 }), { voci: VOCI, narrazione: narr(0.9) });
    expect(ok.fuoriTempo).toEqual([]);
    // una voce dentro la finestra che non ci sta: la storia dovrebbe rallentare sotto il brano → si dice
    const no = conVoce(conBrano({ da: 2.2, a: 3.0 }), { voci: VOCI, narrazione: narr(2.4) });
    expect(no.fuoriTempo.length).toBe(1);
    // e prima del brano la storia può rallentare quanto vuole
    const prima = conVoce({ ...conBrano({ da: 0, a: 0.6 }), inquadrature: [{ ...conBrano({ da: 0, a: 0.6 }).inquadrature[0], brano: { ...uso, da: 5 } }] }, { voci: VOCI, narrazione: narr(2.4) });
    expect(prima.fuoriTempo).toEqual([]);
    // i versi non si registrano (li canta il brano)
    expect(daNarrare(conBrano({ da: 0, a: 1.9 }), VOCI).map((p) => p.testo)).toEqual(["Zara non la cantò."]);
    // dove suona, a tempo vero
    const ep = conVoce(conBrano({ da: 0, a: 1.9 }), { voci: VOCI });
    const [posto] = postiDeiBrani(ep, brani);
    expect(posto.tg).toBeCloseTo(2, 6);
    expect(posto.dal).toBe(15);
    expect(posto.al).toBeCloseTo(b.durata, 6);
  });

  it("l'impronta di una voce cambia se cambia una delle sue impostazioni (e solo allora)", () => {
    const c = { motore: "piper", modello: "it_IT-paola-medium", lentezza: 1.38, variazione: 0.6, cadenza: 0.7, tono: 4 };
    expect(impronta(c)).toMatch(/^[0-9a-f]{8}$/);
    expect(impronta({ ...c })).toBe(impronta(c));
    expect(impronta({ ...c, descrizione: "altro" } as typeof c)).toBe(impronta(c));
    for (const k of ["lentezza", "variazione", "cadenza", "tono"] as const) expect(impronta({ ...c, [k]: c[k] + 0.01 }), k).not.toBe(impronta(c));
    expect(impronta({ ...c, modello: "it_IT-serena-high" })).not.toBe(impronta(c));
  });
});

describe("cartoni — la serie: 24 episodi di ~5′, a quattro a quattro in 6 puntate di ~20′ (dal grafo della saga)", () => {
  const serie = puntate(JSON.parse(leggi("saga/trama/saga_graph.json")), titoliVolumi(leggi("saga/trama/volumi/README.md")));
  const tutti = serie.flatMap((p) => p.episodi);

  it("una puntata per volume, in ordine, col titolo del volume", () => {
    expect(serie.map((p) => p.numero)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(serie[0].titolo).toBe("i Laghi del Vespro");
    for (const p of serie) expect(p.titolo.length, `puntata ${p.numero}`).toBeGreaterThan(3);
  });

  it("ogni episodio della saga sta in una puntata sola: quattro per puntata, 24 in tutto, in ordine", () => {
    expect(tutti.length).toBe(24);
    expect(new Set(tutti).size).toBe(24);
    expect(tutti).toEqual([...tutti].sort());
    for (const p of serie) expect(p.episodi.length, `puntata ${p.numero}: ${p.episodi.join(", ")}`).toBe(4);
    expect(puntataDi(serie, "ep01")?.numero).toBe(1);
    expect(puntataDi(serie, "ep24")?.numero).toBe(6);
  });

  it("ogni episodio ha la sua prosa, col titolo in testa (il titolo del suo capitolo nella puntata)", () => {
    for (const id of tutti) {
      const f = `saga/prosa/${id}.md`;
      expect(existsSync(join(ROOT, f)), f).toBe(true);
      expect(titoloDallaProsa(leggi(f)), f).toBeTruthy();
    }
  });

  it("la durata di un episodio mira a ~5′ (e quattro fanno una puntata di ~20′)", () => {
    expect(DURATA_EPISODIO.min).toBeLessThan(DURATA_EPISODIO.mira);
    expect(DURATA_EPISODIO.mira).toBeLessThan(DURATA_EPISODIO.max);
    expect(4 * DURATA_EPISODIO.mira).toBe(20 * 60);
  });

  it("un grafo di prova: si raggruppa per volume; un arco che manca o un volume senza titolo si dicono", () => {
    const g = { arcs: { a: { volume: 2 }, b: { volume: 1 } }, episodes: { ep03: { arc: "a" }, ep02: { arc: "b" }, ep01: { arc: "b" } } };
    expect(puntate(g, { 1: "uno", 2: "due" })).toEqual([
      { numero: 1, titolo: "uno", episodi: ["ep01", "ep02"] },
      { numero: 2, titolo: "due", episodi: ["ep03"] },
    ]);
    expect(() => puntate({ arcs: {}, episodes: { ep01: { arc: "x" } } }, {})).toThrow(/arco/);
    expect(() => puntate(g, { 1: "uno" })).toThrow(/titolo/);
    expect(titoliVolumi("| Vol | Titolo |\n|---|---|\n| 3 | [il Gran Ducato](VOLUME_3.md) | `pianura_alta` |")).toEqual({ 3: "il Gran Ducato" });
    expect(titoloDallaProsa("# ep02 — Il regno senza riflesso\n\n## Pagina 1")).toBe("Il regno senza riflesso");
  });
});

describe("cartoni — i colori dei pupazzi vengono dalle schede", () => {
  const ancore = (file: string): string[] => {
    const riga = leggi(file)
      .split("\n")
      .find((r) => r.includes("ancore colore"));
    return (riga?.match(/#[0-9a-fA-F]{6}/g) ?? []).map((c) => c.toLowerCase()).sort();
  };
  const del = (o: Record<string, string>) => Object.values(o).map((c) => c.toLowerCase()).sort();

  it("Rocco = saga/bible/rocco.md", () => expect(del(ROCCO_ANCORE)).toEqual(ancore("saga/bible/rocco.md")));
  it("Zara = saga/bible/zara.md", () => expect(del(ZARA_ANCORE)).toEqual(ancore("saga/bible/zara.md")));
  it("Cècca = saga/bible/comprimari/cecca.md", () => expect(del(CECCA_ANCORE)).toEqual(ancore("saga/bible/comprimari/cecca.md")));
  it("Brénta = saga/bible/comprimari/traghettatrice-delle-rive.md", () => expect(del(BRENTA_ANCORE)).toEqual(ancore("saga/bible/comprimari/traghettatrice-delle-rive.md")));
  it("Cervara = saga/bible/comprimari/specchio-di-zara.md", () => expect(del(CERVARA_ANCORE)).toEqual(ancore("saga/bible/comprimari/specchio-di-zara.md")));
});

describe("cartoni — lessico delle Terre Annodate nel codice", () => {
  type Mappa = { nomi: Record<string, string> };
  const mappa: Mappa = JSON.parse(leggi("saga/lessico/mappa.json"));
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const chiavi = [...Object.keys(mappa.nomi), "foulard", "Kainua"].sort((a, b) => b.length - a.length);
  const PATTERN = new RegExp("(?<![A-Za-zÀ-ÿ])(?:" + chiavi.map(escape).join("|") + ")(?![A-Za-zÀ-ÿ])");

  it("il codice del cartone (commenti e dati compresi) non contiene nomi reali", () => {
    const file: string[] = [];
    const cammina = (d: string) => {
      for (const n of readdirSync(join(ROOT, d)).sort()) {
        const p = `${d}/${n}`;
        if (statSync(join(ROOT, p)).isDirectory()) {
          if (n !== "out" && n !== "dist") cammina(p);
        } else if (/\.(ts|mjs|md|py|json)$/.test(n)) file.push(p);
      }
    };
    cammina("cartoni");
    const leak = file.flatMap((f) =>
      leggi(f)
        .split("\n")
        .map((r, i) => (PATTERN.test(r) ? `${f}:${i + 1}: ${r.trim().slice(0, 80)}` : ""))
        .filter(Boolean),
    );
    expect(leak, leak.join("\n")).toEqual([]);
  });
});

describe("cartoni — anti-New-Age: la pietra è tiepida, non magica", () => {
  it("l'inserto della pietra non usa bagliori (niente filtri, niente sfocature luminose)", () => {
    for (const piene of [false, true]) {
      const defs = new Defs();
      const svg = insertoPietra({ t: 2, luce: LUCI.alba, defs, piene, zampa: 1, brina: 1, vapore: 1, cielo: "#c4d2de", spinta: 0.5 })
        .map((l) => l.contenuto)
        .join("");
      expect(svg + defs.markup()).not.toMatch(/<filter|feGaussianBlur|feMorphology|glow/i);
    }
  });
});
