/**
 * @typedef
 *   { import('eslint')
 *       .JSRuleDefinition }
 *   JSRuleDefinition
 * @typedef
 *   { import('eslint')
 *       .SourceCode }
 *   SourceCode
 * @typedef
 *     { import('eslint')
 *        .Rule.RuleListener }
 *  RuleListener
 * @typedef
 *   { import('eslint')
 *       .Rule.RuleContext }
 *  RuleContext
 * @typedef
 *   { import('@eslint/core')
 *       .SourceRange }
 *   SourceRange
 * @typedef
 *   { import('estree')
 *       .Node }
 *   Node
 */

/** @type {JSRuleDefinition} */
export default {
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    schema: [],
  },
  create(
    context)
  {
    /** @type {RuleListener} */
    return {
      Program(
        node)
      {
        checkStatements(
          node.body,
          context);
      },
      BlockStatement(
        node)
      {
        checkStatements(
          node.body,
          context);
      }
    };
  },
};

/**
 * Enforces a blank line between multiline statements.
 * 
 * @param {Node[]} statements
 * @param {RuleContext} context
 */
function checkStatements(
  statements,
  context)
{
  const sourceCode =
    context.sourceCode;

  const newLine =
    sourceCode.text.includes('\r\n')
      ? '\r\n'
      : '\n';

  for (let index = 0;
       index < statements.length - 1;
       index++)
  {
    const statement =
      statements[index];

    const statementRange =
      statement.range;

    if (statementRange === undefined) {
      continue;
    }

    const nextStatement =
      statements[index + 1];

    const nextStatementRange =
      nextStatement.range;


    if (nextStatementRange === undefined) {
      continue;
    }

    if (
      !shouldSpace(
        statement,
        nextStatement)
    ) {
      continue;
    }

    context.report(
      {
        node: nextStatement,
        message: 'Add a blank line between statements.',
        fix(
          fixer)
        {
          /** @type {SourceRange} */
          const range =
            [
              statementRange[1],
              nextStatementRange[0],
            ];

          const nextStatementIndentation =
            getIndentation(
              sourceCode,
              nextStatement);

          return fixer.replaceTextRange(
            range,
            newLine
            + newLine
            + nextStatementIndentation);
        }
      });
  }
}

/**
 * @param {Node} statement 
 * @param {Node} nextStatement 
 * @returns {boolean}
 */
function shouldSpace(
  statement,
  nextStatement)
{
  if (
    statement.type === 'ImportDeclaration'
    || nextStatement.type === 'ImportDeclaration')
  {
    return false;
  }

  const requiresSpacing =
    statementIsMultiline(statement)
    || statementIsMultiline(nextStatement);

  if (!requiresSpacing) {
    return false;
  }

  const nextStatementStartLine =
    nextStatement.loc?.start.line;

  if (nextStatementStartLine === undefined) {
    return false;
  }

  const statementEndLine =
    statement.loc?.end.line;

  if (statementEndLine === undefined) {
    return false;
  }

  const linesBetween =
    nextStatementStartLine
    - statementEndLine;

    return linesBetween < 2;
}

/**
 * @param {Node} statement 
 * @returns {boolean}
 */
function statementIsMultiline(
  statement)
{
  const statementLocation =
    statement.loc;

  if (
    statementLocation === undefined
    || statementLocation === null)
  {
    return false;
  }

  return statementLocation.start.line
         < statementLocation.end.line;
}

/**
 * @param {SourceCode} sourceCode
 * @param {Node} node
 * @returns {string}
 */
function getIndentation(
  sourceCode,
  node)
{
  const nodeLocation =
    node.loc;

  if (
    nodeLocation === undefined
    || nodeLocation === null)
  {
    return '';
  }

  const line =
    sourceCode.lines[
      nodeLocation.start.line - 1];

  const match =
    /^[ \t]*/.exec(line);

  return match?.[0] ?? '';
}
