import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import os
  from 'node:os';
import path
  from 'node:path';
import { mkdtemp,
         mkdir,
         writeFile }
  from 'node:fs/promises';
import { runCli }
  from '../src/cli.js';

test(
  'inventory reports README example artifact as OK',
  async () => {
    const workspacePath =
      await mkdtemp(
        path.join(
          os.tmpdir(),
          'part-'));

    await mkdir(
      path.join(
        workspacePath,
        'Todo Items'),
      { recursive: true });

    await mkdir(
      path.join(
        workspacePath,
        'part'),
      { recursive: true });

    await writeFile(
      path.join(
        workspacePath,
        'Todo Item.md'),
      `# Todo Item

A todo item is a task that needs to be done.

## Properties

- Due date: when it needs to be done.

## Location

Todo items are stored in the \`Todo Items\` folder.

## Rules

- R1 Due date must be in the future.
`,
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'part',
        'TodoItem_R1.js'),
      `export function validate(todoItem) {
  const now = new Date();
  const dueDate = new Date(todoItem.dueDate);
  if (dueDate <= now) {
    throw new Error('Due date must be in the future.');
  }
}
`,
      'utf8',
    );

    const futureYear =
      new Date().getUTCFullYear() + 1;

    await writeFile(
      path.join(
        workspacePath,
        'Todo Items',
        'Buy milk.md'),
      `# Buy milk

- Due date: ${futureYear}-07-01

I need to buy milk.
`,
      'utf8',
    );

    const stdout =
      createWritableBuffer();

    const stderr =
      createWritableBuffer();

    const exitCode =
      await runCli(
        ['inventory'],
        {
          cwd: workspacePath,
          stdout,
          stderr,
        });

    assert.equal(
      exitCode,
      0);

    assert.equal(
      stderr.toString(),
      '');

    assert.match(
      stdout.toString(),
      /\| Location\s+\| Definitions\s+\| Rules \|/);

    assert.match(
      stdout.toString(),
      /\| Todo Items\/Buy milk\.md \| Todo Item\s+\| Ok\s+\|/);
  });

test(
  'inventory resolves artefact locations relative to the definition file',
  async () => {
    const workspacePath =
      await mkdtemp(
        path.join(
          os.tmpdir(),
          'part-'));

    await mkdir(
      path.join(
        workspacePath,
        'artefacts',
        'rules'),
      { recursive: true });

    await mkdir(
      path.join(
        workspacePath,
        'development'),
      { recursive: true });

    await writeFile(
      path.join(
        workspacePath,
        'artefacts',
        'Requirement.md'),
      `# Requirement

A statement about the system that must be true.

## Location

- Files: ../development/**/RQ*.md

## Rules

- RL10 - Requirement rule.
`,
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'artefacts',
        'rules',
        'Requirement_RL10.js'),
      'export async function validate() {}\n',
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'development',
        'RQ101 Example.md'),
      '# RQ101 Example\n',
      'utf8',
    );

    const stdout =
      createWritableBuffer();

    const stderr =
      createWritableBuffer();

    const exitCode =
      await runCli(
        ['inventory'],
        {
          cwd: workspacePath,
          stdout,
          stderr,
        });

    assert.equal(
      exitCode,
      0);

    assert.equal(
      stderr.toString(),
      '');

    assert.match(
      stdout.toString(),
      /\| development\/RQ101 Example\.md \| Requirement\s+\| Ok\s+\|/);
  });

