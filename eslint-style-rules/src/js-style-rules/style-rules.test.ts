import { ESLint }
  from 'eslint';
import { addRuleTestsFromMarkdown }
  from '../extractTests.js';
import importStyleRule
  from './import.js';
import functionDeclarationStyleRule
  from './function-declaration.js';
import callExpressionStyleRule
  from './call-expression.js';
import variableDeclarationStyleRule
  from './variable-declaration.js';
import statementSpacingStyleRule
  from './statement-spacing.js';

const eslint =
  new ESLint(
    {
      overrideConfigFile: true,
      fix: true,
      overrideConfig:
      {
        plugins: {
          asljs: {
            rules: {
              'import-style': importStyleRule,
              'function-declaration-style': functionDeclarationStyleRule,
              'call-expression-style': callExpressionStyleRule,
              'variable-declaration-style': variableDeclarationStyleRule,
              'statement-spacing': statementSpacingStyleRule
            }
          }
        },
        rules: {
          'asljs/import-style': 'error',
          'asljs/function-declaration-style': 'error',
          'asljs/call-expression-style': 'error',
          'asljs/variable-declaration-style': 'error',
          'asljs/statement-spacing': 'error'
        }
      }
    });

await addRuleTestsFromMarkdown(
  'style-rules.md',
  eslint);
