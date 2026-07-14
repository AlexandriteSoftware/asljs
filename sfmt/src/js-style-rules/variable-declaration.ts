import { RuleDefinition,
         RuleDefinitionTypeOptions }
  from '@eslint/core';
import { AST,
         JSRuleDefinition,
         Rule,
         SourceCode }
  from 'eslint';
import { ArrayExpression,
         Expression,
         Identifier,
         Literal,
         ObjectExpression,
         UnaryExpression,
         VariableDeclarator }
  from 'estree';
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
      VariableDeclarator(node: VariableDeclarator): void
      {
        if (!node.init) {
          return;
        }

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
                  node,
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
  node: VariableDeclarator,
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
      nodeInitialiser,
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
  initialiser: Expression
): boolean
{
  if (initialiser.type === 'Identifier') {
    const identifier = /** @type {Identifier} */ initialiser;

    return identifier.name.length < LONG_IDENTIFIER_LENGTH;
  }

  if (initialiser.type === 'Literal') {
    const literal = /** @type {Literal} */ initialiser;

    const literalRawContent =
      literal.raw;

    if (literalRawContent === undefined) {
      return false;
    }

    return literalRawContent.length < LONG_IDENTIFIER_LENGTH;
  }

  if (initialiser.type === 'ObjectExpression') {
    const objectExpression = /** @type {ObjectExpression} */ initialiser;

    return objectExpression.properties.length === 0;
  }

  if (initialiser.type === 'ArrayExpression') {
    const arrayExpression = /** @type {ArrayExpression} */ initialiser;

    return arrayExpression.elements.length === 0;
  }

  if (initialiser.type === 'UnaryExpression') {
    const unaryExpression = /** @type {UnaryExpression} */ initialiser;

    return initialiserIsShortEnoughToStayOnSameLine(
      unaryExpression.argument
    );
  }

  return false;
}

/**
 * @param {VariableDeclarator} node
 * @param {SourceCode} sourceCode
 * @param {FormattingContext} formattingContext
 * @returns {string}
 */
function buildVariableDeclarator(
  node: VariableDeclarator,
  sourceCode: SourceCode,
  formattingContext: FormattingContext
): string
{
  const code = [];

  const idText =
    sourceCode.getText(
      node.id);

  code.push(idText);
  code.push(' =');

  const nodeInit =
    node.init;

  if (nodeInit !== undefined && nodeInit !== null) {
    const initText =
      sourceCode.getText(nodeInit);

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
  node: VariableDeclarator
): string
{
  const nodeInit =
    node.init;

  if (nodeInit === undefined || nodeInit === null) {
    return '';
  }

  const equalsToken =
    sourceCode.getTokenBefore(
      nodeInit,
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
