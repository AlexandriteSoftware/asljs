import { Expression,
         IfStatement,
         Node,
         Statement }
  from 'estree';
import { FormattingContext }
  from '../formatting-context.js';
import { formatCriteriaExpression }
  from '../functions/criteria-expression.js';
import { getIndentation }
  from '../functions/indentations.js';
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

  const formattedTestExpression =
    fmtIfTestExpression(
      node.test,
      context);

  const isMultilineCondition =
    formattedTestExpression.includes(
      context.newLine);

  const code: string[] = [ ];

  code.push('if ');
  code.push('(');

  if (!isMultilineCondition) {
    code.push(
      formattedTestExpression);
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
    continuationIndentation: string = ''
  ): string
{
  return formatCriteriaExpression(
    expression,
    { getText:
        (node: Expression): string =>
        context.sourceCode.getText(
          node),
      newLine:
        context.newLine,
      continuationIndentation });
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
