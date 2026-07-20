import assert
  from 'node:assert/strict';
import test,
       { after }
  from 'node:test';
import { createEnvironment }
  from '../environment.js';
import { createPinoLoggerProvider }
  from '../logging/pino.js';
import { tmpDirFactory }
  from '../testing/tmpDir.js';
import { execDefinition }
  from './definition.js';

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

test(
  'RQ126: definition prints detailed definition content for a named definition',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'Requirement.md',
      `# Requirement

A statement about the system that must be true.

## Properties

- Id - A unique identifier of the requirement.

## Location

- Pattern: ../development/**/RQ*.md

## Rules

- RL10 - At least one test file has requirement ID in its content.
- RL11 - Requirement passes a second rule.
`);

    await workspace.writeText(
      'parts/Requirement_RL10.js',
      'export async function validate() { }\n');

    const environment =
      createEnvironment(
        {
        loggerProvider,
        cwd: workspace.path,
        definitions: workspace.path,
        project: workspace.path
      });

    await execDefinition(
      environment,
      { target: 'Requirement' });

    assert.equal(
      environment.stderr.toString(),
      '');

    assert.match(
      environment.stdout.toString(),
      /- name: Requirement/);
  });
