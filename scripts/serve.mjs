// Minimaler statischer Server für _site, inkl. Pfad-Präfix und 404-Seite.
// Direkt ausführbar (Lighthouse CI) oder als Modul (Prüfskripte).
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve("_site");
export const PREFIX = (process.env.PATH_PREFIX || "/").replace(/\/?$/, "/");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
};

export function startServer(port = 0) {
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
  return new Promise((resolve) =>
    server.listen(port, "127.0.0.1", () => {
      const base = `http://127.0.0.1:${server.address().port}${PREFIX.slice(0, -1)}`;
      resolve({ server, base });
    }),
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { base } = await startServer(Number(process.env.PORT || 8080));
  console.log(`Server läuft auf ${base}/`);
}
