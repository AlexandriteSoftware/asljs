import { Logger }
  from 'asljs-logging';
import { ArtefactDefinitionRule }
  from './model/artefact-definition-rule.js';
import { ArtefactDefinition }
  from './model/artefact-definition.js';
import { Artefact }
  from './model/artefact.js';
import { Providers }
  from './providers/providers.js';
import { RuleValidationContext,
         toRuleValidationContext }
  from './rule-validation-function.js';

/**
 * `Skip` is the result of a rule no plugin implements.
 */
export interface RuleRunResult
{
  rule: ArtefactDefinitionRule;
  result: 'Ok' | 'Fail' | 'Skip';
  message: string;
}

export class RuleRunner
{
  private readonly context: RuleValidationContext;

  constructor(
    private readonly logger: Logger,
    private readonly providers: Providers
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

    const validateFunction =
      await this.providers
      .pluginProvider
      .findRule(
        rule.definition,
        rule.id);

    if (!validateFunction) {
      this.logger.trace(
        'runRule(%s, %s): rule is not implemented',
        rule.name,
        artefact.location);

      return { rule,
               result: 'Skip',
               message: '' };
    }

    try {
      await validateFunction(
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

      return { rule,
               result: 'Fail',
               message };
    }

    return { rule,
             result: 'Ok',
             message: '' };
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
}
