#!/usr/bin/env python3
"""geo_confini v2 — confini NATURALI + de-italianizzazione + riferimenti di trama.
Regole (tutte morfologiche, niente linee rette):
  - monti = filtro-massimo + gauss sul DEM >= 320 m  (le città pedemontane restano col monte)
  - R1|R2   : divisorio = il fiume Adda / ramo del lago (polyline reale)
  - R2,R1|R3: bordo monti->pianura (contorno morfologico)
  - R3|R4   : il Grande Fiume (Po, polyline reale)
  - R4|R5   : bordo pianura->Appennino (contorno morfologico)
  - R5|R6   : la CRESTA appenninica (argmax di quota per colonna, lisciata)
  - mare in mappa (costa ovest) -> LA GRAN PIANA (terra fuori dai regni): sparisce l'Italia
Esporta: regni_confini.geojson (v2), gran_piana.geojson, fiumi.geojson,
riferimenti_trama.geojson, manifest_taglio.json (v2) + mappa_riferimento.png (atlante).

Con `--check` (in qualunque posizione tra gli argomenti): NON rigenera (la rigenerazione
vuole rete: DEM + Overpass) — verifica gli INVARIANTI del pack committato, a stdlib puro:
  - i 6 layer + manifest + INDICE_LUOGHI esistono e sono json validi;
  - manifest.file ↔ layer del pack combaciano (niente file fantasma, niente orfani);
  - regni_confini ha i 6 regni con gli id dell'atlante politico;
  - INDICE_LUOGHI è la FONTE UNICA: ogni luogo è dentro il bbox, dentro il POLIGONO del
    suo regno (lo snap anti-confine del v3), con cella di griglia ricalcolata uguale e
    margine_km positivo;
  - riferimenti_trama e centri hanno le STESSE coordinate dell'INDICE (join sul nome).
Exit 0 con «geo pack OK» se allineato; exit 1 con la diagnosi se no. È il cancello
anti-drift del pack (gemello di cast/digest/reference-sync); il legame grafo↔geo resta
al serializzatore, che porta l'INDICE nel brief."""
import json, math, os, sys

GEO_DIR = "saga/cartografia/geo"
_LAYER_ATTESI = [
    "regni_confini.geojson", "gran_piana.geojson", "fiumi.geojson",
    "laghi.geojson", "centri.geojson", "riferimenti_trama.geojson",
]


