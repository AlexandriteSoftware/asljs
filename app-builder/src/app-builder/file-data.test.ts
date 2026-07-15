import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { isImageMimeType,
         readFileDataInfo }
  from './file-data.js';

test(
  'readFileDataInfo parses base64 data urls',
  () =>
  {
    const result =
      readFileDataInfo(
        'data:image/png;base64,AQID');

    assert.deepEqual(
      result,
      {
        mimeType: 'image/png',
        base64: 'AQID',
        dataUrl: 'data:image/png;base64,AQID'
      }
    );
  }
);

test(
  'readFileDataInfo returns null for plain text content',
  () =>
  {
    assert.equal(
      readFileDataInfo(
        'console.log(1);'
      ),
      null
    );
  }
);

test(
  'isImageMimeType recognizes image mime types',
  () =>
  {
    assert.equal(
      isImageMimeType('image/png'),
      true
    );

    assert.equal(
      isImageMimeType('text/plain'),
      false
    );
  }
);
