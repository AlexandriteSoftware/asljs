# sfmt

> Part of [Alexandrite Software Library][1] - a set of high-quality, performant
> JavaScript libraries for everyday use.

## Overview

`asljs-sfmt` formats TypeScript in the Starcase style: one idea per line, so
code reads top to bottom and a change shows up in a diff as the lines it
touched. It is a command line tool, and an ESLint configuration that reports the
same rules in the editor.

```ts
function getIndentation(
    sourceCode: SourceCode,
    node: AST.Token
  ): string
{
  const nodeLocation =
    node.loc;

  if (
    nodeLocation === undefined
    || nodeLocation === null
  ) {
    return '';
  }

  const line =
    sourceCode.lines[nodeLocation.start.line - 1];

  const match =
    /^[ \t]*/.exec(line);

  return match?.[0] ?? '';
}
```

## Scope

- **TypeScript** (`.ts`, `.mts`, `.cts`). JavaScript files are left as they are.
- **The layout of declarations and statements**: imports, assignments, function
  signatures, `if` and `for` headers, calls and call chains, object and array
  literals, and the blank lines between statements.
- **Rewriting files in place**, so it fits a pre-commit step or a format script.
  It leaves comments where they are and refuses a change that would drop one.
- **An ESLint configuration** with the same rules, for feedback while editing
  and `--fix` in the editor.

It works on top of a general formatter: `toolkit flint` runs dprint first, and
sfmt refines the layout dprint produces.

## Installation

```bash
npm install --save-dev asljs-sfmt
```

NPM Package: [asljs-sfmt][21]

## Usage

Format every TypeScript file under the current directory, or the files that
match the given glob patterns:

```bash
npx sfmt format
npx sfmt format "src/**/*.ts"
```

`node_modules`, `dist` and `build` are skipped. `sfmt version` prints the
version.

Use the rules in ESLint, in `eslint.config.js`:

```js
import { eslintConfig }
  from 'asljs-sfmt';

export default eslintConfig;
```

The result, for an import and an object literal:

```ts
import { format,
         rules }
  from 'sfmt';

const options =
  { first: 'a',
    second:
      { a: 1,
        b: 2 },
    third:
      [ 'one',
        'two' ] };
```

## Further reading

- [Starcase Code Formatting Style][2] - the rules, the reasons behind them, and
  an example for each.
- [The source of sfmt][3] - formatted with sfmt, so every rule in a real
  codebase.

Questions and bugs: [asljs/issues][4].

## Related packages

- `asljs-toolkit` runs sfmt as part of `toolkit flint`, after dprint and before
  ESLint.

## License

MIT License. See [LICENSE][LIC] for details.

[1]: https://github.com/AlexandriteSoftware/asljs
[2]: FORMATTING.md
[3]: https://github.com/AlexandriteSoftware/asljs/blob/main/apps/sfmt/src
[4]: https://github.com/AlexandriteSoftware/asljs/issues
[21]: https://www.npmjs.com/package/asljs-sfmt
[LIC]: LICENSE.md
