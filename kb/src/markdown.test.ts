import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { documentLine,
         formatMarkdown,
         parseMarkdown,
         splitFrontMatter }
  from './markdown.js';

test(
  'splitFrontMatter reads a YAML mapping',
  () =>
  {
    const { frontMatter,
            body } =
      splitFrontMatter(
        '---\ntitle: One\ntags:\n  - a\n---\n# One\n');

    assert.deepEqual(
      frontMatter.data,
      { title: 'One',
        tags:
          [ 'a' ] });

    assert.equal(
      frontMatter.lines,
      5);

    assert.equal(
      body,
      '# One\n');
  });

test(
  'splitFrontMatter treats an unterminated block as content',
  () =>
  {
    const { frontMatter,
            body } =
      splitFrontMatter(
        '---\ntitle: One\n# One\n');

    assert.equal(
      frontMatter.data,
      null);

    assert.equal(
      frontMatter.lines,
      0);

    assert.equal(
      body,
      '---\ntitle: One\n# One\n');
  });

test(
  'splitFrontMatter reports invalid YAML as absent data',
  () =>
  {
    const { frontMatter } =
      splitFrontMatter(
        '---\n: : :\n---\n# One\n');

    assert.equal(
      frontMatter.data,
      null);

    assert.equal(
      frontMatter.lines,
      3);
  });

test(
  'parseMarkdown produces a GFM tree of the body',
  () =>
  {
    const document =
      parseMarkdown(
        '---\ntitle: One\n---\n# One\n\n- [ ] task\n',
        'one.md');

    assert.equal(
      document.path,
      'one.md');

    assert.equal(
      document.root.children[0]?.type,
      'heading');

    assert.equal(
      documentLine(
        document,
        1),
      4);
  });

test(
  'formatMarkdown normalises markers and keeps front matter',
  () =>
  {
    const formatted =
      formatMarkdown(
        '---\ntitle: One\n---\nOne\n===\n\n* first\n* second\n');

    assert.equal(
      formatted,
      '---\ntitle: One\n---\n\n# One\n\n- first\n- second\n');
  });

test(
  'formatMarkdown is idempotent',
  () =>
  {
    const once =
      formatMarkdown(
        '#   One\n\n*  item\n');

    assert.equal(
      formatMarkdown(once),
      once);
  });
