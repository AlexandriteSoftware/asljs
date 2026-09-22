# AGENTS

## Purpose

Use this file as AI-facing guidance for `asljs-kb`.

This package manages a markdown knowledge base: file and folder operations,
full text search, formatting, and structured data extraction.

There is one way in: the MCP server. The `kb` CLI is a client of it, not a
second implementation.

## AI Quick Reference

Public behavior at a glance:

- the CLI carries out no library operation itself; it connects to a running
  server, or starts one for that command and shuts it down
- a server is found at an address derived from the library root, so nothing is
  configured and no discovery file is written
- `kb-mcp --listen` leaves a server running; it outlives its standard input
  and stops on SIGINT or SIGTERM
- `--no-index` starts a server without an index, which is what the CLI does
  for a server it starts for one command
- `version` and `config` are the only CLI commands that do not go through a
  server, because they describe the tool rather than the library
- argument validation belongs to the tools, so the CLI passes values through
  and reports what the server rejects
- every operation happens inside one library root, resolved from `--library`,
  then `KB_LIBRARY`, then the working directory
- paths are library-relative POSIX paths, and a path that escapes the library
  is rejected with `LibraryPathError`
- `node_modules` and `.git` are always excluded from listings, searches and
  formatting
- dot files and dot folders are excluded unless `hidden` is set
- markdown is the base file type; other types take part through readers
- `TextReader` reads text files verbatim; `PdfReader` reads the PDF text layer
- search reports line and column into the reader text, which equals the file
  for verbatim readers and the extracted text for PDF
- `move` and `copy` place the source inside the target when the target is an
  existing folder, and otherwise treat the target as the final path
- `kb move` and `kb rename` rewrite the links the move would break, in the
  documents that point at the entry and inside the documents that moved;
  `--no-update-links` moves without touching a link
- `moveEntry` is the plain filesystem move and touches no link; `relocateEntry`
  is the one that repairs the library
- an existing target is never replaced unless `overwrite` is set
- `remove` refuses a non-empty folder unless `recursive` is set, and always
  refuses the library root
- `format` preserves front matter verbatim and re-prints only the body
- extraction line numbers refer to the whole file, front matter included
- `extractLinks` reports inline links, images, reference uses, reference
  definitions and wiki links, each with a line and a column
- backlinks scan markdown documents only, and resolve wiki names anywhere in
  the library, `/` paths from the root, and everything else from the folder of
  the linking document
- a backlinks target does not have to exist, so a rename or a deletion can be
  checked before and after
- `LinkGraph` holds the articles and the links between them in memory, with
  every destination resolved at index time
- the MCP server indexes at startup and keeps the index current by watching the
  library; the CLI has no index and scans directly
- `kb_backlinks` answers from the index, except when `pattern` is given, which
  the index cannot express and which falls back to a direct scan
- the index covers markdown documents only, under the `listEntries` exclusion
  rules
- `kb search` exits with 1 when nothing matches, `kb backlinks` exits with 1
  when nothing links to the entry, and `kb format --check` exits with 1 when a
  file needs formatting
- the MCP server reports tool failures as error results, not protocol errors

Use this package when:

- a repository or a notes folder needs scripted markdown library management
- an agent needs library-scoped file operations that cannot escape the root
- you need text search that also covers PDF text layers
- you need structured data out of markdown: headings, links, tasks, tables,
  code blocks, front matter
- you need to know what links to a document before renaming or removing it
- a long-running host needs link answers without re-reading the library

Do not assume:

- that every file type can be read; `ReaderRegistry.supports` decides
- that PDF line numbers match anything in the PDF file itself
- that scanned PDF files are searchable; there is no OCR
- that `format` rewrites YAML front matter; it does not
- that internal modules such as `output.js` are part of the public API
- that `environment.graph` is always set; it is absent in a server started
  with `--no-index`
- that a CLI command can call a core function directly; it calls a tool
- that the index is authoritative for file content; it holds links and titles,
  not text
- that `moveEntry` repairs links; only `relocateEntry` does
- that every link is rewritten; one that cannot be resolved, or cannot be
  located in the source, is reported and left alone

