import { EleventyHtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
  const configuredPrefix = process.env.PATH_PREFIX || "/";
  const pathPrefix = configuredPrefix === "/"
    ? "/"
    : `/${configuredPrefix.replace(/^\/+|\/+$/g, "")}/`;

  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addWatchTarget("src/assets/css/");
  eleventyConfig.addWatchTarget("src/assets/js/");

  eleventyConfig.addFilter("byLanguage", (pages, lang) =>
    pages.filter((page) => page.lang === lang)
  );

  eleventyConfig.addFilter("currentPages", (pages, lang) =>
    pages.filter((page) => page.lang === lang && !page.isLegacy && !page.isHome)
  );

  eleventyConfig.addFilter("legacyPages", (pages, lang) =>
    pages.filter((page) => page.lang === lang && page.isLegacy)
  );

  eleventyConfig.addFilter("year", () => new Date().getUTCFullYear());

  return {
    pathPrefix,
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"]
  };
}
