# Requirements

KB is a knowledge base tool for a markdown library. It provides file and folder
operations, full text search, formatting, and structured data extraction,
through a command line interface and through an MCP server.

## Library

All work happens inside one library root.

The root is resolved in this order:

- the explicit value, from `--library <path>` on the CLI or `kb-mcp`;
- the `KB_LIBRARY` environment variable;
- the current working directory.

Paths given to an operation are relative to the root. Absolute paths are
accepted when they stay inside the root. A path that resolves outside of the
root is rejected with `LibraryPathError`, and the operation does not run.

Reported paths are library-relative and use POSIX separators, so that output is
stable across platforms. The root itself is reported as `.`.

Listings, searches and formatting always exclude `node_modules` and `.git`.
They exclude dot files and dot folders unless the `hidden` option is set.

## File Types

Markdown is the base file type. Other file types participate through readers.

A reader declares the extensions it handles, whether it returns file content
verbatim, and how to extract text. The default registry has two readers:

- the text reader, for `.md`, `.markdown`, `.mdx`, `.txt`, `.text`, `.csv`,
  `.json`, `.yml` and `.yaml`, returning file content verbatim;
- the PDF reader, for `.pdf`, returning the text layer of the document, with
  pages separated by a line break.

Operations that need document text - search, read, info - work for any file
type with a registered reader. Operations that need markdown structure -
extraction, formatting, note creation - are markdown only.

There is no OCR: a scanned PDF without a text layer yields empty text.

## File And Folder Operations

- listing returns entries matching a glob pattern, with kind, size in bytes,
  and modification time, sorted by path;
- reading returns the text of one file, through its reader;
- writing stores UTF-8 text, creating missing parent folders;
- note creation writes YAML front matter with `title`, `created` and optional
  `tags`, followed by a level 1 heading, and appends `.md` when the path has no
  extension;
- folder creation creates missing parents;
- moving and copying transfer one entry;
- removal deletes one entry.

Transfer rules:

- if the target is an existing folder, then the entry is placed inside it under
  its own name;
- otherwise the target is the final path;
- if the target exists and `overwrite` is not set, then the operation fails;
- if the source is a folder and the target is inside it, then the operation
  fails.

Removal rules:

- if the entry is a non-empty folder and `recursive` is not set, then the
  operation fails;
- the library root is never removed.

Writing rules:

- if the file exists and `overwrite` is not set, then the operation fails.

## Search

Search scans every file that matches the pattern and has a registered reader.

- the query is literal text by default, and a regular expression when `regex`
  is set;
- matching is case-insensitive unless `ignoreCase` is disabled;
- at most one match is reported per line;
- each match carries the file path, a one-based line, a one-based column, and
  the trimmed text of the line;
- `maxMatchesPerFile` caps the matches taken from one file, and `maxResults`
  caps the whole result and marks it truncated;
- a file whose reader fails is skipped and reported with its reason.

Line numbers refer to the text the reader produced. For a verbatim reader that
is the file itself. For PDF it is the extracted text.

## Formatting

Formatting re-prints a markdown document in the repository markdown style: ATX
headings, `-` bullets, `_` emphasis, `*` strong, and fenced code blocks.

YAML front matter is preserved verbatim, because re-printing it would lose
comments and key order.

Formatting is idempotent: formatting an already formatted document produces the
same text.

The library-level operation reports every visited file with a changed flag, and
either writes the changed files or leaves them untouched when `write` is
disabled.

## Extraction

Extraction reads structured data from a markdown document. Front matter is
parsed as YAML; a block that is absent, unterminated, invalid, or not a mapping
yields `null`.

The supported kinds are:

- `headings`: level, text, GitHub-style anchor slug, line;
- `links`: inline links, images, reference uses, reference definitions and
  `[[wiki links]]`, each with kind, target, text, line and column. A reference
  use carries the definition identifier as its target; the matching definition
  carries the path;
- `tasks`: GFM task list items with their checked state;
- `tables`: GFM tables, as a header row plus body rows;
- `code`: fenced and indented code blocks, with language and content;
- `front-matter`: the parsed mapping;
- `all`: every kind above, in one object.

Reported line numbers refer to the whole document, front matter included.

## Backlinks

