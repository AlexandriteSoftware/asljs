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
  'format rewrites JavaScript files with the registered formatters',
  async () =>
  {
    await using workspace =
      new TmpDir();

    const sourcePath =
      await workspace.writeText(
        'sample.js',
        "import{readFile}from'node:fs/promises';\n"
        + 'function test(param1, param2) {\n'
        + 'const value = "12345678901234567890";\n'
        + 'test(a, b);\n'
        + 'return value;\n'
        + '}');

    const environment =
      createEnvironment(
        { cwd: workspace.path });

    await format(
      environment,
      '**/*.js'
    );

    const formatted =
      await fs.readFile(
        sourcePath,
        'utf8');

    assert.strictEqual(
      formatted,
      'import { readFile }\n'
        + "  from 'node:fs/promises';\n"
        + 'function test(\n'
        + '  param1,\n'
        + '  param2)\n'
        + '{\n'
        + 'const value =\n'
        + '  "12345678901234567890";\n'
        + '\n'
        + 'test(\n'
        + '  a,\n'
        + '  b);\n'
        + '\n'
        + 'return value;\n'
        + '}\n'
    );
  }
);

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
      '**/*.ts'
    );

    const formatted =
      await fs.readFile(
        sourcePath,
        'utf8');

    assert.strictEqual(
      formatted,
      'import { type writeFile }\n' + "  from 'import-type';\n"
    );
  }
);
