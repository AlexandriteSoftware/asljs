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
import { createPinoLoggerProvider }
  from '../logging.js';
import tsAssignmentExpressionFormatterFactory
  from './assignment-expression.js';

const loggerProvider =
  createPinoLoggerProvider();

const tsAssignmentExpressionFormatter =
  tsAssignmentExpressionFormatterFactory(
    loggerProvider.getLogger(
      'assignment-expression.test.ts'));

const tsAssignmentExpressionEslintRule =
  tsAssignmentExpressionFormatter.eslintRule;

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
                    { 'assignment-expression-style':
                        tsAssignmentExpressionEslintRule } } },
          rules:
            { 'asljs/assignment-expression-style': 'error' } } });

await buildStyleRuleTestsFromMarkdown(
  SCRIPT_FILE_PATH,
  eslint);
