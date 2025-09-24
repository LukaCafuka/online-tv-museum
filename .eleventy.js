module.exports = function(eleventyConfig) {
  // Passthrough vendor assets (normalized paths)
  eleventyConfig.addPassthroughCopy({ "node_modules/jquery/dist/jquery.min.js": "assets/vendor/jquery.min.js" });
  eleventyConfig.addPassthroughCopy({ "node_modules/jquery-ui/dist/jquery-ui.min.js": "assets/vendor/jquery-ui.min.js" });
  eleventyConfig.addPassthroughCopy({ "node_modules/jquery-ui/dist/themes/base/jquery-ui.min.css": "assets/vendor/jquery-ui.min.css" });
  // Copy all custom assets (css, js, images you add later)
  eleventyConfig.addPassthroughCopy("src/assets");

  eleventyConfig.addCollection('equipment', (collectionApi) => {
    return collectionApi
      .getFilteredByGlob('./src/equipment/*.md')
      // Skip drafts and any files missing basic metadata (prevents sort crashes)
      .filter(item => !item.data.draft && item.data && item.data.brand && item.data.model)
      // Case-insensitive sort by brand+model; guard against non-strings
      .sort((a, b) => {
        const aKey = `${a.data.brand || ''} ${a.data.model || ''}`.toLowerCase();
        const bKey = `${b.data.brand || ''} ${b.data.model || ''}`.toLowerCase();
        return aKey.localeCompare(bKey);
      });
  });

  // Extract language-specific section from body delimited by <!--lang:xx--> ... <!--endlang-->
  eleventyConfig.addFilter('langSection', (content, lang) => {
    if(!content) return '';
    const pattern = `<!--lang:${lang}-->([\\s\\S]*?)<!--endlang-->`;
    const re = new RegExp(pattern, 'i');
    const match = re.exec(content);
    if(match) return match[1].trim();
    return content.trim();
  });

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: 'dist'
    },
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk'
  };
};
