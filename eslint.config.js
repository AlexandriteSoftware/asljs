import js
  from '@eslint/js';
import tsParser
  from '@typescript-eslint/parser';
import tsPlugin
  from '@typescript-eslint/eslint-plugin';
import jsImportStyleRule
  from './common/code-formatting-js/eslint-import-style-rule.js';
import jsFunctionDeclarationStyleRule
  from './common/code-formatting-js/eslint-function-declaration-style-rule.js';
import jsCallExpressionStyleRule
  from './common/code-formatting-js/eslint-call-expression-style-rule.js';
import jsVariableDeclarationStyleRule
  from './common/code-formatting-js/eslint-variable-declaration-style-rule.js';
import jsStatementSpacingStyleRule
  from './common/code-formatting-js/eslint-statement-spacing-style-rule.js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      '**/dist/**',
      '**/.tests/**',
      'node_modules/**'
    ]
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      indent: 'off',
      semi: [
        'error',
        'always'
      ],
      eqeqeq: [
        'error',
        'always'
      ],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-duplicate-imports': 'error',
      'function-call-argument-newline': ['error', 'consistent'],
      'nonblock-statement-body-position': [
        'error',
        'below'
      ],
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
      'quotes': [
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
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports'
        }
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          // Enforce explicit return types on declared functions/methods,
          // but avoid making every inline callback noisy.
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true
        }
      ]
    }
  },
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
          'call-expression-style': jsCallExpressionStyleRule,
          'variable-declaration-style': jsVariableDeclarationStyleRule,
          'statement-spacing': jsStatementSpacingStyleRule
        }
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      semi: [
        'error',
        'always'
      ],
      eqeqeq: [
        'error',
        'always'
      ],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-duplicate-imports': 'error',
      'function-call-argument-newline': [
        'error',
        'consistent'
      ],
      'nonblock-statement-body-position': [
        'error',
        'below',
      ],
      'multiline-ternary': [
        'error',
        'always'
      ],
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
      'quotes': [
        'error',
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: true
        }
      ],
      'asljs/import-style': 'error',
      'asljs/function-declaration-style': 'error',
      'asljs/call-expression-style': 'error',
      'asljs/variable-declaration-style': 'error',
      'asljs/statement-spacing': 'error'
    }
  }
];
