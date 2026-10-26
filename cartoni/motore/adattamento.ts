// cartoni/motore/adattamento.ts — l'adattamento: le frasi riscritte per il cartone.
//
// Il cartone cita la prosa alla lettera (cartoni/README.md, regola 1). Dove la
// prosa, letta ad alta voce a un bambino mentre le immagini corrono, chiede una
// frase più corta o un passaggio detto in chiaro, la riscrittura sta in un file
// per episodio — cartoni/episodi/<id>/adattamento.md — accanto alla frase della
// prosa da cui viene, col perché. È il SECONDO cancello umano (Ray, 25/10/2026):
// il copione può citare una frase «cartone» solo quando il file è `approvato`
// (test/cartoni.episodi.test.ts). La prosa del libro non si tocca.
//
// Il formato (quello di episodi/ep01/adattamento.md):
//
//   stato: proposta | approvato
//   approvato: Ray · AAAA-MM-GG          (quando è approvato)
//   ## Pagina N
//   ### sNN                              (l'inquadratura: informativa, può ripetersi)
//   - prosa: «…»                         (alla lettera nella pagina N: test)
//   - cartone: «…»                       (quel che la voce dice al suo posto)
//   - perché: …
//
// Qui c'è solo il parser (puro) e la domanda «questa didascalia da dove viene?»:
// dalla prosa, dall'adattamento, o da nessuna delle due.

/** Una riscrittura: la frase della prosa, la frase del cartone, il perché. */
export interface VoceAdattamento {
  pagina: number;
  /** l'inquadratura dichiarata (informativa) */
  inquadratura: string;
  prosa: string;
  cartone: string;
  perche: string;
}

export interface Adattamento {
  stato: "proposta" | "approvato";
  /** chi e quando (`approvato: Ray · 2026-10-25`), se approvato */
  approvato?: string;
  voci: VoceAdattamento[];
}

/** Normalizza come si legge a schermo: via il corsivo markdown, spazi semplici (come il test). */
export const norma = (s: string): string => s.replace(/\*/g, "").replace(/\s+/g, " ").trim();

/** Il testo tra «» di una riga `- campo: «…»` (o quel che segue i due punti, se non ci sono le «»). */
function valore(riga: string): string {
  const m = /^-\s*[a-zé]+\s*:\s*(.*)$/i.exec(riga.trim());
  if (!m) return "";
  const v = m[1].trim();
  const q = /^«([\s\S]*)»$/.exec(v);
  return norma(q ? q[1] : v);
}

/** Legge un file di adattamento. Una entrata senza `prosa` o senza `cartone` è un errore (il file è un cancello: va scritto intero). */
export function leggiAdattamento(testo: string): Adattamento {
  const righe = testo.split("\n");
  const stato = /^stato:\s*(proposta|approvato)\s*$/m.exec(testo)?.[1] as Adattamento["stato"] | undefined;
  if (!stato) throw new Error("adattamento: manca la riga `stato: proposta | approvato` in testa");
  const approvato = /^approvato:\s*(.+?)\s*$/m.exec(testo)?.[1];
  if (stato === "approvato" && !approvato) throw new Error("adattamento: `stato: approvato` senza la riga `approvato: Ray · AAAA-MM-GG`");
  const voci: VoceAdattamento[] = [];
  let pagina = 0;
  let inquadratura = "";
  let cur: Partial<VoceAdattamento> | null = null;
  const chiudi = () => {
    if (!cur) return;
    if (!cur.prosa || !cur.cartone) throw new Error(`adattamento: p.${cur.pagina} ${cur.inquadratura}: ogni entrata vuole «- prosa: …» e «- cartone: …»`);
    voci.push({ pagina: cur.pagina!, inquadratura: cur.inquadratura!, prosa: cur.prosa, cartone: cur.cartone, perche: cur.perche ?? "" });
    cur = null;
  };
  for (const r of righe) {
    const mp = /^##\s+Pagina\s+(\d+)\s*$/.exec(r);
    if (mp) {
      chiudi();
      pagina = Number(mp[1]);
      continue;
    }
    const mi = /^###\s+(\S+)\s*$/.exec(r);
    if (mi) {
      chiudi();
      if (!pagina) throw new Error(`adattamento: «### ${mi[1]}» prima di qualunque «## Pagina N»`);
      inquadratura = mi[1];
      cur = { pagina, inquadratura };
      continue;
    }
    if (!cur) continue;
    if (/^-\s*prosa\s*:/.test(r)) cur.prosa = valore(r);
    else if (/^-\s*cartone\s*:/.test(r)) cur.cartone = valore(r);
    else if (/^-\s*perch[eé]\s*:/.test(r)) cur.perche = valore(r);
  }
  chiudi();
  return { stato, approvato, voci };
}

/** Da dove viene una didascalia: dalla prosa, dall'adattamento (una frase `cartone` della stessa pagina), o da nessuna delle due. */
export type Fonte = "prosa" | "adattamento" | "nessuna";

/**
 * Dice la fonte di una didascalia: `pagine` è la prosa a pagine (numero → testo
 * normalizzato), `ad` l'adattamento (o nessuno: allora vale solo la prosa).
 * Una citazione della prosa vince sempre; una frase `cartone` vale solo alla lettera.
 */
export function fonteDidascalia(testo: string, pagina: number, pagine: ReadonlyMap<number, string>, ad?: Adattamento | null): Fonte {
  const t = norma(testo);
  if ((pagine.get(pagina) ?? "").includes(t)) return "prosa";
  if (ad && ad.voci.some((v) => v.pagina === pagina && v.cartone === t)) return "adattamento";
  return "nessuna";
}

/** Ogni didascalia di un episodio con la sua fonte (per i test e il consuntivo). */
export function fontiDelCopione(
  ep: { inquadrature: readonly { id: string; didascalie?: readonly { testo: string; pagina: number }[] }[] },
  pagine: ReadonlyMap<number, string>,
  ad?: Adattamento | null,
): { q: string; testo: string; pagina: number; fonte: Fonte }[] {
  return ep.inquadrature.flatMap((q) => (q.didascalie ?? []).map((d) => ({ q: q.id, testo: d.testo, pagina: d.pagina, fonte: fonteDidascalia(d.testo, d.pagina, pagine, ad) })));
}
