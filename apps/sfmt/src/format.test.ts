import { createTestLoggerProvider }
  from 'asljs-testing';
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
import { applyFormatters,
         format }
  from './format.js';
import tsImportDeclarationFormatterFactory
  from './ts-style-rules/import-declaration.js';

const loggerProvider =
  createTestLoggerProvider();

test.after(
  async () => await loggerProvider.dispose());

const logger =
  loggerProvider.getLogger('format');

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

test(
  'format formats the files of every pattern it is given',
  async () =>
  {
    await using workspace =
      new TmpDir();

    const firstPath =
      await workspace.writeText(
        'first.ts',
        "import type { writeFile } from'import-type';");

    const secondPath =
      await workspace.writeText(
        'second.ts',
        "import type { writeFile } from'import-type';");

    const environment =
      createEnvironment(
        { cwd: workspace.path });

    await format(
      environment,
      'first.ts',
      'second.ts');

    for (const sourcePath of [ firstPath,
                               secondPath ]) {
      assert.strictEqual(
        await fs.readFile(
          sourcePath,
          'utf8'),
        'import { type writeFile }\n' + "  from 'import-type';\n");
    }
  });

test(
  'applyFormatters applies a single TypeScript formatter independently',
  async () =>
  {
    const code =
      "import type { writeFile } from'import-type';\n";

    const formatted =
      await applyFormatters(
        code,
        'example.ts',
        [ tsImportDeclarationFormatterFactory(
          logger) ]);

    assert.strictEqual(
      formatted,
      'import { type writeFile }\n' + "  from 'import-type';\n");
  });

test(
  'applyFormatters converges for object expression with arrow function value',
  async () =>
  {
    const code =
      [ 'const value =',
        '  { outputError:',
        '      () =>',
        '    {} };',
        '' ]
      .join('\n');

    const formatted =
      await applyFormatters(
        code,
        'example.ts',
        [ tsImportDeclarationFormatterFactory(
          logger) ]);

    assert.strictEqual(
      formatted,
      [ 'const value =',
        '  { outputError: () => { } };',
        '' ]
        .join('\n'));
  });
