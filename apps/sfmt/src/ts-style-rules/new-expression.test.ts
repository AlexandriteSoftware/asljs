import { RuleDefinition }
  from '@eslint/core';
import tsParser
  from '@typescript-eslint/parser';
import { createTestLoggerProvider }
  from 'asljs-logging';
import test
  from 'node:test';
import { ESLint }
  from 'eslint';
import { fileURLToPath }
  from 'node:url';
import { buildStyleRuleTestsFromMarkdown }
  from '../testing/build-style-rule-tests-from-markdown.js';
import tsNewExpressionFormatterFactory
  from './new-expression.js';

const loggerProvider =
  createTestLoggerProvider();

test.after(
  async () => await loggerProvider.dispose());

const tsNewExpressionFormatter =
  tsNewExpressionFormatterFactory(
    loggerProvider.getLogger(
      'new-expression.test.ts'));

const tsNewExpressionEslintRule =
  tsNewExpressionFormatter
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
                    { 'new-expression-style':
                        tsNewExpressionEslintRule } } },
          rules:
            { 'asljs/new-expression-style': 'error' } } });

await buildStyleRuleTestsFromMarkdown(
  SCRIPT_FILE_PATH,
  eslint);
