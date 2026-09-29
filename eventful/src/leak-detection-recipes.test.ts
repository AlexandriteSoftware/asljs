import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import os
  from 'node:os';
import path
  from 'node:path';
import test
  from 'node:test';
import { fileURLToPath,
         pathToFileURL }
  from 'node:url';
import { eventful }
  from './eventful.js';

const TEST_SUITE =
  'leak-detection-recipes';

const SCRIPT_FILE_PATH =
  fileURLToPath(
    import.meta.url);

const DOCS_FILE_PATH =
  path.join(
    path.dirname(
      path.dirname(SCRIPT_FILE_PATH)),
    'docs',
    'leak-detection.md');

interface Recipes
{
  installLeakGuard: (
    options?: {
      maxListeners?: number;
      warn?: (message: string) => void;
    }
  ) => () => boolean;

  createEmitterRegistry: () => {
    sweep: (
      options?: { minListeners?: number; }
    ) => {
      tracked: number;
      report: Array<{ id: string; event: string; count: number; }>;
    };

    stop: () => boolean;
  };
}

/**
 * Loads the recipes from the article itself, so that the tests cover what is
 * published rather than a copy of it. A copy would drift from the document
 * without anything noticing, which is the failure this file exists to prevent.
 */
async function loadRecipesFromArticle(
  ): Promise<
  { recipes: Recipes; dispose: () => Promise<void>; }
>
{
  const markdown =
    await fs.readFile(
      DOCS_FILE_PATH,
      'utf8');

  const blocks =
    [ ...markdown.matchAll(
      /```js\r?\n([\s\S]*?)```/g) ]
    .map(
      match => match[1])
    .filter(
      block => block.includes('export function'));

  assert.equal(
    blocks.length,
    2,
    'the article should publish two recipes');

  const source =
    [ `import { eventful } from ${
      JSON.stringify(
        new URL(
          './eventful.js',
          import.meta.url).href)
    };`,
      ...blocks.map(
        block =>
        block.replace(
          /import\s*\{[\s\S]*?\}\s*from\s*'asljs-eventful';\s*/,
          '')) ].join('\n');

  const directory =
    await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        'eventful-recipes-'));

  const modulePath =
    path.join(
      directory,
      'recipes.mjs');

  await fs.writeFile(
    modulePath,
    source,
    'utf8');

  const recipes =
    await import(
    pathToFileURL(modulePath).href
  ) as unknown as Recipes;

  return { recipes,
           dispose:
             async (): Promise<void> =>
             {
      await fs.rm(
        directory,
        { recursive: true,
          force: true });
    } };
}

test(
  `${TEST_SUITE}: the article publishes both recipes`,
  async (): Promise<void> =>
  {
    const { recipes, dispose } =
      await loadRecipesFromArticle();

    try {
      assert.equal(
        typeof recipes.installLeakGuard,
        'function');

      assert.equal(
        typeof recipes.createEmitterRegistry,
        'function');
    } finally {
      await dispose();
    }
  });

test(
  `${TEST_SUITE}: the guard warns once for an object that keeps subscribers`,
  async (): Promise<void> =>
  {
    const { recipes, dispose } =
      await loadRecipesFromArticle();

    const messages: string[] = [ ];

    const uninstall =
      recipes.installLeakGuard(
        { maxListeners: 3,
          warn:
            (
                message
              ) =>
            {
          messages.push(message);
        } });

    try {
      const leaking =
        eventful({});

      for (
        let index = 0;
        index < 6;
        index += 1
      ) {
        leaking.on(
          'change',
          () => { });
      }

      assert.equal(
        messages.length,
        1);

      assert.match(
        messages[0],
        /has 4 listeners for "change"/);
    } finally {
      uninstall();
      await dispose();
    }
  });

test(
  `${TEST_SUITE}: the guard stays quiet for subscribers that detach`,
  async (): Promise<void> =>
  {
    const { recipes, dispose } =
      await loadRecipesFromArticle();

    const messages: string[] = [ ];

    const uninstall =
      recipes.installLeakGuard(
        { maxListeners: 3,
          warn:
            (
                message
              ) =>
            {
          messages.push(message);
        } });

    try {
      const healthy =
        eventful({});

      for (
        let index = 0;
        index < 50;
        index += 1
      ) {
        healthy.on(
          'change',
          () => { })();
      }

      const ticker =
        eventful({});

      for (
        let index = 0;
        index < 50;
        index += 1
      ) {
        ticker.once(
          'tick',
          () => { });

        ticker.emit('tick');
      }

      assert.deepEqual(
        messages,
        [ ]);
    } finally {
      uninstall();
      await dispose();
    }
  });

