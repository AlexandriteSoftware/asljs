import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { readFile }
  from 'node:fs/promises';
import { fileURLToPath }
  from 'node:url';
import { dirname, join }
  from 'node:path';

const CURRENT_FILE_PATH =
  fileURLToPath(import.meta.url);
const CURRENT_DIR =
  dirname(CURRENT_FILE_PATH);
const AI_INSTRUCTION_PATH =
  join(CURRENT_DIR, 'ai-instruction.ts');

test(
  'ai-instruction prompt includes required package and tool guidance',
  async () => {
    const source =
      await readFile(AI_INSTRUCTION_PATH, 'utf8');

    assert.match(
      source,
      /You are an expert ASLJS app generator\./);

    assert.match(source, /asljs-eventful/);
    assert.match(source, /asljs-observable/);
    assert.match(source, /asljs-data-binding/);
    assert.match(source, /asljs-components/);
    assert.match(source, /asljs-dali/);

    assert.match(source, /listFileset\(\)/);
    assert.match(source, /readFile\(path\)/);
    assert.match(source, /choose\(question, options\)/);
    assert.match(source, /readFileData\(path\)/);
    assert.match(source, /setFileData\(path, mimeType, base64\)/);
    assert.match(source, /runAppTests\(path\?\)/);
    assert.match(source, /setFileContent\(path, content\)/);
    assert.match(source, /replaceFilePart\(path, search, replacement, replaceAll\?\)/);
    assert.match(source, /deleteFile\(path\)/);
    assert.match(source, /evalInApp\(code\)/);
    assert.match(source, /getAppDiagnostics\(\)/);
    assert.match(source, /runAppAndCollectDiagnostics\(\)/);
    assert.match(source, /\.README\.md/);
    assert.match(source, /conversation loop/i);
    assert.match(source, /Assume the user is about 8 years old/i);
    assert.match(source, /Do not modify app runtime files until the user explicitly approves implementation/i);
  });
