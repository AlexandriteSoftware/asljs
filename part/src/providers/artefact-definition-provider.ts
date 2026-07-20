import { glob }
  from 'glob';
import { List,
         Node }
  from 'mdast';
import { readFile }
  from 'node:fs/promises';
import path
  from 'node:path';
import { Logger }
  from '../logging/logging.js';
import { getSections,
         getText,
         Section }
  from '../markdown-document-queries.js';
import { ArtefactDefinitionRule }
  from '../model/artefact-definition-rule.js';
import { ArtefactDefinition }
  from '../model/artefact-definition.js';
import { Location }
  from '../model/location.js';
import { MarkdownDocument }
  from '../model/markdown-document.js';
import { GitIgnore }
  from './git-ignore.js';
import { MarkdownDocumentProvider }
  from './markdown-document-provider.js';

export interface DefinitionFileParsingContext
{
  /**
   * Absolute path to the definition file being parsed. Relative paths in
   * the artefact definition will be resolved from this path.
   */
  path: string;
}

export interface ArtefactDefinitionProvider
{
  /**
   * Finds an artefact definition by name. Returns undefined if not found.
   */
  findDefinition(
    definitionName: string
  ): Promise<ArtefactDefinition | undefined>;

  /**
   * Gets an artefact definition by name. Throws an error if not found.
   */
  getDefinition(
    definitionName: string
  ): Promise<ArtefactDefinition>;

  /**
   * Gets all artefact definitions.
   */
  getDefinitions(): Promise<ArtefactDefinition[]>;

  /**
   * Loads an artefact definition from a file. The file must be a Markdown file
   * with the correct structure. Throws an error if the file cannot be parsed.
   * The file path must be absolute.
   */
  fromFile(
    filePath: string
  ): Promise<ArtefactDefinition>;

  /**
   * Tries to parse an artefact definition from a Markdown document. Returns
   * undefined if the document cannot be parsed. The context provides the path
   * to the definition file being parsed, which is used to resolve relative
   * paths in the artefact definition.
   */
  tryParse(
    content: string,
    context: DefinitionFileParsingContext
  ): ArtefactDefinition | undefined;
}

