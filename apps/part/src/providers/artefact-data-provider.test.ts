import { createTestLoggerProvider }
  from 'asljs-testing';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { tmpDirFactory }
  from '../testing/tmpDir.js';
import { providersFactory }
  from './providers.js';

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
  'RQ207: ArtefactDataProvider returns plugin data, or null without a data function or on failure',
  async () =>
  {
    await using workspace =
      tmpDir();

    for (const name of [ 'Article',
                         'Note',
                         'Broken' ]) {
      await workspace.writeText(
        `definitions/${name}.md`,
        `# ${name}\n\n${name}.\n\n## Location\n\n- Pattern: ../docs/*.md\n`);
    }

    await workspace.writeText(
      'plugin.js',
      `import { readFile } from 'node:fs/promises';

export default () => ({
  name: 'test',
  data: {
    Article: async (artefact, context) => ({
      Text: await readFile(context.files.path(artefact), 'utf8')
    }),
    Broken: async () => { throw new Error('Boom.'); }
  }
});
`);

    await workspace.writeText(
      'docs/A.md',
      '# A\n');

    const { artefactDataProvider, artefactProvider } =
      providersFactory(
        loggerProvider,
        workspace.path,
        [ workspace.resolve('definitions'),
          workspace.resolve('plugin.js') ]);

    const artefact =
      await artefactProvider.tryGetArtefact(
        'docs/A.md');

    assert.ok(artefact);

    assert.deepEqual(
      await artefactDataProvider.tryGetArtefactData(
        artefact,
        'Article'),
      { Text: '# A\n' });

    assert.equal(
      await artefactDataProvider.tryGetArtefactData(
        artefact,
        'Note'),
      null);

    assert.equal(
      await artefactDataProvider.tryGetArtefactData(
        artefact,
        'Broken'),
      null);
  });
