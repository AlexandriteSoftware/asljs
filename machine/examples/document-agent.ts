import { mkdir,
         readdir,
         readFile,
         rename }
  from 'node:fs/promises';
import { join }
  from 'node:path';
import { Machine,
         machine,
         MachineDefinition,
         MachineStateDefinition }
  from '../src/index.js';

/**
 * A folder-monitoring document agent, built as a single state machine.
 *
 * The machine is the whole control flow:
 *
 * ```
 * idle --scan--> scanning --found--> classifying --<kind>--> <kind>
 * scanning --empty--> idle
 * <kind> --step--> <kind>            (reentry, guarded by pending steps)
 * <kind> --done--> completed         (guarded by no pending steps)
 * <kind> --fail--> failed
 * classifying --unrecognised--> discarded
 * completed | failed | discarded --reset--> idle
 * idle --shutdown--> stopped         (final)
 * ```
 *
 * Every pipeline is one entry in `pipelines`: its key becomes a state name, so
 * routing a document is `machine.go(kind)` and adding a pipeline changes
 * configuration rather than code.
 *
 * Transitions are synchronous, so step work happens between `send` calls: the
 * agent sends `step`, awaits the step, then sends the next event. The machine
 * therefore always describes what the agent is doing right now.
 */

export interface AgentDocument
{
  name: string;
  content: string;
}

export interface PipelineStep
{
  name: string;

  run(
    document: AgentDocument
  ): Promise<void> | void;
}

export interface DocumentAgentOptions
{
  /** Folder to monitor. Processed files are moved into subfolders of it. */
  folder: string;

  /** Pipelines by document kind. Each key becomes a machine state. */
  pipelines: Record<string, PipelineStep[]>;

  /** Returns the document kind, or null when the document is not recognised. */
  classify(
    document: AgentDocument
  ): string | null;

  /** Receives one line per state change. Defaults to no logging. */
  log?: (
    line: string
  ) => void;
}

export interface DocumentAgent
{
  /** The agent's control flow. Read `state`, or subscribe to its events. */
  machine: Machine;

  /** Runs one monitoring cycle. Resolves true when a document was handled. */
  tick(): Promise<boolean>;

  /** Polls the folder until the returned function is called. */
  start(
    intervalMs: number
  ): () => void;

  /** Moves to the final `stopped` state. Returns false when already running. */
  shutdown(): boolean;
}

const doneFolder = 'completed';
const failedFolder = 'failed';
const discardedFolder = 'discarded';

/**
 * Builds the declarative machine shape from the configured pipeline kinds.
 *
 * The pipeline states are generated, which is why a new pipeline needs no new
 * transition code: `classifying` gains one event named after the kind, and the
 * kind's own state gains the same three transitions as every other pipeline.
 */
function buildDefinition(
    kinds: string[],
    hasPendingStep: () => boolean
  ): MachineDefinition
{
  const classifying: MachineStateDefinition =
    { unrecognised: 'discarded' };

  for (const kind of kinds) {
    classifying[kind] = kind;
  }

  const definition: MachineDefinition =
    { idle:
        { scan: 'scanning',
          shutdown: 'stopped' },
      scanning:
        { found: 'classifying',
          empty: 'idle' },
      classifying,
      completed:
        { reset: 'idle' },
      failed:
        { reset: 'idle' },
      discarded:
        { reset: 'idle' },
      stopped: null };

  for (const kind of kinds) {
    definition[kind] =
      { step:
          { to: kind,
            reentry: true,
            when: hasPendingStep },
        done:
          { to: 'completed',
            when:
              () => !hasPendingStep() },
        fail: 'failed' };
  }

  return definition;
}

export function createDocumentAgent(
    options: DocumentAgentOptions
  ): DocumentAgent
{
  const log =
    options.log
    ?? ((): void => { });

  const kinds =
    Object.keys(options.pipelines);

  if (kinds.length === 0) {
    throw new Error(
      'At least one pipeline is required.');
  }

  let pending: PipelineStep[] = [ ];
  let document: AgentDocument | null = null;

  const currentMachine =
    machine(
      'idle',
      buildDefinition(
        kinds,
        () => pending.length > 0));

  currentMachine.on(
    'transition',
    event =>
      log(
        `${String(event.from.name)} -> ${String(event.to.name)}`
          + ` (${event.event ?? 'unnamed'})`));

  // Rejections are how the agent stays honest: a tick that arrives mid-pipeline
  // is refused by the machine instead of being guarded by ad hoc booleans.
  currentMachine.on(
    'rejected',
    event =>
      log(
        `refused ${event.event ?? 'go'} in ${String(event.from.name)}`
          + `: ${event.reason}`));

  const moveDocument =
    async (
        folder: string
      ): Promise<void> =>
    {
    if (document === null) {
      return;
    }

    const target =
      join(
        options.folder,
        folder);

    await mkdir(
      target,
      { recursive: true });

    await rename(
      join(
        options.folder,
        document.name),
      join(
        target,
        document.name));
  };

  const nextDocument =
    async (): Promise<AgentDocument | null> =>
    {
    const entries =
      await readdir(
        options.folder,
        { withFileTypes: true });

    const file =
      entries.find(
        entry => entry.isFile());

    if (file === undefined) {
      return null;
    }

    return { name: file.name,
             content:
               await readFile(
                 join(
                   options.folder,
                   file.name),
                 'utf8') };
  };

  const runPipeline =
    async (): Promise<void> =>
    {
    while (pending.length > 0) {
      const step = pending[0];

      // The guard on `step` refuses the send when nothing is pending, so the
      // loop cannot outrun the machine.
      if (!currentMachine.send('step')) {
        return;
      }

      await step.run(
        document as AgentDocument);

      pending.shift();
    }
  };

  const tick =
    async (): Promise<boolean> =>
    {
    // One call covers "is the agent idle" and "is the agent shut down".
    if (!currentMachine.can('scan')) {
      return false;
    }

    currentMachine.send('scan');

    document =
      await nextDocument();

    if (document === null) {
      currentMachine.send('empty');

      return false;
    }

    currentMachine.send('found');

    const kind =
      options.classify(document);

    if (
      kind === null
      || !currentMachine.canGo(kind)
    ) {
      currentMachine.send('unrecognised');

      await moveDocument(discardedFolder);

      currentMachine.send('reset');

      return true;
    }

    pending =
      [ ...options.pipelines[kind] ];

    currentMachine.go(kind);

    try {
      await runPipeline();

      if (pending.length > 0) {
        throw new Error(
          'Pipeline stopped before the last step.');
      }

      currentMachine.send('done');

      await moveDocument(doneFolder);
    } catch (error) {
      log(
        `step failed: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`);

      pending = [ ];

      currentMachine.send('fail');

      await moveDocument(failedFolder);
    }

    currentMachine.send('reset');

    return true;
  };

  const start =
    (
        intervalMs: number
      ): () => void =>
    {
    const timer =
      setInterval(
        () =>
        {
        void tick();
      },
        intervalMs);

    return (): void =>
    {
      clearInterval(timer);
    };
  };

  const shutdown =
    (): boolean => currentMachine.send('shutdown');

  return { machine: currentMachine,
           tick,
           start,
           shutdown };
}
