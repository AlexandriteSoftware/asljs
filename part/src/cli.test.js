import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { runCli } from './cli.js';

const require = createRequire(import.meta.url);
const { version: packageVersion } = require('../package.json');

test('version prints the package version', async () =>
{
  const environment = createEnvironment();

  const exitCode = await runCli(['version'], environment);

  assert.equal(exitCode, 0);
  assert.equal(environment.stdout.output, `${packageVersion}\n`);
  assert.equal(environment.stderr.output, '');
});

test('inventory accepts --definitions=value syntax', async () =>
{
  const environment = createEnvironment();

  const exitCode = await runCli([
    'inventory',
    '--definitions=artefacts',
  ], environment);

  assert.equal(exitCode, 0);
  assert.match(environment.stdout.output, /REFERENCE\.md/);
  assert.equal(environment.stderr.output, '');
});

test('unknown options are rejected by the command parser', async () =>
{
  const environment = createEnvironment();

  const exitCode = await runCli([
    'inventory',
    '--unsupported',
  ], environment);

  assert.equal(exitCode, 1);
  assert.match(environment.stderr.output, /Unknown option: --unsupported/);
});

function createEnvironment()
{
  return {
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    stdout: createWritableBuffer(),
    stderr: createWritableBuffer(),
  };
}

function createWritableBuffer()
{
  return {
    output: '',
    write(value)
    {
      this.output += value;
    },
  };
}