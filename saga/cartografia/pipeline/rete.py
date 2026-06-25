#!/usr/bin/env python3
"""rete — la rete urbana del regno: nodi = citta-rovina, archi = le Vie Antiche
che le collegano (grafo di Gabriel + albero minimo per connessione). Ogni via ha
distanza reale e tipo (pianura / collina / valico di montagna, dal DEM)."""
import json, math, itertools
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import LightSource, LinearSegmentedColormap
from matplotlib.lines import Line2D

dem = np.load("dem_elev.npy").astype(float)
bnd = json.load(open("dem_bounds.json")); Z = bnd.get("z", 9)
def dtx(lon): return (lon+180)/360*2**Z
def dty(lat): return (1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*2**Z
xmin = round(dtx(bnd["left"])); ymin = round(dty(bnd["top"]))
H, Wd = dem.shape
def to_px(lon, lat): return (dtx(lon)-xmin)*256, (dty(lat)-ymin)*256
def demv(lon, lat):
    xi = int(min(max((dtx(lon)-xmin)*256, 0), Wd-1)); yi = int(min(max((dty(lat)-ymin)*256, 0), H-1))
    v = dem[yi, xi]; return None if (np.isnan(v) or v < -50) else float(v)

atl = json.load(open("out_zones/atlante.json"))
cells = atl["terre"]
def cell_of(lon, lat):
    for a in cells:
        w, s, e, n = a["bbox"]
        if w <= lon < e and s <= lat < n: return a
    return None

places = json.load(open("cache_it/places.json"))
cities = [p for p in places if p["tags"].get("place") == "city"]
nodes = []
for p in cities:
    a = cell_of(p["lon"], p["lat"])
    nodes.append(dict(name=p["tags"].get("name", "?"), lon=p["lon"], lat=p["lat"],
                      cell=a["code"] if a else "-", realm=(a["ambito"] == "regno") if a else False))
print(f"citta-rovina (nodi): {len(nodes)}")

mlat = sum(n["lat"] for n in nodes)/len(nodes)
def planar(n): return (n["lon"]*math.cos(math.radians(mlat)), n["lat"])
def hav(a, b):
    R = 6371.0; p1, p2 = math.radians(a["lat"]), math.radians(b["lat"])
    return 2*R*math.asin(math.sqrt(math.sin(math.radians(b["lat"]-a["lat"])/2)**2 +
                                   math.cos(p1)*math.cos(p2)*math.sin(math.radians(b["lon"]-a["lon"])/2)**2))

P = [planar(n) for n in nodes]
def d2(i, j): return (P[i][0]-P[j][0])**2 + (P[i][1]-P[j][1])**2

# --- grafo di Gabriel ---
gab = set()
for i, j in itertools.combinations(range(len(nodes)), 2):
    dij = d2(i, j)
    if dij == 0: continue
    cx, cy = (P[i][0]+P[j][0])/2, (P[i][1]+P[j][1])/2
    r2 = dij/4
    if all((P[k][0]-cx)**2 + (P[k][1]-cy)**2 >= r2*0.999 for k in range(len(nodes)) if k not in (i, j)):
        gab.add((i, j))
# --- albero minimo (Prim) per garantire connessione ---
INF = float("inf"); n = len(nodes)
intree = [False]*n; key = [INF]*n; par = [-1]*n; key[0] = 0
for _ in range(n):
    u = min((k for k in range(n) if not intree[k]), key=lambda k: key[k])
    intree[u] = True
    for v in range(n):
        if not intree[v] and d2(u, v) < key[v]: key[v] = d2(u, v); par[v] = u
for v in range(n):
    if par[v] >= 0: gab.add(tuple(sorted((v, par[v]))))

# --- archi: distanza + tipo (DEM lungo la via) ---
def route_profile(a, b):
    K = max(8, int(hav(a, b)))
    elv = [demv(a["lon"]+(b["lon"]-a["lon"])*t/K, a["lat"]+(b["lat"]-a["lat"])*t/K) for t in range(K+1)]
    elv = [e for e in elv if e is not None]
    return (max(elv) if elv else 0)
edges = []
for i, j in gab:
    a, b = nodes[i], nodes[j]
    dist = hav(a, b); emax = route_profile(a, b)
    typ = "pianura" if emax < 400 else ("collina" if emax < 900 else "valico")
    edges.append(dict(a=a["name"], b=b["name"], i=i, j=j, km=round(dist, 1), emax=int(emax), tipo=typ))
print(f"vie (archi): {len(edges)}  ", {t: sum(1 for e in edges if e['tipo'] == t) for t in ('pianura', 'collina', 'valico')})

# --- render ---
IPSO = LinearSegmentedColormap.from_list("i", [(0, "#9bbd86"), (0.14, "#cfc890"), (0.34, "#b29457"),
                                               (0.6, "#8a6a44"), (0.85, "#9a8f82"), (1, "#f3f3f3")])
filled = np.clip(np.where(np.isnan(dem), np.nanmin(dem), dem), 0, None)
rgb = LightSource(315, 45).shade(filled, cmap=IPSO, vert_exag=1.8, dx=217, dy=217, blend_mode="soft", vmin=0, vmax=2800)
fig, ax = plt.subplots(figsize=(11, 11*H/Wd), dpi=140)
ax.imshow(rgb, origin="upper", interpolation="bilinear", alpha=0.55)
ECOL = {"pianura": "#1f6fb0", "collina": "#cf7a1f", "valico": "#8a3b1f"}
for e in edges:
    a, b = nodes[e["i"]], nodes[e["j"]]
    xa, ya = to_px(a["lon"], a["lat"]); xb, yb = to_px(b["lon"], b["lat"])
    ax.plot([xa, xb], [ya, yb], color=ECOL[e["tipo"]], lw=1.8 if e["tipo"] != "valico" else 2.0,
            zorder=4, alpha=0.85, solid_capstyle="round")
    mx, my = (xa+xb)/2, (ya+yb)/2
    ax.annotate(f"{e['km']:.0f}", (mx, my), fontsize=5.6, color="#333", zorder=5, ha="center")
for nd in nodes:
    px, py = to_px(nd["lon"], nd["lat"])
    if nd["realm"]:
        ax.scatter([px], [py], s=70, marker="o", color="#7a1f1f", edgecolor="white", lw=1.0, zorder=6)
    else:
        ax.scatter([px], [py], s=55, marker="o", facecolor="#dcdcdc", edgecolor="#555", lw=1.0, zorder=6)
    ax.annotate(nd["name"], (px, py), fontsize=7.2, color="#1a1206", weight="bold",
                xytext=(5, 3), textcoords="offset points", zorder=7)
ax.set_xlim(0, Wd); ax.set_ylim(H, 0); ax.set_xticks([]); ax.set_yticks([])
ax.set_title("Le Vie Antiche — rete urbana del regno\n"
             "nodi = città-rovina · archi = vie (pianura / collina / valico) con distanze reali (km)", fontsize=11)
leg = [Line2D([0], [0], marker="o", color="w", markerfacecolor="#7a1f1f", markersize=9, label="città-rovina (nel regno)"),
       Line2D([0], [0], marker="o", color="w", markerfacecolor="#dcdcdc", markeredgecolor="#555", markersize=8, label="città oltre i confini"),
       Line2D([0], [0], color="#1f6fb0", lw=2, label="via di pianura"),
       Line2D([0], [0], color="#cf7a1f", lw=2, label="via di collina"),
       Line2D([0], [0], color="#8a3b1f", lw=2, label="via di valico (montagna)")]
ax.legend(handles=leg, loc="lower left", fontsize=7.6, framealpha=0.93)
plt.tight_layout(); plt.savefig("out_zones/rete_urbana.png", bbox_inches="tight"); plt.close()

json.dump({"nodi": nodes, "vie": edges}, open("out_zones/rete_urbana.json", "w"), ensure_ascii=False, indent=1)
tot = sum(e["km"] for e in edges)
print(f"rete: {len(nodes)} città, {len(edges)} vie, {tot:.0f} km totali")
print("-> out_zones/rete_urbana.png , rete_urbana.json")
