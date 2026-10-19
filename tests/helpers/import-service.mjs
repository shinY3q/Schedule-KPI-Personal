import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Run pure TypeScript services and their local imports with the existing compiler.
function moduleUrl(sourceUrl) {
  const source = readFileSync(sourceUrl, 'utf8');
  let { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  });
  for (const match of [...outputText.matchAll(/from (['"])(\.[^'"]+)\1/g)]) {
    const path = match[2].endsWith('.ts') ? match[2] : `${match[2]}.ts`;
    const dependencyUrl = moduleUrl(new URL(path, sourceUrl));
    outputText = outputText.replace(match[0], `from ${JSON.stringify(dependencyUrl)}`);
  }
  return `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`;
}

export const importService = (path) => import(moduleUrl(new URL(path, import.meta.url)));
