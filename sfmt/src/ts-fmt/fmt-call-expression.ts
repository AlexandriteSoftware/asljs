import { SimpleCallExpression,
         Node }
  from 'estree';
import { FormattingContext }
  from '../formatting-context.js';
import { getIndentation }
  from '../functions/indentations.js';
import { tryGetLocation }
  from '../functions/location.js';
import { expressionIsShort }
  from '../functions/short-expression.js';

export function fmtCallExpression(
    node: SimpleCallExpression,
    context: FormattingContext
  ): string
{
  const openingParenthesis =
    context.sourceCode.getTokenAfter(
      node.callee,
      token => token.value === '(');

  if (openingParenthesis === null) {
    const expressionCode =
      context.sourceCode.getText(node);

    return expressionCode;
  }

  const indent =
    getIndentation(
      context.sourceCode,
      openingParenthesis);

  const requiredArgumentIndent =
    indent.increase();

  const code: string[] = [];

  const callee =
    context.sourceCode.getText(
      node.callee as unknown as Node);

  code.push(callee);
  code.push('(');

  if (node.arguments.length === 1) {
    const firstArgument =
      node.arguments[0];

    const firstArgumentText =
      context.sourceCode.getText(
        firstArgument);

    const firstArgumentLocation =
      tryGetLocation(
        firstArgument);

    const argumentStartLine =
      firstArgumentLocation?.start.line;

    if (argumentStartLine === undefined) {
      code.push(
        firstArgumentText);
    } else {
      if (expressionIsShort(
        firstArgument)) {
        if (openingParenthesis.loc.end.line !== argumentStartLine) {
          code.push(
            context.newLine);

          code.push(
            requiredArgumentIndent.value);
        }

        code.push(
          firstArgumentText);
      } else {
        code.push(
          context.newLine);

        code.push(
          requiredArgumentIndent.value);

        code.push(
          firstArgumentText);
      }
    }
  } else if (node.arguments.length > 1) {
    for (let index = 0; index < node.arguments.length; index++) {
      if (index > 0) {
        code.push(',');
      }

      const argument =
        node.arguments[index];

      const argumentText =
        context.sourceCode.getText(
          argument);

      code.push(
        context.newLine);

      code.push(
        requiredArgumentIndent.value);

      code.push(argumentText);
    }
  }

  code.push(')');

  return code.join('');
}
