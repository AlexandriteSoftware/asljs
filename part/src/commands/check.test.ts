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
import { execCheck }
  from './check.js';

const loggerProvider =
  createPinoLoggerProvider();

after(
  () =>
  {
    loggerProvider.dispose();
  }
);

const tmpDir =
  tmpDirFactory(
    loggerProvider);

test(
  'RQ123: check prints one row per matched file and rule',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'artefacts/Requirement.md',
      `# Requirement

A statement about the system that must be true.

## Location

- Pattern: ../development/**/RQ*.md

## Rules

### RL10

At least one test file has requirement ID in its content.

### RL11

Requirement passes a second rule.
`
    );

    await workspace.writeText(
      'artefacts/parts/Requirement_RL10.js',
      `export async function validate(artefact) {
  throw new Error(artefact.relativePath + ' is not referenced by any test.');
}
`
    );

    await workspace.writeText(
      'artefacts/parts/Requirement_RL11.js',
      `export async function validate() {
  return;
}
`
    );

    await workspace.writeText(
      'development/features/RQ101 Example.md',
      '# RQ101 Example\n'
    );

    await workspace.writeText(
      'development/features/RQ102 Example.md',
      '# RQ102 Example\n'
    );

    const environment =
      createEnvironment(
        {
        loggerProvider,
        cwd: workspace.path,
        definitions: workspace.path,
        project: workspace.path
      });

    await execCheck(
      loggerProvider.getLogger('execCheck'),
      environment
    );

    assert.equal(
      environment.stderr.toString(),
      ''
    );

    assert.match(
      environment.stdout.toString(),
      /\| Location\s+\| Rule\s+\| Result\s+\|/
    );

    assert.match(
      environment.stdout.toString(),
      /\| development\/features\/RQ101 Example\.md \| Requirement_RL10 \| development\/features\/RQ101 Example\.md is not referenced by any test\. \|/
    );

    assert.match(
      environment.stdout.toString(),
      /\| development\/features\/RQ102 Example\.md \| Requirement_RL10 \| development\/features\/RQ102 Example\.md is not referenced by any test\. \|/
    );
  }
);

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
`
    );

    await workspace.writeText(
      'definitions/Artefact Definition.md',
      `# Artefact Definition

Definition file.

## Location

- Pattern: **/*.md

## Rules

### RL10

Definition rule.
`
    );

    await workspace.writeText(
      'definitions/parts/Article_RL10.js',
      'export async function validate() {}\n'
    );

    await workspace.writeText(
      'definitions/parts/Artefact Definition_RL10.js',
      'export async function validate() {}\n'
    );

    await workspace.writeText(
      'definitions/Requirement.md',
      '# Requirement\n'
    );

    const environment =
      createEnvironment(
        {
        loggerProvider,
        cwd: workspace.path,
        definitions: workspace.path,
        project: workspace.path
      });

    await execCheck(
      loggerProvider.getLogger('execCheck'),
      environment,
      { pattern: 'definitions/Requirement.md', withPositives: true }
    );

    assert.equal(
      environment.stderr.toString(),
      ''
    );

    assert.match(
      environment.stdout.toString(),
      /\|\s+definitions\/Requirement\.md\s+\| Article_RL10\s+\| OK\s+\|/
    );

    assert.match(
      environment.stdout.toString(),
      /\|\s+definitions\/Requirement\.md\s+\| Artefact Definition_RL10\s+\| OK\s+\|/
    );
  }
);

test(
  'RQ123: check filters by definitions and rules',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'artefacts/Requirement.md',
      `# Requirement

A statement about the system that must be true.

## Location

- Pattern: ../development/**/RQ*.md

## Rules

### RL10

Requirement rule.

### RL11

Second requirement rule.
`
    );

    await workspace.writeText(
      'artefacts/Article.md',
      `# Article

Markdown article.

## Location

- Pattern: *.md

## Rules

### RL10

Article rule.
`
    );

    await workspace.writeText(
      'artefacts/parts/Requirement_RL10.js',
      'export async function validate() {}\n'
    );

    await workspace.writeText(
      'artefacts/parts/Requirement_RL11.js',
      'export async function validate() {}\n'
    );

    await workspace.writeText(
      'artefacts/parts/Article_RL10.js',
      'export async function validate() {}\n'
    );

    await workspace.writeText(
      'development/RQ101 Example.md',
      '# RQ101 Example\n'
    );

    const environment =
      createEnvironment(
        {
        loggerProvider,
        cwd: workspace.path,
        definitions: workspace.path,
        project: workspace.path
      });

    await execCheck(
      loggerProvider.getLogger('execCheck'),
      environment,
      {
        pattern: 'development/**/*.md',
        checkDefinitions: ['Requirement'],
        checkRules: ['Requirement_RL11'],
        withPositives: true
      }
    );

    assert.equal(
      environment.stderr.toString(),
      ''
    );

    assert.match(
      environment.stdout.toString(),
      /Requirement_RL11/
    );

    assert.doesNotMatch(
      environment.stdout.toString(),
      /Requirement_RL10/
    );

    assert.doesNotMatch(
      environment.stdout.toString(),
      /Article_RL10/
    );
  }
);

test(
  'RQ123: check uses artefact locations when pattern is omitted and sorts by path then rule',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'artefacts/Requirement.md',
      `# Requirement

