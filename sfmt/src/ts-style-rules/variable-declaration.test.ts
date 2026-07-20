import tsParser
  from '@typescript-eslint/parser';
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
  from './variable-declaration.js';

const SCRIPT_FILE_PATH =
  fileURLToPath(
    import.meta.url);

const eslint =
  new ESLint({
  overrideConfigFile: true,
  fix: true,
  overrideConfig: {
    languageOptions: { parser: tsParser },
    plugins: { asljs: { rules: { 'variable-declaration-style': rule } } },
    rules: { 'asljs/variable-declaration-style': 'error' }
  }
});

test(
  'ts-style-rules/variable-declaration: \r\n line endings',
  async () =>
  {
    const code =
      'const a = "12345678901234567890";\r\n';

    const [result] =
      await eslint.lintText(code);

    assert.strictEqual(
      result.output,
      'const a =\r\n  "12345678901234567890";\r\n');
  });

await buildStyleRuleTestsFromMarkdown(
  SCRIPT_FILE_PATH,
  eslint);
