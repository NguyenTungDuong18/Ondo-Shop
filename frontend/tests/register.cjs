const fs = require('node:fs');
const ts = require('typescript');
// Compile project modules in memory for Node's test runner; no extra test dependency.
for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, filename) => {
    const source = fs.readFileSync(filename, 'utf8').replaceAll('import.meta.env.VITE_API_BASE_URL', JSON.stringify(process.env.VITE_API_BASE_URL || ''));
    const result = ts.transpileModule(source, { fileName: filename, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } });
    module._compile(result.outputText, filename);
  };
}
