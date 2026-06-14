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
import { createTestEnvironment }
  from './testEnvironment.js';
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
    createTestEnvironment();

  const exitCode =
    await runCli(
      ['version'],
      environment);

  assert.equal(
    exitCode,
    0);

  assert.equal(
    environment.stdout.output,
    `${packageVersion}\n`);

  assert.equal(
    environment.stderr.output,
    '');
});

test(
  'RQ111 cli accepts --definitions=value syntax',
  async () =>
  {
    const environment =
      createTestEnvironment();

    let definitions = '';
    
    environment.register(
      execVersion,
      async e => {
        definitions = e.definitions;
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
  'unknown options are rejected by the command parser',
  async () =>
{
  const environment =
    createTestEnvironment();

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
    environment.stderr.output,
    /Unknown option: --unsupported/);
});
