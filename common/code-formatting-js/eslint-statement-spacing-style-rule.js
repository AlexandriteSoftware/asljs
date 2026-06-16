export default {
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    schema: [],
  },

  create(context) {
    return {
      Program(node) {
        checkStatements(
          node.body,
          context);
      },
      BlockStatement(node) {
        checkStatements(
          node.body,
          context);
      }
    };
  },
};

/**
 * Enforces a blank line between multiline statements.
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

    const nextStatement =
      statements[index + 1];

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
        fix(fixer) {
          const range =
            [
              statement.range[1],
              nextStatement.range[0],
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

function shouldSpace(
  statement,
  nextStatement)
{
  if (statement.type === 'ImportDeclaration'
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

  const linesBetween =
    nextStatement.loc.start.line
    - statement.loc.end.line;

    return linesBetween < 2;
}

function statementIsMultiline(
  statement)
{
  return statement.loc.start.line
         < statement.loc.end.line;
}

function getIndentation(
  sourceCode,
  node)
{
  const line =
    sourceCode.lines[
      node.loc.start.line - 1];

  const match =
    /^[ \t]*/.exec(line);

  return match?.[0] ?? '';
}