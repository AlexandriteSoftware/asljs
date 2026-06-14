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
      },
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

    if (!statementIsMultiline(statement)) {
      continue;
    }

    const linesBetween =
      nextStatement.loc.start.line
      - statement.loc.end.line;

    if (linesBetween >= 2) {
      continue;
    }

    context.report(
      {
        node: nextStatement,
        message:
          'Add a blank line after multiline statement.',

        fix(fixer) {
          return fixer.insertTextBefore(
            nextStatement,
            newLine);
        },
      });
  }
}

function statementIsMultiline(
  statement)
{
  return statement.loc.start.line
         < statement.loc.end.line;
}