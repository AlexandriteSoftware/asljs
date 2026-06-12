export default {
  meta: {
    type: 'layout',
    fixable: 'code',
    schema: [],
  },

  create(context) {
    return {
      FunctionDeclaration(node) {
        const newLine =
          context.sourceCode.text.includes('\r\n')
            ? '\r\n'
            : '\n';

        const formattingContext =
          { newLine };

        const replacement =
          buildFunctionDeclaration(
            node,
            context,
            formattingContext);

        const currentText =
          context.sourceCode.getText(node);

        if (currentText === replacement) {
          return;
        }

        context.report({
          node,
          message:
            'Use asljs function declaration style.',

          fix(fixer) {
            return fixer.replaceText(
              node,
              replacement);
          },
        });
      },
    };
  },
};

function buildFunctionDeclaration(
  node,
  context,
  formattingContext)
{
  const name =
    node.id?.name ?? '';

  const body =
    node.body;

  const parameters =
    node.params.map(
      parameter =>
        context.sourceCode.getText(parameter));

  const code =
    [ 'function ' ];

  if (name) {
    code.push(name);
  }

  code.push('(');

  if (parameters.length === 0) {
    code.push(')');
  } else {
    code.push(formattingContext.newLine);

    for (let index = 0;
          index < parameters.length;
          index++)
    {
      code.push(
        `  ${parameters[index]}`);
      if (index < parameters.length - 1) {
        code.push(',');
      }
      if (index < parameters.length - 1) {
        code.push(formattingContext.newLine);
      }
    }

    code.push(')');
  }

  code.push(formattingContext.newLine);

  code.push('{');

  if (body
      && body.body
      && body.body.length > 0)
  {
    for (const statement of body.body) {
      code.push(formattingContext.newLine);
      code.push(
        `  ${context.sourceCode.getText(statement)}`);
    }
  }

  code.push(formattingContext.newLine);

  code.push('}');

  return code.join('');
}