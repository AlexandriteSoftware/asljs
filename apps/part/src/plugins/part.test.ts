import { createTestLoggerProvider }
  from 'asljs-testing';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { fileURLToPath }
  from 'node:url';
import { providersFactory }
  from '../providers/providers.js';
import { tmpDirFactory }
  from '../testing/tmpDir.js';

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

const pluginPath =
  fileURLToPath(
    new URL(
      './part.js',
      import.meta.url));

test(
  'RQ210: the package plugin provides every built-in definition and its implementations',
  async () =>
  {
    await using workspace =
      tmpDir();

    const providers =
      providersFactory(
        loggerProvider,
        workspace.path,
        [ pluginPath ]);

    const definitions =
      await providers.artefactDefinitionProvider
      .getDefinitions();

    assert.deepEqual(
      definitions.map(
        definition => [ definition.name,
                        definition.source ]),
      [ [ 'Artefact Definition',
          'asljs-part' ],
        [ 'Git Tag',
          'asljs-part' ],
        [ 'NPM Dependency',
          'asljs-part' ] ]);

    for (const name of [ 'Git Tag',
                         'NPM Dependency' ]) {
      assert.ok(
        await providers.definitionSourceProvider.findLocator(name));

      assert.ok(
        await providers.definitionSourceProvider.findRule(
          name,
          'RL1'));
    }

    assert.deepEqual(
      await providers.artefactProvider.getArtefacts(),
      [ ]);
  });
