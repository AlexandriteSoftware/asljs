import * as espree
  from 'espree';
import { Expression }
  from 'estree';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { formatCriteriaExpression }
  from './criteria-expression.js';

test(
  'criteria-expression: keeps a single comparison on one line',
  (): void =>
  {
    assert.strictEqual(
      format(
        'nodeLocation === undefined'),
      'nodeLocation === undefined');
  });

test(
  'criteria-expression: breaks before lower-priority equality after addition',
  (): void =>
  {
    assert.strictEqual(
      format('a + b === c'),
      'a + b\n  === c');
  });

test(
  'criteria-expression: breaks before lower-priority logical and after equality',
  (): void =>
  {
    assert.strictEqual(
      format('a === b && c'),
      'a === b\n  && c');
  });

test(
  'criteria-expression: keeps same-priority logical chain on one line',
  (): void =>
  {
    assert.strictEqual(
      format('a && b && c'),
      'a && b && c');
  });

function format(
    code: string
  ): string
{
  const expression =
    parseExpression(
      code);

  return formatCriteriaExpression(
    expression,
    { getText:
        (node: Expression): string =>
        getNodeText(
          code,
          node),
      newLine: '\n',
      continuationIndentation: '  ' });
}

function parseExpression(
    code: string
  ): Expression
{
  const ast =
    espree.parse(
      code,
      { ecmaVersion: 'latest',
        sourceType: 'module',
        range: true });

  const statement =
    ast.body[0];

  if (statement.type !== 'ExpressionStatement') {
    throw new Error(
      'Expected expression statement');
  }

  return statement.expression as Expression;
}

function getNodeText(
    code: string,
    node: Expression
  ): string
{
  const range =
    (node as Expression & { range?: [number, number]; }).range;

  if (!range) {
    throw new Error(
      'Expected range information');
  }

  return code.slice(
    range[0],
    range[1]);
}