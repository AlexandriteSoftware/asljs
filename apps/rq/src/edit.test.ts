import assert
  from 'node:assert/strict';
import path
  from 'node:path';
import test
  from 'node:test';
import { addImplementationLink,
         appendListItem,
         relativeUrl,
         removeLinks,
         resolveUrl,
         rewriteLinks,
         setTitle }
  from './edit.js';

const DIR =
  path.resolve('/reqs');

function at(
    file: string
  ): string
{
  return path.join(
    DIR,
    file);
}

test(
  'appendListItem adds a missing section, then adds to its list',
  () =>
  {
    const first =
      appendListItem(
        '# R1\n\nStatement.\n',
        'Implementation',
        'a');

    assert.equal(
      first,
      '# R1\n\nStatement.\n\n## Implementation\n\n- a\n');

    assert.equal(
      appendListItem(
        first,
        'Implementation',
        'b'),
      `${first}- b\n`);
  });

test(
  'appendListItem keeps the sections after the list section',
  () =>
  {
    assert.equal(
      appendListItem(
        '# T1\n\n## Log\n\n## Notes\n\nText.\n',
        'Log',
        't Passed - ok'),
      '# T1\n\n## Log\n\n- t Passed - ok\n\n## Notes\n\nText.\n');
  });

test(
  'appendListItem adds to the list before the definitions of a section',
  () =>
  {
    assert.equal(
      appendListItem(
        '# R1\n\n## Implementation\n\n- [T1][t1]\n\n[t1]: <T1 A.md>\n',
        'Implementation',
        '[R2](R2.md)'),
      '# R1\n\n## Implementation\n\n- [T1][t1]\n- [R2](R2.md)\n\n[t1]: <T1 A.md>\n');

    assert.equal(
      appendListItem(
        '# R1\n\n## Implementation\n\nSee below.\n',
        'Implementation',
        '[R2](R2.md)'),
      '# R1\n\n## Implementation\n\n- [R2](R2.md)\n\nSee below.\n');
  });

test(
  'addImplementationLink adds a relative link to the Implementation list',
  () =>
  {
    const text =
      addImplementationLink(
        '# R1\n\nStatement.\n',
        at('R1.md'),
        at(
          'tests/T1 [x].md'),
        'T1 [x]');

    assert.equal(
      text,
      '# R1\n\nStatement.\n\n## Implementation\n\n- [T1 \\[x\\]][T1]\n\n[T1]: <tests/T1 [x].md>\n');

    assert.equal(
      addImplementationLink(
        text,
        at('R1.md'),
        at('../R2.md'),
        'R2'),
      '# R1\n\nStatement.\n\n## Implementation\n\n- [T1 \\[x\\]][T1]\n- [R2][R2]\n\n[T1]: <tests/T1 [x].md>\n[R2]: ../R2.md\n');

    assert.equal(
      addImplementationLink(
        '# R1\n\n## Implementation\n\n- [Other][T1]\n\n[T1]: other.md\n\n## Notes\n\nKept.\n',
        at('R1.md'),
        at('T1 A.md'),
        'T1 A'),
      '# R1\n\n## Implementation\n\n- [Other][T1]\n- [T1 A][T1-2]\n\n[T1]: other.md\n[T1-2]: <T1 A.md>\n\n## Notes\n\nKept.\n');
  });

test(
  'removeLinks removes Implementation items and definitions, and unlinks other text',
  () =>
  {
    const text =
      `# R1

See [R2](<R2.md#a>) and [R2 again][r2], not [R3](R3.md).

## Implementation

- [R2](R2.md)
- [R3](R3.md)

## Notes

[r2]: <./R2.md>
`;

    assert.equal(
      removeLinks(
        text,
        at('R1.md'),
        target => target === at('R2.md')),
      `# R1

See R2 and R2 again, not [R3](R3.md).

## Implementation

- [R3](R3.md)

## Notes
`);
  });

test(
  'rewriteLinks points links at the new path, keeping fragments and titles',
  () =>
  {
    const text =
      `# R1

[old](<old/R2 a.md#part> "Title") ![pic](pic.png) [web](https://x.org/R2.md)

## Implementation

- [R2 a](<old/R2 a.md>)

[d]: old/R2%20a.md
`;

    assert.equal(
      rewriteLinks(
        text,
        at('R1.md'),
        at('R1.md'),
        target =>
          target === at('old/R2 a.md')
            ? at('new/R2 b.md')
            : null,
        { oldTitle: 'R2 a',
          newTitle: 'R2 b' }),
      `# R1

[old](<new/R2 b.md#part> "Title") ![pic](pic.png) [web](https://x.org/R2.md)

## Implementation

- [R2 b](<new/R2 b.md>)

[d]: <new/R2 b.md>
`);
  });

test(
  'rewriteLinks makes links relative to the new location of the document',
  () =>
  {
    assert.equal(
      rewriteLinks(
        '# R2\n\n[R1](R1.md) ![pic](img/pic.png)\n',
        at('R2.md'),
        at('sub/R2.md'),
        target => target),
      '# R2\n\n[R1](../R1.md) ![pic](../img/pic.png)\n');
  });

test(
  'setTitle replaces or adds the level 1 heading',
  () =>
  {
    assert.equal(
      setTitle(
        '# Old\n\nText.\n',
        'New'),
      '# New\n\nText.\n');

    assert.equal(
      setTitle(
        'Text.\n',
        'New'),
      '# New\n\nText.\n');
  });

test(
  'resolveUrl and relativeUrl work on local paths',
  () =>
  {
    assert.deepEqual(
      resolveUrl(
        at('R1.md'),
        'sub/R%202.md#x'),
      { path:
          at('sub/R 2.md'),
        fragment: '#x' });

    assert.equal(
      resolveUrl(
        at('R1.md'),
        'https://x.org/a.md'),
      null);

    assert.equal(
      relativeUrl(
        at('a/R1.md'),
        at('b/R2.md')),
      '../b/R2.md');
  });
