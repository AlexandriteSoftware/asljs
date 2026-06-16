import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { ESLint }
  from 'eslint';
import { addRuleTestsFromMarkdown }
  from './extractTests.js';
import rule
  from './eslint-call-expression-style-rule.js';

const eslint =
  new ESLint(
    { overrideConfigFile: true,
      fix: true,
      overrideConfig:
        { plugins: { asljs: { rules: { 'call-expression-style': rule } } },
          rules: { 'asljs/call-expression-style': 'error' } } });

test(
  'markdown example: \\r\\n line endings',
  async () => {
    const code =
      'test(\r\n  a,\r\n  b);';

    const [ result ] =
      await eslint.lintText(code);

    assert.strictEqual(
      result.output,
      undefined);
  });

await addRuleTestsFromMarkdown(
  'eslint-call-expression-style-rule.md',
  eslint);

