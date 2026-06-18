import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { TmpDir }
  from '../../src/tmp-dir.js';
import { createLogger }
  from '../../src/logging.js';
import { createRuleValidationContext }
  from '../../src/rule-validation-function.js';
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
      '# Article\n\nBody.\n\n## Location\n\n- Pattern: `/*.md`\n\n## Rules\n\n- RL10 - RL10\n');

    workspace.writeText(
      'Article1.md',
      '# Article1\n\nBody.\n');

    const context =
      createRuleValidationContext(
        logger,
        workspace.path);

    const artefact =
      await context.artefacts.tryGetArtefact('Article1.md');

    if (!artefact) {
      throw new Error(
        'Failed to load artefact for test.');
    }

    await assert.doesNotReject(
      async () =>
        await validate(
          artefact,
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
      '# Article\n\nBody.\n\n## Location\n\n- Pattern: `/*.md`\n\n## Rules\n\n- RL10 - RL10\n');

    workspace.writeText(
      'Article1.md',
      'Intro\n# Article1\n');

    const context =
      createRuleValidationContext(
        logger,
        workspace.path);

    const artefact =
      await context.artefacts.tryGetArtefact('Article1.md');

    if (!artefact) {
      throw new Error(
        'Failed to load artefact for test.');
    }

    await assert.rejects(
      async () =>
        {
          await validate(
            artefact,
            context);
        },
      /Article must start with a level 1 heading\./,
    );
  });

test(
  'Article_RL10 fails when the top-level heading differs from the file name',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.writeText(
      'Article.md',
      '# Article\n\nBody.\n\n## Location\n\n- Pattern: `/*.md`\n\n## Rules\n\n- RL10 - RL10\n');

    workspace.writeText(
      'Article1.md',
      '# Different\n\nBody.\n');

    const context =
      createRuleValidationContext(
        logger,
        workspace.path);

    const artefact =
      await context.artefacts.tryGetArtefact('Article1.md');

    if (!artefact) {
      throw new Error(
        'Failed to load artefact for test.');
    }

    await assert.rejects(
      async () => {
        await validate(
          artefact,
          context);
      });
  });  