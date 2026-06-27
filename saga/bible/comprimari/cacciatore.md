# il Cacciatore — scheda canone (comprimario · cattivo fuori-Serpe)

> Nome proprio: **dal lessico** (da assegnare). Comprimario **ricorrente** → Tier 2 compilato.
> Antagonista a **alleanza mobile**: lavora con la Serpe per interesse, non per fedeltà.

- **specie**: martora (predatore agile, instancabile) — *adattabile al roster*
- **tipo**: comprimario
- **attribute_ear (dominante)**: distinguere
- **età / mondo**: adulto / **forestiero** (origine taciuta)

### Aspetto canonico (bloccato — coerenza visiva)
- firma visiva: **un orecchio strappato** (una vecchia caccia finita male) — il marchio di chi
  ha già perso una volta e non lo perdona. Al collo, **un dente** di una cattura: il suo unico
  vezzo (al limite del "pegno portato" — mai vestiti).

### Natura
- rapido, freddo, **ossessionato dalla gloria**. Non *odia* le prede: le **vuole**.
- corteggia chi paga finché conviene; molla senza rimorso.

### Paura (arco lungo, se ne ha)
- prima emersione: quando qualcuno lo chiama «uno che non ha mai preso niente di grande» →
  tocco: il terrore di **restare un nome che nessuno ricorda** → fioritura: per questo dà la
  caccia al **"fantasma bianco"** (Toraki) — la cattura che lo renderebbe leggenda.

### Il dono / la forza
- **legge le tracce come nessuno**: segue Toraki dove gli altri perdono il filo.
- **veloce quasi quanto Zara** — ed è ciò che lo rende il suo specchio cattivo.

### Arco di crescita (per soglie)
- *potenziale, wildcard*: da «la gloria è **possedere** la leggenda» a (forse) «la leggenda
  non si possiede» — uno scatto che potrebbe **ribaltarlo in alleato tardo**. O resta carta che
  volta col vento (Turchini/Vermigli).

### Voce — a due tier
**Tier 1 — registro di gruppo.**
- **forestiero?** **sì** → **voce forestiera** (ereditata dal luogo d'origine, che *tiene
  nascosto*: la parlata lo tradisce un po', ma lui non dice da dove viene). Origine vera: *aperta*.

**Tier 2 — firma individuale.**
- **superficie**: asciutto, sportivo-feroce, parla di **caccia** anche quando parla d'altro.
  **sotto**: la fame d'essere ricordato.
- **non direbbe MAI**: ammettere che una preda **l'ha battuto**.

> **Test (CARTA_VOCE §1.4):** «Il bianco lascia troppa poca traccia. Lo prendo lo stesso.» → si capisce chi parla.

<!-- BLOCCO-MACCHINA → seed.characterVoices ; voce_personaggio = lib/types.ts CharacterVoice -->
```yaml
registro_gruppo:
  regno: <forestiero — origine taciuta>
  gruppo: forestiero
  registro_ref: forestiera        # regola "voce forestiera" (_voci.md); si risolve all'origine

voce_personaggio:
  name: <dal lessico>
  role: comprimario
  archetype: il cacciatore di gloria — asciutto, feroce, sportivo
  underStress: accelera, alza la posta, non molla la preda
  ritmo: colpo breve, da inseguimento; verbi di caccia
  words: traccia / preda / lo prendo / il bianco
  never: ammette che una preda l'ha battuto
```

### EAR
- **Δ** *(dominante)* la sua arte è **distinguere il vero segno dal falso** (lo specchio Δ di Zara).
- **⇄** quasi nullo: non lega, **insegue**; le sue alleanze sono baratti.
- **⟳** se mai cambierà, sarà per **ossessione esaurita**, non per fedeltà.

### Mondo affettivo / relazioni
- **Toraki**: la sua **preda-ossessione** — e la posta dei cutaway (noi temiamo per Toraki).
- **Zara**: lo **specchio cattivo** — stessa velocità, stesso orgoglio, scopo opposto.
- **la Serpe**: **datore di lavoro**, non padrone (lo paga; può essere **comprato da altri**).

### Nel mondo (canone cartografo) + aggancio alla missione
- **regno d'origine**: forestiero, origine **taciuta** (da definire se serve).
- **bioma d'origine**: aperto.
- **perché entra**: la **caccia a Toraki** è la sua occasione di gloria — la prende dalla Serpe.
- **aggancio Cordone/Serpe**: **ingaggiato** dalla Serpe per intercettare Toraki e il Cordone;
  alleanza **mobile** → seme di ribaltamento futuro.
