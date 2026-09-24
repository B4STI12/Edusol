// Zentrale Stammdaten. Werte in [eckigen Klammern] sind Platzhalter und
// werden von `npm run check:placeholders` gemeldet.

// Vercel setzt diese Variablen beim Build automatisch.
const onVercel = Boolean(process.env.VERCEL);
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined;

export default {
  name: "EDUSOL",
  claim: "Wir machen morgen möglich.",
  lang: "de-CH",
  locale: "de_CH",
  // SITE_URL (GitHub Pages / eigene Domain) oder die Produktions-Domain von Vercel.
  url: process.env.SITE_URL || vercelUrl || "http://localhost:8080",
  // Vercel-Previews und explizit gesperrte Builds nicht indexieren lassen.
  noindex: process.env.SITE_NOINDEX === "true" || process.env.VERCEL_ENV === "preview",
  // Bestimmt den Hosting-Abschnitt der Datenschutzerklärung.
  hosting: onVercel ? "vercel" : "github-pages",
  email: "info@edusol.ch",
  securityEmail: "info@edusol.ch",
  phone: "",
  // Akut-Hilfe: nur telefonisch, zu Bürozeiten. Leer = Platzhalter wird angezeigt.
  akutPhone: "",
  akutHours: "Montag bis Freitag, 8–17 Uhr",
  akutHoursShort: "Mo–Fr 8–17 Uhr",
  whatsapp: "",
  linkedin: "https://www.linkedin.com/company/edusol",
  formAction: "https://formspree.io/f/xvzdelpq",
  // Anbieter = Verein (Art. 60 ff. ZGB). Name exakt wie in den Statuten.
  owner: {
    name: "[Platzhalter – Vereinsname gemäss Statuten, z. B. Verein EDUSOL]",
    legalForm: "Verein nach Art. 60 ff. ZGB",
    seat: "[Platzhalter – Sitz des Vereins gemäss Statuten]",
    street: "[Platzhalter – Strasse und Hausnummer]",
    city: "[Platzhalter – PLZ und Ort]",
    country: "Schweiz",
    representatives: "[Platzhalter – Vorname Name, Funktion (z. B. Präsidentin)]",
    // Nur falls der Verein im Handelsregister eingetragen ist
    uid: "",
  },
  // Anbieter des Postfachs info@… (Name, Sitz); nötig für die Datenschutzerklärung
  mailProvider: "[Platzhalter – E-Mail-Anbieter mit Sitz, z. B. Infomaniak Network SA, Genf]",
  legalUpdated: "2026-09-24",
  // RFC 9116: höchstens ein Jahr in die Zukunft. Erneuerung im Kalender eintragen!
  securityTxtExpires: "2027-09-23T23:59:59.000Z",
  themeColor: "#dce8f2",
};
