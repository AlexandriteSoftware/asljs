import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import path
  from 'node:path';
import test
  from 'node:test';
import { compareItems,
         findItem,
         getItemId,
         itemPath,
         itemsOf,
         loadBoard,
         parseId,
         toFileSubject }
  from './items.js';
import { writeFixture }
  from './testing/fixture.js';

test(
  'parseId and getItemId read ideas, plans, tasks and results',
  () =>
  {
    assert.deepEqual(
      parseId('I19'),
      { id: 'I19',
        kind: 'idea',
        n: 19,
        m: null });

    assert.deepEqual(
      parseId('T19-2'),
      { id: 'T19-2',
        kind: 'task',
        n: 19,
        m: 2 });

    assert.equal(
      parseId('R3-1')?.kind,
      'result');

    for (
      const text of [ 'I19-2',
                      'T19',
                      'X1',
                      'I' ]
    ) {
      assert.equal(
        parseId(text),
        null,
        text);
    }

    assert.equal(
      getItemId(
        '/b/Plans/P7 Do it.md')?.id,
      'P7');

    assert.equal(
      getItemId('/b/Ideas/notes.md'),
      null);
  });

test(
  'loadBoard reads the items of each folder, and reports misplaced and duplicate ids',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    await dir.writeText(
      'board/Ideas/P20 Misplaced.md',
      '# P20 Misplaced\n');

    await dir.writeText(
      'board/Ideas/sub/I19 Again.md',
      '# I19 Again\n');

    await dir.writeText(
      'board/Archive/I1 Old/Ideas/I1 Old.md',
      '# I1 Old\n');

    await dir.writeText(
      'board/Ideas/README.md',
      '# Ideas\n');

    const board =
      await loadBoard(
        dir.resolve('board'));

    assert.deepEqual(
      board.items.map(
        item => `${item.id} ${item.subject}`),
      [ 'I19 Track how fresh articles are',
        'I20 Restrict kids internet access',
        'P19 Track how fresh articles are',
        'T19-1 Choose the articles',
        'T19-2 Add a review date',
        'R19-1 Choose the articles' ]);

    assert.deepEqual(
      board.problems,
      [ 'Ideas/P20 Misplaced.md: a plan in Ideas; move it to Plans.',
        'Ideas/sub/I19 Again.md: I19 is also Ideas/I19 Track how fresh articles are.md; ids must be unique.' ]);

    assert.deepEqual(
      (await loadBoard(
        dir.resolve('nowhere'))).items,
      [ ]);
  });

test(
  'findItem takes an id, a .md name or a path, and itemsOf groups an idea',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const board =
      await loadBoard(
        dir.resolve('board'));

    for (
      const target of [ 'T19-2',
                        'T19-2 Add a review date.md',
                        'Tasks/T19-2 Add a review date.md' ]
    ) {
      assert.equal(
        findItem(
          board,
          target).id,
        'T19-2',
        target);
    }

    assert.throws(
      () =>
        findItem(
          board,
          'P20'),
      /P20: no idea, plan, task or result of the board has this id/);

    const related =
      itemsOf(
        board,
        19);

    assert.deepEqual(
      [ related.idea?.id,
        related.plan?.id,
        related.tasks.map(item => item.id),
        related.results.map(item => item.id) ],
      [ 'I19',
        'P19',
        [ 'T19-1',
          'T19-2' ],
        [ 'R19-1' ] ]);

    assert.equal(
      itemsOf(
        board,
        20).plan,
      null);
  });

test(
  'itemPath names a new item, and toFileSubject makes a subject fit a file name',
  () =>
  {
    assert.equal(
      itemPath(
        '/b',
        'task',
        'T1-2',
        'Check: a/b?'),
      path.join(
        '/b',
        'Tasks',
        'T1-2 Check a b.md'));

    assert.equal(
      toFileSubject(
        ' Ends with dots... '),
      'Ends with dots');

    assert.ok(
      compareItems(
        { id: 'T1-10',
          kind: 'task',
          n: 1,
          m: 10 },
        { id: 'T1-2',
          kind: 'task',
          n: 1,
          m: 2 }) > 0);
  });

test(
  'loadBoard takes the subject from the heading, or from the file name without one',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'board/Ideas/I1 Short name.md',
      '# I1 The subject in full\n\nText.\n');

    await dir.writeText(
      'board/Ideas/I2 From the file.md',
      'No heading.\n');

    assert.deepEqual(
      (await loadBoard(
        dir.resolve('board'))).items.map(
          item => item.subject),
      [ 'The subject in full',
        'From the file' ]);
  });
