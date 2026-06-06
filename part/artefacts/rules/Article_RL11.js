import path from 'node:path';
import { readFile } from 'node:fs/promises';

import { listFiles } from './_listFiles.js';

const ARTICLE_PATTERN = '*.md';
const ARTICLE_EXCLUDE = ['README.md'];

export async function validate(artefact, context)
{
  const articlePaths = await listFiles(context.rootDirectory, {
    pattern: ARTICLE_PATTERN,
    exclude: ARTICLE_EXCLUDE,
    gitIgnore: true,
  });
  const artifactPath = path.resolve(context.artifactPath);

  if (!articlePaths.some((filePath) => path.resolve(filePath) === artifactPath)) {
    return;
  }

  const content = await readFile(artifactPath, 'utf8');
  const headingMatch = content.match(/^#\s+(.+)$/m);

  if (!headingMatch) {
    throw new Error('Article must have a level 1 heading.');
  }

  const expectedHeading = path.basename(artifactPath, path.extname(artifactPath));
  const actualHeading = headingMatch[1].trim();

  if (actualHeading !== expectedHeading) {
    throw new Error(`Article heading must be "${expectedHeading}".`);
  }
}