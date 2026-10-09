import { type Logger,
         NullLogger }
  from 'asljs-logging';
import { askAgent,
         CommandRun,
         runCommand,
         runProgram,
         verdictInstructions }
  from 'asljs-mdcli';
import path
  from 'node:path';
import { RqNode }
  from './graph.js';
import { TestResult }
  from './results.js';
import { DotnetStep,
         InstructionStep,
         JavaScriptStep,
         TestStep }
  from './steps.js';

/**
 * How a test is run: `agent` gives the command line of the AI agent for
 * instruction steps, or `null` when there is none; it is called only when a
 * test reaches such a step.
 */
export interface RunContext
{
  agent: () => Promise<string | null>;

  /**
   * Runs `node` and `dotnet`; `runProgram` when absent.
   */
  program?: typeof runProgram;

  /**
   * Where the test, each command it runs and its agent are logged; nothing
   * is logged when absent.
   */
  logger?: Logger;
}

interface StepOutcome
{
  ok: boolean;
  message: string;
}

/**
 * Runs the steps of a test document one after another in its folder,
 * stopping at the first that fails. The output names each step, then holds
 * each command it ran, after `$ `, with what it wrote to standard output and
 * error, or the agent's answer.
 */
export async function runTest(
    node: RqNode,
    context: RunContext
  ): Promise<TestResult>
{
  const output: string[] = [ ];

  const logger =
    (context.logger ?? new NullLogger())
    .scope(
      { test: node.path });

  const scoped =
    { ...context,
      logger };

  logger.debug(
    { steps: node.steps.length },
    'test started');

  const result =
    (
        status: TestResult['status'],
        note: string
      ): TestResult =>
    {
    logger.debug(
      { status,
        note },
      'test finished');

    return { file: node.path,
             status,
             note,
             output:
               output.join('') };
  };

  if (node.stepProblems.length > 0) {
    return result(
      'FAIL',
      node.stepProblems[0].replace(
        /\.$/,
        ''));
  }

  if (node.steps.length === 0) {
    return result(
      'FAIL',
      'no steps');
  }

  for (const [index, step] of node.steps.entries()) {
    output.push(
      `[step ${index + 1}] ${step.title}\n`);

    const outcome =
      await runStep(
        node,
        step,
        scoped,
        output);

    if (!outcome.ok) {
      return result(
        'FAIL',
        `step ${index + 1} (${step.title}) ${outcome.message}`);
    }
  }

  return result(
    'PASS',
    node.steps.length === 1
      ? '1 step'
      : `${node.steps.length} steps`);
}

/**
 * The `node` arguments of a JavaScript step: the TAP reporter, so that a run
 * of no test shows, and the caption escaped as a test name pattern.
 */
