import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { addQuestions,
         countOpen,
         readQuestions }
  from './questions.js';

test(
  'readQuestions reads each question and its answer',
  () =>
  {
    const text =
      '# I1 A\n\nText.\n\n## Open questions\n\n- Which devices?\n  - Answer: the\n    tablets\n- Which hours?\n- Who decides?\n  - Answer:\n\n## Notes\n\n- Not a question.\n';

    assert.deepEqual(
      readQuestions(text),
      [ { question: 'Which devices?',
          answer: 'the tablets' },
        { question: 'Which hours?',
          answer: null },
        { question: 'Who decides?',
          answer: null } ]);

    assert.equal(
      countOpen(text),
      2);

    assert.equal(
      countOpen('# I1 A\n'),
      0);
  });

test(
  'addQuestions adds to the Open questions section, or adds the section',
  () =>
  {
    assert.equal(
      addQuestions(
        '# T1-1 A\n\nDo it.\n',
        [ 'Which\naccount?' ]),
      '# T1-1 A\n\nDo it.\n\n## Open questions\n\n- Which account?\n');

    assert.equal(
      addQuestions(
        '# T1-1 A\n\n## Open questions\n\n- First?\n\n## Notes\n\nKept.\n',
        [ 'Second?' ]),
      '# T1-1 A\n\n## Open questions\n\n- First?\n- Second?\n\n## Notes\n\nKept.\n');

    assert.equal(
      addQuestions(
        '# T1-1 A\n\n## Open questions\n',
        [ 'Only?' ]),
      '# T1-1 A\n\n## Open questions\n\n- Only?\n');

    assert.equal(
      addQuestions(
        '# T1-1 A\n',
        [ ]),
      '# T1-1 A\n');
  });
