import { findMarkdownFiles }
  from 'asljs-mdcli';
import { stat }
  from 'node:fs/promises';
import path
  from 'node:path';
import { getNodeId,
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
 * The documents, requirements or tests, with a link to any of `targets`.
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
 * The next free id with the prefix, e.g. `R12` when the highest file name
 * that starts with `R<number>` is `R11 ...`.
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

const NODE_ID = /^[RT]\d+$/;

/**
 * The absolute path a target names, in the working folder `cwd`:
 *
 * - an id such as `R10` or `T12` - the requirement or test with that id;
 * - a `.md` name - the file at that path when there is one, otherwise the
 *   file with that name;
 * - anything else - a path.
 *
 * Ids and names are searched for in `cwd` and its subfolders. An error when
 * one matches no document, or several.
 */
export async function resolveTarget(
    cwd: string,
    target: string
  ): Promise<string>
{
  const isId =
    NODE_ID.test(target);

  const resolved =
    path.resolve(
      cwd,
      target);

  if (
    !isId
    && (!target.toLowerCase().endsWith('.md')
        || await stat(resolved).then(
          () => true,
          () => false))
  ) {
    return resolved;
  }

  const name =
    path.basename(target)
    .toLowerCase();

  const matches =
    (await findMarkdownFiles(cwd))
    .filter(
      file =>
        isId
          ? getNodeId(file) === target
          : path.basename(file).toLowerCase() === name);

  if (matches.length !== 1) {
    throw new Error(
      matches.length === 0
        ? `${target}: no ${
          isId
            ? 'requirement or test has this id'
            : 'such file'
        } in ${cwd}.`
        : `${target}: several documents match: ${
          matches
            .map(
              file =>
                path.relative(
                  cwd,
                  file)
                  .split(path.sep)
                  .join('/'))
            .join(', ')
        }.`);
  }

  return matches[0];
}
