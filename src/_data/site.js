// Zentrale Stammdaten. Werte in [eckigen Klammern] sind Platzhalter und
// werden von `npm run check:placeholders` gemeldet.
export default {
  name: "EDUSOL",
  claim: "Wir machen morgen möglich.",
  lang: "de-CH",
  locale: "de_CH",
  // Wird im Deploy-Workflow aus actions/configure-pages gesetzt.
  url: process.env.SITE_URL || "http://localhost:8080",
  // Nur auf dem finalen Host indexieren lassen.
  noindex: process.env.SITE_NOINDEX === "true",
  email: "info@edusol.ch",
  securityEmail: "info@edusol.ch",
  phone: "",
  whatsapp: "",
  linkedin: "https://www.linkedin.com/company/edusol",
  formAction: "https://formspree.io/f/xvzdelpq",
  owner: {
    name: "[Platzhalter – Vollständiger Name bzw. Firma / Verein]",
    street: "[Platzhalter – Strasse und Hausnummer]",
    city: "[Platzhalter – PLZ und Ort]",
    country: "Schweiz",
    uid: "",
  },
  legalUpdated: "2026-09-24",
  // RFC 9116: höchstens ein Jahr in die Zukunft. Erneuerung im Kalender eintragen!
  securityTxtExpires: "2027-09-23T23:59:59.000Z",
  themeColor: "#dce8f2",
};
