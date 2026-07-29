import { ESLint,
         Linter }
  from 'eslint';
import { glob }
  from 'glob';
import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import { Environment }
  from './environment.js';
import baseConfig
  from './eslint-config.js';
import { FormatterDefinition,
         SupportedFileType }
  from './formatter.js';
import { createPinoLoggerProvider }
  from './logging.js';
import tsArrayExpressionFormatterFactory
  from './ts-style-rules/array-expression.js';
import tsAssignmentExpressionFormatterFactory
  from './ts-style-rules/assignment-expression.js';
import tsCallExpressionFormatterFactory
  from './ts-style-rules/call-expression.js';
import tsConditionalExpressionFormatterFactory
  from './ts-style-rules/conditional-expression.js';
import tsForStatementFormatterFactory
  from './ts-style-rules/for-statement.js';
import tsFunctionDeclarationFormatterFactory
  from './ts-style-rules/function-declaration.js';
import tsIfStatementFormatterFactory
  from './ts-style-rules/if-statement.js';
import tsImportDeclarationFormatterFactory
  from './ts-style-rules/import-declaration.js';
import tsNewExpressionFormatterFactory
  from './ts-style-rules/new-expression.js';
import tsObjectExpressionFormatterFactory
  from './ts-style-rules/object-expression.js';
import tsStatementSpacingFormatterFactory
  from './ts-style-rules/statement-spacing.js';
import tsVariableDeclarationFormatterFactory
  from './ts-style-rules/variable-declaration.js';

export async function format(
    environment: Environment,
    ...args: string[]
  ): Promise<void>
{
  const pattern =
    args.length > 0
    ? args[0]
    : '**/*.{ts,mts,cts,js,mjs,cjs}';

  const paths =
    await glob(
      pattern,
      { absolute: true,
        cwd: environment.cwd,
        dot: true,
        nodir: true,
        ignore:
          [ '**/node_modules/**',
            '**/dist/**',
            '**/build/**' ] });

  for (const path of paths) {
    await formatFile(path);
  }
}

export async function formatFile(
    path: string
  ): Promise<void>
{
  const text =
    await fs.readFile(
      path,
      'utf8');

  const formatted =
    await formatText(
      path,
      text);

  if (formatted === text) {
    return;
  }

  await fs.writeFile(
    path,
    formatted,
    'utf8');
}

export async function formatText(
    path: string,
    text: string,
    formatters: FormatterDefinition[] | null = null
  ): Promise<string>
{
  const normalised =
    normaliseWhitespace(text);

  return applyFormatters(
    normalised,
    path,
    formatters ?? getFormattersForPath(path));
}

function getFormattersForPath(
    path: string
  ): FormatterDefinition[]
{
  const loggerProvider =
    createPinoLoggerProvider();

  const fileType =
    getFileType(path);

  switch (fileType) {
    case 'javascript':
      return [ ];

    case 'typescript':
      const tsStyleFormatters: FormatterDefinition[] =
        [ tsImportDeclarationFormatterFactory(
          loggerProvider.getLogger(
            'import-declaration')),
          tsAssignmentExpressionFormatterFactory(
            loggerProvider.getLogger(
              'assignment-expression')),
          tsFunctionDeclarationFormatterFactory(
            loggerProvider.getLogger(
              'function-declaration')),
          tsForStatementFormatterFactory(
            loggerProvider.getLogger(
              'for-statement')),
          tsIfStatementFormatterFactory(
            loggerProvider.getLogger(
              'if-statement')),
          tsConditionalExpressionFormatterFactory(
            loggerProvider.getLogger(
              'conditional-expression')),
          tsCallExpressionFormatterFactory(
            loggerProvider.getLogger(
              'call-expression')),
          tsVariableDeclarationFormatterFactory(
            loggerProvider.getLogger(
              'variable-declaration')),
          tsStatementSpacingFormatterFactory(
            loggerProvider.getLogger(
              'statement-spacing')),
          tsNewExpressionFormatterFactory(
            loggerProvider.getLogger(
              'new-expression')),
          tsObjectExpressionFormatterFactory(
            loggerProvider.getLogger(
              'object-expression')),
          tsArrayExpressionFormatterFactory(
            loggerProvider.getLogger(
              'array-expression')) ];

      return tsStyleFormatters;

    default:
      return [ ];
  }
}

function normaliseWhitespace(
    text: string
  ): string
{
  const formatters =
    [ normaliseLineEndings,
      normaliseTrailingWhitespace,
      normaliseFinalNewline,
      normaliseIndentationCharacters ];

  return formatters.reduce(
    (text: string, formatter: (text: string) => string): string =>
    {
      return formatter(text);
    },
    text);
}

function normaliseLineEndings(
    text: string
  ): string
{
  return text.replace(
    /\r\n/g,
    '\n');
}

function normaliseTrailingWhitespace(
    text: string
  ): string
{
  return text.replace(
    /[ \t]+$/gm,
    '');
}

function normaliseFinalNewline(
    text: string
  ): string
{
  if (text.length === 0) {
    return '\n';
  }

  if (text.endsWith('\n')) {
    return text;
  }

  return `${text}\n`;
}

function normaliseIndentationCharacters(
    text: string
  ): string
{
  return text.replace(
    /\t/g,
    '  ');
}

export async function applyFormatters(
    text: string,
    filePath: string,
    formatters: FormatterDefinition[]
  ): Promise<string>
{
  if (formatters.length === 0) {
    return text;
  }

  const fileType =
    getFileType(filePath);

  if (fileType === null) {
    return text;
  }

  const absoluteFilePath =
    path.resolve(filePath);

  const eslintCwd =
    path.dirname(
      absoluteFilePath);

  const eslintFilePath =
    path.basename(
      absoluteFilePath);

  const overrideConfig: Linter.Config[] =
    [ ...baseConfig ];

  const eslint =
    new ESLint(
      { cwd: eslintCwd,
        overrideConfigFile: true,
        fix: true,
        ignore: false,
        overrideConfig: overrideConfig });

  const [result] =
    await eslint.lintText(
      text,
      { filePath: eslintFilePath });

  return result?.output ?? text;
}

export function getFileType(
    filePath: string
  ): SupportedFileType | null
{
  const extension =
    path.extname(filePath).toLowerCase();

  if (
    extension === '.js'
    || extension === '.mjs'
    || extension === '.cjs'
  ) {
    return 'javascript';
  }

  if (
    extension === '.ts'
    || extension === '.mts'
    || extension === '.cts'
  ) {
    return 'typescript';
  }

  return null;
}
