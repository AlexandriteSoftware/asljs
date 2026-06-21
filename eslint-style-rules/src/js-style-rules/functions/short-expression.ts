import { type Expression,
         type SpreadElement,
         type Identifier,
         type Literal,
         type UnaryExpression,
         type ObjectExpression,
         type ArrayExpression,
         type TemplateLiteral,
         type NewExpression}
  from 'estree';

const LONG_EXPRESSION_LENGTH = 15;

export function expressionIsShort(
    expression: Expression|SpreadElement
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

      if (
        calleeIdentifier.name !== 'Set'
        && calleeIdentifier.name !== 'Map')
      {
        return false;
      }
    }

    if (newExpression.arguments.length > 0) {
      return false;
    }

    return true;
  }

  const length =
    getLength(
      expression);
  
  if (length === null) {
    return false;
  }

  return length < LONG_EXPRESSION_LENGTH;
}

function getLength(
    expression: Expression|SpreadElement
  ): number|null
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
    const templateLiteral =
      expression as TemplateLiteral;
    
    const startLocation =
      templateLiteral.loc?.start;

    if (startLocation === undefined) {
      return null;
    }

    const endLocation =
      templateLiteral.loc?.end;

    if (endLocation === undefined) {
      return null;
    }

    if (startLocation.line !== endLocation.line) {
      return null;
    }

    return endLocation.column - startLocation.column;
  }

  if (expression.type === 'UnaryExpression') {
    const unaryExpression =
      expression as UnaryExpression;

    const argumentLength =
      getLength(
        unaryExpression.argument);

    if (argumentLength === null) {
      return null;
    }

    return argumentLength + unaryExpression.operator.length;
  }

  return null;
}
