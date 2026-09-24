// Erzeugt Favicon-Set und Open-Graph-Bild aus den Logo-SVGs.
// Einmalig bzw. bei Logo-Änderungen ausführen: `npm run icons`
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const BRAND_BG = "#dce8f2";
const OWL = "src/assets/img/eulen/logo.svg";
const LOGO_CLAIM = "src/assets/img/logo-claim.svg";

// Quadratischer Ausschnitt um die Eule (Inhalt: 1610.7 70.6 501.2×482.7).
const owlSvg = (await readFile(OWL, "utf8")).replace(
  /viewBox="[^"]*"/,
  'viewBox="1601 52 520 520"',
);
await writeFile("src/static/icon.svg", owlSvg);

const owlPng = (size, padding = 0, background) =>
  sharp(Buffer.from(owlSvg), { density: 300 })
    .resize(size - padding * 2, size - padding * 2, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: padding, bottom: padding, left: padding, right: padding, background: background ?? { r: 0, g: 0, b: 0, alpha: 0 } })
    .flatten(background ? { background } : false)
    .png()
    .toBuffer();

// apple-touch-icon: 180×180, ohne Transparenz
await writeFile("src/static/apple-touch-icon.png", await owlPng(180, 18, BRAND_BG));

// favicon.ico mit 16/32/48 px
const icoSizes = await Promise.all([16, 32, 48].map((s) => owlPng(s)));
await writeFile("src/static/favicon.ico", await pngToIco(icoSizes));

// Open-Graph-Bild 1200×630
const logo = await sharp(await readFile(LOGO_CLAIM), { density: 300 })
  .resize({ width: 900, height: 400, fit: "inside" })
  .png()
  .toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#b8cfe0" } })
  .composite([{ input: logo, gravity: "center" }])
  .png({ compressionLevel: 9 })
  .toFile("src/assets/og/og-image.png");

console.log("Icons und OG-Bild erzeugt.");
