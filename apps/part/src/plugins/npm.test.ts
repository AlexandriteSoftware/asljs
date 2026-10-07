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
import { RuleRunner }
  from '../rule-runner.js';
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
      './npm.js',
      import.meta.url));

test(
  'RQ208: npm plugin locates dependencies, provides data and checks workspace ranges',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'package.json',
      JSON.stringify(
        { name: 'root',
          dependencies:
            { lib: '^1.2.0',
              ext: '1.0.0',
              zero: '^0.2.0' },
          optionalDependencies:
            { lib: 'file:libs/lib' } }));

    await workspace.writeText(
      'libs/lib/package.json',
      JSON.stringify(
        { name: 'lib',
          version: '1.3.0' }));

    await workspace.writeText(
      'libs/zero/package.json',
      JSON.stringify(
        { name: 'zero',
          version: '0.1.5' }));

    await workspace.writeText(
      'apps/app/package.json',
      JSON.stringify(
        { name: 'app',
          dependencies:
            { zero: '^0.1.0' },
          devDependencies:
            { lib: '~1.2.0' },
          peerDependencies:
            { lib: 'workspace:*' } }));

    await workspace.writeText(
      'node_modules/dep/package.json',
      JSON.stringify(
        { name: 'dep',
          dependencies:
            { lib: '1.0.0' } }));

    await workspace.writeText(
      '.gitignore',
      'ignored/\n');

    await workspace.writeText(
      'ignored/package.json',
      JSON.stringify(
        { name: 'ignored',
          dependencies:
            { lib: '1.0.0' } }));

    const providers =
      providersFactory(
        loggerProvider,
        workspace.path,
        workspace.resolve('definitions'),
        [ pluginPath ]);

    const artefacts =
      await providers.artefactProvider.getArtefacts();

    assert.deepEqual(
      artefacts.map(
        artefact => artefact.location),
      [ 'npm:apps/app/package.json#dependencies/zero',
        'npm:apps/app/package.json#devDependencies/lib',
        'npm:apps/app/package.json#peerDependencies/lib',
        'npm:package.json#dependencies/ext',
        'npm:package.json#dependencies/lib',
        'npm:package.json#dependencies/zero',
        'npm:package.json#optionalDependencies/lib' ]);

    assert.deepEqual(
      artefacts[1].definitions,
      [ 'Npm Dependency' ]);

    assert.deepEqual(
      await providers.artefactDataProvider.tryGetArtefactData(
        artefacts[1],
        'Npm Dependency'),
      { Package: 'lib',
        Range: '~1.2.0',
        Kind: 'devDependencies',
        Manifest:
          'apps/app/package.json' });

    const definition =
      await providers.artefactDefinitionProvider.getDefinition(
        'Npm Dependency');

    assert.equal(
      definition.source,
      'npm');

    const ruleRunner =
      new RuleRunner(
        loggerProvider.getLogger('RuleRunner'),
        providers);

    const results = [ ];

    for (const artefact of artefacts) {
      const [result] =
        await ruleRunner.runRules(
          definition,
          artefact);

      results.push(
        [ artefact.location,
          result.result,
          result.message ]);
    }

    assert.deepEqual(
      results,
      [ [ 'npm:apps/app/package.json#dependencies/zero',
          'Ok',
          '' ],
        [ 'npm:apps/app/package.json#devDependencies/lib',
          'Fail',
          'Range "~1.2.0" does not include lib 1.3.0 from libs/lib/package.json.' ],
        [ 'npm:apps/app/package.json#peerDependencies/lib',
          'Ok',
          '' ],
        [ 'npm:package.json#dependencies/ext',
          'Ok',
          '' ],
        [ 'npm:package.json#dependencies/lib',
          'Ok',
          '' ],
        [ 'npm:package.json#dependencies/zero',
          'Fail',
          'Range "^0.2.0" does not include zero 0.1.5 from libs/zero/package.json.' ],
        [ 'npm:package.json#optionalDependencies/lib',
          'Fail',
          'Range "file:libs/lib" of lib is not supported, or version "1.3.0" in libs/lib/package.json is invalid.' ] ]);
  });
