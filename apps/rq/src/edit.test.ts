import assert
  from 'node:assert/strict';
import path
  from 'node:path';
import test
  from 'node:test';
import { addImplementationLink,
         appendListItem,
         appendLogEntry,
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
  'appendLogEntry adds a Log section, then adds to its list',
  () =>
  {
    const entry =
      { time:
          '2026-01-01T00:00:00.000Z',
        status:
          'Passed' as const,
        note: 'two\nlines' };

    const first =
      appendLogEntry(
        '# EV1\n\n## Steps\n\n```\nx\n```\n',
        entry);

    assert.equal(
      first,
      '# EV1\n\n## Steps\n\n```\nx\n```\n\n## Log\n\n- 2026-01-01T00:00:00.000Z Passed - two lines\n');

    assert.equal(
      appendLogEntry(
        first,
        { ...entry,
          status: 'Failed',
          note: '' }),
      `${first}- 2026-01-01T00:00:00.000Z Failed\n`);
  });

test(
  'appendListItem keeps the sections after the list section',
  () =>
  {
    assert.equal(
      appendListItem(
        '# EV1\n\n## Log\n\n## Notes\n\nText.\n',
        'Log',
        't Passed - ok'),
      '# EV1\n\n## Log\n\n- t Passed - ok\n\n## Notes\n\nText.\n');
  });

test(
  'appendListItem adds to the list before the definitions of a section',
  () =>
  {
    assert.equal(
      appendListItem(
        '# RQ1\n\n## Implementation\n\n- [EV1][ev1]\n\n[ev1]: <EV1 A.md>\n',
        'Implementation',
        '[RQ2](RQ2.md)'),
      '# RQ1\n\n## Implementation\n\n- [EV1][ev1]\n- [RQ2](RQ2.md)\n\n[ev1]: <EV1 A.md>\n');

    assert.equal(
      appendListItem(
        '# RQ1\n\n## Implementation\n\nSee below.\n',
        'Implementation',
        '[RQ2](RQ2.md)'),
      '# RQ1\n\n## Implementation\n\n- [RQ2](RQ2.md)\n\nSee below.\n');
  });

test(
  'addImplementationLink adds a relative link to the Implementation list',
  () =>
  {
    const text =
      addImplementationLink(
        '# RQ1\n\nStatement.\n',
        at('RQ1.md'),
        at(
          'evidence/EV1 [x].md'),
        'EV1 [x]');

    assert.equal(
      text,
      '# RQ1\n\nStatement.\n\n## Implementation\n\n- [EV1 \\[x\\]](<evidence/EV1 [x].md>)\n');

    assert.equal(
      addImplementationLink(
        text,
        at('RQ1.md'),
        at('../RQ2.md'),
        'RQ2'),
      `${text}- [RQ2](../RQ2.md)\n`);
  });

test(
  'removeLinks removes Implementation items and definitions, and unlinks other text',
  () =>
  {
    const text =
      `# RQ1

See [RQ2](<RQ2.md#a>) and [RQ2 again][r2], not [RQ3](RQ3.md).

## Implementation

- [RQ2](RQ2.md)
- [RQ3](RQ3.md)

## Notes

[r2]: <./RQ2.md>
`;

    assert.equal(
      removeLinks(
        text,
        at('RQ1.md'),
        target => target === at('RQ2.md')),
      `# RQ1

See RQ2 and RQ2 again, not [RQ3](RQ3.md).

## Implementation

- [RQ3](RQ3.md)

## Notes
`);
  });

test(
  'rewriteLinks points links at the new path, keeping fragments and titles',
  () =>
  {
    const text =
      `# RQ1

[old](<old/RQ2 a.md#part> "Title") ![pic](pic.png) [web](https://x.org/RQ2.md)

## Implementation

- [RQ2 a](<old/RQ2 a.md>)

[d]: old/RQ2%20a.md
`;

    assert.equal(
      rewriteLinks(
        text,
        at('RQ1.md'),
        at('RQ1.md'),
        target =>
          target === at('old/RQ2 a.md')
            ? at('new/RQ2 b.md')
            : null,
        { oldTitle: 'RQ2 a',
          newTitle: 'RQ2 b' }),
      `# RQ1

[old](<new/RQ2 b.md#part> "Title") ![pic](pic.png) [web](https://x.org/RQ2.md)

## Implementation

- [RQ2 b](<new/RQ2 b.md>)

[d]: <new/RQ2 b.md>
`);
  });

test(
  'rewriteLinks makes links relative to the new location of the document',
  () =>
  {
    assert.equal(
      rewriteLinks(
        '# RQ2\n\n[RQ1](RQ1.md) ![pic](img/pic.png)\n',
        at('RQ2.md'),
        at('sub/RQ2.md'),
        target => target),
      '# RQ2\n\n[RQ1](../RQ1.md) ![pic](../img/pic.png)\n');
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
        at('RQ1.md'),
        'sub/RQ%202.md#x'),
      { path:
          at('sub/RQ 2.md'),
        fragment: '#x' });

    assert.equal(
      resolveUrl(
        at('RQ1.md'),
        'https://x.org/a.md'),
      null);

    assert.equal(
      relativeUrl(
        at('a/RQ1.md'),
        at('b/RQ2.md')),
      '../b/RQ2.md');
  });
