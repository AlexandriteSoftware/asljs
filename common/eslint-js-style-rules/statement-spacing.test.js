import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { ESLint }
  from 'eslint';
import { addRuleTestsFromMarkdown }
  from '../extractTests.js';
import rule
  from './statement-spacing.js';

const eslint =
  new ESLint(
    { overrideConfigFile: true,
      fix: true,
      overrideConfig:
        { plugins: { asljs: { rules: { 'statement-spacing': rule } } },
          rules: { 'asljs/statement-spacing': 'error' } } });

test(
  'statement-spacing: \\r\\n line endings',
  async () => {
    const code =
      'import { readFile }\r\n  from \'node:fs/promises\';';

    const [ result ] =
      await eslint.lintText(code);

    assert.strictEqual(
      result.output,
      undefined);
  });

await addRuleTestsFromMarkdown(
  'statement-spacing.md',
  eslint);
