import test,
       { after }
  from 'node:test';
import assert
  from 'node:assert/strict';
import { createPinoLoggerProvider,
         createRuleValidationContext }
  from 'asljs-part';
import { tmpDirFactory }
  from './testing/tmpDir.js';
import { validate }
  from './Article_RL3.js';

const loggerProvider =
  createPinoLoggerProvider();

after(
  () =>
  {
    loggerProvider.dispose();
  });

const tmpDir =
  tmpDirFactory(
    loggerProvider);

const ARTICLE_DEFINITION =
  '# Article\n\nMarkdown article.\n\n## Location\n\n- Pattern: `/*.md`\n\n## Rules\n\n### RL3\n\nFormatted with dprint.\n';

async function makeArtefact(
  workspace,
  fileName,
  content)
{
  await workspace.writeText(
    'Article.md',
    ARTICLE_DEFINITION);

  await workspace.writeText(
    fileName,
    content);

  const context =
    createRuleValidationContext(
      loggerProvider,
      workspace.path,
      workspace.path);

  const artefact =
    await context.artefacts.tryGetArtefact(
      fileName);

  if (!artefact) {
    throw new Error(
      'Failed to load artefact for test.');
  }

  return { artefact,
           context };
}

test(
  'Article_RL3: passes for properly formatted content',
  async () =>
  {
    await using workspace =
      tmpDir();

    const content =
      '# Article1\n\nShort paragraph.\n';

    const { artefact,
            context } =
      await makeArtefact(
        workspace,
        'Article1.md',
        content);

    await assert.doesNotReject(
      () =>
        validate(
          artefact,
          context));
  });

test(
  'Article_RL3: fails when a paragraph line exceeds 80 characters',
  async () =>
  {
    await using workspace =
      tmpDir();

    // Line is 111 chars, exceeds lineWidth: 80
    const content =
      '# Article1\n\nThis is a very very very very very very very very very very very long paragraph that exceeds eighty characters.\n';

    const { artefact,
            context } =
      await makeArtefact(
        workspace,
        'Article1.md',
        content);

    await assert.rejects(
      () =>
        validate(
          artefact,
          context),
      /not formatted with dprint/);
  });

test(
  'Article_RL3: fails when unordered list uses asterisks instead of dashes',
  async () =>
  {
    await using workspace =
      tmpDir();

    const content =
      '# Article1\n\n* item one\n* item two\n';

    const { artefact,
            context } =
      await makeArtefact(
        workspace,
        'Article1.md',
        content);

    await assert.rejects(
      () =>
        validate(
          artefact,
          context),
      /not formatted with dprint/);
  });

test(
  'Article_RL3: passes for properly formatted list with dashes',
  async () =>
  {
    await using workspace =
      tmpDir();

    const content =
      '# Article1\n\n- item one\n- item two\n';

    const { artefact,
            context } =
      await makeArtefact(
        workspace,
        'Article1.md',
        content);

    await assert.doesNotReject(
      () =>
        validate(
          artefact,
          context));
  });