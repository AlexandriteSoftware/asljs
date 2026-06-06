# RQ203 GitIgnore

`GitIgnore` is a class that helps filter files and folder lists based on
`.gitignore` files.

It has the following methods:

- `constructor(path: string)` - initializes the `GitIgnore` instance with
  the root path.
- `isIgnored(path: string): boolean` - checks if the given path is ignored.
- `filter(paths: string[]): string[]` - filters the given list of paths and
  returns only those that are not ignored.