test(
  `${TEST_SUITE}: uninstalling the guard stops it`,
  async (): Promise<void> =>
  {
    const { recipes, dispose } =
      await loadRecipesFromArticle();

    const messages: string[] = [ ];

    const uninstall =
      recipes.installLeakGuard(
        { maxListeners: 1,
          warn:
            (
                message
              ) =>
            {
          messages.push(message);
        } });

    uninstall();

    try {
      const object =
        eventful({});

      for (
        let index = 0;
        index < 5;
        index += 1
      ) {
        object.on(
          'change',
          () => { });
      }

      assert.deepEqual(
        messages,
        [ ]);
    } finally {
      await dispose();
    }
  });

test(
  `${TEST_SUITE}: the registry reports what an object is holding`,
  async (): Promise<void> =>
  {
    const { recipes, dispose } =
      await loadRecipesFromArticle();

    const registry =
      recipes.createEmitterRegistry();

    try {
      const holding =
        eventful({});

      for (
        let index = 0;
        index < 4;
        index += 1
      ) {
        holding.on(
          'change',
          () => { });
      }

      const detaching =
        eventful({});

      for (
        let index = 0;
        index < 9;
        index += 1
      ) {
        detaching.on(
          'change',
          () => { })();
      }

      const { report } =
        registry.sweep(
          { minListeners: 1 });

      assert.equal(
        report.length,
        1);

      assert.equal(
        report[0].event,
        'change');

      assert.equal(
        report[0].count,
        4);
    } finally {
      registry.stop();
      await dispose();
    }
  });

test(
  `${TEST_SUITE}: comparing two sweeps finds growth, not size`,
  async (): Promise<void> =>
  {
    const { recipes, dispose } =
      await loadRecipesFromArticle();

    const registry =
      recipes.createEmitterRegistry();

    try {
      const busy =
        eventful({});

      for (
        let index = 0;
        index < 30;
        index += 1
      ) {
        busy.on(
          'change',
          () => { });
      }

      const leaking =
        eventful({});

      for (
        let index = 0;
        index < 5;
        index += 1
      ) {
        leaking.on(
          'change',
          () => { });
      }

      const before =
        new Map(
          registry.sweep().report.map(
            entry => [ `${entry.id} ${entry.event}`,
                       entry.count ]));

      for (
        let index = 0;
        index < 7;
        index += 1
      ) {
        leaking.on(
          'change',
          () => { });
      }

      const after =
        registry.sweep().report;

      assert.equal(
        after.filter(
          entry => entry.count > 10).length,
        2,
        'a threshold of ten flags the busy object as well');

      const growing =
        after.filter(
          entry =>
          entry.count
            > (before.get(
              `${entry.id} ${entry.event}`)
              ?? 0));

      assert.equal(
        growing.length,
        1);

      assert.equal(
        growing[0].count,
        12);
    } finally {
      registry.stop();
      await dispose();
    }
  });

test(
  `${TEST_SUITE}: the registry does not keep a collected object alive`,
  { skip:
      typeof (globalThis as { gc?: unknown; }).gc === 'function'
      ? false
      : 'requires --expose-gc' },
  async (): Promise<void> =>
  {
    const { recipes, dispose } =
      await loadRecipesFromArticle();

    const registry =
      recipes.createEmitterRegistry();

    try {
      for (
        let index = 0;
        index < 50;
        index += 1
      ) {
        eventful({}).on(
          'tick',
          () => { });
      }

      const kept =
        eventful({});

      kept.on(
        'tick',
        () => { });

      assert.equal(
        registry.sweep().tracked,
        51);

      (globalThis as { gc: () => void; }).gc();

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            10));

      (globalThis as { gc: () => void; }).gc();

      assert.ok(
        registry.sweep().tracked < 51,
        'collected emitters should drop out of the registry');
    } finally {
      registry.stop();
      await dispose();
    }
  });
