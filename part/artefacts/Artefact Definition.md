# Artefact Definition

Artefact Definition is a markdown file, with the following content:

- `# <FileName>` - the name of the definition, should match the name of
  the markdown file (without extension).
- `# <FileName>` is followed by a description of the definition.
- `## Location` - required, specifies where the definition is located in
  the project. Has a list, with first item being either `Files: path/to/files`
  or `Folders: path/to/folders`, optionally followed by one or more
  `Exclude: path/to/exclude` items. When this list has item `GitIgnore`,
  the CLI tool will also exclude files and folders specified in `.gitignore`
  files. The paths are relative to the definition file.
- `## Rules` - optional, specifies rules that apply to the definition. Has
  a list of rules, each with an id and description. Rule ids should be in
  the form of `RL<number>`.

## Location

- Files: `**/*.md`
