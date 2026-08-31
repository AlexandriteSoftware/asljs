import fs
  from 'node:fs/promises';
import path
  from 'node:path';

export type ProjectKind =
  | { kind: 'npm'; }
  | { kind: 'dotnet'; target: string; };

const dotnetTargetExtensions =
  [ '.slnx',
    '.sln',
    '.csproj' ];

export async function detectProjectKind(
    workingDirectory: string
  ): Promise<ProjectKind | null>
{
  if (
    await fileExists(
      path.resolve(
        workingDirectory,
        'package.json'))
  ) {
    return { kind: 'npm' };
  }

  const target =
    await findDotnetTarget(
      workingDirectory);

  return target === null
    ? null
    : { kind: 'dotnet',
        target };
}

/** Turns a thrown command failure into a flat list of non-empty output lines. */
export function toCommandIssues(
    error: unknown
  ): string[]
{
  const message =
    error instanceof Error
      ? error.message
      : String(error);

  return message
    .split(
      '\n')
    .map(
      line =>
        line.trim())
    .filter(
      line =>
        line.length > 0);
}

async function fileExists(
    file: string
  ): Promise<boolean>
{
  try {
    await fs.stat(
      file);

    return true;
  } catch (error) {
    if (
      (error as NodeJS.ErrnoException).code
      !== 'ENOENT'
    ) {
      throw error;
    }

    return false;
  }
}

async function findDotnetTarget(
    workingDirectory: string
  ): Promise<string | null>
{
  const entries =
    await fs.readdir(
      workingDirectory,
      { withFileTypes: true });

  for (const extension of dotnetTargetExtensions) {
    const target =
      entries.find(
        entry =>
        entry.isFile()
        && path.extname(
          entry.name)
            .toLowerCase()
          === extension);

    if (target) {
      return target.name;
    }
  }

  return null;
}
