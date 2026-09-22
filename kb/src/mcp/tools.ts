import { findBacklinks }
  from '../backlinks.js';
import { Environment }
  from '../environment.js';
import { EXTRACTION_KINDS,
         extractData,
         toExtractionKind }
  from '../extract.js';
import { copyEntry,
         createFolder,
         listEntries,
         moveEntry,
         readTextFile,
         removeEntry,
         statEntry,
         writeTextFile }
  from '../files.js';
import { formatLibrary }
  from '../format.js';
import { createLinkGraph }
  from '../graph.js';
import { resolveLibraryPath }
  from '../library.js';
import { parseMarkdown }
  from '../markdown.js';
import { createNote,
         isMarkdown,
         summarizeDocument }
  from '../notes.js';
import { relocateEntry,
         renameEntry }
  from '../relocate.js';
import { searchLibrary }
  from '../search.js';
import { optionalBoolean,
         optionalCount,
         optionalKind,
         optionalString,
         optionalStringArray,
         requireString }
  from './arguments.js';
import { booleanProperty,
         enumProperty,
         numberProperty,
         objectSchema,
         stringArrayProperty,
         stringProperty,
         transferSchema }
  from './schema.js';

export interface McpTool
{
  name: string;

  description: string;

  /**
   * JSON Schema of the tool arguments, as sent in `tools/list`.
   */
  inputSchema: Record<string, unknown>;

  invoke: (
    args: Record<string, unknown>
  ) => Promise<unknown>;
}

/**
 * Create the tools the server exposes.
 *
 * Every tool works inside `environment.library`; a path that escapes the
 * library is rejected.
 */
export function createTools(
    environment: Environment
  ): McpTool[]
{
  return [ listTool(environment),
           readTool(environment),
           writeTool(environment),
           newTool(environment),
           mkdirTool(environment),
           moveTool(environment),
           renameTool(environment),
           copyTool(environment),
           removeTool(environment),
           searchTool(environment),
           backlinksTool(environment),
           graphTool(environment),
           formatTool(environment),
           extractTool(environment),
           infoTool(environment) ];
}

function listTool(
    environment: Environment
  ): McpTool
{
  return { name: 'kb_list',
           description:
             'List library files and folders matching a glob pattern.',
           inputSchema:
             objectSchema(
               { pattern:
                   stringProperty(
                     'Glob pattern relative to the library root. '
                     + 'Defaults to **/*.'),
                 kind:
                   enumProperty(
                     [ 'file',
                       'folder',
                       'any' ],
                     'Restrict the result to files or folders.'),
                 hidden:
                   booleanProperty(
                     'Include dot files and dot folders.') }),
           invoke:
             async args =>
             await listEntries(
               environment.library,
               { pattern:
                   optionalString(
                     args,
                     'pattern'),
                 kind:
                   optionalKind(
                     args,
                     'kind'),
                 hidden:
                   optionalBoolean(
                     args,
                     'hidden') }) };
}

function readTool(
    environment: Environment
  ): McpTool
{
  return { name: 'kb_read',
           description:
             'Read the text of a document. Markdown and other text files are '
             + 'returned verbatim; PDF files are returned as extracted text.',
           inputSchema:
             objectSchema(
               { path:
                   stringProperty(
                     'Library-relative path of the file.') },
               [ 'path' ]),
           invoke:
             async args =>
             await readDocument(
               environment,
               requireString(
                 args,
                 'path')) };
}

async function readDocument(
    environment: Environment,
    documentPath: string
  ): Promise<Record<string, unknown>>
{
  const entry =
    await statEntry(
      environment.library,
      documentPath);

  if (entry.kind !== 'file') {
    throw new Error(
      `Not a file: ${entry.path}`);
  }

  const absolute =
    resolveLibraryPath(
      environment.library,
      entry.path);

  const reader =
    environment.readers.find(absolute);

  if (!reader) {
    throw new Error(
      `Unsupported file type: ${entry.path}`);
  }

  return { path: entry.path,
           reader: reader.name,
           verbatim: reader.verbatim,
           text:
             await reader.readText(absolute) };
}

