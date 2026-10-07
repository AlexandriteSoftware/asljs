import { Logger,
         LoggerProvider }
  from 'asljs-logging';
import { existsSync }
  from 'node:fs';
import { readFile,
         stat }
  from 'node:fs/promises';
import { createRequire }
  from 'node:module';
import path
  from 'node:path';
import { fileURLToPath,
         pathToFileURL }
  from 'node:url';
import { ArtefactDataProvidingFunction }
  from '../artefact-data-providing-function.js';
import { isDefinitionIncluded,
         parseDefinitionSource }
  from '../definition-source.js';
import { createArtefactFiles }
  from '../location.js';
import { ArtefactDefinition }
  from '../model/artefact-definition.js';
import { ArtefactLocatingFunction,
         Plugin,
         PluginArtefactDefinition,
         PluginContext }
  from '../plugin.js';
import { RuleValidationFunction }
  from '../rule-validation-function.js';
import { MarkdownDefinitionReader,
         sortDefinitionsByName }
  from './markdown-definition-reader.js';
import { MarkdownDocumentProvider }
  from './markdown-document-provider.js';

const RULE_ID_PATTERN = /^[A-Z]+\d+$/;

interface Binding<T>
{
  plugin: string;
  value: T;
}

/**
 * A rule implementation and the plugin that provides it.
 */
export interface RuleBinding
{
  plugin: string;

  /**
   * The plugin's `version`, `''` when it declares none.
   */
  version: string;

  validate: RuleValidationFunction;
}

type Source =
  | { kind: 'markdown'; folder: string; }
  | { kind: 'plugin'; url: string; folder: string; };

interface LoadedSources
{
  plugins: Plugin[];
  definitions: ArtefactDefinition[];
  locators: Map<string, Binding<ArtefactLocatingFunction>>;
  data: Map<string, Binding<ArtefactDataProvidingFunction>>;

  /**
   * Keyed by definition name, then rule id.
   */
  rules: Map<string, Map<string, RuleBinding>>;
}

/**
 * Loads the definition sources given with `--definitions` and gives access to
 * the definitions and the plugin bindings. A source is an md-only folder, a
 * plugin library folder (has `package.json`), a plugin file, or a package
 * specifier, optionally followed by `;<include>;<exclude>` name patterns
 * (see `parseDefinitionSource`). Loading happens once, on first use; any
 * failure is fatal.
 */
export class DefinitionSourceProvider
{
  #loaded: Promise<LoadedSources> | null = null;

  constructor(
    private readonly logger: Logger,
    private readonly loggerProvider: LoggerProvider,
    private readonly sources: readonly string[],
    private readonly projectPath: string,
    private readonly markdownDefinitionReader: MarkdownDefinitionReader,
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
   * Definitions of all sources, sorted by name.
   */
  async getDefinitions(): Promise<ArtefactDefinition[]>
  {
    const loaded = await this.#load();

    return [ ...loaded.definitions ];
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
  ): Promise<RuleBinding | undefined>
  {
    const loaded = await this.#load();

    return loaded.rules
      .get(definition)
      ?.get(ruleId);
  }

  #load(): Promise<LoadedSources>
  {
    this.#loaded ??= this.#loadSources();

    return this.#loaded;
  }

  async #loadSources(): Promise<LoadedSources>
  {
    const loaded: LoadedSources =
      { plugins: [ ],
        definitions: [ ],
        locators: new Map(),
        data: new Map(),
        rules: new Map() };

    for (const value of this.sources) {
      this.logger.trace(
        '#loadSources() { loading %s }',
        value);

      const spec =
        parseDefinitionSource(
          value);

      const specifier = spec.source;

      const source =
        await this.#classify(
          specifier);

      if (source.kind === 'markdown') {
        addDefinitions(
          loaded.definitions,
          (await this.markdownDefinitionReader.readFolder(
            source.folder))
            .filter(
              definition =>
                isDefinitionIncluded(
                  spec,
                  definition.name)));

        continue;
      }

      const plugin =
        await this.#loadPlugin(
          specifier,
          source);

      if (
        loaded.plugins.some(
          item => item.name === plugin.name)
      ) {
        throw new Error(
          `Plugin "${plugin.name}" is loaded more than once.`);
      }

      loaded.plugins.push(plugin);

      const pluginDefinitions =
        await collectPluginDefinitions(
          plugin);

      const filteredOut =
        new Set(
          pluginDefinitions
          .filter(
            definition =>
              !isDefinitionIncluded(
                spec,
                definition.name))
          .map(
            definition => definition.name));

      // Bindings of the plugin's own filtered-out definitions are dropped
      // with them.
      registerBindings(
        plugin,
        loaded,
        filteredOut);

      addDefinitions(
        loaded.definitions,
        pluginDefinitions.filter(
          definition => !filteredOut.has(definition.name)));
    }

    loaded.definitions.sort(
      sortDefinitionsByName);

    validateBindings(
      loaded);

