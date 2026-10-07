/*
### RL2

Links to local resources must point to existing locations (files or
directories). Links that are longer than 20 characters must be a reference
link.
*/

import { type Nodes }
  from 'mdast';
import { access,
         readFile }
  from 'node:fs/promises';
import path
  from 'node:path';
import { type RuleValidationFunction }
  from '../rule-validation-function.js';

interface Resource
{
  kind: 'link' | 'image';
  url: string | undefined;
  reference: boolean;
}

export const validate: RuleValidationFunction =
  async (
      artefact,
      context
    ) =>
  {
  const articlePath =
    context.files.path(artefact);

  const content =
    await readFile(
      articlePath,
      'utf8');

  const document =
    context.markdownDocuments
    .parse(content);

  const definitions = new Map<string, string>();

  walk(
    document.root,
    (
        node
      ) =>
    {
      if (
        node.type === 'definition'
        && node.identifier
        && node.url
      ) {
        definitions.set(
          node.identifier.toLowerCase(),
          node.url);
      }
    });

  const resources: Resource[] = [ ];

  walk(
    document.root,
    (
        node
      ) =>
    {
      if (
        node.type === 'link'
        && node.url
      ) {
        resources.push(
          { kind: 'link',
            url: node.url,
            reference: false });
      }

      if (
        node.type === 'linkReference'
        && node.identifier
      ) {
        resources.push(
          { kind: 'link',
            url:
              definitions.get(
                node.identifier.toLowerCase()),
            reference: true });
      }

      if (
        node.type === 'image'
        && node.url
      ) {
        resources.push(
          { kind: 'image',
            url: node.url,
            reference: false });
      }

      if (
        node.type === 'imageReference'
        && node.identifier
      ) {
        resources.push(
          { kind: 'image',
            url:
              definitions.get(
                node.identifier.toLowerCase()),
            reference: true });
      }
    });

  for (const resource of resources) {
    const url = resource.url;

    if (!url) {
      continue;
    }

    // External URLs.
    if (
      url.startsWith('http://')
      || url.startsWith('https://')
      || url.startsWith('//')
      || /^[a-z]+:/i.test(url)
    ) {
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
      && !resource.reference
    ) {
      throw new Error(
        `${resource.kind} "${resourceUrl}" is longer than 20 characters and must use a reference ${resource.kind}.`);
    }

    const resourcePath =
      resourceUrl.startsWith('/')
      ? path.resolve(
        context.rootPath,
        resourceUrl.slice(1))
      : path.resolve(
        path.dirname(articlePath),
        resourceUrl);

    try {
      await access(
        resourcePath);
    } catch {
      throw new Error(
        `${resource.kind} "${url}" points to a non-existent location.`);
    }
  }
};

function walk(
    node: Nodes,
    callback: (node: Nodes) => void
  ): void
{
  callback(node);

  if ('children' in node) {
    for (const child of node.children) {
      walk(
        child,
        callback);
    }
  }
}