export function getNodeTestArgs(
    step: JavaScriptStep
  ): string[]
{
  return [ '--test',
           '--test-reporter=tap',
           ...step.test === null
      ? [ ]
      : [ '--test-name-pattern',
          step.test.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&') ],
           step.file ];
}

/**
 * Whether TAP output of `node --test` ran no test: a file whose tests the
 * pattern filters out still passes, with an empty plan.
 */
export function ranNoNodeTest(
    output: string
  ): boolean
{
  return /^\s*1\.\.0\s*$/m.test(output);
}

/**
 * The `dotnet` arguments of a .NET step.
 */
export function getDotnetTestArgs(
    step: DotnetStep
  ): string[]
{
  return [ 'test',
           ...step.project === null
      ? [ ]
      : [ step.project ],
           ...step.filter === null
      ? [ ]
      : [ '--filter',
          step.filter ] ];
}

/**
 * Whether `dotnet test` output says it ran no test, which it reports with
 * exit code 0.
 */
export function ranNoDotnetTest(
    output: string
  ): boolean
{
  return /No test matches the given testcase filter|No test is available/i
    .test(output);
}

async function runStep(
    node: RqNode,
    step: TestStep,
    context: RunContext,
    output: string[]
  ): Promise<StepOutcome>
{
  const cwd =
    path.dirname(node.path);

  const logger =
    context.logger ?? new NullLogger();

  switch (step.type) {
    case 'shell':
      for (const command of step.commands) {
        const outcome =
          await run(
            command,
            () =>
            runCommand(
              command,
              cwd),
            output,
            logger);

        if (!outcome.ok) {
          return outcome;
        }
      }

      return { ok: true,
               message: '' };

    case 'javascript': {
      const args =
        getNodeTestArgs(step);

      const outcome =
        await run(
          formatCommand(
            'node',
            args),
          () =>
          (context.program ?? runProgram)(
            process.execPath,
            args,
            cwd,
            withoutTestContext()
          ),
          output,
          logger);

      return outcome.ok
          && ranNoNodeTest(
            output.at(-1) ?? '')
        ? { ok: false,
            message: 'ran no test' }
        : outcome;
    }

    case 'dotnet': {
      const args =
        getDotnetTestArgs(step);

      const outcome =
        await run(
          formatCommand(
            'dotnet',
            args),
          () =>
          (context.program ?? runProgram)(
            'dotnet',
            args,
            cwd
          ),
          output,
          logger);

      return outcome.ok
          && ranNoDotnetTest(
            output.at(-1) ?? '')
        ? { ok: false,
            message: 'ran no test' }
        : outcome;
    }

    case 'instruction':
      return await instruct(
        node,
        step,
        context,
        output);
  }
}

/**
 * Runs a command and records it, as `$ <command>`, and its output as one
 * entry of `output`.
 */
async function run(
    command: string,
    start: () => Promise<CommandRun>,
    output: string[],
    logger: Logger
  ): Promise<StepOutcome>
{
  let text = `$ ${command}\n`;

  logger.debug(
    { command },
    'step command started');

  let commandRun;

  try {
    commandRun = await start();
  } catch (error) {
    logger.debug(
      error as Error,
      'step command failed to start');

    output.push(text);

    return { ok: false,
             message:
               `did not start: ${
        error instanceof Error
          ? error.message
          : String(error)
      }` };
  }

  for (const stream of [ commandRun.stdout,
                         commandRun.stderr ]) {
    if (stream !== '') {
      text += stream.endsWith('\n')
        ? stream
        : `${stream}\n`;
    }
  }

  output.push(text);

  logger.debug(
    { code: commandRun.code },
    'step command exited');

  if (commandRun.code === 0) {
    return { ok: true,
             message: '' };
  }

  // The first line that names an error says more than the last, which is
  // often a runtime's version or a stack frame.
  const lines =
    (commandRun.stderr.trim() || commandRun.stdout.trim())
    .split(/\r?\n/)
    .map(
      line => line.trim())
    .filter(
      line => line !== '');

  const lastLine =
    (lines.find(
      line => /error|fail/i.test(line))
    ?? lines.at(-1)
    ?? '')
    .slice(
      0,
      200);

  return { ok: false,
           message:
             `exited with code ${commandRun.code}${
      lastLine === ''
        ? ''
        : `: ${lastLine}`
    }` };
}

async function instruct(
    node: RqNode,
    step: InstructionStep,
    context: RunContext,
    output: string[]
  ): Promise<StepOutcome>
{
  const command =
    await context.agent();

  if (command === null) {
    return { ok: false,
             message:
               'needs an AI agent; install claude or copilot, or set RQ_AI_COMMAND' };
  }

  const verdict =
    await askAgent(
      command,
      path.dirname(node.path),
      [ 'Carry out one step of a test of a software project, then judge',
        'whether it passed. Read files and run commands as the step needs,',
        'but do not change any file.',
        '',
        `Test: ${node.path}`,
        `Title: ${
        node.title
          ?? path.basename(
            node.path,
            '.md')
      }`,
        ...node.body === ''
        ? [ ]
        : [ '',
            node.body ],
        '',
        `Step: ${step.title}`,
        '',
        step.text,
        '',
        ...verdictInstructions(
          'why the step failed') ]
      .join('\n')
      + '\n',
      context.logger);

  output.push(
    verdict.output === '' || verdict.output.endsWith('\n')
      ? verdict.output
      : `${verdict.output}\n`);

  return { ok: verdict.ok,
           message:
             verdict.ok
      ? ''
      : `failed: ${verdict.message}` };
}

/**
 * The environment without `NODE_TEST_CONTEXT`, which a `node --test` run
 * sets for its children and which would change how a nested run reports.
 */
function withoutTestContext(
  ): NodeJS.ProcessEnv
{
  const env =
    { ...process.env };

  delete env.NODE_TEST_CONTEXT;

  return env;
}

function formatCommand(
    program: string,
    args: readonly string[]
  ): string
{
  return [ program,
           ...args.map(
             arg =>
        /^[\w./:=@+-]+$/.test(arg)
          ? arg
          : JSON.stringify(arg)) ]
    .join(' ');
}
