#!/usr/bin/env python3
"""voci_build — dà una VOCE a ogni gruppo animale: una maniera (registro, ritmo,
vezzi) ispirata a una figura storica/maschera/tradizione italiana legata alla
città o al ruolo. STILE-modello, non citazioni: le battute d'esempio sono originali,
dette dagli animali. Attacca il blocco 'voce' a ogni classe in societa.json e
produce _voci.json/_voci.md + schema. Machine-readable per l'estrazione nei prompt."""
import json, os
FOLD = {1:"laghi_occidente",2:"laghi_oriente",3:"pianura_alta",4:"pianura_bassa",5:"selva_di_mezzo",6:"toscana"}
NOTA = "stile-modello (la maniera), non citazioni del personaggio storico; le battute sono originali e dette dagli animali"

def V(modello,tipo,registro,tratti,esempio,intensita,in_rima=False,nota=None):
    return dict(modello=modello,tipo_modello=tipo,registro=registro,tratti=tratti,
                in_rima=in_rima,esempio_in_voce=esempio,intensita=intensita,nota=nota or NOTA)

VOCI = {
1:{
 "i Custodi": V("Plinio il Vecchio (naturalista, figlio di Como)","figura storica",
   "osservativo, enciclopedico, pacato, un filo latineggiante",["cataloga ciò che vede","'ho osservato che…'","trae sentenze dalla natura"],
   "Ho osservato che il lago, all'alba, rende ciò che la notte gli affida: anche la memoria fa così.","molto caratterizzata"),
 "la Gente delle Rive": V("proverbio dei pescatori (tradizione popolare)","tradizione",
   "concreto, proverbiale, caldo",["parla per proverbi","immagini d'acqua e di rete"],
   "Rete annodata stretta, pesce sicuro; parola annodata stretta, patto sicuro.","media"),
 "il Popolo del Bosco": V("parlata venatoria (cacciatori e sentieristi)","tradizione",
   "asciutto, terragno, pratico",["poche parole","sa di legna e di traccia"],
   "Il sentiero giusto non si grida: si segue.","media"),
 "le Sentinelle d'Altura": V("laconismo montano","tradizione",
   "scarno, essenziale, da vedetta",["frasi minime","rapporti, non discorsi"],
   "Vista una colonna di fumo a nord. Riferisco. Resto.","media (per sottrazione)"),
 "gli Ospiti e i Senza-riflesso": V("voce forestiera (ereditata dal luogo d'origine)","regola",
   "varia: ognuno porta la voce di dove viene",["accento d'altrove","non conosce i proverbi del lago"],
   "(Zara) Da noi non si annoda niente: si corre, e si ricorda con le zampe.","variabile",
   nota="i Forestieri non hanno una voce del regno: portano quella d'origine — utile per farli sentire 'fuori posto'"),
},
2:{
 "i Protettori": V("oratoria civica del libero comune (l'arringa del capitano del popolo)","tradizione",
   "solenne, fermo, collettivo ('noi')",["parla a nome di tutti","cadenza da giuramento"],
   "Giuro; e nel giuro non sono sola: chi tocca uno, ci tocca tutti.","molto caratterizzata"),
 "i Giurati": V("parlata schietta del soldato-contadino di confine","tradizione",
   "ruvido, breve, di parola data",["'detto è detto'","niente fronzoli"],
   "Detto è detto. Il cordone tiene.","media"),
 "Gente delle Conche": V("Arlecchino e Brighella (maschere bergamasche)","maschera",
   "terragno, svelto, comico, furbo-bonario",["battuta pronta","si finge sciocco ed è furbo","sapore bergamasco leggero"],
   "Io? Io zappo e taccio — ma il mio vino, quello sì che chiacchiera per me.","molto caratterizzata (comica)"),
 "Montanari del Garda": V("laconismo d'altura (variante del Garda)","tradizione",
   "secco, meteorologico, sentenzioso",["legge il tempo","frasi corte come fischi"],
   "Nuvola bassa, lingua corta.","media"),
},
3:{
 "il Signore e la Corte": V("registro machiavellico di corte","tradizione/figura",
   "liscio, freddo, aforistico, mai una parola di troppo",["aforismi sul potere","cortesia che minaccia"],
   "Chi sale cambia pelle; chi resta, la perde. Scegliete con calma.","molto caratterizzata"),
 "i Vassalli": V("Catullo (veronese) e la boria cavalleresca scaligera","figura storica/tradizione",
   "passionale, sprezzante, fiero (da Mastino)",["orgoglio che ringhia","minacce esatte e brevi"],
   "Mordo una volta sola, ma non lascio.","molto caratterizzata"),
 "Popolo dell'Aperto": V("Bonvesin de la Riva (volgare milanese, didascalico) + proverbio bracciante","figura storica/tradizione",
   "piano, paziente, un po' brontolone",["fatica e buon senso","mezza protesta sottovoce"],
   "Tiriamo l'aratro e la lingua corta: tanto, in cima, comanda la Serpe.","media"),
 "Mercanti delle Vie": V("pratica di mercatura + parlantina da fiera","tradizione",
   "rapido, transattivo, pettegolo",["tutto ha un prezzo","baratta notizie"],
   "Notizia fresca, prezzo giusto: la verità si paga con un'altra verità.","molto caratterizzata"),
},
4:{
 "i Dotti": V("il Dottor Balanzone (maschera bolognese)","maschera",
   "pomposo, pseudo-dotto, infarcito di latino",["'ergo', 'ut ita dicam'","cita per non concludere","si ascolta parlare"],
   "Ergo, ut ita dicam: la cosa è chiara a chi sa leggere — dunque taccia chi non ha letto.","molto caratterizzata (comica; all'occorrenza seria)"),
 "i Disputanti": V("la disputatio delle scuole (il retore che «vince chi convince»)","tradizione/registro",
   "agonistico, brillante, ribalta la tesi: «vince chi convince»",["argomenta ogni tesi","botta e risposta serrato","ama il duello dialettico"],
   "Concedimi solo questo — e allora ne segue il contrario: chi convince, vince.","molto caratterizzata"),
 "la Casa dell'Aquila": V("ottava rima ariostesca/tassiana (corte estense di Ferrara)","tradizione/figura",
   "epico-cavalleresco, alto, in rima",["parla in ottava rima","nobiltà e volo"],
   "Di nobil sangue è l'ala che vi parla, / e dove posa l'occhio il cielo cede; / chi nasce in alto impara a non piegarla: / l'Aquila non domanda — l'Aquila vede.","molto caratterizzata",in_rima="ottava rima"),
 "Contadini del Po": V("parlata di golena (proverbio d'acqua e d'argine)","tradizione",
   "umido, paziente, fatalista-bonario",["il fiume comanda","umorismo basso e saggio"],
   "Quando il Po vuole, il Po prende: noi s'alza l'argine e s'abbassa la testa.","media"),
},
5:{
 "gli Antichi": V("voce oracolare e arcaica (gli anziani delle fiabe, la sentenza del bosco)","tradizione",
   "lento, gnomico, a indovinello",["parla per enigmi e per nomi","sa più di quanto dice"],
   "Dì il tuo nome, piccolo: il bosco lo terrà più a lungo di te.","molto caratterizzata"),
 "i Solitari": V("laconismo schivo e diffidente","tradizione",
   "monosillabico, guardingo",["mezze frasi","mai gli occhi negli occhi"],
   "Passa. E non guardarmi negli occhi.","media"),
 "Creature della Rovina": V("filastrocca notturna (cantilena delle rovine)","tradizione",
   "cantilenante, in rima, un po' inquietante e infantile",["parla in filastrocca","gioca con le parole"],
   "Pietra che dorme non la svegliare, / chi dice il nome si fa scordare.","molto caratterizzata",in_rima="filastrocca"),
 "gli Esuli": V("voce ereditata dal regno d'origine","regola",
   "ognuno conserva la parlata di dove è fuggito",["accento d'altrove","tradisce la provenienza"],
   "(un esule della Serpe) Là cambiavo pelle per salire; qui non c'è pelle che tenga — e va bene così.","variabile",
   nota="ottimo per far capire da dove viene un esule dal solo modo di parlare"),
},
6:{
 "Cittadini del Leone": V("Dante e il fiorentino civile (con punte machiavelliche)","figura storica/tradizione",
   "alto, fiero, tagliente, capace di terzina",["eloquenza civica","orgoglio d'arte","può parlare in terza rima"],
   "Firenze parla e l'arte le risponde: / chi fa più bello tiene la ragione, / e ride di chi al merito s'asconde.","molto caratterizzata",in_rima="terza rima (facoltativa)"),
 "la Lupa e i suoi": V("Cecco Angiolieri (senese, comico-realista)","figura storica",
   "brontolone, sardonico, orgoglioso-amaro",["lamento spavaldo","vanto per dispetto"],
   "Firenze ride? Rida pure: Siena è più antica, e l'orgoglio non si compra al mercato.","molto caratterizzata"),
 "la Pantera libera": V("discrezione mercantile lucchese (la libertà che non si vanta)","tradizione",
   "riservato, fiero, sobrio, 'di seta'",["dice poco","conta invece di gridare"],
   "Lucca non grida la sua libertà: la conta, in seta e in silenzio.","media"),
 "Gente del Mare": V("parlata marinaresca + nitidezza 'galileiana' (Pisa)","tradizione/figura",
   "salato, pratico, preciso",["misura e prova","il mare non perdona"],
   "Il mare non mente e non perdona: misura due volte, salpa una.","molto caratterizzata"),
},
}

