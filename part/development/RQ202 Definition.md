# RQ202 Definition

`Definition` is a type that represents [DF1 Definition][1]. It has the
following properties:

- `name` - the name of the definition, its file name without extension.
- `description` - a description of the definition, markdown context of the first
  section in the definition file, i.e. the content between `# Definition` and
  the next heading.
- `location` - specifies where the definition is located in the project. It has
  the following properties:
    - `type` - either `Files` or `Folders`.
    - `pattern` - file or folder glob pattern
    - `exclude` - list of file or folder paths to exclude.
    - `gitIgnore` - boolean, if true, the CLI tool will also exclude files and
      folders specified in `.gitignore` files.
- `properties` - a dictionary of properties.
- `rules` - a list of rules that apply to the artefacts that match the
  definition. It has the following properties:
    - `id` - a unique identifier of the rule, among other rules in this
      definition, in the form of `RL<number>`.
    - `description` - a description of the rule.
    - `filePath` - optional, the path to the file that implements the rule.

[1]: <DF1 Definition.md>
