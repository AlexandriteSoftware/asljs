import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import test
  from 'node:test';
import { runCli }
  from './cli.js';
import { createEnvironment }
  from './environment.js';

test(
  'runCli formats files matched by a glob argument',
  async () =>
  {
    await using workspace =
      new TmpDir();

    const sourcePath =
      await workspace.writeText(
        'src/sample.ts',
        "import{readFile}from'node:fs/promises';");

    const environment =
      createEnvironment(
        { cwd: workspace.path });

    const exitCode =
      await runCli(
        ['src/**/*.ts'],
        environment);

    const formatted =
      await fs.readFile(
        sourcePath,
        'utf8');

    assert.strictEqual(
      exitCode,
      0
    );

    assert.strictEqual(
      formatted,
      'import { readFile }\n' + "  from 'node:fs/promises';\n"
    );
  }
);
