import path
  from 'node:path';
import { glob }
  from 'glob';
import { readFile }
  from 'node:fs/promises';
import { GitIgnore }
  from './git-ignore.js';
import { MarkdownDocumentProvider }
  from './markdown-document-provider.js';
import { Root }
  from 'mdast';
import { RootContent }
  from 'mdast';
import { MarkdownDocument }
  from '../markdown-document.js';
import { ArtefactDefinition,
         ArtefactDefinitionRule,
         Location }
  from '../model/types.js';
import { Logger }
  from '../logging/logging.js';

export interface DefinitionParsingContext {
  path: string;
}

interface SectionParsingContext
  extends DefinitionParsingContext
{
  name: string;
  content: string;
}

export class ArtefactDefinitionProvider
{
  private cache: ArtefactDefinition[] | null = null;

  constructor(
      private readonly logger: Logger,
      private readonly gitIgnore: GitIgnore,
      private readonly markdownDocumentProvider: MarkdownDocumentProvider,
      private readonly definitionsPath: string
    )
  {
    if (!path.isAbsolute(definitionsPath)) {
      throw new Error(
        `'definitionsPath' must be absolute: ${definitionsPath}`);
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
          item =>
            item.name === definitionName);

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
          item =>
            item.name === definitionName);

    if (!definition) {
      throw new Error(
        `Definition "${definitionName}" not found in ${this.definitionsPath}`);
    }

    this.logger.trace(
      'getDefinition() { return definition %s }',
      definitionName);

    return definition;
  }

  async getDefinitions(
    ): Promise<ArtefactDefinition[]>
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

  async #getDefinitions(
    ): Promise<ArtefactDefinition[]>
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
        { absolute: true,
          cwd: this.definitionsPath,
          dot: true,
          nodir: true });

    const visibleMarkdownPaths =
      this.gitIgnore.filter(markdownPaths);

    const definitions = [];

    for (const markdownPath of visibleMarkdownPaths) {
      let content =
        await readFile(
          markdownPath,
          'utf8');

      if (content.startsWith('\uFEFF')) {
        content =
          content.slice(1);
      }

      const artefactDefinition =
        this.tryParse(
          content,
          { path: markdownPath });

      if (!artefactDefinition) {
        continue;
      }

      definitions.push(artefactDefinition);
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
        `'filePath' must be absolute: ${filePath}`);
    }

    this.logger.trace(
      'fromFile(...) { %s }',
      filePath);

    let content =
      await readFile(
        filePath,
        'utf8');

    if (content.startsWith('\uFEFF')) {
      content =
        content.slice(1);
    }

    const artefactDefinition =
      this.tryParse(
        content,
        { path: filePath });

    if (!artefactDefinition) {
      throw new Error(
        `Failed to parse artefact definition from ${filePath}`);
    }

    this.logger.trace(
      'fromFile(...) { return definition %s }',
      artefactDefinition.name);

    return artefactDefinition;
  }

  tryParse(
      content: string,
      context: DefinitionParsingContext
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

    const contextNameSectionNode =
      document.getSectionNode(
        name);

    if (
      null === contextNameSectionNode
      || contextNameSectionNode.depth !== 1
    ) {
      this.logger.trace(
        'tryParse(...): top-level heading "%s" not found in %s',
        name,
        context.path);
      
      return;
    }

    const sectionParsingContext: SectionParsingContext =
      { ...context,
        name,
        content };

    const description =
      extractDescription(
        document.root,
        sectionParsingContext);

    const locations =
      this.#parseLocations(
        document,
        sectionParsingContext);

    if (!locations) {
      this.logger.trace(
        'tryParse(...): no locations found in %s',
        context.path);

      return;
    }

    const rules =
      this.#parseRules(
        document,
        sectionParsingContext);

    const definition =
      { path: context.path,
        name,
        description,
        locations,
        rules };

    this.logger.trace(
      'parse() { name: %s, rules: %d, locations: %d }',
      name,
      rules.length,
      locations.length);

    return definition;
  }

  #parseRules(
      document: MarkdownDocument,
      context: SectionParsingContext
    ): ArtefactDefinitionRule[]
  {
    this.logger.trace(
      '#parseRules(...) { parsing rules for %s }',
      context.path);

    const rules: ArtefactDefinitionRule[] = [];

    const rulesPrimaryListItems =
      document.getSectionPrimaryListItems('Rules');

    if (
      rulesPrimaryListItems === null
      || rulesPrimaryListItems.length === 0)
    {
      this.logger.trace(
        '#parseRules(...) { no rules section found in %s }',
        context.path);

      return rules;
    }

    const listItems =
      rulesPrimaryListItems
        .map(
          item =>
            context.content
              .substring(
                item.position?.start.offset ?? 0,
                item.position?.end.offset ?? 0)
              .trim())
        .filter(
          itemText => itemText.length > 0);

    if (listItems.length === 0) {
      this.logger.trace(
        '#parseRules(...) { no list items found in %s }',
        context.path);

      return rules;
    }

    for (const itemText of listItems) {
      const match =
        itemText.match(
          /^-\s+([A-Z]+\d+)\s*(?:[:-]\s*)?/);
          
      if (!match) {
        this.logger.trace(
          '#parseRules(...) { no match found for list item "%s" in %s }',
          itemText,
          context.path);

        continue;
      }
      
      const id =
        match[1];

      const description =
        itemText
          .substring(
            match[0].length)
          .trim();

      const name =
        `${context.name}_${id}`;

      rules.push(
        { id,
          definition: context.name,
          name,
          description });
    }

    return rules;
  }

  #parseLocations(
      document: MarkdownDocument,
      context: SectionParsingContext
    ): Location[] | undefined
  {
    const locationParametersList =
      document.getSectionPrimaryListItems('Location');

    if (locationParametersList === null
      || locationParametersList.length === 0)
    {
      this.logger.trace(
        '#parseLocation() { no location section found }');

      return;
    }

    const listItems =
      locationParametersList
        .map(
          item => document.getText(item).trim())
        .filter(
          itemText => itemText.length > 0);

    if (listItems.length === 0) {
      return [];
    }

    let pattern: string = '';

    const exclude: string[] = [];
    
    const filters: any[] = [];

    for (const itemText of listItems) {
      const typeMatch =
        itemText.match(
          /^Pattern\s*:\s*(.+)$/i);

      if (typeMatch) {
        pattern =
          typeMatch[1].trim();

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
      { pattern,
        exclude,
        filters };

    return [ location ];
  }
}

function getTopHeading(
    document: Root
  ): RootContent | null
{
  return document
    .children
    .find(
      node =>
        node.type === 'heading'
        && node.depth === 1)
      ?? null;
}

function extractDescription(
    document: Root,
    context: SectionParsingContext
  ): string
{
  const heading =
    getTopHeading(document);

  if (!heading) {
    return '';
  }

  const startOffset =
    heading.position?.end.offset
    ?? 0;

  const nextHeading =
    document.children
      .find(
        node =>
          node.type === 'heading'
          && node.depth !== 1);

  if (!nextHeading) {
    return context.content
      .substring(startOffset)
      .trim();
  }

  const endOffset =
    nextHeading.position?.start.offset
    ?? context.content.length;

  return context.content
    .substring(
      startOffset,
      endOffset)
    .trim();
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
