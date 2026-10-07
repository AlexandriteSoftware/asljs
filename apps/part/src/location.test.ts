import assert
  from 'node:assert/strict';
import path
  from 'node:path';
import test
  from 'node:test';
import { createArtefactFiles,
         displayLocation,
         fromFileLocation,
         hasScheme,
         toFileLocation }
  from './location.js';

const projectPath =
  path.resolve(
    'project');

test(
  'RQ204: hasScheme accepts URI schemes and rejects Windows drives',
  () =>
  {
    assert.equal(
      hasScheme('file:docs/A.md'),
      true);

    assert.equal(
      hasScheme('git:tag/v1.0.0'),
      true);

    assert.equal(
      hasScheme('C:\\project\\A.md'),
      false);

    assert.equal(
      hasScheme('docs/A.md'),
      false);
  });

test(
  'RQ204: file locations round-trip through paths',
  () =>
  {
    const absolutePath =
      path.join(
        projectPath,
        'docs',
        'A.md');

    const location =
      toFileLocation(
        projectPath,
        absolutePath);

    assert.equal(
      location,
      'file:docs/A.md');

    assert.equal(
      fromFileLocation(
        projectPath,
        location),
      absolutePath);

    assert.equal(
      fromFileLocation(
        projectPath,
        'git:tag/v1.0.0'),
      null);
  });

test(
  'RQ204: displayLocation strips only the file scheme',
  () =>
  {
    assert.equal(
      displayLocation('file:docs/A.md'),
      'docs/A.md');

    assert.equal(
      displayLocation('git:tag/v1.0.0'),
      'git:tag/v1.0.0');
  });

test(
  'RQ204: files.path gives the path of file artefacts and throws otherwise',
  () =>
  {
    const files =
      createArtefactFiles(
        projectPath);

    assert.equal(
      files.path(
        { location: 'file:docs/A.md' }),
      path.join(
        projectPath,
        'docs',
        'A.md'));

    assert.throws(
      () =>
        files.path(
          { location: 'git:tag/v1.0.0' }),
      /Artefact is not a file: git:tag\/v1\.0\.0/);
  });
