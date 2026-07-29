import { SourceRange }
  from '@eslint/core';
import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { type TSESLint }
  from '@typescript-eslint/utils';
import { Rule,
         SourceCode }
  from 'eslint';
import { FormatterDefinitionFactory,
         RuleListenerFactory,
         tsFormatterFactory }
  from '../formatter.js';
import { Logger }
  from '../logging.js';

const messages: Record<string, string> =
  { 'add-blank-line-between-statements':
      'Add blank line between statements.' };

const formatterDefinitionFactory: FormatterDefinitionFactory =
  tsFormatterFactory(
    'statement-spacing',
    listenerFactory,
    messages);

export default formatterDefinitionFactory;

function listenerFactory(
    logger: Logger
  ): RuleListenerFactory
{
  const listenerFactory: RuleListenerFactory =
    (
    context: TSESLint.RuleContext<string, readonly unknown[]>
  ): TSESLint.RuleListener =>
  {
    const ruleListener: TSESLint.RuleListener =
      { Program:
          (node): void =>
      {
        const tsProgram =
          node as TSESTree.Program;

        checkStatements(
          tsProgram.body,
          context);
      },
        BlockStatement:
          (node): void =>
      {
        const tsStm =
          node as TSESTree.BlockStatement;

        checkStatements(
          tsStm.body,
          context);
      } };

    return ruleListener;
  };

  return listenerFactory;
}

/**
 * Enforces a blank line between multiline statements.
 */
function checkStatements(
    statements: TSESTree.Statement[],
    context: TSESLint.RuleContext<string, readonly unknown[]>
  ): void
{
  const sourceCode = context.sourceCode;

  const newLine =
    sourceCode.text.includes('\r\n')
    ? '\r\n'
    : '\n';

  for (
    let index = 0;
    index < statements.length - 1;
    index++
  ) {
    const statement = statements[index];

    const statementRange = statement.range;

    if (statementRange === undefined) {
      continue;
    }

    const nextStatement =
      statements[index + 1];

    const nextStatementRange = nextStatement.range;

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
        messageId:
          'add-blank-line-between-statements',
        fix:
          (
          fixer: TSESLint.RuleFixer
        ): TSESLint.RuleFix =>
        {
          const range: SourceRange =
            [ statementRange[1],
              nextStatementRange[0] ];

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
    statement: TSESTree.Statement,
    nextStatement: TSESTree.Statement
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

  if (
    nextStatementStartLine
    === undefined
  ) {
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
    statement: TSESTree.Statement
  ): boolean
{
  const statementLocation = statement.loc;

  if (
    statementLocation === undefined
    || statementLocation === null
  ) {
    return false;
  }

  return statementLocation.start.line < statementLocation.end.line;
}

function getIndentation(
    sourceCode: Readonly<TSESLint.SourceCode>,
    node: TSESTree.Statement
  ): string
{
  const nodeLocation = node.loc;

  if (
    nodeLocation === undefined
    || nodeLocation === null
  ) {
    return '';
  }

  const line =
    sourceCode.lines[nodeLocation.start.line - 1];

  const match =
    /^[ \t]*/.exec(line);

  return match?.[0] ?? '';
}
