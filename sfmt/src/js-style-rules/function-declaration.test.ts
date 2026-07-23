import { ESLint }
  from 'eslint';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { fileURLToPath }
  from 'node:url';
import { buildStyleRuleTestsFromMarkdown }
  from '../functions/build-style-rule-tests-from-markdown.js';
import rule
  from './function-declaration.js';

const SCRIPT_FILE_PATH =
  fileURLToPath(
    import.meta.url);

const eslint =
  new ESLint({ overrideConfigFile: true,
               fix: true,
               overrideConfig:
                 { plugins:
                     { asljs:
                         { rules:
                             { 'function-declaration-style': rule } } },
                   rules:
                     { 'asljs/function-declaration-style': 'error' } } });

test(
  'function-declaration: \\r\\n line endings',
  async () =>
  {
    const code =
      'function test(\r\n  param1,\r\n  param2)\r\n{\r\n}';

    const [result] =
      await eslint.lintText(code);

    assert.strictEqual(
      result.output,
      undefined);
  });

await buildStyleRuleTestsFromMarkdown(
  SCRIPT_FILE_PATH,
  eslint);
