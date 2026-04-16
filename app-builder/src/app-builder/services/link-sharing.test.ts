import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
  createLinkSharingService,
} from './link-sharing.js';

test(
  'createLinkSharingService roundtrips payload via token',
  async () => {
    const codec =
      {
        compress: async (text: string) => encodeURIComponent(text),
        decompress: async (value: string) => decodeURIComponent(value),
      };

    const service =
      createLinkSharingService(
        {
          codec,
          baseUrl: 'https://example.test/app-builder',
          hashPrefix: '#I!',
          maxUrlLength: 5000,
          timeoutMs: 100,
        });

    const payload =
      {
        app: { uuid: 'u1', name: 'Demo' },
        files: [ { name: 'index.html', content: '<h1>Hi</h1>' } ],
      };

    const share =
      await service.createShareUrl(payload);

    assert.equal(share.exceedsMaxUrlLength, false);

    const token =
      service.readTokenFromHash(new URL(share.url).hash);

    assert.ok(token);

    const parsed =
      await service.parsePayloadFromToken<typeof payload>(token!);

    assert.deepEqual(parsed, payload);
  });

test(
  'createLinkSharingService flags when URL exceeds maximum length',
  async () => {
    const codec =
      {
        compress: async (text: string) => encodeURIComponent(text),
        decompress: async (value: string) => decodeURIComponent(value),
      };

    const service =
      createLinkSharingService(
        {
          codec,
          baseUrl: 'https://example.test/app-builder',
          hashPrefix: '#I!',
          maxUrlLength: 20,
          timeoutMs: 100,
        });

    const share =
      await service.createShareUrl({ app: { name: 'Demo' } });

    assert.equal(share.exceedsMaxUrlLength, true);
  });

test(
  'readTokenFromHash returns null for non-import hash',
  () => {
    const service =
      createLinkSharingService(
        {
          codec:
            {
              compress: async (text: string) => encodeURIComponent(text),
              decompress: async (value: string) => decodeURIComponent(value),
            },
          baseUrl: 'https://example.test/app-builder',
          hashPrefix: '#I!',
          maxUrlLength: 5000,
          timeoutMs: 100,
        });

    assert.equal(service.readTokenFromHash('#other'), null);
    assert.equal(service.readTokenFromHash('#I!abc'), 'abc');
  });

test(
  'createLinkSharingService times out if compression does not resolve',
  async () => {
    const codec =
      {
        compress: async (_text: string) =>
          await new Promise<string>(() => {}),
        decompress: async (_value: string) => '',
      };

    const service =
      createLinkSharingService(
        {
          codec,
          baseUrl: 'https://example.test/app-builder',
          hashPrefix: '#I!',
          maxUrlLength: 5000,
          timeoutMs: 20,
        });

    await assert.rejects(
      service.createShareUrl({ app: { name: 'Demo' } }),
      /timed out/i,
    );
  });
