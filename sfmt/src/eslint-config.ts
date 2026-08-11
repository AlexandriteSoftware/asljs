import { type Plugin,
         type RuleDefinition }
  from '@eslint/core';
import js
  from '@eslint/js';
import tsParser
  from '@typescript-eslint/parser';
import { type Linter }
  from 'eslint';
import tseslint
  from 'typescript-eslint';
import { NullLoggerProvider }
  from 'asljs-logging';
import tsArrayExpressionFormatterFactory
  from './ts-style-rules/array-expression.js';
import tsArrayFunctionExpressionFormatterFactory
  from './ts-style-rules/array-function-expression.js';
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
import tsTypeAliasDeclarationFormatterFactory
  from './ts-style-rules/type-alias-declaration.js';
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

const tsFormatterFactories =
  { 'array-expression-style':
      tsArrayExpressionFormatterFactory,
    'arrayfunctionexpression-style':
      tsArrayFunctionExpressionFormatterFactory,
    'assignment-expression-style':
      tsAssignmentExpressionFormatterFactory,
    'call-expression-style':
      tsCallExpressionFormatterFactory,
    'conditional-expression-style':
      tsConditionalExpressionFormatterFactory,
    'for-statement-style':
      tsForStatementFormatterFactory,
    'function-declaration-style':
      tsFunctionDeclarationFormatterFactory,
    'if-statement-style':
      tsIfStatementFormatterFactory,
    'import-style':
      tsImportDeclarationFormatterFactory,
    'new-expression-style':
      tsNewExpressionFormatterFactory,
    'object-expression-style':
      tsObjectExpressionFormatterFactory,
    'statement-spacing-style':
      tsStatementSpacingFormatterFactory,
    'type-alias-declaration':
      tsTypeAliasDeclarationFormatterFactory,
    'variable-declaration-style':
      tsVariableDeclarationFormatterFactory };

const pluginRules: Record<string, RuleDefinition> = {};

for (
  const [ruleName, formatterFactory] of Object.entries(
    tsFormatterFactories)
) {
  const rule =
    formatterFactory(
      loggerProvider.getLogger());

  pluginRules[ruleName] =
    rule.eslintRule as unknown as RuleDefinition;
}

const severityPerPluginRule: Record<string, string> =
  Object.fromEntries(
    Object.entries(
      pluginRules)
    .map(
      (
          [ruleName, _rule]
        ) =>
      {
        const entry =
          [ `asljs-sfmt-ts/${ruleName}`,
            'error' as const ];

        return entry;
      }));

const asljsSfmtTsPlugin: Record<string, Plugin> =
  { 'asljs-sfmt-ts':
      { rules: pluginRules } };

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
        ...asljsSfmtTsPlugin },
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
        ...severityPerPluginRule } };

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
