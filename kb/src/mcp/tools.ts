import { findBacklinks }
  from '../backlinks.js';
import { createLinkGraph }
  from '../graph.js';
import { Environment }
  from '../environment.js';
import { EntryKind,
         copyEntry,
         createFolder,
         listEntries,
         moveEntry,
         readTextFile,
         removeEntry,
         statEntry,
         writeTextFile }
  from '../files.js';
import { EXTRACTION_KINDS,
         extractData,
         toExtractionKind }
  from '../extract.js';
import { formatLibrary }
  from '../format.js';
import { resolveLibraryPath }
  from '../library.js';
import { parseMarkdown }
  from '../markdown.js';
import { createNote,
         isMarkdown,
         summarizeDocument }
  from '../notes.js';
import { searchLibrary }
  from '../search.js';

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
 * Create the tools exposed by the `kb` MCP server. Every tool operates inside
 * `environment.library`; paths that escape the library are rejected.
 */
export function createTools(
    environment: Environment
  ): McpTool[]
{
  return [ { name: 'kb_list',
             description:
               'List library files and folders matching a glob pattern.',
             inputSchema:
               objectSchema(
                 { pattern:
                     stringProperty(
                       'Glob pattern relative to the library root. Defaults to '
                       + '**/*.'),
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
                'hidden') }) },
           { name: 'kb_read',
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
               async (
                   args
                 ) =>
               {
          const entry =
            await statEntry(
              environment.library,
              requireString(
                args,
                'path'));

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
        } },
           { name: 'kb_write',
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
                'overwrite') }) },
           { name: 'kb_new',
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
                'overwrite') }) },
           { name: 'kb_mkdir',
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
            'path')) },
           { name: 'kb_move',
             description:
               'Move or rename a file or folder. When the target is an '
               + 'existing '
        + 'folder, the source is moved into it.',
             inputSchema:
               transferSchema(),
             invoke:
               async args =>
        await moveEntry(
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
                'overwrite') }) },
           { name: 'kb_copy',
             description:
               'Copy a file or folder. When the target is an existing folder, '
               + 'the '
        + 'source is copied into it.',
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
                'overwrite') }) },
           { name: 'kb_remove',
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
                     'recursive') }) }) },
           { name: 'kb_search',
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
              optionalNumber(
                args,
                'maxResults') }) },
           { name: 'kb_backlinks',
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
               async (
                   args
                 ) =>
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

               // The index covers the whole library, so it can only answer a
               // request that does not narrow the documents to scan.
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
             } },

           { name: 'kb_graph',
             description:
               'Inspect the in-memory index of articles and links. Without a '
               + 'path it reports index statistics; with one it reports that '
               + 'article, the links it writes and the links that point at '
               + 'it.',
             inputSchema:
               objectSchema(
                 { path:
                     stringProperty(
                       'Library-relative path of an article to describe.') }),
             invoke:
               async (
                   args
                 ) =>
               {
               const graph =
                 environment.graph
                 ?? await createLinkGraph(environment.library);

               const target =
                 optionalString(
                   args,
                   'path');

               if (target === undefined) {
                 return { ...graph.stats(),
                          live: environment.graph !== undefined };
               }

               return { article:
                          graph.article(target) ?? null,
                        outgoing:
                          graph.outgoing(target),
                        incoming:
                          graph.incoming(target) };
             } },

           { name: 'kb_format',
             description:
               'Format markdown files. Set `write` to false to report the '
               + 'files that '
        + 'need formatting without changing them.',
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
                'hidden') }) },
           { name: 'kb_extract',
             description:
               'Extract structured data from a markdown document: headings, '
               + 'links, '
        + 'tasks, tables, code blocks or front matter.',
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
               async (
                   args
                 ) =>
               {
          const value =
            requireString(
              args,
              'path');

          if (!isMarkdown(value)) {
            throw new Error(
              `Extraction is only supported for markdown files: ${value}`);
          }

          const text =
            await readTextFile(
              environment.library,
              value);

          return extractData(
            parseMarkdown(
              text,
              value),
            toExtractionKind(
              requireString(
                args,
                'kind')));
        } },
           { name: 'kb_info',
             description:
               'Summarise a document: size, word count, and, for markdown, '
               + 'front '
        + 'matter and structure counts.',
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
            'path')) } ];
}

function transferSchema(
  ): Record<string, unknown>
{
  return objectSchema(
    { source:
        stringProperty(
          'Library-relative path of the entry to transfer.'),
      target:
        stringProperty(
          'Library-relative path of the destination.'),
      overwrite:
        booleanProperty(
          'Replace the target when it already exists.') },
    [ 'source',
      'target' ]);
}

function objectSchema(
    properties: Record<string, unknown>,
    required: string[] = [ ]
  ): Record<string, unknown>
{
  return { type: 'object',
           properties,
           ...(required.length > 0
             ? { required }
             : {}) };
}

function stringProperty(
    description: string
  ): Record<string, unknown>
{
  return { type: 'string',
           description };
}

function booleanProperty(
    description: string
  ): Record<string, unknown>
{
  return { type: 'boolean',
           description };
}

function numberProperty(
    description: string
  ): Record<string, unknown>
{
  return { type: 'number',
           description };
}

function stringArrayProperty(
    description: string
  ): Record<string, unknown>
{
  return { type: 'array',
           items:
             { type: 'string' },
           description };
}

function enumProperty(
    values: readonly string[],
    description: string
  ): Record<string, unknown>
{
  return { type: 'string',
           enum:
             [ ...values ],
           description };
}

function requireString(
    args: Record<string, unknown>,
    name: string
  ): string
{
  const value = args[name];

  if (
    typeof value
    !== 'string'
  ) {
    throw new Error(
      `Argument '${name}' is required and must be a string.`);
  }

  return value;
}

function optionalString(
    args: Record<string, unknown>,
    name: string
  ): string | undefined
{
  const value = args[name];

  if (value === undefined) {
    return undefined;
  }

  if (
    typeof value
    !== 'string'
  ) {
    throw new Error(
      `Argument '${name}' must be a string.`);
  }

  return value;
}

function optionalBoolean(
    args: Record<string, unknown>,
    name: string
  ): boolean | undefined
{
  const value = args[name];

  if (value === undefined) {
    return undefined;
  }

  if (
    typeof value
    !== 'boolean'
  ) {
    throw new Error(
      `Argument '${name}' must be a boolean.`);
  }

  return value;
}

function optionalNumber(
    args: Record<string, unknown>,
    name: string
  ): number | undefined
{
  const value = args[name];

  if (value === undefined) {
    return undefined;
  }

  if (
    typeof value
    !== 'number'
    || !Number.isInteger(value)
    || value <= 0
  ) {
    throw new Error(
      `Argument '${name}' must be a positive integer.`);
  }

  return value;
}

function optionalStringArray(
    args: Record<string, unknown>,
    name: string
  ): string[] | undefined
{
  const value = args[name];

  if (value === undefined) {
    return undefined;
  }

  if (
    !Array.isArray(value)
    || value.some(
      entry => typeof entry !== 'string')
  ) {
    throw new Error(
      `Argument '${name}' must be an array of strings.`);
  }

  return value as string[];
}

function optionalKind(
    args: Record<string, unknown>,
    name: string
  ): EntryKind | 'any' | undefined
{
  const value =
    optionalString(
      args,
      name);

  if (value === undefined) {
    return undefined;
  }

  if (
    value === 'file'
    || value === 'folder'
    || value === 'any'
  ) {
    return value;
  }

  throw new Error(
    `Argument '${name}' must be file, folder or any.`);
}
