# tmpdir

> Part of [Alexandrite Software Library][1] – a set of high‑quality, performant
> JavaScript libraries for everyday use.

## Overview

`asljs-tmpdir` creates a temporary directory for Node.js, gives you helpers to
work with files inside it, and removes it when you are done. It is built for
tests and short-lived scratch work.

## Scope

- **A unique directory per instance**, in the system temporary directory or a
  parent of your choice.
- **File helpers** for creating directories and writing and reading files, all
  with paths relative to the temporary directory.
- **Automatic cleanup** at the end of a `using` or `await using` block.
- **Path containment.** A path that resolves outside the temporary directory
  throws.

## Installation

```bash
npm install asljs-tmpdir
```

NPM Package: [asljs-tmpdir][21]

## Usage

```ts
import { TmpDir }
  from 'asljs-tmpdir';

using tmpDir =
  new TmpDir();

await tmpDir.writeText(
  'example/file.txt',
  'Hello, world!');

console.log(
  await tmpDir.readText(
    'example/file.txt'));

// the temporary directory and its contents
// will be automatically deleted at the end of
// the using block
```

Pass an `asljs-logging` logger as the first argument to trace every call:

```ts
import { PinoLoggerProvider }
  from 'asljs-logging';
import { TmpDir }
  from 'asljs-tmpdir';

await using loggerProvider =
  new PinoLoggerProvider(
    { level: 'trace' });

using tmpDir =
  new TmpDir(
    loggerProvider.getLogger('TmpDir'));
```

## Further reading

- [TmpDir][2] - constructor options, every method, path containment and cleanup.

Questions and bugs: [asljs/issues][3].

## Related packages

- `asljs-logging` provides the logger `TmpDir` traces through.

## License

MIT License. See [LICENSE][LIC] for details.

[1]: https://github.com/AlexandriteSoftware/asljs
[2]: docs/TmpDir.md
[21]: https://www.npmjs.com/package/asljs-tmpdir
[3]: https://github.com/AlexandriteSoftware/asljs/issues
[LIC]: LICENSE.md
