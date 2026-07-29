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
import tsTypeAliasDeclarationFormatterFactory
  from './type-alias-declaration.js';

const loggerProvider =
  createPinoLoggerProvider();

const tsTypeAliasDeclarationFormatter =
  tsTypeAliasDeclarationFormatterFactory(
    loggerProvider.getLogger(
      'type-alias-declaration.test.ts'));

const tsTypeAliasDeclarationEslintRule =
  tsTypeAliasDeclarationFormatter
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
                    { 'type-alias-declaration':
                        tsTypeAliasDeclarationEslintRule } } },
          rules:
            { 'asljs/type-alias-declaration': 'error' } } });

await buildStyleRuleTestsFromMarkdown(
  SCRIPT_FILE_PATH,
  eslint);
