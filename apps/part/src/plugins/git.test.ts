import { createTestLoggerProvider }
  from 'asljs-testing';
import assert
  from 'node:assert/strict';
import { execFileSync }
  from 'node:child_process';
import test
  from 'node:test';
import { fileURLToPath }
  from 'node:url';
import { providersFactory }
  from '../providers/providers.js';
import { RuleRunner }
  from '../rule-runner.js';
import { tmpDirFactory }
  from '../testing/tmpDir.js';

const loggerProvider =
  createTestLoggerProvider();

test.after(
  async () =>
  {
    await loggerProvider.dispose();
  });

const tmpDir =
  tmpDirFactory(
    loggerProvider);

const pluginPath =
  fileURLToPath(
    new URL(
      './git.js',
      import.meta.url));

test(
  'RQ209: git plugin locates tags, provides data and checks reachability',
  async () =>
  {
    await using workspace =
      tmpDir();

    const git =
      (
      ...args: string[]
    ): string =>
      execFileSync(
        'git',
        [ '-c',
          'user.name=Test',
          '-c',
          'user.email=test@example.com',
          '-c',
          'commit.gpgsign=false',
          '-c',
          'tag.gpgsign=false',
          ...args ],
        { cwd: workspace.path,
          encoding: 'utf8' })
        .trim();

    git(
      'init',
      '--quiet');

    await workspace.writeText(
      'a.txt',
      'a');

    git(
      'add',
      'a.txt');

    git(
      'commit',
      '--quiet',
      '-m',
      'First');

    git(
      'tag',
      'v1');

    git(
      'tag',
      '-a',
      'v2',
      '-m',
      'Second release');

    const firstCommit =
      git(
        'rev-parse',
        'HEAD');

    git(
      'checkout',
      '--quiet',
      '-b',
      'side');

    await workspace.writeText(
      'b.txt',
      'b');

    git(
      'add',
      'b.txt');

    git(
      'commit',
      '--quiet',
      '-m',
      'Side');

    git(
      'tag',
      'v3');

    git(
      'checkout',
      '--quiet',
      firstCommit);

    const providers =
      providersFactory(
        loggerProvider,
        workspace.path,
        [ pluginPath ]);

    const artefacts =
      await providers.artefactProvider.getArtefacts();

    assert.deepEqual(
      artefacts.map(
        artefact => [ artefact.location,
                      artefact.name ]),
      [ [ 'git:tag/v1',
          'v1' ],
        [ 'git:tag/v2',
          'v2' ],
        [ 'git:tag/v3',
          'v3' ] ]);

    const lightweight =
      await providers.artefactDataProvider.tryGetArtefactData(
        artefacts[0],
        'Git Tag');

    assert.equal(
      lightweight.Commit,
      firstCommit);

    assert.equal(
      lightweight.Annotated,
      false);

    const annotated =
      await providers.artefactDataProvider.tryGetArtefactData(
        artefacts[1],
        'Git Tag');

    assert.equal(
      annotated.Commit,
      firstCommit);

    assert.equal(
      annotated.Annotated,
      true);

    assert.equal(
      typeof annotated.Date,
      'string');

    const definition =
      await providers.artefactDefinitionProvider.getDefinition(
        'Git Tag');

    const ruleRunner =
      new RuleRunner(
        loggerProvider.getLogger('RuleRunner'),
        providers);

    const results = [ ];

    for (const artefact of artefacts) {
      const [result] =
        await ruleRunner.runRules(
          definition,
          artefact);

      results.push(
        [ artefact.name,
          result.result,
          result.message ]);
    }

    assert.deepEqual(
      results,
      [ [ 'v1',
          'Ok',
          '' ],
        [ 'v2',
          'Ok',
          '' ],
        [ 'v3',
          'Fail',
          'Tag v3 points to a commit not reachable from HEAD.' ] ]);
  });

test(
  'RQ209: git plugin finds no tags outside a git repository',
  async () =>
  {
    await using workspace =
      tmpDir();

    const { artefactProvider } =
      providersFactory(
        loggerProvider,
        workspace.path,
        [ pluginPath ]);

    assert.deepEqual(
      await artefactProvider.getArtefacts(),
      [ ]);
  });
