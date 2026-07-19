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
  from './function-declaration.js';

const SCRIPT_FILE_PATH =
  fileURLToPath(
    import.meta.url);

const eslint =
  new ESLint({
  overrideConfigFile: true,
  fix: true,
  overrideConfig: {
    languageOptions: { parser: tsParser },
    plugins: { asljs: { rules: { 'function-declaration-style': rule } } },
    rules: { 'asljs/function-declaration-style': 'error' }
  }
});

await buildStyleRuleTestsFromMarkdown(
  SCRIPT_FILE_PATH,
  eslint
);
