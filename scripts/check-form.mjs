// E2E-Test des Kontaktformulars mit simuliertem Formspree-Endpunkt.
import { chromium } from "playwright";
import { startServer } from "./serve.mjs";

const { server, base } = await startServer();
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const failures = [];
const expect = (cond, msg) => cond || failures.push(msg);

async function scenario(name, status) {
  const page = await browser.newPage();
  const requests = [];
  await page.route("https://formspree.io/**", (route) => {
    requests.push(route.request().headers().accept);
    route.fulfill({ status, contentType: "application/json", body: "{}" });
  });
  await page.goto(`${base}/kontakt.html`);

  // Leeres Formular: Fehler als Text, Fokus auf erstem Fehler, kein Request
  await page.click('button[type="submit"]');
  expect((await page.getAttribute("#vorname", "aria-invalid")) === "true", `${name}: aria-invalid fehlt`);
  expect((await page.textContent("#vorname-error")).includes("Vorname"), `${name}: Fehlertext fehlt`);
  expect((await page.evaluate(() => document.activeElement.id)) === "vorname", `${name}: Fokus nicht auf erstem Fehler`);
  expect(requests.length === 0, `${name}: Request trotz Fehler`);

  await page.fill("#vorname", "Max");
  await page.fill("#nachname", "Muster");
  await page.fill("#email", "max@schule.ch");
  await page.selectOption("#betreff", { index: 1 });
  await page.fill("#nachricht", "Test");
  await Promise.all([
    status === 403
      ? page.waitForURL(/formspree\.io/)
      : page.waitForFunction(() => !document.getElementById("form-status").textContent.startsWith("Bitte")),
    page.click('button[type="submit"]'),
  ]);
  return { page, requests };
}

{
  const { page, requests } = await scenario("Erfolg", 200);
  expect(requests[0] === "application/json", "Erfolg: kein JSON-Request");
  expect((await page.textContent("#form-status")).startsWith("Danke"), "Erfolg: keine Bestätigung");
  expect((await page.inputValue("#vorname")) === "", "Erfolg: Formular nicht zurückgesetzt");
}
{
  const { page } = await scenario("Validierungsfehler", 422);
  expect((await page.textContent("#form-status")).includes("nicht gesendet"), "422: keine Fehlermeldung");
  expect((await page.inputValue("#nachricht")) === "Test", "422: Eingaben gelöscht");
}
{
  const { page, requests } = await scenario("Fallback", 403);
  expect(requests.length === 2, "403: kein nativer POST als Fallback");
  expect(page.url().startsWith("https://formspree.io/"), "403: keine Weiterleitung zu Formspree");
}

await browser.close();
server.close();

if (failures.length) {
  console.error(failures.map((f) => `✖ ${f}`).join("\n"));
  process.exit(1);
}
console.log("Formular-E2E ok: Validierung, Erfolg, Fehler und Fallback.");
