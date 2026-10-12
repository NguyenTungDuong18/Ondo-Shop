const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\Admin\\Downloads\\My System\\frontend\\src';

function scan(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            scan(fullPath);
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                console.log(fullPath);
            }
        }
    }
}

scan(baseDir);
