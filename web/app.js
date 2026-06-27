/* =====================================================================
   le Terre Annodate — sala di regia
   I DATI NON SONO PIÙ HARDCODED: vengono letti a runtime dalla repo.
   - regni / atlante / la Serpe  → file canonici in  saga/cartografia/...
   - livello narrativo (prosa)    → file in  web/data/*.json
   Modifichi un file nella repo → ricarichi la pagina → la UI è aggiornata.
   ===================================================================== */

/* ---- modello in memoria (riempito da loadWorld) ---- */
const M = {};
const ORIGINE = [];
const FC = { turchino:'#3f6e92', vermiglio:'#b0463a', neutro:'#8a8270', conteso:'#9a7d3a' };

/* ---- dove sta la repo ---- */
const REPO_OWNER = 'raydalessandro';
const REPO       = 'Rocco-Zara';
const BRANCHES   = ['main','master'];            // fallback se il default non è "main"
const rawBase = b => `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO}/${b}/`;

/* ---- costanti di presentazione (solo estetica, non contenuto) ---- */
const REALM_ORDER  = ['laghi_occidente','laghi_oriente','pianura_alta','pianura_bassa','selva_di_mezzo','toscana'];
const REALM_COLORS = {
  laghi_occidente:'#3f8e84', laghi_oriente:'#c07a33', pianura_alta:'#6b7a3e',
  pianura_bassa:'#5c6e92', selva_di_mezzo:'#3c6b4a', toscana:'#b0503c'
};

/* ---- fetch con fallback: prima relativo (repo/Pages), poi GitHub raw ---- */
async function tryFetch(urls){
  let lastErr;
  for(const u of urls){
    try{
      const r = await fetch(u, {cache:'no-store'});
      if(r.ok) return await r.json();
      lastErr = new Error('HTTP '+r.status+' · '+u);
    }catch(e){ lastErr = e; }
  }
  throw lastErr || new Error('nessuna sorgente raggiungibile');
}
const fetchSaga = p => tryFetch(['../saga/'+p, ...BRANCHES.map(b=>rawBase(b)+'saga/'+p)]);
const fetchData = n => tryFetch(['./data/'+n,  ...BRANCHES.map(b=>rawBase(b)+'web/data/'+n)]);

/* ---- helpers di mappatura ---- */
function fazKey(id, txt){
  if(id==='pianura_alta') return 'vermiglio';
  const t=(txt||'').toLowerCase();
  if(t.includes('conteso')) return 'conteso';
  if(t.includes('turchin')||t.includes('libero')) return 'turchino';
  if(t.includes('neutr')||t.includes('senza')) return 'neutro';
  return 'conteso';
}
function findLuogo(luoghi, nome){
  luoghi = luoghi || [];
  return luoghi.find(L=>L.regno===nome)
      || luoghi.find(L=>L.regno.indexOf(nome)===0 || nome.indexOf(L.regno)===0)
      || luoghi.find(L=>L.regno.includes(nome) || nome.includes(L.regno))
      || null;
}

/* ---- adattatore: regno.json + societa.json → modello UI ---- */
function adaptRealm(rg, so, luoghi){
  const id   = rg.id;
  const pc   = (so && so.principio_calviniano) || {};
  const cult = rg.cultura || {};
  const gov  = rg.governo || {};
  const feste = cult.feste || [];
  const festa = feste[0] ? {
    nm: feste[0].nome, when: feste[0].quando,
    senso: (feste[0].cosa||'') + (feste[0].morale ? ' → '+feste[0].morale : '')
  } : null;
  const usanze = [].concat(pc.regole_dolci||[], cult.tradizioni||[]);
  const corp   = ((so&&so.corporazioni)||[]).map(c=>[c.nome, c.mestiere]);
  const classi = ((so&&so.classi)||[]).map(c=>({
    nome:c.nome, ruolo:c.ruolo_sociale||'', animali:c.animali||[],
    registro:(c.voce&&c.voce.registro)||'', modello:(c.voce&&c.voce.modello)||'',
    esempio:(c.voce&&c.voce.esempio_in_voce)||''
  }));
  const zoneList = ((so&&so.zone)||[]).map(z=>({z:z.tipo, lbl:z.luogo}));
  const luogo = findLuogo(luoghi, rg.nome);
  let kmq = '';
  if(rg.area_km2!=null){ try{ kmq='~'+rg.area_km2.toLocaleString('it-IT')+' km²'; }catch(e){ kmq='~'+rg.area_km2+' km²'; } }
  return {
    id, nome:rg.nome,
    stemma:(rg.leader&&rg.leader.archetipo)||'',
    motto: cult.motto||'',
    capitale:(rg.capitale&&rg.capitale.nome)||'',
    kmq,
    fazione: fazKey(id, rg.fazione), fazioneText: rg.fazione||'',
    col: REALM_COLORS[id]||'#8a8270',
    governo: gov.forma||'', govForma: gov.tipo||'',
    govBimbi: gov.spiegazione_bambini||'',
    tensione: gov.tensione || (so&&so.tensione_viva) || '',
    morale: rg.morale_bambini||'',
    ruolo: rg.ruolo_nel_viaggio||'',
    principio: pc.nome||'', principioD: pc.idea||'',
    festa, usanze, corp, classi, zoneList,
    luogo: luogo ? {nm:luogo.sito, reale:luogo.ref, vede:luogo.vede, coord:luogo.coord} : null,
    estetica: rg.estetica ? {palette:rg.estetica.palette||[], atmosfera:rg.estetica.atmosfera||'', prompt:rg.estetica.prompt_immagine_base||''} : null,
    antagonista: id==='pianura_alta'
  };
}

/* ---- adattatore: la_serpe.json → forma attesa dalla sezione Personaggi ---- */
function adaptSerpe(ls){
  const join = (...parts)=>parts.filter(Boolean).join(' ');
  const vertice = (ls.vertice||[]).map(x=>({nm:x.nome, rl:x.ruolo, d:join(x.tratti, x.gancio&&('— '+x.gancio), x.voce&&('· voce: '+x.voce))}));
  const vass    = (ls.vassalli||[]).map(x=>({nm:x.nome, rl:x.ruolo, d:join(x.funzione, x.uso&&('— uso: '+x.uso), x.voce&&('· voce: '+x.voce))}));
  const braccio = (ls.braccio||[]).map(x=>({nm:x.nome, rl:x.ruolo, d:join(x.funzione, x.legame&&('— '+x.legame), x.uso&&('· uso: '+x.uso))}));
  const uso = [].concat(
    (ls.braccio||[]).map(x=>`${x.uso||x.funzione} → ${x.nome}`),
    (ls.vassalli||[]).map(x=>`${x.uso||x.funzione} → ${x.nome}`),
    (ls.vertice||[]).length ? ['decisione fredda dall\u2019alto → '+(ls.vertice||[]).map(x=>x.nome).join(' / ')] : []
  );
  const intro = join(ls.regola_anti_simbolico, ls.movente && ('Principio: '+ls.movente));
  return {intro, vertice, vassalli:vass, braccio, uso};
}

/* ---- carica tutto il mondo ---- */
async function loadWorld(){
  const [narr, pers, viag, rit, orig, cast] = await Promise.all([
    fetchData('narrativa.json'),
    fetchData('personaggi.json'),
    fetchData('viaggio.json'),
    fetchData('ritornelli.json'),
    fetchData('origine.json'),
    fetchData('cast.json').catch(()=>({arcs:[],chars:[]}))
  ]);
  const cosmologia = await fetchSagaText('bible/COSMOLOGIA.md').catch(()=>'');
  const [atlanteRepo, serpeRepo] = await Promise.all([
    fetchSaga('cartografia/regno/atlante.json'),
    fetchSaga('cartografia/regni/pianura_alta/la_serpe.json')
  ]);
  const realmFiles = await Promise.all(REALM_ORDER.map(async id=>{
    const [rg, so] = await Promise.all([
      fetchSaga('cartografia/regni/'+id+'/regno.json'),
      fetchSaga('cartografia/regni/'+id+'/societa.json')
    ]);
    return adaptRealm(rg, so, narr.luoghiAntichi);
  }));

  M.meta        = narr.meta;
  M.motore      = narr.motore;
  M.zoneGrammar = narr.zoneGrammar;
  M.luoghiAntichi = narr.luoghiAntichi;
  M.regni       = realmFiles;
  M.atlante     = Object.assign({}, narr.atlante_editoriale, {
                    griglia: atlanteRepo.griglia,
                    terre: atlanteRepo.terre,
                    zoneGrammar: narr.zoneGrammar,
                    luoghiAntichi: narr.luoghiAntichi
                  });
  M.personaggi  = { protagonisti: pers.protagonisti, toraki: pers.toraki, serpe: adaptSerpe(serpeRepo) };
  M.cast        = cast;
  M.cosmologia  = cosmologia;
  M.viaggio     = viag;
  M.ritornelli  = rit.ritornelli;
  M.semi        = rit.semi;
  ORIGINE.length = 0; (orig||[]).forEach(c=>ORIGINE.push(c));
}

/* ---- avvio: prima i dati, poi il render ---- */
async function init(){
  injectStyles();
  const loaderErr = document.getElementById('loaderErr');
  try{
    await loadWorld();
  }catch(e){
    console.error(e);
    if(loaderErr){
      loaderErr.innerHTML = 'Non riesco a leggere i dati: '+(e&&e.message||e)
        + '<br><span style="color:var(--ink-2)">Se apri il file con doppio-clic (file://), il browser blocca il fetch dei dati locali: '
        + 'servilo via http — dentro <code>web/</code> esegui <code>python3 -m http.server</code> e apri '
        + '<code>http://localhost:8000</code>. In rete su GitHub Pages funziona da solo.</span>';
    }
    return;
  }
  const content = document.getElementById('content');
  content.innerHTML = '';                 // toglie il loader
  buildNav();
  renderAll();
  injectCosmologia();
  const start = (location.hash||'#plancia').slice(1);
  go(start);
  document.getElementById('menuBtn').addEventListener('click', ()=>document.getElementById('rail').classList.toggle('open'));
  document.getElementById('overlay').addEventListener('click', e=>{ if(e.target.id==='overlay') closeReader(); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeReader(); });
  window.addEventListener('hashchange', ()=>{ const id=(location.hash||'#plancia').slice(1); if(SECTIONS.some(s=>s.id===id)) go(id); });
}

