import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { ESLint }
  from 'eslint';
import { addRuleTestsFromMarkdown }
  from '../extractTests.js';
import rule
  from './import.js';
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
        { plugins: { asljs: { rules: { 'import-style': rule } } },
          rules: { 'asljs/import-style': 'error' } } });

test(
  'import: \\r\\n line endings',
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
  markdownTestsFilePath,
  eslint);
