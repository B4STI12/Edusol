import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { HtmlBasePlugin } from "@11ty/eleventy";
import { transform } from "lightningcss";

const FONT_FILES = [
  "300-normal",
  "300-italic",
  "400-normal",
  "600-normal",
  "700-normal",
];

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" }, { filter: (p) => !p.endsWith(".css") });
  eleventyConfig.addPassthroughCopy({ "src/static": "/" });
  for (const variant of FONT_FILES) {
    eleventyConfig.addPassthroughCopy({
      [`node_modules/@fontsource/poppins/files/poppins-latin-${variant}.woff2`]:
        `assets/fonts/poppins-latin-${variant}.woff2`,
    });
  }

  // CSS minifizieren (Lightning CSS) und als site.css ausliefern.
  eleventyConfig.on("eleventy.after", async ({ dir }) => {
    const output = dir.output;
    const source = await readFile("src/assets/css/main.css");
    const { code } = transform({
      filename: "main.css",
      code: source,
      minify: true,
      targets: { chrome: 111 << 16, firefox: 111 << 16, safari: 16 << 16 },
    });
    await mkdir(path.join(output, "assets/css"), { recursive: true });
    await writeFile(path.join(output, "assets/css/site.css"), code);
    await rm(path.join(output, "assets/css/main.css"), { force: true });
  });

  // Wirkungsfeld anhand des Slugs nachschlagen.
  eleventyConfig.addFilter("field", (slug, fields) => fields.find((f) => f.slug === slug));

  // Absolute URL for canonical, Open Graph and sitemap.
  eleventyConfig.addFilter("absoluteUrl", (path, base) => {
    const cleanBase = String(base).replace(/\/+$/, "");
    const cleanPath = String(path).startsWith("/") ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  });

  eleventyConfig.addGlobalData("buildYear", () => new Date().getFullYear());

  eleventyConfig.addFilter("isoDate", (date) => new Date(date).toISOString().slice(0, 10));
  eleventyConfig.addFilter("dateCH", (date) =>
    new Intl.DateTimeFormat("de-CH", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(date)),
  );


  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    pathPrefix: process.env.PATH_PREFIX || "/",
    templateFormats: ["njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
