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

const meta: Rule.RuleMetaData =
  { type: 'layout', fixable: 'code', schema: [] };

export const tsExpressionEslintRule: Rule.RuleModule =
  { meta, create };

export const tsExpressionFormatter: FormatterDefinition =
  {
  name: 'expression',
  eslintRule: tsExpressionEslintRule
};

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
    {
    ObjectExpression: objectExpressionListener
  };

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
      {
      node,
      message: 'Use asljs expression style.',
      fix
    };

    context.report(report);

    function fix(
        fixer: Rule.RuleFixer
      ): Rule.Fix
    {
      const replacement =
        buildExpression(
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
  return true;
}

function buildExpression(
    node: ObjectExpression,
    context: FormattingContext
  ): string
{
  return context.sourceCode.getText(node);
}
