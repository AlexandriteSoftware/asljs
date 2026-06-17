import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { TmpDir }
  from '../tmp-dir.js';
import { createEnvironment }
  from '../environment.js';
import { execUpdate,
         getDefaultCopilotCliInvocations }
  from './update.js';
import { createLogger }
  from '../logging.js';

const logger =
  createLogger(
    { level: 'trace',
      enabled: false });

test(
  'RQ125: update creates missing JS rule files via the Copilot runner',
  async t => {
    logger.trace(
      t.name);

    const workspace =
      new TmpDir(logger);

    t.after(
      () => workspace.cleanup());

    let requestPrompt = '';

    const environment =
      createEnvironment(
        {
          cwd: workspace.path,
          logger,
          runCopilotCli:
            request => {
              requestPrompt = request.prompt;

              return Promise.resolve(
                `/* ${request.expectedComment} */\nexport async function validate() {}\n`);
            }
        });

    workspace.writeText(
      'artefacts/Requirement.md',
      `# Requirement

Requirement definition.

## Location

- Files: ../development/**/RQ*.md

## Rules

- RL10 - Requirement rule.
`);

    await execUpdate(
      environment);

    assert.equal(
      environment.stderr.output,
      '');

    assert.match(
      environment.stdout.output,
      /Created artefacts\/rules\/Requirement_RL10\.js/);

    assert.match(
      requestPrompt,
      /Write to standard output only the updated file content, no other text\./);

    assert.match(
      workspace.readText(
        'artefacts/rules/Requirement_RL10.js'),
      /RL10 - Requirement rule\./);
  });

test(
  'RQ125: update dry-run prints prompts without invoking Copilot or writing files',
  async t => {
    const workspace =
      new TmpDir();

    t.after(
      () => workspace.cleanup());

    logger.trace(
      t.name);

    const environment =
      createEnvironment(
        {
          cwd: workspace.path,
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

- Files: ../development/**/RQ*.md

## Rules

- RL10 - Requirement rule.
`);

    await execUpdate(
      environment,
      { dryRun: true });

    assert.equal(
      environment.stderr.output,
      '');

    assert.match(
      environment.stdout.output,
      /Would create artefacts\/rules\/Requirement_RL10\.js/);

    assert.match(
      environment.stdout.output,
      /--- CREATE artefacts\/rules\/Requirement_RL10\.js ---/);

    assert.match(
      environment.stdout.output,
      /Write to standard output only the updated file content, no other text\./);

    assert.throws(
      () =>
        workspace.stat(
          'artefacts/rules/Requirement_RL10.js'));
  });

test(
  'RQ125: update refreshes stale JS comments and warns on non-JS rules',
  async t => {
    const workspace =
      new TmpDir();

    t.after(
      () => workspace.cleanup());

    const environment =
      createEnvironment(
        {
          cwd: workspace.path,
          runCopilotCli:
            async request =>
              `// ${request.expectedComment}\nexport async function validate() {}\n`,
        });

    workspace.mkdir(
      'artefacts/rules');

    workspace.writeText(
      'artefacts/Requirement.md',
      `# Requirement

Requirement definition.

## Location

- Pattern: \`../development/**/RQ*.md\`

## Rules

- RL10 - Requirement rule.
- RL11 - External rule.
`);

    workspace.writeText(
      'artefacts/rules/Requirement_RL10.js',
      '// RL10 - Old rule text.\nexport async function validate() {}\n');

    workspace.writeText(
      'artefacts/rules/Requirement_RL11.ps1',
      'Write-Output test\n');

    await execUpdate(
      environment);

    assert.match(
      environment.stdout.toString(),
      /Updated artefacts\/rules\/Requirement_RL10\.js/);

    assert.match(
      environment.stderr.toString(),
      /only JS rule files are supported for auto-update/);

    assert.match(
      workspace.readText(
        'artefacts/rules/Requirement_RL10.js'),
      /RL10 - Requirement rule\./);
  });

test(
  'RQ125: update builds a GitHub Copilot CLI fallback invocation',
  async () => {
    const prompt =
      'Create the complete JavaScript rule file.';

    const invocations =
      getDefaultCopilotCliInvocations(prompt);

    assert.deepEqual(
      invocations,
      [
        {
          command: 'gh',
          args: [
            'copilot',
            '-p',
            prompt,
            '--allow-all-tools',
            '--allow-all-paths',
            '--no-ask-user',
            '--silent'
          ]
        },
        {
          command: 'copilot',
          args: [
            '-p',
            prompt,
            '--allow-all-tools',
            '--allow-all-paths',
            '--no-ask-user',
            '--silent'
          ]
        }
      ]);
  });
