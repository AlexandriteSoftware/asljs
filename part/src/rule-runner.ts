import path
  from 'node:path';
import { spawn }
  from 'node:child_process';
import { access }
  from 'node:fs/promises';
import { pathToFileURL }
  from 'node:url';
import { MarkdownDocumentProvider }
  from './providers/markdown-document-provider.js';
import { ArtefactDataProvider }
  from './providers/artefact-data-provider.js';
import { Artefact }
  from './artefact.js';
import { ArtefactDefinition }
  from './artefact-definition.js';
import { ArtefactDefinitionRule }
  from './artefact-definition.js';
import { ArtefactProvider }
  from './providers/artefact-provider.js';
import { DefinitionProvider }
  from './providers/definition-provider.js';
import { RuleValidationFunction,
         RuleValidationContext }
  from './rule-validation-function.js';
import { Logger }
  from './logging.js';

export interface RuleRunResult {
  rule: ArtefactDefinitionRule;
  result: 'Ok' | 'Fail';
  message: string;
}

export class RuleRunner
{
  private logger: Logger;
  private definitionProvider: DefinitionProvider;
  private artefactProvider: ArtefactProvider;
  private markdownDocuments: MarkdownDocumentProvider;
  private artafactDataProvider: ArtefactDataProvider;
  private rootPath: string;

  constructor(
    logger: Logger,
    definitionProvider: DefinitionProvider,
    artefactProvider: ArtefactProvider)
  {
    this.logger = logger;

    if (definitionProvider === undefined) {
      throw new Error(
        'Missing definition provider.');
    }

    this.definitionProvider =
      definitionProvider;

    if (artefactProvider === undefined) {
      throw new Error(
        'Missing artefact provider.');
    }

    this.artefactProvider =
      artefactProvider;

    this.markdownDocuments =
      new MarkdownDocumentProvider();

    this.artafactDataProvider =
      new ArtefactDataProvider(
        logger,
        definitionProvider.definitionsPath);

    this.rootPath =
      artefactProvider.rootPath;
  }

  async runRule(
      rule: ArtefactDefinitionRule,
      artefact: Artefact
    ): Promise<RuleRunResult>
  {
    const ctx =
      `RuleRunner.runRule(${rule.name}, ${artefact.name}): `;

    this.logger.trace(
      `${ctx}${rule.name} for artefact ${artefact.path}`);

    if (!rule.path)
    {
      this.logger.trace(
        `${ctx}rule file is missing`);

      return {
        rule,
        result: 'Fail',
        message: 'Missing rule file.',
      };
    }

    try {
      await access(
        rule.path);
    }
    catch {
      this.logger.trace(
        `${ctx}cannot access rule file`);

      return {
        rule,
        result: 'Fail',
        message: 'Cannot access rule file.',
      };
    }

    const ruleFileExtension =
      path.extname(
        rule.path);

    let result;

    if (ruleFileExtension.toLowerCase() === '.js') {
      result =
        await this.runJavaScriptRule(
          rule,
          artefact);
    } else {
      result =
        await this.runExecutableRule(
          rule,
          artefact);
    }

    if (result.result === 'Fail') {
      this.logger.trace(
        `${ctx}${result.message}`);
    }

    return result;
  }

  async runRules(
      definition: ArtefactDefinition,
      artefact: Artefact
    ): Promise<RuleRunResult[]>
  {
    const results: RuleRunResult[] = [];

    for (const rule of definition.rules) {
      const result =
        await this.runRule(
          rule,
          artefact);

      results.push(result);
    }

    return results;
  }

  async runJavaScriptRule(
      rule: ArtefactDefinitionRule,
      artefact: Artefact
    ): Promise<RuleRunResult>
  {
    if (!rule.path) {
      throw new Error(
        `Missing rule file for ${rule.name}.`);
    }

    const importUrl =
      pathToFileURL(
        rule.path);

    try {
      const validatorModule =
        await import(
          importUrl.href);

      const validateFunction: RuleValidationFunction =
        validatorModule.validate;

      if (typeof validateFunction !== 'function') {
        throw new Error(
          'Rule module must export validate.');
      }

      let result = null;

      const validationContext: RuleValidationContext =
        { logger: this.logger,
          rootPath: this.rootPath,
          definitions: this.definitionProvider,
          artefacts: this.artefactProvider,
          artefactData: this.artafactDataProvider,
          markdownDocuments: this.markdownDocuments };

      try {
        await validateFunction(
          artefact,
          validationContext);
      } catch (error) {
        result =
          error
          ?? new Error('Unknown error');
      }

      if (result !== null) {
        return {
          rule,
          result: 'Fail',
          message: this.formatError(result)
        };
      }

      return {
        rule,
        result: 'Ok',
        message: '',
      };
    }
    catch (error) {
      return {
        rule,
        result: 'Fail',
        message: this.formatError(error),
      };
    }
  }

  async runExecutableRule(
      rule: ArtefactDefinitionRule,
      artefact: Artefact
    ): Promise<RuleRunResult>
  {
    if (!rule.path) {
      throw new Error(
        `Missing rule file for ${rule.name}.`);
    }

    const ruleFilePath =
      rule.path;

    return new Promise((resolve) => {
      const child =
        spawn(
          ruleFilePath,
          [artefact.path],
          {
            cwd: path.dirname(ruleFilePath),
            env: process.env,
            stdio: ['pipe', 'pipe', 'pipe'],
          });

      let stderr = '';

      child.stdin.write(
        `${JSON.stringify(artefact)}\n`);

      child.stdin.end();

      child.stderr.on(
        'data',
        (chunk) => {
          stderr += String(chunk);
        });

      child.on(
        'error',
        (error) => {
          resolve(
            {
              rule,
              result: 'Fail',
              message: this.formatError(error),
            });
        });

      child.on(
        'close',
        (code) => {
          const result =
            code === 0
              ? 'Ok'
              : 'Fail';

          const message =
            code === 0
              ? ''
              : stderr.trim() || rule.description;

          resolve(
            {
              rule,
              result,
              message
            });
        });
    });
  }

  formatError(
      error: any
    ): string
  {
    if (error instanceof Error) {
      return error.message.replaceAll(
        '\n',
        ' ');
    }

    return String(error);
  }
}