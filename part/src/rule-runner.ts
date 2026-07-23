import { spawn }
  from 'node:child_process';
import { access }
  from 'node:fs/promises';
import path
  from 'node:path';
import { pathToFileURL }
  from 'node:url';
import { Logger }
  from './logging/logging.js';
import { ArtefactDefinitionRule }
  from './model/artefact-definition-rule.js';
import { ArtefactDefinition }
  from './model/artefact-definition.js';
import { Artefact }
  from './model/artefact.js';
import { Providers }
  from './providers/providers.js';
import { RuleValidationContext,
         RuleValidationFunction }
  from './rule-validation-function.js';

export interface RuleRunResult
{
  rule: ArtefactDefinitionRule;
  result: 'Ok' | 'Fail';
  message: string;
}

export class RuleRunner
{
  constructor(
    private readonly logger: Logger,
    private readonly providers: Providers
  )
  {
  }

  async runRule(
    rule: ArtefactDefinitionRule,
    artefact: Artefact
  ): Promise<RuleRunResult>
  {
    this.logger.trace(
      'runRule(%s, %s) { start }',
      rule.name,
      artefact.name);

    const ruleFile =
      await this.resolveRuleFile(
        rule);

    const rulePath =
      ruleFile?.path;

    if (!rulePath) {
      this.logger.trace(
        'runRule(%s, %s): rule file is missing',
        rule.name,
        artefact.name);

      return { rule,
               result: 'Fail',
               message:
                 'Missing rule file.' };
    }

    try {
      await access(
        rulePath);
    } catch {
      this.logger.trace(
        'runRule(%s, %s): cannot access rule file',
        rule.name,
        artefact.name);

      return { rule,
               result: 'Fail',
               message:
                 'Cannot access rule file.' };
    }

    const ruleFileExtension =
      path.extname(
        rulePath);

    let result;

    if (ruleFileExtension.toLowerCase() === '.js') {
      result = await this.runJavaScriptRule(
        rule,
        artefact);
    } else {
      result = await this.runExecutableRule(
        rule,
        artefact);
    }

    if (result.result === 'Fail') {
      this.logger.trace(
        'runRule(%s, %s): %s',
        rule.name,
        artefact.name,
        result.message);
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
    const ruleFile =
      await this.resolveRuleFile(
        rule);

    if (!ruleFile?.path) {
      throw new Error(
        `Missing rule file for ${rule.name}.`
      );
    }

    const importUrl =
      pathToFileURL(
        ruleFile?.path);

    try {
      const validatorModule =
        await import(
        importUrl.href
      );

      const validateFunction: RuleValidationFunction =
        validatorModule.validate;

      if (typeof validateFunction !== 'function') {
        throw new Error(
          'Rule module must export validate.'
        );
      }

      let result = null;

      const validationContext: RuleValidationContext =
        { logger:
            this.logger,
          rootPath:
            this.providers.projectPath,
          definitions:
            this.providers.artefactDefinitionProvider,
          artefacts:
            this.providers.artefactProvider,
          artefactData:
            this.providers.artefactDataProvider,
          markdownDocuments:
            this.providers.markdownDocumentProvider,
          rules:
            this.providers.artefactDefinitionRuleProvider };

      try {
        await validateFunction(
          artefact,
          validationContext);
      } catch (error) {
        result = error
          ?? new Error('Unknown error');
      }

      if (result !== null) {
        return { rule,
                 result: 'Fail',
                 message:
                   this.formatError(result) };
      }

      return { rule,
               result: 'Ok',
               message: '' };
    } catch (error) {
      return { rule,
               result: 'Fail',
               message:
                 this.formatError(error) };
    }
  }

  async runExecutableRule(
    rule: ArtefactDefinitionRule,
    artefact: Artefact
  ): Promise<RuleRunResult>
  {
    const ruleFile =
      await this.resolveRuleFile(
        rule);

    if (!ruleFile?.path) {
      throw new Error(
        `Missing rule file for ${rule.name}.`
      );
    }

    const ruleFilePath =
      ruleFile.path;

    return new Promise(resolve =>
    {
      const child =
        spawn(
          ruleFilePath,
          [artefact.path],
          { cwd:
              path.dirname(ruleFilePath),
            env:
              process.env,
            stdio:
              ['pipe', 'pipe', 'pipe'] });

      let stderr = '';

      child.stdin.write(
        `${JSON.stringify(artefact)}\n`);

      child.stdin.end();

      child.stderr.on(
        'data',
        chunk =>
        {
          stderr += String(chunk);
        });

      child.on(
        'error',
        error =>
        {
          resolve(
            { rule,
              result: 'Fail',
              message:
                this.formatError(error) });
        });

      child.on(
        'close',
        code =>
        {
          const result =
            code === 0
            ? 'Ok'
            : 'Fail';

          const message =
            code === 0
            ? ''
            : stderr.trim() || rule.content;

          resolve(
            { rule,
              result,
              message });
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

  private async resolveRuleFile(
    rule: ArtefactDefinitionRule
  ): Promise<{ path: string; relativePath: string; } | null>
  {
    const definition =
      await this.providers
      .artefactDefinitionProvider
      .findDefinition(
        rule.definition);

    if (!definition) {
      return null;
    }

    return await this.providers
      .artefactDefinitionRuleProvider
      .resolveRuleFile(
        rule.id,
        definition.name,
        definition.path);
  }
}