test(
  'inventory lists all definitions applied to the same artefact',
  async () => {
    const workspacePath =
      await mkdtemp(
        path.join(
          os.tmpdir(),
          'part-'));

    await mkdir(
      path.join(
        workspacePath,
        'definitions',
        'rules'),
      { recursive: true });

    await mkdir(
      path.join(
        workspacePath,
        'part'),
      { recursive: true });

    await writeFile(
      path.join(
        workspacePath,
        'Article.md'),
      `# Article

Markdown article.

## Location

- Files: **/*.md

## Rules

- RL10 - Article rule.
`,
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'definitions',
        'Artefact Definition.md'),
      `# Artefact Definition

Definition file.

## Location

- Files: ../definitions/**/*.md

## Rules

- RL10 - Definition rule.
`,
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'part',
        'Article_RL10.js'),
      'export async function validate() {}\n',
      'utf8');

    await writeFile(
      path.join(
        workspacePath,
        'definitions',
        'rules',
        'Artefact Definition_RL10.js'),
      'export async function validate() {}\n',
      'utf8');

    await writeFile(
      path.join(
        workspacePath,
        'definitions',
        'Requirement.md'),
      '# Requirement\n',
      'utf8');

    const stdout =
      createWritableBuffer();

    const stderr =
      createWritableBuffer();

    const exitCode =
      await runCli(
        ['inventory'],
        {
          cwd: workspacePath,
          stdout,
          stderr,
        });

    assert.equal(
      exitCode,
      0);

    assert.equal(
      stderr.toString(),
      '');

    assert.match(
      stdout.toString(),
      /\| definitions\/Requirement\.md\s+\| Article,Artefact Definition\s+\| Ok\s+\|/);
  });

test(
  'inventory respects Definitions parameter and reports Fail when any rule fails',
  async () => {
    const workspacePath =
      await mkdtemp(
        path.join(
          os.tmpdir(),
          'part-'));

    await mkdir(
      path.join(
        workspacePath,
        'definitions'),
      { recursive: true });

    await mkdir(
      path.join(
        workspacePath,
        'Todo Items'),
      { recursive: true });

    await mkdir(
      path.join(
        workspacePath,
        'part'),
      { recursive: true });

    await writeFile(
      path.join(
        workspacePath,
        'definitions',
        'Todo Item.md'),
      `# Todo Item

A todo item is a task that needs to be done.

## Properties

- Due date: when it needs to be done.

## Location

- Folders: ../Todo Items

## Rules

- R1 Due date must be in the future.
`,
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'part',
        'TodoItem_R1.js'),
      `export function validate(todoItem) {
  const now = new Date();
  const dueDate = new Date(todoItem.dueDate);
  if (dueDate <= now) {
    throw new Error('Due date must be in the future.');
  }
}
`,
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'Todo Items',
        'Buy milk.md'),
      `# Buy milk

- Due date: 2020-07-01
`,
      'utf8',
    );

    const stdout =
      createWritableBuffer();

    const stderr =
      createWritableBuffer();

    const exitCode =
      await runCli(
        ['inventory', '--definitions', 'definitions'],
        {
          cwd: workspacePath,
          stdout,
          stderr,
        });

    assert.equal(
      exitCode,
      0);

    assert.equal(
      stderr.toString(),
      '');

    assert.match(
      stdout.toString(),
      /\| Todo Items\/Buy milk\.md \| Todo Item\s+\| Fail\s+\|/);
  });

test(
  'artefactdefinition lists definitions and respects Definitions parameter',
  async () => {
    const workspacePath =
      await mkdtemp(
        path.join(
          os.tmpdir(),
          'part-'));

    await mkdir(
      path.join(
        workspacePath,
        'definitions'),
      { recursive: true });

    await writeFile(
      path.join(
        workspacePath,
        'definitions',
        'Todo Item.md'),
      `# Todo Item

A todo item is a task that needs to be done.

## Location

- Folders: Todo Items
`,
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'Todo Item.md'),
      `# Todo Item

This top-level definition should be ignored by the Definitions parameter.

## Location

- Folders: Wrong Items
`,
      'utf8',
    );

    const stdout =
      createWritableBuffer();

    const stderr =
      createWritableBuffer();

    const exitCode =
      await runCli(
        ['artefactdefinition', '--definitions', 'definitions'],
        {
          cwd: workspacePath,
          stdout,
          stderr,
        });

    assert.equal(
      exitCode,
      0);

    assert.equal(
      stderr.toString(),
      '');

    assert.match(
      stdout.toString(),
      /\| Name\s+\| Location\s+\|/);

    assert.match(
      stdout.toString(),
      /\| Todo Item \| definitions\/Todo Item\.md \|/);

    assert.doesNotMatch(
      stdout.toString(),
      /Wrong Items/);
  });

