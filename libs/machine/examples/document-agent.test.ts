import assert
  from 'node:assert/strict';
import { mkdtemp,
         readdir,
         writeFile }
  from 'node:fs/promises';
import { tmpdir }
  from 'node:os';
import { join }
  from 'node:path';
import test
  from 'node:test';
import { createDocumentAgent,
         DocumentAgent,
         PipelineStep }
  from './document-agent.js';

async function makeFolder(
  ): Promise<string>
{
  return await mkdtemp(
    join(
      tmpdir(),
      'asljs-machine-test-'));
}

function recordingStep(
    name: string,
    calls: string[]
  ): PipelineStep
{
  return { name,
           run:
             (): void =>
             {
      calls.push(name);
    } };
}

function failingStep(
    name: string
  ): PipelineStep
{
  return { name,
           run:
             (): void =>
             {
      throw new Error(
        `${name} exploded`);
    } };
}

function transitionsOf(
    agent: DocumentAgent
  ): string[]
{
  const seen: string[] = [ ];

  agent.machine.on(
    'transition',
    event =>
      seen.push(
        `${String(event.from.name)}->${String(event.to.name)}`));

  return seen;
}

/**
 * Waits for the agent to reach a state. The agent reads the folder before it
 * starts a pipeline, so the state arrives a few ticks of the event loop after
 * `tick` is called.
 */
async function waitForState(
    agent: DocumentAgent,
    name: string
  ): Promise<void>
{
  for (
    let attempt = 0;
    attempt < 100;
    attempt += 1
  ) {
    if (
      agent.machine.state.name
      === name
    ) {
      return;
    }

    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          1));
  }

  throw new Error(
    `The agent never reached "${name}".`);
}

async function listFolder(
    folder: string,
    name: string
  ): Promise<string[]>
{
  return await readdir(
    join(
      folder,
      name))
    .catch(
      () => [ ] as string[]);
}

test(
  'document agent: runs a document through its pipeline',
  async () =>
  {
    const folder = await makeFolder();

    const calls: string[] = [ ];

    const agent =
      createDocumentAgent(
        { folder,
          classify: () => 'invoice',
          pipelines:
            { invoice:
                [ recordingStep(
                  'parse',
                  calls),
                  recordingStep(
                    'post',
                    calls) ] } });

    const seen =
      transitionsOf(agent);

    await writeFile(
      join(
        folder,
        'inv.txt'),
      'INVOICE');

    assert.equal(
      await agent.tick(),
      true);

    assert.deepEqual(
      calls,
      [ 'parse',
        'post' ]);

    assert.deepEqual(
      seen,
      [ 'idle->scanning',
        'scanning->classifying',
        'classifying->invoice',
        'invoice->invoice',
        'invoice->invoice',
        'invoice->completed',
        'completed->idle' ]);

    assert.deepEqual(
      await listFolder(
        folder,
        'completed'),
      [ 'inv.txt' ]);

    assert.equal(
      agent.machine.state.name,
      'idle');
  });

test(
  'document agent: routes each kind to its own pipeline state',
  async () =>
  {
    const folder = await makeFolder();

    const calls: string[] = [ ];

    const agent =
      createDocumentAgent(
        { folder,
          classify:
            document =>
          document.content.startsWith('RECEIPT')
            ? 'receipt'
            : 'invoice',
          pipelines:
            { invoice:
                [ recordingStep(
                  'invoice-step',
                  calls) ],
              receipt:
                [ recordingStep(
                  'receipt-step',
                  calls) ] } });

    await writeFile(
      join(
        folder,
        'rec.txt'),
      'RECEIPT 1');

    await agent.tick();

    assert.deepEqual(
      calls,
      [ 'receipt-step' ]);

    assert.equal(
      agent.machine.previous?.name,
      'completed');
  });

test(
  'document agent: discards a document it cannot classify',
  async () =>
  {
    const folder = await makeFolder();

    const agent =
      createDocumentAgent(
        { folder,
          classify: () => null,
          pipelines:
            { invoice: [ ] } });

    const seen =
      transitionsOf(agent);

    await writeFile(
      join(
        folder,
        'notes.txt'),
      'shopping list');

    assert.equal(
      await agent.tick(),
      true);

    assert.deepEqual(
      seen,
      [ 'idle->scanning',
        'scanning->classifying',
        'classifying->discarded',
        'discarded->idle' ]);

    assert.deepEqual(
      await listFolder(
        folder,
        'discarded'),
      [ 'notes.txt' ]);
  });

