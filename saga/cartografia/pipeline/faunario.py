#!/usr/bin/env python3
"""faunario — specie ESCLUSIVE per regno (come le regioni Pokémon) + grammatica
universale delle zone + regola 'punta il dito sul km² e la storia nasce da sé'.
Allinea la societa del regno-modello (Laghi d'Occidente) alle specie canoniche e
ne disegna la mappa a zone. canone_visivo e variazione_individuale sono placeholder
(si definiscono in fase personaggi)."""
import json, os, math
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import LightSource, LinearSegmentedColormap
os.makedirs("out_regni/_schema", exist_ok=True)

PH = "da definire in fase personaggi"   # placeholder canone visivo

# specie esclusive per regno: (specie, zona_tipo, classe, ruolo)
ROSTER = {
 1: ("Laghi d'Occidente", "lince", [
    ("lince","Cuore","i Custodi","memoria e giudizio"),
    ("lontra","Spina","Gente delle Rive","tessitori di reti"),
    ("airone cenerino","Spina","Gente delle Rive","traghettatori"),
    ("martin pescatore","Spina","Gente delle Rive","lettori di nebbia"),
    ("rana","Spina","Gente delle Rive","voci e messaggi d'acqua"),
    ("volpe","Bosco","Popolo del Bosco","custodi del fuoco e dei sentieri"),
    ("scoiattolo rosso","Bosco","Popolo del Bosco","raccoglitori"),
    ("ghiro","Bosco","Popolo del Bosco","memorie del bosco (dormono e ricordano)"),
    ("picchio","Bosco","Popolo del Bosco","battitori di segnali sugli alberi"),
    ("camoscio","Orlo","Sentinelle d'Altura","vedette dei valichi"),
    ("marmotta","Orlo","Sentinelle d'Altura","sentinelle che fischiano l'allarme"),
    ("gipeto","Orlo","Sentinelle d'Altura","messaggeri d'altura"),
 ]),
 2: ("Laghi d'Oriente", "leonessa", [
    ("leonessa","Cuore","i Protettori","capi eletti della difesa"),
    ("orso bruno","Soglia","i Giurati","guardiani di confine"),
    ("cane da pastore","Soglia","i Giurati","custodi delle greggi e dei patti"),
    ("capriolo","Spina","Gente delle Conche","vignaioli e coltivatori"),
    ("riccio","Spina","Gente delle Conche","ortolani prudenti"),
    ("tasso","Spina","Gente delle Conche","scavatori e cantinieri"),
    ("stambecco","Orlo","Montanari del Garda","gente delle creste"),
    ("gracchio alpino","Orlo","Montanari del Garda","messaggeri delle vette"),
    ("ermellino","Orlo","Montanari del Garda","staffette tra i passi"),
 ]),
 3: ("Pianura Alta", "biscione", [
    ("biscia (serpe)","Cuore","il Signore e la Corte","il vertice della piramide"),
    ("mastino","Cuore","i Vassalli","signori delle città soggette (Verona)"),
    ("falco","Orlo","i Vassalli","esattori e occhi del Signore"),
    ("bufalo","Spina","Popolo dell'Aperto","forza del lavoro della pianura"),
    ("cavallo","Spina","Popolo dell'Aperto","corrieri e aratori"),
    ("bue","Spina","Popolo dell'Aperto","mandrie e campi"),
    ("cicogna","Spina","Popolo dell'Aperto","gente d'argine e di nido alto"),
    ("gazza","Vie","i Mercanti delle Vie","commerci e voci"),
    ("ratto","Vie","i Mercanti delle Vie","spie e contrabbando"),
 ]),
 4: ("Pianura Bassa", "gufo + aquila", [
    ("gufo","Cuore","i Dotti","sapienti e giudici della Dotta"),
    ("civetta","Cuore","i Dotti","maestri e archivisti"),
    ("aquila","Soglia","la Casa dell'Aquila","la stirpe nobile (Ferrara)"),
    ("nibbio","Soglia","la Casa dell'Aquila","nobili minori e falconieri"),
    ("anatra","Spina","Contadini del Po","gente di golena"),
    ("oca","Spina","Contadini del Po","sentinelle starnazzanti degli argini"),
    ("talpa","Spina","Contadini del Po","scavatori e canalisti"),
    ("garzetta","Spina","Contadini del Po","pescatori di risaia"),
 ]),
 5: ("Selva di Mezzo", "gli Antichi", [
    ("cervo","Cuore","gli Antichi","il Cervo antico, memoria del bosco"),
    ("corvo","Cuore","gli Antichi","custodi dei nomi"),
    ("gatto selvatico","Bosco","i Solitari","schivi e indipendenti"),
    ("martora","Bosco","i Solitari","ladri d'ombra"),
    ("cinghiale","Bosco","i Solitari","forza brada del sottobosco"),
    ("pipistrello","Rovina","Creature della Rovina","abitanti dei ruderi"),
    ("rospo","Rovina","Creature della Rovina","guardiani delle soglie umide"),
    ("ramarro","Rovina","Creature della Rovina","verdi tra le pietre"),
    ("lucciola","Rovina","Creature della Rovina","le luci del bosco di notte"),
 ]),
 6: ("Toscana", "leone (Marzocco)", [
    ("leone","Cuore","Cittadini del Leone","il popolo di Firenze: artigiani e artisti"),
    ("lepre","Spina","Cittadini del Leone","corrieri e gente di mercato"),
    ("istrice","Spina","Cittadini del Leone","artigiani spinosi e orgogliosi"),
    ("upupa","Spina","Cittadini del Leone","banditori e messaggeri"),
    ("lupo","Soglia","la Lupa e i suoi","i fieri di Siena"),
    ("pantera","Soglia","la Pantera libera","i gelosi di Lucca"),
    ("gabbiano","Orlo","la Gente del Mare","marinai di Pisa"),
    ("cormorano","Orlo","la Gente del Mare","pescatori d'altura"),
    ("granchio","Orlo","la Gente del Mare","gente di porto e scoglio"),
    ("tartaruga marina","Orlo","la Gente del Mare","viaggiatrici lente del mare"),
 ]),
}