export class ArtefactDefinitionProviderImpl
  implements ArtefactDefinitionProvider
{
  private cache: ArtefactDefinition[] | null = null;

  constructor(
    private readonly logger: Logger,
    private readonly gitIgnore: GitIgnore,
    private readonly markdownDocumentProvider: MarkdownDocumentProvider,
    private readonly definitionsPath: string
  )
  {
    if (
      !path.isAbsolute(
        definitionsPath)
    ) {
      throw new Error(
        `'definitionsPath' must be absolute: ${definitionsPath}`
      );
    }
  }

  async findDefinition(
    definitionName: string
  ): Promise<ArtefactDefinition | undefined>
  {
    this.logger.trace(
      'findDefinition() { %s }',
      definitionName);

    const definitions =
      await this.#getDefinitions();

    const definition =
      definitions
      .find(
        item => item.name === definitionName);

    const definitionFoundStatus =
      definition
      ? 'found'
      : 'not found';

    this.logger.trace(
      'findDefinition() { %s => %s }',
      definitionName,
      definitionFoundStatus);

    return definition;
  }

  async getDefinition(
    definitionName: string
  ): Promise<ArtefactDefinition>
  {
    this.logger.trace(
      'getDefinition() { %s }',
      definitionName);

    const definitions =
      await this.#getDefinitions();

    const definition =
      definitions
      .find(
        item => item.name === definitionName);

    if (!definition) {
      throw new Error(
        `Definition "${definitionName}" not found in ${this.definitionsPath}`
      );
    }

    this.logger.trace(
      'getDefinition() { return definition %s }',
      definitionName);

    return definition;
  }

  async getDefinitions(): Promise<ArtefactDefinition[]>
  {
    this.logger.trace(
      'getDefinitions() { start }');

    const definitions =
      await this.#getDefinitions();

    this.logger.trace(
      'getDefinitions() { return %d definitions }',
      definitions.length);

    return definitions;
  }

  async #getDefinitions(): Promise<ArtefactDefinition[]>
  {
    if (this.cache) {
      return this.cache;
    }

    this.logger.trace(
      '#getDefinitions() { scanning for definitions in %s }',
      this.definitionsPath);

    const markdownPaths =
      await glob(
        '**/*.md',
        { absolute: true, cwd: this.definitionsPath, dot: true, nodir: true });

    const visibleMarkdownPaths =
      this.gitIgnore.filter(markdownPaths);

    const definitions = [];

    for (const markdownPath of visibleMarkdownPaths) {
      let content =
        await readFile(
          markdownPath,
          'utf8');

      if (content.startsWith('\uFEFF')) {
        content = content.slice(1);
      }

      const artefactDefinition =
        this.tryParse(
          content,
          { path: markdownPath });

      if (!artefactDefinition) {
        continue;
      }

      definitions.push(
        artefactDefinition);
    }

    definitions.sort(
      sortDefinitionsByName);

    this.cache = definitions;

    return definitions;
  }

  async fromFile(
    filePath: string
  ): Promise<ArtefactDefinition>
  {
    if (!path.isAbsolute(filePath)) {
      throw new Error(
        `'filePath' must be absolute: ${filePath}`
      );
    }

    this.logger.trace(
      'fromFile(...) { %s }',
      filePath);

    let content =
      await readFile(
        filePath,
        'utf8');

    if (content.startsWith('\uFEFF')) {
      content = content.slice(1);
    }

    const artefactDefinition =
      this.tryParse(
        content,
        { path: filePath });

    if (!artefactDefinition) {
      throw new Error(
        `Failed to parse artefact definition from ${filePath}`
      );
    }

    this.logger.trace(
      'fromFile(...) { return definition %s }',
      artefactDefinition.name);

    return artefactDefinition;
  }

  tryParse(
    content: string,
    context: DefinitionFileParsingContext
  ): ArtefactDefinition | undefined
  {
    this.logger.trace(
      'tryParse(...%d chars, %o)',
      content.length,
      context);

    const name =
      path.basename(
        context.path,
        path.extname(
          context.path));

    const document =
      this.markdownDocumentProvider
      .parse(
        content);

    const sections =
      getSections(
        document);

    if (sections.length === 0) {
      this.logger.trace(
        'tryParse(...): no sections found in %s',
        context.path);

      return;
    }

    const firstSection =
      sections[0];

    if (
      firstSection.level !== 1
      || firstSection.heading !== name
    ) {
      this.logger.trace(
        'tryParse(...): top-level heading "%s" not found in %s',
        name,
        context.path);

      return;
    }

    const description =
      firstSection.content.markup;

    const locationSection =
      sections
      .find(
        section => section.heading === 'Location');

    if (!locationSection) {
      this.logger.trace(
        'tryParse(...): no location section found in %s',
        context.path);

      return;
    }

    const locations =
      this.#parseLocations(
        document,
        locationSection.nodes);

    if (!locations) {
      this.logger.warning(
        'tryParse(...): no locations found in %s',
        context.path);

      return;
    }

    const ruleSections: Section[] = [];

    let collect = false;

    for (const section of sections) {
      if (section.heading === 'Rules') {
        collect = true;
        continue;
      }

      if (collect) {
        if (section.level === 3) {
          ruleSections.push(section);
        } else {
          break;
        }
      }
    }

    const rules: ArtefactDefinitionRule[] = [];

    for (const ruleSection of ruleSections) {
      const ruleIdMatch =
        ruleSection.heading.match(
          /^([A-Z]+\d+)/);

      if (!ruleIdMatch) {
        this.logger.warning(
          'tryParse(...): invalid rule heading "%s" in %s',
          ruleSection.heading,
          context.path);

        continue;
      }

      const ruleId =
        ruleIdMatch[1];

      const ruleName =
        `${name}_${ruleId}`;

      const ruleDescription =
        ruleSection.markup;

      const rule: ArtefactDefinitionRule =
        {
        id: ruleId,
        definition: name,
        name: ruleName,
        heading: ruleSection.heading,
        content: ruleDescription
      };

      rules.push(rule);
    }

    const definition =
      {
      path: context.path,
      name,
      description,
      locations,
      rules
    };

    this.logger.trace(
      'parse() { name: %s, rules: %d, locations: %d }',
      name,
      rules.length,
      locations.length);

    return definition;
  }

  #parseLocations(
    document: MarkdownDocument,
    nodes: Node[]
  ): Location[] | undefined
  {
    const locationLists =
      nodes
      .filter(
        node => node.type === 'list')
      .map(
        node => node as List);

    const locations: Location[] = [];

    for (const locationList of locationLists) {
      const listItems =
        locationList.children
        .map(
          item =>
            getText(
              document,
              item)
              .trim())
        .filter(
          itemText => itemText.length > 0);

      if (listItems.length === 0) {
        continue;
      }

      let pattern: string = '';

      const exclude: string[] = [];

      const filters: any[] = [];

      for (const itemText of listItems) {
        const typeMatch =
          itemText.match(
            /^Pattern\s*:\s*(.+)$/i);

        if (typeMatch) {
          pattern = typeMatch[1].trim();

          continue;
        }

        const excludeMatch =
          itemText.match(
            /^Exclude\s*:\s*(.+)$/i);

        if (excludeMatch) {
          exclude.push(
            excludeMatch[1].trim());

          continue;
        }

        if (/^GitIgnore$/i.test(itemText)) {
          filters.push(
            { name: 'GitIgnore' });
        }
      }

      const location: Location =
        { pattern, exclude, filters };

      locations.push(location);
    }

    return locations;
  }
}

function sortDefinitionsByName(
    first: ArtefactDefinition,
    second: ArtefactDefinition
  ): number
{
  const firstName =
    first.name;

  const secondName =
    second.name;

  if (firstName < secondName) {
    return -1;
  }

  if (firstName > secondName) {
    return 1;
  }

  return 0;
}
