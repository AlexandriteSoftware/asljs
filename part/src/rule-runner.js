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
 *   { import('./artefact.js')
 *       .Artefact }
 *   Artefact
 * @typedef
 *   { import('./artefact-definition.js')
 *       .ArtefactDefinition }
 *   ArtefactDefinition
 * @typedef
 *   { import('./artefact-definition.js')
 *       .ArtefactDefinitionRule }
 *   ArtefactDefinitionRule
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

  /**
   * @param {ArtefactDefinitionRule} rule
   * @param {Artefact} artefact
   */
  async runRule(
    rule,
    artefact)
  {
    this.logger.trace(
      `RuleRunner.runRule: ${rule.name} for artefact ${artefact.path}`);

    if (!rule.path)
    {
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
      return {
        rule,
        result: 'Fail',
        message: 'Missing rule file.',
      };
    }

    const ruleFileExtension =
      path.extname(
        rule.path);

    if (ruleFileExtension.toLowerCase() === '.js') {
      return this.runJavaScriptRule(
        rule,
        artefact);
    }

    return this.runExecutableRule(
      rule,
      artefact);
  }

  /**
   * @param {ArtefactDefinition} definition
   * @param {Artefact} artefact
   */
  async runRules(
    definition,
    artefact)
  {
    const results = [];

    for (const rule of definition.rules) {
      const result =
        await this.runRule(
          rule,
          artefact);

      results.push(result);
    }

    return results;
  }

  /**
   * @param {ArtefactDefinitionRule} rule
   * @param {Artefact} artefact
   */
  async runJavaScriptRule(
    rule,
    artefact)
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

      if (typeof validatorModule.validate !== 'function') {
        throw new Error(
          'Rule module must export validate.');
      }

      let result = null;

      try {
        await validatorModule.validate(
          artefact,
          { logger: this.logger,
            definitions: this.definitionProvider,
            artefacts: this.artefactProvider });
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

  /**
   * @param {ArtefactDefinitionRule} rule
   * @param {Artefact} artefact
   */
  async runExecutableRule(
    rule,
    artefact)
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

  /**
   * @param {any} error
   */
  formatError(error) {
    if (error instanceof Error) {
      return error.message.replaceAll(
        '\n',
        ' ');
    }

    return String(error);
  }
}