import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { writeFixture }
  from './fixture.js';

test(
  'writeFixture writes the requirements and evidence',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    for (
      const file of [ 'reqs/RQ1 Root.md',
                      'reqs/RQ2 Part.md',
                      'reqs/evidence/EV1 Passes.md',
                      'reqs/evidence/EV2 Fails.md' ]
    ) {
      assert.ok(
        (await dir.stat(file)).isFile());
    }
  });
