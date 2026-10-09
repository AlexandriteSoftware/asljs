import { serverUrl }
  from 'asljs-mdcli';
import assert
  from 'node:assert/strict';
import { Server }
  from 'node:http';
import test
  from 'node:test';
import { createTestEnvironment,
         withLibrary }
  from './testing/library.js';
import { isServed,
         startView }
  from './view.js';

const FILES =
  { 'notes/weekly.md':
      '# Weekly\n\nThe budget is approved. See [[Budget]].\n',
    'finance/Budget.md':
      '# Budget\n\nThe budget <b>is</b> 10.\n',
    'index.md': '# Home\n',
    '.git/config': 'secret' };

async function get(
    server: Server,
    pathname: string
  ): Promise<{ status: number; body: string; }>
{
  const response =
    await fetch(
      new URL(
        pathname,
        serverUrl(server)));

  return { status: response.status,
           body:
             await response.text() };
}

test(
  'the view lists the documents by folder, renders them, and hides dot folders',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const server =
          await startView(
            createTestEnvironment(library),
            { port: 0 });

        try {
          const index =
            (await get(
              server,
              '/')).body;

          for (
            const text of [ '<form class="search" action="/search">',
                            '<p class="note">3 documents</p>',
                            '<h2>Library</h2>\n<ul>\n<li><a href="/index.md">index</a></li>',
                            '<h2>finance</h2>\n<ul>\n<li><a href="/finance/Budget.md">Budget</a></li>',
                            '<h2>notes</h2>' ]
          ) {
            assert.ok(
              index.includes(text),
              text);
          }

          assert.match(
            (await get(
              server,
              '/notes/weekly.md')).body,
            /<p><a href="\/">Library<\/a><\/p>\n<h1>Weekly<\/h1>\n<p>The budget is approved\. See <a href="\.\.\/finance\/Budget\.md">Budget<\/a>\.<\/p>/);

          assert.equal(
            (await get(
              server,
              '/.git/config')).status,
            404);
        } finally {
          await new Promise(
            resolve => server.close(resolve));
        }
      });
  });

test(
  'the search page finds matches by document, escapes them, and reports a bad query',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const server =
          await startView(
            createTestEnvironment(library),
            { port: 0 });

        try {
          const found =
            (await get(
              server,
              '/search?q=budget')).body;

          for (
            const text of [ '<input type="search" name="q" value="budget"',
                            '<p class="note">3 matches in 3 documents.</p>',
                            '<h2><a href="/finance/Budget.md">finance/Budget.md</a></h2>',
                            '<li><span class="line">3</span> The budget &lt;b&gt;is&lt;/b&gt; 10.</li>' ]
          ) {
            assert.ok(
              found.includes(text),
              text);
          }

          assert.ok(
            (await get(
              server,
              '/search?q=Budget&case=on')).body
              .includes(
                '<p class="note">2 matches in 3 documents.</p>'));

          assert.ok(
            (await get(
              server,
              '/search?q=(&regex=on')).body
              .includes(
                '<p class="missing-link">'));

          assert.ok(
            !(await get(
              server,
              '/search')).body
              .includes('class="note"'));
        } finally {
          await new Promise(
            resolve => server.close(resolve));
        }
      });
  });

test(
  'isServed refuses dot files and folders and node_modules',
  () =>
  {
    assert.equal(
      isServed('notes/a.md'),
      true);

    for (
      const relative of [ '.env',
                          'notes/.draft.md',
                          '.git/config',
                          'node_modules/x/README.md' ]
    ) {
      assert.equal(
        isServed(relative),
        false,
        relative);
    }
  });
