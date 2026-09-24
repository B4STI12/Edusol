# EDUSOL Website

Statische Website von EDUSOL, gebaut mit [Eleventy](https://www.11ty.dev/) und ausgeliefert über GitHub Pages.

## Entwicklung

```bash
npm ci
npm start          # Dev-Server mit Live-Reload auf http://localhost:8080
npm test           # Build + HTML-Validierung + Linkcheck + axe + Formular-E2E
npx @lhci/cli@0.15.1 autorun   # Lighthouse mit Budgets (LCP ≤ 2,5 s, CLS ≤ 0,1, JS ≤ 20 KB …)
```

Für axe, Formular-Test und Lighthouse wird Chromium benötigt (`npx playwright install chromium`
bzw. `CHROMIUM_PATH=…` / `CHROME_PATH=…`).

## Struktur

| Pfad | Inhalt |
|---|---|
| `src/_data/site.js` | **Stammdaten**: E-Mail, Adresse, Akut-Telefon und -Zeiten, WhatsApp, Formular-Endpoint, `security.txt`-Ablauf |
| `src/_data/fields.json` | Inhalte und Farben der fünf Wirkungsfelder (erzeugt je eine Seite) |
| `src/_data/team.json` | Team-Profile (Rolle, Wirkungsfelder) für „Wir sind EDUSOL“ |
| `src/_data/finder.json`, `stories.json`, `steps.json` | „Wo steht ihr gerade?“, Einblicke, Ablauf-Schritte |
| `src/_includes/` | Basis-Layout, Header, Footer, JSON-LD |
| `src/*.njk` | Seiten (Startseite, Über uns, Kontakt, Datenschutz, Impressum, 404, robots, sitemap, security.txt) |
| `src/assets/` | CSS (Design-Tokens), JS, Bilder, OG-Bild |
| `src/static/` | Favicons im Webroot |
| `scripts/` | Prüfskripte und Icon-Generator (`npm run icons`) |

Navbar und Footer existieren nur einmal (`src/_includes/partials/`).
Inline-Styles sind per `html-validate` verboten, damit die CSP ohne `'unsafe-inline'` auskommt.
Das CSS (`src/assets/css/main.css`, ohne Framework) wird beim Build mit Lightning CSS minifiziert
und als `assets/css/site.css` ausgeliefert.

**Fotos:** Solange keine Bilder vorliegen, zeigen gestrichelte Rahmen „Foto … folgt“ an
(`partials/photo-slot.njk`). `npm run check:placeholders` listet sie zusammen mit den Text-Platzhaltern auf.

## Deployment

### Vercel (empfohlen)

`vercel.json` enthält Build-Einstellungen und die Security-Header (CSP inkl. `frame-ancestors`, HSTS,
`nosniff`, `Permissions-Policy` …). Einrichtung einmalig im Vercel-Dashboard:

1. *Add New → Project* → Repository `BastianBinus/Edusol` importieren (Framework: *Other*; der Rest kommt aus `vercel.json`).
2. Deployen. Jeder Push auf `main` geht live, jeder Pull Request bekommt ein Preview (automatisch `noindex`).
3. Eigene Domain unter *Settings → Domains* hinzufügen. `SITE_URL` nur setzen, falls die Domain nicht die
   Produktions-Domain des Projekts ist.

Hinweis: Der Hobby-Plan ist nur für nicht-kommerzielle Nutzung erlaubt – für EDUSOL braucht es Pro.
Die Datenschutzerklärung nennt beim Build auf Vercel automatisch Vercel als Hoster.

### GitHub Pages (bisher)

Jeder Push auf `main` baut, prüft und deployt über `.github/workflows/deploy.yml`.
Basis-URL und Pfad-Präfix kommen automatisch aus `actions/configure-pages` –
bei einer eigenen Domain muss am Code nichts geändert werden.

**Rollback:** Commit auf `main` reverten oder unter *Actions* den letzten funktionierenden
„Build & Deploy“-Lauf erneut ausführen.

## Vor dem Go-live

- [ ] Platzhalter in `src/_data/site.js` ersetzen (`npm run check:placeholders -- --strict`)
- [ ] Datenschutzerklärung und Impressum rechtlich prüfen lassen
- [ ] Auftragsbearbeitungsvertrag (DPA) mit Formspree abschliessen
- [ ] `securityTxtExpires` jährlich erneuern (Kalendereintrag!)
