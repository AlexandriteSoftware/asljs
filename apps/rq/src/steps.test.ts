import { parseMarkdown }
  from 'asljs-mdcli';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { parseSteps,
         splitCommands }
  from './steps.js';

function parse(
    text: string
  ): ReturnType<typeof parseSteps>
{
  return parseSteps(
    parseMarkdown(text),
    text);
}

test(
  'parseSteps reads each ### heading as a step of its type',
  () =>
  {
    assert.deepEqual(
      parse(
        `# T1

## Steps

### Build

\`\`\`sh
npm ci

npm run build
\`\`\`

### Export test

- Type: javascript
- File: build/export.test.js
- Test: exports a PDF

### All .NET tests

- Type: .NET

### Filtered

- type: dotnet
- Project: tests/Export.Tests.csproj
- Filter: FullyQualifiedName~Export

### The PDF has two pages

Open \`out/report.pdf\` and check that it has two pages.

- The totals are on the last page.

### Explicit

- Type: Instruction

Check the log.

## Notes

Not a step.
`),
      { steps:
          [ { type: 'shell',
              title: 'Build',
              commands:
                [ 'npm ci',
                  'npm run build' ] },
            { type: 'javascript',
              title: 'Export test',
              file:
                'build/export.test.js',
              test: 'exports a PDF' },
            { type: 'dotnet',
              title: 'All .NET tests',
              project: null,
              filter: null },
            { type: 'dotnet',
              title: 'Filtered',
              project:
                'tests/Export.Tests.csproj',
              filter:
                'FullyQualifiedName~Export' },
            { type: 'instruction',
              title:
                'The PDF has two pages',
              text:
                'Open `out/report.pdf` and check that it has two pages.\n\n- The totals are on the last page.' },
            { type: 'instruction',
              title: 'Explicit',
              text: 'Check the log.' } ],
        problems: [ ] });
  });

test(
  'parseSteps reports what is wrong with the steps',
  () =>
  {
    assert.deepEqual(
      parse(
        `# T1

## Steps

### Empty shell

- Type: shell

### No file

- Type: javascript
- Test: x

### Unknown

- Type: python

### Nothing
`),
      { steps: [ ],
        problems:
          [ 'the step "Empty shell" has no commands.',
            'the step "No file" has no File.',
            'the step "Unknown" has an unknown Type "python"; use shell, javascript, dotnet, instruction.',
            'the step "Nothing" has no instruction.' ] });

    assert.deepEqual(
      parse(
        '# T1\n\n## Steps\n\n```sh\nnpm test\n```\n').problems,
      [ 'the Steps section has content before its first step; each step is a ### heading.' ]);

    assert.deepEqual(
      parse(
        '# T1\n\n## Steps\n').problems,
      [ 'the Steps section has no steps.' ]);

    assert.deepEqual(
      parse('# T1\n'),
      { steps: [ ],
        problems: [ ] });
  });

test(
  'splitCommands skips comments and empty lines and joins continued lines',
  () =>
  {
    assert.deepEqual(
      splitCommands(
        '# build first\nnpm ci\n\nnode -e \\\n  "console.log(1)"\n  # done\nnpm test \\\n'),
      [ 'npm ci',
        'node -e "console.log(1)"',
        'npm test' ]);
  });

test(
  'parseSteps reads a field value wrapped over several lines',
  () =>
  {
    assert.deepEqual(
      parse(
        '# T1\n\n## Steps\n\n### Unit\n\n- Type: javascript\n- File: build/a.test.js\n- Test: a long caption that a formatter\n  wrapped onto the next line\n').steps,
      [ { type: 'javascript',
          title: 'Unit',
          file: 'build/a.test.js',
          test:
            'a long caption that a formatter wrapped onto the next line' } ]);
  });
