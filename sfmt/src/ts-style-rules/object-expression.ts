import { ViolationReport }
  from '@eslint/core';
import { JSSyntaxElement,
         Rule }
  from 'eslint';
import { ObjectExpression }
  from 'estree';
import { FormatterDefinition }
  from '../formatter.js';
import { FormattingContext }
  from '../formatting-context.js';
import { Indentation }
  from '../functions/indentations.js';
import { tryGetLocation }
  from '../functions/location.js';
import { expressionIsShort }
  from '../functions/short-expression.js';
import { fmtObjectExpression }
  from '../ts-fmt/fmt-object-expression.js';

const meta: Rule.RuleMetaData =
  { type: 'layout',
    fixable: 'code',
    schema: [] };

export const tsExpressionEslintRule: Rule.RuleModule =
  { meta: meta,
    create: create };

export const tsExpressionFormatter: FormatterDefinition =
  { name: 'expression',
    eslintRule:
      tsExpressionEslintRule };

function create(
    context: Rule.RuleContext
  ): Rule.RuleListener
{
  const listener =
    createExpressionListener(
      context);

  return listener;
}

function createExpressionListener(
    context: Rule.RuleContext
  ): Rule.RuleListener
{
  const ruleListener: Rule.RuleListener =
    { ObjectExpression:
        objectExpressionListener };

  return ruleListener;

  function objectExpressionListener(
      node: ObjectExpression & Rule.NodeParentExtension
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
      { node: node,
        message:
          'Use asljs expression style.',
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
}

function checkLayout(
    node: ObjectExpression,
    context: FormattingContext
  ): boolean
{
  const tokens =
    context.sourceCode.getTokens(node);

  if (tokens.length === 0) {
    // do not check if there are no tokens
    return true;
  }

  const firstToken =
    tokens[0];

  if (firstToken.value !== '{') {
    // do not check if the first token is not an opening brace
    return true;
  }

  const firstTokenLocation =
    tryGetLocation(firstToken);

  if (!firstTokenLocation) {
    // do not check if the first token has no location
    return true;
  }

  const lastToken =
    tokens[tokens.length - 1];

  const lastTokenLocation =
    tryGetLocation(lastToken);

  if (!lastTokenLocation) {
    // do not check if the last token has no location
    return true;
  }

  if (node.properties.length === 0) {
    // the object expression without properties should be just `{ }`
    return firstTokenLocation.start.line === lastTokenLocation.end.line
      && firstTokenLocation.start.column === lastTokenLocation.end.column - 2;
  }

  const baseIndentation =
    new Indentation(
    firstTokenLocation.start.column
  );

  const propertyIndentation =
    baseIndentation.increase();

  const firstProperty =
    node.properties[0];

  const firstPropertyLocation =
    tryGetLocation(firstProperty);

  if (!firstPropertyLocation) {
    // do not check if the first property has no location
    return true;
  }

  // first property should be on the same line as the opening brace
  if (firstPropertyLocation.start.line !== firstTokenLocation.start.line) {
    return false;
  }

  // the properties should be indented one level deeper than the opening brace
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
      // do not check if the property has no location
      return true;
    }

    if (propertyLocation.start.column !== propertyIndentation.column) {
      return false;
    }

    if (property.type === 'Property') {
      const value =
        property.value;

      const valueLocation =
        tryGetLocation(value);

      if (!valueLocation) {
        // do not check if the value has no location
        return true;
      }

      if (expressionIsShort(value)) {
        if (valueLocation.start.line !== propertyLocation.start.line) {
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
          return false;
        }
      }
    }
  }

  return true;
}
