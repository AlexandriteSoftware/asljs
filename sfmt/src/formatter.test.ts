import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { applyFormatters }
  from './formatter.js';
import tsImportDeclarationFormatterFactory
  from './ts-style-rules/import-declaration.js';
import { NullLogger }
  from './logging.js';

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
        tsImportDeclarationFormatterFactory(
          new NullLogger())
      ]);

    assert.strictEqual(
      formatted,
      'import { type writeFile }\n' + "  from 'import-type';\n");
  });
