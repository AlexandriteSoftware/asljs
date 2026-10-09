import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { execList }
  from './list.js';
import { writeFixture }
  from './testing/fixture.js';
import { createTestIo }
  from './testing/test-io.js';

test(
  'execList prints the columns with the status and open questions of each item',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    await dir.writeText(
      'board/Ideas/P9 Misplaced.md',
      '# P9 Misplaced\n');

    const io =
      createTestIo(
        dir.resolve('board'));

    assert.equal(
      await execList(
        io,
        {}),
      0);

    assert.equal(
      io.out(),
      `Ideas
  PLANNED  Ideas/I19 Track how fresh articles are.md
  NEW      Ideas/I20 Restrict kids internet access.md - 1 open questions
Plans
  TASKS    Plans/P19 Track how fresh articles are.md
Tasks
  DONE     Tasks/T19-1 Choose the articles.md
  TODO     Tasks/T19-2 Add a review date.md
Results
  DONE     Results/R19-1 Choose the articles.md
`);

    assert.equal(
      io.err(),
      'Error  Ideas/P9 Misplaced.md: a plan in Ideas; move it to Plans.\n');

    const json =
      createTestIo(
        dir.resolve('board'));

    await execList(
      json,
      { json: true });

    const columns =
      JSON.parse(
        json.out());

    assert.deepEqual(
      Object.keys(columns),
      [ 'idea',
        'plan',
        'task',
        'result' ]);

    assert.deepEqual(
      columns.idea[1],
      { id: 'I20',
        kind: 'idea',
        subject:
          'Restrict kids internet access',
        path:
          'Ideas/I20 Restrict kids internet access.md',
        status: 'NEW',
        openQuestions: 1 });
  });

test(
  'execList shows a plan without tasks as NEW, and reports an id used twice',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    await dir.writeText(
      'board/Plans/P20 Restrict kids internet access.md',
      '# P20 Restrict kids internet access\n');

    await dir.writeText(
      'board/Tasks/T19-1 Again.md',
      '# T19-1 Again\n');

    const io =
      createTestIo(
        dir.resolve('board'));

    await execList(
      io,
      {});

    assert.match(
      io.out(),
      /\n {2}NEW {6}Plans\/P20 Restrict kids internet access\.md\n/);

    assert.equal(
      io.err(),
      'Error  Tasks/T19-1 Choose the articles.md: T19-1 is also Tasks/T19-1 Again.md; ids must be unique.\n');
  });
