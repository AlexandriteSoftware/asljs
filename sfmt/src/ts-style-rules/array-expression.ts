import { ViolationReport }
  from '@eslint/core';
import { JSSyntaxElement,
         Rule }
  from 'eslint';
import { ArrayExpression }
  from 'estree';
import { FormatterDefinition }
  from '../formatter.js';
import { FormattingContext }
  from '../formatting-context.js';
import { Indentation }
  from '../functions/indentations.js';
import { tryGetLocation }
  from '../functions/location.js';
import { fmtArrayExpression }
  from '../ts-fmt/fmt-array-expression.js';

const meta: Rule.RuleMetaData =
  { type: 'layout',
    fixable: 'code',
    schema: [] };

export const tsArrayExpressionEslintRule: Rule.RuleModule =
  { meta,
    create };

export const tsArrayExpressionFormatter: FormatterDefinition =
  { name:
      'array-expression',
    eslintRule:
      tsArrayExpressionEslintRule };

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
    { ArrayExpression:
        arrayExpressionListener };

  return ruleListener;

  function arrayExpressionListener(
      node: ArrayExpression & Rule.NodeParentExtension
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
        fmtArrayExpression(
          node,
          fmtCtx);

      return fixer.replaceText(
        node,
        replacement);
    }
  }
}

function checkLayout(
    node: ArrayExpression,
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

  if (firstToken.value !== '[') {
    // do not check if the first token is not `[`
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
    firstTokenLocation.start.column
  );

  const elementIndentation =
    baseIndentation.increase();

  const firstElement =
    node.elements[0];

  const firstElementLocation =
    tryGetLocation(firstElement);

  if (!firstElementLocation) {
    // do not check if the first property has no location
    return true;
  }

  // first property should be on the same line as the opening brace
  if (firstElementLocation.start.line !== firstTokenLocation.start.line) {
    return false;
  }

  // the properties should be indented one level deeper than the opening brace
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

    const elementLocation =
      tryGetLocation(element);

    if (!elementLocation) {
      // do not check if the property has no location
      return true;
    }

    if (elementLocation.start.column !== elementIndentation.column) {
      return false;
    }
  }

  return true;
}
