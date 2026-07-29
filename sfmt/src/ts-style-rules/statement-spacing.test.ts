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
import tsStatementSpacingFormatterFactory
  from './statement-spacing.js';

const loggerProvider =
  createPinoLoggerProvider();

const tsStatementSpacingFormatter =
  tsStatementSpacingFormatterFactory(
    loggerProvider.getLogger(
      'statement-spacing.test.ts'));

const tsStatementSpacingEslintRule =
  tsStatementSpacingFormatter
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
                    { 'statement-spacing':
                        tsStatementSpacingEslintRule } } },
          rules:
            { 'asljs/statement-spacing': 'error' } } });

await buildStyleRuleTestsFromMarkdown(
  SCRIPT_FILE_PATH,
  eslint);
