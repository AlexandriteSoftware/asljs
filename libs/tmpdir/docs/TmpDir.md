# TmpDir

## Purpose

The public surface of `asljs-tmpdir`: creating a `TmpDir`, its options, the file
methods, path containment, and cleanup.

## Package exports

- `TmpDir` - a disposable temporary directory.
- `TmpDirOptions` - type. The constructor options.

## Constructor

- `new TmpDir(options?)`
- `new TmpDir(logger?, options?)` - `logger` is an `asljs-logging` `Logger`.
  Every public method writes a trace message to it. Without one, messages are
  discarded.

The constructor creates the directory synchronously, with a unique name, and
exposes its absolute path as `path`.

Options:

- `tmpDir` - the parent directory. Defaults to the system temporary directory.
- `prefix` - the directory name prefix. Defaults to `asljs-tmpdir-`.
- `keep` - declared in `TmpDirOptions`; the current implementation does not read
  it.

## Methods

Every path argument is relative to the temporary directory.

- `resolve(...segments)` - returns the absolute path of `segments` inside the
  directory.
- `mkdir(path)` - creates a directory, including missing parents, and returns
  its absolute path.
- `write(path, buffer)` - writes binary content, creating missing parent
  directories, and returns the absolute path.
- `writeText(path, text)` - writes UTF-8 text, creating missing parent
  directories, and returns the absolute path.
- `readText(path)` - reads a file as UTF-8 text.
- `stat(path)` - returns the `fs.Stats` of a file or directory.

## Path containment

`resolve`, and every method that takes a path, throws when:

- a segment is an absolute path
- the resolved path leaves the temporary directory, for example through `..`

## Cleanup

- `cleanup()` removes the directory and its contents; `cleanupSync()` does the
  same synchronously.
- `using` calls `cleanupSync()` and `await using` calls `cleanup()` at the end
  of the block.
- Cleanup runs once; a second call does nothing.
- A failure to remove the directory is logged as an error, not thrown.
- After cleanup, every file method throws.
