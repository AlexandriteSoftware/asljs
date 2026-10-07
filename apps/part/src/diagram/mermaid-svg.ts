import { spawn }
  from 'node:child_process';
import { existsSync,
         readFileSync }
  from 'node:fs';
import fs
  from 'node:fs/promises';
import { createRequire }
  from 'node:module';
import os
  from 'node:os';
import path
  from 'node:path';

const require =
  createRequire(
    import.meta.url);

/**
 * Renders Mermaid text to SVG with the Mermaid CLI, an optional peer
 * dependency; `PART_MMDC_PATH` replaces its binary.
 */
export async function renderMermaidToSvg(
    mermaidGraph: string
  ): Promise<string>
{
  const tempDirPath =
    await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        'part-mermaid-'));

  const inputPath =
    path.join(
      tempDirPath,
      'diagram.mmd');

  const outputPath =
    path.join(
      tempDirPath,
      'diagram.svg');

  await fs.writeFile(
    inputPath,
    mermaidGraph,
    'utf8');

  try {
    await runMermaidCli(
      inputPath,
      outputPath);

    return await fs.readFile(
      outputPath,
      'utf8');
  } finally {
    await fs.rm(
      tempDirPath,
      { recursive: true,
        force: true });
  }
}

async function runMermaidCli(
    inputPath: string,
    outputPath: string
  ): Promise<void>
{
  const mmdcPath =
    resolveMermaidCliPath();

  const args =
    [ '-i',
      inputPath,
      '-o',
      outputPath,
      '-q' ];

  const command = process.execPath;

  const commandArgs =
    [ mmdcPath,
      ...args ];

  await new Promise<void>(
    (
        resolve,
        reject
      ) =>
    {
      const child =
        spawn(
          command,
          commandArgs,
          { stdio:
              [ 'ignore',
                'pipe',
                'pipe' ] });

      let stderr = '';

      child.stderr.on(
        'data',
        (
            chunk
          ) =>
        {
          stderr += String(chunk);
        });

      child.on(
        'error',
        (
            error
          ) =>
        {
          reject(
            new Error(
              `Failed to run mermaid CLI (mmdc): ${error}`));
        });

      child.on(
        'close',
        (
            code
          ) =>
        {
          if (code === 0) {
            resolve();
            return;
          }

          const details =
            stderr.trim();

          reject(
            new Error(
              details === ''
                ? `Mermaid CLI failed with exit code ${code}.`
                : `Mermaid CLI failed with exit code ${code}: ${details}`));
        });
    }
  );
}

function resolveMermaidCliPath(
  ): string
{
  const override =
    process.env.PART_MMDC_PATH?.trim();

  if (override) {
    return path.resolve(
      override);
  }

  let packageEntryPath: string;

  try {
    packageEntryPath =
      require.resolve(
        '@mermaid-js/mermaid-cli');
  } catch {
    throw new Error(
      'Rendering SVG needs the Mermaid CLI: npm install @mermaid-js/mermaid-cli');
  }

  const packageRoot =
    findPackageRoot(
      packageEntryPath);

  const packageJsonPath =
    path.join(
      packageRoot,
      'package.json');

  const packageJson =
    JSON.parse(
      readFileSync(
        packageJsonPath,
        'utf8')) as { bin?: string | Record<string, string>; };

  const binField = packageJson.bin;

  if (
    typeof binField
    === 'string'
  ) {
    return path.resolve(
      packageRoot,
      binField);
  }

  const mmdcRelativePath = binField?.mmdc;

  if (
    typeof mmdcRelativePath
    !== 'string'
    || mmdcRelativePath.trim() === ''
  ) {
    throw new Error(
      'Cannot resolve Mermaid CLI binary path from @mermaid-js/mermaid-cli package metadata.');
  }

  return path.resolve(
    packageRoot,
    mmdcRelativePath);
}

function findPackageRoot(
    entryPath: string
  ): string
{
  let currentPath =
    path.dirname(
      entryPath);

  while (true) {
    const packageJsonPath =
      path.join(
        currentPath,
        'package.json');

    if (existsSync(packageJsonPath)) {
      return currentPath;
    }

    const parentPath =
      path.dirname(
        currentPath);

    if (parentPath === currentPath) {
      throw new Error(
        `Cannot locate package root from path: ${entryPath}`);
    }

    currentPath = parentPath;
  }
}
