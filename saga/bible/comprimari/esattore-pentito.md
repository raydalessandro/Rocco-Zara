# l'Esattore pentito — scheda canone (comprimario · ex-Serpe)

> Nome proprio: **dal lessico** (da assegnare). Comprimario **ricorrente** → Tier 2 compilato.
> EAR: `../../ontologia/COME_SI_APPLICA.md`. Voce-resa: `../../voce/CARTA_VOCE.md`.

- **specie**: mulo (bestia da soma dell'Aperto) — *adattabile al roster (`../../cartografia/regni/_faunario.md`)*
- **tipo**: comprimario
- **attribute_ear (dominante)**: cambiare
- **età / mondo**: adulto / l'Aperto del **Gran Ducato**

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: **il segno del basto** sul collo — il callo dei carichi che ha portato per anni
  e non porta più. Non se l'è tolto: *lo porta vuoto.* (segno **naturale**, mai finimenti-vestito.)

### Natura
- piano, paziente, **testardo**; porta la vergogna in silenzio, non la spiega.
- pratico: ragiona per pesi e per strade, non per parole.

### Paura (arco lungo, se ne ha)
- prima emersione: quando **Artiglio lo riconosce** → tocco: che la sua diserzione **faccia
  pagare i suoi** rimasti nell'Aperto → fioritura: la crisi quando la Serpe li usa davvero.

### Il dono / la forza
- **sa come la Serpe muove il tributo**: dove Artiglio è cieco, quali strade si possono evitare.
- la **pazienza del portatore**: regge pesi — fisici e non — più a lungo di chiunque.

### Arco di crescita (per soglie)
- da «ho collaborato per sopravvivere, **non valgo**» a «il riscatto è un peso che **scelgo** di
  portare» — scatto guadagnato. *(specchio dell'arco di Rocco: vergogna → valore.)*

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **regno + gruppo**: Gran Ducato / «Popolo dell'Aperto» → registro *"piano, paziente, un po'
  brontolone"* (`_voci.json`). *(per una comparsa basterebbe questo.)*
- **forestiero?** no (è del Gran Ducato).

**Tier 2 — firma individuale.**
- **superficie**: poche parole, terragne, un filo brontolone. **sotto**: la vergogna e una
  lealtà nuova che non osa dichiarare.
- **non direbbe MAI**: una promessa che non è sicuro di mantenere — *ne ha già tradita una.*

> **Test (CARTA_VOCE §1.4):** «Il carico lo poso io. Voi tirate dritto.» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: pianura_alta
  gruppo: Popolo dell'Aperto
  registro_ref: pianura_alta/Popolo dell'Aperto

voce_personaggio:
  name: <dal lessico>
  role: comprimario
  archetype: il portatore pentito — piano, terragno, schivo
  underStress: si chiude, abbassa la testa, porta in silenzio
  ritmo: periodo piano, un po' strascicato; frasi brevi e pratiche
  words: il carico / posato / non chiedete
  never: promette ciò che non è sicuro di mantenere
```

### EAR
- **Δ** il segno del basto e l'essere **uno di dentro** che è uscito.
- **⇄** porta **nel gruppo** la conoscenza della Serpe (lega i due al come funziona il tributo).
- **⟳** ha **cambiato lato** — e può **ri-cambiare**: è il filo del ritorno (i suoi, la leva).

### Mondo affettivo / relazioni
- **i suoi nell'Aperto**: la leva che la Serpe può tirare (e il suo movente più vero).
- **Rocco**: stessa terra, vergogne speculari → **fiducia da conquistare**.
- **Sòrcio** (il ratto ambiguo): vecchia conoscenza del "giro" → può venderlo o aiutarlo.

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno d'origine**: Gran Ducato — **Popolo dell'Aperto**, in fondo alla piramide del tributo.
- **bioma d'origine**: l'**aperto** (grass-farmland).
- **perché entra**: cerca un modo di **riscattarsi** e di proteggere i suoi → la causa del
  Cordone gli offre la possibilità (movente personale, non solo funzione).
- **aggancio Serpe**: **ex-uomo di Artiglio**; disertore noto; leva sui suoi rimasti.
