# web/ — sala di regia di *le Terre Annodate*

Interfaccia statica (una pagina) per consultare la bibbia del mondo e generare semi di puntata.
**Non ha dati hardcoded:** legge tutto a runtime dai file della repo. Modifichi un file → ricarichi la pagina → la UI è aggiornata.

## Pezzi
| file | cos'è |
|---|---|
| `index.html` | guscio + CSS (tema "Atlante del Vespro") + schermata di caricamento |
| `app.js` | il motore: scarica i dati, li adatta e disegna le sezioni |
| `data/*.json` | livello **narrativo** (prosa che non vive altrove nella repo) |
| `tools/build_cast.mjs` | rigenera `data/cast.json` dalle schede comprimari |
| `img/` | illustrazioni (vedi `img/README.md`) |

## Sezioni
Plancia (+ **Cosmologia**) · Personaggi · **Cast** · I Regni · Atlante · La Storia · Il Viaggio · Ritornelli & semi · Banco.

## Da dove legge i dati

**In diretta dai file canonici della repo** (editi lì → la UI cambia):
- regni → `saga/cartografia/regni/<id>/regno.json` + `societa.json`
- atlante (griglia 5×5, terre, quote, acque, città-rovina) → `saga/cartografia/regno/atlante.json`
- la Serpe → `saga/cartografia/regni/pianura_alta/la_serpe.json`
- **Cast**: l'indice da `web/data/cast.json`; ogni **scheda** è caricata al volo da `saga/bible/comprimari/<slug>.md` quando la apri
- **Cosmologia** → `saga/bible/COSMOLOGIA.md`

**In `web/data/`** (prosa sintetizzata, anch'essa nella repo e modificabile):
`personaggi.json` (Rocco/Zara + Toraki) · `viaggio.json` · `ritornelli.json` · `narrativa.json` (pitch, motore nascosto, 7 zone, Luoghi Antichi, atlante editoriale) · `origine.json` (i 5 capitoli) · `cast.json` (indice del cast, **generato**).

### Rigenerare l'indice del cast
Quando aggiungi/rinomini schede in `saga/bible/comprimari/`, dalla root della repo:
```bash
node web/tools/build_cast.mjs
```
(L'arco di ogni scheda è dedotto da `MAPPA_CAST.md`; gli override editoriali sono in cima allo script.)

### Immagini
Vedi `img/README.md`. In breve: metti `web/img/regni/<id>.webp` e `web/img/cast/<slug>.webp` e appaiono da soli; finché non ci sono, resta la direzione artistica (palette + prompt da `estetica` in `regno.json`).

### Come avviene il caricamento
`app.js` prova prima il **percorso relativo** (`../saga/…`, `./data/…`) — funziona servito dalla repo / da Pages / da un Vercel project con root su `web/` — e se fallisce ripiega su **GitHub raw** (`raw.githubusercontent.com/raydalessandro/Rocco-Zara/main/…`, fallback `master`). Tutte le richieste usano `cache:'no-store'`.

## Aprirla in locale
Doppio-clic (`file://`) → il browser blocca il fetch locale. Servila via http:
```bash
cd web && python3 -m http.server 8000   # http://localhost:8000
```
Da `file://` ripiega comunque su GitHub raw (mostra l'ultimo commit).

## Deploy

### Vercel (consigliato per questa repo)
La repo ha già l'app Next "scrivia" (`vercel.json` → framework nextjs). Per pubblicare **la sala di regia statica** come progetto a parte:
1. Vercel → New Project → stessa repo.
2. **Root Directory = `web`**, Framework Preset = **Other**, niente build command, Output = `web`.
3. I `saga/…` stanno fuori da quella root: l'app li prende da **GitHub raw** (fallback automatico). `web/data/…` e `web/img/…` sono serviti dal deploy.

### GitHub Pages (alternativa)
Pages serve l'intera repo, quindi anche i `../saga/…` relativi funzionano: Settings → Pages → branch `main`, root → `https://raydalessandro.github.io/Rocco-Zara/web/`.

## Nota sullo stack (immagini in arrivo)
Questa è la **sala di regia / bibbia** (strumento interno): statica va benissimo ed è già pronta per le immagini (slot + direzione artistica). Per il **libro illustrato pubblico** conviene invece una route nell'app Next esistente (`app/`), che ha già `app/api/images/route.ts` e `next/image`: lì le illustrazioni vanno ottimizzate e impaginate. I due usi possono convivere su due progetti Vercel dalla stessa repo.

## Se il branch di default non è `main`
In cima a `app.js`: `const BRANCHES = ['main','master'];` — ordine dei fallback per GitHub raw.