test(
  'artefactdefinition prints detailed definition content for a named definition',
  async () => {
    const workspacePath =
      await mkdtemp(
        path.join(
          os.tmpdir(),
          'part-'));

    await mkdir(
      path.join(
        workspacePath,
        'artefacts',
        'rules'),
      { recursive: true });

    await writeFile(
      path.join(
        workspacePath,
        'artefacts',
        'Requirement.md'),
      `# Requirement

A statement about the system that must be true.

## Properties

- Id - A unique identifier of the requirement.

## Location

- Files: ../development/**/RQ*.md

## Rules

- RL10 - At least one test file has requirement ID in its content.
- RL11 - Requirement passes a second rule.
`,
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'artefacts',
        'rules',
        'Requirement_RL10.js'),
      'export async function validate() {}\n',
      'utf8',
    );

    const stdout =
      createWritableBuffer();

    const stderr =
      createWritableBuffer();

    const exitCode =
      await runCli(
        ['artefactdefinition', 'Requirement'],
        {
          cwd: workspacePath,
          stdout,
          stderr,
        });

    assert.equal(
      exitCode,
      0);

    assert.equal(
      stderr.toString(),
      '');

    assert.match(
      stdout.toString(),
      /- name: Requirement/);

    assert.match(
      stdout.toString(),
      /- filePath: rules\/Requirement_RL10\.js/);
  });

test(
  'check prints one row per matched file and rule',
  async () => {
    const workspacePath =
      await mkdtemp(
        path.join(
          os.tmpdir(),
          'part-'));

    await mkdir(
      path.join(
        workspacePath,
        'artefacts',
        'rules'),
      { recursive: true });

    await mkdir(
      path.join(
        workspacePath,
        'development',
        'features'),
      { recursive: true });

    await writeFile(
      path.join(
        workspacePath,
        'artefacts',
        'Requirement.md'),
      `# Requirement

A statement about the system that must be true.

## Location

- Files: ../development/**/RQ*.md

## Rules

- RL10 - At least one test file has requirement ID in its content.
- RL11 - Requirement passes a second rule.
`,
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'artefacts',
        'rules',
        'Requirement_RL10.js'),
      `export async function validate(artefact) {
  throw new Error(artefact.file + ' is not referenced by any test.');
}
`,
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'artefacts',
        'rules',
        'Requirement_RL11.js'),
      `export async function validate() {
  return;
}
`,
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'development',
        'features',
        'RQ101 Example.md'),
      '# RQ101 Example\n',
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'development',
        'features',
        'RQ102 Example.md'),
      '# RQ102 Example\n',
      'utf8',
    );

    const stdout =
      createWritableBuffer();

    const stderr =
      createWritableBuffer();

    const exitCode =
      await runCli(
        ['check', 'development/features/*.md', '--with-positives'],
        {
          cwd: workspacePath,
          stdout,
          stderr,
        });

    assert.equal(
      exitCode,
      1);

    assert.equal(
      stderr.toString(),
      '');

    assert.match(
      stdout.toString(),
      /\| Path\s+\| Rule\s+\| Result\s+\|/);

    assert.match(
      stdout.toString(),
      /\| development\/features\/RQ101 Example\.md \| Requirement_RL10 \| development\/features\/RQ101 Example\.md is not referenced by any test\. \|/);

    assert.match(
      stdout.toString(),
      /\| development\/features\/RQ101 Example\.md \| Requirement_RL11 \| OK\s+\|/);

    assert.match(
      stdout.toString(),
      /\| development\/features\/RQ102 Example\.md \| Requirement_RL10 \| development\/features\/RQ102 Example\.md is not referenced by any test\. \|/);
  });

