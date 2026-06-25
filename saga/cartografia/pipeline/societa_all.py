#!/usr/bin/env python3
"""societa_all — stende società + zone sui regni 2..6, col modello del regno 1.
Principio calviniano per regno + classi (specie dal faunario) + corporazioni che
commerciano fuori + zone geografiche + mappa a zone."""
import json, os, math
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import LightSource, LinearSegmentedColormap

fau = json.load(open("out_regni/_faunario.json"))["regni"]
IDS = {2:"laghi_oriente",3:"pianura_alta",4:"pianura_bassa",5:"selva_di_mezzo",6:"toscana"}

# ---- contenuto autoriale per regno ----
A = {}
A[2] = dict(
  principio=("il regno dei giuramenti","Ogni patto è un cordone che si porta addosso. La forza della città è la somma delle promesse mantenute; chi rompe un giuramento perde il suo cordone, e con esso l'onore.",
   ["un giuramento si fa intrecciando due cordoni","la città conta la sua forza in cordoni intrecciati","chi non ha mai giurato è 'uno sciolto'","il coraggio si misura, non si vanta"]),
  classi={"i Protettori":("capi eletti solo in tempo di pericolo","alto per fiducia, non per sangue","leonesse; guidano la difesa, poi rendono il potere"),
          "i Giurati":("cittadini liberi e guardiani di confine","medio-alto","duri, leali, legati dal giuramento reciproco"),
          "Gente delle Conche":("vignaioli e coltivatori delle conche tra i laghi","medio","miti, operosi, fanno il vino che tutti vogliono"),
          "Montanari del Garda":("vedette e staffette delle creste","medio, isolato","fieri, parlano poco, conoscono ogni passo")},
  corporazioni=[("i Cordai","intrecciano i cordoni dei giuramenti (mestiere quasi sacro)",["cane da pastore"],"ogni nodo dice chi giura e a chi","chi, in ogni regno, vuole un patto 'che si porta addosso'"),
    ("i Cantinieri","vino delle conche",["capriolo","tasso"],"vino di conca, scuro e forte","la pianura della Serpe e la Dotta lo comprano"),
    ("le Vedette del Garda","segnali tra le creste",["gracchio alpino","ermellino"],"fuochi e fischi che corrono di cima in cima","le Sentinelle dei Laghi d'Occidente per le notizie d'altura")],
  mobilita="per giuramenti mantenuti: più cordoni hai, più sei rispettato; si precipita rompendo un patto",
  rapporti="Protettori e Giurati legati dal giuramento; le Conche più miti; i Montanari fieri e a parte",
  tensione="stretta tra la Serpe (ovest) e l'Aquila (est): entrambe vorrebbero comprarne i giuramenti; la Leonessa non si vende",
  estrazione="es. un giovane orso Giurato iscritto ai Cordai, che custodisce i cordoni del suo villaggio",
  esempi=[("(libero)","Giurati","un giovane orso che fa il suo primo giuramento alla Festa")],
  zone=[("Cuore","Brescia e Bergamo — le città fiere",[10.22,45.54]),("Spina","le conche e le vigne tra Iseo e Garda",[10.15,45.66]),
        ("Bosco","le pendici boscose delle Prealpi",[9.95,45.85]),("Orlo","le creste sopra il Garda",[10.55,45.80]),
        ("Soglia","i confini verso la Serpe e l'Aquila",[10.85,45.52]),("Vie","la pedemontana e le rive del Garda",[10.45,45.58])])

