export default {
  meta: { fixable: 'code' },
  create(context) {
    return {
      ImportDeclaration(node) {
        const newLine =
          context.sourceCode.text.includes('\r\n')
            ? '\r\n'
            : '\n';

        const formattingContext =
          { newLine };

        const sourceCode =
          context.sourceCode.getText(node);

        const replacement =
          formatImportNode(
            node,
            context,
            formattingContext);

        if (sourceCode === replacement) {
          return;
        }

        context.report({
          node,
          message: 'Use asljs import style.',
          fix(fixer) {
            return fixer.replaceText(
              node,
              replacement);
          }
        });
      }
    };
  }
};

function formatImportNode(
  node,
  context,
  formattingContext)
{
  const code =
    [ 'import ' ];

  const moduleName =
    node.source.raw;

  if (node.specifiers.length === 0) {
    code.push('{ }');
  } else {
    let index = 0;
    let first = true;
    while (index < node.specifiers.length) {
      if (first) {
        first = false;
      } else {
        code.push(',');
        code.push(formattingContext.newLine);
        code.push('       ');
      }

      const importSpecifierGroup =
        getImportSpecifierGroup(
          node.specifiers,
          index);

      if (importSpecifierGroup.length === 0) {
        code.push(
          formatSpecifier(
            node.specifiers[index]));
        index++;
      } else {
        code.push(
          formatImportSpecifierGroup(
            importSpecifierGroup,
            formattingContext));
        index += importSpecifierGroup.length;
      }
    }
  }

  code.push(formattingContext.newLine);
  code.push('  from ');
  code.push(moduleName);
  code.push(';');

  return code.join('');
}

function getImportSpecifierGroup(
  specifiers,
  startAt)
{
  const group = [];

  for (let index = startAt;
       index < specifiers.length;
       index++)
  {
    const specifier = specifiers[index];

    if (specifier.type !== 'ImportSpecifier') {
      break;
    }

    group.push(specifier);
  }

  return group;
}

function formatImportSpecifierGroup(
  importSpecifierGroup,
  formattingContext)
{
  const code = [];

  let firstImportSpecifier = true;
  for (const specifier of importSpecifierGroup) {
    if (firstImportSpecifier) {
      firstImportSpecifier = false;
      code.push('{ ');
    } else {
      code.push(',');
      code.push(formattingContext.newLine);
      code.push('         ');
    }

    if (specifier.imported.name === specifier.local.name) {
      code.push(specifier.imported.name);
    } else {
      code.push(`${specifier.imported.name} as ${specifier.local.name}`);
    }
  }

  code.push(' }');

  return code.join('');
}

function formatSpecifier(
  specifier)
{
  switch (specifier.type) {
    case 'ImportDefaultSpecifier':
      return specifier.local.name;
    case 'ImportNamespaceSpecifier':
      return `* as ${specifier.local.name}`;
    default:
      throw new Error(
        `Unsupported import specifier type: ${specifier.type}`);
  }
}