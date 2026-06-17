# RQ101 CLI

The app provides CLI interface with the following argument schema:

```text
executable <action> [options]
```

Action is a positional parameter.

Options are parameters in one of these formats:

- `--name value` (preferred, in examples, in documentation, etc.)
- `--name=value`
- `--flag`

Option names use lowercase kebab-case.

Options can appear in any order after the action.

Some options can be flags, i.e. they do not have a value, and their presence
indicates that the flag is set.

When one of the following happens, the CLI stops with an error:

- An unknown action is specified.
- An unknown option is specified.
- An option is specified without a value, when the option requires a value.
