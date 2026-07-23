import { RuleDefinition,
         RuleDefinitionTypeOptions,
         SourceRange }
  from '@eslint/core';
import { AST,
         Rule,
         SourceCode }
  from 'eslint';
import { BlockStatement,
         Node }
  from 'estree';
import { createFormatter }
  from '../formatter.js';

const ruleDefinition: RuleDefinition<RuleDefinitionTypeOptions> =
  { meta:
      { type: 'layout',
        fixable: 'whitespace',
        schema: [] },
    create:
      (context: Rule.RuleContext): Rule.RuleListener =>
  {
    const listener: Rule.RuleListener =
      { Program:
          (node: AST.Program): void =>
      {
        checkStatements(
          node.body,
          context);
      },
        BlockStatement:
          (node: BlockStatement): void =>
      {
        checkStatements(
          node.body,
          context);
      } };

    return listener;
  } };

export const statementSpacingFormatter =
  createFormatter(
    'statement-spacing',
    ruleDefinition);

export default statementSpacingFormatter.eslintRule;

/**
 * Enforces a blank line between multiline statements.
 */
function checkStatements(
    statements: Node[],
    context: Rule.RuleContext
  ): void
{
  const sourceCode =
    context.sourceCode;

  const newLine =
    sourceCode.text.includes('\r\n')
    ? '\r\n'
    : '\n';

  for (let index = 0; index < statements.length - 1; index++) {
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
      { node: nextStatement,
        message:
          'Add a blank line between statements.',
        fix:
          (fixer: Rule.RuleFixer): Rule.Fix =>
        {
          const range: SourceRange =
            [statementRange[1], nextStatementRange[0]];

          const nextStatementIndentation =
            getIndentation(
              sourceCode,
              nextStatement);

          return fixer.replaceTextRange(
            range,
            newLine + newLine + nextStatementIndentation);
        } });
  }
}

function shouldSpace(
    statement: Node,
    nextStatement: Node
  ): boolean
{
  if (
    statement.type === 'ImportDeclaration'
    || nextStatement.type === 'ImportDeclaration'
  ) {
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
    nextStatementStartLine - statementEndLine;

  return linesBetween < 2;
}

function statementIsMultiline(
    statement: Node
  ): boolean
{
  const statementLocation =
    statement.loc;

  if (statementLocation === undefined || statementLocation === null) {
    return false;
  }

  return statementLocation.start.line < statementLocation.end.line;
}

function getIndentation(
    sourceCode: SourceCode,
    node: Node
  ): string
{
  const nodeLocation =
    node.loc;

  if (nodeLocation === undefined || nodeLocation === null) {
    return '';
  }

  const line =
    sourceCode.lines[nodeLocation.start.line - 1];

  const match =
    /^[ \t]*/.exec(line);

  return match?.[0] ?? '';
}
