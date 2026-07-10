# tmpdir

> Part of [Alexandrite Software Library][1] – a set of high‑quality,
performant JavaScript libraries for everyday use.

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

### Custom tracing handler

```js
import { TmpDir,
         formatMessage }
  from 'asljs-tmpdir';

using tmpDir =
  new TmpDir(
    { trace:
        (message, ...params) =>
          console.log(
            formatMessage(
              message,
              ...params)) });

await tmpDir.writeText(
  'example/file.txt',
  'Hello, world!');
```

### Strict error handling

Failing to clean up is not a critical error so the default behavior is to log
a warning to the console. Replacing the error handler makes it more strict.

```js
import { TmpDir,
         tmpDirThrowErrorFunction }
  from 'asljs-tmpdir';

using tmpDir =
  new TmpDir(
    { error: tmpDirThrowErrorFunction });
```

## License

MIT License. See [LICENSE](LICENSE.md) for details.
