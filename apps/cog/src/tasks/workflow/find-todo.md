# `FindTodoTask` (`find-todo`)

## Purpose

Returns the first TODO found in the codebase, or `null` if there is none.
Used to drive TODO-based workflows (see `TodoTask`) without loading every
TODO up front.

## Parameters

- `patterns` (`string[]`, optional) - defaults to `defaultTodoPatterns`
  (`**/*.ts`, `**/*.cs`, `**/*.md`).

## How it works

1. Logs the patterns being searched (trace level).
2. Delegates to `TodoTool.findOne(...patterns)`, which is equivalent to
   `findAll(...patterns)[0] ?? null` (see `ExtractTodosTask` /
   `TodoTool.findAll` for the TODO parsing rules).
3. Logs whether a TODO was found (debug level).

## Returns

`Todo | null` (see `ExtractTodosTask` for the `Todo` shape).

## Notes

- Writes no output of its own and does not change context data; it only
  reports progress through the context logger.
- Requires the `todos` tool.
