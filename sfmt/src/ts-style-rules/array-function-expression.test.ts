import { RuleDefinition }
  from '@eslint/core';
import tsParser
  from '@typescript-eslint/parser';
import { ESLint }
  from 'eslint';
import { fileURLToPath }
  from 'node:url';
import { buildStyleRuleTestsFromMarkdown }
  from '../functions/build-style-rule-tests-from-markdown.js';
import { createPinoLoggerProvider }
  from 'asljs-logging';
import tsArrayFunctionExpressionFormatterFactory
  from './array-function-expression.js';

const loggerProvider =
  createPinoLoggerProvider();

const tsArrayFunctionExpressionFormatter =
  tsArrayFunctionExpressionFormatterFactory(
    loggerProvider.getLogger(
      'arrayfunctionexpression.test.ts'));

const tsArrayFunctionExpressionEslintRule =
  tsArrayFunctionExpressionFormatter
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
                    { 'arrayfunctionexpression-style':
                        tsArrayFunctionExpressionEslintRule } } },
          rules:
            { 'asljs/arrayfunctionexpression-style': 'error' } } });

await buildStyleRuleTestsFromMarkdown(
  SCRIPT_FILE_PATH,
  eslint);
