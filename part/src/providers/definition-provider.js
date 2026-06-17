import path
  from 'node:path';
import { glob }
  from 'glob';
import { readdir,
         readFile }
  from 'node:fs/promises';
import { unified }
  from 'unified';
import remarkParse
  from 'remark-parse';
import { GitIgnore }
  from './git-ignore.js';
import { sliceNodes,
         extractText,
         getSection }
  from './markdown-query.js';

/**
 * @typedef
 *   { import('../artefact-definition.js')
 *       .ArtefactDefinition }
 *   ArtefactDefinition
 * @typedef
 *   { import('../artefact-definition.js')
 *       .ArtefactDefinitionRule }
 *   ArtefactDefinitionRule
 */

const MARKDOWN_PARSER =
  unified().use(remarkParse);

export class DefinitionProvider
{
  constructor(
    logger,
    rootPath,
    definitionsPath = rootPath)
  {
    this.logger = logger;
    this.rootPath = path.resolve(rootPath);

    this.definitionsPath =
      path.resolve(
        this.rootPath,
        definitionsPath);

    this.gitIgnore =
      new GitIgnore(
        this.logger);

    this.cache = null;
  }

  async getDefinitions() {
    if (this.cache) {
      return this.cache;
    }

    this.logger.trace(
      `DefinitionProvider.getDefinitions(): scanning for definitions in ${this.definitionsPath}`);

    const markdownPaths =
      await glob(
        '**/*.md',
        {
          absolute: true,
          cwd: this.definitionsPath,
          dot: true,
          nodir: true,
        });

    const visibleMarkdownPaths =
      this.gitIgnore.filter(markdownPaths);

    const definitions = [];

    for (const markdownPath of visibleMarkdownPaths) {
      const definition =
        await this.loadDefinitionFromFile(
          markdownPath,
          { rootPath: this.rootPath });

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

  /**
   * @param {string} filePath
   * @returns {Promise<ArtefactDefinition | null>}
   */
  async loadDefinitionFromFile(
    filePath)
  {
    this.logger.trace(
      `DefinitionProvider.loadDefinitionFromFile: start with filePath=${filePath}`);

    if (!path.isAbsolute(filePath)) {
      throw new Error(
        `'filePath' must be absolute: ${filePath}`);
    }

    const content =
      await readFile(
        filePath,
        'utf8');

    return await this.parseDefinition(
      content,
      { path: filePath });
  }

  /**
   * @param {string} content 
   * @param {{path: string}} context 
   * @returns {Promise<ArtefactDefinition|null>}
   */
  async parseDefinition(
    content,
    context)
  {
    this.logger.trace(
      `DefinitionProvider.parseDefinitionFile: ..., context=${JSON.stringify(context)}`);

    const tree =
      MARKDOWN_PARSER.parse(content);

    const heading =
      getFirstHeading(
        tree.children);

    if (!heading) {
      return null;
    }

    const name =
      extractText(heading);

    const expectedName =
      path.basename(
        context.path,
        path.extname(
          context.path));

    if (
      expectedName
      && name !== expectedName)
    {
      return null;
    }

    const description =
      extractDescription(
        content,
        tree.children,
        heading);

    const locationSection =
      getSection(
        tree.children,
        content,
        'Location');

    if (!locationSection) {
      return null;
    }

    const location =
      parseLocation(
        locationSection.raw,
        locationSection.nodes);

    if (!location) {
      return null;
    }

    const propertiesSection =
      getSection(
        tree.children,
        content,
        'Properties');

    const propertyEntries =
      parseProperties(
        propertiesSection?.nodes ?? []);

    const propertyDefinitions =
      new Map(
        propertyEntries.map(
          entry =>
            [entry.normalizedLabel,
            entry.propertyName]));

    const rulesSection =
      getSection(
        tree.children,
        content,
        'Rules');

    const ruleEntries =
      parseRules(
        rulesSection?.nodes
        ?? []);

    const rules =
      await this.loadRules(
        ruleEntries,
        {
          rootPath: this.rootPath,
          definitionPath: context.path,
          definition: name
        });

    return {
      path: context.path,
      name,
      description,
      location,
      properties:
        Object.fromEntries(
          propertyEntries.map(
            entry =>
              [entry.propertyName,
              entry.description])),
      rules,
      propertyDefinitions,
      ruleIds:
        rules.map(
          rule => rule.id)
    };
  }

  /**
   * @returns {Promise<ArtefactDefinitionRule[]>}
   */
  async loadRules(
    ruleEntries,
    context)
  {
    return Promise.all(
      ruleEntries.map(
        async ruleEntry => {
          const resolvedRuleFile =
            await this.resolveRuleFile(
              ruleEntry.id,
              context);
          
          /** @type {ArtefactDefinitionRule} */
          const rule =
            {
              id: ruleEntry.id,
              definition: context.definition,
              name: `${context.definition}_${ruleEntry.id}`,
              description: ruleEntry.description,
              path: resolvedRuleFile?.path ?? null
            };

          return rule;
        }));
  }

  async resolveRuleFile(
    ruleId,
    options)
  {
    this.logger.trace(
      `DefinitionProvider.resolveRuleFile: ruleId=${ruleId}, options=${JSON.stringify(options)}`);

    if (
      !options.rootPath
      || !options.definition
      || !options.definitionPath)
    {
      return null;
    }

    const directoryPath =
      path.join(
        path.dirname(
          options.definitionPath),
        'rules');

    const baseName =
      `${options.definition}_${ruleId}`;

    this.logger.trace(
      `DefinitionProvider.resolveRuleFile: looking for rule file in ${directoryPath} with baseName=${baseName}`);

    let entries;

    try {
      entries =
        await readdir(
          directoryPath,
          { withFileTypes: true });
    } catch (error) {
      this.logger.trace(
        `DefinitionProvider.resolveRuleFile: failed to read directory ${directoryPath}. Exception: ${error}.`);

      return null;
    }

    for (const entry of entries) {
      if (!entry.isFile()) {
        continue;
      }

      const entryBaseName =
        path.basename(
          entry.name,
          path.extname(
            entry.name));

      if (baseName !== entryBaseName) {
        continue;
      }

      const absoluteFilePath =
        path.join(
          directoryPath,
          entry.name);

      return {
        path: absoluteFilePath,
        relativePath: toPosixPath(
          path.relative(
            path.dirname(
              options.definitionPath),
            absoluteFilePath)),
      };
    }

    return null;
  }
}

function getFirstHeading(
  nodes)
{
  return nodes.find(
    node =>
      node.type === 'heading'
      && node.depth === 1)
    ?? null;
}

function extractDescription(
  content,
  nodes,
  heading)
{
  const headingIndex =
    nodes.indexOf(heading);

  const nextHeadingIndex =
    nodes.findIndex(
      (node, index) =>
        index > headingIndex
        && node.type === 'heading');

  const sectionNodes =
    nodes.slice(
      headingIndex + 1,
      nextHeadingIndex === -1
        ? undefined
        : nextHeadingIndex);

  return sliceNodes(
    content,
    sectionNodes);
}

function parseLocation(
  rawSection,
  nodes)
{
  const listItems =
    getListItemTexts(nodes);

  if (listItems.length > 0) {
    const location =
    {
      patterns: [],
      exclude: [],
      filters: [],
    };

    for (const itemText of listItems) {
      const typeMatch =
        itemText.match(
          /^(Files|Folders|Pattern)\s*:\s*(.+)$/i);

      if (typeMatch) {
        location.patterns.push(
          typeMatch[2].trim());

        continue;
      }

      const excludeMatch =
        itemText.match(
          /^Exclude\s*:\s*(.+)$/i);

      if (excludeMatch) {
        location.exclude.push(
          excludeMatch[1].trim());

        continue;
      }

      if (/^GitIgnore$/i.test(itemText)) {
        location.filters.push(
          { name: 'GitIgnore' });
      }
    }

    if (location.patterns.length > 0) {
      return location;
    }
  }

  const inlineCodeMatch =
    rawSection.match(/`([^`]+)`/);

  if (!inlineCodeMatch) {
    return null;
  }

  return {
    type: /folder/i.test(rawSection)
      ? 'Folders'
      : 'Files',
    pattern: inlineCodeMatch[1].trim(),
    exclude: [],
    gitIgnore: false,
  };
}

function parseProperties(
  nodes)
{
  return getListItemTexts(nodes)
    .map(
      (itemText) => itemText.match(
        /^(.*?)\s*(?::|-)\s+(.+)$/))
    .filter(
      (match) => match !== null)
    .map(
      (match) => {
        const label =
          match[1].trim();

        return {
          normalizedLabel: normalizeLabel(label),
          propertyName: toPropertyName(label),
          description: match[2].trim(),
        };
      });
}

function parseRules(
  nodes)
{
  const rules =
    getListItemTexts(nodes)
      .map(
        text =>
          text.match(
            /^([A-Z]+\d+)\s*(?:[:-]\s*)?(.+)$/))
      .filter(
        match => match !== null)
      .map(
        match => {
          const id =
            match[1];

          const description =
            match[2].trim();

          return {
            id,
            description
          };
        });

  return rules;
}

function getListItemTexts(
  nodes)
{
  return nodes
    .filter(
      (node) => node.type === 'list')
    .flatMap(
      (node) => node.children)
    .map(
      (item) => extractText(item).trim())
    .filter(
      (text) => text.length > 0);
}

function toPropertyName(
  label)
{
  const parts =
    label.match(
      /[A-Za-z0-9]+/g) ?? [];

  return parts
    .map(
      (part, index) => {
        const lowerPart =
          part.toLowerCase();

        return index === 0
          ? lowerPart
          : lowerPart.charAt(0).toUpperCase() + lowerPart.slice(1);
      })
    .join('');
}

function normalizeLabel(
  label)
{
  return label.trim().replace(
    /\s+/g,
    ' ').toLowerCase();
}

function toPosixPath(
  value)
{
  return value.replaceAll(
    '\\',
    '/');
}