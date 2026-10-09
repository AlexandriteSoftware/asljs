import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { formatUrl,
         getSection,
         parseMarkdown,
         plainText,
         splitLocalUrl }
  from './markdown.js';

test(
  'getSection returns the nodes up to the next heading of level 1 or 2',
  () =>
  {
    const root =
      parseMarkdown(
        '# T\n\n## A\n\nOne.\n\n### Sub\n\nTwo.\n\n## B\n\nThree.\n');

    assert.deepEqual(
      getSection(
        root,
        'A')!
        .map(
          node => plainText(node)),
      [ 'One.',
        'Sub',
        'Two.' ]);

    assert.equal(
      getSection(
        root,
        'Missing'),
      null);
  });

test(
  'splitLocalUrl decodes local paths and skips other targets',
  () =>
  {
    assert.deepEqual(
      splitLocalUrl('a/B%20c.md#d'),
      { path: 'a/B c.md',
        fragment: '#d' });

    assert.deepEqual(
      splitLocalUrl('bad%zz.md'),
      { path: 'bad%zz.md',
        fragment: '' });

    for (
      const url of [ 'https://x.org/a.md',
                     'mailto:a@b',
                     '//host/a.md',
                     '/abs.md',
                     '#frag',
                     '' ]
    ) {
      assert.equal(
        splitLocalUrl(url),
        null,
        url);
    }
  });

test(
  'formatUrl brackets targets with spaces or parentheses',
  () =>
  {
    assert.equal(
      formatUrl('a/b.md'),
      'a/b.md');

    assert.equal(
      formatUrl('a b.md'),
      '<a b.md>');

    assert.equal(
      formatUrl('a(b).md'),
      '<a(b).md>');
  });
