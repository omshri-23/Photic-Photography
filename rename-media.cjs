const fs = require('fs');
const path = require('path');

const mediaRoot = path.join(__dirname, 'public/media');
const uploadsDir = path.join(mediaRoot, 'uploads');

const renameMap = new Map();

function cleanFiles(dir) {
    if (!fs.existsSync(dir)) return;
    
    const categories = fs.readdirSync(dir);
    for (const category of categories) {
        const catPath = path.join(dir, category);
        if (!fs.statSync(catPath).isDirectory()) continue;
        
        let counter = 1;
        const files = fs.readdirSync(catPath);
        for (const file of files) {
            if (!file.match(/\.(jpg|jpeg|png|webp)$/i)) continue;
            
            const ext = path.extname(file).toLowerCase();
            const newName = `${category}-${counter}${ext}`;
            counter++;
            
            const oldPath = path.join(catPath, file);
            const newPath = path.join(catPath, newName);
            
            const oldRelPath = `media/uploads/${category}/${file}`.replace(/\\/g, '/');
            const newRelPath = `media/uploads/${category}/${newName}`.replace(/\\/g, '/');
            
            if (file !== newName) {
                fs.renameSync(oldPath, newPath);
                renameMap.set(oldRelPath, newRelPath);
                console.log(`Renamed: ${oldRelPath} -> ${newRelPath}`);
            }
        }
    }
}

cleanFiles(uploadsDir);

// Now update the references in code
const filesToUpdate = [
    path.join(__dirname, 'src/data.js'),
    path.join(__dirname, 'src/generated-local-media.js'),
    path.join(__dirname, 'scripts/local-media-curation.json')
];

for (const file of filesToUpdate) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    for (const [oldPath, newPath] of renameMap.entries()) {
        // Simple string replacement. Works for these files.
        if (content.includes(oldPath)) {
            content = content.split(oldPath).join(newPath);
            changed = true;
        }
    }
    
    if (changed) {
        fs.writeFileSync(file, content);
        console.log(`Updated references in ${path.basename(file)}`);
    }
}
