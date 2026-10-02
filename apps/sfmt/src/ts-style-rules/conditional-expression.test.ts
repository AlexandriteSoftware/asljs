import { RuleDefinition }
  from '@eslint/core';
import tsParser
  from '@typescript-eslint/parser';
import { NullLoggerProvider }
  from 'asljs-logging';
import { ESLint }
  from 'eslint';
import { fileURLToPath }
  from 'node:url';
import { buildStyleRuleTestsFromMarkdown }
  from '../testing/build-style-rule-tests-from-markdown.js';
import tsConditionalExpressionFormatterFactory
  from './conditional-expression.js';

const loggerProvider =
  new NullLoggerProvider();

const tsConditionalExpressionFormatter =
  tsConditionalExpressionFormatterFactory(
    loggerProvider.getLogger(
      'conditional-expression.test.ts'));

const tsConditionalExpressionEslintRule =
  tsConditionalExpressionFormatter
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
                    { 'conditional-expression-style':
                        tsConditionalExpressionEslintRule } } },
          rules:
            { 'asljs/conditional-expression-style': 'error' } } });

await buildStyleRuleTestsFromMarkdown(
  SCRIPT_FILE_PATH,
  eslint);
