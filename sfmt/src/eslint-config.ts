import js
  from '@eslint/js';
import tsParser
  from '@typescript-eslint/parser';
import { type Linter }
  from 'eslint';
import tseslint
  from 'typescript-eslint';
import { NullLoggerProvider }
  from './index.js';
import tsArrayExpressionFormatterFactory
  from './ts-style-rules/array-expression.js';
import tsAssignmentExpressionFormatterFactory
  from './ts-style-rules/assignment-expression.js';
import tsCallExpressionFormatterFactory
  from './ts-style-rules/call-expression.js';
import tsConditionalExpressionFormatterFactory
  from './ts-style-rules/conditional-expression.js';
import tsForStatementFormatterFactory
  from './ts-style-rules/for-statement.js';
import tsFunctionDeclarationFormatterFactory
  from './ts-style-rules/function-declaration.js';
import tsIfStatementFormatterFactory
  from './ts-style-rules/if-statement.js';
import tsImportDeclarationFormatterFactory
  from './ts-style-rules/import-declaration.js';
import tsNewExpressionFormatterFactory
  from './ts-style-rules/new-expression.js';
import tsObjectExpressionFormatterFactory
  from './ts-style-rules/object-expression.js';
import tsStatementSpacingFormatterFactory
  from './ts-style-rules/statement-spacing.js';
import tsVariableDeclarationFormatterFactory
  from './ts-style-rules/variable-declaration.js';

const ignores: Linter.Config =
  { ignores:
      [ '**/dist/**',
        '**/build/**',
        '**/.tests/**',
        '**/node_modules/**' ] };

const loggerProvider =
  new NullLoggerProvider();

const tsArrayExpressionFormatter =
  tsArrayExpressionFormatterFactory(
    loggerProvider.getLogger());

const tsAssignmentExpressionFormatter =
  tsAssignmentExpressionFormatterFactory(
    loggerProvider.getLogger());

const tsCallExpressionFormatter =
  tsCallExpressionFormatterFactory(
    loggerProvider.getLogger());

const tsConditionalExpressionFormatter =
  tsConditionalExpressionFormatterFactory(
    loggerProvider.getLogger());

const tsForStatementFormatter =
  tsForStatementFormatterFactory(
    loggerProvider.getLogger());

const tsFunctionDeclarationFormatter =
  tsFunctionDeclarationFormatterFactory(
    loggerProvider.getLogger());

const tsIfStatementFormatter =
  tsIfStatementFormatterFactory(
    loggerProvider.getLogger());

const tsImportDeclarationFormatter =
  tsImportDeclarationFormatterFactory(
    loggerProvider.getLogger());

const tsNewExpressionFormatter =
  tsNewExpressionFormatterFactory(
    loggerProvider.getLogger());

const tsObjectExpressionFormatter =
  tsObjectExpressionFormatterFactory(
    loggerProvider.getLogger());

const tsStatementSpacingFormatter =
  tsStatementSpacingFormatterFactory(
    loggerProvider.getLogger());

const tsVariableDeclarationFormatter =
  tsVariableDeclarationFormatterFactory(
    loggerProvider.getLogger());

const typescriptConfig: Linter.Config =
  { files:
      [ '**/*.{ts,tsx}' ],
    languageOptions:
      { parser: tsParser,
        parserOptions:
          { ecmaVersion: 'latest',
            sourceType: 'module' } },
    plugins:
      { '@typescript-eslint': tseslint.plugin,
        asljs:
          { rules:
              { 'import-style':
                  tsImportDeclarationFormatter.eslintRule,
                'assignment-expression-style':
                  tsAssignmentExpressionFormatter.eslintRule,
                'function-declaration-style':
                  tsFunctionDeclarationFormatter.eslintRule,
                'for-statement-style':
                  tsForStatementFormatter.eslintRule,
                'if-statement-style':
                  tsIfStatementFormatter.eslintRule,
                'conditional-expression-style':
                  tsConditionalExpressionFormatter.eslintRule,
                'call-expression-style':
                  tsCallExpressionFormatter.eslintRule,
                'variable-declaration-style':
                  tsVariableDeclarationFormatter.eslintRule,
                'statement-spacing':
                  tsStatementSpacingFormatter.eslintRule,
                'new-expression-style':
                  tsNewExpressionFormatter.eslintRule,
                'object-expression-style':
                  tsObjectExpressionFormatter.eslintRule,
                'array-expression-style':
                  tsArrayExpressionFormatter.eslintRule } } },
    rules:
      { indent: 'off',
        semi:
          [ 'error',
            'always' ],
        eqeqeq:
          [ 'error',
            'always' ],
        'prefer-const': 'error',
        'no-var': 'error',
        'function-call-argument-newline':
          [ 'error',
            'consistent' ],
        'nonblock-statement-body-position':
          [ 'error',
            'below' ],
        'multiline-ternary':
          [ 'error',
            'always' ],
        'operator-linebreak':
          [ 'error',
            'before',
            { overrides:
                { '=': 'after',
                  '&&': 'before',
                  '||': 'before',
                  '?': 'before',
                  ':': 'before' } } ],
        quotes:
          [ 'error',
            'single',
            { avoidEscape: true,
              allowTemplateLiterals: true } ],
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-function-type': 'off',
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/explicit-function-return-type':
          [ 'error',
            { allowExpressions: true,
              allowTypedFunctionExpressions: true,
              allowHigherOrderFunctions: true,
              allowDirectConstAssertionInArrowFunctions: true } ],
        'asljs/import-style': 'error',
        'asljs/assignment-expression-style': 'error',
        'asljs/function-declaration-style': 'error',
        'asljs/for-statement-style': 'error',
        'asljs/if-statement-style': 'error',
        'asljs/conditional-expression-style': 'error',
        'asljs/call-expression-style': 'error',
        'asljs/variable-declaration-style': 'error',
        'asljs/statement-spacing': 'error',
        'asljs/new-expression-style': 'error',
        'asljs/object-expression-style': 'error',
        'asljs/array-expression-style': 'error' } };

const javascriptConfig: Linter.Config =
  { files:
      [ '**/*.{js,mjs,cjs}' ],
    languageOptions:
      { ecmaVersion: 'latest',
        sourceType: 'module' },
    rules:
      { ...js.configs.recommended.rules,
        semi:
          [ 'error',
            'always' ],
        eqeqeq:
          [ 'error',
            'always' ],
        'prefer-const': 'error',
        'no-var': 'error',
        'no-duplicate-imports': 'error',
        'function-call-argument-newline':
          [ 'error',
            'consistent' ],
        'nonblock-statement-body-position':
          [ 'error',
            'below' ],
        'multiline-ternary':
          [ 'error',
            'always' ],
        'operator-linebreak':
          [ 'error',
            'before',
            { overrides:
                { '=': 'after',
                  '&&': 'before',
                  '||': 'before',
                  '?': 'before',
                  ':': 'before' } } ],
        quotes:
          [ 'error',
            'single',
            { avoidEscape: true,
              allowTemplateLiterals: true } ] } };

const configs: Linter.Config[] =
  [ ignores,
    typescriptConfig,
    javascriptConfig ];

export default configs;
