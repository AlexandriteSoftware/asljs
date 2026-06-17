import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { TmpDir }
  from '../../src/tmp-dir.js';
import { createLogger }
  from '../../src/logging.js';
import { validate }
  from './Article_RL10.js';

const logger =
  createLogger(
    { level: 'trace',
      enabled: false });

test(
  'Article_RL10 passes when the article starts with a level 1 heading',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.writeText(
      'Article.md',
      '# Article\n\nBody.\n');

    /** @type any */
    const context =
      { logger };

    await assert.doesNotReject(
      async () =>
        await validate(
          { path: workspace.resolve('Article.md'),
            name: 'Article' },
          context));
  });

test(
  'Article_RL10 fails when the article does not start with a level 1 heading',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.writeText(
      'Article.md',
      'Intro\n# Article\n');

    await assert.rejects(
      async () =>
        {
          /** @type any */
          const context =
            { logger };

          await validate(
            { path: workspace.resolve('Article.md'),
              name: 'Article' },
            context);
        },
      /Article must start with a level 1 heading\./,
    );
  });