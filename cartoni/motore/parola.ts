// cartoni/motore/parola.ts — dalla didascalia alla voce: chi parla, e con che sillabe.
//
// Una didascalia è prosa citata alla lettera. Dentro ci sono due voci:
//  - la NARRAZIONE (fuori dalle «»): la legge la narratrice, se c'è;
//  - le BATTUTE (dentro le «»): le dicono i personaggi, in grammelot — una
//    lingua che non esiste, fatta del ritmo, delle vocali e della musica della
//    frase vera (come Pingu: si capisce tutto senza capire le parole).
//
// Qui la didascalia si spezza in segmenti, e una battuta in sillabe italiane
// (con l'accento e la punteggiatura che fa la melodia). Niente audio: sono
// solo dati, uguali nel browser e nel render.

// ------------------------------------------------------------- segmenti --
export interface Segmento {
  tipo: "narrazione" | "battuta";
  /** il testo del segmento (senza le «») */
  testo: string;
  /** chi dice la battuta (per la narrazione: "narratrice") */
  chi: string;
}

/**
 * Spezza una didascalia in narrazione e battute. `chi`: chi dice le battute
 * (uno per tutte, o uno per battuta nell'ordine). Senza `chi` le battute
 * restano alla narratrice (una battuta ricordata, citata dentro il racconto).
 */
export function segmenta(testo: string, chi?: string | readonly string[]): Segmento[] {
  const out: Segmento[] = [];
  let i = 0;
  let nBattuta = 0;
  const parlante = (): string => {
    if (!chi) return "narratrice";
    if (typeof chi === "string") return chi;
    return chi[Math.min(nBattuta, chi.length - 1)] ?? "narratrice";
  };
  const narra = (s: string) => {
    const pulito = s.replace(/^[\s,;:.—–-]+(?=\S)/, "").trim();
    // un pezzo di sola punteggiatura non si legge
    if (/[A-Za-zÀ-ÿ]/.test(pulito)) out.push({ tipo: "narrazione", testo: pulito, chi: "narratrice" });
  };
  while (i < testo.length) {
    const a = testo.indexOf("«", i);
    if (a < 0) {
      narra(testo.slice(i));
      break;
    }
    narra(testo.slice(i, a));
    const b = testo.indexOf("»", a + 1);
    const dentro = testo.slice(a + 1, b < 0 ? testo.length : b).trim();
    if (dentro) out.push({ tipo: "battuta", testo: dentro, chi: parlante() });
    nBattuta++;
    i = b < 0 ? testo.length : b + 1;
  }
  return out;
}

// -------------------------------------------------------------- sillabe --
export type Vocale = "a" | "e" | "i" | "o" | "u";

/** Il modo della consonante d'attacco (quel che serve alla bocca e al suono). */
export type Attacco = "nessuno" | "labiale" | "nasale" | "occlusiva" | "liquida" | "fricativa" | "vibrante";

/** Come finisce la parola dopo questa sillaba (la melodia della frase). */
export type Pausa = "" | "virgola" | "punto" | "domanda" | "esclamazione" | "tronca" | "sospesa";

export interface Sillaba {
  testo: string;
  vocale: Vocale;
  attacco: Attacco;
  /** sillaba chiusa (finisce in consonante) */
  chiusa: boolean;
  tonica: boolean;
  /** ultima sillaba di una parola */
  fineParola: boolean;
  /** la punteggiatura che segue (solo sull'ultima sillaba della parola) */
  pausa: Pausa;
}

const VOCALI = "aeiouàèéìíòóùúAEIOUÀÈÉÌÍÒÓÙÚ";
const ACCENTATE = "àèéìíòóùúÀÈÉÌÍÒÓÙÚ";
const isV = (c: string) => VOCALI.includes(c);
const base = (c: string): Vocale => {
  const m: Record<string, Vocale> = { à: "a", è: "e", é: "e", ì: "i", í: "i", ò: "o", ó: "o", ù: "u", ú: "u" };
  const l = c.toLowerCase();
  return (m[l] ?? l) as Vocale;
};

/** Parole atone (non prendono l'accento di frase). */
const ATONE = new Set(
  "il lo la i gli le un uno una di a da in con su per tra fra e o ma se che non mi ti si ci vi ne del della dei delle al alla ai alle nel nella col sul sulla lui lei".split(" "),
);

/** Attacchi che restano insieme a inizio sillaba (oltre a consonante + l/r). */
const NESSI = ["gn", "gl", "sc", "ch", "gh", "qu"];

function attaccoDi(cons: string): Attacco {
  const c = cons.toLowerCase().replace(/^s(?=[bcdfgklmnpqrtvz])/, "");
  if (!c) return cons ? "fricativa" : "nessuno";
  const k = c[0];
  if ("mbpvfw".includes(k)) return k === "m" ? "labiale" : k === "f" || k === "v" ? "fricativa" : "labiale";
  if ("n".includes(k)) return c.startsWith("gn") ? "nasale" : "nasale";
  if (c.startsWith("gl")) return "liquida";
  if ("l".includes(k)) return "liquida";
  if ("r".includes(k)) return "vibrante";
  if ("sz".includes(k)) return "fricativa";
  if ("tdckgqj".includes(k)) return "occlusiva";
  return "occlusiva";
}

