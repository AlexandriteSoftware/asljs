# R8 Step types

A step's type is its `- Type:` item - `shell`, `javascript`, `dotnet` or
`instruction` - or, without one, `shell` when it has a code block and
`instruction` otherwise. A test with a step `rq` cannot read fails without
running any step, and `rq check` reports the problem.

## Implementation

- [T5 Step types][T5]

[T5]: <../tests/T5 Step types.md>

## Coverage

**R8 Step types is fully covered by T5 Step types.** I didn't change any files.

1. **"A step's type is its `- Type:` item - `shell`, `javascript`, `dotnet` or
   `instruction`".** T5's step _parseSteps reads each ### heading as a step of
   its type_ (`src/steps.test.ts:21`) covers this. It parses explicit `- Type:
   javascript`, `- Type: .NET`, `- type: dotnet` and `- Type: Instruction` into
   the matching typed steps. That also shows the item is read case-insensitively
   and accepts aliases. An explicit `shell` type appears only in the problem
   case ("Empty shell" in `parseSteps reports what is wrong with the steps`).
   That case still shows `- Type: shell` is recognised as the shell type.

2. **"or, without one, `shell` when it has a code block and `instruction`
   otherwise".** Two T5 steps cover this:
   - The same `parseSteps` test reads an untyped step with a `sh` code block
     ("Build") as `shell`, and an untyped prose step ("The PDF has two pages")
     as `instruction`.
   - _parseDocument reads the steps of a test_ (`src/document.test.ts:53`)
     confirms the same inference when a whole document is parsed: "Test" becomes
     `shell` and "Look" becomes `instruction`.

3. **"A test with a step `rq` cannot read fails without running any step".**
   T5's step _runTest fails a test with a malformed step without running any
   step_ (`src/run-test.test.ts:360`) covers this. The test has an unknown `-
   Type: javascrip` step followed by a valid shell step. The result is `FAIL`
   with the parse problem as its note and `output: ''`, so the valid step never
   ran. _parseSteps reports what is wrong with the steps_ also covers which
   steps count as unreadable: no commands, no File, an unknown Type, an empty
   instruction, content before the first step, and an empty Steps section.

4. **"and `rq check` reports the problem".** T5's step _execCheck reports
   problems of the graph and of each document_ (`src/check.test.ts:41`) covers
   this. It shows `rq check` reporting `T1 Proof.md: the Steps section has
   content before its first step; each step is a ### heading.` That is a step
   problem from `parseSteps` showing up in the check output.

One optional addition: no test parses a valid step with an explicit `- Type:
shell`. Adding one to the `parseSteps` test would make every type in the list
explicitly tested, but the statement is covered without it.

## Status

- Result: PASS
- Coverage: COMPLETE
