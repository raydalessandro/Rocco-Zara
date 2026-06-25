#!/usr/bin/env python3
"""realm_build — costruisce il PRIMO regno (Laghi d'Occidente) come modello standard.
Dall'archetipo del leader (la Lince) discende a cascata: governo -> popolazione ->
cultura/feste -> morale -> estetica. Esporta lo schema JSON riusabile, l'istanza
machine-readable (per script di prompt testo/immagini), la versione narrativa e la mappa."""
import json, math, os
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import LightSource, LinearSegmentedColormap
from matplotlib.lines import Line2D

OUT = "out_regni/laghi_occidente"; os.makedirs(OUT, exist_ok=True)
os.makedirs("out_regni/_schema", exist_ok=True)
pol = json.load(open("out_zones/atlante_politico.json"))
R = pol["regni"]["1"]                      # geo del regno 1 (capitale, centri, rete)

# ---------------- contenuto autoriale: la cascata dall'archetipo ----------------
regno = {
  "id": "laghi_occidente",
  "nome": "Laghi d'Occidente",
  "bbox": [8.44, 45.50, 9.55, 46.56],
  "area_km2": R["area_km2"],
  "capitale": {"nome": "Como", "coord": R["capitale"]["ll"], "nota": "città di lago; un tempo grande, ora metà viva metà rovina"},
  "leader": {
     "archetipo": "la Lince",
     "tratti": ["solitaria", "vigile", "agile", "indipendente", "vede nel buio"],
     "titolo": "i Custodi (le linci che vegliano su ogni comunità)"
  },
  "governo": {
     "forma": "confederazione di comunità libere",
     "tipo": "non-piramidale (consiglio di pari)",
     "come_si_decide": "ogni comunità manda il suo Custode al Consiglio del Lago; si decide insieme, a voce uguale",
     "spiegazione_bambini": "Qui non c'è un re. I villaggi mandano una guida al Consiglio e decidono tutti insieme.",
     "tensione": "la confederazione è fragile: la Serpe (Milano) preme da sud e vorrebbe inghiottirla"
  },
  "fazione": "conteso — oscilla, ma teme e resiste alla Serpe",
  "popolazione": {
     "gruppi": [
        {"nome": "i Custodi", "ruolo": "guardiani e consiglieri", "animali": ["lince"]},
        {"nome": "la Gente delle Rive", "ruolo": "pescatori, traghettatori, mercanti dei laghi", "animali": ["lontra", "airone", "martin pescatore", "rana"]},
        {"nome": "il Popolo del Bosco", "ruolo": "cacciatori, raccoglitori, custodi degli alberi", "animali": ["cervo", "volpe", "tasso", "scoiattolo", "tigre (rara, forestiera)"]},
        {"nome": "le Sentinelle d'Altura", "ruolo": "vedette dei valichi verso il Muro delle Alpi", "animali": ["camoscio", "stambecco", "aquila", "marmotta"]}
     ],
     "valori": ["libertà", "autosufficienza", "ospitalità prudente", "diffidenza verso i grandi poteri"]
  },
  "centri": [{"nome": "Como (capitale)", "coord": R["capitale"]["ll"], "ruolo": "Consiglio del Lago"}]
            + [{"nome": f"centro {i+1}", "coord": c, "ruolo": "comunità di riva o di bosco"} for i, c in enumerate(R["centri"][1:])],
  "rete_interna": R["rete_interna"],
  "cultura": {
     "motto": "Liberi come le rive",
     "tradizioni": [
        "il Passaggio del Custode: un giovane diventa guida superando la prova del crinale (sale al valico e torna)",
        "il diritto d'asilo: chi arriva in pace trova riparo, ma deve dire il proprio nome al Consiglio"
     ],
     "feste": [
        {"nome": "la Notte dei Fuochi sulle Rive", "quando": "al voltare dell'autunno",
         "cosa": "ogni comunità accende un fuoco sulla propria sponda; l'anello di fuochi attorno al lago",
         "morale": "uniti si resta liberi: finché i fuochi sono tanti, nessuno ci inghiotte"}
     ]
  },
  "morale_bambini": "una comunità può governarsi da sola, decidendo insieme — e resta libera se sta unita",
  "estetica": {
     "palette": ["blu lago", "verde bosco profondo", "grigio roccia", "fulvo maculato della lince", "oro dei fuochi al crepuscolo"],
     "atmosfera": "mattine di nebbia sui laghi, boschi fitti, valichi alti; di sera fuochi sulle sponde",
     "prompt_immagine_base": "Illustrazione per libro per bambini, acquerello caldo. Un regno di laghi alpini e boschi fitti tra montagne grigie; sponde con piccoli villaggi di animali; una lince vigile su una roccia; al crepuscolo fuochi accesi lungo le rive che si specchiano nell'acqua. Niente esseri umani, niente costruzioni moderne; eventuali rovine antiche coperte di muschio e rampicanti. Palette: blu lago, verde bosco, grigio roccia, oro del fuoco."
  },
  "prompt_scrittura_base": "I Laghi d'Occidente: una confederazione di comunità libere di lago e di bosco, vegliata dai Custodi (linci), senza re, che decide al Consiglio del Lago. Gente indipendente e diffidente verso i grandi poteri, soprattutto la Serpe della pianura che preme da sud. Tono adatto a un bambino di 5 anni letto col genitore, ma con dinamiche di potere reali leggibili anche da adulti.",
  "ruolo_nel_viaggio": "partenza della saga: i monti-lago dove vive Zara e dove incontra Rocco, salito dalla pianura della Serpe",
  "personaggi_legati": [
     {"nome": "Zara", "specie": "tigre (giovane, forestiera)", "note": "del Popolo del Bosco; piccola e giovane, vuole correre e dimostrare il proprio valore; i Custodi la trattano ancora da cucciola"},
     {"nome": "Rocco", "specie": "rinoceronte", "note": "non di qui: viene dalla Pianura Alta (la Serpe); arriva al confine dei laghi e incontra Zara"}
  ]
}
json.dump(regno, open(f"{OUT}/regno.json", "w"), ensure_ascii=False, indent=1)