A[3] = dict(
  principio=("il regno delle pelli","Il rango è una pelle. Per salire si 'cambia pelle' davanti al Signore; la pianura è una piramide di pelli, e ogni cosa è mappata da chi versa tributo a chi. La Serpe in cima ha la pelle più lucida.",
   ["ognuno porta il colore della propria pelle-rango","salire significa mutare davanti al Signore","la mappa del potere è 'chi versa a chi'","le voci corrono più veloci dei corrieri"]),
  classi={"il Signore e la Corte":("il vertice della piramide","altissimo","la Serpe e i serpenti di corte; decidono tutto"),
          "i Vassalli":("signori minori ed esattori","alto","cani e rapaci che eseguono e raccolgono il tributo"),
          "Popolo dell'Aperto":("la forza-lavoro della grande pianura","basso ma numerosissimo","mandrie e aratori; in basso, qualcuno sogna la libertà e fugge alla Selva"),
          "Mercanti delle Vie":("commerci e voci lungo le strade","medio, mobile","stanno con chi vince; vendono merci e segreti")},
  corporazioni=[("gli Esattori","raccolgono il tributo per la Serpe",["falco"],"sanno a memoria chi deve cosa","la Serpe; temuti in ogni terra soggetta"),
    ("i Carradori","muovono merci, aratri e mandrie",["cavallo","bue"],"le grandi strade dritte e i carri pesanti","portano grano e forza-lavoro a tutti i regni"),
    ("i Banditori e i Sussurri","le voci, ufficiali e non",["gazza","ratto"],"una notizia vera vale più dell'oro","chi compra informazioni: anche i Traghettatori dei laghi")],
  mobilita="la Muta: si sale 'cambiando pelle' per favore del Signore, si precipita per una disgrazia; ferocemente verticale",
  rapporti="il Popolo dell'Aperto è tanto e in basso e scontento; i Vassalli si temono a vicenda; i Mercanti seguono il potere",
  tensione="la Serpe vuole inghiottire i vicini; dentro, l'ambizione divora e i piccoli non contano — da qui partono gli esuli verso la Selva",
  estrazione="es. un giovane bufalo del Popolo dell'Aperto, stanco dell'ordine della Serpe (come Rocco, che però è Forestiero)",
  esempi=[("Rocco","Popolo dell'Aperto (da Forestiero)","rinoceronte: in basso nella piramide, parte per vedere oltre")],
  zone=[("Cuore","Milano — la corte della Serpe",[9.19,45.46]),("Spina","la grande pianura coltivata, campi e mandrie",[9.55,45.22]),
        ("Bosco","i boschi planiziali e le garzaie (radi)",[8.95,45.30]),("Orlo","i margini prealpini a nord, occhi degli esattori",[9.85,45.50]),
        ("Soglia","il fronte verso il Po a sud e i laghi a nord",[10.05,45.08]),("Vie","le strade dritte e i canali dei mercanti",[9.62,45.34])])

