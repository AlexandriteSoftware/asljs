import assert
  from 'node:assert/strict';
import { readFile }
  from 'node:fs/promises';
import { dirname,
         join }
  from 'node:path';
import test
  from 'node:test';
import { fileURLToPath }
  from 'node:url';

const CURRENT_FILE_PATH =
  fileURLToPath(
    import.meta.url);

const CURRENT_DIR =
  dirname(
    CURRENT_FILE_PATH);

const CHAT_INSTRUCTION_PATH =
  join(
    CURRENT_DIR,
    'chat-instruction.ts');

test(
  'chat-instruction prompt restricts normal chat turns to PLAN and generation handoff',
  async () =>
  {
    const source =
      await readFile(
        CHAT_INSTRUCTION_PATH,
        'utf8');

    assert.match(
      source,
      /You are the chat lane for the ASLJS app builder\./);

    assert.match(
      source,
      /README\.md is the current implemented app state/i);

    assert.match(
      source,
      /PLAN\.md is where the next changeset is drafted/i);

    assert.match(
      source,
      /During normal chat turns, only edit PLAN\.md\./i);

    assert.match(
      source,
      /call startGeneration\(\)/i);

    assert.match(
      source,
      /Do not use runAppTests\(\), evalInApp\(\), assertInApp\(\), setFileData\(\), or\s+deleteFile\(\)/i);
  });
