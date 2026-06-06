import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';

import { validate } from './Requirement_RL10.js';

test('Requirement_RL10 uses gitignore-aware glob discovery for test files', async () =>
{
  const workspacePath = await mkdtemp(path.join(os.tmpdir(), 'part-requirement-rl10-'));
  const requirementPath = path.join(workspacePath, 'development', 'RQ101 Example.md');

  await mkdir(path.dirname(requirementPath), { recursive: true });
  await mkdir(path.join(workspacePath, 'visible'), { recursive: true });
  await mkdir(path.join(workspacePath, 'ignored'), { recursive: true });
  await writeFile(path.join(workspacePath, '.gitignore'), 'ignored/\n', 'utf8');
  await writeFile(requirementPath, '# RQ101 Example\n', 'utf8');
  await writeFile(path.join(workspacePath, 'visible', 'example.test.js'), '// mentions RQ101\n', 'utf8');
  await writeFile(path.join(workspacePath, 'ignored', 'example.test.js'), '// mentions RQ999\n', 'utf8');

  await assert.doesNotReject(() => validate({ file: 'development/RQ101 Example.md' }, {
    artifactPath: requirementPath,
    rootDirectory: workspacePath,
  }));
});