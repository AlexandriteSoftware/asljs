import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { findBacklinks,
         findReferrers,
         loadScope,
         nextId,
         resolveTarget }
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
        dir.resolve('reqs/R2 Part.md')),
      [ dir.resolve('reqs/R1 Root.md') ]);

    assert.deepEqual(
      findBacklinks(
        scope,
        dir.resolve('reqs/R1 Root.md')),
      [ ]);

    assert.deepEqual(
      findReferrers(
        scope,
        new Set(
          [ dir.resolve('reqs/R1 Root.md') ])),
      [ dir.resolve(
        'reqs/tests/T1 Passes.md') ]);

    assert.equal(
      nextId(
        scope,
        'R'),
      'R3');

    assert.equal(
      nextId(
        scope,
        'T'),
      'T3');

    assert.equal(
      nextId(
        new Map(),
        'R'),
      'R1');
  });

test(
  'resolveTarget searches the working folder for ids and .md names, and resolves other paths',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    assert.equal(
      await resolveTarget(
        dir.path,
        'T2'),
      dir.resolve(
        'reqs/tests/T2 Fails.md'));

    assert.equal(
      await resolveTarget(
        dir.path,
        'R2 Part.md'),
      dir.resolve('reqs/R2 Part.md'));

    assert.equal(
      await resolveTarget(
        dir.resolve('reqs'),
        'tests/T1 Passes.md'),
      dir.resolve(
        'reqs/tests/T1 Passes.md'));

    assert.equal(
      await resolveTarget(
        dir.path,
        'reqs/tests'),
      dir.resolve('reqs/tests'));

    await assert.rejects(
      resolveTarget(
        dir.resolve('reqs/tests'),
        'R1'),
      /R1: no requirement or test has this id in /);

    await assert.rejects(
      resolveTarget(
        dir.path,
        'Nope.md'),
      /Nope\.md: no such file in /);

    await dir.writeText(
      'other/R1 Root.md',
      '# R1 Copy\n');

    await assert.rejects(
      resolveTarget(
        dir.path,
        'R1'),
      /R1: several documents match: other\/R1 Root\.md, reqs\/R1 Root\.md\./);

    await assert.rejects(
      resolveTarget(
        dir.path,
        'R1 Root.md'),
      /R1 Root\.md: several documents match/);
  });
