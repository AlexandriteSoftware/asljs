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
import tsVariableDeclarationFormatterFactory
  from './variable-declaration.js';

const loggerProvider =
  createPinoLoggerProvider();

const tsVariableDeclarationFormatter =
  tsVariableDeclarationFormatterFactory(
    loggerProvider.getLogger(
      'variable-declaration.test.ts'));

const tsVariableDeclarationEslintRule =
  tsVariableDeclarationFormatter
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
                    { 'variable-declaration-style':
                        tsVariableDeclarationEslintRule } } },
          rules:
            { 'asljs/variable-declaration-style': 'error' } } });

await buildStyleRuleTestsFromMarkdown(
  SCRIPT_FILE_PATH,
  eslint);
