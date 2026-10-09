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
import { DEFAULT_PORT,
         execView }
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
        const text of [ '<title>R1 Root</title>',
                        '<pre class="mermaid">\ngraph LR\n  n0[&quot;R1 Root&quot;]',
                        '  n0 --&gt; n1',
                        'click n2 href &quot;/tests/T1%20Passes.md&quot;',
                        '<li><a href="/R2%20Part.md">R2 Part</a> <span class="neutral">(requirement, NOT RUN, NOT CHECKED)</span></li>',
                        '<span class="amber">(requirement, FAIL, NOT CHECKED)</span>',
                        '  style n0 stroke:#ef8f00,stroke-width:2px,stroke-dasharray:2 3',
                        '<a href="/tests/T1%20Passes.md">T1 Passes</a> <span class="red">(test, FAIL)</span>',
                        '<span class="neutral">(test, NOT RUN)</span>',
                        'mermaid.esm.min.mjs' ]
      ) {
        assert.ok(
          index.body.includes(text),
          text);
      }

      const document =
        await get(
          server,
          '/R2%20Part.md');

      assert.equal(
        document.status,
        200);

      assert.ok(
        document.body.includes('<h1>R2 Part</h1>'));

      assert.ok(
        document.body.includes(
          '<a href="tests/T2%20Fails.md">T2</a>'));

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
        'reqs/R2 Part.md',
        '# R2 Renamed\n\n[T2][T2]\n\n[T2]: <tests/T2 Fails.md>\n');

      assert.ok(
        (await get(
          server,
          '/')).body.includes('R2 Renamed'));
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
      'reqs/R1 A.md',
      '# R1 A\n\n## Implementation\n\n- [Gone](<R9 Gone.md>)\n- [Up](<../R2 Up.md>)\n');

    await dir.writeText(
      'R2 Up.md',
      '# Up\n');

    const server =
      await execView(
        createTestIo(dir.path),
        { target: 'reqs/R1 A.md',
          port: 0 });

    try {
      const index =
        await get(
          server,
          '/');

      assert.ok(
        index.body.includes(
          '<h2>Problems</h2>\n<ul>\n<li>R1 A.md: the link to R9 Gone.md points at no file.</li>'));

      assert.ok(
        index.body.includes(
          '<li>Up <span class="amber">(requirement, FAIL, NOT CHECKED)</span></li>'));

      assert.ok(
        !index.body.includes(
          'href &quot;/../R2%20Up.md'));
    } finally {
      await new Promise(
        resolve => server.close(resolve));
    }
  });

test(
  'execView takes an id in the working folder and reads the recorded statuses',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    await dir.writeText(
      'reqs/tests/T2 Fails.md',
      `${await dir.readText(
        'reqs/tests/T2 Fails.md')}\n## Status\n\n- Result: PASS\n`);

    const server =
      await execView(
        createTestIo(
          dir.resolve('reqs')),
        { target: 'R2',
          port: 0 });

    try {
      const index =
        await get(
          server,
          '/');

      assert.ok(
        index.body.includes(
          '<title>R2 Part</title>'),
        index.body);

      assert.ok(
        index.body.includes(
          '<span class="green">(test, PASS)</span>'),
        index.body);
    } finally {
      await new Promise(
        resolve => server.close(resolve));
    }
  });

test(
  'execView takes the first free port from 3000 on unless a port is given',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(dir.path);

    const first =
      await execView(
        io,
        { target: 'reqs' });

    const second =
      await execView(
        io,
        { target: 'reqs' });

    try {
      const firstPort =
        (first.address() as AddressInfo).port;

      const secondPort =
        (second.address() as AddressInfo).port;

      assert.ok(
        firstPort >= DEFAULT_PORT,
        String(firstPort));

      assert.ok(
        secondPort > firstPort,
        `${firstPort} ${secondPort}`);

      await assert.rejects(
        execView(
          io,
          { target: 'reqs',
            port: firstPort }),
        /EADDRINUSE/);
    } finally {
      for (const server of [ first,
                             second ]) {
        await new Promise(
          resolve => server.close(resolve));
      }
    }
  });
