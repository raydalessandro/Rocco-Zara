// Genera web/data/cast.json dall'indice MAPPA_CAST.md + le schede comprimari.
// Uso (dalla root della repo):  node web/tools/build_cast.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2] || '.';
const CDIR = path.join(ROOT, 'saga/bible/comprimari');
const MAPPA = path.join(CDIR, 'MAPPA_CAST.md');
const OUT = process.argv[3] || path.join(ROOT, 'web/data/cast.json');

const mappa = fs.readFileSync(MAPPA, 'utf8');

// --- archi + assegnazione file -> arco ---
const arcs = [];
const fileArc = {};
const lines = mappa.split('\n');
let cur = null;
for (const ln of lines) {
  const h = ln.match(/^##\s+Arco\s+(\d+)\s+[—-]\s+(.+?)\s*$/);
  if (h) {
    cur = { n: +h[1], realm: h[2].trim(), tagline: '', fatto: /✅/.test(ln) };
    arcs.push(cur);
    continue;
  }
  if (cur) {
    if (!cur.tagline) { const it = ln.match(/^\*(.+)\*\s*$/); if (it) cur.tagline = it[1].replace(/✅.*$/, '').trim(); }
    if (/✅/.test(ln)) cur.fatto = true;
    for (const m of ln.matchAll(/`?([a-z0-9][a-z0-9-]+)\.md`?/g)) {
      const slug = m[1];
      if (slug === 'MAPPA_CAST' || slug.startsWith('_')) continue;
      if (fileArc[slug] == null) fileArc[slug] = cur.n;
    }
  }
}

// alcuni file non sono referenziati per nome-file nella MAPPA (es. Arco 1, scritto
// prima della convenzione "Schede:"). Override editoriale esplicito:
const ARC_OVERRIDE = {
  'specchio-di-zara': 1,            // la giovane Lince (specchio di Zara)
  'custode-anziano': 1,            // il Custode (testuggine)
  'traghettatrice-delle-rive': 1   // la Traghettatrice (lontra)
};
for (const [slug, n] of Object.entries(ARC_OVERRIDE)) fileArc[slug] = n;

// --- parse di ogni scheda ---
const strip = s => (s || '').replace(/\*\*/g, '').replace(/[`*_]/g, '').trim();
const chars = [];
for (const f of fs.readdirSync(CDIR)) {
  if (!f.endsWith('.md')) continue;
  if (f === 'MAPPA_CAST.md' || f === 'README.md' || f.startsWith('_')) continue;
  const slug = f.replace(/\.md$/, '');
  const txt = fs.readFileSync(path.join(CDIR, f), 'utf8');
  const h1 = (txt.match(/^#\s+(.+)$/m) || [, slug])[1];
  const name = strip(h1.split(/\s[—-]\s/)[0]);
  const sub = strip(h1.split(/\s[—-]\s/).slice(1).join(' — '));
  const specie = strip((txt.match(/-\s*\*\*specie\*\*:\s*(.+)/i) || [])[1]);
  const ear = strip((txt.match(/-\s*\*\*attribute_ear[^*]*\*\*:\s*(.+)/i) || [])[1]);
  const tipo = strip((txt.match(/-\s*\*\*tipo\*\*:\s*(.+)/i) || [])[1]);
  // blurb: primo bullet sotto "### Natura", altrimenti il sottotitolo H1
  let blurb = '';
  const nat = txt.split(/###\s*Natura/i)[1];
  if (nat) { const b = nat.match(/-\s+(.+)/); if (b) blurb = strip(b[1]); }
  if (!blurb) blurb = sub;
  if (blurb.length > 160) blurb = blurb.slice(0, 157) + '…';
  chars.push({ slug, name, sub, specie, ear, tipo, blurb, arc: fileArc[slug] ?? 0 });
}

// ordina: per arco, poi per nome
chars.sort((a, b) => (a.arc - b.arc) || a.name.localeCompare(b.name, 'it'));

const data = { generato: new Date().toISOString().slice(0, 10), arcs, chars };
fs.writeFileSync(OUT, JSON.stringify(data, null, 1));
console.log('cast.json:', chars.length, 'comprimari ·', arcs.length, 'archi ·', Object.keys(fileArc).length, 'file mappati');
const noarc = chars.filter(c => !c.arc).map(c => c.slug);
if (noarc.length) console.log('senza arco (→ trasversali):', noarc.join(', '));
