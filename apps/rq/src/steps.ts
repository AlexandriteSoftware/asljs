import { getSection,
         plainText }
  from 'asljs-mdcli';
import { type Code,
         type Heading,
         type List,
         type Root,
         type RootContent }
  from 'mdast';

export type StepType = 'shell' | 'javascript' | 'dotnet' | 'instruction';

export const STEP_TYPES: readonly StepType[] =
  Object.freeze(
    [ 'shell',
      'javascript',
      'dotnet',
      'instruction' ]);

interface StepBase
{
  /**
   * The text of the step's `###` heading.
   */
  title: string;
}

/**
 * Commands, one per non-empty line of the step's code blocks, run in a
 * shell one after another.
 */
export interface ShellStep extends StepBase
{
  type: 'shell';
  commands: string[];
}

/**
 * A `node --test` run of a file, optionally of the tests whose name matches
 * a caption.
 */
export interface JavaScriptStep extends StepBase
{
  type: 'javascript';
  file: string;
  test: string | null;
}

/**
 * A `dotnet test` run, optionally of one project and of the tests a filter
 * selects.
 */
export interface DotnetStep extends StepBase
{
  type: 'dotnet';
  project: string | null;
  filter: string | null;
}

/**
 * Free-form text an AI agent carries out and judges.
 */
export interface InstructionStep extends StepBase
{
  type: 'instruction';
  text: string;
}

export type TestStep =
  | ShellStep
  | JavaScriptStep
  | DotnetStep
  | InstructionStep;

export interface ParsedSteps
{
  steps: TestStep[];

  /**
   * What is wrong with the `## Steps` section, for `rq check`.
   */
  problems: string[];
}

// A value may be wrapped over several lines, as a formatter leaves it.
const FIELD =
  /^(Type|File|Test|Project|Filter):\s*([\s\S]*)$/i;

const TYPE_NAMES: ReadonlyMap<string, StepType> =
  new Map(
    [ [ 'shell',
        'shell' ],
      [ 'javascript',
        'javascript' ],
      [ 'js',
        'javascript' ],
      [ 'dotnet',
        'dotnet' ],
      [ '.net',
        'dotnet' ],
      [ 'instruction',
        'instruction' ] ]);

/**
 * The steps of a test: one per `###` heading of its `## Steps` section. A
 * step's type is its `- Type:` item; without one, a step with a code block
 * is `shell` and any other `instruction`.
 */
export function parseSteps(
    root: Root,
    text: string
  ): ParsedSteps
{
  const section =
    getSection(
      root,
      'Steps');

  const steps: TestStep[] = [ ];
  const problems: string[] = [ ];

  if (section === null) {
    return { steps,
             problems };
  }

  const groups: { heading: Heading; nodes: RootContent[]; }[] = [ ];

  for (const node of section) {
    if (
      node.type === 'heading'
      && node.depth === 3
    ) {
      groups.push(
        { heading: node,
          nodes: [ ] });
    } else if (groups.length > 0) {
      groups[groups.length - 1].nodes.push(node);
    } else if (node.type !== 'definition') {
      problems.push(
        'the Steps section has content before its first step; each step is a ### heading.');

      break;
    }
  }

  for (const { heading, nodes } of groups) {
    const step =
      parseStep(
        plainText(heading).trim(),
        nodes,
        text,
        problems);

    if (step !== null) {
      steps.push(step);
    }
  }

  if (
    groups.length === 0
    && problems.length === 0
  ) {
    problems.push(
      'the Steps section has no steps.');
  }

  return { steps,
           problems };
}

/**
 * The commands of a shell code block: one per line, a line ending with `\`
 * joined with the next, and empty lines and `#` comments skipped.
 */
export function splitCommands(
    code: string
  ): string[]
{
  const commands: string[] = [ ];
  let pending = '';

  for (const line of code.split(/\r?\n/)) {
    const trimmed =
      line.trim();

    if (
      pending === ''
      && (trimmed === ''
          || trimmed.startsWith('#'))
    ) {
      continue;
    }

    if (trimmed.endsWith('\\')) {
      pending += `${
        trimmed.slice(
          0,
          -1).trimEnd()
      } `;

      continue;
    }

    commands.push(
      `${pending}${trimmed}`.trim());

    pending = '';
  }

  if (pending.trim() !== '') {
    commands.push(
      pending.trim());
  }

  return commands;
}

function parseStep(
    title: string,
    nodes: RootContent[],
    text: string,
    problems: string[]
  ): TestStep | null
{
  const fields = new Map<string, string>();

  const fieldList =
    nodes.find(
      (node): node is List =>
      node.type === 'list'
      && node.children.every(
        item =>
          FIELD.test(
            plainText(item).trim())));

  for (const item of fieldList?.children ?? [ ]) {
    const match =
      FIELD.exec(
        plainText(item).trim())!;

    fields.set(
      match[1].toLowerCase(),
      match[2]
        .replace(
          /\s+/g,
          ' ')
        .trim());
  }

  const code =
    nodes.filter(
      (node): node is Code => node.type === 'code');

  const typeName =
    fields.get('type');

  const type =
    typeName === undefined
    ? code.length > 0
      ? 'shell'
      : 'instruction'
    : TYPE_NAMES.get(
      typeName.toLowerCase());

  const problem =
    (
        message: string
      ): null =>
    {
    problems.push(
      `the step "${title}" ${message}`);

    return null;
  };

  switch (type) {
    case 'shell': {
      const commands =
        code.flatMap(
          node => splitCommands(node.value));

      return commands.length === 0
        ? problem('has no commands.')
        : { type,
            title,
            commands };
    }

    case 'javascript': {
      const file =
        fields.get('file') ?? '';

      return file === ''
        ? problem('has no File.')
        : { type,
            title,
            file,
            test:
              fields.get('test') || null };
    }

    case 'dotnet':
      return { type,
               title,
               project:
                 fields.get('project') || null,
               filter:
                 fields.get('filter') || null };

    case 'instruction': {
      const body =
        nodes.filter(
          node =>
          node !== fieldList
          && node.type !== 'definition');

      const instruction =
        body.length === 0
        ? ''
        : text.slice(
          body[0].position!.start.offset,
          body[body.length - 1].position!.end.offset)
          .trim();

      return instruction === ''
        ? problem(
          'has no instruction.')
        : { type,
            title,
            text: instruction };
    }

    default:
      return problem(
        `has an unknown Type "${typeName}"; use ${STEP_TYPES.join(', ')}.`);
  }
}
