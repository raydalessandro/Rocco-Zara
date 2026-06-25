#!/usr/bin/env python3
"""
zonegen — generatore (quasi)automatico di mappe e geojson per zone del mondo di
Rocco & Zara. Dato un riquadro, scarica DEM (rilievo) + layer OSM scelti,
li rende con uno stile coerente e li esporta in geojson con la QUOTA reale
attaccata a ogni feature.

Uso:
    python3 zonegen.py NOME W S E N
    es: python3 zonegen.py origine_lecco 9.28 45.72 9.55 45.98

Output:
    out_zones/NOME.png       mappa precisa (rilievo + biomi reinterpretati)
    out_zones/NOME.geojson   feature con kind/bioma/quota_m/real_ref
"""
import sys, os, io, json, math, time
import numpy as np
import requests
from PIL import Image
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import LightSource, LinearSegmentedColormap
from matplotlib.patches import Patch
from matplotlib.lines import Line2D
from shapely.geometry import LineString, Polygon, Point, mapping

# ---------------- config / stile ----------------
CACHE_DEM = "dem_tiles"; CACHE_OSM = "cache_zones"; OUT = "out_zones"
for d in (CACHE_DEM, CACHE_OSM, OUT): os.makedirs(d, exist_ok=True)

# reinterpretazione biomi (OSM -> mondo della saga)
PALETTE = {
    "foresta": "#2f6b3a",   # bosco -> foresta
    "savana":  "#d9c98f",   # aperto / coltivo / prateria -> savana
    "acqua":   "#2f6fb0",
    "umido":   "#bcd3b0",
    "rovina":  "#7a6a5a",   # insediamenti -> citta-rovina
    "roccia":  "#8a7d70",
}
# ipsometria di sfondo (rilievo)
IPSO = LinearSegmentedColormap.from_list("ipso", [
    (0.00, "#86ab6e"), (0.06, "#a3bd78"), (0.14, "#c9c27c"),
    (0.32, "#a9883f"), (0.58, "#7d5a32"), (0.82, "#8a7d70"), (1.00, "#f2f2f2")])

OVERPASS = ["https://overpass-api.de/api/interpreter",
            "https://overpass.kumi.systems/api/interpreter",
            "https://overpass.private.coffee/api/interpreter"]

# densita' etichette nel render (il geojson conserva comunque TUTTO)
N_PEAKS = 12; N_PEAK_LABELS = 6; N_PLACES = 12

