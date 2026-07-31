import { ViolationReport }
  from '@eslint/core';
import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { type TSESLint }
  from '@typescript-eslint/utils';
import { ReportDescriptor }
  from '@typescript-eslint/utils/ts-eslint';
import { JSSyntaxElement,
         Rule }
  from 'eslint';
import { Expression }
  from 'estree';
import { FormatterDefinitionFactory,
         RuleListenerFactory,
         tsFormatterFactory }
  from '../formatter.js';
import { FormattingContext,
         FormattingContextPredicates }
  from '../formatting-context.js';
import { getIndentation }
  from '../functions/indentations.js';
import { ensureLocation }
  from '../functions/location.js';
import { expressionIsSimple }
  from '../functions/simple-expression.js';
import { Logger }
  from '../logging.js';
import { fmtCallExpression }
  from '../ts-fmt/fmt-call-expression.js';

const messages: Record<string, string> =
  { 'Use asljs call expression style.':
      'Use asljs call expression style.' };

const formatterDefinitionFactory: FormatterDefinitionFactory =
  tsFormatterFactory(
    'call-expression',
    listenerFactory,
    messages);

export default formatterDefinitionFactory;

function listenerFactory(
    logger: Logger
  ): RuleListenerFactory
{
  const listenerFactory: RuleListenerFactory =
    (
        context: TSESLint.RuleContext<string, readonly unknown[]>
      ): TSESLint.RuleListener =>
    {
    const ruleListener: TSESLint.RuleListener =
      { CallExpression: listener };

    return ruleListener;

    function listener(
        node: TSESTree.CallExpression
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
    context: TSESLint.RuleContext<string, readonly unknown[]>,
    node: TSESTree.CallExpression
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

  const report: ReportDescriptor<string> =
    { node: node,
      messageId:
        'Use asljs call expression style.',
      fix: fix };

  context.report(report);

  function fix(
      fixer: TSESLint.RuleFixer
    ): TSESLint.RuleFix
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
    node: TSESTree.CallExpression,
    context: FormattingContext
  ): boolean
{
  const logger = context.logger;

  const callee = node.callee;

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

  if (
    openingParenthesis.loc.start.line
    !== callee.loc.end.line
  ) {
    // FAIL: opening parenthesis is not on the same line as the callee
    return false;
  }

  const argumentsList = node.arguments;

  if (argumentsList.length === 0) {
    // no arguments

    const closingParenthesis =
      context.next(
        openingParenthesis,
        FormattingContextPredicates.isClosingParenthesis);

    if (!closingParenthesis) {
      logger.debug(
        'no closing parenthesis found, cannot check the layout');

      return true;
    }

    if (
      closingParenthesis.loc.start.line
      !== openingParenthesis.loc.end.line
    ) {
      logger.debug(
        'opening and closing parenthesis are not on the same line');

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
    const argument = argumentsList[0];

    ensureLocation(argument);

    const argumentStartLine =
      argument.loc.start.line;

    const isShortParameter =
      expressionIsSimple(
        argument as Expression);

    if (
      isShortParameter
      && openingParenthesis.loc.end.line
         === argumentStartLine
    ) {
      logger.debug(
        'one short argument is on the same line as the opening parenthesis');

      return true;
    }
  }

  // If not captured by one short argument before, continue with checking that
  // each argument starts on a separate line.

  for (
    let index = 0;
    index < argumentsList.length;
    index++
  ) {
    const argument =
      argumentsList[index];

    ensureLocation(argument);

    const argumentStartLine =
      argument.loc.start.line;

    if (index === 0) {
      if (
        openingParenthesis.loc.end.line
        === argumentStartLine
      ) {
        return false;
      }
    } else {
      const previousArgument =
        argumentsList[index - 1];

      ensureLocation(
        previousArgument);

      const previousArgumentEndLine =
        previousArgument.loc.end.line;

      if (
        previousArgumentEndLine
        === argumentStartLine
      ) {
        logger.debug(
          'two arguments are on the same line');

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
      logger.debug(
        'argument indentation is not correct');

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
    logger.debug(
      'no closing parenthesis found, cannot check the layout');

    return true;
  }

  if (
    closingParenthesis.loc.start.line
    !== lastArgument.loc.end.line
  ) {
    logger.debug(
      'closing parenthesis is not on the same line as the last argument');

    return false;
  }

  return true;
}
