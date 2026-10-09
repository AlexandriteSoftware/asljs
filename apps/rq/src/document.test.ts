import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { parseDocument }
  from './document.js';

test(
  'parseDocument reads a requirement: title, local links and Implementation links',
  () =>
  {
    const document =
      parseDocument(
        `# R1 Root

Uses [a](<A b.md>), [c](sub/C%20d.md#part), [web](https://x.org/y.md),
[img](pic.png), [mail](mailto:a@b.md) and [ref][r]. [a again](<A b.md>)

[r]: ./R.md

## Implementation

- [R2](<R2 Part.md>)
- [T1][t1] and [web](https://x.org/R3.md)
- [notes](notes.txt)

[t1]: tests/T1.md
`);

    assert.deepEqual(
      document,
      { title: 'R1 Root',
        body:
          'Uses [a](<A b.md>), [c](sub/C%20d.md#part), [web](https://x.org/y.md),\n[img](pic.png), [mail](mailto:a@b.md) and [ref][r]. [a again](<A b.md>)',
        links:
          [ 'A b.md',
            'sub/C d.md',
            './R.md',
            'R2 Part.md',
            'tests/T1.md' ],
        implementation:
          [ 'R2 Part.md',
            'tests/T1.md' ],
        steps: [ ],
        stepProblems: [ ],
        status:
          { result: null,
            coverage: null,
            execution: null } });
  });

test(
  'parseDocument reads the steps of a test',
  () =>
  {
    const document =
      parseDocument(
        `# T1 Works

## Steps

### Test

\`\`\`sh
npm test
\`\`\`

### Look

Check the output.
`);

    assert.deepEqual(
      document.steps,
      [ { type: 'shell',
          title: 'Test',
          commands:
            [ 'npm test' ] },
        { type: 'instruction',
          title: 'Look',
          text: 'Check the output.' } ]);
  });

test(
  'parseDocument has no title without a level 1 heading',
  () =>
  {
    assert.equal(
      parseDocument(
        '## Only a section\n').title,
      null);
  });
