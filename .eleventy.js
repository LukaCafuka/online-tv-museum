const Image = require("@11ty/eleventy-img");
const path = require("path");

module.exports = function(eleventyConfig) {
  // Passthrough vendor assets (normalized paths)
  eleventyConfig.addPassthroughCopy({ "node_modules/jquery/dist/jquery.min.js": "assets/vendor/jquery.min.js" });
  eleventyConfig.addPassthroughCopy({ "node_modules/jquery-ui/dist/jquery-ui.min.js": "assets/vendor/jquery-ui.min.js" });
  eleventyConfig.addPassthroughCopy({ "node_modules/jquery-ui/dist/themes/base/jquery-ui.min.css": "assets/vendor/jquery-ui.min.css" });
  // Copy all custom assets (css, js, images you add later)
  eleventyConfig.addPassthroughCopy("src/assets");

  // Image optimization shortcode
  eleventyConfig.addShortcode("optimizedImage", async function(src, alt, className = "", sizes = "100vw") {
    if (!src) return "";
    
    // Handle relative paths from src/assets/images
    const fullSrc = src.startsWith('/assets/') 
      ? path.join(__dirname, 'src', src.replace('/assets/', 'assets/'))
      : src;
    
    try {
      let metadata = await Image(fullSrc, {
        widths: [300, 600, 900, 1200],
        formats: ["webp", "jpeg"],
        outputDir: "./dist/assets/images/optimized/",
        urlPath: "/assets/images/optimized/",
        filenameFormat: function (id, src, width, format, options) {
          const extension = path.extname(src);
          const name = path.basename(src, extension);
          return `${name}-${width}w.${format}`;
        }
      });

      let imageAttributes = {
        alt,
        class: className,
        sizes,
        loading: "lazy",
        decoding: "async"
      };

      return Image.generateHTML(metadata, imageAttributes);
    } catch (error) {
      console.warn(`Image optimization failed for ${src}:`, error.message);
      // Fallback to original image
      return `<img src="${src}" alt="${alt}" class="${className}" loading="lazy" />`;
    }
  });

  // Filter to get optimized image URL (for the smallest webp version)
  eleventyConfig.addFilter('optimizedImageUrl', async function(src, width = 600) {
    if (!src) return src;
    
    const fullSrc = src.startsWith('/assets/') 
      ? path.join(__dirname, 'src', src.replace('/assets/', 'assets/'))
      : src;
    
    try {
      let metadata = await Image(fullSrc, {
        widths: [width],
        formats: ["webp", "jpeg"],
        outputDir: "./dist/assets/images/optimized/",
        urlPath: "/assets/images/optimized/",
        filenameFormat: function (id, src, width, format, options) {
          const extension = path.extname(src);
          const name = path.basename(src, extension);
          return `${name}-${width}w.${format}`;
        }
      });

      // Return the webp version if available, otherwise jpeg
      if (metadata.webp && metadata.webp.length > 0) {
        return metadata.webp[0].url;
      } else if (metadata.jpeg && metadata.jpeg.length > 0) {
        return metadata.jpeg[0].url;
      }
    } catch (error) {
      console.warn(`Image optimization failed for ${src}:`, error.message);
    }
    
    // Fallback to original
    return src;
  });

  eleventyConfig.addCollection('equipment', (collectionApi) => {
    return collectionApi.getFilteredByGlob('./src/equipment/*.md')
      .filter(item => !item.data.draft && item.data && item.data.brand && item.data.model) // allow draft flag later + filter out incomplete
      .sort((a,b) => {
        const aKey = `${a.data.brand} ${a.data.model}`.toLowerCase();
        const bKey = `${b.data.brand} ${b.data.model}`.toLowerCase(); 
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

  // Strip HTML tags for SEO meta descriptions
  eleventyConfig.addFilter('striptags', (content) => {
    if(!content) return '';
    return content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  });

  // Truncate text to specified length
  eleventyConfig.addFilter('truncate', (content, length = 160) => {
    if(!content) return '';
    if(content.length <= length) return content;
    return content.substring(0, length).trim() + '...';
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
