import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { TmpDir }
  from '../tmp-dir.js';
import { createLogger }
  from '../../src/logging.js';
import { createEnvironment }
  from '../environment.js';
import { execCheck }
  from './check.js';

const logger =
  createLogger(
    { level: 'trace',
      enabled: false });

test(
  'RQ123: check prints one row per matched file and rule',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.mkdir(
      'artefacts/rules');

    workspace.mkdir(
      'development/features');

    workspace.writeText(
      'artefacts/Requirement.md',
      `# Requirement

A statement about the system that must be true.

## Location

- Files: ../development/**/RQ*.md

## Rules

- RL10 - At least one test file has requirement ID in its content.
- RL11 - Requirement passes a second rule.
`);

    workspace.writeText(
      'artefacts/rules/Requirement_RL10.js',
      `export async function validate(artefact) {
  throw new Error(artefact.relativePath + ' is not referenced by any test.');
}
`);

    workspace.writeText(
      'artefacts/rules/Requirement_RL11.js',
      `export async function validate() {
  return;
}
`);

    workspace.writeText(
      'development/features/RQ101 Example.md',
      '# RQ101 Example\n');

    workspace.writeText(
      'development/features/RQ102 Example.md',
      '# RQ102 Example\n');

    const environment =
      createEnvironment(
        { logger,
          cwd: workspace.path,
          definitions: workspace.path,
          project: workspace.path });

    await execCheck(
      environment);

    assert.equal(
      environment.stderr.toString(),
      '');

    assert.match(
      environment.stdout.toString(),
      /\| Path\s+\| Rule\s+\| Result\s+\|/);

    assert.match(
      environment.stdout.toString(),
      /\| development\/features\/RQ101 Example\.md \| Requirement_RL10 \| development\/features\/RQ101 Example\.md is not referenced by any test\. \|/);

    assert.match(
      environment.stdout.toString(),
      /\| development\/features\/RQ102 Example\.md \| Requirement_RL10 \| development\/features\/RQ102 Example\.md is not referenced by any test\. \|/);
  });

