import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { listSamples }
  from './samples.js';
import { createLinkSharingService }
  from '../services/link-sharing.js';
import { createNodeEsbuildGzipBase64UrlCodec }
  from '../services/link-sharing-node-codec.js';

test(
  'all samples can be encoded into share URLs and parsed back',
  async () => {
    const samples =
      listSamples();

    assert.ok(samples.length > 0);

    const service =
      createLinkSharingService(
        {
          codec: createNodeEsbuildGzipBase64UrlCodec(),
          baseUrl: 'https://example.test/app-builder',
          hashPrefix: '#I!',
          maxUrlLength: 5000,
          timeoutMs: 500,
        });

    for (const sample of samples) {
      const share =
        await service.createShareUrl(sample);

      const token =
        service.readTokenFromHash(new URL(share.url).hash);

      assert.ok(token, `Expected token for sample ${sample.name}`);

      const decoded =
        await service.parsePayloadFromToken<typeof sample>(token!);

      assert.deepEqual(decoded, sample, `Roundtrip failed for ${sample.name}`);
    }
  });