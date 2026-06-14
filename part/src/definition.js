import path
  from 'node:path';
import { readdir,
         readFile }
  from 'node:fs/promises';
import { unified }
  from 'unified';
import remarkParse
  from 'remark-parse';
import { toTypeId }
  from './providers/markdown.js';

const MARKDOWN_PARSER =
  unified().use(remarkParse);

export class Definition
{
  constructor(
    { definitionPath,
      name,
      description,
      location,
      properties,
      rules,
      propertyDefinitions,
      ruleIds })
  {
    this.definitionPath = definitionPath;
    this.name = name;
    this.description = description;
    this.location = location;
    this.properties = properties;
    this.rules = rules;
    this.typeId = toTypeId(name);
    this.propertyDefinitions = propertyDefinitions;
    this.ruleIds = ruleIds;
  }

  static async load(
    filePath,
    options = {})
  {
    const content =
      await readFile(
        filePath,
        'utf8');

    return Definition.parse(
      content,
      {
        ...options,
        filePath,
      });
  }

  static async parse(
    content,
    options = {})
  {
    const filePath =
      options.filePath
      ? path.resolve(
        options.filePath)
      : null;

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
      filePath
      ? path.basename(
          filePath,
          path.extname(filePath))
      : null;

    if (expectedName
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
            [ entry.normalizedLabel,
              entry.propertyName ]));

    const rulesSection =
      getSection(
        tree.children,
        content,
        'Rules');

    const ruleEntries =
      parseRules(
        rulesSection?.nodes ?? []);

    const rules =
      await loadRules(
        ruleEntries,
        {
          rootPath: options.rootPath,
          definitionPath: filePath,
          definitionName: name,
          typeId: toTypeId(name),
        });

    return new Definition({
      definitionPath: filePath,
      name,
      description,
      location,
      properties:
        Object.fromEntries(
          propertyEntries.map(
            entry =>
              [ entry.propertyName,
                entry.description])),
      rules,
      propertyDefinitions,
      ruleIds:
        rules.map(
          rule => rule.id),
    });
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

function getSection(
  nodes,
  content,
  sectionName)
{
  const headingIndex =
    nodes.findIndex(
      (node) =>
        node.type === 'heading'
        && node.depth === 2
        && extractText(node) === sectionName);

  if (headingIndex === -1) {
    return null;
  }

  const nextHeadingIndex =
    nodes.findIndex(
      (node, index) =>
        index > headingIndex
        && node.type === 'heading'
        && node.depth <= 2);

  const sectionNodes =
    nodes.slice(
      headingIndex + 1,
      nextHeadingIndex === -1
        ? undefined
        : nextHeadingIndex);

  return {
    nodes: sectionNodes,
    raw: sliceNodes(
      content,
      sectionNodes),
  };
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
        type: null,
        pattern: null,
        exclude: [],
        gitIgnore: false,
      };

    for (const itemText of listItems) {
      const typeMatch =
        itemText.match(
          /^(Files|Folders)\s*:\s*(.+)$/i);

      if (typeMatch) {
        location.type = normalizeLocationType(
          typeMatch[1]);

        location.pattern = typeMatch[2].trim();
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
        location.gitIgnore = true;
      }
    }

    if (location.type && location.pattern) {
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

function parseProperties(nodes)
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

function parseRules(nodes)
{
  return getListItemTexts(nodes)
    .map(
      (itemText) => itemText.match(
        /^([A-Z]+\d+)\s*(?:-\s*)?(.+)$/))
    .filter(
      (match) => match !== null)
    .map(
      (match) => ({
      id: match[1],
      description: match[2].trim(),
    }));
}

async function loadRules(
  ruleEntries,
  options)
{
  return Promise.all(
    ruleEntries.map(
      async (ruleEntry) => {
    const resolvedRuleFile =
      await resolveRuleFile(
        ruleEntry.id,
        options);

    return {
      id: ruleEntry.id,
      description: ruleEntry.description,
      filePath: resolvedRuleFile
? resolvedRuleFile.filePath
: null,
      absoluteFilePath: resolvedRuleFile
? resolvedRuleFile.absoluteFilePath
: null,
    };
  }));
}

async function resolveRuleFile(
  ruleId,
  options)
{
  if (!options.rootPath || !options.definitionName || !options.definitionPath) {
    return null;
  }

  const candidateDirectories =
    [
    path.join(
      path.dirname(
        options.definitionPath),
      'rules'),
    path.join(
      options.rootPath,
      'part'),
  ];

  const candidateBaseNames =
    [
    `${options.definitionName}_${ruleId}`,
    `${options.typeId}_${ruleId}`,
  ];

  for (const directoryPath of candidateDirectories) {
    let entries;

    try {
      entries = await readdir(
        directoryPath,
        {
        withFileTypes: true,
      });
    }
    catch {
      continue;
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

      if (!candidateBaseNames.includes(entryBaseName)) {
        continue;
      }

      const absoluteFilePath =
        path.join(
          directoryPath,
          entry.name);

      return {
        absoluteFilePath,
        filePath: toPosixPath(
          path.relative(
            path.dirname(
              options.definitionPath),
            absoluteFilePath)),
      };
    }
  }

  return null;
}

function getListItemTexts(nodes)
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

function sliceNodes(
  content,
  nodes)
{
  if (nodes.length === 0) {
    return '';
  }

  const startOffset =
    nodes[0].position?.start?.offset;

  const endOffset =
    nodes.at(
      -1)?.position?.end?.offset;

  if (typeof startOffset !== 'number' || typeof endOffset !== 'number') {
    return '';
  }

  return content.slice(
    startOffset,
    endOffset).trim();
}

function extractText(node)
{
  if (!node) {
    return '';
  }

  if (typeof node.value === 'string') {
    return node.value;
  }

  if (Array.isArray(
    node.children)) {
    return node.children.map(
      (childNode) => extractText(childNode)).join('');
  }

  return '';
}

function normalizeLocationType(value)
{
  return value.toLowerCase() === 'files'
? 'Files'
: 'Folders';
}

function toPropertyName(label)
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

function normalizeLabel(label)
{
  return label.trim().replace(
    /\s+/g,
    ' ').toLowerCase();
}

function toPosixPath(value)
{
  return value.replaceAll(
    '\\',
    '/');
}