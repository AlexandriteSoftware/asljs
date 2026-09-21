import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { findBacklinks }
  from './backlinks.js';
import { withLibrary }
  from './testing/library.js';

const FILES =
  { 'notes/budget.md':
      '# Budget\n\nSee [the plan](plan.md).\n',
    'notes/plan.md':
      [ '# Plan',
        '',
        'Relative: [budget](budget.md).',
        'Anchored: [budget](budget.md#summary).',
        'No extension: [budget](budget).',
        'From the root: [budget](/notes/budget.md).',
        'External: [budget](https://example.com/budget.md).',
        'Fragment only: [here](#plan).',
        '' ].join('\n'),
    'archive/old.md':
      [ '# Old',
        '',
        'Up one level: [budget](../notes/budget.md).',
        'An image: ![chart](../notes/budget.md).',
        '',
        'A reference: [budget][b].',
        '',
        '[b]: ../notes/budget.md',
        '' ].join('\n'),
    'inbox/quick.md':
      [ '# Quick',
        '',
        'A wiki link to [[budget]] and one that is',
        'written as [[budget.md|the budget]].',
        '',
        'An unrelated one: [[plan]].',
        '' ].join('\n'),
    'inbox/notes.txt':
      'Not markdown: [budget](../notes/budget.md).\n' };

test(
  'findBacklinks resolves relative, anchored and root-absolute links',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const backlinks =
          await findBacklinks(
            library.path,
            'notes/budget.md');

        assert.deepEqual(
          backlinks
            .filter(
              backlink => backlink.path === 'notes/plan.md')
            .map(
              backlink => [ backlink.line,
                            backlink.target ]),
          [ [ 3,
              'budget.md' ],
            [ 4,
              'budget.md#summary' ],
            [ 5,
              'budget' ],
            [ 6,
              '/notes/budget.md' ] ]);
      });
  });

test(
  'findBacklinks resolves links from another folder, images and definitions',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const backlinks =
          await findBacklinks(
            library.path,
            'notes/budget.md');

        assert.deepEqual(
          backlinks
            .filter(
              backlink => backlink.path === 'archive/old.md')
            .map(
              backlink => [ backlink.kind,
                            backlink.line ]),
          [ [ 'inline',
              3 ],
            [ 'image',
              4 ],
            [ 'definition',
              8 ] ]);
      });
  });

test(
  'findBacklinks matches wiki links by document name',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const backlinks =
          await findBacklinks(
            library.path,
            'notes/budget.md');

        assert.deepEqual(
          backlinks
            .filter(
              backlink => backlink.path === 'inbox/quick.md')
            .map(
              backlink => [ backlink.line,
                            backlink.column,
                            backlink.target ]),
          [ [ 3,
              16,
              'budget' ],
            [ 4,
              12,
              'budget.md' ] ]);
      });
  });

test(
  'findBacklinks ignores external links, fragments and non-markdown files',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const backlinks =
          await findBacklinks(
            library.path,
            'notes/budget.md');

        assert.equal(
          backlinks.some(
            backlink =>
            backlink.target.startsWith('https://')),
          false);

        assert.equal(
          backlinks.some(
            backlink => backlink.path === 'inbox/notes.txt'),
          false);
      });
  });

test(
  'findBacklinks skips the document itself unless includeSelf is set',
  async () =>
  {
    await withLibrary(
      { 'notes/one.md':
          '# One\n\nA self link: [one](one.md).\n' },
      async (
          library
        ) =>
      {
        assert.deepEqual(
          await findBacklinks(
            library.path,
            'notes/one.md'),
          [ ]);

        assert.equal(
          (await findBacklinks(
            library.path,
            'notes/one.md',
            { includeSelf: true }))
            .length,
          1);
      });
  });

test(
  'findBacklinks reports a target that does not exist',
  async () =>
  {
    await withLibrary(
      { 'notes/one.md':
          '# One\n\nA link to [a removed note](gone.md).\n' },
      async (
          library
        ) =>
      {
        assert.deepEqual(
          (await findBacklinks(
            library.path,
            'notes/gone.md'))
            .map(
              backlink => backlink.path),
          [ 'notes/one.md' ]);
      });
  });

test(
  'findBacklinks honours the pattern',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const backlinks =
          await findBacklinks(
            library.path,
            'notes/budget.md',
            { pattern: 'archive/**/*.md' });

        assert.deepEqual(
          [ ...new Set(
            backlinks.map(
              backlink => backlink.path)) ],
          [ 'archive/old.md' ]);
      });
  });

test(
  'findBacklinks rejects a target outside of the library',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        await assert.rejects(
          () =>
          findBacklinks(
            library.path,
            '../escaped.md'),
          /outside of the library/);
      });
  });
