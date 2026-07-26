import tsParser
  from '@typescript-eslint/parser';
import { ESLint }
  from 'eslint';
import { fileURLToPath }
  from 'node:url';
import { buildStyleRuleTestsFromMarkdown }
  from '../functions/build-style-rule-tests-from-markdown.js';
import tsArrayExpressionFormatterFactory
  from './array-expression.js';
import { createPinoLoggerProvider }
  from '../logging.js';

const loggerProvider =
  createPinoLoggerProvider();

const tsArrayExpressionFormatter =
  tsArrayExpressionFormatterFactory(
    loggerProvider.getLogger(
      'array-expression.test.ts'));

const tsArrayExpressionEslintRule =
  tsArrayExpressionFormatter.eslintRule;

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
