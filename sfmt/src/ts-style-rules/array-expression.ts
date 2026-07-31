import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { type TSESLint }
  from '@typescript-eslint/utils';
import { ReportDescriptor }
  from '@typescript-eslint/utils/ts-eslint';
import { RuleListenerFactory,
         tsFormatterFactory }
  from '../formatter.js';
import { FormattingContext }
  from '../formatting-context.js';
import { Indentation }
  from '../functions/indentations.js';
import { Logger }
  from '../logging.js';
import { fmtArrayExpression }
  from '../ts-fmt/fmt-array-expression.js';

const messages: Record<string, string> =
  { 'use-asljs-array-expression-style':
      'Use asljs array expression style.' };

const formatterDefinitionFactory =
  tsFormatterFactory(
    'array-expression',
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
      { ArrayExpression: listener };

    return ruleListener;

    function listener(
        node: TSESTree.ArrayExpression
      ): void
    {
      processArrayExpression(
        logger,
        context,
        node);
    }
  };

  return listenerFactory;
}

function processArrayExpression(
    logger: Logger,
    context: TSESLint.RuleContext<string, readonly unknown[]>,
    node: TSESTree.ArrayExpression
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
    { node,
      messageId:
        'use-asljs-array-expression-style',
      fix };

  context.report(report);

  function fix(
      fixer: TSESLint.RuleFixer
    ): TSESLint.RuleFix
  {
    const replacement =
      fmtArrayExpression(
        node,
        fmtCtx);

    return fixer.replaceText(
      node,
      replacement);
  }
}

function checkLayout(
    node: TSESTree.ArrayExpression,
    context: FormattingContext
  ): boolean
{
  const tokens =
    context.sourceCode.getTokens(node);

  if (tokens.length === 0) {
    // do not check if there are no tokens
    return true;
  }

  const firstToken = tokens[0];

  if (
    firstToken.value
    !== '['
  ) {
    // do not check if the first token is not `[`
    return true;
  }

  const firstTokenLocation = firstToken?.loc;

  if (!firstTokenLocation) {
    // do not check if the first token has no location
    return true;
  }

  const lastToken =
    tokens[tokens.length - 1];

  const lastTokenLocation = lastToken?.loc;

  if (!lastTokenLocation) {
    // do not check if the last token has no location
    return true;
  }

  if (node.elements.length === 0) {
    // the array expression without elements should be just `[ ]`
    const result =
      firstTokenLocation.start.line === lastTokenLocation.start.line
      && firstTokenLocation.start.column
        === (lastTokenLocation.start.column - 2);

    return result;
  }

  const baseIndentation =
    new Indentation(
      firstTokenLocation.start.column);

  const elementIndentation =
    baseIndentation.increase();

  const firstElement = node.elements[0];

  const firstElementLocation = firstElement?.loc;

  if (!firstElementLocation) {
    // do not check if the first element has no location
    return true;
  }

  // first element should be on the same line as the opening bracket
  if (
    firstElementLocation.start.line
    !== firstTokenLocation.start.line
  ) {
    return false;
  }

  // the elements should be indented one level deeper than the opening bracket
  for (
    let index = 0;
    index < node.elements.length;
    index++
  ) {
    const element =
      node.elements[index];

    if (element === null) {
      // do not check if the element is null
      return true;
    }

    const elementLocation = element?.loc;

    if (!elementLocation) {
      // do not check if the element has no location
      return true;
    }

    if (
      elementLocation.start.column
      !== elementIndentation.column
    ) {
      return false;
    }
  }

  return true;
}
