import { AgentSpec,
         getAgentCommand }
  from 'asljs-mdcli';
import path
  from 'node:path';
import { getLogger,
         Io }
  from './io.js';
import { display }
  from './query.js';
import { pruneExecutions,
         readWorkingTree,
         TestResult,
         writeExecution }
  from './results.js';
import { runTest }
  from './run-test.js';
import { getStatuses,
         writeStatuses }
  from './status.js';
import { selectTargets }
  from './targets.js';

export interface TestOptions
{
  /**
   * Requirement or test files, folders, `.md` names or ids such as `R10` or
   * `T12`, in the working folder (`resolveTarget`).
   */
  targets: string[];

  /**
   * Run the tests of every requirement below a requirement target too; a
   * folder target always runs all its tests.
   */
  recurse?: boolean;

  /**
   * The slug of the execution file; built from the targets by default.
   */
  name?: string;

  /**
   * The command line the execution file records.
   */
  command?: string;

  /**
   * The `--ai` agent and model of instruction steps; the detected agent when
   * absent.
   */
  ai?: AgentSpec;
}

/**
 * Runs the tests of the targets, records them in `.rq/E<n> <slug>.md`
 * in the working folder, and reports every target, and with
 * `recurse` everything below it, by the latest results: this run's and, for
 * what it did not run, earlier ones. Returns the exit code: 0 when every
 * reported node passes and the graph has no structure errors.
 */
export async function execTest(
    io: Io,
    options: TestOptions
  ): Promise<number>
{
  const folder = io.cwd;

  const { graph, selected: reported } =
    await selectTargets(
      folder,
      options.targets,
      { recurse: options.recurse,
        directTests: true });

  let agent: Promise<string | null> | undefined;

  const context =
    { agent:
        () =>
      agent ??= getAgentCommand(
        { ...io,
          logger:
            getLogger(
              io,
              'rq.agent') },
        options.ai ?? {},
        'run',
        'RQ_AI_COMMAND'),
      logger:
        getLogger(
          io,
          'rq.test') };

  const tests: TestResult[] = [ ];

  for (const file of reported) {
    const node =
      graph.nodes.get(file)!;

    if (node.kind === 'test') {
      tests.push(
        await runTest(
          node,
          context));
    }
  }

  const execution =
    tests.length === 0
    ? null
    : await writeExecution(
      folder,
      options.name
        ?? options.targets
          .map(
            target =>
              path.basename(
                path.resolve(
                  io.cwd,
                  target),
                '.md'))
          .join(' '),
      { date:
          (io.now ?? (() => new Date()))().toISOString(),
        command:
          options.command
          ?? `rq test ${options.targets.join(' ')}`,
        tree:
          await (io.workingTree ?? readWorkingTree)(folder),
        tests });

  const run =
    new Map(
      tests.map(
        test => [ test.file,
                  test ]));

  const statuses =
    getStatuses(
      graph,
      { run,
        recalculate:
          new Set(reported) });

  // The requirements below a target that this run did not recalculate are
  // reported with the status their documents record.
  const recorded =
    reported
    .flatMap(
      file => graph.nodes.get(file)!.children)
    .filter(
      (
        file,
        index,
        all
      ) =>
        all.indexOf(file) === index
        && !reported.includes(file)
        && graph.nodes.get(file)?.kind === 'requirement');

  let failed = graph.errors.length > 0;

  for (const file of [ ...reported,
                       ...recorded ]) {
    const node =
      graph.nodes.get(file)!;

    const { status } = statuses.get(file)!;

    const message =
      node.kind === 'test'
      ? run.get(file)?.note ?? ''
      : statuses.get(file)!.message;

    failed ||= status !== 'PASS';

    io.stdout.write(
      `${status.padEnd(7)}  ${
        display(
          io,
          file)
      }${
        recorded.includes(file)
          ? ' (recorded)'
          : ''
      }${
        message === ''
          ? ''
          : ` - ${message}`
      }\n`);
  }

  for (const error of graph.errors) {
    io.stdout.write(
      `Error    ${error}\n`);
  }

  if (execution !== null) {
    io.stdout.write(
      `Results  ${
        display(
          io,
          execution)
      }\n`);

    for (
      const file of await writeStatuses(
        folder,
        graph,
        { results:
            tests.map(
              test => ({ ...test,
                         execution })),
          changed: reported })
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
        folder,
        io.retention)
    ) {
      io.stdout.write(
        `Removed  ${
          display(
            io,
            file)
        }\n`);
    }
  }

  return failed
    ? 1
    : 0;
}
