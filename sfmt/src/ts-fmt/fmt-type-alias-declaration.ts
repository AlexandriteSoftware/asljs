import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { FormattingContext }
  from '../formatting-context.js';
import { getIndentation }
  from '../functions/indentations.js';

export function fmtTypeAliasDeclaration(
    node: TSESTree.TSTypeAliasDeclaration,
    context: FormattingContext
  ): string
{
  const functionType = node.typeAnnotation;

  if (functionType.type !== 'TSFunctionType') {
    return context.sourceCode.getText(node);
  }

  const baseIndent =
    getIndentation(
      context.sourceCode,
      node);

  const openingParenIndent =
    baseIndent.increase();

  const parameterIndent =
    baseIndent.increase(2);

  const aliasIdentifier =
    context.sourceCode
    .getText(
      node.id);

  const aliasTypeParameters =
    node.typeParameters
    ? context.sourceCode
      .getText(
        node.typeParameters)
    : '';

  const functionTypeParameters =
    functionType.typeParameters
    ? context.sourceCode
      .getText(
        functionType.typeParameters)
    : '';

  const parameters =
    functionType.params.map(
      parameter =>
      context.sourceCode.getText(
        parameter));

  const returnType =
    functionType.returnType;

  if (!returnType) {
    return context.sourceCode.getText(
      node);
  }

  const returnTypeText =
    context.sourceCode.getText(
      returnType.typeAnnotation);

  const code: string[] = [ ];

  if (node.declare) {
    code.push('declare ');
  }

  code.push('type ');
  code.push(aliasIdentifier);

  if (aliasTypeParameters) {
    code.push(aliasTypeParameters);
  }

  code.push(' =');
  code.push(context.newLine);

  code.push(
    openingParenIndent.value);

  if (functionTypeParameters) {
    code.push(
      functionTypeParameters);
  }

  code.push('(');

  const lastIndex = parameters.length - 1;

  for (
    let index = 0;
    index < parameters.length;
    index++
  ) {
    code.push(context.newLine);

    code.push(
      parameterIndent.value);

    code.push(parameters[index]);

    if (index < lastIndex) {
      code.push(',');
    }
  }

  code.push(context.newLine);

  code.push(
    openingParenIndent.value);

  code.push(') =>');
  code.push(context.newLine);

  code.push(
    parameterIndent.value);

  code.push(returnTypeText);
  code.push(';');

  return code.join('');
}
