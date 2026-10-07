import { Logger }
  from 'asljs-logging';
import { stat }
  from 'node:fs/promises';
import { AiRunner }
  from './ai-runner.js';
import { CheckCache,
         hashRuleContent }
  from './check-cache.js';
import { fromFileLocation }
  from './location.js';
import { ArtefactDefinitionRule }
  from './model/artefact-definition-rule.js';
import { ArtefactDefinition }
  from './model/artefact-definition.js';
import { Artefact }
  from './model/artefact.js';
import { RuleBinding }
  from './providers/definition-source-provider.js';
import { Providers }
  from './providers/providers.js';
import { RuleValidationContext,
         toRuleValidationContext }
  from './rule-validation-function.js';

/**
 * `Skip` is the result of a rule no plugin implements, when no AI agent is
 * used. `mode` tells how the result was produced; `cached` that it was
 * replayed from the check cache.
 */
export interface RuleRunResult
{
  rule: ArtefactDefinitionRule;
  result: 'Ok' | 'Fail' | 'Skip';
  message: string;
  mode: 'code' | 'ai' | 'none';
  cached: boolean;
}

export interface RuleRunnerOptions
{
  /**
   * Results of `file:` artefacts are reused from and stored in the cache.
   */
  cache?: CheckCache;

  /**
   * Run every rule even when the cache holds a valid result.
   */
  forceCheck?: boolean;

  /**
   * Checks rules no plugin implements.
   */
  ai?: AiRunner;
}

export class RuleRunner
{
  private readonly context: RuleValidationContext;

  constructor(
    private readonly logger: Logger,
    private readonly providers: Providers,
    private readonly options: RuleRunnerOptions = {}
  )
  {
    this.context =
      toRuleValidationContext(
        logger,
        providers);
  }

  async runRule(
    rule: ArtefactDefinitionRule,
    artefact: Artefact
  ): Promise<RuleRunResult>
  {
    this.logger.trace(
      'runRule(%s, %s) { start }',
      rule.name,
      artefact.location);

    const binding =
      await this.providers
      .definitionSourceProvider
      .findRule(
        rule.definition,
        rule.id);

    const mode =
      binding
      ? 'code'
      : this.options.ai
      ? 'ai'
      : 'none';

    if (mode === 'none') {
      return { rule,
               result: 'Skip',
               message: '',
               mode,
               cached: false };
    }

    const cache = this.options.cache;

    const modified =
      cache
      ? await this.#getModifiedTime(artefact)
      : null;

    const ruleHash =
      hashRuleContent(
        rule.content);

    const plugin =
      binding?.plugin
      ?? '';

    const version =
      binding?.version
      ?? '';

    if (
      cache
      && modified !== null
      && !this.options.forceCheck
    ) {
      const entry =
        cache.get(
          artefact.location,
          rule.name);

      if (
        entry
        && entry.mode === mode
        && entry.ruleHash === ruleHash
        && entry.plugin === plugin
        && entry.version === version
        && modified
           <= Date.parse(entry.checkedAt)
      ) {
        this.logger.trace(
          'runRule(%s, %s): cached',
          rule.name,
          artefact.location);

        return { rule,
                 result: entry.result,
                 message: entry.message,
                 mode,
                 cached: true };
      }
    }

    const checkedAt =
      new Date().toISOString();

    const verdict =
      binding
      ? await this.#runCode(
        binding,
        rule,
        artefact)
      : await this.#runAi(
        this.options.ai!,
        rule,
        artefact);

    if (
      cache
      && modified !== null
    ) {
      cache.set(
        artefact.location,
        rule.name,
        { checkedAt,
          ruleHash,
          mode,
          plugin,
          version,
          result: verdict.result,
          message: verdict.message });
    }

    return { rule,
             ...verdict,
             mode,
             cached: false };
  }

  async runRules(
    definition: ArtefactDefinition,
    artefact: Artefact
  ): Promise<RuleRunResult[]>
  {
    const results: RuleRunResult[] = [ ];

    for (const rule of definition.rules) {
      const result =
        await this.runRule(
          rule,
          artefact);

      results.push(result);
    }

    return results;
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

  async #runCode(
    binding: RuleBinding,
    rule: ArtefactDefinitionRule,
    artefact: Artefact
  ): Promise<{ result: 'Ok' | 'Fail'; message: string; }>
  {
    try {
      await binding.validate(
        artefact,
        this.context);
    } catch (error) {
      const message =
        this.formatError(
          error
          ?? new Error(
            'Unknown error'));

      this.logger.trace(
        'runRule(%s, %s): %s',
        rule.name,
        artefact.location,
        message);

      return { result: 'Fail',
               message };
    }

    return { result: 'Ok',
             message: '' };
  }

  async #runAi(
    ai: AiRunner,
    rule: ArtefactDefinitionRule,
    artefact: Artefact
  ): Promise<{ result: 'Ok' | 'Fail'; message: string; }>
  {
    const definition =
      await this.providers
      .artefactDefinitionProvider
      .getDefinition(
        rule.definition);

    const verdict =
      await ai.check(
        definition,
        rule,
        artefact);

    return { result: verdict.result,
             message:
               this.formatError(
                 new Error(verdict.message)) };
  }

  /**
   * Modification time of a `file:` artefact, its own for a folder; `null` for
   * other artefacts, which are not cached.
   */
  async #getModifiedTime(
    artefact: Artefact
  ): Promise<number | null>
  {
    const filePath =
      fromFileLocation(
        this.providers.projectPath,
        artefact.location);

    if (filePath === null) {
      return null;
    }

    try {
      return (await stat(filePath)).mtimeMs;
    } catch {
      return null;
    }
  }
}
