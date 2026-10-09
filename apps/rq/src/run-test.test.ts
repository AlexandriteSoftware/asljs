import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { loadGraph,
         RqNode }
  from './graph.js';
import { getDotnetTestArgs,
         getNodeTestArgs,
         ranNoDotnetTest,
         ranNoNodeTest,
         RunContext,
         runTest }
  from './run-test.js';
import { FAIL_STEP,
         PASS_STEP,
         writeFixture }
  from './testing/fixture.js';

const NO_AGENT: RunContext =
  { agent: async () => null };

async function readTest(
    dir: TmpDir,
    file: string,
    text: string
  ): Promise<RqNode>
{
  await dir.writeText(
    file,
    text);

  return (await loadGraph(
    dir.resolve(file))).nodes
    .values().next().value!;
}

test(
  'runTest runs the steps until the first failure without changing the test',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const before =
      await dir.readText(
        'reqs/tests/T1 Passes.md');

    const graph =
      await loadGraph(
        dir.resolve('reqs'));

    const passes =
      graph.nodes.get(
        dir.resolve(
          'reqs/tests/T1 Passes.md'))!;

    assert.deepEqual(
      await runTest(
        passes,
        NO_AGENT),
      { file: passes.path,
        status: 'PASS',
        note: '2 steps',
        output:
          `[step 1] Build\n$ ${PASS_STEP}\n[step 2] Check\n$ ${PASS_STEP}\n` });

    assert.equal(
      await dir.readText(
        'reqs/tests/T1 Passes.md'),
      before);

    const stops =
      await readTest(
        dir,
        'T3 Stops.md',
        `# T3 Stops\n\n## Steps\n\n### Fail\n\n\`\`\`sh\n${FAIL_STEP}\n\`\`\`\n\n### Never\n\n\`\`\`sh\n${PASS_STEP}\n\`\`\`\n`);

    assert.deepEqual(
      await runTest(
        stops,
        NO_AGENT),
      { file: stops.path,
        status: 'FAIL',
        note:
          'step 1 (Fail) exited with code 3',
        output:
          `[step 1] Fail\n$ ${FAIL_STEP}\n` });

    const empty =
      await readTest(
        dir,
        'T4 Empty.md',
        '# T4 Empty\n\nNo steps.\n');

    assert.equal(
      (await runTest(
        empty,
        NO_AGENT)).note,
      'no steps');
  });

test(
  'runTest runs a JavaScript test file, or the tests matching a caption',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'tests/sample.test.mjs',
      `import test from 'node:test';
test('adds (numbers)', () => {});
test('fails', () => { throw new Error('no'); });
`);

    const step =
      (
      caption: string | null
    ): string =>
      `# T1 JS\n\n## Steps\n\n### Unit\n\n- Type: javascript\n- File: sample.test.mjs\n${
        caption === null
          ? ''
          : `- Test: ${caption}\n`
      }`;

    const matching =
      await runTest(
        await readTest(
          dir,
          'tests/T1 JS.md',
          step('adds (numbers)')),
        NO_AGENT);

    assert.equal(
      matching.status,
      'PASS',
      matching.output);

    assert.match(
      matching.output,
      /^\[step 1\] Unit\n\$ node --test --test-reporter=tap --test-name-pattern "adds \\\\\(numbers\\\\\)" sample\.test\.mjs\n/);

    assert.deepEqual(
      { ...await runTest(
        await readTest(
          dir,
          'tests/T1 JS.md',
          step('missing')),
        NO_AGENT),
        output: '' },
      { file:
          dir.resolve('tests/T1 JS.md'),
        status: 'FAIL',
        note:
          'step 1 (Unit) ran no test',
        output: '' });

    assert.match(
      (await runTest(
        await readTest(
          dir,
          'tests/T1 JS.md',
          step(null)),
        NO_AGENT)).note,
      /^step 1 \(Unit\) exited with code 1/);
  });

test(
  'runTest runs dotnet test with the project and the filter',
  async () =>
  {
    await using dir =
      new TmpDir();

    const result =
      await runTest(
        await readTest(
          dir,
          'T1 Net.md',
          '# T1 Net\n\n## Steps\n\n### Unit\n\n- Type: dotnet\n- Project: none/None.csproj\n- Filter: Name~Export\n'),
        NO_AGENT);

    assert.equal(
      result.status,
      'FAIL');

    assert.match(
      result.output,
      /^\[step 1\] Unit\n\$ dotnet test none\/None\.csproj --filter "Name~Export"\n/);
  });

