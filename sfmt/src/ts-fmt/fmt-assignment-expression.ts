import { AssignmentExpression,
         Expression,
         Node }
  from 'estree';
import { FormattingContext }
  from '../formatting-context.js';
import { getIndentation,
         Indentation }
  from '../functions/indentations.js';
import { tryGetLocation }
  from '../functions/location.js';
import { expressionIsSimple }
  from '../functions/simple-expression.js';

export function fmtAssignmentExpression(
    node: AssignmentExpression,
    context: FormattingContext
  ): string
{
  const code: string[] = [ ];

  const leftText =
    context.sourceCode.getText(
      node.left as unknown as Node);

  code.push(leftText);
  code.push(' =');

  const nodeRight = node.right;

  const rightText =
    context.sourceCode.getText(
      nodeRight as unknown as Node);

  if (
    expressionIsSimple(
      nodeRight as Expression)
  ) {
    code.push(' ');
    code.push(rightText);
  } else {
    code.push(
      context.newLine);

    const indentation =
      getAssignmentExpressionIndentation(
        node,
        context);

    code.push(
      indentation.increase().value);

    code.push(rightText);
  }

  return code.join('');

  function getAssignmentExpressionIndentation(
      node: AssignmentExpression,
      context: FormattingContext
    ): Indentation
  {
    const nodeRight = node.right;

    if (!nodeRight) {
      return Indentation.INITIAL;
    }

    const equalsToken =
      context.sourceCode.getTokenBefore(
        nodeRight as unknown as Node,
        token => token.value === '=');

    if (!equalsToken) {
      return Indentation.INITIAL;
    }

    const equalsTokenLocation =
      tryGetLocation(
        equalsToken);

    if (!equalsTokenLocation) {
      return Indentation.INITIAL;
    }

    return getIndentation(
      context.sourceCode,
      equalsToken);
  }
}
