import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { findConfig,
         postProcess,
         type PostProcessIo,
         takeWritten,
         writeMarkdown }
  from './post-process.js';
import { createRecordingLogger }
  from './testing/recording-logger.js';

/**
 * Where `postProcess` reports, collecting what it writes to standard error.
 */
function createIo(
    cwd: string
  ): PostProcessIo & { err(): string; }
{
  let err = '';

  return { cwd,
           stderr:
             { write:
                 (text: string) => err += text },
           err: () => err };
}

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
        dir.resolve('a'),
        'rq.json'),
      null);

    await dir.writeText(
      'rq.json',
      '{ "markdownPostProcessing": "toolkit flint" }');

    await dir.writeText(
      'a/b/x.md',
      '# x\n');

    assert.deepEqual(
      await findConfig(
        dir.resolve('a/b'),
        'rq.json'),
      { folder: dir.path,
        config:
          { markdownPostProcessing: 'toolkit flint' } });

    await dir.writeText(
      'a/rq.json',
      '{ "markdownPostProcessing": 3 }');

    await assert.rejects(
      findConfig(
        dir.resolve('a/b'),
        'rq.json'),
      /"markdownPostProcessing" must be a command line/);

    await dir.writeText(
      'a/rq.json',
      '{ nope');

    await assert.rejects(
      findConfig(
        dir.resolve('a/b'),
        'rq.json'),
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
      createIo(
        dir.resolve('reqs'));

    assert.equal(
      await postProcess(
        io,
        files,
        'rq.json'),
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
          dir.resolve('reqs/Gone.md') ],
        'rq.json'),
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
        files,
        'rq.json'),
      1);

    assert.match(
      io.err(),
      /^Post-processing failed: node .* exited with code 2\nprocessed\n$/);

    const { logger, entries } =
      createRecordingLogger();

    await postProcess(
      { ...io,
        logger },
      files,
      'rq.json');

    assert.deepEqual(
      entries.map(
        entry => [ entry.level,
                   entry.message ]),
      [ [ 'debug',
          'post-processing' ],
        [ 'debug',
          'post-processing exited' ] ]);

    assert.match(
      String(
        entries[0].fields.command),
      /^node .* "reqs\/R1 A\.md"$/);

    assert.equal(
      entries[1].fields.code,
      2);
  });