# ---------------- schema riusabile (il "modello standard del regno") ----------------
schema = {
  "$descrizione": "Modello standard di un REGNO. Ogni regno segue questo schema. Campi consumati da script per generare prompt di SCRITTURA e di IMMAGINI. Il cascade parte da leader.archetipo.",
  "id": "slug", "nome": "str", "bbox": "[W,S,E,N]", "area_km2": "int",
  "capitale": {"nome": "str", "coord": "[lon,lat]", "nota": "str"},
  "leader": {"archetipo": "animale", "tratti": ["..."], "titolo": "come viene chiamato chi guida"},
  "governo": {"forma": "str", "tipo": "piramidale | aristocrazia | democrazia | confederazione | repubblica | nessuno",
              "come_si_decide": "str", "spiegazione_bambini": "1 frase semplice", "tensione": "il conflitto interno/esterno"},
  "fazione": "guelfo | ghibellino | conteso | neutrale",
  "popolazione": {"gruppi": [{"nome": "str", "ruolo": "str", "animali": ["..."]}], "valori": ["..."]},
  "centri": [{"nome": "str", "coord": "[lon,lat]", "ruolo": "str"}],
  "rete_interna": "[[i,j], ...] indici nei centri",
  "cultura": {"motto": "str", "tradizioni": ["..."], "feste": [{"nome": "str", "quando": "str", "cosa": "str", "morale": "str"}]},
  "morale_bambini": "la lezione semplice del regno (1 frase)",
  "estetica": {"palette": ["..."], "atmosfera": "str", "prompt_immagine_base": "prompt pronto per generatore immagini"},
  "prompt_scrittura_base": "prompt pronto per generare testo coerente col canone",
  "ruolo_nel_viaggio": "str",
  "personaggi_legati": [{"nome": "str", "specie": "str", "note": "str"}]
}
json.dump(schema, open("out_regni/_schema/regno.schema.json", "w"), ensure_ascii=False, indent=1)

# ---------------- versione narrativa ----------------
with open(f"{OUT}/regno.md", "w") as f:
    f.write(f"# {regno['nome']} — {regno['leader']['archetipo']}\n\n")
    f.write(f"*{regno['cultura']['motto']}* · capitale **{regno['capitale']['nome']}** · ~{regno['area_km2']:,} km² · fazione: {regno['fazione']}\n\n")
    f.write("## Il leader e il governo\n")
    f.write(f"Guida il regno l'archetipo de **{regno['leader']['archetipo']}** ({', '.join(regno['leader']['tratti'])}). ")
    f.write(f"Ma la lince è solitaria: non nasce un re, bensì una **{regno['governo']['forma']}** ({regno['governo']['tipo']}). ")
    f.write(f"{regno['governo']['come_si_decide'].capitalize()}.\n\n")
    f.write(f"> Per i bambini: {regno['governo']['spiegazione_bambini']}\n\n")
    f.write(f"Tensione: {regno['governo']['tensione']}.\n\n")
    f.write("## La popolazione (a cascata dall'archetipo)\n")
    for g in regno["popolazione"]["gruppi"]:
        f.write(f"- **{g['nome']}** — {g['ruolo']} ({', '.join(g['animali'])})\n")
    f.write(f"\nValori: {', '.join(regno['popolazione']['valori'])}.\n\n")
    f.write("## Cultura\n")
    for t in regno["cultura"]["tradizioni"]: f.write(f"- {t}\n")
    for fe in regno["cultura"]["feste"]:
        f.write(f"- **{fe['nome']}** ({fe['quando']}): {fe['cosa']}. → *{fe['morale']}*\n")
    f.write(f"\n**Morale per i bambini:** {regno['morale_bambini']}\n\n")
    f.write(f"**Ruolo nel viaggio:** {regno['ruolo_nel_viaggio']}\n\n")
    f.write("## Personaggi legati\n")
    for p in regno["personaggi_legati"]:
        f.write(f"- **{p['nome']}** ({p['specie']}): {p['note']}\n")

