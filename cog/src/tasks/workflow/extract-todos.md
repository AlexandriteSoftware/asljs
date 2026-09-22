# `ExtractTodosTask` (`extract-todos`)

## Purpose

Collects every TODO entry from files matching the given glob patterns.

## Parameters

- `patterns` (`string[]`, optional) - defaults to `defaultTodoPatterns`
  (`**/*.ts`, `**/*.cs`, `**/*.md`).

## How it works

Delegates to `TodoTool.findAll(...patterns)`, which scans matching files for
lines starting with `// TODO:` (or, for Markdown, a bare `TODO:`), joining
continuation lines that keep the same comment prefix into a single entry.

## Returns

`Todo[]`, where each entry has:

- `todo` - the TODO body, comment prefix and leading whitespace removed;
- `excerpt` - the exact source text of the entry;
- `file` - the absolute file path;
- `startLine` / `endLine` - 1-based line numbers;
- `startPosition` / `endPosition` - character offsets of the TODO marker and
  the end of the last line.

## Notes

- Unlike `FindTodoTask`, this returns every match, not just the first one.
- Requires the `todos` tool.
