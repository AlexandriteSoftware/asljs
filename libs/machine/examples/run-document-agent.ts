import { mkdtemp,
         readdir,
         writeFile }
  from 'node:fs/promises';
import { tmpdir }
  from 'node:os';
import { join }
  from 'node:path';
import { createDocumentAgent,
         PipelineStep }
  from './document-agent.js';

/**
 * Runs the document agent against a throwaway folder and prints every state
 * change, so the machine's control flow is visible.
 *
 * ```
 * npx tsx examples/run-document-agent.ts
 * ```
 */

function step(
    name: string
  ): PipelineStep
{
  return { name,
           run:
             async (
                 document
               ): Promise<void> =>
             {
      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            10));

      console.log(
        `    ${name}: ${document.name}`);
    } };
}

async function main(
  ): Promise<void>
{
  const folder =
    await mkdtemp(
      join(
        tmpdir(),
        'asljs-machine-'));

  const agent =
    createDocumentAgent(
      { folder,
        classify:
          document =>
        document.content.startsWith('INVOICE')
          ? 'invoice'
          : document.content.startsWith('RECEIPT')
          ? 'receipt'
          : null,
        pipelines:
          { invoice:
              [ step('parse'),
                step('validate'),
                step('post-to-ledger') ],
            receipt:
              [ step('parse'),
                step('attach-to-expense') ] },
        log:
          line => console.log(`  ${line}`) });

  console.log(`folder: ${folder}`);

  await writeFile(
    join(
      folder,
      'inv-1001.txt'),
    'INVOICE 1001\n');

  await writeFile(
    join(
      folder,
      'rec-42.txt'),
    'RECEIPT 42\n');

  await writeFile(
    join(
      folder,
      'notes.txt'),
    'shopping list\n');

  // A tick that finds nothing, then one per document, then one more.
  for (
    let cycle = 0;
    cycle < 5;
    cycle += 1
  ) {
    console.log(
      `tick ${cycle + 1} (state: ${
        String(
          agent.machine.state.name)
      })`);

    await agent.tick();
  }

  console.log(
    `shutdown: ${agent.shutdown()}`);

  console.log(
    `final state: ${
      String(
        agent.machine.state.name)
    }`
      + `, previous: ${
        String(
          agent.machine.previous?.name)
      }`
      + `, final: ${agent.machine.state.final}`);

  console.log(
    `a tick after shutdown does nothing: ${!agent.machine.can('scan')}`);

  for (const folderName of [ 'completed',
                             'failed',
                             'discarded' ]) {
    const entries =
      await readdir(
        join(
          folder,
          folderName))
      .catch(
        () => [ ]);

    console.log(
      `${folderName}: ${
        entries.length === 0
          ? '-'
          : entries.join(', ')
      }`);
  }
}

await main();
