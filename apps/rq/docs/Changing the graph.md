# Changing the graph

Commands that change the structure of the graph, so that no one edits links or
log entries by hand. Paths are relative to the working directory. Each prints
the files it created, changed or removed.

Some commands look at every `.md` document of a folder, the scope: for the next
free id, and for the links to rewrite or remove. `--in <folder>` sets it; the
working directory is the default.

## rq add requirement

```text
rq add requirement <parent> <name> [--statement <text>] [--path <file>]
                   [--in <folder>]
```

Creates `RQ<n> <name>.md` in the parent's folder, with `<n>` the highest `RQ`
number in the scope plus one, a level 1 heading equal to the file name, and the
statement. Adds a link to it to the parent's `## Implementation` list.

- `<parent>` must be a requirement; `<name>` must not contain `/` or `\`.
- `--path` gives the new file's path instead; its heading is its file name.
- An existing file is an error.

## rq add evidence

```text
rq add evidence <parent> <name> [--description <text>] [--step <command>]...
                [--path <file>] [--in <folder>]
```

Like `add requirement`, but creates `evidence/EV<n> <name>.md` next to the
parent, with the description and a `## Steps` code block holding one line per
`--step`.

## rq link

```text
rq link <parent> <child>
```

Adds a link to an existing requirement or evidence to the parent's `##
Implementation` list. Refused when the parent is an evidence, when it already
links to the child, or when the child leads back to the parent.

## rq unlink

```text
rq unlink <parent> <child>
```

Removes every link from the parent to the child: an `## Implementation` item
holding one goes with it, a link definition goes with its line, and any other
link, or reference to a removed definition, is replaced by its text. An error
when the parent does not link to the child.

## rq remove

```text
rq remove <file> [--recursive] [--in <folder>]
```

Deletes a requirement or an evidence, and removes the links to it from every
document of the scope, as `unlink` does. A requirement that links to anything is
refused unless `--recursive` is given; then every document only removed
documents link to is removed too, down the graph.

## rq move

```text
rq move <file> <destination> [--in <folder>]
```

Moves or renames a requirement or an evidence. `<destination>` is the new path,
or an existing folder to move it into; an existing file is an error.

- Links to it from every document of the scope point at the new path, keeping
  their `#` fragments.
- Its own relative links, including images, are rewritten for its new folder.
- When its heading is its old file name, the heading becomes the new file name,
  and so does the text of `## Implementation` links that was the old heading.

## rq log

```text
rq log <evidence> --status Passed|Failed [--note <text>] [--time <time>]
```

Appends `- <time> <status> - <note>` to the evidence's `## Log`, adding the
section when it is missing. `--time` is ISO 8601, now by default; the note is
written on one line. `rq verify` logs its runs the same way; this command
records a result established another way.
