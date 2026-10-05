import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { FormattingContext }
  from '../formatting-context.js';
import { getTextWithParentheses }
  from '../functions/text-with-parentheses.js';
import { getIndentation }
  from '../ts-style-rules/conditional-expression.js';

export function fmtConditionalExpression(
    node: TSESTree.ConditionalExpression,
    context: FormattingContext
  ): string
{
  const indent =
    getIndentation(
      context.sourceCode,
      node);

  const branchIndent = indent + '  ';

  const testText =
    getTextWithParentheses(
      context.sourceCode,
      node.test);

  const consequentText =
    getTextWithParentheses(
      context.sourceCode,
      node.consequent);

  const alternateText =
    getTextWithParentheses(
      context.sourceCode,
      node.alternate);

  return `${testText}${context.newLine}${branchIndent}? ${consequentText}${context.newLine}${branchIndent}: ${alternateText}`;
}
