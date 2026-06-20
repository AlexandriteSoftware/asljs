import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { ESLint }
  from 'eslint';
import { addRuleTestsFromMarkdown }
  from './../extractTests.js';
import rule
  from './function-declaration.js';

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
  'function-declaration.md',
  eslint);
