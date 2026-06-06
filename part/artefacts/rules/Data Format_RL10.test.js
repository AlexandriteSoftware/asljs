import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';

import { validate } from './Data Format_RL10.js';

test('Data Format_RL10 uses gitignore-aware glob discovery for test files', async () =>
{
  const workspacePath = await mkdtemp(path.join(os.tmpdir(), 'part-data-format-rl10-'));
  const dataFormatPath = path.join(workspacePath, 'development', 'DF1 Example.md');

  await mkdir(path.dirname(dataFormatPath), { recursive: true });
  await mkdir(path.join(workspacePath, 'visible'), { recursive: true });
  await mkdir(path.join(workspacePath, 'ignored'), { recursive: true });
  await writeFile(path.join(workspacePath, '.gitignore'), 'ignored/\n', 'utf8');
  await writeFile(dataFormatPath, '# DF1 Example\n', 'utf8');
  await writeFile(path.join(workspacePath, 'visible', 'example.test.js'), '// mentions DF1\n', 'utf8');
  await writeFile(path.join(workspacePath, 'ignored', 'example.test.js'), '// mentions DF999\n', 'utf8');

  await assert.doesNotReject(() => validate({ file: 'development/DF1 Example.md' }, {
    artifactPath: dataFormatPath,
    rootDirectory: workspacePath,
  }));
});