function writeTool(
    environment: Environment
  ): McpTool
{
  return { name: 'kb_write',
           description:
             'Write a text file, creating missing folders.',
           inputSchema:
             objectSchema(
               { path:
                   stringProperty(
                     'Library-relative path of the file.'),
                 content:
                   stringProperty(
                     'Text to write.'),
                 overwrite:
                   booleanProperty(
                     'Replace the file when it already exists.') },
               [ 'path',
                 'content' ]),
           invoke:
             async args =>
             await writeTextFile(
               environment.library,
               requireString(
                 args,
                 'path'),
               requireString(
                 args,
                 'content'),
               { overwrite:
                   optionalBoolean(
                     args,
                     'overwrite') }) };
}

function newTool(
    environment: Environment
  ): McpTool
{
  return { name: 'kb_new',
           description:
             'Create a markdown note with YAML front matter.',
           inputSchema:
             objectSchema(
               { path:
                   stringProperty(
                     'Library-relative path. `.md` is added when missing.'),
                 title:
                   stringProperty(
                     'Note title. Defaults to the file name.'),
                 tags:
                   stringArrayProperty(
                     'Tags written to the front matter.'),
                 body:
                   stringProperty(
                     'Body text placed under the heading.'),
                 overwrite:
                   booleanProperty(
                     'Replace the note when it already exists.') },
               [ 'path' ]),
           invoke:
             async args =>
             await createNote(
               environment.library,
               requireString(
                 args,
                 'path'),
               { title:
                   optionalString(
                     args,
                     'title'),
                 tags:
                   optionalStringArray(
                     args,
                     'tags'),
                 body:
                   optionalString(
                     args,
                     'body'),
                 overwrite:
                   optionalBoolean(
                     args,
                     'overwrite') }) };
}

function mkdirTool(
    environment: Environment
  ): McpTool
{
  return { name: 'kb_mkdir',
           description:
             'Create a folder, including missing parent folders.',
           inputSchema:
             objectSchema(
               { path:
                   stringProperty(
                     'Library-relative path of the folder.') },
               [ 'path' ]),
           invoke:
             async args =>
             await createFolder(
               environment.library,
               requireString(
                 args,
                 'path')) };
}

function moveTool(
    environment: Environment
  ): McpTool
{
  return { name: 'kb_move',
           description:
             'Move or rename a file or folder, rewriting the links the move '
             + 'would otherwise break, in the documents that point at it and '
             + 'inside the documents that moved. Set updateLinks to false to '
             + 'move without touching any link.',
           inputSchema:
             objectSchema(
               { source:
                   stringProperty(
                     'Library-relative path of the entry to move.'),
                 target:
                   stringProperty(
                     'Library-relative path of the destination.'),
                 overwrite:
                   booleanProperty(
                     'Replace the target when it already exists.'),
                 updateLinks:
                   booleanProperty(
                     'Rewrite the links the move would break. Defaults to '
                     + 'true.'),
                 dryRun:
                   booleanProperty(
                     'Report the move and the edits without performing '
                     + 'them.') },
               [ 'source',
                 'target' ]),
           invoke:
             async args =>
             await move(
               environment,
               args) };
}

async function move(
    environment: Environment,
    args: Record<string, unknown>
  ): Promise<unknown>
{
  const source =
    requireString(
      args,
      'source');

  const target =
    requireString(
      args,
      'target');

  const overwrite =
    optionalBoolean(
      args,
      'overwrite');

  if (
    optionalBoolean(
      args,
      'updateLinks')
    === false
  ) {
    return await moveEntry(
      environment.library,
      source,
      target,
      { overwrite });
  }

  return await relocateEntry(
    environment.library,
    source,
    target,
    { overwrite,
      dryRun:
        optionalBoolean(
          args,
          'dryRun'),
      graph: environment.graph });
}

