import assert
  from 'node:assert/strict';
import test,
       { after }
  from 'node:test';
import { createEnvironment }
  from '../environment.js';
import { createPinoLoggerProvider }
  from '../logging/pino.js';
import { tmpDirFactory }
  from '../testing/tmpDir.js';
import { execInit }
  from './init.js';

const loggerProvider =
  createPinoLoggerProvider();

after(
  () =>
  {
    loggerProvider.dispose();
  });

const tmpDir =
  tmpDirFactory(
    loggerProvider);

test(
  'RQ124: init copies bootstrap artefact files into the definitions directory',
  async () =>
  {
    await using workspace =
      tmpDir();

    const environment =
      createEnvironment(
        { loggerProvider,
          cwd:
            workspace.path,
          definitions:
            workspace.resolve('definitions') });

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
