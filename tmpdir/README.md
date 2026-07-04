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

using const tmpDir =
  new TmpDir();

// optional, writeText will create a path
// to the file if it doesn't exist
await tmpDir.mkdir('example');

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

## License

MIT License. See [LICENSE](LICENSE.md) for details.
