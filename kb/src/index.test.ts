import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import * as kb
  from './index.js';

test(
  'package root exposes the supported public API',
  () =>
  {
    assert.deepEqual(
      Object.keys(kb).sort(),
      [ 'DEFAULT_EXCLUDES',
        'EXTRACTION_KINDS',
        'LibraryPathError',
        'PROTOCOL_VERSION',
        'PdfReader',
        'ReaderRegistry',
        'SERVER_NAME',
        'TEXT_EXTENSIONS',
        'TextReader',
        'copyEntry',
        'createDefaultReaderRegistry',
        'createEnvironment',
        'createFolder',
        'createLoggerProvider',
        'createNote',
        'createTools',
        'documentLine',
        'extractCodeBlocks',
        'extractData',
        'extractHeadings',
        'extractLinks',
        'extractTables',
        'extractTasks',
        'formatLibrary',
        'formatMarkdown',
        'handleMessage',
        'isInsideLibrary',
        'isMarkdown',
        'listEntries',
        'moveEntry',
        'parseMarkdown',
        'readTextFile',
        'removeEntry',
        'resolveLibraryPath',
        'resolveLibraryRoot',
        'runCli',
        'runMcpMain',
        'runMcpServer',
        'searchLibrary',
        'splitFrontMatter',
        'statEntry',
        'summarizeDocument',
        'toExtractionKind',
        'toLibraryPath',
        'toPlainText',
        'toSlug',
        'writeTextFile' ]);
  });

test(
  'the package root drives a library end to end',
  async () =>
  {
    const { withLibrary } =
      await import('./testing/library.js');

    await withLibrary(
      { 'notes/one.md':
          '# One\n\nThe budget line.\n' },
      async (
          library
        ) =>
      {
        const environment =
          kb.createEnvironment(
            { cwd: library.path,
              library: library.path });

        assert.equal(
          (await kb.listEntries(
            environment.library,
            { pattern: '**/*.md' }))
            .length,
          1);

        const report =
          await kb.searchLibrary(
            environment.library,
            environment.readers,
            { query: 'budget' });

        assert.equal(
          report.matches.length,
          1);
      });
  });
