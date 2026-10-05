# RQ003 TmpEnv sets and restores environment variables

`TmpEnv` applies a set of environment variables and restores each one it
touched when restored or disposed:

- an `undefined` value removes the variable;
- a variable that did not exist before is removed again, not set to the string
  `'undefined'`;
- restoring a second time does nothing and returns `false`.