test(
  'check includes rules from all matching definitions for the same artefact',
  async () => {
    const workspacePath =
      await mkdtemp(
        path.join(
          os.tmpdir(),
          'part-'));

    await mkdir(
      path.join(
        workspacePath,
        'definitions',
        'rules'),
      { recursive: true });

    await mkdir(
      path.join(
        workspacePath,
        'part'),
      { recursive: true });

    await writeFile(
      path.join(
        workspacePath,
        'Article.md'),
      `# Article

Markdown article.

## Location

- Files: **/*.md

## Rules

- RL10 - Article rule.
`,
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'definitions',
        'Artefact Definition.md'),
      `# Artefact Definition

Definition file.

## Location

- Files: ../definitions/**/*.md

## Rules

- RL10 - Definition rule.
`,
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'part',
        'Article_RL10.js'),
      'export async function validate() {}\n',
      'utf8');

    await writeFile(
      path.join(
        workspacePath,
        'definitions',
        'rules',
        'Artefact Definition_RL10.js'),
      'export async function validate() {}\n',
      'utf8');

    await writeFile(
      path.join(
        workspacePath,
        'definitions',
        'Requirement.md'),
      '# Requirement\n',
      'utf8');

    const stdout =
      createWritableBuffer();

    const stderr =
      createWritableBuffer();

    const exitCode =
      await runCli(
        ['check', 'definitions/Requirement.md', '--with-positives'],
        {
          cwd: workspacePath,
          stdout,
          stderr,
        });

    assert.equal(
      exitCode,
      0);

    assert.equal(
      stderr.toString(),
      '');

    assert.match(
      stdout.toString(),
      /\| definitions\/Requirement\.md \| Article_RL10\s+\| OK\s+\|/);

    assert.match(
      stdout.toString(),
      /\| definitions\/Requirement\.md \| Artefact Definition_RL10\s+\| OK\s+\|/);
  });

test(
  'check filters by definitions and rules',
  async () => {
    const workspacePath =
      await mkdtemp(
        path.join(
          os.tmpdir(),
          'part-'));

    await mkdir(
      path.join(
        workspacePath,
        'artefacts',
        'rules'),
      { recursive: true });

    await mkdir(
      path.join(
        workspacePath,
        'development'),
      { recursive: true });

    await writeFile(
      path.join(
        workspacePath,
        'artefacts',
        'Requirement.md'),
      `# Requirement

A statement about the system that must be true.

## Location

- Files: ../development/**/RQ*.md

## Rules

- RL10 - Requirement rule.
- RL11 - Second requirement rule.
`,
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'artefacts',
        'Article.md'),
      `# Article

Markdown article.

## Location

- Files: *.md

## Rules

- RL10 - Article rule.
`,
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'artefacts',
        'rules',
        'Requirement_RL10.js'),
      'export async function validate() {}\n',
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'artefacts',
        'rules',
        'Requirement_RL11.js'),
      'export async function validate() {}\n',
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'artefacts',
        'rules',
        'Article_RL10.js'),
      'export async function validate() {}\n',
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'development',
        'RQ101 Example.md'),
      '# RQ101 Example\n',
      'utf8',
    );

    const stdout =
      createWritableBuffer();

    const stderr =
      createWritableBuffer();

    const exitCode =
      await runCli(
        [
          'check',
          'development/**/*.md',
          '--definitions=Requirement',
          '--rules=Requirement_RL11',
          '--with-positives',
        ],
        {
          cwd: workspacePath,
          stdout,
          stderr,
        });

    assert.equal(
      exitCode,
      0);

    assert.equal(
      stderr.toString(),
      '');

    assert.match(
      stdout.toString(),
      /Requirement_RL11/);

    assert.doesNotMatch(
      stdout.toString(),
      /Requirement_RL10/);

    assert.doesNotMatch(
      stdout.toString(),
      /Article_RL10/);
  });

