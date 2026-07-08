import test,
       { after }
  from 'node:test';
import assert
  from 'node:assert/strict';
import { tmpDirFactory }
  from './testing/tmpDir.js';
import { createPinoLoggerProvider,
         createRuleValidationContext }
  from 'asljs-part';
import { validate }
  from './Article_RL2.js';

const loggerProvider =
  createPinoLoggerProvider();

after(
  () => {
    loggerProvider.dispose();
  });

const tmpDir =
  tmpDirFactory(
    loggerProvider);

test(
  'Article_RL2 passes for existing local links and images',
  async () => {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'Article.md',
      '# Article\n\nBody.\n\n## Location\n\n- Pattern: `/*.md`\n\n## Rules\n\n- RL2 - RL2\n');

    await workspace.writeText(
      'Target.md',
      '# Target\n');

    await workspace.writeText(
      'image.png',
      '');

    await workspace.writeText(
      'Article1.md',
      `# Article1

See [Target](./Target.md).

![Image](./image.png)
`);

    const context =
      createRuleValidationContext(
        loggerProvider,
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
  async () => {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'Article.md',
      '# Article\n\nBody.\n\n## Location\n\n- Pattern: `/*.md`\n\n## Rules\n\n- RL2 - RL2\n');

    await workspace.writeText(
      'Article1.md',
      `# Article1

See [Missing](./Missing.md).
`);

    const context =
      createRuleValidationContext(
        loggerProvider,
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
  async () => {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'Article.md',
      '# Article\n\nBody.\n\n## Location\n\n- Pattern: `/*.md`\n\n## Rules\n\n- RL2 - RL2\n');

    await workspace.writeText(
      'Article1.md',
      `# Article1

![Missing](./Missing.png)
`);

    const context =
      createRuleValidationContext(
        loggerProvider,
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
  async () => {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'Article.md',
      '# Article\n\nBody.\n\n## Location\n\n- Pattern: `/*.md`\n\n## Rules\n\n- RL2 - RL2\n');

    await workspace.writeText(
      'very-long-file-name-that-exceeds-twenty-characters.md',
      '# Target\n');

    await workspace.writeText(
      'Article1.md',
      `# Article1

[Target](./very-long-file-name-that-exceeds-twenty-characters.md)
`);

    const context =
      createRuleValidationContext(
        loggerProvider,
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
  async () => {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'Article.md',
      '# Article\n\nBody.\n\n## Location\n\n- Pattern: `/*.md`\n\n## Rules\n\n- RL2 - RL2\n');

    await workspace.writeText(
      'very-long-file-name-that-exceeds-twenty-characters.md',
      '# Target\n');

    await workspace.writeText(
      'Article1.md',
      `# Article1

[Target][target]

[target]: ./very-long-file-name-that-exceeds-twenty-characters.md
`);

    const context =
      createRuleValidationContext(
        loggerProvider,
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
  async () => {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'Article.md',
      '# Article\n\nBody.\n\n## Location\n\n- Pattern: `/*.md`\n\n## Rules\n\n- RL2 - RL2\n');

    await workspace.writeText(
      'docs/Target.md',
      '# Target\n');

    await workspace.writeText(
      'Article1.md',
      `# Article1

[Target](/docs/Target.md)
`);

    const context =
      createRuleValidationContext(
        loggerProvider,
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