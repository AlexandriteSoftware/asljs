import { serverUrl }
  from 'asljs-mdcli';
import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { writeFixture }
  from './testing/fixture.js';
import { createTestIo }
  from './testing/test-io.js';
import { execView }
  from './view.js';

test(
  'execView serves the board in columns, and the documents rendered',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(
        dir.resolve('board'));

    const server =
      await execView(
        io,
        { port: 0 });

    try {
      assert.match(
        io.out(),
        /^Serving .+board at http:\/\/127\.0\.0\.1:\d+\/\n$/);

      const index =
        await (await fetch(
          serverUrl(server))).text();

      for (
        const text of [ '<h2>Ideas (2)</h2>',
                        '<h2>Plans (1)</h2>',
                        '<h2>Tasks (2)</h2>',
                        '<h2>Results (1)</h2>',
                        '<a class="card status-PLANNED" href="/Ideas/I19%20Track%20how%20fresh%20articles%20are.md"><span class="id">I19</span> Track how fresh articles are<div class="meta">PLANNED</div></a>',
                        '<a class="card status-NEW questions" href="/Ideas/I20%20Restrict%20kids%20internet%20access.md"><span class="id">I20</span> Restrict kids internet access<div class="meta">NEW - 1 open questions</div></a>',
                        'class="card status-TODO"' ]
      ) {
        assert.ok(
          index.includes(text),
          text);
      }

      const document =
        await (await fetch(
          new URL(
            '/Tasks/T19-2%20Add%20a%20review%20date.md',
            serverUrl(server)))).text();

      await dir.writeText(
        'board/Ideas/I21 Added while serving.md',
        '# I21 Added while serving\n');

      const again =
        await (await fetch(
          serverUrl(server))).text();

      assert.ok(
        again.includes(
          '<h2>Ideas (3)</h2>'));

      assert.ok(
        again.includes(
          '<span class="id">I21</span> Added while serving'));

      assert.match(
        document,
        /<p><a href="\/">Board<\/a><\/p>\n<h1>T19-2 Add a review date<\/h1>/);
    } finally {
      await new Promise(
        resolve => server.close(resolve));
    }
  });
