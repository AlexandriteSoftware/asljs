import { RuleDefinition,
         RuleDefinitionTypeOptions }
  from '@eslint/core';
import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { Rule,
         SourceCode }
  from 'eslint';
import { createFormatter }
  from '../formatter.js';

type FormattingContext = { newLine: string; };

const ruleDefinition: RuleDefinition<RuleDefinitionTypeOptions> =
  {
  meta: { type: 'layout', fixable: 'code', schema: [] },
  create(context: Rule.RuleContext): Rule.RuleListener
  {
    const listener: Rule.RuleListener =
      {
      ConditionalExpression(node): void
      {
        const tsNode =
          node as unknown as TSESTree.ConditionalExpression;

        const correctLayout =
          checkLayout(
            tsNode,
            context.sourceCode);

        if (correctLayout) {
          return;
        }

        context.report(
          {
          node,
          message: 'Use asljs conditional expression style.',
          fix(fixer: Rule.RuleFixer): Rule.Fix
          {
            const sourceCode =
              context.sourceCode;

            const newLine =
              sourceCode.text.includes('\r\n')
              ? '\r\n'
              : '\n';

            const formattingContext =
              { newLine };

            const replacement =
              buildConditionalExpression(
                tsNode,
                sourceCode,
                formattingContext);

            return fixer.replaceText(
              node,
              replacement
            );
          }
        });
      }
    };

    return listener;
  }
};

export const conditionalExpressionFormatter =
  createFormatter(
    'conditional-expression-style',
    ruleDefinition);

export default conditionalExpressionFormatter.eslintRule;

function checkLayout(
  node: TSESTree.ConditionalExpression,
  sourceCode: SourceCode
): boolean
{
  const questionMark =
    sourceCode.getTokenAfter(
      asTokenTarget(
        node.test),
      (token) => token.value === '?');

  const colon =
    sourceCode.getTokenAfter(
      asTokenTarget(
        node.consequent),
      (token) => token.value === ':');

  if (questionMark === null || colon === null) {
    return true;
  }

  const testEndLine =
    node.test.loc?.end.line;

  const consequentEndLine =
    node.consequent.loc?.end.line;

  if (testEndLine === undefined || consequentEndLine === undefined) {
    return true;
  }

  return (
    questionMark.loc.start.line > testEndLine
    && colon.loc.start.line > consequentEndLine
  );
}

function buildConditionalExpression(
  node: TSESTree.ConditionalExpression,
  sourceCode: SourceCode,
  formattingContext: FormattingContext
): string
{
  const indent =
    getIndentation(
      sourceCode,
      node);

  const branchIndent =
    indent + '  ';

  const testText =
    sourceCode.getText(
      asTextNode(
        node.test));

  const consequentText =
    sourceCode.getText(
      asTextNode(
        node.consequent));

  const alternateText =
    sourceCode.getText(
      asTextNode(
        node.alternate));

  return `${testText}${formattingContext.newLine}${branchIndent}? ${consequentText}${formattingContext.newLine}${branchIndent}: ${alternateText}`;
}

function getIndentation(
  sourceCode: SourceCode,
  node: TSESTree.ConditionalExpression
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

function asTextNode(
  node: unknown
): Parameters<SourceCode['getText']>[0]
{
  return node as Parameters<SourceCode['getText']>[0];
}
