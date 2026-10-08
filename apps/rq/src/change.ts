import { mkdir,
         readFile,
         rm,
         stat,
         writeFile }
  from 'node:fs/promises';
import path
  from 'node:path';
import { formatLogEntry,
         LogEntry,
         LogStatus }
  from './document.js';
import { addImplementationLink,
         appendLogEntry,
         removeLinks,
         rewriteLinks,
         setTitle }
  from './edit.js';
import { getNodeKind,
         loadGraph,
         RqNode }
  from './graph.js';
import { Io }
  from './io.js';
import { display,
         readExisting }
  from './query.js';
import { findBacklinks,
         findReferrers,
         loadScope,
         nextId,
         Scope }
  from './scope.js';

export interface AddOptions
{
  kind: 'requirement' | 'evidence';

  /**
   * The requirement the new document is linked from.
   */
  parent: string;

  /**
   * The name after the id, e.g. `CSV export` for `RQ12 CSV export.md`.
   */
  name: string;

  /**
   * The statement of a requirement, the description of an evidence.
   */
  body?: string;

  /**
   * The commands of an evidence.
   */
  steps?: string[];

  /**
   * The path of the new document, instead of the one made from the id and
   * the name.
   */
  path?: string;

  /**
   * The folder the next id is looked for in; the working directory by
   * default.
   */
  in?: string;
}

/**
 * Creates a requirement or an evidence and links it from the `##
 * Implementation` list of a requirement. A requirement is created in the
 * parent's folder as `RQ<n> <name>.md`, an evidence in its `evidence`
 * subfolder as `EV<n> <name>.md`, with the next free number.
 */
export async function execAdd(
    io: Io,
    options: AddOptions
  ): Promise<number>
{
  const parent =
    await readRequirement(
      io,
      options.parent);

  const name =
    options.name.trim();

  if (
    name === ''
    || /[\\/]/.test(name)
  ) {
    throw new Error(
      `Invalid name: "${options.name}"; it must be non-empty and have no path separators.`);
  }

  let file: string;

  if (options.path !== undefined) {
    file =
      path.resolve(
        io.cwd,
        options.path);
  } else {
    const scope =
      await loadScope(
        path.resolve(
          io.cwd,
          options.in ?? '.'));

    const id =
      nextId(
        scope,
        options.kind === 'evidence'
        ? 'EV'
        : 'RQ');

    file =
      path.join(
        path.dirname(parent.path),
        ...options.kind === 'evidence'
        ? [ 'evidence' ]
        : [ ],
        `${id} ${name}.md`);
  }

  if (
    getNodeKind(file)
    !== options.kind
  ) {
    throw new Error(
      `${
        display(
          io,
          file)
      }: the file name of ${
        options.kind === 'evidence'
          ? 'an evidence must be EV<n> <name>.md'
          : 'a requirement must be RQ<n> <name>.md'
      }.`);
  }

  if (await exists(file)) {
    throw new Error(
      `${
        display(
          io,
          file)
      }: the file already exists.`);
  }

  const title =
    path.basename(
      file,
      path.extname(file));

  const body =
    options.body?.trim() ?? '';

  const sections =
    [ `# ${title}` ];

  if (body !== '') {
    sections.push(body);
  }

  if (options.kind === 'evidence') {
    sections.push(
      '## Steps',
      [ '```sh',
        ...options.steps ?? [ ],
        '```' ]
        .join('\n'));
  }

  await mkdir(
    path.dirname(file),
    { recursive: true });

  await writeFile(
    file,
    `${sections.join('\n\n')}\n`,
    'utf8');

  await writeText(
    parent.path,
    addImplementationLink(
      await readFile(
        parent.path,
        'utf8'),
      parent.path,
      file,
      title));

  io.stdout.write(
    `Created ${
      display(
        io,
        file)
    }\nLinked ${
      display(
        io,
        parent.path)
    } -> ${
      display(
        io,
        file)
    }\n`);

  return 0;
}

/**
 * Links an existing requirement or evidence from the `## Implementation` list
 * of a requirement. A link that would make a cycle is refused.
 */
