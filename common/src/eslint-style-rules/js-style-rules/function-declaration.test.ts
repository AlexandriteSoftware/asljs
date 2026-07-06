import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { ESLint }
  from 'eslint';
import { addRuleTestsFromMarkdown }
  from '../extractTests.js';
import rule
  from './function-declaration.js';
import { fileURLToPath }
  from 'node:url';

const SCRIPT_FILE_PATH =
  fileURLToPath(
    import.meta.url);

const markdownTestsFilePath =
  SCRIPT_FILE_PATH.replace(
    /\.test\.ts$/,
    '.md');

const eslint =
  new ESLint(
    { overrideConfigFile: true,
      fix: true,
      overrideConfig:
        { plugins: { asljs: { rules: { 'function-declaration-style': rule } } },
          rules: { 'asljs/function-declaration-style': 'error' } } });

test(
  'function-declaration: \\r\\n line endings',
  async () => {
    const code =
      'function test(\r\n  param1,\r\n  param2)\r\n{\r\n}';

    const [ result ] =
      await eslint.lintText(code);

    assert.strictEqual(
      result.output,
      undefined);
  });

await addRuleTestsFromMarkdown(
  markdownTestsFilePath,
  eslint);
