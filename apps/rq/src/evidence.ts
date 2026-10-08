import { readFile,
         writeFile }
  from 'node:fs/promises';
import path
  from 'node:path';
import { appendLogEntry,
         LogEntry }
  from './document.js';
import { RqNode }
  from './graph.js';
import { runCommand }
  from './run-command.js';

/**
 * Runs the steps of an evidence document one after another in its folder,
 * stopping at the first that fails, and appends the outcome to its `## Log`.
 */
export async function runEvidence(
    node: RqNode,
    now: () => Date
  ): Promise<LogEntry>
{
  const entry =
    await runSteps(node);

  const logged: LogEntry =
    { time:
        now().toISOString(),
      ...entry };

  const text =
    await readFile(
      node.path,
      'utf8');

  await writeFile(
    node.path,
    appendLogEntry(
      text,
      logged),
    'utf8');

  node.log.push(logged);

  return logged;
}

async function runSteps(
    node: RqNode
  ): Promise<Omit<LogEntry, 'time'>>
{
  if (node.steps.length === 0) {
    return { status: 'Failed',
             note: 'no steps' };
  }

  for (const [index, step] of node.steps.entries()) {
    let run;

    try {
      run =
        await runCommand(
          step,
          path.dirname(node.path));
    } catch (error) {
      return { status: 'Failed',
               note:
                 `step ${index + 1} did not start: ${
          error instanceof Error
            ? error.message
            : String(error)
        }` };
    }

    if (run.code !== 0) {
      const lastLine =
        (run.stderr.trim() || run.stdout.trim())
        .split(/\r?\n/)
        .pop()
        ?.trim()
        .slice(
          0,
          200)
        ?? '';

      return { status: 'Failed',
               note:
                 `step ${index + 1} exited with code ${run.code}${
          lastLine === ''
            ? ''
            : `: ${lastLine}`
        }` };
    }
  }

  return { status: 'Passed',
           note:
             node.steps.length === 1
      ? '1 step'
      : `${node.steps.length} steps` };
}