def _dentro_anello(pt, anello):
    """Ray casting: pt [lon,lat] dentro l'anello (lista di [lon,lat])."""
    x, y = pt
    dentro = False
    j = len(anello) - 1
    for i in range(len(anello)):
        xi, yi = anello[i]
        xj, yj = anello[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            dentro = not dentro
        j = i
    return dentro


def _dentro_geom(pt, geom):
    polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
    for p in polys:
        if _dentro_anello(pt, p[0]) and not any(_dentro_anello(pt, buco) for buco in p[1:]):
            return True
    return False


def _check():
    err = []

    def load(nome):
        path = os.path.join(GEO_DIR, nome)
        if not os.path.exists(path):
            err.append(f"manca {path}")
            return None
        try:
            return json.load(open(path))
        except Exception as e:  # json rotto = drift
            err.append(f"{nome}: json invalido ({e})")
            return None

    man = load("manifest_taglio.json")
    idx = load("INDICE_LUOGHI.json")
    layers = {nome: load(nome) for nome in _LAYER_ATTESI}
    if err:
        return err

    # manifest.file ↔ pack (senza file fantasma né orfani)
    dichiarati = set(man.get("file", {}))
    for nome in dichiarati - set(_LAYER_ATTESI):
        err.append(f"manifest.file dichiara «{nome}» che non fa parte del pack")
    for nome in set(_LAYER_ATTESI) - dichiarati:
        err.append(f"manifest.file non elenca «{nome}»")

    # i 6 regni, con gli id dell'atlante politico
    regni = {f["properties"].get("id"): f for f in layers["regni_confini.geojson"]["features"]}
    try:
        pol = json.load(open("saga/cartografia/regno/atlante_politico.json"))["regni"]
        attesi = sorted(int(k) for k in pol)
    except Exception as e:
        err.append(f"atlante_politico.json non leggibile ({e})")
        attesi = []
    if attesi and sorted(k for k in regni if k is not None) != attesi:
        err.append(f"regni_confini: id {sorted(regni)} ≠ atlante politico {attesi}")

    bbox = man["bbox"]
    passo = man["griglia"]["passo_gradi"]

    def cella(lon, lat):
        return f"{chr(ord('A') + int((lon - bbox['W']) / passo))}{1 + int((bbox['N'] - lat) / passo)}"

    # INDICE_LUOGHI = fonte unica delle coordinate
    per_nome = {}
    for l in idx.get("luoghi", []):
        nome = l.get("nome", "?")
        lon, lat = l["coord"]
        per_nome[nome] = (lon, lat)
        if not (bbox["W"] <= lon <= bbox["E"] and bbox["S"] <= lat <= bbox["N"]):
            err.append(f"INDICE «{nome}»: coord fuori dal bbox del manifest")
        if l.get("cella") != cella(lon, lat):
            err.append(f"INDICE «{nome}»: cella {l.get('cella')} ≠ ricalcolata {cella(lon, lat)}")
        if not (l.get("margine_km") or 0) > 0:
            err.append(f"INDICE «{nome}»: margine_km non positivo (lo snap anti-confine è saltato?)")
        rid = l.get("regno")
        if rid in regni and not _dentro_geom((lon, lat), regni[rid]["geometry"]):
            err.append(f"INDICE «{nome}»: coord FUORI dal poligono del regno {rid} dichiarato")

    # riferimenti_trama + centri: stesse coordinate dell'INDICE (join sul nome)
    for nome_layer in ("riferimenti_trama.geojson", "centri.geojson"):
        for f in layers[nome_layer]["features"]:
            nm = f["properties"].get("nome")
            if nm not in per_nome:
                err.append(f"{nome_layer}: «{nm}» non è nell'INDICE (che è la fonte unica)")
                continue
            lon, lat = f["geometry"]["coordinates"][:2]
            rl, rt = per_nome[nm]
            if abs(rl - lon) > 1e-9 or abs(rt - lat) > 1e-9:
                err.append(f"{nome_layer}: «{nm}» ha coordinate diverse dall'INDICE")
    return err


if "--check" in sys.argv:
    _errori = _check()
    if _errori:
        print("geo pack NON allineato:")
        for e in _errori:
            print(" -", e)
        sys.exit(1)
    print(f"geo pack OK ({len(_LAYER_ATTESI)} layer + manifest + INDICE_LUOGHI coerenti)")
    sys.exit(0)

import urllib.request, urllib.parse, time
import numpy as np
import scipy.ndimage as nd

BBOX = dict(W=8.80, S=43.10, E=11.70, N=46.25); Z = 9
OUT = "saga/cartografia/geo"; os.makedirs(OUT, exist_ok=True)

# ---------- DEM (cache locale) ----------
def t2lon(x): return x/2**Z*360-180
def t2lat(y): return math.degrees(math.atan(math.sinh(math.pi-2*math.pi*y/2**Z)))
def dtx(lon): return (lon+180)/360*2**Z
def dty(lat): return (1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*2**Z
xmin, xmax = int(dtx(BBOX["W"])), int(dtx(BBOX["E"]))
ymin, ymax = int(dty(BBOX["N"])), int(dty(BBOX["S"]))
from PIL import Image
rows = []
for ty in range(ymin, ymax+1):
    row = []
    for tx in range(xmin, xmax+1):
        p = f"/home/claude/dem_tiles/{Z}_{tx}_{ty}.png"
        if not os.path.exists(p):
            urllib.request.urlretrieve(f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{tx}/{ty}.png", p)
        a = np.asarray(Image.open(p)).astype(np.float64)
        row.append(a[:, :, 0]*256+a[:, :, 1]+a[:, :, 2]/256-32768)
    rows.append(np.hstack(row))
dem = np.vstack(rows); H, W = dem.shape
lon1d = np.array([t2lon(xmin+i/256.0) for i in range(W)])
lat1d = np.array([t2lat(ymin+j/256.0) for j in range(H)])
LON = lon1d[None, :]; LAT = lat1d[:, None]
print("DEM", dem.shape)

# ---------- fiumi (Overpass, con cache) ----------
def overpass(q):
    for a in range(5):
        try:
            r = urllib.request.Request("https://overpass-api.de/api/interpreter",
                data=("data="+urllib.parse.quote(q)).encode(),
                headers={"User-Agent": "rocco-zara-saga/1.0", "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json"})
            with urllib.request.urlopen(r, timeout=200) as f: return json.load(f)
        except Exception as e:
            print("  retry", a, str(e)[:70]); time.sleep(25+a*20)
    raise SystemExit("overpass fail")
bb = f"{BBOX['S']},{BBOX['W']},{BBOX['N']},{BBOX['E']}"
CACHE = "/home/claude/fiumi_cache.json"
NAMES = ["Po", "Adda", "Ticino", "Oglio", "Mincio", "Arno", "Serchio", "Reno", "Secchia", "Panaro", "Ombrone", "Adige", "Trebbia"]
if os.path.exists(CACHE):
    fiumi_raw = json.load(open(CACHE))
else:
    rex = "^(" + "|".join(NAMES) + ")$"
    print("scarico i fiumi...")
    fiumi_raw = overpass(f'[out:json][timeout:180];way["waterway"="river"]["name"~"{rex}"]({bb});out geom;')
    json.dump(fiumi_raw, open(CACHE, "w"))
by_river = {}
for e in fiumi_raw.get("elements", []):
    nm = e.get("tags", {}).get("name")
    if nm in NAMES and e.get("geometry"):
        by_river.setdefault(nm, []).append([(p["lon"], p["lat"]) for p in e["geometry"]])
print("fiumi:", {k: len(v) for k, v in by_river.items()})
po_pts = sorted({(round(x, 5), round(y, 5)) for seg in by_river.get("Po", []) for x, y in seg})
POLAT = np.interp(lon1d, [p[0] for p in po_pts], [p[1] for p in po_pts])[None, :]

# divisorio R1|R2: Adda (corso sud del lago) + ancore lungo il ramo del lago
adda = sorted({(round(x, 4), round(y, 4)) for seg in by_river.get("Adda", []) for x, y in seg if y <= 45.72 and x < 10.0})
anchors = [(45.78, 9.46), (45.90, 9.42), (46.05, 9.36), (46.25, 9.33), (46.60, 9.32)]  # ramo di Lecco + Val di Mera: collina (9.415) resta a OVEST
div_lat = [y for x, y in adda] + [a[0] for a in anchors]
div_lon = [x for x, y in adda] + [a[1] for a in anchors]
o = np.argsort(div_lat); div_lat = np.array(div_lat)[o]; div_lon = np.array(div_lon)[o]
DIVLON = np.interp(lat1d, div_lat, div_lon)[:, None]

# ---------- morfologia ----------
land = dem > 8
sm = nd.gaussian_filter(nd.maximum_filter(np.where(land, dem, 0), size=15), 4)
MOUNT = sm >= 320
adige = sorted({(round(x,4),round(y,4)) for seg in by_river.get("Adige",[]) for x,y in seg if y>=45.02})
ADIGELON = np.interp(lat1d, [p[1] for p in adige], [p[0] for p in adige])[:, None] if adige else np.full((H,1), 11.35)
trb = sorted({(round(x,4),round(y,4)) for seg in by_river.get("Trebbia",[]) for x,y in seg})
TREBLON = (np.interp(lat1d, [p[1] for p in trb], [p[0] for p in trb])[:, None] if trb else np.full((H,1), 9.30))
border = ((LON < TREBLON) & (LAT < 44.78)) | ((LON >= ADIGELON) & (LAT > 45.0))
# cresta appenninica per colonna (43.75..44.60), lisciata
crest = np.zeros(W)
smD = nd.gaussian_filter(np.where(land, dem, 0), 3)
for i in range(W):
    win = (lat1d >= 43.75) & (lat1d <= 44.60)
    col = np.where(win, smD[:, i], -1)
    crest[i] = lat1d[int(np.argmax(col))]
crest = nd.uniform_filter1d(crest, size=41)
CREST = crest[None, :]

rid = np.zeros((H, W), np.int16)
NORTHM = MOUNT & (LAT >= 45.12) & (~border)
APP    = MOUNT & (LAT <  44.75) & (~border)
rid = np.where(NORTHM & (LON <  DIVLON) & land, 1, rid)
rid = np.where(NORTHM & (LON >= DIVLON) & land, 2, rid)
plain = land & (~MOUNT) & (~border) & (LAT < 45.55) & (LAT >= CREST)   # pianura vera
rid = np.where(plain & (LAT >  POLAT), 3, rid)
rid = np.where(plain & (LAT <= POLAT), 4, rid)
midh = land & MOUNT & (LAT >= 44.75) & (LAT < 45.12) & (~border)       # colline di mezzo (Oltrepò ecc.)
rid = np.where(midh & (LAT >  POLAT), 3, rid)
rid = np.where(midh & (LAT <= POLAT), 4, rid)
rid = np.where(APP & (LAT >= CREST) & land, 5, rid)
rid = np.where(land & (LAT < CREST) & (~border), 6, rid)
GRANPIANA = (~land)                                                     # il mare -> la Gran Piana
# ripulisci: componenti minuscole assorbite dal vicino più grande
rid = nd.grey_closing(rid, size=3)

# ---------- poligonizza ----------
from rasterio import features
from rasterio.transform import Affine
from shapely.geometry import shape, mapping
from shapely.ops import unary_union
lat_reg = np.linspace(lat1d[0], lat1d[-1], H)
idx = np.clip(np.searchsorted(-lat1d, -lat_reg), 0, H-1)
tr = Affine((lon1d[-1]-lon1d[0])/(W-1), 0, lon1d[0], 0, (lat_reg[-1]-lat_reg[0])/(H-1), lat_reg[0])
def polyize(mask_reg, simplify=0.006):
    geoms = [shape(g) for g, v in features.shapes(mask_reg.astype(np.uint8), mask=mask_reg, transform=tr) if v == 1]
    if not geoms: return None
    mp = unary_union(geoms)
    mp = mp.buffer(0.004).buffer(-0.004)     # liscia i gradini raster
    return mp.simplify(simplify)
pol = json.load(open("saga/cartografia/regno/atlante_politico.json"))["regni"]
feats = []
for k in range(1, 7):
    mp = polyize(rid[idx, :] == k)
    if mp is None: continue
    m = pol[str(k)]
    feats.append(dict(type="Feature", properties=dict(id=k, nome=m["nome"], capitale=m["capitale"]["nome"],
        animale=m["animale"], governo=m["governo"], fazione=m["fazione"], colore=m["col"]),
        geometry=mapping(mp)))
json.dump(dict(type="FeatureCollection", properties=dict(
    descrizione="Confini NATURALI v2: morfologia (monti/pianura), Adda (R1|R2), Grande Fiume (R3|R4), cresta appenninica (R5|R6)", crs="WGS84"),
    features=feats), open(f"{OUT}/regni_confini.geojson", "w"), ensure_ascii=False)
gp = polyize(GRANPIANA[idx, :])
json.dump(dict(type="FeatureCollection", features=[dict(type="Feature",
    properties=dict(nome="la Gran Piana d'Occidente", tipo="terra_fuori_dai_regni",
                    nota="al posto del mare a ovest: piana sterminata (forse deserto); la storia non ci passa — de-italianizza la mappa"),
    geometry=mapping(gp))]), open(f"{OUT}/gran_piana.geojson", "w"), ensure_ascii=False)

# fiumi
LESSICO_F = {"Po": "il Grande Fiume"}
ff = []
for nm, segs in by_river.items():
    for s in segs:
        if len(s) >= 2:
            ff.append(dict(type="Feature", properties=dict(nome=LESSICO_F.get(nm, nm), reale=nm),
                           geometry=dict(type="LineString", coordinates=[[x, y] for x, y in s])))
json.dump(dict(type="FeatureCollection", features=ff), open(f"{OUT}/fiumi.geojson", "w"), ensure_ascii=False)

# riferimenti di trama (pinnati; PRECISI dove passa la storia)
luoghi = [
 (1, "Coppelle di Spondalta (Luogo Antico)", 9.40, 45.88, "luogo_antico"),
 (2, "le Pietre Incise (Luogo Antico)", 10.34, 46.02, "luogo_antico"),
 (4, "le Rovine Ordinate (Luogo Antico)", 11.28, 44.46, "luogo_antico"),
 (5, "l'Altare di Roccia (Luogo Antico)", 10.41, 44.43, "luogo_antico"),
 (6, "le Pietre del Leone (Luogo Antico)", 10.86, 43.40, "luogo_antico"),
]
rf = [dict(type="Feature", properties=dict(nome="la Collina dell'Incontro", kind="origine", regno=1,
        nota="dove Rocco e Zara si incontrano (ORIGINE.md)"), geometry=dict(type="Point", coordinates=[9.415, 45.85]))]
for rg, nome, x, y, kind in luoghi:
    rf.append(dict(type="Feature", properties=dict(nome=nome, kind=kind, regno=rg),
                   geometry=dict(type="Point", coordinates=[x, y])))
for k in range(1, 7):
    m = pol[str(k)]
    rf.append(dict(type="Feature", properties=dict(nome=m["capitale"]["nome"], kind="capitale", regno=k),
                   geometry=dict(type="Point", coordinates=m["capitale"]["ll"])))
json.dump(dict(type="FeatureCollection", features=rf), open(f"{OUT}/riferimenti_trama.geojson", "w"), ensure_ascii=False)

# manifest v2 + griglia
json.dump({
 "versione": 2, "bbox": BBOX,
 "dem": {"fonte": "AWS Terrarium", "z": Z},
 "regole_naturali": {
   "monti": "maxfilter(15px)+gauss(4) su DEM >= 320 m (le città pedemontane restano col monte)",
   "R1|R2": "il fiume Adda + ramo di Lecco + Val di Mera (polyline reale)",
   "monti|pianura": "contorno morfologico (nessuna retta)",
   "R3|R4": "il Grande Fiume (Po)",
   "R4|R5": "bordo pianura->Appennino (morfologico)",
   "R5|R6": "cresta appenninica (argmax quota per colonna, lisciata)",
   "esclusioni": ["a ovest della Trebbia per lat<44.78 (Terre di Ponente, valle reale)", "a est dell'Adige per lat>45.0 (valle reale)"],
   "mare": "TUTTO il mare in mappa diventa 'la Gran Piana d'Occidente' (terra fuori dai regni) -> la costa tosco-ligure sparisce e non si riconosce l'Italia; il Grande Fiume esce dalla mappa verso il Mare d'Oriente"},
 "griglia": {"passo_gradi": 0.25, "colonne": "A.. da W a E", "righe": "1.. da N a S",
             "uso": "riferimento rapido nei brief e nelle immagini (es. 'collina dell'incontro = C2')"},
 "file": {"regni_confini.geojson": "poligoni naturali v2", "gran_piana.geojson": "l'ex-mare a ovest",
          "fiumi.geojson": "Po/Grande Fiume, Adda, Ticino, Oglio, Mincio, Arno, Serchio, Reno, Secchia, Panaro, Ombrone, Adige",
          "laghi.geojson": "i 5 grandi laghi", "centri.geojson": "capitali+centri",
          "riferimenti_trama.geojson": "origine, Luoghi Antichi, capitali — i punti ESATTI dove passa la storia"},
 "nota": "canone congelato: mappe e immagini si rigenerano da qui senza rete"
}, open(f"{OUT}/manifest_taglio.json", "w"), ensure_ascii=False, indent=1)
print("geojson v2 scritti")

# ---------- collocazione dati: margini, snap, celle, indice unico ----------
from shapely.geometry import Point
from shapely.ops import nearest_points
regs = {f["properties"]["id"]: shape(f["geometry"]) for f in feats}
def cella(lon, lat):
    c = int((lon - BBOX["W"]) / 0.25); r = int((BBOX["N"] - lat) / 0.25)
    return chr(65 + max(0, min(25, c))) + str(r + 1)
def margine_km(p, k):
    g = regs[k]
    return (g.boundary.distance(p) if g.contains(p) else -g.distance(p)) * 111.0
SOGLIA = 1.5   # km: sotto questa distanza dal confine, il pin si sposta verso l'interno
def snap_dentro(p, k):
    core = regs[k].buffer(-0.025)   # ~2.8 km dentro
    if core.is_empty: core = regs[k].buffer(-0.008)
    return nearest_points(core, p)[0]
spostati = []
for f in rf:
    x, y = f["geometry"]["coordinates"]; k = f["properties"].get("regno"); p = Point(x, y)
    if k in regs:
        m = margine_km(p, k)
        if m < SOGLIA:
            q = snap_dentro(p, k)
            spostati.append((f["properties"]["nome"], round(m, 2), (round(x,4), round(y,4)), (round(q.x,4), round(q.y,4))))
            f["geometry"]["coordinates"] = [round(q.x, 5), round(q.y, 5)]
            x, y = q.x, q.y; m = margine_km(Point(x, y), k)
        f["properties"]["margine_km"] = round(m, 2)
    f["properties"]["cella"] = cella(x, y)
json.dump(dict(type="FeatureCollection", features=rf), open(f"{OUT}/riferimenti_trama.geojson", "w"), ensure_ascii=False)
# centri minori: snap nel regno giusto + regno/cella in proprieta
cf2 = []
for k in range(1, 7):
    m = pol[str(k)]
    pts = [("capitale", m["capitale"]["nome"], m["capitale"]["ll"])] + \
          [("centro", f"{m['nome']} — centro {i}", c) for i, c in enumerate(m["centri"][1:], 1)]
    for ruolo, nome, (x, y) in pts:
        p = Point(x, y)
        if k in regs and margine_km(p, k) < (SOGLIA if ruolo == "capitale" else 0.6):
            q = snap_dentro(p, k); x, y = q.x, q.y
        cf2.append(dict(type="Feature", properties=dict(regno=k, nome=nome, ruolo=ruolo,
            cella=cella(x, y), margine_km=round(margine_km(Point(x, y), k), 2)),
            geometry=dict(type="Point", coordinates=[round(x, 5), round(y, 5)])))
json.dump(dict(type="FeatureCollection", features=cf2), open(f"{OUT}/centri.geojson", "w"), ensure_ascii=False)
# indice unico dei luoghi (il punto d'accesso dati)
idxl = []
for f in rf:
    idxl.append(dict(nome=f["properties"]["nome"], tipo=f["properties"]["kind"], regno=f["properties"].get("regno"),
                     coord=f["geometry"]["coordinates"], cella=f["properties"]["cella"],
                     margine_km=f["properties"].get("margine_km")))
for f in cf2:
    if f["properties"]["ruolo"] == "centro":
        idxl.append(dict(nome=f["properties"]["nome"], tipo="centro", regno=f["properties"]["regno"],
                         coord=f["geometry"]["coordinates"], cella=f["properties"]["cella"],
                         margine_km=f["properties"]["margine_km"]))
json.dump({"nota": "indice unico dei luoghi canonici: coord, regno, cella griglia 0,25\u00b0, margine dal confine (km). Pin spostati se a <1.5 km dal confine (capitali/riferimenti) o <0.6 km (centri).",
           "luoghi": idxl}, open(f"{OUT}/INDICE_LUOGHI.json", "w"), ensure_ascii=False, indent=1)
print("snap eseguiti:", len(spostati))
for nm, m, a, b in spostati: print("  spostato:", nm, f"(margine {m} km) {a} -> {b}")


# ---------- mappa di riferimento (stile atlante) ----------
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import LightSource, LinearSegmentedColormap
import matplotlib.patheffects as pe
PAR = "#e9dbb7"
IPSO = LinearSegmentedColormap.from_list("i", [(0, "#cfc190"), (0.12, "#c9b878"), (0.35, "#a98a55"),
                                               (0.65, "#8a6a48"), (0.9, "#e8e4da"), (1, "#f7f7f4")])
dem_vis = np.where(land, dem, 12.0)          # la Gran Piana: quota di pianura
rgb = LightSource(315, 45).shade(np.clip(dem_vis, 0, None), cmap=IPSO, vert_exag=1.9, dx=217, dy=217,
                                 blend_mode="soft", vmin=0, vmax=2800)
fig, ax = plt.subplots(figsize=(12.5, 12.5*H/W), dpi=150)
fig.patch.set_facecolor(PAR)
ax.imshow(rgb, origin="upper", interpolation="bilinear", alpha=0.96)
def px(lon, lat): return (dtx(lon)-xmin)*256, (dty(lat)-ymin)*256
# velo colore dei regni (dal raster: coincide coi geojson)
over = np.zeros((H, W, 4))
def h2(h): h = h.lstrip("#"); return tuple(int(h[i:i+2], 16)/255 for i in (0, 2, 4))
for k in range(1, 7):
    r, g, b = h2(pol[str(k)]["col"]); over[rid == k] = (r, g, b, 0.26)
over[GRANPIANA] = (*h2("#d8c99a"), 0.30)
ax.imshow(over, origin="upper", interpolation="nearest")
ax.contour(rid.astype(float), levels=np.arange(0.5, 6.6, 1.0), colors="#3a2a16", linewidths=1.1, alpha=0.85)
# griglia
for glon in np.arange(math.ceil(BBOX["W"]/0.25)*0.25, BBOX["E"], 0.25):
    xs, _ = px(glon, BBOX["N"]); ax.plot([xs, xs], [0, H], color="#6b5a3e", lw=0.25, alpha=0.35, zorder=2)
for glat in np.arange(math.ceil(BBOX["S"]/0.25)*0.25, BBOX["N"], 0.25):
    _, ys = px(BBOX["W"], glat); ax.plot([0, W], [ys, ys], color="#6b5a3e", lw=0.25, alpha=0.35, zorder=2)
# fiumi
for f in ff:
    cs = f["geometry"]["coordinates"]
    xs, ys = zip(*[px(x, y) for x, y in cs])
    lw = 2.2 if f["properties"]["reale"] == "Po" else 0.9
    ax.plot(xs, ys, color="#2f6fb0", lw=lw, alpha=0.9, zorder=4, solid_capstyle="round")
# laghi
for f in json.load(open(f"{OUT}/laghi.geojson"))["features"]:
    xs, ys = zip(*[px(x, y) for x, y in f["geometry"]["coordinates"][0]])
    ax.fill(xs, ys, color="#2f6fb0", lw=0, zorder=5)
# etichetta Grande Fiume lungo il corso
gfx, gfy = px(10.35, 45.02)
ax.annotate("il  Grande  Fiume", (gfx, gfy), fontsize=11, style="italic", color="#1b4d8f", rotation=-4,
            weight="bold", zorder=8, path_effects=[pe.withStroke(linewidth=2.5, foreground=PAR)])
tpx_, tpy_ = px(9.05, 44.42)
ax.annotate("TERRE\nDI PONENTE", (tpx_, tpy_), fontsize=9, color="#7a6337", ha="center", style="italic",
            zorder=8, alpha=0.85, path_effects=[pe.withStroke(linewidth=2.5, foreground=PAR)])
gpx_, gpy_ = px(9.55, 43.55)
ax.annotate("LA  GRAN  PIANA\nD'OCCIDENTE", (gpx_, gpy_), fontsize=13, color="#7a6337", ha="center",
            style="italic", zorder=8, alpha=0.9, path_effects=[pe.withStroke(linewidth=3, foreground=PAR)])
# centri minori (puntini)
try:
    for f in cf2:
        if f["properties"]["ruolo"] == "centro":
            X, Y = px(*f["geometry"]["coordinates"]); ax.scatter([X], [Y], s=12, color="#2b211a", zorder=6)
except NameError: pass
# riferimenti
for f in rf:
    x, y = f["geometry"]["coordinates"]; k = f["properties"]["kind"]; nm = f["properties"]["nome"]
    X, Y = px(x, y)
    if k == "capitale":
        ax.scatter([X], [Y], marker="*", s=340, color="#ffd21a", ec="#5a1414", lw=1.6, zorder=9)
        ax.annotate(nm, (X, Y), fontsize=10, weight="bold", color="#241208", xytext=(7, 4),
                    textcoords="offset points", zorder=10, path_effects=[pe.withStroke(linewidth=2.5, foreground=PAR)])
    elif k == "luogo_antico":
        ax.scatter([X], [Y], marker="^", s=120, color="#6b4b8a", ec="white", lw=1.1, zorder=9)
        ax.annotate(nm.split(" (")[0], (X, Y), fontsize=7.5, color="#4a3363", xytext=(6, -10),
                    textcoords="offset points", zorder=10, style="italic",
                    path_effects=[pe.withStroke(linewidth=2, foreground=PAR)])
    else:
        ax.scatter([X], [Y], marker="o", s=90, color="#c0392b", ec="white", lw=1.2, zorder=9)
        ax.annotate("la Collina dell'Incontro", (X, Y), fontsize=8.5, weight="bold", color="#7a1f1f",
                    xytext=(7, -12), textcoords="offset points", zorder=10,
                    path_effects=[pe.withStroke(linewidth=2, foreground=PAR)])
# nomi regno
POSN = {1: (8.98, 46.02), 2: (10.35, 46.0), 3: (9.9, 45.32), 4: (10.6, 44.78), 5: (10.9, 44.30), 6: (11.15, 43.55)}
for k in range(1, 7):
    m = pol[str(k)]; X, Y = px(*POSN[k])
    ax.annotate(f"{m['nome']}\n{m['animale']}", (X, Y), ha="center", fontsize=11, weight="bold", color="#241208",
                zorder=9, path_effects=[pe.withStroke(linewidth=3, foreground=PAR)])
ax.set_xlim(0, W); ax.set_ylim(H, 0); ax.set_xticks([]); ax.set_yticks([])
for s in ax.spines.values(): s.set_edgecolor("#3a2a16"); s.set_linewidth(2)
ax.set_title("Atlante delle Terre Annodate — mappa di riferimento (canone geo v2)\n"
             "confini naturali · ★ capitali · ▲ Luoghi Antichi · ● la Collina dell'Incontro · griglia 0,25°",
             fontsize=13, color="#241208", pad=12)
plt.tight_layout(); plt.savefig(f"{OUT}/mappa_riferimento.png", bbox_inches="tight", facecolor=PAR); plt.close()
print("mappa_riferimento.png ok")

# ---------- verifica automatica: i riferimenti cadono nel regno giusto? ----------
from shapely.geometry import Point
regs = {f["properties"]["id"]: shape(f["geometry"]) for f in feats}
print("\nVERIFICA riferimenti:")
for f in rf:
    x, y = f["geometry"]["coordinates"]; want = f["properties"].get("regno")
    got = next((k for k, g in regs.items() if g.contains(Point(x, y))), None)
    ok = "OK " if got == want else ("!! " if want else "   ")
    print(f"  {ok}{f['properties']['nome'][:42]:44} atteso R{want} -> in R{got}")
