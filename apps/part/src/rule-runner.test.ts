import { createTestLoggerProvider }
  from 'asljs-testing';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { providersFactory }
  from './providers/providers.js';
import { RuleRunner }
  from './rule-runner.js';
import { tmpDirFactory }
  from './testing/tmpDir.js';

const loggerProvider =
  createTestLoggerProvider();

test.after(
  async () =>
  {
    await loggerProvider.dispose();
  });

const tmpDir =
  tmpDirFactory(
    loggerProvider);

test(
  'RQ123: RuleRunner runs plugin rules and skips rules without implementation',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'definitions/Article.md',
      `# Article

An article.

## Location

- Pattern: ../docs/*.md

## Rules

### RL1

Passes.

### RL2

Fails with the file path.

### RL3

Not implemented.
`);

    await workspace.writeText(
      'plugin.js',
      `export default () => ({
  name: 'test',
  rules: {
    Article: {
      RL1: async () => {},
      RL2: async (artefact, context) => {
        throw new Error('Line one\\nline two: ' + context.files.path(artefact));
      }
    }
  }
});
`);

    await workspace.writeText(
      'docs/A.md',
      '# A\n');

    const providers =
      providersFactory(
        loggerProvider,
        workspace.path,
        [ workspace.resolve('definitions'),
          workspace.resolve('plugin.js') ]);

    const definition =
      await providers.artefactDefinitionProvider.getDefinition(
        'Article');

    const artefact =
      await providers.artefactProvider.tryGetArtefact(
        'docs/A.md');

    assert.ok(artefact);

    const results =
      await new RuleRunner(
        loggerProvider.getLogger('RuleRunner'),
        providers)
      .runRules(
        definition,
        artefact);

    assert.deepEqual(
      results.map(
        result => [ result.rule.id,
                    result.result,
                    result.message ]),
      [ [ 'RL1',
          'Ok',
          '' ],
        [ 'RL2',
          'Fail',
          `Line one line two: ${workspace.resolve('docs/A.md')}` ],
        [ 'RL3',
          'Skip',
          '' ] ]);
  });
