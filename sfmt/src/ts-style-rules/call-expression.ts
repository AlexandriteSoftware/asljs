import { Rule,
         SourceCode }
  from 'eslint';
import { Expression,
         SimpleCallExpression }
  from 'estree';
import { FormatterDefinition }
  from '../formatter.js';
import { createFormattingContext,
         FormattingContext }
  from '../formatting-context.js';
import { WithLocation }
  from '../functions/location.js';
import { expressionIsShort }
  from '../functions/short-expression.js';

export const tsCallExpressionEslintRule: Rule.RuleModule =
  {
  meta: { type: 'layout', fixable: 'code', schema: [] },
  create
};

export const tsCallExpressionFormatter: FormatterDefinition =
  {
  name: 'call-expression',
  eslintRule: tsCallExpressionEslintRule
};

function create(
    context: Rule.RuleContext
  ): Rule.RuleListener
{
  const listener: Rule.RuleListener =
    {
    CallExpression(node): void
    {
      const fmtCtx =
        createFormattingContext(
          context.sourceCode);

      const correctLayout =
        checkLayout(
          node,
          fmtCtx);

      if (correctLayout) {
        return;
      }

      context.report(
        {
          node,
          message: 'Use asljs call expression style.',
          fix(
            fixer: Rule.RuleFixer
          ): Rule.Fix
          {
            const replacement =
              buildCallExpression(
                node,
                fmtCtx);

            return fixer.replaceText(
              node,
              replacement
            );
          }
        }
      );
    }
  };

  return listener;
}

/**
 * Checks that:
 *
 * - Complex function call expressions are on a separate line. Complex is:
 *   - single variable or literal that is longer than 15 characters, or
 *   - expression that is not a single variable or literal.
 * - Multiple function call parameters are on separate lines
 */
function checkLayout(
    node: SimpleCallExpression,
    context: FormattingContext
  ): boolean
{
  const argumentsList =
    node.arguments;

  if (argumentsList.length === 0) {
    return true;
  }

  const openingParenthesis =
    context.sourceCode.getTokenAfter(
      asTokenAfterTarget(
        node.callee),
      token => token.value === '(');

  if (openingParenthesis === null) {
    return true;
  }

  const indent =
    getIndentation(
      context.sourceCode,
      openingParenthesis);

  const requiredArgumentIndent =
    indent + '  ';

  if (argumentsList.length === 1) {
    const argument =
      argumentsList[0];

    const argumentStartLine =
      argument.loc?.start.line;

    if (argumentStartLine === undefined) {
      return true;
    }

    const isShortParameter =
      expressionIsShort(
        argument as Expression);

    if (
      isShortParameter
      && openingParenthesis.loc.end.line === argumentStartLine
    ) {
      return true;
    }

    const argumentIndent =
      getIndentation(
        context.sourceCode,
        argument as unknown as WithLocation);

    return requiredArgumentIndent === argumentIndent;
  }

  // Multiple arguments: each argument must start
  // on a separate line.
  for (let index = 0; index < argumentsList.length; index++) {
    const argument =
      argumentsList[index];

    const argumentStartLine =
      argument.loc?.start.line;

    if (argumentStartLine === undefined) {
      return true;
    }

    if (index === 0) {
      if (openingParenthesis.loc.end.line === argumentStartLine) {
        return false;
      }
    } else {
      const previousArgument =
        argumentsList[index - 1];

      const previousArgumentEndLine =
        previousArgument.loc?.end.line;

      if (previousArgumentEndLine === undefined) {
        return true;
      }

      if (previousArgumentEndLine === argumentStartLine) {
        return false;
      }
    }

    const argumentIndent =
      getIndentation(
        context.sourceCode,
        argument as unknown as WithLocation);

    if (requiredArgumentIndent !== argumentIndent) {
      return false;
    }
  }

  return true;
}

function buildCallExpression(
    node: SimpleCallExpression,
    context: FormattingContext
  ): string
{
  const openingParenthesis =
    context.sourceCode.getTokenAfter(
      asTokenAfterTarget(
        node.callee),
      token => token.value === '(');

  if (openingParenthesis === null) {
    return context.sourceCode.getText(
      asTextNode(node)
    );
  }

  const indent =
    getIndentation(
      context.sourceCode,
      openingParenthesis);

  const requiredArgumentIndent =
    indent + '  ';

  const code = [];

  const callee =
    context.sourceCode.getText(
      asTextNode(
        node.callee));

  code.push(callee);
  code.push('(');

  if (node.arguments.length === 1) {
    const argument =
      node.arguments[0];

    const argumentText =
      context.sourceCode.getText(
        asTextNode(argument));

    const argumentStartLine =
      argument.loc?.start.line;

    if (argumentStartLine === undefined) {
      code.push(argumentText);
    } else {
      if (
        expressionIsShort(
          argument as Parameters<typeof expressionIsShort>[0]
        )
      ) {
        if (openingParenthesis.loc.end.line !== argumentStartLine) {
          code.push(
            context.newLine
          );

          code.push(
            requiredArgumentIndent
          );
        }

        code.push(argumentText);
      } else {
        code.push(
          context.newLine
        );

        code.push(
          requiredArgumentIndent
        );

        code.push(argumentText);
      }
    }
  } else if (node.arguments.length > 1) {
    for (let index = 0; index < node.arguments.length; index++) {
      if (index > 0) {
        code.push(',');
      }

      const argument =
        node.arguments[index];

      const argumentText =
        context.sourceCode.getText(
          asTextNode(argument));

      code.push(
        context.newLine
      );

      code.push(
        requiredArgumentIndent
      );

      code.push(argumentText);
    }
  }

  code.push(')');

  return code.join('');
}

function getIndentation(
    sourceCode: SourceCode,
    node: WithLocation
  ): string
{
  const nodeLocation =
    node.loc;

  if (nodeLocation === undefined || nodeLocation === null) {
    return '';
  }

  const line =
    sourceCode.lines[nodeLocation.start.line - 1];

  const match =
    /^[ \t]*/.exec(line);

  return match?.[0] ?? '';
}

function asTokenAfterTarget(
    node: unknown
  ): NonNullable<Parameters<SourceCode['getTokenAfter']>[0]>
{
  return node as NonNullable<Parameters<SourceCode['getTokenAfter']>[0]>;
}

function asTextNode(
    node: unknown
  ): Parameters<SourceCode['getText']>[0]
{
  return node as Parameters<SourceCode['getText']>[0];
}