A[4] = dict(
  principio=("inchiostro contro sangue","Due modi di ricordare, vicini e nemici. Nella Dotta la legge vive nei libri e vale solo se letta ad alta voce; nelle terre dell'Aquila conta solo il sangue. E sopra entrambi, il Po che ogni anno esonda e ridisegna i confini.",
   ["una regola non letta ad alta voce non esiste","un dubbio si scioglie con una Disputa pubblica","il nome della stirpe apre ogni porta","il Po decide i confini, non gli uomini"]),
  classi={"i Dotti":("sapienti e giudici della città dotta","alto per sapere","gufi e civette; decidono con la legge e la parola"),
          "la Casa dell'Aquila":("la nobiltà che governa per sangue","alto per nascita","aquile e nibbi; comandano Ferrara e Modena per lignaggio"),
          "Contadini del Po":("gente d'acqua e di golena","basso","tengono gli argini e subiscono le piene")},
  corporazioni=[("i Copisti","copiano e leggono ad alta voce le leggi",["civetta"],"una legge senza voce è muta: la danno loro","tutti i regni che vogliono 'registrare' qualcosa — perfino i Tessitori dei laghi, per confronto"),
    ("i Disputanti","risolvono le liti a parole, in pubblico",["gufo"],"vince chi convince, non chi grida","chiunque abbia una contesa da sciogliere senza spargere sangue"),
    ("gli Argini-mastri","domano il Po",["talpa","garzetta"],"conoscono dove l'acqua salirà prima che salga","i regni a valle, che temono le sue piene")],
  mobilita="nella Dotta si sale col sapere (uno studente diventa Dotto); nelle terre dell'Aquila quasi nulla: si nasce nobili o no",
  rapporti="Dotta e Aquila si contendono la pianura bassa; gli Studenti (anche Forestieri) portano idee nuove; i Contadini stanno nel mezzo",
  tensione="legge contro sangue; e il grande fiume che, esondando, si fa beffe di entrambi e ridisegna tutto",
  estrazione="es. una giovane civetta Copista che impara a leggere le leggi, o un nibbio della Casa dell'Aquila",
  esempi=[("(libero)","i Dotti","un vecchio gufo Disputante che potrebbe fare da maestro lungo il cammino")],
  zone=[("Cuore","Bologna — la Dotta, portici e libri",[11.34,44.49]),("Spina","le campagne e la golena del Po",[11.00,44.86]),
        ("Bosco","i boschi golenali e i pioppeti",[10.55,44.95]),("Orlo","i primi colli dell'Appennino a sud",[11.05,44.38]),
        ("Soglia","le terre dell'Aquila (Ferrara, Modena) e il grande guado del Po",[11.62,44.84]),("Vie","le strade e il Po stesso, il guado",[11.25,44.92])])

A[5] = dict(
  principio=("il bosco ricorda al posto tuo","Qui non si annoda, non si scrive, non si giura: il bosco stesso tiene memoria. Gli alberi ricordano i nomi; chi entra può perdersi — cioè essere dimenticato — o farsi ricordare dalla foresta. Nessuna legge, solo l'antica usanza.",
   ["dici il tuo nome a un albero antico e il bosco lo tiene","chi rispetta la foresta trova la via, chi la offende si perde","di notte le lucciole disegnano i sentieri","la città-rovina appare solo a chi il bosco vuole"]),
  classi={"gli Antichi":("i memori del bosco","rispettati da tutti","il Cervo antico e i corvi: custodiscono i nomi e l'usanza"),
          "i Solitari":("creature schive del bosco profondo","a parte","gatti selvatici, martore, cinghiali: nessun padrone"),
          "Creature della Rovina":("abitanti dei ruderi inghiottiti","misteriosi","pipistrelli, rospi, ramarri, lucciole: la vita strana tra le pietre"),
          "gli Esuli":("fuggiti da ogni regno","fuori, in cerca di posto","ribelli della Serpe, sbandati: il bosco li accoglie se lo rispettano")},
  corporazioni=[("i Sentieri-viventi","guidano chi merita, per favori (non per oro)",["martora","gatto selvatico"],"conoscono vie che nessuna mappa segna","i Carbonai-Sentieristi dei Laghi d'Occidente che vengono ai margini"),
    ("i Guardiani della Rovina","custodiscono ciò che resta della città inghiottita",["corvo","pipistrello"],"sanno quali pietre non si toccano","nessuno: non vendono, scambiano segreti")],
  mobilita="non c'è scala: conta solo quanto il bosco ti ricorda; un esule diventa 'del bosco' se la foresta lo accetta",
  rapporti="gli Antichi rispettati, i Solitari diffidenti, le Creature della Rovina misteriose, gli Esuli tollerati: nessun padrone su nessuno",
  tensione="libertà assoluta = nessuna protezione: rifugio e pericolo insieme; tutti i regni temono e desiderano la Selva (per i segreti e gli esuli)",
  estrazione="es. un esule (ex Popolo dell'Aperto della Serpe) diventato Solitario; o una giovane martora dei Sentieri-viventi",
  esempi=[("(libero)","gli Esuli","un esule misterioso che mette alla prova Rocco e Zara e poi li guida")],
  zone=[("Rovina","la città-rovina inghiottita dal bosco (il 'cuore' senza potere)",[10.60,44.15]),("Bosco","il fitto della Selva: è quasi tutto bosco",[10.20,44.14]),
        ("Orlo","i crinali dell'Appennino",[10.90,44.05]),("Soglia","i margini: a nord la pianura, a sud la Toscana — dove arrivano gli esuli",[10.45,44.27]),
        ("Vie","i sentieri che il bosco mostra o nasconde (non si mappano)",[10.70,44.12])])

