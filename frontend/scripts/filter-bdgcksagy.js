const fs = require('fs');

const filePath = 'C:\\Users\\Admin\\.claude\\projects\\C--WINDOWS-system32\\4194320b-f073-496b-8750-70c606b3ad1a\\tool-results\\bdgcksagy.txt';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const keywords = ['Service', 'Controller', 'Hub', 'Embedding', 'Rag'];

for (const line of lines) {
    if (line.includes('[FILE]') && keywords.some(k => line.includes(k))) {
        if (!line.includes('\\obj\\') && !line.includes('\\bin\\')) {
            console.log(line);
        }
    }
}