function renameTool(
    environment: Environment
  ): McpTool
{
  return { name: 'kb_rename',
           description:
             'Rename an entry inside the folder it already sits in, '
             + 'rewriting the links the rename would otherwise break, wiki '
             + 'links included.',
           inputSchema:
             objectSchema(
               { path:
                   stringProperty(
                     'Library-relative path of the entry to rename.'),
                 name:
                   stringProperty(
                     'New name, without a folder.'),
                 overwrite:
                   booleanProperty(
                     'Replace the target when it already exists.'),
                 updateLinks:
                   booleanProperty(
                     'Rewrite the links the rename would break. Defaults to '
                     + 'true.'),
                 dryRun:
                   booleanProperty(
                     'Report the rename and the edits without performing '
                     + 'them.') },
               [ 'path',
                 'name' ]),
           invoke:
             async args =>
             await renameEntry(
               environment.library,
               requireString(
                 args,
                 'path'),
               requireString(
                 args,
                 'name'),
               { overwrite:
                   optionalBoolean(
                     args,
                     'overwrite'),
                 updateLinks:
                   optionalBoolean(
                     args,
                     'updateLinks'),
                 dryRun:
                   optionalBoolean(
                     args,
                     'dryRun'),
                 graph: environment.graph }) };
}

function copyTool(
    environment: Environment
  ): McpTool
{
  return { name: 'kb_copy',
           description:
             'Copy a file or folder. When the target is an existing folder, '
             + 'the source is copied into it.',
           inputSchema:
             transferSchema(),
           invoke:
             async args =>
             await copyEntry(
               environment.library,
               requireString(
                 args,
                 'source'),
               requireString(
                 args,
                 'target'),
               { overwrite:
                   optionalBoolean(
                     args,
                     'overwrite') }) };
}

function removeTool(
    environment: Environment
  ): McpTool
{
  return { name: 'kb_remove',
           description:
             'Remove a file or folder. Non-empty folders require '
             + '`recursive`.',
           inputSchema:
             objectSchema(
               { path:
                   stringProperty(
                     'Library-relative path of the entry.'),
                 recursive:
                   booleanProperty(
                     'Remove a folder with its content.') },
               [ 'path' ]),
           invoke:
             async args =>
             ({ path:
                  await removeEntry(
                    environment.library,
                    requireString(
                      args,
                      'path'),
                    { recursive:
                        optionalBoolean(
                          args,
                          'recursive') }) }) };
}

function searchTool(
    environment: Environment
  ): McpTool
{
  return { name: 'kb_search',
           description:
             'Search the text of every readable document, including PDF text '
             + 'layers. Returns matches with file, line and column.',
           inputSchema:
             objectSchema(
               { query:
                   stringProperty(
                     'Text to find, or a regular expression when `regex` is '
                     + 'set.'),
                 pattern:
                   stringProperty(
                     'Glob pattern limiting the files to search.'),
                 regex:
                   booleanProperty(
                     'Treat the query as a regular expression.'),
                 ignoreCase:
                   booleanProperty(
                     'Match case-insensitively. Defaults to true.'),
                 hidden:
                   booleanProperty(
                     'Include dot files and dot folders.'),
                 maxResults:
                   numberProperty(
                     'Maximum number of matches to return.') },
               [ 'query' ]),
           invoke:
             async args =>
             await searchLibrary(
               environment.library,
               environment.readers,
               { query:
                   requireString(
                     args,
                     'query'),
                 pattern:
                   optionalString(
                     args,
                     'pattern'),
                 regex:
                   optionalBoolean(
                     args,
                     'regex'),
                 ignoreCase:
                   optionalBoolean(
                     args,
                     'ignoreCase'),
                 hidden:
                   optionalBoolean(
                     args,
                     'hidden'),
                 maxResults:
                   optionalCount(
                     args,
                     'maxResults') }) };
}

function backlinksTool(
    environment: Environment
  ): McpTool
{
  return { name: 'kb_backlinks',
           description:
             'List the markdown links that point at one entry, with the '
             + 'file, line, column and the link target as written. The entry '
             + 'does not have to exist, so this also answers what a rename '
             + 'would break.',
           inputSchema:
             objectSchema(
               { path:
                   stringProperty(
                     'Library-relative path of the entry to find links to.'),
                 pattern:
                   stringProperty(
                     'Glob pattern limiting the documents to scan.'),
                 hidden:
                   booleanProperty(
                     'Include dot files and dot folders.'),
                 includeSelf:
                   booleanProperty(
                     'Include links the document makes to itself.') },
               [ 'path' ]),
           invoke:
             async args =>
             await backlinks(
               environment,
               args) };
}

