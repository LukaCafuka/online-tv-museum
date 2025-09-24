const fs = require('fs');
const path = require('path');

// Base directory now: src/assets/images/{slug}/ (no 'equipment' subfolder)
const BASE_DIR = path.join(__dirname, '..', 'assets', 'images');

function safeReadDir(dir) {
  try { return fs.readdirSync(dir, { withFileTypes: true }); } catch { return []; }
}

// Allowed image extensions
const exts = new Set(['.jpg','.jpeg','.png','.gif','.webp','.avif','.svg']);

module.exports = () => {
  const galleries = {};
  const slugDirs = safeReadDir(BASE_DIR).filter(d => d.isDirectory());
  for (const dirent of slugDirs) {
    const slug = dirent.name;
    const abs = path.join(BASE_DIR, slug);
    const files = safeReadDir(abs)
      .filter(f => f.isFile() && exts.has(path.extname(f.name).toLowerCase()))
      .map(f => f.name)
      .sort((a,b) => a.localeCompare(b, undefined, { numeric:true }));
    
    if (!files.length) continue;

    // Load optional captions
    let captions = {};
    const captionsPath = path.join(abs, 'captions.json');
    if (fs.existsSync(captionsPath)) {
      try {
        captions = JSON.parse(fs.readFileSync(captionsPath, 'utf-8')) || {};
      } catch (e) {
        console.warn(`Invalid captions.json in ${slug}:`, e.message);
      }
    }

    // Build gallery with caption data
    galleries[slug] = files.map(fname => ({
      src: `/assets/images/${slug}/${fname}`,
      filename: fname,
      captions: captions[fname] || {}
    }));
  }
  return galleries;
};
