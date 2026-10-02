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
import { findDprintConfig,
         toCommandBatches,
         toDprintConfig }
  from './formatters.js';

const TEST_SUITE = 'formatters';

test(
  `${TEST_SUITE}: the nearest dprint.json wins over one further up`,
  async (): Promise<void> =>
  {
    const root =
      await fs.mkdtemp(
        path.join(
          os.tmpdir(),
          'toolkit-config-'));

    try {
      const nested =
        path.join(
          root,
          'packages',
          'one');

      await fs.mkdir(
        nested,
        { recursive: true });

      const outer =
        path.join(
          root,
          'dprint.json');

      await fs.writeFile(
        outer,
        '{}',
        'utf8');

      assert.equal(
        findDprintConfig(nested),
        outer);

      const inner =
        path.join(
          nested,
          'dprint.json');

      await fs.writeFile(
        inner,
        '{}',
        'utf8');

      assert.equal(
        findDprintConfig(nested),
        inner);
    } finally {
      await fs.rm(
        root,
        { recursive: true,
          force: true });
    }
  });

test(
  `${TEST_SUITE}: no dprint.json anywhere above is an error`,
  async (): Promise<void> =>
  {
    const directory =
      await fs.mkdtemp(
        path.join(
          os.tmpdir(),
          'toolkit-config-'));

    try {
      // The temporary directory sits outside the repository, so nothing above
      // it holds a dprint.json.
      assert.throws(
        () => findDprintConfig(directory),
        /Cannot locate dprint\.json/);
    } finally {
      await fs.rm(
        directory,
        { recursive: true,
          force: true });
    }
  });

test(
  `${TEST_SUITE}: the generated config extends the nearest one and anchors each path`,
  (): void =>
  {
    const config =
      JSON.parse(
        toDprintConfig(
          'C:\\repo\\dprint.json',
          [ 'AGENTS.md',
            'docs\\a.md' ]));

    assert.equal(
      config.extends,
      'C:/repo/dprint.json');

    // Anchored, or dprint would match the same name inside every package.
    assert.deepEqual(
      config.includes,
      [ '/AGENTS.md',
        '/docs/a.md' ]);
  });

test(
  `${TEST_SUITE}: the generated config ends with a newline`,
  (): void =>
  {
    assert.ok(
      toDprintConfig(
        'dprint.json',
        [ 'AGENTS.md' ])
        .endsWith('\n'));
  });

test(
  `${TEST_SUITE}: a file list is split to fit a command line`,
  (): void =>
  {
    const files =
      [ 'aaaa.md',
        'bbbb.md',
        'cccc.md' ];

    // Each path costs its length plus quotes and a space, so a budget of 20
    // takes two of them.
    assert.deepEqual(
      toCommandBatches(
        files,
        20),
      [ [ 'aaaa.md',
          'bbbb.md' ],
        [ 'cccc.md' ] ]);

    assert.deepEqual(
      toCommandBatches(files),
      [ files ]);
  });

test(
  `${TEST_SUITE}: a path longer than the budget still gets a batch`,
  (): void =>
  {
    assert.deepEqual(
      toCommandBatches(
        [ 'a-very-long-path.md' ],
        4),
      [ [ 'a-very-long-path.md' ] ]);
  });

test(
  `${TEST_SUITE}: an empty file list produces no commands`,
  (): void =>
  {
    assert.deepEqual(
      toCommandBatches([ ]),
      [ ]);
  });
