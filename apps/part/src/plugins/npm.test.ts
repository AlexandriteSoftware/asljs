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
        [ pluginPath ]);

    const dependencyDefinition =
      await providers.artefactDefinitionProvider
      .getDefinition(
        'NPM Dependency');

    const artefacts =
      await providers.artefactProvider.getArtefacts(
        [ dependencyDefinition ]);

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
      [ 'NPM Dependency' ]);

    assert.deepEqual(
      await providers.artefactDataProvider.tryGetArtefactData(
        artefacts[1],
        'NPM Dependency'),
      { Package: 'lib',
        Range: '~1.2.0',
        Kind: 'devDependencies',
        Manifest:
          'apps/app/package.json' });

    const definition =
      dependencyDefinition;

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

test(
  'npm plugin locates package.json files and lists their project dependencies',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'package.json',
      JSON.stringify(
        { private: true,
          workspaces:
            [ './apps/*',
              'libs/*',
              '!apps/dev' ],
          dependencies:
            { lib: '^1.0.0' } }));

    await workspace.writeText(
      'libs/lib/package.json',
      JSON.stringify(
        { name: 'lib',
          version: '1.0.0' }));

    await workspace.writeText(
      'apps/app/package.json',
      JSON.stringify(
        { name: 'app',
          version: '0.1.0',
          dependencies:
            { lib: '^1.0.0',
              ext: '^2.0.0' },
          devDependencies:
            { dev: '^1.0.0',
              ext: '^2.0.0' } }));

    await workspace.writeText(
      'apps/dev/package.json',
      JSON.stringify(
        { name: 'dev' }));

    await workspace.writeText(
      'node_modules/dep/package.json',
      JSON.stringify(
        { name: 'dep' }));

    await workspace.writeText(
      '.gitignore',
      'ignored/\n');

    await workspace.writeText(
      'ignored/package.json',
      JSON.stringify(
        { name: 'ignored' }));

    const providers =
      providersFactory(
        loggerProvider,
        workspace.path,
        [ pluginPath ]);

    const definition =
      await providers.artefactDefinitionProvider.getDefinition(
        'NPM Package');

    const artefacts =
      await providers.artefactProvider.getArtefacts(
        [ definition ]);

    assert.deepEqual(
      artefacts.map(
        artefact => [ artefact.location,
                      artefact.name ]),
      [ [ 'file:apps/app/package.json',
          'app' ],
        [ 'file:apps/dev/package.json',
          'dev' ],
        [ 'file:libs/lib/package.json',
          'lib' ],
        [ 'file:package.json',
          'package.json' ] ]);

    const data = [ ];

    for (const artefact of artefacts) {
      data.push(
        await providers.artefactDataProvider.tryGetArtefactData(
          artefact,
          'NPM Package'));
    }

    assert.deepEqual(
      data,
      [ { Name: 'app',
          Version: '0.1.0',
          Private: false,
          Dependencies:
            [ 'file:libs/lib/package.json' ],
          DevDependencies:
            [ 'file:apps/dev/package.json' ],
          Workspaces: [ ] },
        { Name: 'dev',
          Version: null,
          Private: false,
          Dependencies: [ ],
          DevDependencies: [ ],
          Workspaces: [ ] },
        { Name: 'lib',
          Version: '1.0.0',
          Private: false,
          Dependencies: [ ],
          DevDependencies: [ ],
          Workspaces: [ ] },
        { Name: null,
          Version: null,
          Private: true,
          Dependencies:
            [ 'file:libs/lib/package.json' ],
          DevDependencies: [ ],
          Workspaces:
            [ 'file:apps/app/package.json',
              'file:libs/lib/package.json' ] } ]);
  });
