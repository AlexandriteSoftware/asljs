import { GitIgnore }
  from 'asljs-locator';
import { glob }
  from 'glob';
import { minimatch }
  from 'minimatch';
import { readFile }
  from 'node:fs/promises';
import path
  from 'node:path';
import { toPosixPath }
  from '../formatting.js';
import { FILE_SCHEME }
  from '../location.js';
import { Artefact }
  from '../model/artefact.js';
import { LocatedArtefact,
         Plugin,
         PluginContext }
  from '../plugin.js';
import { readBuiltInDefinition }
  from './built-in-definition.js';

const NPM_DEPENDENCY_DEFINITION = 'NPM Dependency';

const NPM_PACKAGE_DEFINITION = 'NPM Package';

const SCHEME = 'npm:';

const DEPENDENCY_KINDS =
  Object.freeze(
    [ 'dependencies',
      'devDependencies',
      'peerDependencies',
      'optionalDependencies' ]);

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
 * Plugin providing the `NPM Package` and `NPM Dependency` definitions,
 * documented in `artefacts`: one artefact per `package.json` under the project
 * root, and one per entry in their dependency sections, outside `node_modules`
 * and `.gitignore`d paths.
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
             async () => [ await readBuiltInDefinition(
               context,
               NPM_PACKAGE_DEFINITION),
                           await readBuiltInDefinition(
                             context,
                             NPM_DEPENDENCY_DEFINITION) ],
           locate:
             { [NPM_PACKAGE_DEFINITION]:
                 async () =>
        locatePackages(
          await getManifests()),
               [NPM_DEPENDENCY_DEFINITION]:
                 async () =>
        locateDependencies(
          await getManifests()) },
           data:
             { [NPM_PACKAGE_DEFINITION]:
                 async artefact =>
        getPackageData(
          await getManifests(),
          artefact),
               [NPM_DEPENDENCY_DEFINITION]:
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

function locatePackages(
    manifests: Manifest[]
  ): LocatedArtefact[]
{
  return manifests.map(
    manifest => (
      { location:
          `${FILE_SCHEME}${manifest.path}`,
        name:
          typeof manifest.content.name === 'string'
          ? manifest.content.name
          : manifest.path }
    ));
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

function getPackageData(
    manifests: Manifest[],
    artefact: Artefact
  ): Record<string, unknown>
{
  if (!artefact.location.startsWith(FILE_SCHEME)) {
    throw new Error(
      `Not an npm package location: ${artefact.location}`);
  }

  const manifest =
    findManifest(
      manifests,
      artefact.location.slice(FILE_SCHEME.length));

  return { Name:
             getString(
               manifest.content.name),
           Version:
             getString(
               manifest.content.version),
           Private:
             manifest.content.private === true,
           Dependencies:
             getProjectDependencies(
               manifests,
               manifest,
               'dependencies'),
           DevDependencies:
             getProjectDependencies(
               manifests,
               manifest,
               'devDependencies'),
           Workspaces:
             getWorkspaces(
               manifests,
               manifest) };
}

/**
 * Locations of the project packages named in a dependency section, each the
 * first `package.json` with that name.
 */
function getProjectDependencies(
    manifests: Manifest[],
    manifest: Manifest,
    kind: string
  ): string[]
{
  const dependencies: string[] = [ ];

  for (
    const name of Object.keys(
      getSection(
        manifest,
        kind))
  ) {
    const dependency =
      manifests.find(
        item => item.content.name === name);

    if (dependency) {
      dependencies.push(
        `${FILE_SCHEME}${dependency.path}`);
    }
  }

  return dependencies;
}

/**
 * Locations of the `package.json` files in the folders the `workspaces`
 * globs match, relative to the manifest's folder. A pattern starting with `!`
 * excludes.
 */
function getWorkspaces(
    manifests: Manifest[],
    manifest: Manifest
  ): string[]
{
  const patterns =
    getWorkspacePatterns(
      manifest.content.workspaces)
    .map(
      pattern =>
        pattern
          .replace(
            /^(!?)\.\//,
            '$1')
          .replace(
            /\/+$/,
            ''));

  const included =
    patterns.filter(
      pattern => !pattern.startsWith('!'));

  const excluded =
    patterns
    .filter(
      pattern => pattern.startsWith('!'))
    .map(
      pattern => pattern.slice(1));

  const manifestFolder =
    path.posix.dirname(
      manifest.path);

  const workspaces: string[] = [ ];

  for (const item of manifests) {
    const folder =
      path.posix.relative(
        manifestFolder,
        path.posix.dirname(
          item.path));

    if (
      folder === ''
      || folder.startsWith('..')
    ) {
      continue;
    }

    if (
      included.some(
        pattern =>
          minimatch(
            folder,
            pattern))
      && !excluded.some(
        pattern =>
          minimatch(
            folder,
            pattern))
    ) {
      workspaces.push(
        `${FILE_SCHEME}${item.path}`);
    }
  }

  return workspaces;
}

/**
 * The `workspaces` field: an array of globs, or an object with a `packages`
 * array.
 */
function getWorkspacePatterns(
    value: unknown
  ): string[]
{
  const patterns =
    Array.isArray(value)
    ? value
    : value
        && typeof value === 'object'
        && Array.isArray(
          (value as Record<string, unknown>).packages)
    ? (value as Record<string, unknown[]>).packages
    : [ ];

  return patterns.filter(
    (pattern): pattern is string => typeof pattern === 'string');
}

function getString(
    value: unknown
  ): string | null
{
  return typeof value === 'string'
    ? value
    : null;
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
