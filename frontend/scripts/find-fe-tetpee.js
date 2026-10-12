const fs = require('fs');
const filePath = 'C:\\Users\\Admin\\.claude\\projects\\C--WINDOWS-system32\\4194320b-f073-496b-8750-70c606b3ad1a\\tool-results\\bdgcksagy.txt';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

for (const line of lines) {
    if (line.includes('[FILE]') && (line.includes('.tsx') || line.includes('.ts') || line.includes('.jsx') || line.includes('.js'))) {
        if (!line.includes('\\obj\\') && !line.includes('\\bin\\') && !line.includes('\\node_modules\\') && !line.includes('.Api\\')) {
            console.log(line);
        }
    }
}