## Preferred Usage Patterns

- Use `runCli(...)` for the behavior of the `kb` executable, and
  `runMcpServer(...)` for the behavior of `kb-mcp`.
- Use `openClient(...)` to reach a library the way the CLI does, and
  `createInProcessClient(...)` when a test needs the tool layer without a
  process.
- Add a capability as a tool first. A CLI command is a caller of a tool, so a
  command without a tool cannot exist.
- Use `resolveLibraryPath` and `toLibraryPath` rather than joining paths, so
  that containment stays enforced.
- Use `listEntries` rather than walking the filesystem, so that the exclusion
  rules stay consistent.
- Use `parseMarkdown` plus the `extract*` helpers rather than parsing markdown
  with regular expressions.
- Use `findBacklinks` rather than grepping for a file name, because a raw
  search misses relative paths, root paths and wiki names.
- Use `relocateEntry` to move a document, and `moveEntry` only when links must
  stay exactly as they are.
- Use `LinkGraph` when the process outlives one request; use `findBacklinks`
  when it does not.
- Use `createDefaultReaderRegistry` to get the supported file types, and
  register a `DocumentReader` to add one.
- Keep stable public usage on the package-root exports; treat other `src/*`
  files as internal implementation unless they are re-exported.

## Edit Safety Checklist

- If changing path handling, then re-check that `..` and absolute paths cannot
  escape the library, in both `files.ts` and the MCP tools.
- If changing listing, then re-check the `node_modules`, `.git` and dot entry
  rules, because search and format build on `listEntries`.
- If changing markdown parsing, then re-check that node positions are mapped
  through `documentLine`, so that front matter offsets stay correct.
- If adding a reader, then re-check `verbatim`, because search reports line
  numbers differently for non-verbatim readers.
- If changing a CLI command, then re-check the text and the JSON output, and
  the exit code for `search`, `backlinks` and `format --check`.
- If adding a CLI command, then add the tool it calls; never reach past the
  client into the library.
- If changing the client, then re-check that closing it releases the socket
  and stops a server it started, or the process will not exit.
- If changing link extraction, then re-check `backlinks.ts`, which resolves
  `ExtractedLink` targets into library paths, and `graph.ts`, which indexes
  what it resolves.
- If changing link resolution, then keep the direct scan and the index in
  agreement; `graph.test.ts` asserts they answer identically.
- If changing link resolution, then re-check `link-rewrite.ts`, which turns a
  resolved target back into a target as written.
- If changing markdown parsing, then re-check `bodyOffset`, because rewriting
  edits the source by node offset.
- If changing the index, then re-check `remove`, because a stale entry in an
  incoming index outlives the document that wrote it.
- If adding or renaming a public export, then update `src/index.test.ts`, which
  pins the package-root API.
- If adding an MCP tool, then update the tool list assertions in
  `src/mcp/tools.test.ts` and `src/mcp/server.test.ts`.

## Code Shape

The package keeps to a shape that the reader can hold in their head. When
changing it, keep to it:

- no conditional expressions; use an early return, an `if`, or a named helper
  that answers the question;
- one job per function, named for that job. The median function is under
  twenty lines, and the ones above fifty are declarative: command definitions
  and tool schemas, which are data rather than logic;
- no promise chains; `await` a statement at a time, and catch where the
  failure is handled;
- a branch that picks between two values belongs in a helper named for what it
  picks, not inline in the expression that uses it;
- an option that no caller can reach is not configuration; delete it.

## Validation

From the repository root:

```pwsh
npm -w kb run test
npm -w kb run typecheck
npm -w kb run lint
npm -w kb run build
```

`test` runs the compiled tests from `build/`, so run `build` first, or use
`npm -w kb run all`.

## Boundaries

- `asljs-kb` does not index or cache; every command reads the filesystem.
- `asljs-kb` does not render markdown to HTML.
- `asljs-kb` does not perform OCR, and does not write PDF files.
- `asljs-kb` rewrites links only for a move or a rename; it does not repair
  links that were already broken.
