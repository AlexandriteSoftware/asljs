import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import test
  from 'node:test';
import { createLinkGraph }
  from './graph.js';
import { withLibrary }
  from './testing/library.js';
import { watchLibrary }
  from './watcher.js';

/**
 * Filesystem events arrive asynchronously, so a test has to wait for the
 * watcher to apply them. `next()` is armed before the change is made.
 */
function applyNotifier(
  ): { onApplied: () => void; next: () => Promise<void>; }
{
  let resolve: (() => void) | null = null;

  return { onApplied:
             (): void =>
             {
      resolve?.();

      resolve = null;
    },
           next:
             (): Promise<void> =>
           new Promise<void>(
             (
                 value
               ) =>
             {
        resolve = value;
      }) };
}

test(
  'the watcher indexes a document that appears',
  async () =>
  {
    await withLibrary(
      { 'notes/budget.md': '# Budget\n' },
      async (
          library
        ) =>
      {
        const graph =
          await createLinkGraph(library.path);

        const notifier =
          applyNotifier();

        const watcher =
          watchLibrary(
            library.path,
            graph,
            { debounceMs: 20,
              onApplied: notifier.onApplied });

        try {
          const applied =
            notifier.next();

          await fs.writeFile(
            library.resolve('notes/plan.md'),
            '# Plan\n\nSee [budget](budget.md).\n',
            'utf8');

          await applied;

          assert.equal(
            graph.article('notes/plan.md')?.title,
            'Plan');

          assert.deepEqual(
            graph.backlinksTo('notes/budget.md')
              .map(
                backlink => backlink.path),
            [ 'notes/plan.md' ]);
        } finally {
          watcher.close();
        }
      });
  });

test(
  'the watcher follows edits and removals',
  async () =>
  {
    await withLibrary(
      { 'notes/budget.md': '# Budget\n',
        'notes/plan.md':
          '# Plan\n\nSee [budget](budget.md).\n' },
      async (
          library
        ) =>
      {
        const graph =
          await createLinkGraph(library.path);

        const notifier =
          applyNotifier();

        const watcher =
          watchLibrary(
            library.path,
            graph,
            { debounceMs: 20,
              onApplied: notifier.onApplied });

        try {
          let applied =
            notifier.next();

          await fs.writeFile(
            library.resolve('notes/plan.md'),
            '# Plan\n\nThe link is gone.\n',
            'utf8');

          await applied;

          assert.deepEqual(
            graph.backlinksTo('notes/budget.md'),
            [ ]);

          applied =
            notifier.next();

          await fs.rm(
            library.resolve('notes/plan.md'));

          await applied;

          assert.equal(
            graph.article('notes/plan.md'),
            undefined);
        } finally {
          watcher.close();
        }
      });
  });

test(
  'the watcher stops applying changes once closed',
  async () =>
  {
    await withLibrary(
      { 'notes/budget.md': '# Budget\n' },
      async (
          library
        ) =>
      {
        const graph =
          await createLinkGraph(library.path);

        const watcher =
          watchLibrary(
            library.path,
            graph,
            { debounceMs: 20 });

        watcher.close();

        await fs.writeFile(
          library.resolve('notes/plan.md'),
          '# Plan\n',
          'utf8');

        await new Promise(
          resolve =>
            setTimeout(
              resolve,
              120));

        assert.equal(
          graph.article('notes/plan.md'),
          undefined);
      });
  });
