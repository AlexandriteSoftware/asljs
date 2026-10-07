import { GitIgnore }
  from 'asljs-locator';
import { glob }
  from 'glob';
import { readFile }
  from 'node:fs/promises';
import path
  from 'node:path';
import { toPosixPath }
  from '../formatting.js';
import { Artefact }
  from '../model/artefact.js';
import { LocatedArtefact,
         Plugin,
         PluginContext }
  from '../plugin.js';

const NPM_DEPENDENCY_DEFINITION = 'Npm Dependency';

const SCHEME = 'npm:';

const DEPENDENCY_KINDS =
  Object.freeze(
    [ 'dependencies',
      'devDependencies',
      'peerDependencies',
      'optionalDependencies' ]);

const RL1_TEXT =
  'A dependency on a package of the project, a `package.json` under the '
  + "project root with that name, uses a range that the package's current "
  + 'version satisfies. Supported range forms are `*`, `x.y.z`, `^x.y.z`, '
  + '`~x.y.z` and `>=x.y.z`, optionally prefixed with `workspace:`; any other '
  + 'form fails.';

interface Manifest
{
  /**
   * POSIX path relative to the project root.
   */
  path: string;
  content: Record<string, unknown>;
}

interface DependencyLocation
{
  manifest: string;
  kind: string;
  name: string;
}

/**
 * Plugin providing the `Npm Dependency` definition: one artefact per entry in
 * the dependency sections of every `package.json` under the project root,
 * outside `node_modules` and `.gitignore`d paths.
 */
export default function npmPlugin(
    context: PluginContext
  ): Plugin
{
  let manifests: Promise<Manifest[]> | null = null;

  const getManifests =
    (): Promise<Manifest[]> =>
    {
    manifests ??= findManifests(
      context);

    return manifests;
  };

  return { name: 'npm',
           definitions:
             async () => [ { name:
                               NPM_DEPENDENCY_DEFINITION,
                             description:
                               'A package dependency declared in a `package.json` file.',
                             properties:
                               [ property(
                                 'Package',
                                 'String',
                                 'Name of the package depended on.'),
                                 property(
                                   'Range',
                                   'String',
                                   'Version range of the dependency.'),
                                 property(
                                   'Kind',
                                   'String',
                                   'Section of the dependency, e.g. `devDependencies`.'),
                                 property(
                                   'Manifest',
                                   'String',
                                   'Path of the `package.json` file, relative to the project root.') ],
                             rules:
                               [ { id: 'RL1',
                                   heading:
                                     'RL1 - Workspace range',
                                   content: RL1_TEXT } ] } ],
           locate:
             { [NPM_DEPENDENCY_DEFINITION]:
                 async () =>
        locateDependencies(
          await getManifests()) },
           data:
             { [NPM_DEPENDENCY_DEFINITION]:
                 async artefact =>
        getDependencyData(
          await getManifests(),
          artefact) },
           rules:
             { [NPM_DEPENDENCY_DEFINITION]:
                 { RL1:
                     async artefact =>
          validateWorkspaceRange(
            await getManifests(),
            artefact) } } };
}

function property(
    name: string,
    type: string,
    description: string
  ): {
  name: string;
  type: string;
  isList: boolean;
  isNullable: boolean;
  description: string;
}
{
  return { name,
           type,
           isList: false,
           isNullable: false,
           description };
}

async function findManifests(
    context: PluginContext
  ): Promise<Manifest[]>
{
  const paths =
    await glob(
      '**/package.json',
      { absolute: true,
        cwd: context.projectPath,
        ignore:
          '**/node_modules/**',
        nodir: true });

  const visiblePaths =
    new GitIgnore(
      context.logger)
    .filter(paths)
    .sort(
      (left, right) => left.localeCompare(right));

  const manifests: Manifest[] = [ ];

  for (const manifestPath of visiblePaths) {
    const relativePath =
      toPosixPath(
        path.relative(
          context.projectPath,
          manifestPath));

    let content;

    try {
      content =
        JSON.parse(
          await readFile(
            manifestPath,
            'utf8'));
    } catch (error) {
      throw new Error(
        `Cannot read ${relativePath}: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`);
    }

    manifests.push(
      { path: relativePath,
        content });
  }

  return manifests;
}

