import { ViolationReport }
  from '@eslint/core';
import { JSSyntaxElement,
         Rule }
  from 'eslint';
import { ObjectExpression }
  from 'estree';
import { FormatterDefinitionFactory,
         formatterFactory,
         RuleListenerFactory }
  from '../formatter.js';
import { FormattingContext }
  from '../formatting-context.js';
import { Indentation }
  from '../functions/indentations.js';
import { tryGetLocation }
  from '../functions/location.js';
import { expressionIsShort }
  from '../functions/short-expression.js';
import { Logger }
  from '../logging.js';
import { fmtObjectExpression }
  from '../ts-fmt/fmt-object-expression.js';

const formatterDefinitionFactory: FormatterDefinitionFactory =
  formatterFactory(
    'object-expression',
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
      { ObjectExpression: listener };

    return ruleListener;

    function listener(
        node: ObjectExpression & Rule.NodeParentExtension
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
    context: Rule.RuleContext,
    node: ObjectExpression & Rule.NodeParentExtension
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
        'Use asljs object expression style.',
      fix: fix };

  context.report(report);

  function fix(
      fixer: Rule.RuleFixer
    ): Rule.Fix
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
    node: ObjectExpression,
    context: FormattingContext
  ): boolean
{
  const log =
    context.logger
    .debug
    .bind(
      context.logger);

  const tokens =
    context.sourceCode.getTokens(node);

  if (tokens.length === 0) {
    log(
      'checkLayout: do not check if there are no tokens');

    return true;
  }

  const firstToken =
    tokens[0];

  if (firstToken.value !== '{') {
    log(
      'checkLayout: do not check if the first token is not an opening brace');

    return true;
  }

  const firstTokenLocation =
    tryGetLocation(firstToken);

  if (!firstTokenLocation) {
    log(
      'checkLayout: do not check if the first token has no location');

    return true;
  }

  const lastToken =
    tokens[tokens.length - 1];

  const lastTokenLocation =
    tryGetLocation(lastToken);

  if (!lastTokenLocation) {
    log(
      'checkLayout: do not check if the last token has no location');

    return true;
  }

  if (node.properties.length === 0) {
    const result =
      firstTokenLocation.start.line === lastTokenLocation.end.line
      && firstTokenLocation.start.column === lastTokenLocation.end.column - 2;

    if (result) {
      log(
        'checkLayout: the empty object expression is correct');
    } else {
      log(
        'checkLayout: the empty object expression should be just `{ }`');
    }

    return result;
  }

  const baseIndentation =
    new Indentation(
      firstTokenLocation.start.column);

  const propertyIndentation =
    baseIndentation.increase();

  const firstProperty =
    node.properties[0];

  const firstPropertyLocation =
    tryGetLocation(firstProperty);

  if (!firstPropertyLocation) {
    log(
      'checkLayout: do not check if the first property has no location');

    return true;
  }

  if (firstPropertyLocation.start.line !== firstTokenLocation.start.line) {
    log(
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

    const propertyLocation =
      tryGetLocation(property);

    if (!propertyLocation) {
      log(
        'checkLayout: do not check if the property has no location');

      return true;
    }

    if (propertyLocation.start.column !== propertyIndentation.column) {
      log(
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

    const value =
      property.value;

    const valueLocation =
      tryGetLocation(value);

    if (!valueLocation) {
      log(
        'checkLayout: do not check if the value has no location');

      return true;
    }

    if (expressionIsShort(value)) {
      if (valueLocation.start.line !== propertyLocation.start.line) {
        log(
          'checkLayout: the short expressionvalue should be on the same line as the property');

        return false;
      }
    } else {
      const expectedValueLine =
        propertyLocation.start.line + 1;

      const expectedValueColumn =
        propertyIndentation.increase().column;

      if (
        valueLocation.start.line !== expectedValueLine
        || valueLocation.start.column !== expectedValueColumn
      ) {
        log(
          'checkLayout: the long expression value should be on the next line and indented one level deeper than the property');

        return false;
      }
    }
  }

  log(
    'checkLayout: the object expression layout is correct');

  return true;
}
