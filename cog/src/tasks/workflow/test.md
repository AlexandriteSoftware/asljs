# `TestTask` (`test`)

## Purpose

Runs the project's tests in a working directory without throwing on failure,
mirroring `BuildTask` so a caller can inspect test issues and react to them.

## Parameters

- `workingDirectory` (optional) - defaults to `process.cwd()`.

## How it works

1. Calls `detectProjectKind(workingDirectory)` (same detection as
   `BuildTask`: `npm` if `package.json` exists, otherwise `dotnet` if a
   `.slnx`/`.sln`/`.csproj` file exists, otherwise `null`).
2. If no project kind is detected, logs a debug message and returns
   `{ tool: null, issues: [] }` without running any command.
3. For `npm`, runs `npm run test` through the `npm` tool (`NpmCliTool.test`).
4. For `dotnet`, runs `dotnet test <target>` through the `dotnet` tool
   (`DotnetCliTool.test`), where `target` is the detected solution or project
   file.
5. If the underlying tool throws (non-zero exit code), the error is caught and
   converted with `toCommandIssues()`, which splits the error message into
   trimmed, non-empty lines.

## Returns

`{ tool: 'npm' | 'dotnet' | null; issues: string[] }`. `issues` is empty on
success; failing tests never throw out of this task.

## Notes

- Requires the `npm` and `dotnet` tools to be registered on the context.
- Used by `TodoTask` in a retry loop that asks Copilot to fix reported issues.
