import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { collectPages,
         relativeHref,
         resolveLink,
         rewriteLinks,
         type SiteOptions,
         stageSite }
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
        'README.md',
        'docs/Repository Layout.md'),
      'docs/Repository%20Layout.md');

    assert.equal(
      relativeHref(
        'libs/eventful/README.md',
        'README.md'),
      '../../README.md');
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
  `${TEST_SUITE}: links to pages stay relative, others go to the repository`,
  (): void =>
  {
    const [landing, packagePage] =
      stageSite(
        'README.md',
        createOptions(
          { 'README.md':
              '# Project\n\n'
            + '[a](libs/a/README.md#usage) '
            + '[source](libs/a/src/index.ts) '
            + '[dir](libs/a/src) '
            + '[site](https://example.test/) '
            + '[b][B]\n\n'
            + '[B]: <docs/b file.md>\n',
            'libs/a/README.md':
              '# A\n\n[home](../../README.md)\n',
            'docs/b file.md': '# B' },
          [ 'libs/a/src' ]));

    assert.equal(
      landing.sourcePath,
      'README.md');

    assert.equal(
      landing.markdown,
      '# Project\n\n'
        + '[a](libs/a/README.md#usage) '
        + '[source](https://example.test/repo/blob/main/libs/a/src/index.ts) '
        + '[dir](https://example.test/repo/tree/main/libs/a/src) '
        + '[site](https://example.test/) '
        + '[b][B]\n\n'
        + '[B]: docs/b%20file.md\n');

    assert.equal(
      packagePage.markdown,
      '# A\n\n[home](../../README.md)\n');
  });

test(
  `${TEST_SUITE}: code blocks and code spans keep their links`,
  (): void =>
  {
    const markdown =
      'see `[x](a.md)` and [y](a.md)\n'
      + '```md\n'
      + '[z](a.md)\n'
      + '[Z]: a.md\n'
      + '```\n'
      + '[Y]: a.md "title"\n';

    assert.equal(
      rewriteLinks(
        markdown,
        href => `#${href}`),
      'see `[x](a.md)` and [y](#a.md)\n'
        + '```md\n'
        + '[z](a.md)\n'
        + '[Z]: a.md\n'
        + '```\n'
        + '[Y]: #a.md "title"\n');
  });
