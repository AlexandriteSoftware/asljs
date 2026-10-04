import { createTestLoggerProvider }
  from 'asljs-logging';
import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import test
  from 'node:test';
import { removeDirectory }
  from './filesystem.js';

const TEST_SUITE = 'filesystem';

const loggerProvider =
  createTestLoggerProvider();

test.after(
  async () => await loggerProvider.dispose());

const logger =
  loggerProvider.getLogger('filesystem');

async function exists(
    targetPath: string
  ): Promise<boolean>
{
  try {
    await fs.stat(targetPath);

    return true;
  } catch {
    return false;
  }
}

test(
  `${TEST_SUITE}: a directory inside the base is removed`,
  async (): Promise<void> =>
  {
    await using workspace =
      new TmpDir(logger);

    await workspace.writeText(
      'build/output.js',
      'x');

    assert.equal(
      await removeDirectory(
        logger,
        workspace.path,
        'build',
        'clean'),
      'build');

    assert.equal(
      await exists(
        workspace.resolve('build')),
      false);
  });

test(
  `${TEST_SUITE}: a missing directory is not an error`,
  async (): Promise<void> =>
  {
    await using workspace =
      new TmpDir(logger);

    // The caller asked for it to be gone, and it is.
    assert.equal(
      await removeDirectory(
        logger,
        workspace.path,
        'never-existed',
        'clean'),
      null);
  });

test(
  `${TEST_SUITE}: a path outside the base is refused`,
  async (): Promise<void> =>
  {
    await using workspace =
      new TmpDir(logger);

    await assert.rejects(
      () =>
        removeDirectory(
          logger,
          workspace.path,
          path.join(
            '..',
            'elsewhere'),
          'clean'),
      /Refusing to remove outside of/);

    await assert.rejects(
      () =>
        removeDirectory(
          logger,
          workspace.path,
          path.join(
            'C:',
            'Windows'),
          'clean'),
      /Refusing to remove outside of/);
  });

test(
  `${TEST_SUITE}: the base directory itself is refused`,
  async (): Promise<void> =>
  {
    await using workspace =
      new TmpDir(logger);

    // `.` resolves to the base, which the prefix guard must not accept.
    await assert.rejects(
      () =>
        removeDirectory(
          logger,
          workspace.path,
          '.',
          'clean'),
      /Refusing to remove outside of/);

    assert.equal(
      await exists(workspace.path),
      true);
  });
