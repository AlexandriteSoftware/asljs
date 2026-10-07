import { createTestLoggerProvider }
  from 'asljs-testing';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createEnvironment,
         Environment }
  from '../environment.js';
import { tmpDirFactory }
  from '../testing/tmpDir.js';
import { execCheck }
  from './check.js';

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

const REQUIREMENT_DEFINITION =
  `# Requirement

A statement about the system that must be true.

## Location

- Pattern: ../development/**/RQ*.md

## Rules

### RL10

First rule.

### RL11

Second rule.
`;

const PASSING_PLUGIN =
  `const pass = async () => {};

export default () => ({
  name: 'test',
  rules: { Requirement: { RL10: pass, RL11: pass } }
});
`;

const FAILING_PLUGIN =
  `export default () => ({
  name: 'test',
  rules: {
    Requirement: {
      RL10: async () => { throw new Error('Failed.'); },
      RL11: async () => {}
    }
  }
});
`;

test(
  'RQ123: check prints one row per matched file and rule',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'artefacts/Requirement.md',
      REQUIREMENT_DEFINITION);

    await workspace.writeText(
      'plugin.js',
      `export default () => ({
  name: 'test',
  rules: {
    Requirement: {
      RL10: async artefact => {
        throw new Error(artefact.name + ' is not referenced by any test.');
      },
      RL11: async () => {}
    }
  }
});
`);

    await workspace.writeText(
      'development/features/RQ101 Example.md',
      '# RQ101 Example\n');

    await workspace.writeText(
      'development/features/RQ102 Example.md',
      '# RQ102 Example\n');

    const environment =
      createEnvironment(
        { loggerProvider,
          cwd: workspace.path,
          definitions:
            workspace.resolve('artefacts'),
          project: workspace.path,
          plugins:
            [ workspace.resolve('plugin.js') ] });

    await execCheck(
      loggerProvider.getLogger('execCheck'),
      environment);

    assert.equal(
      environment.stderr.toString(),
      '');

    assert.match(
      environment.stdout.toString(),
      /\| Location\s+\| Rule\s+\| Result\s+\|/);

    assert.match(
      environment.stdout.toString(),
      /\| development\/features\/RQ101 Example\.md \| Requirement_RL10 \| RQ101 Example is not referenced by any test\. \|/);

    assert.match(
      environment.stdout.toString(),
      /\| development\/features\/RQ102 Example\.md \| Requirement_RL10 \| RQ102 Example is not referenced by any test\. \|/);
  });

test(
  'RQ123: check includes rules from all matching definitions for the same artefact',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'definitions/Article.md',
      `# Article

Markdown article.

## Location

- Pattern: **/*.md

## Rules

### RL10

Article rule.
`);

    await workspace.writeText(
      'definitions/Artefact Definition.md',
      `# Artefact Definition

Definition file.

## Location

- Pattern: **/*.md

## Rules

### RL10

Definition rule.
`);

    await workspace.writeText(
      'plugin.js',
      `const pass = async () => {};

export default () => ({
  name: 'test',
  rules: {
    'Article': { RL10: pass },
    'Artefact Definition': { RL10: pass }
  }
});
`);

    await workspace.writeText(
      'definitions/Requirement.md',
      '# Requirement\n');

    const environment =
      createEnvironment(
        { loggerProvider,
          cwd: workspace.path,
          definitions:
            workspace.resolve('definitions'),
          project: workspace.path,
          plugins:
            [ workspace.resolve('plugin.js') ] });

    await execCheck(
      loggerProvider.getLogger('execCheck'),
      environment,
      { pattern:
          'definitions/Requirement.md',
        withPositives: true });

    assert.equal(
      environment.stderr.toString(),
      '');

    assert.match(
      environment.stdout.toString(),
      /\|\s+definitions\/Requirement\.md\s+\| Article_RL10\s+\| OK\s+\|/);

    assert.match(
      environment.stdout.toString(),
      /\|\s+definitions\/Requirement\.md\s+\| Artefact Definition_RL10\s+\| OK\s+\|/);
  });

