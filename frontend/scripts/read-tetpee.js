const fs = require('fs');
const path = require('path');

const targetDir = 'C:\\Users\\Admin\\Downloads\\TetPee';

function listFiles(dir) {
    if (!fs.existsSync(dir)) {
        console.log(`Directory does not exist: ${dir}`);
        return;
    }
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            console.log(`[DIR] ${fullPath}`);
            listFiles(fullPath);
        } else {
            console.log(`[FILE] ${fullPath}`);
        }
    }
}

listFiles(targetDir);
