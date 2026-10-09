import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { selectTargets }
  from './targets.js';
import { writeFixture }
  from './testing/fixture.js';

test(
  'selectTargets selects a target, its direct tests, or everything below it',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const relative =
      async (
      targets: string[],
      options: { recurse?: boolean; directTests?: boolean; }
    ): Promise<string[]> =>
      (await selectTargets(
        dir.path,
        targets,
        options)).selected
        .map(
          file =>
            file.slice(dir.path.length + 1)
              .split('\\')
              .join('/'));

    assert.deepEqual(
      await relative(
        [ 'R1' ],
        {}),
      [ 'reqs/R1 Root.md' ]);

    assert.deepEqual(
      await relative(
        [ 'R1',
          'T1' ],
        { directTests: true }),
      [ 'reqs/R1 Root.md',
        'reqs/tests/T1 Passes.md' ]);

    assert.deepEqual(
      await relative(
        [ 'R2' ],
        { recurse: true }),
      [ 'reqs/R2 Part.md',
        'reqs/tests/T2 Fails.md' ]);

    assert.deepEqual(
      await relative(
        [ 'reqs' ],
        {}),
      [ 'reqs/R1 Root.md',
        'reqs/R2 Part.md',
        'reqs/tests/T1 Passes.md',
        'reqs/tests/T2 Fails.md' ]);

    await assert.rejects(
      selectTargets(
        dir.path,
        [ ],
        {}),
      /No target/);
  });
