import { TSESTree }
  from '@typescript-eslint/typescript-estree';
import * as estree
  from 'estree';
import { tryGetLocation }
  from './location.js';

const LONG_EXPRESSION_LENGTH = 20;

export type ExpressionParameter =
  | TSESTree.Node
  | estree.Expression
  | estree.SpreadElement
  | estree.ObjectPattern
  | estree.ArrayPattern
  | estree.RestElement
  | estree.AssignmentPattern
  | estree.PrivateIdentifier
  | estree.ChainElement
  | estree.Super;

export function expressionIsSimple(
    expression: ExpressionParameter
  ): boolean
{
  // Any expression is complex if it spans multiple lines

  const location = expression?.loc;

  if (
    location
    && location.start.line !== location.end.line
  ) {
    return false;
  }

  if (expression.type === 'ObjectExpression') {
    // Object expression is simple if it has no properties

    const objectExpression =
      expression as estree.ObjectExpression;

    return objectExpression.properties.length === 0;
  }

  if (expression.type === 'ArrayExpression') {
    // Array expression is simple if it has no elements

    const arrayExpression =
      expression as estree.ArrayExpression;

    return arrayExpression.elements.length === 0;
  }

  if (expression.type === 'NewExpression') {
    // New expression is simple if it has no arguments and is a Set or Map

    const newExpression =
      expression as estree.NewExpression;

    if (
      newExpression.callee.type
      === 'Identifier'
    ) {
      const calleeIdentifier =
        newExpression.callee as estree.Identifier;

      const allowedConstructors =
        [ 'Set',
          'Map' ];

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

  if (expression.type === 'UpdateExpression') {
    // Update (++, --) expression is never simple
    return false;
  }

  if (expression.type === 'CallExpression') {
    // Call expression is never simple
    return false;
  }

  if (expression.type === 'TSAsExpression') {
    // Type assertion adds syntax that should not be treated as a simple scalar.
    return false;
  }

  if (
    expression.type === 'LogicalExpression'
    || expression.type === 'BinaryExpression'
  ) {
    const leftIsSimple =
      expressionIsSimple(
        expression.left)
      && expressionIsNotCalculation(
        expression.left);

    const rightIsSimple =
      expressionIsSimple(
        expression.right)
      && expressionIsNotCalculation(
        expression.right);

    return leftIsSimple
      && rightIsSimple;
  }

  // any other expression is simple if its length is less than
  // LONG_EXPRESSION_LENGTH

  const length =
    getLength(expression);

  return length < LONG_EXPRESSION_LENGTH;

  function expressionIsNotCalculation(
      expression: ExpressionParameter
    ): boolean
  {
    return expression.type === 'Identifier'
      || expression.type === 'Literal'
      || expression.type === 'TemplateLiteral'
      || expression.type === 'MemberExpression'
      || expression.type === 'ChainExpression'
      || expression.type === 'PrivateIdentifier'
      || expression.type === 'CallExpression'
      || expression.type === 'Super';
  }
}

function getLength(
    expression: ExpressionParameter
  ): number
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

  if (expression.type === 'MemberExpression') {
    return getMemberExpressionLength(expression);
  }

  if (expression.type === 'ChainExpression') {
    return getChainExpressionLength(expression);
  }

  if (expression.type === 'PrivateIdentifier') {
    return expression.name.length;
  }

  if (expression.type === 'CallExpression') {
    return getCallExpressionLength(expression);
  }

  if (expression.type === 'Super') {
    return 'super'.length;
  }

  const start =
    expression.range?.[0]
    ?? 0;

  const end =
    expression.range?.[1]
    ?? 0;

  return end - start;
}

function getCallExpressionLength(
    expression: estree.CallExpression
  ): number
{
  const calleeLength =
    getLength(
      expression.callee);

  const argsLength =
    expression.arguments.reduce(
      (sum, arg) =>
      sum + getLength(
        arg as ExpressionParameter),
      0);

  return calleeLength + 2 + argsLength;
}

function getIdentifierLength(
    expression: estree.Identifier
  ): number
{
  return expression.name.length;
}

function getTemplateLiteralLength(
    expression: estree.TemplateLiteral
  ): number
{
  const location = expression?.loc;

  if (!location) {
    return 0;
  }

  const startLocation = location.start;

  if (!startLocation) {
    return 0;
  }

  const endLocation = location.end;

  if (!endLocation) {
    return 0;
  }

  // this case should be handled by the multiline check in expressionIsSimple
  if (startLocation.line !== endLocation.line) {
    return 0;
  }

  return endLocation.column - startLocation.column;
}

function getLiteralLength(
    expression: estree.Literal
  ): number
{
  const literalRawContent = expression.raw;

  if (literalRawContent === undefined) {
    return 0;
  }

  return literalRawContent.length;
}

function getUnaryExpressionLength(
    expression: estree.UnaryExpression
  ): number
{
  const argumentLength =
    getLength(
      expression.argument);

  const length =
    argumentLength
    + expression.operator.length;

  return length;
}

function getMemberExpressionLength(
    expression: estree.MemberExpression
  ): number
{
  const objectLength =
    getLength(
      expression.object);

  const optionalCharacterLength =
    expression.optional
    ? 1
    : 0;

  const computePunctuationLength =
    expression.computed
    ? 2
    : 0;

  const propertyLength =
    getLength(
      expression.property);

  const result =
    objectLength
    + 1
    + computePunctuationLength
    + optionalCharacterLength
    + propertyLength;

  return result;
}

function getChainExpressionLength(
    expression: estree.ChainExpression
  ): number
{
  const expressionLength =
    getLength(
      expression.expression);

  return expressionLength;
}
