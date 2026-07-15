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

const MAIN_PATH =
  join(
    CURRENT_DIR,
    '..',
    'main.ts');

test(
  'main routes chat and generation through different prompts',
  async () =>
  {
    const source =
      await readFile(
        MAIN_PATH,
        'utf8');

    assert.match(
      source,
      /import\s*\{\s*GENERATION_SYSTEM_PROMPT,\s*\}\s*from '\.\/ai\/ai-instruction\.js';/
    );

    assert.match(
      source,
      /import\s*\{\s*CHAT_SYSTEM_PROMPT,\s*\}\s*from '\.\/ai\/chat-instruction\.js';/
    );

    assert.match(
      source,
      /content:\s*CHAT_SYSTEM_PROMPT/
    );

    assert.match(
      source,
      /systemPrompt:\s*GENERATION_SYSTEM_PROMPT/
    );
  }
);
