import { RuleDefinition,
         RuleDefinitionTypeOptions }
  from '@eslint/core';
import { AST,
         Rule,
         SourceCode }
  from 'eslint';
import { SimpleCallExpression }
  from 'estree';
import { createFormatter }
  from '../formatter.js';
import { expressionIsShort }
  from '../functions/short-expression.js';

type FormattingContext = { newLine: string; };

const ruleDefinition: RuleDefinition<RuleDefinitionTypeOptions> =
  {
  meta: { type: 'layout', fixable: 'code', schema: [] },
  create(context: Rule.RuleContext): Rule.RuleListener
  {
    const listener: Rule.RuleListener =
      {
      CallExpression(node: SimpleCallExpression): void
      {
        const correctLayout =
          checkLayout(
            node,
            context);

        if (correctLayout) {
          return;
        }

        context.report(
          {
          node,
          message: 'Use asljs call expression style.',
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
              buildCallExpression(
                node,
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

export const callExpressionFormatter =
  createFormatter(
    'call-expression-style',
    ruleDefinition);

export default callExpressionFormatter.eslintRule;

/**
 * Checks that:
 *
 * - Complex function call expressions are on a separate line. Complex is:
 *   - single variable or literal that is longer than 15 characters, or
 *   - expression that is not a single variable or literal.
 * - Multiple function call parameters are on separate lines
 *
 * @param {SimpleCallExpression} node
 * @param {RuleContext} context
 * @returns {boolean} true if the layout is correct, false otherwise
 */
function checkLayout(
  node: SimpleCallExpression,
  context: Rule.RuleContext
): boolean
{
  const argumentsList =
    node.arguments;

  if (argumentsList.length === 0) {
    return true;
  }

  const openingParenthesis =
    context.sourceCode.getTokenAfter(
      node.callee,
      (token) => token.value === '(');

  if (openingParenthesis === null) {
    return true;
  }

  const indent =
    getIndentation(
      context.sourceCode,
      openingParenthesis);

  const requiredArgumentIndent =
    indent + '  ';

  if (argumentsList.length === 1) {
    const argument =
      argumentsList[0];

    const argumentStartLine =
      argument.loc?.start.line;

    if (argumentStartLine === undefined) {
      return true;
    }

    const isShortParameter =
      expressionIsShort(argument);

    if (
      isShortParameter
      && openingParenthesis.loc.end.line === argumentStartLine
    ) {
      return true;
    }

    const argumentIndent =
      getIndentation(
        context.sourceCode,
        argument as unknown as AST.Token);

    return requiredArgumentIndent === argumentIndent;
  }

  // Multiple arguments: each argument must start
  // on a separate line.
  for (let index = 0; index < argumentsList.length; index++) {
    const argument =
      argumentsList[index];

    const argumentStartLine =
      argument.loc?.start.line;

    if (argumentStartLine === undefined) {
      return true;
    }

    if (index === 0) {
      if (openingParenthesis.loc.end.line === argumentStartLine) {
        return false;
      }
    } else {
      const previousArgument =
        argumentsList[index - 1];

      const previousArgumentEndLine =
        previousArgument.loc?.end.line;

      if (previousArgumentEndLine === undefined) {
        return true;
      }

      if (previousArgumentEndLine === argumentStartLine) {
        return false;
      }
    }

    const argumentIndent =
      getIndentation(
        context.sourceCode,
        argument as unknown as AST.Token);

    if (requiredArgumentIndent !== argumentIndent) {
      return false;
    }
  }

  return true;
}

function buildCallExpression(
  node: SimpleCallExpression,
  sourceCode: SourceCode,
  formattingContext: FormattingContext
): string
{
  const openingParenthesis =
    sourceCode.getTokenAfter(
      node.callee,
      (token) => token.value === '(');

  if (openingParenthesis === null) {
    return sourceCode.getText(node);
  }

  const indent =
    getIndentation(
      sourceCode,
      openingParenthesis);

  const requiredArgumentIndent =
    indent + '  ';

  const code = [];

  const callee =
    sourceCode.getText(
      node.callee);

  code.push(callee);
  code.push('(');

  if (node.arguments.length === 1) {
    const argument =
      node.arguments[0];

    const argumentText =
      sourceCode.getText(argument);

    const argumentStartLine =
      argument.loc?.start.line;

    if (argumentStartLine === undefined) {
      code.push(argumentText);
    } else {
      if (expressionIsShort(argument)) {
        if (openingParenthesis.loc.end.line !== argumentStartLine) {
          code.push(
            formattingContext.newLine);

          code.push(
            requiredArgumentIndent);
        }

        code.push(argumentText);
      } else {
        code.push(
          formattingContext.newLine);

        code.push(
          requiredArgumentIndent);

        code.push(argumentText);
      }
    }
  } else if (node.arguments.length > 1) {
    for (let index = 0; index < node.arguments.length; index++) {
      if (index > 0) {
        code.push(',');
      }

      const argument =
        node.arguments[index];

      const argumentText =
        sourceCode.getText(argument);

      code.push(
        formattingContext.newLine);

      code.push(
        requiredArgumentIndent);

      code.push(argumentText);
    }
  }

  code.push(')');

  return code.join('');
}

function getIndentation(
  sourceCode: SourceCode,
  node: AST.Token
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
