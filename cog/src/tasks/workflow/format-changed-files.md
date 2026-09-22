# `FormatChangedFilesTask` (`format-changed-files`)

## Purpose

Formats every changed file in a working directory using the formatter that
matches its extension.

## Parameters

- `workingDirectory` (optional) - defaults to `process.cwd()`.
- `asljsConfigPath` (optional) - dprint config for TypeScript, default
  `dprint.json`.
- `markdownConfigPath` (optional) - dprint config for Markdown, default
  `dprint.md.json`.
- `dotnetTarget` (optional) - solution/project file used for C# formatting.
- `dotnetProfile` (optional) - `jb cleanupcode` profile name.

## How it works

1. Runs `get-changed-files` to get the list of modified, staged, renamed,
   copied, and untracked paths.
2. Filters that list down to paths that currently exist as files (deleted
   paths are dropped).
3. Splits the remaining files by extension:
   - `.ts` / `.tsx` -> TypeScript;
   - `.md` -> Markdown;
   - `.cs` -> C#.
   Files with any other extension are ignored.
4. Runs `AsljsFormatterTool.format()` for the TypeScript files with
   `asljsConfigPath`.
5. Runs `DprintFormatterTool.format()` for the Markdown files with
   `markdownConfigPath`.
6. If there are C# files, resolves a target (`dotnetTarget` if given,
   otherwise the first `.slnx`, `.sln`, or `.csproj` file found in the
   working directory, checked in that order - throws if none exists) and
   runs `JbDotnetFormatterTool.format()` with `dotnetProfile`.
7. Returns the subset of changed files that were actually routed to a
   formatter (TypeScript, Markdown, or C#).

## Returns

`string[]` - the changed files that were formatted.

## Failure modes

- Throws if C# files need formatting and no `.slnx`/`.sln`/`.csproj` target
  can be found or was provided.
- Propagates any formatter tool failure (non-zero exit code).

## Notes

- Requires the `git`, `asljs-formatter`, `dprint-formatter`, and
  `jb-dotnet-formatter` tools.
