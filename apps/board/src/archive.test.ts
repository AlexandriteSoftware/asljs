import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { execArchive }
  from './archive.js';
import { loadBoard }
  from './items.js';
import { writeFixture }
  from './testing/fixture.js';
import { createTestIo }
  from './testing/test-io.js';

test(
  'execArchive moves an idea with its plan, tasks and results to the archive',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(
        dir.resolve('board'));

    assert.equal(
      await execArchive(
        io,
        { target: 'I19' }),
      0);

    assert.equal(
      io.out(),
      `Archived Ideas/I19 Track how fresh articles are.md -> Archive/I19 Track how fresh articles are/Ideas/I19 Track how fresh articles are.md
Archived Plans/P19 Track how fresh articles are.md -> Archive/I19 Track how fresh articles are/Plans/P19 Track how fresh articles are.md
Archived Tasks/T19-1 Choose the articles.md -> Archive/I19 Track how fresh articles are/Tasks/T19-1 Choose the articles.md
Archived Tasks/T19-2 Add a review date.md -> Archive/I19 Track how fresh articles are/Tasks/T19-2 Add a review date.md
Archived Results/R19-1 Choose the articles.md -> Archive/I19 Track how fresh articles are/Results/R19-1 Choose the articles.md
`);

    assert.deepEqual(
      (await loadBoard(
        dir.resolve('board'))).items.map(
          item => item.id),
      [ 'I20' ]);

    assert.ok(
      (await dir.stat(
        'board/Archive/I19 Track how fresh articles are/Results/R19-1 Choose the articles.md')).isFile());
  });

test(
  'execArchive takes any item of the idea, and refuses an archive that exists',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    await dir.writeText(
      'board/Archive/I20 Restrict kids internet access/notes.md',
      '# notes\n');

    const io =
      createTestIo(
        dir.resolve('board'));

    await assert.rejects(
      execArchive(
        io,
        { target: 'I20' }),
      /Archive\/I20 Restrict kids internet access already exists\./);

    await execArchive(
      io,
      { target: 'T19-2' });

    assert.match(
      io.out(),
      /^Archived Ideas\/I19 /);
  });
