import { type Artefact,
         createRuleValidationContext,
         type RuleValidationContext }
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
  from './article-rl3.js';

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

const ARTICLE_DEFINITION =
  `# Article

Markdown article.

## Location

- Pattern: \`/*.md\`

## Rules

### RL3

Formatted with dprint.
`;

async function makeArtefact(
    workspace: TmpDir,
    fileName: string,
    content: string
  ): Promise<{ artefact: Artefact; context: RuleValidationContext; }>
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
      [ workspace.path ]);

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

    const { artefact, context } =
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

    const { artefact, context } =
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

    const { artefact, context } =
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

    const { artefact, context } =
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
