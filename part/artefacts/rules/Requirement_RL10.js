import path from 'node:path';
import { readFile } from 'node:fs/promises';

import { listFiles } from './_listFiles.js';

export async function validate(artefact, context)
{
  const requirementId = extractArtefactId(artefact.file);

  if (!requirementId) {
    throw new Error('Requirement ID was not found in the artefact file name.');
  }

  const testFiles = await listTestFiles(context.rootDirectory);

  for (const testFilePath of testFiles) {
    const content = await readFile(testFilePath, 'utf8');

    if (content.includes(requirementId)) {
      return;
    }
  }

  throw new Error(`No test file references ${requirementId}.`);
}

async function listTestFiles(rootDirectory)
{
  return listFiles(rootDirectory, {
    pattern: '**/*.test.*',
    gitIgnore: true,
  });
}

function extractArtefactId(filePath)
{
  const baseName =
    path.basename(
      filePath,
      path.extname(filePath));

  const match =
    baseName.match(/^([A-Z]+\d+)\b/);

  const id =
    match
    ? match[1]
    : null;

  return id;
}