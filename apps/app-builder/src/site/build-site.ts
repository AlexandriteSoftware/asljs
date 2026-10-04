/**
 * Builds the static site from the repository's markdown files into `dist`.
 *
 * The landing page is the root `README.md`. Every markdown file it reaches
 * through relative links becomes a page of its own. See `README.md` of this
 * package.
 */

import fs
  from 'node:fs';
import path
  from 'node:path';
import { renderSite,
         STYLESHEET_PATH }
  from './site.js';

const REPOSITORY_URL =
  'https://github.com/AlexandriteSoftware/asljs';

const BRANCH = 'main';
const ENTRY = 'README.md';

const packageDir =
  path.resolve(
    import.meta.dirname,
    '../..');

const outputDir =
  path.join(
    packageDir,
    'dist');

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
  renderSite(
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

// Emptied rather than removed: Windows refuses to remove a directory a process
// is running in, such as a static server previewing the site.
fs.mkdirSync(
  outputDir,
  { recursive: true });

for (const entry of fs.readdirSync(outputDir)) {
  fs.rmSync(
    path.join(
      outputDir,
      entry),
    { recursive: true,
      force: true });
}

for (const page of pages) {
  const target =
    path.join(
      outputDir,
      page.outputPath);

  fs.mkdirSync(
    path.dirname(target),
    { recursive: true });

  fs.writeFileSync(
    target,
    page.html,
    'utf8');
}

fs.copyFileSync(
  path.join(
    import.meta.dirname,
    'site.css'),
  path.join(
    outputDir,
    STYLESHEET_PATH));

// GitHub Pages would otherwise run Jekyll over the output.
fs.writeFileSync(
  path.join(
    outputDir,
    '.nojekyll'),
  '');

console.log(
  `site: ${pages.length} pages from ${ENTRY} -> ${outputDir}`);
