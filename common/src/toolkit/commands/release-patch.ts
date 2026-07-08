import path
  from 'node:path';
import { log,
         ROOT_DIR }
  from '../api.js';
import { start,
         startSequence }
  from '../lib/process.js';
import { getPackageJson,
         getPackageJsonPath }
  from '../lib/packages.js';
import { ensureCleanWorkingDirectory }
  from './ensure-clean-working-directory.js';
import { PackageJson }
  from 'pkg-types';
import { tagRepository }
  from '../lib/repository.js';

export async function releasePatch(
  ): Promise<void>
{
  log(
    'patch-release of the package `%s`...',
    path.basename(
      process.cwd()));

  await ensureCleanWorkingDirectory();

  const packageJsonPath =
    getPackageJsonPath(
      process.cwd());

  const packageJson =
    await getPackageJson(
      packageJsonPath);

  verifyReleaseTarget(
    packageJson);

  startSequence(
    [ 'npm run clean',
      'npm run typecheck',
      'npm run lint',
      'npm run build:dist',
      'npm run build',
      'npm run test',
      'npm run clean',
      'npm version patch --no-git-tag-version' ]);

  start(
    'npm install --package-lock-only',
    { cwd: ROOT_DIR });

  start(
    'npm publish --ignore-scripts');

  const releaseId =
    await getReleaseTagId(
      packageJsonPath);

  startSequence(
    [ `git add .`,
      `git commit -m "releasing ${releaseId}"` ],
    ROOT_DIR);

  tagRepository(
    releaseId);

  startSequence(
    [ 'git push',
      `git push origin "${releaseId}"` ],
    ROOT_DIR);
}

function verifyReleaseTarget(
    packageJson: PackageJson
  ): void
{
  const name =
    packageJson.name;

  if (
    typeof name !== 'string'
    || name.trim() === ''
  ) {
    throw new Error(
      'package.json must define a non-empty string "name".');
  }

  if (packageJson.private) {
    throw new Error(
      `Refusing release: ${packageJson.name} is private.`);
  }

  const version =
    packageJson.version;

  if (
    typeof version !== 'string'
    || version.trim() === ''
  ) {
    throw new Error(
      'package.json must define a non-empty string "version".');
  }
}

export async function getReleaseTagId(
    packageDir?: string
  ): Promise<string>
{
  packageDir ??= process.cwd();

  const packageInfo =
    await getPackageJson(
      packageDir);

  return `${packageInfo.name}@${packageInfo.version}`;
}
