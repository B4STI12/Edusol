import { HtmlBasePlugin } from "@11ty/eleventy";

const FONT_FILES = [
  "300-normal",
  "300-italic",
  "400-normal",
  "600-normal",
  "700-normal",
];

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/static": "/" });
  eleventyConfig.addPassthroughCopy({
    "node_modules/bootstrap/dist/css/bootstrap.min.css": "assets/vendor/bootstrap.min.css",
    "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js": "assets/vendor/bootstrap.bundle.min.js",
  });
  for (const variant of FONT_FILES) {
    eleventyConfig.addPassthroughCopy({
      [`node_modules/@fontsource/poppins/files/poppins-latin-${variant}.woff2`]:
        `assets/fonts/poppins-latin-${variant}.woff2`,
    });
  }

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
