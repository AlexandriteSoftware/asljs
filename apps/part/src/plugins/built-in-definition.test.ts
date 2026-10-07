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
import { PluginContext }
  from '../plugin.js';
import { readMarkdownDefinitions }
  from '../providers/markdown-definition-reader.js';
import { readBuiltInDefinition }
  from './built-in-definition.js';

const loggerProvider =
  createTestLoggerProvider();

test.after(
  async () =>
  {
    await loggerProvider.dispose();
  });

const artefactsFolder =
  path.resolve(
    path.dirname(
      fileURLToPath(import.meta.url)),
    '..',
    '..',
    'artefacts');

const context =
  { readDefinitions:
      (folder?: string) =>
    readMarkdownDefinitions(
      folder ?? '.',
      loggerProvider) } as unknown as PluginContext;

test(
  'RQ208: built-in definitions are read from the package artefacts folder',
  async () =>
  {
    for (const name of [ 'Git Tag',
                         'NPM Dependency' ]) {
      const definition =
        await readBuiltInDefinition(
          context,
          name);

      assert.equal(
        definition.path,
        path.join(
          artefactsFolder,
          `${name}.md`));

      assert.deepEqual(
        definition.rules.map(
          rule => rule.id),
        [ 'RL1' ]);
    }
  });

test(
  'RQ208: a missing built-in definition document is an error',
  async () =>
  {
    await assert.rejects(
      readBuiltInDefinition(
        context,
        'Missing'),
      /Definition document "Missing" not found in /);
  });
