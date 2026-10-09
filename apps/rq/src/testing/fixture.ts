import { TmpDir }
  from 'asljs-tmpdir';
import { getNodeId,
         RqGraph }
  from '../graph.js';
import { TestResult,
         TestStatus }
  from '../results.js';
import { StatusOptions }
  from '../status.js';

export const PASS_STEP =
  'node -e "process.exit(0)"';

export const FAIL_STEP =
  'node -e "process.exit(3)"';

/**
 * A requirement implemented by a sub-requirement and a test; the
 * sub-requirement is implemented by a second test. The steps of
 * `T2 Fails.md` fail. `.rq/E1 Earlier.md` records an earlier failure of
 * `T1 Passes.md`; `T2 Fails.md` has never run.
 */
export async function writeFixture(
    dir: TmpDir
  ): Promise<void>
{
  await dir.writeText(
    'reqs/R1 Root.md',
    `# R1 Root

The tool works. See the [website](https://example.com/page.md) and the
[notes](notes.md).

## Implementation

- [R2 Part](<R2 Part.md>)
- [T1 Passes](tests/T1%20Passes.md#steps)
`);

  await dir.writeText(
    'reqs/R2 Part.md',
    `# R2 Part

A part works.

## Implementation

- [T2][T2]

[T2]: <tests/T2 Fails.md>
`);

  await dir.writeText(
    'reqs/notes.md',
    '# notes\n\nNot a requirement.\n');

  await dir.writeText(
    'reqs/tests/T1 Passes.md',
    `# T1 Passes

Shows that the tool works. It is about [R1](<../R1 Root.md>).

## Steps

### Build

\`\`\`sh
${PASS_STEP}
\`\`\`

### Check

- Type: shell

\`\`\`sh
${PASS_STEP}
\`\`\`

## Status

- Result: FAIL - step 1 exited with code 1
- Execution: [E1 Earlier][E1]

[E1]: <../../.rq/E1 Earlier.md>
`);

  await dir.writeText(
    'reqs/tests/T2 Fails.md',
    `# T2 Fails

## Steps

### Run

\`\`\`sh
${FAIL_STEP}
\`\`\`
`);

  await dir.writeText(
    '.rq/E1 Earlier.md',
    `# E1 Earlier

- Date: 2025-12-31T00:00:00.000Z
- Command: \`rq test reqs\`
- Result: FAIL - 0 of 1 tests passed
- Commit: none
- Branch: none
- Changed files: none

## T1 Passes

- File: <reqs/tests/T1 Passes.md>
- Result: FAIL - step 1 exited with code 1
`);
}

/**
 * `getStatuses` options for tests that ran with the given results, by id,
 * recalculating every requirement.
 */
export function ranWith(
    graph: RqGraph,
    results: [string, TestStatus][]
  ): StatusOptions
{
  const run = new Map<string, TestResult>();

  for (const file of graph.nodes.keys()) {
    const found =
      results.find(
        (
        [id]
      ) => id === getNodeId(file));

    if (found) {
      run.set(
        file,
        { file,
          status: found[1],
          note: '',
          output: '' });
    }
  }

  return { run,
           recalculate: 'all' };
}
