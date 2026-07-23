import * as ESTree
  from 'estree';
import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { FormattingContext }
  from '../formatting-context.js';
import { getIndentation }
  from '../functions/indentations.js';

export function fmtFunctionDeclaration(
    node: TSESTree.FunctionDeclaration,
    context: FormattingContext
  ): string
{
  const baseIndent =
    getIndentation(
      context.sourceCode,
      node);

  const parameterIndent =
    baseIndent.increase(2);

  const closeParenIndent =
    baseIndent.increase();

  const name =
    node.id?.name ?? '';

  const typeParameters =
    node.typeParameters;

  const body =
    node.body;

  const returnTypeText =
    getReturnTypeText(
      node,
      context);

  const parameters =
    node.params.map(
      parameter => context.sourceCode.getText(
        parameter as unknown as ESTree.Node));

  const code: string[] = [];

  if (node.async) {
    code.push('async ');
  }

  code.push('function ');

  if (name) {
    code.push(name);
  }

  if (typeParameters) {
    const typeParametersCode =
      context.sourceCode.getText(
        typeParameters as unknown as ESTree.Node);

    code.push(
      typeParametersCode);
  }

  code.push('(');

  for (let index = 0; index < parameters.length; index++) {
    code.push(
      context.newLine);

    code.push(
      parameterIndent.value);

    code.push(
      parameters[index]);

    if (index < parameters.length - 1) {
      code.push(',');
    }
  }

  code.push(
    context.newLine);

  code.push(
    closeParenIndent.value);

  code.push(')');
  code.push(returnTypeText);

  code.push(
    context.newLine);

  code.push(
    baseIndent.value);

  code.push(
    context.sourceCode.getText(
      body as unknown as ESTree.Node));

  return code.join('');

  function getReturnTypeText(
      node: TSESTree.FunctionDeclaration,
      context: FormattingContext
    ): string
  {
    if (!node.returnType) {
      return '';
    }

    const returnTypeText =
      context.sourceCode.getText(
        node.returnType as unknown as ESTree.Node);

    return returnTypeText;
  }
}
