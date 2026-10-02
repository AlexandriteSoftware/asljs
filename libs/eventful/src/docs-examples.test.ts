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
import { fileURLToPath,
         pathToFileURL }
  from 'node:url';

const TEST_SUITE = 'docs-examples';

const PACKAGE_DIR =
  path.dirname(
    path.dirname(
      fileURLToPath(
        import.meta.url)));

const DOCS_DIR =
  path.join(
    PACKAGE_DIR,
    'docs');

const require =
  createRequire(
    import.meta.url);

/**
 * The examples import the package by name, which does not resolve from a
 * temporary directory, so the specifier is pointed at the built output
 * instead. That is the surface a reader compiles and runs against, so `dist`
 * has to be built first -- `npm run all` does that before the tests.
 */
const ENTRIES: ReadonlyArray<[string, string]> =
  [ [ 'asljs-eventful',
      path.join(
        PACKAGE_DIR,
        'dist',
        'index.js') ] ];

type Example = {
  index: number;
  origin: string;
  language: 'js' | 'ts';
  source: string;
  expectedError: string | null;
  expectedOutput: string[] | null;
};

/** `README.md` and every file in `docs`, so no documented example drifts. */
async function markdownFilePaths(
  ): Promise<string[]>
{
  const documents =
    (await fs.readdir(DOCS_DIR))
    .filter(
      name => name.endsWith('.md'))
    .sort()
    .map(
      name =>
        path.join(
          DOCS_DIR,
          name));

  return [ path.join(
    PACKAGE_DIR,
    'README.md'),
           ...documents ];
}

function withResolvedImports(
    source: string,
    asUrl: boolean
  ): string
{
  let resolved = source;

  for (const [specifier, entry] of ENTRIES) {
    const target =
      asUrl
      ? pathToFileURL(entry).href
      : entry.replaceAll(
        '\\',
        '/');

    resolved =
      resolved.replaceAll(
        `'${specifier}'`,
        `'${target}'`);
  }

  return resolved;
}

/**
 * The documented output of a runnable example, as a trailing comment block.
 *
 * ```
 * // Output:
 * // Alice
 * // Bob
 * ```
 */
function readExpectedOutput(
    source: string
  ): string[] | null
{
  const lines =
    source.split(/\r?\n/);

  const start =
    lines.findIndex(
      line => line.trim() === '// Output:');

  if (start < 0) {
    return null;
  }

  const expected: string[] = [ ];

  for (const line of lines.slice(start + 1)) {
    const trimmed =
      line.trim();

    if (trimmed === '') {
      continue;
    }

    if (!trimmed.startsWith('//')) {
      break;
    }

    expected.push(
      trimmed
        .slice(2)
        .replace(
          /^ /,
          ''));
  }

  return expected;
}

async function readExamples(
  ): Promise<Example[]>
{
  const examples: Example[] = [ ];

  for (const filePath of await markdownFilePaths()) {
    const markdown =
      await fs.readFile(
        filePath,
        'utf8');

    const origin =
      path.relative(
        PACKAGE_DIR,
        filePath).replaceAll(
          '\\',
          '/');

    for (
      const match of markdown.matchAll(
        /```(js|ts)\r?\n([\s\S]*?)```/g)
    ) {
      const source = match[2];

      examples.push(
        { index: examples.length,
          origin,
          language:
            match[1] as 'js' | 'ts',
          source,
          expectedError:
            /\/\/\s*error (TS\d+)/.exec(source)?.[1]
            ?? null,
          expectedOutput:
            readExpectedOutput(source) });
    }
  }

  return examples;
}

function typecheck(
    filePaths: string[]
  ): string
{
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

async function writeExamples(
    directory: string,
    examples: readonly Example[],
    extension: string,
    asUrl: boolean
  ): Promise<Array<{ example: Example; filePath: string; }>>
{
  const written: Array<{ example: Example; filePath: string; }> = [ ];

  for (const example of examples) {
    const filePath =
      path.join(
        directory,
        `example-${example.index}.${extension}`);

    await fs.writeFile(
      filePath,
      withResolvedImports(
        example.source,
        asUrl),
      'utf8');

    written.push(
      { example,
        filePath });
  }

  return written;
}

/**
 * Every TypeScript example in `README.md` and `docs` carries a type-level claim,
 * so it has to compile on its own against the published declarations.
 */
test(
  `${TEST_SUITE}: every TypeScript example compiles`,
  async (): Promise<void> =>
  {
    const examples =
      (await readExamples()).filter(
        example => example.language === 'ts');

    assert.ok(
      examples.length >= 8,
      'the documentation should carry TypeScript examples');

    const directory =
      await fs.mkdtemp(
        path.join(
          os.tmpdir(),
          'eventful-docs-'));

    try {
      const written =
        await writeExamples(
          directory,
          examples,
          'ts',
          false);

      const compiling =
        written.filter(
          item => item.example.expectedError === null);

      assert.ok(
        compiling.length > 0);

      assert.equal(
        typecheck(
          compiling.map(
            item => item.filePath)).trim(),
        '',
        'documented examples should compile against the built package');

      for (const item of written) {
        if (
          item.example.expectedError
          === null
        ) {
          continue;
        }

        assert.match(
          typecheck(
            [ item.filePath ]),
          new RegExp(
            item.example.expectedError),
          `${item.example.origin} example ${item.example.index} should report ${item.example.expectedError}`);
      }
    } finally {
      await fs.rm(
        directory,
        { recursive: true,
          force: true });
    }
  });

/**
 * Every JavaScript example is a behavioural claim, so it has to run, and where
 * it documents its output that output has to match. This is what keeps the
 * documentation from drifting away from the code.
 */
test(
  `${TEST_SUITE}: every JavaScript example runs and prints what it says`,
  async (): Promise<void> =>
  {
    const examples =
      (await readExamples()).filter(
        example => example.language === 'js');

    assert.ok(
      examples.length >= 8,
      'the documentation should carry runnable examples');

    const directory =
      await fs.mkdtemp(
        path.join(
          os.tmpdir(),
          'eventful-docs-'));

    try {
      const written =
        await writeExamples(
          directory,
          examples,
          'mjs',
          true);

      const documented =
        written.filter(
          item => item.example.expectedOutput !== null);

      assert.ok(
        documented.length >= 4,
        'runnable examples should document their output');

      for (const { example, filePath } of written) {
        const result =
          spawnSync(
            process.execPath,
            [ filePath ],
            { encoding: 'utf8' });

        assert.equal(
          result.status,
          0,
          `${example.origin} example ${example.index} should run: ${
            result.stderr ?? ''
          }`);

        if (
          example.expectedOutput
          === null
        ) {
          continue;
        }

        assert.deepEqual(
          (result.stdout ?? '')
            .split(/\r?\n/)
            .filter(
              line => line !== ''),
          example.expectedOutput,
          `${example.origin} example ${example.index} should print what it `
            + 'documents');
      }
    } finally {
      await fs.rm(
        directory,
        { recursive: true,
          force: true });
    }
  });
