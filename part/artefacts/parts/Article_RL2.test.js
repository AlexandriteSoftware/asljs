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
  from './Article_RL2.js';

const logger =
  createLogger();

test.after(
  () => logger.dispose());

test(
  'Article_RL2 passes for existing local links and images',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.writeText(
      'Article.md',
      '# Article\n\nBody.\n\n## Location\n\n- Pattern: `/*.md`\n\n## Rules\n\n- RL2 - RL2\n');

    workspace.writeText(
      'Target.md',
      '# Target\n');

    workspace.writeText(
      'image.png',
      '');

    workspace.writeText(
      'Article1.md',
      `# Article1

See [Target](./Target.md).

![Image](./image.png)
`);

    const context =
      createRuleValidationContext(
        logger,
        workspace.path);

    const artefact =
      await context.artefacts.tryGetArtefact(
        'Article1.md');

    if (!artefact) {
      throw new Error(
        'Failed to load artefact for test.');
    }

    await assert.doesNotReject(
      () =>
        validate(
          artefact,
          context));
  });

test(
  'Article_RL2 fails when a local link does not exist',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.writeText(
      'Article.md',
      '# Article\n\nBody.\n\n## Location\n\n- Pattern: `/*.md`\n\n## Rules\n\n- RL2 - RL2\n');

    workspace.writeText(
      'Article1.md',
      `# Article1

See [Missing](./Missing.md).
`);

    const context =
      createRuleValidationContext(
        logger,
        workspace.path);

    const artefact =
      await context.artefacts.tryGetArtefact(
        'Article1.md');

    if (!artefact) {
      throw new Error(
        'Failed to load artefact for test.');
    }

    await assert.rejects(
      () =>
        validate(
          artefact,
          context),
      /points to a non-existent location/,
    );
  });

test(
  'Article_RL2 fails when a local image does not exist',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.writeText(
      'Article.md',
      '# Article\n\nBody.\n\n## Location\n\n- Pattern: `/*.md`\n\n## Rules\n\n- RL2 - RL2\n');

    workspace.writeText(
      'Article1.md',
      `# Article1

![Missing](./Missing.png)
`);

    const context =
      createRuleValidationContext(
        logger,
        workspace.path);

    const artefact =
      await context.artefacts.tryGetArtefact(
        'Article1.md');

    if (!artefact) {
      throw new Error(
        'Failed to load artefact for test.');
    }

    await assert.rejects(
      () =>
        validate(
          artefact,
          context),
      /points to a non-existent location/,
    );
  });

test(
  'Article_RL2 fails when a long inline link is used',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.writeText(
      'Article.md',
      '# Article\n\nBody.\n\n## Location\n\n- Pattern: `/*.md`\n\n## Rules\n\n- RL2 - RL2\n');

    workspace.writeText(
      'very-long-file-name-that-exceeds-twenty-characters.md',
      '# Target\n');

    workspace.writeText(
      'Article1.md',
      `# Article1

[Target](./very-long-file-name-that-exceeds-twenty-characters.md)
`);

    const context =
      createRuleValidationContext(
        logger,
        workspace.path);

    const artefact =
      await context.artefacts.tryGetArtefact(
        'Article1.md');

    if (!artefact) {
      throw new Error(
        'Failed to load artefact for test.');
    }

    await assert.rejects(
      () =>
        validate(
          artefact,
          context),
      /must use a reference link/,
    );
  });

test(
  'Article_RL2 allows a long reference link',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.writeText(
      'Article.md',
      '# Article\n\nBody.\n\n## Location\n\n- Pattern: `/*.md`\n\n## Rules\n\n- RL2 - RL2\n');

    workspace.writeText(
      'very-long-file-name-that-exceeds-twenty-characters.md',
      '# Target\n');

    workspace.writeText(
      'Article1.md',
      `# Article1

[Target][target]

[target]: ./very-long-file-name-that-exceeds-twenty-characters.md
`);

    const context =
      createRuleValidationContext(
        logger,
        workspace.path);

    const artefact =
      await context.artefacts.tryGetArtefact(
        'Article1.md');

    if (!artefact) {
      throw new Error(
        'Failed to load artefact for test.');
    }

    await assert.doesNotReject(
      () =>
        validate(
          artefact,
          context));
  });

test(
  'Article_RL2 resolves root-relative links from projectDirectoryPath',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.writeText(
      'Article.md',
      '# Article\n\nBody.\n\n## Location\n\n- Pattern: `/*.md`\n\n## Rules\n\n- RL2 - RL2\n');

    workspace.writeText(
      'docs/Target.md',
      '# Target\n');

    workspace.writeText(
      'Article1.md',
      `# Article1

[Target](/docs/Target.md)
`);

    const context =
      createRuleValidationContext(
        logger,
        workspace.path);

    const artefact =
      await context.artefacts.tryGetArtefact(
        'Article1.md');

    if (!artefact) {
      throw new Error(
        'Failed to load artefact for test.');
    }

    await assert.doesNotReject(
      () =>
        validate(
          artefact,
          context));
  });