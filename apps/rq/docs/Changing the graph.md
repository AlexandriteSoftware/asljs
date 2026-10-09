# Changing the graph

Commands that change the structure of the graph, so that no one edits links or
results by hand. Each prints the files it created, changed or removed.

Every command takes `--working-dir <folder>`; see [Working folder][WF] for how
paths, ids and `.md` names are resolved. The scope - every `.md` document of the
working folder - is where the next free id, the links to rewrite or remove, and
another parent of a requirement being linked are looked for.

## rq add requirement

```text
rq add requirement <parent> <name> [--statement <text>] [--path <file>]
                   [--working-dir <folder>]
```

Creates `R<n> <name>.md` in the parent's folder, with `<n>` the highest `R`
number in the scope plus one, a level 1 heading equal to the file name, and the
statement. Adds a link to it to the parent's `## Implementation` list.

- `<parent>` must be a requirement; `<name>` must not contain `/` or `\`.
- `--path` gives the new file's path instead; its name must still start with
  `R<n>` (`T<n>` for a test), and its heading is its file name.
- An existing file is an error.

## rq add test

```text
rq add test <parent> <name> [--description <text>] [--step <command>]...
                [--path <file>] [--working-dir <folder>]
```

Like `add requirement`, but creates `tests/T<n> <name>.md` next to the parent,
with the description and a `## Steps` section holding one `shell` step, `###
Step <n>`, per `--step`. Write other kinds of steps by editing the text; see
[Requirements][RM].

## rq link

```text
rq link <parent> <child> [--working-dir <folder>]
```

Adds a link to an existing requirement or test to the parent's `##
Implementation` list. Refused when the parent is a test, when it already links
to the child, when the child leads back to the parent, or when the child is a
requirement another requirement of the scope already links to: a requirement has
one parent, a test may have several.

## rq unlink

```text
rq unlink <parent> <child> [--working-dir <folder>]
```

Removes every link from the parent to the child: an `## Implementation` item
holding one goes with it, a link definition goes with its line, and any other
link, or reference to a removed definition, is replaced by its text. An error
when the parent does not link to the child.

## rq remove

```text
rq remove <file> [--recursive] [--working-dir <folder>]
```

Deletes a requirement or a test, and removes the links to it from every document
of the scope, as `unlink` does. A requirement that links to anything is refused
unless `--recursive` is given; then every document only removed documents link
to is removed too, down the graph.

## rq move

```text
rq move <file> <destination> [--working-dir <folder>]
```

Moves or renames a requirement or a test. `<destination>` is the new path, or an
existing folder to move it into; an existing file is an error, and so is a name
of another kind, e.g. an `R` file renamed to `T` or `notes.md`.

- Links to it from every document of the scope point at the new path, keeping
  their `#` fragments.
- Its own relative links, including images, are rewritten for its new folder.
- When its heading is its old file name, the heading becomes the new file name,
  and so does the text of `## Implementation` links that was the old heading.

## rq log

```text
rq log <test> --status PASS|FAIL [--note <text>] [--time <time>] [--working-dir <folder>]
```

Records a result established another way: writes an execution file, `.rq/E<n>
<test>.md` in the working folder, with the one test, its status and the note, in
the format [`rq test`][TS] writes. `<test>` is a test file or id, e.g. `T12`.
`--time` is ISO 8601, now by default; the note is written on one line. The test
itself is not changed, except that the statuses are then recalculated and
written as [`rq test`][TS] does.

[TS]: <rq test.md>
[RM]: Requirements.md
[WF]: Requirements.md#working-folder
