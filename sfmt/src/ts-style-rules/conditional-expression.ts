import { RuleDefinition,
         RuleDefinitionTypeOptions }
  from '@eslint/core';
import { Rule,
         SourceCode }
  from 'eslint';
import { ConditionalExpression }
  from 'estree';
import { createFormatter }
  from '../formatter.js';
import { FormattingContext }
  from '../formatting-context.js';
import { fmtConditionalExpression }
  from '../ts-fmt/fmt-conditional-expression.js';

const ruleDefinition: RuleDefinition<RuleDefinitionTypeOptions> =
  { meta:
      { type: 'layout',
        fixable: 'code',
        schema: [] },
    create: create };

function create(
    context: Rule.RuleContext
  ): Rule.RuleListener
{
  const listener: Rule.RuleListener =
    { ConditionalExpression:
        conditionalExpressionListener };

  return listener;

  function conditionalExpressionListener(
      node: ConditionalExpression
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

    context.report(
      { node: node,
        message:
          'Use asljs conditional expression style.',
        fix:
          (fixer: Rule.RuleFixer): Rule.Fix =>
        {
          const replacement =
            fmtConditionalExpression(
              node,
              fmtCtx);

          return fixer.replaceText(
            node,
            replacement);
        } });
  }
}

export const conditionalExpressionFormatter =
  createFormatter(
    'conditional-expression-style',
    ruleDefinition);

export default conditionalExpressionFormatter.eslintRule;

function checkLayout(
    node: ConditionalExpression,
    context: FormattingContext
  ): boolean
{
  const questionMark =
    context.sourceCode.getTokenAfter(
      asTokenTarget(
        node.test),
      token => token.value === '?');

  const colon =
    context.sourceCode.getTokenAfter(
      asTokenTarget(
        node.consequent),
      token => token.value === ':');

  if (questionMark === null || colon === null) {
    return true;
  }

  const testEndLine =
    node.test.loc?.end.line;

  const consequentEndLine =
    node.consequent.loc?.end.line;

  if (
    testEndLine === undefined
    || consequentEndLine === undefined
  ) {
    return true;
  }

  return (
    questionMark.loc.start.line > testEndLine
    && colon.loc.start.line > consequentEndLine
  );
}

export function getIndentation(
    sourceCode: SourceCode,
    node: ConditionalExpression
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

function asTokenTarget(
    node: unknown
  ): NonNullable<Parameters<SourceCode['getTokenAfter']>[0]>
{
  return node as NonNullable<Parameters<SourceCode['getTokenAfter']>[0]>;
}

export function asTextNode(
    node: unknown
  ): Parameters<SourceCode['getText']>[0]
{
  return node as Parameters<SourceCode['getText']>[0];
}
