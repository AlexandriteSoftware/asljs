import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { readFile }
  from 'node:fs/promises';
import { ESLint }
  from 'eslint';
import { marked }
  from 'marked';
import rule
  from './eslint-import-style-rule.js';

const eslint =
  new ESLint(
    { overrideConfigFile: true,
      fix: true,
      overrideConfig:
        { plugins: { asljs: { rules: { 'import-style': rule } } },
          rules: { 'asljs/import-style': 'error' } } });

  test(
    'markdown example: valid input',
    async () => {
      const code =
        'import { readFile }\n  from \'node:fs/promises\';';

      const [ result ] =
        await eslint.lintText(code);

      assert.strictEqual(
        result.output,
        undefined);
    });

  test(
    'markdown example: \\r\\n line endings',
    async () => {
      const code =
        'import { readFile }\r\n  from \'node:fs/promises\';';

      const [ result ] =
        await eslint.lintText(code);

      assert.strictEqual(
        result.output,
        undefined);
    });

const testCases =
  await extractTests(
    'eslint-import-style-rule.md');

for (const testCase of testCases) {
  test(
    `markdown example: ${testCase.source}`,
    async () => {
      const [ result ] =
        await eslint.lintText(
          testCase.source);

      assert.strictEqual(
        result.output,
        testCase.expected);
    });
}

async function extractTests(
  filePath)
{
  const markdown =
    await readFile(
      filePath,
      'utf8');
  
  const tokens =
    marked.lexer(markdown);

  let inTests = false;
  const tests = [];

  for (let index = 0;
       index < tokens.length;
       index++)
  {
    const token =
      tokens[index];

    if (token.type === 'heading') {
      if (token.depth === 2
          && token.text === 'Tests')
      {
        inTests = true;
        continue;
      }

      if (inTests
          && token.depth <= 2)
      {
        break;
      }
    }

    if (!inTests) {
      continue;
    }

    if (token.type === 'code'
        && token.lang === 'js')
    {
      const code =
        tokens[index];

      const parts =
        code.text.split(/\r?\n\/\/ ---\r?\n/g);

      tests.push(
        { source: parts[0],
          expected: parts[1] });

      index++;
    }
  }

  return tests;
}