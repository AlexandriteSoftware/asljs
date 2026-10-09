import { runCommand }
  from 'asljs-mdcli';
import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { writeAgent,
         writeFixture }
  from './fixture.js';

test(
  'writeFixture writes a board, and writeAgent an agent that answers by the prompt',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    assert.ok(
      (await dir.stat(
        'board/Tasks/T19-2 Add a review date.md')).isFile());

    const command =
      await writeAgent(
        dir,
        { apple: 'red\n' });

    assert.equal(
      (await runCommand(
        command,
        dir.path,
        'an apple')).stdout,
      'red\n');

    assert.equal(
      (await runCommand(
        command,
        dir.path,
        'a pear')).stdout,
      '{"result":"OK"}\n');

    assert.equal(
      await dir.readText(
        'agent/prompts/2.txt'),
      'a pear');
  });
