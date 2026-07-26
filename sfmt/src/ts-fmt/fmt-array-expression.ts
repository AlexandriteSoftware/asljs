import { ArrayExpression }
  from 'estree';
import { FormattingContext }
  from '../formatting-context.js';
import { Indentation }
  from '../functions/indentations.js';
import { tryGetLocation }
  from '../functions/location.js';

export function fmtArrayExpression(
    node: ArrayExpression,
    context: FormattingContext
  ): string
{
  const original =
    context.sourceCode.getText(node);

  const tokens =
    context.sourceCode.getTokens(node);

  if (tokens.length === 0) {
    // do not rebuild if there are no tokens
    return original;
  }

  const firstToken =
    tokens[0];

  if (firstToken.value !== '[') {
    // do not rebuild if the first token is not an opening brace
    return original;
  }

  const firstTokenLocation =
    tryGetLocation(firstToken);

  if (!firstTokenLocation) {
    // do not rebuild if the first token has no location
    return original;
  }

  if (node.elements.length === 0) {
    // an array expression without elements should be just `[ ]`
    return '[ ]';
  }

  const baseIndentation =
    new Indentation(
      firstTokenLocation.start.column);

  const elementIndentation =
    baseIndentation.increase();

  const code: string[] = [ ];

  code.push('[ ');

  for (
    let index = 0;
    index < node.elements.length;
    index++
  ) {
    const element =
      node.elements[index];

    if (element === null) {
      return original;
    }

    if (index > 0) {
      code.push(',');

      code.push(
        context.newLine);

      code.push(
        elementIndentation.value);
    }

    code.push(
      context.sourceCode
        .getText(
          element));
  }

  code.push(' ]');

  return code.join('');
}
