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
      FunctionDeclaration(node): void
      {
        const tsNode =
          node as unknown as TSESTree.FunctionDeclaration;

        const correctLayout =
          checkLayout(
            tsNode,
            context);

        if (correctLayout) {
          return;
        }

        context.report(
          {
          node,
          message: 'Use asljs function declaration style.',
          fix(fixer: Rule.RuleFixer): Rule.Fix
          {
            const newLine =
              context.sourceCode.text.includes('\r\n')
              ? '\r\n'
              : '\n';

            const formattingContext =
              { newLine };

            const replacement =
              buildFunctionDeclaration(
                tsNode,
                context,
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

export const functionDeclarationFormatter =
  createFormatter(
    'function-declaration-style',
    ruleDefinition);

export default functionDeclarationFormatter.eslintRule;

/**
 * Checks that function parameters are on separate lines and the opening brace
 * is on a new line.
 */
function checkLayout(
  node: TSESTree.FunctionDeclaration,
  context: Rule.RuleContext
): boolean
{
  const parameters =
    node.params;

  if (parameters.length > 1) {
    for (let index = 1; index < parameters.length; index++) {
      const previousParameter =
        parameters[index - 1];

      const currentParameter =
        parameters[index];

      const previousParameterEndLine =
        previousParameter.loc?.end.line;

      if (previousParameterEndLine === undefined) {
        // If we can't determine the line number, assume it's correct
        return true;
      }

      const currentParameterStartLine =
        currentParameter.loc?.start.line;

      if (currentParameterStartLine === undefined) {
        // If we can't determine the line number, assume it's correct
        return true;
      }

      if (previousParameterEndLine === currentParameterStartLine) {
        return false;
      }
    }
  }

  const closingParen =
    context.sourceCode
    .getTokenBefore(
      asTokenTarget(
        node.body));

  if (closingParen === null) {
    // If we can't find the closing parenthesis, assume it's correct
    return true;
  }

  const nodeBodyStartLine =
    node.body.loc?.start.line;

  if (nodeBodyStartLine === undefined) {
    // If we can't determine the line number, assume it's correct
    return true;
  }

  if (closingParen.loc.end.line === nodeBodyStartLine) {
    return false;
  }

  return true;
}

function buildFunctionDeclaration(
  node: TSESTree.FunctionDeclaration,
  context: Rule.RuleContext,
  formattingContext: FormattingContext
): string
{
  const name =
    node.id?.name ?? '';

  const body =
    node.body;

  const returnTypeText =
    node.returnType
    ? context.sourceCode.getText(
      asTextNode(
        node.returnType))
    : '';

  const parameters =
    node.params.map(
      (parameter) =>
    context.sourceCode.getText(
      asTextNode(parameter)));

  const code = [];

  if (node.async) {
    code.push('async ');
  }

  code.push('function ');

  if (name) {
    code.push(name);
  }

  code.push('(');

  if (parameters.length === 0) {
    code.push(')');
  } else {
    code.push(
      formattingContext.newLine);

    for (let index = 0; index < parameters.length; index++) {
      code.push(
        `  ${parameters[index]}`);

      if (index < parameters.length - 1) {
        code.push(',');
      }

      if (index < parameters.length - 1) {
        code.push(
          formattingContext.newLine);
      }
    }

    code.push(')');
  }

  code.push(returnTypeText);

  code.push(
    formattingContext.newLine);

  code.push(
    context.sourceCode.getText(
      asTextNode(body)));

  return code.join('');
}

function asTokenTarget(
  node: unknown
): NonNullable<Parameters<SourceCode['getTokenBefore']>[0]>
{
  return node as NonNullable<Parameters<SourceCode['getTokenBefore']>[0]>;
}

function asTextNode(
  node: unknown
): Parameters<SourceCode['getText']>[0]
{
  return node as Parameters<SourceCode['getText']>[0];
}
