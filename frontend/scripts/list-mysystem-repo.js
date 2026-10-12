const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\Admin\\Downloads\\My System\\System';

function scan(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (!file.includes('bin') && !file.includes('obj') && !file.includes('.idea') && !file.includes('.git')) {
                scan(fullPath);
            }
        } else {
            if (file.endsWith('.cs') || file.endsWith('.csproj')) {
                console.log(fullPath);
            }
        }
    }
}

scan(baseDir);