/** Divide una parola (solo lettere) in sillabe ortografiche italiane, alla buona. */
export function sillabeParola(parola: string): string[] {
  const w = parola;
  // i nuclei: gruppi di vocali; iato tra due vocali "forti" (a, e, o) o con accento
  const forte = (c: string) => "aeoàèéòóAEOÀÈÉÒÓ".includes(c) || ACCENTATE.includes(c);
  const nuclei: [number, number][] = [];
  let i = 0;
  while (i < w.length) {
    if (!isV(w[i])) {
      i++;
      continue;
    }
    let j = i + 1;
    while (j < w.length && isV(w[j])) {
      // "qu", "gu" + vocale: la u è attacco, non nucleo (gestito sotto); iato forte+forte
      if (forte(w[j - 1]) && forte(w[j])) break;
      j++;
    }
    nuclei.push([i, j]);
    i = j;
  }
  if (nuclei.length <= 1) return [w];
  const tagli: number[] = [];
  for (let k = 0; k < nuclei.length - 1; k++) {
    const fine = nuclei[k][1];
    const inizio = nuclei[k + 1][0];
    const cons = w.slice(fine, inizio).toLowerCase();
    let taglio: number;
    if (cons.length === 0) taglio = fine; // iato
    else if (cons.length === 1) taglio = fine;
    else {
      const due = cons.slice(0, 2);
      if (cons[0] === cons[1]) taglio = fine + 1; // doppie: at-to
      else if (cons[0] === "s") taglio = fine; // s impura: a-sta
      else if (NESSI.includes(due) || (/[bcdfgkptv]/.test(cons[0]) && /[lr]/.test(cons[1]))) taglio = fine; // a-pro, a-gno
      else taglio = fine + 1; // ar-co, an-che
      // tre consonanti: la prima resta alla sillaba prima (in-stan-te), tranne s impura
      if (cons.length >= 3 && cons[0] !== "s") taglio = fine + 1;
    }
    tagli.push(taglio);
  }
  const out: string[] = [];
  let da = 0;
  for (const t of tagli) {
    out.push(w.slice(da, t));
    da = t;
  }
  out.push(w.slice(da));
  return out.filter(Boolean);
}

/** Le sillabe di una battuta, con accenti e punteggiatura. */
export function sillabe(testo: string): Sillaba[] {
  const out: Sillaba[] = [];
  // parole (lettere e apostrofi) con la punteggiatura che le segue
  const re = /([A-Za-zÀ-ÿ]+(?:['’][A-Za-zÀ-ÿ]+)*)([^A-Za-zÀ-ÿ]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(testo))) {
    const parola = m[1].replace(/['’]/g, "");
    const dopo = m[2];
    const ss = sillabeParola(parola);
    // accento: la vocale accentata, altrimenti la penultima (parola piana)
    let ton = ss.findIndex((s) => [...s].some((c) => ACCENTATE.includes(c)));
    if (ton < 0) ton = ss.length === 1 ? (ATONE.has(parola.toLowerCase()) ? -1 : 0) : ss.length - 2;
    const pausa: Pausa = /[—–-]\s*$/.test(dopo) && /[—–]/.test(dopo)
      ? "tronca"
      : dopo.includes("?")
        ? "domanda"
        : dopo.includes("!")
          ? "esclamazione"
          : /…|\.\.\./.test(dopo)
            ? "sospesa"
            : dopo.includes(".")
              ? "punto"
              : /[,;:—–]/.test(dopo)
                ? "virgola"
                : "";
    ss.forEach((s, k) => {
      const lettere = [...s];
      const iv = lettere.findIndex(isV);
      // "qu"/"gu"+vocale e "ci"/"gi"+vocale: la prima vocale è solo grafia
      let nuc = iv;
      const pre = s.slice(0, Math.max(0, iv)).toLowerCase();
      if (iv >= 0 && iv + 1 < lettere.length && isV(lettere[iv + 1])) {
        const v0 = lettere[iv].toLowerCase();
        if ((v0 === "u" && /(q|g)$/.test(pre)) || (v0 === "i" && /(c|g|sc)$/.test(pre))) nuc = iv + 1;
        else if ((v0 === "i" || v0 === "u") && !ACCENTATE.includes(lettere[iv])) nuc = iv + 1; // dittongo ascendente: ie, uo
      }
      const vocale = nuc >= 0 ? base(lettere[nuc]) : "e";
      const cons = iv > 0 ? s.slice(0, iv) : "";
      out.push({
        testo: s,
        vocale,
        attacco: attaccoDi(cons),
        chiusa: !isV(lettere[lettere.length - 1]),
        tonica: k === ton,
        fineParola: k === ss.length - 1,
        pausa: k === ss.length - 1 ? pausa : "",
      });
    });
  }
  // una battuta che finisce senza punteggiatura chiude come un punto
  const ult = out[out.length - 1];
  if (ult && !ult.pausa) ult.pausa = "punto";
  return out;
}