Backlinks answer which documents link to one entry.

Only markdown documents are scanned, because only they carry links. The entry
itself does not have to exist, so backlinks can be inspected before a file is
created, and after it is moved or removed.

A link points at the entry when one of these holds:

- if the link is a wiki link written as a bare name, then it matches any
  document with that name, in any folder;
- if the link is a wiki link containing a slash, then its path is resolved from
  the library root;
- if the target starts with `/`, then its path is resolved from the library
  root;
- otherwise the target is resolved from the folder of the linking document.

Before resolving, the fragment and the query string are dropped, so an anchored
link counts. A target without an extension also matches the markdown file of
that name.

These never count: a reference use, which carries an identifier rather than a
path; an external URL; a bare fragment; and a path that leaves the library.

By default a document's links to itself are excluded; `includeSelf` includes
them.

Each backlink carries the path of the linking document, a one-based line and
column, the link kind, the target as written, and the link text.

Moving an entry does not rewrite the links that point at it. Backlinks report
what a move or a removal would break; the edit is left to the caller.

## Link Index

The library is modelled as two collections: the articles, and the links between
them. `LinkGraph` holds both in memory.

An article carries its library path, its title, its size, and its modification
time. The title is the `title` front matter value, else the first level 1
heading, else the file name without its extension.

A link carries the document it is written in, its line and column, its kind,
the target as written, its text, and the library paths it resolves to.
Destinations are resolved once, at index time, by the backlink rules above. A
link that leaves the library resolves to nothing and is counted as external.

The index covers markdown documents only, under the same exclusion rules as
listing.

Maintenance:

- the whole library is indexed on a rebuild;
- one document is re-indexed on an update, which replaces what was held for it;
- an update for a document that is gone, or that is not markdown, removes it;
- removing a document drops it and every link it wrote, but not the links that
  point at it, so a removed document still reports its backlinks.

A host keeps the index current by watching the library. Changes are debounced,
so a burst collapses into one update. A change naming a markdown file
re-indexes that file; anything else, such as a renamed folder or a platform
that reports no file name, triggers a rebuild. Recursive watching is not
available on every platform; where it cannot start, the failure is logged and
the index stops following changes rather than failing the host.

The MCP server indexes at startup and watches. The CLI does not: a one-shot
process has no index to reuse, so it scans directly, and a CLI command that
needs the collections builds an index for that one request.

Backlinks are answered from the index when a host keeps one, and by a direct
scan otherwise. Both paths apply the same resolution rules and return the same
answers.

## Command Line Interface

The CLI is `kb`. Commands are `list`, `read`, `write`, `new`, `mkdir`, `move`,
`copy`, `remove`, `search`, `backlinks`, `graph`, `format`, `extract`, `info`,
`config` and `version`.

Output format is `text` or `json`, chosen with the global `--format` option.
`extract` defaults to `json`, because its result is structured data; every
other command defaults to `text`.

Exit codes:

- `0` on success;
- `1` on failure, with the message written to standard error;
- `1` from `search` when nothing matches;
- `1` from `backlinks` when nothing links to the entry;
- `1` from `format --check` when at least one file needs formatting.

Logging is off the output path. `--loglevel` and `--logfile` take precedence
over `KB_LOG_LEVEL` and `KB_LOG_FILE`.

## MCP Server

The MCP server is `kb-mcp`. It speaks line-delimited JSON-RPC 2.0 over stdio
and implements `initialize`, `tools/list` and `tools/call`.

The tools are `kb_list`, `kb_read`, `kb_write`, `kb_new`, `kb_mkdir`,
`kb_move`, `kb_copy`, `kb_remove`, `kb_search`, `kb_backlinks`, `kb_graph`,
`kb_format`, `kb_extract` and `kb_info`. Each declares a JSON Schema for its
arguments, validates them, and returns its result as JSON text.

The server indexes the library before serving its first request, and watches it
afterwards, so link questions are answered from memory.

A tool failure is reported as a successful response carrying `isError`, as the
protocol requires. Only an unknown method produces a JSON-RPC error.

Standard output carries the protocol, so the server logs nothing unless
`KB_LOG_FILE` names a file to write to. A line that is not valid JSON is
ignored.