test(
  'document agent: discards a document routed to an unknown kind',
  async () =>
  {
    const folder = await makeFolder();

    const agent =
      createDocumentAgent(
        { folder,
          classify: () => 'statement',
          pipelines:
            { invoice: [ ] } });

    await writeFile(
      join(
        folder,
        'stm.txt'),
      'STATEMENT');

    await agent.tick();

    assert.deepEqual(
      await listFolder(
        folder,
        'discarded'),
      [ 'stm.txt' ]);
  });

test(
  'document agent: fails the document when a step throws',
  async () =>
  {
    const folder = await makeFolder();

    const calls: string[] = [ ];

    const agent =
      createDocumentAgent(
        { folder,
          classify: () => 'invoice',
          pipelines:
            { invoice:
                [ recordingStep(
                  'parse',
                  calls),
                  failingStep('validate'),
                  recordingStep(
                    'post',
                    calls) ] } });

    const seen =
      transitionsOf(agent);

    await writeFile(
      join(
        folder,
        'inv.txt'),
      'INVOICE');

    assert.equal(
      await agent.tick(),
      true);

    assert.deepEqual(
      calls,
      [ 'parse' ]);

    assert.deepEqual(
      seen.slice(-3),
      [ 'invoice->invoice',
        'invoice->failed',
        'failed->idle' ]);

    assert.deepEqual(
      await listFolder(
        folder,
        'failed'),
      [ 'inv.txt' ]);
  });

test(
  'document agent: an empty folder returns to idle',
  async () =>
  {
    const folder = await makeFolder();

    const agent =
      createDocumentAgent(
        { folder,
          classify: () => 'invoice',
          pipelines:
            { invoice: [ ] } });

    const seen =
      transitionsOf(agent);

    assert.equal(
      await agent.tick(),
      false);

    assert.deepEqual(
      seen,
      [ 'idle->scanning',
        'scanning->idle' ]);
  });

test(
  'document agent: refuses a tick that arrives mid-pipeline',
  async () =>
  {
    const folder = await makeFolder();

    let release =
      (): void => { };

    const blocked =
      new Promise<void>(
      (
          resolve
        ) =>
      {
        release = resolve;
      }
    );

    const agent =
      createDocumentAgent(
        { folder,
          classify: () => 'invoice',
          pipelines:
            { invoice:
                [ { name: 'slow',
                    run:
                      async (): Promise<void> =>
                      {
              await blocked;
            } } ] } });

    await writeFile(
      join(
        folder,
        'inv.txt'),
      'INVOICE');

    const first =
      agent.tick();

    await waitForState(
      agent,
      'invoice');

    // The pipeline is running, so the monitoring cycle must not start again.
    assert.equal(
      agent.machine.state.name,
      'invoice');

    assert.equal(
      agent.machine.can('scan'),
      false);

    assert.equal(
      await agent.tick(),
      false);

    release();

    assert.equal(
      await first,
      true);

    assert.equal(
      agent.machine.state.name,
      'idle');
  });

test(
  'document agent: shutdown reaches a final state and stops ticking',
  async () =>
  {
    const folder = await makeFolder();

    const agent =
      createDocumentAgent(
        { folder,
          classify: () => 'invoice',
          pipelines:
            { invoice: [ ] } });

    assert.equal(
      agent.shutdown(),
      true);

    assert.equal(
      agent.machine.state.name,
      'stopped');

    assert.equal(
      agent.machine.state.final,
      true);

    await writeFile(
      join(
        folder,
        'inv.txt'),
      'INVOICE');

    assert.equal(
      await agent.tick(),
      false);

    assert.equal(
      agent.shutdown(),
      false);
  });

test(
  'document agent: requires at least one pipeline',
  () =>
  {
    assert.throws(
      () =>
        createDocumentAgent(
          { folder: '.',
            classify: () => null,
            pipelines: {} }),
      /At least one pipeline/);
  });
