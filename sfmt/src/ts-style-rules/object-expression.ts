import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { type TSESLint }
  from '@typescript-eslint/utils';
import { ReportDescriptor }
  from '@typescript-eslint/utils/ts-eslint';
import { FormatterDefinitionFactory,
         RuleListenerFactory,
         tsFormatterFactory }
  from '../formatter.js';
import { FormattingContext }
  from '../formatting-context.js';
import { Indentation }
  from '../functions/indentations.js';
import { expressionIsSimple }
  from '../functions/simple-expression.js';
import { Logger }
  from '../logging.js';
import { fmtObjectExpression }
  from '../ts-fmt/fmt-object-expression.js';

const messages: Record<string, string> =
  { 'use-asljs-object-expression-style':
      'Use asljs object expression style.' };

const formatterDefinitionFactory: FormatterDefinitionFactory =
  tsFormatterFactory(
    'object-expression',
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
      { ObjectExpression: listener };

    return ruleListener;

    function listener(
        node: TSESTree.ObjectExpression
      ): void
    {
      processObjectExpression(
        logger,
        context,
        node);
    }
  };

  return listenerFactory;
}

function processObjectExpression(
    logger: Logger,
    context: TSESLint.RuleContext<string, readonly unknown[]>,
    node: TSESTree.ObjectExpression
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
        'use-asljs-object-expression-style',
      fix: fix };

  context.report(report);

  function fix(
      fixer: TSESLint.RuleFixer
    ): TSESLint.RuleFix
  {
    const replacement =
      fmtObjectExpression(
        node,
        fmtCtx);

    return fixer.replaceText(
      node,
      replacement);
  }
}

function checkLayout(
    node: TSESTree.ObjectExpression,
    context: FormattingContext
  ): boolean
{
  const logger = context.logger;

  const tokens =
    context.sourceCode.getTokens(node);

  if (tokens.length === 0) {
    logger.debug(
      'checkLayout: do not check if there are no tokens');

    return true;
  }

  const firstToken = tokens[0];

  if (firstToken.value !== '{') {
    logger.debug(
      'checkLayout: do not check if the first token is not an opening brace');

    return true;
  }

  const firstTokenLocation = firstToken?.loc;

  if (!firstTokenLocation) {
    logger.debug(
      'checkLayout: do not check if the first token has no location');

    return true;
  }

  const lastToken =
    tokens[tokens.length - 1];

  const lastTokenLocation = lastToken?.loc;

  if (!lastTokenLocation) {
    logger.debug(
      'checkLayout: do not check if the last token has no location');

    return true;
  }

  if (node.properties.length === 0) {
    const result =
      firstTokenLocation.start.line === lastTokenLocation.end.line
      && firstTokenLocation.start.column === lastTokenLocation.end.column - 2;

    if (result) {
      logger.debug(
        'checkLayout: the empty object expression is correct');
    } else {
      logger.debug(
        'checkLayout: the empty object expression should be just `{ }`');
    }

    return result;
  }

  const baseIndentation =
    new Indentation(
      firstTokenLocation.start.column);

  const propertyIndentation =
    baseIndentation.increase();

  const firstProperty = node.properties[0];

  const firstPropertyLocation = firstProperty?.loc;

  if (!firstPropertyLocation) {
    logger.debug(
      'checkLayout: do not check if the first property has no location');

    return true;
  }

  if (
    firstPropertyLocation.start.line
    !== firstTokenLocation.start.line
  ) {
    logger.debug(
      'checkLayout: the first property should be on the same line as the opening brace');

    return false;
  }

  for (
    let index = 0;
    index < node.properties.length;
    index++
  ) {
    const property =
      node.properties[index];

    const propertyLocation = property?.loc;

    if (!propertyLocation) {
      logger.debug(
        'checkLayout: do not check if the property has no location');

      return true;
    }

    if (
      propertyLocation.start.column
      !== propertyIndentation.column
    ) {
      logger.debug(
        'checkLayout: the properties should be indented one level deeper than the opening brace');

      return false;
    }

    if (property.type !== 'Property') {
      continue;
    }

    if (property.shorthand) {
      continue;
    }

    if (property.method) {
      continue;
    }

    if (property.kind !== 'init') {
      continue;
    }

    const value = property.value;

    const valueLocation = value?.loc;

    if (!valueLocation) {
      logger.debug(
        'checkLayout: do not check if the value has no location');

      return true;
    }

    if (expressionIsSimple(value)) {
      if (
        valueLocation.start.line
        !== propertyLocation.start.line
      ) {
        logger.debug(
          'checkLayout: the short expressionvalue should be on the same line as the property');

        return false;
      }
    } else {
      const expectedValueLine =
        propertyLocation.start.line + 1;

      const expectedValueColumn =
        propertyIndentation.increase().column;

      if (
        valueLocation.start.line
        !== expectedValueLine
        || valueLocation.start.column
           !== expectedValueColumn
      ) {
        logger.debug(
          'checkLayout: the long expression value should be on the next line and indented one level deeper than the property');

        return false;
      }
    }
  }

  logger.debug(
    'checkLayout: the object expression layout is correct');

  return true;
}
