import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import path
  from 'node:path';
import { TmpDir }
  from 'asljs-tmpdir';
import { createEnvironment }
  from '../environment.js';
import { execUpdate }
  from './update.js';
import { createLogger }
  from '../logging.js';

const logger =
  createLogger();

test.after(
  () => logger.dispose());

test(
  'RQ125: update creates missing JS rule files via the Copilot runner',
  async () => {
    await using workspace =
      new TmpDir(
        logger);

    let requestPrompt = '';

    const environment =
      createEnvironment(
        {
          cwd: workspace.path,
          definitions: workspace.path,
          project: workspace.path,
          logger,
          runCopilotCli:
            async (logger, request) => {
              requestPrompt = request.prompt;

              const ruleFileName =
                path.basename(
                  request.ruleFilePath);

              await workspace.writeText(
                `artefacts/parts/${ruleFileName}`,
                `// ${request.comment}\nexport async function validate() {}\n`);

              return `all done`;
            }
        });

    await workspace.writeText(
      'artefacts/Requirement.md',
      `# Requirement

Requirement definition.

## Location

- Pattern: \`../development/**/RQ*.md\`

## Rules

- RL10 - Requirement rule.
`);

    await execUpdate(
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
      /RL10 - Requirement rule\./);
  });

test(
  'RQ125: update dry-run prints prompts without invoking Copilot or writing files',
  async () => {
    await using workspace =
      new TmpDir(
        logger);

    const environment =
      createEnvironment(
        {
          cwd: workspace.path,
          definitions: workspace.path,
          project: workspace.path,
          logger,
          runCopilotCli: async () => {
            throw new Error('runCopilotCli should not be called during dry-run');
          }
        });

    await workspace.writeText(
      'artefacts/Requirement.md',
      `# Requirement

Requirement definition.

## Location

- Pattern: ../development/**/RQ*.md

## Rules

- RL10 - Requirement rule.
`);

    await execUpdate(
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
  async () => {
    await using workspace =
      new TmpDir(
        logger);

    const environment =
      createEnvironment(
        {
          cwd: workspace.path,
          definitions: workspace.path,
          project: workspace.path,
          runCopilotCli:
            async (logger, request) => {
              const ruleFileName =
                path.basename(
                  request.ruleFilePath);

              await workspace.writeText(
                `artefacts/parts/${ruleFileName}`,
                `// ${request.comment}\nexport async function validate() {}\n`);

              return 'all done';
            },
        });

    await workspace.writeText(
      'artefacts/Requirement.md',
      `# Requirement

Requirement definition.

## Location

- Pattern: \`../development/**/RQ*.md\`

## Rules

- RL10 - Requirement rule.
- RL11 - External rule.
`);

    await workspace.writeText(
      'artefacts/parts/Requirement_RL10.js',
      '// RL10 - Old rule text.\nexport async function validate() {}\n');

    await workspace.writeText(
      'artefacts/parts/Requirement_RL11.ps1',
      'Write-Output test\n');

    await execUpdate(
      environment);

    assert.match(
      environment.stdout.toString(),
      /all done/);

    assert.match(
      environment.stderr.toString(),
      /only JS rule files are supported for auto-update/);

    assert.match(
      await workspace.readText(
        'artefacts/parts/Requirement_RL10.js'),
      /RL10 - Requirement rule\./);
  });
