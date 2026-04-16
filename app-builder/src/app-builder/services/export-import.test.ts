import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
  buildExportPayload,
  parseImportedPayloadText,
  createImportPlan,
  type ImportedPayload,
} from './export-import.js';

test(
  'buildExportPayload returns id/name/files map only',
  () => {
    const app =
      {
        id: 'a1',
        uuid: 'u1',
        name: 'Demo',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      };

    const files =
      [
        { id: 'f1', appId: 'a1', name: 'index.html', content: '<h1>Hi</h1>' },
      ];

    const payload =
      buildExportPayload(
        {
          app: {
            ...app,
            author: {
              name: 'Alex',
              email: 'alex@example.com',
            },
          },
          files,
        });

    assert.deepEqual(
      payload,
      {
        id: 'a1',
        name: 'Demo',
        author: {
          name: 'Alex',
          email: 'alex@example.com',
        },
        files: {
          'index.html': '<h1>Hi</h1>',
        },
      },
    );
  });

test(
  'parseImportedPayloadText parses valid payload',
  () => {
    const text =
      JSON.stringify(
        {
          id: 'a-imported',
          name: 'Imported',
          author: {
            name: 'Alex',
            email: 'alex@example.com',
          },
          files: {
            'index.html': 'ok',
          },
        });

    const payload =
      parseImportedPayloadText(text);

    assert.equal(payload.name, 'Imported');
    assert.equal(payload.id, 'a-imported');
    assert.equal(payload.author?.name, 'Alex');
    assert.equal(payload.files['index.html'], 'ok');
  });

test(
  'parseImportedPayloadText throws for invalid payload',
  () => {
    assert.throws(
      () => parseImportedPayloadText('{"app":{},"files":{}}'),
      /Invalid app JSON format\./,
    );
  });

test(
  'parseImportedPayloadText throws for invalid author',
  () => {
    assert.throws(
      () =>
        parseImportedPayloadText(
          '{"id":"a1","name":"Demo","author":{"name":1},"files":{"index.html":"ok"}}',
        ),
      /Invalid app JSON format\./,
    );
  });

test(
  'createImportPlan returns existing app when ID exists and navigation is allowed',
  () => {
    const payload: ImportedPayload =
      {
        id: 'a-existing',
        name: 'Imported',
        files: {
          'index.html': 'ok',
        },
      };

    const plan =
      createImportPlan(
        {
          payload,
          existingApps:
            [
              {
                id: 'a-existing',
                uuid: 'u-1',
                name: 'Current',
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-02T00:00:00.000Z',
              },
            ],
          navigateToExistingById: true,
          now: '2026-01-03T00:00:00.000Z',
          createId: () => 'generated-id',
          createUuid: () => 'generated-uuid',
        });

    assert.deepEqual(plan, { kind: 'existing', appId: 'a-existing' });
  });

test(
  'createImportPlan returns duplicate when ID exists and navigation is not allowed',
  () => {
    const payload: ImportedPayload =
      {
        id: 'a-existing',
        name: 'Imported',
        files: {
          'index.html': 'ok',
        },
      };

    const plan =
      createImportPlan(
        {
          payload,
          existingApps:
            [
              {
                id: 'a-existing',
                uuid: 'u-1',
                name: 'Current',
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-02T00:00:00.000Z',
              },
            ],
          navigateToExistingById: false,
          now: '2026-01-03T00:00:00.000Z',
          createId: () => 'generated-id',
          createUuid: () => 'generated-uuid',
        });

    assert.deepEqual(plan, { kind: 'duplicate' });
  });

test(
  'createImportPlan creates new app/files with imported ID',
  () => {
    const payload: ImportedPayload =
      {
        id: 'app-id',
        name: 'Imported',
        author: {
          name: 'Author Name',
          email: 'author@example.com',
        },
        files: {
          'index.html': 'ok',
          'readme.md': 'hello',
        },
      };

    const generatedIds = [ 'file-id-1', 'file-id-2' ];
    let index = 0;

    const plan =
      createImportPlan(
        {
          payload,
          existingApps: [],
          navigateToExistingById: false,
          now: '2026-01-03T00:00:00.000Z',
          createId: () => generatedIds[index++] ?? 'fallback-id',
          createUuid: () => 'generated-uuid',
        });

    assert.equal(plan.kind, 'new');

    if (plan.kind !== 'new') {
      return;
    }

    assert.equal(plan.app.id, 'app-id');
    assert.equal(plan.app.uuid, 'generated-uuid');
    assert.equal(plan.app.name, 'Imported');
    assert.equal(plan.app.author?.name, 'Author Name');
    assert.equal(plan.files.length, 2);
    assert.equal(plan.files[0].id, 'file-id-1');
    assert.equal(plan.files[0].appId, 'app-id');
  });
