import { createRuleValidationContext }
  from 'asljs-part';
import { createTestLoggerProvider }
  from 'asljs-testing';
import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { validate }
  from './article-rl1.js';

const loggerProvider =
  createTestLoggerProvider();

test.after(
  async () =>
  {
    await loggerProvider.dispose();
  });

const tmpDir =
  (): TmpDir =>
  new TmpDir(
    loggerProvider.getLogger('TmpDir'));

const lineEndings =
  [ '\n',
    '\r\n' ];

const prefixes =
  [ '',
    '\uFEFF' ];

for (const prefix of prefixes) {
  const prefixDescription =
    prefix === ''
    ? 'no BOM'
    : 'BOM';

  for (const lineEnding of lineEndings) {
    const lineEndingDescription =
      lineEnding === '\n'
      ? 'LF'
      : 'CRLF';

    test(
      'Article_RL1: article starts with Heading1, heading matches '
        + `the file name (${prefixDescription}, ${lineEndingDescription})`,
      async () =>
      {
        await using workspace =
          tmpDir();

        const articleLines =
          [ `${prefix}# Article`,
            '',
            'Body.',
            '',
            '## Location',
            '',
            '- Pattern: `/*.md`',
            '',
            '## Rules',
            '',
            '- RL1 - RL1',
            '' ];

        await workspace.writeText(
          'Article.md',
          articleLines.join(lineEnding));

        const article1Lines =
          [ `${prefix}# Article1`,
            '',
            'Body.',
            '' ];

        await workspace.writeText(
          'Article1.md',
          article1Lines.join(lineEnding));

        const context =
          createRuleValidationContext(
            loggerProvider,
            workspace.path,
            [ workspace.path ]);

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
  }
}

test(
  'Article_RL1: fails when the article does not start with Heading1',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'Article.md',
      '# Article\n\nBody.\n\n## Location\n\n- Pattern: `/*.md`\n\n## Rules\n\n- RL1 - RL1\n');

    await workspace.writeText(
      'Article1.md',
      'Intro\n# Article1\n');

    const context =
      createRuleValidationContext(
        loggerProvider,
        workspace.path,
        [ workspace.path ]);

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
      /Article must start with a level 1 heading\./);
  });

test(
  'Article_RL1: fails when the top-level heading is not a file name',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'Article.md',
      '# Article\n\nBody.\n\n## Location\n\n- Pattern: `/*.md`\n\n## Rules\n\n- RL1 - RL1\n');

    await workspace.writeText(
      'Article1.md',
      '# Different\n\nBody.\n');

    const context =
      createRuleValidationContext(
        loggerProvider,
        workspace.path,
        [ workspace.path ]);

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
      });
  });