test(
  'check uses artefact locations when pattern is omitted and sorts by path then rule',
  async () => {
    const workspacePath =
      await mkdtemp(
        path.join(
          os.tmpdir(),
          'part-'));

    await mkdir(
      path.join(
        workspacePath,
        'artefacts',
        'rules'),
      { recursive: true });

    await mkdir(
      path.join(
        workspacePath,
        'development',
        'zeta'),
      { recursive: true });

    await mkdir(
      path.join(
        workspacePath,
        'development',
        'alpha'),
      { recursive: true });

    await writeFile(
      path.join(
        workspacePath,
        'artefacts',
        'Requirement.md'),
      `# Requirement

A statement about the system that must be true.

## Location

- Files: ../development/**/RQ*.md

## Rules

- RL10 - First rule.
- RL11 - Second rule.
`,
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'artefacts',
        'rules',
        'Requirement_RL10.js'),
      'export async function validate() {}\n',
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'artefacts',
        'rules',
        'Requirement_RL11.js'),
      'export async function validate() {}\n',
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'development',
        'zeta',
        'RQ200 Later.md'),
      '# RQ200 Later\n',
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'development',
        'alpha',
        'RQ100 Earlier.md'),
      '# RQ100 Earlier\n',
      'utf8',
    );

    const stdout =
      createWritableBuffer();

    const stderr =
      createWritableBuffer();

    const exitCode =
      await runCli(
        ['check', '--definitions=Requirement', '--with-positives'],
        {
          cwd: workspacePath,
          stdout,
          stderr,
        });

    assert.equal(
      exitCode,
      0);

    assert.equal(
      stderr.toString(),
      '');

    const rows =
      stdout.toString()
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

test(
  'check shows only failing rows by default and still returns non-zero',
  async () => {
    const workspacePath =
      await mkdtemp(
        path.join(
          os.tmpdir(),
          'part-'));

    await mkdir(
      path.join(
        workspacePath,
        'artefacts',
        'rules'),
      { recursive: true });

    await mkdir(
      path.join(
        workspacePath,
        'development'),
      { recursive: true });

    await writeFile(
      path.join(
        workspacePath,
        'artefacts',
        'Requirement.md'),
      `# Requirement

A statement about the system that must be true.

## Location

- Files: ../development/**/RQ*.md

## Rules

- RL10 - Failing rule.
- RL11 - Passing rule.
`,
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'artefacts',
        'rules',
        'Requirement_RL10.js'),
      'export async function validate() { throw new Error(\'Failed.\'); }\n',
      'utf8');

    await writeFile(
      path.join(
        workspacePath,
        'artefacts',
        'rules',
        'Requirement_RL11.js'),
      'export async function validate() {}\n',
      'utf8');

    await writeFile(
      path.join(
        workspacePath,
        'development',
        'RQ101 Example.md'),
      '# RQ101 Example\n',
      'utf8');

    const stdout =
      createWritableBuffer();

    const stderr =
      createWritableBuffer();

    const exitCode =
      await runCli(
        ['check'],
        {
          cwd: workspacePath,
          stdout,
          stderr,
        });

    assert.equal(
      exitCode,
      1);

    assert.equal(
      stderr.toString(),
      '');

    assert.match(
      stdout.toString(),
      /Requirement_RL10/);

    assert.doesNotMatch(
      stdout.toString(),
      /Requirement_RL11/);
  });

