import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { runCli }
  from './cli.js';
import { createTestEnvironment,
         withLibrary }
  from './testing/library.js';

const FILES =
  { 'notes/one.md':
      '# One\n\nThe budget line.\n' };

test(
  'runCli prints help when no arguments are given',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const environment =
          createTestEnvironment(library);

        assert.equal(
          await runCli(
            [ ],
            environment),
          0);

        assert.match(
          environment.stdout.toString(),
          /Usage: kb/);
      });
  });

test(
  'runCli runs a command against the library root',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const environment =
          createTestEnvironment(library);

        assert.equal(
          await runCli(
            [ 'list',
              '**/*.md' ],
            environment),
          0);

        assert.equal(
          environment.stdout.toString(),
          'notes/one.md\n');
      });
  });

test(
  'runCli resolves --library relative to the working directory',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const environment =
          createTestEnvironment(
            library,
            { library: 'unset' });

        assert.equal(
          await runCli(
            [ '--library',
              'notes',
              'list' ],
            environment),
          0);

        assert.equal(
          environment.stdout.toString(),
          'one.md\n');
      });
  });

test(
  'runCli honours the global --format option',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const environment =
          createTestEnvironment(library);

        assert.equal(
          await runCli(
            [ '--format',
              'json',
              'search',
              'budget' ],
            environment),
          0);

        const report =
          JSON.parse(
            environment.stdout.toString()) as
            { matches: unknown[]; };

        assert.equal(
          report.matches.length,
          1);
      });
  });

test(
  'runCli reports command failures on stderr',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const environment =
          createTestEnvironment(library);

        assert.equal(
          await runCli(
            [ 'read',
              'missing.md' ],
            environment),
          1);

        assert.match(
          environment.stderr.toString(),
          /does not exist/);
      });
  });

test(
  'runCli reports an unknown command with help',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const environment =
          createTestEnvironment(library);

        assert.equal(
          await runCli(
            [ 'index' ],
            environment),
          1);

        assert.match(
          environment.stderr.toString(),
          /unknown command/i);
      });
  });

test(
  'runCli reports an unknown option',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const environment =
          createTestEnvironment(library);

        assert.equal(
          await runCli(
            [ 'list',
              '--deep' ],
            environment),
          1);

        assert.match(
          environment.stderr.toString(),
          /Unknown option: --deep\./);
      });
  });

test(
  'runCli rejects a non-positive --max-results value',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const environment =
          createTestEnvironment(library);

        assert.equal(
          await runCli(
            [ 'search',
              'budget',
              '--max-results',
              '0' ],
            environment),
          1);

        assert.match(
          environment.stderr.toString(),
          /requires a positive integer/);
      });
  });

test(
  'runCli uses the registered command implementation',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const environment =
          createTestEnvironment(library);

        const { execVersion } =
          await import('./commands/version.js');

        environment.register(
          execVersion,
          (): Promise<void> =>
          {
            environment.stdout.write('replaced\n');

            return Promise.resolve();
          });

        await runCli(
          [ 'version' ],
          environment);

        assert.equal(
          environment.stdout.toString(),
          'replaced\n');
      });
  });
