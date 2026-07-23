import assert
  from 'node:assert/strict';
import path
  from 'node:path';
import test,
       { after }
  from 'node:test';
import { createEnvironment }
  from '../environment.js';
import { createPinoLoggerProvider }
  from '../logging/pino.js';
import { tmpDirFactory }
  from '../testing/tmpDir.js';
import { execUpdate }
  from './update.js';

const loggerProvider =
  createPinoLoggerProvider();

after(
  () =>
  {
    loggerProvider.dispose();
  });

const tmpDir =
  tmpDirFactory(
    loggerProvider);

const execUpdateLogger =
  loggerProvider
  .getLogger(
    'execUpdate');

test(
  'RQ125: update creates missing JS rule files via the Copilot runner',
  async () =>
  {
    await using workspace =
      tmpDir();

    let requestPrompt = '';

    const environment =
      createEnvironment(
        { cwd:
            workspace.path,
          definitions:
            workspace.path,
          project:
            workspace.path,
          loggerProvider,
          runCopilotCli:
            async (_, request) =>
        {
          requestPrompt = request.prompt;

          const ruleFileName =
            path.basename(
              request.ruleFilePath);

          await workspace.writeText(
            `artefacts/parts/${ruleFileName}`,
            `${request.comment}\n\nexport async function validate() {}\n`);

          return `all done`;
        } });

    await workspace.writeText(
      'artefacts/Requirement.md',
      `# Requirement

Requirement definition.

## Location

- Pattern: \`../development/**/RQ*.md\`

## Rules

### RL10

Requirement rule.
`);

    await execUpdate(
      execUpdateLogger,
      environment);

    assert.equal(
      environment.stderr.toString(),
      '');

    assert.match(
      environment.stdout.toString(),
      /all done/);

    assert.match(
      requestPrompt,
      /Requirement_RL10/);

    assert.match(
      await workspace.readText(
        'artefacts/parts/Requirement_RL10.js'),
      /### RL10\n\nRequirement rule\./);
  });

test(
  'RQ125: update dry-run prints prompts without invoking Copilot or writing files',
  async () =>
  {
    await using workspace =
      tmpDir();

    const environment =
      createEnvironment(
        { cwd:
            workspace.path,
          definitions:
            workspace.path,
          project:
            workspace.path,
          loggerProvider,
          runCopilotCli:
            async () =>
        {
          throw new Error('runCopilotCli should not be called during dry-run');
        } });

    await workspace.writeText(
      'artefacts/Requirement.md',
      `# Requirement

Requirement definition.

## Location

- Pattern: ../development/**/RQ*.md

## Rules

### RL10

Requirement rule.
`);

    await execUpdate(
      execUpdateLogger,
      environment,
      { dryRun: true });

    assert.equal(
      environment.stderr.toString(),
      '');

    assert.match(
      environment.stdout.toString(),
      /Would create artefacts\/parts\/Requirement_RL10\.js/);

    assert.match(
      environment.stdout.toString(),
      /--- CREATE artefacts\/parts\/Requirement_RL10\.js ---/);

    assert.rejects(
      async () =>
        await workspace.stat(
          'artefacts/parts/Requirement_RL10.js'));
  });

test(
  'RQ125: update refreshes stale JS comments and warns on non-JS rules',
  async () =>
  {
    await using workspace =
      tmpDir();

    const environment =
      createEnvironment(
        { cwd:
            workspace.path,
          definitions:
            workspace.path,
          project:
            workspace.path,
          runCopilotCli:
            async (_, request) =>
        {
          const ruleFileName =
            path.basename(
              request.ruleFilePath);

          await workspace.writeText(
            `artefacts/parts/${ruleFileName}`,
            `${request.comment}\n\nexport async function validate() {}\n`);

          return 'all done';
        } });

    await workspace.writeText(
      'artefacts/Requirement.md',
      `# Requirement

Requirement definition.

## Location

- Pattern: \`../development/**/RQ*.md\`

## Rules

### RL10

Requirement rule.

### RL11

External rule.
`);

    await workspace.writeText(
      'artefacts/parts/Requirement_RL10.js',
      '/**\n### RL10\n\nOld rule text.\n*/\n\nexport async function validate() {}\n');

    await workspace.writeText(
      'artefacts/parts/Requirement_RL11.ps1',
      'Write-Output test\n');

    await execUpdate(
      execUpdateLogger,
      environment);

    assert.match(
      environment.stdout.toString(),
      /all done/);

    assert.match(
      await workspace.readText(
        'artefacts/parts/Requirement_RL10.js'),
      /### RL10\n\nRequirement rule\./);
  });
