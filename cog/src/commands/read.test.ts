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
  from '../logger.js';
import { type Envelope }
  from '../envelope/envelope.js';

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
  'read treats pattern as a glob and reads an exact file match through LocationResolver',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    const filePath =
      workspace.resolve(
        'file.txt');

    const filePattern =
      filePath.replace(
        /\\/g,
        '/');

    workspace.writeText(
      'file.txt',
      'one\ntwo\nthree\n');

    const envelope =
      emptyEnvelope();

    await read(
      envelope,
      { command: 'read',
        pattern: filePattern,
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
        pattern: filePattern,
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

    const filePattern =
      filePath.replace(
        /\\/g,
        '/');

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
        pattern: filePattern,
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
        0,
        1,
        255
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
      Buffer.from([
        0,
        1,
        255
      ])
        .toString(
          'base64'));

    assert.equal(
      envelope.files[0].complete,
      true);
  });

test(
  'read omits binary content when withBinaryB64 is false',
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
        0,
        1,
        255
      ]));

    const envelope =
      emptyEnvelope();

    await read(
      envelope,
      { command: 'read',
        pattern: filePath });

    assert.equal(
      envelope.files[0].type,
      'binary');

    assert.equal(
      envelope.files[0].content,
      undefined);

    assert.equal(
      envelope.files[0].complete,
      undefined);
  });

test(
  'read treats folder paths as glob patterns and does not expand them specially',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.writeText(
      join(
        'src',
        'one.txt'),
      'one\n');

    workspace.writeText(
      join(
        'src',
        'two.txt'),
      'two\n');

    const envelope =
      emptyEnvelope();

    await read(
      envelope,
      { command: 'read',
        pattern:
          workspace.resolve(
            'src') });

    assert.deepEqual(
      envelope.files,
      []);
  });

test(
  'read uses LocationResolver glob matching and excludes',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.writeText(
      join(
        'src',
        'one.ts'),
      'one\n');

    workspace.writeText(
      join(
        'src',
        'two.test.ts'),
      'two\n');

    workspace.writeText(
      join(
        'src',
        'nested',
        'three.ts'),
      'three\n');

    const envelope =
      emptyEnvelope();

    await read(
      envelope,
      { command: 'read',
        pattern:
          `${workspace.resolve(
            'src')}/**/*.ts`,
        exclude:
          [`${workspace.resolve(
            'src')}/**/*.test.ts`],
        readToEnd: true });

    assert.deepEqual(
      envelope.files
        .map(
          file =>
            file.path)
        .sort(),
      [
        workspace.resolve(
          join(
            'src',
            'nested',
            'three.ts')),
        workspace.resolve(
          join(
            'src',
            'one.ts'))
      ].sort());

    assert.deepEqual(
      envelope.files
        .map(
          file =>
            file.content)
        .sort(),
      [
        'one\n',
        'three\n'
      ]);
  });

test(
  'read updates existing envelope file for matched glob target',
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
      'old\n');

    const envelope =
      emptyEnvelope();

    await read(
      envelope,
      { command: 'read',
        pattern: filePath,
        readToEnd: true });

    workspace.writeText(
      'file.txt',
      'new\n');

    await read(
      envelope,
      { command: 'read',
        pattern: filePath,
        readToEnd: true });

    assert.equal(
      envelope.files.length,
      1);

    assert.equal(
      envelope.files[0].content,
      'new\n');
  });
