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
  'ai-instruction prompt includes package decision guidance and tool guidance',
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
    assert.match(source, /do not force every\s+package into every app/i);
    assert.match(source, /Package selection decision list:/);
    assert.match(source, /If the app needs reactive state.*asljs-eventful and asljs-observable together/i);
    assert.match(source, /If plain browser APIs are enough for a feature, do not add an ASLJS package just to satisfy a checklist/i);

    assert.match(source, /listFileset\(\)/);
    assert.match(source, /readFile\(path\)/);
    assert.match(source, /choose\(question, options\)/);
    assert.match(source, /readFileData\(path\)/);
    assert.match(source, /setFileData\(path, mimeType, base64\)/);
    assert.match(source, /setFilesContent\(files\)/);
    assert.match(source, /runAppTests\(path\?\)/);
    assert.match(source, /app\.tests\.js/);
    assert.match(source, /app\.tests\.js should contain normal JavaScript tests, not JSON-encoded test data/i);
    assert.match(source, /README\.md requirements changed intentionally, treat that as a required app\.tests\.js update/i);
    assert.match(source, /update app\.tests\.js for README requirement changes, run the app, interact with it, repair issues, run the tests, then clear CHANGE\.md/i);
    assert.match(source, /setFileContent\(path, content\)/);
    assert.match(source, /replaceFilePart\(path, search, replacement, replaceAll\?\)/);
    assert.match(source, /deleteFile\(path\)/);
    assert.match(source, /evalInApp\(code\)/);
    assert.match(source, /getAppDiagnostics\(\)/);
    assert.match(source, /runAppAndCollectDiagnostics\(\)/);
    assert.match(source, /PLAN\.md/);
    assert.match(source, /CHANGE\.md/);
    assert.match(source, /implementation cycle/i);
    assert.match(source, /Assume the user is about 8 years old/i);
    assert.match(source, /Do not ask clarification questions in this lane/i);
  });
