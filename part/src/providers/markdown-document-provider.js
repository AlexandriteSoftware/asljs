import { unified }
  from 'unified';
import remarkParse
  from 'remark-parse';
import { readFile }
  from 'node:fs/promises';

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
 *   { import('mdast')
 *       .Node }
 *   Node
 */

const MARKDOWN_PARSER =
  unified().use(remarkParse);


export class MarkdownDocumentProvider
{
  /**
   * @param {string} content
   * @returns {Root}
   */
  parse(
    content)
  {
    const document =
      MARKDOWN_PARSER.parse(
        content);
        
    return document;
  }

  /**
   * @param {string} path
   * @returns {Promise<Root>}
   */
  async load(
    path)
  {
    const content =
      await readFile(
        path,
        'utf8');

    const document =
      this.parse(content);

    return document;
  }
}

/**
 * @param {string} content 
 * @returns {string|null}
 */
export function extractHeading(
  content)
{
  const match =
    content.match(/^#\s+(.+)$/m);

  const heading =
    match
    ? match[1].trim()
    : null;

  return heading;
}

export function extractSectionBody(
  content,
  sectionName)
{
  const lines =
    content.split(/\r?\n/);

  let activeSection = null;

  const buffer =
    [];

  for (const line of lines) {
    const sectionMatch =
      line.match(/^##\s+(.+)$/);

    if (sectionMatch) {
      const currentSection =
        sectionMatch[1].trim();

      if (activeSection === sectionName) {
        break;
      }

      activeSection = currentSection;
      continue;
    }

    if (activeSection === sectionName) {
      buffer.push(line);
    }
  }

  if (buffer.length === 0) {
    return null;
  }

  return buffer.join('\n').trim();
}

export function parseLocationFolder(
  locationBody)
{
  const inlineCodeMatch =
    locationBody.match(/`([^`]+)`/);

  if (inlineCodeMatch) {
    return inlineCodeMatch[1].trim();
  }

  const proseMatch =
    locationBody.match(
      /stored in (?:the )?(.+?) folder/i);

  return proseMatch
? proseMatch[1].trim()
: null;
}

export function parsePropertyDefinitions(
  propertiesBody)
{
  const definitions =
    new Map();

  for (const match of propertiesBody.matchAll(
    /^-\s+([^:\n]+):/gm)) {
    const label =
      match[1].trim();

    definitions.set(
      normalizeLabel(label),
      toPropertyName(label));
  }

  return definitions;
}

/**
 * @param {RootContent[]} nodes 
 * @param {string} sectionName 
 * @returns {RootContent[] | null}
 */
export function getSection(
  nodes,
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

  return sectionNodes;
}

/**
 * @param {Node} node
 * @returns {string}
 */
export function extractText(
  node)
{
  if (!node) {
    return '';
  }

  const value =
    (/** @type {any} */ (node)).value;

  if (typeof value === 'string') {
    return value;
  }

  const children =
    (/** @type {any} */ (node)).children;

  if (Array.isArray(children)) {
    const text =
      children
        .map(
          childNode =>
            extractText(childNode))
        .join('');
    
    return text;
  }

  return '';
}

/**
 * @param {String} content
 * @param {RootContent[]} nodes
 * @returns {string}
 */
export function sliceNodes(
  content,
  nodes)
{
  if (nodes.length === 0) {
    return '';
  }

  const startOffset =
    nodes[0].position?.start?.offset;

  const endOffset =
    nodes[nodes.length - 1].position?.end?.offset;

  if (
    typeof startOffset !== 'number'
    || typeof endOffset !== 'number')
  {
    return '';
  }

  const fragment =
    content.slice(
      startOffset,
      endOffset);

  return fragment.trim();
}

export function parsePropertyValues(
  content,
  propertyDefinitions = new Map())
{
  const properties =
    {};

  for (const match of content.matchAll(
    /^-\s+([^:\n]+):\s+(.+)$/gm)) {
    const label =
      match[1].trim();

    const value =
      match[2].trim();

    const propertyName =
      propertyDefinitions.get(
        normalizeLabel(label)) ?? toPropertyName(label);

    properties[propertyName] = value;
  }

  return properties;
}

/**
 * @param {string} rulesBody 
 * @returns {string[]}
 */
export function parseRuleIds(
  rulesBody)
{
  return Array.from(
    rulesBody.matchAll(
      /^-\s+([A-Z]\d+)\b/gm),
    (match) => match[1]);
}

/**
 * @param {string} label 
 * @returns {string}
 */
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

/**
 * @param {string} label 
 * @returns {string}
 */
function normalizeLabel(
  label)
{
  return label
    .trim()
    .replace(
      /\s+/g,
      ' ')
    .toLowerCase();
}