/* =====================================================================
   MOTORE DI RENDERING  (riusato dalla versione single-file, invariato)
   ===================================================================== */
/* ===================== RENDER ENGINE ===================== */
const $=(s,e=document)=>e.querySelector(s);
const el=(t,c,h)=>{const n=document.createElement(t); if(c)n.className=c; if(h!=null)n.innerHTML=h; return n;};
const fmt=t=>String(t).replace(/\*([^*]+)\*/g,'<em>$1</em>');
const facBadge=f=>`<span class="chip"><span class="dot" style="background:${FC[f]}"></span>${f}</span>`;
function toast(m){const t=$('#toast'); t.textContent=m; t.classList.add('show'); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),2200);}

const SECTIONS=[
 {id:'plancia',label:'Plancia',render:renderPlancia},
 {id:'personaggi',label:'Personaggi',render:renderPersonaggi},
 {id:'cast',label:'Cast',render:renderCast},
 {id:'regni',label:'I Regni',render:renderRegni},
 {id:'atlante',label:'Atlante',render:renderAtlante},
 {id:'storia',label:'La Storia',render:renderStoria},
 {id:'viaggio',label:'Il Viaggio',render:renderViaggio},
 {id:'ritornelli',label:'Ritornelli & semi',render:renderRitornelli},
 {id:'banco',label:'Banco',render:renderBanco}
];
function buildNav(){
  const nav=$('#nav');
  SECTIONS.forEach((s,i)=>{
    const a=el('a',null,`<span class="kn"></span><span class="num">${String(i).padStart(2,'0')}</span><span>${s.label}</span>`);
    a.href='#'+s.id; a.dataset.id=s.id;
    a.addEventListener('click',e=>{e.preventDefault(); go(s.id);});
    nav.appendChild(a);
  });
}
function go(id){
  if(!SECTIONS.some(s=>s.id===id)) id='plancia';
  document.querySelectorAll('.section').forEach(x=>x.classList.toggle('on',x.id==='sec-'+id));
  document.querySelectorAll('.nav a').forEach(a=>a.classList.toggle('active',a.dataset.id===id));
  const rail=$('#rail'); if(rail) rail.classList.remove('open');
  try{ history.replaceState(null,'','#'+id); }catch(e){/* alcuni sandbox bloccano la History API: non deve fermare il render */}
  try{ window.scrollTo(0,0); }catch(e){}
}
function renderAll(){
  const c=$('#content');
  SECTIONS.forEach(s=>{ const sec=el('section','section'); sec.id='sec-'+s.id; c.appendChild(sec); s.render(sec); });
}

/* ---------- PLANCIA ---------- */
function renderPlancia(s){
  const knots=['origine','laghi','conca','piana','selva','terre'];
  const cordrun=knots.map((k,i)=>`<span class="k ${i===knots.length-1?'end':''}"></span>${i<knots.length-1?'<span class="seg"></span>':''}`).join('');
  const ritmini=M.ritornelli.map(r=>`<span class="chip"><span class="dot" style="background:var(--glow)"></span>${r.nome}</span>`).join(' ');
  const feat=[
   {ico:'doppio pubblico',h:'Bambini sopra, adulti sotto',d:M.meta.pitch},
   {ico:'il metodo',h:'Orwell + Calvino',d:M.meta.metodo},
   {ico:'la disciplina',h:'Architettura Pokémon',d:M.meta.pokemon}
  ].map(f=>`<div class="it"><div class="ico">${f.ico}</div><h3>${f.h}</h3><p class="muted small">${f.d}</p></div>`).join('');
  s.innerHTML=`
  <div class="hero">
    <div class="world">le Terre Annodate · il mondo di</div>
    <h1>Rocco &amp; Zara</h1>
    <div class="sub">${M.meta.pitch}</div>
    <div class="stats">
      <div class="stat"><div class="n">6</div><div class="l">regni-comuni</div></div>
      <div class="stat"><div class="n">5</div><div class="l">nodi del Cordone</div></div>
      <div class="stat"><div class="n">50–100</div><div class="l">puntate previste</div></div>
      <div class="stat"><div class="n">4</div><div class="l">ritornelli</div></div>
    </div>
    <div class="cordrun" title="la rotta: origine → 5 regni-nodo → il finale">${cordrun}</div>
  </div>

  <div class="callout" style="margin-top:18px">
    <div class="label">il motore nascosto · subtesto — non si dice MAI in-storia</div>
    <p style="margin:8px 0 6px">${M.motore.testo}</p>
    <p class="note" style="color:var(--glow-deep)">${M.motore.regola}</p>
  </div>

  <div class="feat">${feat}</div>

  <div class="grid g2" style="margin-top:16px">
    <div class="card">
      <div class="label">a che punto siamo</div>
      <div style="margin-top:10px">${M.meta.stato.map(x=>`<div class="kv"><span class="v">${x}</span></div>`).join('')}</div>
    </div>
    <div class="card">
      <div class="label">i quattro ritornelli</div>
      <p class="muted small" style="margin:8px 0 12px">Tornano sempre, ma ogni volta accumulano significato. Coprono quattro funzioni diverse così non si pestano.</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px">${ritmini}</div>
      <button class="btn" id="readOriginBtn">Leggi l'origine →</button>
    </div>
  </div>

  <p class="note" style="margin-top:24px">Regola d'oro letta dalla repo: la geografia è <b>definitiva</b> — qui si tocca solo la trama. Questo strumento <b>non scrive le storie</b>: aiuta a vederle, pensarle e tenerle coerenti.</p>
  `;
  $('#readOriginBtn',s).addEventListener('click',()=>openReader(0));
}

/* ---------- PERSONAGGI ---------- */
function earBox(p){
  return `<div class="ear">
   <div class="e"><div class="s">Δ</div><div class="t">distingue</div><div class="small" style="margin-top:4px">${p.ear.d}</div></div>
   <div class="e"><div class="s">⇄</div><div class="t">si lega</div><div class="small" style="margin-top:4px">${p.ear.s}</div></div>
   <div class="e"><div class="s">⟳</div><div class="t">cambia</div><div class="small" style="margin-top:4px">${p.ear.m}</div></div>
  </div>`;
}
function pcCard(p){
  return `<div class="pc">
    <div class="top">
      <div class="glyph" style="background:${p.col}">${p.glyph}</div>
      <div><div class="name">${p.nome}</div><div class="role">${p.ruolo}</div>
        <div style="margin-top:6px"><span class="tag">EAR · ${p.earDom}</span> <span class="tag">${p.specie}</span></div>
      </div>
    </div>
    <div class="body">
      <div class="arc"><span class="from">${p.arco.from}</span><span class="ar">→</span><span class="to">${p.arco.to}</span></div>
      ${earBox(p)}
      <div style="margin-top:14px">
        <div class="kv"><span class="k">Aspetto</span><span class="v">${p.aspetto}</span></div>
        <div class="kv"><span class="k">Natura</span><span class="v">${p.natura}</span></div>
        <div class="kv"><span class="k">Paura</span><span class="v">${p.paura}</span></div>
        <div class="kv"><span class="k">Il dono</span><span class="v">${p.dono}</span></div>
        <div class="kv"><span class="k">Voce</span><span class="v">${p.voce}</span></div>
        <div class="kv"><span class="k">Nel mondo</span><span class="v">${p.mondo}</span></div>
      </div>
    </div>
  </div>`;
}
function renderPersonaggi(s){
  const P=M.personaggi;
  const t=P.toraki;
  const serpeGroup=(title,arr)=>`<div class="label" style="margin:16px 0 8px">${title}</div><div class="serpe-grid">${arr.map((x,i)=>`<div class="sp ${i===0&&title.includes('braccio')?'lead':''}"><div class="nm">${x.nm}</div><div class="rl">${x.rl}</div><div class="small muted" style="margin-top:6px">${x.d}</div></div>`).join('')}</div>`;
  s.innerHTML=`
  <div class="eyebrow">il cast</div>
  <h2 class="h-sec">Personaggi</h2>
  <p class="lede">Due Forestieri — specie che non appartengono a nessun regno: la loro estraneità è il motore del viaggio. I campi-canone (aspetto, voce, paura, dono) sono bloccati per la coerenza «da serie».</p>
  <div class="divider"></div>
  <div class="grid g2">${pcCard(P.protagonisti[0])}${pcCard(P.protagonisti[1])}</div>

  <div class="card" style="margin-top:18px;border-left:3px solid #d8d2c4">
    <div style="display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap">
      <div class="glyph" style="background:#cfc7b6;color:#3a3a3a;width:54px;height:54px;border-radius:13px;display:grid;place-items:center;font-family:'Fraunces',serif;font-size:26px;flex:0 0 auto">T</div>
      <div style="min-width:0;flex:1"><div class="name" style="font-family:'Fraunces',serif;font-size:24px">${t.nome} <span class="note">· ${t.sub}</span></div>
      <div class="role" style="font-style:italic;color:var(--ink-2)">${t.ruolo} · ${t.specie}</div></div>
    </div>
    <div style="margin-top:12px">
      <div class="kv"><span class="k">Il precursore</span><span class="v">${t.ruoloT}</span></div>
      <div class="kv"><span class="k">Funzione</span><span class="v">${t.funzione}</span></div>
      <div class="kv"><span class="k">In parallelo</span><span class="v">${t.cutaway}</span></div>
      <div class="kv"><span class="k">Ancora</span><span class="v muted">${t.ancora}</span></div>
    </div>
  </div>

  <div class="divider"></div>
  <div class="eyebrow" style="color:var(--vermiglio)">l'antagonista</div>
  <h2 class="h-sec" style="color:var(--vermiglio)">La Serpe</h2>
  <p class="lede">${P.serpe.intro}</p>
  ${serpeGroup('il vertice — decidono tutto, si vedono di rado',P.serpe.vertice)}
  ${serpeGroup('i vassalli — i «muri» sul cammino',P.serpe.vassalli)}
  ${serpeGroup('il braccio — gli agenti che R&Z incontrano DAVVERO',P.serpe.braccio)}
  <div class="card" style="margin-top:16px">
    <div class="label">come si usa in scrittura — mai «la Serpe» astratta, sempre una faccia</div>
    <div style="margin-top:8px">${P.serpe.uso.map(u=>`<div class="kv"><span class="v">${u}</span></div>`).join('')}</div>
  </div>`;
}

