import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { TmpDir }
  from 'asljs-tmpdir';
import { createLogger }
  from '../logging.js';
import { createEnvironment }
  from '../environment.js';
import { execDefinition }
  from './definition.js';

const logger =
  createLogger();

test.after(
  () => logger.dispose());

test(
  'RQ126: definition prints detailed definition content for a named definition',
  async () => {
    await using workspace =
      new TmpDir(
        logger);

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
        { logger,
          cwd: workspace.path,
          definitions: workspace.path,
          project: workspace.path });

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
