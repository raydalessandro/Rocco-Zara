# docs/ILLUSTRATORE.md — lo spec dell'illustratore (compagno di `.claude/agents/illustratore.md`)

Come si **consegnano in repo** le immagini HD di Rocco & Zara. Eredita la disciplina di isola
(illustratore v1.1, validata su 2 volumi: la regola §0 nacque dopo un recovery in cui i ritratti
erano finiti nel volume invece che nel catalogo) e la ri-punta sul nostro layout, con una cosa in
più: l'aggiornamento del **registro entità** del serializzatore.

## 1. I 3 contesti (path proposti — da ratificare al merge)

`public/` è servito da Next.js (il livello-libro pubblico usa `next/image`): è la casa naturale.

### 1a — scena (tavola = pagina del libro)
```
public/libro/<vol>/<ep>/_hd/<ep>_tav<NN>_hd.jpg      # HD per stampa
public/libro/<vol>/<ep>/<ep>_tav<NN>.jpg             # low-res di lavoro (resta dov'è)
```
`<vol>`=`vol1`… (un volume per regno) · `<ep>`=`ep01`… · `<NN>`=numero tavola (01..).

### 1b — intro / decoro di volume (NON riusabile come reference)
```
public/libro/<vol>/_intro/_hd/<vol>_intro_<slug>_hd.jpg
```
Solo illustrazioni *prodotte per il volume e non riusabili* (sigilli, composizioni d'apertura
non-ritratto). **Un ritratto NON va qui** → catalogo (1c).

### 1c — reference di catalogo (entità riusabile)
```
public/reference/<entityId>/_hd/<entityId>_<vista>_hd.jpg
public/reference/<entityId>/<entityId>_<vista>.jpg          # low-res
```
`<entityId>` = l'id del registro (es. `char_rocco`, `char_zara`, `luogo_le_coppelle`,
`obj_cordone`) · `<vista>` ∈ `fronte | tre_quarti | profilo | dettaglio | turnaround`.

## 2. Il delta su isola: aggiornare il registro entità

In isola il catalogo era solo file. Da noi le reference vivono in un **indice machine-readable**
che il **serializzatore** legge e allega come *binding*: `saga/serializzatore/state/entities.json`.
Quindi dopo aver depositato un HD in (1c), **aggiorna il record dell'entità**:

```jsonc
"entities": {
  "char_rocco": {
    "entityId": "char_rocco",
    "kind": "character",
    "descriptor": "…",                 // l'aspetto canonico (già presente)
    "imageUrl": "public/reference/char_rocco/_hd/char_rocco_fronte_hd.jpg",  // ← QUI
    "status": "confermata"             // ← da "da_generare" a "confermata"
  }
}
```

Finché `imageUrl` manca o `status` ≠ `confermata`, il serializzatore marca l'entità
`da_generare` e ogni tavola che la contiene finisce in `missing[]` (il cancello del Passo 0).
**Una reference depositata senza aggiornare il registro è invisibile alla pipeline.**

> La branch 1c è l'**unica** in cui, oltre alle immagini, è ammesso modificare `entities.json`.
> Tutte le altre branch immagini contengono **solo** immagini.

## 3. Specifiche file

| Parametro | Valore |
|---|---|
| Formato | **JPEG** (`.jpg`, mai `.jpeg`/`.JPG`/`.png`) |
| Qualità | **95** |
| Colore | **sRGB** (RGB; la conversione CMYK è dello stampatore) |
| Risoluzione min | **1824×2736** verticale 2:3 · ideale ≥ **2000×3000** |
| Metadato DPI | **300** (informativo) |
| Peso tipico | 300-700 KB/pagina |
| Naming | **lowercase snake_case**, suffisso `_hd` obbligatorio per la HD |

## 4. Workflow

```bash
# 0. main aggiornato
git checkout main && git pull origin main
# 1. branch dedicata (uno scope = una branch)
git checkout -b claude/hd-ep01            # o claude/hd-catalogo-protagonisti / claude/hd-intro-vol1
# 2. crea _hd/ e copia i file col naming giusto (§0 decide il contesto)
mkdir -p public/libro/vol1/ep01/_hd
cp /upload/ep01_tav01.jpg public/libro/vol1/ep01/_hd/ep01_tav01_hd.jpg
# … (+ se 1c: aggiorna entities.json)
# 3. verifica formato
python3 -c "from PIL import Image,sys; [print(f,Image.open(f).size,Image.open(f).mode) for f in sys.argv[1:]]" public/libro/vol1/ep01/_hd/*.jpg
# 4. un commit (messaggio standard), solo file di scope
git add public/libro/vol1/ep01/_hd/ && git status && git commit -m "ep01: 21 JPG HD q95 in public/libro/vol1/ep01/_hd/ (tavole 1..21)"
# 5. push + PR verso main — NON mergiare
git push -u origin claude/hd-ep01
```

## 5. Checklist di review (Ray, prima del merge)

- [ ] §0: contesto giusto per **ogni** file (ritratti → catalogo, non volume)
- [ ] path nel contesto giusto · naming `<…>_hd.jpg` lowercase snake_case
- [ ] formato JPEG q95, sRGB, ≥1824×2736 2:3, DPI 300
- [ ] **1c**: `entities.json.imageUrl` aggiornato e coerente col path, `status: confermata`
- [ ] diff pulito: solo file aggiunti (+ `entities.json` se 1c), nessun low-res toccato, niente `.md`/codice
- [ ] un commit · branch up-to-date · CI verde

## 6. Confine (cosa NON è dell'illustratore)

Generare e comporre i prompt è dello **scenografo**. Toccare `lib/`, la prosa, lo schema dati è di
altre corsie. L'illustratore **archivia** gli HD e **aggiorna il registro reference** — niente altro.
