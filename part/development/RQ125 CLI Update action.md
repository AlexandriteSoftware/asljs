# RQ125 CLI Update action

When CLI is invoked with Update action, it build inventory of the rules
and goes through all the rules to check if their files are missing or outdated
compared to the definition files.

When the rule file is missing entirely, CLI runs a Copilot CLI with
a request to create a rule file that implements the rule described in
the definition file.

When the rule JS file is present and description in the rule is different from
the first comment in the rule file, CLI runs a Copilot CLI with a request to
update the rule file comment to match the definition file.

When the rule file is present and the description in the rule is the same as
the first comment in the rule file, skip this file.

When the rule has any other file type, the CLI skips it and prints a warning
that only JS rule files are supported for auto-update.

See also:

- [RQ111 CLI Definitions parameter][1]

[1]: <RQ111 CLI Definitions parameter.md>
