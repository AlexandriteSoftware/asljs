import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { runCli }
  from './cli.js';
import { writeFixture }
  from './testing/fixture.js';
import { createTestIo }
  from './testing/test-io.js';

test(
  'rq without arguments prints help',
  async () =>
  {
    const io =
      createTestIo(
        process.cwd());

    assert.equal(
      await runCli(
        [ ],
        io),
      0);

    assert.match(
      io.out(),
      /Usage: rq/);

    assert.match(
      io.out(),
      /test \[options\] <targets\.\.\.>/);

    assert.match(
      io.out(),
      /view/);
  });

test(
  'rq test returns the verification exit code',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(dir.path);

    assert.equal(
      await runCli(
        [ 'test',
          'reqs/tests/T1 Passes.md' ],
        io),
      0);

    assert.equal(
      await runCli(
        [ 'test',
          'reqs' ],
        io),
      1);

    const ids =
      createTestIo(dir.path);

    assert.equal(
      await runCli(
        [ 'test',
          'R2',
          'T1',
          '--recurse',
          '--name',
          'Part' ],
        ids),
      1);

    assert.match(
      ids.out(),
      /^FAIL {5}reqs\/R2 Part\.md - 1 of 1 links failed\nFAIL {5}reqs\/tests\/T2 Fails\.md - step 1 \(Run\) exited with code 3\nPASS {5}reqs\/tests\/T1 Passes\.md - 2 steps\nResults {2}\.rq\/E4 Part\.md\nUpdated {2}reqs\/tests\/T1 Passes\.md\nUpdated {2}reqs\/tests\/T2 Fails\.md\n$/);

    assert.match(
      await dir.readText('.rq/E4 Part.md'),
      /\n- Command: `rq test R2 T1 --recurse --name Part`\n/);
  });

test(
  'rq test rejects an unknown agent and a missing path',
  async () =>
  {
    const io =
      createTestIo(
        process.cwd());

    assert.equal(
      await runCli(
        [ 'test',
          '.',
          '--ai',
          'gpt' ],
        io),
      1);

    assert.match(
      io.err(),
      /Unknown AI agent: gpt\. Use claude or copilot\./);

    assert.equal(
      await runCli(
        [ 'test',
          'no/such/path' ],
        io),
      1);

    assert.match(
      io.err(),
      /no such file or folder/);
  });

test(
  'rq view rejects an invalid port',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(dir.path);

    assert.equal(
      await runCli(
        [ 'view',
          'reqs',
          '--port',
          'x' ],
        io),
      1);

    assert.match(
      io.err(),
      /Invalid port: x/);
  });

test(
  'rq add, links, backlinks, log and check forward their options',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(dir.path);

    assert.equal(
      await runCli(
        [ 'add',
          'test',
          'reqs/R2 Part.md',
          'Bench',
          '--description',
          'It is fast.',
          '--step',
          'node -v',
          '--step',
          'npm -v' ],
        io),
      0);

    assert.equal(
      await dir.readText(
        'reqs/tests/T3 Bench.md'),
      '# T3 Bench\n\nIt is fast.\n\n## Steps\n\n### Step 1\n\n```sh\nnode -v\n```\n\n### Step 2\n\n```sh\nnpm -v\n```\n');

    const links =
      createTestIo(dir.path);

    await runCli(
      [ 'links',
        'reqs/R2 Part.md',
        '--json' ],
      links);

    assert.deepEqual(
      JSON.parse(
        links.out())
        .map(
          (node: { path: string; }) => node.path),
      [ 'reqs/tests/T2 Fails.md',
        'reqs/tests/T3 Bench.md' ]);

    const backlinks =
      createTestIo(dir.path);

    await runCli(
      [ 'backlinks',
        'T3',
        '--working-dir',
        'reqs' ],
      backlinks);

    assert.equal(
      backlinks.out(),
      'requirement  R2 Part.md  NOT RUN\n');

    assert.equal(
      await runCli(
        [ 'log',
          'reqs/tests/T3 Bench.md',
          '--note',
          'no status' ],
        io),
      1);

    assert.match(
      io.err(),
      /required option '--status <status>' not specified/);

    assert.equal(
      await runCli(
        [ 'log',
          'reqs/tests/T3 Bench.md',
          '--status',
          'PASS',
          '--time',
          '2026-03-01T00:00:00Z' ],
        io),
      0);

    assert.match(
      await dir.readText(
        '.rq/E2 T3 Bench.md'),
      /\n- Command: `rq log "reqs\/tests\/T3 Bench\.md" --status PASS --time 2026-03-01T00:00:00Z`\n/);

    assert.equal(
      await runCli(
        [ 'check',
          'reqs' ],
        io),
      0);

    assert.equal(
      await runCli(
        [ 'unlink',
          'reqs/R1 Root.md',
          'reqs/R2 Part.md' ],
        io),
      0);

    const json =
      createTestIo(dir.path);

    await runCli(
      [ 'tojson',
        'reqs' ],
      json);

    assert.deepEqual(
      JSON.parse(
        json.out()).roots,
      [ 'reqs/R1 Root.md',
        'reqs/R2 Part.md' ]);
  });

