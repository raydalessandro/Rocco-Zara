#!/usr/bin/env python3
"""geo_confini — congela il canone geografico in vettori committabili.
Ricostruisce la classificazione dei regni ESATTAMENTE come pipeline/comuni.py
(fasce di latitudine + linea del Po + esclusioni + mare<=8m su DEM Terrarium z9),
poi poligonizza e esporta:
  geo/regni_confini.geojson  (poligoni dei 6 regni, con nomi lessico)
  geo/po.geojson             (il Po, divisore R3/R4)
  geo/laghi.geojson          (i grandi laghi)
  geo/centri.geojson         (capitali + centri, da atlante_politico)
  geo/manifest_taglio.json   (bbox, soglie, regole machine-readable)
Da questi file le mappe si rigenerano SENZA rete."""
import json, math, os, time, io, urllib.request
import numpy as np

BBOX = dict(W=8.80, S=43.10, E=11.70, N=46.25)
Z = 9
OUT = "saga/cartografia/geo"
os.makedirs(OUT, exist_ok=True)

# ---------- DEM Terrarium ----------
def t2lon(x): return x/2**Z*360-180
def t2lat(y): return math.degrees(math.atan(math.sinh(math.pi-2*math.pi*y/2**Z)))
def dtx(lon): return (lon+180)/360*2**Z
def dty(lat): return (1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*2**Z
xmin, xmax = int(dtx(BBOX["W"])), int(dtx(BBOX["E"]))
ymin, ymax = int(dty(BBOX["N"])), int(dty(BBOX["S"]))
os.makedirs("/home/claude/dem_tiles", exist_ok=True)
try: from PIL import Image
except ImportError: raise SystemExit("PIL richiesto")
rows = []
print(f"DEM tiles x:{xmin}..{xmax} y:{ymin}..{ymax} ({(xmax-xmin+1)*(ymax-ymin+1)} tiles)")
for ty in range(ymin, ymax+1):
    row = []
    for tx in range(xmin, xmax+1):
        p = f"/home/claude/dem_tiles/{Z}_{tx}_{ty}.png"
        if not os.path.exists(p):
            url = f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{tx}/{ty}.png"
            for att in range(3):
                try:
                    urllib.request.urlretrieve(url, p); break
                except Exception as e:
                    time.sleep(2+att*3)
            else: raise SystemExit(f"tile fail {url}")
        a = np.asarray(Image.open(p)).astype(np.float64)
        row.append(a[:, :, 0]*256 + a[:, :, 1] + a[:, :, 2]/256 - 32768)
    rows.append(np.hstack(row))
dem = np.vstack(rows)
H, W = dem.shape
print("DEM", dem.shape)
lon1d = np.array([t2lon(xmin + i/256.0) for i in range(W)])
lat1d = np.array([t2lat(ymin + j/256.0) for j in range(H)])
LON = lon1d[None, :]; LAT = lat1d[:, None]

# ---------- Po da Overpass ----------
def overpass(q, tries=4):
    for a in range(tries):
        try:
            r = urllib.request.Request("https://overpass-api.de/api/interpreter",
                data=("data="+urllib.parse.quote(q)).encode(),
                headers={"User-Agent": "rocco-zara-saga/1.0 (worldbuilding)",
                         "Content-Type": "application/x-www-form-urlencoded",
                         "Accept": "application/json"})
            with urllib.request.urlopen(r, timeout=180) as f:
                return json.load(f)
        except Exception as e:
            print("  overpass retry", a, str(e)[:80]); time.sleep(30+a*20)
    raise SystemExit("overpass fail")
import urllib.parse
bb = f"{BBOX['S']},{BBOX['W']},{BBOX['N']},{BBOX['E']}"
print("scarico il Po...")
po_raw = overpass(f'[out:json][timeout:150];(way["waterway"="river"]["name"="Po"]({bb}););out geom;')
po_pts = sorted({(round(p["lon"],5), round(p["lat"],5)) for e in po_raw.get("elements",[]) for p in e.get("geometry",[])})
print("  punti Po:", len(po_pts))
POLAT = np.interp(lon1d, [p[0] for p in po_pts], [p[1] for p in po_pts])[None, :]

print("scarico i grandi laghi...")
lk_raw = overpass(f'[out:json][timeout:180];(relation["natural"="water"]["name"~"^Lago di (Como|Garda|Lugano|Iseo)$|^Lago Maggiore$"]({bb});way["natural"="water"]["name"~"^Lago di (Como|Garda|Lugano|Iseo)$|^Lago Maggiore$"]({bb}););out geom;')
def geoms_of(el):
    if el.get("type") == "way" and el.get("geometry"):
        return [[(p["lon"], p["lat"]) for p in el["geometry"]]]
    out = []
    for m in el.get("members", []):
        if m.get("type") == "way" and m.get("geometry") and m.get("role") in ("outer",""):
            out.append([(p["lon"], p["lat"]) for p in m["geometry"]])
    return out
lakes = []
for el in lk_raw.get("elements", []):
    nm = el.get("tags", {}).get("name", "?")
    for g in geoms_of(el):
        if len(g) >= 3: lakes.append((nm, g))
print("  anelli lago:", len(lakes))

# ---------- classificazione canone (identica a comuni.py) ----------
ELEV = np.nan_to_num(dem, nan=-9999)
sea = ELEV <= 8
border = ((LON < 9.30) & (LAT < 44.6)) | ((LON > 11.35) & (LAT > 45.0))
NORTH = LAT >= 45.50; SOUTH = LAT < 44.30
plain = (~NORTH) & (~SOUTH) & (~sea) & (~border)
rid = np.zeros((H, W), np.int16)
rid = np.where(NORTH & (~border) & (~sea) & (LON < 9.55), 1, rid)
rid = np.where(NORTH & (~border) & (~sea) & (LON >= 9.55), 2, rid)
rid = np.where(plain & (LAT > POLAT), 3, rid)
rid = np.where(plain & (LAT <= POLAT), 4, rid)
rid = np.where(SOUTH & (~border) & (~sea) & (LAT >= 44.0), 5, rid)
rid = np.where(SOUTH & (~border) & (~sea) & (LAT < 44.0), 6, rid)
rid = np.where(sea, 0, rid); rid = np.where(border & (~sea), 0, rid)

# ---------- poligonizza ----------
from rasterio import features
from rasterio.transform import Affine
from shapely.geometry import shape, mapping
from shapely.ops import unary_union
# trasformazione affine approssimata (griglia mercator quasi-lineare a questa scala per colonna;
# per la latitudine uso mappatura per-riga via ricampionamento su griglia regolare)
lat_reg = np.linspace(lat1d[0], lat1d[-1], H)   # griglia lat regolare (nord->sud)
idx = np.searchsorted(-lat1d, -lat_reg)          # rimappa righe mercator -> regolari
idx = np.clip(idx, 0, H-1)
rid_reg = rid[idx, :]
tr = Affine((lon1d[-1]-lon1d[0])/(W-1), 0, lon1d[0], 0, (lat_reg[-1]-lat_reg[0])/(H-1), lat_reg[0])
pol = json.load(open("saga/cartografia/regno/atlante_politico.json"))["regni"]
feats = []
for k in range(1, 7):
    mask = (rid_reg == k)
    geoms = [shape(g) for g, v in features.shapes(rid_reg, mask=mask, transform=tr) if v == k]
    if not geoms: continue
    mp = unary_union(geoms).simplify(0.004)  # ~400 m
    m = pol[str(k)]
    feats.append(dict(type="Feature", properties=dict(
        id=k, nome=m["nome"], capitale=m["capitale"]["nome"], animale=m["animale"],
        governo=m["governo"], fazione=m["fazione"], colore=m["col"], area_km2=m["area_km2"]),
        geometry=mapping(mp)))
json.dump(dict(type="FeatureCollection",
    properties=dict(descrizione="Confini canonici dei sei regni (congelati); derivati dalle regole di manifest_taglio.json su DEM Terrarium z9 + Po OSM", crs="WGS84"),
    features=feats), open(f"{OUT}/regni_confini.geojson", "w"), ensure_ascii=False)
print("regni_confini.geojson:", len(feats), "regni,", os.path.getsize(f'{OUT}/regni_confini.geojson')//1024, "KB")

# Po + laghi + centri
json.dump(dict(type="FeatureCollection", features=[dict(type="Feature",
    properties=dict(nome="Po", ruolo="divisore R3/R4; il grande guado"),
    geometry=dict(type="LineString", coordinates=[[p[0], p[1]] for p in po_pts]))]),
    open(f"{OUT}/po.geojson", "w"))
json.dump(dict(type="FeatureCollection", features=[dict(type="Feature",
    properties=dict(nome=nm), geometry=dict(type="Polygon", coordinates=[[[x, y] for x, y in g]]))
    for nm, g in lakes]), open(f"{OUT}/laghi.geojson", "w"))
cf = []
for k in range(1, 7):
    m = pol[str(k)]
    cf.append(dict(type="Feature", properties=dict(regno=k, nome=m["capitale"]["nome"], ruolo="capitale"),
                   geometry=dict(type="Point", coordinates=m["capitale"]["ll"])))
    for i, c in enumerate(m["centri"][1:], 1):
        cf.append(dict(type="Feature", properties=dict(regno=k, nome=f"centro {i}", ruolo="centro"),
                       geometry=dict(type="Point", coordinates=c)))
json.dump(dict(type="FeatureCollection", features=cf), open(f"{OUT}/centri.geojson", "w"))

# manifest con le regole (machine-readable)
json.dump({
 "bbox": BBOX, "dem": {"fonte": "AWS Terrarium", "z": Z, "url": "s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"},
 "regole_taglio": {
   "mare": "elevazione <= 8 m",
   "esclusioni_border": ["lon<9.30 & lat<44.6 (Liguria)", "lon>11.35 & lat>45.0 (NE)"],
   "fasce": {"NORTH": "lat >= 45.50", "SOUTH": "lat < 44.30", "plain": "in mezzo"},
   "assegnazione": {"1": "NORTH & lon<9.55", "2": "NORTH & lon>=9.55", "3": "plain & lat>Po(lon)",
                    "4": "plain & lat<=Po(lon)", "5": "SOUTH & lat>=44.0", "6": "SOUTH & lat<44.0"},
   "po": "polyline OSM waterway=river name=Po, interpolata per longitudine (vedi po.geojson)"},
 "file": {"regni_confini.geojson": "poligoni canonici dei 6 regni (semplificati ~400 m)",
          "po.geojson": "il Po (divisore R3/R4)", "laghi.geojson": "i 5 grandi laghi",
          "centri.geojson": "capitali e centri (da atlante_politico.json)"},
 "nota": "questi file sono CANONE: le mappe si rigenerano da qui senza rete; l'OSM live cambia, questi no."
}, open(f"{OUT}/manifest_taglio.json", "w"), ensure_ascii=False, indent=1)
print("geo pack completo in", OUT)
