import assert
  from 'node:assert/strict';
import fs
  from 'node:fs';
import path
  from 'node:path';
import test
  from 'node:test';
import { createLogger }
  from './logger.js';
import { TmpDir }
  from './tmp-dir.js';

const logger =
  createLogger();

test.after(
  () => logger.dispose());

test(
  'TmpDir creates a temporary directory',
  t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    assert.equal(
      fs.existsSync(
        workspace.path),
      true);

    assert.equal(
      fs.statSync(
          workspace.path)
        .isDirectory(),
      true);

    assert.equal(
      path.basename(
          workspace.path)
        .startsWith(
          'cog-test-'),
      true);

    assert.equal(
      workspace.deleted,
      false);
  });

test(
  'TmpDir resolves relative paths inside the workspace',
  t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    assert.equal(
      workspace.resolve(
        'nested',
        'file.txt'),
      path.resolve(
        workspace.path,
        'nested',
        'file.txt'));
  });

test(
  'TmpDir creates directories recursively',
  t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.mkdir(
      path.join(
        'one',
        'two'));

    assert.equal(
      fs.statSync(
          workspace.resolve(
            'one',
            'two'))
        .isDirectory(),
      true);
  });

test(
  'TmpDir writes and reads text files',
  t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.writeText(
      path.join(
        'docs',
        'note.txt'),
      'hello\nworld\n');

    assert.equal(
      workspace.readText(
        path.join(
          'docs',
          'note.txt')),
      'hello\nworld\n');
  });

test(
  'TmpDir writes binary files',
  t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.write(
      path.join(
        'bin',
        'data.bin'),
      Buffer.from([
        0,
        1,
        255
      ]));

    assert.deepEqual(
      fs.readFileSync(
        workspace.resolve(
          'bin',
          'data.bin')),
      Buffer.from([
        0,
        1,
        255
      ]));
  });

test(
  'TmpDir stats files',
  t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.writeText(
      'file.txt',
      'content');

    const stat =
      workspace.stat(
        'file.txt');

    assert.equal(
      stat.isFile(),
      true);

    assert.equal(
      stat.size,
      Buffer.byteLength(
        'content',
        'utf8'));
  });

test(
  'TmpDir cleanup removes the workspace directory and marks it deleted',
  () => {
    const workspace =
      new TmpDir(
        logger);

    const workspacePath =
      workspace.path;

    workspace.writeText(
      'file.txt',
      'content');

    workspace.cleanup();

    assert.equal(
      workspace.deleted,
      true);

    assert.equal(
      fs.existsSync(
        workspacePath),
      false);
  });
