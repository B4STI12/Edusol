# EDUSOL Website

Statische Website von EDUSOL, gebaut mit [Eleventy](https://www.11ty.dev/) und ausgeliefert über GitHub Pages.

## Entwicklung

```bash
npm ci
npm start          # Dev-Server mit Live-Reload auf http://localhost:8080
npm test           # Build + HTML-Validierung + Linkcheck + axe (WCAG 2.2 AA)
```

Für `npm run check:a11y` wird Chromium benötigt (`npx playwright install chromium`
oder `CHROMIUM_PATH=/pfad/zu/chromium`).

## Struktur

| Pfad | Inhalt |
|---|---|
| `src/_data/site.js` | **Stammdaten**: E-Mail, Adresse, Telefon, WhatsApp, Formular-Endpoint, `security.txt`-Ablauf |
| `src/_data/fields.json` | Inhalte der fünf Wirkungsfelder (erzeugt je eine Seite) |
| `src/_includes/` | Basis-Layout, Header, Footer, JSON-LD |
| `src/*.njk` | Seiten (Startseite, Über uns, Kontakt, Datenschutz, Impressum, 404, robots, sitemap, security.txt) |
| `src/assets/` | CSS (Design-Tokens), JS, Bilder, OG-Bild |
| `src/static/` | Favicons im Webroot |
| `scripts/` | Prüfskripte und Icon-Generator (`npm run icons`) |

Navbar und Footer existieren nur einmal (`src/_includes/partials/`).
Inline-Styles sind per `html-validate` verboten, damit die CSP ohne `'unsafe-inline'` auskommt.

## Deployment

Jeder Push auf `main` baut, prüft und deployt über `.github/workflows/deploy.yml`.
Basis-URL und Pfad-Präfix kommen automatisch aus `actions/configure-pages` –
bei einer eigenen Domain muss am Code nichts geändert werden.

## Vor dem Go-live

- [ ] Platzhalter in `src/_data/site.js` ersetzen (`npm run check:placeholders -- --strict`)
- [ ] Datenschutzerklärung und Impressum rechtlich prüfen lassen
- [ ] Auftragsbearbeitungsvertrag (DPA) mit Formspree abschliessen
- [ ] `securityTxtExpires` jährlich erneuern (Kalendereintrag!)
