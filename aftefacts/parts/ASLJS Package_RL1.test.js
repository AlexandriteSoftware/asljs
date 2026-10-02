import { NullLoggerProvider }
  from 'asljs-part';
import assert
  from 'node:assert/strict';
import test,
       { after }
  from 'node:test';
import { validate }
  from './ASLJS Package_RL1.js';
import { tmpDirFactory }
  from './testing/tmpDir.js';

const loggerProvider =
  new NullLoggerProvider();

after(
  () => {
    loggerProvider.dispose();
  });

const tmpDir =
  tmpDirFactory(
    loggerProvider);

test(
  'passes when dist holds no testing directory',
  async () => {
    await using dir =
      tmpDir();

    await dir.writeText(
      'dist/index.js',
      'export const a = 1;');

    await validate(
      { path: dir.path });
  });

test(
  'passes when the package has no dist yet',
  async () => {
    await using dir =
      tmpDir();

    // Nothing is built, so there is nothing to report.
    await validate(
      { path: dir.path });
  });

test(
  'fails when dist holds a testing directory',
  async () => {
    await using dir =
      tmpDir();

    await dir.writeText(
      'dist/testing/tracer.js',
      'export const a = 1;');

    await assert.rejects(
      () =>
        validate(
          { path: dir.path }),
      /must not contain a testing directory: dist\/testing/);
  });

test(
  'finds a testing directory nested in dist',
  async () => {
    await using dir =
      tmpDir();

    await dir.writeText(
      'dist/functions/testing/helper.js',
      'export const a = 1;');

    await assert.rejects(
      () =>
        validate(
          { path: dir.path }),
      /dist\/functions\/testing/);
  });

test(
  'ignores a testing directory outside dist',
  async () => {
    await using dir =
      tmpDir();

    // `src/testing` is where a helper belongs; only `dist` is the concern.
    await dir.writeText(
      'src/testing/tracer.ts',
      'export const a = 1;');

    await validate(
      { path: dir.path });
  });
