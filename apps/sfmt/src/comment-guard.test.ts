import { type TSESLint }
  from '@typescript-eslint/utils';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { editsDropComment }
  from './comment-guard.js';

const TEST_SUITE = 'comment-guard';

/** A source of `text` whose comments sit at the given ranges. */
function sourceWith(
    text: string,
    commentRanges: Array<[number, number]>
  ): TSESLint.SourceCode
{
  const comments =
    commentRanges.map(
      range => ({ range }));

  return { getAllComments: () => comments,
           getText:
             (node: { range: [number, number]; }) =>
      text.slice(
        node.range[0],
        node.range[1]) } as unknown as TSESLint.SourceCode;
}

const SOURCE =
  'f(\n  // keep\n  a);';

const COMMENT: [number, number] =
  [ 5,
    12 ];

test(
  `${TEST_SUITE}: an edit that rebuilds the comment away drops it`,
  () =>
  {
    assert.equal(
      editsDropComment(
        sourceWith(
          SOURCE,
          [ COMMENT ]),
        [ { range:
              [ 0,
                SOURCE.length ],
            text: 'f(a);' } ]),
      true);
  });

test(
  `${TEST_SUITE}: an edit whose text keeps the comment does not drop it`,
  () =>
  {
    assert.equal(
      editsDropComment(
        sourceWith(
          SOURCE,
          [ COMMENT ]),
        [ { range:
              [ 0,
                SOURCE.length ],
            text:
              'f(\n  // keep\n  a);' } ]),
      false);
  });

test(
  `${TEST_SUITE}: an edit that does not cover the comment does not drop it`,
  () =>
  {
    assert.equal(
      editsDropComment(
        sourceWith(
          SOURCE,
          [ COMMENT ]),
        [ { range:
              [ 15,
                16 ],
            text: 'b' } ]),
      false);
  });
