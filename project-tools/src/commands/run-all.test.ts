import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { sortWorkspacesByDependencyOrder,
         WorkspacePackage }
  from './run-all.js';

function makePackage(
    name: string,
    dependencyNames: string[] = [ ]
  ): WorkspacePackage
{
  return { name,
           dir: `/repo/${name}`,
           dependencyNames,
           scriptNames:
             [ 'all' ] };
}

function orderOf(
    workspacePackages: WorkspacePackage[]
  ): string[]
{
  return sortWorkspacesByDependencyOrder(
    workspacePackages).map(
      workspacePackage => workspacePackage.name);
}

test(
  'sortWorkspacesByDependencyOrder places dependencies before dependents',
  () =>
  {
    const order =
      orderOf(
        [ makePackage(
          'data-binding',
          [ 'observable' ]),
          makePackage(
            'observable',
            [ 'eventful' ]),
          makePackage('eventful') ]);

    assert.deepEqual(
      order,
      [ 'eventful',
        'observable',
        'data-binding' ]);
  });

test(
  'sortWorkspacesByDependencyOrder treats devDependencies as ordering edges',
  () =>
  {
    const order =
      orderOf(
        [ makePackage(
          'kb',
          [ 'tmpdir' ]),
          makePackage('tmpdir') ]);

    assert.deepEqual(
      order,
      [ 'tmpdir',
        'kb' ]);
  });

test(
  'sortWorkspacesByDependencyOrder ignores dependencies outside the workspace set',
  () =>
  {
    const order =
      orderOf(
        [ makePackage(
          'cog',
          [ 'pino',
            'yargs' ]) ]);

    assert.deepEqual(
      order,
      [ 'cog' ]);
  });

test(
  'sortWorkspacesByDependencyOrder is alphabetical between independent packages',
  () =>
  {
    const order =
      orderOf(
        [ makePackage('money'),
          makePackage('eventful'),
          makePackage('logging') ]);

    assert.deepEqual(
      order,
      [ 'eventful',
        'logging',
        'money' ]);
  });

test(
  'sortWorkspacesByDependencyOrder ignores a self dependency',
  () =>
  {
    const order =
      orderOf(
        [ makePackage(
          'money',
          [ 'money' ]) ]);

    assert.deepEqual(
      order,
      [ 'money' ]);
  });

test(
  'sortWorkspacesByDependencyOrder returns an empty order for no packages',
  () =>
  {
    assert.deepEqual(
      orderOf([ ]),
      [ ]);
  });

test(
  'sortWorkspacesByDependencyOrder throws on a dependency cycle',
  () =>
  {
    assert.throws(
      () =>
        orderOf(
          [ makePackage(
            'a',
            [ 'b' ]),
            makePackage(
              'b',
              [ 'a' ]) ]),
      /Dependency cycle between workspace packages: a, b\./);
  });
