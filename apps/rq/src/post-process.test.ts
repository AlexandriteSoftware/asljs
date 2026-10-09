import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { runCli }
  from './cli.js';
import { findConfig,
         postProcess,
         takeWritten,
         writeMarkdown }
  from './post-process.js';
import { writeFixture }
  from './testing/fixture.js';
import { createTestIo }
  from './testing/test-io.js';

/**
 * A post-processing script that appends its arguments, one per line, to
 * `args.txt` in its working folder and exits with `code`.
 */
async function writeProcessor(
    dir: TmpDir,
    code = 0
  ): Promise<string>
{
  await dir.writeText(
    'processor.cjs',
    `require('node:fs').appendFileSync('args.txt', process.argv.slice(2).join('\\n') + '\\n');
console.log('processed');
process.exitCode = ${code};
`);

  return `node ${
    JSON.stringify(
      dir.resolve('processor.cjs'))
  }`;
}

test(
  'findConfig reads the nearest rq.json of the folder or a parent',
  async () =>
  {
    await using dir =
      new TmpDir();

    assert.equal(
      await findConfig(
        dir.resolve('a')),
      null);

    await dir.writeText(
      'rq.json',
      '{ "markdownPostProcessing": "toolkit flint" }');

    await dir.writeText(
      'a/b/x.md',
      '# x\n');

    assert.deepEqual(
      await findConfig(
        dir.resolve('a/b')),
      { folder: dir.path,
        config:
          { markdownPostProcessing: 'toolkit flint' } });

    await dir.writeText(
      'a/rq.json',
      '{ "markdownPostProcessing": 3 }');

    await assert.rejects(
      findConfig(
        dir.resolve('a/b')),
      /"markdownPostProcessing" must be a command line/);

    await dir.writeText(
      'a/rq.json',
      '{ nope');

    await assert.rejects(
      findConfig(
        dir.resolve('a/b')),
      /rq\.json: not valid JSON/);
  });

test(
  'postProcess runs the command with the written files that still exist',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'reqs/R1 A.md',
      '');

    takeWritten();

    await writeMarkdown(
      dir.resolve('reqs/R1 A.md'),
      '# R1 A\n');

    const files =
      takeWritten();

    assert.deepEqual(
      takeWritten(),
      [ ]);

    const io =
      createTestIo(
        dir.resolve('reqs'));

    assert.equal(
      await postProcess(
        io,
        files),
      0);

    await dir.writeText(
      'rq.json',
      JSON.stringify(
        { markdownPostProcessing:
            await writeProcessor(dir) }));

    assert.equal(
      await postProcess(
        io,
        [ ...files,
          dir.resolve('reqs/Gone.md') ]),
      0);

    assert.equal(
      await dir.readText('args.txt'),
      'reqs/R1 A.md\n');

    await dir.writeText(
      'rq.json',
      JSON.stringify(
        { markdownPostProcessing:
            await writeProcessor(
              dir,
              2) }));

    assert.equal(
      await postProcess(
        io,
        files),
      1);

    assert.match(
      io.err(),
      /^Post-processing failed: node .* exited with code 2\nprocessed\n$/);
  });

test(
  'rq post-processes the markdown files a command wrote',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    await dir.writeText(
      'rq.json',
      JSON.stringify(
        { markdownPostProcessing:
            await writeProcessor(dir) }));

    const io =
      createTestIo(dir.path);

    assert.equal(
      await runCli(
        [ 'add',
          'requirement',
          'R2',
          'Speed' ],
        io),
      0);

    assert.deepEqual(
      (await dir.readText('args.txt'))
        .trim()
        .split('\n')
        .sort(),
      [ 'reqs/R2 Part.md',
        'reqs/R3 Speed.md' ]);

    assert.equal(
      await runCli(
        [ 'list',
          'reqs' ],
        io),
      0);

    assert.equal(
      (await dir.readText('args.txt'))
        .trim()
        .split('\n').length,
      2);

    await dir.writeText(
      'rq.json',
      JSON.stringify(
        { markdownPostProcessing:
            await writeProcessor(
              dir,
              3) }));

    const failing =
      createTestIo(dir.path);

    assert.equal(
      await runCli(
        [ 'add',
          'requirement',
          'R2',
          'Size' ],
        failing),
      1);

    assert.match(
      failing.err(),
      /^Post-processing failed: node .* exited with code 3\n/);

    assert.ok(
      (await dir.stat('reqs/R4 Size.md')).isFile());
  });
