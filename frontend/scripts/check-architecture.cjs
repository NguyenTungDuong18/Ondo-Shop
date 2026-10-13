const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '../src');
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
const allowed = {
  domain: ['domain'],
  application: ['application', 'domain'],
  infrastructure: ['infrastructure', 'domain', 'shared'],
  shared: ['shared'],
  presentation: ['presentation', 'application', 'domain', 'shared'],
  app: ['app', 'presentation', 'application', 'domain', 'infrastructure', 'shared'],
};
const errors = [];
for (const file of walk(root).filter(file => /\.tsx?$/.test(file))) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  const layer = relative.split('/')[0];
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  function visit(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const specifier = node.moduleSpecifier.text;
      if (specifier.startsWith('.')) {
        const destination = path.relative(root, path.resolve(path.dirname(file), specifier)).replaceAll('\\', '/').split('/')[0];
        if (allowed[layer] && !allowed[layer].includes(destination)) errors.push(`${relative}: ${layer} must not depend on ${destination}`);
      } else if (layer === 'domain' || (layer === 'application' && specifier !== 'zod')) {
        errors.push(`${relative}: framework dependency ${specifier} is not allowed in ${layer}`);
      }
    }
    if (['domain', 'application'].includes(layer) && ts.isIdentifier(node) && ['localStorage', 'document', 'window', 'fetch'].includes(node.text)) errors.push(`${relative}: browser/transport access in ${layer}`);
    if (layer === 'presentation' && ts.isCallExpression(node) && node.expression.getText(source) === 'fetch') errors.push(`${relative}: HTTP access must live in infrastructure`);
    ts.forEachChild(node, visit);
  }
  visit(source);
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log('Architecture boundaries passed.');
