import { ObjectExpression }
  from 'estree';
import { FormattingContext }
  from '../formatting-context.js';
import { Indentation }
  from '../functions/indentations.js';
import { tryGetLocation }
  from '../functions/location.js';
import { expressionIsShort }
  from '../functions/short-expression.js';

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
    firstTokenLocation.start.column
  );

  const propertyIndentation =
    baseIndentation.increase();

  const code: string[] = [];

  code.push('{ ');

  for (
    let index = 0;
    index < node.properties.length;
    index++
  ) {
    const property =
      node.properties[index];

    if (index > 0) {
      code.push(',');

      code.push(
        context.newLine);

      code.push(
        propertyIndentation.value);
    }

    if (property.type !== 'Property') {
      code.push(
        context.sourceCode
          .getText(
            property));

      continue;
    }

    code.push(
      context.sourceCode
        .getText(
          property.key));

    if (property.shorthand) {
      continue;
    }

    if (property.method) {
      code.push(
        context.sourceCode
          .getText(
            property.value));

      continue;
    }

    code.push(':');

    const propertyValue =
      property.value;

    const propertyValueIsShort =
      expressionIsShort(
        propertyValue);

    if (propertyValueIsShort) {
      code.push(' ');

      code.push(
        context.sourceCode
          .getText(
            propertyValue));
    } else {
      code.push(
        context.newLine);

      const valueIndentation =
        propertyIndentation.increase();

      code.push(
        valueIndentation.value);

      code.push(
        context.sourceCode
          .getText(
            propertyValue));
    }
  }

  code.push(' }');

  return code.join('');
}
