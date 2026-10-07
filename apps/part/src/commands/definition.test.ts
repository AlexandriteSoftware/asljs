import { createTestLoggerProvider }
  from 'asljs-testing';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createEnvironment }
  from '../environment.js';
import { tmpDirFactory }
  from '../testing/tmpDir.js';
import { execDefinition }
  from './definition.js';

const loggerProvider =
  createTestLoggerProvider();

test.after(
  async (): Promise<void> =>
  {
    await loggerProvider.dispose();
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

### Id

- Type: string

A unique identifier of the requirement.

## Location

- Pattern: ../development/**/RQ*.md

## Rules

### RL10

At least one test file has requirement ID in its content.

### RL11

Requirement passes a second rule.
`);

    await workspace.writeText(
      'plugin/plugin.js',
      `export default () => ({
  name: 'test',
  rules: { Requirement: { RL10: async () => {} } }
});
`);

    const environment =
      createEnvironment(
        { loggerProvider,
          cwd: workspace.path,
          definitions:
            [ workspace.path,
              workspace.resolve('plugin/plugin.js') ],
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

    assert.match(
      environment.stdout.toString(),
      /- properties:/);

    assert.match(
      environment.stdout.toString(),
      /- type: string/);

    assert.match(
      environment.stdout.toString(),
      /- source: markdown/);

    assert.match(
      environment.stdout.toString(),
      /- id: RL10\n\s+- implemented: true/);

    assert.match(
      environment.stdout.toString(),
      /- id: RL11\n\s+- implemented: false/);
  });