/* ---------- REGNI ---------- */
function realmDetail(r){
  const zones=r.zone.map(z=>`<div class="zone">
     <div class="zh"><span>${z.z}</span><span class="zc">${z.classe}</span></div>
     <div class="small muted" style="margin:3px 0 5px">${z.lbl}</div>
     <div class="sp-list">${z.specie.join(' · ')}</div>
     <div class="voicebox" style="margin-top:8px;padding:8px 10px;background:var(--stone-card)">
       <div class="label" style="font-size:10px">voce · ${z.reg}</div>
       <div class="q" style="font-size:13.5px;margin-top:3px">«${z.ex}»</div>
     </div>
   </div>`).join('');
  const corp=r.corp.map(c=>`<div class="kv"><span class="k" style="min-width:150px">${c[0]}</span><span class="v muted">${c[1]}</span></div>`).join('');
  return `
  <div class="realm-head" style="background:linear-gradient(135deg,${r.col},#1b1a2a 88%)">
    <div class="motto">${r.motto}</div>
    <h2>${r.nome}</h2>
    <div class="meta">
      <span>stemma · <b>${r.stemma}</b></span>
      <span>capitale · <span class="mono">${r.capitale}</span></span>
      <span class="mono">${r.kmq}</span>
      ${facBadge(r.fazione)}
      ${r.antagonista?'<span class="chip" style="background:rgba(176,70,58,.25);color:#fff;border-color:transparent">la patria della Serpe</span>':''}
    </div>
  </div>
  <div class="grid g2" style="margin-top:16px">
    <div class="civ">
      <div class="label">forma di governo · educazione civica</div>
      <div style="font-family:'Fraunces',serif;font-size:19px;margin:6px 0 2px">${r.governo}</div>
      <div class="small muted">${r.govForma}</div>
      <div style="background:rgba(255,255,255,.5);border-radius:9px;padding:10px 12px;margin-top:10px">
        <div class="label" style="font-size:10px;color:var(--ink-2)">per i bambini</div>
        <div style="font-family:'Fraunces',serif;font-style:italic;margin-top:3px">${r.govBimbi}</div>
      </div>
      <div class="kv" style="margin-top:8px"><span class="k">Morale</span><span class="v">${r.morale}</span></div>
    </div>
    <div class="card">
      <div class="label" style="color:var(--cord-deep)">il principio · Calvino</div>
      <div style="font-family:'Fraunces',serif;font-size:20px;margin:6px 0 4px">${r.principio}</div>
      <p class="small muted">${r.principioD}</p>
      <div class="kv" style="margin-top:6px"><span class="k">Tensione</span><span class="v">${r.tensione}</span></div>
      <div class="kv"><span class="k">Nel viaggio</span><span class="v">${r.ruolo}</span></div>
    </div>
  </div>

  <div class="label" style="margin:18px 0 8px">il faunario per zona · gli animali come ceti (Orwell)</div>
  <div class="zonebox">${zones}</div>

  <div class="grid g2" style="margin-top:16px">
    <div class="card">
      <div class="label">corporazioni · i mestieri che fanno nascere gli scambi tra regni</div>
      <div style="margin-top:8px">${corp}</div>
    </div>
    <div>
      <div class="luogo">
        <div class="label" style="color:var(--cord-deep)">il Luogo Antico · dove si annoda il nodo</div>
        <div style="font-family:'Fraunces',serif;font-size:19px;margin:5px 0 2px">${r.luogo.nm}</div>
        <div class="small">${r.luogo.vede}</div>
        <div class="small muted" style="margin-top:6px">${r.luogo.reale} · <span class="mono">${r.luogo.coord}</span></div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="label">la festa</div>
        <div style="font-family:'Fraunces',serif;font-size:17px;margin:5px 0 2px">${r.festa.nm} <span class="note">— ${r.festa.when}</span></div>
        <p class="small muted">${r.festa.senso}</p>
        <div class="label" style="margin-top:8px">usanze</div>
        <ul style="margin:6px 0 0;padding-left:18px" class="small muted">${r.usanze.map(u=>`<li style="margin-bottom:3px">${u}</li>`).join('')}</ul>
      </div>
    </div>
  </div>`;
}
function renderRegni(s){
  const navHtml=M.regni.map((r,i)=>`<button data-i="${i}" class="${i===0?'active':''}"><span class="dot" style="background:${r.col}"></span>${r.nome}</button>`).join('');
  s.innerHTML=`
  <div class="eyebrow">il mondo · sei regni-comuni</div>
  <h2 class="h-sec">I Regni</h2>
  <p class="lede">Sei comuni animali sul corridoio reale Muro del Nord → Terre del Leone di Pietra. Ogni regno insegna una forma di governo (Orwell) e ha un suo principio magico-realista (Calvino). Cinque sono liberi e annodano un nodo; il Gran Ducato della Serpe è l'ombra.</p>
  <div class="realm-nav" id="realmNav">${navHtml}</div>
  <div id="realmDetail">${realmDetail(M.regni[0])}</div>`;
  const nav=$('#realmNav',s), det=$('#realmDetail',s);
  nav.addEventListener('click',e=>{
    const b=e.target.closest('button'); if(!b)return;
    nav.querySelectorAll('button').forEach(x=>x.classList.remove('active')); b.classList.add('active');
    det.innerHTML=realmDetail(M.regni[+b.dataset.i]); window.scrollTo({top:s.offsetTop-50});
  });
}

/* ---------- ATLANTE ---------- */
function renderAtlante(s){
  const A=M.atlante;
  const cols=['A','B','C','D','E']; const band=new Set(['A1','B2','C3','D4','E5','B1']);
  let grid='<div class="cell hd"></div>'+cols.map(c=>`<div class="cell hd">${c}</div>`).join('');
  for(let row=1;row<=5;row++){ grid+=`<div class="cell hd">${row}</div>`;
    cols.forEach(c=>{const id=c+row; const isOrg=id==='B1'; grid+=`<div class="cell ${isOrg?'org':band.has(id)?'band':''}">${isOrg?'B1':id}</div>`;});
  }
  const luoghi=M.luoghiAntichi.map(l=>`<div class="card" style="padding:14px 16px;border-left:3px solid ${l.col}">
     <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap">
       <div style="font-family:'Fraunces',serif;font-size:17px">${l.sito}</div><div class="mono small muted">${l.coord}</div></div>
     <div class="small" style="color:${l.col};font-weight:600">${l.regno}</div>
     <div class="small" style="margin-top:4px">${l.vede}</div>
     <div class="note" style="margin-top:4px">reale: ${l.ref}</div>
   </div>`).join('');
  s.innerHTML=`
  <div class="eyebrow">la geografia · definitiva</div>
  <h2 class="h-sec">Atlante</h2>
  <p class="lede">${A.base} La fantasia è costruita dal basso su dati fisici reali — e poi reskinnata. La geografia è chiusa: si tocca solo la trama.</p>

  <div class="grid g2" style="margin-top:16px">
    <div class="card">
      <div class="label">la griglia 5×5 · l'origine è in B1</div>
      <p class="small muted" style="margin:6px 0 10px">${A.griglia}</p>
      <div class="gridmap">${grid}</div>
      <div class="small muted" style="margin-top:8px"><span class="chip" style="font-size:11px"><span class="dot" style="background:var(--glow)"></span>B1 · la collina dell'incontro</span> &nbsp; <span class="note">la fascia evidenziata è la diagonale abitata NW→SE</span></div>
    </div>
    <div>
      <div class="luogo">
        <div class="label" style="color:var(--cord-deep)">l'origine · pin di canone</div>
        <div style="font-family:'Fraunces',serif;font-size:18px;margin:5px 0 2px">${A.origine.place} <span class="mono note">· ${A.origine.terra}</span></div>
        <div class="small mono">${A.origine.coord}</div>
        <div class="small muted" style="margin-top:6px">${A.origine.bioma}</div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="label">confini naturali</div>
        <div style="margin-top:6px">${A.confini.map(c=>`<div class="kv"><span class="k" style="min-width:130px">${c[0]}</span><span class="v muted">${c[1]}</span></div>`).join('')}</div>
      </div>
    </div>
  </div>

  <div class="grid g2" style="margin-top:16px">
    <div class="card">
      <div class="label">le acque</div>
      <div class="small" style="margin-top:8px"><b>Laghi:</b> ${A.acque.laghi.join(' · ')}</div>
      <div class="small" style="margin-top:8px"><b>Fiumi:</b> ${A.acque.fiumi.join(' · ')}</div>
      <div class="kv" style="margin-top:10px"><span class="k">Rete urbana</span><span class="v">${A.rete}</span></div>
    </div>
    <div class="card">
      <div class="label">il reskin · OSM → mondo della saga</div>
      <div class="bio" style="margin-top:8px">${A.biomi.map(b=>`<div class="b"><b>${b[0]}</b><div class="muted" style="margin-top:2px">${b[1]}</div></div>`).join('')}</div>
    </div>
  </div>

  <div class="card" style="margin-top:16px">
    <div class="label" style="color:var(--cord-deep)">la grammatica universale delle 7 zone · «punta il dito sul km²»</div>
    <p class="small muted" style="margin:6px 0 10px">Dato un punto qualsiasi del mondo: → il regno (dal taglio) → il tipo di zona → le specie e la classe → le usanze → un seme di tensione. Stessa regola in tutti i regni: cambia solo il reskin. (Lo strumento al <b>Banco</b> esegue questa cascata.)</p>
    <div class="grid g2">${M.zoneGrammar.map(z=>`<div class="kv"><span class="k" style="min-width:70px">${z.z}</span><span class="v muted">${z.d}</span></div>`).join('')}</div>
  </div>

  <div class="divider"></div>
  <div class="eyebrow" style="color:var(--cord-deep)">i perni della missione</div>
  <h3 style="font-size:24px;margin-bottom:4px">I Luoghi Antichi</h3>
  <p class="lede small">Siti archeologici reali. In-storia gli animali li sentono solo come posti più vecchi di ogni regno, dove la pietra ricorda — nessuna spiegazione. Uno per regno; quello della Serpe è sepolto (nessun nodo).</p>
  <div class="grid g2" style="margin-top:12px">${luoghi}</div>`;
}