test(
  'check with-positives shows passing and failing rows',
  async () => {
    const workspacePath =
      await mkdtemp(
        path.join(
          os.tmpdir(),
          'part-'));

    await mkdir(
      path.join(
        workspacePath,
        'artefacts',
        'rules'),
      { recursive: true });

    await mkdir(
      path.join(
        workspacePath,
        'development'),
      { recursive: true });

    await writeFile(
      path.join(
        workspacePath,
        'artefacts',
        'Requirement.md'),
      `# Requirement

A statement about the system that must be true.

## Location

- Files: ../development/**/RQ*.md

## Rules

- RL10 - Failing rule.
- RL11 - Passing rule.
`,
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'artefacts',
        'rules',
        'Requirement_RL10.js'),
      'export async function validate() { throw new Error(\'Failed.\'); }\n',
      'utf8');

    await writeFile(
      path.join(
        workspacePath,
        'artefacts',
        'rules',
        'Requirement_RL11.js'),
      'export async function validate() {}\n',
      'utf8');

    await writeFile(
      path.join(
        workspacePath,
        'development',
        'RQ101 Example.md'),
      '# RQ101 Example\n',
      'utf8');

    const stdout =
      createWritableBuffer();

    const stderr =
      createWritableBuffer();

    const exitCode =
      await runCli(
        ['check', '--with-positives'],
        {
          cwd: workspacePath,
          stdout,
          stderr,
        });

    assert.equal(
      exitCode,
      1);

    assert.equal(
      stderr.toString(),
      '');

    assert.match(
      stdout.toString(),
      /Requirement_RL10/);

    assert.match(
      stdout.toString(),
      /Requirement_RL11/);

    assert.match(
      stdout.toString(),
      /\| development\/RQ101 Example\.md \| Requirement_RL11 \| OK\s+\|/);
  });

function createWritableBuffer()
{
  const chunks =
    [];

  return {
    write(value) {
      chunks.push(
        String(value));
    },
    toString() {
      return chunks.join('');
    },
  };
}

test(
  'inventory accepts --definitions=value option syntax',
  async () => {
    const workspacePath =
      await mkdtemp(
        path.join(
          os.tmpdir(),
          'part-'));

    await mkdir(
      path.join(
        workspacePath,
        'definitions'),
      { recursive: true });

    await mkdir(
      path.join(
        workspacePath,
        'Todo Items'),
      { recursive: true });

    await mkdir(
      path.join(
        workspacePath,
        'part'),
      { recursive: true });

    await writeFile(
      path.join(
        workspacePath,
        'definitions',
        'Todo Item.md'),
      `# Todo Item

Todo item.

## Location

- Folders: ../Todo Items
`,
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'Todo Items',
        'Buy milk.md'),
      '# Buy milk\n',
      'utf8',
    );

    const stdout =
      createWritableBuffer();

    const stderr =
      createWritableBuffer();

    const exitCode =
      await runCli(
        ['inventory', '--definitions=definitions'],
        {
          cwd: workspacePath,
          stdout,
          stderr,
        });

    assert.equal(
      exitCode,
      0);

    assert.equal(
      stderr.toString(),
      '');

    assert.match(
      stdout.toString(),
      /Todo Items\/Buy milk\.md/);
  });

test(
  'cli reports missing option values as command errors',
  async () => {
    const stdout =
      createWritableBuffer();

    const stderr =
      createWritableBuffer();

    const missingValueExitCode =
      await runCli(
        ['inventory', '--definitions'],
        {
          cwd: process.cwd(),
          stdout,
          stderr,
        });

    assert.equal(
      missingValueExitCode,
      1);

    assert.match(
      stderr.toString(),
      /Option --definitions requires a value\./);
  });

test(
  'cli rejects unsupported long options',
  async () => {
    const stdout =
      createWritableBuffer();

    const stderr =
      createWritableBuffer();

    const exitCode =
      await runCli(
        ['inventory', '--verbose'],
        {
          cwd: process.cwd(),
          stdout,
          stderr,
        });

    assert.equal(
      exitCode,
      1);

    assert.match(
      stderr.toString(),
      /Unknown option: --verbose/);
  });