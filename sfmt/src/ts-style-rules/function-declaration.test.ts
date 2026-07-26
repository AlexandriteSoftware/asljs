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
import tsFunctionDeclarationFormatterFactory
  from './function-declaration.js';

const loggerProvider =
  createPinoLoggerProvider();

const tsFunctionDeclarationFormatter =
  tsFunctionDeclarationFormatterFactory(
    loggerProvider.getLogger(
      'function-declaration.test.ts'));

const tsFunctionDeclarationEslintRule =
  tsFunctionDeclarationFormatter.eslintRule;

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
                  { 'function-declaration-style':
                      tsFunctionDeclarationEslintRule } } },
        rules:
          { 'asljs/function-declaration-style': 'error' } } }
);

await buildStyleRuleTestsFromMarkdown(
  SCRIPT_FILE_PATH,
  eslint);
