import path
  from 'node:path';
import { spawn }
  from 'node:child_process';
import { access }
  from 'node:fs/promises';
import { pathToFileURL }
  from 'node:url';

/**
 * @typedef
 *   { import('./providers/artefact-provider.js')
 *       .ArtefactProvider }
 *   ArtefactProvider
 * @typedef
 *   { import('./providers/definition-provider.js')
 *       .DefinitionProvider }
 *   DefinitionProvider
 * @typedef
 *   { import('./logging.js')
 *       .Logger }
 *   Logger
 */

export class RuleRunner
{
  /**
   * @param {Logger} logger
   * @param {DefinitionProvider} definitionProvider
   * @param {ArtefactProvider} artefactProvider
   */
  constructor(
    logger,
    definitionProvider,
    artefactProvider)
  {
    this.logger = logger;
    this.definitionProvider = definitionProvider;
    this.artefactProvider = artefactProvider;
  }

  async runRule(
    rule,
    artefact)
  {
    if (
      !rule.filePath
      || !rule.absoluteFilePath)
    {
      return {
        rule,
        result: 'Fail',
        message: 'Missing rule file.',
      };
    }

    try {
      await access(
        rule.absoluteFilePath);
    }
    catch {
      return {
        rule,
        result: 'Fail',
        message: 'Missing rule file.',
      };
    }

    const ruleFileExtension =
      path.extname(
        rule.absoluteFilePath);

    if (ruleFileExtension.toLowerCase() === '.js') {
      return this.runJavaScriptRule(
        rule,
        artefact);
    }

    return this.runExecutableRule(
      rule,
      artefact);
  }

  async runRules(
    definition,
    artefact)
  {
    const results =
      [];

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
    rule,
    artefact)
  {
    try {
      const validatorModule =
        await import(
          pathToFileURL(
            rule.absoluteFilePath).href);

      if (typeof validatorModule.validate !== 'function') {
        return {
          rule,
          result: 'Fail',
          message: 'Rule module must export validate.',
        };
      }

      const outcome =
        await validatorModule.validate(
          artefact,
          {
            logger: this.logger,
            definitions: this.definitionProvider,
            artefacts: this.artefactProvider
          });

      if (outcome === false) {
        return {
          rule,
          result: 'Fail',
          message: rule.description,
        };
      }

      if (typeof outcome === 'string' && outcome.length > 0) {
        return {
          rule,
          result: 'Fail',
          message: outcome,
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
    rule,
    artefact)
  {
    return new Promise((resolve) => {
      const child =
        spawn(
          rule.absoluteFilePath,
          [artefact.path],
          {
            cwd: artefact.baseDirectory,
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

  formatError(error) {
    if (error instanceof Error) {
      return error.message.replaceAll(
        '\n',
        ' ');
    }

    return String(error);
  }
}