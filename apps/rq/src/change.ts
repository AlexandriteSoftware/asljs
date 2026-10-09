import { mkdir,
         readFile,
         rm,
         stat }
  from 'node:fs/promises';
import path
  from 'node:path';
import { addImplementationLink,
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
import { writeMarkdown }
  from './post-process.js';
import { display,
         readExisting }
  from './query.js';
import { pruneExecutions,
         readWorkingTree,
         TestResult,
         writeExecution }
  from './results.js';
import { findBacklinks,
         findReferrers,
         loadScope,
         nextId,
         resolveTarget,
         Scope }
  from './scope.js';
import { writeStatuses }
  from './status.js';

export interface AddOptions
{
  kind: 'requirement' | 'test';

  /**
   * The requirement the new document is linked from.
   */
  parent: string;

  /**
   * The name after the id, e.g. `CSV export` for `R12 CSV export.md`.
   */
  name: string;

  /**
   * The statement of a requirement, the description of a test.
   */
  body?: string;

  /**
   * The commands of a test.
   */
  steps?: string[];

  /**
   * The path of the new document, instead of the one made from the id and
   * the name.
   */
  path?: string;
}

/**
 * Creates a requirement or a test and links it from the `##
 * Implementation` list of a requirement. A requirement is created in the
 * parent's folder as `R<n> <name>.md`, a test in its `tests`
 * subfolder as `T<n> <name>.md`, with the next free number.
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
      await loadScope(io.cwd);

    const id =
      nextId(
        scope,
        options.kind === 'test'
        ? 'T'
        : 'R');

    file =
      path.join(
        path.dirname(parent.path),
        ...options.kind === 'test'
        ? [ 'tests' ]
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
        options.kind === 'test'
          ? 'a test must be T<n> <name>.md'
          : 'a requirement must be R<n> <name>.md'
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

  if (options.kind === 'test') {
    sections.push(
      '## Steps',
      ...(options.steps ?? [ ]).flatMap(
        (
          step,
          index
        ) => [ `### Step ${index + 1}`,
               [ '```sh',
                 step,
                 '```' ]
            .join('\n') ]));
  }

  await mkdir(
    path.dirname(file),
    { recursive: true });

  await writeMarkdown(
    file,
    `${sections.join('\n\n')}\n`);

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

  await refreshStatuses(io);

  return 0;
}

/**
 * Links an existing requirement or test from the `## Implementation` list
 * of a requirement. A link that would make a cycle, or give a requirement a
 * second parent in the working folder, is refused.
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

  if (child.kind === 'requirement') {
    const scope =
      await loadScope(io.cwd);

    const [other] =
      findBacklinks(
        scope,
        child.path);

    if (other !== undefined) {
      throw new Error(
        `${
          display(
            io,
            child.path)
        } is already linked from ${
          display(
            io,
            other)
        }; a requirement has one parent.`);
    }
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

  await refreshStatuses(io);

  return 0;
}

/**
 * Removes every link from a requirement to a requirement or test; an
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

  // A link to a file that no longer exists is still unlinked by its path.
  const child =
    await resolveTarget(
      io.cwd,
      options.child)
    .catch(
      () =>
        path.resolve(
          io.cwd,
          options.child));

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

  await refreshStatuses(io);

  return 0;
}

/**
 * Deletes a requirement or a test and removes the links to it from the
 * documents of the working folder. A requirement that links to anything is kept
 * unless `recursive` is set; then the documents it links to that no other
 * requirement links to are deleted too, down the graph.
 */
export async function execRemove(
    io: Io,
    options: { file: string; recursive?: boolean; }
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
      } links to ${node.children.length} requirements or tests; unlink them first, or remove it with --recursive.`);
  }

  const scope =
    await loadScope(io.cwd);

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

  await refreshStatuses(io);

  return 0;
}

/**
 * Moves or renames a requirement or a test, and rewrites the links to it
 * in the documents of the working folder and its own relative links. A level 1
 * heading that is the old file name becomes the new one, and so does the text
 * of `## Implementation` links that is the old heading.
 */
export async function execMove(
    io: Io,
    options: { file: string; destination: string; }
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
        node.kind === 'test'
          ? 'a test must be T<n> <name>.md'
          : 'a requirement must be R<n> <name>.md'
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
    await loadScope(io.cwd);

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

  await writeMarkdown(
    destination,
    text);

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

  await refreshStatuses(io);

  return 0;
}

/**
 * Records a result established another way: writes an execution with the
 * one test to `.rq/E<n> <test>.md` in the working folder, then the
 * statuses that follow (`writeStatuses`).
 */
export async function execLog(
    io: Io,
    options: {
    file: string;
    status: string;
    note?: string;
    time?: string;
    command?: string;
  }
  ): Promise<number>
{
  const node =
    await readExisting(
      io,
      options.file);

  if (node.kind !== 'test') {
    throw new Error(
      `${
        display(
          io,
          node.path)
      } is a requirement; only a test has a result.`);
  }

  if (
    options.status !== 'PASS'
    && options.status !== 'FAIL'
  ) {
    throw new Error(
      `Invalid status: "${options.status}"; use PASS or FAIL.`);
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

  const result: TestResult =
    { file: node.path,
      status: options.status,
      note: options.note ?? '',
      output: '' };

  const execution =
    await writeExecution(
      io.cwd,
      path.basename(
        node.path,
        '.md'),
      { date: time,
        command:
          options.command
        ?? `rq log ${options.file} --status ${options.status}`,
        tree:
          await (io.workingTree ?? readWorkingTree)(io.cwd),
        tests:
          [ result ] });

  io.stdout.write(
    `Logged ${
      display(
        io,
        node.path)
    }: ${result.status}${
      result.note === ''
        ? ''
        : ` - ${result.note}`
    }\nResults  ${
      display(
        io,
        execution)
    }\n`);

  for (
    const file of await writeStatuses(
      io.cwd,
      await loadGraph(node.path),
      { results:
          [ { ...result,
              execution } ] })
  ) {
    io.stdout.write(
      `Updated  ${
        display(
          io,
          file)
      }\n`);
  }

  for (
    const file of await pruneExecutions(
      io.cwd,
      io.retention)
  ) {
    io.stdout.write(
      `Removed  ${
        display(
          io,
          file)
      }\n`);
  }

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
      } is a test; only a requirement links to requirements and tests.`);
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
  await writeMarkdown(
    file,
    text);
}

async function exists(
    file: string
  ): Promise<boolean>
{
  return (await stat(file).catch(() => null)) !== null;
}

/**
 * Brings the `## Status` results that a structural change may have made
 * stale up to date, in the documents that have one.
 */
async function refreshStatuses(
    io: Io
  ): Promise<void>
{
  for (
    const file of await writeStatuses(
      io.cwd,
      { folder: io.cwd,
        roots: [ ],
        nodes: new Map(),
        errors: [ ] },
      { changed: 'all',
        existingOnly: true })
  ) {
    io.stdout.write(
      `Updated ${
        display(
          io,
          file)
      }\n`);
  }
}
