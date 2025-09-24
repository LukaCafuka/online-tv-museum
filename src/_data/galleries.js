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
    if (files.length) {
  galleries[slug] = files.map(f => `/assets/images/${slug}/${f}`);
    }
  }
  return galleries;
};
