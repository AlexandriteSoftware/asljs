import path
  from 'node:path';
import { glob }
  from 'glob';
import { readdir,
         readFile }
  from 'node:fs/promises';
import { toPosixPath }
  from '../formatting.js';
import { GitIgnore }
  from './git-ignore.js';
import { extractText,
         getSection,
         MarkdownDocumentProvider }
  from './markdown-document-provider.js';

/**
 * @typedef
 *   { import('mdast')
 *       .Root }
 *   Root
 * @typedef
 *   { import('mdast')
 *       .RootContent }
 *   RootContent
 * @typedef
 *   { import('../artefact-definition.js')
 *       .ArtefactDefinition }
 *   ArtefactDefinition
 * @typedef
 *   { import('../artefact-definition.js')
 *       .ArtefactDefinitionRule }
 *   ArtefactDefinitionRule
 * @typedef
 *   { import('../location.js')
 *       .Location }
 *   Location
 * @typedef
 *   { import('../logging.js')
 *       .Logger }
 *   Logger
 */

/**
 * @typedef {Object} DefinitionParsingContext
 * @property {Logger} logger
 * @property {string} path
 * @property {string} name
 * @property {string} content
 */

/**
 * @property {string} partsDirectoryName
 */
export class DefinitionProvider
{
  /**
   * @param {Logger} logger 
   * @param {string} rootPath 
   * @param {string} definitionsPath 
   */
  constructor(
    logger,
    rootPath,
    definitionsPath = rootPath)
  {
    this.logger = logger;
    this.rootPath = path.resolve(rootPath);

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

  async getDefinitions() {
    if (this.cache) {
      return this.cache;
    }

    this.logger.trace(
      `DefinitionProvider.getDefinitions(): scanning for definitions in ${this.definitionsPath}`);

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

    const name =
      path.basename(
        filePath,
        path.extname(
          filePath));

    const content =
      await readFile(
        filePath,
        'utf8');

    return await this.parseDefinition(
      { logger: this.logger,
        path: filePath,
        name,
        content });
  }

  /**
   * @param {Root} document
   * @param {DefinitionParsingContext} context
   */
  checkHeader(
    document,
    context)
  {
    const heading =
      getTopHeading(
        document);

    if (!heading) {
      return false;
    }

    const name =
      extractText(heading);

    if (name !== context.name) {
      return false;
    }

    return true;
  }

  /**
   * @param {DefinitionParsingContext} context 
   * @returns {Promise<ArtefactDefinition|null>}
   */
  async parseDefinition(
    context)
  {
    this.logger.trace(
      `DefinitionProvider.parseDefinitionFile: ..., path=${context.path}`);

    const document =
      this.markdownDocumentProvider
        .parse(
          context.content);

    if (
      !this.checkHeader(
        document,
        context))
    {
      this.logger.trace(
        `DefinitionProvider.parseDefinitionFile: header check failed for ${context.path}`);
        
      return null;
    }

    const description =
      extractDescription(
        document,
        context);

    const location =
      parseLocation(
        document);

    if (!location) {
      this.logger.trace(
        `DefinitionProvider.parseDefinitionFile: location parsing failed for ${context.path}`);

      return null;
    }

    const propertiesSection =
      getSection(
        document.children,
        'Properties');

    const propertyEntries =
      parseProperties(
        propertiesSection ?? []);

    const propertyDefinitions =
      new Map(
        propertyEntries.map(
          entry =>
            [ entry.normalizedLabel,
              entry.propertyName ]));

    const rules =
      await this.parseRules(
        document,
        context);

    return {
      path: context.path,
      name: context.name,
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
   * 
   * @param {string} ruleId 
   * @param {string} definition 
   * @param {string} definitionPath 
   * @returns {Promise<{path: string, relativePath: string} | null>}
   */
  async resolveRuleFile(
    ruleId,
    definition,
    definitionPath)
  {
    this.logger.trace(
      `DefinitionProvider.resolveRuleFile: ruleId=${ruleId}, definition=${definition}, definitionPath=${definitionPath}`);

    if (
      !definition
      || !definitionPath)
    {
      return null;
    }

    const directoryPath =
      path.join(
        path.dirname(
          definitionPath),
        'parts');

    const baseName =
      `${definition}_${ruleId}`;

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
        relativePath:
          toPosixPath(
            path.relative(
              path.dirname(
                definitionPath),
              absoluteFilePath)),
      };
    }

    return null;
  }

  /**
   * @param {Root} document
   * @param {DefinitionParsingContext} context
   * @returns {Promise<ArtefactDefinitionRule[]>}
   */
  async parseRules(
    document,
    context)
  {
    context.logger.trace(
      `DefinitionProvider.parseRules: parsing rules for ${context.path}`);

    /** @type {ArtefactDefinitionRule[]} */
    const rules = [];

    /** @type {RootContent[]} */
    const sectionNodes = [];

    let inSection = false;

    for (const node of document.children) {
      if (
        inSection
        && node.type === 'heading')
      {
        break;
      }

      if (
        node.type === 'heading'
        && node.depth === 2
        && extractText(node).toLowerCase() === 'rules')
      {
        inSection = true;
        continue;
      }

      if (inSection) {
        sectionNodes.push(node);
      }
    }

    if (sectionNodes.length === 0) {
      context.logger.trace(
        `DefinitionProvider.parseRules: no rules section found in ${context.path}`);

      return rules;
    }

    const rulesList =
      sectionNodes
        .find(
          node =>
            node.type === 'list');

    if (!rulesList) {
      context.logger.trace(
        `DefinitionProvider.parseRules: no list section found in ${context.path}`);

      return rules;
    }

    const listItems =
      rulesList.children
        .filter(
          item => item.type === 'listItem')
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
      context.logger.trace(
        `DefinitionProvider.parseRules: no list items found in ${context.path}`);

      return rules;
    }

    for (const itemText of listItems) {
      const match =
        itemText.match(
          /^-\s+([A-Z]+\d+)\s*(?:[:-]\s*)?/);
          
      if (!match) {
        context.logger.trace(
          `DefinitionProvider.parseRules: no match found for list item "${itemText}" in ${context.path}`);

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

      const resolvedRuleFile =
        await this.resolveRuleFile(
          id,
          context.name,
          context.path);

      rules.push(
        { id,
          definition: context.name,
          name,
          description,
          path:
            resolvedRuleFile?.path
            ?? null });
    }

    return rules;
  }
}

/**
 * 
 * @param {Root} document
 * @returns {RootContent | null}
 */
function getTopHeading(
  document)
{
  return document
    .children
    .find(
      node =>
        node.type === 'heading'
        && node.depth === 1)
      ?? null;
}

/**
 * 
 * @param {Root} document 
 * @param {DefinitionParsingContext} context
 * @returns {string}
 */
function extractDescription(
  document,
  context)
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

/**
 * @param {Root} document
 * @returns {Location|null}
 */
function parseLocation(
  document)
{
  /** @type {RootContent[]} */
  const sectionNodes = [];

  let inSection = false;

  for (const node of document.children) {
    if (
      inSection
      && node.type === 'heading')
    {
      break;
    }

    if (
      node.type === 'heading'
      && node.depth === 2
      && extractText(node).toLowerCase() === 'location')
    {
      inSection = true;
      continue;
    }

    if (inSection) {
      sectionNodes.push(node);
    }
  }

  if (sectionNodes.length === 0) {
    return null;
  }

  const locationParametersList =
    sectionNodes
      .find(
        node =>
          node.type === 'list');

  if (!locationParametersList) {
    return null;
  }

  const listItems =
    locationParametersList.children
      .filter(
        item => item.type === 'listItem')
      .map(
        item => extractText(item).trim())
      .filter(
        itemText => itemText.length > 0);

  if (listItems.length === 0) {
    return null;
  }

  /** @type {string[]} */
  const patterns = [];

  /** @type {string[]} */
  const exclude = [];
  
  /** @type {any[]} */
  const filters = [];

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

  /** @type {Location} */
  const location =
    { patterns,
      exclude,
      filters };

  return location;
}

function parseProperties(
  nodes,
  content)
{
  return getListItemTexts(
    nodes,
    content)
    .map(
      itemText =>
        itemText.match(
          /^(.*?)\s*(?::|-)\s+(.+)$/))
    .filter(
      match =>
        match !== null)
    .map(
      match => {
        const label =
          match[1].trim();

        return {
          normalizedLabel: normalizeLabel(label),
          propertyName: toPropertyName(label),
          description: match[2].trim(),
        };
      });
}

/**
 * @param {RootContent[]} nodes
 * @returns {string[]}
 */
function getListItemTexts(
  nodes)
{
  const listNode =
    nodes.find(
      node => node.type === 'list');

  if (!listNode) {
    return [];
  }

  const items =
    listNode.children.map(
      item => extractText(item).trim());

  return items;
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
