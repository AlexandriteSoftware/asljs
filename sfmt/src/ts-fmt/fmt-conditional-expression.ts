import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { FormattingContext }
  from '../formatting-context.js';
import { asTextNode,
         getIndentation }
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
    context.sourceCode.getText(
      asTextNode(
        node.test));

  const consequentText =
    context.sourceCode.getText(
      asTextNode(
        node.consequent));

  const alternateText =
    context.sourceCode.getText(
      asTextNode(
        node.alternate));

  return `${testText}${context.newLine}${branchIndent}? ${consequentText}${context.newLine}${branchIndent}: ${alternateText}`;
}
