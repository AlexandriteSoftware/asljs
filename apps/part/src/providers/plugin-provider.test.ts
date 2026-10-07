import { createTestLoggerProvider }
  from 'asljs-testing';
import { TmpDir }
  from 'asljs-tmpdir';
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

const REQUIREMENT_DEFINITION =
  `# Requirement

A requirement.

## Rules

### RL1

First rule.
`;

async function getDefinitions(
    workspace: TmpDir,
    plugins: string[]
  ): Promise<string[]>
{
  const { artefactDefinitionProvider } =
    providersFactory(
      loggerProvider,
      workspace.path,
      workspace.resolve('definitions'),
      plugins);

  const definitions =
    await artefactDefinitionProvider.getDefinitions();

  return definitions.map(
    definition => `${definition.name} (${definition.source})`);
}

test(
  'RQ207: plugin definitions are merged with document definitions',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'definitions/Requirement.md',
      REQUIREMENT_DEFINITION);

    await workspace.writeText(
      'plugin.js',
      `export default context => ({
  name: 'test',
  definitions: async () => [ {
    name: 'Release',
    description: context.projectPath,
    rules: [ { id: 'RL1', content: 'Release rule.' } ]
  } ]
});
`);

    const { artefactDefinitionProvider } =
      providersFactory(
        loggerProvider,
        workspace.path,
        workspace.resolve('definitions'),
        [ workspace.resolve('plugin.js') ]);

    const definitions =
      await artefactDefinitionProvider.getDefinitions();

    assert.deepEqual(
      definitions.map(
        definition => definition.name),
      [ 'Release',
        'Requirement' ]);

    assert.deepEqual(
      definitions[0],
      { name: 'Release',
        description: workspace.path,
        source: 'test',
        locations: [ ],
        properties: [ ],
        rules:
          [ { id: 'RL1',
              name: 'Release_RL1',
              definition: 'Release',
              heading: 'RL1',
              content: 'Release rule.' } ] });
  });

test(
  'RQ207: a package specifier is resolved from the project root',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'node_modules/test-plugin/package.json',
      JSON.stringify(
        { name: 'test-plugin',
          type: 'module',
          exports: './index.js' }));

    await workspace.writeText(
      'node_modules/test-plugin/index.js',
      `export default () => ({
  name: 'package',
  definitions: async () => [ { name: 'Release', description: 'A release.' } ]
});
`);

    assert.deepEqual(
      await getDefinitions(
        workspace,
        [ 'test-plugin' ]),
      [ 'Release (package)' ]);
  });

test(
  'RQ207: plugin load failures are fatal',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'no-default.js',
      'export const plugin = {};\n');

    await workspace.writeText(
      'throws.js',
      `export default () => { throw new Error('Boom.'); };\n`);

    await workspace.writeText(
      'no-name.js',
      'export default () => ({});\n');

    await assert.rejects(
      getDefinitions(
        workspace,
        [ workspace.resolve('missing.js') ]),
      /Failed to load plugin/);

    await assert.rejects(
      getDefinitions(
        workspace,
        [ workspace.resolve('no-default.js') ]),
      /must export a default factory function/);

    await assert.rejects(
      getDefinitions(
        workspace,
        [ workspace.resolve('throws.js') ]),
      /failed to initialise: Boom\./);

    await assert.rejects(
      getDefinitions(
        workspace,
        [ workspace.resolve('no-name.js') ]),
      /must return an object with a name/);
  });

test(
  'RQ207: bindings to unknown definitions or rule ids are fatal',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'definitions/Requirement.md',
      REQUIREMENT_DEFINITION);

    await workspace.writeText(
      'unknown-definition.js',
      `export default () => ({
  name: 'test',
  locate: { Missing: async () => [] }
});
`);

    await workspace.writeText(
      'unknown-rule.js',
      `export default () => ({
  name: 'test',
  rules: { Requirement: { RL9: async () => {} } }
});
`);

    await assert.rejects(
      getDefinitions(
        workspace,
        [ workspace.resolve(
          'unknown-definition.js') ]),
      /Plugin "test" provides a locator for unknown definition "Missing"\./);

    await assert.rejects(
      getDefinitions(
        workspace,
        [ workspace.resolve('unknown-rule.js') ]),
      /Plugin "test" implements unknown rule "RL9" of definition "Requirement"\./);
  });

test(
  'RQ207: the same binding in two plugins is fatal',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'definitions/Requirement.md',
      REQUIREMENT_DEFINITION);

    await workspace.writeText(
      'first.js',
      `export default () => ({
  name: 'first',
  rules: { Requirement: { RL1: async () => {} } }
});
`);

    await workspace.writeText(
      'second.js',
      `export default () => ({
  name: 'second',
  rules: { Requirement: { RL1: async () => {} } }
});
`);

    await assert.rejects(
      getDefinitions(
        workspace,
        [ workspace.resolve('first.js'),
          workspace.resolve('second.js') ]),
      /Rule "RL1" of definition "Requirement" is implemented by both plugin "first" and plugin "second"\./);
  });

test(
  'RQ201: a definition name provided by a plugin and a document is fatal',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'definitions/Requirement.md',
      REQUIREMENT_DEFINITION);

    await workspace.writeText(
      'plugin.js',
      `export default () => ({
  name: 'test',
  definitions: async () => [ { name: 'Requirement', description: 'Clash.' } ]
});
`);

    await assert.rejects(
      getDefinitions(
        workspace,
        [ workspace.resolve('plugin.js') ]),
      /Definition "Requirement" is provided by plugin "test" and by document /);
  });

test(
  'RQ207: a plugin definition rule id must be uppercase letters and digits',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'plugin.js',
      `export default () => ({
  name: 'test',
  definitions: async () => [ {
    name: 'Release',
    description: 'A release.',
    rules: [ { id: 'rl1', content: 'Invalid id.' } ]
  } ]
});
`);

    await assert.rejects(
      getDefinitions(
        workspace,
        [ workspace.resolve('plugin.js') ]),
      /invalid id "rl1"/);
  });
