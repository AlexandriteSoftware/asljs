import { createRuleValidationContext }
  from 'asljs-part';
import { createTestLoggerProvider }
  from 'asljs-testing';
import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { validate }
  from './requirement-rl10.js';

const loggerProvider =
  createTestLoggerProvider();

test.after(
  async () =>
  {
    await loggerProvider.dispose();
  });

async function validateRequirement(
    testContent: string
  ): Promise<void>
{
  await using workspace =
    new TmpDir(
      loggerProvider.getLogger('TmpDir'));

  await workspace.writeText(
    'definitions/Requirement.md',
    '# Requirement\n\nA requirement.\n\n## Location\n\n- Pattern: `/requirements/RQ*.md`\n');

  await workspace.writeText(
    'definitions/Unit Test File.md',
    '# Unit Test File\n\nA test file.\n\n## Location\n\n- Pattern: `/**/*.test.ts`\n');

  await workspace.writeText(
    'requirements/RQ001 Example.md',
    '# RQ001 Example\n');

  await workspace.writeText(
    'src/example.test.ts',
    testContent);

  const context =
    createRuleValidationContext(
      loggerProvider,
      workspace.path,
      [ workspace.resolve('definitions') ]);

  const artefact =
    await context.artefacts.tryGetArtefact(
      'requirements/RQ001 Example.md');

  assert.ok(artefact);

  await validate(
    artefact,
    context);
}

test(
  'Requirement_RL10: passes when a test file mentions the requirement id',
  async () =>
  {
    await validateRequirement(
      "test('RQ001: example', () => {});\n");
  });

test(
  'Requirement_RL10: fails when no test file mentions the requirement id',
  async () =>
  {
    await assert.rejects(
      validateRequirement(
        "test('example', () => {});\n"),
      /No test for "RQ001"\./);
  });
