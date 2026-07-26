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
import tsImportDeclarationFormatterFactory
  from './import-declaration.js';

const loggerProvider =
  createPinoLoggerProvider();

const tsImportDeclarationFormatter =
  tsImportDeclarationFormatterFactory(
    loggerProvider.getLogger(
      'Import-declaration.test.ts'));

const tsImportDeclarationEslintRule =
  tsImportDeclarationFormatter.eslintRule;


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
                    { 'import-declaration-style':
                        tsImportDeclarationEslintRule } } },
          rules:
            { 'asljs/import-declaration-style': 'error' } } });

  await buildStyleRuleTestsFromMarkdown(
    SCRIPT_FILE_PATH,
    eslint);
