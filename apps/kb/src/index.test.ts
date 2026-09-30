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
        'LinkGraph',
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
        'createInProcessClient',
        'createLinkGraph',
        'createLoggerProvider',
        'createNote',
        'createTools',
        'documentLine',
        'documentTitle',
        'endpointFor',
        'extractCodeBlocks',
        'extractData',
        'extractHeadings',
        'extractLinks',
        'extractTables',
        'extractTasks',
        'findBacklinks',
        'formatLibrary',
        'formatMarkdown',
        'handleMessage',
        'isMarkdown',
        'listEntries',
        'moveEntry',
        'openClient',
        'parseMarkdown',
        'readTextFile',
        'relocateEntry',
        'removeEntry',
        'renameEntry',
        'resolveLibraryPath',
        'resolveLibraryRoot',
        'resolveLinkTarget',
        'runCli',
        'runMcpMain',
        'runMcpServer',
        'searchLibrary',
        'serveEndpoint',
        'splitFrontMatter',
        'statEntry',
        'summarizeDocument',
        'toExtractionKind',
        'toLibraryPath',
        'toPlainText',
        'toSlug',
        'watchLibrary',
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