function locateDependencies(
    manifests: Manifest[]
  ): LocatedArtefact[]
{
  const located: LocatedArtefact[] = [ ];

  for (const manifest of manifests) {
    for (const kind of DEPENDENCY_KINDS) {
      for (
        const name of Object.keys(
          getSection(
            manifest,
            kind))
      ) {
        located.push(
          { location:
              `${SCHEME}${manifest.path}#${kind}/${name}`,
            name });
      }
    }
  }

  return located;
}

function getDependencyData(
    manifests: Manifest[],
    artefact: Artefact
  ): Record<string, unknown>
{
  const dependency =
    parseLocation(
      artefact.location);

  const range =
    getSection(
      findManifest(
        manifests,
        dependency.manifest),
      dependency.kind)[dependency.name];

  return { Package: dependency.name,
           Range: range,
           Kind: dependency.kind,
           Manifest: dependency.manifest };
}

async function validateWorkspaceRange(
    manifests: Manifest[],
    artefact: Artefact
  ): Promise<void>
{
  const dependency =
    parseLocation(
      artefact.location);

  const workspacePackage =
    manifests.find(
      manifest => manifest.content.name === dependency.name);

  if (!workspacePackage) {
    return;
  }

  const range =
    String(
      getSection(
        findManifest(
          manifests,
          dependency.manifest),
        dependency.kind)[dependency.name]);

  const version =
    String(
      workspacePackage.content.version
      ?? '');

  const result =
    satisfies(
      version,
      range);

  if (result === null) {
    throw new Error(
      `Range "${range}" of ${dependency.name} is not supported, or version "${version}" in ${workspacePackage.path} is invalid.`);
  }

  if (!result) {
    throw new Error(
      `Range "${range}" does not include ${dependency.name} ${version} from ${workspacePackage.path}.`);
  }
}

function parseLocation(
    location: string
  ): DependencyLocation
{
  const match =
    /^npm:(.+)#([A-Za-z]+)\/(.+)$/.exec(location);

  if (!match) {
    throw new Error(
      `Not an npm dependency location: ${location}`);
  }

  return { manifest: match[1],
           kind: match[2],
           name: match[3] };
}

function findManifest(
    manifests: Manifest[],
    manifestPath: string
  ): Manifest
{
  const manifest =
    manifests.find(
      item => item.path === manifestPath);

  if (!manifest) {
    throw new Error(
      `Manifest not found: ${manifestPath}`);
  }

  return manifest;
}

function getSection(
    manifest: Manifest,
    kind: string
  ): Record<string, unknown>
{
  const section =
    manifest.content[kind];

  return section
      && typeof section === 'object'
    ? section as Record<string, unknown>
    : {};
}

/**
 * Whether the version is in the range; `null` when either cannot be parsed.
 * Pre-release tags are ignored.
 */
function satisfies(
    version: string,
    range: string
  ): boolean | null
{
  const normalisedRange =
    range
    .trim()
    .replace(
      /^workspace:/,
      '');

  const actual =
    parseVersion(version);

  if (!actual) {
    return null;
  }

  if (normalisedRange === '*') {
    return true;
  }

  const match =
    /^(\^|~|>=)?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/.exec(
      normalisedRange);

  const lower =
    match
    ? parseVersion(match[2])
    : null;

  if (
    !match
    || !lower
  ) {
    return null;
  }

  if (
    compareVersions(
      actual,
      lower) < 0
  ) {
    return false;
  }

  const [major, minor, patch] = lower;

  switch (match[1]) {
    case '>=':
      return true;

    case '~':
      return actual[0] === major
        && actual[1] === minor;

    case '^':
      if (major > 0) {
        return actual[0] === major;
      }

      if (minor > 0) {
        return actual[0] === 0
          && actual[1] === minor;
      }

      return actual[0] === 0
        && actual[1] === 0
        && actual[2] === patch;

    default:
      return compareVersions(
        actual,
        lower) === 0;
  }
}

function parseVersion(
    value: string
  ): [number, number, number] | null
{
  const match =
    /^(\d+)\.(\d+)\.(\d+)(?:-[0-9A-Za-z.-]+)?$/.exec(
      value.trim());

  if (!match) {
    return null;
  }

  return [ Number(match[1]),
           Number(match[2]),
           Number(match[3]) ];
}

function compareVersions(
    left: [number, number, number],
    right: [number, number, number]
  ): number
{
  return left[0] - right[0]
    || left[1] - right[1]
    || left[2] - right[2];
}
