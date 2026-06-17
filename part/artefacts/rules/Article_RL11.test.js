import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { TmpDir }
  from '../../src/tmp-dir.js';
import { createLogger }
  from '../../src/logging.js';
import { validate }
  from './Article_RL11.js';

const logger =
  createLogger(
    { level: 'trace',
      enabled: false });

test(
  'Article_RL11 passes when the top-level heading matches the file name',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.writeText(
      'Article.md',
      '# Article\n\nBody.\n');

    await assert.doesNotReject(
      async () => {
        /** @type any */
        const context =
          { logger };

        await validate(
          { path: workspace.resolve('Article.md') },
          context);
      });
  });

test(
  'Article_RL11 fails when the top-level heading differs from the file name',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.writeText(
      'Article.md',
      '# Different\n\nBody.\n');

    await assert.rejects(
      async () => {
        /** @type any */
        const context =
          { logger };

        await validate(
          { path: workspace.resolve('Article.md') },
          context);
      },
      /Article heading must be "Article"\./,
    );
  });