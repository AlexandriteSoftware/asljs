/**
 * @typedef
 *   { import('eslint')
 *       .JSRuleDefinition }
 *   JSRuleDefinition
 * @typedef
 *   { import('eslint')
 *       .Rule.RuleListener }
 *  RuleListener
 * @typedef
 *   { import('eslint')
 *       .Rule.RuleContext }
 *  RuleContext
 * @typedef
 *   { import('eslint')
 *       .SourceCode }
 *   SourceCode
 * @typedef
 *   { import('eslint')
 *       .AST.Token }
 *  Token
 * @typedef
 *   { import('estree')
 *       .Expression }
 *   Expression
 * @typedef
 *   { import('estree')
 *       .SimpleCallExpression }
 *   SimpleCallExpression
 * @typedef
 *   { import('estree')
 *       .Node }
 *   Node
 * @typedef
 *   { import('estree')
 *       .SpreadElement }
 *   SpreadElement
 * @typedef
 *   { import('estree')
 *       .Identifier }
 *   Identifier
 * @typedef
 *   { import('estree')
 *       .Literal }
 *   Literal
 */

/**
 * @typedef {object} FormattingContext
 * @property {string} newLine
 */

const LONG_IDENTIFIER_LENGTH = 15;

/** @type {JSRuleDefinition} */
export default {
  meta:
    { type: 'layout',
      fixable: 'code',
      schema: [] },
  create(
    context)
  {
    /** @type {RuleListener} */
    return {
      CallExpression(
        node)
      {
        const correctLayout =
          checkLayout(
            node,
            context);

        if (correctLayout) {
          return;
        }

        context.report(
          { node,
            message: 'Use asljs call expression style.',
            fix(
              fixer)
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
                replacement);
            }
          });
      }
    };
  }
};

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
  node,
  context)
{
  const argumentsList =
    node.arguments;

  if (argumentsList.length === 0) {
    return true;
  }

  const openingParenthesis =
    context.sourceCode.getTokenAfter(
      node.callee,
      token => token.value === '(');

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
      argumentIsShortEnoughToStayOnSameLine(argument);

    if (isShortParameter
        && openingParenthesis.loc.end.line === argumentStartLine)
    {
        return true;
    }

    const argumentIndent =
      getIndentation(
        context.sourceCode,
        argument);

    return requiredArgumentIndent === argumentIndent;
  }

  // Multiple arguments: each argument must start
  // on a separate line.
  for (
    let index = 0;
    index < argumentsList.length;
    index++)
  {
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
        argument);

    if (requiredArgumentIndent !== argumentIndent) {
      return false;
    }
  }

  return true;
}

/**
 * @param {Expression|SpreadElement} argument 
 * @returns {boolean}
 */
function argumentIsShortEnoughToStayOnSameLine(
  argument)
{
  if (argument.type === 'Identifier') {
    const identifier =
      /** @type {Identifier} */ (argument);

    return identifier.name.length < LONG_IDENTIFIER_LENGTH;
  }

  if (argument.type === 'Literal') {
    const literal =
      /** @type {Literal} */ (argument);

    const literalRawContent =
      literal.raw;

    if (literalRawContent === undefined) {
      return false;
    }

    return literalRawContent.length < LONG_IDENTIFIER_LENGTH;
  }

  return false;
}

/**
 * @param {SourceCode} sourceCode
 * @param {SimpleCallExpression} node
 * @param {FormattingContext} formattingContext
 */

function buildCallExpression(
  node,
  sourceCode,
  formattingContext)
{
  const openingParenthesis =
    sourceCode.getTokenAfter(
      node.callee,
      token => token.value === '(');

  if (openingParenthesis === null) {
    return sourceCode.getText(node);
  }

  const indent =
    getIndentation(
      sourceCode,
      openingParenthesis);

  const requiredArgumentIndent =
    indent + '  ';

  const code =
    [ ];

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
      if (argumentIsShortEnoughToStayOnSameLine(argument)) {
        if (openingParenthesis.loc.end.line !== argumentStartLine) {
          code.push(
            formattingContext.newLine);

          code.push(
            requiredArgumentIndent);
        }

        code.push(
          argumentText);
      } else {
        code.push(
          formattingContext.newLine);

        code.push(
          requiredArgumentIndent);

        code.push(argumentText);
      }
    }
  } else if (node.arguments.length > 1) {
    for (
      let index = 0;
      index < node.arguments.length;
      index++)
    {
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

/**
 * @param {SourceCode} sourceCode
 * @param {Token|Expression|SpreadElement} node
 * @returns {string} indentation of the line where the node starts
 */
function getIndentation(
  sourceCode,
  node)
{
  const nodeLocation =
    node.loc;

  if (
    nodeLocation === undefined
    || nodeLocation === null) {
    return '';
  }

  const line =
    sourceCode.lines[nodeLocation.start.line - 1];

  const match =
    /^[ \t]*/.exec(line);

  return match?.[0] ?? '';
}