test(
  'RQ123: check filters by definitions and rules',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'artefacts/Requirement.md',
      REQUIREMENT_DEFINITION);

    await workspace.writeText(
      'artefacts/Article.md',
      `# Article

Markdown article.

## Location

- Pattern: ../development/**/*.md

## Rules

### RL10

Article rule.
`);

    await workspace.writeText(
      'plugin.js',
      `const pass = async () => {};

export default () => ({
  name: 'test',
  rules: {
    Requirement: { RL10: pass, RL11: pass },
    Article: { RL10: pass }
  }
});
`);

    await workspace.writeText(
      'development/RQ101 Example.md',
      '# RQ101 Example\n');

    const environment =
      createEnvironment(
        { loggerProvider,
          cwd: workspace.path,
          definitions:
            workspace.resolve('artefacts'),
          project: workspace.path,
          plugins:
            [ workspace.resolve('plugin.js') ] });

    await execCheck(
      loggerProvider.getLogger('execCheck'),
      environment,
      { pattern:
          'development/**/*.md',
        checkDefinitions:
          [ 'Requirement' ],
        checkRules:
          [ 'Requirement_RL11' ],
        withPositives: true });

    assert.equal(
      environment.stderr.toString(),
      '');

    assert.match(
      environment.stdout.toString(),
      /Requirement_RL11/);

    assert.doesNotMatch(
      environment.stdout.toString(),
      /Requirement_RL10/);

    assert.doesNotMatch(
      environment.stdout.toString(),
      /Article_RL10/);
  });

test(
  'RQ123: check uses artefact locations when pattern is omitted and sorts by path then rule',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'artefacts/Requirement.md',
      REQUIREMENT_DEFINITION);

    await workspace.writeText(
      'plugin.js',
      PASSING_PLUGIN);

    await workspace.writeText(
      'development/zeta/RQ200 Later.md',
      '# RQ200 Later\n');

    await workspace.writeText(
      'development/alpha/RQ100 Earlier.md',
      '# RQ100 Earlier\n');

    const environment =
      createEnvironment(
        { loggerProvider,
          cwd: workspace.path,
          definitions:
            workspace.resolve('artefacts'),
          project: workspace.path,
          plugins:
            [ workspace.resolve('plugin.js') ] });

    await execCheck(
      loggerProvider.getLogger('execCheck'),
      environment,
      { withPositives: true,
        checkDefinitions:
          [ 'Requirement' ] });

    assert.equal(
      environment.stderr.toString(),
      '');

    assert.deepEqual(
      parseRows(
        environment.stdout.toString(),
        '| development/'),
      [ [ 'development/alpha/RQ100 Earlier.md',
          'Requirement_RL10',
          'OK' ],
        [ 'development/alpha/RQ100 Earlier.md',
          'Requirement_RL11',
          'OK' ],
        [ 'development/zeta/RQ200 Later.md',
          'Requirement_RL10',
          'OK' ],
        [ 'development/zeta/RQ200 Later.md',
          'Requirement_RL11',
          'OK' ] ]);
  });

test(
  'RQ123: check shows only failing rows by default and returns non-zero',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'artefacts/Requirement.md',
      REQUIREMENT_DEFINITION);

    await workspace.writeText(
      'plugin.js',
      FAILING_PLUGIN);

    await workspace.writeText(
      'development/RQ101 Example.md',
      '# RQ101 Example\n');

    const environment =
      createEnvironment(
        { loggerProvider,
          cwd: workspace.path,
          definitions:
            workspace.resolve('artefacts'),
          project: workspace.path,
          plugins:
            [ workspace.resolve('plugin.js') ] });

    await execCheck(
      loggerProvider.getLogger('execCheck'),
      environment);

    assert.equal(
      environment.stderr.toString(),
      '');

    assert.match(
      environment.stdout.toString(),
      /\| development\/RQ101 Example\.md \| Requirement_RL10 \| Failed\. \|/);

    assert.doesNotMatch(
      environment.stdout.toString(),
      /Requirement_RL11/);

    assert.equal(
      environment.exitCode,
      1);
  });

