# DF2 Rule File

A rule file is a file that implements a rule for a definition.

- Its name is in the form of `<DefinitionName>_<RuleId>.<extension>`, for
  example, `TodoItem_R1.js`.
- JS rule files export a function `validate` that takes an artefact either
  completes or throws an error. If it completes, the rule is satisfied,
  otherwise it fails.
- Any other rule extension is threated as an executable file that returns 0 if
  the rule is satisfied and non-zero otherwise. When non-zero is returned,
  the stderr is used as the message for the rule failure.
