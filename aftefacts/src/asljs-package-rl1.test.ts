import { type Artefact,
         type RuleValidationContext }
  from 'asljs-part';
import { createTestLoggerProvider }
  from 'asljs-testing';
import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import path
  from 'node:path';
import test
  from 'node:test';
import { validate }
  from './asljs-package-rl1.js';

const loggerProvider =
  createTestLoggerProvider();

test.after(
  async () =>
  {
    await loggerProvider.dispose();
  });

const tmpDir =
  (): TmpDir =>
  new TmpDir(
    loggerProvider.getLogger('TmpDir'));

/**
 * A package artefact, the package.json in the directory, and a rule context
 * that resolves it.
 */
function packageAt(
    directoryPath: string
  ): [Artefact, RuleValidationContext]
{
  const context =
    { files:
        { path:
            () =>
        path.join(
          directoryPath,
          'package.json') } } as unknown as RuleValidationContext;

  return [ { location:
               'file:package/package.json',
             name: 'package',
             definitions:
               [ 'ASLJS Package' ] },
           context ];
}

test(
  'ASLJS Package_RL1: passes when dist holds no testing directory',
  async () =>
  {
    await using dir =
      tmpDir();

    await dir.writeText(
      'dist/index.js',
      'export const a = 1;');

    await validate(
      ...packageAt(dir.path));
  });

test(
  'ASLJS Package_RL1: passes when the package has no dist yet',
  async () =>
  {
    await using dir =
      tmpDir();

    // Nothing is built, so there is nothing to report.
    await validate(
      ...packageAt(dir.path));
  });

test(
  'ASLJS Package_RL1: fails when dist holds a testing directory',
  async () =>
  {
    await using dir =
      tmpDir();

    await dir.writeText(
      'dist/testing/tracer.js',
      'export const a = 1;');

    await assert.rejects(
      () =>
        validate(
          ...packageAt(dir.path)),
      /must not contain a testing directory: dist\/testing/);
  });

test(
  'ASLJS Package_RL1: finds a testing directory nested in dist',
  async () =>
  {
    await using dir =
      tmpDir();

    await dir.writeText(
      'dist/functions/testing/helper.js',
      'export const a = 1;');

    await assert.rejects(
      () =>
        validate(
          ...packageAt(dir.path)),
      /dist\/functions\/testing/);
  });

test(
  'ASLJS Package_RL1: ignores a testing directory outside dist',
  async () =>
  {
    await using dir =
      tmpDir();

    // `src/testing` is where a helper belongs; only `dist` is the concern.
    await dir.writeText(
      'src/testing/tracer.ts',
      'export const a = 1;');

    await validate(
      ...packageAt(dir.path));
  });