0 && test(
  'RQ123: check includes rules from all matching definitions for the same artefact',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.mkdir(
      'definitions/rules');

    workspace.mkdir(
      'part');

    workspace.writeText(
      'definitions/Article.md',
      `# Article

Markdown article.

## Location

- Files: **/*.md

## Rules

- RL10 - Article rule.
`);

    workspace.writeText(
      'definitions/Artefact Definition.md',
      `# Artefact Definition

Definition file.

## Location

- Files: **/*.md

## Rules

- RL10 - Definition rule.
`);

    workspace.writeText(
      'definitions/rules/Article_RL10.js',
      'export async function validate() {}\n');

    workspace.writeText(
      'definitions/rules/Artefact Definition_RL10.js',
      'export async function validate() {}\n');

    workspace.writeText(
      'definitions/Requirement.md',
      '# Requirement\n');

    const environment =
      createEnvironment(
        { logger,
          cwd: workspace.path,
          definitions: workspace.path,
          project: workspace.path });

    await execCheck(
      environment,
      { pattern: 'definitions/Requirement.md',
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

0 && test(
  'RQ123: check filters by definitions and rules',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());


    workspace.mkdir(
      'artefacts/rules');

    workspace.mkdir(
      'development');

    workspace.writeText(
      'artefacts/Requirement.md',
      `# Requirement

A statement about the system that must be true.

## Location

- Files: ../development/**/RQ*.md

## Rules

- RL10 - Requirement rule.
- RL11 - Second requirement rule.
`);

    workspace.writeText(
      'artefacts/Article.md',
      `# Article

Markdown article.

## Location

- Files: *.md

## Rules

- RL10 - Article rule.
`);

    workspace.writeText(
      'artefacts/rules/Requirement_RL10.js',
      'export async function validate() {}\n');

    workspace.writeText(
      'artefacts/rules/Requirement_RL11.js',
      'export async function validate() {}\n');

    workspace.writeText(
      'artefacts/rules/Article_RL10.js',
      'export async function validate() {}\n');

    workspace.writeText(
      'development/RQ101 Example.md',
      '# RQ101 Example\n');

    const environment =
      createEnvironment(
        { logger,
          cwd: workspace.path,
          definitions: workspace.path,
          project: workspace.path });

    await execCheck(
      environment,
      { pattern: 'development/**/*.md',
        checkDefinitions: ['Requirement'],
        checkRules: ['Requirement_RL11'],
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

0 && test(
  'RQ123: check uses artefact locations when pattern is omitted and sorts by path then rule',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.mkdir(
      'artefacts/rules');

    workspace.mkdir(
      'development/zeta');

    workspace.mkdir(
      'development/alpha');

    workspace.writeText(
      'artefacts/Requirement.md',
      `# Requirement

A statement about the system that must be true.

## Location

- Files: ../development/**/RQ*.md

## Rules

- RL10 - First rule.
- RL11 - Second rule.
`);

    workspace.writeText(
      'artefacts/rules/Requirement_RL10.js',
      'export async function validate() {}\n');

    workspace.writeText(
      'artefacts/rules/Requirement_RL11.js',
      'export async function validate() {}\n');

    workspace.writeText(
      'development/zeta/RQ200 Later.md',
      '# RQ200 Later\n');

    workspace.writeText(
      'development/alpha/RQ100 Earlier.md',
      '# RQ100 Earlier\n');

    const environment =
      createEnvironment(
        { logger,
          cwd: workspace.path,
          definitions: workspace.path,
          project: workspace.path });

    await execCheck(
      environment,
      { withPositives: true,
        checkDefinitions: ['Requirement'] });

    assert.equal(
      environment.stderr.toString(),
      '');

    const rows =
      environment.stdout.toString()
        .split('\n')
        .filter(
          (line) => line.startsWith(
            '| development/'))
        .map(
          (line) => line.split('|').map(
            (cell) => cell.trim()).filter(
              (cell) => cell.length > 0));

    assert.deepEqual(
      rows,
      [
        ['development/alpha/RQ100 Earlier.md', 'Requirement_RL10', 'OK'],
        ['development/alpha/RQ100 Earlier.md', 'Requirement_RL11', 'OK'],
        ['development/zeta/RQ200 Later.md', 'Requirement_RL10', 'OK'],
        ['development/zeta/RQ200 Later.md', 'Requirement_RL11', 'OK'],
      ]);
  });

0 && test(
  'RQ123: check shows only failing rows by default and still returns non-zero',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());


    workspace.mkdir(
      'artefacts/rules');

    workspace.mkdir(
      'development');

    workspace.writeText(
      'artefacts/Requirement.md',
      `# Requirement

A statement about the system that must be true.

## Location

- Files: ../development/**/RQ*.md

## Rules

- RL10 - Failing rule.
- RL11 - Passing rule.
`);

    workspace.writeText(
      'artefacts/rules/Requirement_RL10.js',
      'export async function validate() { throw new Error(\'Failed.\'); }\n');

    workspace.writeText(
      'artefacts/rules/Requirement_RL11.js',
      'export async function validate() {}\n');

    workspace.writeText(
      'development/RQ101 Example.md',
      '# RQ101 Example\n');

    const environment =
      createEnvironment(
        { logger,
          cwd: workspace.path,
          definitions: workspace.path,
          project: workspace.path });

    await execCheck(
      environment);

    assert.equal(
      environment.stderr.toString(),
      '');

    assert.match(
      environment.stdout.toString(),
      /Requirement_RL10/);

    assert.doesNotMatch(
      environment.stdout.toString(),
      /Requirement_RL11/);
  });

0 && test(
  'RQ123: check with-positives shows passing and failing rows',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());


    workspace.mkdir(
      'artefacts/rules');

    workspace.mkdir(
      'development');

    workspace.writeText(
      'artefacts/Requirement.md',
      `# Requirement

A statement about the system that must be true.

## Location

- Files: ../development/**/RQ*.md

## Rules

- RL10 - Failing rule.
- RL11 - Passing rule.
`);

    workspace.writeText(
      'artefacts/rules/Requirement_RL10.js',
      'export async function validate() { throw new Error(\'Failed.\'); }\n');

    workspace.writeText(
      'artefacts/rules/Requirement_RL11.js',
      'export async function validate() {}\n');

    workspace.writeText(
      'development/RQ101 Example.md',
      '# RQ101 Example\n');

    const environment =
      createEnvironment(
        { logger,
          cwd: workspace.path,
          definitions: workspace.path,
          project: workspace.path });

    await execCheck(
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
      /Requirement_RL11/);

    assert.match(
      environment.stdout.toString(),
      /\| development\/RQ101 Example\.md \| Requirement_RL11 \| OK\s+\|/);
  });
