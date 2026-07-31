import tsParser
  from '@typescript-eslint/parser';
import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { criteriaPartIsSimple }
  from './simple-criteria-part.js';

function parseExpression(
    code: string
  ): TSESTree.Expression
{
  const ast =
    tsParser.parse(
      code,
      { ecmaVersion: 'latest',
        sourceType: 'module',
        range: true });

  const statement = ast.body[0];

  if (
    statement.type
    !== 'ExpressionStatement'
  ) {
    throw new Error(
      'Expected expression statement');
  }

  return statement.expression;
}

const allTestExpressions =
  Object.entries(
    { '12': true,
      '-10': true,
      '-100': false,
      "''": true,
      "' '": true,
      "'['": true,
      "'\\n'": true,
      "'\\u005b'": true,
      "'ab'": false,
      'a12345.b12345.c12345': false });

for (const [code, expectedResult] of allTestExpressions) {
  const codeText =
    JSON.stringify(code);

  const expectedText =
    expectedResult
    ? 'simple-criteria-part'
    : 'not-simple-criteria-part';

  test(
    `simple-criteria-part: ${codeText} => ${expectedText}`,
    () =>
    {
      const expression =
        parseExpression(code);

      const actual =
        criteriaPartIsSimple(
          expression,
          { getText:
              node =>
            code.slice(
              node.range?.[0] ?? 0,
              node.range?.[1] ?? 0) });

      assert.equal(
        actual,
        expectedResult);
    });
}
