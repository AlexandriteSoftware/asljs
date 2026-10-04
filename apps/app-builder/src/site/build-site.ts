/**
 * Stages the site's markdown into `build/site`, for MkDocs to build into
 * `dist`.
 *
 * The landing page is the root `README.md`. Every markdown file it reaches
 * through relative links becomes a page of its own, staged at its repository
 * path. See `README.md` of this package.
 */

import fs
  from 'node:fs';
import path
  from 'node:path';
import { stageSite }
  from './site.js';

const REPOSITORY_URL =
  'https://github.com/AlexandriteSoftware/asljs';

const BRANCH = 'main';
const ENTRY = 'README.md';

const packageDir =
  path.resolve(
    import.meta.dirname,
    '../..');

const stagingDir =
  path.join(
    packageDir,
    'build',
    'site');

/** The workspace root: the nearest directory above whose package.json lists workspaces. */
function findRepositoryRoot(
    startDir: string
  ): string
{
  let current =
    path.dirname(startDir);

  while (true) {
    const packageJsonPath =
      path.join(
        current,
        'package.json');

    if (
      fs.existsSync(packageJsonPath)
      && Array.isArray(
        JSON.parse(
          fs.readFileSync(
            packageJsonPath,
            'utf8')).workspaces)
    ) {
      return current;
    }

    const parent =
      path.dirname(current);

    if (parent === current) {
      throw new Error(
        `No workspace root above ${startDir}.`);
    }

    current = parent;
  }
}

const repositoryRoot =
  findRepositoryRoot(packageDir);

const toAbsolute =
  (
  repositoryPath: string
): string =>
  path.join(
    repositoryRoot,
    repositoryPath);

const pages =
  stageSite(
    ENTRY,
    { read:
        repositoryPath =>
      fs.readFileSync(
        toAbsolute(repositoryPath),
        'utf8'),
      isMarkdownFile:
        repositoryPath =>
      fs.statSync(
        toAbsolute(repositoryPath),
        { throwIfNoEntry: false })
        ?.isFile()
        ?? false,
      isDirectory:
        repositoryPath =>
      fs.statSync(
        toAbsolute(repositoryPath),
        { throwIfNoEntry: false })
        ?.isDirectory()
        ?? false,
      repositoryUrl: REPOSITORY_URL,
      branch: BRANCH });

fs.rmSync(
  stagingDir,
  { recursive: true,
    force: true });

for (const page of pages) {
  const target =
    path.join(
      stagingDir,
      page.sourcePath);

  fs.mkdirSync(
    path.dirname(target),
    { recursive: true });

  fs.writeFileSync(
    target,
    page.markdown,
    'utf8');
}

console.log(
  `site: ${pages.length} pages from ${ENTRY} -> ${stagingDir}`);
