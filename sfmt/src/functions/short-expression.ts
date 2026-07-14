import * as acorn
  from 'acorn';
import { ArrayExpression,
         Expression,
         Identifier,
         Literal,
         NewExpression,
         ObjectExpression,
         SpreadElement,
         UnaryExpression }
  from 'estree';
import * as estree
  from 'estree';

const LONG_EXPRESSION_LENGTH = 15;

export function expressionIsShort(
  expression: Expression | SpreadElement
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
  expression: Expression | SpreadElement
): number | null
{
  if (expression.type === 'Identifier') {
    const identifier =
      expression as Identifier;

    return identifier.name.length;
  }

  if (expression.type === 'Literal') {
    const literal =
      expression as Literal;

    const literalRawContent =
      literal.raw;

    if (literalRawContent === undefined) {
      return null;
    }

    return literalRawContent.length;
  }

  if (expression.type === 'TemplateLiteral') {
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

    const estreeTemplateLiteral =
      expression as estree.TemplateLiteral;

    const estreeLocation =
      estreeTemplateLiteral.loc;

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

  if (
    expression.type === 'UnaryExpression'
  ) {
    const unaryExpression =
      expression as UnaryExpression;

    const argumentLength =
      getLength(
        unaryExpression.argument);

    if (argumentLength === null) {
      return null;
    }

    const length =
      argumentLength
      + unaryExpression.operator.length;

    return length;
  }

  return null;
}
