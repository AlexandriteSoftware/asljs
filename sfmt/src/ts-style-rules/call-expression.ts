import { ViolationReport }
  from '@eslint/core';
import { JSSyntaxElement,
         Rule }
  from 'eslint';
import { Expression,
         SimpleCallExpression }
  from 'estree';
import { FormatterDefinitionFactory,
         formatterFactory,
         RuleListenerFactory }
  from '../formatter.js';
import { FormattingContext,
         FormattingContextPredicates }
  from '../formatting-context.js';
import { getIndentation }
  from '../functions/indentations.js';
import { ensureLocation }
  from '../functions/location.js';
import { expressionIsShort }
  from '../functions/short-expression.js';
import { fmtCallExpression }
  from '../ts-fmt/fmt-call-expression.js';
import { Logger }
  from '../logging.js';

const formatterDefinitionFactory: FormatterDefinitionFactory =
  formatterFactory(
    'call-expression',
    listenerFactory);

export default formatterDefinitionFactory;

function listenerFactory(
    logger: Logger
  ): RuleListenerFactory
{
  const listenerFactory: RuleListenerFactory =
    (
        context: Rule.RuleContext
      ): Rule.RuleListener =>
    {
      const ruleListener: Rule.RuleListener =
        { CallExpression:
            listener };

      return ruleListener;

      function listener(
          node: SimpleCallExpression & Rule.NodeParentExtension
        ): void
      {
        processCallExpression(
          logger,
          context,
          node);
      }
    };

  return listenerFactory;
}

function processCallExpression(
    logger: Logger,
    context: Rule.RuleContext,
    node: SimpleCallExpression & Rule.NodeParentExtension
  ): void
{
  const fmtCtx =
    new FormattingContext(
      context.sourceCode,
      logger);

  const correctLayout =
    checkLayout(
      node,
      fmtCtx);

  if (correctLayout) {
    return;
  }

  const report: ViolationReport<JSSyntaxElement, string> =
    { node: node,
      message:
        'Use asljs call expression style.',
      fix: fix };

  context.report(report);

  function fix(
      fixer: Rule.RuleFixer
    ): Rule.Fix
  {
    const replacement =
      fmtCallExpression(
        node,
        fmtCtx);

    return fixer.replaceText(
      node,
      replacement);
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
