import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createRequire }
  from 'node:module';
import path
  from 'node:path';
import { runCli }
  from './cli.js';
import { createEnvironment }
  from './environment.js';
import { execVersion }
  from './commands/version.js';

const require =
  createRequire(
    import.meta.url);

const { version: packageVersion } =
  require(
    '../package.json');

test(
  'version prints the package version',
  async () =>
{
  const environment =
    createEnvironment();

  const exitCode =
    await runCli(
      ['version'],
      environment);

  assert.equal(
    exitCode,
    0);

  assert.equal(
    environment.stdout.toString(),
    `${packageVersion}\n`);

  assert.equal(
    environment.stderr.toString(),
    '');
});

test(
  'RQ111 cli accepts --definitions=value syntax',
  async () =>
  {
    const environment =
      createEnvironment();

    let definitions = '';
    
    environment.register(
      execVersion,
      async e => {
        definitions = e.definitions;
        return Promise.resolve(0);
      });

    await runCli(
      [
        'version',
        '--definitions=artefacts',
      ],
      environment);

    const definitionsPath =
      path.resolve(
        'artefacts');

    assert.equal(
      environment.definitions,
      definitionsPath);

    assert.equal(
      definitions,
      definitionsPath);
  });

test(
  'RQ131 cli initialises logger',
  async () =>
  {
    const environment =
      createEnvironment();

    environment.register(
      execVersion,
      async () => {
        return Promise.resolve(0);
      });

    await runCli(
      [
        'version',
        '--log',
        '--loglevel=silent',
      ],
      environment);

    assert.equal(
      environment.logger.level,
      'silent');

    assert.equal(
      environment.logger.enabled,
      true);
  });

test(
  'unknown options are rejected by the command parser',
  async () =>
  {
    const environment =
      createEnvironment();

    const exitCode =
      await runCli(
        [
          'inventory',
          '--unsupported',
        ],
        environment);

    assert.equal(
      exitCode,
      1);

    assert.match(
      environment.stderr.toString(),
      /Unknown option: --unsupported/);
  });

test(
  'cli reports missing option values as command errors',
  async () => {
    const environment =
      createEnvironment();

    const missingValueExitCode =
      await runCli(
        ['inventory', '--definitions'],
        environment);

    assert.equal(
      missingValueExitCode,
      1);

    assert.match(
      environment.stderr.toString(),
      /Option --definitions requires a value\./);
  });

test(
  'cli rejects unsupported long options',
  async () => {
    const environment =
      createEnvironment();

    const exitCode =
      await runCli(
        ['inventory', '--verbose'],
        environment);

    assert.equal(
      exitCode,
      1);

    assert.match(
      environment.stderr.toString(),
      /Unknown option: --verbose/);
  });