test(
  'RQ123: check with-positives shows passing and failing rows',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'artefacts/Requirement.md',
      REQUIREMENT_DEFINITION);

    await workspace.writeText(
      'plugin.js',
      FAILING_PLUGIN);

    await workspace.writeText(
      'development/RQ101 Example.md',
      '# RQ101 Example\n');

    const environment =
      createEnvironment(
        { loggerProvider,
          cwd: workspace.path,
          definitions:
            workspace.resolve('artefacts'),
          project: workspace.path,
          plugins:
            [ workspace.resolve('plugin.js') ] });

    await execCheck(
      loggerProvider.getLogger('execCheck'),
      environment,
      { withPositives: true });

    assert.equal(
      environment.stderr.toString(),
      '');

    assert.match(
      environment.stdout.toString(),
      /Requirement_RL10/);

    assert.match(
      environment.stdout.toString(),
      /\| development\/RQ101 Example\.md \| Requirement_RL11 \| OK\s+\|/);
  });

test(
  'RQ123: check reports rules without implementation as Skip only with-skipped',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'artefacts/Requirement.md',
      REQUIREMENT_DEFINITION);

    await workspace.writeText(
      'development/RQ101 Example.md',
      '# RQ101 Example\n');

    const createCheckEnvironment =
      (): Environment =>
      createEnvironment(
        { loggerProvider,
          cwd: workspace.path,
          definitions:
            workspace.resolve('artefacts'),
          project: workspace.path });

    const hidden =
      createCheckEnvironment();

    await execCheck(
      loggerProvider.getLogger('execCheck'),
      hidden,
      { withPositives: true });

    assert.deepEqual(
      parseRows(
        hidden.stdout.toString(),
        '| development/'),
      [ ]);

    assert.equal(
      hidden.exitCode,
      undefined);

    const shown =
      createCheckEnvironment();

    await execCheck(
      loggerProvider.getLogger('execCheck'),
      shown,
      { withSkipped: true });

    assert.deepEqual(
      parseRows(
        shown.stdout.toString(),
        '| development/'),
      [ [ 'development/RQ101 Example.md',
          'Requirement_RL10',
          'Skip' ],
        [ 'development/RQ101 Example.md',
          'Requirement_RL11',
          'Skip' ] ]);

    assert.equal(
      shown.exitCode,
      undefined);
  });

test(
  'RQ123: check matches a pattern with a scheme against full locations',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'artefacts/Release.md',
      `# Release

A release.

## Rules

### RL1

Release rule.
`);

    await workspace.writeText(
      'plugin.js',
      `export default () => ({
  name: 'test',
  locate: {
    Release: async () => [
      { location: 'test:release/1', name: '1' },
      { location: 'test:release/2', name: '2' }
    ]
  },
  rules: { Release: { RL1: async () => {} } }
});
`);

    const environment =
      createEnvironment(
        { loggerProvider,
          cwd: workspace.path,
          definitions:
            workspace.resolve('artefacts'),
          project: workspace.path,
          plugins:
            [ workspace.resolve('plugin.js') ] });

    await execCheck(
      loggerProvider.getLogger('execCheck'),
      environment,
      { pattern: 'test:release/2',
        withPositives: true });

    assert.deepEqual(
      parseRows(
        environment.stdout.toString(),
        '| test:'),
      [ [ 'test:release/2',
          'Release_RL1',
          'OK' ] ]);
  });

function parseRows(
    output: string,
    prefix: string
  ): string[][]
{
  return output
    .split('\n')
    .filter(
      line => line.startsWith(prefix))
    .map(
      line =>
        line
          .split('|')
          .map(
            cell => cell.trim())
          .filter(
            cell => cell.length > 0));
}
