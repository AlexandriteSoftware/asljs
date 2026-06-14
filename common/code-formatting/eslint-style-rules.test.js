import { ESLint }
  from 'eslint';
import { addRuleTestsFromMarkdown }
  from './extractTests.js';
import importStyleRule
  from './eslint-import-style-rule.js';
import functionDeclarationStyleRule
  from './eslint-function-declaration-style-rule.js';
import callExpressionStyleRule
  from './eslint-call-expression-style-rule.js';
import variableDeclarationStyleRule
  from './eslint-variable-declaration-style-rule.js';
import statementSpacingStyleRule
  from './eslint-statement-spacing-style-rule.js';

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
  'eslint-style-rules.md',
  eslint);
