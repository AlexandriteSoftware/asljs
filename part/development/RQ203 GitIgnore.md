# RQ203 GitIgnore

`GitIgnore` is a class that helps filter files and folder lists based on
`.gitignore` files.

It has the following methods:

- `isIgnored(path: string): boolean` - checks if the given path is ignored.
- `filter(paths: string[]): string[]` - filters the given list of paths and
  returns only those that are not ignored.

`GitIgnore` collects `.gitignore` files starting from the file's folder and
going up to the project root until it reaches the repository root (folder with
the `.git` subfolder) or filesystem root. It caches collected `.gitignore`
files.

See also:

- [RQ132 CLI Project parameter][1]

[1]: <RQ132 CLI Project parameter.md>
