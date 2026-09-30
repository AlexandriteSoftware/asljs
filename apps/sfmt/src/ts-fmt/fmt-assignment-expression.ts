import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
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
    node: TSESTree.AssignmentExpression,
    context: FormattingContext
  ): string
{
  const code: string[] = [ ];

  const leftText =
    context.sourceCode.getText(
      node.left);

  code.push(leftText);
  code.push(' =');

  const nodeRight = node.right;

  const rightText =
    context.sourceCode.getText(
      nodeRight);

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
      node: TSESTree.AssignmentExpression,
      context: FormattingContext
    ): Indentation
  {
    const nodeRight = node.right;

    if (!nodeRight) {
      return Indentation.Initial;
    }

    const equalsToken =
      context.sourceCode.getTokenBefore(
        nodeRight,
        token => token.value === '=');

    if (!equalsToken) {
      return Indentation.Initial;
    }

    const equalsTokenLocation = equalsToken?.loc;

    if (!equalsTokenLocation) {
      return Indentation.Initial;
    }

    return getIndentation(
      context.sourceCode,
      equalsToken);
  }
}