test(
  'runTest asks the agent to carry out an instruction step',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'agent.cjs',
      `let prompt = '';
process.stdin.on('data', chunk => prompt += chunk);
process.stdin.on('end', () => {
  require('node:fs').writeFileSync('prompt.txt', prompt);
  console.log('checked');
  console.log(prompt.includes('two pages')
    ? '{"result":"OK"}'
    : '{"result":"Fail","message":"No report."}');
});
`);

    const context: RunContext =
      { agent:
          async () => `node "${dir.resolve('agent.cjs')}"` };

    const node =
      await readTest(
        dir,
        'T1 Report.md',
        '# T1 Report\n\nThe report.\n\n## Steps\n\n### Pages\n\nCheck the report has two pages.\n');

    assert.deepEqual(
      await runTest(
        node,
        context),
      { file: node.path,
        status: 'PASS',
        note: '1 step',
        output:
          '[step 1] Pages\nchecked\n{"result":"OK"}\n' });

    const prompt =
      await dir.readText('prompt.txt');

    for (
      const text of [ `Test: ${node.path}`,
                      'Title: T1 Report',
                      'The report.',
                      'Step: Pages',
                      'Check the report has two pages.',
                      'do not change any file' ]
    ) {
      assert.ok(
        prompt.includes(text),
        text);
    }

    const other =
      await readTest(
        dir,
        'T2 Other.md',
        '# T2 Other\n\n## Steps\n\n### Pages\n\nCheck the summary.\n');

    assert.equal(
      (await runTest(
        other,
        context)).note,
      'step 1 (Pages) failed: No report.');

    assert.equal(
      (await runTest(
        other,
        NO_AGENT)).note,
      'step 1 (Pages) needs an AI agent; install claude or copilot, or set RQ_AI_COMMAND');
  });

test(
  'runTest runs every line of every code block of a shell step and records the output',
  async () =>
  {
    await using dir =
      new TmpDir();

    const node =
      await readTest(
        dir,
        'T1 Lines.md',
        '# T1 Lines\n\n## Steps\n\n### Lines\n\n```sh\nnode -e "console.log(1)"\nnode -e "console.error(2)"\n```\n\nThen:\n\n```sh\nnode -e "process.exit(5)"\nnode -e "console.log(4)"\n```\n');

    assert.deepEqual(
      await runTest(
        node,
        NO_AGENT),
      { file: node.path,
        status: 'FAIL',
        note:
          'step 1 (Lines) exited with code 5',
        output:
          '[step 1] Lines\n$ node -e "console.log(1)"\n1\n$ node -e "console.error(2)"\n2\n$ node -e "process.exit(5)"\n' });
  });

test(
  'the JavaScript and .NET arguments and their no-test checks',
  () =>
  {
    assert.deepEqual(
      getNodeTestArgs(
        { type: 'javascript',
          title: 'x',
          file: 'a.test.js',
          test: 'adds (1+1)' }),
      [ '--test',
        '--test-reporter=tap',
        '--test-name-pattern',
        'adds \\(1\\+1\\)',
        'a.test.js' ]);

    assert.deepEqual(
      getNodeTestArgs(
        { type: 'javascript',
          title: 'x',
          file: 'a.test.js',
          test: null }),
      [ '--test',
        '--test-reporter=tap',
        'a.test.js' ]);

    assert.ok(
      ranNoNodeTest(
        'TAP version 13\n1..0\n# Subtest: a.test.js\nok 1 - a.test.js\n1..1\n'));

    assert.ok(
      !ranNoNodeTest(
        'TAP version 13\n# Subtest: adds\nok 1 - adds\n1..1\n'));

    assert.deepEqual(
      getDotnetTestArgs(
        { type: 'dotnet',
          title: 'x',
          project: null,
          filter: null }),
      [ 'test' ]);

    assert.deepEqual(
      getDotnetTestArgs(
        { type: 'dotnet',
          title: 'x',
          project: 'A.csproj',
          filter: 'Name~B' }),
      [ 'test',
        'A.csproj',
        '--filter',
        'Name~B' ]);

    assert.ok(
      ranNoDotnetTest(
        'No test matches the given testcase filter `Name~B` in A.dll'));

    assert.ok(
      !ranNoDotnetTest(
        'Passed!  - Failed: 0, Passed: 3'));
  });

test(
  'runTest fails a test with a malformed step without running any step',
  async () =>
  {
    await using dir =
      new TmpDir();

    const node =
      await readTest(
        dir,
        'T1 Typo.md',
        `# T1 Typo\n\n## Steps\n\n### Unit\n\n- Type: javascrip\n- File: a.test.js\n\n### Run\n\n\`\`\`sh\n${PASS_STEP}\n\`\`\`\n`);

    assert.deepEqual(
      await runTest(
        node,
        NO_AGENT),
      { file: node.path,
        status: 'FAIL',
        note:
          'the step "Unit" has an unknown Type "javascrip"; use shell, javascript, dotnet, instruction',
        output: '' });
  });

test(
  'runTest fails a .NET step that exits with 0 but runs no test',
  async () =>
  {
    await using dir =
      new TmpDir();

    const node =
      await readTest(
        dir,
        'T1 Net.md',
        '# T1 Net\n\n## Steps\n\n### Unit\n\n- Type: dotnet\n- Filter: Name~Missing\n');

    const fake =
      (
      stdout: string
    ): RunContext => ({ agent: async () => null,
                        program:
                          async () => ({ code: 0,
                                         stdout,
                                         stderr: '' }) });

    assert.deepEqual(
      await runTest(
        node,
        fake(
          'No test matches the given testcase filter `Name~Missing` in A.dll\n')),
      { file: node.path,
        status: 'FAIL',
        note:
          'step 1 (Unit) ran no test',
        output:
          '[step 1] Unit\n$ dotnet test --filter "Name~Missing"\nNo test matches the given testcase filter `Name~Missing` in A.dll\n' });

    assert.equal(
      (await runTest(
        node,
        fake(
          'Passed!  - Failed: 0, Passed: 3\n'))).status,
      'PASS');
  });
