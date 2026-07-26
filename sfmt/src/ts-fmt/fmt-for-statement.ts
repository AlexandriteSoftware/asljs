import { ForStatement,
         Node }
  from 'estree';
import { FormattingContext }
  from '../formatting-context.js';
import { getIndentation }
  from '../functions/indentations.js';
import { type WithLocation }
  from '../functions/location.js';

export function fmtForStatement(
    node: ForStatement,
    context: FormattingContext
  ): string
{
  const baseIndentation =
    getIndentation(
      context.sourceCode,
      node as unknown as WithLocation);

  const clauseIndentation =
    baseIndentation.increase();

  const code: string[] = [ ];

  code.push('for (');

  code.push(
    context.newLine);

  code.push(
    clauseIndentation.value);

  if (node.init !== null) {
    code.push(
      context.sourceCode.getText(
        node.init as Node));
  }

  code.push(';');

  code.push(
    context.newLine);

  code.push(
    clauseIndentation.value);

  if (node.test !== null) {
    code.push(
      context.sourceCode.getText(
        node.test));
  }

  code.push(';');

  code.push(
    context.newLine);

  code.push(
    clauseIndentation.value);

  if (node.update !== null) {
    code.push(
      context.sourceCode.getText(
        node.update));
  }

  code.push(
    context.newLine);

  code.push(
    baseIndentation.value);

  code.push(') ');

  code.push(
    context.sourceCode.getText(
      node.body as Node));

  return code.join('');
}
