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
import tsAssignmentExpressionFormatterFactory
  from './assignment-expression.js';

const loggerProvider =
  createPinoLoggerProvider();

const tsAssignmentExpressionFormatter =
  tsAssignmentExpressionFormatterFactory(
    loggerProvider.getLogger(
      'assignment-expression.test.ts'));

const tsAssignmentExpressionEslintRule =
  tsAssignmentExpressionFormatter
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
                    { 'assignment-expression-style':
                        tsAssignmentExpressionEslintRule } } },
          rules:
            { 'asljs/assignment-expression-style': 'error' } } });

await buildStyleRuleTestsFromMarkdown(
  SCRIPT_FILE_PATH,
  eslint);