async function backlinks(
    environment: Environment,
    args: Record<string, unknown>
  ): Promise<unknown>
{
  const target =
    requireString(
      args,
      'path');

  const includeSelf =
    optionalBoolean(
      args,
      'includeSelf');

  const pattern =
    optionalString(
      args,
      'pattern');

  // The index covers the whole library, so it can only answer a request that
  // does not narrow the documents to scan.
  if (
    environment.graph
    && pattern === undefined
  ) {
    return environment.graph.backlinksTo(
      target,
      { includeSelf });
  }

  return await findBacklinks(
    environment.library,
    target,
    { pattern,
      hidden:
        optionalBoolean(
          args,
          'hidden'),
      includeSelf });
}

function graphTool(
    environment: Environment
  ): McpTool
{
  return { name: 'kb_graph',
           description:
             'Inspect the in-memory index of articles and links. Without a '
             + 'path it reports index statistics; with one it reports that '
             + 'article, the links it writes and the links that point at it.',
           inputSchema:
             objectSchema(
               { path:
                   stringProperty(
                     'Library-relative path of an article to describe.') }),
           invoke:
             async args =>
             await describeGraph(
               environment,
               optionalString(
                 args,
                 'path')) };
}

async function describeGraph(
    environment: Environment,
    documentPath: string | undefined
  ): Promise<unknown>
{
  const graph =
    environment.graph
    ?? await createLinkGraph(environment.library);

  if (documentPath === undefined) {
    return { ...graph.stats(),
             live: environment.graph !== undefined };
  }

  return { article:
             graph.article(documentPath) ?? null,
           outgoing:
             graph.outgoing(documentPath),
           incoming:
             graph.incoming(documentPath) };
}

function formatTool(
    environment: Environment
  ): McpTool
{
  return { name: 'kb_format',
           description:
             'Format markdown files. Set `write` to false to report the '
             + 'files that need formatting without changing them.',
           inputSchema:
             objectSchema(
               { pattern:
                   stringProperty(
                     'Glob pattern. Defaults to **/*.md.'),
                 write:
                   booleanProperty(
                     'Write the formatted text back. Defaults to true.'),
                 hidden:
                   booleanProperty(
                     'Include dot files and dot folders.') }),
           invoke:
             async args =>
             await formatLibrary(
               environment.library,
               { pattern:
                   optionalString(
                     args,
                     'pattern'),
                 write:
                   optionalBoolean(
                     args,
                     'write'),
                 hidden:
                   optionalBoolean(
                     args,
                     'hidden') }) };
}

function extractTool(
    environment: Environment
  ): McpTool
{
  return { name: 'kb_extract',
           description:
             'Extract structured data from a markdown document: headings, '
             + 'links, tasks, tables, code blocks or front matter.',
           inputSchema:
             objectSchema(
               { path:
                   stringProperty(
                     'Library-relative path of the markdown file.'),
                 kind:
                   enumProperty(
                     EXTRACTION_KINDS,
                     'Kind of data to extract.') },
               [ 'path',
                 'kind' ]),
           invoke:
             async args =>
             await extract(
               environment,
               requireString(
                 args,
                 'path'),
               requireString(
                 args,
                 'kind')) };
}

async function extract(
    environment: Environment,
    documentPath: string,
    kind: string
  ): Promise<unknown>
{
  if (!isMarkdown(documentPath)) {
    throw new Error(
      `Extraction is only supported for markdown files: ${documentPath}`);
  }

  const text =
    await readTextFile(
      environment.library,
      documentPath);

  const document =
    parseMarkdown(
      text,
      documentPath);

  return extractData(
    document,
    toExtractionKind(kind));
}

function infoTool(
    environment: Environment
  ): McpTool
{
  return { name: 'kb_info',
           description:
             'Summarise a document: size, word count, and, for markdown, '
             + 'front matter and structure counts.',
           inputSchema:
             objectSchema(
               { path:
                   stringProperty(
                     'Library-relative path of the file.') },
               [ 'path' ]),
           invoke:
             async args =>
             await summarizeDocument(
               environment.library,
               environment.readers,
               requireString(
                 args,
                 'path')) };
}
