# R21 Git agent

agents/git.ps1 prints the state of the git working folder it runs in as one JSON
object - status, branch, commit, upstream, ahead, behind, pushed, dirty, staged,
changed, untracked, conflicted and a one-line message - and exits 0; outside a
repository it prints nothing and exits non-zero.

## Implementation

- [T17 Git agent][T17]

[T17]: <tests/T17 Git agent.md>

## Coverage

R21's statement now covers only `agents/git.ps1`. The general agent conventions
that the old Coverage section complained about are no longer part of it. T17's
four steps cover what remains, and every step is backed by a real assertion in
`agents/git.test.js`.

- **"prints the state of the git working folder it runs in as one JSON object,
  with status, branch, commit, upstream, ahead, behind, pushed, dirty, staged,
  changed, untracked, conflicted and a one-line message":** covered by the T17
  clean step. It runs the agent in a cloned repository with a pushed commit,
  parses stdout as JSON, and compares the whole object, all thirteen fields,
  with `deepEqual`. That also shows the output is a single JSON object and
  nothing else. The T17 dirty step checks that the counts, `ahead`, `pushed`,
  `dirty`, the status and the message follow the real state of the folder. The
  T17 no upstream step checks the empty commit and upstream, `pushed` false, and
  the message for a fresh repository.
- **"and exits 0":** covered by the T17 clean, dirty and no upstream steps. Each
  one asserts exit status 0 before it parses stdout.
- **"outside a repository it prints nothing":** covered by the T17 not a
  repository step, which asserts stdout is the empty string.
- **"and exits non-zero":** covered by the same T17 not a repository step, which
  asserts a non-zero exit status.

Three notes for the maintainers. None of them is a coverage gap:

1. **Stale Coverage section in R21.** It still quotes the earlier wording ("dash
   ships agents in agents/, one per monitor", every agent's stdout and exit-0
   contract, "a non-zero exit means no sample") and gives a Fail verdict. The
   Status section says Coverage is INCOMPLETE. Both describe a statement that no
   longer exists and should be regenerated.
2. **Misleading T17 test name.** The not a repository step is named "…so the
   runner records nothing", but it never runs the runner. That doesn't matter
   for R21, which no longer claims anything about the runner. Renaming the test
   to drop that clause would stop it implying more than it checks.
3. **Tests skip without `pwsh`.** Every T17 step is skipped when `pwsh` is not
   installed. On such a host the coverage holds on paper but nothing runs.

Verdict: R21 is fully covered by T17.

## Status

- Result: PASS
- Coverage: COMPLETE