/* ---------- STORIA + READER ---------- */
function renderStoria(s){
  const cards=ORIGINE.map((c,i)=>{
    const first=c.x.split('\n\n')[0].replace(/\*/g,'').slice(0,150);
    return `<div class="card" style="cursor:pointer" data-i="${i}">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px">
        <div style="font-family:'Fraunces',serif;font-size:20px">${c.t}</div>
        <span class="tag">leggi →</span>
      </div>
      <p class="small muted" style="margin-top:8px">${first}…</p></div>`;
  }).join('');
  s.innerHTML=`
  <div class="eyebrow">l'unica prosa già scritta</div>
  <h2 class="h-sec">La Storia — l'origine</h2>
  <p class="lede">I cinque capitoli dell'incontro: Rocco scavalca la collina, Zara scappa, una tempesta li lega. Ricontestualizzato, questo è l'<span class="mono">Ep01</span> della saga (Movimento 0). Tutto il resto, per ora, è scheletro — vedi <b>Il Viaggio</b>.</p>
  <div class="callout" style="margin:14px 0">
    <div class="label">cosa pianta l'origine</div>
    <p class="small" style="margin-top:6px">Il Cordone (ancora solo «il peso»), l'<b>ombra</b> di Rocco (riparo), la prima <b>pietra tiepida</b> — e i due archi: il corno storto di Rocco, il «troppo piccola» di Zara. Tutti i semi della stagione partono da qui.</p>
  </div>
  <div class="grid" style="gap:12px">${cards}</div>`;
  s.querySelectorAll('.card[data-i]').forEach(c=>c.addEventListener('click',()=>openReader(+c.dataset.i)));
}
let READER_I=0;
function proseHtml(idx){
  return ORIGINE[idx].x.split('§').map(part=>
    part.trim().split('\n\n').map(p=>`<p>${fmt(p.trim())}</p>`).join('')
  ).join('<div class="scene">· · ·</div>');
}
function openReader(idx){
  READER_I=idx;
  const ov=$('#overlay'), rd=$('#reader');
  const chapnav=ORIGINE.map((c,i)=>`<button data-i="${i}" class="${i===idx?'active':''}">${i+1}</button>`).join('');
  rd.innerHTML=`
    <div class="rhead"><h3 id="rdTitle">${ORIGINE[idx].t}</h3><button class="x" id="rdClose" aria-label="chiudi">✕</button></div>
    <div class="chapnav" id="rdChap">${chapnav}</div>
    <div class="prose" id="rdProse">${proseHtml(idx)}</div>`;
  ov.classList.add('on'); document.body.style.overflow='hidden';
  $('#rdClose',rd).addEventListener('click',closeReader);
  $('#rdChap',rd).addEventListener('click',e=>{const b=e.target.closest('button'); if(!b)return;
    READER_I=+b.dataset.i;
    $('#rdTitle',rd).textContent=ORIGINE[READER_I].t;
    $('#rdProse',rd).innerHTML=proseHtml(READER_I);
    $('#rdProse',rd).scrollTop=0;
    rd.querySelectorAll('#rdChap button').forEach(x=>x.classList.toggle('active',+x.dataset.i===READER_I));
  });
}
function closeReader(){ $('#overlay').classList.remove('on'); document.body.style.overflow=''; }

/* ---------- VIAGGIO ---------- */
function movementHtml(m){
  const fin=m.isFin, mid=m.isMid;
  const knot=`<span style="position:absolute;left:12px;top:5px;width:20px;height:20px;border-radius:50%;
     background:radial-gradient(circle at 35% 30%, #fff6, ${m.col});border:2px solid ${m.col};
     box-shadow:0 0 0 4px var(--stone)${fin?', 0 0 16px rgba(204,125,158,.6)':''};z-index:2"></span>`;
  const flag=mid?'<span class="flag mid">midpoint</span>':fin?'<span class="flag fin">finale</span>':'';
  const beats=m.beats.map(b=>`<div class="beat"><span class="bl">${b[0]}</span><span>${b[1]}</span></div>`).join('');
  return `<div style="position:relative;padding:0 0 28px 58px">${knot}
    <div class="mv ${mid?'mid':''} ${fin?'fin':''}" style="padding-top:0">
      <div class="badge">movimento ${m.n}${flag}</div>
      <h3>${m.t}</h3>
      <div class="place mono">${m.luogo}</div>
      <div style="margin:8px 0"><span class="chip" style="background:rgba(182,138,62,.12);border-color:rgba(182,138,62,.3)"><span class="dot" style="background:${m.col}"></span>pegno · ${m.pegno}</span></div>
      <p class="small" style="margin:4px 0 10px">${m.body}</p>
      ${beats}
    </div></div>`;
}
function renderViaggio(s){
  const V=M.viaggio;
  const cord=`<div style="position:absolute;left:21px;top:12px;bottom:12px;width:3px;background:repeating-linear-gradient(180deg,var(--cord-deep) 0 7px,transparent 7px 11px);opacity:.6;z-index:1"></div>`;
  const movs=V.movimenti.map(movementHtml).join('');
  s.innerHTML=`
  <div class="eyebrow">l'arco · scritto dal finale all'indietro</div>
  <h2 class="h-sec">Il Viaggio</h2>
  <p class="lede italic">${V.raccontata}</p>

  <div class="grid g2" style="margin:16px 0">
    <div class="card"><div class="label">A-story</div><p class="small" style="margin-top:6px">${V.Astory}</p></div>
    <div class="card" style="border-left:3px solid #cfc7b6"><div class="label">B-story · il «meanwhile…»</div><p class="small" style="margin-top:6px">${V.Bstory}</p></div>
  </div>

  <div class="label" style="margin:8px 0 4px">la rotta · un nodo del Cordone per regno libero</div>
  <p class="note" style="margin-bottom:10px">La corda cresce a ogni tappa: ogni nodo stringe un pegno diverso e diventa un diario tattile. Il Gran Ducato della Serpe non ha nodo (il suo Luogo è sepolto): è l'ombra lungo tutto il viaggio.</p>
  <div style="position:relative">${cord}${movs}</div>

  <div class="callout" style="margin-top:8px;border-left-color:var(--turchino);background:rgba(63,110,146,.07)">
    <div class="label" style="color:var(--turchino)">il midpoint · il giro forte</div>
    <p class="small" style="margin-top:6px">${V.midpoint}</p>
  </div>
  <div class="callout" style="margin-top:12px">
    <div class="label">il finale · chiuso</div>
    <p class="small" style="margin-top:6px">${V.finale}</p>
  </div>

  <div class="grid g2" style="margin-top:18px">
    <div class="card">
      <div class="label" style="color:var(--cord-deep)">la spirale · lo schema torna, ma sale</div>
      <p class="note" style="margin:6px 0 10px">Un cerchio che avanza su un secondo asse: la ripetizione diventa ri-illuminazione del passato.</p>
      ${V.spirale.map(x=>`<div class="kv"><span class="k" style="min-width:120px">${x.a}</span><span class="v muted">${x.d}</span></div>`).join('')}
    </div>
    <div class="card">
      <div class="label" style="color:var(--vermiglio)">la scalata della Serpe · cattivo seriale</div>
      <div class="ladder" style="margin-top:8px">
        ${V.serpeLadder.map(r=>`<div class="rung"><div><div class="who">${r.chi}</div><div class="note mono">${r.dove}</div></div><div class="small">${r.cosa}</div></div>`).join('')}
      </div>
    </div>
  </div>`;
}

/* ---------- RITORNELLI & SEMI ---------- */
function renderRitornelli(s){
  const rits=M.ritornelli.map(r=>`<div class="rit">
     <div class="num">${r.n}</div>
     <div class="fn">${r.fn}</div>
     <h3>${r.nome}</h3>
     <div class="kv" style="margin-top:8px"><span class="k">cliché schivato</span><span class="v muted">${r.cliche}</span></div>
     <div class="kv"><span class="k">versione nostra</span><span class="v">${r.nostra}</span></div>
     <div class="accum">${r.accum.map((a,i)=>`<span>${a}</span>${i<r.accum.length-1?'<span class="ar">→</span>':''}`).join('')}</div>
   </div>`).join('');
  const SE=M.semi;
  const reg=SE.registri.map(x=>`<div class="reg ${x.cls}"><h4>${x.h}</h4><p class="small muted">${x.d}</p></div>`).join('');
  s.innerHTML=`
  <div class="eyebrow">i fili che tornano</div>
  <h2 class="h-sec">Ritornelli &amp; semi</h2>
  <p class="lede">Quattro leitmotiv che ricorrono sempre ma accumulano significato — è ciò che permette di ripetere uno schema raccontandolo diverso. Coprono quattro funzioni diverse così non si pestano: <b>missione · mistero · amicizia · slancio</b>.</p>
  <div class="grid g2" style="margin-top:16px">${rits}</div>

  <div class="divider"></div>
  <div class="eyebrow" style="color:var(--cord-deep)">continuità · anti-drift</div>
  <h3 style="font-size:26px;margin-bottom:4px">Come la storia si accumula coerente</h3>
  <p class="lede small">${SE.principio}</p>
  <div class="registro" style="margin:16px 0">${reg}</div>
  <div class="card">
    <div class="label">il meccanismo · delta + fold + recap</div>
    <p class="small" style="margin-top:6px">${SE.meccanismo}</p>
    <div class="grid g2" style="margin-top:12px">
      <div><div class="label" style="font-size:10px">semi (piantati → fioriscono)</div><div style="margin-top:6px">${SE.semiKinds.map(k=>`<span class="chip" style="margin:2px 4px 2px 0;font-size:12px">${k}</span>`).join('')}</div></div>
      <div><div class="label" style="font-size:10px">debiti (aperti → chiusi)</div><div style="margin-top:6px">${SE.debtiKinds.map(k=>`<span class="chip" style="margin:2px 4px 2px 0;font-size:12px">${k}</span>`).join('')}</div></div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="label">l'audit di continuità · il guardiano (PASS / FAIL per episodio)</div>
    <ul style="margin:8px 0 0;padding-left:18px" class="small muted">${SE.audit.map(a=>`<li style="margin-bottom:4px">${a}</li>`).join('')}</ul>
  </div>
  <p class="note" style="margin-top:16px">In una riga: <b>lo stato è il grafo, non la prosa</b>; cambia solo per soglie; si accumula come delta che si ripiegano in uno snapshot compatto. Per scrivere la puntata N serve lo stato a N, non le N-1 puntate.</p>`;
}