A[6] = dict(
  principio=("il regno delle gare","Qui (quasi) tutto si decide con gare bellissime. Le città non si fanno guerra: gareggiano — in arte, in corse, in opere, in eloquenza. La gloria è il vero potere. Ma la rivalità può degenerare in fazione, e allora la bellezza si fa sangue.",
   ["una contesa si scioglie con una sfida pubblica","ha ragione chi fa la cosa più bella","ogni città ha un colore e un'insegna","perdere con onore vale più che vincere con inganno"]),
  classi={"Cittadini del Leone":("il popolo di Firenze: artigiani, artisti, banditori","alto, civico","leoni, lepri, istrici, upupe: orgogliosi e geniali"),
          "la Lupa e i suoi":("i fieri rivali del sud (Siena)","alto, rivale","lupi: antichi, orgogliosi, 'più antichi di Roma'"),
          "la Pantera libera":("i gelosi della libertà (Lucca)","alto, appartato","pantere: chiusi nelle loro mura, liberissimi"),
          "Gente del Mare":("marinai e mercanti (Pisa)","medio, aperto al mondo","gabbiani, cormorani, granchi: la porta sul mare")},
  corporazioni=[("le Arti","gilde di artigiani-artisti che gareggiano nelle opere",["leone","istrice"],"ogni Arte custodisce un segreto di bottega","vendono bellezza e manufatti a tutti i regni"),
    ("i Fantini","corrono i palii tra le città",["lepre"],"velocità e nervi saldi","le città rivali, che li contendono"),
    ("i Marinai-mercanti","l'unico sbocco sul mare del mondo conosciuto",["gabbiano","cormorano"],"portano sale, stoffe e notizie d'oltremare","ogni regno: dal mare arriva ciò che la terra non ha")],
  mobilita="per merito nelle gare e nelle Arti (un artigiano geniale sale); ma le fazioni cittadine pesano",
  rapporti="Firenze (Leone) vs Siena (Lupa) vs Lucca (Pantera), rivali fierissimi; Pisa (Mare) guarda fuori; alleanze che cambiano a ogni gara",
  tensione="la repubblica gloriosa rischia di spaccarsi nelle fazioni: la meta del viaggio è anche un nido di rivalità e intrighi",
  estrazione="es. una giovane lepre Fantino di Firenze, o un lupo orgoglioso di Siena",
  esempi=[("(libero)","Cittadini del Leone / la Lupa","le città offrono a Rocco e Zara alleanze e inganni, alla fine del viaggio")],
  zone=[("Cuore","Firenze — il Leone, la Repubblica",[11.26,43.77]),("Spina","le colline coltivate e le città d'arte",[11.10,43.55]),
        ("Bosco","le selve toscane interne, verso l'Appennino",[11.50,43.92]),("Orlo","la costa e il mare aperto: Pisa",[10.40,43.71]),
        ("Soglia","i confini con le rivali Siena e Lucca",[11.33,43.32]),("Vie","le strade tra le città-repubbliche, percorse dai palii",[10.95,43.62])])

