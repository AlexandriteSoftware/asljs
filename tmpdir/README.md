# tmpdir

> Part of [Alexandrite Software Library][1] – a set of high‑quality, performant
> JavaScript libraries for everyday use.

Disposable temporary directory helper for Node.js.

[1]: https://github.com/AlexandriteSoftware/asljs

## Features

- Create a temporary directory with a unique name
- Provides helpers for creating files and subdirectories
- Automatically cleans up the temporary directory when done
- Prevents escaping the temporary directory path

## Installation

```bash
npm install asljs-tmpdir
```

NPM Package: [asljs-tmpdir][21]

[21]: https://www.npmjs.com/package/asljs-tmpdir

## Usage

### Basic

```js
import {
  TmpDir
} from 'asljs-tmpdir';

using tmpDir = new TmpDir();

await tmpDir.writeText(
  'example/file.txt',
  'Hello, world!'
);

console.log(
  await tmpDir.readText(
    'example/file.txt'
  )
);

// the temporary directory and its contents
// will be automatically deleted at the end of
// the using block
```

### Optional logger

```js
import {
  createPinoLoggerProvider
} from 'asljs-logging';
import {
  TmpDir
} from 'asljs-tmpdir';

await using loggerProvider =
  createPinoLoggerProvider(
    { level: 'trace' }
  );

using tmpDir = new TmpDir(
  loggerProvider.getLogger('TmpDir')
);

await tmpDir.writeText(
  'example/file.txt',
  'Hello, world!'
);
```

## License

MIT License. See [LICENSE](LICENSE.md) for details.
