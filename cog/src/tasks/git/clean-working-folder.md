# `CleanWorkingFolderTask` (`clean-working-folder`)

## Purpose

Backs up all local Git changes (diff and untracked files) to a single file,
then discards those changes so the working folder matches `HEAD`.

## Parameters

- `workingDirectory` (optional) - defaults to `process.cwd()`.

## How it works

1. Reads the diff against `HEAD` with `git.getDiff()`.
2. Reads the list of untracked paths with `git.getUntrackedFiles()`, then
   reads each untracked file's content into memory and base64-encodes it.
3. Discards all local changes with `git.discardAllChanges()`, which runs
   `git checkout -- .` (restores tracked files) then `git clean -fd` (removes
   untracked files and directories).
4. Only after the working tree is clean does it write the captured diff and
   untracked file contents to `clean.<timestamp>.bak` (JSON) in the working
   directory. Writing the backup after the clean step is deliberate: the
   backup file is untracked at creation time, so writing it before `git clean
   -fd` would delete it.
5. Returns the absolute path to the backup file.

## Backup file format

```json
{
  "diff": "diff --git a/file b/file\n...",
  "untrackedFiles": [
    { "path": "relative/path.txt", "contentBase64": "..." }
  ]
}
```

## Notes

- Requires the `git` tool.
- Irreversible for anything not captured: only the diff against `HEAD` and
  untracked file bytes are preserved, not repository history.
