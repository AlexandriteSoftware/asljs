import { RuleDefinition,
         RuleDefinitionTypeOptions }
  from '@eslint/core';
import { Rule,
         SourceCode }
  from 'eslint';
import { ConditionalExpression,
         Node }
  from 'estree';
import { createFormatter }
  from '../formatter.js';

type FormattingContext = { newLine: string; };

const ruleDefinition: RuleDefinition<RuleDefinitionTypeOptions> =
  { meta:
      { type: 'layout',
        fixable: 'code',
        schema: [] },
    create:
      (context: Rule.RuleContext): Rule.RuleListener =>
  {
    const listener: Rule.RuleListener =
      { ConditionalExpression:
          (node: ConditionalExpression): void =>
      {
        const correctLayout =
          checkLayout(
            node,
            context.sourceCode);

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
                  node,
                  sourceCode,
                  formattingContext);

              return fixer.replaceText(
                node,
                replacement);
            } });
      } };

    return listener;
  } };

export const conditionalExpressionFormatter =
  createFormatter(
    'conditional-expression-style',
    ruleDefinition);

export default conditionalExpressionFormatter.eslintRule;

function checkLayout(
    node: ConditionalExpression,
    sourceCode: SourceCode
  ): boolean
{
  const questionMark =
    sourceCode.getTokenAfter(
      node.test,
      token => token.value === '?');

  const colon =
    sourceCode.getTokenAfter(
      node.consequent,
      token => token.value === ':');

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
    node: ConditionalExpression,
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
      node.test);

  const consequentText =
    sourceCode.getText(
      node.consequent);

  const alternateText =
    sourceCode.getText(
      node.alternate);

  return `${testText}${formattingContext.newLine}${branchIndent}? ${consequentText}${formattingContext.newLine}${branchIndent}: ${alternateText}`;
}

function getIndentation(
    sourceCode: SourceCode,
    node: Node
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
