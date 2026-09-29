import assert
  from 'node:assert/strict';
import { spawnSync }
  from 'node:child_process';
import fs
  from 'node:fs/promises';
import { createRequire }
  from 'node:module';
import os
  from 'node:os';
import path
  from 'node:path';
import test
  from 'node:test';
import { fileURLToPath }
  from 'node:url';

const TEST_SUITE = 'readme-examples';

const PACKAGE_DIR =
  path.dirname(
    path.dirname(
      fileURLToPath(
        import.meta.url)));

const README_FILE_PATH =
  path.join(
    PACKAGE_DIR,
    'README.md');

/**
 * The examples import the package by name, which does not resolve from a
 * temporary directory, so the specifier is pointed at the built declarations
 * instead. That is the surface a reader of the README would be compiling
 * against.
 */
const PACKAGE_ENTRY =
  path.join(
    PACKAGE_DIR,
    'dist',
    'index.js').replaceAll(
      '\\',
      '/');

interface Example
{
  index: number;
  source: string;
  expectedError: string | null;
}

async function readExamples(
  ): Promise<Example[]>
{
  const markdown =
    await fs.readFile(
      README_FILE_PATH,
      'utf8');

  return [ ...markdown.matchAll(
    /```ts\r?\n([\s\S]*?)```/g) ]
    .map(
      (
          match,
          index
        ) =>
      {
        const source =
          match[1].replaceAll(
            "'asljs-eventful'",
            `'${PACKAGE_ENTRY}'`);

        // An example that documents a compiler error says so in a comment, and
        // is expected to produce exactly that error.
        const expectedError =
          /\/\/\s*error (TS\d+)/.exec(source)?.[1]
          ?? null;

        return { index,
                 source,
                 expectedError };
      });
}

function typecheck(
    filePaths: string[]
  ): string
{
  const require =
    createRequire(
      import.meta.url);

  const result =
    spawnSync(
      process.execPath,
      [ require.resolve(
        'typescript/bin/tsc'),
        '--noEmit',
        '--ignoreConfig',
        '--strict',
        '--skipLibCheck',
        '--target',
        'esnext',
        '--module',
        'nodenext',
        '--moduleResolution',
        'nodenext',
        ...filePaths ],
      { encoding: 'utf8' });

  return `${result.stdout ?? ''}${result.stderr ?? ''}`;
}

test(
  `${TEST_SUITE}: every TypeScript example in the README compiles`,
  async (): Promise<void> =>
  {
    const examples =
      await readExamples();

    assert.ok(
      examples.length >= 5,
      'the README should carry TypeScript examples');

    const directory =
      await fs.mkdtemp(
        path.join(
          os.tmpdir(),
          'eventful-readme-'));

    try {
      const written: Array<{ example: Example; filePath: string; }> = [ ];

      for (const example of examples) {
        const filePath =
          path.join(
            directory,
            `example-${example.index}.ts`);

        await fs.writeFile(
          filePath,
          example.source,
          'utf8');

        written.push(
          { example,
            filePath });
      }

      const compiling =
        written.filter(
          item => item.example.expectedError === null);

      assert.ok(
        compiling.length > 0);

      const output =
        typecheck(
          compiling.map(
            item => item.filePath));

      assert.equal(
        output.trim(),
        '',
        'README examples should compile against the built package');

      for (const item of written) {
        if (
          item.example.expectedError
          === null
        ) {
          continue;
        }

        const failure =
          typecheck(
            [ item.filePath ]);

        assert.match(
          failure,
          new RegExp(
            item.example.expectedError),
          `example ${item.example.index} should report ${item.example.expectedError}`);
      }
    } finally {
      await fs.rm(
        directory,
        { recursive: true,
          force: true });
    }
  });
