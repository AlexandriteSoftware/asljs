import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { findBacklinks,
         findReferrers,
         loadScope,
         nextId }
  from './scope.js';
import { writeFixture }
  from './testing/fixture.js';

test(
  'scope finds backlinks, referrers and the next ids',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const scope =
      await loadScope(dir.path);

    assert.deepEqual(
      findBacklinks(
        scope,
        dir.resolve('reqs/RQ2 Part.md')),
      [ dir.resolve('reqs/RQ1 Root.md') ]);

    assert.deepEqual(
      findBacklinks(
        scope,
        dir.resolve('reqs/RQ1 Root.md')),
      [ ]);

    assert.deepEqual(
      findReferrers(
        scope,
        new Set(
          [ dir.resolve('reqs/RQ1 Root.md') ])),
      [ dir.resolve(
        'reqs/evidence/EV1 Passes.md') ]);

    assert.equal(
      nextId(
        scope,
        'RQ'),
      'RQ3');

    assert.equal(
      nextId(
        scope,
        'EV'),
      'EV3');

    assert.equal(
      nextId(
        new Map(),
        'RQ'),
      'RQ1');
  });
