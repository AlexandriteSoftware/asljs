import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { loadGraph }
  from '../graph.js';
import { ranWith,
         writeFixture }
  from './fixture.js';

test(
  'writeFixture writes the requirements and tests',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    for (
      const file of [ 'reqs/R1 Root.md',
                      'reqs/R2 Part.md',
                      'reqs/tests/T1 Passes.md',
                      'reqs/tests/T2 Fails.md',
                      '.rq/E1 Earlier.md' ]
    ) {
      assert.ok(
        (await dir.stat(file)).isFile());
    }
  });

test(
  'ranWith makes run results for the tests with the given ids',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const options =
      ranWith(
        await loadGraph(
          dir.resolve('reqs')),
        [ [ 'T2',
            'PASS' ] ]);

    assert.equal(
      options.recalculate,
      'all');

    assert.deepEqual(
      [ ...options.run!.values() ],
      [ { file:
            dir.resolve(
              'reqs/tests/T2 Fails.md'),
          status: 'PASS',
          note: '',
          output: '' } ]);
  });
