#!/usr/bin/env python3
"""Applica il lessico delle Terre Annodate al canone (boundary-safe, idempotente).
NON tocca: zones/*.geojson (substrato reale), MAPPATURA.md (sottotesto dichiarato),
e gli id-slug interni (laghi_occidente, toscana...) che restano chiavi stabili.
Rieseguibile: cambia la mappa qui sotto e rilancia."""
import re, glob, json

M = {}
# reami (varianti d'articolo per i cambi di genere/numero)
M["Laghi d'Occidente"]="Laghi del Vespro"; M["Laghi d’Occidente"]="Laghi del Vespro"
M["i Laghi d'Oriente"]="la Conca Ruggente"; M["i Laghi d’Oriente"]="la Conca Ruggente"
M["dei Laghi d'Oriente"]="della Conca Ruggente"; M["dei Laghi d’Oriente"]="della Conca Ruggente"
M["Laghi d'Oriente"]="Conca Ruggente"; M["Laghi d’Oriente"]="Conca Ruggente"
M["la Pianura Alta"]="il Gran Ducato"; M["della Pianura Alta"]="del Gran Ducato"
M["alla Pianura Alta"]="al Gran Ducato"; M["nella Pianura Alta"]="nel Gran Ducato"; M["Pianura Alta"]="Gran Ducato"
M["Pianura Bassa"]="Piana dei Savi"
M["della Toscana"]="delle Terre del Leone di Pietra"; M["in Toscana"]="nelle Terre del Leone di Pietra"
M["la Toscana"]="le Terre del Leone di Pietra"; M["Toscana"]="Terre del Leone di Pietra"
# capitali
M["Como"]="Rivalba"; M["Brescia"]="Forterocca"; M["Milano"]="Anguicorte"; M["Bologna"]="Savenza"; M["Firenze"]="Leonalba"
# citta secondarie
M["Varese"]="Vespraviva"; M["Lecco"]="Spondalta"; M["Bergamo"]="Saldarocca"; M["Trento"]="Cimalta"; M["Pergine"]="Cimalbe"
M["Verona"]="Mastignana"; M["Mantova"]="Cortacqua"; M["Cremona"]="Spiranova"; M["Pavia"]="Bassacorte"
M["Piacenza"]="Guadserpe"; M["Vicenza"]="Bassalba"; M["Modena"]="Cartèa"; M["Parma"]="Savialba"
M["Reggio"]="Savina"; M["Ferrara"]="Aquilara"; M["Pavullo"]="Selvalta"; M["Reggello"]="Pietralta"
M["Siena"]="Pietralupa"; M["Pisa"]="Marleone"; M["Lucca"]="Muralba"; M["Pistoia"]="Pietrigna"
M["Prato"]="Pratoleone"; M["Livorno"]="Marlonga"
# luoghi antichi (siti)
M["Valcamonica"]="le Pietre Incise"; M["Marzabotto"]="le Rovine Ordinate"; M["Felsina"]="le Rovine Ordinate"
M["Bismantova"]="l'Altare di Roccia"; M["Volterra"]="le Pietre del Leone"; M["Monte Amiata"]="le Pietre del Leone"; M["Amiata"]="le Pietre del Leone"
# citta secondarie — residui atlante (toscane non ancora mappate; stile del reame del Leone)
M["Massa"]="Marpietra"; M["Viareggio"]="Marsabbia"; M["Vinci"]="Collerocca"
# araldica/politica (genere)
M["il Biscione"]="la Serpe"; M["del Biscione"]="della Serpe"; M["al Biscione"]="alla Serpe"; M["Biscione"]="Serpe"
M["Visconti"]="Anguini"; M["il Marzocco"]="il Leone di Pietra"; M["Marzocco"]="Leone di Pietra"
M["la Signoria"]="il Gran Ducato"; M["della Signoria"]="del Gran Ducato"; M["Signoria"]="Gran Ducato"
M["Guelfi"]="Turchini"; M["guelfi"]="turchini"; M["Guelfo"]="Turchino"; M["guelfo"]="turchino"; M["guelfa"]="turchina"
M["Ghibellini"]="Vermigli"; M["ghibellini"]="vermigli"; M["Ghibellino"]="Vermiglio"; M["ghibellino"]="vermiglio"; M["ghibellina"]="vermiglia"
# geografia
M["Po"]="Gran Fiume"; M["Garda"]="Mare di Dentro"; M["Prealpi"]="Muro del Nord"
M["Muro delle Alpi"]="Muro del Nord"; M["delle Alpi"]="del Nord"; M["prealpi"]="Muro del Nord"
M["Appennino"]="Gobbe del Sud"; M["Appennini"]="Gobbe del Sud"; M["Emilia"]="Piana dei Savi"
M["Lago Maggiore"]="Lago Grande"; M["Maggiore"]="Lago Grande"; M["Lugano"]="Lago Cupo"
M["Iseo"]="Lago Stretto"; M["Lario"]="Lago del Vespro"; M["Idro"]="Lago Alto"
M["Adige"]="Cimàrio"; M["Adda"]="Vespràna"; M["Oglio"]="Concàrio"; M["Mincio"]="Serpàna"
M["Reno"]="Dottàrio"; M["Ticino"]="Vesprino"; M["Arno"]="Leonàrio"