/* ---------- BANCO · strumenti ---------- */
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const ZHOOK={
 Cuore:["una decisione del potere locale mette R&Z in mezzo","chi comanda chiede loro qualcosa in cambio del passaggio","una contesa al vertice si decide proprio mentre arrivano"],
 Spina:["un guaio nel lavoro che regge il regno (raccolto, rete, argine, vigna)","qualcuno che lavora la terra ha visto qualcosa e non parla","la fatica di tutti i giorni nasconde un piccolo sopruso da raddrizzare"],
 Bosco:["un sentiero si perde e bisogna fidarsi di chi è schivo","una caccia va storta e serve la velocità di Zara","qualcosa di timido va convinto, non catturato"],
 Orlo:["una vedetta ha visto qualcosa a nord e nessuno le crede","un passo da valicare con poco tempo e brutto tempo","l'isolamento ha reso qualcuno fiero e diffidente"],
 Soglia:["arrivano forestieri — e forse un occhio della Serpe","il confine va attraversato senza farsi notare","due regni si toccano e qualcuno ne approfitta"],
 Vie:["un mercato, un pedaggio, una voce che corre: chi compra cosa","una merce sbagliata finisce nelle zampe sbagliate","un'informazione vera vale più dell'oro — e qualcuno la vende"],
 Rovina:["tra le pietre antiche un segno non fatto da zampe","una creatura strana abita i ruderi e non va svegliata","la pietra è tiepida quando tutto attorno è freddo"]
};
const RTENS={laghi_occidente:"…e Zara è ancora Senza-riflesso: deve farsi annodare nella rete.",laghi_oriente:"…e tutto si decide per giuramento: chi rompe un cordone perde l'onore.",pianura_alta:"…e l'esattore della Serpe pesa su tutto: salire vuol dire cambiare pelle.",pianura_bassa:"…tra i Dotti che sanno-tutto-e-non-capiscono e l'Aquila che conta solo il sangue.",selva_di_mezzo:"…e nessuno comanda: il bosco ricorda o ti dimentica, e nessuno ti protegge.",toscana:"…e le città rivali risolvono tutto con una sfida — bellissima finché non degenera in fazione."};
let CC=0;
function fillZona(){
  const r=M.regni[+$('#csRegno').value];
  $('#csZona').innerHTML=r.zone.map((z,i)=>`<option value="${i}">${z.z} — ${z.classe}</option>`).join('');
}
function runCascade(){
  const r=M.regni[+$('#csRegno').value], z=r.zone[+$('#csZona').value];
  const sp=z.specie[CC%z.specie.length];
  const hook=ZHOOK[z.z][CC%ZHOOK[z.z].length];
  const seme=`<b>${cap(sp)}</b> — ${z.classe}. ${cap(hook)}. ${RTENS[r.id]}`;
  $('#csOut').innerHTML=`
    <div class="cascade">
      <span class="step">regno <b>${r.nome}</b> · ${r.stemma}</span><span class="arrow">→</span>
      <span class="step">zona <b>${z.z}</b></span><span class="arrow">→</span>
      <span class="step">classe <b>${z.classe}</b></span><span class="arrow">→</span>
      <span class="step">specie <b>${sp}</b></span>
    </div>
    <div class="seme">${seme}</div>
    <div class="vline">voce di scena · ${z.reg} — es. «${z.ex}»</div>
    <div class="note" style="margin-top:10px;color:#8a8270">${z.lbl} · principio del regno: ${r.principio}</div>`;
}

