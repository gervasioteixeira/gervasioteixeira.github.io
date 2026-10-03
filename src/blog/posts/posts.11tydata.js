module.exports = {
  layout: "post.njk",
  eleventyComputed: {
    permalink: (data) => (data.draft ? false : `/blog/${data.page.fileSlug}/`),
  },
};