export async function execLink(
    io: Io,
    options: { parent: string; child: string; }
  ): Promise<number>
{
  const parent =
    await readRequirement(
      io,
      options.parent);

  const child =
    await readExisting(
      io,
      options.child);

  if (parent.children.includes(child.path)) {
    throw new Error(
      `${
        display(
          io,
          parent.path)
      } already links to ${
        display(
          io,
          child.path)
      }.`);
  }

  const reachable =
    await loadGraph(child.path);

  if (
    child.path === parent.path
    || reachable.nodes.has(parent.path)
  ) {
    throw new Error(
      `${
        display(
          io,
          child.path)
      } leads back to ${
        display(
          io,
          parent.path)
      }; the link would make a cycle.`);
  }

  await writeText(
    parent.path,
    addImplementationLink(
      await readFile(
        parent.path,
        'utf8'),
      parent.path,
      child.path,
      child.title
        ?? path.basename(
          child.path,
          '.md')));

  io.stdout.write(
    `Linked ${
      display(
        io,
        parent.path)
    } -> ${
      display(
        io,
        child.path)
    }\n`);

  return 0;
}

/**
 * Removes every link from a requirement to a requirement or evidence; an
 * `## Implementation` item with the link goes with it.
 */
export async function execUnlink(
    io: Io,
    options: { parent: string; child: string; }
  ): Promise<number>
{
  const parent =
    await readRequirement(
      io,
      options.parent);

  const child =
    path.resolve(
      io.cwd,
      options.child);

  if (!parent.children.includes(child)) {
    throw new Error(
      `${
        display(
          io,
          parent.path)
      } does not link to ${
        display(
          io,
          child)
      }.`);
  }

  await writeText(
    parent.path,
    removeLinks(
      await readFile(
        parent.path,
        'utf8'),
      parent.path,
      target => target === child));

  io.stdout.write(
    `Unlinked ${
      display(
        io,
        parent.path)
    } -> ${
      display(
        io,
        child)
    }\n`);

  return 0;
}

/**
 * Deletes a requirement or an evidence and removes the links to it from the
 * documents of the `in` folder. A requirement that links to anything is kept
 * unless `recursive` is set; then the documents it links to that no other
 * requirement links to are deleted too, down the graph.
 */
export async function execRemove(
    io: Io,
    options: { file: string; recursive?: boolean; in?: string; }
  ): Promise<number>
{
  const node =
    await readExisting(
      io,
      options.file);

  if (
    node.children.length > 0
    && !options.recursive
  ) {
    throw new Error(
      `${
        display(
          io,
          node.path)
      } links to ${node.children.length} requirements or evidence; unlink them first, or remove it with --recursive.`);
  }

  const scope =
    await loadScope(
      path.resolve(
        io.cwd,
        options.in ?? '.'));

  scope.set(
    node.path,
    node);

  const removed =
    collectRemoved(
      scope,
      node.path,
      options.recursive === true);

  for (
    const referrer of findReferrers(
      scope,
      removed)
  ) {
    if (removed.has(referrer)) {
      continue;
    }

    await writeText(
      referrer,
      removeLinks(
        await readFile(
          referrer,
          'utf8'),
        referrer,
        target => removed.has(target)));

    io.stdout.write(
      `Updated ${
        display(
          io,
          referrer)
      }\n`);
  }

  for (const file of removed) {
    await rm(file);

    io.stdout.write(
      `Removed ${
        display(
          io,
          file)
      }\n`);
  }

  return 0;
}

/**
 * Moves or renames a requirement or an evidence, and rewrites the links to it
 * in the documents of the `in` folder and its own relative links. A level 1
 * heading that is the old file name becomes the new one, and so does the text
 * of `## Implementation` links that is the old heading.
 */
