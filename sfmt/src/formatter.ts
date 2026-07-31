import { type TSESLint }
  from '@typescript-eslint/utils';
import path
  from 'node:path';
import { Logger }
  from './logging.js';

export type SupportedFileType =
  | 'javascript'
  | 'typescript';

export interface FormatterDefinition
{
  name: string;
  eslintRule: TSESLint.RuleModule<string>;
}

export type RuleListenerFactory =
  (
    context: TSESLint.RuleContext<string, readonly unknown[]>
  ) =>
    TSESLint.RuleListener;

export type RuleListenerFactoryMaker =
  (
    logger: Logger
  ) =>
    RuleListenerFactory;

export type FormatterDefinitionFactory =
  (
    logger: Logger
  ) =>
    FormatterDefinition;

export function tsFormatterFactory(
    name: string,
    ruleListenerCreateFn: RuleListenerFactoryMaker,
    messages: Record<string, string>
  ): FormatterDefinitionFactory
{
  const fn =
    (
        logger: Logger
      ): FormatterDefinition =>
    {
    const meta: TSESLint.RuleMetaData<string> =
      { type: 'layout',
        fixable: 'code',
        schema: [ ],
        messages: messages };

    const create: RuleListenerFactory =
      ruleListenerCreateFn(logger);

    const eslintRule: TSESLint.RuleModule<string> =
      { meta,
        create };

    const formatter: FormatterDefinition =
      { name,
        eslintRule };

    return formatter;
  };

  return fn;
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
