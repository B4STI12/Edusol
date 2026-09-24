// Lighthouse CI: Labormessung mit Budgets (ersetzt keine Felddaten/CrUX).
const prefix = (process.env.PATH_PREFIX || "/").replace(/\/?$/, "/");
const base = `http://127.0.0.1:8080${prefix}`;

module.exports = {
  ci: {
    collect: {
      startServerCommand: "node scripts/serve.mjs",
      startServerReadyPattern: "Server läuft",
      url: [base, `${base}kontakt.html`, `${base}npo.html`, `${base}ueber-uns.html`],
      numberOfRuns: 3,
      settings: {
        chromeFlags: "--no-sandbox --headless=new",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 1 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.95 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["error", { maxNumericValue: 200 }],
        "resource-summary:script:size": ["error", { maxNumericValue: 20000 }],
        "resource-summary:stylesheet:size": ["error", { maxNumericValue: 40000 }],
        "resource-summary:total:size": ["error", { maxNumericValue: 400000 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci/reports",
    },
  },
};
