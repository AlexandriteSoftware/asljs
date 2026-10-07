import { Logger,
         LoggerProvider }
  from 'asljs-logging';
import { createRequire }
  from 'node:module';
import path
  from 'node:path';
import { pathToFileURL }
  from 'node:url';
import { ArtefactDataProvidingFunction }
  from '../artefact-data-providing-function.js';
import { createArtefactFiles }
  from '../location.js';
import { ArtefactDefinition }
  from '../model/artefact-definition.js';
import { ArtefactLocatingFunction,
         Plugin,
         PluginContext }
  from '../plugin.js';
import { RuleValidationFunction }
  from '../rule-validation-function.js';
import { MarkdownDocumentProvider }
  from './markdown-document-provider.js';

const RULE_ID_PATTERN = /^[A-Z]+\d+$/;

interface Binding<T>
{
  plugin: string;
  value: T;
}

interface LoadedPlugins
{
  plugins: Plugin[];
  locators: Map<string, Binding<ArtefactLocatingFunction>>;
  data: Map<string, Binding<ArtefactDataProvidingFunction>>;

  /**
   * Keyed by definition name, then rule id.
   */
  rules: Map<string, Map<string, Binding<RuleValidationFunction>>>;
}

/**
 * Loads plugin modules and gives access to what they contribute. Loading
 * happens once, on first use; any failure is fatal.
 */
export class PluginProvider
{
  #loaded: Promise<LoadedPlugins> | null = null;
  #definitions: Promise<ArtefactDefinition[]> | null = null;

  constructor(
    private readonly logger: Logger,
    private readonly loggerProvider: LoggerProvider,
    private readonly specifiers: readonly string[],
    private readonly projectPath: string,
    private readonly definitionsPath: string,
    private readonly markdownDocumentProvider: MarkdownDocumentProvider
  )
  {
  }

  async getPlugins(): Promise<Plugin[]>
  {
    const loaded = await this.#load();

    return [ ...loaded.plugins ];
  }

  /**
   * Definitions provided by plugins, in the shape of document definitions.
   */
  getDefinitions(): Promise<ArtefactDefinition[]>
  {
    this.#definitions ??= this.#collectDefinitions();

    return this.#definitions;
  }

  async findLocator(
    definition: string
  ): Promise<ArtefactLocatingFunction | undefined>
  {
    const loaded = await this.#load();

    return loaded.locators.get(definition)?.value;
  }

  async findData(
    definition: string
  ): Promise<ArtefactDataProvidingFunction | undefined>
  {
    const loaded = await this.#load();

    return loaded.data.get(definition)?.value;
  }

  async findRule(
    definition: string,
    ruleId: string
  ): Promise<RuleValidationFunction | undefined>
  {
    const loaded = await this.#load();

    return loaded.rules
      .get(definition)
      ?.get(ruleId)
      ?.value;
  }

  /**
   * Throws when a plugin binds a locator, a data function or a rule to a
   * definition or a rule id that does not exist.
   */
  async validateBindings(
    definitions: ArtefactDefinition[]
  ): Promise<void>
  {
    const loaded = await this.#load();

    const definitionByName =
      new Map(
        definitions.map(
          definition => [ definition.name,
                          definition ] as const));

    const bindingKinds =
      [ [ 'locator',
          loaded.locators ],
        [ 'data function',
          loaded.data ] ] as const;

    for (const [kind, bindings] of bindingKinds) {
      for (const [definitionName, binding] of bindings) {
        if (!definitionByName.has(definitionName)) {
          throw new Error(
            `Plugin "${binding.plugin}" provides a ${kind} for unknown definition "${definitionName}".`);
        }
      }
    }

    for (const [definitionName, ruleBindings] of loaded.rules) {
      const definition =
        definitionByName.get(
          definitionName);

      for (const [ruleId, binding] of ruleBindings) {
        if (!definition) {
          throw new Error(
            `Plugin "${binding.plugin}" implements rule "${ruleId}" of unknown definition "${definitionName}".`);
        }

        if (
          !definition.rules.some(
            rule => rule.id === ruleId)
        ) {
          throw new Error(
            `Plugin "${binding.plugin}" implements unknown rule "${ruleId}" of definition "${definitionName}".`);
        }
      }
    }
  }

  #load(): Promise<LoadedPlugins>
  {
    this.#loaded ??= this.#loadPlugins();

    return this.#loaded;
  }

