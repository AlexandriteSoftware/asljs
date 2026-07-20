import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import * as acorn
  from 'acorn';
import { ArrayExpression,
         Expression,
         Identifier,
         Literal,
         NewExpression,
         ObjectExpression,
         SpreadElement,
         TemplateLiteral,
         UnaryExpression }
  from 'estree';

const LONG_EXPRESSION_LENGTH = 15;

export type ExpressionParameter =
  | Expression
  | SpreadElement
  | TSESTree.Expression;

export function expressionIsShort(
    expression: ExpressionParameter
  ): boolean
{
  if (expression.type === 'ObjectExpression') {
    const objectExpression =
      expression as ObjectExpression;

    return objectExpression.properties.length === 0;
  }

  if (expression.type === 'ArrayExpression') {
    const arrayExpression =
      expression as ArrayExpression;

    return arrayExpression.elements.length === 0;
  }

  if (expression.type === 'NewExpression') {
    const newExpression =
      expression as NewExpression;

    if (newExpression.callee.type === 'Identifier') {
      const calleeIdentifier =
        newExpression.callee as Identifier;

      const allowedConstructors =
        ['Set', 'Map'];

      const isAllowedConstructor =
        allowedConstructors.includes(
          calleeIdentifier.name);

      if (!isAllowedConstructor) {
        return false;
      }
    }

    if (newExpression.arguments.length > 0) {
      return false;
    }

    return true;
  }

  const length =
    getLength(expression);

  if (length === null) {
    return false;
  }

  return length < LONG_EXPRESSION_LENGTH;
}

function getLength(
    expression: ExpressionParameter
  ): number | null
{
  if (expression.type === 'Identifier') {
    return getIdentifierLength(expression);
  }

  if (expression.type === 'Literal') {
    return getLiteralLength(expression);
  }

  if (expression.type === 'TemplateLiteral') {
    return getTemplateLiteralLength(expression);
  }

  if (expression.type === 'UnaryExpression') {
    return getUnaryExpressionLength(expression);
  }

  return null;
}

function getIdentifierLength(
    expression: Identifier
  ): number
{
  return expression.name.length;
}

function getTemplateLiteralLength(
    expression: TemplateLiteral
  ): number | null
{
  const acornTemplateLiteral =
    expression as acorn.TemplateLiteral;

  const start =
    acornTemplateLiteral.start;

  const end =
    acornTemplateLiteral.end;

  const isRange =
    start !== undefined
    && end !== undefined;

  if (isRange) {
    return end - start;
  }

  const estreeLocation =
    expression.loc;

  if (!estreeLocation) {
    return null;
  }

  const startLocation =
    estreeLocation.start;

  if (!startLocation) {
    return null;
  }

  const endLocation =
    estreeLocation.end;

  if (!endLocation) {
    return null;
  }

  if (startLocation.line !== endLocation.line) {
    return null;
  }

  return endLocation.column - startLocation.column;
}

function getLiteralLength(
    expression: Literal
  ): number | null
{
  const literalRawContent =
    expression.raw;

  if (literalRawContent === undefined) {
    return null;
  }

  return literalRawContent.length;
}

function getUnaryExpressionLength(
    expression: UnaryExpression
  ): number | null
{
  const argumentLength =
    getLength(
      expression.argument);

  if (argumentLength === null) {
    return null;
  }

  const length =
    argumentLength
    + expression.operator.length;

  return length;
}
