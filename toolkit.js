#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import console from 'node:console';
import {
    execSync
  } from 'node:child_process';

function runGit(
    command
  )
{
  return execSync(
    command,
    {
      cwd: process.cwd(),
      stdio: [ 'ignore', 'pipe', 'pipe' ],
      encoding: 'utf8'
    });
}

function getReleaseIdFromPackageJson(
  )
{
  const packageJsonPath =
    path.join(process.cwd(), 'package.json');

  const packageJsonText =
    fs.readFileSync(packageJsonPath, 'utf8');

  const packageInfo =
    JSON.parse(packageJsonText);

  const name =
    packageInfo.name;

  const version =
    packageInfo.version;

  if (typeof name !== 'string' || name.trim() === '') {
    throw new Error('package.json must define a non-empty string "name".');
  }

  if (typeof version !== 'string' || version.trim() === '') {
    throw new Error('package.json must define a non-empty string "version".');
  }

  return `${name}@${version}`;
}

function cleanDist(
  )
{
  const distPath =
    path.join(process.cwd(), 'dist');

  fs.rmSync(
    distPath,
    {
      recursive: true,
      force: true
    });

  console.log(`Removed: ${distPath}`);
}

function ensureCleanWorkingFolder(
  )
{
  const output =
    runGit('git status --porcelain');

  if (output.trim() !== '') {
    throw new Error(
      'Refusing publish: working tree has uncommitted or untracked changes.');
  }

  console.log('Git working folder is clean.');
}

function tagCommitWithReleaseId(
  )
{
  const releaseId =
    getReleaseIdFromPackageJson();

  try {
    runGit(`git rev-parse --verify --quiet "refs/tags/${releaseId}"`);
    throw new Error(`Tag already exists: ${releaseId}`);
  } catch (error) {
    const message =
      String(error?.message ?? '');

    if (!message.includes('Tag already exists')) {
      // Tag not found: proceed.
    } else {
      throw error;
    }
  }

  runGit(`git tag -a "${releaseId}" -m "${releaseId}"`);
  runGit(`git push origin "${releaseId}"`);

  console.log(`Created and pushed tag: ${releaseId}`);
}

const action =
  process.argv[2] ?? '';

try {
  switch (action) {
    case 'clean-dist':
      cleanDist();
      break;

    case 'ensure-clean-working-folder':
      ensureCleanWorkingFolder();
      break;

    case 'tag-commit-with-release-id':
      tagCommitWithReleaseId();
      break;

    default:
      console.error(
        'Unknown action. Use one of: clean-dist, ensure-clean-working-folder, tag-commit-with-release-id');
      process.exit(1);
  }
} catch (error) {
  console.error(String(error?.message ?? error));
  process.exit(1);
}
