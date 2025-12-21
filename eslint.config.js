import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      'dist/**',
      '.tests/**',
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
      indent: [
        'error',
        2,
        {
          SwitchCase: 1,
          FunctionDeclaration: { parameters: 2 },
          FunctionExpression: { parameters: 2 },
          ArrowFunctionExpression: { parameters: 2 },
          ignoredNodes: [
            // TypeScript adds nodes that the core indent rule can't
            // consistently reason about (notably return type annotations).
            'TSTypeAnnotation'
          ]
        }
      ],
      'function-call-argument-newline': ['error', 'consistent'],
      'nonblock-statement-body-position': [
        'error',
        'below'
      ],
      'multiline-ternary': ['error', 'always'],
      'operator-linebreak': [
        'error',
        'after',
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
    },
    rules: {
      ...js.configs.recommended.rules,
      indent: [
        'error',
        2,
        { SwitchCase: 1 }
      ],
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
        'after',
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
      ]
    }
  }
];
