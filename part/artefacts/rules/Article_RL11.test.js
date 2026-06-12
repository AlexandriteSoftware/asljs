import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import os
  from 'node:os';
import path
  from 'node:path';
import { mkdtemp,
         writeFile }
  from 'node:fs/promises';
import { ArtefactProvider }
  from '../../src/artefactProvider.js';
import { validate }
  from './Article_RL11.js';

const ARTICLE_DEFINITION = {
  location: {
    type: 'Files',
    pattern: '*.md',
    exclude: ['README.md'],
    gitIgnore: true,
  },
  propertyDefinitions: new Map(),
  typeId: 'article',
};

test('Article_RL11 passes when the top-level heading matches the file name', async () =>
{
  const workspacePath = await mkdtemp(path.join(os.tmpdir(), 'part-article-rl11-'));
  const articlePath = path.join(workspacePath, 'Article.md');
  const artefacts = new ArtefactProvider(workspacePath);

  await writeFile(articlePath, '# Article\n\nBody.\n', 'utf8');

  await assert.doesNotReject(() => validate({}, {
    artifactPath: articlePath,
    artefacts,
    definition: ARTICLE_DEFINITION,
  }));
});

test('Article_RL11 fails when the top-level heading differs from the file name', async () =>
{
  const workspacePath = await mkdtemp(path.join(os.tmpdir(), 'part-article-rl11-'));
  const articlePath = path.join(workspacePath, 'Article.md');
  const artefacts = new ArtefactProvider(workspacePath);

  await writeFile(articlePath, '# Different\n\nBody.\n', 'utf8');

  await assert.rejects(
    () => validate({}, {
      artifactPath: articlePath,
      artefacts,
      definition: ARTICLE_DEFINITION,
    }),
    /Article heading must be "Article"\./,
  );
});