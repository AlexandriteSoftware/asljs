import js
  from '@eslint/js';
import tsParser
  from '@typescript-eslint/parser';
import { type Linter }
  from 'eslint';
import tseslint
  from 'typescript-eslint';
import jsCallExpressionStyleRule
  from './js-style-rules/call-expression.js';
import jsConditionalExpressionStyleRule
  from './js-style-rules/conditional-expression.js';
import jsFunctionDeclarationStyleRule
  from './js-style-rules/function-declaration.js';
import jsImportStyleRule
  from './js-style-rules/import.js';
import jsStatementSpacingStyleRule
  from './js-style-rules/statement-spacing.js';
import jsVariableDeclarationStyleRule
  from './js-style-rules/variable-declaration.js';
import { tsCallExpressionEslintRule }
  from './ts-style-rules/call-expression.js';
import tsConditionalExpressionStyleRule
  from './ts-style-rules/conditional-expression.js';
import tsFunctionDeclarationStyleRule
  from './ts-style-rules/function-declaration.js';
import tsImportStyleRule
  from './ts-style-rules/import.js';
import tsStatementSpacingStyleRule
  from './ts-style-rules/statement-spacing.js';
import tsVariableDeclarationStyleRule
  from './ts-style-rules/variable-declaration.js';

const ignores: Linter.Config =
  {
  ignores: ['**/dist/**', '**/build/**', '**/.tests/**', '**/node_modules/**']
};

const typescriptConfig: Linter.Config =
  {
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    }
  },
  plugins: {
    '@typescript-eslint': tseslint.plugin,
    asljs: {
      rules: {
        'import-style': tsImportStyleRule,
        'function-declaration-style': tsFunctionDeclarationStyleRule,
        'conditional-expression-style': tsConditionalExpressionStyleRule,
        'call-expression-style': tsCallExpressionEslintRule,
        'variable-declaration-style': tsVariableDeclarationStyleRule,
        'statement-spacing': tsStatementSpacingStyleRule
      }
    }
  },
  rules: {
    indent: 'off',
    semi: ['error', 'always'],
    eqeqeq: ['error', 'always'],
    'prefer-const': 'error',
    'no-var': 'error',
    'function-call-argument-newline': ['error', 'consistent'],
    'nonblock-statement-body-position': ['error', 'below'],
    'multiline-ternary': ['error', 'always'],
    'operator-linebreak': [
      'error',
      'before',
      {
        overrides: {
          '=': 'after',
          '&&': 'before',
          '||': 'before',
          '?': 'before',
          ':': 'before'
        }
      }
    ],
    quotes: [
      'error',
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true
      }
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unsafe-function-type': 'off',
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/explicit-function-return-type': [
      'error',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
        allowDirectConstAssertionInArrowFunctions: true
      }
    ],
    'asljs/import-style': 'error',
    'asljs/function-declaration-style': 'error',
    'asljs/conditional-expression-style': 'error',
    'asljs/call-expression-style': 'error',
    'asljs/variable-declaration-style': 'error',
    'asljs/statement-spacing': 'error'
  }
};

const javascriptConfig: Linter.Config =
  {
  files: ['**/*.{js,mjs,cjs}'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: {
    asljs: {
      rules: {
        'import-style': jsImportStyleRule,
        'function-declaration-style': jsFunctionDeclarationStyleRule,
        'conditional-expression-style': jsConditionalExpressionStyleRule,
        'call-expression-style': jsCallExpressionStyleRule,
        'variable-declaration-style': jsVariableDeclarationStyleRule,
        'statement-spacing': jsStatementSpacingStyleRule
      }
    }
  },
  rules: {
    ...js.configs.recommended.rules,
    semi: ['error', 'always'],
    eqeqeq: ['error', 'always'],
    'prefer-const': 'error',
    'no-var': 'error',
    'no-duplicate-imports': 'error',
    'function-call-argument-newline': ['error', 'consistent'],
    'nonblock-statement-body-position': ['error', 'below'],
    'multiline-ternary': ['error', 'always'],
    'operator-linebreak': [
      'error',
      'before',
      {
        overrides: {
          '=': 'after',
          '&&': 'before',
          '||': 'before',
          '?': 'before',
          ':': 'before'
        }
      }
    ],
    quotes: [
      'error',
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true
      }
    ],
    'asljs/import-style': 'error',
    'asljs/function-declaration-style': 'error',
    'asljs/conditional-expression-style': 'error',
    'asljs/call-expression-style': 'error',
    'asljs/variable-declaration-style': 'error',
    'asljs/statement-spacing': 'error'
  }
};

const configs: Linter.Config[] =
  [ignores, typescriptConfig, javascriptConfig];

export default configs;
