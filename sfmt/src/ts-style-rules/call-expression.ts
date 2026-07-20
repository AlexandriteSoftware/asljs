import { ViolationReport }
  from '@eslint/core';
import { JSSyntaxElement,
         Rule }
  from 'eslint';
import { Expression,
         Node,
         SimpleCallExpression }
  from 'estree';
import { FormatterDefinition }
  from '../formatter.js';
import { FormattingContext,
         FormattingContextPredicates }
  from '../formatting-context.js';
import { getIndentation }
  from '../functions/indentations.js';
import { ensureLocation,
         tryGetLocation }
  from '../functions/location.js';
import { expressionIsShort }
  from '../functions/short-expression.js';

export const tsCallExpressionEslintRule: Rule.RuleModule =
  {
  meta: { type: 'layout', fixable: 'code', schema: [] },
  create: createRule
};

export const tsCallExpressionFormatter: FormatterDefinition =
  {
  name: 'call-expression',
  eslintRule: tsCallExpressionEslintRule
};

function createRule(
    context: Rule.RuleContext
  ): Rule.RuleListener
{
  return createCallExpressionListener(context);
}

function createCallExpressionListener(
    context: Rule.RuleContext
  ): Rule.RuleListener
{
  const ruleListener =
    { CallExpression: callExpressionListener };

  return ruleListener;

  function callExpressionListener(
      node: SimpleCallExpression & Rule.NodeParentExtension
    ): void
  {
    const fmtCtx =
      new FormattingContext(
        context.sourceCode
      );

    const correctLayout =
      checkLayout(
        node,
        fmtCtx);

    if (correctLayout) {
      return;
    }

    const report: ViolationReport<JSSyntaxElement, string> =
      {
      node,
      message: 'Use asljs call expression style.',
      fix
    };

    context.report(report);

    function fix(
        fixer: Rule.RuleFixer
      ): Rule.Fix
    {
      const replacement =
        buildCallExpression(
          node,
          fmtCtx);

      return fixer.replaceText(
        node,
        replacement);
    }
  }
}

function checkLayout(
    node: SimpleCallExpression,
    context: FormattingContext
  ): boolean
{
  const callee =
    node.callee;

  ensureLocation(
    callee);

  const openingParenthesis =
    context.next(
      callee,
      FormattingContextPredicates.isOpeningParenthesis);

  if (!openingParenthesis) {
    // no opening parenthesis found, cannot check the layout
    return true;
  }

  if (openingParenthesis.loc.start.line !== callee.loc.end.line) {
    // FAIL: opening parenthesis is not on the same line as the callee
    return false;
  }

  const argumentsList =
    node.arguments;

  if (argumentsList.length === 0) {
    // no arguments

    const closingParenthesis =
      context.next(
        openingParenthesis,
        FormattingContextPredicates.isClosingParenthesis);

    if (!closingParenthesis) {
      // no closing parenthesis found, cannot check the layout
      return true;
    }

    if (closingParenthesis.loc.start.line !== openingParenthesis.loc.end.line) {
      // FAIL: opening and closing parenthesis are not on the same line
      return false;
    }

    return true;
  }

  // base indentation is of the line with the opening parenthesis
  const baseIndent =
    getIndentation(
      context.sourceCode,
      openingParenthesis);

  const argumentIndent =
    baseIndent.increase();

  if (argumentsList.length === 1) {
    // one argument: if short enough, can be kept on the same line,
    // otherwise must be on a new line with increased indentation
    const argument =
      argumentsList[0];

    ensureLocation(argument);

    const argumentStartLine =
      argument.loc.start.line;

    const isShortParameter =
      expressionIsShort(
        argument as Expression);

    if (
      isShortParameter
      && openingParenthesis.loc.end.line === argumentStartLine
    ) {
      return true;
    }
  }

  // If not captured by one short argument before, continue with checking that
  // each argument starts on a separate line.

  for (let index = 0; index < argumentsList.length; index++) {
    const argument =
      argumentsList[index];

    ensureLocation(argument);

    const argumentStartLine =
      argument.loc.start.line;

    if (index === 0) {
      if (openingParenthesis.loc.end.line === argumentStartLine) {
        return false;
      }
    } else {
      const previousArgument =
        argumentsList[index - 1];

      ensureLocation(
        previousArgument);

      const previousArgumentEndLine =
        previousArgument.loc.end.line;

      if (previousArgumentEndLine === argumentStartLine) {
        return false;
      }
    }

    const currentArgumentIndent =
      getIndentation(
        context.sourceCode,
        argument);

    const correctIndent =
      argumentIndent.equals(
        currentArgumentIndent);

    if (!correctIndent) {
      return false;
    }
  }

  const lastArgument =
    argumentsList[argumentsList.length - 1];

  ensureLocation(
    lastArgument);

  const closingParenthesis =
    context.next(
      lastArgument,
      FormattingContextPredicates.isClosingParenthesis);

  if (!closingParenthesis) {
    // no closing parenthesis found, cannot check the layout
    return true;
  }

  if (closingParenthesis.loc.start.line !== lastArgument.loc.end.line) {
    // FAIL: closing parenthesis is not on the same line as the last argument
    return false;
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
      node.callee,
      token => token.value === '(');

  if (openingParenthesis === null) {
    const expressionCode =
      context.sourceCode.getText(node);

    return expressionCode;
  }

  const indent =
    getIndentation(
      context.sourceCode,
      openingParenthesis);

  const requiredArgumentIndent =
    indent.increase();

  const code: string[] = [];

  const callee =
    context.sourceCode.getText(
      node.callee as unknown as Node);

  code.push(callee);
  code.push('(');

  if (node.arguments.length === 1) {
    const firstArgument =
      node.arguments[0];

    const firstArgumentText =
      context.sourceCode.getText(
        firstArgument);

    const firstArgumentLocation =
      tryGetLocation(
        firstArgument);

    const argumentStartLine =
      firstArgumentLocation?.start.line;

    if (argumentStartLine === undefined) {
      code.push(
        firstArgumentText);
    } else {
      if (
        expressionIsShort(
          firstArgument)
      ) {
        if (openingParenthesis.loc.end.line !== argumentStartLine) {
          code.push(
            context.newLine);

          code.push(
            requiredArgumentIndent.value);
        }

        code.push(
          firstArgumentText);
      } else {
        code.push(
          context.newLine);

        code.push(
          requiredArgumentIndent.value);

        code.push(
          firstArgumentText);
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
          argument);

      code.push(
        context.newLine);

      code.push(
        requiredArgumentIndent.value);

      code.push(argumentText);
    }
  }

  code.push(')');

  return code.join('');
}
