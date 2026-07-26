import { FunctionDeclaration,
         Node }
  from 'estree';
import { FormattingContext }
  from '../formatting-context.js';
import { getIndentation }
  from '../functions/indentations.js';
import { type WithLocation }
  from '../functions/location.js';

export function fmtFunctionDeclaration(
    node: FunctionDeclaration,
    context: FormattingContext
  ): string
{
  const baseIndent =
    getIndentation(
      context.sourceCode,
      node as unknown as WithLocation);

  const parameterIndent =
    baseIndent.increase(2);

  const closeParenIndent =
    baseIndent.increase();

  const name =
    node.id?.name ?? '';

  const typeParameters =
    (node as unknown as { typeParameters: Node | null; }).typeParameters;

  const body =
    node.body;

  const returnTypeText =
    getReturnTypeText(
      node,
      context);

  const parameters =
    node.params.map(
      parameter =>
      context.sourceCode.getText(
        parameter as unknown as Node));

  const code: string[] = [ ];

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
        typeParameters);

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
      body as unknown as Node));

  return code.join('');

  function getReturnTypeText(
      node: FunctionDeclaration,
      context: FormattingContext
    ): string
  {
    const returnType =
      (node as unknown as { returnType: Node | null; }).returnType;

    if (!returnType) {
      return '';
    }

    const returnTypeText =
      context.sourceCode.getText(
        returnType);

    return returnTypeText;
  }
}
