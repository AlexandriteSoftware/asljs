import tsParser
  from '@typescript-eslint/parser';
import { ESLint }
  from 'eslint';
import { fileURLToPath }
  from 'node:url';
import { addRuleTestsFromMarkdown }
  from '../functions/extractTests.js';
import callExpressionStyleRule
  from './call-expression.js';
import conditionalExpressionStyleRule
  from './conditional-expression.js';
import functionDeclarationStyleRule
  from './function-declaration.js';
import importStyleRule
  from './import.js';
import statementSpacingStyleRule
  from './statement-spacing.js';
import variableDeclarationStyleRule
  from './variable-declaration.js';

const SCRIPT_FILE_PATH =
  fileURLToPath(
    import.meta.url);

const eslint =
  new ESLint({
  overrideConfigFile: true,
  fix: true,
  overrideConfig: {
    languageOptions: { parser: tsParser },
    plugins: {
      asljs: {
        rules: {
          'import-style': importStyleRule,
          'function-declaration-style': functionDeclarationStyleRule,
          'conditional-expression-style': conditionalExpressionStyleRule,
          'call-expression-style': callExpressionStyleRule,
          'variable-declaration-style': variableDeclarationStyleRule,
          'statement-spacing': statementSpacingStyleRule
        }
      }
    },
    rules: {
      'asljs/import-style': 'error',
      'asljs/function-declaration-style': 'error',
      'asljs/conditional-expression-style': 'error',
      'asljs/call-expression-style': 'error',
      'asljs/variable-declaration-style': 'error',
      'asljs/statement-spacing': 'error'
    }
  }
});

await addRuleTestsFromMarkdown(
  SCRIPT_FILE_PATH,
  eslint
);
