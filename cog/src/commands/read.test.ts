import assert
  from 'node:assert/strict';
import { join }
  from 'node:path';
import test
  from 'node:test';
import { read }
  from './read.js';
import { TmpDir }
  from '../tmp-dir.js';
import { createLogger }
  from '../logging.js';
import { type Envelope }
  from '../model/envelope.js';

const logger =
  createLogger();

test.after(
  () => logger.dispose());

function emptyEnvelope(): Envelope
{
  return {
    instruction: '',
    files: []
  };
}

test(
  'read command requires pattern and does not accept the old path shape',
  async () => {
    const envelope =
      emptyEnvelope();

    await assert.rejects(
      () => read(
        envelope,
        { command: 'read',
          path: 'file.txt' } as unknown as Parameters<typeof read>[1]),
      /Read command pattern is required/);
  });

test(
  'read limits text by lines and size unless read-to-end is enabled',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    const filePath =
      workspace.resolve(
        'file.txt');

    workspace.writeText(
      'file.txt',
      'one\ntwo\nthree\n');

    const envelope =
      emptyEnvelope();

    await read(
      envelope,
      { command: 'read',
        pattern: filePath,
        lines: 2,
        sizeKb: 1 });

    assert.equal(
      envelope.files[0].type,
      'text');

    assert.equal(
      envelope.files[0].content,
      'one\ntwo');

    assert.equal(
      envelope.files[0].complete,
      false);

    assert.deepEqual(
      envelope.files[0].update,
      { command: 'read',
        pattern: filePath,
        exclude: [],
        lines: 2,
        sizeKb: 1,
        readToEnd: false,
        withBinaryB64: false });
  });

test(
  'read includes complete text when readToEnd is true',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    const filePath =
      workspace.resolve(
        'file.txt');

    workspace.writeText(
      'file.txt',
      'one\ntwo\nthree\n');

    const envelope =
      emptyEnvelope();

    await read(
      envelope,
      { command: 'read',
        pattern: filePath,
        lines: 1,
        sizeKb: 1,
        readToEnd: true });

    assert.equal(
      envelope.files[0].content,
      'one\ntwo\nthree\n');

    assert.equal(
      envelope.files[0].complete,
      true);

    assert.deepEqual(
      envelope.files[0].update,
      { command: 'read',
        pattern: filePath,
        exclude: [],
        lines: 1,
        sizeKb: 1,
        readToEnd: true,
        withBinaryB64: false });
  });

test(
  'read can include binary content as base64',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    const filePath =
      workspace.resolve(
        'file.bin');

    workspace.write(
      'file.bin',
      Buffer.from([
        0xff,
        0x00,
        0x01
      ]));

    const envelope =
      emptyEnvelope();

    await read(
      envelope,
      { command: 'read',
        pattern: filePath,
        withBinaryB64: true });

    assert.equal(
      envelope.files[0].type,
      'binary');

    assert.equal(
      envelope.files[0].content,
      '/wAB');

    assert.equal(
      envelope.files[0].complete,
      true);
  });

test(
  'read expands folders and honors file, folder, and glob excludes',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.mkdir(
      join(
        'src',
        'nested'));

    workspace.mkdir(
      join(
        'src',
        'skip-dir'));

    workspace.writeText(
      join(
        'src',
        'keep.ts'),
      'keep\n');

    workspace.writeText(
      join(
        'src',
        'skip.tmp'),
      'tmp\n');

    workspace.writeText(
      join(
        'src',
        'nested',
        'skip.ts'),
      'nested\n');

    workspace.writeText(
      join(
        'src',
        'skip-dir',
        'file.ts'),
      'dir\n');

    const previousCwd =
      process.cwd();

    process.chdir(
      workspace.path);

    try {
      const envelope =
        emptyEnvelope();

      await read(
        envelope,
        { command: 'read',
          pattern: 'src',
          exclude: [
            'src/skip.tmp',
            'src/skip-dir',
            'src/nested/*.ts'
          ] });

      assert.deepEqual(
        envelope.files.map(
          file =>
            file.path),
        [
          'src/keep.ts'
        ]);

      assert.deepEqual(
        envelope.files[0].update,
        { command: 'read',
          pattern: 'src/keep.ts',
          exclude: [
            'src/skip.tmp',
            'src/skip-dir',
            'src/nested/*.ts'
          ],
          lines: 150,
          sizeKb: 15,
          readToEnd: false,
          withBinaryB64: false });
    } finally {
      process.chdir(
        previousCwd);
    }
  });

test(
  'read expands glob patterns',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.mkdir(
      'src');

    workspace.writeText(
      join(
        'src',
        'a.ts'),
      'a\n');

    workspace.writeText(
      join(
        'src',
        'b.js'),
      'b\n');

    const previousCwd =
      process.cwd();

    process.chdir(
      workspace.path);

    try {
      const envelope =
        emptyEnvelope();

      await read(
        envelope,
        { command: 'read',
          pattern: 'src/*.ts' });

      assert.deepEqual(
        envelope.files.map(
          file =>
            file.path),
        [
          'src/a.ts'
        ]);

      assert.deepEqual(
        envelope.files[0].update,
        { command: 'read',
          pattern: 'src/a.ts',
          exclude: [],
          lines: 150,
          sizeKb: 15,
          readToEnd: false,
          withBinaryB64: false });
    } finally {
      process.chdir(
        previousCwd);
    }
  });
