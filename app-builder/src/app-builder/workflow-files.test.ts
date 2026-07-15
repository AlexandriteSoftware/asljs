import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { CHANGE_FILE,
         createDefaultWorkflowFiles,
         ensureWorkflowFiles,
         hasOnlyWorkflowFiles,
         PLAN_FILE,
         README_FILE }
  from './workflow-files.js';

test(
  'createDefaultWorkflowFiles creates README PLAN and CHANGE in order',
  () =>
  {
    let nextId = 0;

    const files =
      createDefaultWorkflowFiles(
        'app-1',
        'Demo App',
        () => `f${++nextId}`);

    assert.deepEqual(
      files.map(
        file => file.name
      ),
      [README_FILE, PLAN_FILE, CHANGE_FILE]
    );

    assert.match(
      files[0].content,
      /This app is empty\./
    );
  }
);

test(
  'ensureWorkflowFiles adds missing workflow files without replacing existing README',
  () =>
  {
    const result =
      ensureWorkflowFiles(
        {
        appId: 'app-1',
        appName: 'Demo App',
        createId: () => 'new-file',
        files: [
          {
            id: 'f1',
            appId: 'app-1',
            name: README_FILE,
            content: '# Existing README'
          }
        ]
      });

    assert.equal(
      result.changed,
      true
    );

    assert.equal(
      result.files[0].content,
      '# Existing README'
    );

    assert.deepEqual(
      result.files.map(
        file => file.name
      ),
      [README_FILE, PLAN_FILE, CHANGE_FILE]
    );
  }
);

test(
  'hasOnlyWorkflowFiles treats workflow-only apps as empty project state',
  () =>
  {
    assert.equal(
      hasOnlyWorkflowFiles([]),
      true
    );

    assert.equal(
      hasOnlyWorkflowFiles(
        [README_FILE, PLAN_FILE, CHANGE_FILE]
      ),
      true
    );

    assert.equal(
      hasOnlyWorkflowFiles(
        [README_FILE, 'app.js']
      ),
      false
    );
  }
);
