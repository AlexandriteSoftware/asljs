import { TmpDir }
  from 'asljs-tmpdir';

export const PASS_STEP =
  'node -e "process.exit(0)"';

export const FAIL_STEP =
  'node -e "process.exit(3)"';

/**
 * A requirement implemented by a sub-requirement and an evidence; the
 * sub-requirement is implemented by a second evidence. The steps of
 * `EV2 Fails.md` fail.
 */
export async function writeFixture(
    dir: TmpDir
  ): Promise<void>
{
  await dir.writeText(
    'reqs/RQ1 Root.md',
    `# RQ1 Root

The tool works. See the [website](https://example.com/page.md) and the
[notes](notes.md).

## Implementation

- [RQ2 Part](<RQ2 Part.md>)
- [EV1 Passes](evidence/EV1%20Passes.md#steps)
`);

  await dir.writeText(
    'reqs/RQ2 Part.md',
    `# RQ2 Part

A part works.

## Implementation

- [EV2][EV2]

[EV2]: <evidence/EV2 Fails.md>
`);

  await dir.writeText(
    'reqs/notes.md',
    '# notes\n\nNot a requirement.\n');

  await dir.writeText(
    'reqs/evidence/EV1 Passes.md',
    `# EV1 Passes

Shows that the tool works. It is about [RQ1](<../RQ1 Root.md>).

## Steps

\`\`\`sh
${PASS_STEP}
${PASS_STEP}
\`\`\`

## Log

- 2025-12-31T00:00:00.000Z Failed - step 1 exited with code 1
`);

  await dir.writeText(
    'reqs/evidence/EV2 Fails.md',
    `# EV2 Fails

## Steps

\`\`\`sh
${FAIL_STEP}
\`\`\`
`);
}
