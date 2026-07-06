import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { ESLint }
  from 'eslint';
import { addRuleTestsFromMarkdown }
  from '../extractTests.js';
import rule
  from './variable-declaration.js';

const eslint =
  new ESLint(
    { overrideConfigFile: true,
      fix: true,
      overrideConfig:
        { plugins: { asljs: { rules: { 'variable-declaration-style': rule } } },
          rules: { 'asljs/variable-declaration-style': 'error' } } });

test(
  'variable-declaration: \\r\\n line endings',
  async () => {
    const code =
      'const a = "12345678901234567890";\r\n';

    const [ result ] =
      await eslint.lintText(code);

    assert.strictEqual(
      result.output,
      'const a =\r\n  "12345678901234567890";\r\n');
  });

await addRuleTestsFromMarkdown(
  'variable-declaration.md',
  eslint);
