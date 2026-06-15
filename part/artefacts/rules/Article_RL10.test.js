import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import os
  from 'node:os';
import path
  from 'node:path';
import { TmpDir }
  from '../../src/TmpDir.js';
import { ArtefactProvider }
  from '../../src/providers/artefactProvider.js';
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
  async t => {
    const workspace =
      new TmpDir();

    t.after(
      () => workspace.cleanup());

    const artefacts =
      new ArtefactProvider(
        createLogger(),
        workspace.path);

    workspace.writeText(
      'Article.md',
      '# Article\n\nBody.\n',
      'utf8');

    await assert.doesNotReject(
      () =>
        validate(
          { path: workspace.resolve('Article.md') },
          {
            artefacts,
            definition: ARTICLE_DEFINITION,
            rootDirectory: workspace.path
          }));
  });

test(
  'Article_RL10 fails when the article does not start with a level 1 heading',
  async t => {
    const workspace =
      new TmpDir();

    t.after(
      () => workspace.cleanup());

    const artefacts =
      new ArtefactProvider(
        createLogger(),
        workspace.path);

    workspace.writeText(
      'Article.md',
      'Intro\n# Article\n');

    await assert.rejects(
      () =>
        validate(
          { path: workspace.resolve('Article.md') },
          {
            artefacts,
            definition: ARTICLE_DEFINITION,
          }),
      /Article must start with a level 1 heading\./,
    );
  });