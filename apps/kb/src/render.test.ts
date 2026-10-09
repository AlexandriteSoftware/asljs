import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { renderDocument }
  from './render.js';
import { withLibrary }
  from './testing/library.js';

test(
  'renderDocument leaves out the front matter and turns wiki links into links',
  async () =>
  {
    await withLibrary(
      { 'notes/weekly review.md':
          '---\ntitle: Weekly review\n---\n# Week 1\n\nSee [[Budget]], [[projects/plan|the plan]], [[Nowhere]] and `[[Code]]`.\n',
        'finance/Budget.md': '# Budget\n',
        'projects/plan.md': '# Plan\n' },
      async (
          library
        ) =>
      {
        const rendered =
          await renderDocument(
            library.path,
            'notes/weekly review.md');

        assert.equal(
          rendered.path,
          'notes/weekly review.md');

        assert.equal(
          rendered.title,
          'Weekly review');

        assert.equal(
          rendered.html,
          '<h1>Week 1</h1>\n<p>See <a href="../finance/Budget.md">Budget</a>, <a href="../projects/plan.md">the plan</a>, <span class="missing-link">Nowhere</span> and <code>[[Code]]</code>.</p>\n');
      });
  });

test(
  'renderDocument takes the title from the heading or the file name, and refuses what is not markdown',
  async () =>
  {
    await withLibrary(
      { 'a.md':
          'Text.\n\n# The heading\n',
        'b.md': 'Only text.\n',
        'c.txt': 'Plain.\n',
        'd e.md': 'Link to [[a]].\n' },
      async (
          library
        ) =>
      {
        assert.equal(
          (await renderDocument(
            library.path,
            'a.md')).title,
          'The heading');

        assert.equal(
          (await renderDocument(
            library.path,
            'b.md')).title,
          'b');

        assert.equal(
          (await renderDocument(
            library.path,
            'd e.md')).html,
          '<p>Link to <a href="a.md">a</a>.</p>\n');

        await assert.rejects(
          renderDocument(
            library.path,
            'c.txt'),
          /Not a markdown document: c\.txt/);
      });
  });