# ---------------- mappa di dettaglio del regno (base-immagine) ----------------
dem = np.load("dem_elev.npy").astype(float); bnd = json.load(open("dem_bounds.json")); Z = bnd.get("z", 9)
def dtx(lon): return (lon+180)/360*2**Z
def dty(lat): return (1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*2**Z
xmin = round(dtx(bnd["left"])); ymin = round(dty(bnd["top"])); H, Wd = dem.shape
def px(lon, lat): return (dtx(lon)-xmin)*256, (dty(lat)-ymin)*256
W_, S_, E_, N_ = regno["bbox"]
x0, x1 = int(max(0, px(W_, N_)[0])), int(min(Wd, px(E_, N_)[0]))
y0, y1 = int(max(0, px(W_, N_)[1])), int(min(H, px(W_, S_)[1]))
sub = dem[y0:y1, x0:x1]
IPSO = LinearSegmentedColormap.from_list("i", [(0, "#6f9bc4"), (0.05, "#9bbd86"), (0.18, "#cfc890"),
                                               (0.4, "#b29457"), (0.7, "#8a6a44"), (1, "#f3f3f3")])
filled = np.clip(np.where(np.isnan(sub), 0, sub), 0, None)
rgb = LightSource(315, 45).shade(filled, cmap=IPSO, vert_exag=2.2, dx=217, dy=217, blend_mode="soft", vmin=0, vmax=2600)
fig, ax = plt.subplots(figsize=(9, 9*sub.shape[0]/sub.shape[1]), dpi=140)
ax.imshow(rgb, origin="upper", interpolation="bilinear")
def lpx(lon, lat): return px(lon, lat)[0]-x0, px(lon, lat)[1]-y0
# laghi
for el in json.load(open("cache_it/lakes.json")):
    pts = []
    if el.get("type") == "way" and el.get("geometry"): pts = [(p["lon"], p["lat"]) for p in el["geometry"]]
    elif el.get("type") == "relation":
        for m in el.get("members", []):
            if m.get("type") == "way" and m.get("geometry"): pts += [(p["lon"], p["lat"]) for p in m["geometry"]]
    if len(pts) >= 3:
        xs, ys = zip(*[lpx(a, b) for a, b in pts]); ax.fill(xs, ys, color="#2f6fb0", zorder=3, lw=0, alpha=0.9)
# rete interna + centri
cs = R["centri"]
for a, b in R["rete_interna"]:
    xa, ya = lpx(*cs[a]); xb, yb = lpx(*cs[b]); ax.plot([xa, xb], [ya, yb], color="#2f7d77", lw=1.4, zorder=4, alpha=0.85)
for c in cs[1:]:
    cx, cy = lpx(*c); ax.scatter([cx], [cy], s=22, color="#2b211a", zorder=5)
capx, capy = lpx(*R["capitale"]["ll"])
ax.scatter([capx], [capy], marker="*", s=320, color="#ffd21a", edgecolor="#2f7d77", lw=1.8, zorder=7)
ax.annotate(f"Como · il Consiglio del Lago", (capx, capy), fontsize=9, weight="bold", color="#10160a",
            xytext=(7, 3), textcoords="offset points", zorder=8)
ax.set_xlim(0, sub.shape[1]); ax.set_ylim(sub.shape[0], 0); ax.set_xticks([]); ax.set_yticks([])
ax.set_title("Laghi d'Occidente — la Lince · confederazione del Consiglio del Lago\n(mappa di dettaglio, base per le illustrazioni)", fontsize=11)
plt.tight_layout(); plt.savefig(f"{OUT}/mappa.png", bbox_inches="tight"); plt.close()
print("regno scritto:", OUT)
print(" - regno.json (istanza), regno.md (narrativa), mappa.png")
print(" - schema: out_regni/_schema/regno.schema.json")
print(f" centri: {len(cs)}  capitale: Como  fazione: {regno['fazione']}")
