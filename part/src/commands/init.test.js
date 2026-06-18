import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { TmpDir }
  from '../tmp-dir.js';
import { createLogger }
  from '../logging.js';
import { createEnvironment }
  from '../environment.js';
import { execInit }
  from './init.js';

const logger =
  createLogger(
    { enabled: false,
      level: 'trace' });

test(
  'RQ124: init copies bootstrap artefact files into the definitions directory',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.mkdir('definitions');

    const environment =
      createEnvironment(
        { logger,
          cwd: workspace.path,
          definitions: workspace.resolve('definitions') });

    await execInit(
      environment);

    assert.match(
      environment.stdout.toString(),
      /Initialized definitions directory:/);

    assert.equal(
      environment.stderr.toString(),
      '');

    assert.match(
      workspace.readText(
        'definitions/Artefact Definition.md'),
      /# Artefact Definition/);

    assert.match(
      workspace.readText(
        'definitions/Rule File.md'),
      /# Rule File/);

    assert.ok(
      workspace.stat(
        'definitions/rules/Rule File_RL1.js')
        .isFile());

    assert.ok(
      workspace.stat(
        'definitions/rules/Artefact Definition_RL1.js')
        .isFile());
  });
