# T17 Git agent

The value of agents/git.ps1 for the states of a working folder.

## Steps

### clean

- Type: javascript
- File: ../../../agents/git.test.js
- Test: git reports a clean, pushed working folder as ok

### dirty

- Type: javascript
- File: ../../../agents/git.test.js
- Test: git counts staged, changed and untracked entries and commits to push, as
  warn

### no upstream

- Type: javascript
- File: ../../../agents/git.test.js
- Test: git says no upstream, and has no commit before the first one

### not a repository

- Type: javascript
- File: ../../../agents/git.test.js
- Test: git exits non-zero outside a repository, so the runner records nothing

## Status

- Result: PASS - 4 steps
- Execution: [E3 all][E3]

[E3]: <../.rq/E3 all.md>
