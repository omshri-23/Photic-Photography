const fs = require('fs');
const path = require('path');

const sourceRoot = 'D:\\upload image';
const curationFile = path.join(__dirname, 'scripts', 'local-media-curation.json');

const renameMap = new Map();

function cleanFiles(dir) {
    if (!fs.existsSync(dir)) {
        console.error("Directory not found:", dir);
        return;
    }
    
    const categories = fs.readdirSync(dir);
    for (const category of categories) {
        const catPath = path.join(dir, category);
        if (!fs.statSync(catPath).isDirectory()) continue;
        
        // Clean category name for the prefix
        let prefix = category.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (prefix === 'blacknwhite') prefix = 'monochrome';
        if (prefix === 'video') continue; // skip videos if not needed, or rename them too
        
        let counter = 1;
        const files = fs.readdirSync(catPath);
        for (const file of files) {
            if (!file.match(/\.(jpg|jpeg|png|webp|mp4)$/i)) continue;
            
            const ext = path.extname(file).toLowerCase();
            const newName = `${prefix}-${counter}${ext}`;
            counter++;
            
            const oldPath = path.join(catPath, file);
            const newPath = path.join(catPath, newName);
            
            const oldRelPath = `${category}\\${file}`;
            const newRelPath = `${category}\\${newName}`;
            
            if (file !== newName) {
                fs.renameSync(oldPath, newPath);
                renameMap.set(oldRelPath, newRelPath);
                console.log(`Renamed: ${oldRelPath} -> ${newRelPath}`);
            }
        }
    }
}

cleanFiles(sourceRoot);

// Now update local-media-curation.json
if (fs.existsSync(curationFile)) {
    let content = fs.readFileSync(curationFile, 'utf8');
    let changed = false;
    
    for (const [oldPath, newPath] of renameMap.entries()) {
        // Need to escape backslashes for JSON matching
        const escapedOldPath = oldPath.replace(/\\/g, '\\\\');
        const escapedNewPath = newPath.replace(/\\/g, '\\\\');
        
        if (content.includes(escapedOldPath)) {
            content = content.split(escapedOldPath).join(escapedNewPath);
            changed = true;
        }
    }
    
    if (changed) {
        fs.writeFileSync(curationFile, content);
        console.log(`Updated references in ${path.basename(curationFile)}`);
    } else {
        console.log("No references updated in curation file.");
    }
}
