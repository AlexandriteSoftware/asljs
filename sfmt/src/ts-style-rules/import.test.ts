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
  from './import.js';

const SCRIPT_FILE_PATH =
  fileURLToPath(
    import.meta.url);

const eslint =
  new ESLint({
  overrideConfigFile: true,
  fix: true,
  overrideConfig: {
    languageOptions: { parser: tsParser },
    plugins: { asljs: { rules: { 'import-style': rule } } },
    rules: { 'asljs/import-style': 'error' }
  }
});

test(
  'ts-style-rules/import: \\r\\n line endings',
  async () =>
  {
    const code =
      "import { readFile }\r\n  from 'node:fs/promises';";

    const [result] =
      await eslint.lintText(code);

    assert.strictEqual(
      result.output,
      undefined
    );
  }
);

await buildStyleRuleTestsFromMarkdown(
  SCRIPT_FILE_PATH,
  eslint
);
