import { type Location }
  from 'asljs-locator';
import { Logger,
         LoggerProvider,
         NullLoggerProvider }
  from 'asljs-logging';
import { glob }
  from 'glob';
import { List,
         Node }
  from 'mdast';
import { readFile }
  from 'node:fs/promises';
import path
  from 'node:path';
import { getListItemsAsText,
         getLists,
         getSections,
         getText,
         Section }
  from '../markdown-document-queries.js';
import { ArtefactDefinitionProperty }
  from '../model/artefact-definition-property.js';
import { ArtefactDefinitionRule }
  from '../model/artefact-definition-rule.js';
import { ArtefactDefinition }
  from '../model/artefact-definition.js';
import { MarkdownDocument }
  from '../model/markdown-document.js';
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

/**
 * Reads artefact definitions from definition documents: markdown files whose
 * level 1 heading matches the file name.
 */
export class MarkdownDefinitionReader
{
  constructor(
    private readonly logger: Logger,
    private readonly markdownDocumentProvider: MarkdownDocumentProvider
  )
  {
  }

  /**
   * Definitions documented in the `*.md` files of the folder and its
   * subfolders, sorted by name. Every file is read; `.gitignore` plays no part,
   * because the folder is named explicitly.
   */
  async readFolder(
    folderPath: string
  ): Promise<ArtefactDefinition[]>
  {
    this.logger.trace(
      'readFolder() { scanning for definitions in %s }',
      folderPath);

    const markdownPaths =
      await glob(
        '**/*.md',
        { absolute: true,
          cwd: folderPath,
          dot: true,
          nodir: true });

    const definitions: ArtefactDefinition[] = [ ];

    for (const markdownPath of markdownPaths) {
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

      definitions.push(
        artefactDefinition);
    }

    return definitions.sort(
      sortDefinitionsByName);
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

    const firstSection = sections[0];

    if (
      firstSection.level !== 1
      || firstSection.heading
         !== name
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

    const locations =
      locationSection
      ? this.#parseLocations(
        document,
        locationSection.nodes)
      : [ ];

    const properties =
      this.#parseProperties(
        document,
        sections);

    const ruleSections: Section[] = [ ];

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

    const rules: ArtefactDefinitionRule[] = [ ];

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

      const ruleId = ruleIdMatch[1];

      const ruleName = `${name}_${ruleId}`;

      const ruleDescription = ruleSection.markup;

      const rule: ArtefactDefinitionRule =
        { id: ruleId,
          definition: name,
          name: ruleName,
          heading: ruleSection.heading,
          content: ruleDescription };

      rules.push(rule);
    }

    const definition =
      { path: context.path,
        source: 'markdown',
        name,
        description,
        locations,
        properties,
        rules };

    this.logger.trace(
      'parse() { name: %s, rules: %d, locations: %d }',
      name,
      rules.length,
      locations.length);

    return definition;
  }

  #parseProperties(
    document: MarkdownDocument,
    sections: Section[]
  ): ArtefactDefinitionProperty[]
  {
    const propertiesSectionIndex =
      sections.findIndex(
        section => section.heading === 'Properties');

    if (propertiesSectionIndex < 0) {
      return [ ];
    }

    const propertySections: Section[] = [ ];

    for (
      let index =
        propertiesSectionIndex + 1;
      index < sections.length;
      index++
    ) {
      const section = sections[index];

      if (section.level <= 2) {
        break;
      }

      if (section.level !== 3) {
        continue;
      }

      propertySections.push(section);
    }

    if (propertySections.length === 0) {
      return [ ];
    }

    return propertySections
      .map(
        section =>
          this.#parsePropertySection(
            document,
            section))
      .filter(
        (property): property is ArtefactDefinitionProperty => property !== null);
  }

  #parsePropertySection(
    document: MarkdownDocument,
    section: Section
  ): ArtefactDefinitionProperty | null
  {
    let propertyTypeText = '';

    const descriptionNodes = [ ];

    let firstList: List | null = null;

    for (const node of section.content.nodes) {
      if (
        node.type === 'list'
        && !firstList
      ) {
        firstList =
          node as List;

        continue;
      }

      descriptionNodes.push(node);
    }

    if (firstList) {
      const listItems =
        getListItemsAsText(
          document,
          firstList);

      const typeListItem =
        listItems
        .find(
          itemText => /^Type:\s*/i.test(itemText)) || '';

      propertyTypeText =
        typeListItem
        .replace(
          /^Type:\s*/i,
          '')
        .trim();
    }

    let type = '';
    let isList = false;
    let isNullable = false;

    if (propertyTypeText) {
      const typeMatch =
        propertyTypeText.match(
          /^(.+?)(\[\])?(\?)?$/);

      if (typeMatch) {
        type =
          typeMatch[1].trim();

        isList = !!typeMatch[2];

        isNullable = !!typeMatch[3];
      }
    }

    const description =
      getText(
        document,
        descriptionNodes);

    return { name: section.heading,
             type,
             isList,
             isNullable,
             description };
  }

  #parseLocations(
    document: MarkdownDocument,
    nodes: Node[]
  ): Location[]
  {
    const locationLists =
      getLists(nodes);

    const locations: Location[] = [ ];

    for (const locationList of locationLists) {
      const listItems =
        getListItemsAsText(
          document,
          locationList);

      if (listItems.length === 0) {
        continue;
      }

      let pattern: string = '';

      const exclude: string[] = [ ];

      const filters: any[] = [ ];

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

      locations.push(location);
    }

    return locations;
  }
}

export function sortDefinitionsByName(
    first: ArtefactDefinition,
    second: ArtefactDefinition
  ): number
{
  const firstName = first.name;

  const secondName = second.name;

  if (firstName < secondName) {
    return -1;
  }

  if (firstName > secondName) {
    return 1;
  }

  return 0;
}

/**
 * Definitions documented in the `*.md` files of a folder and its subfolders,
 * for code outside a plugin factory; inside one, use
 * `context.readDefinitions`.
 */
export function readMarkdownDefinitions(
    folder: string,
    loggerProvider: LoggerProvider = new NullLoggerProvider()
  ): Promise<ArtefactDefinition[]>
{
  const reader =
    new MarkdownDefinitionReader(
      loggerProvider.getLogger(
        'MarkdownDefinitionReader'),
      new MarkdownDocumentProvider(
        loggerProvider.getLogger(
          'MarkdownDocumentProvider')));

  return reader.readFolder(
    path.resolve(folder));
}
