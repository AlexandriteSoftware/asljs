import test
  from 'node:test';
import assert
  from 'node:assert';
import fsp
  from 'node:fs/promises';
import os
  from 'node:os';
import path
  from 'node:path';
import { TmpDir }
  from './tmp-dir.js';

test(
  'constructor creates unique temporary directories',
  async () => {
    const baseTmpDir =
      await fsp.mkdtemp(
        path.join(
          os.tmpdir(),
          'asljs-tmpdir-test-'));

    const options =
      { tmpDir: baseTmpDir,
        prefix: 'case-' };
    
    const tmpDirs =
      new Map<string, TmpDir>();

    try {
      for (
        let i = 0;
        i < 10;
        i++)
      {
        const tmpDir =
          new TmpDir(options);

        const name =
          path.basename(
            tmpDir.path);

        assert.ok(
          tmpDirs.has(name) === false);

        tmpDirs.set(
          name,
          tmpDir);

        assert.ok(
          name.startsWith('case-'));

        await assert.doesNotReject(
          async () =>
            await fsp.access(
              tmpDir.path));
      }
    } finally {
      await fsp.rm(
        baseTmpDir,
        { recursive: true,
          force: true });
    }      
  });

test(
  'helpers create subdirectories and files inside the temporary directory',
  async () => {
    using tmpDir =
      new TmpDir();

    const directoryPath =
      await tmpDir.mkdir(
        'f1/f2');

    const filePath =
      await tmpDir.writeText(
        'f1/f2/example.txt',
        'hello tmpdir');

    const fileContent =
      await tmpDir.readText(
        'f1/f2/example.txt');

    const directoryStats =
      await tmpDir.stat(
        'f1/f2');

    const fileStats =
      await tmpDir.stat(
        'f1/f2/example.txt');

    assert.strictEqual(
      path.dirname(filePath),
      directoryPath);

    assert.strictEqual(
      fileContent,
      'hello tmpdir');

    assert.ok(
      directoryStats.isDirectory());

    assert.ok(
      fileStats.isFile());
  });

test(
  'cleanup removes the temporary directory',
  async () => {
    const tmpDir =
      new TmpDir();

    const tmpDirectoryPath =
      tmpDir.path;

    await tmpDir.writeText(
      'content.txt',
      'cleanup me');

    await tmpDir.cleanup();

    await assert.rejects(
      async () => {
        await fsp.access(tmpDirectoryPath);
        await fsp.stat(tmpDirectoryPath);
      });
  });

test(
  'path helpers reject attempts to escape the temporary directory',
  async () => {
    const parentDirectoryPath =
      await fsp.mkdtemp(
        path.join(
          os.tmpdir(),
          'asljs-tmpdir-escape-'));

    const tmpDir =
      new TmpDir(
        { tmpDir: parentDirectoryPath,
          prefix: 'case-' });

    const escapedFilePath =
      path.join(
        parentDirectoryPath,
        'escaped.txt');

    try {
      assert.throws(
        () => tmpDir.resolve(
          '..',
          'escaped.txt'));

      await assert.rejects(
        async () => await tmpDir.mkdir(
          '../escaped-dir'));

      await assert.rejects(
        async () => await tmpDir.writeText(
          '../escaped.txt',
          'bad path'));

      await assert.rejects(
        async () => await fsp.access(escapedFilePath));
    } finally {
      await tmpDir.cleanup();
      await fsp.rm(
        parentDirectoryPath,
        { recursive: true,
          force: true });
    }
  });

