import { ESLint }
  from 'eslint';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { fileURLToPath }
  from 'node:url';
import { addRuleTestsFromMarkdown }
  from '../functions/extractTests.js';
import rule
  from './conditional-expression.js';

const SCRIPT_FILE_PATH =
  fileURLToPath(
    import.meta.url);

const eslint =
  new ESLint({
  overrideConfigFile: true,
  fix: true,
  overrideConfig: {
    plugins: { asljs: { rules: { 'conditional-expression-style': rule } } },
    rules: { 'asljs/conditional-expression-style': 'error' }
  }
});

test(
  'conditional-expression: \r\n line endings',
  async () =>
  {
    const code =
      'const result = condition\r\n  ? whenTrue\r\n  : whenFalse;';

    const [result] =
      await eslint.lintText(code);

    assert.strictEqual(
      result.output,
      undefined
    );
  }
);

await addRuleTestsFromMarkdown(
  SCRIPT_FILE_PATH,
  eslint
);
