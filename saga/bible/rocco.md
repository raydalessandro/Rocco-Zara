# Rocco — scheda canone (protagonista)

> Seme del canone, **estratto dalla storia origine** (non inventato). Da rifinire, ma
> i campi *bloccati* (aspetto, voce, doni, paura) sono canone duro per la coerenza
> "da serie". Vedi `_template_personaggio.md` per la struttura, e
> `ontologia/COME_SI_APPLICA.md` per l'EAR.

- **specie**: rinoceronte
- **tipo**: protagonista
- **attribute_ear (dominante)**: `connettere` *(è quello che apre all'altro: offre
  l'ombra, attraversa il fiume — il suo modo è legare/proteggere)*
- **età**: giovane (cucciolo cresciuto)
- **mondo**: la savana

### Aspetto canonico (bloccato — coerenza visiva)
- corno **storto** (la madre dice che si raddrizzerà — non si è ancora raddrizzato);
- **zampe troppo grandi** per il corpo; corporatura **massiccia**;
- pelle spessa.
> Il corno storto è la **firma visiva** di Rocco: non si "corregge" nelle illustrazioni.

### Natura
- **goffo**: inciampa, **rompe le cose** al suo passaggio (rami, nidi), fa rumore;
  starnuti fortissimi che spaventano i piccoli.
- gentile, **sincero**, premuroso fino all'ansia di far danni.

### Paura (arco lungo)
- le **cose piccole e veloci**: teme di far loro male senza volerlo (uccellini,
  farfalle). *Prima emersione: già nell'origine. Da toccare e far fiorire negli archi.*

### Il dono (la forza nascosta — motore tematico)
- è **grande, solido, pesante**: **fa ombra** (riparo dal sole nella savana), il
  **vento non lo sposta**, **attraversa il fiume in piena** portando Zara in groppa.
- *Pugno*: ciò che lo fa sentire goffo/sbagliato è esattamente la sua forza nel
  contesto giusto.

### Arco di crescita (per soglie — `continuita_e_anti_drift.md`)
- da **vergogna del corno storto / "sono solo goffo"**
- a **"il corno storto è mio, è parte di me"** → **"essere grande è la mia forza"**.
> Avanza per **scatti guadagnati** (episodi `respiro`/`cardine`), non un po' a puntata.

### Voce
- si scusa spesso («Scusa!»), insicuro, esita prima di osare; quando si fida, **agisce
  con decisione** (nella tempesta diventa saldo). Lessico concreto, frasi semplici.
- **non direbbe mai**: una vanteria; non si mette mai al centro.

<!--
  BLOCCO-MACCHINA — il serializzatore estrae QUESTO per popolare `seed.characterVoices`.
  Campi 1:1 con `lib/types.ts → CharacterVoice`. Stessa logica di CARTA_VOCE §4.
  `voce_personaggio` (Tier 2) compilato perché Rocco è ricorrente (protagonista).
  `registro_gruppo` (Tier 1) è forward-compat: lo struct attuale lo ignora.
-->
```yaml
registro_gruppo:                # Tier 1 — baseline ereditata dal mondo
  regno: pianura_alta
  gruppo: "Popolo dell'Aperto"
  registro_ref: "trasversali/forestiera"   # forestiero: porta la parlata d'origine

voce_personaggio:               # Tier 2 — = CharacterVoice (lib/types.ts)
  name: "Rocco"
  role: "protagonista"
  archetype: "il grande goffo — gentile, sincero, premuroso (forza nascosta)"
  underStress: "si scusa, esita prima di osare; quando si fida agisce con decisione"
  ritmo: "frasi semplici, lessico concreto"
  words: "Scusa! / concreto, cose che si toccano"
  never: "una vanteria; non si mette mai al centro"

# repertorio_crescita (PCG) — verbi FISICI del focal per banda dell'asse di crescita.
# Lo legge saga/serializzatore/src/pcg.ts (focalDirections → narratorBrief). Qualitativo:
# vive qui, non nel codice. Provenance: condensato dal Vol.1 «I Laghi del Vespro».
# NB axis-id: qui = id del saga_graph (fixture: vergogna_del_corno). DA RICONCILIARE con
# saga_config.long_arcs.growth (vergogna_corno) e la scheda Vol.1 (la-mole ingombro→riparo).
repertorio_crescita:
  vergogna_del_corno:
    prima:
      - "gira la testa così che il corno storto non si veda"
      - "abbassa il corno solo per togliersi di mezzo, non per spingere"
      - "cammina pianissimo, la zampa sospesa, per farsi piccolo"
    attraversa:
      - "smette di tenere il fiato e resta fermo: la sua ombra fa una macchia di fresco"
      - "capisce col corpo che la mole non è solo un pericolo da nascondere"
    dopo:
      - "fa muro alla pioggia, la schiena alla tempesta"
      - "si mette di traverso all'imbocco del buio e tiene aperta la luce"
      - "diventa riparo: ombra per i pesci, spalla dove l'uccello si posa"
```

### EAR di Rocco
- **Δ** ciò che lo distingue: la mole e il corno storto (lo fanno sentire "altro").
- **⇄** come si lega: offrendo riparo, portando, proteggendo (l'ombra, la groppa).
- **⟳** cosa cambia in lui: dall'imbarazzo all'accettazione della propria forza.

### Mondo affettivo
- la **madre** (si preoccupa, lo aspetta; "non andare troppo lontano").

---
*Stato: seme da rifinire. Bloccati: aspetto, paura, dono, voce. Aperti: nome madre,
dettagli del passato, evoluzione precisa dell'arco lungo (si fissa con gli archi).*

---

---

### Nel mondo (canone cartografo) + aggancio alla missione
- **Regno d'origine**: **Gran Ducato** — il regno della **Serpe**/Serpe (corte,
  legge scritta, tributi), classe **Popolo dell'Aperto**: in fondo alla piramide del
  tributo. **Forestiero** (rinoceronte, fuori roster); arrivando ai Laghi è **doppiamente
  estraneo** — la sua estraneità è il motore. Villaggio d'origine: da fissare nella
  **Spina** della pianura.
- **Bioma d'origine**: **savana** (l'aperto/coltivo della pianura, reskin OSM).
- **Voce**: *forestiera* (porta la parlata di dove viene); vedi `cartografia/regni/_voci.md`.
- **Perché parte con Zara**: la causa di **Toraki** (legare i liberi contro la Serpe) è
  la **speranza del suo popolo**, oppresso dalla Serpe — movente personale, non solo
  amicizia. Il suo villaggio è sotto il tributo di **Artiglio** (vedi
  `cartografia/regni/pianura_alta/la_serpe.md`).
- **Origine del viaggio**: arriva alla **soglia** dei Laghi del Vespro — la **collina
  dell'incontro** (B1, Spondalta; vedi `cartografia/ORIGINE.md`).
