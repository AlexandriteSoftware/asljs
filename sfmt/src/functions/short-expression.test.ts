import * as espree
  from 'espree';
import { Expression }
  from 'estree';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { expressionIsShort }
  from './short-expression.js';

function parseExpression(
    code: string
  ): Expression
{
  const ast =
    espree.parse(
      code,
      { ecmaVersion: 'latest',
        sourceType: 'module' });

  const statement =
    ast.body[0];

  if (statement.type !== 'ExpressionStatement') {
    throw new Error('Expected expression statement');
  }

  return statement.expression as Expression;
}

const testExpressions =
  Object.entries(
    { a: true,
      a1234567890123: true,
      a12345678901234: false,
      '1234567890123': true,
      '123456789012345': false,
      '-1.23456789e10': true,
      '-2.23456789e100': false,
      '++a': false,
      'a++': false,
      '({})': true,
      '({a:1})': false,
      '[]': true,
      '[1]': false,
      'new Set()': true,
      'new Map()': true,
      'new Smth()': false,
      '`012345678901`': true,
      '`0123456789012`': false,
      true: true,
      false: true,
      null: true,
      undefined: true });

for (const [code, expectedResult] of testExpressions) {
  test(
    `short-expression: expressionIsShort returns ${expectedResult} for ${code}`,
    () =>
    {
      const expression =
        parseExpression(code);

      assert.equal(
        expressionIsShort(expression),
        expectedResult);
    });
}
