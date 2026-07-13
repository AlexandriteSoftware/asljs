import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { applyFormatters }
  from './formatter.js';
import { importFormatter as jsImportFormatter }
  from './js-style-rules/import.js';
import { importFormatter as tsImportFormatter }
  from './ts-style-rules/import.js';

test(
  'applyFormatters applies a single JavaScript formatter independently',
  async () =>
  {
    const code =
      "import{readFile,writeFile}from'node:fs/promises';\n";

    const formatted =
      await applyFormatters(
        code,
        'example.js',
        [
        jsImportFormatter
      ]);

    assert.strictEqual(
      formatted,
      'import { readFile,\n'
        + '         writeFile }\n'
        + "  from 'node:fs/promises';\n"
    );
  }
);

test(
  'applyFormatters applies a single TypeScript formatter independently',
  async () =>
  {
    const code =
      "import type { writeFile } from'import-type';\n";

    const formatted =
      await applyFormatters(
        code,
        'example.ts',
        [
        tsImportFormatter
      ]);

    assert.strictEqual(
      formatted,
      'import { type writeFile }\n' + "  from 'import-type';\n"
    );
  }
);
