import { ObjectExpression }
  from 'estree';
import { FormattingContext }
  from '../formatting-context.js';
import { tryGetLocation }
  from '../functions/location.js';
import { Indentation }
  from '../functions/indentations.js';

export function fmtObjectExpression(
    node: ObjectExpression,
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

  if (firstToken.value !== '{') {
    // do not rebuild if the first token is not an opening brace
    return original;
  }

  const firstTokenLocation =
    tryGetLocation(firstToken);

  if (!firstTokenLocation) {
    // do not rebuild if the first token has no location
    return original;
  }

  if (node.properties.length === 0) {
    // the object expression without properties should be just `{ }`
    return '{ }';
  }

  const baseIndentation =
    new Indentation(
      firstTokenLocation.start.column);

  const propertyIndentation =
    baseIndentation.increase();

  const firstProperty =
    node.properties[0];

  const code: string[] = [];

  code.push('{ ');

  code.push(
    context.sourceCode
      .getText(
        firstProperty));

  for (
    let index = 1;
    index < node.properties.length;
    index++
  ) {
    const property =
      node.properties[index];

    code.push(',');

    code.push(
      context.newLine);

    code.push(
      propertyIndentation.value);

    code.push(
      context.sourceCode
        .getText(
          property));
  }

  code.push(' }');

  return code.join('');
}
