import tsParser
  from '@typescript-eslint/parser';
import { TSESTree }
  from '@typescript-eslint/typescript-estree';
import { Expression }
  from 'estree';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { expressionIsSimple }
  from './simple-expression.js';

function parseExpression(
    code: string
  ): Expression | TSESTree.TSAsExpression
{
  const ast =
    tsParser.parse(
      code,
      { ecmaVersion: 'latest',
        sourceType: 'module',
        loc: true });

  const statement = ast.body[0];

  if (
    statement.type
    !== 'ExpressionStatement'
  ) {
    throw new Error(
      'Expected expression statement');
  }

  return statement.expression as Expression;
}

const allTestExpressions =
  Object.entries(
    { a: true,
      a234567890123456789: true,
      a2345678901234567890: false,
      'a12345.b12345.c1234': true,
      'a12345.b12345.c12345': false,
      'a12345?.b12345?.c12': true,
      'a12345?.b12345?.c123': false,
      "a1234?.b123?.['c1']": true,
      "a1234?.b123?.['c12']": false,
      '1234567890123456789': true,
      '12345678901234567890': false,
      '-1.2345678901234e10': true,
      '-2.2345678901234e100': false,
      '++a': false,
      'a++': false,
      '({})': true,
      '({a:1})': false,
      '[]': true,
      '[1]': false,
      'new Set()': true,
      'new Map()': true,
      'new Smth()': false,
      '`12345678901234567`': true,
      '`123456789012345678`': false,
      '`\n12345678901234567890`': false,
      'a()': false,
      'test as string': false,
      'sourceCode.lines[nodeStartLine - 1]': false,
      'a + b': true,
      'a * b': true,
      'a && b': true,
      'a === b': true,
      'nodeLocation === undefined': true,
      'a === b && b === c': false,
      true: true,
      false: true,
      null: true,
      undefined: true,
      this: true });

const focusedTestExpressions =
  Object.entries(
    {});

const testExpressions =
  focusedTestExpressions.length > 0
  ? focusedTestExpressions
  : allTestExpressions;

for (const [code, expectedResult] of testExpressions) {
  const codeText =
    JSON.stringify(code);

  const expectedText =
    expectedResult
    ? 'simple'
    : 'complex';

  test(
    `simple-expression: ${codeText} => ${expectedText}`,
    () =>
    {
      const expression =
        parseExpression(code);

      assert.equal(
        expressionIsSimple(expression),
        expectedResult);
    });
}
