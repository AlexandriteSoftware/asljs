# Article

Markdown article: any markdown file in the project that git does not ignore.

A built-in definition of `asljs-part`, which implements its rules. Load it with
`--definitions "asljs-part;Article"`.

## Location

- Pattern: `/**/*.md`
- GitIgnore

## Rules

### RL1

Article start with a level 1 heading, which is the file name without extension.
Exceptions: when the file name is all caps (e.g., `README.md`).

### RL2

Links to local resources must point to existing locations (files or
directories). Links that are longer than 20 characters must be a reference link.

### RL3

Article must be formatted with dprint with the following configuration:

```json
{
  "markdown": {
    "lineWidth": 80,
    "newLineKind": "auto",
    "textWrap": "maintainAndWrap",
    "emphasisKind": "underscores",
    "strongKind": "asterisks",
    "unorderedListKind": "dashes",
    "headingKind": "atx",
    "listIndentKind": "commonMark"
  },
  "plugins": [
    "https://plugins.dprint.dev/markdown-0.25.0.wasm"
  ]
}
```

## Formatting with dprint

1. Install dprint: `npm install -g dprint`
2. Create configuration file `dprint.article.json` in the project root with the
   configuration above.
3. Run `dprint fmt --config dprint.article.json` to format all files in the
   project or `dprint fmt --config dprint.article.json <pattern>` to format
   specific files.
