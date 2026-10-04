import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { collectPages,
         createSlugger,
         relativeHref,
         renderSite,
         resolveLink,
         type SiteOptions,
         toOutputPath }
  from './site.js';

const TEST_SUITE = 'site';

function createOptions(
    files: Record<string, string>,
    directories: string[] = [ ]
  ): SiteOptions
{
  return { read:
             (
                 sourcePath
               ) =>
             {
      const text = files[sourcePath];

      if (text === undefined) {
        throw new Error(
          `No such file: ${sourcePath}`);
      }

      return text;
    },
           isMarkdownFile:
             sourcePath => sourcePath in files,
           isDirectory:
             sourcePath => directories.includes(sourcePath),
           repositoryUrl:
             'https://example.test/repo',
           branch: 'main' };
}

test(
  `${TEST_SUITE}: a README becomes its directory's index page`,
  (): void =>
  {
    assert.equal(
      toOutputPath('README.md'),
      'index.html');

    assert.equal(
      toOutputPath(
        'libs/eventful/README.md'),
      'libs/eventful/index.html');

    assert.equal(
      toOutputPath(
        'docs/Repository Layout.md'),
      'docs/Repository Layout.html');
  });

test(
  `${TEST_SUITE}: links resolve against the page that holds them`,
  (): void =>
  {
    assert.deepEqual(
      resolveLink(
        './libs/eventful/README.md#usage',
        'README.md'),
      { kind: 'repository',
        path:
          'libs/eventful/README.md',
        hash: '#usage' });

    assert.deepEqual(
      resolveLink(
        '../../docs/Repository%20Layout.md',
        'libs/eventful/README.md'),
      { kind: 'repository',
        path:
          'docs/Repository Layout.md',
        hash: '' });

    assert.deepEqual(
      resolveLink(
        'https://example.test/x.md',
        'README.md'),
      { kind: 'external',
        href:
          'https://example.test/x.md' });

    assert.deepEqual(
      resolveLink(
        '#scope',
        'README.md'),
      { kind: 'anchor',
        href: '#scope' });

    assert.deepEqual(
      resolveLink(
        '../outside.md',
        'README.md'),
      { kind: 'external',
        href: '../outside.md' });
  });

test(
  `${TEST_SUITE}: hrefs between pages are relative and encoded`,
  (): void =>
  {
    assert.equal(
      relativeHref(
        'index.html',
        'docs/Repository Layout.html'),
      'docs/Repository%20Layout.html');

    assert.equal(
      relativeHref(
        'libs/eventful/index.html',
        'index.html'),
      '../../index.html');
  });

test(
  `${TEST_SUITE}: pages are the entry and the markdown it reaches`,
  (): void =>
  {
    const options =
      createOptions(
        { 'README.md':
            '[a](libs/a/README.md) [b][B] [missing](none.md)\n\n'
          + '[B]: <docs/b file.md>\n',
          'libs/a/README.md':
            '[back](../../README.md) [b](../../docs/b file.md)',
          'docs/b file.md': '# B',
          'docs/unlinked.md': '# Unlinked' });

    assert.deepEqual(
      collectPages(
        'README.md',
        options),
      [ 'README.md',
        'libs/a/README.md',
        'docs/b file.md' ]);
  });

test(
  `${TEST_SUITE}: links to pages point at their HTML, others at the repository`,
  (): void =>
  {
    const pages =
      renderSite(
        'README.md',
        createOptions(
          { 'README.md':
              '# Project\n\n'
            + '[a](libs/a/README.md#usage) '
            + '[source](libs/a/src/index.ts) '
            + '[dir](libs/a/src) '
            + '[site](https://example.test/)\n',
            'libs/a/README.md':
              '# A\n\n[home](../../README.md)\n' },
          [ 'libs/a/src' ]));

    const [landing, packagePage] = pages;

    assert.equal(
      landing.outputPath,
      'index.html');

    assert.match(
      landing.html,
      /<a href="libs\/a\/index\.html#usage">a<\/a>/);

    assert.match(
      landing.html,
      /<a href="https:\/\/example\.test\/repo\/blob\/main\/libs\/a\/src\/index\.ts">source<\/a>/);

    assert.match(
      landing.html,
      /<a href="https:\/\/example\.test\/repo\/tree\/main\/libs\/a\/src">dir<\/a>/);

    assert.match(
      landing.html,
      /<a href="https:\/\/example\.test\/">site<\/a>/);

    assert.match(
      landing.html,
      /<title>asljs<\/title>/);

    assert.match(
      packagePage.html,
      /<a href="\.\.\/\.\.\/index\.html">home<\/a>/);

    assert.match(
      packagePage.html,
      /<title>A · asljs<\/title>/);

    assert.match(
      packagePage.html,
      /<link rel="stylesheet" href="\.\.\/\.\.\/site\.css">/);
  });

test(
  `${TEST_SUITE}: headings get GitHub's ids, numbered when repeated`,
  (): void =>
  {
    const slug =
      createSlugger();

    assert.equal(
      slug('Further reading'),
      'further-reading');

    assert.equal(
      slug(
        '`on`, `off` & emit()'),
      'on-off--emit');

    assert.equal(
      slug('Further reading'),
      'further-reading-1');
  });
