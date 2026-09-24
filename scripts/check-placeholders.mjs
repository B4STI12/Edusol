// Meldet Platzhalter in den Stammdaten und im Build.
// Mit --strict schlägt der Check fehl (z. B. vor dem Go-live).
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const strict = process.argv.includes("--strict");
const files = (await readdir("_site", { recursive: true }))
  .filter((f) => f.endsWith(".html"))
  .map((f) => path.join("_site", f));

const hits = [];
for (const file of files) {
  const text = await readFile(file, "utf8");
  for (const match of text.matchAll(/\[Platzhalter[^\]]*\]/g)) hits.push(`${file}: ${match[0]}`);
}

if (hits.length === 0) {
  console.log("Keine Platzhalter gefunden.");
} else {
  const unique = [...new Set(hits)];
  const log = strict ? console.error : console.warn;
  log(`${unique.length} Platzhalter gefunden (Stammdaten in src/_data/site.js ergänzen):\n${unique.join("\n")}`);
  if (strict) process.exit(1);
}
