import { RuleDefinition }
  from '@eslint/core';
import tsParser
  from '@typescript-eslint/parser';
import { createTestLoggerProvider }
  from 'asljs-testing';
import { ESLint }
  from 'eslint';
import test
  from 'node:test';
import { fileURLToPath }
  from 'node:url';
import { buildStyleRuleTestsFromMarkdown }
  from '../testing/build-style-rule-tests-from-markdown.js';
import tsArrayExpressionFormatterFactory
  from './array-expression.js';

const loggerProvider =
  createTestLoggerProvider();

test.after(
  async () => await loggerProvider.dispose());

const tsArrayExpressionFormatter =
  tsArrayExpressionFormatterFactory(
    loggerProvider.getLogger(
      'array-expression.test.ts'));

const tsArrayExpressionEslintRule =
  tsArrayExpressionFormatter
  .eslintRule as unknown as RuleDefinition;

const SCRIPT_FILE_PATH =
  fileURLToPath(
    import.meta.url);

const eslint =
  new ESLint(
    { overrideConfigFile: true,
      fix: true,
      overrideConfig:
        { languageOptions:
            { parser: tsParser },
          plugins:
            { asljs:
                { rules:
                    { 'array-expression-style':
                        tsArrayExpressionEslintRule } } },
          rules:
            { 'asljs/array-expression-style': 'error' } } });

await buildStyleRuleTestsFromMarkdown(
  SCRIPT_FILE_PATH,
  eslint);
