/*
### RL2

Links to local resources must point to existing locations (files or
directories). Links that are longer than 20 characters must be a reference
link.
*/

import path
  from 'node:path';
import { readFile,
         access }
  from 'node:fs/promises';

/**
 * @typedef
 *   { import('mdast')
 *       .Node }
 *   Node
 * @typedef
 *   { import('mdast')
 *       .Parent }
 *   Parent
 * @typedef
 *   { import('mdast')
 *       .Definition }
 *   Definition
 */

/**
 * @type { import('asljs-part').RuleValidationFunction }
 */
export async function validate(
  artefact,
  context)
{
  const content =
    await readFile(
      artefact.path,
      'utf8');

  const document =
    context.markdownDocuments
      .parse(content);

  const definitions =
    new Map();

  walk(
    document.root,
    node =>
    {
      if (node.type === 'definition') {
        const definitionNode =
          /** @type {Definition} */ (node);

        if (
          definitionNode.identifier
          && definitionNode.url)
        {
          definitions.set(
            definitionNode.identifier.toLowerCase(),
            definitionNode.url);
        }
      }
    });

  /** @type { Array<{kind: 'link' | 'image',
   *                 url: string,
   *                 reference: boolean}> } */
  const resources = [];

  walk(
    document.root,
    node =>
    {
      if (node.type === 'link') {
        const linkNode =
          /** @type {import('mdast').Link} */ (node);

        if (linkNode.url) {
          resources.push(
            {
              kind: 'link',
              url: linkNode.url,
              reference: false
            });
        }
      }

      if (node.type === 'linkReference')
      {
        const linkReferenceNode =
          /** @type {import('mdast').LinkReference} */ (node);

        if (linkReferenceNode.identifier) {
          resources.push(
            {
              kind: 'link',
              url:
                definitions.get(
                  linkReferenceNode.identifier.toLowerCase()),
              reference: true
            });
        }

      }

      if (node.type === 'image') {
        const imageNode =
          /** @type {import('mdast').Image} */ (node);

        if (imageNode.url) {
          resources.push(
            {
              kind: 'image',
              url: imageNode.url,
              reference: false
            });
        }
      }

      if (node.type === 'imageReference') {
        const imageReferenceNode =
          /** @type {import('mdast').ImageReference} */ (node);

        if (imageReferenceNode.identifier) {
          resources.push(
            {
              kind: 'image',
              url:
                definitions.get(
                  imageReferenceNode.identifier.toLowerCase()),
              reference: true
            });
        }
      }
    });

  for (const resource of resources) {
    const url =
      resource.url;

    if (!url) {
      continue;
    }

    // External URLs.
    if (
      url.startsWith('http://')
      || url.startsWith('https://')
      || url.startsWith('//')
      || /^[a-z]+:/i.test(url))
    {
      continue;
    }

    const resourceUrl =
      decodeURIComponent(
        url.split('#')[0]);

    // Pure fragment links.
    if (resourceUrl === '') {
      continue;
    }

    if (
      resourceUrl.length > 20
      && !resource.reference)
    {
      throw new Error(
        `${resource.kind} "${resourceUrl}" is longer than 20 characters and must use a reference ${resource.kind}.`);
    }

    const resourcePath =
      path.resolve(
        resourceUrl.startsWith('/')
          ? context.rootPath
          : path.dirname(
            artefact.path),
        resourceUrl.startsWith('/')
          ? resourceUrl.slice(1)
          : resourceUrl);

    try {
      await access(
        resourcePath);
    }
    catch {
      throw new Error(
        `${resource.kind} "${url}" points to a non-existent location.`);
    }
  }
}

/**
 * 
 * @param {Node} node 
 * @param {(node: Node) => void} callback 
 */
function walk(
  node,
  callback)
{
  callback(node);

  const children =
    (/** @type {Parent} */ (node)).children;

  if (
    typeof children !== 'undefined'
    && Array.isArray(children))
  {
    for (const child of children) {
      walk(
        child,
        callback);
    }
  }
}