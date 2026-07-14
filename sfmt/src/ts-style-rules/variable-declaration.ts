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

interface FormattingContext
{
  newLine: string;
}

const LONG_IDENTIFIER_LENGTH = 15;

const ruleDefinition: RuleDefinition<RuleDefinitionTypeOptions> =
  {
  meta: { type: 'layout', fixable: 'code', schema: [] },
  create(context: Rule.RuleContext): Rule.RuleListener
  {
    const listener: Rule.RuleListener =
      {
      VariableDeclarator(node): void
      {
        const tsNode =
          node as unknown as TSESTree.VariableDeclarator;

        if (!tsNode.init) {
          return;
        }

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
            message: 'Use asljs variable declaration style.',
            fix(fixer)
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
                buildVariableDeclarator(
                  tsNode,
                  sourceCode,
                  formattingContext);

              return fixer.replaceText(
                node,
                replacement
              );
            }
          }
        );
      }
    };

    return listener;
  }
};

export const variableDeclarationFormatter =
  createFormatter(
    'variable-declaration-style',
    ruleDefinition);

export default variableDeclarationFormatter.eslintRule;

function checkLayout(
  node: TSESTree.VariableDeclarator,
  context: Rule.RuleContext
): boolean
{
  const nodeInitialiser =
    node.init;

  if (nodeInitialiser === undefined || nodeInitialiser === null) {
    return true;
  }

  if (
    initialiserIsShortEnoughToStayOnSameLine(
      nodeInitialiser
    )
  ) {
    return true;
  }

  const equalsToken =
    context.sourceCode.getTokenBefore(
      asTokenTarget(
        nodeInitialiser),
      (token) => token.value === '=');

  if (equalsToken === undefined || equalsToken === null) {
    return true;
  }

  const initialiserLocation =
    nodeInitialiser.loc;

  if (initialiserLocation === undefined || initialiserLocation === null) {
    return true;
  }

  return equalsToken.loc.end.line < initialiserLocation.start.line;
}

function initialiserIsShortEnoughToStayOnSameLine(
  initialiser: TSESTree.Expression
): boolean
{
  if (initialiser.type === 'Identifier') {
    const identifier = initialiser;

    return identifier.name.length < LONG_IDENTIFIER_LENGTH;
  }

  if (initialiser.type === 'Literal') {
    const literal = initialiser;

    const literalRawContent =
      literal.raw;

    if (literalRawContent === undefined) {
      return false;
    }

    return literalRawContent.length < LONG_IDENTIFIER_LENGTH;
  }

  if (initialiser.type === 'ObjectExpression') {
    const objectExpression = initialiser;

    return objectExpression.properties.length === 0;
  }

  if (initialiser.type === 'ArrayExpression') {
    const arrayExpression = initialiser;

    return arrayExpression.elements.length === 0;
  }

  if (initialiser.type === 'UnaryExpression') {
    const unaryExpression = initialiser;

    return initialiserIsShortEnoughToStayOnSameLine(
      unaryExpression.argument
    );
  }

  return false;
}

/**
 * @param {TSESTree.VariableDeclarator} node
 * @param {SourceCode} sourceCode
 * @param {FormattingContext} formattingContext
 * @returns {string}
 */
function buildVariableDeclarator(
  node: TSESTree.VariableDeclarator,
  sourceCode: SourceCode,
  formattingContext: FormattingContext
): string
{
  const code = [];

  const idText =
    sourceCode.getText(
      asTextNode(
        node.id));

  code.push(idText);
  code.push(' =');

  const nodeInit =
    node.init;

  if (nodeInit !== undefined && nodeInit !== null) {
    const initText =
      sourceCode.getText(
        asTextNode(nodeInit));

    if (initialiserIsShortEnoughToStayOnSameLine(nodeInit)) {
      code.push(' ');
      code.push(initText);
    } else {
      const indentation =
        getIndentation(
          sourceCode,
          node);

      code.push(
        formattingContext.newLine
      );

      code.push(indentation);
      code.push('  ');
      code.push(initText);
    }
  }

  return code.join('');
}

function getIndentation(
  sourceCode: SourceCode,
  node: TSESTree.VariableDeclarator
): string
{
  const nodeInit =
    node.init;

  if (nodeInit === undefined || nodeInit === null) {
    return '';
  }

  const equalsToken =
    sourceCode.getTokenBefore(
      asTokenTarget(nodeInit),
      (token) => token.value === '=');

  const equalsTokenLocation =
    equalsToken?.loc;

  if (equalsTokenLocation === undefined || equalsTokenLocation === null) {
    return '';
  }

  const line =
    sourceCode.lines[equalsTokenLocation.start.line - 1];

  const match =
    /^[ \t]*/.exec(line);

  return match?.[0] ?? '';
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
