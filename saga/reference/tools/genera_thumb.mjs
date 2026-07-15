// Genera miniature webp (~600px) per le immagini di reference, in <dir>/_thumb/<base>.webp.
// Gli slot del sito puntano alle thumb; la piena risoluzione resta per il fullscreen.
// Uso:  node saga/reference/tools/genera_thumb.mjs [--check]
import { readdirSync, statSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname, basename, extname } from "node:path";
const ROOT = process.cwd();
const SRC_DIRS = ["saga/reference/personaggi", "saga/reference/ambienti"];
const WIDTH = 600, Q = 78;
const isImg = f => /\.(png|jpe?g)$/i.test(f);
function walk(d){ const out=[]; for(const e of readdirSync(join(ROOT,d))){ if(e==="_thumb")continue; const p=join(d,e); if(statSync(join(ROOT,p)).isDirectory()) out.push(...walk(p)); else if(isImg(e)) out.push(p); } return out; }
const check = process.argv.includes("--check");
let made=0, miss=[];
for(const dir of SRC_DIRS){ if(!existsSync(join(ROOT,dir))) continue;
  for(const rel of walk(dir)){
    const td = join(dirname(rel), "_thumb");
    const tp = join(td, basename(rel, extname(rel)) + ".webp");
    if(check){ if(!existsSync(join(ROOT,tp))) miss.push(tp); continue; }
    mkdirSync(join(ROOT,td), {recursive:true});
    const sharp=(await import("sharp")).default;
    await sharp(join(ROOT,rel)).resize({width:WIDTH,withoutEnlargement:true}).webp({quality:Q}).toFile(join(ROOT,tp));
    made++;
  }
}
if(check){ if(miss.length){ console.error("thumb mancanti:", miss.length, miss.slice(0,5)); process.exit(1);} console.log("thumb OK (tutte presenti)"); }
else console.log(`generate ${made} miniature`);