# voci TRASVERSALI (fuori-regni): valgono per chi non appartiene ai regni (o non a quello in cui si trova)
TRASVERSALI = {
 "forestiera": V("voce forestiera (ereditata dal luogo d'origine)","regola",
   "porta la parlata del luogo d'origine; nel regno in cui si trova è di passaggio, non vi appartiene",
   ["la voce è del posto da cui viene","non si modella sul regno ospite"],
   "Da dove vengo si dice in un altro modo; qui sono di passaggio.","media",
   nota="regola TRASVERSALE, non legata a un regno: vale per chi non appartiene ai regni (o non a quello in cui si trova)"),
 "antica": V("voce antica e gnomica (la sentenza semplice di chi ha visto molte estati)","tradizione",
   "lenta, semplice, gnomica; dice poco, e ciò che dice è più vecchio di chi lo dice",
   ["parla per piccole sentenze e domande","non spiega mai","la sua voce sa di tempo"],
   "Tante estati ho cantato su questa pietra. È tiepida anche stanotte: qualcosa la scalda.","molto caratterizzata",
   nota="regola TRASVERSALE (non di un regno): la voce di chi torna e ricorda; usata con parsimonia, mai per spiegare"),
}

# attacca 'voce' a ogni classe in societa.json + raccogli consolidato
consol = {"nota": NOTA, "regni": {}}
for k, folder in FOLD.items():
    sp = f"out_regni/{folder}/societa.json"
    soc = json.load(open(sp))
    vmap = VOCI[k]; applied = []
    for cl in soc.get("classi", []):
        if cl["nome"] in vmap:
            cl["voce"] = vmap[cl["nome"]]; applied.append(cl["nome"])
    soc["voci_nota"] = "ogni classe ha un blocco 'voce' (stile-modello). I personaggi ricorrenti si rifiniscono dopo."
    json.dump(soc, open(sp, "w"), ensure_ascii=False, indent=1)
    consol["regni"][str(k)] = {"nome": soc.get("regno", folder),
        "voci": {nome: vmap[nome] for nome in vmap}}
    print(f"  {folder:18} voci applicate: {len(applied)}")

