module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({
    "node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2": "assets/fonts/space-grotesk.woff2",
    "node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2": "assets/fonts/inter.woff2",
  });
  eleventyConfig.addPassthroughCopy("src/demos");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  // CNAME do domínio próprio
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });

  eleventyConfig.addCollection("posts", (api) =>
    api
      .getFilteredByGlob("src/blog/posts/*.md")
      .filter((p) => !p.data.draft && new Date(p.data.date) <= new Date())
      .sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addFilter("head", (arr, n) => arr.slice(0, n));
  eleventyConfig.addFilter("dataBR", (d) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" })
  );
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));

  return { dir: { input: "src", output: "_site" }, markdownTemplateEngine: "njk" };
};
