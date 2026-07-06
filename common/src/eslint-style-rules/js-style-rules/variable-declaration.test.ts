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
import { fileURLToPath }
  from 'node:url';

const SCRIPT_FILE_PATH =
  fileURLToPath(
    import.meta.url);

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
  SCRIPT_FILE_PATH,
  eslint);