/* episode desk */
const NEWAGE=["energi","vibrazion"," vibra","risveglio","risvegli","aura","chakra"," magia","magico","magica","magich","incantesim","spirit","essenza"," anima ","cosmic","frequenz","portale","astral","prana","karma","mistic","telepa"];
const SUBTESTO=["uman"," uomo","uomini"," persone","gente umana","coscienza collettiva","mani umane","civiltà umana"];
const PHYS=["pietra","tiepid","fredd"," eco","segn","corteccia"," nodo","corda","sasso","roccia","muschio","calda quando","piuma","scaglia"];
function scan(txt,list){const t=' '+txt.toLowerCase()+' ';const hit=[];list.forEach(w=>{if(t.includes(w))hit.push(w.trim());});return hit;}
function chk(cls,t){const ic=cls==='ok'?'✓':cls==='warn'?'!':'i';return `<div class="check ${cls}"><span class="ic">${ic}</span><span>${t}</span></div>`;}
function runChecks(){
  const g=id=>($('#'+id)?.value||'').trim();
  const c=id=>$('#'+id)?.checked;
  const d=g('epD'),sx=g('epS'),mx=g('epM');
  const story=[g('epPremise'),g('epProblem'),g('epThreshold'),g('epRes')].join('  ');
  let out='';
  // EAR
  if(d&&sx&&mx) out+=chk('ok','Spina EAR completa: Δ distingue · ⇄ si lega · ⟳ cambia.');
  else{const miss=[!d&&'Δ',!sx&&'⇄',!mx&&'⟳'].filter(Boolean).join(' ');out+=chk('warn','Spina EAR incompleta — manca '+miss+'. Se non li ha tutti e tre, l\u2019episodio è «osservazione parziale».');}
  // strano fisico
  const na=scan(story,NEWAGE);
  if(na.length) out+=chk('warn','Lo strano dev\u2019essere <b>fisico</b>, non «energia». Da rivedere: '+na.map(w=>`<span class="flagword">${w}</span>`).join(' '));
  else if(scan(story,PHYS).length) out+=chk('ok','Lo strano resta fisico (pietra, segni, eco). ✓');
  else if(story.replace(/ /g,'')) out+=chk('info','Ricorda: lo strano è sempre fisico — pietra tiepida, segni non fatti da zampe, un\u2019eco troppo lunga.');
  // subtesto
  const su=scan(story,SUBTESTO);
  if(su.length) out+=chk('warn','Il subtesto non si nomina mai: i «primi» non vanno detti umani. Da rivedere: '+su.map(w=>`<span class="flagword">${w}</span>`).join(' '));
  // tipo
  const ty=g('epType');
  const tips={cardine:'Cardine: la trama di fondo avanza di una <b>soglia</b> (~1 per arco). Annoda un nodo?',stazione:'Stazione: avventura autoconclusiva + una creatura dell\u2019episodio; problema risolto dalla complementarità R&Z.',viaggio:'Viaggio: la strada tra due centri — il mondo cambia, piccoli incontri.',respiro:'Respiro: poco plot, molto cuore — tocca una paura o fa scattare una crescita (per soglia).'};
  if(ty&&tips[ty]) out+=chk('info',tips[ty]);
  // nodo
  if(c('epNodo')&&ty!=='cardine') out+=chk('info','Di solito si annoda il nodo in un <b>cardine</b> (chiusura d\u2019arco).');
  if(c('epNodo')&&!c('epLuogo')) out+=chk('warn','Per annodare serve un Luogo Antico — spunta «tocca il Luogo Antico».');
  // toraki
  if(c('epToraki')) out+=chk('info','Traccia di Toraki: mostralo nel suo cammino <em>davanti</em>, non solo alla fine (cutaway).');
  // serpe
  const sf=g('epSerpe');
  if(!sf) out+=chk('info','Se serve «la Serpe», scegli <b>chi la incarna</b> qui (Artiglio / Cècca / Mastino / Sòrcio…), mai astratta.');
  else out+=chk('ok','La Serpe ha una faccia: '+sf+'.');
  // semi / soglia
  if(g('epSeeds')) out+=chk('info','Ogni seme piantato ha un bloom_target: dove fiorirà? (memoria lunga, fuori dall\u2019arco se possibile)');
  out+=chk('info','Cambia qualcosa <b>oltre soglia</b>? Sotto soglia è cosmetico e non sporca lo stato.');
  $('#epChecks').innerHTML='<div class="label" style="margin-bottom:6px">controlli di coerenza</div>'+out;
}
function epNode(){
  const g=id=>($('#'+id)?.value||'').trim(), c=id=>$('#'+id)?.checked;
  const sl=s=>s?s.split(/[,;]+/).map(x=>x.trim()).filter(Boolean):[];
  return {
    id:g('epId')||'epNN', title:g('epTitle'), type:g('epType'),
    regno:g('epRegno'), attribute_dominant:g('epEar'),
    spina:{premise:g('epPremise'),problem:g('epProblem'),threshold_moment:g('epThreshold'),resolution_mode:g('epRes')},
    ear:{distingue:g('epD'),si_lega:g('epS'),cambia:g('epM')},
    luogo_antico:!!c('epLuogo'),
    nodo_cordone:{annodato_qui:!!c('epNodo'),regno:g('epRegno')},
    toraki_trace:!!c('epToraki'),
    serpe_face:g('epSerpe')||null,
    seeds_planted:sl(g('epSeeds')), seeds_bloomed:sl(g('epBloom'))
  };
}
function renderBanco(s){
  const ro=M.regni.map((r,i)=>`<option value="${i}">${r.nome}</option>`).join('');
  const roId=M.regni.map(r=>`<option value="${r.id}">${r.nome}</option>`).join('');
  s.innerHTML=`
  <div class="eyebrow">strumenti · per umano</div>
  <h2 class="h-sec">Il Banco</h2>
  <p class="lede">Due strumenti per pensare le storie e tenerle coerenti. Non scrivono nulla al posto tuo: il primo genera semi dalla geografia, il secondo controlla un episodio contro le regole del canone.</p>
  <div class="tooltabs">
    <button class="active" data-t="cs">Il dito sul km²</button>
    <button data-t="ep">Banco dell'episodio</button>
  </div>

  <div class="toolpane on" id="pane-cs">
    <p class="note" style="margin-bottom:12px">La cascata deterministica del canone: scegli un regno e una <b>classe</b>, ottieni specie · voce · e un <b>seme di tensione</b> da cui far partire una puntata. «Altra idea» ruota la combinazione.</p>
    <div class="selectrow">
      <div class="fld"><label>regno</label><select id="csRegno">${ro}</select></div>
      <div class="fld"><label>classe</label><select id="csZona"></select></div>
      <button class="btn" id="csMore">↻ Altra idea</button>
    </div>
    <div class="seed-out" id="csOut"></div>
  </div>

  <div class="toolpane" id="pane-ep">
    <div class="deskgrid">
      <div class="deskform">
        <div class="two"><div class="fld"><label>titolo della puntata</label><input type="text" id="epTitle" placeholder="es. Lo specchio nel bosco"></div>
          <div class="fld"><label>id</label><input type="text" id="epId" placeholder="ep07"></div></div>
        <div class="row two"><div class="fld"><label>tipo</label><select id="epType"><option value="">—</option><option>stazione</option><option>viaggio</option><option>cardine</option><option>respiro</option></select></div>
          <div class="fld"><label>regno (arco)</label><select id="epRegno"><option value="">—</option>${roId}</select></div></div>
        <div class="row two"><div class="fld"><label>EAR dominante</label><select id="epEar"><option value="">—</option><option>distinguere</option><option>connettere</option><option>cambiare</option></select></div>
          <div class="fld"><label>la Serpe, qui, è…</label><input type="text" id="epSerpe" list="serpeFaces" placeholder="Artiglio / Cècca / Mastino…"><datalist id="serpeFaces"><option>Artiglio</option><option>Cècca</option><option>Sòrcio</option><option>il Mastino</option><option>Viscardo</option><option>Bissa</option><option>Aspide</option></datalist></div></div>
        <div class="row"><div class="fld"><label>premessa</label><textarea id="epPremise" placeholder="da dove parte la puntata"></textarea></div></div>
        <div class="row two"><div class="fld"><label>problema</label><textarea id="epProblem"></textarea></div>
          <div class="fld"><label>momento-soglia</label><textarea id="epThreshold"></textarea></div></div>
        <div class="row"><div class="fld"><label>modo di risoluzione</label><textarea id="epRes" placeholder="come si scioglie — meglio se dalla complementarità R&Z"></textarea></div></div>
        <div class="label" style="margin:4px 0 8px">la spina EAR dell'episodio</div>
        <div class="ear-in">
          <div class="fld"><label><span class="sym">Δ</span>distingue / apre</label><textarea id="epD"></textarea></div>
          <div class="fld"><label><span class="sym">⇄</span>chi si lega</label><textarea id="epS"></textarea></div>
          <div class="fld"><label><span class="sym">⟳</span>cosa cambia / il segno</label><textarea id="epM"></textarea></div>
        </div>
        <div class="row two" style="margin-top:13px"><div class="fld"><label>semi piantati (virgola)</label><input type="text" id="epSeeds" placeholder="seed_pegno_rubato, …"></div>
          <div class="fld"><label>semi fioriti (virgola)</label><input type="text" id="epBloom"></div></div>
        <div class="row" style="display:flex;gap:18px;flex-wrap:wrap;margin-top:6px">
          <label class="small" style="display:flex;gap:7px;align-items:center;cursor:pointer"><input type="checkbox" id="epLuogo"> tocca il Luogo Antico</label>
          <label class="small" style="display:flex;gap:7px;align-items:center;cursor:pointer"><input type="checkbox" id="epNodo"> annoda il nodo qui</label>
          <label class="small" style="display:flex;gap:7px;align-items:center;cursor:pointer"><input type="checkbox" id="epToraki"> mostra una traccia di Toraki</label>
        </div>
        <div class="row" style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn" id="epCopy">Copia il nodo JSON</button>
          <button class="btn ghost" id="epDl">Scarica .json</button>
        </div>
      </div>
      <div class="checks" id="epChecks"></div>
    </div>
  </div>`;
  // tabs
  s.querySelectorAll('.tooltabs button').forEach(b=>b.addEventListener('click',()=>{
    s.querySelectorAll('.tooltabs button').forEach(x=>x.classList.remove('active')); b.classList.add('active');
    s.querySelectorAll('.toolpane').forEach(p=>p.classList.remove('on'));
    $('#pane-'+b.dataset.t,s).classList.add('on');
  }));
  // cascade
  fillZona(); runCascade();
  $('#csRegno',s).addEventListener('change',()=>{CC=0;fillZona();runCascade();});
  $('#csZona',s).addEventListener('change',()=>{CC=0;runCascade();});
  $('#csMore',s).addEventListener('click',()=>{CC++;runCascade();});
  // desk
  s.querySelectorAll('#pane-ep input,#pane-ep textarea,#pane-ep select').forEach(i=>i.addEventListener('input',runChecks));
  runChecks();
  $('#epCopy',s).addEventListener('click',()=>{const t=JSON.stringify(epNode(),null,2);
    if(navigator.clipboard){navigator.clipboard.writeText(t).then(()=>toast('Nodo JSON copiato negli appunti')).catch(()=>toast('Copia non riuscita — usa Scarica'));}else toast('Copia non disponibile — usa Scarica');});
  $('#epDl',s).addEventListener('click',()=>{const n=epNode();const blob=new Blob([JSON.stringify(n,null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(n.id||'episodio')+'.json';a.click();URL.revokeObjectURL(a.href);toast('Scaricato '+(n.id||'episodio')+'.json');});
}


/* =====================================================================
   OVERRIDE — funzioni che leggono la forma-dati della repo
   (sostituiscono quelle dell'engine: ultima dichiarazione vince)
   ===================================================================== */

function realmDetail(r){
  const classi=(r.classi||[]).map(c=>`<div class="zone">
     <div class="zh"><span>${c.nome}</span><span class="zc">${(c.animali||[]).length} specie</span></div>
     <div class="small muted" style="margin:3px 0 5px">${c.ruolo}</div>
     <div class="sp-list">${(c.animali||[]).join(' · ')}</div>
     ${c.esempio?`<div class="voicebox" style="margin-top:8px;padding:8px 10px;background:var(--stone-card)">
       <div class="label" style="font-size:10px">voce · ${c.modello||c.registro}</div>
       <div class="q" style="font-size:13.5px;margin-top:3px">«${c.esempio}»</div></div>`:''}
   </div>`).join('');
  const zoneStrip=(r.zoneList||[]).map(z=>`<div class="kv"><span class="k" style="min-width:64px">${z.z}</span><span class="v muted">${z.lbl}</span></div>`).join('');
  const corp=(r.corp||[]).map(c=>`<div class="kv"><span class="k" style="min-width:150px">${c[0]}</span><span class="v muted">${c[1]}</span></div>`).join('');
  const coordTxt=c=>Array.isArray(c)?c.join(', '):c;
  const luogoHtml = r.luogo
    ? `<div class="luogo"><div class="label" style="color:var(--cord-deep)">il Luogo Antico · dove si annoda il nodo</div>
        <div style="font-family:'Fraunces',serif;font-size:19px;margin:5px 0 2px">${r.luogo.nm}</div>
        <div class="small">${r.luogo.vede}</div>
        <div class="small muted" style="margin-top:6px">${r.luogo.reale} · <span class="mono">${coordTxt(r.luogo.coord)}</span></div></div>`
    : `<div class="luogo"><div class="label" style="color:var(--cord-deep)">il Luogo Antico</div>
        <div class="small muted" style="margin-top:6px">sepolto sotto la corte — qui non si annoda nessun nodo (è l'ombra del viaggio)</div></div>`;
  return `<div class="realm-head" style="background:linear-gradient(135deg,${r.col},#1b1a2a 88%)">
    <div class="motto">${r.motto}</div><h2>${r.nome}</h2>
    <div class="meta"><span>stemma · <b>${r.stemma}</b></span><span>capitale · <span class="mono">${r.capitale}</span></span><span class="mono">${r.kmq}</span>${facBadge(r.fazione)}${r.antagonista?'<span class="chip" style="background:rgba(176,70,58,.25);color:#fff;border-color:transparent">la patria della Serpe</span>':''}</div>
  </div>
  ${realmArt(r)}
  <div class="grid g2" style="margin-top:16px">
    <div class="civ"><div class="label">forma di governo · educazione civica</div>
      <div style="font-family:'Fraunces',serif;font-size:19px;margin:6px 0 2px">${r.governo}</div>
      <div class="small muted">${r.govForma}</div>
      <div style="background:rgba(255,255,255,.5);border-radius:9px;padding:10px 12px;margin-top:10px"><div class="label" style="font-size:10px;color:var(--ink-2)">per i bambini</div><div style="font-family:'Fraunces',serif;font-style:italic;margin-top:3px">${r.govBimbi}</div></div>
      <div class="kv" style="margin-top:8px"><span class="k">Morale</span><span class="v">${r.morale}</span></div>
    </div>
    <div class="card"><div class="label" style="color:var(--cord-deep)">il principio · Calvino</div>
      <div style="font-family:'Fraunces',serif;font-size:20px;margin:6px 0 4px">${r.principio}</div>
      <p class="small muted">${r.principioD}</p>
      <div class="kv" style="margin-top:6px"><span class="k">Tensione</span><span class="v">${r.tensione}</span></div>
      <div class="kv"><span class="k">Nel viaggio</span><span class="v">${r.ruolo}</span></div>
    </div>
  </div>
  <div class="label" style="margin:18px 0 8px">le classi sociali · gli animali come ceti (Orwell) — con la voce di scena</div>
  <div class="zonebox">${classi}</div>
  <div class="grid g2" style="margin-top:16px">
    <div class="card"><div class="label">corporazioni · i mestieri che fanno nascere gli scambi</div><div style="margin-top:8px">${corp}</div>
      <div class="label" style="margin-top:14px">le zone del regno</div><div style="margin-top:6px">${zoneStrip}</div></div>
    <div>${luogoHtml}
      ${r.festa?`<div class="card" style="margin-top:14px"><div class="label">la festa</div><div style="font-family:'Fraunces',serif;font-size:17px;margin:5px 0 2px">${r.festa.nm} <span class="note">— ${r.festa.when}</span></div><p class="small muted">${r.festa.senso}</p><div class="label" style="margin-top:8px">usanze</div><ul style="margin:6px 0 0;padding-left:18px" class="small muted">${(r.usanze||[]).map(u=>`<li style="margin-bottom:3px">${u}</li>`).join('')}</ul></div>`:''}
    </div>
  </div>`;
}

function renderAtlante(s){
  const A=M.atlante||{}, G=A.griglia||{}, terre=A.terre||[];
  const byCode={}; terre.forEach(t=>byCode[t.code]=t);
  const cols=G.colnames||['A','B','C','D','E']; const rows=G.rows||5;
  let grid='<div class="cell hd"></div>'+cols.map(c=>`<div class="cell hd">${c}</div>`).join('');
  for(let r=1;r<=rows;r++){ grid+=`<div class="cell hd">${r}</div>`;
    cols.forEach(c=>{const id=c+r;const t=byCode[id];const org=id==='B1';
      grid+=`<div class="cell ${org?'org':t?'band':''}" data-code="${id}" style="cursor:${t?'pointer':'default'}">${id}</div>`;});}
  const laghi=[...new Set(terre.flatMap(t=>t.laghi||[]))];
  const fiumi=[...new Set(terre.flatMap(t=>t.fiumi||[]))];
  const coordTxt=c=>Array.isArray(c)?c.join(', '):c;
  const luoghi=(A.luoghiAntichi||[]).map(l=>`<div class="card" style="padding:14px 16px;border-left:3px solid ${l.col}"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap"><div style="font-family:'Fraunces',serif;font-size:17px">${l.sito}</div><div class="mono small muted">${coordTxt(l.coord)}</div></div><div class="small" style="color:${l.col};font-weight:600">${l.regno}</div><div class="small" style="margin-top:4px">${l.vede}</div><div class="note" style="margin-top:4px">reale: ${l.ref}</div></div>`).join('');
  s.innerHTML=`<div class="eyebrow">la geografia · letta in diretta dalla repo</div><h2 class="h-sec">Atlante</h2>
  <p class="lede">${A.base||''} La griglia e le terre qui sotto sono lette da <span class="mono">saga/cartografia/regno/atlante.json</span>.</p>
  <div class="grid g2" style="margin-top:16px">
    <div class="card"><div class="label">la griglia ${cols.length}×${rows} · l'origine è in B1 — tocca una terra</div>
      <div class="gridmap" id="atlGrid" style="margin-top:8px">${grid}</div>
      <div id="cellInfo" class="note" style="margin-top:10px">Tocca una casella per vederne terreno, quota, acque e città-rovina.</div>
    </div>
    <div>
      <div class="luogo"><div class="label" style="color:var(--cord-deep)">l'origine · pin di canone</div><div style="font-family:'Fraunces',serif;font-size:18px;margin:5px 0 2px">${A.origine?A.origine.place:''} <span class="mono note">· ${A.origine?A.origine.terra:''}</span></div><div class="small mono">${A.origine?A.origine.coord:''}</div><div class="small muted" style="margin-top:6px">${A.origine?A.origine.bioma:''}</div></div>
      <div class="card" style="margin-top:14px"><div class="label">le acque (aggregate dalle terre)</div><div class="small" style="margin-top:8px"><b>Laghi:</b> ${laghi.join(' · ')||'—'}</div><div class="small" style="margin-top:8px"><b>Fiumi:</b> ${fiumi.join(' · ')||'—'}</div>${A.rete?`<div class="kv" style="margin-top:10px"><span class="k">Rete</span><span class="v muted">${A.rete}</span></div>`:''}</div>
    </div>
  </div>
  <div class="grid g2" style="margin-top:16px">
    <div class="card"><div class="label">confini naturali</div><div style="margin-top:6px">${(A.confini||[]).map(c=>`<div class="kv"><span class="k" style="min-width:130px">${c[0]}</span><span class="v muted">${c[1]}</span></div>`).join('')}</div></div>
    <div class="card"><div class="label">il reskin · dato reale → mondo</div><div class="bio" style="margin-top:8px">${(A.biomi||[]).map(b=>`<div class="b"><b>${b[0]}</b><div class="muted" style="margin-top:2px">${b[1]}</div></div>`).join('')}</div></div>
  </div>
  <div class="card" style="margin-top:16px"><div class="label" style="color:var(--cord-deep)">la grammatica universale delle 7 zone</div><p class="small muted" style="margin:6px 0 10px">Dato un punto: regno → zona → classe/specie → usanze → seme. (Lo strumento al <b>Banco</b> esegue la cascata.)</p><div class="grid g2">${(A.zoneGrammar||[]).map(z=>`<div class="kv"><span class="k" style="min-width:70px">${z.z}</span><span class="v muted">${z.d}</span></div>`).join('')}</div></div>
  <div class="divider"></div><div class="eyebrow" style="color:var(--cord-deep)">i perni della missione</div><h3 style="font-size:24px;margin-bottom:4px">I Luoghi Antichi</h3><p class="lede small">Siti archeologici reali; uno per regno (quello della Serpe è sepolto).</p><div class="grid g2" style="margin-top:12px">${luoghi}</div>`;
  const info=$('#cellInfo',s);
  $('#atlGrid',s).addEventListener('click',e=>{const cell=e.target.closest('[data-code]');if(!cell)return;const t=byCode[cell.dataset.code];
    if(!t){info.innerHTML='Casella <b>'+cell.dataset.code+'</b> · fuori dal regno';return;}
    info.innerHTML=`<b>${t.code}</b> · ${t.terreno||''}${t.popolo?' — '+t.popolo:''}`
      +(t.quota?`<br><span class="mono">quota ${t.quota.mn}–${t.quota.mx} m · media ${t.quota.me}</span>`:'')
      +((t.laghi&&t.laghi.length)?`<br>laghi: ${t.laghi.join(', ')}`:'')
      +((t.fiumi&&t.fiumi.length)?`<br>fiumi: ${t.fiumi.join(', ')}`:'')
      +((t.citta_rovina&&t.citta_rovina.length)?`<br>città-rovina: ${t.citta_rovina.join(', ')}`:'')
      +(t.potere?`<br><span class="muted">${t.potere}</span>`:'');
  });
}

function fillZona(){
  const r=M.regni[+$('#csRegno').value];
  $('#csZona').innerHTML=(r.classi||[]).map((c,i)=>`<option value="${i}">${c.nome}</option>`).join('');
}
function runCascade(){
  const r=M.regni[+$('#csRegno').value];
  const c=(r.classi||[])[+$('#csZona').value]||(r.classi||[])[0]||{nome:'—',animali:[]};
  const animali=(c.animali&&c.animali.length)?c.animali:['—'];
  const sp=animali[CC%animali.length];
  const zl=(r.zoneList&&r.zoneList.length)?r.zoneList:[{z:'Soglia',lbl:'il confine del regno'}];
  const zone=zl[CC%zl.length];
  const hooks=ZHOOK[zone.z]||ZHOOK.Soglia;
  const hook=hooks[CC%hooks.length];
  const seme=`<b>${cap(sp)}</b> — ${c.nome}${c.ruolo?' ('+c.ruolo+')':''}. Zona <b>${zone.z}</b> (${zone.lbl}): ${cap(hook)}. ${RTENS[r.id]||''}`;
  $('#csOut').innerHTML=`<div class="cascade"><span class="step">regno <b>${r.nome}</b> · ${r.stemma}</span><span class="arrow">→</span><span class="step">classe <b>${c.nome}</b></span><span class="arrow">→</span><span class="step">specie <b>${sp}</b></span><span class="arrow">→</span><span class="step">zona <b>${zone.z}</b></span></div>
    <div class="seme">${seme}</div>
    ${c.esempio?`<div class="vline">voce di scena · ${c.modello||c.registro} — es. «${c.esempio}»</div>`:''}
    <div class="note" style="margin-top:10px;color:#8a8270">${zone.lbl} · principio del regno: ${r.principio}</div>`;
}

/* =====================================================================
   NUOVO — Cast (comprimari), Cosmologia, markdown, slot-immagine
   ===================================================================== */

/* ---- fetch testo (markdown) con stesso fallback ---- */
async function tryText(urls){ let e; for(const u of urls){ try{ const r=await fetch(u,{cache:'no-store'}); if(r.ok) return await r.text(); e=new Error('HTTP '+r.status);}catch(x){e=x;} } throw e||new Error('nessuna sorgente'); }
const fetchSagaText = p => tryText(['../saga/'+p, ...BRANCHES.map(b=>rawBase(b)+'saga/'+p)]);

/* ---- mini-renderer markdown ---- */
function mdEscape(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function mdInline(s){
  return s
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g,'$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
}
function md(src){
  src=(src||'').replace(/<!--[\s\S]*?-->/g,'');
  const out=[], lines=src.split('\n'); let i=0, inUl=false, inOl=false;
  const closeLists=()=>{ if(inUl){out.push('</ul>');inUl=false;} if(inOl){out.push('</ol>');inOl=false;} };
  while(i<lines.length){
    let ln=lines[i];
    const fence=ln.match(/^```(\w*)/);
    if(fence){ closeLists(); const buf=[]; i++; while(i<lines.length && !/^```/.test(lines[i])){ buf.push(lines[i]); i++; } i++;
      out.push('<pre class="md-pre"><code>'+mdEscape(buf.join('\n'))+'</code></pre>'); continue; }
    const h=ln.match(/^(#{1,6})\s+(.+)$/);
    if(h){ closeLists(); const lv=h[1].length; out.push('<h'+lv+' class="md-h'+lv+'">'+mdInline(mdEscape(h[2]))+'</h'+lv+'>'); i++; continue; }
    if(/^\s*([-*_])\1\1[-*_\s]*$/.test(ln)){ closeLists(); out.push('<hr>'); i++; continue; }
    const bq=ln.match(/^>\s?(.*)$/);
    if(bq){ closeLists(); const buf=[bq[1]]; i++; while(i<lines.length && /^>\s?/.test(lines[i])){ buf.push(lines[i].replace(/^>\s?/,'')); i++; }
      out.push('<blockquote class="md-bq">'+mdInline(mdEscape(buf.join(' ')))+'</blockquote>'); continue; }
    const ul=ln.match(/^\s*[-*]\s+(.+)$/);
    if(ul){ if(inOl){out.push('</ol>');inOl=false;} if(!inUl){out.push('<ul class="md-ul">');inUl=true;} out.push('<li>'+mdInline(mdEscape(ul[1]))+'</li>'); i++; continue; }
    const ol=ln.match(/^\s*\d+[.)]\s+(.+)$/);
    if(ol){ if(inUl){out.push('</ul>');inUl=false;} if(!inOl){out.push('<ol class="md-ol">');inOl=true;} out.push('<li>'+mdInline(mdEscape(ol[1]))+'</li>'); i++; continue; }
    if(/^\s*$/.test(ln)){ closeLists(); i++; continue; }
    closeLists(); out.push('<p>'+mdInline(mdEscape(ln))+'</p>'); i++;
  }
  closeLists(); return out.join('\n');
}

/* ---- slot-immagine (mostra l'illustrazione se presente, altrimenti sparisce) ---- */
function slugify(s){ return (s||'').toLowerCase().replace(/['’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); }
function imgSlot(kind, slug, style){ return `<img class="repo-img" src="img/${kind}/${slug}.webp" alt="" loading="lazy" style="${style||''}" onerror="this.remove()">`; }

/* ---- direzione artistica del regno ---- */
function realmArt(r){
  const e=r.estetica||{};
  const sw=(e.palette||[]).map(p=>`<span class="chip" style="margin:0 4px 4px 0">${p}</span>`).join('');
  return `<div class="heroimg" style="margin-top:14px">
    ${imgSlot('regni', r.id, 'display:block;width:100%;height:200px;object-fit:cover;border-radius:12px;margin-bottom:10px')}
    <div class="card"><div class="label" style="color:var(--cord-deep)">direzione artistica · pronto per le immagini</div>
      ${sw?`<div style="margin:8px 0 6px">${sw}</div>`:''}
      ${e.atmosfera?`<div class="small" style="margin-bottom:6px"><b>atmosfera:</b> ${e.atmosfera}</div>`:''}
      ${e.prompt?`<div class="note" style="line-height:1.55">${e.prompt}</div>`:''}
      <div class="note" style="margin-top:8px;color:#8a8270">illustrazione attesa in <span class="mono">web/img/regni/${r.id}.webp</span></div>
    </div></div>`;
}

/* ---- lettore documenti (riusa l'overlay) ---- */
function openDoc(title, html){
  const ov=$('#overlay'), rd=$('#reader');
  rd.innerHTML=`<div class="rhead"><h3 id="rdTitle">${title}</h3><button class="x" id="rdClose" aria-label="chiudi">✕</button></div><div class="prose md-body" id="rdProse">${html}</div>`;
  ov.classList.add('on'); document.body.style.overflow='hidden';
  $('#rdClose',rd).addEventListener('click',closeReader);
  const p=$('#rdProse',rd); if(p) p.scrollTop=0;
}
async function openCastSheet(slug, name){
  openDoc(name||slug, '<p class="muted">carico la scheda…</p>');
  try{ const t=await fetchSagaText('bible/comprimari/'+slug+'.md'); const p=$('#rdProse'); if(p){ p.innerHTML=md(t); p.scrollTop=0; } }
  catch(e){ const p=$('#rdProse'); if(p) p.innerHTML='<p class="muted">Scheda non raggiungibile: '+slug+'.md</p>'; }
}

/* ---- sezione Cast ---- */
function renderCast(s){
  const C=M.cast||{arcs:[],chars:[]};
  const byArc={}; (C.chars||[]).forEach(c=>{ (byArc[c.arc]=byArc[c.arc]||[]).push(c); });
  const meta={}; (C.arcs||[]).forEach(a=>meta[a.n]=a);
  const earCol={connettere:'#3f8e84',distinguere:'#b0503c',cambiare:'#6b6ea0'};
  const card=c=>`<button class="castcard" data-slug="${c.slug}" data-name="${(c.name||'').replace(/"/g,'&quot;')}">
      ${imgSlot('cast', c.slug, 'display:block;width:100%;height:118px;object-fit:cover;border-radius:9px;margin-bottom:8px')}
      <div class="cc-name">${c.name||c.slug}</div>
      <div class="cc-sub">${c.specie||''}</div>
      <div class="cc-tags">${c.ear?`<span class="chip" style="border-color:${earCol[c.ear]||'#ccc'};color:${earCol[c.ear]||'#555'}">EAR · ${c.ear}</span>`:''}</div>
      ${c.blurb?`<div class="cc-blurb">${c.blurb}</div>`:''}
    </button>`;
  const order=[1,2,3,4,5,6,0];
  const groups=order.filter(n=>byArc[n]).map(n=>{
    const m=meta[n], tras=(n===0);
    const head=tras
      ? `<div class="arc-head"><div class="eyebrow">trasversali · presenze ricorrenti</div><h3>il filo che attraversa</h3><p class="lede small">La cicala (la Voce che torna), il Cacciatore, l'Esattore pentito, la Serpe diffusa: tornano in più archi.</p></div>`
      : `<div class="arc-head"><div class="eyebrow">Arco ${n} ${m&&m.fatto?'· ✅':''}</div><h3>${m?m.realm:''}</h3>${m&&m.tagline?`<p class="lede small">${m.tagline}</p>`:''}</div>`;
    return head+`<div class="castgrid">${byArc[n].map(card).join('')}</div>`;
  }).join('<div class="divider"></div>');
  s.innerHTML=`<div class="eyebrow">gli abitanti · letti dalla repo</div><h2 class="h-sec">Cast</h2>
    <p class="lede">${(C.chars||[]).length} comprimari, un arco per regno. Non costruiti per la trama: <i>abitanti</i> che stanno in quel luogo reale, e parlano di conseguenza. Tocca una scheda per aprirla (caricata al volo da <span class="mono">saga/bible/comprimari/</span>).</p>
    <div class="divider"></div>${groups||'<p class="muted">cast.json non trovato — rigenera con <span class="mono">node web/tools/build_cast.mjs</span></p>'}`;
  s.querySelectorAll('.castcard').forEach(b=>b.addEventListener('click',()=>openCastSheet(b.dataset.slug,b.dataset.name)));
}

/* ---- card Cosmologia nella Plancia ---- */
function injectCosmologia(){
  if(!M.cosmologia) return;
  const sec=document.getElementById('sec-plancia'); if(!sec) return;
  const card=document.createElement('div');
  card.className='card';
  card.style.cssText='margin-top:18px;border-left:3px solid var(--cord-deep)';
  card.innerHTML=`<div class="label" style="color:var(--cord-deep)">la cornice d'autore · da proteggere</div>
    <div style="font-family:'Fraunces',serif;font-size:20px;margin:6px 0 4px">Cosmologia — la spirale</div>
    <p class="small muted">umanità → età animale → prossima umanità: ogni età annoda il Cordone come dono in avanti. È il motore nascosto del finale; <b>mai detto nella prosa</b>.</p>
    <button class="docbtn" id="cosmoBtn">leggi COSMOLOGIA.md →</button>`;
  sec.appendChild(card);
  const b=card.querySelector('#cosmoBtn'); if(b) b.addEventListener('click',()=>openDoc('Cosmologia · la spirale', md(M.cosmologia)));
}

/* ---- stili per le parti nuove (iniettati, l'index.html resta intatto) ---- */
function injectStyles(){
  if(document.getElementById('regia-extra-css')) return;
  const css=`
  .castgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-top:6px}
  .castcard{text-align:left;background:var(--stone-card,#fbf8f1);border:1px solid rgba(0,0,0,.08);border-radius:13px;padding:12px;cursor:pointer;transition:transform .12s ease,box-shadow .12s ease;color:inherit;font:inherit}
  .castcard:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(0,0,0,.10)}
  .cc-name{font-family:'Fraunces',serif;font-size:17px;line-height:1.15}
  .cc-sub{font-size:12.5px;color:var(--ink-2,#6b6457);margin-top:2px}
  .cc-tags{margin-top:7px;display:flex;flex-wrap:wrap;gap:4px}
  .cc-blurb{font-size:12.5px;color:var(--ink-2,#6b6457);margin-top:8px;line-height:1.45}
  .arc-head{margin:6px 0 10px}
  .arc-head h3{font-size:24px;margin:2px 0 2px;font-family:'Fraunces',serif}
  .docbtn,.btn{appearance:none;border:1px solid var(--cord-deep,#9a7d3a);background:transparent;color:var(--cord-deep,#9a7d3a);border-radius:9px;padding:7px 12px;font:inherit;font-size:13px;cursor:pointer}
  .docbtn:hover,.btn:hover{background:var(--cord-deep,#9a7d3a);color:#fff}
  .md-body{line-height:1.6}
  .md-body .md-h1{font-family:'Fraunces',serif;font-size:24px;margin:0 0 10px}
  .md-body .md-h2{font-family:'Fraunces',serif;font-size:20px;margin:18px 0 8px;color:var(--cord-deep,#9a7d3a)}
  .md-body .md-h3{font-size:16px;margin:14px 0 6px;text-transform:uppercase;letter-spacing:.04em;color:var(--ink-2,#6b6457)}
  .md-body .md-h4,.md-body .md-h5,.md-body .md-h6{font-size:14px;margin:12px 0 4px;font-weight:700}
  .md-body p{margin:0 0 10px}
  .md-body .md-ul,.md-body .md-ol{margin:0 0 10px;padding-left:20px}
  .md-body li{margin-bottom:4px}
  .md-body .md-bq{border-left:3px solid var(--cord-deep,#9a7d3a);background:rgba(154,125,58,.08);padding:8px 12px;margin:0 0 10px;border-radius:0 8px 8px 0;font-size:13.5px}
  .md-body .md-pre{background:#1b1a2a;color:#e8e4d8;border-radius:9px;padding:12px;overflow:auto;font-size:12.5px;margin:0 0 10px}
  .md-body code{font-family:'Spline Sans Mono',monospace;font-size:.9em}
  .md-body hr{border:none;border-top:1px solid rgba(0,0,0,.12);margin:14px 0}
  .repo-img{background:rgba(0,0,0,.04)}
  `;
  const st=document.createElement('style'); st.id='regia-extra-css'; st.textContent=css; document.head.appendChild(st);
}

/* ---- bootstrap (dopo che tutto è definito) ---- */
if(document.readyState!=='loading') init();
else document.addEventListener('DOMContentLoaded', init);
