# kb

> Part of [Alexandrite Software Library][#1] - a set of high-quality, performant
> JavaScript libraries for everyday use.

Knowledge base tooling for a markdown library: file and folder operations,
full text search, formatting, and structured data extraction, available both as
a CLI and as an MCP server.

Markdown is the base file type. Other file types are supported for the
operations that make sense for them; PDF files, for example, take part in text
search and can be read through their text layer.

## Installation

```bash
npm install asljs-kb
```

For CLI usage in a project or a notes folder:

```bash
npx kb --library ./notes list
```

## The Library

Every command works inside one library root. The root is resolved in this
order:

- the `--library <path>` option, if given;
- the `KB_LIBRARY` environment variable, if set;
- the current working directory.

All paths given to commands are relative to that root, and all reported paths
are library-relative POSIX paths. A path that resolves outside of the library
is rejected, so a knowledge base cannot be read from or written to through
`../`.

`node_modules` and `.git` are always excluded. Dot files and dot folders are
excluded unless `--hidden` is given.

## Quick Start

Create a note:

```bash
kb new notes/weekly-review --title "Weekly review" --tags team,weekly
```

```text
notes/weekly-review.md
```

The note starts with YAML front matter and a level 1 heading:

```markdown
---
title: Weekly review
created: 2026-01-02T03:04:05.000Z
tags:
  - team
  - weekly
---

# Weekly review
```

Find where a topic is discussed, across markdown and PDF alike:

```bash
kb search budget
```

```text
handbook.pdf:1:11: Quarterly budget handbook
notes/weekly-review.md:9:5: The budget is approved.
```

Pull the outline out of a document:

```bash
kb extract headings notes/weekly-review.md --format text
```

```text
# Weekly review (line 9)
## Decisions (line 13)
```

## Commands

File and folder operations:

- `kb list [pattern]` - list entries matching a glob pattern; `--kind` limits
  the result to `file` or `folder`.
- `kb read <path>` - print the text of a document.
- `kb write <path>` - write a text file; the content comes from `--content` or
  from standard input.
- `kb new <path>` - create a markdown note with front matter; `.md` is added
  when the path has no extension.
- `kb mkdir <path>` - create a folder, including missing parents.
- `kb move <source> <target>` - move or rename an entry.
- `kb copy <source> <target>` - copy an entry.
- `kb remove <path>` - remove an entry; `--recursive` is required for a
  non-empty folder.

Search, formatting, and extraction:

- `kb search <query>` - search the text of every readable document;
  `--regex`, `--case-sensitive`, `--pattern` and `--max-results` narrow the
  search.
- `kb format [pattern]` - format markdown files in place; `--check` reports the
  files that need formatting without writing them.
- `kb extract <kind> <path>` - extract `headings`, `links`, `tasks`, `tables`,
  `code`, `front-matter` or `all` from a markdown document.
- `kb backlinks <path>` - list the markdown links that point at an entry.
- `kb graph [path]` - report the article and link collections, or describe one
  article and its links in both directions.
- `kb info <path>` - print a summary of a document.

Diagnostics:

- `kb config` - print the effective configuration.
- `kb version` - print the package version.

Global options:

- `--library <path>` - library root.
- `--format <format>` - `text` or `json`. `extract` defaults to `json`, every
  other command defaults to `text`.
- `--loglevel <level>` and `--logfile <path>` - logging, also settable through
  `KB_LOG_LEVEL` and `KB_LOG_FILE`.

Exit codes are `0` on success and `1` on failure. Three commands report a
negative outcome with `1` as well: `search` when nothing matches, `backlinks`
when nothing links to the entry, and `format --check` when at least one file
needs formatting.

## Moving And Copying

`move` and `copy` take the target as the final path, with one exception: when
the target is an existing folder, the entry is placed inside it under its own
name.

```bash
kb move notes/one.md archive        # archive/one.md
kb move notes/one.md archive/two.md # archive/two.md
```

An existing target is never replaced unless `--overwrite` is given.

Moving an entry does not rewrite the links that point at it. Run
`kb backlinks` first to see what a move would break.

## Search

Search reads every file that has a registered reader:

- markdown and other text files are searched verbatim, so the reported line and
  column point into the file;
- PDF files are searched through their extracted text layer, so the reported
  line points into that text rather than into the file.

Matching is case-insensitive by default and reports at most one match per line.

```bash
kb search "^## " --regex --pattern "notes/**/*.md"
```

Scanned PDF files without a text layer produce no matches; `kb` does not
perform OCR.

## Extraction

`kb extract` reads structured data from a markdown document. Line numbers refer
to the whole file, front matter included.

- `headings` - level, text, anchor slug, line.
- `links` - inline links, images, reference links, and `[[wiki links]]`.
- `tasks` - GFM task list items with their checked state.
- `tables` - GFM tables as headers plus rows.
- `code` - fenced and indented code blocks with their language.
- `front-matter` - the parsed YAML mapping, or `null`.
- `all` - every kind above, in one object.

## Backlinks

`kb backlinks <path>` scans the markdown documents of the library and reports
every link that points at one entry, with the file, line, column, link kind and
the target as written:

```bash
kb backlinks notes/budget.md
```

```text
archive/2025.md:14:3: inline ../notes/budget.md
archive/2025.md:31:1: definition ../notes/budget.md
inbox/quick.md:3:16: wiki budget
```

The entry does not have to exist, so this answers two questions: what a rename
would break, and what still points at a note that is already gone.

A link counts as pointing at the entry when:

- it is a wiki link written as a bare name, and the entry has that name, in any
  folder;
- it is a wiki link containing a slash, and that path, resolved from the
  library root, is the entry;
- it starts with `/`, and that path, resolved from the library root, is the
  entry;
- it is any other relative target that, resolved from the folder of the linking
  document, is the entry.

Fragments and query strings are dropped before resolving, so
`budget.md#summary` counts. A target without an extension also matches the
markdown file of that name, so `[budget](budget)` counts. External URLs, bare
fragments such as `[here](#plan)`, and paths that leave the library never
count.

Inline links, images, and link reference definitions are all reported, because
each holds a path that a rename has to update. A `[text][id]` reference is not
reported on its own; its `[id]: path` definition is.

Only markdown documents are scanned, since only they carry links.

## The Link Index

The library is two collections: the articles, and the links between them.
`LinkGraph` holds both in memory, with every link destination resolved once,
at index time, by the rules above.

`kb-mcp` builds the index before it serves its first request and then keeps it
current by watching the library, so link questions are answered from memory
rather than by re-reading the library. `kb_backlinks` is served from the index,
except when `pattern` narrows the documents to scan, which the index cannot
express; that request falls back to a direct scan.

The CLI is a one-shot process with no index to reuse, so `kb backlinks` always
scans directly. Both paths share one set of resolution rules and are pinned to
the same answers by test.

```bash
kb graph
```

```text
articles: 128
links: 412
external: 63
```

```bash
kb graph notes/budget.md
```

```text
path: notes/budget.md
title: The budget
outgoing: 2
  -> ../archive/2025.md (line 12)
  -> https://example.com (line 18)
incoming: 3
  <- archive/2025.md:14:3 ../notes/budget.md
  <- inbox/quick.md:3:16 budget
  <- notes/plan.md:7:5 budget.md
```

Watching follows the library live: a change naming a markdown file re-indexes
that one file, and anything else, such as a renamed folder, rebuilds the index.
Changes are debounced, so a burst of writes collapses into one update.
Recursive watching is not available on every platform; where it cannot start,
the server logs it, keeps serving, and the index simply stops following
changes.

The index covers markdown documents only, under the same exclusion rules as
`kb list`.

## Formatting

`kb format` re-prints markdown in the repository markdown style: ATX headings,
`-` bullets, `_` emphasis, `*` strong, and fenced code blocks. Front matter is
preserved verbatim, because re-printing YAML would lose comments and key order.

## MCP Server

`kb-mcp` serves the same operations to an MCP client over stdio:

```json
{
  "mcpServers": {
    "kb": {
      "command": "npx",
      "args": ["kb-mcp", "--library", "/path/to/library"]
    }
  }
}
```

The tools are `kb_list`, `kb_read`, `kb_write`, `kb_new`, `kb_mkdir`,
`kb_move`, `kb_copy`, `kb_remove`, `kb_search`, `kb_backlinks`, `kb_graph`,
`kb_format`, `kb_extract` and `kb_info`. Each returns its result as JSON text,
and reports a failure as an error result rather than as a protocol error.

The server indexes the library at startup and watches it for changes, so
`kb_backlinks` and `kb_graph` answer from memory. `kb_graph` reports `live`,
which says whether the answer came from the index the server keeps current or
from one built for that one request.

Standard output carries the JSON-RPC stream, so the MCP server logs nothing
unless `KB_LOG_FILE` names a file to write to.

## Embedding

If you want to embed `kb` in your own tooling instead of shelling out, import
the package-root helpers from `asljs-kb`:

```js
import { createDefaultReaderRegistry, searchLibrary } from 'asljs-kb';

const report =
  await searchLibrary(
    '/path/to/library',
    createDefaultReaderRegistry(),
    { query: 'budget' });
```

`runCli(...)` gives the same behavior as the `kb` executable, and
`runMcpServer(...)` the same behavior as `kb-mcp`.

[#1]: https://github.com/AlexandriteSoftware/asljs
