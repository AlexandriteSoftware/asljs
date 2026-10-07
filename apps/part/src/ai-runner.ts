import { Logger }
  from 'asljs-logging';
import { spawn }
  from 'node:child_process';
import { fromFileLocation }
  from './location.js';
import { ArtefactDefinitionRule }
  from './model/artefact-definition-rule.js';
import { ArtefactDefinition }
  from './model/artefact-definition.js';
import { Artefact }
  from './model/artefact.js';

export type AiAgent = 'claude' | 'copilot';

export const AI_AGENTS: readonly AiAgent[] =
  Object.freeze(
    [ 'claude',
      'copilot' ]);

/**
 * Commands that read the prompt from standard input and may read, but not
 * change, the repository.
 */
const AGENT_COMMANDS: Readonly<Record<AiAgent, string>> =
  Object.freeze(
    { claude:
        'claude -p --allowedTools Read,Grep,Glob',
      copilot:
        'copilot -s --no-ask-user --allow-all-tools --deny-tool=write --deny-tool=shell' });

export interface AiVerdict
{
  result: 'Ok' | 'Fail';
  message: string;
}

/**
 * Checks a rule against an artefact by asking an AI agent. The command runs
 * in the project root with the prompt on standard input; the verdict is the
 * last line of its output that is a JSON object with `result` `OK` or `Fail`.
 */
export class AiRunner
{
  readonly command: string;

  /**
   * `command` replaces the agent's default command, e.g. from
   * `PART_AI_COMMAND`.
   */
  constructor(
    private readonly logger: Logger,
    readonly agent: AiAgent,
    private readonly projectPath: string,
    command?: string
  )
  {
    this.command =
      command
      || AGENT_COMMANDS[agent];
  }

  async check(
    definition: ArtefactDefinition,
    rule: ArtefactDefinitionRule,
    artefact: Artefact
  ): Promise<AiVerdict>
  {
    const prompt =
      buildPrompt(
        definition,
        rule,
        artefact,
        fromFileLocation(
          this.projectPath,
          artefact.location),
        this.projectPath);

    this.logger.trace(
      'check(%s, %s) { running %s }',
      rule.name,
      artefact.location,
      this.command);

    let run;

    try {
      run =
        await runCommand(
          this.command,
          this.projectPath,
          prompt);
    } catch (error) {
      return { result: 'Fail',
               message:
                 `AI agent failed to start: ${
          error instanceof Error
            ? error.message
            : String(error)
        }` };
    }

    if (run.code !== 0) {
      return { result: 'Fail',
               message:
                 `AI agent exited with code ${run.code}: ${
          (run.stderr || run.stdout).trim()
        }` };
    }

    return parseVerdict(run.stdout);
  }
}

function buildPrompt(
    definition: ArtefactDefinition,
    rule: ArtefactDefinitionRule,
    artefact: Artefact,
    filePath: string | null,
    projectPath: string
  ): string
{
  const lines =
    [ 'Check whether a project artefact satisfies a rule. Do not modify any file.',
      '',
      `Project root: ${projectPath}`,
      '',
      `Artefact definition: ${definition.name}`,
      '',
      definition.description,
      '',
      `Rule ${rule.id}:`,
      '',
      rule.content,
      '',
      `Artefact location: ${artefact.location}` ];

  if (filePath !== null) {
    lines.push(
      `Artefact path: ${filePath}`);
  }

  lines.push(
    '',
    'Read what you need from the project and decide. Answer with exactly one',
    'line of JSON and nothing else, either',
    '{"result":"OK","message":""}',
    'or',
    '{"result":"Fail","message":"<why the rule is not satisfied>"}');

  return `${lines.join('\n')}\n`;
}

function parseVerdict(
    output: string
  ): AiVerdict
{
  const lines =
    output
    .split('\n')
    .map(
      line => line.trim())
    .filter(
      line => line !== '')
    .reverse();

  for (const line of lines) {
    let value;

    try {
      value =
        JSON.parse(line);
    } catch {
      continue;
    }

    if (
      !value
      || typeof value
         !== 'object'
    ) {
      continue;
    }

    const message =
      typeof value.message === 'string'
      ? value.message
      : '';

    if (value.result === 'OK') {
      return { result: 'Ok',
               message: '' };
    }

    if (value.result === 'Fail') {
      return { result: 'Fail',
               message:
                 message
          || 'Rule is not satisfied.' };
    }
  }

  return { result: 'Fail',
           message:
             `AI agent gave no verdict: ${
      output.trim().slice(
        0,
        200)
    }` };
}

function runCommand(
    command: string,
    cwd: string,
    input: string
  ): Promise<{ code: number; stdout: string; stderr: string; }>
{
  return new Promise(
    (
        resolve,
        reject
      ) =>
    {
      const child =
        spawn(
          command,
          { cwd,
            shell: true,
            windowsHide: true,
            stdio:
              [ 'pipe',
                'pipe',
                'pipe' ] });

      let stdout = '';
      let stderr = '';

      child.stdout.on(
        'data',
        (
            chunk
          ) =>
        {
          stdout += String(chunk);
        });

      child.stderr.on(
        'data',
        (
            chunk
          ) =>
        {
          stderr += String(chunk);
        });

      child.on(
        'error',
        reject);

      child.on(
        'close',
        (
            code
          ) =>
        {
          resolve(
            { code:
                code ?? -1,
              stdout,
              stderr });
        });

      child.stdin.end(
        input,
        'utf8');
    });
}
