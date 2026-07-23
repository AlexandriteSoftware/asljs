import { Node,
         Expression }
  from 'estree';
import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { FormattingContext }
  from '../formatting-context.js';
import { Indentation,
         getIndentation }
  from '../functions/indentations.js';
import { tryGetLocation }
  from '../functions/location.js';
import { expressionIsShort }
  from '../functions/short-expression.js';

export function fmtVariableDeclarator(
    node: TSESTree.VariableDeclarator,
    context: FormattingContext
  ): string
{
  const code: string[] = [];

  const idText =
    context.sourceCode.getText(
      node.id as unknown as Node);

  code.push(idText);
  code.push(' =');

  const nodeInit =
    node.init;

  if (nodeInit) {
    const initText =
      context.sourceCode.getText(
        nodeInit as unknown as Node);

    if (expressionIsShort(
      nodeInit as Expression)) {
      code.push(' ');
      code.push(initText);
    } else {
      code.push(
        context.newLine);

      const indentation =
        getVariableDeclaratorIndentation(
          node,
          context);

      code.push(
        indentation.increase().value);

      code.push(initText);
    }
  }

  return code.join('');

  function getVariableDeclaratorIndentation(
      node: TSESTree.VariableDeclarator,
      context: FormattingContext
    ): Indentation
  {
    const nodeInit =
      node.init;

    if (!nodeInit) {
      return Indentation.INITIAL;
    }

    const equalsToken =
      context.sourceCode.getTokenBefore(
        nodeInit as unknown as Node,
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
