import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import path
  from 'node:path';
import { TmpDir }
  from '../../src/TmpDir.js';
import { createLogger }
  from '../../src/logging.js';
import { ArtefactProvider }
  from '../../src/providers/artefactProvider.js';
import { validate }
  from './Article_RL11.js';

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
  'Article_RL11 passes when the top-level heading matches the file name',
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
      '# Article\n\nBody.\n');

    await assert.doesNotReject(
      () => validate(
        { path: workspace.resolve('Article.md') },
        {
          artefacts,
          definition: ARTICLE_DEFINITION,
          rootDirectory: workspace.path,
          logger: createLogger()
        }));
  });

test(
  'Article_RL11 fails when the top-level heading differs from the file name',
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
      '# Different\n\nBody.\n');

    await assert.rejects(
      () =>
        validate(
          { path: workspace.resolve('Article.md') },
          {
            artefacts,
            definition: ARTICLE_DEFINITION,
            rootDirectory: workspace.path,
            logger: createLogger()
          }),
      /Article heading must be "Article"\./,
    );
  });