test(
  'every command returns 1 when it fails',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    for (
      const args of [ [ 'check',
                        'nope' ],
                      [ 'list',
                        'nope' ],
                      [ 'links',
                        'Nope.md' ],
                      [ 'backlinks',
                        'R9' ],
                      [ 'tojson',
                        'nope' ],
                      [ 'add',
                        'requirement',
                        'T1',
                        'Child' ],
                      [ 'link',
                        'R1',
                        'R1' ],
                      [ 'unlink',
                        'R2',
                        'R1' ],
                      [ 'remove',
                        'R1' ],
                      [ 'move',
                        'R1',
                        'reqs/tests/T1 Passes.md' ],
                      [ 'log',
                        'R1',
                        '--status',
                        'PASS' ],
                      [ 'test',
                        'R9' ],
                      [ 'coverage',
                        'R1' ],
                      [ 'view',
                        'nope',
                        '--port',
                        '0' ] ]
    ) {
      const io =
        createTestIo(dir.path);

      assert.equal(
        await runCli(
          args,
          io),
        1,
        args.join(' '));

      assert.notEqual(
        io.err(),
        '',
        args.join(' '));
    }
  });

test(
  'every command works in --working-dir and takes ids and .md names',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const run =
      async (
          ...args: string[]
        ): Promise<string> =>
      {
      const io =
        createTestIo(dir.path);

      assert.equal(
        await runCli(
          [ ...args,
            '--working-dir',
            'reqs' ],
          io),
        0,
        `${args.join(' ')}: ${io.err()}`);

      return io.out();
    };

    assert.match(
      await run(
        'test',
        'T1'),
      /^PASS {5}tests\/T1 Passes\.md - 2 steps\nResults {2}\.rq\/E1 T1\.md\n/);

    assert.ok(
      (await dir.stat('reqs/.rq/E1 T1.md')).isFile());

    await assert.rejects(
      dir.stat('.rq/E2 T1.md'));

    assert.match(
      await run(
        'log',
        'T2 Fails.md',
        '--status',
        'PASS'),
      /^Logged tests\/T2 Fails\.md: PASS\nResults {2}\.rq\/E2 T2 Fails\.md\n/);

    assert.equal(
      await run(
        'check',
        'R1'),
      'OK  2 requirements, 2 tests\n');

    assert.match(
      await run(
        'list',
        'R1 Root.md'),
      /^requirement {2}R1 Root\.md {2}PASS\n/);

    assert.equal(
      await run(
        'links',
        'R2'),
      'test         tests/T2 Fails.md  PASS\n');

    assert.equal(
      await run(
        'backlinks',
        'T2'),
      'requirement  R2 Part.md  PASS\n');

    assert.match(
      await run(
        'tojson',
        'R2'),
      /"path": "R2 Part\.md"/);

    assert.match(
      await run(
        'add',
        'requirement',
        'R2',
        'Speed'),
      /^Created R3 Speed\.md\nLinked R2 Part\.md -> R3 Speed\.md\n/);

    assert.match(
      await run(
        'unlink',
        'R2',
        'R3'),
      /^Unlinked R2 Part\.md -> R3 Speed\.md\n/);

    assert.match(
      await run(
        'link',
        'R1',
        'R3 Speed.md'),
      /^Linked R1 Root\.md -> R3 Speed\.md\n/);

    assert.match(
      await run(
        'move',
        'R3',
        'parts/R3 Speed.md'),
      /^Updated R1 Root\.md\n(?:.*\n)*Moved R3 Speed\.md -> parts\/R3 Speed\.md\n/);

    assert.match(
      await run(
        'remove',
        'R3'),
      /Removed parts\/R3 Speed\.md\n/);

    await dir.writeText(
      'agent.cjs',
      'process.stdin.resume(); process.stdin.on(\'end\', () => console.log(\'{"result":"OK"}\'));');

    const coverage =
      createTestIo(
        dir.path,
        { RQ_AI_COMMAND:
            `node "${dir.resolve('agent.cjs')}"` });

    assert.equal(
      await runCli(
        [ 'coverage',
          'R2 Part.md',
          '--working-dir',
          'reqs' ],
        coverage),
      0,
      coverage.err());

    assert.equal(
      coverage.out(),
      'COMPLETE    R2 Part.md\n');
  });