# grammatica universale delle zone (uguale in ogni regno, reskin diverso)
ZONE = {
 "Cuore":  "la sede del potere / capitale: dove si decide (consiglio, corte, repubblica...)",
 "Spina":  "il cuore produttivo: la classe-lavoratrice principale del regno",
 "Bosco":  "il bosco/selva del regno: caccia, legna, sentieri, gente schiva",
 "Orlo":   "la frontiera alta o estrema: vedette, messaggeri, gente isolata e fiera",
 "Soglia": "i confini coi regni vicini: dove i regni si toccano e arrivano i Forestieri",
 "Vie":    "le strade, i guadi, i mercati che collegano tutto: qui si muovono le corporazioni",
 "Rovina": "(dove c'è) le rovine antiche coperte di bosco: misteriose, ai margini del canone",
}

# istanza geografica delle zone per il regno-modello (ancore reali)
ZONE_R1 = [
 ("Cuore","Como — il Consiglio del Lago",[9.08,45.81]),
 ("Spina","le Rive dei laghi (Lario, Verbano, Ceresio)",[8.95,45.98]),
 ("Bosco","i boschi delle montagne occidentali",[8.72,45.92]),
 ("Orlo","l'Altura dei valichi, verso il Muro delle Alpi",[9.30,46.40]),
 ("Soglia","il confine sud verso la Serpe — la collina dell'incontro",[9.32,45.62]),
 ("Vie","i passaggi del lago e i sentieri dei traghettatori",[9.22,46.05]),
]

FORESTIERI = [
 {"nome":"Rocco","specie":"rinoceronte","stato":"protagonista — Forestiero","note":"specie esotica, non di nessun regno; viene dalla Pianura Alta. Sempre 'fuori posto': è il senso del personaggio."},
 {"nome":"Zara","specie":"tigre","stato":"protagonista — Forestiera","note":"specie esotica, non di nessun regno; ospite nei Laghi d'Occidente. La sua estraneità è il motore del viaggio."},
]
ECCEZIONI = ["leone (Toscana) e leonessa (Laghi d'Oriente): stessa specie in due regni, ammessa perché stemma; arte canonica DISTINTA — leonessa fulva senza criniera vs leone dalla criniera dorata."]

REGOLA = ("Regola universale 'punta il dito sul km²': dato un punto → 1) il regno (dal taglio); "
          "2) il tipo di zona (vicino alla capitale=Cuore; su una riva/campagna produttiva=Spina; bosco fitto=Bosco; "
          "alta quota/estremo=Orlo; vicino a un confine=Soglia; su una via/guado=Vie; tra ruderi=Rovina); "
          "3) le specie e la classe di quella zona (dal faunario); 4) il principio e le usanze del regno; "
          "5) un seme di tensione (chi c'è, cosa teme, cosa commercia). Stessa regola in tutti i regni: cambia solo il reskin.")

