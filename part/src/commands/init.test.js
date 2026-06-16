import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { TmpDir }
  from '../tmpDir.js';
import { createTestEnvironment }
  from '../testEnvironment.js';
import { execInit }
  from './init.js';

test(
  'RQ124: init copies bootstrap artefact files into the definitions directory',
  async t => {
    const workspace =
      new TmpDir();

    t.after(
      () => workspace.cleanup());

    workspace.mkdir('definitions');

    const environment =
      createTestEnvironment(
        { cwd: workspace.path,
          definitions: workspace.resolve('definitions') });

    await execInit(
      environment);

    assert.match(
      environment.stdout.output,
      /Initialized definitions directory:/);

    assert.equal(
      environment.stderr.output,
      '');

    assert.match(
      await workspace.readText(
        'definitions/Artefact Definition.md'),
      /# Artefact Definition/);

    assert.match(
      await workspace.readText(
        'definitions/Rule File.md'),
      /# Rule File/);

    assert.ok(
      workspace.stat(
        'definitions/rules')
        .isDirectory());

    assert.match(
      await workspace.readText(
        'definitions/Article.md'),
      /# Article/);

    assert.ok(
      workspace.stat(
        'definitions/rules/Article_RL10.js')
        .isFile());
  });
