import path
  from 'node:path';
import { findMarkdownFiles,
         readNode,
         RqNode }
  from './graph.js';

/**
 * Every markdown document of a folder and its subfolders, by absolute path.
 * Backlinks, ids and the links a change rewrites are looked for in it.
 */
export type Scope = Map<string, RqNode>;

export async function loadScope(
    folder: string
  ): Promise<Scope>
{
  const scope: Scope = new Map();

  for (const file of await findMarkdownFiles(folder)) {
    scope.set(
      file,
      await readNode(file));
  }

  return scope;
}

/**
 * The requirements that link to `target`.
 */
export function findBacklinks(
    scope: Scope,
    target: string
  ): string[]
{
  return [ ...scope.values() ]
    .filter(
      node => node.children.includes(target))
    .map(
      node => node.path);
}

/**
 * The documents, requirements or evidence, with a link to any of `targets`.
 */
export function findReferrers(
    scope: Scope,
    targets: ReadonlySet<string>
  ): string[]
{
  return [ ...scope.values() ]
    .filter(
      node =>
        getReferences(node).some(
          target => targets.has(target)))
    .map(
      node => node.path);
}

/**
 * The absolute paths of the local `.md` files a document links to, edges or
 * not.
 */
export function getReferences(
    node: RqNode
  ): string[]
{
  return node.links.map(
    link =>
      path.resolve(
        path.dirname(node.path),
        link));
}

/**
 * The next free id with the prefix, e.g. `RQ12` when the highest file name
 * that starts with `RQ<number>` is `RQ11 ...`.
 */
export function nextId(
    scope: Scope,
    prefix: string
  ): string
{
  const pattern =
    new RegExp(
      `^${prefix}(\\d+)(?:\\D|$)`);

  let highest = 0;

  for (const file of scope.keys()) {
    const match =
      pattern.exec(
        path.basename(file));

    if (match) {
      highest =
        Math.max(
          highest,
          Number(match[1]));
    }
  }

  return `${prefix}${highest + 1}`;
}
