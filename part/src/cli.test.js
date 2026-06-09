import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { mkdtemp, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
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

test('init copies bootstrap artefact files into the definitions directory', async () =>
{
  const workspacePath = await mkdtemp(path.join(os.tmpdir(), 'part-cli-'));
  const environment = createEnvironment({
    cwd: workspacePath,
  });

  const exitCode = await runCli([
    'init',
    '--definitions',
    'definitions',
  ], environment);

  assert.equal(exitCode, 0);
  assert.match(environment.stdout.output, /Initialized definitions directory:/);
  assert.equal(environment.stderr.output, '');
  assert.match(
    await readFile(path.join(workspacePath, 'definitions', 'Artefact Definition.md'), 'utf8'),
    /# Artefact Definition/,
  );
  assert.match(
    await readFile(path.join(workspacePath, 'definitions', 'Rule File.md'), 'utf8'),
    /# Rule File/,
  );
  assert.ok((await stat(path.join(workspacePath, 'definitions', 'rules'))).isDirectory());
});

test('update-rules creates missing JS rule files via the Copilot runner', async () =>
{
  const workspacePath = await mkdtemp(path.join(os.tmpdir(), 'part-cli-'));
  const environment = createEnvironment({
    cwd: workspacePath,
    runCopilotCli: async (request) => `/* ${request.expectedComment} */\nexport async function validate() {}\n`,
  });

  await mkdir(path.join(workspacePath, 'artefacts'), {
    recursive: true,
  });
  await writeFile(
    path.join(workspacePath, 'artefacts', 'Requirement.md'),
    `# Requirement

Requirement definition.

## Location

- Files: ../development/**/RQ*.md

## Rules

- RL10 - Requirement rule.
`,
    'utf8',
  );

  const exitCode = await runCli([
    'update-rules',
    '--definitions',
    'artefacts',
  ], environment);

  assert.equal(exitCode, 0);
  assert.equal(environment.stderr.output, '');
  assert.match(environment.stdout.output, /Created artefacts\/rules\/Requirement_RL10\.js/);
  assert.match(
    await readFile(path.join(workspacePath, 'artefacts', 'rules', 'Requirement_RL10.js'), 'utf8'),
    /RL10 - Requirement rule\./,
  );
});

test('update-rules refreshes stale JS comments and warns on non-JS rules', async () =>
{
  const workspacePath = await mkdtemp(path.join(os.tmpdir(), 'part-cli-'));
  const environment = createEnvironment({
    cwd: workspacePath,
    runCopilotCli: async (request) => `// ${request.expectedComment}\nexport async function validate() {}\n`,
  });

  await mkdir(path.join(workspacePath, 'artefacts', 'rules'), {
    recursive: true,
  });
  await writeFile(
    path.join(workspacePath, 'artefacts', 'Requirement.md'),
    `# Requirement

Requirement definition.

## Location

- Files: ../development/**/RQ*.md

## Rules

- RL10 - Requirement rule.
- RL11 - External rule.
`,
    'utf8',
  );
  await writeFile(
    path.join(workspacePath, 'artefacts', 'rules', 'Requirement_RL10.js'),
    '// RL10 - Old rule text.\nexport async function validate() {}\n',
    'utf8',
  );
  await writeFile(
    path.join(workspacePath, 'artefacts', 'rules', 'Requirement_RL11.ps1'),
    'Write-Output test\n',
    'utf8',
  );

  const exitCode = await runCli([
    'update-rules',
    '--definitions',
    'artefacts',
  ], environment);

  assert.equal(exitCode, 0);
  assert.match(environment.stdout.output, /Updated artefacts\/rules\/Requirement_RL10\.js/);
  assert.match(environment.stderr.output, /only JS rule files are supported for auto-update/);
  assert.match(
    await readFile(path.join(workspacePath, 'artefacts', 'rules', 'Requirement_RL10.js'), 'utf8'),
    /RL10 - Requirement rule\./,
  );
});

function createEnvironment(options = {})
{
  return {
    cwd: options.cwd ?? fileURLToPath(new URL('../', import.meta.url)),
    stdout: createWritableBuffer(),
    stderr: createWritableBuffer(),
    runCopilotCli: options.runCopilotCli,
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