consol["trasversali"] = TRASVERSALI
json.dump(consol, open("out_regni/_voci.json", "w"), ensure_ascii=False, indent=1)
json.dump({"$descrizione":"Voce di un gruppo: stile-modello ispirato a una figura/maschera/tradizione storica italiana. Non citazioni; battute originali. Consumato dagli script per dare voce in scrittura.",
   "modello":"figura storica | maschera | tradizione | regola","tipo_modello":"str","registro":"come parla",
   "tratti":["vezzi e marche di stile"],"in_rima":"false | 'ottava rima' | 'terza rima' | 'filastrocca'",
   "esempio_in_voce":"battuta ORIGINALE dell'animale nello stile","intensita":"molto caratterizzata | media | meccanica","nota":"avvertenza stile-modello"},
   open("out_regni/_schema/voce.schema.json", "w"), ensure_ascii=False, indent=1)

names = {1:"Laghi d'Occidente",2:"Laghi d'Oriente",3:"Pianura Alta",4:"Pianura Bassa",5:"Selva di Mezzo",6:"Toscana"}
with open("out_regni/_voci.md", "w") as f:
    f.write("# Voci dei regni — una maniera per ogni gruppo\n\n")
    f.write(f"_{NOTA}._\n\n")
    f.write("Così ogni animale parla già in modo diverso e coerente con la sua zona e il suo ruolo. ")
    f.write("Solo i personaggi che diventano ricorrenti riceveranno poi una voce individuale rifinita.\n\n")
    for k in range(1, 7):
        f.write(f"## {k} · {names[k]}\n")
        for nome, v in VOCI[k].items():
            rima = f" · **in rima**: {v['in_rima']}" if v["in_rima"] else ""
            f.write(f"- **{nome}** → *{v['modello']}* ({v['tipo_modello']}){rima}\n")
            f.write(f"  - registro: {v['registro']}\n")
            f.write(f"  - esempio (originale, in voce): «{v['esempio_in_voce']}»\n")
        f.write("\n")
    f.write("## Trasversali (fuori-regni)\n")
    for nome, v in TRASVERSALI.items():
        f.write(f"- **{nome}** \u2192 *{v['modello']}* ({v['tipo_modello']})\n")
        f.write(f"  - registro: {v['registro']}\n")
        f.write(f"  - esempio (originale, in voce): \u00ab{v['esempio_in_voce']}\u00bb\n")
    f.write("\n")
print("\n_voci.json/.md + _schema/voce.schema.json ; societa.json arricchiti")
