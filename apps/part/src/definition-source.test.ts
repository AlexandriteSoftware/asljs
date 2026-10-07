import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { isDefinitionIncluded,
         parseDefinitionSource }
  from './definition-source.js';

test(
  'RQ111: parseDefinitionSource splits the source, includes and excludes',
  () =>
  {
    assert.deepEqual(
      parseDefinitionSource(
        'asljs-part; NPM *, GIT * ;GIT Commits'),
      { source: 'asljs-part',
        include:
          [ 'NPM *',
            'GIT *' ],
        exclude:
          [ 'GIT Commits' ] });

    assert.deepEqual(
      parseDefinitionSource(
        'C:\\artefacts'),
      { source: 'C:\\artefacts',
        include: [ ],
        exclude: [ ] });

    assert.deepEqual(
      parseDefinitionSource(
        'artefacts;;Draft *'),
      { source: 'artefacts',
        include: [ ],
        exclude:
          [ 'Draft *' ] });
  });

test(
  'RQ111: isDefinitionIncluded matches globs ignoring case',
  () =>
  {
    const spec =
      parseDefinitionSource(
        'asljs-part;NPM *,GIT *;GIT Commits');

    assert.equal(
      isDefinitionIncluded(
        spec,
        'NPM Dependency'),
      true);

    assert.equal(
      isDefinitionIncluded(
        spec,
        'Git Tag'),
      true);

    assert.equal(
      isDefinitionIncluded(
        spec,
        'Git Commits'),
      false);

    assert.equal(
      isDefinitionIncluded(
        spec,
        'Artefact Definition'),
      false);

    assert.equal(
      isDefinitionIncluded(
        parseDefinitionSource('artefacts'),
        'Anything'),
      true);

    assert.equal(
      isDefinitionIncluded(
        parseDefinitionSource('artefacts;Rule?'),
        'Rules'),
      true);
  });