# ---- DEM per le mappe a zone ----
dem=np.load("dem_elev.npy").astype(float); bnd=json.load(open("dem_bounds.json")); Z=bnd.get("z",9)
def dtx(lon): return (lon+180)/360*2**Z
def dty(lat): return (1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*2**Z
xmin=round(dtx(bnd["left"])); ymin=round(dty(bnd["top"])); Hh,Ww=dem.shape
def gpx(lon,lat): return (dtx(lon)-xmin)*256,(dty(lat)-ymin)*256
IPSO=LinearSegmentedColormap.from_list("i",[(0,"#6f9bc4"),(0.05,"#9bbd86"),(0.18,"#cfc890"),(0.4,"#b29457"),(0.7,"#8a6a44"),(1,"#f3f3f3")])
LK=[]
for e in json.load(open("cache_it/lakes.json")):
    if e.get("type")=="way" and e.get("geometry"): LK.append([(p["lon"],p["lat"]) for p in e["geometry"]])
    elif e.get("type")=="relation":
        pts=[]; 
        for m in e.get("members",[]):
            if m.get("type")=="way" and m.get("geometry"): pts+=[(p["lon"],p["lat"]) for p in m["geometry"]]
        if pts: LK.append(pts)
COL={"Cuore":"#c0392b","Spina":"#2f7d77","Bosco":"#3f7d3f","Orlo":"#8a6a44","Soglia":"#6a4c93","Vie":"#d98a2b","Rovina":"#7d5a9a"}
def zonemap(k, bbox, zones, title, path):
    W_,S_,E_,N_=bbox
    x0=int(max(0,gpx(W_,N_)[0])); x1=int(min(Ww,gpx(E_,N_)[0])); y0=int(max(0,gpx(W_,N_)[1])); y1=int(min(Hh,gpx(E_,S_)[1]))
    sub=dem[y0:y1,x0:x1]
    if sub.size==0: return
    rgb=LightSource(315,45).shade(np.clip(np.where(np.isnan(sub),0,sub),0,None),cmap=IPSO,vert_exag=2.1,dx=217,dy=217,blend_mode="soft",vmin=0,vmax=2600)
    fig,ax=plt.subplots(figsize=(8.6,8.6*sub.shape[0]/max(1,sub.shape[1])),dpi=130); ax.imshow(rgb,origin="upper",interpolation="bilinear")
    def lp(lon,lat): return gpx(lon,lat)[0]-x0,gpx(lon,lat)[1]-y0
    for pts in LK:
        if len(pts)>=3:
            xs,ys=zip(*[lp(a,b) for a,b in pts])
            if min(xs)<sub.shape[1] and max(xs)>0 and min(ys)<sub.shape[0] and max(ys)>0:
                ax.fill(xs,ys,color="#2f6fb0",zorder=3,lw=0,alpha=0.9)
    for (t,l,xy) in zones:
        cx,cy=lp(*xy)
        ax.scatter([cx],[cy],s=110,color=COL.get(t,"#333"),edgecolor="white",lw=1.3,zorder=7)
        ax.annotate(f"{t}\n{l}",(cx,cy),fontsize=7,weight="bold",color="#10160a",ha="center",
                    xytext=(0,11),textcoords="offset points",zorder=8,
                    bbox=dict(boxstyle="round,pad=0.22",fc="white",ec=COL.get(t,"#333"),alpha=0.85))
    ax.set_xlim(0,sub.shape[1]); ax.set_ylim(sub.shape[0],0); ax.set_xticks([]); ax.set_yticks([])
    ax.set_title(title,fontsize=10.5); plt.tight_layout(); plt.savefig(path,bbox_inches="tight"); plt.close()

# ---- costruisci società 2..6 ----
def build(k):
    a=A[k]; rid=str(k); fr=fau[rid]; nome=fr["nome"]; idn=IDS[k]; d=f"out_regni/{idn}"; os.makedirs(d,exist_ok=True)
    # classi: raggruppa specie del faunario per classe, con descrizione autoriale
    byclass={}
    for sp in fr["specie"]: byclass.setdefault(sp["classe"],[]).append(sp["specie"])
    classi=[]
    for cl,desc in a["classi"].items():
        classi.append(dict(nome=cl, ruolo_sociale=desc[0], rango=desc[1], come_vivono=desc[2], animali=byclass.get(cl,[])))
    soc=dict(regno=idn,
      principio_calviniano=dict(nome=a["principio"][0], idea=a["principio"][1], regole_dolci=a["principio"][2]),
      classi=classi,
      corporazioni=[dict(nome=c[0],mestiere=c[1],specie_tipiche=c[2],specialita_locale=c[3],commercia_con=[c[4]]) for c in a["corporazioni"]],
      mobilita_sociale=a["mobilita"], rapporti_tra_classi=a["rapporti"], tensione_viva=a["tensione"],
      estrazione_personaggio=a["estrazione"],
      esempi_di_estrazione=[dict(chi=e[0],classe=e[1],nota=e[2]) for e in a["esempi"]],
      zone=[dict(tipo=t,luogo=l,coord=xy) for (t,l,xy) in a["zone"]],
      ispirazione=dict(orwell="metodo: classi/mestieri animali come specchio sociale, caldo per bambini",
                       calvino="voce: realismo magico leggero, originale ma coerente"))
    json.dump(soc, open(f"{d}/societa.json","w"), ensure_ascii=False, indent=1)
    with open(f"{d}/societa.md","w") as f:
        f.write(f"# Società di {nome} — *{a['principio'][0]}*\n\n> {a['principio'][1]}\n\nUsanze:\n")
        for r in a["principio"][2]: f.write(f"- {r}\n")
        f.write("\n## Le classi (animali come ceti, metodo Orwell)\n")
        for c in classi: f.write(f"- **{c['nome']}** ({', '.join(c['animali'])}) — *{c['ruolo_sociale']}*; {c['come_vivono']}\n")
        f.write("\n## Le corporazioni (commerciano fuori → nascono i rapporti tra regni)\n")
        for c in a["corporazioni"]: f.write(f"- **{c[0]}** — {c[1]}. Specialità: {c[3]}. Commercia con: {c[4]}.\n")
        f.write(f"\n**Mobilità sociale:** {a['mobilita']}.\n\n**Rapporti tra classi:** {a['rapporti']}.\n\n**Tensione viva:** {a['tensione']}.\n\n")
        f.write(f"## Estrazione personaggio\n{a['estrazione']}\n")
        for e in a["esempi"]: f.write(f"- **{e[0]}** → *{e[1]}*: {e[2]}\n")
        f.write("\n## Zone del regno\n")
        for (t,l,xy) in a["zone"]: f.write(f"- **{t}** → {l}\n")
    zonemap(k, fau[rid].get("bbox") or {2:[9.55,45.50,11.10,46.45],3:[8.55,45.00,11.35,45.55],4:[9.20,44.30,12.00,45.12],5:[9.30,44.00,11.95,44.32],6:[9.30,43.05,11.95,44.02]}[k],
            a["zone"], f"{nome} — le zone\n{a['principio'][0]}", f"{d}/zone.png")
    return nome

for k in range(2,7):
    print("ok", build(k))

# contact sheet zone (tutti e 6)
from PIL import Image
order=["laghi_occidente","laghi_oriente","pianura_alta","pianura_bassa","selva_di_mezzo","toscana"]
ims=[Image.open(f"out_regni/{n}/zone.png").convert("RGB") for n in order]
CW=720
ims=[im.resize((CW,int(im.size[1]*CW/im.size[0]))) for im in ims]
pad=14; colw=CW+pad
rows=[max(ims[r*2].size[1],ims[r*2+1].size[1])+pad for r in range(3)]
sheet=Image.new("RGB",(2*colw+pad,sum(rows)+pad),"white"); y=pad
for r in range(3):
    x=pad
    for c in range(2): sheet.paste(ims[r*2+c],(x,y)); x+=colw
    y+=rows[r]
sheet.save("out_regni/_sei_zone.png")
print("contact sheet zone:", sheet.size)
