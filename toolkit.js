#!/usr/bin/env node

import fs
  from 'node:fs';
import path
  from 'node:path';
import process
  from 'node:process';
import console
  from 'node:console';
import {
    execSync
  } from 'node:child_process';

function runGit(
  command
) {
  return execSync(
    command,
    { cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8' });
}

function getPackageNameAndVersionFromPackageJson(
) {
  const packageJsonPath =
    path.join(
      process.cwd(),
      'package.json');

  const packageJsonText =
    fs.readFileSync(
      packageJsonPath,
      'utf8');

  const packageInfo =
    JSON.parse(packageJsonText);

  const name =
    packageInfo.name;

  const version =
    packageInfo.version;

  if (typeof name !== 'string'
      || name.trim() === '')
  {
    throw new Error(
      'package.json must define a non-empty string "name".');
  }

  if (typeof version !== 'string'
      || version.trim() === '')
  {
    throw new Error(
      'package.json must define a non-empty string "version".');
  }

  return { name,
           version };
}

function getReleaseTagId(
) {
  const packageInfo =
    getPackageNameAndVersionFromPackageJson();

  return `${packageInfo.name}@${packageInfo.version}`;
}

function cleanDist(
) {
  const distPath =
    path.join(
      process.cwd(),
      'dist');

  fs.rmSync(
    distPath,
    { recursive: true,
      force: true });

  console.log(
    `Removed: ${distPath}`);
}

function ensureCleanWorkingFolder(
) {
  const output =
    runGit('git status --porcelain');

  if (output.trim() !== '') {
    throw new Error(
      'Refusing publish: working tree has uncommitted or untracked changes.');
  }

  console.log(
    'Git working folder is clean.');
}

function tagCommitWithReleaseId(
) {
  const releaseId =
    getReleaseTagId();

  const existingTag =
    runGit(`git tag -l "${releaseId}"`).trim();

  if (existingTag !== '') {
    throw new Error(
      `Tag already exists: ${releaseId}`);
  }

  runGit(`git tag -a "${releaseId}" -m "${releaseId}"`);

  console.log(
    `Created tag: ${releaseId}`);
}

const action =
  process.argv[2] ?? '';

const actions =
  new Map([
    [ 'clean-dist',
      cleanDist ],
    [ 'ensure-clean-working-folder',
      ensureCleanWorkingFolder ],
    [ 'tag-commit-with-release-id',
      tagCommitWithReleaseId ]
  ]);

try {
  const selectedAction =
    actions.get(action);

  if (!selectedAction) {
    const supportedActions =
      [ ...actions.keys() ]
        .join(', ');

    console.error(
      `Unknown action. Use one of: ${supportedActions}`);

    process.exit(1);
  }

  selectedAction();
} catch (error) {
  console.error(
    String(error?.message ?? error));

  process.exit(1);
}
