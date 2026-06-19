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
 *   { import('./rule-validation-function.js')
 *       .RuleValidationFunction }
 *   RuleValidationFunction
 * @typedef
 *   { import('./rule-validation-function.js')
 *       .RuleValidationContext }
 *   RuleValidationContext
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

  /**
   * @param {ArtefactDefinitionRule} rule
   * @param {Artefact} artefact
   */
  async runRule(
    rule,
    artefact)
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

      /** @type {RuleValidationFunction} */
      const validateFunction =
        validatorModule.validate;

      if (typeof validateFunction !== 'function') {
        throw new Error(
          'Rule module must export validate.');
      }

      let result = null;

      /** @type {RuleValidationContext} */
      const validationContext =
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