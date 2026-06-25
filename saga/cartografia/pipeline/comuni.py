#!/usr/bin/env python3
"""comuni — i sei regni come città-stato animali ispirate all'Italia dei Comuni.
Confini naturali (creste, il Po, lo spartiacque) tagliati per fasce di latitudine
così le grandi città cadono nel regno giusto. Capitali = grandi comuni; stemmi
medievali reali -> animali (Biscione, Leonessa, Marzocco, Lupa, Pantera, Mastino, Aquila).
Guelfi/Ghibellini = le due fazioni che fanno cambiare gli equilibri attraversando i regni."""
import json, math, itertools
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import LightSource, LinearSegmentedColormap
from matplotlib.lines import Line2D
from matplotlib.patches import Patch

dem = np.load("dem_elev.npy").astype(float)
bnd = json.load(open("dem_bounds.json")); Z = bnd.get("z", 9)
def t2lon(x): return x/2**Z*360-180
def t2lat(y): return np.degrees(np.arctan(np.sinh(np.pi-2*np.pi*y/2**Z)))
def dtx(lon): return (lon+180)/360*2**Z
def dty(lat): return (1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*2**Z
xmin = round(dtx(bnd["left"])); ymin = round(dty(bnd["top"])); H, W = dem.shape
def to_px(lon, lat): return (dtx(lon)-xmin)*256, (dty(lat)-ymin)*256
def demv(lon, lat):
    xi = int(min(max((dtx(lon)-xmin)*256, 0), W-1)); yi = int(min(max((dty(lat)-ymin)*256, 0), H-1))
    v = dem[yi, xi]; return 0.0 if (np.isnan(v) or v < -50) else float(v)
lon1d = t2lon(xmin+np.arange(W)/256.0); lat1d = t2lat(ymin+np.arange(H)/256.0)
LON = lon1d[None, :]; LAT = lat1d[:, None]; ELEV = np.nan_to_num(dem, nan=-9999)
rivers = json.load(open("cache_it/rivers.json"))
po = sorted(set((p["lon"], p["lat"]) for e in rivers if e.get("tags", {}).get("name") == "Po" for p in e.get("geometry", [])))
POLAT = np.interp(lon1d, [p[0] for p in po], [p[1] for p in po])[None, :]

# ---- regni come città-stato animali (Italia dei Comuni) ----
CUR = {
 1: dict(nome="Laghi d'Occidente", cap="Como", animale="la Lince dei laghi", governo="libero comune di lago", fazione="conteso", col="#2f7d77",
         nota="rive e monti dell'ovest: cacciatori agili, gente di lago e di bosco — il mondo di Zara"),
 2: dict(nome="Laghi d'Oriente", cap="Brescia", animale="la Leonessa", governo="libero comune", fazione="guelfo / fieramente libero", col="#6a4c93",
         nota="la Leonessa e Bergamo: città fiere, contese tra il Biscione e l'Aquila"),
 3: dict(nome="Pianura Alta", cap="Milano", animale="il Biscione (la grande Serpe)", governo="Signoria", fazione="ghibellino", col="#d9a83a",
         nota="la potenza dell'aperto: la Serpe domina la pianura e tiene più città-rovina — il mondo di Rocco"),
 4: dict(nome="Pianura Bassa", cap="Bologna", animale="la Dotta (il Gufo)", governo="comune dei saggi + Signoria dell'Aquila", fazione="guelfo vs Aquila", col="#d97a32",
         nota="oltre il Po: la città dotta e la casa dell'Aquila d'Este (Ferrara, Modena, Reggio)"),
 5: dict(nome="Selva di Mezzo", cap=None, animale="gli Antichi del Bosco", governo="nessuno: comanda la foresta", fazione="neutrale — rifugio degli esuli", col="#3f7d3f",
         nota="il cuore selvaggio: nessuna città-stato, solo una città-rovina inghiottita dal bosco"),
 6: dict(nome="Toscana", cap="Firenze", animale="il Marzocco (il Leone)", governo="Repubblica", fazione="guelfo (con rivali ghibellini)", col="#7d8a3a",
         nota="terra delle grandi rivalità: il Leone contro la Lupa (Siena) e la Pantera (Lucca), e Pisa del mare"),
}
EMBLEMI = {"Firenze": "il Leone", "Siena": "la Lupa", "Lucca": "la Pantera", "Pisa": "città del mare",
           "Brescia": "la Leonessa", "Milano": "il Biscione", "Verona": "il Mastino", "Ferrara": "l'Aquila",
           "Modena": "l'Aquila", "Bologna": "la Dotta", "Como": "la Lince", "Mantova": "la Corte"}

# ---- carve per fasce di latitudine (così le città cadono giuste) ----
sea = ELEV <= 8
border = ((LON < 9.30) & (LAT < 44.6)) | ((LON > 11.35) & (LAT > 45.0))
NORTH = LAT >= 45.50; SOUTH = LAT < 44.30
rid = np.zeros((H, W), int)
plain = (~NORTH) & (~SOUTH) & (~sea) & (~border)
rid = np.where(NORTH & (~border) & (~sea) & (LON < 9.55), 1, rid)
rid = np.where(NORTH & (~border) & (~sea) & (LON >= 9.55), 2, rid)
rid = np.where(plain & (LAT > POLAT), 3, rid)
rid = np.where(plain & (LAT <= POLAT), 4, rid)
rid = np.where(SOUTH & (~border) & (~sea) & (LAT >= 44.0), 5, rid)
rid = np.where(SOUTH & (~border) & (~sea) & (LAT < 44.0), 6, rid)
rid = np.where(sea, -1, rid); rid = np.where(rid == 0, -2, rid)
pix_km2 = (0.002747*111*math.cos(math.radians(44.7)))*(0.002747*111)
areas = {k: int((rid == k).sum()*pix_km2) for k in CUR}

def classify_pt(lon, lat):
    if demv(lon, lat) <= 8: return -1
    if (lon < 9.30 and lat < 44.6) or (lon > 11.35 and lat > 45.0): return -2
    if lat >= 45.50: return 1 if lon < 9.55 else 2
    if lat < 44.30: return 5 if lat >= 44.0 else 6
    pol = float(np.interp(lon, [p[0] for p in po], [p[1] for p in po]))
    return 3 if lat > pol else 4

places = json.load(open("cache_it/places.json"))
cities = [p for p in places if p["tags"].get("place") == "city"]
towns = [p for p in places if p["tags"].get("place") == "town"]
for p in places: p["_r"] = classify_pt(p["lon"], p["lat"])
def cityll(name):
    for p in cities+towns:
        if p["tags"].get("name") == name: return [p["lon"], p["lat"]]
    return None
def hav(a, b):
    R = 6371.0; p1, p2 = math.radians(a[1]), math.radians(b[1])
    return 2*R*math.asin(math.sqrt(math.sin(math.radians(b[1]-a[1])/2)**2+math.cos(p1)*math.cos(p2)*math.sin(math.radians(b[0]-a[0])/2)**2))

# centri per regno (per la rete interna) + capitale curata
def fps(seed, pts, n):
    ch = [seed]; cand = list(pts)
    while len(ch) < n and cand:
        far = max(cand, key=lambda p: min(hav(p, c) for c in ch)); ch.append(far); cand.remove(far)
    return ch
regni_out = {}
for k, m in CUR.items():
    cin = [[p["lon"], p["lat"]] for p in cities if p["_r"] == k]
    tin = [[p["lon"], p["lat"]] for p in towns if p["_r"] == k]
    cap_ll = cityll(m["cap"]) if m["cap"] else None
    if cap_ll is None and m["cap"] is None:  # Selva: capitale = città-rovina al centro del regno
        ys, xs = np.where(rid == k)
        cap_ll = [float(np.interp(xs.mean(), np.arange(W), lon1d)), float(np.interp(ys.mean(), np.arange(H), lat1d))] if len(xs) else None
    pool = [c for c in (cin+tin) if c != cap_ll]
    n_minor = int(min(10, max(3, round(areas[k]/1400))))
    centers = ([cap_ll] if cap_ll else []) + (fps(cap_ll, pool, n_minor) if (cap_ll and pool) else pool[:n_minor])
    centers = [c for i, c in enumerate(centers) if c not in centers[:i]]
    pc = [(c[0]*math.cos(math.radians(44.7)), c[1]) for c in centers]
    inter = []
    for i, j in itertools.combinations(range(len(centers)), 2):
        mx, my = (pc[i][0]+pc[j][0])/2, (pc[i][1]+pc[j][1])/2; r2 = ((pc[i][0]-pc[j][0])**2+(pc[i][1]-pc[j][1])**2)/4
        if all((pc[q][0]-mx)**2+(pc[q][1]-my)**2 >= r2*0.999 for q in range(len(centers)) if q not in (i, j)):
            inter.append([i, j])
    regni_out[k] = dict(m, area_km2=areas[k], capitale=({"nome": m["cap"], "ll": cap_ll} if m["cap"] else {"nome": "Città-rovina della Selva", "ll": cap_ll}),
                        n_centri=len(centers), centri=centers, rete_interna=inter)

# rete macro tra capitali
caps = [(k, regni_out[k]["capitale"]["ll"]) for k in CUR if regni_out[k]["capitale"]["ll"]]
cpl = [(c[1][0]*math.cos(math.radians(44.7)), c[1][1]) for c in caps]; macro = set()
for i, j in itertools.combinations(range(len(caps)), 2):
    mx, my = (cpl[i][0]+cpl[j][0])/2, (cpl[i][1]+cpl[j][1])/2; r2 = ((cpl[i][0]-cpl[j][0])**2+(cpl[i][1]-cpl[j][1])**2)/4
    if all((cpl[q][0]-mx)**2+(cpl[q][1]-my)**2 >= r2*0.999 for q in range(len(caps)) if q not in (i, j)): macro.add((i, j))
n = len(caps); intree = [False]*n; key = [9e9]*n; par = [-1]*n; key[0] = 0
def cd2(i, j): return (cpl[i][0]-cpl[j][0])**2+(cpl[i][1]-cpl[j][1])**2
for _ in range(n):
    u = min((q for q in range(n) if not intree[q]), key=lambda q: key[q]); intree[u] = True
    for v in range(n):
        if not intree[v] and cd2(u, v) < key[v]: key[v] = cd2(u, v); par[v] = u
for v in range(n):
    if par[v] >= 0: macro.add(tuple(sorted((v, par[v]))))

# ---- render mappa politica ----
IPSO = LinearSegmentedColormap.from_list("i", [(0, "#cdbb86"), (0.2, "#b29457"), (0.5, "#8a6a44"), (0.8, "#9a8f82"), (1, "#f3f3f3")])
rgb = LightSource(315, 45).shade(np.clip(np.where(np.isnan(dem), 0, dem), 0, None), cmap=IPSO, vert_exag=1.7, dx=217, dy=217, blend_mode="soft", vmin=0, vmax=2800)
fig, ax = plt.subplots(figsize=(11, 11*H/W), dpi=140); ax.imshow(rgb, origin="upper", interpolation="bilinear", alpha=0.5)
over = np.zeros((H, W, 4))
def h2(h): h = h.lstrip("#"); return tuple(int(h[i:i+2], 16)/255 for i in (0, 2, 4))
for k, m in CUR.items():
    r, g, b = h2(m["col"]); over[rid == k] = (r, g, b, 0.33)
ax.imshow(over, origin="upper", interpolation="nearest")
ax.contour(rid.astype(float), levels=np.arange(0.5, 6.6, 1.0), colors="#241a10", linewidths=0.8, alpha=0.8)
FAZC = {"guelfo": "#1f5fb0", "ghibellino": "#a01f1f", "neutrale": "#666"}
def faz_col(fz):
    return "#1f5fb0" if "guelf" in fz else ("#a01f1f" if "ghibellin" in fz else "#666")
for k, R in regni_out.items():
    cs = R["centri"]
    for a, b in R["rete_interna"]:
        xa, ya = to_px(*cs[a]); xb, yb = to_px(*cs[b]); ax.plot([xa, xb], [ya, yb], color=CUR[k]["col"], lw=0.9, zorder=4, alpha=0.85)
    for c in cs[1:]:
        px, py = to_px(*c); ax.scatter([px], [py], s=10, color="#2b211a", zorder=5)
for i, j in macro:
    xa, ya = to_px(*caps[i][1]); xb, yb = to_px(*caps[j][1]); ax.plot([xa, xb], [ya, yb], color="#5a1414", lw=2.2, zorder=6, alpha=0.9, solid_capstyle="round")
# emblemi delle città notevoli
for p in cities:
    nm = p["tags"].get("name")
    if nm in EMBLEMI and p["_r"] in CUR:
        px, py = to_px(p["lon"], p["lat"])
        ax.annotate(f"{nm} · {EMBLEMI[nm]}", (px, py), fontsize=6.6, color="#241208", xytext=(4, -9), textcoords="offset points", zorder=7)
# capitali
for k, R in regni_out.items():
    ll = R["capitale"]["ll"];  px, py = to_px(*ll)
    ax.scatter([px], [py], marker="*", s=320, color="#ffd21a", edgecolor=faz_col(CUR[k]["fazione"]), lw=2.0, zorder=8)
# nomi regno + animale al centroide
for k in CUR:
    ys, xs = np.where(rid == k)
    if len(xs) == 0: continue
    ax.annotate(f"{CUR[k]['nome']}\n{CUR[k]['animale']}\n~{areas[k]:,} km²", (xs.mean(), ys.mean()), ha="center", va="center",
                fontsize=8.0, weight="bold", color="#10160a", zorder=9, bbox=dict(boxstyle="round,pad=0.3", fc="white", ec=CUR[k]["col"], alpha=0.82))
ax.set_xlim(0, W); ax.set_ylim(H, 0); ax.set_xticks([]); ax.set_yticks([])
ax.set_title("I sei regni come città-stato animali — l'Italia dei Comuni reinterpretata\n"
             "★ capitale (bordo = fazione) · Guelfi (blu) vs Ghibellini (rosso) · linee scure = vie tra capitali", fontsize=11)
ax.legend(handles=[Line2D([0], [0], marker="*", color="w", markerfacecolor="#ffd21a", markeredgecolor="#1f5fb0", markersize=15, label="capitale guelfa"),
                   Line2D([0], [0], marker="*", color="w", markerfacecolor="#ffd21a", markeredgecolor="#a01f1f", markersize=15, label="capitale ghibellina"),
                   Line2D([0], [0], marker="*", color="w", markerfacecolor="#ffd21a", markeredgecolor="#666", markersize=15, label="neutrale (la Selva)"),
                   Line2D([0], [0], color="#5a1414", lw=2.2, label="vie tra capitali")], loc="lower left", fontsize=7.6, framealpha=0.93)
plt.tight_layout(); plt.savefig("out_zones/regni_comuni.png", bbox_inches="tight"); plt.close()

# ---- export ----
json.dump({"regni": {str(k): regni_out[k] for k in CUR}, "emblemi": EMBLEMI,
           "fazioni": {"guelfi": "partito papale", "ghibellini": "partito imperiale"}},
          open("out_zones/atlante_politico.json", "w"), ensure_ascii=False, indent=1)
with open("out_zones/atlante_politico.md", "w") as f:
    f.write("# Atlante politico — i sei regni animali (Italia dei Comuni)\n\n")
    f.write("Confini naturali; capitali = grandi comuni; stemmi medievali → animali. ")
    f.write("Le due fazioni **Guelfi** (papali) e **Ghibellini** (imperiali) attraversano i regni: passando da una terra all'altra cambiano alleanze ed equilibri.\n\n")
    ruolo = {1: "partenza: i monti-lago dove si incontrano Rocco e Zara", 3: "il grande aperto sotto la Serpe (Rocco)",
             4: "il Po da guadare; la città dotta e l'Aquila", 5: "il cuore selvaggio: ruderi e Antichi del bosco (neutrale)",
             2: "le città fiere e libere dei laghi d'oriente", 6: "le grandi rivalità: Leone, Lupa, Pantera"}
    for k in CUR:
        R = regni_out[k]
        f.write(f"## {k} · {CUR[k]['nome']} — {CUR[k]['animale']}\n")
        f.write(f"- capitale: **{R['capitale']['nome']}**  ·  governo: {CUR[k]['governo']}  ·  fazione: {CUR[k]['fazione']}\n")
        f.write(f"- ~{areas[k]:,} km² · {R['n_centri']} centri\n")
        emb = [f"{nm} ({EMBLEMI[nm]})" for nm in EMBLEMI if cityll(nm) and classify_pt(*cityll(nm)) == k and nm != CUR[k]['cap']]
        if emb: f.write(f"- città notevoli: {', '.join(emb)}\n")
        f.write(f"- carattere: {CUR[k]['nota']}\n")
        f.write(f"- ruolo nel viaggio: {ruolo.get(k,'-')}\n\n")
print("REGNI ANIMALI:")
for k in CUR:
    print(f"  {k} {CUR[k]['nome']:20} cap={regni_out[k]['capitale']['nome']:24} {CUR[k]['animale']:26} [{CUR[k]['fazione']}]")
print("-> out_zones/regni_comuni.png , atlante_politico.json/md")
