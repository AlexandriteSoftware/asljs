import { findMarkdownFiles,
         parseMarkdown,
         plainText,
         runCommand,
         writeMarkdown }
  from 'asljs-mdcli';
import { mkdir,
         readdir,
         readFile,
         rm,
         stat,
         writeFile }
  from 'node:fs/promises';
import path
  from 'node:path';
import { getNodeId }
  from './graph.js';

export type TestStatus = 'PASS' | 'FAIL';

export type Status = TestStatus | 'NOT RUN';

/**
 * The folder, under the requirements folder, that holds the execution
 * results.
 */
export const RESULTS_FOLDER = '.rq';

/**
 * The state of the git working directory a run was made in.
 */
export interface WorkingTree
{
  /**
   * The `HEAD` commit; `null` outside a git repository.
   */
  commit: string | null;

  /**
   * The current branch; `null` outside a repository or on a detached `HEAD`.
   */
  branch: string | null;

  /**
   * The `git status --porcelain` lines: a status code and a path.
   */
  changes: string[];
}

export interface TestResult
{
  /**
   * Absolute path of the test.
   */
  file: string;

  status: TestStatus;

  /**
   * A one-line summary, e.g. `2 steps` or `step 1 exited with code 1`.
   */
  note: string;

  /**
   * The commands and what they wrote to standard output and error.
   */
  output: string;
}

export interface Execution
{
  /**
   * ISO 8601 UTC.
   */
  date: string;

  /**
   * The command line, e.g. `rq test R10 --recurse`.
   */
  command: string;

  tree: WorkingTree;

  tests: TestResult[];
}

const EXECUTION_FILE_NAME =
  /^E(\d+)(?:\s.*)?\.md$/;

const RESULT_LINE =
  /^Result:\s*(PASS|FAIL)\b(?:\s+-\s+([\s\S]*))?/;

/**
 * A test's result in an execution.
 */
export interface RecordedResult
{
  status: TestStatus;
  note: string;
}

/**
 * A test's latest result and the execution file that holds it.
 */
export interface LatestResult extends RecordedResult
{
  execution: string;
}

/**
 * Reads the commit, branch and changed files of the git working directory
 * that `folder` is in.
 */
export async function readWorkingTree(
    folder: string
  ): Promise<WorkingTree>
{
  const git =
    async (
        args: string
      ): Promise<string | null> =>
    {
    try {
      const run =
        await runCommand(
          `git ${args}`,
          folder);

      return run.code === 0
        ? run.stdout
        : null;
    } catch {
      return null;
    }
  };

  const commit =
    (await git('rev-parse HEAD'))?.trim() || null;

  if (commit === null) {
    return { commit: null,
             branch: null,
             changes: [ ] };
  }

  return { commit,
           branch:
             (await git(
               'branch --show-current'))?.trim() || null,
           changes:
             ((await git(
               'status --porcelain -- .')) ?? '')
      .split(/\r?\n/)
      .map(
        line => line.trim())
      .filter(
        line => line !== '') };
}

/**
 * Writes an execution to `.rq/E<n> <slug>.md` under the requirements
 * folder, with the next free number, and returns the file's path.
 */
export async function writeExecution(
    folder: string,
    slug: string,
    execution: Execution
  ): Promise<string>
{
  const results =
    path.join(
      folder,
      RESULTS_FOLDER);

  await mkdir(
    results,
    { recursive: true });

  const files =
    await listExecutions(results);

  let next =
    files.length === 0
    ? 1
    : files[files.length - 1].number + 1;

  // Another run may take the number first: a number is reserved by creating
  // `E<n>.lock` exclusively, and is free only when no execution has it yet.
  for (
    let attempt = 0;
    attempt < 1000;
    attempt += 1
  ) {
    const lock =
      path.join(
        results,
        `E${next}.lock`);

    const reserved =
      await writeFile(
        lock,
        '',
        { flag: 'wx' })
      .then(
        () => true,
        (
            error: NodeJS.ErrnoException
          ) =>
        {
          if (error.code === 'EEXIST') {
            return false;
          }

          throw error;
        });

    if (reserved) {
      try {
        const taken =
          (await listExecutions(results))
          .some(
            entry => entry.number === next);

        if (!taken) {
          const title =
            `E${next} ${toSlug(slug)}`.trimEnd();

          const file =
            path.join(
              results,
              `${title}.md`);

          await writeMarkdown(
            file,
            formatExecution(
              title,
              folder,
              execution));

          return file;
        }
      } finally {
        await rm(
          lock,
          { force: true });
      }
    }

    next += 1;
  }

  throw new Error(
    `${results}: no free execution number after E${next}.`);
}

/**
 * The execution as markdown: the run and the working directory as a list,
 * then one section per test with its result and its output.
 */
