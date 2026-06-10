# Rule File

A rule file is a file that implements a rule for a definition.

- Its name is in the form of `<DefinitionName>_<RuleId>.<extension>`, for
  example, `Todo Item_R1.js`.
- The first comment in the rule file should have the exact text from
  the rule description in the definition file. See examples below.
- JS rule files export a function `validate` that takes an artefact and
  a context, and either completes or throws an error. If it completes, the rule
  is satisfied, otherwise it fails.
- Any other rule extension is threated as an executable file that returns 0 if
  the rule is satisfied and non-zero otherwise. When non-zero is returned,
  the stderr is used as the message for the rule failure.

## Location

- Files: `rules/**/*.js`

## Rules

- RL1 - the first comment in the JS rule file should be multiline and include
  the rule description exactly as it is in the definition file. See the example
  below.

## Example

Definition file:

```markdown
- RL1 - the first comment in the JS rule file should be multiline and include
  the rule description exactly as it is in the definition file. See the example
  below.
```

Rule file `rules/<Definition Name>_R1.js`:

```js
/*
- RL1 - the first comment in the JS rule file should be multiline and include
  the rule description exactly as it is in the definition file. See the example
  below.
*/
```
