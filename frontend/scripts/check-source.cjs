const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '../src');
const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
const files = walk(root);
const seen = new Set();
const errors = [];
function dependency(from, specifier) {
  if (!specifier.startsWith('.')) return;
  const base = path.resolve(path.dirname(from), specifier);
  if (!base.startsWith(root + path.sep)) { errors.push(`${path.relative(root, from)} imports outside FE/src: ${specifier}`); return; }
  const resolved = [base, ...['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'].map(extension => base + extension)].find(file => fs.existsSync(file) && fs.statSync(file).isFile());
  if (!resolved) { errors.push(`${path.relative(root, from)} has a missing import: ${specifier}`); return; }
  visit(resolved);
}
function visit(file) {
  if (seen.has(file)) return;
  seen.add(file);
  if (/\.css$/.test(file)) {
    const css = fs.readFileSync(file, 'utf8');
    for (const match of css.matchAll(/@import\s+['"]([^'"]+)['"]|url\(\s*['"]?(\.[^)'"\s]+)/g)) dependency(file, match[1] || match[2]);
    return;
  }
  if (!/\.[jt]sx?$/.test(file)) return;
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  function inspect(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) dependency(file, node.moduleSpecifier.text);
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && ts.isStringLiteral(node.arguments[0])) dependency(file, node.arguments[0].text);
    ts.forEachChild(node, inspect);
  }
  inspect(source);
}
visit(path.join(root, 'main.tsx'));
for (const file of files) {
  if (/\.(cs|csproj|slnx?)$/.test(file)) errors.push(`BE source found inside FE/src: ${path.relative(root, file)}`);
  if (!seen.has(file) && !file.endsWith('.d.ts')) errors.push(`Unreferenced FE source/asset: ${path.relative(root, file)}`);
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log('FE source check passed: no cross-root imports, missing imports or unreferenced source files.');
