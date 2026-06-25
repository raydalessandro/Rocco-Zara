#!/usr/bin/env python3
"""kingdom — divide il corridoio in quadranti (= terre del regno), caratterizza
ciascuno dai dati reali (quota, terreno, acque, citta-rovina) e ne deriva
un'identita'-seme (popolo, potere, tradizioni, palette). Rende la mappa del regno
e l'atlante (json + md). I dati di dettaglio per ogni terra li fa poi zonegen."""
import json, math
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import LightSource, LinearSegmentedColormap

# ---- corridoio + griglia ----
W, S, E, N = 8.80, 43.10, 11.70, 46.25
COLS, ROWS = 5, 5
COLNAMES = ["A", "B", "C", "D", "E"]

dem = np.load("dem_elev.npy").astype(float)
bnd = json.load(open("dem_bounds.json"))
Z = bnd.get("z", 9)
def dtx(lon): return (lon+180)/360*2**Z
def dty(lat): return (1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*2**Z
xmin = round(dtx(bnd["left"])); ymin = round(dty(bnd["top"]))
H, Wd = dem.shape
def to_px(lon, lat): return (dtx(lon)-xmin)*256, (dty(lat)-ymin)*256

lakes = json.load(open("cache_it/lakes.json"))
rivers = json.load(open("cache_it/rivers.json"))
places = json.load(open("cache_it/places.json"))

def lake_name(el):
    return el.get("tags", {}).get("name", "")
def lake_points(el):
    pts = []
    if el.get("type") == "way" and el.get("geometry"):
        pts = [(p["lon"], p["lat"]) for p in el["geometry"]]
    elif el.get("type") == "relation":
        for m in el.get("members", []):
            if m.get("type") == "way" and m.get("geometry"):
                pts += [(p["lon"], p["lat"]) for p in m["geometry"]]
    return pts
LAKES = [(lake_name(e), lake_points(e)) for e in lakes if lake_name(e)]
RIVERS = [(e.get("tags", {}).get("name", ""), [(p["lon"], p["lat"]) for p in e.get("geometry", [])])
          for e in rivers if e.get("tags", {}).get("name")]

# ---- identita'-seme per tipo di terreno (bozza, da sviluppare) ----
SEED = {
 "pianura": dict(popolo="grandi pascolatori e branchi di pianura (l'aperto di Rocco)",
                 potere="le mandrie e l'assemblea dei guadi: comanda chi tiene i passaggi sui fiumi",
                 tradizioni="la grande migrazione stagionale; mercati e tregue ai guadi del Po",
                 palette="oro, ocra, verde secco, azzurro dei fiumi"),
 "colli-piede": dict(popolo="popoli misti di confine: sentinelle e mercanti tra monte e piano",
                 potere="chi controlla i valichi e le colline morainiche detta lo scambio",
                 tradizioni="fuochi sulle alture all'equinozio; fiere del passaggio",
                 palette="verde colle, pietra chiara, vigna e bruno"),
 "lago": dict(popolo="genti di riva: pescatori, traghettatori, uccelli d'acqua",
                 potere="equilibrio fragile tra le sponde; il lago e' frontiera e ponte",
                 tradizioni="feste del lago, lanterne sull'acqua, il patto delle due rive",
                 palette="blu lago, argento, verde umido, roccia"),
 "media-montagna": dict(popolo="solitari d'altura: felini, camosci, rapaci (i monti di Zara)",
                 potere="clan delle vette, territori d'altura difesi a vista",
                 tradizioni="riti delle cime, richiami ed echi, la prova del crinale",
                 palette="grigio roccia, neve, bosco scuro, cielo teso"),
 "alta-quota": dict(popolo="quasi nessuno: terra di nessuno, leggende e gelo",
                 potere="nessun signore: vince la montagna stessa",
                 tradizioni="tabu' e racconti del freddo; il confine che non si varca",
                 palette="bianco, ghiaccio, ombra blu, pietra nuda"),
 "appennino-bosco": dict(popolo="creature della foresta fitta, schive e antiche",
                 potere="comanda la foresta: gli Antichi del bosco, sentieri segreti",
                 tradizioni="feste della folta, l'ombra che protegge, i passi nascosti",
                 palette="verde profondo, muschio, bruno, luce a chiazze"),
}
BAND = {"alta-quota": "#eef2f5", "media-montagna": "#caa46a", "appennino-bosco": "#2f6b3a",
        "colli-piede": "#cdbf86", "lago": "#3f86c8", "pianura": "#dcd08e"}

def cell_stats(cw, cs, ce, cn):
    # subarray DEM
    x0 = int(max(0, (dtx(cw)-xmin)*256)); x1 = int(min(Wd, (dtx(ce)-xmin)*256))
    y0 = int(max(0, (dty(cn)-ymin)*256)); y1 = int(min(H, (dty(cs)-ymin)*256))
    sub = dem[y0:y1, x0:x1]
    v = sub[~np.isnan(sub)]
    v = v[v > -50]
    if v.size == 0: return None
    return dict(mn=int(v.min()), me=int(v.mean()), mx=int(v.max()))

def in_cell(lon, lat, cw, cs, ce, cn): return cw <= lon < ce and cs <= lat < cn

def classify(me, mx, latc, lakefrac):
    if lakefrac > 0.10: return "lago"
    if me >= 1400: return "alta-quota"
    if me >= 650:  return "media-montagna" if latc > 44.7 else "appennino-bosco"
    if me >= 300:  return "appennino-bosco" if latc < 44.5 else "colli-piede"
    return "pianura"

dlon = (E-W)/COLS; dlat = (N-S)/ROWS
atlas = []
for r in range(ROWS):           # r=0 -> nord
    for c in range(COLS):
        cw = W+c*dlon; ce = cw+dlon
        cn = N-r*dlat; cs = cn-dlat
        code = f"{COLNAMES[c]}{r+1}"
        latc, lonc = (cs+cn)/2, (cw+ce)/2
        st = cell_stats(cw, cs, ce, cn)
        if not st: st = dict(mn=0, me=0, mx=0)
        # laghi nel quadrante
        lk = []; lakefrac = 0.0
        for nm, pts in LAKES:
            sp = pts[::3]
            inside = sum(1 for x, y in sp if in_cell(x, y, cw, cs, ce, cn))
            if inside >= 15:                       # il lago e' DAVVERO in questo quadrante
                lk.append(nm); lakefrac = max(lakefrac, inside/max(1, len(sp)))
        lk = sorted(set(lk))
        # fiumi
        rv = sorted({nm for nm, pts in RIVERS if sum(1 for x, y in pts if in_cell(x, y, cw, cs, ce, cn)) >= 3})
        # citta-rovina (rank city>town)
        pls = [p for p in places if in_cell(p["lon"], p["lat"], cw, cs, ce, cn)]
        pls.sort(key=lambda p: (p["tags"].get("place") == "city", p["tags"].get("name", "")), reverse=True)
        ruins = [p["tags"].get("name", "?") for p in pls[:3]]
        terr = classify(st["me"], st["mx"], latc, lakefrac)
        # ambito: regno (fascia abitata) vs confini naturali
        if st["me"] <= 8:
            ambito, border = "mare", "il Mare — bordo sud-ovest del mondo"
        elif lonc < 9.45 and latc < 44.75:
            ambito, border = "confine-ovest", "le Terre Liguri — frontiera ovest"
        elif lonc > 11.25 and latc > 44.9:
            ambito, border = "marche-est", "le Marche dell'Est — oltre il Garda"
        elif terr == "alta-quota" and latc > 45.45:
            ambito, border = "muro-alpi", "il Muro delle Alpi — frontiera nord"
        else:
            ambito, border = "regno", None
        seed = SEED[terr]
        rec = dict(code=code, bbox=[round(cw, 3), round(cs, 3), round(ce, 3), round(cn, 3)],
                   centro=[round(lonc, 4), round(latc, 4)], terreno=terr, ambito=ambito,
                   quota=st, laghi=lk, fiumi=rv, citta_rovina=ruins)
        if ambito == "regno":
            rec.update(popolo=seed["popolo"], potere=seed["potere"],
                       tradizioni=seed["tradizioni"], palette=seed["palette"])
        else:
            rec.update(popolo="—", potere="—", tradizioni=border, palette="—", confine=border)
        atlas.append(rec)

# ---- render mappa del regno ----
IPSO = LinearSegmentedColormap.from_list("ipso", [
    (0.00, "#8db478"), (0.06, "#a8c07f"), (0.14, "#cdc77f"),
    (0.32, "#ab8a40"), (0.58, "#7d5a32"), (0.82, "#8a7d70"), (1.00, "#f3f3f3")])
filled = np.clip(np.where(np.isnan(dem), np.nanmin(dem), dem), 0, None)
ls = LightSource(315, 45)
rgb = ls.shade(filled, cmap=IPSO, vert_exag=2.0, dx=217, dy=217, blend_mode="soft", vmin=0, vmax=2800)
fig, ax = plt.subplots(figsize=(11, 11*H/Wd), dpi=140)
ax.imshow(rgb, origin="upper", interpolation="bilinear", alpha=0.78)

# tinta di banda + griglia + etichette
for a in atlas:
    cw, cs, ce, cn = a["bbox"]
    xs = [to_px(cw, cn)[0], to_px(ce, cn)[0], to_px(ce, cs)[0], to_px(cw, cs)[0]]
    ys = [to_px(cw, cn)[1], to_px(ce, cn)[1], to_px(ce, cs)[1], to_px(cw, cs)[1]]
    is_realm = a["ambito"] == "regno"
    col = BAND[a["terreno"]] if is_realm else "#9a9a9a"
    ax.fill(xs, ys, color=col, alpha=0.24 if is_realm else 0.42, zorder=2, lw=0)
    ax.plot(xs+[xs[0]], ys+[ys[0]], color="#2b211a", lw=1.1 if is_realm else 0.7,
            zorder=3, alpha=0.8 if is_realm else 0.45,
            ls="-" if is_realm else (0, (4, 3)))
    px, py = to_px((cw+ce)/2, (cs+cn)/2)
    ax.annotate(a["code"], (px, py), ha="center", va="center", fontsize=13, weight="bold",
                color="#1a1206" if is_realm else "#555", zorder=5,
                bbox=dict(boxstyle="circle,pad=0.25", fc="white" if is_realm else "#e3e3e3",
                          ec="#1a1206" if is_realm else "#777", alpha=0.82))
    if is_realm:
        ax.annotate(f"{a['terreno']}\n{a['quota']['me']} m", (px, py), ha="center", va="top",
                    fontsize=6.6, color="#241a10", zorder=5, xytext=(0, -14), textcoords="offset points")
    else:
        bw = {"mare": "MARE", "confine-ovest": "Liguria", "marche-est": "Est", "muro-alpi": "ALPI"}[a["ambito"]]
        ax.annotate(bw, (px, py), ha="center", va="top", fontsize=7, style="italic",
                    color="#444", zorder=5, xytext=(0, -14), textcoords="offset points")

# laghi blu + Po per orientarsi
for nm, pts in LAKES:
    if len(pts) >= 3:
        xs, ys = zip(*[to_px(x, y) for x, y in pts]); ax.fill(xs, ys, color="#2f6fb0", zorder=4, lw=0, alpha=0.9)
for nm, pts in RIVERS:
    if nm == "Po" and len(pts) >= 2:
        xs, ys = zip(*[to_px(x, y) for x, y in pts]); ax.plot(xs, ys, color="#1f5fb0", lw=2.2, zorder=4)

ax.set_xlim(0, Wd); ax.set_ylim(H, 0); ax.set_xticks([]); ax.set_yticks([])
ax.set_title("Le terre del regno \u2014 corridoio Prealpi \u2192 Toscana (griglia 5\u00d75)\n"
             "ogni quadrante = una terra: terreno reale \u2192 popolo, potere, tradizioni", fontsize=11)
plt.tight_layout(); plt.savefig("out_zones/regno.png", bbox_inches="tight"); plt.close()

# ---- atlante json + md ----
json.dump({"griglia": {"bbox": [W, S, E, N], "cols": COLS, "rows": ROWS, "colnames": COLNAMES},
           "terre": atlas}, open("out_zones/atlante.json", "w"), ensure_ascii=False, indent=1)

with open("out_zones/atlante.md", "w") as f:
    f.write("# Atlante delle terre — Rocco & Zara\n\n")
    f.write("Corridoio Prealpi → Toscana, griglia 5×5 (colonne A–E da ovest, righe 1–5 da nord).\n")
    f.write("Terreno e quota sono **reali** (DEM+OSM). Popolo/potere/tradizioni sono **semi** da sviluppare.\n")
    f.write("Il dettaglio cartografico di ogni terra si genera con `zonegen.py CODICE Wbbox`.\n\n")
    for r in range(ROWS):
        for c in range(COLS):
            a = atlas[r*COLS+c]
            if a["ambito"] != "regno":
                f.write(f"## {a['code']} — [confine] {a.get('confine','')}  ({a['quota']['me']} m)\n")
                if a["laghi"]: f.write(f"- acque: {', '.join(a['laghi'])}\n")
                f.write(f"- ambito: **{a['ambito']}** (fuori dalla fascia abitata; bordo del mondo)\n\n")
                continue
            f.write(f"## {a['code']} — {a['terreno']}  ({a['quota']['me']} m; {a['quota']['mn']}–{a['quota']['mx']} m)\n")
            f.write(f"- bbox: `{a['bbox']}`  ·  centro: `{a['centro']}`\n")
            if a["laghi"]: f.write(f"- acque: {', '.join(a['laghi'])}\n")
            if a["fiumi"]: f.write(f"- fiumi: {', '.join(a['fiumi'])}\n")
            if a["citta_rovina"]: f.write(f"- città→rovina: {', '.join(a['citta_rovina'])}\n")
            f.write(f"- **popolo**: {a['popolo']}\n- **potere**: {a['potere']}\n")
            f.write(f"- **tradizioni**: {a['tradizioni']}\n- **palette**: {a['palette']}\n\n")

# riepilogo a video
print("REGNO 5x5 — sintesi terre:")
print(f"{'cod':4}{'terreno':18}{'quota_m':9}{'acque/rovine'}")
for a in atlas:
    extra = (a["laghi"][0] if a["laghi"] else "") or (a["citta_rovina"][0] if a["citta_rovina"] else "")
    print(f"{a['code']:4}{a['terreno']:18}{a['quota']['me']:<9}{extra}")
print("\n-> out_zones/regno.png , atlante.json , atlante.md")
