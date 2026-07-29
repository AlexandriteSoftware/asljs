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
  from '../logging.js';
import tsCallExpressionFormatterFactory
  from './call-expression.js';

const loggerProvider =
  createPinoLoggerProvider();

const tsCallExpressionFormatter =
  tsCallExpressionFormatterFactory(
    loggerProvider.getLogger(
      'call-expression.test.ts'));

const tsCallExpressionEslintRule =
  tsCallExpressionFormatter
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
                    { 'call-expression-style':
                        tsCallExpressionEslintRule } } },
          rules:
            { 'asljs/call-expression-style': 'error' } } });

await buildStyleRuleTestsFromMarkdown(
  SCRIPT_FILE_PATH,
  eslint);
