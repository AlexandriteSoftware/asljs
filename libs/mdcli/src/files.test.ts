import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { findMarkdownFiles,
         toDisplayPath }
  from './files.js';

test(
  'findMarkdownFiles lists the markdown files, skipping hidden, node_modules and named folders',
  async () =>
  {
    await using dir =
      new TmpDir();

    for (
      const file of [ 'a.md',
                      'b.txt',
                      'sub/c.MD',
                      '.hidden/d.md',
                      'node_modules/e.md',
                      'Archive/f.md' ]
    ) {
      await dir.writeText(
        file,
        '# x\n');
    }

    const list =
      async (
      skip?: string[]
    ): Promise<string[]> =>
      (await findMarkdownFiles(
        dir.path,
        { skip }))
        .map(
          file =>
            toDisplayPath(
              dir.path,
              file));

    assert.deepEqual(
      await list(),
      [ 'Archive/f.md',
        'a.md',
        'sub/c.MD' ]);

    assert.deepEqual(
      await list(
        [ 'Archive' ]),
      [ 'a.md',
        'sub/c.MD' ]);
  });
