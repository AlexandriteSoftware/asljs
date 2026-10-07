import { execFile }
  from 'node:child_process';
import { Artefact }
  from '../model/artefact.js';
import { LocatedArtefact,
         Plugin,
         PluginContext }
  from '../plugin.js';
import { readBuiltInDefinition }
  from './built-in-definition.js';

const GIT_TAG_DEFINITION = 'Git Tag';

const TAG_PREFIX = 'git:tag/';

interface GitResult
{
  code: number;
  stdout: string;
  stderr: string;
}

/**
 * Plugin providing the `Git Tag` definition, documented in
 * `artefacts/Git Tag.md`: one artefact per tag of the
 * repository at the project root. Outside a git repository there are no
 * artefacts.
 */
export default function gitPlugin(
    context: PluginContext
  ): Plugin
{
  const git =
    (
    ...args: string[]
  ): Promise<GitResult> =>
    runGit(
      context.projectPath,
      args);

  return { name: 'git',
           definitions:
             async () => [ await readBuiltInDefinition(
               context,
               GIT_TAG_DEFINITION) ],
           locate:
             { [GIT_TAG_DEFINITION]:
                 async () =>
        locateTags(
          await git(
            'tag',
            '--list')) },
           data:
             { [GIT_TAG_DEFINITION]:
                 async artefact =>
        getTagData(
          git,
          artefact) },
           rules:
             { [GIT_TAG_DEFINITION]:
                 { RL1:
                     async artefact =>
          validateReachable(
            git,
            artefact) } } };
}

function locateTags(
    result: GitResult
  ): LocatedArtefact[]
{
  if (result.code !== 0) {
    return [ ];
  }

  return result.stdout
    .split('\n')
    .map(
      line => line.trim())
    .filter(
      line => line !== '')
    .map(
      name => ({ location:
                   `${TAG_PREFIX}${name}`,
                 name }));
}

async function getTagData(
    git: (...args: string[]) => Promise<GitResult>,
    artefact: Artefact
  ): Promise<Record<string, unknown>>
{
  const tag =
    parseLocation(
      artefact.location);

  const result =
    await git(
      'for-each-ref',
      '--format=%(objecttype)%09%(objectname)%09%(*objectname)%09%(creatordate:iso-strict)',
      `refs/tags/${tag}`);

  if (result.code !== 0) {
    throw new Error(
      `git for-each-ref failed: ${result.stderr.trim()}`);
  }

  const [objectType, objectName, peeledName, date] =
    result.stdout
    .trim()
    .split('\t');

  const annotated = objectType === 'tag';

  return { Commit:
             annotated
      ? peeledName
      : objectName,
           Annotated: annotated,
           Date:
             date
      || null };
}

async function validateReachable(
    git: (...args: string[]) => Promise<GitResult>,
    artefact: Artefact
  ): Promise<void>
{
  const tag =
    parseLocation(
      artefact.location);

  const result =
    await git(
      'merge-base',
      '--is-ancestor',
      `refs/tags/${tag}^{commit}`,
      'HEAD');

  if (result.code === 0) {
    return;
  }

  if (result.code === 1) {
    throw new Error(
      `Tag ${tag} points to a commit not reachable from HEAD.`);
  }

  throw new Error(
    `git merge-base failed: ${result.stderr.trim()}`);
}

function parseLocation(
    location: string
  ): string
{
  if (!location.startsWith(TAG_PREFIX)) {
    throw new Error(
      `Not a git tag location: ${location}`);
  }

  return location.slice(TAG_PREFIX.length);
}

/**
 * Runs git and reports its exit code instead of throwing. A missing git
 * executable is reported as a failed run.
 */
function runGit(
    cwd: string,
    args: string[]
  ): Promise<GitResult>
{
  return new Promise(
    (
        resolve
      ) =>
    {
      execFile(
        'git',
        args,
        { cwd,
          windowsHide: true },
        (
            error,
            stdout,
            stderr
          ) =>
        {
          const code =
            !error
            ? 0
            : typeof error.code === 'number'
            ? error.code
            : -1;

          resolve(
            { code,
              stdout:
                String(stdout),
              stderr:
                String(stderr)
                || (error?.message ?? '') });
        });
    });
}
