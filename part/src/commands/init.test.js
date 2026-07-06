import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { TmpDir }
  from 'asljs-tmpdir';
import { createLogger }
  from '../logging.js';
import { createEnvironment }
  from '../environment.js';
import { execInit }
  from './init.js';

const logger =
  createLogger();

test.after(
  () => logger.dispose());

test(
  'RQ124: init copies bootstrap artefact files into the definitions directory',
  async () => {
    await using workspace =
      new TmpDir(
        logger);

    const environment =
      createEnvironment(
        { logger,
          cwd: workspace.path,
          definitions: workspace.resolve('definitions') });

    await execInit(
      environment);

    assert.match(
      environment.stdout.toString(),
      /Initialised definitions directory:/);

    assert.equal(
      environment.stderr.toString(),
      '');

    assert.match(
      await workspace.readText(
        'definitions/Artefact Definition.md'),
      /# Artefact Definition/);

    assert.match(
      await workspace.readText(
        'definitions/Rule File.md'),
      /# Rule File/);

    const ruleFile1Stat =
      await workspace.stat(
        'definitions/parts/Rule File_RL1.js');

    assert.ok(
      ruleFile1Stat.isFile());

    const artefactDefinitionStat =
      await workspace.stat(
        'definitions/parts/Artefact Definition_RL1.js');

    assert.ok(
      artefactDefinitionStat.isFile());
  });
