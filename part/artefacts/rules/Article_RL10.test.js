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
  from './Article_RL10.js';
import { createLogger }
  from '../../src/logging.js';

const ARTICLE_DEFINITION =
  {
    location: {
      type: 'Files',
      pattern: '*.md',
      exclude: ['README.md'],
      gitIgnore: true,
    },
    propertyDefinitions: new Map(),
    typeId: 'article',
  };

test(
  'Article_RL10 passes when the article starts with a level 1 heading',
  async () =>
{
  const workspacePath =
    await mkdtemp(
      path.join(
        os.tmpdir(),
        'part-article-rl10-'));

  const articlePath =
    path.join(
      workspacePath,
      'Article.md');

  const artefacts =
    new ArtefactProvider(
      createLogger(),
      workspacePath);

  await writeFile(
    articlePath,
    '# Article\n\nBody.\n',
    'utf8');

  await assert.doesNotReject(
    () => validate(
      {},
      {
        artifactPath: articlePath,
        artefacts,
        definition: ARTICLE_DEFINITION,
      }));
});

test(
  'Article_RL10 fails when the article does not start with a level 1 heading',
  async () =>
{
  const workspacePath =
    await mkdtemp(
      path.join(
        os.tmpdir(),
        'part-article-rl10-'));

  const articlePath =
    path.join(
      workspacePath,
      'Article.md');

  const artefacts =
    new ArtefactProvider(
      createLogger(),
      workspacePath);

  await writeFile(
    articlePath,
    'Intro\n# Article\n',
    'utf8');

  await assert.rejects(
    () => validate(
      {},
      {
        artifactPath: articlePath,
        artefacts,
        definition: ARTICLE_DEFINITION,
      }),
    /Article must start with a level 1 heading\./,
  );
});