# voci: modelli storici -> registri (frasi lunghe e distintive: replace diretto, no collisioni)
V = {
 "Plinio il Vecchio (naturalista, figlio di Rivalba)":"naturalista-anziano (osservativo, enciclopedico, latineggiante)",
 "Arlecchino e Brighella (maschere bergamasche)":"maschere comiche (servi svelti, furbi-bonari)",
 "registro machiavellico di corte":"registro freddo di corte (calcolatore, aforistico)","registro machiavellico":"registro freddo di corte",
 "Catullo (veronese) e la boria cavalleresca scaligera":"vassallo altero e passionale (boria cavalleresca)",
 "Bonvesin de la Riva (volgare milanese, didascalico) + proverbio bracciante":"bracciante piano e didascalico (+ proverbio)",
 "il Dottor Balanzone (maschera bolognese)":"dottore pomposo (pseudo-dotto, latineggiante)",
 "ottava rima ariostesca/tassiana (corte estense di Aquilara)":"epica cavalleresca in ottava rima (corte dell'Aquila)",
 "Dante e il fiorentino civile (con punte machiavelliche)":"voce civile alta (fiera, tagliente, in terzina)",
 "Cecco Angiolieri (senese, comico-realista)":"beffardo-amaro (comico-realista, orgoglioso)",
 "parlata marinaresca + nitidezza 'galileiana' (Marleone)":"parlata marinaresca + nitidezza misurata (Marleone)",
 "Catullo/scaligera":"vassallo altero (boria cavalleresca)",
 "Arlecchino/Brighella":"delle maschere comiche",
 "stile-modello (la maniera), non citazioni del personaggio storico; le battute sono originali e dette dagli animali":
   "indicazione di registro (la maniera di parlare), non mostrata nel testo; le battute sono originali e dette dagli animali",
 '"tipo_modello": "figura storica"':'"tipo_modello": "registro"','"tipo_modello": "maschera"':'"tipo_modello": "registro comico"',
}

def boundary(text, old, new):
    return re.sub(r"(?<![A-Za-zÀ-ÿ])"+re.escape(old)+r"(?![A-Za-zÀ-ÿ])", new, text)

files=[f for f in glob.glob('saga/**/*.md',recursive=True)]
files+=[f for f in glob.glob('saga/**/*.json',recursive=True) if 'zones/' not in f]
files+=[f for f in glob.glob('saga/**/*.yaml',recursive=True)]
files=[f for f in files if not f.endswith('MAPPATURA.md')]

pairs=sorted(M.items(), key=lambda kv:-len(kv[0]))
n=0
for f in files:
    s=open(f,encoding='utf-8').read(); o=s
    for a,b in pairs: s=boundary(s,a,b)           # nomi (boundary-safe) — PRIMA
    for a,b in V.items(): s=s.replace(a,b)        # voci (chiavi coi nomi nuovi) — DOPO
    s=re.sub(r"([A-Za-zÀ-ÿ]+)-reskin", r"\1", s)  # artefatti -reskin
    if s!=o: open(f,'w',encoding='utf-8').write(s); n+=1
print(f"Lessico applicato a {n} file (boundary-safe).")
for f in glob.glob('saga/**/*.json',recursive=True):
    if 'zones/' not in f: json.load(open(f))
import yaml; yaml.safe_load(open('saga/saga_config.yaml'))
print("json + yaml validi.")
