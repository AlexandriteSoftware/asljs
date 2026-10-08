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
import { writeFixture }
  from './testing/fixture.js';
import { createTestIo }
  from './testing/test-io.js';
import { execView }
  from './view.js';

async function get(
    server: Server,
    pathname: string
  ): Promise<{ status: number; type: string; body: string; }>
{
  const { port } =
    server.address() as AddressInfo;

  const response =
    await fetch(
      `http://127.0.0.1:${port}${pathname}`);

  return { status: response.status,
           type:
             response.headers.get('content-type') ?? '',
           body:
             await response.text() };
}

test(
  'execView serves the graph and the rendered documents',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    await dir.writeText(
      'reqs/pic.png',
      'png');

    await dir.writeText(
      'secret.md',
      '# Secret\n');

    const io =
      createTestIo(dir.path);

    const server =
      await execView(
        io,
        { target: 'reqs',
          port: 0 });

    try {
      assert.match(
        io.out(),
        /^Serving .+reqs at http:\/\/127\.0\.0\.1:\d+\/\n$/);

      const index =
        await get(
          server,
          '/');

      assert.equal(
        index.type,
        'text/html; charset=utf-8');

      for (
        const text of [ '<title>RQ1 Root</title>',
                        '<pre class="mermaid">\ngraph TD\n  n0[&quot;RQ1 Root&quot;]',
                        '  n0 --&gt; n1',
                        'click n2 href &quot;/evidence/EV1%20Passes.md&quot;',
                        '<li><a href="/RQ2%20Part.md">RQ2 Part</a></li>',
                        '<a href="/evidence/EV1%20Passes.md">EV1 Passes</a> <span class="failed">(evidence, Failed)</span>',
                        '<span class="not-run">(evidence, Not run)</span>',
                        'mermaid.esm.min.mjs' ]
      ) {
        assert.ok(
          index.body.includes(text),
          text);
      }

      const document =
        await get(
          server,
          '/RQ2%20Part.md');

      assert.equal(
        document.status,
        200);

      assert.ok(
        document.body.includes('<h1>RQ2 Part</h1>'));

      assert.ok(
        document.body.includes(
          '<a href="evidence/EV2%20Fails.md">EV2</a>'));

      assert.deepEqual(
        await get(
          server,
          '/pic.png'),
        { status: 200,
          type: 'image/png',
          body: 'png' });

      assert.equal(
        (await get(
          server,
          '/../secret.md')).status,
        404);

      assert.equal(
        (await get(
          server,
          '/%2E%2E/secret.md')).status,
        404);

      assert.equal(
        (await get(
          server,
          '/missing.md')).status,
        404);

      await dir.writeText(
        'reqs/RQ2 Part.md',
        '# RQ2 Renamed\n\n[EV2][EV2]\n\n[EV2]: <evidence/EV2 Fails.md>\n');

      assert.ok(
        (await get(
          server,
          '/')).body.includes('RQ2 Renamed'));
    } finally {
      await new Promise(
        resolve => server.close(resolve));
    }
  });

test(
  'execView of a file serves its folder and shows its problems',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'reqs/A.md',
      '# A\n\n[Gone](Gone.md) [Up](../Up.md)\n');

    await dir.writeText(
      'Up.md',
      '# Up\n');

    const server =
      await execView(
        createTestIo(dir.path),
        { target: 'reqs/A.md',
          port: 0 });

    try {
      const index =
        await get(
          server,
          '/');

      assert.ok(
        index.body.includes(
          '<h2>Problems</h2>\n<ul>\n<li>A.md: the link to Gone.md points at no file.</li>'));

      assert.ok(
        index.body.includes('<li>Up</li>'));

      assert.ok(
        !index.body.includes(
          'href &quot;/../Up.md'));
    } finally {
      await new Promise(
        resolve => server.close(resolve));
    }
  });