# ---- emetti faunario ----
fauna = {"zone_universali": ZONE, "regola_punta_il_dito": REGOLA, "forestieri": FORESTIERI, "eccezioni": ECCEZIONI, "regni": {}}
for k,(nome,leader,lst) in ROSTER.items():
    fauna["regni"][str(k)] = {"nome":nome, "leader":leader,
       "specie":[{"specie":s,"zona":z,"classe":c,"ruolo":r,
                  "canone_visivo":PH,"variazione_individuale":PH} for (s,z,c,r) in lst]}
    if k==1: fauna["regni"]["1"]["zone_geografiche"]=[{"tipo":t,"luogo":l,"coord":xy} for (t,l,xy) in ZONE_R1]
json.dump(fauna, open("out_regni/_faunario.json","w"), ensure_ascii=False, indent=1)

with open("out_regni/_faunario.md","w") as f:
    f.write("# Faunario canonico — specie esclusive per regno\n\n")
    f.write("Ogni specie vive in **un solo regno** (come le regioni Pokémon). Specie esotiche dei protagonisti a parte. ")
    f.write("**Animali naturalistici, senza vestiti** (vedi `../../bible/STILE_VISIVO.md`). Gli abitanti generici di una specie si somigliano: per **identificare un personaggio che ricorre** si usa un **segno naturale distintivo** — una cicatrice, un orecchio intagliato, una macchia nel manto, un occhio di colore diverso — e solo di rado un piccolo **pegno portato**; **mai un indumento**. `canone_visivo` e `variazione_individuale` (il segno) si fissano in fase personaggi.\n\n")
    f.write("## Forestieri (protagonisti, fuori roster)\n")
    for x in FORESTIERI: f.write(f"- **{x['nome']}** — {x['specie']}: {x['note']}\n")
    f.write("\n## Eccezione ammessa\n")
    for e in ECCEZIONI: f.write(f"- {e}\n")
    f.write("\n## Grammatica universale delle zone\n")
    for z,d in ZONE.items(): f.write(f"- **{z}** — {d}\n")
    f.write(f"\n> {REGOLA}\n\n")
    for k,(nome,leader,lst) in ROSTER.items():
        f.write(f"## {k} · {nome} — {leader}\n")
        by={}
        for (s,z,c,r) in lst: by.setdefault(z,[]).append(f"{s} ({c})")
        for z in ["Cuore","Spina","Bosco","Orlo","Soglia","Vie","Rovina"]:
            if z in by: f.write(f"- **{z}**: {', '.join(by[z])}\n")
        f.write("\n")
    f.write("## Zone geografiche del regno-modello (Laghi d'Occidente)\n")
    for (t,l,xy) in ZONE_R1: f.write(f"- **{t}** → {l}\n")

# schema fauna
json.dump({"$descrizione":"Faunario: specie esclusive per regno + zone universali. Fonte di verità per le specie; gli script di personaggi/immagini pescano da qui.",
   "zone_universali":"dizionario tipo->descrizione (uguale per tutti i regni)",
   "regola_punta_il_dito":"procedura punto->regno->zona->specie/classe->usanze->seme di storia",
   "forestieri":[{"nome":"str","specie":"esotica","stato":"protagonista"}],
   "regni":{"<id>":{"nome":"str","leader":"specie","specie":[{"specie":"str","zona":"Cuore|Spina|Bosco|Orlo|Soglia|Vie|Rovina","classe":"str","ruolo":"str","canone_visivo":"placeholder","variazione_individuale":"placeholder"}],
                    "zone_geografiche":[{"tipo":"str","luogo":"str","coord":"[lon,lat]"}]}}},
   open("out_regni/_schema/faunario.schema.json","w"), ensure_ascii=False, indent=1)

# ---- allinea la societa del regno-modello alle specie canoniche ----
sp = "out_regni/laghi_occidente/societa.json"
soc = json.load(open(sp))
canon = {z:[s for (s,zz,c,r) in ROSTER[1][2] if c==cl] for z,cl in []}  # noop placeholder
map_classe = {"i Custodi":["lince"],
  "la Gente delle Rive":["lontra","airone cenerino","martin pescatore","rana"],
  "il Popolo del Bosco":["volpe","scoiattolo rosso","ghiro","picchio"],
  "le Sentinelle d'Altura":["camoscio","marmotta","gipeto"],
  "gli Ospiti e i Senza-riflesso":["forestieri d'ogni specie","tigre (Zara)"]}
for cl in soc["classi"]:
    if cl["nome"] in map_classe: cl["animali"]=map_classe[cl["nome"]]
# corporazioni -> specie canoniche R1
corp_specie = {"i Tessitori di Reti":["lontra"],"i Traghettatori":["airone cenerino","rana"],
  "i Lettori di Nebbia":["martin pescatore"],"i Custodi del Fuoco":["volpe"],
  "i Carbonai e Sentieristi":["scoiattolo rosso","ghiro","picchio"]}