export async function execMove(
    io: Io,
    options: { file: string; destination: string; in?: string; }
  ): Promise<number>
{
  const node =
    await readExisting(
      io,
      options.file);

  let destination =
    path.resolve(
      io.cwd,
      options.destination);

  if ((await stat(destination).catch(() => null))?.isDirectory()) {
    destination =
      path.join(
        destination,
        path.basename(node.path));
  }

  if (
    getNodeKind(destination)
    !== node.kind
  ) {
    throw new Error(
      `${
        display(
          io,
          destination)
      }: the file name of ${
        node.kind === 'evidence'
          ? 'an evidence must be EV<n> <name>.md'
          : 'a requirement must be RQ<n> <name>.md'
      }.`);
  }

  if (await exists(destination)) {
    throw new Error(
      `${
        display(
          io,
          destination)
      }: the file already exists.`);
  }

  const oldName =
    path.basename(
      node.path,
      path.extname(node.path));

  const newName =
    path.basename(
      destination,
      path.extname(destination));

  const titles =
    node.title === oldName
      && oldName !== newName
    ? { oldTitle: oldName,
        newTitle: newName }
    : undefined;

  const scope =
    await loadScope(
      path.resolve(
        io.cwd,
        options.in ?? '.'));

  for (
    const referrer of findReferrers(
      scope,
      new Set(
        [ node.path ]))
  ) {
    if (referrer === node.path) {
      continue;
    }

    await writeText(
      referrer,
      rewriteLinks(
        await readFile(
          referrer,
          'utf8'),
        referrer,
        referrer,
        target =>
          target === node.path
            ? destination
            : null,
        titles));

    io.stdout.write(
      `Updated ${
        display(
          io,
          referrer)
      }\n`);
  }

  const sameFolder =
    path.dirname(node.path) === path.dirname(destination);

  let text =
    rewriteLinks(
      await readFile(
        node.path,
        'utf8'),
      node.path,
      destination,
      target =>
      target === node.path
        ? destination
        : sameFolder
        ? null
        : target);

  if (titles) {
    text =
      setTitle(
        text,
        newName);
  }

  await mkdir(
    path.dirname(destination),
    { recursive: true });

  await writeFile(
    destination,
    text,
    'utf8');

  await rm(node.path);

  io.stdout.write(
    `Moved ${
      display(
        io,
        node.path)
    } -> ${
      display(
        io,
        destination)
    }\n`);

  return 0;
}

/**
 * Appends an entry to the `## Log` of an evidence.
 */
export async function execLog(
    io: Io,
    options: { file: string; status: string; note?: string; time?: string; }
  ): Promise<number>
{
  const node =
    await readExisting(
      io,
      options.file);

  if (node.kind !== 'evidence') {
    throw new Error(
      `${
        display(
          io,
          node.path)
      } is a requirement; only evidence has a log.`);
  }

  if (
    options.status !== 'Passed'
    && options.status !== 'Failed'
  ) {
    throw new Error(
      `Invalid status: "${options.status}"; use Passed or Failed.`);
  }

  const time =
    options.time
    ?? (io.now ?? (() => new Date()))().toISOString();

  if (
    Number.isNaN(
      Date.parse(time))
  ) {
    throw new Error(
      `Invalid time: "${time}"; use ISO 8601, e.g. 2026-01-02T03:04:05Z.`);
  }

  const entry: LogEntry =
    { time,
      status:
        options.status as LogStatus,
      note: options.note ?? '' };

  await writeText(
    node.path,
    appendLogEntry(
      await readFile(
        node.path,
        'utf8'),
      entry));

  io.stdout.write(
    `Logged ${
      display(
        io,
        node.path)
    }: ${formatLogEntry(entry)}\n`);

  return 0;
}

async function readRequirement(
    io: Io,
    file: string
  ): Promise<RqNode>
{
  const node =
    await readExisting(
      io,
      file);

  if (node.kind !== 'requirement') {
    throw new Error(
      `${
        display(
          io,
          node.path)
      } is an evidence; only a requirement links to requirements and evidence.`);
  }

  return node;
}

/**
 * The file, and with `recursive` every document only removed documents link
 * to, down the graph.
 */
function collectRemoved(
    scope: Scope,
    file: string,
    recursive: boolean
  ): Set<string>
{
  const removed =
    new Set(
      [ file ]);

  let changed = recursive;

  while (changed) {
    changed = false;

    for (const removedFile of [ ...removed ]) {
      for (const child of scope.get(removedFile)?.children ?? [ ]) {
        if (
          !removed.has(child)
          && scope.has(child)
          && findBacklinks(
            scope,
            child)
            .every(
              backlink => removed.has(backlink))
        ) {
          removed.add(child);
          changed = true;
        }
      }
    }
  }

  return removed;
}

async function writeText(
    file: string,
    text: string
  ): Promise<void>
{
  await writeFile(
    file,
    text,
    'utf8');
}

async function exists(
    file: string
  ): Promise<boolean>
{
  return (await stat(file).catch(() => null)) !== null;
}