export function formatExecution(
    title: string,
    folder: string,
    execution: Execution
  ): string
{
  const { tree } = execution;

  const passed =
    execution.tests.filter(
      test => test.status === 'PASS')
    .length;

  const lines =
    [ `# ${title}`,
      '',
      `- Date: ${execution.date}`,
      `- Command: \`${execution.command}\``,
      `- Result: ${
      passed === execution.tests.length
        ? 'PASS'
        : 'FAIL'
    } - ${passed} of ${execution.tests.length} tests passed`,
      `- Commit: ${tree.commit ?? 'none'}`,
      `- Branch: ${tree.branch ?? 'none'}`,
      tree.changes.length === 0
      ? '- Changed files: none'
      : '- Changed files:',
      ...tree.changes.map(
        change => `  - \`${change}\``) ];

  for (const test of execution.tests) {
    const fence =
      '`'.repeat(
        Math.max(
          3,
          ...[ ...test.output.matchAll(/`+/g) ]
          .map(
            match => match[0].length + 1)));

    lines.push(
      '',
      `## ${
        path.basename(
          test.file,
          '.md')
      }`,
      '',
      `- File: <${
        path.relative(
          folder,
          test.file)
          .split(path.sep)
          .join('/')
      }>`,
      `- Result: ${test.status}${
        test.note === ''
          ? ''
          : ` - ${
            test.note
              .replace(
                /\s+/g,
                ' ')
              .trim()
          }`
      }`);

    if (test.output.trim() !== '') {
      lines.push(
        '',
        `${fence}text`,
        test.output.trimEnd(),
        fence);
    }
  }

  return `${lines.join('\n')}\n`;
}

/**
 * The latest result of each test, by test id, from the executions under
 * the requirements folder: a test's result in the highest-numbered
 * execution that has it.
 */
export async function loadResults(
    folder: string
  ): Promise<Map<string, TestStatus>>
{
  return new Map(
    [ ...await loadLatestResults(folder) ]
      .map(
        (
          [id, result]
        ) => [ id,
               result.status ]));
}

/**
 * Like `loadResults`, with each result's note and execution file.
 */
export async function loadLatestResults(
    folder: string
  ): Promise<Map<string, LatestResult>>
{
  const results = new Map<string, LatestResult>();

  const files =
    await listExecutions(
      path.join(
        folder,
        RESULTS_FOLDER));

  const order = new Map<string, number>();

  for (const { file } of files) {
    const text =
      await readFile(
        file,
        'utf8');

    const time =
      Date.parse(
        /^- Date:\s*(\S+)/m.exec(text)?.[1] ?? '');

    for (
      const [id, result] of parseExecution(text)
    ) {
      // A result recorded with an earlier time, e.g. by `rq log --time`,
      // does not replace a later one; files are read in number order.
      if (
        !Number.isNaN(time)
        && time
           < (order.get(id)
              ?? -Infinity)
      ) {
        continue;
      }

      order.set(
        id,
        Number.isNaN(time)
          ? order.get(id) ?? -Infinity
          : time);

      results.set(
        id,
        { ...result,
          execution: file });
    }
  }

  return results;
}

/**
 * The result of each test section of an execution, by test id.
 */
export function parseExecution(
    text: string
  ): Map<string, RecordedResult>
{
  const results = new Map<string, RecordedResult>();

  let id: string | null = null;

  for (const node of parseMarkdown(text).children) {
    if (node.type === 'heading') {
      id =
        node.depth === 2
        ? getNodeId(
          `${plainText(node).trim()}.md`)
        : null;

      continue;
    }

    if (
      id === null
      || node.type !== 'list'
      || results.has(id)
    ) {
      continue;
    }

    for (const item of node.children) {
      const match =
        RESULT_LINE.exec(
          plainText(item).trim());

      if (match) {
        results.set(
          id,
          { status:
              match[1] as TestStatus,
            note: match[2]?.trim() ?? '' });

        break;
      }
    }
  }

  return results;
}

async function listExecutions(
    results: string
  ): Promise<{ number: number; file: string; }[]>
{
  const names =
    await readdir(results)
    .catch(
      () => [ ]);

  return names
    .map(
      name => ({ name,
                 match:
                   EXECUTION_FILE_NAME.exec(name) }))
    .filter(
      entry => entry.match !== null)
    .map(
      entry => ({ number:
                    Number(entry.match![1]),
                  file:
                    path.join(
                      results,
                      entry.name) }))
    .sort(
      (
        a,
        b
      ) => a.number - b.number);
}

function toSlug(
    text: string
  ): string
{
  return text
    .replace(
      /[\\/:*?"<>|\r\n]+/g,
      ' ')
    .replace(
      /\s+/g,
      ' ')
    .trim();
}

/**
 * How much the `.rq` folder may hold: `pruneExecutions` removes the oldest
 * execution files beyond these limits.
 */
export interface Retention
{
  maxFiles: number;
  maxBytes: number;
}

export const RETENTION: Readonly<Retention> =
  Object.freeze(
    { maxFiles: 300,
      maxBytes:
        50 * 1024 * 1024 });

/**
 * Removes the oldest execution files of the working folder's `.rq` folder
 * until it holds at most `maxFiles` of them and `maxBytes` in all. A file that
 * holds the latest result of a test is kept, so that no status is lost, and
 * so is the newest. Returns the removed files.
 */
export async function pruneExecutions(
    folder: string,
    retention: Readonly<Retention> = RETENTION
  ): Promise<string[]>
{
  const files =
    await listExecutions(
      path.join(
        folder,
        RESULTS_FOLDER));

  const ids =
    new Set(
      (await findMarkdownFiles(folder))
      .map(getNodeId)
      .filter(
        id => id !== null));

  const latest =
    new Set(
      [ ...await loadLatestResults(folder) ]
      .filter(
        (
          [id]
        ) => ids.has(id))
      .map(
        (
          [, result]
        ) => result.execution));

  const sizes = new Map<string, number>();

  for (const { file } of files) {
    sizes.set(
      file,
      (await stat(file)).size);
  }

  let count = files.length;

  let bytes =
    [ ...sizes.values() ]
    .reduce(
      (
        sum,
        size
      ) => sum + size,
      0);

  const removed: string[] = [ ];

  for (
    const { file } of files.slice(
      0,
      -1)
  ) {
    if (
      count <= retention.maxFiles
      && bytes <= retention.maxBytes
    ) {
      break;
    }

    if (latest.has(file)) {
      continue;
    }

    await rm(file);

    removed.push(file);
    count -= 1;
    bytes -= sizes.get(file)!;
  }

  return removed;
}
