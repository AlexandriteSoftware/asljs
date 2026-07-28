import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import test
  from 'node:test';
import { createEnvironment }
  from './environment.js';
import { format }
  from './format.js';

test(
  'format rewrites TypeScript files with the registered formatters',
  async () =>
  {
    await using workspace =
      new TmpDir();

    const sourcePath =
      await workspace.writeText(
        'sample.ts',
        "import type { writeFile } from'import-type';");

    const environment =
      createEnvironment(
        { cwd: workspace.path });

    await format(
      environment,
      '**/*.ts');

    const formatted =
      await fs.readFile(
        sourcePath,
        'utf8');

    assert.strictEqual(
      formatted,
      'import { type writeFile }\n' + "  from 'import-type';\n");
  });
