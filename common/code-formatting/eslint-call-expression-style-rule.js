const LONG_IDENTIFIER_LENGTH = 15;

export default {
  meta: {
    type: 'layout',
    fixable: 'code',
    schema: [],
  },

  create(context) {
    return {
      CallExpression(node) {
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
            fix(fixer) {
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
      },
    };
  },
};

/**
 * Checks that:
 * 
 * - complex function call expressions are on a separate line (complex is:
 *   single variable that is longer than 15 characters or not a single variable)
 * - multiple function call parameters are on separate lines
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

  if (argumentsList.length === 1) {
    const argument =
      argumentsList[0];

    const isSimpleIdentifier =
      argument.type === 'Identifier';

    const isShortIdentifier =
      isSimpleIdentifier
      && argument.name.length < LONG_IDENTIFIER_LENGTH;

    // Keep existing layout for:
    // foo(shortIdentifier)
    if (isShortIdentifier) {
      return true;
    }

    // Complex single argument must be on its own line.
    const openingParen =
      context.sourceCode.getTokenAfter(
        node.callee,
        token => token.value === '(');

    return openingParen.loc.end.line
           < argument.loc.start.line;
  }

  // Multiple arguments: each argument must start
  // on a separate line.
  for (let index = 1;
        index < argumentsList.length;
        index++)
  {
    const previousArgument =
      argumentsList[index - 1];

    const currentArgument =
      argumentsList[index];

    if (
      previousArgument.loc.end.line
      === currentArgument.loc.start.line
    ) {
      return false;
    }
  }

  return true;
}

function buildCallExpression(
  node,
  sourceCode,
  formattingContext)
{
  const code =
    [ ];

  const callee =
    sourceCode.getText(node.callee);

  const argumentsText =
    node.arguments.map(
      argument =>
        sourceCode.getText(argument));

  code.push(callee);
  code.push('(');

  const indentation =
    getIndentation(
      sourceCode,
      node);

  if (argumentsText.length === 1) {
    if (argumentsText[0].length > LONG_IDENTIFIER_LENGTH
        || argumentsText[0].includes('\n'))
    {
      code.push(
        formattingContext.newLine);
      code.push(indentation);
      code.push('  ');
      code.push(argumentsText[0]);
    } else {
      code.push(argumentsText[0]);
    }
  } else if (argumentsText.length > 1) {
    for (let index = 0;
         index < argumentsText.length;
         index++)
    {
      const argument =
        argumentsText[index];

      if (index > 0) {
        code.push(',');
      }

      code.push(
        formattingContext.newLine);
      code.push(indentation);
      code.push('  ');
      code.push(argument);
    }
  }

  code.push(')');

  return code.join('');
}

function getIndentation(
  sourceCode,
  node)
{
  const openingParen =
    sourceCode.getTokenAfter(
      node.callee,
      token => token.value === '(');

  const line =
    sourceCode.lines[
      openingParen.loc.start.line - 1];

  const match =
    /^[ \t]*/.exec(line);

  return match?.[0] ?? '';
}