for co in soc["corporazioni"]:
    if co["nome"] in corp_specie: co["specie_tipiche"]=corp_specie[co["nome"]]
soc["zone"]=[{"tipo":t,"luogo":l,"coord":xy} for (t,l,xy) in ZONE_R1]
soc["nota_faunario"]="specie allineate al faunario canonico (esclusive del regno); vedi _faunario.json"
json.dump(soc, open(sp,"w"), ensure_ascii=False, indent=1)

# ---- mappa a zone del regno-modello ----
dem=np.load("dem_elev.npy").astype(float); bnd=json.load(open("dem_bounds.json")); Z=bnd.get("z",9)
def dtx(lon): return (lon+180)/360*2**Z
def dty(lat): return (1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*2**Z
xmin=round(dtx(bnd["left"])); ymin=round(dty(bnd["top"])); Hh,Ww=dem.shape
def gpx(lon,lat): return (dtx(lon)-xmin)*256,(dty(lat)-ymin)*256
W_,S_,E_,N_=[8.44,45.50,9.55,46.56]
x0=int(max(0,gpx(W_,N_)[0])); x1=int(min(Ww,gpx(E_,N_)[0])); y0=int(max(0,gpx(W_,N_)[1])); y1=int(min(Hh,gpx(E_,S_)[1]))
sub=dem[y0:y1,x0:x1]
IPSO=LinearSegmentedColormap.from_list("i",[(0,"#6f9bc4"),(0.05,"#9bbd86"),(0.18,"#cfc890"),(0.4,"#b29457"),(0.7,"#8a6a44"),(1,"#f3f3f3")])
rgb=LightSource(315,45).shade(np.clip(np.where(np.isnan(sub),0,sub),0,None),cmap=IPSO,vert_exag=2.1,dx=217,dy=217,blend_mode="soft",vmin=0,vmax=2600)
fig,ax=plt.subplots(figsize=(9,9*sub.shape[0]/sub.shape[1]),dpi=140); ax.imshow(rgb,origin="upper",interpolation="bilinear")
def lp(lon,lat): return gpx(lon,lat)[0]-x0,gpx(lon,lat)[1]-y0
for pts in [ [(p["lon"],p["lat"]) for p in (e.get("geometry") or [])] if e.get("type")=="way" else sum([[ (p["lon"],p["lat"]) for p in (m.get("geometry") or [])] for m in e.get("members",[]) if m.get("type")=="way"],[]) for e in json.load(open("cache_it/lakes.json"))]:
    if len(pts)>=3:
        xs,ys=zip(*[lp(a,b) for a,b in pts]); ax.fill(xs,ys,color="#2f6fb0",zorder=3,lw=0,alpha=0.9)
COL={"Cuore":"#c0392b","Spina":"#2f7d77","Bosco":"#3f7d3f","Orlo":"#8a6a44","Soglia":"#6a4c93","Vie":"#d98a2b"}
for (t,l,xy) in ZONE_R1:
    cx,cy=lp(*xy)
    ax.scatter([cx],[cy],s=120,color=COL[t],edgecolor="white",lw=1.4,zorder=7)
    ax.annotate(f"{t}\n{l}",(cx,cy),fontsize=7.6,weight="bold",color="#10160a",ha="center",
                xytext=(0,12),textcoords="offset points",zorder=8,
                bbox=dict(boxstyle="round,pad=0.25",fc="white",ec=COL[t],alpha=0.85))
ax.set_xlim(0,sub.shape[1]); ax.set_ylim(sub.shape[0],0); ax.set_xticks([]); ax.set_yticks([])
ax.set_title("Laghi d'Occidente — le zone universali (modello)\nCuore · Spina · Bosco · Orlo · Soglia · Vie",fontsize=11)
plt.tight_layout(); plt.savefig("out_regni/laghi_occidente/zone.png",bbox_inches="tight"); plt.close()

print("FAUNARIO esclusivo creato. Specie per regno:")
for k,(nome,leader,lst) in ROSTER.items(): print(f"  {k} {nome:20} {len(lst)} specie  (leader: {leader})")
allsp=[s for (_,_,lst) in ROSTER.values() for (s,_,_,_) in lst]
print("totale specie:",len(allsp)," uniche:",len(set(allsp)),"(leone/leonessa eccezione voluta)")
print("-> out_regni/_faunario.json/.md , _schema/faunario.schema.json , laghi_occidente/zone.png ; societa R1 allineata")
