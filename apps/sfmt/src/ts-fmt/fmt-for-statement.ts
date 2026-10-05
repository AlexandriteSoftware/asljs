import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { FormattingContext }
  from '../formatting-context.js';
import { getIndentation }
  from '../functions/indentations.js';
import { getTextWithParentheses }
  from '../functions/text-with-parentheses.js';

export function fmtForStatement(
    node: TSESTree.ForStatement,
    context: FormattingContext
  ): string
{
  const baseIndentation =
    getIndentation(
      context.sourceCode,
      node);

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
      getTextWithParentheses(
        context.sourceCode,
        node.init));
  }

  code.push(';');

  code.push(
    context.newLine);

  code.push(
    clauseIndentation.value);

  if (node.test !== null) {
    code.push(
      getTextWithParentheses(
        context.sourceCode,
        node.test));
  }

  code.push(';');

  code.push(
    context.newLine);

  code.push(
    clauseIndentation.value);

  if (
    node.update
    !== null
  ) {
    code.push(
      getTextWithParentheses(
        context.sourceCode,
        node.update));
  }

  code.push(
    context.newLine);

  code.push(
    baseIndentation.value);

  code.push(') ');

  code.push(
    context.sourceCode.getText(
      node.body));

  return code.join('');
}
