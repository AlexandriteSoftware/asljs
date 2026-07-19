import { RuleDefinition,
         RuleDefinitionTypeOptions }
  from '@eslint/core';
import tsParser
  from '@typescript-eslint/parser';
import { ESLint,
         Linter }
  from 'eslint';
import path
  from 'node:path';

export type SupportedFileType = 'javascript' | 'typescript';

export interface FormatterDefinition
{
  name: string;
  eslintRule: RuleDefinition<RuleDefinitionTypeOptions>;
}

export function createFormatter(
    name: string,
    eslintRule: RuleDefinition<RuleDefinitionTypeOptions>
  ): FormatterDefinition
{
  return {
    name,
    eslintRule
  };
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

  const rules =
    Object
    .fromEntries(
      formatters.map(
        formatter => [formatter.name, formatter.eslintRule]
      )
    );

  const enabledRules =
    Object
    .fromEntries(
      formatters.map(
        formatter => [`sfmt/${formatter.name}`, 'error' as const]
      )
    );

  const absoluteFilePath =
    path.resolve(filePath);

  const eslintCwd =
    path.dirname(
      absoluteFilePath);

  const eslintFilePath =
    path.basename(
      absoluteFilePath);

  const overrideConfig: Linter.Config[] =
    [
    {
      files: getFilePatterns(fileType),
      languageOptions: getLanguageOptions(fileType),
      plugins: { sfmt: { rules } },
      rules: enabledRules
    }
  ];

  const eslint =
    new ESLint({
    cwd: eslintCwd,
    overrideConfigFile: true,
    fix: true,
    ignore: false,
    overrideConfig
  });

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

  if (extension === '.js' || extension === '.mjs' || extension === '.cjs') {
    return 'javascript';
  }

  if (extension === '.ts' || extension === '.mts' || extension === '.cts') {
    return 'typescript';
  }

  return null;
}

function getLanguageOptions(
    fileType: SupportedFileType
  ): Linter.LanguageOptions
{
  if (fileType === 'typescript') {
    return {
      parser: tsParser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' }
    };
  }

  return {
    ecmaVersion: 'latest',
    sourceType: 'module'
  };
}

function getFilePatterns(
    fileType: SupportedFileType
  ): string[]
{
  if (fileType === 'typescript') {
    return ['**/*.{ts,mts,cts}'];
  }

  return ['**/*.{js,mjs,cjs}'];
}
