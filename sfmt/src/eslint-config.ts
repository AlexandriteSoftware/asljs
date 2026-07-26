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
import tsCallExpressionFormatterFactory
  from './ts-style-rules/call-expression.js';
import tsConditionalExpressionFormatterFactory
  from './ts-style-rules/conditional-expression.js';
import tsFunctionDeclarationFormatterFactory
  from './ts-style-rules/function-declaration.js';
import tsImportDeclarationFormatterFactory
  from './ts-style-rules/import-declaration.js';
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

const tsCallExpressionFormatter =
  tsCallExpressionFormatterFactory(
    loggerProvider.getLogger());

const tsConditionalExpressionFormatter =
  tsConditionalExpressionFormatterFactory(
    loggerProvider.getLogger());

const tsFunctionDeclarationFormatter =
  tsFunctionDeclarationFormatterFactory(
    loggerProvider.getLogger());

const tsImportDeclarationFormatter =
  tsImportDeclarationFormatterFactory(
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
      { '@typescript-eslint':
          tseslint.plugin,
        asljs:
          { rules:
              { 'import-style':
                  tsImportDeclarationFormatter.eslintRule,
                'function-declaration-style':
                  tsFunctionDeclarationFormatter.eslintRule,
                'conditional-expression-style':
                  tsConditionalExpressionFormatter.eslintRule,
                'call-expression-style':
                  tsCallExpressionFormatter.eslintRule,
                'variable-declaration-style':
                  tsVariableDeclarationFormatter.eslintRule,
                'statement-spacing':
                  tsStatementSpacingFormatter.eslintRule,
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
        'asljs/function-declaration-style': 'error',
        'asljs/conditional-expression-style': 'error',
        'asljs/call-expression-style': 'error',
        'asljs/variable-declaration-style': 'error',
        'asljs/statement-spacing': 'error',
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
