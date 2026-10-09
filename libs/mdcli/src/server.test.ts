import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import { Server }
  from 'node:http';
import { AddressInfo }
  from 'node:net';
import test
  from 'node:test';
import { DEFAULT_PORT,
         escapeHtml,
         markdownToHtml,
         page,
         serverUrl,
         startServer }
  from './server.js';

async function get(
    server: Server,
    pathname: string
  ): Promise<{ status: number; type: string; body: string; }>
{
  const response =
    await fetch(
      new URL(
        pathname,
        serverUrl(server)));

  return { status: response.status,
           type:
             response.headers.get('content-type') ?? '',
           body:
             await response.text() };
}

test(
  'startServer serves the index, rendered markdown and the files of its folder only',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'site/A b.md',
      '# A b\n\n[Next](next.md)\n');

    await dir.writeText(
      'site/data.json',
      '{}');

    await dir.writeText(
      'secret.md',
      '# secret\n');

    let calls = 0;

    const server =
      await startServer(
        { folder:
            dir.resolve('site'),
          index:
            async () =>
            {
          calls += 1;

          return page(
            'Home',
            `<p>call ${calls}</p>`);
        },
          home: 'Back',
          style:
            '.x { color: red; }',
          port: 0 });

    try {
      assert.match(
        (await get(
          server,
          '/')).body,
        /<title>Home<\/title>[\s\S]*<p>call 1<\/p>/);

      assert.match(
        (await get(
          server,
          '/')).body,
        /<p>call 2<\/p>/);

      const document =
        await get(
          server,
          '/A%20b.md');

      assert.equal(
        document.type,
        'text/html; charset=utf-8');

      assert.match(
        document.body,
        /\.x \{ color: red; \}[\s\S]*<p><a href="\/">Back<\/a><\/p>\n<h1>A b<\/h1>[\s\S]*<a href="next.md">Next<\/a>/);

      assert.equal(
        (await get(
          server,
          '/data.json')).type,
        'application/json; charset=utf-8');

      assert.equal(
        (await get(
          server,
          '/../secret.md')).status,
        404);
    } finally {
      await new Promise(
        resolve => server.close(resolve));
    }
  });

test(
  'startServer takes the first free port from 3000 on unless a port is given',
  async () =>
  {
    const options =
      { folder:
          process.cwd(),
        index: async () => '',
        home: 'Home' };

    const first =
      await startServer(options);

    const second =
      await startServer(options);

    try {
      const port =
        (first.address() as AddressInfo).port;

      assert.ok(
        port >= DEFAULT_PORT);

      assert.ok(
        (second.address() as AddressInfo).port > port);

      await assert.rejects(
        startServer(
          { ...options,
            port }),
        /EADDRINUSE/);
    } finally {
      for (const server of [ first,
                             second ]) {
        await new Promise(
          resolve => server.close(resolve));
      }
    }
  });

test(
  'escapeHtml escapes markup characters',
  () =>
  {
    assert.equal(
      escapeHtml('<a href="x">&</a>'),
      '&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;');
  });

test(
  'startServer serves its pages, renders markdown with render, and refuses what allow refuses',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'notes/a.md',
      '# A\n');

    await dir.writeText(
      '.git/config',
      'secret');

    const server =
      await startServer(
        { folder: dir.path,
          index: async () => 'index',
          home: 'Home',
          port: 0,
          pages:
            { '/search':
                async url => `searched ${url.searchParams.get('q') ?? ''}` },
          render:
            async (
          _file,
          relative
        ) => `<p>rendered ${relative}</p>`,
          allow:
            relative => !relative.startsWith('.git/') });

    try {
      assert.equal(
        (await get(
          server,
          '/search?q=budget%20plan')).body,
        'searched budget plan');

      assert.match(
        (await get(
          server,
          '/notes/a.md')).body,
        /<p><a href="\/">Home<\/a><\/p>\n<p>rendered notes\/a\.md<\/p>/);

      assert.equal(
        (await get(
          server,
          '/.git/config')).status,
        404);

      assert.equal(
        (await get(
          server,
          '/toString')).status,
        404);
    } finally {
      await new Promise(
        resolve => server.close(resolve));
    }
  });

test(
  'markdownToHtml renders tables and task lists',
  () =>
  {
    const html =
      markdownToHtml(
        '| a | b |\n| - | - |\n| 1 | 2 |\n\n- [x] done\n');

    assert.match(
      html,
      /<table>/);

    assert.match(
      html,
      /<input checked="" disabled="" type="checkbox">/);
  });