    return loaded;
  }

  async #classify(
    specifier: string
  ): Promise<Source>
  {
    if (!path.isAbsolute(specifier)) {
      const url =
        this.#resolvePackage(
          specifier);

      return { kind: 'plugin',
               url,
               folder:
                 path.dirname(
                   fileURLToPath(url)) };
    }

    let stats;

    try {
      stats =
        await stat(specifier);
    } catch {
      throw new Error(
        `Definitions source not found: ${specifier}`);
    }

    if (!stats.isDirectory()) {
      return { kind: 'plugin',
               url:
                 pathToFileURL(specifier).href,
               folder:
                 path.dirname(specifier) };
    }

    const packageJsonPath =
      path.join(
        specifier,
        'package.json');

    if (!existsSync(packageJsonPath)) {
      return { kind: 'markdown',
               folder: specifier };
    }

    const entry =
      getPackageEntry(
        JSON.parse(
          await readFile(
            packageJsonPath,
            'utf8')));

    if (!entry) {
      throw new Error(
        `Plugin library ${specifier} has no entry: package.json needs "exports" or "main".`);
    }

    return { kind: 'plugin',
             url:
               pathToFileURL(
                 path.resolve(
                   specifier,
                   entry)).href,
             folder: specifier };
  }

  /**
   * Resolved from the project root first, then from this package, so the
   * built-in plugins load when `part` is installed globally.
   */
  #resolvePackage(
    specifier: string
  ): string
  {
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
      try {
        return import.meta.resolve(
          specifier);
      } catch (error) {
        throw new Error(
          `Failed to load plugin "${specifier}": ${formatError(error)}`);
      }
    }
  }

  async #loadPlugin(
    specifier: string,
    source: Extract<Source, { kind: 'plugin'; }>
  ): Promise<Plugin>
  {
    let module;

    try {
      module =
        await import(source.url);
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

    const context: PluginContext =
      { logger:
          this.loggerProvider.getLogger(
            'Plugin'),
        projectPath: this.projectPath,
        folder: source.folder,
        markdownDocuments:
          this.markdownDocumentProvider,
        files:
          createArtefactFiles(
            this.projectPath),
        readDefinitions:
          folder =>
        this.markdownDefinitionReader.readFolder(
          path.resolve(
            source.folder,
            folder ?? '.')) };

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
}

/**
 * `exports['.']` (a string, or its `import` or `default` condition), else
 * `main`.
 */
function getPackageEntry(
    packageJson: Record<string, unknown>
  ): string | undefined
{
  let entry: unknown = packageJson.exports;

  if (
    entry
    && typeof entry
       === 'object'
    && '.' in entry
  ) {
    entry =
      (entry as Record<string, unknown>)['.'];
  }

  if (
    entry
    && typeof entry
       === 'object'
  ) {
    const conditions =
      entry as Record<string, unknown>;

    entry =
      conditions.import
      ?? conditions.default;
  }

  if (
    typeof entry
    === 'string'
  ) {
    return entry;
  }

  return typeof packageJson.main === 'string'
    ? packageJson.main
    : undefined;
}

function addDefinitions(
    definitions: ArtefactDefinition[],
    added: ArtefactDefinition[]
  ): void
{
  for (const definition of added) {
    const clash =
      definitions.find(
        item => item.name === definition.name);

    if (clash) {
      throw new Error(
        `Definition "${definition.name}" is provided by ${
          describeSource(definition)
        } and by ${describeSource(clash)}.`);
    }

    definitions.push(definition);
  }
}

function describeSource(
    definition: ArtefactDefinition
  ): string
{
  return definition.source === 'markdown'
    ? `document ${definition.path}`
    : `plugin "${definition.source}"`;
}

async function collectPluginDefinitions(
    plugin: Plugin
  ): Promise<ArtefactDefinition[]>
{
  if (!plugin.definitions) {
    return [ ];
  }

  let pluginDefinitions: PluginArtefactDefinition[];

  try {
    pluginDefinitions =
      await plugin.definitions();
  } catch (error) {
    throw new Error(
      `Plugin "${plugin.name}" failed to provide definitions: ${
        formatError(error)
      }`);
  }

  return pluginDefinitions.map(
    (
        pluginDefinition
      ): ArtefactDefinition =>
    {
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

      const definition: ArtefactDefinition =
        { name:
            pluginDefinition.name,
          description:
            pluginDefinition.description,
          source: plugin.name,
          locations:
            pluginDefinition.locations
          ?? [ ],
          rules,
          properties:
            pluginDefinition.properties
          ?? [ ] };

      if (
        pluginDefinition.path
        !== undefined
      ) {
        definition.path =
          pluginDefinition.path;
      }

      return definition;
    });
}

function registerBindings(
    plugin: Plugin,
    loaded: LoadedSources,
    skipped: ReadonlySet<string>
  ): void
{
  registerAll(
    plugin,
    'locator',
    plugin.locate,
    loaded.locators,
    skipped);

  registerAll(
    plugin,
    'data function',
    plugin.data,
    loaded.data,
    skipped);

  for (
    const [definitionName, ruleFunctions] of Object.entries(
      plugin.rules
        ?? {})
  ) {
    if (skipped.has(definitionName)) {
      continue;
    }

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
          version:
            plugin.version
            ?? '',
          validate: ruleFunction });
    }
  }
}

function registerAll<T>(
    plugin: Plugin,
    kind: string,
    values: Record<string, T> | undefined,
    bindings: Map<string, Binding<T>>,
    skipped: ReadonlySet<string>
  ): void
{
  for (
    const [definitionName, value] of Object.entries(
      values ?? {})
  ) {
    if (skipped.has(definitionName)) {
      continue;
    }

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

/**
 * Throws when a plugin binds a locator, a data function or a rule to a
 * definition or a rule id that does not exist.
 */
function validateBindings(
    loaded: LoadedSources
  ): void
{
  const definitionByName =
    new Map(
      loaded.definitions.map(
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
