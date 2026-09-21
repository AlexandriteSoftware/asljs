# AGENTS

## Purpose

Use this file as AI-facing guidance for `asljs-kb`.

This package manages a markdown knowledge base: file and folder operations,
full text search, formatting, and structured data extraction, exposed through
the `kb` CLI and the `kb-mcp` MCP server.

## AI Quick Reference

Public behavior at a glance:

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
- that `environment.graph` is always set; it is absent in a one-shot process
- that the index is authoritative for file content; it holds links and titles,
  not text
- that moving an entry repairs the links that point at it; it does not, and
  `findBacklinks` is what reports them

## Preferred Usage Patterns

- Use `runCli(...)` for the behavior of the `kb` executable, and
  `runMcpServer(...)` for the behavior of `kb-mcp`.
- Use `resolveLibraryPath` and `toLibraryPath` rather than joining paths, so
  that containment stays enforced.
- Use `listEntries` rather than walking the filesystem, so that the exclusion
  rules stay consistent.
- Use `parseMarkdown` plus the `extract*` helpers rather than parsing markdown
  with regular expressions.
- Use `findBacklinks` rather than grepping for a file name, because a raw
  search misses relative paths, root paths and wiki names.
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
- If changing link extraction, then re-check `backlinks.ts`, which resolves
  `ExtractedLink` targets into library paths, and `graph.ts`, which indexes
  what it resolves.
- If changing link resolution, then keep the direct scan and the index in
  agreement; `graph.test.ts` asserts they answer identically.
- If changing the index, then re-check `remove`, because a stale entry in an
  incoming index outlives the document that wrote it.
- If adding or renaming a public export, then update `src/index.test.ts`, which
  pins the package-root API.
- If adding an MCP tool, then update the tool list assertions in
  `src/mcp/tools.test.ts` and `src/mcp/server.test.ts`.

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
- `asljs-kb` does not rewrite links when an entry is moved; `kb backlinks`
  reports them, and the edit is left to the caller.
