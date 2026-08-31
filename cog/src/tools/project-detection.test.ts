import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createLoggerProvider }
  from '../logger.js';
import { detectProjectKind,
         toCommandIssues }
  from './project-detection.js';

const loggerProvider =
  createLoggerProvider();

test.after(
  async () => await loggerProvider.dispose());

test(
  'detectProjectKind prefers npm when package.json exists',
  async () =>
  {
    await using workspace =
      new TmpDir(
        loggerProvider.getLogger(
          'project-detection.test'));

    await workspace.writeText(
      'package.json',
      '{}');

    await workspace.writeText(
      'App.sln',
      '');

    assert.deepEqual(
      await detectProjectKind(
        workspace.path),
      { kind: 'npm' });
  });

test(
  'detectProjectKind finds a .NET target in extension priority order',
  async () =>
  {
    await using workspace =
      new TmpDir(
        loggerProvider.getLogger(
          'project-detection.test'));

    await workspace.writeText(
      'App.csproj',
      '');

    await workspace.writeText(
      'App.sln',
      '');

    assert.deepEqual(
      await detectProjectKind(
        workspace.path),
      { kind: 'dotnet',
        target: 'App.sln' });
  });

test(
  'detectProjectKind returns null when no project is found',
  async () =>
  {
    await using workspace =
      new TmpDir(
        loggerProvider.getLogger(
          'project-detection.test'));

    assert.equal(
      await detectProjectKind(
        workspace.path),
      null);
  });

test(
  'toCommandIssues splits an error message into non-empty lines',
  () =>
  {
    assert.deepEqual(
      toCommandIssues(
        new Error(
          'build failed\n\nerror TS1: broken\n  ')),
      [ 'build failed',
        'error TS1: broken' ]);
  });

test(
  'toCommandIssues stringifies non-Error values',
  () =>
  {
    assert.deepEqual(
      toCommandIssues(
        'plain failure'),
      [ 'plain failure' ]);
  });
