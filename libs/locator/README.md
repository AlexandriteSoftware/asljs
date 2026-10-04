# locator

> Part of [Alexandrite Software Library][1] – a set of high‑quality, performant
> JavaScript libraries for everyday use.

## Overview

`asljs-locator` locates files by glob patterns, exclusions and filters such as
`.gitignore`.

A location says where a set of files lives: the patterns that match them, the
patterns that take them away again, and the filters that drop whatever should
never have been listed. `.gitignore` is one of those filters, so a tool can
honour it without reimplementing it.

A pattern beginning with `/` resolves against the root the resolver was built
with. Any other pattern resolves against the base path given to the call. That
pair is what lets one vocabulary describe both a repository-wide location and a
location relative to the file that declared it.

## Scope

Finding paths, and answering whether a path belongs to a location. Reading the
files it finds is the caller's business.

## Installation

```bash
npm install asljs-locator
```

NPM Package: [asljs-locator][NPM]

## Usage

```js
import {
  LocationResolver
} from 'asljs-locator';
import {
  NullLogger
} from 'asljs-logging';

const resolver = new LocationResolver(new NullLogger(), process.cwd());

const files = await resolver.resolve(process.cwd(), {
  patterns: ['docs/**/*.md'],
  exclude: ['docs/drafts/**'],
  filters: [{ name: 'GitIgnore' }]
});
```

`resolve` returns absolute paths, deduplicated and sorted. Give it one location
or several; several are merged.

`check` answers the same question for a single path without walking the tree,
which is what makes it usable per file:

```js
const belongs = await resolver.check(
  '/repo/docs/guide.md',
  '/repo',
  { pattern: 'docs/**/*.md' }
);
```

Patterns must be all files or all directories; a directory pattern ends with
`/`. Mixing them throws, because the two cannot be globbed in one pass.

## Further reading

- [Architecture][2] for where this sits among the packages.

Questions and bugs: [asljs/issues][ISS].

## Related packages

- [asljs-logging][3] provides the logger the resolver traces through.

## License

MIT License. See [LICENSE][LIC] for details.

[1]: https://github.com/AlexandriteSoftware/asljs
[2]: ../../docs/Architecture.md
[3]: ../logging/README.md
[ISS]: https://github.com/AlexandriteSoftware/asljs/issues
[LIC]: LICENSE.md
[NPM]: https://www.npmjs.com/package/asljs-locator
