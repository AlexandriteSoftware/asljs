import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { FormattingContext }
  from '../formatting-context.js';
import { getIndentation,
         Indentation }
  from '../functions/indentations.js';
import { tryGetLocation }
  from '../functions/location.js';
import { expressionIsSimple }
  from '../functions/simple-expression.js';

export function fmtVariableDeclarator(
    node: TSESTree.VariableDeclarator,
    context: FormattingContext
  ): string
{
  const code: string[] = [ ];

  const idText =
    context.sourceCode.getText(
      node.id);

  code.push(idText);
  code.push(' =');

  const nodeInit = node.init;

  if (nodeInit) {
    const initText =
      context.sourceCode.getText(
        nodeInit);

    if (
      expressionIsSimple(
        nodeInit)
    ) {
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
    const nodeInit = node.init;

    if (!nodeInit) {
      return Indentation.Initial;
    }

    const equalsToken =
      context.sourceCode.getTokenBefore(
        nodeInit,
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
