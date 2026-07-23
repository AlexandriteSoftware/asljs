import { RuleDefinition,
         RuleDefinitionTypeOptions }
  from '@eslint/core';
import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { Rule }
  from 'eslint';
import { createFormatter }
  from '../formatter.js';
import { FormattingContext }
  from '../formatting-context.js';

type Import =
  | TSESTree.ImportSpecifier
  | TSESTree.ImportDefaultSpecifier
  | TSESTree.ImportNamespaceSpecifier;

const ruleDefinition: RuleDefinition<RuleDefinitionTypeOptions> =
  { meta:
      { fixable: 'code' },
    create:
      (context: Rule.RuleContext): Rule.RuleListener =>
  {
    const listener: Rule.RuleListener =
      { ImportDeclaration:
          (node): void =>
      {
        const tsNode =
          node as unknown as TSESTree.ImportDeclaration;

        const fmtCtx =
          new FormattingContext(
          context.sourceCode
        );

        const sourceCode =
          context.sourceCode.getText(node);

        const replacement =
          formatImportNode(
            tsNode,
            fmtCtx);

        if (sourceCode === replacement) {
          return;
        }

        context.report(
          { node: node,
            message:
              'Use asljs import style.',
            fix:
              (fixer: Rule.RuleFixer): Rule.Fix =>
            {
              return fixer.replaceText(
                node,
                replacement);
            } });
      } };

    return listener;
  } };

export const importFormatter =
  createFormatter(
    'import-style',
    ruleDefinition);

export default importFormatter.eslintRule;

function formatImportNode(
    node: TSESTree.ImportDeclaration,
    context: FormattingContext
  ): string
{
  const code =
    ['import '];

  if (node.specifiers.length === 0) {
    const nodeRange =
      node.range;

    const sourceRange =
      node.source.range;

    if (nodeRange && sourceRange) {
      const importPart =
        context.sourceCode.text.slice(
          nodeRange[0],
          sourceRange[0]);

      if (/^\s*import\s*$/.test(importPart)) {
        code.push(
          node.source?.raw || '');

        code.push(';');
      } else if (/^\s*import[\r\n\s]+from\s*$/.test(importPart)) {
        code.push(
          context.newLine);

        code.push('  from ');

        code.push(
          node.source?.raw || '');

        code.push(';');
      } else if (
        /^\s*import[\r\n\s]*\{[\r\n\s]*\}[\r\n\s]*from\s*$/.test(importPart)
      ) {
        code.push('{ }');

        code.push(
          context.newLine);

        code.push('  from ');

        code.push(
          node.source?.raw || '');

        code.push(';');
      } else {
        code.push(
          context.newLine);

        code.push(
          formatSource(
            node.source,
            context));
      }
    } else {
      code.push('{ }');

      code.push(
        formatSource(
          node.source,
          context));
    }
  } else {
    let index = 0;
    let first = true;

    while (index < node.specifiers.length) {
      if (first) {
        first = false;
      } else {
        code.push(',');

        code.push(
          context.newLine);

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
            context));

        index += importSpecifierGroup.length;
      }
    }

    code.push(
      formatSource(
        node.source,
        context));
  }

  return code.join('');
}

function getImportSpecifierGroup(
    specifiers: Import[],
    startAt: number
  ): TSESTree.ImportSpecifier[]
{
  const group = [];

  for (let index = startAt; index < specifiers.length; index++) {
    const specifier =
      specifiers[index];

    if (specifier.type !== 'ImportSpecifier') {
      break;
    }

    group.push(specifier);
  }

  return group;
}

function formatImportSpecifierGroup(
    importSpecifierGroup: TSESTree.ImportSpecifier[],
    formattingContext: FormattingContext
  ): string
{
  const code = [];

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

    const importKind =
      specifier.importKind;

    const parent =
      specifier.parent;

    const isType =
      importKind === 'type'
      || (parent?.type === 'ImportDeclaration' && parent.importKind === 'type');

    if (isType) {
      code.push('type ');
    }

    if (specifier.imported.type === 'Identifier') {
      const importedIdentifier =
        specifier.imported;

      if (importedIdentifier.name === specifier.local.name) {
        code.push(
          importedIdentifier.name);
      } else {
        code.push(
          `${importedIdentifier.name} as ${specifier.local.name}`);
      }
    } else if (specifier.imported.type === 'Literal') {
      const importedLiteral =
        specifier.imported;

      code.push(
        `${importedLiteral.raw} as ${specifier.local.name}`);
    } else {
      throw new Error(`Unsupported import specifier type.`);
    }
  }

  code.push(' }');

  return code.join('');
}

function formatSource(
    source: TSESTree.StringLiteral,
    formattingContext: FormattingContext
  ): string
{
  return formattingContext.newLine + '  from ' + source.raw + ';';
}

/**
 * Formats `ImportDefaultSpecifier` and `ImportNamespaceSpecifier`.
 * `ImportSpecifier` is handled by `formatImportSpecifierGroup`.
 */
function formatSpecifier(
    specifier: Import
  ): string
{
  switch (specifier.type) {
    case 'ImportDefaultSpecifier':
      return specifier.local.name;

    case 'ImportNamespaceSpecifier':
      return `* as ${specifier.local.name}`;

    default:
      throw new Error(`Unsupported import specifier type.`);
  }
}
