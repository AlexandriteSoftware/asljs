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

  if (!/^\ufeff?#\s+\S.*(?:\r?\n|$)/.test(content)) {
    throw new Error('Article must start with a level 1 heading.');
  }
}