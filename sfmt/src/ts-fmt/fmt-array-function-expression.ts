import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { FormattingContext }
  from '../formatting-context.js';
import { getIndentation }
  from '../functions/indentations.js';

export function fmtArrayFunctionExpression(
    node: TSESTree.ArrowFunctionExpression,
    context: FormattingContext
  ): string
{
  if (node.body.type !== 'BlockStatement') {
    return context.sourceCode.getText(
      node);
  }

  const baseIndent =
    getIndentation(
      context.sourceCode,
      node);

  const parameterIndent =
    baseIndent.increase(2);

  const closeParenIndent =
    baseIndent.increase();

  const typeParameters =
    (node as unknown as { typeParameters: TSESTree.Node | null; })
      .typeParameters;

  const returnType =
    (node as unknown as { returnType: TSESTree.Node | null; })
    .returnType;

  const parameters =
    node.params.map(
      parameter =>
      context.sourceCode.getText(
        parameter));

  const code: string[] = [ ];

  if (node.async) {
    code.push('async ');
  }

  if (typeParameters) {
    code.push(
      context.sourceCode.getText(
        typeParameters));
  }

  if (parameters.length === 0) {
    code.push('()');
  } else {
    code.push('(');

    for (
      let index = 0;
      index < parameters.length;
      index++
    ) {
      code.push(
        context.newLine);

      code.push(
        parameterIndent.value);

      code.push(
        parameters[index]);

      if (
        index
        < parameters.length - 1
      ) {
        code.push(',');
      }
    }

    code.push(
      context.newLine);

    code.push(
      closeParenIndent.value);

    code.push(')');
  }

  if (returnType) {
    code.push(
      context.sourceCode.getText(
        returnType));
  }

  code.push(' =>');

  code.push(
    context.newLine);

  code.push(
    baseIndent.value);

  code.push(
    context.sourceCode.getText(
      node.body));

  return code.join('');
}
