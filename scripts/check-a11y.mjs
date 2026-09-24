// Automatischer Accessibility-Check (axe-core, WCAG 2.2 A/AA) aller Seiten.
// Ersetzt keinen manuellen Tastatur- und Screenreader-Test.
import { readdir } from "node:fs/promises";
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
import { startServer } from "./serve.mjs";

const { server, base } = await startServer();

const pages = (await readdir("_site")).filter((f) => f.endsWith(".html"));
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
