import { ASTUtils,
         type TSESLint,
         type TSESTree }
  from '@typescript-eslint/utils';

interface EnclosingParentheses
{
  opening: TSESTree.Token;
  closing: TSESTree.Token;
}

/**
 * Returns the text of `node` together with the parentheses written around it.
 *
 * Parentheses are not nodes in the syntax tree, so `getText` of a
 * parenthesised child leaves them out, and a formatter that rebuilds its
 * parent from the children's text would drop them: `(a as T) = b` would come
 * out as `a as T = b`, and `fn((a, b))` as `fn(a, b)`. Parentheses that belong
 * to the parent's own syntax, such as a call's around its only argument, are
 * not part of the result.
 */
export function getTextWithParentheses(
    sourceCode: Readonly<TSESLint.SourceCode>,
    node: TSESTree.Node
  ): string
{
  const parentheses =
    getEnclosingParentheses(
      sourceCode,
      node);

  if (!parentheses) {
    return sourceCode.getText(node);
  }

  return sourceCode.text.slice(
    parentheses.opening.range[0],
    parentheses.closing.range[1]);
}

/**
 * Returns the location of `node` together with the parentheses written around
 * it, the counterpart of `getTextWithParentheses` for a layout check: a child
 * the formatter wrote at the expected column starts there with its opening
 * parenthesis, not with the node.
 */
export function getLocationWithParentheses(
    sourceCode: Readonly<TSESLint.SourceCode>,
    node: TSESTree.Node
  ): TSESTree.SourceLocation
{
  const parentheses =
    getEnclosingParentheses(
      sourceCode,
      node);

  if (!parentheses) {
    return node.loc;
  }

  return { start:
             parentheses.opening.loc.start,
           end:
             parentheses.closing.loc.end };
}

function getEnclosingParentheses(
    sourceCode: Readonly<TSESLint.SourceCode>,
    node: TSESTree.Node
  ): EnclosingParentheses | undefined
{
  let count = 0;

  while (
    ASTUtils.isParenthesized(
      count + 1,
      node,
      sourceCode as TSESLint.SourceCode)
  ) {
    count++;
  }

  if (count === 0) {
    return undefined;
  }

  const opening =
    sourceCode.getTokenBefore(
      node,
      { skip: count - 1 });

  const closing =
    sourceCode.getTokenAfter(
      node,
      { skip: count - 1 });

  if (
    !opening
    || !closing
  ) {
    return undefined;
  }

  return { opening,
           closing };
}
