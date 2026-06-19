/**
 * @typedef
 *   { import('eslint')
 *       .JSRuleDefinition }
 *   JSRuleDefinition
 * @typedef
 *     { import('eslint')
 *        .Rule.RuleListener }
 *  RuleListener
 * @typedef
 *   { import('eslint')
 *       .Rule.RuleContext }
 *  RuleContext
 * @typedef
 *   { import('estree')
 *       .ImportDeclaration }
 *   ImportDeclaration
 * @typedef
 *   { import('estree')
 *       .ImportSpecifier }
 *   ImportSpecifier
 * @typedef
 *   { import('estree')
 *       .ImportDefaultSpecifier }
 *   ImportDefaultSpecifier
 * @typedef
 *   { import('estree')
 *       .ImportNamespaceSpecifier }
 *   ImportNamespaceSpecifier
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
 * @typedef
 *   { ImportSpecifier
 *     | ImportDefaultSpecifier
 *     | ImportNamespaceSpecifier }
 * Import
 */

/**
 * @typedef {object} FormattingContext
 * @property {string} newLine
 */

/** @type {JSRuleDefinition} */
export default {
  meta: { fixable: 'code' },
  create(
    context)
  {
    /** @type {RuleListener} */
    return {
      ImportDeclaration(
        node)
      {
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

        context.report(
          {
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

/**
 * 
 * @param {ImportDeclaration} node 
 * @param {RuleContext} context 
 * @param {FormattingContext} formattingContext 
 * @returns {string}
 */
function formatImportNode(
  node,
  context,
  formattingContext)
{
  const code =
    [ 'import ' ];

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

        code.push(
          formattingContext.newLine);

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

  code.push(
    formatSource(
      node.source,
      formattingContext));

  return code.join('');
}

/**
 * 
 * @param {Import[]} specifiers 
 * @param {number} startAt 
 * @returns {ImportSpecifier[]}
 */
function getImportSpecifierGroup(
  specifiers,
  startAt)
{
  const group =
    [];

  for (let index = startAt;
       index < specifiers.length;
       index++)
  {
    const specifier =
      specifiers[index];

    if (specifier.type !== 'ImportSpecifier') {
      break;
    }

    group.push(specifier);
  }

  return group;
}

/**
 * 
 * @param {ImportSpecifier[]} importSpecifierGroup 
 * @param {FormattingContext} formattingContext 
 * @returns {string}
 */
function formatImportSpecifierGroup(
  importSpecifierGroup,
  formattingContext)
{
  const code =
    [];

  let firstImportSpecifier = true;

  for (const specifier of importSpecifierGroup) {
    if (firstImportSpecifier) {
      firstImportSpecifier = false;
      code.push('{ ');
    } else {
      code.push(',');

      code.push(
        formattingContext.newLine);

      code.push('         ');
    }

    if (specifier.imported.type === 'Identifier') {
      const importedIdentifier =
        /** @type {Identifier} */ (specifier.imported);

      if (importedIdentifier.name === specifier.local.name) {
        code.push(
          importedIdentifier.name);
      } else {
        code.push(
          `${importedIdentifier.name} as ${specifier.local.name}`);
      }
    } else if (specifier.imported.type === 'Literal') {
      const importedLiteral =
        /** @type {Literal} */ (specifier.imported);
      
      code.push(
        `${importedLiteral.raw} as ${specifier.local.name}`);
    } else {
      throw new Error(
        `Unsupported import specifier type.`);
    }
  }

  code.push(' }');

  return code.join('');
}

/**
 * @param {Literal} source 
 * @param {FormattingContext} formattingContext 
 * @returns {string}
 */
function formatSource(
  source,
  formattingContext)
{
  return formattingContext.newLine
    + '  from '
    + source.raw
    + ';';
}

/**
 * Formats `ImportDefaultSpecifier` and `ImportNamespaceSpecifier`.
 * `ImportSpecifier` is handled by `formatImportSpecifierGroup`.
 * 
 * @param {Import} specifier
 */
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
        `Unsupported import specifier type.`);
  }
}