import tsParser
  from '@typescript-eslint/parser';
import { ESLint }
  from 'eslint';
import { fileURLToPath }
  from 'node:url';
import { buildStyleRuleTestsFromMarkdown }
  from '../functions/build-style-rule-tests-from-markdown.js';
import { tsArrayExpressionEslintRule }
  from './array-expression.js';

const SCRIPT_FILE_PATH =
  fileURLToPath(
    import.meta.url);

const eslint =
  new ESLint({ overrideConfigFile: true,
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