# ---------------- DEM ----------------
def deg2tile(lat, lon, z):
    n = 2**z
    return (lon+180)/360*n, (1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*n
def tile2lon(x, z): return x/2**z*360-180
def tile2lat(y, z): return math.degrees(math.atan(math.sinh(math.pi-2*math.pi*y/2**z)))

def pick_zoom(W, E, target_px=1100):
    span = max(E-W, 1e-4)
    z = math.log2(target_px*360/(span*256))
    return max(9, min(13, int(round(z))))

def fetch_dem(W, S, E, N):
    z = pick_zoom(W, E)
    x0, y0 = deg2tile(N, W, z); x1, y1 = deg2tile(S, E, z)
    xmin, xmax = int(math.floor(x0)), int(math.floor(x1))
    ymin, ymax = int(math.floor(y0)), int(math.floor(y1))
    nx, ny = xmax-xmin+1, ymax-ymin+1
    big = np.zeros((ny*256, nx*256), float)
    sess = requests.Session()
    for j, ty in enumerate(range(ymin, ymax+1)):
        for i, tx in enumerate(range(xmin, xmax+1)):
            c = f"{CACHE_DEM}/{z}_{tx}_{ty}.png"
            if os.path.exists(c): data = open(c, "rb").read()
            else:
                u = f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{tx}/{ty}.png"
                r = sess.get(u, timeout=30); data = r.content
                if r.status_code == 200: open(c, "wb").write(data)
                else: continue
            a = np.asarray(Image.open(io.BytesIO(data)).convert("RGB")).astype(float)
            big[j*256:(j+1)*256, i*256:(i+1)*256] = a[..., 0]*256+a[..., 1]+a[..., 2]/256-32768
    big = np.where(big < -50, np.nan, big)
    bounds = dict(left=tile2lon(xmin, z), right=tile2lon(xmax+1, z),
                  top=tile2lat(ymin, z), bottom=tile2lat(ymax+1, z), z=z, xmin=xmin, ymin=ymin)
    return big, bounds

def dem_sampler(dem, bounds):
    H, Wd = dem.shape; z = bounds["z"]
    def sample(lon, lat):
        px = (deg2tile(lat, lon, z)[0]-bounds["xmin"])*256
        py = (deg2tile(lat, lon, z)[1]-bounds["ymin"])*256
        xi, yi = int(min(max(px, 0), Wd-1)), int(min(max(py, 0), H-1))
        v = dem[yi, xi]
        return None if np.isnan(v) else round(float(v))
    return sample

# ---------------- OSM ----------------
def overpass(q):
    last = None
    for ep in OVERPASS:
        for a in range(2):
            try:
                r = requests.post(ep, data={"data": q},
                                  headers={"User-Agent": "RoccoZara-zonegen/1.0", "Accept": "application/json"},
                                  timeout=120)
                if r.status_code == 200: return r.json()
                last = f"{ep} HTTP {r.status_code}"
            except Exception as e: last = f"{ep} {e}"
            time.sleep(5*(a+1))
    raise RuntimeError(last)

def fetch_osm(name, W, S, E, N):
    cache = f"{CACHE_OSM}/{name}.json"
    if os.path.exists(cache): return json.load(open(cache))
    bb = f"{S},{W},{N},{E}"
    q = f"""[out:json][timeout:120];
(
  way["natural"="wood"]({bb});
  way["landuse"="forest"]({bb});
  way["natural"="water"]({bb});
  way["waterway"~"^(river|stream|canal)$"]({bb});
  way["natural"~"^(grassland|heath|scrub|fell|bare_rock)$"]({bb});
  way["landuse"~"^(meadow|farmland|farmyard|orchard|vineyard)$"]({bb});
  way["natural"="wetland"]({bb});
  way["landuse"="residential"]({bb});
  node["natural"="peak"]({bb});
  node["place"~"^(city|town|village|hamlet)$"]({bb});
);
out geom;"""
    els = overpass(q).get("elements", [])
    json.dump(els, open(cache, "w"))
    return els

def classify(tags):
    n = tags.get("natural"); lu = tags.get("landuse"); ww = tags.get("waterway"); pl = tags.get("place")
    if pl: return ("place", "rovina")
    if n == "peak": return ("rilievo", "roccia")
    if n == "wood" or lu == "forest": return ("zona", "foresta")
    if n == "water": return ("zona", "acqua")
    if ww: return ("acqua", "acqua")
    if n == "wetland": return ("zona", "umido")
    if lu == "residential": return ("zona", "rovina")
    if n in ("grassland", "heath", "scrub", "fell", "bare_rock") or lu in ("meadow", "farmland", "farmyard", "orchard", "vineyard"):
        return ("zona", "savana")
    return ("zona", "savana")

# ---------------- render ----------------
def render_zone(name, W, S, E, N):
    print(f"[{name}] DEM..."); dem, b = fetch_dem(W, S, E, N); samp = dem_sampler(dem, b)
    print(f"[{name}] OSM..."); els = fetch_osm(name, W, S, E, N)
    z = b["z"]
    def to_px(lon, lat):
        return (deg2tile(lat, lon, z)[0]-b["xmin"])*256, (deg2tile(lat, lon, z)[1]-b["ymin"])*256
    H, Wd = dem.shape

    # base rilievo
    filled = np.clip(np.where(np.isnan(dem), np.nanmin(dem), dem), 0, None)
    vmax = max(300, np.nanpercentile(filled, 99))
    ls = LightSource(315, 45)
    rgb = ls.shade(filled, cmap=IPSO, vert_exag=2.4, dx=30, dy=30, blend_mode="soft", vmin=0, vmax=vmax)
    fig, ax = plt.subplots(figsize=(11, 11*H/Wd), dpi=140)
    ax.imshow(rgb, origin="upper", interpolation="bilinear", alpha=0.92)

    feats = []; counts = {}
    def add(geom, kind, bioma, tags, extra=None):
        c = geom.centroid
        pr = {"id": f"{bioma}_{tags.get('@id', id(geom))}", "name": tags.get("name", ""),
              "kind": kind, "bioma": bioma, "quota_m": samp(c.x, c.y),
              "real_ref": "osm", "status": "bozza"}
        if extra: pr.update(extra)
        feats.append({"type": "Feature", "properties": pr, "geometry": mapping(geom)})
        counts[bioma] = counts.get(bioma, 0)+1

    # poligoni & linee (ordine di disegno: aperto, umido, foresta, acqua-area, rovine; poi linee acqua; poi punti)
    polys = {"savana": [], "umido": [], "foresta": [], "acqua": [], "rovina": []}
    waterlines = []; peaks = []; places = []
    for el in els:
        t = el.get("tags", {}); t["@id"] = el.get("id")
        kind, bioma = classify(t)
        if el["type"] == "node":
            if bioma == "roccia": peaks.append(el)
            else: places.append(el)
            geom = Point(el["lon"], el["lat"]); add(geom, kind, "roccia" if bioma=="roccia" else "rovina", t)
            continue
        g = el.get("geometry")
        if not g: continue
        co = [(p["lon"], p["lat"]) for p in g]
        if kind == "acqua" and bioma == "acqua":  # waterway line
            if len(co) >= 2:
                waterlines.append((t, co)); add(LineString(co), kind, bioma, t,
                                                 {"waterway": t.get("waterway")})
            continue
        if len(co) >= 4:
            try:
                p = Polygon(co)
                if not p.is_valid: p = p.buffer(0)
                if p.area > 0:
                    polys.setdefault(bioma, []).append(co)
                    add(p, kind, bioma, t)
            except Exception: pass

    def fillp(co, color, z_, a=1.0):
        xs, ys = zip(*[to_px(x, y) for x, y in co]); ax.fill(xs, ys, color=color, zorder=z_, lw=0, alpha=a)
    for co in polys["savana"]:  fillp(co, PALETTE["savana"], 2, 0.55)
    for co in polys["umido"]:   fillp(co, PALETTE["umido"], 2, 0.8)
    for co in polys["foresta"]: fillp(co, PALETTE["foresta"], 3, 0.9)
    for co in polys["acqua"]:   fillp(co, PALETTE["acqua"], 4)
    for co in polys.get("rovina", []): fillp(co, PALETTE["rovina"], 4, 0.45)
    for t, co in waterlines:
        xs, ys = zip(*[to_px(x, y) for x, y in co])
        big = t.get("waterway") == "river"
        ax.plot(xs, ys, color="#1f5fb0" if big else "#4f93d6", lw=2.2 if big else 0.8, zorder=5,
                solid_capstyle="round", alpha=0.95)
    # VETTE: marker per le piu' alte, etichetta solo le top (anti-clutter)
    def peak_elev(el):
        e = el.get("tags", {}).get("ele")
        try: return float(str(e).split()[0])
        except Exception: return samp(el["lon"], el["lat"]) or 0
    peaks_named = sorted([el for el in peaks if el.get("tags", {}).get("name")],
                         key=peak_elev, reverse=True)
    for k, el in enumerate(peaks_named[:N_PEAKS]):
        px, py = to_px(el["lon"], el["lat"])
        ax.scatter([px], [py], marker="^", s=30, color="#5a3d22", edgecolor="white", lw=0.5, zorder=7)
        if k < N_PEAK_LABELS:
            ax.annotate(f"{el['tags']['name']} {int(peak_elev(el))}m", (px, py), fontsize=7.2,
                        color="#3a2a1a", xytext=(3, 2), textcoords="offset points")
    # LUOGHI: solo citta/paesi, niente frazioni
    rank = {"city": 3, "town": 2}
    places_major = sorted([el for el in places if el.get("tags", {}).get("place") in rank],
                          key=lambda e: rank[e["tags"]["place"]], reverse=True)
    for el in places_major[:N_PLACES]:
        px, py = to_px(el["lon"], el["lat"])
        if not (0 <= px < Wd and 0 <= py < H): continue
        ax.scatter([px], [py], marker="s", s=30, facecolor="#f3ead8", edgecolor="#4a2410", lw=1.3, zorder=8)
        nm = el.get("tags", {}).get("name", "")
        if nm: ax.annotate(nm, (px, py), fontsize=8, color="#3a1e08",
                           xytext=(5, 2), textcoords="offset points", weight="bold")

    ax.set_xlim(0, Wd); ax.set_ylim(H, 0); ax.set_xticks([]); ax.set_yticks([])
    lo_lo, lo_hi = b["left"], b["right"]; la_lo, la_hi = b["bottom"], b["top"]
    ax.set_title(f"Zona: {name}   ({la_lo:.3f}..{la_hi:.3f} N, {lo_lo:.3f}..{lo_hi:.3f} E)   DEM z{z}",
                 fontsize=11)
    leg = [Patch(facecolor=PALETTE["foresta"], label="bosco \u2192 foresta"),
           Patch(facecolor=PALETTE["savana"], label="aperto/coltivo \u2192 savana"),
           Patch(facecolor=PALETTE["acqua"], label="acqua"),
           Patch(facecolor=PALETTE["rovina"], label="insediamento \u2192 rovina"),
           Line2D([0], [0], marker="^", color="w", markerfacecolor="#5a3d22", label="vette", markersize=7),
           Line2D([0], [0], marker="s", color="w", markerfacecolor="none", markeredgecolor="#4a2410", label="luogo \u2192 centro-rovina", markersize=7)]
    ax.legend(handles=leg, loc="lower left", fontsize=7.5, framealpha=0.93)
    plt.tight_layout()
    png = f"{OUT}/{name}.png"; plt.savefig(png, bbox_inches="tight"); plt.close()
    fc = {"type": "FeatureCollection", "name": name,
          "bbox": [W, S, E, N], "features": feats}
    gj = f"{OUT}/{name}.geojson"; json.dump(fc, open(gj, "w"), ensure_ascii=False)
    elv = [f["properties"]["quota_m"] for f in feats if f["properties"]["quota_m"] is not None]
    print(f"[{name}] feature={len(feats)} {counts}  quota {min(elv) if elv else '-'}..{max(elv) if elv else '-'} m")
    print(f"[{name}] -> {png} , {gj}")
    return png, gj

if __name__ == "__main__":
    name = sys.argv[1]; W, S, E, N = map(float, sys.argv[2:6])
    render_zone(name, W, S, E, N)
