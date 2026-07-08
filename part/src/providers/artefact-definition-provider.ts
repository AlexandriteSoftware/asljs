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
         ArtefactDefinitionRule }
  from '../artefact-definition.js';
import { Location }
  from '../location.js';
import { Logger }
  from '../logging/logging.js';

interface DefinitionParsingContext {
  path: string;
  name: string;
  content: string;
}

export class ArtefactDefinitionProvider
{
  private partsDirectoryName: string;
  private logger: Logger;
  private rootPath: string;
  private gitIgnore: GitIgnore;
  private cache: ArtefactDefinition[] | null;
  private markdownDocumentProvider: MarkdownDocumentProvider;

  public definitionsPath: string;

  constructor(
    logger: Logger,
    rootPath: string,
    definitionsPath: string = rootPath)
  {
    this.logger = logger;

    this.rootPath =
      path.resolve(rootPath);

    this.partsDirectoryName = 'parts';

    this.definitionsPath =
      path.resolve(
        this.rootPath,
        definitionsPath);

    this.gitIgnore =
      new GitIgnore(
        this.logger);

    this.cache = null;

    this.markdownDocumentProvider =
      new MarkdownDocumentProvider();
  }

  async tryGetDefinition(
      definitionName: string
    ): Promise<ArtefactDefinition | null>
  {
    this.logger.trace(
      'tryGetDefinition(%s)',
      definitionName);

    const definitions =
      await this.getDefinitions();

    const definition =
      definitions.find(def => def.name === definitionName)
      || null;

    return definition;
  }

  async getDefinitions(
    ): Promise<ArtefactDefinition[]>
{
    this.logger.trace(
      'getDefinitions()');

    if (this.cache) {
      return this.cache;
    }

    this.logger.trace(
      'getDefinitions() { scanning for definitions in %s }',
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
      const definition =
        await this.loadDefinitionFromFile(
          markdownPath);

      if (definition) {
        definitions.push(definition);
      }
    }

    definitions.sort(
      (left, right) =>
        left.name.localeCompare(
          right.name));

    this.cache = definitions;

    return definitions;
  }

  async loadDefinitionFromFile(
      filePath: string
    ): Promise<ArtefactDefinition | null>
  {
    this.logger.trace(
      'loadDefinitionFromFile(%s)',
      filePath);

    if (!path.isAbsolute(filePath)) {
      throw new Error(
        `'filePath' must be absolute: ${filePath}`);
    }

    const name =
      path.basename(
        filePath,
        path.extname(
          filePath));

    let content =
      await readFile(
        filePath,
        'utf8');

    if (content.startsWith('\uFEFF')) {
      content =
        content.slice(1);
    }

    return await this.parseDefinition(
      { path: filePath,
        name,
        content });
  }

  async parseDefinition(
      context: DefinitionParsingContext
    ): Promise<ArtefactDefinition | null>
  {
    this.logger.trace(
      'parseDefinition({ name: %s, content: ...%d chars })',
      context.name,
      context.content.length);

    const document =
      this.markdownDocumentProvider
        .parse(
          context.content);

    const contextNameSectionNode =
      document.getSectionNode(
        context.name);

    if (null === contextNameSectionNode
      || contextNameSectionNode.depth !== 1)
    {
      if (this.logger.level === 'trace') {
        const fileName =
          path.basename(
            context.path);

        this.logger.trace(
          'parseDefinitionFile() { no top-level %s found in %s }',
          context.name,
          fileName);
      }
        
      return null;
    }

    const description =
      extractDescription(
        document.root,
        context);

    this.logger.trace(
      'parseDefinition() { description is available }');

    const location =
      this.parseLocation(
        document);

    if (!location) {
      if (this.logger.level === 'trace') {
        const fileName =
          path.basename(
            context.path);

        this.logger.trace(
          'parseDefinitionFile() { no location found in %s }',
          fileName);
      }

      return null;
    }

    this.logger.trace(
      'parseDefinition() { location is available }');

    const rules =
      await this.parseRules(
        document,
        context);

    this.logger.trace(
      'parseDefinition() { rules are available }');

    const definition =
      { path: context.path,
        name: context.name,
        description,
        location,
        rules };

    this.logger.trace(
      'parseDefinition() { returning definition for %s }',
      context.name);

    return definition;
  }

  async parseRules(
      document: MarkdownDocument,
      context: DefinitionParsingContext
    ): Promise<ArtefactDefinitionRule[]>
  {
    this.logger.trace(
      'parseRules: parsing rules for %s',
      context.path);

    const rules: ArtefactDefinitionRule[] = [];

    const rulesPrimaryListItems =
      document.getSectionPrimaryListItems('Rules');

    if (
      rulesPrimaryListItems === null
      || rulesPrimaryListItems.length === 0)
    {
      this.logger.trace(
        'parseRules: no rules section found in %s',
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
        'parseRules: no list items found in %s',
        context.path);

      return rules;
    }

    for (const itemText of listItems) {
      const match =
        itemText.match(
          /^-\s+([A-Z]+\d+)\s*(?:[:-]\s*)?/);
          
      if (!match) {
        this.logger.trace(
          'parseRules: no match found for list item "%s" in %s',
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

  parseLocation(
      document: MarkdownDocument
    ): Location | null
  {
    const locationParametersList =
      document.getSectionPrimaryListItems('Location');

    if (locationParametersList === null
      || locationParametersList.length === 0)
    {
      this.logger.trace(
        'parseLocation() { no location section found }');

      return null;
    }

    const listItems =
      locationParametersList
        .map(
          item => document.getText(item).trim())
        .filter(
          itemText => itemText.length > 0);

    if (listItems.length === 0) {
      return null;
    }

    const patterns: string[] = [];

    const exclude: string[] = [];
    
    const filters: any[] = [];

    for (const itemText of listItems) {
      const typeMatch =
        itemText.match(
          /^Pattern\s*:\s*(.+)$/i);

      if (typeMatch) {
        patterns.push(
          typeMatch[1].trim());

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
      { patterns,
        exclude,
        filters };

    return location;
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
    context: DefinitionParsingContext
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