  async #loadPlugins(): Promise<LoadedPlugins>
  {
    const loaded: LoadedPlugins =
      { plugins: [ ],
        locators: new Map(),
        data: new Map(),
        rules: new Map() };

    const context: PluginContext =
      { logger:
          this.loggerProvider.getLogger(
            'Plugin'),
        projectPath: this.projectPath,
        definitionsPath:
          this.definitionsPath,
        markdownDocuments:
          this.markdownDocumentProvider,
        files:
          createArtefactFiles(
            this.projectPath) };

    for (const specifier of this.specifiers) {
      this.logger.trace(
        '#loadPlugins() { loading %s }',
        specifier);

      const plugin =
        await this.#loadPlugin(
          specifier,
          context);

      if (
        loaded.plugins.some(
          item => item.name === plugin.name)
      ) {
        throw new Error(
          `Plugin "${plugin.name}" is loaded more than once.`);
      }

      loaded.plugins.push(plugin);

      registerAll(
        plugin,
        'locator',
        plugin.locate,
        loaded.locators);

      registerAll(
        plugin,
        'data function',
        plugin.data,
        loaded.data);

      for (
        const [definitionName, ruleFunctions] of Object.entries(
          plugin.rules
            ?? {})
      ) {
        let ruleBindings =
          loaded.rules.get(
            definitionName);

        if (!ruleBindings) {
          ruleBindings = new Map();

          loaded.rules.set(
            definitionName,
            ruleBindings);
        }

        for (const [ruleId, ruleFunction] of Object.entries(ruleFunctions)) {
          const existing =
            ruleBindings.get(ruleId);

          if (existing) {
            throw new Error(
              `Rule "${ruleId}" of definition "${definitionName}" is implemented by both plugin "${existing.plugin}" and plugin "${plugin.name}".`);
          }

          assertFunction(
            plugin,
            `rule "${ruleId}" of definition "${definitionName}"`,
            ruleFunction);

          ruleBindings.set(
            ruleId,
            { plugin: plugin.name,
              value: ruleFunction });
        }
      }
    }

    return loaded;
  }

  async #loadPlugin(
    specifier: string,
    context: PluginContext
  ): Promise<Plugin>
  {
    let module;

    try {
      module =
        await import(
        this.#resolve(
          specifier)
      );
    } catch (error) {
      throw new Error(
        `Failed to load plugin "${specifier}": ${formatError(error)}`);
    }

    const factory = module.default;

    if (
      typeof factory
      !== 'function'
    ) {
      throw new Error(
        `Plugin "${specifier}" must export a default factory function.`);
    }

    let plugin;

    try {
      plugin =
        await factory(context);
    } catch (error) {
      throw new Error(
        `Plugin "${specifier}" failed to initialise: ${formatError(error)}`);
    }

    if (
      !plugin
      || typeof plugin
         !== 'object'
      || typeof plugin.name
         !== 'string'
      || plugin.name === ''
    ) {
      throw new Error(
        `Plugin "${specifier}" factory must return an object with a name.`);
    }

    return plugin as Plugin;
  }

  /**
   * A path is imported as a file. A bare specifier is resolved from the
   * project root first, then from this package, so the built-in plugins load
   * when `part` is installed globally.
   */
  #resolve(
    specifier: string
  ): string
  {
    if (
      path.isAbsolute(specifier)
      || specifier.startsWith('.')
    ) {
      return pathToFileURL(
        path.resolve(
          specifier)).href;
    }

    try {
      const projectRequire =
        createRequire(
          path.join(
            this.projectPath,
            'package.json'));

      return pathToFileURL(
        projectRequire.resolve(
          specifier)).href;
    } catch {
      return specifier;
    }
  }

  async #collectDefinitions(): Promise<ArtefactDefinition[]>
  {
    const definitions: ArtefactDefinition[] = [ ];

    for (const plugin of await this.getPlugins()) {
      if (!plugin.definitions) {
        continue;
      }

      let pluginDefinitions;

      try {
        pluginDefinitions =
          await plugin.definitions();
      } catch (error) {
        throw new Error(
          `Plugin "${plugin.name}" failed to provide definitions: ${
            formatError(error)
          }`);
      }

      for (const pluginDefinition of pluginDefinitions) {
        const rules =
          (pluginDefinition.rules ?? [ ])
          .map(
            (
                rule
              ) =>
            {
              if (!RULE_ID_PATTERN.test(rule.id)) {
                throw new Error(
                  `Plugin "${plugin.name}" defines rule with invalid id "${rule.id}" in definition "${pluginDefinition.name}".`);
              }

              return { id: rule.id,
                       name:
                         `${pluginDefinition.name}_${rule.id}`,
                       definition:
                         pluginDefinition.name,
                       heading:
                         rule.heading
                  ?? rule.id,
                       content: rule.content };
            });

        definitions.push(
          { name:
              pluginDefinition.name,
            description:
              pluginDefinition.description,
            source: plugin.name,
            locations: [ ],
            rules,
            properties:
              pluginDefinition.properties
              ?? [ ] });
      }
    }

    return definitions;
  }
}

function registerAll<T>(
    plugin: Plugin,
    kind: string,
    values: Record<string, T> | undefined,
    bindings: Map<string, Binding<T>>
  ): void
{
  for (
    const [definitionName, value] of Object.entries(
      values ?? {})
  ) {
    const existing =
      bindings.get(
        definitionName);

    if (existing) {
      throw new Error(
        `Definition "${definitionName}" has a ${kind} in both plugin "${existing.plugin}" and plugin "${plugin.name}".`);
    }

    assertFunction(
      plugin,
      `${kind} of definition "${definitionName}"`,
      value);

    bindings.set(
      definitionName,
      { plugin: plugin.name,
        value });
  }
}

function assertFunction(
    plugin: Plugin,
    description: string,
    value: unknown
  ): void
{
  if (
    typeof value
    !== 'function'
  ) {
    throw new Error(
      `Plugin "${plugin.name}" ${description} must be a function.`);
  }
}

function formatError(
    error: unknown
  ): string
{
  return error instanceof Error
    ? error.message
    : String(error);
}
