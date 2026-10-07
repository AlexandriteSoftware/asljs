import { createRuleValidationContext }
  from 'asljs-part';
import { createTestLoggerProvider }
  from 'asljs-testing';
import assert
  from 'node:assert/strict';
import path
  from 'node:path';
import test
  from 'node:test';
import { fileURLToPath }
  from 'node:url';

const loggerProvider =
  createTestLoggerProvider();

test.after(
  async () =>
  {
    await loggerProvider.dispose();
  });

const pluginPath =
  fileURLToPath(
    new URL(
      './plugin.js',
      import.meta.url));

const packageFolder =
  path.resolve(
    path.dirname(pluginPath),
    '..');

test(
  'plugin provides the documented definitions and binds every implementation',
  async () =>
  {
    const context =
      createRuleValidationContext(
        loggerProvider,
        packageFolder,
        [ pluginPath ]);

    const definitions =
      await context.definitions.getDefinitions();

    assert.deepEqual(
      definitions.map(
        definition => [ definition.name,
                        definition.source ]),
      [ [ 'Package README',
          'asljs-artefacts' ],
        [ 'Requirement',
          'asljs-artefacts' ] ]);
  });
