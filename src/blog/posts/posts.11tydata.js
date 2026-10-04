// Um artigo só vai ao ar se não for rascunho (draft: true) e se a data (campo "date") já chegou.
// O workflow publica de novo todo dia, então basta datar o artigo no futuro para "agendá-lo".
const noAr = (data) => !data.draft && new Date(data.date) <= new Date();

module.exports = {
  layout: "post.njk",
  eleventyComputed: {
    permalink: (data) => (noAr(data) ? `/blog/${data.page.fileSlug}/` : false),
  },
};
