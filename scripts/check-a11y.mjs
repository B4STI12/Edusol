// Automatischer Accessibility-Check (axe-core, WCAG 2.2 A/AA) aller Seiten.
// Ersetzt keinen manuellen Tastatur- und Screenreader-Test.
import { createServer } from "node:http";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

const ROOT = path.resolve("_site");
const PREFIX = (process.env.PATH_PREFIX || "/").replace(/\/?$/, "/");
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
  ".xml": "application/xml",
};

const server = createServer(async (req, res) => {
  let urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (urlPath.startsWith(PREFIX)) urlPath = "/" + urlPath.slice(PREFIX.length);
  let filePath = path.join(ROOT, urlPath);
  if ((await stat(filePath).catch(() => null))?.isDirectory()) filePath = path.join(filePath, "index.html");
  try {
    const body = await readFile(filePath);
    res.writeHead(200, { "Content-Type": TYPES[path.extname(filePath)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": TYPES[".html"] });
    res.end(await readFile(path.join(ROOT, "404.html")));
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}${PREFIX.slice(0, -1)}`;

const pages = (await readdir(ROOT)).filter((f) => f.endsWith(".html"));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });

let failures = 0;
for (const viewport of [{ width: 1280, height: 900 }, { width: 375, height: 800 }]) {
  const context = await browser.newContext({ viewport });
  for (const file of pages) {
    const page = await context.newPage();
    const pageErrors = [];
    page.on("console", (msg) => msg.type() === "error" && pageErrors.push(msg.text()));
    page.on("pageerror", (err) => pageErrors.push(err.message));
    page.on("response", (res) => {
      if (res.status() >= 400 && !res.url().endsWith(`/${file}`)) pageErrors.push(`${res.status()} ${res.url()}`);
    });
    await page.goto(`${base}/${file === "index.html" ? "" : file}`);
    await page.waitForLoadState("networkidle");
    for (const message of pageErrors) {
      failures++;
      console.error(`✖ ${file} @${viewport.width}px Konsole/Netzwerk: ${message}`);
    }
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
      .analyze();
    for (const v of violations) {
      failures++;
      console.error(`✖ ${file} @${viewport.width}px [${v.impact}] ${v.id}: ${v.help}`);
      for (const node of v.nodes.slice(0, 3)) console.error(`    ${node.target.join(" ")}`);
    }
    await page.close();
  }
  await context.close();
}

await browser.close();
server.close();

if (failures) {
  console.error(`\n${failures} Accessibility-Verstösse.`);
  process.exit(1);
}
console.log(`axe ok: ${pages.length} Seiten × 2 Viewports ohne Verstösse, Konsolen- oder CSP-Fehler.`);
