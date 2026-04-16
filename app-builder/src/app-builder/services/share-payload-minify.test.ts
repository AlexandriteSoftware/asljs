import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
  minifySharePayload,
  type SharePayloadMinifyLoader,
} from './share-payload-minify.js';

test(
  'minifySharePayload transforms JS and CSS files using provided transformer',
  async () => {
    const calls:
      Array<{ source: string;
              loader: SharePayloadMinifyLoader; }> = [];

    const result =
      await minifySharePayload(
        {
          id: 'a1',
          name: 'Demo',
          files:
            {
              'app.js': 'const x = 1;\n',
              'style.css': 'h1 { color: red; }\n',
              'note.txt': 'keep me',
            },
        },
        async (source: string, loader: SharePayloadMinifyLoader) => {
          calls.push({ source, loader });
          return `${loader}:${source.trim()}`;
        },
      );

    assert.deepEqual(
      calls,
      [
        { source: 'const x = 1;\n', loader: 'js' },
        { source: 'h1 { color: red; }\n', loader: 'css' },
      ],
    );

    assert.equal(result.files['app.js'], 'js:const x = 1;');
    assert.equal(result.files['style.css'], 'css:h1 { color: red; }');
    assert.equal(result.files['note.txt'], 'keep me');
  },
);

test(
  'minifySharePayload compacts HTML while preserving script and style blocks',
  async () => {
    const result =
      await minifySharePayload(
        {
          id: 'a1',
          name: 'Demo',
          files:
            {
              'index.html':
                '<!doctype html>\n'
                + '<html>\n'
                + '  <head>\n'
                + '    <!-- remove -->\n'
                + '    <style>\n'
                + '      h1 { color: red; }\n'
                + '    </style>\n'
                + '  </head>\n'
                + '  <body>\n'
                + '    <h1> Hello </h1>\n'
                + '    <script>\n'
                + '      const a = 1;\n'
                + '      const b = 2;\n'
                + '    </script>\n'
                + '  </body>\n'
                + '</html>\n',
            },
        },
        async (source: string) => source,
      );

    const html = result.files['index.html'];

    assert.equal(
      html.includes('<!-- remove -->'),
      false,
    );
    assert.equal(
      html.includes('</head><body>'),
      true,
    );
    assert.equal(
      html.includes('const a = 1;\n      const b = 2;'),
      true,
    );
    assert.equal(
      html.includes('h1 { color: red; }\n    </style>'),
      true,
    );
  },
);