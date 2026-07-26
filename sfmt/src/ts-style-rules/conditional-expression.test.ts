import tsParser
  from '@typescript-eslint/parser';
import { ESLint }
  from 'eslint';
import { fileURLToPath }
  from 'node:url';
import { buildStyleRuleTestsFromMarkdown }
  from '../functions/build-style-rule-tests-from-markdown.js';
import tsConditionalExpressionFormatterFactory
  from './conditional-expression.js';
import { createPinoLoggerProvider }
  from '../logging.js';

const loggerProvider =
  createPinoLoggerProvider();

const tsConditionalExpressionFormatter =
  tsConditionalExpressionFormatterFactory(
    loggerProvider.getLogger(
      'conditional-expression.test.ts'));

const tsConditionalExpressionEslintRule =
  tsConditionalExpressionFormatter.eslintRule;

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
