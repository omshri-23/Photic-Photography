import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const MEDIA_DIR = path.resolve(process.cwd(), 'public/media');

async function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      // Skip already optimized files
      if (entry.name.endsWith('-opt.jpg') || entry.name.endsWith('-opt.webp')) continue;

      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        try {
          const stats = fs.statSync(fullPath);
          if (stats.size > 500 * 1024) { // Only optimize if > 500KB
            console.log(`Optimizing: ${fullPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
            const tempPath = fullPath + '.tmp';
            await sharp(fullPath)
              .resize({ width: 1920, withoutEnlargement: true }) // Max width 1920px
              .jpeg({ quality: 80, progressive: true })
              .toFile(tempPath);
            
            // Replace original
            fs.renameSync(tempPath, fullPath);
            console.log(`  -> Done. Reduced size.`);
          }
        } catch (error) {
          console.error(`Error processing ${fullPath}:`, error.message);
        }
      }
    }
  }
}

console.log('Starting media optimization...');
processDirectory(MEDIA_DIR).then(() => {
  console.log('Optimization complete!');
}).catch(err => {
  console.error(err);
});
