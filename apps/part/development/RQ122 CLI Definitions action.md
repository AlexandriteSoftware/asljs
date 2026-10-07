# RQ122 CLI Definitions action

When CLI is invoked with Definitions action, it obtains a list of all
definitions and prints them in a report with these columns:

- `Name` - name of the definition.
- `Source` - `markdown` for definition documents, or the name of the plugin that
  provides the definition.
- `Location` - path of the definition document, relative to the project root;
  empty for plugin definitions.
