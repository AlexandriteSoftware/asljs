# `BuildTask` (`build`)

## Purpose

Builds the project in a working directory without throwing on a failed build,
so a caller (for example `TodoTask`) can inspect what went wrong and decide
what to do next.

## Parameters

- `workingDirectory` (optional) - defaults to `process.cwd()`.

## How it works

1. Calls `detectProjectKind(workingDirectory)`:
   - `npm` if `package.json` exists in the working directory;
   - otherwise `dotnet` if a `.slnx`, `.sln`, or `.csproj` file exists there
     (checked in that order);
   - otherwise `null`.
2. If no project kind is detected, logs a debug message and returns
   `{ tool: null, issues: [] }` without running any command.
3. For `npm`, runs `npm run build` through the `npm` tool
   (`NpmCliTool.build`).
4. For `dotnet`, runs `dotnet build <target>` through the `dotnet` tool
   (`DotnetCliTool.build`), where `target` is the detected solution or
   project file.
5. If the underlying tool throws (non-zero exit code), the error is caught and
   converted with `toCommandIssues()`, which splits the error message into
   trimmed, non-empty lines.

## Returns

`{ tool: 'npm' | 'dotnet' | null; issues: string[] }`. `issues` is empty on
success; a failing build never throws out of this task.

## Notes

- Requires the `npm` and `dotnet` tools to be registered on the context (both
  are registered by the CLI host).
- Does not stage, commit, or format anything; it only builds.
