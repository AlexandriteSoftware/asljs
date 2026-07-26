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
import tsNewExpressionFormatterFactory
  from './new-expression.js';

const loggerProvider =
  createPinoLoggerProvider();

const tsNewExpressionFormatter =
  tsNewExpressionFormatterFactory(
    loggerProvider.getLogger(
      'new-expression.test.ts'));

const tsNewExpressionEslintRule =
  tsNewExpressionFormatter.eslintRule;

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
