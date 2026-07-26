import { Expression,
         IfStatement,
         LogicalExpression,
         Node,
         Statement }
  from 'estree';
import { FormattingContext }
  from '../formatting-context.js';
import { getIndentation }
  from '../functions/indentations.js';
import { expressionIsShort }
  from '../functions/short-expression.js';
import { type WithLocation }
  from '../functions/location.js';

export function fmtIfStatement(
    node: IfStatement,
    context: FormattingContext
  ): string
{
  const baseIndentation =
    getIndentation(
      context.sourceCode,
      node as unknown as WithLocation);

  const conditionIndentation =
    baseIndentation.increase();

  const testIsShort =
    expressionIsShort(
      node.test);

  const code: string[] = [ ];

  code.push('if ');
  code.push('(');

  if (testIsShort) {
    code.push(
      context.sourceCode.getText(
        node.test));
  } else {
    code.push(
      context.newLine);

    code.push(
      conditionIndentation.value);

    code.push(
      fmtIfTestExpression(
        node.test,
        context,
        conditionIndentation.value));

    code.push(
      context.newLine);

    code.push(
      baseIndentation.value);
  }

  code.push(') ');

  code.push(
    fmtStatement(
      node.consequent,
      context));

  if (node.alternate) {
    const alternatePrefix =
      node.consequent.type === 'BlockStatement'
      ? ' else '
      : `${context.newLine}${baseIndentation.value}else `;

    code.push(
      alternatePrefix);

    code.push(
      fmtStatement(
        node.alternate,
        context));
  }

  return code.join('');
}

export function fmtIfTestExpression(
    expression: Expression,
    context: FormattingContext,
    continuationIndentation: string
  ): string
{
  if (expression.type !== 'LogicalExpression') {
    return context.sourceCode.getText(
      expression);
  }

  return fmtLogicalExpression(
    expression,
    context,
    continuationIndentation);
}

function fmtStatement(
    statement: Statement,
    context: FormattingContext
  ): string
{
  if (statement.type === 'IfStatement') {
    return fmtIfStatement(
      statement,
      context);
  }

  return context.sourceCode.getText(
    statement as Node);
}

function fmtLogicalExpression(
    expression: LogicalExpression,
    context: FormattingContext,
    continuationIndentation: string
  ): string
{
  const parts =
    flattenLogicalExpression(
      expression,
      expression.operator);

  const code: string[] =
    [ fmtLogicalOperand(
      parts[0],
      context,
      continuationIndentation) ];

  for (let index = 1; index < parts.length; index++) {
    code.push(
      context.newLine);

    code.push(
      continuationIndentation);

    code.push(
      expression.operator);

    code.push(' ');

    code.push(
      fmtLogicalOperand(
        parts[index],
        context,
        continuationIndentation));
  }

  return code.join('');
}

function fmtLogicalOperand(
    expression: Expression,
    context: FormattingContext,
    continuationIndentation: string
  ): string
{
  if (expression.type !== 'LogicalExpression') {
    return context.sourceCode.getText(
      expression);
  }

  return fmtLogicalExpression(
    expression,
    context,
    continuationIndentation);
}

function flattenLogicalExpression(
    expression: LogicalExpression,
    operator: LogicalExpression['operator']
  ): Expression[]
{
  const parts: Expression[] = [ ];

  addExpression(
    expression);

  return parts;

  function addExpression(
      currentExpression: Expression
    ): void
  {
    if (
      currentExpression.type === 'LogicalExpression'
      && currentExpression.operator === operator
    ) {
      addExpression(
        currentExpression.left);

      addExpression(
        currentExpression.right);

      return;
    }

    parts.push(
      currentExpression);
  }
}