#!/usr/bin/env python3
"""societa_build — la SOCIETÀ del primo regno (Laghi d'Occidente) come modello.
Metodo Orwell (animali = classi e mestieri) + voce Calvino (un principio poetico
magico-realista che organizza tutto: 'il regno dei riflessi'). Pronta per estrarre
personaggi: regno -> classe -> corporazione/comunità -> individuo.
Emette societa.json (machine-readable), societa.md (narrativa), schema riusabile."""
import json, os
D = "out_regni/laghi_occidente"; os.makedirs(D, exist_ok=True)
os.makedirs("out_regni/_schema", exist_ok=True)

societa = {
 "regno": "laghi_occidente",
 "principio_calviniano": {
   "nome": "il regno dei riflessi",
   "idea": "Una cosa è vera due volte: una sulla riva, una nell'acqua. Qui non si scrive: si annoda e si rispecchia. La memoria, le leggi e i debiti del regno stanno nelle reti annodate dei Custodi e in ciò che il lago, all'alba, ricorda.",
   "regole_dolci": [
     "una parola data sull'acqua ferma all'alba è un patto: il lago l'ha sentita",
     "ogni comunità è conosciuta dal colore del suo fuoco sulla riva",
     "la nebbia del mattino si legge come un calendario",
     "chi non ha ancora un riflesso nel regno è un Ospite: il lago non lo conosce... per ora"
   ]
 },
 "classi": [
   {"nome": "i Custodi", "ruolo_sociale": "memoria, testimonianza, giudizio (non comando)",
    "animali": ["lince"], "rango": "alto per servizio, non per sangue",
    "come_vivono": "pochi, solitari; annodano nelle reti la storia del regno e 'vedono nel buio' le verità; siedono al Consiglio del Lago"},
   {"nome": "la Gente delle Rive", "ruolo_sociale": "spina dorsale: acqua, pesca, passaggi",
    "animali": ["lontra", "airone", "martin pescatore", "rana"], "rango": "medio",
    "come_vivono": "vivono di lago e di scambio; tessono reti, traghettano, leggono la nebbia"},
   {"nome": "il Popolo del Bosco", "ruolo_sociale": "boschi, sentieri, caccia e legna",
    "animali": ["cervo", "volpe", "tasso", "scoiattolo"], "rango": "medio",
    "come_vivono": "tra gli alberi; custodi dei sentieri segreti e del carbone; un po' diffidenti verso chi sta nell'acqua"},
   {"nome": "le Sentinelle d'Altura", "ruolo_sociale": "vedetta dei valichi verso il Muro delle Alpi",
    "animali": ["camoscio", "stambecco", "aquila", "marmotta"], "rango": "medio, isolato e fiero",
    "come_vivono": "in alto, messaggeri e guardiani dei passi; parlano poco, vedono lontano"},
   {"nome": "gli Ospiti e i Senza-riflesso", "ruolo_sociale": "forestieri, viandanti, esuli in ingresso",
    "animali": ["forestieri d'ogni specie", "tigre (rara)"], "rango": "fuori → in ingresso",
    "come_vivono": "accolti per diritto d'asilo, ma 'il lago non li conosce ancora': devono fare qualcosa di memorabile per essere annodati nella rete e diventare cittadini"}
 ],
 "corporazioni": [
   {"nome": "i Tessitori di Reti", "mestiere": "reti da pesca e reti della memoria (i nodi sono una scrittura)",
    "specie_tipiche": ["lontra", "ragno d'acqua"], "specialita_locale": "ogni villaggio ha un nodo-firma diverso",
    "commercia_con": ["chi, negli altri regni, vuole 'registrare' un patto senza fidarsi della legge scritta della Serpe"]},
   {"nome": "i Traghettatori", "mestiere": "passaggi del lago (l'unica via che non sia il lungo giro)",
    "specie_tipiche": ["airone", "rana gigante"], "specialita_locale": "tariffe in storie, non in oro: paghi con una notizia vera",
    "commercia_con": ["i mercanti della Serpe che devono attraversare", "le Sentinelle per le notizie d'altura"]},
   {"nome": "i Lettori di Nebbia", "mestiere": "leggere meteo e presagi nella foschia dell'alba",
    "specie_tipiche": ["martin pescatore", "civetta delle rive"], "specialita_locale": "consultati prima di ogni viaggio e di ogni Consiglio",
    "commercia_con": ["chiunque parta per un viaggio incerto"]},
   {"nome": "i Custodi del Fuoco", "mestiere": "il fuoco-segnale di ogni comunità e la ricetta segreta del suo colore",
    "specie_tipiche": ["volpe", "tasso"], "specialita_locale": "pigmenti minerali raccolti nei monti: verde-rame, rosso-ferro, blu-ardesia",
    "commercia_con": ["tutte le comunità per la Notte dei Fuochi sulle Rive"]},
   {"nome": "i Carbonai e Sentieristi", "mestiere": "carbone, legna e i sentieri segreti del bosco",
    "specie_tipiche": ["cervo", "tasso", "scoiattolo"], "specialita_locale": "conoscono passaggi che nessuna mappa segna, fino ai margini della Selva",
    "commercia_con": ["la Selva di Mezzo", "il Popolo del Bosco degli altri regni"]}
 ],
 "mobilita_sociale": "non per sangue ma per riconoscimento: chi compie un atto memorabile viene 'annodato nella rete' del regno e sale; un Ospite diventa cittadino quando il Consiglio registra ciò che ha fatto",
 "rapporti_tra_classi": "Custodi e Rive si rispettano per servizio reciproco; il Bosco diffida un po' delle Rive (alberi contro acqua); le Sentinelle sono isolate e fiere; gli Ospiti guardati con sospetto, perché la Serpe manda spie travestite",
 "tensione_viva": "la Serpe (Milano) vorrebbe imporre la sua scrittura e i suoi tributi; il regno difende il proprio modo 'annodato' di ricordare — chi controlla la memoria controlla il regno",
 "estrazione_personaggio": "un personaggio = regno (Laghi d'Occidente) → classe (es. Popolo del Bosco) → corporazione/comunità (es. i Sentieristi del villaggio dal fuoco verde-rame) → poi individualità. L'individuo eredita valori, mestiere ed estetica del gruppo, e li piega col suo carattere.",
 "esempi_di_estrazione": [
   {"chi": "Zara", "classe": "Ospiti e Senza-riflesso", "vive_con": "il Popolo del Bosco", "nota": "tigre forestiera, giovane: il lago non la conosce ancora, vuole fare qualcosa di memorabile"},
   {"chi": "Rocco", "classe": "Ospiti e Senza-riflesso", "provenienza": "Pianura Alta (la Serpe)", "nota": "arriva dalla pianura; doppiamente estraneo, ma onesto"}
 ],
 "ispirazione": {
   "orwell": "metodo: le classi/mestieri animali come specchio dei rapporti sociali — senza la satira politica, tono caldo per bambini con profondità adulta",
   "calvino": "voce: realismo magico leggero (i riflessi, le reti-memoria, la nebbia-calendario, i fuochi-colore) — originale ma coerente, 'temperatura bassa'"
 }
}
json.dump(societa, open(f"{D}/societa.json", "w"), ensure_ascii=False, indent=1)

