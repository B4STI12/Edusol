// Prüft alle internen Links, Bildquellen und Sprungmarken im Build (_site).
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve("_site");
const PREFIX = (process.env.PATH_PREFIX || "/").replace(/\/?$/, "/");

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])),
  );
  return files.flat();
}

const exists = async (p) => stat(p).then(() => true, () => false);

const htmlFiles = (await walk(ROOT)).filter((f) => f.endsWith(".html"));
const idsByFile = new Map();
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  idsByFile.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
}

const errors = [];
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const refs = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:|data:)/.test(ref)) continue;
    const [rawPath, hash] = ref.split("#");
    let target;
    if (rawPath === "") {
      target = file;
    } else if (rawPath.startsWith("/")) {
      if (!rawPath.startsWith(PREFIX) && rawPath !== PREFIX.slice(0, -1)) {
        errors.push(`${path.relative(ROOT, file)}: "${ref}" ohne Pfad-Präfix ${PREFIX}`);
        continue;
      }
      target = path.join(ROOT, decodeURIComponent(rawPath.slice(PREFIX.length)));
    } else {
      target = path.resolve(path.dirname(file), decodeURIComponent(rawPath));
    }
    if (target.endsWith(path.sep) || (await stat(target).then((s) => s.isDirectory(), () => false))) {
      target = path.join(target, "index.html");
    }
    if (!(await exists(target))) {
      errors.push(`${path.relative(ROOT, file)}: "${ref}" → Datei fehlt`);
      continue;
    }
    if (hash && target.endsWith(".html") && !idsByFile.get(target)?.has(hash)) {
      errors.push(`${path.relative(ROOT, file)}: "${ref}" → Sprungmarke #${hash} fehlt`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`\n${errors.length} defekte Verweise.`);
  process.exit(1);
}
console.log(`Linkcheck ok: ${htmlFiles.length} Seiten geprüft.`);