A statement about the system that must be true.

## Location

- Pattern: ../development/**/RQ*.md

## Rules

### RL10

First rule.

### RL11

Second rule.
`
    );

    await workspace.writeText(
      'artefacts/parts/Requirement_RL10.js',
      'export async function validate() {}\n'
    );

    await workspace.writeText(
      'artefacts/parts/Requirement_RL11.js',
      'export async function validate() {}\n'
    );

    await workspace.writeText(
      'development/zeta/RQ200 Later.md',
      '# RQ200 Later\n'
    );

    await workspace.writeText(
      'development/alpha/RQ100 Earlier.md',
      '# RQ100 Earlier\n'
    );

    const environment =
      createEnvironment(
        {
        loggerProvider,
        cwd: workspace.path,
        definitions: workspace.path,
        project: workspace.path
      });

    await execCheck(
      loggerProvider.getLogger('execCheck'),
      environment,
      { withPositives: true, checkDefinitions: ['Requirement'] }
    );

    assert.equal(
      environment.stderr.toString(),
      ''
    );

    const rows =
      environment.stdout.toString()
      .split('\n')
      .filter(
        line =>
          line.startsWith(
            '| development/'
          )
      )
      .map(
        line =>
          line.split('|').map(
            cell => cell.trim()
          ).filter(
            cell => cell.length > 0
          )
      );

    assert.deepEqual(
      rows,
      [
        ['development/alpha/RQ100 Earlier.md', 'Requirement_RL10', 'OK'],
        ['development/alpha/RQ100 Earlier.md', 'Requirement_RL11', 'OK'],
        ['development/zeta/RQ200 Later.md', 'Requirement_RL10', 'OK'],
        ['development/zeta/RQ200 Later.md', 'Requirement_RL11', 'OK']
      ]
    );
  }
);

test(
  'RQ123: check shows only failing rows by default and still returns non-zero',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'artefacts/Requirement.md',
      `# Requirement

A statement about the system that must be true.

## Location

- Pattern: ../development/**/RQ*.md

## Rules

### RL10

Failing rule.

### RL11

Passing rule.
`
    );

    await workspace.writeText(
      'artefacts/parts/Requirement_RL10.js',
      "export async function validate() { throw new Error('Failed.'); }\n"
    );

    await workspace.writeText(
      'artefacts/parts/Requirement_RL11.js',
      'export async function validate() {}\n'
    );

    await workspace.writeText(
      'development/RQ101 Example.md',
      '# RQ101 Example\n'
    );

    const environment =
      createEnvironment(
        {
        loggerProvider,
        cwd: workspace.path,
        definitions: workspace.path,
        project: workspace.path
      });

    await execCheck(
      loggerProvider.getLogger('execCheck'),
      environment
    );

    assert.equal(
      environment.stderr.toString(),
      ''
    );

    assert.match(
      environment.stdout.toString(),
      /Requirement_RL10/
    );

    assert.doesNotMatch(
      environment.stdout.toString(),
      /Requirement_RL11/
    );
  }
);

test(
  'RQ123: check with-positives shows passing and failing rows',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'artefacts/Requirement.md',
      `# Requirement

A statement about the system that must be true.

## Location

- Pattern: ../development/**/RQ*.md

## Rules

### RL10

Failing rule.

### RL11

Passing rule.
`
    );

    await workspace.writeText(
      'artefacts/parts/Requirement_RL10.js',
      "export async function validate() { throw new Error('Failed.'); }\n"
    );

    await workspace.writeText(
      'artefacts/parts/Requirement_RL11.js',
      'export async function validate() {}\n'
    );

    await workspace.writeText(
      'development/RQ101 Example.md',
      '# RQ101 Example\n'
    );

    const environment =
      createEnvironment(
        {
        loggerProvider,
        cwd: workspace.path,
        definitions: workspace.path,
        project: workspace.path
      });

    await execCheck(
      loggerProvider.getLogger('execCheck'),
      environment,
      { withPositives: true }
    );

    assert.equal(
      environment.stderr.toString(),
      ''
    );

    assert.match(
      environment.stdout.toString(),
      /Requirement_RL10/
    );

    assert.match(
      environment.stdout.toString(),
      /Requirement_RL11/
    );

    assert.match(
      environment.stdout.toString(),
      /\| development\/RQ101 Example\.md \| Requirement_RL11 \| OK\s+\|/
    );
  }
);