# schema riusabile del blocco società
schema = {
 "$descrizione": "Blocco SOCIETÀ di un regno (si aggiunge a regno.json). Metodo Orwell (classi/mestieri animali) + un principio_calviniano per regno. Consumato dagli script di estrazione personaggi.",
 "regno": "slug del regno",
 "principio_calviniano": {"nome": "str", "idea": "il conceit magico-realista che organizza la società", "regole_dolci": ["usanze fiabesche ma coerenti"]},
 "classi": [{"nome": "str", "ruolo_sociale": "str", "animali": ["..."], "rango": "alto|medio|basso|fuori", "come_vivono": "str"}],
 "corporazioni": [{"nome": "str", "mestiere": "str", "specie_tipiche": ["..."], "specialita_locale": "ciò che differenzia questa zona dalle altre", "commercia_con": ["regni/corporazioni — genera i rapporti tra regni"]}],
 "mobilita_sociale": "come si sale/scende (o non si può)",
 "rapporti_tra_classi": "tensioni e alleanze interne",
 "tensione_viva": "il conflitto motore del regno",
 "estrazione_personaggio": "regola: regno → classe → corporazione/comunità → individuo",
 "esempi_di_estrazione": [{"chi": "str", "classe": "str", "nota": "str"}],
 "ispirazione": {"orwell": "metodo", "calvino": "voce"}
}
json.dump(schema, open("out_regni/_schema/societa.schema.json", "w"), ensure_ascii=False, indent=1)

# versione narrativa (per sentire la voce)
with open(f"{D}/societa.md", "w") as f:
    s = societa
    f.write(f"# Società dei Laghi d'Occidente — *{s['principio_calviniano']['nome']}*\n\n")
    f.write(f"> {s['principio_calviniano']['idea']}\n\n")
    f.write("Usanze del regno:\n")
    for r in s["principio_calviniano"]["regole_dolci"]: f.write(f"- {r}\n")
    f.write("\n## Le classi (animali come ceti, metodo Orwell)\n")
    for c in s["classi"]:
        f.write(f"- **{c['nome']}** ({', '.join(c['animali'])}) — *{c['ruolo_sociale']}*; {c['come_vivono']}\n")
    f.write("\n## Le corporazioni (mestieri; differiscono per zona → nascono gli scambi tra regni)\n")
    for k in s["corporazioni"]:
        f.write(f"- **{k['nome']}** — {k['mestiere']}. Specialità: {k['specialita_locale']}. Commercia con: {', '.join(k['commercia_con'])}.\n")
    f.write(f"\n**Mobilità sociale:** {s['mobilita_sociale']}.\n\n")
    f.write(f"**Rapporti tra classi:** {s['rapporti_tra_classi']}.\n\n")
    f.write(f"**Tensione viva:** {s['tensione_viva']}.\n\n")
    f.write("## Come si estrae un personaggio\n")
    f.write(f"{s['estrazione_personaggio']}\n\n")
    for e in s["esempi_di_estrazione"]:
        f.write(f"- **{e['chi']}** → classe *{e['classe']}*" + (f", vive con {e['vive_con']}" if e.get('vive_con') else "") + f". {e['nota']}\n")

print("società del primo regno scritta:")
print(" -", f"{D}/societa.json", "/ societa.md  + out_regni/_schema/societa.schema.json")
print(" classi:", len(societa["classi"]), " corporazioni:", len(societa["corporazioni"]))
print(" principio:", societa["principio_calviniano"]["nome"])
